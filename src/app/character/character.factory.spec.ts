import { TestBed } from '@angular/core/testing';

import { CharacterFactory } from './character.factory';

describe('CharacterFactory', () => {
  let service: CharacterFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('player always starts with MagicMissile', () => {
    const player = service.createCharacter('player');

    expect(player.spells.some(spell => spell.typeid === 'spell-magic-missile')).toBe(true);
  });

  it('player starts with short bow, 20 arrows, and a cheese wheel', () => {
    const player = service.createCharacter('player');

    expect(player.equipment.get('right-hand')?.typeid).toBe('weapon-bow-short');
    expect(player.items.some(item => item.typeid === 'ammo-arrows' && item.quantity === 20)).toBe(true);
    expect(player.items.some(item => item.typeid === 'food-cheese')).toBe(true);
  });
});
