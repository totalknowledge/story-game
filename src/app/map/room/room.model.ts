import { ItemModel } from "../../item/item.model";
import { Connection, Coordinates, Direction } from "./room.definitions";

export class RoomModel {
    public readonly id: string = crypto.randomUUID();
    public readonly typeid?: string;
    public readonly description: string;
    public coordinates?: Coordinates;
    public visited: boolean = false;

    public enemyTypeids: string[] = [];
    public enemyIds: string[] = [];
    public itemTypeids: string[] = [];
    public items: ItemModel[] = []
    public featureTypeids: string[] = [];
    public features: any[] = [];

    public connections: Map<Direction, Connection> = new Map();

    constructor(roomTemplate: Partial<RoomModel>) {
        this.typeid = roomTemplate.typeid;
        this.description = roomTemplate.description || 'A non-descript stone chamber.';
        this.coordinates = roomTemplate.coordinates;
        this.enemyTypeids = roomTemplate.enemyTypeids || [];
        this.itemTypeids = roomTemplate.itemTypeids || [];
        this.featureTypeids = roomTemplate.featureTypeids || [];
    }

    public get coordinateKey(): string {
        const { x = 0, y = 0, z = 0 } = this.coordinates || {};
        return `${x},${y},${z}`;
    }

    public get directions(): string[] {
        const exitKeys = Array.from(this.connections.keys()).map(direction => {
            const connection = this.connections.get(direction);
            return connection?.status === 'locked' ? `${direction} (locked)` : direction;
        });

        return exitKeys.length > 0
            ? [`Available directions: ${exitKeys.join(", ")}`]
            : ["There are no visible exits."];
    }

    public set coordinateKey(coordinateKeyString: string) {
        const [x, y, z] = coordinateKeyString.split(',').map(Number);
        this.coordinates = { x, y, z };
    }

    public toTemplate(): Partial<RoomModel> {
        return {
            typeid: this.typeid,
            description: this.description,
            featureTypeids: [...this.featureTypeids],
            itemTypeids: [...this.itemTypeids],
            enemyTypeids: [...this.enemyTypeids]
        };
    }
}