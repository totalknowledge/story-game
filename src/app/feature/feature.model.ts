import { ItemModel } from '../item/item.model';
import { FeatureType } from './feature.definitions';

export class FeatureModel {
    id: string;
    typeid: string;
    name: string;
    type: FeatureType;
    description: string;
    interactable: boolean;
    items: ItemModel[];
    itemSlots?: number;
    sellMultiplier?: number;
    gold?: number;
    locked?: boolean;
    keyRequired?: string;
    manaRestored?: number;
    healthRestored?: number;
    used?: boolean;
    respawnTime?: number;

    constructor(template: Partial<FeatureModel> = {}) {
        this.id = crypto.randomUUID();
        this.typeid = template.typeid || 'feature-generic';
        this.name = template.name || 'Feature';
        this.type = template.type || 'Decoration';
        this.description = template.description || '';
        this.interactable = template.interactable ?? true;
        this.items = template.items || [];
        this.itemSlots = template.itemSlots;
        this.sellMultiplier = template.sellMultiplier;
        this.gold = template.gold;
        this.locked = template.locked;
        this.keyRequired = template.keyRequired;
        this.manaRestored = template.manaRestored;
        this.healthRestored = template.healthRestored;
        this.used = template.used;
        this.respawnTime = template.respawnTime;

        Object.assign(this, template);
    }
}