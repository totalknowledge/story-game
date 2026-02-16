import { describe, it, expect } from 'vitest';
import { applyBonusCalculation } from './character.rules';
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
});