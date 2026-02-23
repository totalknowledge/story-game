import { EquipLocation } from "./item.definitions";

export class ItemModel {
    id?: string;
    typeid: string;
    name: string;
    type: string;
    equippableLocation?: EquipLocation;
    quality?: string;
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

        this.useMessages = Array.isArray(template.useMessages) ? template.useMessages : [];
        this.teaches = Array.isArray(template.teaches) ? template.teaches : [];
    }

    isDestroyed(): boolean {
        return this.resilience !== null && this?.resilience <= 0;
    }

    damageItem(amount: number): string[] {
        if (this.resilience === null || this.isDestroyed()) return [];

        const loss = Math.max(0, amount ?? 0);
        this.resilience = Math.max(0, this.resilience - loss);

        return this.isDestroyed()
            ? [`${this.name} was destroyed.`]
            : [`${this.name} was damaged.`];
    }

    get combatRating(): number {
        const physicalPower = (this.plusHit ?? 0) + (this.plusDamage ?? 0) + (this.damage ?? 0);
        const defensivePower = (this.plusArmor ?? 0) +
            ((this.bonusHealth ?? 0) / 10) +
            ((this.minusToBeHit ?? 0) * 2) +
            ((this.heals ?? 0) / 30) +
            ((this.restores ?? 0) / 20);
        const utilityPower = ((this.bonusMana ?? 0) / 10 * 3) +
            (0.05 * (this.heals ?? 0)) +
            (this.teaches.length * 5);

        return Math.ceil(physicalPower + defensivePower + utilityPower) || 50;
    }

    get cost(): number {
        const baseCost = this.combatRating * 10 * (this.quantity ?? 1);
        switch (this.quality) {
            case 'damaged':
                return Math.round(baseCost * 0.5);
            case 'standard':
                return baseCost;
            case 'fine':
                return Math.round(baseCost * 1.7);
            case 'elite':
                return baseCost * 3;
            case 'magical':
                return baseCost * 10;
            default:
                return baseCost;
        }
    }

    getUseMessages(): string[] {
        return [...this.useMessages];
    }

    toString(): string {
        if (this.resilience !== null && this.resilience <= 0) {
            return `Broken ${this.name}`;
        }
        return this.name;
    }
}