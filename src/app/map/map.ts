import { Component, inject } from '@angular/core';
import { MapService } from './map.service';
import * as utilities from '../utilities/dice.definitions';
import { RoomModel } from './room/room.model';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map {
  private mapService = inject(MapService);

  readonly floorData = this.mapService.activeFloorGrid();
  readonly displayMap = this.mapService.displayMap;

  log = utilities.log;

  hasFeature(room?: RoomModel): boolean {
    return !!room?.features?.length;
  }

  hasUp(room?: RoomModel): boolean {
    return !!room?.connections?.get('up');
  }

  hasDown(room?: RoomModel): boolean {
    return !!room?.connections?.get('down');
  }
}
