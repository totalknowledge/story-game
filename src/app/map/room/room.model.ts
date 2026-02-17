import { ItemModel } from "../../item/item.model";
import { Connection, Coordinates, Direction } from "./room.definitions";

export class RoomModel {
    readonly id: string = crypto.randomUUID();
    typeid?: string;
    description: string;
    coordinates?: Coordinates;
    visited: boolean = false;

    enemyTypeids: string[] = [];
    enemyIds: string[] = [];
    itemTypeids: string[] = [];
    items: ItemModel[] = []
    featureTypeids: string[] = [];
    features: any[] = [];
    externalExits?: Map<Direction, Connection>;

    connections: Map<Direction, string | null> = new Map([
        ["north", null], ["south", null], ["east", null],
        ["west", null], ["up", null], ["down", null]
    ]);

    constructor(data: Partial<RoomModel>) {
        this.typeid = data.typeid;
        this.description = data.description || 'A non-descript stone chamber.';
        this.coordinates = data.coordinates;
        this.enemyTypeids = data.enemyTypeids || [];
        this.itemTypeids = data.itemTypeids || [];
    }

    getDirections(): string[] {
        const exits = Array.from(this.connections.entries())
            .filter(([_, targetId]) => targetId !== null)
            .map(([dir]) => dir);

        return exits.length > 0
            ? [`Available exits: ${exits.join(", ")}`]
            : ["There are no visible exits."];
    }
}