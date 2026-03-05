import { inject, Injectable } from '@angular/core';
import { MapDefinition, RoomDefinition } from './map.definitions';
import { MapModel } from './map.model';
import { RoomModel } from './room/room.model';
import { RoomFactory } from './room/room.factory';
import { Direction, ROOM_TEMPLATES, Connection, COORDINATE_OFFSETS, REVERSE_DIRECTIONS, DIRECTIONS, Coordinates } from './room/room.definitions';
import { d10, d100, pickRandom, rollDice, shuffleInPlace } from '../utilities/dice.definitions';

@Injectable({
  providedIn: 'root',
})
export class MapFactory {
  private roomFactory = inject(RoomFactory);

  public generateMap(mapDefinition: MapDefinition, options?: Record<string, any>): MapModel {
    const map = new MapModel({
      name: mapDefinition['name'] || 'Unknown Region',
      type: mapDefinition['type'],
      isPersistent: mapDefinition['isPersistent'],
      targetCR: mapDefinition['targetCR'],
      encounterChance: mapDefinition['encounterChance']
    });

    if (mapDefinition['generator'] === 'random') {
      map.rooms = this.generateRandomMap(mapDefinition, options);
    } else {
      map.rooms = this.generateStaticMap(mapDefinition, options);
    }

    return map;
  }

  private generateEnemyTypeIds(mapDefinition: MapDefinition): string[] {
    const enemyPool = mapDefinition['enemyTypes'] || [];
    if (enemyPool.length === 0) return [];

    const baseChance = mapDefinition['encounterChance'] || 0;
    const encounterRolls = [d100(), d100(), d100()];
    const spawnCount = encounterRolls.reduce((count, roll) => count + (roll <= (baseChance + d10(2)) ? 1 : 0), 0);

    const selectedTypes: string[] = [];

    for (let i = 0; i < spawnCount; i++) {
      selectedTypes.push(pickRandom(enemyPool));
    }

    return selectedTypes;
  }

  private generateStaticMap(mapDefinition: MapDefinition, options?: Record<string, any>): Map<string, RoomModel> {
    const roomMap = new Map<string, RoomModel>();
    const structure = mapDefinition['structure'] || {};

    Object.keys(structure).forEach(roomCoordinates => {
      const roomConfiguration = structure[roomCoordinates];
      const template = this.findTemplate(roomConfiguration.room);

      if (template) {
        const room = this.roomFactory.generateRoom(template, { coordinateKey: roomCoordinates });

        if (Array.isArray(roomConfiguration.featureTypeids)) {
          room.featureTypeids = [...roomConfiguration.featureTypeids];
        }

        if (roomConfiguration.mapConnections) {
          roomConfiguration.mapConnections.forEach((externalEntry: any) => {
            const { direction, ...connectionDetails } = externalEntry;
            const moveDirection = direction as Direction;

            const landingCoordinate = connectionDetails.connection || options?.['returnCoordinates'] || '0,0,0';

            const finalConnection: Connection = {
              ...connectionDetails,
              connection: landingCoordinate
            };

            this.roomFactory.addConnection(room, moveDirection, finalConnection);
          });
        }
        roomMap.set(roomCoordinates, room);
      }
    });

    roomMap.forEach((room, coordinates) => {
      const config = structure[coordinates];
      (config.connections || []).forEach((dir: Direction) => {
        const neighborKey = this.calculateNeighborKey(room.coordinates!, dir);
        if (roomMap.has(neighborKey)) {
          this.roomFactory.addConnection(room, dir, { connection: neighborKey });
        }
      });
    });

    return roomMap;
  }

  private generateRandomMap(mapDefinition: MapDefinition, options?: Record<string, any>): Map<string, RoomModel> {
    const roomMap = new Map<string, RoomModel>();
    const predefinedStructure = (mapDefinition['structure'] || {}) as Record<string, RoomDefinition>;
    const availableRoomTemplates = (mapDefinition['randomRooms'] || [])
      .map((typeid: string) => this.findTemplate(typeid))
      .filter(Boolean) as Partial<RoomModel>[];

    Object.keys(predefinedStructure).forEach(coordinateKey => {
      const roomConfiguration = predefinedStructure[coordinateKey];
      const roomTemplate = this.findTemplate(roomConfiguration.room);

      if (roomTemplate) {
        const room = this.roomFactory.generateRoom(roomTemplate, { coordinateKey });
        room.enemyTypeids = this.generateEnemyTypeIds(mapDefinition);

        if (Array.isArray(roomConfiguration.featureTypeids)) {
          room.featureTypeids = [...roomConfiguration.featureTypeids];
        }

        if (roomConfiguration.mapConnections) {
          roomConfiguration.mapConnections.forEach((externalEntry: any) => {
            const { direction, ...connectionDetails } = externalEntry;
            const moveDirection = direction as Direction;

            const landingCoordinate = connectionDetails.connection || options?.['returnCoordinates'] || '0,0,0';

            const finalConnection: Connection = {
              ...connectionDetails,
              connection: landingCoordinate
            };

            this.roomFactory.addConnection(room, moveDirection, finalConnection);
          });
        }
        roomMap.set(coordinateKey, room);
      }
    });

    const explorationFrontier = Array.from(roomMap.keys());
    const maxRoomLimit = mapDefinition['rooms'] || 15;

    while (explorationFrontier.length > 0 && roomMap.size < maxRoomLimit) {
      const activeCoordinateKey = explorationFrontier.pop()!;
      const activeRoom = roomMap.get(activeCoordinateKey)!;

      if (!activeRoom.coordinates) continue;

      const randomizedDirections: Direction[] = [...DIRECTIONS];
      shuffleInPlace(randomizedDirections);

      for (const moveDirection of randomizedDirections) {
        if (roomMap.size >= maxRoomLimit) break;
        if (activeRoom.connections.has(moveDirection)) continue;

        const neighborCoordinateKey = this.calculateNeighborKey(activeRoom.coordinates, moveDirection);
        const returnDirection = REVERSE_DIRECTIONS[moveDirection];

        if (roomMap.has(neighborCoordinateKey)) {
          const existingNeighbor = roomMap.get(neighborCoordinateKey)!;
          if (!existingNeighbor.connections.has(returnDirection)) {
            this.roomFactory.addConnection(activeRoom, moveDirection, { connection: neighborCoordinateKey });
            this.roomFactory.addConnection(existingNeighbor, returnDirection, { connection: activeCoordinateKey });
          }
          continue;
        }

        const procedurallyGeneratedRoom = this.roomFactory.generateRandomRoom(
          availableRoomTemplates,
          { coordinateKey: neighborCoordinateKey }
        );
        procedurallyGeneratedRoom.enemyTypeids = this.generateEnemyTypeIds(mapDefinition);
        roomMap.set(neighborCoordinateKey, procedurallyGeneratedRoom);

        this.roomFactory.addConnection(activeRoom, moveDirection, { connection: neighborCoordinateKey });
        this.roomFactory.addConnection(procedurallyGeneratedRoom, returnDirection, { connection: activeCoordinateKey });

        explorationFrontier.push(neighborCoordinateKey);
      }
    }

    this.placeRandomFeatures(roomMap, mapDefinition['randomFeatures'] || []);
    console.log(roomMap);
    return roomMap;
  }

  private placeRandomFeatures(roomMap: Map<string, RoomModel>, randomFeatures: string[]): void {
    if (!Array.isArray(randomFeatures) || randomFeatures.length === 0) return;
    const candidateKeys = Array.from(roomMap.keys());

    randomFeatures.forEach((featureTypeid: string) => {
      const selectedIndex = pickRandom(candidateKeys);
      const selectedRoom = roomMap.get(selectedIndex);
      selectedRoom!.featureTypeids = [featureTypeid];
    });
  }

  private calculateNeighborKey(coordinates: Coordinates, direction: Direction): string {
    const offset = COORDINATE_OFFSETS[direction];
    return `${coordinates.x + offset.x},${coordinates.y + offset.y},${coordinates.z + offset.z}`;
  }

  private findTemplate(typeid: string): Partial<RoomModel> | undefined {
    return ROOM_TEMPLATES.find(template => template.typeid === typeid);
  }
}