import { ARMOR } from "./item.definitions.armor";
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

    ...ARMOR,

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