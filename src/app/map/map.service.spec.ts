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

  it('unlocks adjacent locked map path when unlock target matches', () => {
    (service as any).currentRoomCoords.set('0,-2,0');
    const result = service.unlockAdjacentPaths(['crypts-01']);
    const southConnection = service.currentRoom()?.connections.get('south');

    expect(result.unlocked).toBe(true);
    expect(result.message).toBe('You unlock The Catacombs.');
    expect(southConnection?.status).toBe('unlocked');
  });

  it('returns failure when no adjacent locked path matches unlock target', () => {
    (service as any).currentRoomCoords.set('0,0,0');
    const result = service.unlockAdjacentPaths(['crypts-01']);

    expect(result.unlocked).toBe(false);
    expect(result.message).toBe('Nothing nearby can be unlocked with that.');
  });

  it('does not pre-mark random map entry room as visited on initial load', () => {
    service.loadMap('caves-01', '0,0,0');

    const entryRoom = service.currentRoom();
    expect(entryRoom).toBeTruthy();
    expect(entryRoom?.visited).toBe(false);
  });
});
