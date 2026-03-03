import { describe, it, expect } from 'vitest';
import { applyBonusCalculation, applyCombatRatingCalculation, applyItemAcquisition } from './character.rules';
import { CharacterModel } from '../character.model';
import { ItemModel } from '../../item/item.model';

describe('Character Rules', () => {
    describe('applyBonusCalculation', () => {
        it('should calculate bonuses correctly', () => {
            const character = new CharacterModel('Test', 100, 50);
            const item1 = new ItemModel({ name: 'Sword', plusHit: 5, plusDamage: 10, equippableLocation: 'hand' });
            const item2 = new ItemModel({ name: 'Shield', plusArmor: 3, equippableLocation: 'offhand' });

            character.equipment.set('hand', item1);
            character.equipment.set('offhand', item2);

            const updatedCharacter = applyBonusCalculation(character);

            expect(updatedCharacter.toHit).toBe(5);
            expect(updatedCharacter.toDamage).toBe(10);
            expect(updatedCharacter.armor).toBe(3);
        });
    });

    describe('applyCombatRatingCalculation', () => {
        it('only counts consumables and scrolls from backpack toward sustain', () => {
            const baseCharacter = new CharacterModel('Test', 100, 20, { typeid: 'player' });
            const equippedWeapon = new ItemModel({
                typeid: 'weapon-test',
                name: 'Training Sword',
                type: 'Weapon',
                damage: 6,
                equippableLocation: 'right-hand'
            });

            baseCharacter.equipment.set('right-hand', equippedWeapon);
            applyBonusCalculation(baseCharacter);

            const backpackWeapon = new ItemModel({
                typeid: 'weapon-backpack',
                name: 'Backpack Axe',
                type: 'Weapon',
                heals: 999,
                restores: 999,
                equippableLocation: 'right-hand'
            });

            baseCharacter.items = [backpackWeapon];
            applyCombatRatingCalculation(baseCharacter);
            const crWithBackpackWeapon = baseCharacter.combatRating;

            const consumable = new ItemModel({
                typeid: 'consumable-potion',
                name: 'Potion',
                type: 'Consumable',
                heals: 20,
                equippableLocation: 'none'
            });

            baseCharacter.items = [backpackWeapon, consumable];
            applyCombatRatingCalculation(baseCharacter);
            const crWithConsumable = baseCharacter.combatRating;

            expect(crWithBackpackWeapon).toBeLessThan(crWithConsumable!);
        });
    });

    describe('applyItemAcquisition', () => {
        it('stacks duplicate consumables up to five per stack', () => {
            const character = new CharacterModel('Test', 20, 0);
            character.items.push(new ItemModel({
                typeid: 'potion-health',
                name: 'Health Potion',
                type: 'Consumable',
                equippableLocation: 'none',
                quantity: 4,
            }));

            const incomingPotion = new ItemModel({
                typeid: 'potion-health',
                name: 'Health Potion',
                type: 'Consumable',
                equippableLocation: 'none',
            });

            applyItemAcquisition(character, [incomingPotion], 10);

            expect(character.items.length).toBe(1);
            expect(character.items[0].quantity).toBe(5);
        });

        it('creates a new stack when the existing consumable stack is full', () => {
            const character = new CharacterModel('Test', 20, 0);
            character.items.push(new ItemModel({
                typeid: 'potion-health',
                name: 'Health Potion',
                type: 'Consumable',
                equippableLocation: 'none',
                quantity: 5,
            }));

            const incomingPotion = new ItemModel({
                typeid: 'potion-health',
                name: 'Health Potion',
                type: 'Consumable',
                equippableLocation: 'none',
            });

            applyItemAcquisition(character, [incomingPotion], 10);

            expect(character.items.length).toBe(2);
            expect(character.items[1].quantity).toBe(1);
        });
    });
});