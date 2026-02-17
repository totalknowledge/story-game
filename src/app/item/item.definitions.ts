import { CONSUMABLES } from "./item.definitions.consumables";
import { WEAPONS } from "./item.definitions.weapons";

export type EquipLocation = 'head' | 'body' | 'right-hand' | 'left-hand' | 'left-finger' | 'legs' | 'feet' | 'neck' | 'none';

export const ITEM_TEMPLATES = [
    // Consumables
    ...CONSUMABLES,

    // Weapons
    ...WEAPONS,

    // Ammo
    {
        "typeid": "ammo-arrows",
        "name": "Arrow",
        "type": "Ammo",
        "equippableLocation": "right-hand",
        "damage": 6,
        "quantity": 20,
        "useMessages": [
            "{user} uses {item} to attack."
        ]
    },

    // Armor
    {
        "typeid": "armor-shield-wooden",
        "name": "Wooden Shield",
        "type": "Armor",
        "equippableLocation": "left-hand",
        "plusArmor": 2,
        "resilience": 15,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "armor-shield-steel",
        "name": "Steel Shield",
        "type": "Armor",
        "equippableLocation": "left-hand",
        "plusArmor": 3,
        "resilience": 30,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "armor-helmet-leather",
        "name": "Leather Helmet",
        "type": "Armor",
        "equippableLocation": "head",
        "plusArmor": 1,
        "resilience": 10,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "armor-helmet-iron",
        "name": "Iron Helmet",
        "type": "Armor",
        "equippableLocation": "head",
        "plusArmor": 3,
        "resilience": 20,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "armor-chest-leather",
        "name": "Leather Armor",
        "type": "Armor",
        "equippableLocation": "body",
        "plusArmor": 3,
        "resilience": 25,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "armor-chest-chainmail",
        "name": "Chainmail Armor",
        "type": "Armor",
        "equippableLocation": "body",
        "plusArmor": 5,
        "resilience": 40,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "armor-boots-travel",
        "name": "Traveler's Boots",
        "type": "Armor",
        "equippableLocation": "feet",
        "plusArmor": 1,
        "resilience": 8,
        "useMessages": [
            "{user} equips {item}."
        ]
    },

    // Misc
    {
        "typeid": "trinket-ring",
        "name": "Ring",
        "type": "Trinket",
        "equippableLocation": "left-finger",
        "quality": "fine",
        "useMessages": [
            "It looks so nice."
        ]
    },
    {
        "typeid": "trinket-amulet",
        "name": "Amulet",
        "type": "Trinket",
        "equippableLocation": "neck",
        "useMessages": [
            "{user} wears {item}. A faint aura surrounds them."
        ]
    },
    {
        "typeid": "trinket-charm-luck",
        "name": "Lucky Charm",
        "type": "Trinket",
        "equippableLocation": "neck",
        "bonusHealth": 5,
        "bonusMana": 5,
        "useMessages": [
            "{user} carries {item}. Fortune seems closer."
        ]
    },
    {
        "typeid": "utility-torch",
        "name": "Torch",
        "type": "Utility",
        "equippableLocation": "left-hand",
        "useMessages": [
            "{user} lights {item}. Shadows retreat slightly."
        ]
    },
    {
        "typeid": "scroll",
        "name": "Scroll",
        "type": "Scroll",
        "equippableLocation": "none",
        "useMessages": [
            "{user} learns {spell}"
        ],
        "teaches": []
    },
    {
        "typeid": "spell-book",
        "name": "Spell Book",
        "type": "SpellBook",
        "equippableLocation": "none",
        "useMessages": [
            "{user} learns {spell}"
        ],
        "teaches": []
    }
];