import { CharacterModel } from '../character.model';
import { ItemModel } from '../../item/item.model';
import { rollDice } from '../../utilities/dice.definitions';
import { ItemFactory } from '../../item/item.factory';

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

export function applyEquipItem(character: CharacterModel, item: ItemModel): boolean {
    const targetSlot = item.equippableLocation;
    if (!targetSlot || targetSlot === 'none') return false;
    const currentlyEquippedItem = character.equipment.get(targetSlot);
    
    const isBeastOrSlime = character.type === 'Beast' || character.type === 'Slime';
    if (isBeastOrSlime && currentlyEquippedItem?.type === 'Natural') {
        return false;
    }
    
    character.items = character.items.filter(inventoryItem => inventoryItem !== item);
    if (currentlyEquippedItem) {
        character.items.push(currentlyEquippedItem);
    }
    character.equipment.set(targetSlot, item);

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
        const slot = item.equippableLocation;
        if (slot && slot !== 'none' && !character.equipment.get(slot)) {
            const equipped = applyEquipItem(character, item);
            if (equipped) {
                acquired = true;
                continue;
            }
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
    const armorComponent = (character.armor ?? 0);
    const healingComponent = 0.05 * calculatePotentialHealing(character);

    const avgWeaponDamage = getAverageWeaponDamage(character);
    const physicalCR =
        (character.toHit ?? 0) +
        (character.toDamage ?? 0) +
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

    character.combatRating = Math.round(Math.max(physicalCR, magicalCR));
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

export function equipCharacter(character: CharacterModel, CRTarget: number, itemFactory: ItemFactory, characterTemplate?: any): void {
    let items: ItemModel[] = [];

    if (characterTemplate?.equippedItemTemplate) {
        characterTemplate.equippedItemTemplate?.forEach((item: Partial<ItemModel>) => {
            items.push(new ItemModel(item));
        });
    } else {
        items.push(itemFactory.createRandomItem(['Weapon']));
    }

    let lootCount = rollDice(1, Math.ceil(character.maxHealth / 10));
    if (character.classification === 'elite') {
        lootCount++;
    } else if (character.classification === 'unique') {
        lootCount += 2;
    }

    for (let i = 0; i < lootCount; i++) {
        if (character.classification === 'unique' && i === 0) {
            items.push(itemFactory.createRandomItem(['Weapon', 'Armor', 'Trinket', 'Scroll', 'SpellBook']));
        } else if (character.classification === 'elite' && i === 0) {
            items.push(itemFactory.createRandomItem(['Weapon', 'Armor', 'Trinket']));
        } else {
            items.push(itemFactory.createRandomItem());
        }
    }

    if (items[0]?.typeid === 'weapon-bow-short') {
        items.push(itemFactory.createItem('ammo-arrows'));
    }
    character.equippedItemTemplate ??= [];
    items.forEach((item) => {
        character.equippedItemTemplate?.push(item.typeid);
    })
    applyItemAcquisition(character, items, 100);
    applyCombatRatingCalculation(character);
}