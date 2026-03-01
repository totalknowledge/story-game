import { describe, it, expect } from 'vitest';
import { RoomModel } from './room.model';

describe('RoomModel', () => {
  const roomData = {
    typeid: 'test-room',
    description: 'A damp cavern.',
    enemyTypeids: ['bat-01'],
    itemTypeids: ['gold-pouch']
  };

  it('should create an instance with provided template data', () => {
    const room = new RoomModel(roomData);
    expect(room).toBeTruthy();
    expect(room.typeid).toBe('test-room');
    expect(room.description).toBe('A damp cavern.');
  });

  it('should handle coordinateKey getter and setter correctly', () => {
    const room = new RoomModel(roomData);
    room.coordinateKey = '5,-2,0';

    expect(room.coordinates).toEqual({ x: 5, y: -2, z: 0 });
    expect(room.coordinateKey).toBe('5,-2,0');
  });

  it('should return available directions from the unified connections map', () => {
    const room = new RoomModel(roomData);

    room.connections.set('north', { connection: '0,1,0' });
    room.connections.set('east', { connection: '0,0,0', loads: 'town-square', name: 'Town' });

    const directionsMessage = room.directions[0];
    expect(directionsMessage).toContain('north');
    expect(directionsMessage).toContain('east');
  });

  it('should produce a clean template using toTemplate', () => {
    const room = new RoomModel({
      ...roomData,
      featureTypeids: ['altar-01']
    });

    const template = room.toTemplate();

    expect(template.typeid).toBe('test-room');
    expect(template.description).toBe('A damp cavern.');
    expect(template.featureTypeids).toContain('altar-01');
    expect((template as any).id).toBeUndefined();
    expect((template as any).visited).toBeUndefined();
  });

  it('should default description if none is provided', () => {
    const room = new RoomModel({ typeid: 'empty-room' });
    expect(room.description).toBe('A non-descript stone chamber.');
  });

  it('should return "no visible exits" when connections map is empty', () => {
    const room = new RoomModel(roomData);
    expect(room.directions[0]).toBe('There are no visible exits.');
  });
});