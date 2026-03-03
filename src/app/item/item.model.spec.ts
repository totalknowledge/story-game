import { ItemModel } from './item.model';

describe('ItemModel', () => {
  const fixedUuid = '00000000-0000-0000-0000-000000000000';

  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => fixedUuid } as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('constructs with defaults and generates an id', () => {
    const item = new ItemModel({
      typeid: 'weapon-sword',
      name: 'Sword',
      type: 'Weapon',
    });

    expect(item.id).toBe(fixedUuid);
    expect(item.typeid).toBe('weapon-sword');
    expect(item.name).toBe('Sword');
    expect(item.type).toBe('Weapon');

    expect(item.equippableLocation).toBe('none');
    expect(item.damage).toBe(0);
    expect(item.resilience).toBe(999);

    expect(item.bonusHealth).toBe(0);
    expect(item.bonusMana).toBe(0);
    expect(item.heals).toBe(0);
    expect(item.restores).toBe(0);

    expect(item.plusHit).toBe(0);
    expect(item.plusArmor).toBe(0);
    expect(item.minusToBeHit).toBe(0);
    expect(item.plusDamage).toBe(0);

    expect(item.useMessages).toEqual([]);
    expect(item.teaches).toEqual([]);

    expect(item.baseCost).toBe(1);
    expect(item.quantity).toBeUndefined();
    expect(item.quality).toBe('standard');
  });

  it('uses provided values including arrays', () => {
    const item = new ItemModel({
      typeid: 'scroll-fire',
      name: 'Scroll of Fire',
      type: 'Scroll',
      equippableLocation: 'none',
      damage: 7,
      resilience: 12,
      bonusHealth: 5,
      bonusMana: 11,
      heals: 30,
      restores: 20,
      plusHit: 2,
      plusArmor: 3,
      minusToBeHit: 4,
      plusDamage: 6,
      useMessages: ['You read the scroll.'],
      teaches: ['spell-fireball'],
      baseCost: 9,
      quantity: 2,
      quality: 'fine',
    });

    expect(item.damage).toBe(7);
    expect(item.resilience).toBe(12);
    expect(item.bonusHealth).toBe(5);
    expect(item.bonusMana).toBe(11);
    expect(item.heals).toBe(30);
    expect(item.restores).toBe(20);
    expect(item.plusHit).toBe(2);
    expect(item.plusArmor).toBe(3);
    expect(item.minusToBeHit).toBe(4);
    expect(item.plusDamage).toBe(6);
    expect(item.useMessages).toEqual(['You read the scroll.']);
    expect(item.teaches).toEqual(['spell-fireball']);
    expect(item.baseCost).toBe(9);
    expect(item.quantity).toBe(2);
    expect(item.quality).toBe('fine');
  });

  it('normalizes invalid useMessages/teaches to empty arrays', () => {
    const item = new ItemModel({
      typeid: 'trinket-odd',
      name: 'Odd Trinket',
      type: 'Trinket',
      useMessages: 'nope',
      teaches: { nope: true },
    });

    expect(item.useMessages).toEqual([]);
    expect(item.teaches).toEqual([]);
  });

  describe('isDestroyed', () => {
    it('returns false when resilience > 0', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: 1 });
      expect(item.isDestroyed()).toBe(false);
    });

    it('returns true when resilience === 0', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: 0 });
      expect(item.isDestroyed()).toBe(true);
    });

    it('returns true when resilience < 0', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: -5 });
      expect(item.isDestroyed()).toBe(true);
    });

    it('returns false when resilience is null', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: null });
      expect(item.isDestroyed()).toBe(false);
    });
  });

  describe('damageItem', () => {

    it('does nothing if already destroyed', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: 0 });
      const result = item.damageItem(10);

      expect(result).toEqual([]);
      expect(item.resilience).toBe(0);
    });

    it('clamps negative/undefined damage to 0 (no change)', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: 10 });

      expect(item.damageItem(-5)).toEqual(['X was damaged.']);
      expect(item.resilience).toBe(10);

      expect(item.damageItem(undefined as any)).toEqual(['X was damaged.']);
      expect(item.resilience).toBe(10);
    });

    it('reduces resilience and returns damaged message when not destroyed', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: 10 });
      const result = item.damageItem(3);

      expect(result).toEqual(['X was damaged.']);
      expect(item.resilience).toBe(7);
      expect(item.isDestroyed()).toBe(false);
    });

    it('reduces resilience to 0 and returns destroyed message when destroyed', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: 5 });
      const result = item.damageItem(50);

      expect(result).toEqual(['X was destroyed.']);
      expect(item.resilience).toBe(0);
      expect(item.isDestroyed()).toBe(true);
    });
  });

  describe('combatRating', () => {
    it('computes combatRating based on the formula and rounds up', () => {
      const item = new ItemModel({
        typeid: 'x',
        name: 'X',
        type: 'Weapon',
        damage: 10,
        plusHit: 2,
        plusDamage: 3,
        plusArmor: 4,
        bonusHealth: 25,
        minusToBeHit: 2,
        heals: 30,
        restores: 20,
        bonusMana: 10,
        teaches: ['a', 'b'],
      });

      const physicalPower = 2 + 3 + 10; // 15
      const defensivePower = 4 + (25 / 10) + (2 * 2); // 4 + 2.5 + 4 = 10.5
      const utilityPower = ((10 / 10) * 3) + (2 * 5) + (30 * 0.01) + (20 * 0.008); // 3 + 10 + 0.3 + 0.16 = 13.46
      const expected = Math.ceil(physicalPower + defensivePower + utilityPower); // ceil(38.96) = 39

      expect(item.combatRating).toBe(expected);
    });

    it('returns 0 when the computed result is 0 (due to || 0)', () => {
      const item = new ItemModel({
        typeid: 'x',
        name: 'X',
        type: 'Trinket',
        damage: 0,
        plusHit: 0,
        plusDamage: 0,
        plusArmor: 0,
        bonusHealth: 0,
        minusToBeHit: 0,
        heals: 0,
        restores: 0,
        bonusMana: 0,
        teaches: [],
      });

      expect(item.combatRating).toBe(0);
    });
  });

  describe('cost', () => {
    it('computes base cost using combatRating + baseCost and quantity default 1', () => {
      const item = new ItemModel({
        typeid: 'x',
        name: 'X',
        type: 'Trinket',
        baseCost: 5,
      });

      item.quantity = undefined;
      item.quality = 'standard';

      const expectedBaseCost = (item.combatRating + 5);
      expect(item.cost).toBe(expectedBaseCost);
    });

    it('applies quality multipliers correctly', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', baseCost: 1 });
      item.quantity = 2;

      const baseCost = (item.combatRating + item.baseCost) * item.quantity;

      item.quality = 'damaged';
      expect(item.cost).toBe(Math.round(baseCost * 0.3));

      item.quality = 'standard';
      expect(item.cost).toBe(baseCost);

      item.quality = 'fine';
      expect(item.cost).toBe(Math.round(baseCost * 2.1));

      item.quality = 'elite';
      expect(item.cost).toBe(baseCost * 4.5);

      item.quality = 'magical';
      expect(item.cost).toBe(baseCost * 25);

      item.quality = undefined;
      expect(item.cost).toBe(baseCost);
    });
  });

  it('getUseMessages returns a defensive copy', () => {
    const item = new ItemModel({
      typeid: 'x',
      name: 'X',
      type: 'Trinket',
      useMessages: ['a', 'b'],
    });

    const copy = item.getUseMessages();
    copy.push('c');

    expect(item.useMessages).toEqual(['a', 'b']);
    expect(copy).toEqual(['a', 'b', 'c']);
  });

  describe('toString', () => {
    it('returns item name when not broken', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: 5 });
      expect(item.toString()).toBe('X');
    });

    it('returns "Broken <name>" when resilience <= 0', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: 0 });
      expect(item.toString()).toBe('Broken X');
    });

    it('returns name when resilience is null', () => {
      const item = new ItemModel({ typeid: 'x', name: 'X', type: 'Trinket', resilience: null });
      expect(item.toString()).toBe('X');
    });
  });
});