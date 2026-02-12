export class CharacterModel {
    id: string;
    typeid: string;
    name: string;
    maxHealth: number;
    maxMana: number;
    damage: number = 0;
    usedMana: number = 0;
    items: any[] = [];
    equipment = new Map<string, any>();
    spells: any[] = [];
    dead: boolean = false;
    roomCoordinates: string = '0,0,0';

    constructor(name: string, health: number, mana: number, template: any = {}) {
        this.name = name;
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