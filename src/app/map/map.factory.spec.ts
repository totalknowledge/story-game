import { TestBed } from '@angular/core/testing';
import { MapFactory } from './map.factory';
import { RoomFactory } from './room/room.factory';
import { MapDefinition } from './map.definitions';
import { RoomModel } from './room/room.model';
import { Direction } from './room/room.definitions';

describe('MapFactory', () => {
  let factory: MapFactory;
  let roomFactory: RoomFactory;

  const mockStaticDefinition: MapDefinition = {
    name: 'Test Town',
    type: 'settlement',
    generator: 'static',
    structure: {
      '0,0,0': {
        room: 'start-node',
        connections: ['north'] as Direction[],
        mapConnections: []
      },
      '0,1,0': {
        room: 'north-node',
        connections: ['south'] as Direction[],
        mapConnections: []
      }
    }
  };

  const mockRandomDefinition: MapDefinition = {
    name: 'Random Cave',
    type: 'dungeon',
    generator: 'random',
    rooms: 5,
    randomRooms: ['cave-room'],
    structure: {
      '0,0,0': {
        room: 'cave-entrance',
        connections: [],
        mapConnections: []
      }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapFactory, RoomFactory]
    });
    factory = TestBed.inject(MapFactory);
    roomFactory = TestBed.inject(RoomFactory);
  });

  it('should be created', () => {
    expect(factory).toBeTruthy();
  });

  describe('Static Generation', () => {
    it('should generate a map with the correct number of rooms', () => {
      const map = factory.generateMap(mockStaticDefinition);
      expect(map.rooms.size).toBe(2);
      expect(map.name).toBe('Test Town');
    });

    it('should establish bidirectional connections between static rooms', () => {
      const map = factory.generateMap(mockStaticDefinition);
      const startRoom = map.rooms.get('0,0,0');
      const northRoom = map.rooms.get('0,1,0');

      expect(startRoom?.connections.get('north')?.connection).toBe('0,1,0');
      expect(northRoom?.connections.get('south')?.connection).toBe('0,0,0');
    });

    it('should attach external map connections if defined', () => {
      const definitionWithExit = JSON.parse(JSON.stringify(mockStaticDefinition));
      definitionWithExit.structure['0,0,0'].mapConnections = [{
        connection: 'south',
        loads: 'world-hub',
        name: 'Town Gate'
      }];

      const map = factory.generateMap(definitionWithExit);
      const startRoom = map.rooms.get('0,0,0');

      expect(startRoom?.connections.get('south')?.loads).toBe('world-hub');
    });
  });

  describe('Random Generation', () => {
    it('should grow a map to the specified target room count', () => {
      const map = factory.generateMap(mockRandomDefinition);
      expect(map.rooms.size).toBeGreaterThanOrEqual(1);
      expect(map.rooms.size).toBeLessThanOrEqual(5);
    });

    it('should ensure all procedural rooms have at least one connection', () => {
      const map = factory.generateMap(mockRandomDefinition);

      map.rooms.forEach((room) => {
        expect(room.connections.size).toBeGreaterThan(0);
      });
    });

    it('should maintain coordinate integrity for generated rooms', () => {
      const map = factory.generateMap(mockRandomDefinition);

      map.rooms.forEach((room, key) => {
        const [x, y, z] = key.split(',').map(Number);
        expect(room.coordinates).toEqual({ x, y, z });
      });
    });
  });

  describe('Neighbor Logic', () => {
    it('should calculate the correct neighbor key based on offsets', () => {
      const coords = { x: 0, y: 0, z: 0 };
      const key = (factory as any).calculateNeighborKey(coords, 'north');
      expect(key).toBe('0,1,0');

      const upKey = (factory as any).calculateNeighborKey(coords, 'up');
      expect(upKey).toBe('0,0,1');
    });
  });
});