import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { CharacterModel } from './character.model';
import { ItemFactory } from '../item/item.factory';
import { ItemModel } from '../item/item.model';
import { NameService } from '../services/name.service';
import { pickRandom } from '../utilities/dice.definitions';
import { ENEMY_TEMPLATES } from './character.definitions';
import { SpellFactory } from '../spell/spell.factory';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterRegistry = signal<Map<string, CharacterModel>>(new Map());
  private itemFactory = inject(ItemFactory);
  private spellFactory = inject(SpellFactory);
  private nameService = inject(NameService);
  readonly playerCharacterId = signal<string | null>(null);
  private readonly MAX_BACKPACK_SIZE = 10;

  acquireItem(characterId: string, items: ItemModel[]): boolean {
    const character = this.characterRegistry().get(characterId);
    if (!character) return false;

    let acquired = false;

    for (const item of items) {
      if (this.equipItem(characterId, item)) {
        acquired = true;
        continue;
      }

      if (character.items.length < this.MAX_BACKPACK_SIZE) {
        character.items.push(item);
        acquired = true;
      }
    }

    return acquired;
  }

  calculateBonuses(characterId: string): void {
    const character = this.characterRegistry().get(characterId);
    if (!character) return;

    let toHit = 0;
    let toDamage = 0;
    let armor = 0;
    let bonusHealth = 0;
    let bonusMana = 0;

    for (const item of character.equipment.values()) {
      toHit += item?.plusHit ?? 0;
      toDamage += item?.plusDamage ?? 0;
      armor += item?.plusArmor ?? 0;

      bonusHealth += item?.bonusHealth ?? 0;
      bonusMana += item?.bonusMana ?? 0;
    }

    character.toHit = toHit;
    character.toDamage = toDamage;
    character.armor = armor;

    character.maxHealth = character.baseHealth + bonusHealth;
    character.maxMana = character.baseMana + bonusMana;
    this.characterRegistry().set(characterId, character);
  }

  equipItem(characterId: string, item: ItemModel): boolean {
    const character = this.characterRegistry().get(characterId);
    if (!character) return false;

    const slot = item.equippableLocation;
    if (slot === 'none' || character.equipment.has(slot)) return false;

    character.equipment.set(slot, item);
    character.items = character.items.filter(i => i !== item);
    this.calculateBonuses(characterId);
    return true;
  }

  public learnSpells(characterId: string, characterTemplate?: any): void {
    const character = this.characterRegistry().get(characterId);
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
      const randomSpell = this.spellFactory.getRandomSpell(Math.round(character.baseMana/3));
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
        ? this.nameService.getHeroName()
        : this.nameService.getEnemyName());
    if (type === 'enemy') {
      characterTemplate = pickRandom(ENEMY_TEMPLATES);
    } else {
      characterTemplate = {
        name: characterName, baseHealth: 30,
        baseMana: 30, typeid: 'player'
      } as any;
    }
    console.log(characterTemplate);
    const character = new CharacterModel(
      characterTemplate.name, characterTemplate.health,
      characterTemplate.mana, characterTemplate);
    this.registerCharacter(character, type === 'player');

    this.learnSpells(character.id, characterTemplate);
    this.equipCharacter(type, character);
    console.log(character);
    return computed(() => character);
  }

  equipCharacter(type: string, character: CharacterModel): void {
    const items: ItemModel[] = [this.itemFactory.createRandomItem(['Weapon'])];

    if (items[0].typeid === 'weapon-bow-short') {
      items.push(this.itemFactory.createItem('ammo-arrows'));
    }

    items.push(this.itemFactory.createRandomItem(['Armor']));
    items.push(this.itemFactory.createRandomItem(['Consumable']));

    this.acquireItem(character.id, items);
  }

  registerCharacter(character: CharacterModel, isPlayer = false): void {
    this.characterRegistry.update((registry) => {
      const nextRegistry = new Map(registry);
      nextRegistry.set(character.id, character);
      return nextRegistry;
    });

    if (isPlayer) this.playerCharacterId.set(character.id);
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
    const playerCharacterId = this.playerCharacterId();

    return Array.from(this.characterRegistry().values()).filter(character =>
      character.id !== playerCharacterId &&
      !character.isDead
    );
  }

  getPlayer(): Signal<CharacterModel | undefined> {
    return computed(() => {
      const id = this.playerCharacterId();
      return id ? this.characterRegistry().get(id) : undefined;
    });
  }
}