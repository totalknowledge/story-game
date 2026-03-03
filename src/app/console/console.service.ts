import { Injectable, signal, inject } from '@angular/core';
import { GameEngineService } from '../game-engine/game-engine.service';
import { CharacterService } from '../character/character.service';
import { EnemyDecision } from '../enemies/enemy.decision';
import { MapService } from '../map/map.service';

@Injectable({ providedIn: 'root' })
export class ConsoleService {
  private engine = inject(GameEngineService);
  private characterService = inject(CharacterService);
  private enemyDecision = inject(EnemyDecision);
  private mapService = inject(MapService);
  readonly messages = signal<string[]>(['Welcome, adventurer.  This is Althea... a beautiful place plagued with monsters.']);

  log(message: string): void {
    this.messages.update(previous => [...previous, message]);
  }

  execute(input: string): void {
    const rawCommandInput = input.trim();
    if (!rawCommandInput) return;

    this.log(`> ${rawCommandInput}`);

    const inputParts = rawCommandInput.toLowerCase().split(' ');
    const action = inputParts[0];
    const targetName = inputParts.slice(1).join(' ');

    let output: string[] = [];

    switch (action) {
      case 'help':
        output = [
          'Available Commands:',
          '  Movement: north, south, east, west, up, down',
          '  Exploration: look, search [target], close, rest, revive',
          '  Combat: attack [enemy], cast [spell] [target]',
          '  Inventory: equip [item], drop [item], take [item], buy [item]',
          '  Items: drink [item], eat [item], use [item], place [item] in [feature], sell [item]',
          '  Admin: reset [map]'
        ];
        break;
      case 'attack':
        output = this.handleAttack(targetName);
        output.push(...this.enemyDecision.processEnemyTurns());
        break;
      case 'cast':
        this.handleCast(targetName);
        output.push(...this.enemyDecision.processEnemyTurns());
        break;
      case 'close':
        output = this.mapService.toggleFeature();
        break;
      case 'drop':
        output = this.handleDrop(targetName);
        break;
      case 'equip':
        output = this.handleEquip(targetName);
        break;
      case 'look':
        output = this.engine.lookAround();
        break;
      case 'north': case 'south': case 'east': case 'west': case 'up': case 'down':
        output = this.engine.movePlayer(action);
        break;
      case 'sell': case 'place':
        output = this.handlePlace(targetName);
        break;
      case 'search':
        output = this.handleSearch(targetName);
        output.push(...this.enemyDecision.processEnemyTurns());
        break;
      case 'buy': case 'take':
        output = this.handleTake(targetName);
        break;
      case 'drink': case 'eat': case 'use':
        const playerEntity = this.characterService.getPlayerEntity();
        output = playerEntity ? this.engine.use(playerEntity.id!, targetName) : ['You do not exist.'];
        output.push(...this.enemyDecision.processEnemyTurns());
        break;
      case 'rest':
        output = this.handleRest();
        output.push(...this.enemyDecision.processEnemyTurns());
        break;
      case 'revive':
        output = this.handleRevive();
        output.push(...this.enemyDecision.processEnemyTurns());
        break;
      case 'reset':
        output = this.handleReset(targetName);
        break;
      default:
        this.log(`Unknown command: ${action}`);
    }
    output.forEach(line => this.log(line));
  }

  private handleAttack(targetName: string): string[] {
    const player = this.characterService.getPlayerEntity();
    const output: string[] = [];
    if (!player || player.isDead) {
      output.push('You are Dead and cannot attack.');
      return output;
    }

    const combatResults = this.engine.attack(player.id!, targetName);
    combatResults.forEach(result => output.push(result));
    return output;
  }

  private handleCast(commandArguments: string): void {
    const player = this.characterService.getPlayerEntity();
    if (!player || player.isDead) {
      this.log('You are Dead and cannot cast spells.');
      return;
    }

    const argumentParts = commandArguments.split(' ');
    let selectedSpell = null;
    let targetNameInput = '';

    for (let i = argumentParts.length; i > 0; i--) {
      const potentialName = argumentParts.slice(0, i).join('').toLowerCase();
      const found = player.spells.find(s =>
        s.name.toLowerCase().replace(/\s+/g, '') === potentialName ||
        s.typeid.toLowerCase() === potentialName
      );
      if (found) {
        selectedSpell = found;
        targetNameInput = argumentParts.slice(i).join(' ');
        break;
      }
    }

    if (!selectedSpell) {
      this.log(`You do not know that spell.`);
      return;
    }

    const combatResults = this.engine.cast(player.id!, selectedSpell, targetNameInput);
    combatResults.forEach(line => this.log(line));
  }

  private handleDrop(itemName: string): string[] {
    const player = this.characterService.getPlayerEntity();
    if (!player || player.isDead) return ['You are dead and cannot drop items.'];
    if (!itemName) return ['Drop what?'];

    let itemToDrop = player.items.find(inventoryItem =>
      inventoryItem.name.toLowerCase().includes(itemName.toLowerCase())
    );
    let unequipMessage: string | null = null;

    if (!itemToDrop) {
      for (const [slot, equipped] of player.equipment.entries()) {
        if (equipped && equipped.name.toLowerCase().includes(itemName.toLowerCase())) {
          itemToDrop = equipped;
          unequipMessage = `You unequip the ${equipped.name}.`;
          break;
        }
      }

      if (!itemToDrop) {
        return [`You are not carrying a "${itemName}".`];
      }
    }

    const messages: string[] = [];
    if (unequipMessage) messages.push(unequipMessage);
    messages.push(...this.engine.drop(player, itemToDrop));
    return messages;
  }

  private handleEquip(itemName: string): string[] {
    const player = this.characterService.getPlayerEntity();
    if (!player || player.isDead) return ['You are dead and cannot change equipment.'];
    if (!itemName) return ['Equip what?'];

    const itemToEquip = player.items.find(inventoryItem =>
        inventoryItem.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!itemToEquip) {
        return [`You are not carrying a "${itemName}".`];
    }
    const equipMessages = this.characterService.equipItem(player.id!, itemToEquip);
    return equipMessages;
}

  private handlePlace(input: string): string[] {
    const player = this.characterService.getPlayerEntity();
    if (!player || player.isDead) return ['You are dead and cannot place items.'];
    if (!input) return ['Place what?'];

    const parts = input.split(' in ');
    const itemName = parts[0];
    const featureName = parts[1];

    return this.engine.place(player, itemName, featureName);
  }

  handleSearch(targetName: string): string[] {
    const player = this.characterService.getPlayerEntity();
    if (!player || player.isDead) return ['You cannot search while dead.'];

    return this.engine.searchCorpse(player, targetName);
  }

  private handleTake(itemName: string): string[] {
    const player = this.characterService.getPlayerEntity();
    if (!player || player.isDead) return ['You are dead and cannot take items.'];
    if (!itemName) return ['Take what?'];

    return this.engine.take(player, itemName);
  }

  private handleRest(): string[] {
    const player = this.characterService.getPlayerEntity();
    if (!player || player.isDead) return ['You are dead and cannot rest.'];

    return this.engine.rest(player);
  }

  private handleRevive(): string[] {
    const player = this.characterService.getPlayerEntity();
    if (!player) return ['No player exists to revive.'];

    return this.engine.revive(player);
  }

  private handleReset(mapName: string): string[] {
    if (!mapName) return ['Reset what?'];
    return this.mapService.resetMap(mapName);
  }
}