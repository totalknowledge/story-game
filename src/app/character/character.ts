import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterModel } from './character.model';
import { EQUPEMENT_SLOTS } from './character.definitions';

@Component({
  selector: 'app-character',
  imports: [CommonModule],
  templateUrl: './character.html'
})
export class Character {
  character = input.required<CharacterModel>();
  equipementSlots = EQUPEMENT_SLOTS;

  isPlayer = computed(() => this.character().typeid === 'player');
}
