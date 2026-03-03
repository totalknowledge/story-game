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
});
