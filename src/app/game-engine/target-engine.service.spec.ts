import { TestBed } from '@angular/core/testing';

import { TargetingEngine } from './target-engine.service';
import { CharacterModel } from '../character/character.model';

describe('TargetingEngine', () => {
  let service: TargetingEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TargetingEngine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('additional-target without explicit target selects only living enemies', () => {
    const actor = new CharacterModel('Hero', 20, 10, { typeid: 'player' });
    actor.id = 'p1';

    const deadEnemy = new CharacterModel('Dead Rat', 10, 0, { typeid: 'enemy-rat' });
    deadEnemy.id = 'e1';
    deadEnemy.dead = true;

    const liveEnemyA = new CharacterModel('Live Bat', 10, 0, { typeid: 'enemy-bat' });
    liveEnemyA.id = 'e2';

    const liveEnemyB = new CharacterModel('Live Slime', 10, 0, { typeid: 'enemy-slime' });
    liveEnemyB.id = 'e3';

    const result = service.resolveTargets({
      actor,
      determinationScheme: 'additional-target',
      charactersInRoom: [deadEnemy, liveEnemyA, liveEnemyB],
    });

    expect(result.hostileTargets?.length).toBe(2);
    expect(result.hostileTargets?.every(target => !target.isDead)).toBe(true);
    expect(result.hostileTargets?.map(target => target.id)).toEqual(['e2', 'e3']);
  });
});
