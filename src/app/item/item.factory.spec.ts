import { TestBed } from '@angular/core/testing';

import { ItemFactory } from './item.factory';

describe('ItemFactory', () => {
  let service: ItemFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
