import { CharacterModel } from '../character.model';
import { ItemModel } from '../../item/item.model';
import { d100, rollDice } from '../../utilities/dice.definitions';
import { ItemFactory } from '../../item/item.factory';
import { calculateCombatRating } from '../../utilities/combat.definitions';

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
        if ((item.maxStack ?? 0) > 1 || item.type === 'Consumable') {
            const stacked = stackConsumableItem(character, item, maxBackpackSize);
            acquired = acquired || stacked;
            continue;
        }

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

export function stackConsumableItem(character: CharacterModel, item: ItemModel, maxBackpackSize: number): boolean {
    const stackMax = item.maxStack ?? 5;
    let remainingQuantity = Math.max(1, item.quantity ?? 1);

    const matchingStacks = character.items.filter((inventoryItem: ItemModel) =>
        inventoryItem?.typeid === item.typeid &&
        (inventoryItem.quantity ?? 1) < (inventoryItem.maxStack ?? stackMax)
    );

    for (const stack of matchingStacks) {
        const currentStackQuantity = stack.quantity ?? 1;
        const availableSpace = (stack.maxStack ?? stackMax) - currentStackQuantity;
        if (availableSpace <= 0) continue;

        const transferAmount = Math.min(availableSpace, remainingQuantity);
        stack.quantity = currentStackQuantity + transferAmount;
        remainingQuantity -= transferAmount;

        if (remainingQuantity <= 0) {
            return true;
        }
    }

    let addedAny = false;
    while (remainingQuantity > 0 && character.items.length < maxBackpackSize) {
        const stackQuantity = Math.min(stackMax, remainingQuantity);
        const stackItem = new ItemModel({ ...item, quantity: stackQuantity });

        stackItem.quantity = stackQuantity;
        character.items.push(stackItem);

        remainingQuantity -= stackQuantity;
        addedAny = true;
    }

    return addedAny;
}

export function applyCombatRatingCalculation(character: CharacterModel): void {
    const healthComponent = character.maxHealth / 10;
    const armorComponent = (character.armor ?? 0);
    const healingComponent = 0.05 * calculatePotentialHealing(character);

    const avgWeaponDamage = getAverageWeaponDamage(character);
    const manaComponent = (character.baseMana / 10) * 3;
    const avgSpellDamage = getAverageSpellDamage(character);

    const physicalCR = calculateCombatRating({
        terms: {
            toHit: character.toHit,
            toDamage: character.toDamage,
            avgWeaponDamage,
            healthComponent,
            armorComponent,
            healingComponent,
        },
        round: (value) => value,
    });

    const magicalCR = calculateCombatRating({
        terms: {
            manaComponent,
            avgSpellDamage,
            healthComponent,
            armorComponent,
            healingComponent,
        },
        round: (value) => value,
    });

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
    const backpackItems = character.items.filter(item => {
        const type = (item?.type ?? '').toLowerCase();
        return type === 'consumable' || type === 'scroll';
    });

    const consumableHealing = backpackItems.reduce((sum, item) =>
        sum + calculateCombatRating({
            terms: {
                heals: item.heals,
                restores: item.restores,
            },
            weights: {
                heals: 0.2,
                restores: 0.15,
            },
            round: (value) => value,
        }), 0);

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
    if ((characterTemplate?.typeid ?? '').startsWith('player')) {
        lootCount = 0;
    }
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
    character.equippedItemTemplate = items
        .map((item) => item.typeid)
        .filter((typeid) => !!typeid);
    applyItemAcquisition(character, items, 100);
    applyCombatRatingCalculation(character);
}