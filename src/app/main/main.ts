import { Component, inject, signal } from '@angular/core';
import { Player } from "../player/player";
import { Header } from "../header/header";
import { Enemies } from "../enemies/enemies";
import { ConsoleComponent } from "../console/console";
import { Map } from "../map/map"
import { Feature } from '../feature/feature';
import { FeatureFactory } from '../feature/feature.factory';
import { MapService } from '../map/map.service';

@Component({
  selector: 'app-main',
  imports: [Player, Header, Enemies, Map, ConsoleComponent, Feature],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  private featureFactory = inject(FeatureFactory);
  private mapService = inject(MapService);
  activeFeature = signal(null)
  // this.featureFactory.createFeature('feature-bank-vault')
}
