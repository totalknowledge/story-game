import { Injectable, signal, inject } from '@angular/core';
import { GameEngineService } from '../game-engine/game-engine.service';
import { CharacterService } from '../character/character.service';

@Injectable({ providedIn: 'root' })
export class ConsoleService {
  private engine = inject(GameEngineService);
  private characterService = inject(CharacterService);
  readonly messages = signal<string[]>(['System initialized...', 'Welcome, adventurer.']);

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

    switch (action) {
      case 'help':
        this.log('Commands: north, south, east, west, look, loot, equip [item], attack [enemy]');
        break;
      case 'attack':
        this.handleAttack(targetName);
        break;
      case 'cast':
        this.handleCast(targetName);
        break;
      case 'look':
        this.engine.lookAround();
        break;
      case 'north': case 'south': case 'east': case 'west':
        this.engine.movePlayer(action);
        break;
      default:
        this.log(`Unknown command: ${action}`);
    }
  }

  private handleAttack(targetName: string): void {
    const player = this.characterService.getPlayer()();
    if (!player || player.isDead) {
      this.log('You are Dead and cannot attack.');
      return;
    }

    if (!targetName) {
      this.log('Attack whom?');
      return;
    }

    const roomEnemies = this.characterService.getActiveEnemies();
    const target = roomEnemies.find(enemy =>
      enemy.name.toLowerCase().includes(targetName) && !enemy.isDead
    );

    if (!target) {
      this.log(`There is no "${targetName}" here to attack.`);
      return;
    }

    const combatResults = this.engine.attack(player, target);
    combatResults.forEach(result => this.log(result));
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
}