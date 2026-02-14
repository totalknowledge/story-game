export class SpellModel {
    typeid: string;
    name: string;
    damage: number;
    manaCost: number;
    school: string;
    effect?: string;
    healsUser: number;
    castMessages: string[];

    constructor(template: any = {}) {
        this.typeid = template.typeid;
        this.name = template.name;
        this.damage = template.damage ?? 0;
        this.manaCost = template.manaCost ?? 0;
        this.school = template.school || 'Arcane';
        this.effect = template.effect;
        this.healsUser = template.healsUser ?? 0;
        this.castMessages = Array.isArray(template.castMessages) ? template.castMessages : [];
    }

    getCastMessage(userName: string): string {
        const msg = this.castMessages[Math.floor(Math.random() * this.castMessages.length)] || '';
        return msg.replace('{user}', userName);
    }
}
