import { Component } from '@angular/core';
import { ITEM_TEMPLATES } from '../item/item.definitions';
import { SPELL_TEMPLATES } from '../spell/spell.definitions';
import { ENEMY_TEMPLATES } from '../character/character.definitions';
import { FEATURE_TEMPLATES } from '../feature/feature.definitions';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, JsonPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  activeTab = 'items';
  showJson = false;

  tabChanged: (newTab: string) => void = () => {};

  changeTab(tab: string) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.selectedTypes.clear();
    this.tabChanged(tab);
  }

  items: any[] = [...ITEM_TEMPLATES];
  spells: any[] = [...SPELL_TEMPLATES];
  enemies: any[] = [...ENEMY_TEMPLATES];
  features: any[] = [...FEATURE_TEMPLATES];

  selectedTypes: Set<string> = new Set();
  newData: any = {};
  editRow: number | null = null;

  itemColumns = [
    'typeid', 'name', 'type', 'quantity', 'quality', 'equippableLocation', 'damage',
    'plusHit', 'plusDamage', 'plusArmor', 'resilience',
    'bonusHealth', 'bonusMana', 'heals', 'restores', 'useMessages', 'teaches', 'baseCr'
  ];

  spellColumns = [
    'typeid', 'name', 'type', 'effect', 'damage', 'healsUser', 'manaCost', 'castMessages'
  ];

  enemiesColumns = [
    'typeid', 'name', 'type', 'baseHealth', 'baseMana', 'equippedItemTemplate', 'combatRating'
  ];

  edit(row: any, index: number) {
    this.newData = { ...row };
    this.editRow = index;
  }

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
      case 'spells': return this.spellColumns;
      case 'enemies': return this.enemiesColumns;
      default: return Object.keys(this.currentData[0] || {});
    }
  }

  get currentJson() {
    return JSON.stringify(this.currentData, null, 2);
  }

  getValue(row: any, column: string): any {
    if (column === 'baseCr' && !row.baseCr) {
      if (this.activeTab === 'items') {
        row.baseCr = this.calculateItemCR(row);
      } else if (this.activeTab === 'spells') {
        row.baseCr = this.calculateSpellCR(row);
      }
    }

    if (column === 'combatRating' && !row.combatRating) {
      row.combatRating = this.calculateTemplateCR(row, SPELL_TEMPLATES);
    }

    if (column === 'type') {
      if (row.school) {
        row.type = row.school;
        delete (row.school);
      } else if (!row.type && row.typeid) {
        row.type = row.typeid.includes('humanoid') ? 'Humanoid' : 'Beast';
      }
    }

    console.log(row);
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

  addRow(editRow?: Boolean) {
    if (editRow) {
      switch (this.activeTab) {
        case 'items': this.items[this.editRow!] = this.newData; break;
        case 'spells': this.spells[this.editRow!] = this.newData; break;
        case 'enemies': this.enemies[this.editRow!] = this.newData; break;
        case 'features': this.features[this.editRow!] = this.newData; break;
      }
    } else {
      switch (this.activeTab) {
        case 'items': this.items.push(this.newData); break;
        case 'spells': this.spells.push(this.newData); break;
        case 'enemies': this.enemies.push(this.newData); break;
        case 'features': this.features.push(this.newData); break;
      }
    }
    this.newData = {};
    this.editRow = null;
  }

  calculateItemCR(item: any): number {
    let cr = 0;

    cr += (item.damage ?? 0) * 0.5;
    cr += (item.plusHit ?? 0);
    cr += (item.plusDamage ?? 0);
    cr += (item.plusArmor ?? 0);
    cr += (item.bonusHealth ?? 0) * 0.1;
    cr += (item.bonusMana ?? 0) * 0.1;
    cr += (item.heals ?? 0) * 0.3;
    cr += (item.restores ?? 0) * 0.3;

    return Math.round(cr * 10) / 10;
  }

  calculateSpellCR(spell: any): number {
    let cr = 0;

    cr += (spell.damage ?? 0) * 0.3;
    cr += (spell.healsUser ?? 0) * 0.15;

    if (spell.effect === 'area') {
      cr *= 1.5;
    } else if (spell.effect === 'additional-target') {
      cr *= 1.3;
    } else if (spell.effect === 'vampiric') {
      cr *= 1.2;
    }

    return Math.round(cr * 10) / 10;
  }

  calculateTemplateCR(enemyTemplate: any, spellTemplates: any[], itemTemplates?: any[]): number {
    const healthComponent = (enemyTemplate.baseHealth ?? 0) / 10;
    const manaComponent = ((enemyTemplate.baseMana ?? 0) / 10) * 3;

    let weaponCR = 0;
    if (enemyTemplate.equippedItemTemplate) {
      weaponCR = this.calculateItemCR(enemyTemplate.equippedItemTemplate);
    }

    let spellCR = 0;
    if (enemyTemplate.spellTypeids && enemyTemplate.spellTypeids.length > 0) {
      const spells = enemyTemplate.spellTypeids.map((typeId: string) =>
        spellTemplates.find(s => s.typeid === typeId)
      ).filter(Boolean);

      const totalSpellCR = spells.reduce((sum: any, spell: any) => sum + this.calculateSpellCR(spell), 0);
      spellCR = totalSpellCR / spells.length;
    }

    const physicalCR = weaponCR + healthComponent;
    const magicalCR = manaComponent + spellCR + healthComponent;

    return Math.round(Math.max(physicalCR, magicalCR));
  }

  toggleJson() {
    this.showJson = !this.showJson;
  }
}