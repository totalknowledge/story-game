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

  acquireItem(characterId: string, item: ItemModel): boolean {
    const character = this.characterRegistry.get(characterId);
    if (!character) return false;
    if (item.equippableLocation !== 'none') {
      const currentEquipped = character.equipment.get(item.equippableLocation);

      if (!currentEquipped) {
        character.equipment.set(item.equippableLocation, item);
        return true;
      }
    }
    if (character.items.length < this.MAX_BACKPACK_SIZE) {
      character.items.push(item);
      return true;
    }
    return false;
  }

  spawnCharacter(type: string, name?: string): void {
    const characterName = name ?? 
      type === 'player' ? this.nameService.getHeroName() :
      this.nameService.getEnemyName();
    const player = new CharacterModel(characterName, 30, 10, {
      typeid: 'player'
    });
    this.registerCharacter(player, true);
    const kit = this.itemFactory.createRandomItem();
    console.log(kit);
    this.acquireItem(player.id, kit);
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