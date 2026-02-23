export type CharacterType = 'Player' | 'Enemy';

export type CharacterClassification = 'normal' | 'elite' | 'unique';

export interface Money {
    copper: number;
    silver: number;
    gold: number;
}

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
        "typeid": "enemy-rat",
        "name": "Giant Rat",
        "baseHealth": 5,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-bite",
            "name": "Bite",
            "type": "Natural",
            "damage": 4,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Beast",
        "combatRating": 3
    },
    {
        "typeid": "enemy-bat",
        "name": "Cave Bat",
        "baseHealth": 4,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-bite",
            "name": "Bite",
            "type": "Natural",
            "damage": 4,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Beast",
        "combatRating": 2
    },
    {
        "typeid": "enemy-slime-green",
        "name": "Green Slime",
        "baseHealth": 6,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-acid",
            "name": "Acid Touch",
            "type": "Natural",
            "damage": 5,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Beast",
        "combatRating": 3
    },
    {
        "typeid": "enemy-humanoid-goblin-scout",
        "name": "Goblin Scout",
        "baseHealth": 8,
        "baseMana": 0,
        "type": "Humanoid",
        "combatRating": 1
    },
    {
        "typeid": "enemy-humanoid-goblin-warrior",
        "name": "Goblin Warrior",
        "baseHealth": 12,
        "baseMana": 0,
        "type": "Humanoid",
        "combatRating": 1
    },
    {
        "typeid": "enemy-humanoid-skeleton",
        "name": "Skeleton",
        "baseHealth": 10,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-bone-claws",
            "name": "Bone Claws",
            "type": "Natural",
            "damage": 3,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Humanoid",
        "combatRating": 3
    },
    {
        "typeid": "enemy-humanoid-zombie",
        "name": "Zombie",
        "baseHealth": 14,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-slam",
            "name": "Slam",
            "type": "Natural",
            "damage": 3,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Humanoid",
        "combatRating": 3
    },
    {
        "typeid": "enemy-humanoid-bandit",
        "name": "Bandit",
        "baseHealth": 15,
        "baseMana": 0,
        "type": "Humanoid",
        "combatRating": 2
    },
    {
        "typeid": "enemy-humanoid-bandit-leader",
        "name": "Bandit Leader",
        "baseHealth": 22,
        "baseMana": 0,
        "type": "Humanoid",
        "combatRating": 2
    },
    {
        "typeid": "enemy-wolf",
        "name": "Wild Wolf",
        "baseHealth": 12,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-bite",
            "name": "Bite",
            "type": "Natural",
            "damage": 6,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Beast",
        "combatRating": 4
    },
    {
        "typeid": "enemy-spider-small",
        "name": "Cave Spider",
        "baseHealth": 7,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-fangs",
            "name": "Fangs",
            "type": "Natural",
            "damage": 3,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Beast",
        "combatRating": 2
    },
    {
        "typeid": "enemy-spider-giant",
        "name": "Giant Spider",
        "baseHealth": 18,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-fangs",
            "name": "Fangs",
            "type": "Natural",
            "damage": 5,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Beast",
        "combatRating": 4
    },
    {
        "typeid": "enemy-humanoid-orc-grunt",
        "name": "Orc Grunt",
        "baseHealth": 20,
        "baseMana": 0,
        "type": "Humanoid",
        "combatRating": 2
    },
    {
        "typeid": "enemy-humanoid-orc-brute",
        "name": "Orc Brute",
        "baseHealth": 28,
        "baseMana": 0,
        "type": "Humanoid",
        "combatRating": 3
    },
    {
        "typeid": "enemy-humanoid-troll",
        "name": "Troll",
        "baseHealth": 40,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-claws",
            "name": "Claws",
            "type": "Natural",
            "damage": 7,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Humanoid",
        "combatRating": 8
    },
    {
        "typeid": "enemy-humanoid-apprentice-mage",
        "name": "Dark Apprentice",
        "baseHealth": 14,
        "baseMana": 10,
        "spellTypeids": [],
        "type": "Humanoid",
        "combatRating": 4
    },
    {
        "typeid": "enemy-humanoid-cultist",
        "name": "Cursed Cultist",
        "baseHealth": 16,
        "baseMana": 12,
        "spellTypeids": [],
        "type": "Humanoid",
        "combatRating": 5
    },
    {
        "typeid": "enemy-fire-sprite",
        "name": "Fire Sprite",
        "baseHealth": 10,
        "baseMana": 20,
        "equippedItemTemplate": [{
            "typeid": "natural-burn",
            "name": "Burning Touch",
            "type": "Natural",
            "damage": 6,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "spellTypeids": [
            "spell-fireball"
        ],
        "type": "Beast",
        "combatRating": 10
    },
    {
        "typeid": "enemy-ice-wisp",
        "name": "Ice Wisp",
        "baseHealth": 12,
        "baseMana": 18,
        "equippedItemTemplate": [{
            "typeid": "natural-chill",
            "name": "Chilling Touch",
            "type": "Natural",
            "damage": 6,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "spellTypeids": [],
        "type": "Beast",
        "combatRating": 7
    },
    {
        "typeid": "enemy-humanoid-necromancer",
        "name": "Necromancer",
        "baseHealth": 25,
        "baseMana": 35,
        "spellTypeids": [],
        "type": "Humanoid",
        "combatRating": 13
    },
    {
        "typeid": "enemy-humanoid-ghost",
        "name": "Restless Ghost",
        "baseHealth": 18,
        "baseMana": 25,
        "equippedItemTemplate": [{
            "typeid": "natural-haunt",
            "name": "Haunting Touch",
            "type": "Natural",
            "damage": 6,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "spellTypeids": [],
        "type": "Humanoid",
        "combatRating": 9
    },
    {
        "typeid": "enemy-humanoid-shadow-stalker",
        "name": "Shadow Stalker",
        "baseHealth": 22,
        "baseMana": 15,
        "equippedItemTemplate": [{
            "typeid": "natural-claws",
            "name": "Claws",
            "type": "Natural",
            "damage": 5,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "spellTypeids": [],
        "type": "Humanoid",
        "combatRating": 7
    },
    {
        "typeid": "enemy-humanoid-animated-armor",
        "name": "Animated Armor",
        "baseHealth": 30,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-slam",
            "name": "Heavy Slam",
            "type": "Natural",
            "damage": 5,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Humanoid",
        "combatRating": 6
    },
    {
        "typeid": "enemy-harpy",
        "name": "Harpy",
        "baseHealth": 20,
        "baseMana": 10,
        "equippedItemTemplate": [{
            "typeid": "natural-talons",
            "name": "Talons",
            "type": "Natural",
            "damage": 6,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "spellTypeids": [],
        "type": "Beast",
        "combatRating": 5
    },
    {
        "typeid": "enemy-humanoid-minotaur",
        "name": "Minotaur",
        "baseHealth": 45,
        "baseMana": 0,
        "equippedItemTemplate": [{
            "typeid": "natural-gore",
            "name": "Gore",
            "type": "Natural",
            "damage": 8,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "type": "Humanoid",
        "combatRating": 9
    },
    {
        "typeid": "enemy-drake-whelp",
        "name": "Dragon Whelp",
        "baseHealth": 50,
        "baseMana": 15,
        "equippedItemTemplate": [{
            "typeid": "natural-bite",
            "name": "Bite",
            "type": "Natural",
            "damage": 9,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "spellTypeids": [],
        "type": "Beast",
        "combatRating": 10
    },
    {
        "typeid": "enemy-dragon-ya",
        "name": "Dragon",
        "baseHealth": 60,
        "baseMana": 25,
        "equippedItemTemplate": [{
            "typeid": "natural-claws",
            "name": "Claws",
            "type": "Natural",
            "damage": 12,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "spellTypeids": [],
        "type": "Beast",
        "combatRating": 14
    },
    {
        "typeid": "enemy-dungeon-guardian",
        "name": "Dungeon Guardian",
        "baseHealth": 80,
        "baseMana": 20,
        "equippedItemTemplate": [{
            "typeid": "natural-slam",
            "name": "Crushing Slam",
            "type": "Natural",
            "damage": 10,
            "resilience": 999,
            "equippableLocation": "right-hand"
        }],
        "spellTypeids": [],
        "type": "Beast",
        "combatRating": 14
    },
    {
        "typeid": "enemy-humanoid-warlock-lord",
        "name": "Warlock Lord",
        "baseHealth": 70,
        "baseMana": 60,
        "spellTypeids": [],
        "type": "Humanoid",
        "combatRating": 25
    },
    {
        "typeid": "enemy-humanoid-lich",
        "name": "Lich",
        "baseHealth": 100,
        "baseMana": 100,
        "spellTypeids": [
            "spell-vampiric-touch",
            "spell-drain-life",
            "spell-magicmissle"
        ],
        "type": "Humanoid",
        "combatRating": 42
    }
];