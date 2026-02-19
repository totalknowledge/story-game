import { Injectable } from '@angular/core';
import { RoomModel } from './room.model';
import { Connection, Direction } from './room.definitions';
import { pickRandom } from '../../utilities/dice.definitions';

@Injectable({
  providedIn: 'root',
})
export class RoomFactory {

  public generateRoom(roomTemplate: Partial<RoomModel>, options?: Record<string, any>): RoomModel {
    const room = new RoomModel(roomTemplate);

    if (options?.['coordinateKey']) {
      room.coordinateKey = options['coordinateKey'];
    }

    this.populateRoomItemTypeids(room, roomTemplate.itemTypeids || []);
    this.populateRoomEnemyTypeids(room, roomTemplate.enemyTypeids || []);
    this.populateRoomFeatureTypeids(room, roomTemplate.featureTypeids || []);

    return room;
  }

  public generateRandomRoom(templates: Partial<RoomModel>[], options?: Record<string, any>): RoomModel {
    const selectedTemplate = pickRandom(templates);
    return this.generateRoom(selectedTemplate, options);
  }

  public addConnection(room: RoomModel, direction: Direction, connection: Connection): void {
    room.connections.set(direction, connection);
  }

  private populateRoomItemTypeids(room: RoomModel, typeids: string[]): void {
    room.itemTypeids = [...typeids];
  }

  private populateRoomEnemyTypeids(room: RoomModel, typeids: string[]): void {
    room.enemyTypeids = [...typeids];
  }

  private populateRoomFeatureTypeids(room: RoomModel, typeids: string[]): void {
    room.featureTypeids = [...typeids];
  }
}
