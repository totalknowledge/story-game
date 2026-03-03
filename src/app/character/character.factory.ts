import { inject, Injectable } from '@angular/core';
import { CharacterModel } from './character.model';
import { ENEMY_TEMPLATES } from './character.definitions';
import { d100, pickRandom } from '../utilities/dice.definitions';
import { equipCharacter } from './rules/character.rules';
import { SpellFactory } from '../spell/spell.factory';
import { ItemFactory } from '../item/item.factory';
import { NameService } from '../services/name.service';

@Injectable({
  providedIn: 'root',
})
export class CharacterFactory {
  private itemFactory = inject(ItemFactory);
  private spellFactory = inject(SpellFactory);
  private nameService = inject(NameService);

  createCharacter(type = 'enemy', name?: string, targetCR?: number): CharacterModel {
    const characterTemplate = this.buildTemplate(type, name);
    const character = new CharacterModel(
      characterTemplate.name,
      characterTemplate.baseHealth,
      characterTemplate.baseMana,
      characterTemplate
    );

    this.seedSpells(character, characterTemplate);
    const crTarget = type === 'player' ? 9 : (targetCR ?? 9);
    equipCharacter(character, crTarget, this.itemFactory, characterTemplate);

    return character;
  }

  private buildTemplate(type: string, name?: string): any {
    const characterName = name ?? (type === 'player'
      ? this.nameService.getHeroName('male').name
      : this.nameService.getEnemyName().name);

    if (type === 'player') {
      return {
        name: characterName,
        baseHealth: 20,
        baseMana: 10,
        typeid: 'player'
      };
    }

    const classifyCheck = d100();
    const classification = classifyCheck <= 1 ? 'unique' : classifyCheck <= 10 ? 'elite' : 'normal';

    const filteredTemplates = ENEMY_TEMPLATES.filter(template =>
      template.typeid?.startsWith(type)
    );
    const templates = filteredTemplates.length > 0 ? filteredTemplates : ENEMY_TEMPLATES;
    let characterTemplate = pickRandom(templates);

    if (classification === 'unique') {
      characterTemplate = {
        ...characterTemplate,
        name: characterName,
        baseHealth: Math.round(characterTemplate.baseHealth * 1.3),
        baseMana: Math.round(characterTemplate.baseMana * 1.3),
        named: true,
        classification
      };
    } else if (classification === 'elite') {
      characterTemplate = {
        ...characterTemplate,
        name: `Elite ${characterTemplate.name}`,
        baseHealth: Math.round(characterTemplate.baseHealth * 1.6),
        baseMana: Math.round(characterTemplate.baseMana * 1.6),
        classification
      };
    } else {
      characterTemplate = { ...characterTemplate, classification };
    }

    return characterTemplate;
  }

  private seedSpells(character: CharacterModel, characterTemplate?: any): void {
    if (!character) return;

    const minimumSpellCount = Math.ceil((character.baseMana || 0) / 10);
    const existingSpellIds = new Set(character.spells.map(spell => spell.typeid));

    if (character.typeid === 'player' && !existingSpellIds.has('spell-magic-missile')) {
      character.spells.push(this.spellFactory.createSpell('spell-magic-missile'));
      existingSpellIds.add('spell-shocking-grasp');
    }

    if (characterTemplate?.spellTypeids && Array.isArray(characterTemplate.spellTypeids)) {
      characterTemplate.spellTypeids.forEach((spellId: string) => {
        if (!existingSpellIds.has(spellId)) {
          character.spells.push(this.spellFactory.createSpell(spellId));
          existingSpellIds.add(spellId);
        }
      });
    }

    while (character.spells.length < minimumSpellCount) {
      const randomSpell = this.spellFactory.getRandomSpell(Math.round(character.baseMana / 3));
      if (!existingSpellIds.has(randomSpell.typeid)) {
        character.spells.push(randomSpell);
        existingSpellIds.add(randomSpell.typeid);
      }
    }
  }
}