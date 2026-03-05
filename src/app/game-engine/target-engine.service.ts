import { Injectable } from '@angular/core';
import { CharacterModel } from '../character/character.model';
import { FeatureModel } from '../feature/feature.model';
import { TargetingRequest, TargetingResult } from './game-engine.definitions';
import { ItemModel } from '../item/item.model';

@Injectable({
  providedIn: 'root'
})
export class TargetingEngine {

  resolveTargets(request: TargetingRequest): TargetingResult {
    const result: TargetingResult = {};

    const { enemies, allies } = this.partitionCharacters(
      request.actor,
      request.charactersInRoom || []
    );

    switch (request.determinationScheme) {
      case 'area':
        result.hostileTargets = enemies.filter(c => !c.isDead);
        result.friendlyTargets = allies.filter(c => !c.isDead);
        break;

      case 'dead':
        result.hostileTargets = [
          ...enemies.filter(c => c.isDead),
          ...allies.filter(c => c.isDead)
        ];
        break;

      case 'heal':
        if (!request.targetFragment) {
          result.friendlyTargets = [request.actor];
        } else {
          const target = this.findCharacterByFragment(request.targetFragment, allies);
          if (target) result.friendlyTargets = [target];
        }
        break;

      case 'vampiric':
      case 'single-target':
        const targets = enemies.filter(c => !c.isDead);
        if (request.determinationScheme === 'vampiric') {
          result.friendlyTargets = [request.actor];
        }
        if (!request.targetFragment && targets.length > 0) {
          result.hostileTargets = [targets[0]];
        } else {
          const target = this.findCharacterByFragment(request.targetFragment ?? '', enemies);
          if (target) result.hostileTargets = [target];
        }
        break;

      case 'additional-target':
        const livingEnemies = enemies.filter(e => !e.isDead);
        if (!request.targetFragment && livingEnemies.length > 0) {
          result.hostileTargets = [livingEnemies[0]];
          if (livingEnemies.length > 1) result.hostileTargets.push(livingEnemies[1]);
        } else {
          const primary = this.findCharacterByFragment(request.targetFragment ?? '', enemies);
          if (primary) {
            result.hostileTargets = [primary];
            const secondary = enemies.find(e => e.id !== primary.id && !e.isDead);
            if (secondary) result.hostileTargets.push(secondary);
          }
        }
        break;

      case 'use':
        const fragment = request.targetFragment?.toLowerCase() ?? '';
        const feature = this.findFeatureByFragment(
          fragment,
          request.featuresInRoom || []
        );
        if (feature) result.featureTargets = [feature];
        const inventoryItem = request.actor.items.find(i =>
          i.name.toLowerCase().includes(fragment)
        );
        if (inventoryItem) result.itemTargets = [inventoryItem];
        const character = this.findCharacterByFragment(
          fragment,
          request.charactersInRoom || []
        );
        if (character) {
          const isEnemy = request.charactersInRoom?.some(e => e.id === character.id && e.typeid !== 'player');
          isEnemy ? result.hostileTargets = [character] : result.friendlyTargets = [character];
        }
        break;
    }

    return result;
  }

  private partitionCharacters(
    actor: CharacterModel,
    allCharacters: CharacterModel[]
  ): { enemies: CharacterModel[], allies: CharacterModel[] } {
    const enemies: CharacterModel[] = [];
    const allies: CharacterModel[] = [];

    const isPlayerActor = actor.typeid.startsWith('player');

    allCharacters.forEach(char => {
      if (char.id === actor.id) {
        allies.push(char);
        return;
      }

      const isCharPlayer = char.typeid.startsWith('player');

      if (isPlayerActor && isCharPlayer) {
        allies.push(char);
      } else if (!isPlayerActor && !isCharPlayer) {
        allies.push(char);
      } else {
        enemies.push(char);
      }
    });

    return { enemies, allies };
  }

  private findCharacterByFragment(
    fragment: string,
    characters: CharacterModel[]
  ): CharacterModel | undefined {
    const lowercaseFragment = fragment.toLowerCase();
    return characters
      .filter(c => !c.isDead)
      .find(c => c.name.toLowerCase().includes(lowercaseFragment));
  }

  private findFeatureByFragment(
    fragment: string,
    features: FeatureModel[]
  ): FeatureModel | undefined {
    const lowercaseFragment = fragment.toLowerCase();
    return features
      .filter(f => f.interactable)
      .find(f => f.name.toLowerCase().includes(lowercaseFragment));
  }
}