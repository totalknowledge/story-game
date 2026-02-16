export type MapDefinition = Record<string, any>;

export const WORLD_MAPS: Record<string, MapDefinition> = {
    'town': {
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
                { connection: 'west', name: 'The Caves', loads: 'caves-01', status: 'unlocked' }
            ]
        },
        '1,1,0': {
            room: 'town-bank',
            connections: ['south', 'east'],
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
                { connection: 'west', name: 'The Sphinx', loads: 'caves-02', status: 'locked' }
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
            mapConnections: [{ connection: 'east', name: 'Beyond the Gate', loads: 'valley-01', status: 'locked' }]
        },
        '0,-1,0': {
            room: 'town-ew-shops',
            connections: ['north', 'south', 'east', 'west'],
            mapConnections: []
        },
        '0,-2,0': {
            room: 'town-ns-road',
            connections: ['east', 'west'],
            mapConnections: [{ connection: 'south', name: 'The Catacombs', loads: 'crypt-01', status: 'locked' }]
        },
        '-1,-1,0': {
            room: 'town-empty-shops',
            connections: ['north', 'east'],
            mapConnections: []
        },
        '1,-1,0': {
            room: 'town-empty-shops',
            connections: ['south', 'east'],
            mapConnections: []
        }
    }
};