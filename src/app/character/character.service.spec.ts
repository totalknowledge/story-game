import { TestBed } from '@angular/core/testing';

import { CharacterService } from './character.service';
import { CharacterModel } from './character.model';
import { ItemModel } from '../item/item.model';

describe('CharacterService', () => {
  let service: CharacterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('recalculates combat rating when inventory changes via updateCharacter', () => {
    const player = new CharacterModel('Hero', 20, 10, { typeid: 'player' });
    service.registerCharacter(player, true);

    service.updateCharacter(player);
    const baseRating = player.combatRating ?? 0;

    player.items.push(new ItemModel({
      typeid: 'consumable-potion',
      name: 'Potion',
      type: 'Consumable',
      heals: 400,
      restores: 200,
      equippableLocation: 'none'
    }));
    service.updateCharacter(player);
    const withConsumable = player.combatRating ?? 0;

    player.items = [];
    service.updateCharacter(player);
    const afterRemoval = player.combatRating ?? 0;

    expect(withConsumable).toBeGreaterThanOrEqual(baseRating);
    expect(afterRemoval).toBe(baseRating);
  });
});
