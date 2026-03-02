import { TestBed } from '@angular/core/testing';

import { CombatEngineService } from '../game-engine/combat-engine.service';

describe('CombatEngineService', () => {
  let service: CombatEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CombatEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
