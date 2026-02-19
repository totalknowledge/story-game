import { MapType } from "./map.definitions";
import { RoomModel } from "./room/room.model";

export class MapModel {
    readonly id: string = crypto.randomUUID();
    name: string;
    type: MapType;
    rooms: Map<string, RoomModel> = new Map();
    startRoomId!: string;
    isPersistent: boolean;

    constructor(config: { name: string, type: MapType, isPersistent?: boolean; }) {
        this.name = config.name;
        this.type = config.type;
        this.isPersistent = config.isPersistent ?? false;
    }
}