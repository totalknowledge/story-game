import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterModel } from './character.model';

@Component({
  selector: 'app-character',
  imports: [CommonModule],
  templateUrl: './character.html'
})
export class Character {
  character = input.required<CharacterModel>();

  healthPercentage = computed(() => {
    const char = this.character();
    return (char.currentHealth / char.maxHealth) * 100;
  });

  manaPercentage = computed(() => {
    const char = this.character();
    return char.maxMana > 0 ? (char.currentMana / char.maxMana) * 100 : 0;
  });

  isPlayer = computed(() => this.character().typeid === 'player');
}
