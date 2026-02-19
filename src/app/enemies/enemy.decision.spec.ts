import { TestBed } from '@angular/core/testing';

import { EnemyDecision } from './enemy.decision';

describe('EnemyDecision', () => {
  let service: EnemyDecision;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnemyDecision);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
