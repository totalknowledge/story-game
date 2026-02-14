import { Component, computed, inject, Signal } from '@angular/core';
import { CharacterService } from '../character/character.service';
import { CharacterModel } from '../character/character.model';
import { rollDice } from '../utilities/dice.definitions';
import { Character } from '../character/character';

@Component({
  selector: 'app-enemies',
  imports: [Character],
  templateUrl: './enemies.html',
  styleUrl: './enemies.css',
})
export class Enemies {
  private characterService = inject(CharacterService);
  public enemies: Signal<CharacterModel>[] = [];

  constructor() {
    for (let i = 0; i < rollDice(1, 3); i++) {
      this.enemies.push(this.characterService.spawnCharacter('enemy'));
      console.log('images/' + this.enemies[i]().typeid + '.png');
    }
  }

  public sortedEnemies = () => {
    return [...this.enemies].sort((signalA, signalB) => {
      const alpha = signalA();
      const beta = signalB();

      if (alpha.isDead !== beta.isDead) {
        return alpha.isDead ? 1 : -1;
      }

      return alpha.currentHealth - beta.currentHealth;
    });
  };
}
