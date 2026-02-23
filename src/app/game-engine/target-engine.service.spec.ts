import { TestBed } from '@angular/core/testing';

import { TargetEngineService } from './target-engine.service';

describe('TargetEngineService', () => {
  let service: TargetEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TargetEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
