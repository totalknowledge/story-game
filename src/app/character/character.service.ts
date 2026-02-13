import { inject, Injectable, signal } from '@angular/core';
import { CharacterModel } from './character.model';
import { ItemFactory } from '../item/item.factory';
import { ItemModel } from '../item/item.model';
import { NameService } from '../services/name.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterRegistry = new Map<string, CharacterModel>();
  private itemFactory = inject(ItemFactory);
  private nameService = inject(NameService)
  readonly playerCharacterId = signal<string | null>(null);
  private readonly MAX_BACKPACK_SIZE = 10;

acquireItem(characterId: string, items: ItemModel[]): boolean {
  const character = this.characterRegistry.get(characterId);
  if (!character) return false;

  let anyItemAcquired = false;
  for (const item of items) {
    const equipLocation = item.equippableLocation;
    const canAutoEquip = equipLocation !== 'none' && !character.equipment.has(equipLocation);
    if (canAutoEquip) {
      character.items.push(item);
      this.equipItem(characterId, item.id);
      anyItemAcquired = true;
      continue;
    }
    if (character.items.length < this.MAX_BACKPACK_SIZE) {
      character.items.push(item);
      anyItemAcquired = true;
    }
  }
  return anyItemAcquired;
}

  equipItem(characterId: string, itemId: string): boolean {
    const character = this.characterRegistry.get(characterId);
    if (!character) return false;

    const inventoryIndex = character.items.findIndex((item) => item.id === itemId);
    if (inventoryIndex < 0) return false;

    const itemToEquip = character.items[inventoryIndex];
    const equipLocation = itemToEquip.equippableLocation;

    if (equipLocation === 'none') return false;

    const currentlyEquippedItem = character.equipment.get(equipLocation);
    if (currentlyEquippedItem) {
      character.items[inventoryIndex] = currentlyEquippedItem;
      character.equipment.set(equipLocation, itemToEquip);
      return true;
    }

    character.items.splice(inventoryIndex, 1);
    character.equipment.set(equipLocation, itemToEquip);
    return true;
  }

  spawnCharacter(type: string, name?: string): void {
    const characterName = name ??
      type === 'player' ? this.nameService.getHeroName() :
      this.nameService.getEnemyName();
    const player = new CharacterModel(characterName, 30, 10, {
      typeid: 'player'
    });
    this.registerCharacter(player, true);
    const items = [this.itemFactory.createRandomItem(['Weapon'])];
    if (items[0].typeid === 'weapon-bow-short') {
      items.push(this.itemFactory.createItem('ammo-arrows'));
    }
    items.push(this.itemFactory.createRandomItem());

    console.log(items);
    this.acquireItem(player.id, items);
  }

  registerCharacter(character: CharacterModel, isPlayer: boolean = false): void {
    this.characterRegistry.set(character.id, character);
    if (isPlayer) {
      this.playerCharacterId.set(character.id);
    }
  }

  getCharacterById(id: string): CharacterModel | undefined {
    return this.characterRegistry.get(id);
  }

  getPlayer(): CharacterModel | undefined {
    const id = this.playerCharacterId();
    return id ? this.characterRegistry.get(id) : undefined;
  }

  getCharactersAtLocation(coordinates: string): CharacterModel[] {
    const allCharacters = Array.from(this.characterRegistry.values());
    return allCharacters.filter(character => character.roomCoordinates === coordinates);
  }

  getEnemiesAtLocation(coordinates: string): CharacterModel[] {
    const currentPlayerId = this.playerCharacterId();
    return this.getCharactersAtLocation(coordinates)
      .filter(character => character.id !== currentPlayerId && !character.isDead);
  }

  removeCharacter(id: string): void {
    this.characterRegistry.delete(id);
  }
}