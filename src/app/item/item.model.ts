import { EquipLocation } from "./item.definitions";

export class ItemModel {
    id: string;
    typeid: string;
    name: string;
    type: string;
    equippableLocation: EquipLocation;
    damage: number = 0;
    plusHit: number = 0;
    minusToBeHit: number = 0;
    plusDamage: number = 0;
    resilience: number | null = null;
    plusArmor: number = 0;
    bonusHealth: number = 0;
    bonusMana: number = 0;
    heals: number = 0;
    restores: number = 0;
    useMessages: string[] = [];
    teaches: any[] = [];

    constructor(template: any = {}) {
        this.id = crypto.randomUUID();

        this.typeid = template.typeid;
        this.name = template.name;
        this.type = template.type;
        this.equippableLocation = template.equippableLocation || "none";
        this.damage = template.damage ?? 0;
        this.resilience = template.resilience ?? null;
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
        return this.resilience !== null && this.resilience <= 0;
    }

    damageItem(amount: number): string[] {
        if (this.resilience === null || this.isDestroyed()) return [];

        const loss = Math.max(0, amount ?? 0);
        this.resilience = Math.max(0, this.resilience - loss);

        return this.isDestroyed()
            ? [`${this.name} was destroyed.`]
            : [`${this.name} was damaged.`];
    }

    getUseMessages(): string[] {
        return [...this.useMessages];
    }

    toString(): string {
        return this.isDestroyed() ? `${this.name} (Broken)` : this.name;
    }
}