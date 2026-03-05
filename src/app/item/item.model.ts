import { EquipLocation, ItemQuality } from "./item.definitions";
import { calculateCombatRating } from "../utilities/combat.definitions";

export class ItemModel {
    id?: string;
    typeid: string;
    name: string;
    type: string;
    equippableLocation?: EquipLocation;
    quality?: ItemQuality;
    excludeFromRandom?: boolean;
    quantity?: number;
    damage?: number;
    plusHit?: number;
    minusToBeHit?: number;
    plusDamage?: number;
    resilience: number;
    plusArmor?: number;
    bonusHealth?: number;
    bonusMana?: number;
    heals?: number;
    restores?: number;
    useMessages: string[] = [];
    teaches: string[] = [];
    baseCost: number;
    public maxStack?: number;
    unlocks?: string[];

    constructor(template: any = {}) {
        this.id = crypto.randomUUID();

        this.typeid = template.typeid;
        this.name = template.name;
        this.type = template.type;
        this.equippableLocation = template.equippableLocation || "none";
        this.damage = template.damage ?? 0;
        this.resilience = template.resilience ?? 999;
        this.bonusHealth = template.bonusHealth ?? 0;
        this.bonusMana = template.bonusMana ?? 0;
        this.heals = template.heals ?? 0;
        this.restores = template.restores ?? 0;
        this.plusHit = template.plusHit ?? 0;
        this.plusArmor = template.plusArmor ?? 0;
        this.minusToBeHit = template.minusToBeHit ?? 0;
        this.plusDamage = template.plusDamage ?? 0;
        this.quantity = template.quantity;
        this.quality = template.quality ?? 'standard';
        this.excludeFromRandom = template.excludeFromRandom ?? false;
        this.unlocks = template.unlocks ?? [];

        this.useMessages = Array.isArray(template.useMessages) ? template.useMessages : [];
        this.teaches = Array.isArray(template.teaches) ? template.teaches : [];
        this.maxStack = template.maxStack;
        this.baseCost = template.baseCost ?? 1;
    }

    public isDestroyed(): boolean {
        return this.resilience !== null && this?.resilience <= 0;
    }

    public damageItem(amount: number): string[] {
        if (this.resilience === null || this.isDestroyed()) return [];

        const loss = Math.max(0, amount ?? 0);
        this.resilience = Math.max(0, this.resilience - loss);

        return this.isDestroyed()
            ? [`${this.name} was destroyed.`]
            : [`${this.name} was damaged.`];
    }

    public get combatRating(): number {
        return calculateCombatRating({
            terms: {
                plusHit: this.plusHit,
                plusDamage: this.plusDamage,
                damage: this.damage,
                plusArmor: this.plusArmor,
                bonusHealth: this.bonusHealth,
                minusToBeHit: this.minusToBeHit,
                bonusMana: this.bonusMana,
                heals: this.heals,
                restores: this.restores,
                teachesCount: this.teaches.length,
            },
            round: (value) => Math.ceil(value),
        });
    }

    public get cost(): number {
        if (this.typeid === 'ammo-arrows') return 1 * this.quantity!;
        const baseCost = (this.combatRating + this.baseCost) * (this.quantity ?? 1);
        switch (this.quality) {
            case 'damaged':
                return Math.round(baseCost * 0.3);
            case 'standard':
                return baseCost;
            case 'fine':
                return Math.round(baseCost * 2.1);
            case 'elite':
                return baseCost * 4.5;
            case 'magical':
                return baseCost * 25;
            default:
                return baseCost;
        }
    }

    public getUseMessages(): string[] {
        return [...this.useMessages];
    }

    public toString(): string {
        if (this.resilience !== null && this.resilience <= 0) {
            return `Broken ${this.name}`;
        }
        return this.name;
    }
}