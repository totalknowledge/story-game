import { Component } from '@angular/core';
import { ITEM_TEMPLATES } from '../item/item.definitions';
import { SPELL_TEMPLATES } from '../spell/spell.definitions';
import { ENEMY_TEMPLATES } from '../character/character.definitions';
import { FEATURE_TEMPLATES } from '../feature/feature.definitions';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  activeTab = 'items';
  showJson = false;

  items = [...ITEM_TEMPLATES];
  spells = [...SPELL_TEMPLATES];
  enemies = [...ENEMY_TEMPLATES];
  features = [...FEATURE_TEMPLATES];

  selectedTypes: Set<string> = new Set();

  itemColumns = [
    'typeid', 'name', 'type', 'quantity', 'equippableLocation', 'damage',
    'plusHit', 'plusDamage', 'plusArmor', 'resilience',
    'bonusHealth', 'bonusMana', 'heals', 'restores', "cost", "useMessages", "teaches"
  ];

  get availableTypes(): string[] {
    const types = new Set<string>();
    this.currentAllData.forEach(item => {
      if (item.type) types.add(item.type);
    });
    return Array.from(types).sort();
  }

  get currentAllData() {
    switch (this.activeTab) {
      case 'items': return this.items;
      case 'spells': return this.spells;
      case 'enemies': return this.enemies;
      case 'features': return this.features;
      default: return [];
    }
  }

  get currentData() {
    if (this.selectedTypes.size === 0) return this.currentAllData;
    return this.currentAllData.filter(item => this.selectedTypes.has(item.type));
  }

  get currentColumns() {
    switch (this.activeTab) {
      case 'items': return this.itemColumns;
      default: return Object.keys(this.currentData[0] || {});
    }
  }

  get currentJson() {
    return JSON.stringify(this.currentData, null, 2);
  }

  getValue(row: any, column: string): any {
    if (column === 'cost' && !row.cost) {
      row.cost = this.calculateCost(row);
    }
    return row[column] ?? '';
  }

  toggleType(type: string) {
    if (this.selectedTypes.has(type)) {
      this.selectedTypes.delete(type);
    } else {
      this.selectedTypes.add(type);
    }
  }

  isTypeSelected(type: string): boolean {
    return this.selectedTypes.has(type);
  }

  copyJsonToClipboard() {
    navigator.clipboard.writeText(this.currentJson);
  }

  addRow() {
    const newRow = { typeid: 'new-item', name: 'New Item' };
    /* switch(this.activeTab) {
      case 'items': this.items.push(newRow); break;
      case 'spells': this.spells.push(newRow); break;
      case 'enemies': this.enemies.push(newRow); break;
      case 'features': this.features.push(newRow); break;
    } */
  }

  calculateCost(item: any): number {
    let cost = 0;

    cost += (item.damage ?? 0) * 5;
    cost += (item.plusHit ?? 0) * 10;
    cost += (item.plusDamage ?? 0) * 10;
    cost += (item.plusArmor ?? 0) * 10;
    cost += (item.bonusHealth ?? 0) * 2;
    cost += (item.bonusMana ?? 0) * 2;
    cost += (item.heals ?? 0) * 3;
    cost += (item.restores ?? 0) * 3;

    return Math.max(1, cost);
  }

  toggleJson() {
    this.showJson = !this.showJson;
  }
}