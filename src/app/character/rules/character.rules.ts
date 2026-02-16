import { CharacterModel } from '../character.model';
import { ItemModel } from '../../item/item.model';

export function applyBonusCalculation(character: CharacterModel): CharacterModel {
    let toHit = 0;
    let toDamage = 0;
    let armor = 0;
    let bonusHealth = 0;
    let bonusMana = 0;

    for (const equippedItem of character.equipment.values()) {
        if (!equippedItem) continue;

        toHit += equippedItem.plusHit ?? 0;
        toDamage += equippedItem.plusDamage ?? 0;
        armor += equippedItem.plusArmor ?? 0;

        bonusHealth += equippedItem.bonusHealth ?? 0;
        bonusMana += equippedItem.bonusMana ?? 0;
    }

    character.toHit = toHit;
    character.toDamage = toDamage;
    character.armor = armor;

    character.maxHealth = character.baseHealth + bonusHealth;
    character.maxMana = character.baseMana + bonusMana;

    return character;
}

export function applyEquipItem(
    character: CharacterModel,
    item: ItemModel
): boolean {
    const slot = item.equippableLocation;

    if (!slot || slot === 'none') return false;
    if (character.equipment.has(slot)) return false;

    character.equipment.set(slot, item);
    character.items = character.items.filter(existingItem => existingItem !== item);

    applyBonusCalculation(character);
    return true;
}

export function applyItemAcquisition(
    character: CharacterModel,
    items: ItemModel[],
    maxBackpackSize: number
): any {
    let acquired = false;

    for (const item of items) {
        const equipped = applyEquipItem(character, item);
        if (equipped) {
            acquired = true;
            continue;
        }

        if (character.items.length < maxBackpackSize) {
            character.items.push(item);
            acquired = true;
        }
    }

    return { updatedCharacter: character, acquired };
}

export function applyCombatRatingCalculation(character: CharacterModel): void {
    const healthComponent = character.maxHealth / 10;
    const armorComponent = character.armor;
    const healingComponent = 0.05 * calculatePotentialHealing(character);

    const avgWeaponDamage = getAverageWeaponDamage(character);
    const physicalCR =
        character.toHit +
        character.toDamage +
        avgWeaponDamage +
        healthComponent +
        armorComponent +
        healingComponent;

    const manaComponent = (character.baseMana / 10) * 3;
    const avgSpellDamage = getAverageSpellDamage(character);
    const magicalCR =
        manaComponent +
        avgSpellDamage +
        healthComponent +
        armorComponent +
        healingComponent;

    character.combatRating = Math.max(physicalCR, magicalCR);
}

function getAverageWeaponDamage(character: CharacterModel): number {
    const weapon = character.equipment.get('right-hand');
    return weapon?.damage ?? 1;
}

function getAverageSpellDamage(character: CharacterModel): number {
    if (character.spells.length === 0) return 0;

    const totalDamage = character.spells.reduce((sum, spell) => sum + (spell.damage ?? 0), 0);
    return totalDamage / character.spells.length;
}

function calculatePotentialHealing(character: CharacterModel): number {
    const consumableHealing = character.items.reduce((sum, item) =>
        sum + (item.heals ?? 0), 0);

    const spellHealing = character.spells.reduce((sum, spell) => {
        if ((spell.healsUser ?? 0) > 0) {
            const timesCastable = Math.floor(character.maxMana / spell.manaCost);
            return sum + (spell.healsUser * timesCastable);
        }
        return sum;
    }, 0);

    return consumableHealing + spellHealing;
}