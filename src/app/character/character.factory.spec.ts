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
});
