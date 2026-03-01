import { MapDefinition, MapType } from "./map.definitions";
import { RoomModel } from "./room/room.model";

export class MapModel {
    readonly id: string = crypto.randomUUID();
    name: string;
    type: MapType;
    rooms: Map<string, RoomModel> = new Map();
    startRoomId!: string;
    isPersistent: boolean;
    targetCR: number;
    encounterChance: number;

    constructor(config: MapDefinition) {
        this.name = config['name'];
        this.type = config['type'];
        this.isPersistent = config['isPersistent'] ?? false;
        this.targetCR = config['targetCR'];
        this.encounterChance = config['encounterChance'];
    }
}