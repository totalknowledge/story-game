import { inject, Injectable } from '@angular/core';
import { CharacterModel } from '../character/character.model';
import { ItemModel } from '../item/item.model';
import { CharacterService } from '../character/character.service';
import { MapService } from '../map/map.service';
import { Direction } from '../map/room/room.definitions';

@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  private readonly MISS_THRESHOLD = 10;
  private readonly CRITICAL_THRESHOLD = 95;
  private characterService = inject(CharacterService);
  private mapService = inject(MapService);

  attack(attacker: CharacterModel, defender: CharacterModel): string[] {
    const combatLog: string[] = [];
    const weapon = attacker.equipment.get('right-hand');

    const rawRoll = Math.floor(Math.random() * 100) + 1;
    const modifiedRoll = rawRoll + attacker.toHit - defender.armor;

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
    viewLines.push(...currentRoom.getDirections());

    return viewLines;
  }

  movePlayer(command: string): string[] {
    const direction = command as Direction;

    const moveResults = this.mapService.move(direction);

    const currentRoom = this.mapService.currentRoom();
    if (currentRoom?.coordinates) {
      this.characterService.movePlayer(currentRoom.coordinates);
    }

    return moveResults;
  }

  searchCorpse(player: CharacterModel, targetName: string): string[] {
    const output: string[] = [];
    const playerLocation = player.roomCoordinatesKey;

    const allCharacters = this.characterService.getCharactersInRoom();

    const corpses = allCharacters.filter(character =>
      character.roomCoordinatesKey === playerLocation &&
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
    const damageDie = weapon?.damage || 2;
    const rollResult = Math.floor(Math.random() * damageDie) + 1;
    const baseDamage = rollResult + attacker.toDamage;

    const criticalMultiplier = isCritical ? 2 : 1;
    return Math.max(1, baseDamage * criticalMultiplier);
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

  private resolveSpellEffect(caster: CharacterModel, defender: CharacterModel, spell: any, isHalfDamage: boolean): string[] {
    const log: string[] = [];
    const spellToHit = Math.round(caster.maxMana / 10);
    const spellBonusDamage = Math.round(caster.maxMana / 10);
    const targetSpellArmor = Math.round(defender.maxMana / 2);

    const rawRoll = Math.floor(Math.random() * 100) + 1;
    const modifiedRoll = rawRoll + spellToHit - targetSpellArmor;

    if (this.isMiss(rawRoll, modifiedRoll)) {
      log.push(`${spell.name} fizzles against ${defender.name}.`);
      return log;
    }

    const isCritical = this.isCrit(rawRoll, modifiedRoll);
    let spellPower = Math.floor(Math.random() * (spell.damage || 1)) + 1 + spellBonusDamage;

    if (isCritical) spellPower *= 2;
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