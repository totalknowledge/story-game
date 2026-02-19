import { inject, Injectable } from '@angular/core';
import { FeatureModel } from './feature.model';
import { FEATURE_TEMPLATES } from './feature.definitions';
import { ItemFactory } from '../item/item.factory';

@Injectable({
  providedIn: 'root',
})
export class FeatureFactory {
  private itemFactory = inject(ItemFactory);

  createFeature(typeid: string): FeatureModel {
    const template = FEATURE_TEMPLATES.find(t => t.typeid === typeid) as Partial<FeatureModel>;
    if (!template) {
      throw new Error(`Feature template not found: ${typeid}`);
    }

    const feature = new FeatureModel(template);

    if (template.type === 'store' && feature.items.length === 0) {
      this.populateStoreInventory(feature);
    }

    return feature;
  }

  private populateStoreInventory(store: FeatureModel): void {
    const itemCount = 10;
    for (let i = 0; i < itemCount; i++) {
      store.items.push(this.itemFactory.createRandomItem());
    }
  }
}