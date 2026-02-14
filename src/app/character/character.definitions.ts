export type CharacterType = 'Player' | 'Enemy';

export const EQUPEMENT_SLOTS = [
    { label: 'Head', key: 'head' },
    { label: 'Right\u00A0Hand', key: 'right-hand' },
    { label: 'Neck', key: 'neck' },
    { label: 'Left\u00A0Hand', key: 'left-hand' },
    { label: 'Chest', key: 'body' },
    { label: 'Ring', key: 'left-finger' },
    { label: 'Legs', key: 'legs' },
    { label: 'Feet', key: 'feet' }
];

export const ENEMY_TEMPLATES = [
    {
        "typeid": "enemy-rat", "name": "Giant Rat", "health": 5, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-bite", "name": "Bite", "type": "Natural", "damage": 1, "resilience": 999 }
    },
    {
        "typeid": "enemy-bat", "name": "Cave Bat", "health": 4, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-bite", "name": "Bite", "type": "Natural", "damage": 1, "resilience": 999 }
    },
    {
        "typeid": "enemy-slime-green", "name": "Green Slime", "health": 6, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-acid", "name": "Acid Touch", "type": "Natural", "damage": 2, "resilience": 999 }
    },
    { "typeid": "enemy-humanoid-goblin-scout", "name": "Goblin Scout", "health": 8, "mana": 0 },
    { "typeid": "enemy-goblin-warrior", "name": "Goblin Warrior", "health": 12, "mana": 0 },
    {
        "typeid": "enemy-humanoid-skeleton", "name": "Skeleton", "health": 10, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-bone-claws", "name": "Bone Claws", "type": "Natural", "damage": 2, "resilience": 999 }
    },
    {
        "typeid": "enemy-humanoid-zombie", "name": "Zombie", "health": 14, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-slam", "name": "Slam", "type": "Natural", "damage": 2, "resilience": 999 }
    },
    { "typeid": "enemy-humanoid-bandit", "name": "Bandit", "health": 15, "mana": 0 },
    { "typeid": "enemy-humanoid-bandit-leader", "name": "Bandit Leader", "health": 22, "mana": 0 },
    {
        "typeid": "enemy-wolf", "name": "Wild Wolf", "health": 12, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-bite", "name": "Bite", "type": "Natural", "damage": 3, "resilience": 999 }
    },

    {
        "typeid": "enemy-spider-small", "name": "Cave Spider", "health": 7, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-fangs", "name": "Fangs", "type": "Natural", "damage": 2, "resilience": 999 }
    },
    {
        "typeid": "enemy-spider-giant", "name": "Giant Spider", "health": 18, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-fangs", "name": "Fangs", "type": "Natural", "damage": 4, "resilience": 999 }
    },
    { "typeid": "enemy-humanoid-orc-grunt", "name": "Orc Grunt", "health": 20, "mana": 0 },
    { "typeid": "enemy-humanoid-orc-brute", "name": "Orc Brute", "health": 28, "mana": 0 },
    {
        "typeid": "enemy-humanoid-troll", "name": "Troll", "health": 40, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-claws", "name": "Claws", "type": "Natural", "damage": 6, "resilience": 999 }
    },

    {
        "typeid": "enemy-humanoid-apprentice-mage", "name": "Dark Apprentice", "health": 14, "mana": 10,
        "spellTypeids": ["spell-shadow-bolt"]
    },
    {
        "typeid": "enemy-humanoid-cultist", "name": "Cursed Cultist", "health": 16, "mana": 12,
        "spellTypeids": ["spell-shadow-bolt", "spell-weak-curse"]
    },
    {
        "typeid": "enemy-fire-sprite", "name": "Fire Sprite", "health": 10, "mana": 20,
        "equippedItemTemplate": { "typeid": "natural-burn", "name": "Burning Touch", "type": "Natural", "damage": 2, "resilience": 999 },
        "spellTypeids": ["spell-fire-spark"]
    },
    {
        "typeid": "enemy-ice-wisp", "name": "Ice Wisp", "health": 12, "mana": 18,
        "equippedItemTemplate": { "typeid": "natural-chill", "name": "Chilling Touch", "type": "Natural", "damage": 2, "resilience": 999 },
        "spellTypeids": ["spell-ice-shard"]
    },
    {
        "typeid": "enemy-humanoid-necromancer", "name": "Necromancer", "health": 25, "mana": 35,
        "spellTypeids": ["spell-shadow-bolt", "spell-life-drain", "spell-raise-bones"]
    },

    {
        "typeid": "enemy-humanoid-ghost", "name": "Restless Ghost", "health": 18, "mana": 25,
        "equippedItemTemplate": { "typeid": "natural-haunt", "name": "Haunting Touch", "type": "Natural", "damage": 3, "resilience": 999 },
        "spellTypeids": ["spell-fear-whisper"]
    },
    {
        "typeid": "enemy-humanoid-shadow-stalker", "name": "Shadow Stalker", "health": 22, "mana": 15,
        "equippedItemTemplate": { "typeid": "natural-claws", "name": "Claws", "type": "Natural", "damage": 5, "resilience": 999 },
        "spellTypeids": ["spell-shadow-step"]
    },
    {
        "typeid": "enemy-humanoid-animated-armor", "name": "Animated Armor", "health": 30, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-slam", "name": "Heavy Slam", "type": "Natural", "damage": 5, "resilience": 999 }
    },
    {
        "typeid": "enemy-harpy", "name": "Harpy", "health": 20, "mana": 10,
        "equippedItemTemplate": { "typeid": "natural-talons", "name": "Talons", "type": "Natural", "damage": 4, "resilience": 999 },
        "spellTypeids": ["spell-sonic-screech"]
    },
    {
        "typeid": "", "name": "Minotaur", "health": 45, "mana": 0,
        "equippedItemTemplate": { "typeid": "natural-gore", "name": "Gore", "type": "Natural", "damage": 8, "resilience": 999 }
    },

    {
        "typeid": "enemy-drake-young", "name": "Young Drake", "health": 50, "mana": 15,
        "equippedItenemy-humanoid-minotauremTemplate": { "typeid": "natural-bite", "name": "Bite", "type": "Natural", "damage": 7, "resilience": 999 },
        "spellTypeids": ["spell-fire-breath-minor"]
    },
    {
        "typeid": "enemy-dragon-whelp", "name": "Dragon Whelp", "health": 60, "mana": 25,
        "equippedItemTemplate": { "typeid": "natural-claws", "name": "Claws", "type": "Natural", "damage": 8, "resilience": 999 },
        "spellTypeids": ["spell-fire-breath"]
    },
    {
        "typeid": "enemy-dungeon-guardian", "name": "Dungeon Guardian", "health": 80, "mana": 20,
        "equippedItemTemplate": { "typeid": "natural-slam", "name": "Crushing Slam", "type": "Natural", "damage": 10, "resilience": 999 },
        "spellTypeids": ["spell-warding-pulse"]
    },
    {
        "typeid": "enemy-humanoid-warlock-lord", "name": "Warlock Lord", "health": 70, "mana": 60,
        "spellTypeids": ["spell-shadow-bolt", "spell-life-drain", "spell-fire-spark", "spell-shadow-step"]
    },
    {
        "typeid": "enemy-humanoid-lich", "name": "Lich", "health": 100, "mana": 100,
        "spellTypeids": ["spell-shadow-bolt", "spell-life-drain", "spell-raise-bones", "spell-fear-whisper", "spell-death-nova"]
    }
];