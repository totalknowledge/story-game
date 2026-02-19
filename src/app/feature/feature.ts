import { Component, input, Signal } from '@angular/core';
import { FeatureModel } from './feature.model';

@Component({
  selector: 'app-feature',
  imports: [],
  templateUrl: './feature.html',
  styleUrl: './feature.css',
})
export class Feature {
  public feature = input.required<FeatureModel>();
}
