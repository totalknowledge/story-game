import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../character/character.service';
import { Character } from '../character/character';

@Component({
  selector: 'app-player',
  imports: [CommonModule, Character],
  templateUrl: './player.html'
})
export class Player {
  private characterService = inject(CharacterService);

  player = this.characterService.getPlayer();

  constructor() {
    this.characterService.spawnCharacter('player');
  }
}