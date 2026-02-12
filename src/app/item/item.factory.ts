import { Injectable } from '@angular/core';
import { ItemModel } from './item.model';
import { ITEM_TEMPLATES } from './item.definitions';

@Injectable({
  providedIn: 'root',
})
export class ItemFactory {

  createItem(typeid: string): ItemModel {
    const itemTemplate = ITEM_TEMPLATES.find((t) => t.typeid === typeid) as any;

    if (!itemTemplate) {
      return this.createFallbackItem(typeid);
    }

    return this.createItemFromTemplate(itemTemplate);
  }

  createRandomItem(includeTypes?: string[], excludeTypes: string[] = ['Natural']): ItemModel {
    let itemPool = ITEM_TEMPLATES;

    if (includeTypes && includeTypes.length > 0) {
      itemPool = itemPool.filter(t => includeTypes.includes(t.type));
    }

    if (excludeTypes.length > 0) {
      itemPool = itemPool.filter(t => !excludeTypes.includes(t.type));
    }

    if (itemPool.length === 0) {
      return this.createFallbackItem('empty-pool');
    }

    const randomIndex = Math.floor(Math.random() * itemPool.length);
    return this.createItemFromTemplate(itemPool[randomIndex]as any);
  }

  private createItemFromTemplate(template: ItemModel): ItemModel {
    const newItem = new ItemModel(template);

    if (newItem.type === 'Scroll' || newItem.type === 'SpellBook') {
      this.randomizeMagicItem(newItem);
    }

    return newItem;
  }

  private randomizeMagicItem(item: ItemModel): void {
    item.teaches = item.teaches || [];
  }

  private createFallbackItem(typeid: string): ItemModel {
    return new ItemModel({
      typeid: 'broken-item',
      name: `Unknown Item (${typeid})`,
      type: 'Trinket',
      equippableLocation: 'none'
    });
  }
}