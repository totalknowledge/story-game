import { TestBed } from '@angular/core/testing';
import { RoomFactory } from './room.factory';
import { RoomModel } from './room.model';
import { Direction, Connection } from './room.definitions';

describe('RoomFactory', () => {
  let factory: RoomFactory;

  const mockTemplate: Partial<RoomModel> = {
    typeid: 'chamber-01',
    description: 'A stone chamber.',
    enemyTypeids: ['goblin-01'],
    itemTypeids: ['potion-01'],
    featureTypeids: ['torch-01']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    factory = TestBed.inject(RoomFactory);
  });

  it('should be created', () => {
    expect(factory).toBeTruthy();
  });

  it('should generate a room from a template with correct hydration', () => {
    const room = factory.generateRoom(mockTemplate);

    expect(room.typeid).toBe('chamber-01');
    expect(room.description).toBe('A stone chamber.');
    expect(room.enemyTypeids).toContain('goblin-01');
    expect(room.itemTypeids).toContain('potion-01');
    expect(room.featureTypeids).toContain('torch-01');
  });

  it('should set coordinates when provided in options', () => {
    const coordinateKey = '1,2,0';
    const room = factory.generateRoom(mockTemplate, { coordinateKey });

    expect(room.coordinateKey).toBe(coordinateKey);
    expect(room.coordinates).toEqual({ x: 1, y: 2, z: 0 });
  });

  it('should pick a random template and generate a room', () => {
    const templates = [mockTemplate, { ...mockTemplate, typeid: 'chamber-02' }];
    const room = factory.generateRandomRoom(templates);

    expect(room).toBeInstanceOf(RoomModel);
    expect(['chamber-01', 'chamber-02']).toContain(room.typeid);
  });

  it('should add a connection to a room', () => {
    const room = factory.generateRoom(mockTemplate);
    const direction: Direction = 'north';
    const connection: Connection = { connection: '0,1,0' };

    factory.addConnection(room, direction, connection);

    expect(room.connections.has(direction)).toBe(true);
    expect(room.connections.get(direction)).toEqual(connection);
  });

  it('should handle external connections (map loads) correctly', () => {
    const room = factory.generateRoom(mockTemplate);
    const direction: Direction = 'east';
    const externalConnection: Connection = {
      connection: '0,0,0',
      loads: 'world-map',
      name: 'Gate'
    };

    factory.addConnection(room, direction, externalConnection);

    const storedConnection = room.connections.get(direction);
    expect(storedConnection?.loads).toBe('world-map');
    expect(storedConnection?.name).toBe('Gate');
  });
});
