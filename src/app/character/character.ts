import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterModel } from './character.model';
import { EQUPEMENT_SLOTS } from './character.definitions';
import { Tooltip } from './tooltip/tooltip';
import * as utilities from '../utilities/dice.definitions';

@Component({
  selector: 'app-character',
  imports: [CommonModule, Tooltip],
  templateUrl: './character.html'
})
export class Character {
  character = input.required<CharacterModel>();
  equipementSlots = EQUPEMENT_SLOTS;

  isPlayer = computed(() => this.character().typeid === 'player');

  log = utilities.log;

  canCastSpell(spell: { manaCost?: number }): boolean {
    return this.character().currentMana >= (spell?.manaCost ?? 0);
  }
}
