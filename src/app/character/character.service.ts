import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { CharacterModel } from './character.model';
import { ItemModel } from '../item/item.model';
import { applyItemAcquisition, applyBonusCalculation, applyCombatRatingCalculation, applyEquipItem, stackConsumableItem } from './rules/character.rules';
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

  public acquireItem(characterId: string, items: ItemModel[]): boolean {
    const character = this.characterRegistry.get(characterId);
    if (!character) return false;

    const isPlayerCharacter = character.id === this.playerCharacterId || (character.typeid ?? '').startsWith('player');
    const naturalItems = isPlayerCharacter ? items.filter(item => item?.type === 'Natural') : [];
    const regularItems = isPlayerCharacter ? items.filter(item => item?.type !== 'Natural') : items;

    const { acquired } = applyItemAcquisition(character, regularItems, this.MAX_BACKPACK_SIZE);
    let acquiredAny = acquired;

    if (isPlayerCharacter && naturalItems.length > 0) {
      for (const natItem of naturalItems) {
        if ((natItem.maxStack ?? 0) > 1) {
          const stacked = stackConsumableItem(character, natItem, this.MAX_BACKPACK_SIZE);
          acquiredAny = acquiredAny || stacked;
        } else {
          if (character.items.length < this.MAX_BACKPACK_SIZE) {
            character.items.push(natItem);
            acquiredAny = true;
          }
        }
      }
    }

    if (acquiredAny) {
      this.updateCharacter(character);
    }

    return acquiredAny;
  }

  public enemiesInRoom(): Signal<CharacterModel[]> {
    return computed(() => {
      const occupants = new Map(this.charactersInRoom());
      occupants.delete(this.playerCharacterId ?? '');

      return Array.from(occupants.values()).sort((alpha, beta) =>
        Number(alpha.isDead) - Number(beta.isDead) ||
        alpha.currentHealth - beta.currentHealth
      );
    });
  }

  public enemiesInRoomEntities(): CharacterModel[] {
    const enemies = this.enemiesInRoom();
    return enemies();
  }

  public equipItem(characterId: string, item: ItemModel): string[] {
    const character = this.getCharacterById(characterId);
    if (!character) return ['Character not found.'];

    const isPlayerCharacter = character.id === this.playerCharacterId || (character.typeid ?? '').startsWith('player');
    if (isPlayerCharacter && item.type === 'Natural') {
      return [`You cannot equip natural anatomy like ${item.name}.`];
    }

    const slot = item.equippableLocation;
    if (!slot || slot === 'none') return [`The ${item.name} cannot be equipped.`];

    const results: string[] = [];
    const existingItem = character.equipment.get(slot);
    const success = applyEquipItem(character, item);

    if (success) {
      if (existingItem) results.push(`You unequip the ${existingItem.name}.`);
      results.push(`You equip the ${item.name}.`);
      this.updateCharacter(character);
    } else {
      results.push(`You cannot equip the ${item.name} right now.`);
    }

    return results;
  }

  public getActiveEnemies(): CharacterModel[] {
    return this.enemiesInRoomEntities().filter(enemy => !enemy.isDead);
  }

  public getCharacterById(id: string): CharacterModel | undefined {
    return this.characterRegistry.get(id);
  }

  public getCharactersInRoom(): CharacterModel[] {
    return Array.from(this.charactersInRoom().values());
  }

  public getFlatCurrencyAmount(character: CharacterModel): number {
    const money = character.money;
    return (money.gold * 100) + (money.silver * 10) + money.copper;
  }

  public getPlayer(): Signal<CharacterModel | undefined> {
    return computed(() => {
      const id = this.playerCharacterId;
      return id ? this.charactersInRoom().get(id) : undefined;
    });
  }

  public getPlayerEntity(): CharacterModel | undefined {
    return this.characterRegistry.get(this.playerCharacterId!);
  }

  public loadRoomCharacters(roomEnemyIds: string[], newlySpawned: CharacterModel[]): void {
    const roomMap = new Map<string, CharacterModel>();
    const player = this.getPlayerEntity();

    if (player) {
      roomMap.set(player.id!, player);
    }

    roomEnemyIds.forEach(id => {
      const existingInhabitant = this.characterRegistry.get(id);
      if (existingInhabitant) {
        roomMap.set(id, existingInhabitant);
      }
    });

    newlySpawned.forEach(spawnedEnemy => {
      this.characterRegistry.set(spawnedEnemy.id!, spawnedEnemy);
      roomMap.set(spawnedEnemy.id!, spawnedEnemy);
    });

    this.charactersInRoom.set(roomMap);
  }

  public moveCharacter(coordinatesKey: string, characterId = this.playerCharacterId!): void {
    const character = this.characterRegistry.get(characterId);
    if (character) {
      character.roomCoordinatesKey = coordinatesKey;
      this.updateCharacter(character);
    }
  }

  public registerCharacter(character: CharacterModel, isPlayer = false): void {
    if (isPlayer) this.playerCharacterId = character.id;
    this.updateCharacter(character);
  }

  public spawnCharacter(type = 'enemy', name?: string, targetCR?: number): CharacterModel {
    const character = this.characterFactory.createCharacter(type, name, targetCR);
    this.registerCharacter(character, type === 'player');
    return character;
  }

  public updateCharacter(character: CharacterModel): void {
    applyBonusCalculation(character);
    applyCombatRatingCalculation(character);

    this.characterRegistry.set(character.id!, character);

    this.charactersInRoom.update(inRoomCharacters => {
      const updatedRegistry = new Map(inRoomCharacters);
      updatedRegistry.set(character.id!, character);
      return updatedRegistry;
    });
  }

  public updateMoneyFromFlat(character: CharacterModel, totalCopper: number): void {
    const gold = Math.floor(totalCopper / 100);
    const silver = Math.floor((totalCopper % 100) / 10);
    const copper = totalCopper % 10;

    character.money = { gold, silver, copper };
    this.updateCharacter(character);
  }
}