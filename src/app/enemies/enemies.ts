import { Component, inject } from '@angular/core';
import { CharacterService } from '../character/character.service';
import { Character } from '../character/character';
import { rollDice } from '../utilities/dice.definitions';

@Component({
  selector: 'app-enemies',
  imports: [Character],
  templateUrl: './enemies.html',
  styleUrl: './enemies.css',
})
export class Enemies {
  private characterService = inject(CharacterService);
  public enemies = this.characterService.enemiesInRoom();

  constructor() {
    for (let i = 0; i < rollDice(1, 3); i++) {
      this.characterService.spawnCharacter('enemy');
    }
  }
}