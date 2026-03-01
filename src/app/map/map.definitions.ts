import { Connection, Direction } from "./room/room.definitions";

export type MapType = 'town' | 'dungeon' | 'wilderness' | 'interior';

export type MapDefinition = Record<string, any>;
export type RoomDefinition = {
    room: string,
    connections: Direction[],
    mapConnections: Connection[]
}

export const WORLD_MAPS: Record<string, MapDefinition> = {
    'caves-01': {
        type: 'dungeon',
        name: 'The Caves',
        generator: 'random',
        features: 1,
        featureTypes: [],
        targetCR: 9,
        encounterChance: 15,
        enemyTypes: [
            'enemy-rat',
            'enemy-bat',
            'enemy-slime-green',
            'enemy-spider-small',
            'enemy-wolf'
        ],
        rooms: 15,
        randomRooms: [
            'cave-001'
        ],
        structure: {
            '0,0,0': {
                room: 'cave-entrance',
                commections: ['west'],
                mapConnections: [
                    { direction: 'west', connection: '', name: 'Althea', loads: 'town', status: 'unlocked' }
                ]
            }
        }
    },
    'crypts-01': {
        type: 'dungeon',
        name: 'The Catacombs',
        generator: 'random',
        features: 1,
        featureTypes: [],
        targetCR: 19,
        encounterChance: 20,
        enemyTypes: [
            'enemy-humanoid-skeleton',
            'enemy-humanoid-zombie',
            'enemy-spider-giant'
        ],
        rooms: 30,
        randomRooms: [
            'cave-001'
        ],
        structure: {
            '0,0,0': {
                room: 'cave-entrance',
                commections: ['north'],
                mapConnections: [
                    { direction: 'north', connection: '', name: 'Althea', loads: 'town', status: 'unlocked' }
                ]
            }
        }
    },
    'town': {
        type: 'town',
        name: 'Althea',
        generator: 'static',
        targetCR: 14,
        encounterChance: 5,
        enemyTypes: [
            'enemy-humanoid-bandit',
            'enemy-humanoid-bandit-leader'
        ],
        structure: {
            '0,0,0': {
                room: 'town-square',
                connections: ['north', 'south', 'east', 'west'],
                mapConnections: []
            },
            '1,0,0': {
                room: 'town-ns-shops',
                connections: ['north', 'south', 'east', 'west'],
                mapConnections: []
            },
            '2,0,0': {
                room: 'town-ew-road',
                connections: ['east', 'west'],
                mapConnections: [
                    { direction: 'east', connection: '0,0,0', name: 'The Caves', loads: 'caves-01', status: 'unlocked' }
                ]
            },
            '1,1,0': {
                room: 'town-bank',
                connections: ['south', 'west'],
                mapConnections: []
            },
            '0,1,0': {
                room: 'town-ew-shops',
                connections: ['north', 'south', 'east', 'west'],
                mapConnections: []
            },
            '0,2,0': {
                room: 'town-ns-road',
                connections: ['north', 'south'],
                mapConnections: [
                    { direction: 'north', connection: '', name: 'The Sphinx', loads: 'caves-02', status: 'locked' }
                ]
            },
            '-1,1,0': {
                room: 'town-shop',
                connections: ['south', 'east'],
                mapConnections: []
            },
            '-1,0,0': {
                room: 'town-ns-shops',
                connections: ['north', 'south', 'east', 'west'],
                mapConnections: []
            },
            '-2,0,0': {
                room: 'town-ew-road',
                connections: ['east', 'west'],
                mapConnections: [{ direction: 'west', connection: '', name: 'Beyond the Gate', loads: 'valley-01', status: 'locked' }]
            },
            '0,-1,0': {
                room: 'town-ew-shops',
                connections: ['north', 'south', 'east', 'west'],
                mapConnections: []
            },
            '0,-2,0': {
                room: 'town-ns-road',
                connections: ['north', 'south'],
                mapConnections: [{ direction: 'south', connection: '', name: 'The Catacombs', loads: 'crypts-01', status: 'unlocked' }]
            },
            '-1,-1,0': {
                room: 'town-empty-shops',
                connections: ['north', 'east'],
                mapConnections: []
            },
            '1,-1,0': {
                room: 'town-empty-shops',
                connections: ['north', 'west'],
                mapConnections: []
            }
        }
    }
};