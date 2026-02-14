import { Injectable } from '@angular/core';
import { SpellModel } from './spell.model';
import { SPELL_TEMPLATES } from './spell.definitions';
import { pickRandom } from '../utilities/dice.definitions';

@Injectable({
  providedIn: 'root',
})
export class SpellFactory {
  
  createSpell(typeid: string): SpellModel {
    const template = SPELL_TEMPLATES.find((t) => t.typeid === typeid);
    
    if (!template) {
      return new SpellModel({ 
        typeid: 'unknown', 
        name: 'Fizzle', 
        manaCost: 0, 
        castMessages: ['The magic sputters and dies.'] 
      });
    }

    return new SpellModel(template);
  }

  getRandomSpell(manaCap?: number): SpellModel {
    const templates = manaCap ? 
      SPELL_TEMPLATES.filter(template => template.manaCost <= manaCap) :
      SPELL_TEMPLATES;
    const randomSpell = pickRandom(templates);
    return new SpellModel(randomSpell);
  }
}