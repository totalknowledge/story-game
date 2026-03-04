import { Injectable, signal, computed, inject } from '@angular/core';
import { WORLD_MAPS } from './map.definitions';
import { Direction } from './room/room.definitions';
import { MapModel } from './map.model';
import { MapFactory } from './map.factory';
import { FeatureModel } from '../feature/feature.model';
import { RoomModel } from './room/room.model';

@Injectable({ providedIn: 'root' })
export class MapService {
  private maps: Map<string, MapModel> = new Map();
  private currentMap = signal<MapModel | undefined>(undefined);
  private rooms = computed(() => {
    return this.currentMap()?.rooms;
  });
  private currentRoomCoords = signal<string>('0,0,0');
  readonly displayMap = computed(() => this.currentMap());
  readonly currentRoom = computed(() => this.rooms()?.get(this.currentRoomCoords()));
  readonly activeFeature = signal<FeatureModel | null>(null);
  private readonly mapFactory = inject(MapFactory);

  constructor() {
    this.loadMap('town');
  }

  toggleFeature(featureName?: string): string[] {
    if (!featureName) {
      this.activeFeature.set(null);
      return ['Closed feature view.'];
    }

    const room = this.currentRoom();
    if (!room) return ['No room to search for features.'];

    const feature = room.features.find((f: FeatureModel) =>
      f.name.toLowerCase().includes(featureName.toLowerCase())
    );

    if (!feature) {
      return [`There is no "${featureName}" here.`];
    }

    if (!feature.interactable) {
      return [`You cannot interact with the ${feature.name}.`];
    }

    this.activeFeature.set(feature);
    return [`You open the ${feature.name}.`];
  }

  public activeFloorGrid() {
    return computed(() => {
      const roomMap = this.rooms();
      const currentRoom = this.currentRoom();
      const currentCoords = currentRoom?.coordinates;
      const currentCoordinateKey = currentRoom?.coordinateKey;

      const floorRooms = Array.from(roomMap?.values() || [])
        .filter(room => room.coordinates?.z === currentCoords?.z);

      if (floorRooms.length === 0) return null;

      const coords = floorRooms.map(room => room.coordinates!);
      const minX = Math.min(...coords.map(c => c.x));
      const maxX = Math.max(...coords.map(c => c.x));
      const minY = Math.min(...coords.map(c => c.y));
      const maxY = Math.max(...coords.map(c => c.y));

      const grid = [];
      for (let y = maxY; y >= minY; y--) {
        const row = [];
        for (let x = minX; x <= maxX; x++) {
          const key = `${x},${y},${currentCoords?.z}`;
          const room = roomMap?.get(key);

          row.push({
            room,
            isPlayer: key === currentCoordinateKey,
            visible: room?.visited ?? false
          });
        }
        grid.push(row);
      }

      return {
        grid,
        level: currentCoords?.z,
        dimensions: { width: maxX - minX + 1, height: maxY - minY + 1 }
      };
    });
  }

  loadMap(mapName: string, roomLocation?: string): void {
    const leavingRoomCoordinates = this.currentRoomCoords();
    const existingMap = this.maps.get(mapName);

    if (existingMap) {
      this.currentMap.set(existingMap);

      const targetCoordinates = roomLocation || '0,0,0';
      this.currentRoomCoords.set(targetCoordinates);

      const landingRoom = existingMap.rooms.get(targetCoordinates);
      if (landingRoom) landingRoom.visited = true;

      return;
    }

    const mapDefinition = WORLD_MAPS[mapName];
    if (!mapDefinition) return;

    const options = { returnCoordinates: leavingRoomCoordinates };
    const mapModel = this.mapFactory.generateMap(mapDefinition, options);

    this.maps.set(mapName, mapModel);
    this.currentMap.set(mapModel);

    const initialCoordinates = roomLocation || '0,0,0';
    this.currentRoomCoords.set(initialCoordinates);

    const startRoom = mapModel.rooms.get(initialCoordinates);
    if (startRoom) startRoom.visited = true;
  }

  public move(direction: Direction): string[] {
    const activeRoom = this.currentRoom();
    if (!activeRoom) return ["You cannot go that way."];

    const targetConnection = activeRoom.connections?.get(direction);
    if (!targetConnection) return ["You cannot go that way."];

    if (targetConnection.loads) {
      if (targetConnection.status === 'locked') return [`The path to ${targetConnection.name} is barred.`];

      this.loadMap(targetConnection.loads, targetConnection.connection);
      return [`You travel to ${targetConnection.name}.`];
    }

    const destinationCoords = targetConnection.connection;
    if (destinationCoords) {
      this.currentRoomCoords.set(destinationCoords);

      const nextRoom = this.currentRoom();
      if (nextRoom) {
        return [nextRoom.description, ...nextRoom.directions];
      }
    }

    return ["You cannot go that way."];
  }

  public updateRoom(coordinateKey: string, updates: Partial<RoomModel>): void {
    this.currentMap.update(mapState => {
      if (!mapState) return mapState;
      const roomsRegistry = new Map(mapState.rooms);
      const room = roomsRegistry.get(coordinateKey);

      if (room) {
        Object.assign(room, updates);
        roomsRegistry.set(coordinateKey, room);
      }

      return { ...mapState, rooms: roomsRegistry };
    });
  }

  public resetMap(mapName: string): string[] {
    const mapKey = this.resolveMapKey(mapName);
    if (!mapKey) return [`No map found for "${mapName}".`];

    const currentMapKey = this.getCurrentMapKey();
    this.maps.delete(mapKey);

    if (currentMapKey === mapKey) {
      this.loadMap(mapKey, '0,0,0');
    }

    const displayName = WORLD_MAPS[mapKey]?.['name'] ?? mapName;
    return [`${displayName} has been reset.`];
  }

  private getCurrentMapKey(): string | undefined {
    return Array.from(this.maps.entries()).find(([_, map]) => map === this.currentMap())?.[0];
  }

  private resolveMapKey(mapName: string): string | undefined {
    const normalizedInput = mapName.trim().toLowerCase();
    if (!normalizedInput) return undefined;

    const exactKeyMatch = Object.keys(WORLD_MAPS).find(key => key.toLowerCase() === normalizedInput);
    if (exactKeyMatch) return exactKeyMatch;

    const exactNameMatch = Object.entries(WORLD_MAPS)
      .find(([_, definition]) => definition['name'].toLowerCase() === normalizedInput)?.[0];
    if (exactNameMatch) return exactNameMatch;

    return Object.entries(WORLD_MAPS)
      .find(([_, definition]) => definition['name'].toLowerCase().includes(normalizedInput))?.[0];
  }
}