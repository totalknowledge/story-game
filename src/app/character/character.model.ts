import { ItemModel } from "../item/item.model";
import { CharacterClassification, Money } from "./character.definitions";

export class CharacterModel {
    id?: string;
    typeid: string;
    type: string = 'Beast';
    name: string;
    named: boolean = false;
    classification: CharacterClassification = 'normal';
    baseHealth: number;
    baseMana: number;
    maxHealth: number;
    maxMana: number;
    toHit?: number;
    toDamage?: number;
    armor?: number;
    damage: number = 0;
    usedMana: number = 0;
    items: any[] = [];
    equipment = new Map<string, any>();
    equippedItemTemplate?: Partial<ItemModel>[];
    spells: any[] = [];
    spellTypeids?: string[];
    dead: boolean = false;
    roomCoordinatesKey: string = '0,0,0';
    combatRating?: number;
    private goldSilverCopper: Money = { copper: 0, silver: 0, gold: 0 };

    constructor(name: string, baseHealth: number, baseMana: number, template: any = {}) {
        this.name = name;
        this.baseHealth = baseHealth;
        this.baseMana = baseMana;
        this.maxHealth = baseHealth;
        this.maxMana = baseMana;

        Object.assign(this, template);

        this.id = crypto.randomUUID();
        this.typeid = template.typeid || 'base-character';
    }

    get currentHealth(): number {
        return Math.max(0, this.maxHealth - this.damage);
    }

    get currentMana(): number {
        return Math.max(0, this.maxMana - this.usedMana);
    }

    get isDead(): boolean {
        return this.dead || this.currentHealth <= 0;
    }

    get money(): Money {
        return { ...this.goldSilverCopper };
    }

    set money(amount: Money) {
        this.goldSilverCopper = { ...amount };
    }
}