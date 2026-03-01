import { Component, inject, HostListener } from '@angular/core';
import { Player } from "../player/player";
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
  private channel = new BroadcastChannel('story-game');
  readonly activeFeature = this.mapService.activeFeature;

  focusConsoleInput() {
    this.channel.postMessage('focus-console');
  }
}
