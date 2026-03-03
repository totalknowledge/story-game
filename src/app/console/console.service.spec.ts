import { TestBed } from '@angular/core/testing';

import { ConsoleService } from './console.service';
import { CharacterService } from '../character/character.service';
import { GameEngineService } from '../game-engine/game-engine.service';
import { MapService } from '../map/map.service';
import { ItemModel } from '../item/item.model';

describe('ConsoleService', () => {
  let service: ConsoleService;
  let charService: CharacterService;
  let mapService: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConsoleService,
        CharacterService,
        GameEngineService,
        MapService
      ]
    });

    service = TestBed.inject(ConsoleService);
    charService = TestBed.inject(CharacterService);
    mapService = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('allows dropping an item from inventory', () => {
    const player = charService.spawnCharacter('player');
    const apple = new ItemModel({ name: 'Shiney Apple', typeid: 'apple', type: 'consumable' });

    charService.acquireItem(player.id!, [apple]);
    expect(player.items).toContain(apple);

    const result = (service as any).handleDrop('apple');
    expect(result).toEqual(['You dropped Shiney Apple.']);
    expect(player.items).not.toContain(apple);
    expect(mapService.currentRoom()?.items).toContain(apple);
  });

  it('parses and drops equipped items', () => {
    const player = charService.spawnCharacter('player');
    const sword = new ItemModel({
      name: 'Zambi',
      typeid: 'zambi',
      type: 'weapon',
      equippableLocation: 'right-hand'
    });

    charService.acquireItem(player.id!, [sword]);
    charService.equipItem(player.id!, sword);
    expect(player.items).not.toContain(sword);
    expect(player.equipment.get('right-hand')).toBe(sword);

    const result = (service as any).handleDrop('zambi');
    expect(mapService.currentRoom()?.items).toContain(sword);
  });

  it('does not auto-equip a new item if slot is occupied', () => {
    const player = charService.spawnCharacter('player');
    const first = new ItemModel({
      name: 'First Sword',
      typeid: 'sword1',
      type: 'weapon',
      equippableLocation: 'right-hand'
    });
    const second = new ItemModel({
      name: 'Second Sword',
      typeid: 'sword2',
      type: 'weapon',
      equippableLocation: 'right-hand'
    });

    charService.acquireItem(player.id!, [first]);
    charService.equipItem(player.id!, first);
    expect(player.equipment.get('right-hand')).toBe(first);

    charService.acquireItem(player.id!, [second]);
    expect(player.equipment.get('right-hand')).toBe(first);
    expect(player.items).toContain(second);
  });

  it('does not auto-equip natural loot for the player', () => {
    const player = charService.spawnCharacter('player');
    const carapace = new ItemModel({
      name: 'Carapace',
      typeid: 'natural-carapace',
      type: 'Natural',
      equippableLocation: 'body',
      plusArmor: 3
    });

    charService.acquireItem(player.id!, [carapace]);

    expect(player.items).toContain(carapace);
    expect(player.equipment.get('body')).not.toBe(carapace);
  });

  it('blocks equipping natural loot and keeps it in inventory', () => {
    const player = charService.spawnCharacter('player');
    const carapace = new ItemModel({
      name: 'Carapace',
      typeid: 'natural-carapace',
      type: 'Natural',
      equippableLocation: 'body',
      plusArmor: 3
    });

    charService.acquireItem(player.id!, [carapace]);
    const result = (service as any).handleEquip('carapace');

    expect(result).toEqual(['You cannot equip natural anatomy like Carapace.']);
    expect(player.items).toContain(carapace);
    expect(player.equipment.get('body')).not.toBe(carapace);
  });
});
