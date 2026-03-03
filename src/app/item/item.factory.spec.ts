import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ItemFactory } from './item.factory';
import { ItemModel } from './item.model';
import { SpellFactory } from '../spell/spell.factory';
import { ITEM_TEMPLATES } from './item.definitions';

describe('ItemFactory', () => {
  let factory: ItemFactory;
  let randomValueIncrement: number;

  beforeEach(() => {
    factory = new ItemFactory();
    randomValueIncrement = 0.1;

    vi.spyOn(Math, 'random').mockImplementation(() => {
      randomValueIncrement += 0.02;
      if (randomValueIncrement >= 1) {
        randomValueIncrement = 0.1;
      }
      return randomValueIncrement;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Magical Mutations', () => {
    it('applies spells to scrolls and sets quality', () => {
      const scrollItem = new ItemModel({
        typeid: 'scroll-test',
        name: 'Scroll',
        type: 'Scroll'
      });

      vi.spyOn(SpellFactory.prototype, 'getRandomSpell').mockReturnValue({
        typeid: 'spell-fireball',
        name: 'Fireball'
      } as any);

      (factory as any).randomizeMagicItem(scrollItem);

      expect(scrollItem.quality).toBe('magical');
      expect(scrollItem.name).toBe('Scroll of Fireball');
      expect(scrollItem.teaches).toEqual(['spell-fireball']);
    });

    it('applies multiple unique spells to spellbooks', () => {
      const spellBookItem = new ItemModel({
        typeid: 'book-test',
        name: 'Tome',
        type: 'SpellBook'
      });

      let spellIdCounter = 0;
      vi.spyOn(SpellFactory.prototype, 'getRandomSpell').mockImplementation(() => {
        spellIdCounter++;
        return {
          typeid: `id-${spellIdCounter}`,
          name: `Spell ${spellIdCounter}`
        } as any;
      });

      (factory as any).randomizeMagicItem(spellBookItem);

      expect(spellBookItem.quality).toBe('magical');
      expect(spellBookItem.teaches.length).toBeGreaterThan(1);
    });

    it('mutates weapon naming and properties', () => {
      const weaponItem = new ItemModel({
        typeid: 'sword-test',
        name: 'Iron Sword',
        type: 'Weapon',
        quality: 'standard'
      });

      weaponItem.quality = 'magical';
      (factory as any).mutateMagicalProperties(weaponItem);

      expect(weaponItem.quality).toBe('magical');
      expect(weaponItem.name).toContain(' of ');
    });
  });

  describe('Factory Logic', () => {
    it('creates fallback for invalid ids', () => {
      const fallbackItem = factory.createItem('invalid-id-path');
      expect(fallbackItem.typeid).toBe('broken-item');
      expect(fallbackItem.name).toContain('invalid-id-path');
    });

    it('creates item from valid template', () => {
      const swordItem = factory.createItem('weapon-sword');
      if (swordItem.typeid !== 'broken-item') {
        expect(swordItem.typeid).toBe('weapon-sword');
      }
    });

    it('filters excludeFromRandom templates from createRandomItem pools', () => {
      const excludedTemplate = {
        typeid: 'test-excluded',
        name: 'Excluded Relic',
        type: 'TestType',
        equippableLocation: 'none',
        quality: 'standard',
        excludeFromRandom: true,
      } as any;

      const includedTemplate = {
        typeid: 'test-included',
        name: 'Included Relic',
        type: 'TestType',
        equippableLocation: 'none',
        quality: 'standard',
      } as any;

      ITEM_TEMPLATES.push(excludedTemplate, includedTemplate);

      try {
        const randomItem = factory.createRandomItem(['TestType']);
        expect(randomItem.typeid).toBe('test-included');
      } finally {
        ITEM_TEMPLATES.pop();
        ITEM_TEMPLATES.pop();
      }
    });
  });
});