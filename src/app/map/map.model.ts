import { RoomModel } from "./room/room.model";

export type MapType = 'town' | 'dungeon' | 'wilderness' | 'interior';

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