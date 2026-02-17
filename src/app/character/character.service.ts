import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { CharacterModel } from './character.model';
import { ItemFactory } from '../item/item.factory';
import { ItemModel } from '../item/item.model';
import { NameService } from '../services/name.service';
import { d100, pickRandom } from '../utilities/dice.definitions';
import { ENEMY_TEMPLATES } from './character.definitions';
import { SpellFactory } from '../spell/spell.factory';
import { applyItemAcquisition, applyBonusCalculation, applyCombatRatingCalculation, equipCharacter } from './rules/character.rules';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterRegistry: Map<string, CharacterModel> = new Map();
  private charactersInRoom: WritableSignal<Map<string, CharacterModel>> = signal(new Map());
  private itemFactory = inject(ItemFactory);
  private spellFactory = inject(SpellFactory);
  private nameService = inject(NameService);
  playerCharacterId?: string;
  private readonly MAX_BACKPACK_SIZE = 10;

  acquireItem(characterId: string, items: ItemModel[]): boolean {
    const character = this.charactersInRoom().get(characterId);
    if (!character) return false;

    const { acquired } = applyItemAcquisition(character, items, this.MAX_BACKPACK_SIZE);

    applyCombatRatingCalculation(character);
    if (acquired) {
      this.charactersInRoom.update(registry => new Map(registry).set(characterId, character));
    }

    return acquired;
  }

  equipItem(characterId: string, item: ItemModel): string[] {
    const character = this.charactersInRoom().get(characterId);
    if (!character) return ['Character not found.'];

    const slot: string = item.equippableLocation ?? 'none';
    if (slot === 'none') return [`The ${item.name} cannot be equipped.`];

    const results: string[] = [];
    const existingItem = character.equipment.get(slot);

    if (existingItem) {
      character.items.push(existingItem);
      results.push(`You unequip the ${existingItem.name}.`);
    }
    character.equipment.set(slot, item);
    character.items = character.items.filter(inventoryItem => inventoryItem !== item);

    results.push(`You equip the ${item.name}.`);
    applyBonusCalculation(character);
    this.updateCharacter(character);

    return results;
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

    this.charactersInRoom.update(currentRegistry =>
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
      const classifyCheck = d100();
      const classification = classifyCheck <= 1 ? 'unique' : classifyCheck <= 10 ? 'elite' : 'normal';
      characterTemplate = pickRandom(ENEMY_TEMPLATES);
      if (classification === 'unique') {
        characterTemplate = {
          ...characterTemplate,
          name: characterName,
          baseHealth: Math.round(characterTemplate.health * 1.2),
          baseMana: Math.round(characterTemplate.mana * 1.2),
          named: true,
          classification
        };
      } else if (classification === 'elite') {
        characterTemplate = {
          ...characterTemplate,
          name: `Elite ${characterTemplate.name}`,
          baseHealth: Math.round(characterTemplate.health * 1.4),
          baseMana: Math.round(characterTemplate.mana * 1.4),
          classification
        };
      }
    } else {
      characterTemplate = {
        name: characterName, baseHealth: 30,
        baseMana: 50, typeid: 'player'
      } as any;
    }
    const character = new CharacterModel(
      characterTemplate.name, characterTemplate.health,
      characterTemplate.mana, characterTemplate);
    this.seedSpells(character, characterTemplate);
    console.log(characterTemplate);
    this.registerCharacter(character, type === 'player');
    equipCharacter(character, this.itemFactory, characterTemplate);
    console.log(character)
    return computed(() => character);
  }

  registerCharacter(character: CharacterModel, isPlayer = false): void {
    this.characterRegistry.set(character.id, character);
    this.charactersInRoom.update((registry) => {
      const nextRegistry = new Map(registry);
      nextRegistry.set(character.id, character);
      return nextRegistry;
    });

    if (isPlayer) this.playerCharacterId = character.id;
  }

  public updateCharacter(character: CharacterModel): void {
    this.charactersInRoom.update(registry => {
      const updatedRegistry = new Map(registry);
      updatedRegistry.set(character.id, character);
      return updatedRegistry;
    });
  }

  getCharacterById(id: string): CharacterModel | undefined {
    return this.charactersInRoom().get(id);
  }

  public getActiveEnemies(): CharacterModel[] {
    return Array.from(this.charactersInRoom().values()).filter(character =>
      character.id !== this.playerCharacterId &&
      !character.isDead
    );
  }

  public getCharactersInRoom(): CharacterModel[] {
    return Array.from(this.charactersInRoom().values());
  }

  getPlayer(): Signal<CharacterModel | undefined> {
    return computed(() => {
      const id = this.playerCharacterId;
      return id ? this.charactersInRoom().get(id) : undefined;
    });
  }

  public movePlayer(coordinates: { x: number, y: number, z: number; }): void {
    const id = this.playerCharacterId;
    if (!id) return;

    const character = this.charactersInRoom().get(id);
    if (character) {
      character.roomCoordinatesKey = `${coordinates.x},${coordinates.y},${coordinates.z}`;

      this.charactersInRoom.update(registry => new Map(registry).set(id, character));
    }
  }
}