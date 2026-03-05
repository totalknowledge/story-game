import { inject, Injectable } from '@angular/core';
import { CharacterService } from '../character/character.service';
import { CharacterModel } from '../character/character.model';
import { SpellModel } from '../spell/spell.model';
import { d100, rollDice } from '../utilities/dice.definitions';
import { ItemModel } from '../item/item.model';

@Injectable({
  providedIn: 'root',
})
export class CombatEngineService {
  private characterService = inject(CharacterService);
  private readonly MISS_THRESHOLD = 10;
  private readonly CRITICAL_THRESHOLD = 95;
  private readonly MANA_EFFECT_MULTIPLIER = 0.19;
  private readonly MANA_TOHIT_MULTIPLIER = 0.19;
  private readonly MANA_MISS_MULTIPLIER = 0.19;

  attack(attacker: CharacterModel, defender: CharacterModel): string[] {
    const combatLog: string[] = [];
    const weapon = attacker.equipment.get('right-hand');

    const rawRoll = Math.floor(Math.random() * 100) + 1;
    const modifiedRoll = rawRoll + (attacker.toHit ?? 0) - (defender.armor ?? 0);

    console.log(
      `[ATTACK] ${attacker.name} vs ${defender.name} | Roll: ${rawRoll} | +Hit: ${attacker.toHit ?? 0} | Armor: ${defender.armor ?? 0} | Result: ${modifiedRoll}`
    );

    if (this.isMiss(rawRoll, modifiedRoll)) {
      this.consumeEquippedArrows(attacker, combatLog);
      this.characterService.updateCharacter(attacker);
      combatLog.push(`${attacker.name} misses ${defender.name}.`);
      return combatLog;
    }

    const isCritical = this.isCrit(rawRoll, modifiedRoll);
    const damageDealt = this.calculateDamage(attacker, weapon, isCritical);

    defender.damage += damageDealt;

    const hitType = isCritical ? 'critically hits' : 'hits';
    combatLog.push(`${attacker.name} ${hitType} ${defender.name} for ${damageDealt} damage!`);

    if (defender.isDead) {
      defender.dead = true;
      combatLog.push(`${defender.name} has been slain!`);
    }

    this.consumeEquippedArrows(attacker, combatLog);
    this.characterService.updateCharacter(attacker);
    this.characterService.updateCharacter(defender);
    return combatLog;
  }

  cast(caster: CharacterModel, spell: SpellModel, enemies: CharacterModel[], allies: CharacterModel[]): string[] {
    const combatLog: string[] = [];
    const bonusEffect = Math.round((caster.maxMana ?? 0) * this.MANA_EFFECT_MULTIPLIER);

    caster.usedMana += spell.manaCost;

    const castTemplate = spell.castMessages[0];

    const hasTargetPlaceholder = castTemplate.includes('{target}');
    const userReplacedTemplate = castTemplate.replace('{user}', caster.name);

    combatLog.push(userReplacedTemplate);

    if (spell.effect === 'heal') {
      const healAmount = rollDice(1, spell.healsUser || 0) + bonusEffect;
      caster.damage = Math.max(0, caster.damage - healAmount);
      combatLog.push(`${spell.name} restores ${healAmount} health to ${caster.name}!`);
    } else {
      enemies.forEach((target, index) => {
        const isHalfDamage = index > 0 && spell.effect === 'additional-target';

        if (hasTargetPlaceholder) {
          combatLog.push(userReplacedTemplate.replace('{target}', target.name));
        }

        combatLog.push(...this.resolveSpellEffect(caster, target, spell, isHalfDamage));
        this.characterService.updateCharacter(target);
      });

      if (spell.effect === 'area' && spell.healsUser) {
        const healAmount = rollDice(1, spell.healsUser) + bonusEffect;
        caster.damage = Math.max(0, caster.damage - healAmount);
        combatLog.push(`${spell.name} mends ${caster.name}'s wounds for ${healAmount}!`);
      }

      if (spell.effect === 'vampiric' && spell.healsUser) {
        const healAmount = rollDice(1, spell.healsUser) + bonusEffect;
        caster.damage = Math.max(0, caster.damage - healAmount);
        combatLog.push(`${spell.name} siphons life from the enemies, mending ${caster.name}'s wounds for ${healAmount}!`);
      }
    }

    this.characterService.updateCharacter(caster);
    return combatLog;
  }

  private calculateDamage(attacker: CharacterModel, weapon: ItemModel | undefined, isCritical: boolean): number {
    const damageDie = weapon?.damage || 2;
    const rollResult = rollDice(1, damageDie);
    const bonusDamage = attacker.toDamage || 0;
    const baseDamage = rollResult + bonusDamage;
    const criticalMultiplier = isCritical ? 1.5 : 1;
    const finalDamage = Math.max(1, Math.round(baseDamage * criticalMultiplier));

    console.log(
      `[DAMAGE] ${attacker.name} | Roll: ${rollResult} (1d${damageDie}) | +Damage: ${bonusDamage} | Crit: ${isCritical} | Final: ${finalDamage}`
    );

    return finalDamage;
  }

  private isMiss(rawRoll: number, modifiedRoll: number): boolean {
    if (rawRoll === 1) return true;
    if (rawRoll === 100) return false;
    return modifiedRoll <= this.MISS_THRESHOLD;
  }

  private isCrit(rawRoll: number, modifiedRoll: number): boolean {
    if (rawRoll === 1) return false;
    if (rawRoll === 100) return true;
    return modifiedRoll >= this.CRITICAL_THRESHOLD;
  }

  private resolveSpellEffect(caster: CharacterModel, target: CharacterModel, spell: SpellModel, isSecondary: boolean): string[] {
    const spellHitRoll = d100();
    const hitBonus = Math.round(caster.maxMana * this.MANA_TOHIT_MULTIPLIER);
    const targetEvasion = Math.round((target.maxMana ?? 0) * this.MANA_MISS_MULTIPLIER);
    const bonusDamage = Math.round((caster.maxMana ?? 0) * this.MANA_EFFECT_MULTIPLIER);
    const spellModifiedRoll = Math.max(1, (spellHitRoll + hitBonus - targetEvasion));

    console.log(
      `[SPELL HIT] ${spell.name} | Roll: ${spellHitRoll} | Mana +Hit: ${hitBonus} | Spell Armor: ${targetEvasion} | Result: ${spellModifiedRoll}`
    );

    if (this.isMiss(spellHitRoll, spellModifiedRoll)) {
      return [`${target.name} resists the effects of ${spell.name}.`];
    }

    const isCritical = this.isCrit(spellHitRoll, spellModifiedRoll);

    let damageDealt = rollDice(1, spell.damage) + bonusDamage;
    if (isSecondary) damageDealt = damageDealt / 2;
    if (isCritical) damageDealt = damageDealt * 1.5;

    const finalDamage = Math.max(1, Math.round(damageDealt));

    console.log(
      `[SPELL DAMAGE] ${spell.name} | Base: ${spell.damage} | Mana +Dmg: ${bonusDamage} | Secondary: ${isSecondary} | Final: ${finalDamage}`
    );

    target.damage += finalDamage;

    const hitType = isCritical ? 'critically blasts' : 'hits';
    const resultMessage = `${spell.name} ${hitType} ${target.name} for ${finalDamage} damage!`;

    if (target.isDead) {
      target.dead = true;
      return [resultMessage, `${target.name} has been killed!`];
    }

    return [resultMessage];
  }

  private consumeEquippedArrows(attacker: CharacterModel, combatLog: string[]): void {
    const equippedRightHand = attacker.equipment.get('right-hand') as ItemModel | undefined;
    if (!equippedRightHand || equippedRightHand.typeid !== 'ammo-arrows') {
      return;
    }

    const currentQuantity = equippedRightHand.quantity ?? 1;
    const updatedQuantity = currentQuantity - 1;

    if (updatedQuantity > 0) {
      equippedRightHand.quantity = updatedQuantity;
      return;
    }

    attacker.equipment.delete('right-hand');

    const backpackArrowIndex = attacker.items.findIndex((item: ItemModel) =>
      item?.typeid === 'ammo-arrows' && (item.quantity ?? 0) > 0
    );

    if (backpackArrowIndex === -1) {
      return;
    }

    const replacementArrows = attacker.items[backpackArrowIndex] as ItemModel;
    attacker.items.splice(backpackArrowIndex, 1);
    attacker.equipment.set('right-hand', replacementArrows);
    combatLog.push(`${attacker.name} equips another bundle of arrows.`);
  }
}
