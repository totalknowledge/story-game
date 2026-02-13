import { Injectable, signal, inject } from '@angular/core';
import { GameEngineService } from '../game-engine/game-engine.service';

@Injectable({ providedIn: 'root' })
export class ConsoleService {
  private engine = inject(GameEngineService);
  readonly messages = signal<string[]>(['System initialized...', 'Welcome, adventurer.']);

  log(message: string): void {
    this.messages.update(previous => [...previous, message]);
  }

  execute(input: string): void {
    const raw = input.trim();
    if (!raw) return;

    this.log(`> ${raw}`);

    const parts = raw.toLowerCase().split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        this.log('Commands: north, south, east, west, look, loot, equip [item]');
        break;
      case 'look':
        this.engine.lookAround();
        break;
      case 'north': case 'south': case 'east': case 'west':
        this.engine.movePlayer(command);
        break;
      default:
        this.log(`Unknown command: ${command}`);
    }
  }
}