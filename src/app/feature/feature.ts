import { Component, inject, input } from '@angular/core';
import { FeatureModel } from './feature.model';
import { FeatureService } from './feature.service';

@Component({
  selector: 'app-feature',
  imports: [],
  templateUrl: './feature.html',
  styleUrl: './feature.css',
})
export class Feature {
  private featureService = inject(FeatureService);
  public feature = input.required<FeatureModel>();

  public formatMoney(totalCopperAmount: number): string {
    return this.featureService.formatMoney(totalCopperAmount);
  }
}
