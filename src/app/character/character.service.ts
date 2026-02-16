import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { CharacterModel } from './character.model';
import { ItemFactory } from '../item/item.factory';
import { ItemModel } from '../item/item.model';
import { NameService } from '../services/name.service';
import { pickRandom } from '../utilities/dice.definitions';
import { ENEMY_TEMPLATES } from './character.definitions';
import { SpellFactory } from '../spell/spell.factory';
import { applyItemAcquisition, applyBonusCalculation, applyCombatRatingCalculation } from './rules/character.rules';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterRegistry = signal<Map<string, CharacterModel>>(new Map());
  private itemFactory = inject(ItemFactory);
  private spellFactory = inject(SpellFactory);
  private nameService = inject(NameService);
  playerCharacterId?: string;
  private readonly MAX_BACKPACK_SIZE = 10;

  acquireItem(characterId: string, items: ItemModel[]): boolean {
    const character = this.characterRegistry().get(characterId);
    if (!character) return false;

    const { acquired } = applyItemAcquisition(character, items, this.MAX_BACKPACK_SIZE);

    applyCombatRatingCalculation(character);
    if (acquired) {
      this.characterRegistry.update(registry => new Map(registry).set(characterId, character));
    }

    return acquired;
  }

  equipItem(characterId: string, item: ItemModel): boolean {
    const character = this.characterRegistry().get(characterId);
    if (!character) return false;

    const slot = item.equippableLocation;
    if (slot === 'none' || character.equipment.has(slot)) return false;

    character.equipment.set(slot, item);
    character.items = character.items.filter(i => i !== item);
    applyBonusCalculation(character);
    return true;
  }

  public seedSpells(character: CharacterModel, characterTemplate?: any): void {
    if (!character) return;

    const minimumSpellCount = Math.ceil((character.baseMana || 0) / 10);
    const existingSpellIds = new Set(character.spells.map(spell => spell.typeid));

    if (characterTemplate?.spellTypeids && Array.isArray(characterTemplate.spellTypeids)) {
      characterTemplate.spellTypeids.forEach((spellId: string) => {
        if (!existingSpellIds.has(spellId)) {
          character.spells.push(this.spellFactory.createSpell(spellId));
          existingSpellIds.add(spellId);
        }
      });
    }

    while (character.spells.length < minimumSpellCount) {
      const randomSpell = this.spellFactory.getRandomSpell(Math.round(character.baseMana / 3));
      if (!existingSpellIds.has(randomSpell.typeid)) {
        character.spells.push(randomSpell);
        existingSpellIds.add(randomSpell.typeid);
      }
    }

    this.characterRegistry.update(currentRegistry =>
      new Map(currentRegistry).set(character.id, character)
    );
  }

  spawnCharacter(type = 'enemy', name?: string): Signal<CharacterModel> {
    let characterTemplate: any;
    const characterName =
      name ??
      (type === 'player'
        ? this.nameService.getHeroName('male').name
        : this.nameService.getEnemyName().name);
    if (type === 'enemy') {
      characterTemplate = pickRandom(ENEMY_TEMPLATES);
    } else {
      characterTemplate = {
        name: characterName, baseHealth: 30,
        baseMana: 10, typeid: 'player'
      } as any;
    }
    const character = new CharacterModel(
      characterTemplate.name, characterTemplate.health,
      characterTemplate.mana, characterTemplate);
    this.seedSpells(character, characterTemplate);

    this.registerCharacter(character, type === 'player');
    this.equipCharacter(character, characterTemplate);
    console.log(`Spawned ${type}:`, character);
    return computed(() => character);
  }

  equipCharacter(character: CharacterModel, characterTemplate?: any): void {
    const items: ItemModel[] = [];

    if (characterTemplate?.equippedItemTemplate) {
      const naturalWeapon = new ItemModel({
        ...characterTemplate.equippedItemTemplate,
        equippableLocation: 'right-hand',
        isNatural: true
      });
      items.push(naturalWeapon);
    } else {
      items.push(this.itemFactory.createRandomItem(['Weapon']));
    }

    const lootCount = this.randomInt(0, Math.ceil(character.maxHealth / 10));

    for (let i = 0; i < lootCount; i++) {
      items.push(this.itemFactory.createRandomItem(['Weapon', 'Armor', 'Consumable']));
    }

    if (items[0]?.typeid === 'weapon-bow-short') {
      items.push(this.itemFactory.createItem('ammo-arrows'));
    }

    this.acquireItem(character.id, items);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  registerCharacter(character: CharacterModel, isPlayer = false): void {
    this.characterRegistry.update((registry) => {
      const nextRegistry = new Map(registry);
      nextRegistry.set(character.id, character);
      return nextRegistry;
    });

    if (isPlayer) this.playerCharacterId = character.id;
  }

  public updateCharacter(character: CharacterModel): void {
    this.characterRegistry.update(registry => {
      const updatedRegistry = new Map(registry);
      updatedRegistry.set(character.id, character);
      return updatedRegistry;
    });
  }

  getCharacterById(id: string): CharacterModel | undefined {
    return this.characterRegistry().get(id);
  }

  public getActiveEnemies(): CharacterModel[] {
    return Array.from(this.characterRegistry().values()).filter(character =>
      character.id !== this.playerCharacterId &&
      !character.isDead
    );
  }

  getPlayer(): Signal<CharacterModel | undefined> {
    return computed(() => {
      const id = this.playerCharacterId;
      return id ? this.characterRegistry().get(id) : undefined;
    });
  }
}