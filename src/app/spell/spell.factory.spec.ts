import { TestBed } from '@angular/core/testing';

import { SpellFactory } from './spell.factory';

describe('SpellFactory', () => {
  let service: SpellFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpellFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
