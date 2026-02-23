import { inject, Injectable } from '@angular/core';
import { CharacterModel } from '../character/character.model';
import { ItemModel } from '../item/item.model';
import { CharacterService } from '../character/character.service';
import { MapService } from '../map/map.service';
import { Direction } from '../map/room/room.definitions';
import { ItemFactory } from '../item/item.factory';
import { FeatureFactory } from '../feature/feature.factory';
import { TargetingEngine } from './target-engine.service';
import { SpellModel } from '../spell/spell.model';
import { CombatEngineService } from './combat-engine.service';
import { InteractionEngineService } from './interaction-engine.service';
import { MovementEngineService } from './movement-engine.service';

@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  private targetingEngine = inject(TargetingEngine);
  private combatEngine = inject(CombatEngineService);
  private interactionEngine = inject(InteractionEngineService);
  private movementEngine = inject(MovementEngineService);

  private characterService = inject(CharacterService);
  private mapService = inject(MapService);
  private itemFactory = inject(ItemFactory);
  private featureFactory = inject(FeatureFactory);

  attack(attacker: CharacterModel, targetFragment: string): string[] {
    const charactersInRoom = this.characterService.getCharactersInRoom();

    const targetingResult = this.targetingEngine.resolveTargets({
      actor: attacker,
      targetFragment,
      charactersInRoom,
      determinationScheme: 'single-target'
    });

    if (!targetingResult.hostileTargets || targetingResult.hostileTargets.length === 0) {
      return [`${attacker.name} cannot find a target.`];
    }

    const defender = targetingResult.hostileTargets[0];
    return this.combatEngine.attack(attacker, defender);
  }

  lookAround(): string[] {
    const currentRoom = this.mapService.currentRoom();
    if (!currentRoom) return ["You are lost in the void."];

    const viewLines: string[] = [
      `[${currentRoom.typeid?.toUpperCase() || 'Room'}]`,
      currentRoom.description
    ];

    // Leverages the Signal we built earlier
    const enemiesHere = this.characterService.enemiesInRoomEntities();

    if (enemiesHere.length > 0) {
      viewLines.push("Occupants:");
      enemiesHere.forEach(enemy => {
        const status = enemy.isDead ? '(Dead)' : `(${enemy.currentHealth} HP)`;
        viewLines.push(` - ${enemy.name} is here ${status}.`);
      });
    }

    if (currentRoom.items.length > 0) {
      viewLines.push("Items:", ...currentRoom.items.map(i => ` - ${i.name}`));
    }

    viewLines.push(...currentRoom.directions);
    return viewLines;
  }

  public movePlayer(command: string): string[] {
    const moveDirection = command as Direction;
    const player = this.characterService.getPlayerEntity();
    const departingRoom = this.mapService.currentRoom();

    if (!player) return ['Movement failed.'];

    if (departingRoom) {
      this.mapService.updateRoom(departingRoom.coordinateKey, {
        enemyIds: this.characterService.enemiesInRoomEntities().map(character => character.id)
      });
    }

    this.mapService.activeFeature.set(null);
    const narrative = this.mapService.move(moveDirection);
    const destinationRoom = this.mapService.currentRoom();

    if (destinationRoom) {
      const destinationKey = destinationRoom.coordinateKey;
      const roomHydration = this.movementEngine.processMovement(destinationRoom);
      destinationRoom.items = roomHydration.items;
      destinationRoom.features = roomHydration.features;
      this.characterService.loadRoomCharacters(destinationRoom.enemyIds, roomHydration.enemies);

      this.rest(player);
      this.characterService.moveCharacter(destinationKey, player.id);

      if (!destinationRoom.visited) {
        this.mapService.updateRoom(destinationKey, {
          items: roomHydration.items,
          features: roomHydration.features,
          enemyIds: roomHydration.enemies.map(enemy => enemy.id),
          visited: true
        });
      }
    }

    return narrative;
  }

  take(player: CharacterModel, itemName: string): string[] {
    const room = this.mapService.currentRoom();
    if (!room) return ['You cannot take items here.'];

    const activeFeature = this.mapService.activeFeature();
    if (activeFeature) {
      return this.interactionEngine.take(player, itemName, activeFeature);
    }

    const targetingResult = this.targetingEngine.resolveTargets({
      actor: player,
      targetFragment: itemName,
      featuresInRoom: room.features,
      determinationScheme: 'use'
    });

    const feature = targetingResult.featureTargets?.[0];
    if (!feature) return [`There is no "${itemName}" here.`];

    return this.interactionEngine.take(player, itemName, feature);
  }

  place(player: CharacterModel, itemName: string, featureName?: string): string[] {
    const room = this.mapService.currentRoom();
    if (!room) return ['You cannot place items here.'];

    const targetingResult = this.targetingEngine.resolveTargets({
      actor: player,
      targetFragment: featureName,
      featuresInRoom: room.features,
      determinationScheme: 'use'
    });

    const feature = targetingResult.featureTargets?.[0];
    if (!feature) return ['There is nowhere to place items here.'];

    return this.interactionEngine.place(player, itemName, feature);
  }

  searchCorpse(player: CharacterModel, targetName: string): string[] {
    const output: string[] = [];
    const playerLocation = player.roomCoordinatesKey;

    const allCharacters = this.characterService.getCharactersInRoom();

    const corpses = allCharacters.filter(character =>
      character.isDead &&
      character.id !== player.id
    );
    if (corpses.length === 0) return ['There are no corpses here to search.'];

    const targetsToSearch = (targetName === 'all' || !targetName)
      ? corpses
      : corpses.filter(c => c.name.toLowerCase().includes(targetName.toLowerCase()));

    if (targetsToSearch.length === 0) {
      return [`You find no corpses matching "${targetName}".`];
    }
    targetsToSearch.forEach(corpse => {
      output.push(`You search the remains of ${corpse.name}...`);

      const equippedLoot = Array.from(corpse.equipment.values()).filter(
        (item: ItemModel) => item.type != 'Natural'
      );
      const allLoot = [...equippedLoot, ...corpse.items];
      if (allLoot.length === 0) {
        output.push(` - The ${corpse.name} had nothing of value.`);
        return;
      }

      corpse.items = [];

      allLoot.forEach(item => {
        const targetSlot = item.equippableLocation;

        if (targetSlot !== 'none' && !player.equipment.has(targetSlot)) {
          this.characterService.equipItem(player.id, item);
          output.push(` - You found and equipped: ${item.name}.`);
          return;
        }

        const wasAcquired = this.characterService.acquireItem(player.id, [item]);
        if (wasAcquired) {
          output.push(` - You found and stowed: ${item.name}.`);
        } else {
          const room = this.mapService.currentRoom();
          if (room) {
            room.items.push(item);
            output.push(` - Your pack is full! You dropped ${item.name} on the floor.`);
          }
        }
      });

      this.characterService.updateCharacter(corpse);
    });
    this.characterService.updateCharacter(player);

    return output;
  }

  cast(caster: CharacterModel, spell: SpellModel, targetFragment: string): string[] {
    const combatLog: string[] = [];

    if (caster.currentMana < spell.manaCost) {
      combatLog.push(`${caster.name} does not have enough mana to cast ${spell.name}!`);
      return combatLog;
    }

    const charactersInRoom = this.characterService.getCharactersInRoom();

    const targetingResult = this.targetingEngine.resolveTargets({
      actor: caster,
      targetFragment,
      charactersInRoom,
      determinationScheme: spell.effect as any
    });

    const enemies = targetingResult.hostileTargets || [];
    const allies = targetingResult.friendlyTargets || [];

    if (enemies.length === 0 && spell.effect !== 'heal') {
      combatLog.push(`${caster.name} prepares ${spell.name}, but there is no valid target!`);
      return combatLog;
    }

    const resolutionLog = this.combatEngine.cast(caster, spell, enemies, allies);
    combatLog.push(...resolutionLog);

    return combatLog;
  }

  drop(player: CharacterModel, item: ItemModel): string[] {
    const currentRoom = this.mapService.currentRoom();
    if (!currentRoom) return ['You cannot drop items here.'];

    currentRoom.items.push(item);
    player.items = player.items.filter(currentItem => currentItem !== item);
    this.characterService.updateCharacter(player);

    return [`You dropped ${item.name}.`];
  }

  rest(player: CharacterModel): string[] {
    const messages: string[] = [];

    if (player.damage > 0) {
      player.damage = Math.max(0, player.damage - 1);
      messages.push('You rest and recover 1 health.');
    }

    if (player.usedMana > 0) {
      player.usedMana = Math.max(0, player.usedMana - 1);
      messages.push('You rest and recover 1 mana.');
    }

    if (messages.length > 0) {
      this.characterService.updateCharacter(player);
    }

    return messages;
  }
  use(player: CharacterModel, targetName: string): string[] {
    if (!player) return ['You do not exist.'];

    return this.interactionEngine.use(player, targetName);
  }
}