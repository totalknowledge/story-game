import { Injectable, signal, inject } from '@angular/core';
import { GameEngineService } from '../game-engine/game-engine.service';
import { CharacterService } from '../character/character.service';

@Injectable({ providedIn: 'root' })
export class ConsoleService {
  private engine = inject(GameEngineService);
  private characterService = inject(CharacterService);
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
        output = ['Commands: north, south, east, west, look, search, equip [item], attack [enemy]'];
        break;
      case 'attack':
        output = this.handleAttack(targetName);
        break;
      case 'cast':
        this.handleCast(targetName);
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
      case 'search':
        output = this.handleSearch(targetName);
        break;
      default:
        this.log(`Unknown command: ${action}`);
    }
    output.forEach(line => this.log(line));
  }

  private handleAttack(targetName: string): string[] {
    const player = this.characterService.getPlayer()();
    const output: string[] = [];
    if (!player || player.isDead) {
      output.push('You are Dead and cannot attack.');
      return output;
    }

    if (!targetName) {
      output.push('Attack whom?');
      return output;
    }

    const roomEnemies = this.characterService.getActiveEnemies();
    const target = roomEnemies.find(enemy =>
      enemy.name.toLowerCase().includes(targetName) && !enemy.isDead
    );

    if (!target) {
      output.push(`There is no "${targetName}" here to attack.`);
      return output;
    }

    const combatResults = this.engine.attack(player, target);
    combatResults.forEach(result => output.push(result));
    return output;
  }

  private handleCast(commandArguments: string): void {
    const player = this.characterService.getPlayer()();
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

    const potentialTarget = this.characterService.getActiveEnemies().find(enemy =>
      enemy.name.toLowerCase().includes(targetNameInput.toLowerCase()) && !enemy.isDead
    );

    const combatResults = this.engine.cast(player, selectedSpell, potentialTarget);
    combatResults.forEach(line => this.log(line));
  }

  private handleEquip(itemName: string): string[] {
    const player = this.characterService.getPlayer()();
    if (!player || player.isDead) return ['You are dead and cannot change equipment.'];
    if (!itemName) return ['Equip what?'];

    const itemToEquip = player.items.find(inventoryItem =>
      inventoryItem.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!itemToEquip) {
      return [`You are not carrying a "${itemName}".`];
    }

    return this.characterService.equipItem(player.id, itemToEquip);
  }

  handleSearch(targetName: string): string[] {
    const player = this.characterService.getPlayer()();
    if (!player || player.isDead) return ['You cannot search while dead.'];

    return this.engine.searchCorpse(player, targetName);
  }
}