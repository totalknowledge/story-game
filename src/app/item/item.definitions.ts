import { ARMOR } from "./item.definitions.armor";
import { CONSUMABLES } from "./item.definitions.consumables";
import { WEAPONS } from "./item.definitions.weapons";

export type EquipLocation = 'head' | 'body' | 'right-hand' | 'left-hand' | 'left-finger' | 'legs' | 'feet' | 'neck' | 'none';

export type ItemQuality = 'damaged' | 'standard' | 'fine' | 'elite' | 'magical';

export const ITEM_TEMPLATES = [
    ...CONSUMABLES,
    ...WEAPONS,
    {
        "typeid": "ammo-arrows",
        "name": "Arrow",
        "type": "Ammo",
        "equippableLocation": "right-hand",
        "quality": "standard",
        "damage": 6,
        "quantity": 20,
        "useMessages": [
            "{user} uses {item} to attack."
        ]
    },
    ...ARMOR,
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
        "quality": "elite",
        "useMessages": [
            "{user} wears {item}. A faint aura surrounds them."
        ]
    },
    {
        "typeid": "trinket-charm-luck",
        "name": "Lucky Charm",
        "type": "Trinket",
        "equippableLocation": "neck",
        "quality": "elite",
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
        "quality": "standard",
        "plusArmor": 1,
        "useMessages": [
            "{user} lights {item}. Shadows retreat slightly."
        ]
    },
    {
        "typeid": "key-catacombs",
        "name": "Key to the Catacombs",
        "type": "Utility",
        "equippableLocation": "none",
        "quality": "standard",
        "excludeFromRandom": true,
        "unlocks": ["crypts-01"],
        "useMessages": [
            "{user} uses {item}."
        ]
    },
    {
        "typeid": "scroll",
        "name": "Scroll",
        "type": "Scroll",
        "equippableLocation": "none",
        "quality": "magical",
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
        "quality": "magical",
        "useMessages": [
            "{user} learns {spell}"
        ],
        "teaches": []
    }
];