import { Component, inject } from '@angular/core';
import { CharacterService } from '../character/character.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  characterService = inject(CharacterService);

  constructor() {
    this.resetGame();
  }

  resetGame() {
    this.characterService.spawnCharacter('player');
  }
}
