import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CombatEngineService } from '../game-engine/combat-engine.service';
import { CharacterModel } from '../character/character.model';
import { ItemModel } from '../item/item.model';

describe('CombatEngineService', () => {
  let service: CombatEngineService;
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CombatEngineService);
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('decrements equipped arrows by one on attack', () => {
    const attacker = new CharacterModel('Archer', 20, 0, { typeid: 'player' });
    const defender = new CharacterModel('Target', 20, 0, { typeid: 'enemy' });

    const equippedArrows = new ItemModel({
      typeid: 'ammo-arrows',
      name: 'Arrow',
      type: 'Ammo',
      equippableLocation: 'right-hand',
      damage: 6,
      quantity: 2
    });

    attacker.equipment.set('right-hand', equippedArrows);

    service.attack(attacker, defender);

    expect(attacker.equipment.get('right-hand')?.quantity).toBe(1);
  });

  it('auto-equips backpack arrows when equipped arrows reach zero', () => {
    const attacker = new CharacterModel('Archer', 20, 0, { typeid: 'player' });
    const defender = new CharacterModel('Target', 20, 0, { typeid: 'enemy' });

    const equippedArrows = new ItemModel({
      typeid: 'ammo-arrows',
      name: 'Arrow',
      type: 'Ammo',
      equippableLocation: 'right-hand',
      damage: 6,
      quantity: 1
    });

    const backpackArrows = new ItemModel({
      typeid: 'ammo-arrows',
      name: 'Arrow',
      type: 'Ammo',
      equippableLocation: 'right-hand',
      damage: 6,
      quantity: 3
    });

    attacker.equipment.set('right-hand', equippedArrows);
    attacker.items.push(backpackArrows);

    service.attack(attacker, defender);

    expect(attacker.equipment.get('right-hand')).toBe(backpackArrows);
    expect(attacker.items).not.toContain(backpackArrows);
  });
});
