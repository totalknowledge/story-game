import { TestBed } from '@angular/core/testing';

import { InteractionEngineService } from './interaction-engine.service';
import { CharacterService } from '../character/character.service';
import { ItemModel } from '../item/item.model';
import { MapService } from '../map/map.service';

describe('InteractionEngineService', () => {
  let service: InteractionEngineService;
  let characterService: CharacterService;
  let mapService: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionEngineService);
    characterService = TestBed.inject(CharacterService);
    mapService = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('decrements consumable quantity by one when used', () => {
    const player = characterService.spawnCharacter('player');
    player.damage = 10;

    const potion = new ItemModel({
      typeid: 'potion-health',
      name: 'Health Potion',
      type: 'Consumable',
      equippableLocation: 'none',
      heals: 5,
      quantity: 2,
      useMessages: ['{user} drinks {item} and recovers {value} health.']
    });

    player.items.push(potion);

    const result = service.use(player, 'health potion');

    expect(result[0]).toContain('recovers 5 health');
    expect(potion.quantity).toBe(1);
    expect(player.items).toContain(potion);
  });

  it('removes consumable when quantity reaches zero after use', () => {
    const player = characterService.spawnCharacter('player');
    player.damage = 5;

    const potion = new ItemModel({
      typeid: 'potion-health',
      name: 'Test Health Potion',
      type: 'Consumable',
      equippableLocation: 'none',
      heals: 5,
      quantity: 1,
      useMessages: ['{user} drinks {item} and recovers {value} health.']
    });

    player.items.push(potion);

    service.use(player, 'test health potion');

    expect(player.items.some(item => item.id === potion.id)).toBe(false);
  });

  it('uses key item unlocks to unlock adjacent catacombs path', () => {
    const player = characterService.spawnCharacter('player');
    (mapService as any).currentRoomCoords.set('0,-2,0');

    const catacombsKey = new ItemModel({
      typeid: 'key-catacombs',
      name: 'Key to the Catacombs',
      type: 'Utility',
      equippableLocation: 'none',
      unlocks: ['crypts-01']
    });

    player.items.push(catacombsKey);

    const result = service.use(player, 'key to the catacombs');
    const southConnection = mapService.currentRoom()?.connections.get('south');

    expect(result).toEqual(['You unlock The Catacombs.']);
    expect(southConnection?.status).toBe('unlocked');
  });
});
