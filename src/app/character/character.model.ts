export class CharacterModel {
    id: string;
    typeid: string;
    name: string;
    baseHealth: number;
    baseMana: number;
    maxHealth: number;
    maxMana: number;
    toHit: number = 0;
    toDamage: number = 0;
    damage: number = 0;
    armor: number = 0;
    usedMana: number = 0;
    items: any[] = [];
    equipment = new Map<string, any>();
    spells: any[] = [];
    dead: boolean = false;
    roomCoordinatesKey: string = '0,0,0';

    constructor(name: string, health: number, mana: number, template: any = {}) {
        this.name = name;
        this.baseHealth = health;
        this.baseMana = mana;
        this.maxHealth = health;
        this.maxMana = mana;

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
}