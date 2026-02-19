import { Injectable, signal, computed, inject } from '@angular/core';
import { RoomModel } from './room/room.model';
import { WORLD_MAPS } from './map.definitions';
import { Connection, ROOM_TEMPLATES } from './room/room.definitions';
import { Direction } from './room/room.definitions';
import { MapModel } from './map.model';
import { MapFactory } from './map.factory';

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
  readonly mapFactory = inject(MapFactory);

  constructor() {
    this.loadMap('town');
  }

  public activeFloorGrid() {
    return computed(() => {
      const roomMap = this.rooms();
      const currentCoords = this.currentRoomCoords();
      const [playerX, playerY, playerZ] = currentCoords.split(',').map(Number);

      const floorRooms = Array.from(roomMap?.values() || [])
        .filter(room => room.coordinates?.z === playerZ);

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
          const key = `${x},${y},${playerZ}`;
          const room = roomMap?.get(key);

          row.push({
            room,
            isPlayer: key === currentCoords,
            visible: room?.visited ?? false
          });
        }
        grid.push(row);
      }

      return {
        grid,
        level: playerZ,
        dimensions: { width: maxX - minX + 1, height: maxY - minY + 1 }
      };
    });
  }

  private findTemplate(typeid: string) {
    return ROOM_TEMPLATES.find((template: Partial<RoomModel>) => template.typeid === typeid);
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

  /* private generateRandomMap(mapDefinition: any): Map<string, RoomModel> {
    const moveOffsets: Record<Direction, { x: number; y: number; z: number; }> = {
      north: { x: 0, y: 1, z: 0 }, south: { x: 0, y: -1, z: 0 },
      east: { x: 1, y: 0, z: 0 }, west: { x: -1, y: 0, z: 0 },
      up: { x: 0, y: 0, z: 1 }, down: { x: 0, y: 0, z: -1 }
    };

    const reverseDirections: Record<Direction, Direction> = {
      north: 'south', south: 'north', east: 'west', west: 'east', up: 'down', down: 'up'
    };

    const predefinedStructure = (mapDefinition.structure ?? {}) as Record<string, any>;
    const roomMap = new Map<string, RoomModel>();
    const randomTemplates = mapDefinition.randomRooms ?? [];

    Object.entries(predefinedStructure).forEach(([coords, config]) => {
      const template = this.findTemplate(config.room);
      if (template) {
        const [x, y, z] = coords.split(',').map(Number);
        const room = new RoomModel({ ...template, coordinates: { x, y, z } });

        if (config.mapConnections) {
          config.mapConnections.forEach((mapConnection: Connection) => {
            room.connections.set(mapConnection.connection as Direction, mapConnection);
          });
        }

        roomMap.set(coords, room);
      }
    });

    const activeFrontier = Array.from(roomMap.keys());
    let placedRoomsCount = roomMap.size;
    const targetRoomCount = Math.max(placedRoomsCount, Number(mapDefinition.rooms ?? 0));

    while (activeFrontier.length > 0 && placedRoomsCount < targetRoomCount) {
      const currentCoords = activeFrontier.shift()!;
      const currentRoom = roomMap.get(currentCoords)!;

      const reservedByConfig = new Set(
        predefinedStructure[currentCoords]?.mapConnections?.map((c: any) => c.connection) ?? []
      );

      const availableDirections = (Object.keys(moveOffsets) as Direction[]).sort(() => Math.random() - 0.5);

      for (const dir of availableDirections) {
        if (placedRoomsCount >= targetRoomCount || reservedByConfig.has(dir)) continue;

        const offset = moveOffsets[dir];
        const pos = currentRoom.coordinates!;
        const neighborCoords = `${pos.x + offset.x},${pos.y + offset.y},${pos.z + offset.z}`;
        const oppositeDir = reverseDirections[dir];

        if (roomMap.has(neighborCoords)) {
          const neighbor = roomMap.get(neighborCoords)!;
          const neighborReserved = new Set(
            predefinedStructure[neighborCoords]?.mapConnections?.map((c: any) => c.connection) ?? []
          );

          if (!neighborReserved.has(oppositeDir)) {
            currentRoom.connections.set(dir, neighborCoords);
            neighbor.connections.set(oppositeDir, currentCoords);
          }
          continue;
        }

        const randomTypeid = randomTemplates[Math.floor(Math.random() * randomTemplates.length)];
        const newTemplate = this.findTemplate(randomTypeid);
        if (!newTemplate) continue;

        const [nx, ny, nz] = neighborCoords.split(',').map(Number);
        const newRoom = new RoomModel({ ...newTemplate, coordinates: { x: nx, y: ny, z: nz } });

        roomMap.set(neighborCoords, newRoom);
        currentRoom.connections.set(dir, neighborCoords);
        newRoom.connections.set(oppositeDir, currentCoords);

        activeFrontier.push(neighborCoords);
        placedRoomsCount++;
      }

      if (placedRoomsCount < targetRoomCount && activeFrontier.length === 0) {
        activeFrontier.push(...Array.from(roomMap.keys()).sort(() => Math.random() - 0.5));
      }
    }

    return roomMap;
  } */

  /* private generateStaticMap(mapDefinition: any): Map<string, RoomModel> {
    const mapData = mapDefinition.structure as Record<string, any>;
    const roomMap = new Map<string, RoomModel>();

    Object.entries(mapData).forEach(([coords, config]) => {
      const template = this.findTemplate(config.room);
      const [x, y, z] = coords.split(',').map(Number);

      if (template) {
        const room = new RoomModel({
          ...template,
          coordinates: { x, y, z }
        });

        if (config.mapConnections?.length > 0) {
          room.externalExits = new Map();
          config.mapConnections.forEach((exit: Connection) => {
            room.externalExits?.set(exit.connection as Direction, exit);
          });
        }

        roomMap.set(coords, room);
      }
    });

    roomMap.forEach((room, coords) => {
      const config = mapData[coords];
      (config.connections ?? []).forEach((direction: Direction) => {
        const neighborKey = this.calculateNeighborKey(
          room.coordinates!.x,
          room.coordinates!.y,
          room.coordinates!.z,
          direction
        );
        if (roomMap.has(neighborKey)) {
          room.connections.set(direction, neighborKey);
        }
      });
    });

    return roomMap;
  } */

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
        nextRoom.visited = true;
        return [nextRoom.description, ...nextRoom.directions];
      }
    }

    return ["You cannot go that way."];
  }

  private calculateNeighborKey(x: number, y: number, z: number, direction: Direction): string {
    const movement = {
      north: [0, 1, 0], south: [0, -1, 0],
      east: [1, 0, 0], west: [-1, 0, 0],
      up: [0, 0, 1], down: [0, 0, -1]
    }[direction] || [0, 0, 0];

    return `${x + movement[0]},${y + movement[1]},${z + movement[2]}`;
  }
}