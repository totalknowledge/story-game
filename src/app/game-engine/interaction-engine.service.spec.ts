import { TestBed } from '@angular/core/testing';

import { InteractionEngineService } from './interaction-engine.service';

describe('InteractionEngineService', () => {
  let service: InteractionEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
