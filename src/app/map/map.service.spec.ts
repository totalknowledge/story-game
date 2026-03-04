import { TestBed } from '@angular/core/testing';

import { MapService } from './map.service';

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('resets active dungeon map to a new instance when using a friendly name', () => {
    service.loadMap('caves-01', '0,0,0');
    const firstCavesInstance = service.displayMap();

    const result = service.resetMap('caves');
    const secondCavesInstance = service.displayMap();

    expect(result).toEqual(['The Caves has been reset.']);
    expect(secondCavesInstance?.name).toBe('The Caves');
    expect(secondCavesInstance).not.toBe(firstCavesInstance);
  });

  it('resets a cached dungeon instance and regenerates it on next load', () => {
    service.loadMap('caves-01', '0,0,0');
    const firstCavesInstance = service.displayMap();

    service.loadMap('town', '0,0,0');
    service.resetMap('caves');
    service.loadMap('caves-01', '0,0,0');

    const secondCavesInstance = service.displayMap();
    expect(secondCavesInstance).not.toBe(firstCavesInstance);
  });

  it('returns a helpful message when reset target does not exist', () => {
    expect(service.resetMap('not-a-real-map')).toEqual(['No map found for "not-a-real-map".']);
  });
});
