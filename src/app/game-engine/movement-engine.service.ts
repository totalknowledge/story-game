import { inject, Injectable } from '@angular/core';
import { ItemFactory } from '../item/item.factory';
import { FeatureFactory } from '../feature/feature.factory';
import { CharacterFactory } from '../character/character.factory';
import { CharacterModel } from '../character/character.model';
import { ItemModel } from '../item/item.model';
import { FeatureModel } from '../feature/feature.model';

@Injectable({
  providedIn: 'root',
})
export class MovementEngineService {
  private readonly characterFactory = inject(CharacterFactory);
  private readonly itemFactory = inject(ItemFactory);
  private readonly featureFactory = inject(FeatureFactory);

  public processMovement(destinationRoom: any, targetCR?: number): {
    enemies: CharacterModel[];
    items: ItemModel[];
    features: FeatureModel[];
  } {
    if (destinationRoom.visited) {
      return { enemies: [], items: destinationRoom.items, features: destinationRoom.features };
    }

    return {
      items: this.hydrateItems(destinationRoom),
      features: this.hydrateFeatures(destinationRoom),
      enemies: this.generateInitialEnemies(destinationRoom, targetCR)
    };
  }

  private generateInitialEnemies(room: any, targetCR?: number): CharacterModel[] {
    const roomEnemies: CharacterModel[] = [];
    const roomEnemyTypeIds = room.enemyTypeids ? Array.from(room.enemyTypeids) : [];

    if (roomEnemyTypeIds.length === 0) return roomEnemies;

    roomEnemyTypeIds.forEach((typeId: any) => {
      const generatedEnemy = this.characterFactory.createCharacter(typeId, undefined, targetCR);
      roomEnemies.push(generatedEnemy);
    });

    return roomEnemies;
  }

  private hydrateItems(room: any): ItemModel[] {
    if (!room.itemTemplates) return [];
    room.items = room.itemTemplates.map((template: any) =>
      this.itemFactory.createItem(template.id, template.overrides)
    );
    return room.items;
  }

  private hydrateFeatures(room: any): FeatureModel[] {
    const ids = room.featureTypeids || [];
    if (ids.length === 0) return [];

    room.features = ids.map((id: string) =>
      this.featureFactory.createFeature(id)
    );
    return room.features;
  }
}