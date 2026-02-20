import { inject, Injectable } from '@angular/core';
import { CharacterModel } from '../character/character.model';
import { ItemModel } from '../item/item.model';
import { CharacterService } from '../character/character.service';
import { MapService } from '../map/map.service';
import { Direction } from '../map/room/room.definitions';
import { ItemFactory } from '../item/item.factory';
import { d100, rollDice } from '../utilities/dice.definitions';
import { FeatureFactory } from '../feature/feature.factory';

@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  private readonly MISS_THRESHOLD = 10;
  private readonly CRITICAL_THRESHOLD = 95;
  private characterService = inject(CharacterService);
  private mapService = inject(MapService);
  private itemFactory = inject(ItemFactory);
  private featureFactory = inject(FeatureFactory);

  attack(attacker: CharacterModel, defender: CharacterModel): string[] {
    const combatLog: string[] = [];
    const weapon = attacker.equipment.get('right-hand');

    const rawRoll = Math.floor(Math.random() * 100) + 1;
    const modifiedRoll = rawRoll + (attacker.toHit ?? 0) - (defender.armor ?? 0);

    if (this.isMiss(rawRoll, modifiedRoll)) {
      combatLog.push(`${attacker.name} misses ${defender.name}.`);
      return combatLog;
    }

    const isCritical = this.isCrit(rawRoll, modifiedRoll);
    const damageDealt = this.calculateDamage(attacker, weapon, isCritical);

    defender.damage += damageDealt;

    const hitType = isCritical ? 'critically hits' : 'hits';
    combatLog.push(`${attacker.name} ${hitType} ${defender.name} for ${damageDealt} damage!`);

    if (defender.isDead) {
      defender.dead = true;
      combatLog.push(`${defender.name} has been slain!`);
    }

    this.characterService.updateCharacter(defender);

    return combatLog;
  }

  lookAround(): string[] {
    const currentRoom = this.mapService.currentRoom();
    const player = this.characterService.getPlayer()();

    if (!currentRoom) {
      return ["You are lost in the void."];
    }
    const viewLines: string[] = [];
    viewLines.push(`[${currentRoom.typeid?.toUpperCase() || 'Room'}]`);
    viewLines.push(currentRoom.description);

    const enemiesHere = this.characterService.getActiveEnemies().filter(enemy =>
      enemy.roomCoordinatesKey === player?.roomCoordinatesKey && enemy.id !== player?.id
    );

    if (enemiesHere.length > 0) {
      viewLines.push("Occupants:");
      enemiesHere.forEach(enemy => {
        viewLines.push(` - ${enemy.name} is here (${enemy.currentHealth} HP).`);
      });
    }

    if (currentRoom.items.length > 0) {
      viewLines.push("Items:");
      currentRoom.items.forEach(item => {
        viewLines.push(` - ${item.name}`);
      });
    }

    viewLines.push(...currentRoom.directions);

    return viewLines;
  }

  movePlayer(command: string): string[] {
    const moveDirection = command as Direction;
    const departingRoom = this.mapService.currentRoom();
    const player = this.characterService.getPlayer()();
    this.mapService.activeFeature.set(null);

    if (!player) return ['Cannot move - player not found.'];

    if (departingRoom) {
      this.saveRoomState(departingRoom);
    }

    const movementNarrative = this.mapService.move(moveDirection);
    movementNarrative.push(...this.rest(player));
    const destinationRoom = this.mapService.currentRoom();

    if (destinationRoom?.coordinates) {
      this.loadRoomState(destinationRoom, player);
    }

    return movementNarrative;
  }

  private saveRoomState(room: any): void {
    const occupants = this.characterService.getCharactersInRoom();
    room.enemyIds = occupants
      .filter(character => character.id !== this.characterService.playerCharacterId)
      .map(enemy => enemy.id);
  }

  private loadRoomState(room: any, player: CharacterModel): void {
    (this.characterService as any).charactersInRoom.set(new Map());
    this.characterService.registerCharacter(player, true);
    player.roomCoordinatesKey = `${room.coordinates.x},${room.coordinates.y},${room.coordinates.z}`;

    if (room.enemyIds.length > 0) {
      this.loadExistingEnemies(room);
    } else if (room.enemyTypeids.length > 0) {
      this.spawnNewEnemies(room);
    }

    if (room.featureTypeids && room.featureTypeids.length > 0 && room.features.length === 0) {
      room.featureTypeids.forEach((typeid: string) => {
        const feature = this.featureFactory.createFeature(typeid);
        room.features.push(feature);
      });
    }

    if (room.itemTypeids && room.itemTypeids.length > 0 && room.items.length === 0) {
      room.itemTypeids.forEach((typeid: string) => {
        const item = this.itemFactory.createItem(typeid);
        room.items.push(item);
      });
    }
  }

  private loadExistingEnemies(room: any): void {
    room.enemyIds.forEach((characterId: string) => {
      const cachedCharacter = (this.characterService as any).characterRegistry.get(characterId);
      if (cachedCharacter) {
        this.characterService.registerCharacter(cachedCharacter);
      }
    });
  }

  private spawnNewEnemies(room: any): void {
    room.enemyTypeids.forEach((typeId: string) => {
      const newEnemy = this.characterService.spawnCharacter(typeId)();
      room.enemyIds.push(newEnemy.id);
    });
  }

  // game-engine.service.ts - add these methods

  take(player: CharacterModel, itemName: string): string[] {
    const room = this.mapService.currentRoom();
    if (!room) return ['You cannot take items here.'];

    const roomItems = [...room.items];
    const featureItems = room.features
      .filter((f: any) => f.interactable && f.items)
      .flatMap((f: any) => f.items.map((item: any) => ({ item, feature: f })));

    const allAvailableItems = [
      ...roomItems.map(item => ({ item, source: 'room' })),
      ...featureItems.map(({ item, feature }) => ({ item, source: feature }))
    ];

    const targetItem = allAvailableItems.find(({ item }) =>
      item.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!targetItem) {
      return [`There is no "${itemName}" here to take.`];
    }

    const acquired = this.characterService.acquireItem(player.id, [targetItem.item]);

    if (!acquired) {
      return [`Your inventory is full.`];
    }

    if (targetItem.source === 'room') {
      room.items = room.items.filter(i => i.id !== targetItem.item.id);
    } else {
      targetItem.source.items = targetItem.source.items.filter((i: any) => i.id !== targetItem.item.id);
    }

    return [`You took ${targetItem.item.name}.`];
  }

  place(player: CharacterModel, itemName: string, featureName?: string): string[] {
    const room = this.mapService.currentRoom();
    if (!room) return ['You cannot place items here.'];

    const openFeatures = room.features.filter((f: any) =>
      f.interactable && f.items && (!f.itemSlots || f.items.length < f.itemSlots)
    );

    if (openFeatures.length === 0) {
      return ['There is nowhere to place items here.'];
    }

    let targetFeature = openFeatures[0];
    if (featureName) {
      const found = openFeatures.find((f: any) =>
        f.name.toLowerCase().includes(featureName.toLowerCase())
      );
      if (!found) {
        return [`There is no "${featureName}" here to place items in.`];
      }
      targetFeature = found;
    }

    const equippedItem = Array.from(player.equipment.values()).find((item: any) =>
      item.name.toLowerCase().includes(itemName.toLowerCase())
    );

    const inventoryItem = player.items.find(item =>
      item.name.toLowerCase().includes(itemName.toLowerCase())
    );

    const itemToPlace = equippedItem || inventoryItem;

    if (!itemToPlace) {
      return [`You are not carrying a "${itemName}".`];
    }

    if (targetFeature.itemSlots && targetFeature.items.length >= targetFeature.itemSlots) {
      return [`The ${targetFeature.name} is full.`];
    }

    if (equippedItem) {
      const slot = Array.from(player.equipment.entries()).find(([_, item]) => item.id === equippedItem.id)?.[0];
      if (slot) {
        player.equipment.delete(slot);
      }
    } else {
      player.items = player.items.filter(i => i.id !== itemToPlace.id);
    }

    targetFeature.items.push(itemToPlace);
    this.characterService.updateCharacter(player);

    return [`You placed ${itemToPlace.name} in the ${targetFeature.name}.`];
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

  private isMiss(rawRoll: number, modifiedRoll: number): boolean {
    if (rawRoll === 1) return true;
    if (rawRoll === 100) return false;

    return modifiedRoll <= this.MISS_THRESHOLD;
  }

  private isCrit(rawRoll: number, modifiedRoll: number): boolean {
    if (rawRoll === 1) return false;
    if (rawRoll === 100) return true;

    return modifiedRoll >= this.CRITICAL_THRESHOLD;
  }

  private calculateDamage(attacker: CharacterModel, weapon: ItemModel | undefined, isCritical: boolean): number {
    const damageDie = weapon ? weapon?.damage || 2 : 1;
    const rollResult = rollDice(1, damageDie);
    console.log('damageRoll: ' + rollResult + ' on a 1d' + damageDie +
      " plus to damage is: " + (attacker.toDamage || 0)
    );
    const baseDamage = rollResult + (attacker.toDamage || 0);

    const criticalMultiplier = isCritical ? 1.5 : 1;
    return Math.max(1, Math.round(baseDamage * criticalMultiplier));
  }

  cast(caster: CharacterModel, spell: any, target?: CharacterModel): string[] {
    const combatLog: string[] = [];

    if (caster.currentMana < spell.manaCost) {
      combatLog.push(`${caster.name} does not have enough mana to cast ${spell.name}!`);
      return combatLog;
    }

    const targets = this.determineSpellTargets(caster, spell, target);

    if (targets.length === 0 && spell.effect !== 'heal') {
      combatLog.push(`${caster.name} prepares ${spell.name}, but there is no valid target!`);
      return combatLog;
    }

    caster.usedMana += spell.manaCost;

    const castMessage = spell.castMessages[0].replace('{user}', caster.name);
    combatLog.push(castMessage);

    if (spell.effect === 'heal') {
      const healAmount = spell.healsUser || 0;
      caster.damage = Math.max(0, caster.damage - healAmount);
      combatLog.push(`${spell.name} restores ${healAmount} health to ${caster.name}!`);
    } else {
      targets.forEach((target, index) => {
        const isHalf = index > 0 && spell.effect === 'additional-target';
        combatLog.push(...this.resolveSpellEffect(caster, target, spell, isHalf));
        this.characterService.updateCharacter(target);
      });

      if (spell.effect === 'area' && spell.healsUser) {
        caster.damage = Math.max(0, caster.damage - spell.healsUser);
        combatLog.push(`${spell.name} mends ${caster.name}'s wounds for ${spell.healsUser}!`);
      }
    }

    this.characterService.updateCharacter(caster);
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

  private determineSpellTargets(caster: CharacterModel, spell: any, target?: CharacterModel): CharacterModel[] {
    const enemies = this.characterService.getActiveEnemies();

    if (spell.effect === 'area') return enemies;
    if (spell.effect === 'heal') return [caster];

    if (target) {
      return [target];
    }

    if (enemies.length > 0) {
      const primary = enemies[0];
      if (spell.mechanic === 'target-additional' && enemies.length > 1) {
        return [primary, enemies[1]];
      }
      return [primary];
    }

    return [];
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

  private resolveSpellEffect(caster: CharacterModel, defender: CharacterModel, spell: any, isHalfDamage: boolean): string[] {
    const log: string[] = [];
    const spellToHit = Math.round(caster.maxMana / 10);
    const spellBonusDamage = Math.round(caster.maxMana / 2);
    const targetSpellArmor = Math.round(defender.maxMana / 2);

    const rawRoll = d100();
    const modifiedRoll = rawRoll + spellToHit - targetSpellArmor;

    if (this.isMiss(rawRoll, modifiedRoll)) {
      log.push(`${spell.name} fizzles against ${defender.name}.`);
      return log;
    }

    const isCritical = this.isCrit(rawRoll, modifiedRoll);
    let spellPower = rollDice(1, spell.damage) + spellBonusDamage;

    if (isCritical) spellPower *= 1.5;
    if (isHalfDamage) spellPower = Math.floor(spellPower / 2);

    defender.damage += spellPower;
    log.push(`${spell.name} hits ${defender.name} for ${spellPower} damage!`);

    if (spell.effect === 'vampiric' && spellPower > 0) {
      const healValue = spell.healsUser || Math.floor(spellPower / 2);
      caster.damage = Math.max(0, caster.damage - healValue);
      log.push(`${caster.name} siphons ${healValue} health!`);
    }

    if (defender.isDead) {
      defender.dead = true;
      log.push(`${defender.name} has been destroyed!`);
    }

    return log;
  }
}