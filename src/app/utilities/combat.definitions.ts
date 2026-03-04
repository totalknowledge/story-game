export interface CombatRatingTerms {
  damage?: number;
  plusHit?: number;
  plusDamage?: number;
  plusArmor?: number;
  bonusHealth?: number;
  bonusMana?: number;
  minusToBeHit?: number;
  heals?: number;
  restores?: number;
  teachesCount?: number;
  toHit?: number;
  toDamage?: number;
  avgWeaponDamage?: number;
  healthComponent?: number;
  armorComponent?: number;
  healingComponent?: number;
  manaComponent?: number;
  avgSpellDamage?: number;
  spellDamage?: number;
  spellHealsUser?: number;
}

export interface CombatRatingInput {
  terms: CombatRatingTerms;
  weights?: Partial<Record<keyof CombatRatingTerms, number>>;
  multiplier?: number;
  minimumZero?: boolean;
  round?: (value: number) => number;
}

const DEFAULT_WEIGHTS: Record<keyof CombatRatingTerms, number> = {
  damage: 1,
  plusHit: 1,
  plusDamage: 1,
  plusArmor: 0.5,
  bonusHealth: 0.1,
  bonusMana: 0.3,
  minusToBeHit: 2,
  heals: 0.01,
  restores: 0.008,
  teachesCount: 5,
  toHit: 1,
  toDamage: 1,
  avgWeaponDamage: 1,
  healthComponent: 1,
  armorComponent: 0.5,
  healingComponent: 1,
  manaComponent: 1,
  avgSpellDamage: 1,
  spellDamage: 0.3,
  spellHealsUser: 0.15,
};

export function calculateCombatRating(input: CombatRatingInput): number {
  const mergedWeights = { ...DEFAULT_WEIGHTS, ...(input.weights ?? {}) };

  const weightedSum = (Object.keys(mergedWeights) as Array<keyof CombatRatingTerms>).reduce(
    (sum, key) => sum + ((input.terms[key] ?? 0) * mergedWeights[key]),
    0
  );

  const withMultiplier = weightedSum * (input.multiplier ?? 1);
  const bounded = input.minimumZero === false ? withMultiplier : Math.max(0, withMultiplier);

  return input.round ? input.round(bounded) : bounded;
}
