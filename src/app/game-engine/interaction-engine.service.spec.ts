import { TestBed } from '@angular/core/testing';

import { InteractionEngineService } from './interaction-engine.service';
import { CharacterService } from '../character/character.service';
import { ItemModel } from '../item/item.model';

describe('InteractionEngineService', () => {
  let service: InteractionEngineService;
  let characterService: CharacterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionEngineService);
    characterService = TestBed.inject(CharacterService);
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
      name: 'Health Potion',
      type: 'Consumable',
      equippableLocation: 'none',
      heals: 5,
      quantity: 1,
      useMessages: ['{user} drinks {item} and recovers {value} health.']
    });

    player.items.push(potion);

    service.use(player, 'health potion');

    expect(player.items.some(item => item.id === potion.id)).toBe(false);
  });
});
