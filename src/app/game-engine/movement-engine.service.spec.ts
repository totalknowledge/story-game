import { TestBed } from '@angular/core/testing';

import { MovementEngineService } from './movement-engine.service';

describe('MovementEngineService', () => {
  let service: MovementEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovementEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
