import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { CharacterModel } from './character.model';
import { ItemModel } from '../item/item.model';
import { applyItemAcquisition, applyBonusCalculation, applyCombatRatingCalculation } from './rules/character.rules';
import { CharacterFactory } from './character.factory';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterRegistry: Map<string, CharacterModel> = new Map();
  private charactersInRoom: WritableSignal<Map<string, CharacterModel>> = signal(new Map());
  private characterFactory = inject(CharacterFactory);
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

  enemiesInRoom(): Signal<CharacterModel[]> {
    return computed(() => {
      return Array.from(this.charactersInRoom().values())
        .filter(occupant => occupant.id !== this.playerCharacterId)
        .sort((enemyAlpha, enemyBeta) => {
          if (enemyAlpha.isDead !== enemyBeta.isDead) {
            return enemyAlpha.isDead ? 1 : -1;
          }
          return enemyAlpha.currentHealth - enemyBeta.currentHealth;
        });
    });
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

  spawnCharacter(type = 'enemy', name?: string): Signal<CharacterModel> {
    const character = this.characterFactory.createCharacter(type, name);
    this.registerCharacter(character, type === 'player');
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