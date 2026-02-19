import { TestBed } from '@angular/core/testing';

import { FeatureFactory } from './feature.factory';

describe('FeatureFactory', () => {
  let service: FeatureFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
