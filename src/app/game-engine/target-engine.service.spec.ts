import { TestBed } from '@angular/core/testing';

import { TargetingEngine } from './target-engine.service';

describe('TargetingEngine', () => {
  let service: TargetingEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TargetingEngine);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
