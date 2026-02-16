import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../character/character.service';
import { Character } from '../character/character';
import { MapService } from '../map/map.service';

@Component({
  selector: 'app-player',
  imports: [CommonModule, Character],
  templateUrl: './player.html'
})
export class Player {
  private characterService = inject(CharacterService);
  private mapService = inject(MapService);

  player = this.characterService.getPlayer();

  constructor() {
    this.mapService.loadMap('town');

    const currentPlayer = this.player();
    const currentRoom = this.mapService.currentRoom();

    if (currentPlayer && currentRoom?.coordinates) {
      this.characterService.movePlayer(currentRoom.coordinates);
    }
  }
}