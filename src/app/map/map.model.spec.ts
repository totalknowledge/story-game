import { describe, it, expect } from 'vitest';
import { MapModel } from './map.model';
import { RoomModel } from './room/room.model';

describe('MapModel', () => {
  it('should create an instance with provided config', () => {
    const map = new MapModel({
      name: 'althea-streeets',
      type: 'town',
      isPersistent: true
    });

    expect(map).toBeTruthy();
    expect(map.name).toBe('althea-streeets');
    expect(map.type).toBe('town');
    expect(map.isPersistent).toBe(true);
  });

  it('should hold a collection of RoomModel instances', () => {
    const map = new MapModel({ name: 'test-map', type: 'dungeon' });
    const room = new RoomModel({ description: 'A test room' });

    map.rooms.set('0,0,0', room);

    expect(map.rooms.size).toBe(1);
    expect(map.rooms.get('0,0,0')).toBeInstanceOf(RoomModel);
    expect(map.rooms.get('0,0,0')?.description).toBe('A test room');
  });

  it('should generate a unique id on instantiation', () => {
    const mapA = new MapModel({ name: 'mapA', type: 'wilderness' });
    const mapB = new MapModel({ name: 'mapB', type: 'wilderness' });

    expect(mapA.id).toBeDefined();
    expect(mapA.id).not.toBe(mapB.id);
  });
});