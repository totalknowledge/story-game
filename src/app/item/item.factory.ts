import { Injectable } from '@angular/core';
import { ItemModel } from './item.model';
import { ITEM_TEMPLATES } from './item.definitions';
import { d10, d100, pickRandom, rollDice } from '../utilities/dice.definitions';
import { SpellFactory } from '../spell/spell.factory';

@Injectable({
  providedIn: 'root',
})
export class ItemFactory {
  spellFactory = new SpellFactory();

  createItem(typeid: string, options?: Record<string, string>): ItemModel {
    const itemTemplate = ITEM_TEMPLATES.find((template) => template.typeid === typeid) as any;

    if (!itemTemplate) {
      return this.createFallbackItem(typeid);
    }

    return this.createItemFromTemplate(itemTemplate, Number(options?.['CRTarget']) ?? 9);
  }

  createRandomItem(includeTypes?: string[], CRTarget: number = 9, excludeTypes: string[] = ['Natural']): ItemModel {
    let itemPool = ITEM_TEMPLATES.filter(itemTemplate => (itemTemplate as any).excludeFromRandom !== true);
    if (CRTarget < 10) {
        itemPool = itemPool.filter(itemTemplate => ['damaged', 'standard'].includes(itemTemplate.quality ?? 'standard'))
    } else if (CRTarget < 20) {
        itemPool = itemPool.filter(itemTemplate => ['damaged', 'standard', 'fine'].includes(itemTemplate.quality ?? 'standard'))
    } else if (CRTarget < 30) {
        itemPool = itemPool.filter(itemTemplate => ['standard', 'fine', 'elite'].includes(itemTemplate.quality ?? 'standard'))
    } else if (CRTarget < 40) {
      itemPool = itemPool.filter(itemTemplate => ['fine', 'elite', 'magical'].includes(itemTemplate.quality ?? 'standard'));
    }

    if (includeTypes && includeTypes.length > 0) {
      itemPool = itemPool.filter(t => includeTypes.includes(t.type));
    }

    if (excludeTypes.length > 0) {
      itemPool = itemPool.filter(t => !excludeTypes.includes(t.type));
    }
    if (itemPool.length === 0) {
      return this.createFallbackItem('empty-pool');
    }

    return this.createItemFromTemplate(pickRandom(itemPool), CRTarget);
  }

  private createItemFromTemplate(template: ItemModel, CRTarget?: number): ItemModel {
    const newItem = new ItemModel(template);
    this.randomizeMagicItem(newItem, CRTarget);
    return newItem;
  }

  private randomizeMagicItem(item: ItemModel, CRTarget?: number): void {
    if (item.type === 'Scroll' || item.type === 'SpellBook') {
      this.applyRandomSpell(item);
      return;
    }

    let magicRoll = rollDice(1, 100);
    item.quality ??= 'standard';
    switch (item.quality) {
      case 'damaged':
        magicRoll += 90;
        break;
      case 'standard':
        magicRoll += 9;
        break;
      case 'fine':
        break;
      case 'elite':
        magicRoll -= 50;
        break;
      case 'magical':
        magicRoll -= 90;
        break;
      default:
        break;
    }
    const isTypeMagic = (item.type === 'Weapon' || item.type === 'Armor') && magicRoll <= 10;
    const isTrinketMagic = item.type === 'Trinket' && magicRoll <= 95;
    const isForcedMagic = item.typeid.includes('magic');

    if (isTypeMagic || isTrinketMagic || isForcedMagic) {
      item.quality = 'magical';
      this.mutateMagicalProperties(item);
    }
  }

  private applyRandomSpell(item: ItemModel): void {
    if (item.type === 'SpellBook') {
      const spellCount = rollDice(2, 2);
      const spellSet = new Set<string>();
      
      while (spellSet.size < spellCount) {
        const spell = this.spellFactory.getRandomSpell();
        spellSet.add(spell.typeid);
      }
      
      item.teaches = Array.from(spellSet);
      item.quality = 'magical';
    } else {
      const spell = this.spellFactory.getRandomSpell();
      item.teaches = [spell.typeid];
      item.quality = 'magical';
      item.name = `Scroll of ${spell.name}`;
    }
  }

  private mutateMagicalProperties(item: ItemModel): void {
    const pool = [
      { suffix: 'Vitality', prop: 'bonusHealth', val: d10() },
      { suffix: 'Accuracy', prop: 'plusHit', val: Math.floor(d10() / 2) },
      { suffix: 'Protection', prop: 'plusArmor', val: Math.floor(d10() / 2) },
      { suffix: 'Energy', prop: 'bonusMana', val: d10() },
      { suffix: 'Power', prop: 'plusDamage', val: Math.floor(d10() / 2) }
    ];

    const roll = d100();
    let affixCount = 1;
    if (roll === 100) affixCount = 5;
    else if (roll >= 91) affixCount = 3;
    else if (roll >= 71) affixCount = 2;

    const selectedAffixes = [];
    for (let i = 0; i < affixCount; i++) {
      const index = rollDice(1, pool.length) - 1;
      selectedAffixes.push(pool.splice(index, 1)[0]);
    }

    selectedAffixes.forEach(affix => {
      (item as any)[affix.prop] = ((item as any)[affix.prop] || 0) + affix.val;
    });

    const names = selectedAffixes.map(a => a.suffix);
    if (affixCount === 1) item.name += ` of ${names[0]}`;
    else if (affixCount === 2) item.name += ` of the Hero`;
    else if (affixCount === 3) item.name += ` of the Legend`;
    else if (affixCount === 5) item.name += ` of the Gods`;
  }

  private createFallbackItem(typeid: string): ItemModel {
    return new ItemModel({
      typeid: 'broken-item',
      name: `Unknown Item (${typeid})`,
      type: 'Trinket',
      equippableLocation: 'none',
      baseCost: 4,
    });
  }
}