import { TestBed } from '@angular/core/testing';

import { GameEngineService } from './game-engine.service';
import { MapService } from '../map/map.service';
import { CharacterService } from '../character/character.service';
import { ItemFactory } from '../item/item.factory';
import { ItemModel } from '../item/item.model';

describe('GameEngineService', () => {
  let service: GameEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('refreshes store inventory when reentering a visited room', () => {
    const mapService = TestBed.inject(MapService);

    const storeFeature: any = {
      type: 'Store',
      items: [
        { id: '1', name: 'foo' },
        { id: '2', name: 'bar' },
        { id: '3', name: 'baz' }
      ]
    };

    const roomA: any = {
      coordinateKey: 'room-a',
      features: [storeFeature],
      items: [],
      enemyIds: [],
      visited: true,
      connections: new Map([['north', { connection: 'room-b' }]])
    };

    const roomB: any = {
      coordinateKey: 'room-b',
      features: [],
      items: [],
      enemyIds: [],
      visited: true,
      connections: new Map([['south', { connection: 'room-a' }]])
    };

    mapService['currentMap']()?.rooms.set(roomA.coordinateKey, roomA);
    mapService['currentMap']()?.rooms.set(roomB.coordinateKey, roomB);
    mapService['currentRoomCoords'].set(roomA.coordinateKey);

    const initialItems = storeFeature.items.map((i: any) => ({ ...i }));

    expect(service.movePlayer('north').length).toBeGreaterThan(0);

    service.movePlayer('south');

    expect(storeFeature.items[storeFeature.items.legnth -1]?.id).not.toEqual(initialItems[initialItems.length-1]?.id);
  });

  it('clears enemies in room when reviving', () => {
    const characterService = TestBed.inject(CharacterService);
    const mapService = TestBed.inject(MapService);

    const currentRoom = mapService.currentRoom();
    expect(currentRoom).toBeTruthy();

    vi.spyOn(characterService, 'loadRoomCharacters');
    vi.spyOn(characterService, 'moveCharacter');
    vi.spyOn(characterService, 'updateCharacter');
    vi.spyOn(characterService, 'equipItem').mockReturnValue([]);
    vi.spyOn(characterService, 'acquireItem').mockReturnValue(true);
    vi.spyOn(mapService, 'loadMap');
    vi.spyOn(mapService, 'updateRoom');

    const player: any = {
      id: 'player-1',
      equipment: new Map(),
      items: [],
      dead: true,
      damage: 5,
      usedMana: 3,
      equippedItemTemplate: []
    };

    service.revive(player);

    expect(characterService.loadRoomCharacters).toHaveBeenCalledWith([], []);
  });

  it('revive rebuilds equipped items from legacy string templates', () => {
    const characterService = TestBed.inject(CharacterService);
    const mapService = TestBed.inject(MapService);
    const itemFactory = TestBed.inject(ItemFactory);

    vi.spyOn(characterService, 'loadRoomCharacters');
    vi.spyOn(characterService, 'moveCharacter');
    vi.spyOn(characterService, 'updateCharacter');
    const equipSpy = vi.spyOn(characterService, 'equipItem').mockReturnValue([]);
    vi.spyOn(characterService, 'acquireItem').mockReturnValue(true);
    vi.spyOn(mapService, 'loadMap');
    vi.spyOn(mapService, 'updateRoom');
    const createItemSpy = vi.spyOn(itemFactory, 'createItem');

    const player: any = {
      id: 'player-1',
      equipment: new Map(),
      items: [],
      dead: true,
      damage: 5,
      usedMana: 3,
      equippedItemTemplate: ['weapon-sword']
    };

    service.revive(player);

    expect(createItemSpy).toHaveBeenCalledWith('weapon-sword');
    expect(equipSpy).toHaveBeenCalled();
  });

  it('takes matching loose room item by name', () => {
    const characterService = TestBed.inject(CharacterService);
    const mapService = TestBed.inject(MapService);

    const player = characterService.spawnCharacter('player');
    const room = mapService.currentRoom();
    expect(room).toBeTruthy();

    const floorItem = new ItemModel({
      typeid: 'consumable-apple',
      name: 'Shiny Apple',
      type: 'Consumable',
      equippableLocation: 'none'
    });
    room!.items.push(floorItem);

    const result = service.take(player, 'apple');

    expect(result).toEqual(['You took Shiny Apple.']);
    expect(player.items.some(item => item.id === floorItem.id)).toBe(true);
    expect(room!.items.some(item => item.id === floorItem.id)).toBe(false);
  });

  it('has living enemies follow between rooms on same map when chance succeeds', () => {
    const characterService = TestBed.inject(CharacterService);
    const mapService = TestBed.inject(MapService);

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const player = characterService.spawnCharacter('player');
    const enemy = characterService.spawnCharacter('enemy-rat');
    enemy.dead = false;

    characterService.moveCharacter('0,0,0', player.id!);
    characterService.moveCharacter('0,0,0', enemy.id!);
    mapService.updateRoom('0,0,0', { enemyIds: [enemy.id!] });
    characterService.loadRoomCharacters([enemy.id!], []);

    service.movePlayer('east');

    const destination = mapService.currentRoom();
    expect(destination?.coordinateKey).toBe('1,0,0');
    expect(destination?.enemyIds?.includes(enemy.id!)).toBe(true);

    const originRoom = mapService.displayMap()?.rooms.get('0,0,0');
    expect(originRoom?.enemyIds?.includes(enemy.id!)).toBe(false);

    randomSpy.mockRestore();
  });

  it('keeps enemies behind when changing maps', () => {
    const characterService = TestBed.inject(CharacterService);
    const mapService = TestBed.inject(MapService);

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const player = characterService.spawnCharacter('player');
    const enemy = characterService.spawnCharacter('enemy-rat');
    enemy.dead = false;

    characterService.moveCharacter('2,0,0', player.id!);
    characterService.moveCharacter('2,0,0', enemy.id!);
    mapService.updateRoom('2,0,0', { enemyIds: [enemy.id!] });
    characterService.loadRoomCharacters([enemy.id!], []);
    mapService['currentRoomCoords'].set('2,0,0');

    service.movePlayer('east');

    expect(mapService.displayMap()?.name).toBe('The Caves');
    const caveEntrance = mapService.currentRoom();
    expect(caveEntrance?.enemyIds?.includes(enemy.id!)).toBe(false);

    mapService.loadMap('town', '2,0,0');
    const townDeparture = mapService.currentRoom();
    expect(townDeparture?.enemyIds?.includes(enemy.id!)).toBe(true);

    randomSpy.mockRestore();
  });
});
