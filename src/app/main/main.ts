import { Component, inject, signal } from '@angular/core';
import { Player } from "../player/player";
import { Header } from "../header/header";
import { Enemies } from "../enemies/enemies";
import { ConsoleComponent } from "../console/console";
import { Map } from "../map/map"
import { Feature } from '../feature/feature';
import { MapService } from '../map/map.service';

@Component({
  selector: 'app-main',
  imports: [Player, Enemies, Map, ConsoleComponent, Feature],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  private mapService = inject(MapService);
  readonly activeFeature = this.mapService.activeFeature;
}
