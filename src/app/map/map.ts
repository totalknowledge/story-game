import { Component, inject } from '@angular/core';
import { MapService } from './map.service';

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
}
