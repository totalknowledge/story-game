import { inject, Injectable } from '@angular/core';
import { CharacterModel } from '../character/character.model';
import { ItemModel } from '../item/item.model';
import { CharacterService } from '../character/character.service';
import { applyBonusCalculation } from '../character/rules/character.rules';
import { MapService } from '../map/map.service';
import { Direction } from '../map/room/room.definitions';
import { TargetingEngine } from './target-engine.service';
import { SpellModel } from '../spell/spell.model';
import { CombatEngineService } from './combat-engine.service';
import { InteractionEngineService } from './interaction-engine.service';
import { MovementEngineService } from './movement-engine.service';
import { d10, d100 } from '../utilities/dice.definitions';
import { ItemFactory } from '../item/item.factory';

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

  attack(attackerId: string, targetFragment: string): string[] {
    const attacker = this.characterService.getCharacterById(attackerId);
    if (!attacker) return ['Attacker not found.'];

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

    const enemiesBeforeMove = this.characterService.enemiesInRoomEntities();
    const departureConnection = departingRoom?.connections?.get(moveDirection);
    const isMapChange = !!departureConnection?.loads;

    const followers = isMapChange
      ? []
      : enemiesBeforeMove.filter(enemy => !enemy.isDead && Math.random() < 0.6);

    if (departingRoom) {
      const followerIds = new Set(followers.map(enemy => enemy.id));
      const remainingEnemyIds = enemiesBeforeMove
        .filter(enemy => !followerIds.has(enemy.id))
        .map(enemy => enemy.id!)
        .filter(Boolean);

      this.mapService.updateRoom(departingRoom.coordinateKey, {
        enemyIds: remainingEnemyIds
      });
    }

    this.mapService.activeFeature.set(null);
    const narrative = this.mapService.move(moveDirection);
    const destinationRoom = this.mapService.currentRoom();

    if (destinationRoom) {
      const destinationKey = destinationRoom.coordinateKey;
      const wasVisited = destinationRoom.visited;
      const mapTargetCR = this.mapService.displayMap()?.targetCR;
      const roomHydration = this.movementEngine.processMovement(destinationRoom, mapTargetCR);
      destinationRoom.items = roomHydration.items;
      destinationRoom.features = roomHydration.features;

      const destinationEnemyIds = [
        ...(destinationRoom.enemyIds ?? []),
        ...followers.map(enemy => enemy.id!).filter(Boolean)
      ];

      const uniqueDestinationEnemyIds = Array.from(new Set(destinationEnemyIds));

      this.characterService.loadRoomCharacters(uniqueDestinationEnemyIds, roomHydration.enemies);

      this.rest(player);
      this.characterService.moveCharacter(destinationKey, player.id!);

      if (wasVisited && destinationRoom.features?.length) {
        const storeFeatures = destinationRoom.features.filter((f: any) =>
          typeof f.type === 'string' && f.type.toLowerCase() === 'store'
        );
        if (storeFeatures.length) {
          storeFeatures.forEach((store: any) => this.refreshStoreInventory(store));
          this.mapService.updateRoom(destinationKey, { features: destinationRoom.features });
        }
      }

      if (!destinationRoom.visited) {
        this.mapService.updateRoom(destinationKey, {
          items: roomHydration.items,
          features: roomHydration.features,
          enemyIds: [
            ...roomHydration.enemies.map(enemy => enemy.id!),
            ...uniqueDestinationEnemyIds
          ],
          visited: true
        });
      } else {
        this.mapService.updateRoom(destinationKey, {
          enemyIds: uniqueDestinationEnemyIds
        });
      }
    }

    return narrative;
  }

  private refreshStoreInventory(store: any): void {
    store.items = (store.items ?? []).filter((item: ItemModel) => item?.type !== 'Natural');

    const removeCount = d10();
    for (let i = 0; i < removeCount && store.items.length > 0; i++) {
      const idx = Math.floor(Math.random() * store.items.length);
      store.items.splice(idx, 1);
    }

    const addCount = d10() + 3;
    for (let i = 0; i < addCount; i++) {
      store.items.push(this.itemFactory.createRandomItem());
    }
  }

  take(player: CharacterModel, itemName: string): string[] {
    const room = this.mapService.currentRoom();
    if (!room) return ['You cannot take items here.'];

    const roomItem = room.items.find(item =>
      item.name.toLowerCase().includes(itemName.toLowerCase())
    );
    if (roomItem) {
      const inventoryAcquired = this.characterService.acquireItem(player.id!, [roomItem]);
      if (!inventoryAcquired) return ['Your inventory is full.'];

      room.items = room.items.filter(item => item.id !== roomItem.id);
      this.characterService.updateCharacter(player);
      return [`You took ${roomItem.name}.`];
    }

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
      character.id! !== player.id!
    );
    if (corpses.length === 0) return ['There are no corpses here to search.'];

    const targetsToSearch = (targetName === 'all' || !targetName)
      ? corpses
      : corpses.filter(c => c.name.toLowerCase().includes(targetName.toLowerCase()));

    if (targetsToSearch.length === 0) {
      return [`You find no corpses matching "${targetName}".`];
    }

    const isNaturalWeapon = (item: ItemModel) =>
      item.type === 'Natural' &&
      (item.equippableLocation === 'right-hand' || item.equippableLocation === 'left-hand');

    targetsToSearch.forEach(corpse => {
      output.push(`You search the remains of ${corpse.name}...`);

      const equippedLoot = Array.from(corpse.equipment.values()).filter(
        (item: ItemModel) => item && !isNaturalWeapon(item)
      );

      const looseLoot = corpse.items.filter(i => !isNaturalWeapon(i));
      const allLoot = [...equippedLoot, ...looseLoot];

      if (allLoot.length === 0) {
        output.push(` - The ${corpse.name} had nothing of value.`);
        return;
      }

      corpse.items = [];

      allLoot.forEach(item => {
        const targetSlot = item.equippableLocation;
        if (item.type !== 'Natural' && targetSlot !== 'none') {
          const existingItem = player.equipment.get(targetSlot);
          if (!existingItem) {
            const equipMessages = this.characterService.equipItem(player.id!, item);
            const didEquip = equipMessages.some(m => m.toLowerCase().includes('equip'));
            if (didEquip) {
              output.push(` - You found and equipped: ${item.name}.`);
              return;
            }
          }
        }

        const wasAcquired = this.characterService.acquireItem(player.id!, [item]);
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

  cast(casterId: string, spell: SpellModel, targetFragment: string): string[] {
    const caster = this.characterService.getCharacterById(casterId);
    const combatLog: string[] = [];
    if (!caster) return ['Caster not found.'];

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

    const hadInInventory = player.items.some(currentItem => currentItem === item);
    if (hadInInventory) {
      player.items = player.items.filter(currentItem => currentItem !== item);
    } else {
      for (const [slot, equipped] of player.equipment.entries()) {
        if (equipped === item) {
          player.equipment.delete(slot);
          applyBonusCalculation(player);
          break;
        }
      }
    }

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

    const currentRoom = this.mapService.currentRoom();
    const currentMap = this.mapService.displayMap();
    const encounterChance = currentMap?.encounterChance ?? 0;

    if (encounterChance > 0 && d100() <= encounterChance) {
      messages.push('An ambush! Enemies attack!');
      const room = currentRoom;
      if (room?.enemyTypeids?.length) {
        const enemyType = room.enemyTypeids[0];
        const mapTargetCR = currentMap?.targetCR;
        const ambushEnemy = this.characterService.spawnCharacter(enemyType, undefined, mapTargetCR);
      }
    }

    return messages;
  }
  
  revive(player: CharacterModel): string[] {
    const messages: string[] = [];

    const currentRoom = this.mapService.currentRoom();
    if (!currentRoom) return ['You cannot revive here.'];

    const equippedItems = Array.from(player.equipment.values()).filter(i => !!i) as ItemModel[];
    const inventoryItems = player.items || [];
    const allItems: ItemModel[] = [...equippedItems, ...inventoryItems];

    allItems.forEach(item => {
      const loss = Math.ceil((item.resilience ?? 0) * 0.10) + 1;
      item.resilience = Math.max(0, (item.resilience ?? 0) - loss);
      if ((item.resilience ?? 0) < 10) {
        item.quality = 'damaged';
      }
      currentRoom.items.push(item);
    });

    player.items = [];
    player.equipment = new Map();

    player.dead = false;
    player.damage = 0;
    player.usedMana = 0;

    this.mapService.loadMap('town', '0,0,0');
    this.characterService.moveCharacter('0,0,0', player.id!);
    this.characterService.loadRoomCharacters([], []);

    this.mapService.updateRoom(currentRoom.coordinateKey, { items: currentRoom.items });

    messages.push('You have been revived, but your gear was damaged and dropped where you fell.');

    const templates = player.equippedItemTemplate || [];
    templates.forEach((templateTypeid: Partial<ItemModel> | string) => {
      if (typeof templateTypeid !== 'string' || !templateTypeid) return;

      const newItem = this.itemFactory.createItem(templateTypeid);
      const equipRes = this.characterService.equipItem(player.id!, newItem);
      const didEquip = equipRes.some(m => m.toLowerCase().includes('equip'));
      if (!didEquip) {
        this.characterService.acquireItem(player.id!, [newItem]);
      }
    });

    this.characterService.updateCharacter(player);

    return messages;
  }
  use(playerId: string, targetName: string): string[] {
    const player = this.characterService.getCharacterById(playerId);
    if (!player) return ['You do not exist.'];

    const charactersInRoom = this.characterService.getCharactersInRoom();
    return this.interactionEngine.use(player, targetName, charactersInRoom);
  }
}