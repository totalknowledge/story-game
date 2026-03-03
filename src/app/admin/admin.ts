import { Component } from '@angular/core';
import { ITEM_TEMPLATES } from '../item/item.definitions';
import { SPELL_TEMPLATES } from '../spell/spell.definitions';
import { ENEMY_TEMPLATES } from '../character/character.definitions';
import { FEATURE_TEMPLATES } from '../feature/feature.definitions';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { calculateCombatRating } from '../utilities/combat.definitions';

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
    'typeid', 'name', 'type', 'quantity', 'excludeFromRandom', 'quality', 'equippableLocation', 'damage',
    'plusHit', 'plusDamage', 'plusArmor', 'resilience',
    'bonusHealth', 'bonusMana', 'heals', 'restores', 'useMessages', 'teaches', 'baseCr'
  ];

  spellColumns = [
    'typeid', 'name', 'type', 'effect', 'damage', 'healsUser', 'manaCost', 'castMessages', 'combatRating'
  ];

  enemiesColumns = [
    'typeid', 'name', 'type', 'baseHealth', 'baseMana', 'equippedItemTemplate', 'combatRating'
  ];

  edit(row: any, index: number) {
    const sourceIndex = this.currentAllData.indexOf(row);
    this.newData = { ...row };
    this.editRow = sourceIndex >= 0 ? sourceIndex : index;
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
    const filtered = this.selectedTypes.size === 0
      ? [...this.currentAllData]
      : this.currentAllData.filter(item => this.selectedTypes.has(item.type));

    return filtered.sort((left, right) => this.compareRows(left, right));
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
      if (this.activeTab === 'spells') {
        row.combatRating = this.calculateSpellCR(row);
      } else {
        row.combatRating = this.calculateTemplateCR(row, SPELL_TEMPLATES);
      }
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
    const normalizedData = this.normalizeRowTypes(this.newData);

    if (editRow) {
      switch (this.activeTab) {
        case 'items': this.items[this.editRow!] = normalizedData; break;
        case 'spells': this.spells[this.editRow!] = normalizedData; break;
        case 'enemies': this.enemies[this.editRow!] = normalizedData; break;
        case 'features': this.features[this.editRow!] = normalizedData; break;
      }
    } else {
      switch (this.activeTab) {
        case 'items': this.items.push(normalizedData); break;
        case 'spells': this.spells.push(normalizedData); break;
        case 'enemies': this.enemies.push(normalizedData); break;
        case 'features': this.features.push(normalizedData); break;
      }
    }
    this.newData = {};
    this.editRow = null;
  }

  calculateItemCR(item: any): number {
    if (Array.isArray(item)) {
      const total = item.reduce((sum: number, current: any) =>
        sum + calculateCombatRating({
          terms: {
            plusHit: current.plusHit,
            plusDamage: current.plusDamage,
            damage: current.damage,
            plusArmor: current.plusArmor,
            bonusHealth: current.bonusHealth,
            minusToBeHit: current.minusToBeHit,
            bonusMana: current.bonusMana,
            heals: current.heals,
            restores: current.restores,
            teachesCount: current.teaches?.length ?? 0,
          },
          round: (value) => value,
        }), 0);
      return Math.round(total * 10) / 10;
    }

    const value = calculateCombatRating({
      terms: {
        plusHit: item.plusHit,
        plusDamage: item.plusDamage,
        damage: item.damage,
        plusArmor: item.plusArmor,
        bonusHealth: item.bonusHealth,
        minusToBeHit: item.minusToBeHit,
        bonusMana: item.bonusMana,
        heals: item.heals,
        restores: item.restores,
        teachesCount: item.teaches?.length ?? 0,
      },
      round: (result) => result,
    });

    return Math.round(value * 10) / 10;
  }

  calculateSpellCR(spell: any): number {
    const effectMultipliers: Record<string, number> = {
      area: 1.5,
      'additional-target': 1.3,
      vampiric: 1.2,
    };

    const value = calculateCombatRating({
      terms: {
        spellDamage: spell.damage,
        spellHealsUser: spell.healsUser,
      },
      multiplier: effectMultipliers[spell.effect] ?? 1,
      round: (result) => result,
    });

    return Math.round(value * 10) / 10;
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

    const physicalCR = calculateCombatRating({
      terms: {
        avgWeaponDamage: weaponCR,
        healthComponent,
      },
      round: (value) => value,
    });

    const magicalCR = calculateCombatRating({
      terms: {
        manaComponent,
        avgSpellDamage: spellCR,
        healthComponent,
      },
      round: (value) => value,
    });

    return Math.round(Math.max(physicalCR, magicalCR));
  }

  toggleJson() {
    this.showJson = !this.showJson;
  }

  private compareRows(left: any, right: any): number {
    const typeCompare = this.getTypeForSort(left).localeCompare(this.getTypeForSort(right));
    if (typeCompare !== 0) return typeCompare;

    const leftCombatRating = this.getCombatRatingForSort(left);
    const rightCombatRating = this.getCombatRatingForSort(right);

    if (leftCombatRating !== null && rightCombatRating !== null && leftCombatRating !== rightCombatRating) {
      return rightCombatRating - leftCombatRating;
    }

    return this.getNameForSort(left).localeCompare(this.getNameForSort(right));
  }

  private getTypeForSort(row: any): string {
    if (row.type) return String(row.type);
    if (row.school) return String(row.school);
    if (row.typeid) return row.typeid.includes('humanoid') ? 'Humanoid' : 'Beast';
    return '';
  }

  private getCombatRatingForSort(row: any): number | null {
    if (this.activeTab === 'items') {
      if (row.baseCr === undefined || row.baseCr === null) {
        row.baseCr = this.calculateItemCR(row);
      }
      return Number(row.baseCr);
    }

    if (this.activeTab === 'spells') {
      if (row.baseCr === undefined || row.baseCr === null) {
        row.baseCr = this.calculateSpellCR(row);
      }
      return Number(row.baseCr);
    }

    if (this.activeTab === 'enemies') {
      if (row.combatRating === undefined || row.combatRating === null) {
        row.combatRating = this.calculateTemplateCR(row, SPELL_TEMPLATES);
      }
      return Number(row.combatRating);
    }

    return null;
  }

  private getNameForSort(row: any): string {
    return String(row.name ?? '');
  }

  private normalizeRowTypes(row: any): any {
    const normalized: Record<string, any> = {};

    Object.entries(row ?? {}).forEach(([key, value]) => {
      const referenceValue = this.getReferenceValueForKey(key);
      const normalizedValue = this.normalizeValueByReference(value, referenceValue);

      if (normalizedValue !== undefined) {
        normalized[key] = normalizedValue;
      }
    });

    return normalized;
  }

  private getReferenceValueForKey(key: string): any {
    for (const row of this.currentAllData) {
      if (row && key in row && row[key] !== undefined && row[key] !== null) {
        return row[key];
      }
    }

    return undefined;
  }

  private normalizeValueByReference(rawValue: any, referenceValue: any): any {
    if (typeof rawValue !== 'string') {
      return rawValue;
    }

    if (referenceValue === undefined) {
      return rawValue;
    }

    const trimmed = rawValue.trim();

    if (typeof referenceValue === 'number') {
      if (!trimmed) return undefined;
      const parsedNumber = Number(trimmed);
      return Number.isFinite(parsedNumber) ? parsedNumber : rawValue;
    }

    if (typeof referenceValue === 'boolean') {
      if (!trimmed) return undefined;
      const normalized = trimmed.toLowerCase();
      if (normalized === 'true' || normalized === '1') return true;
      if (normalized === 'false' || normalized === '0') return false;
      return rawValue;
    }

    if (Array.isArray(referenceValue)) {
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : rawValue;
      } catch {
        return rawValue;
      }
    }

    if (typeof referenceValue === 'object') {
      if (!trimmed) return {};
      try {
        const parsed = JSON.parse(rawValue);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : rawValue;
      } catch {
        return rawValue;
      }
    }

    return rawValue;
  }
}