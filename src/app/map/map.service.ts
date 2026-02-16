import { Injectable, signal, computed } from '@angular/core';
import { RoomModel } from './room/room.model';
import { WORLD_MAPS } from './map.definitions';
import { Connection, ROOM_TEMPLATES } from './room/room.definitions';
import { Direction } from './room/room.definitions';

@Injectable({ providedIn: 'root' })
export class MapService {
  private rooms = signal<Map<string, RoomModel>>(new Map());
  private currentRoomCoords = signal<string>('0,0,0');

  readonly currentRoom = computed(() => this.rooms().get(this.currentRoomCoords()));

  constructor() {
    this.loadMap('town');
  }

  private findTemplate(typeid: string) {
    return ROOM_TEMPLATES.find((template: Partial<RoomModel>) => template.typeid === typeid);
  }

  loadMap(mapName: string): void {
    const mapData = WORLD_MAPS[mapName];
    if (!mapData) return;

    const newRoomMap = new Map<string, RoomModel>();

    Object.entries(mapData).forEach(([coords, config]) => {
      const template = this.findTemplate(config.room);
      const [x, y, z] = coords.split(',').map(Number);

      if (template) {
        newRoomMap.set(coords, new RoomModel({
          ...template,
          coordinates: { x, y, z }
        }));
      }
    });

    newRoomMap.forEach((room, coords) => {
      const config = mapData[coords];
      const { x, y, z } = room.coordinates!;

      config.connections.forEach((direction: Direction) => {
        const neighborKey = this.calculateNeighborKey(x, y, z, direction);
        if (newRoomMap.has(neighborKey)) {
          room.connections.set(direction, neighborKey);
        }
      });
    });

    this.rooms.set(newRoomMap);
  }

  public move(direction: Direction): string[] {
    const room = this.currentRoom();
    const config = WORLD_MAPS['town'][this.currentRoomCoords()];

    const exit = config.mapConnections.find((mapConnection: Connection) => mapConnection.connection === direction);
    if (exit) {
      if (exit.status === 'locked') return [`The path to ${exit.name} is barred.`];
      this.loadMap(exit.loads);
      this.currentRoomCoords.set('0,0,0');
      return [`You travel to ${exit.name}.`];
    }

    const targetCoords = room?.connections.get(direction);
    if (targetCoords) {
      this.currentRoomCoords.set(targetCoords);
      const nextRoom = this.currentRoom();
      nextRoom!.visited = true;
      return [nextRoom!.description];
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