export class SpellModel {
    id: string;
    typeid: string;
    name: string;
    damage: number;
    manaCost: number;
    type: string;
    effect?: string;
    healsUser: number;
    castMessages: string[];
    combatRating?: number;

    constructor(template: any = {}) {
        this.id = crypto.randomUUID();
        this.typeid = template.typeid;
        this.name = template.name;
        this.damage = template.damage ?? 0;
        this.manaCost = template.manaCost ?? 0;
        this.type = template.school || 'Arcane';
        this.effect = template.effect;
        this.healsUser = template.healsUser ?? 0;
        this.castMessages = Array.isArray(template.castMessages) ? template.castMessages : [];
    }

    getCastMessage(userName: string): string {
        const msg = this.castMessages[Math.floor(Math.random() * this.castMessages.length)] || '';
        return msg.replace('{user}', userName);
    }
}
