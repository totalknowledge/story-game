import { TestBed } from '@angular/core/testing';

import { GameEngineService } from './game-engine.service';
import { MapService } from '../map/map.service';
import { ItemFactory } from '../item/item.factory';
import * as dice from '../utilities/dice.definitions';

describe('GameEngineService', () => {
  let service: GameEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('refreshes store inventory when reentering a visited room', () => {
    const mapService = TestBed.inject(MapService);

    const storeFeature: any = {
      type: 'Store',
      items: [
        { id: '1', name: 'foo' },
        { id: '2', name: 'bar' },
        { id: '3', name: 'baz' }
      ]
    };

    const roomA: any = {
      coordinateKey: 'room-a',
      features: [storeFeature],
      items: [],
      enemyIds: [],
      visited: true,
      connections: new Map([['north', { connection: 'room-b' }]])
    };

    const roomB: any = {
      coordinateKey: 'room-b',
      features: [],
      items: [],
      enemyIds: [],
      visited: true,
      connections: new Map([['south', { connection: 'room-a' }]])
    };

    mapService['currentMap']()?.rooms.set(roomA.coordinateKey, roomA);
    mapService['currentMap']()?.rooms.set(roomB.coordinateKey, roomB);
    mapService['currentRoomCoords'].set(roomA.coordinateKey);

    const refreshSpy = vi.spyOn(service as any, 'refreshStoreInventory');

    // mock the d10 helper instead of redefining the constant
    let callCount = 0;
    const d10Spy = vi.spyOn(dice, 'd10').mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 2 : 3;
    });

    const initialCount = storeFeature.items.length;
    expect(service.movePlayer('north').length).toBeGreaterThan(0);

    service.movePlayer('south');
    expect((service as any).refreshStoreInventory).toHaveBeenCalled();

    const finalCount = storeFeature.items.length;
    expect(finalCount).toBe(initialCount - 2 + (3 + 3));

    // restore spy
    d10Spy.mockRestore();
  });
});
