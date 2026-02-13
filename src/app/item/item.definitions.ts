export type EquipLocation = 'head' | 'body' | 'right-hand' | 'left-hand' | 'left-finger' | 'legs' | 'feet' | 'neck' | 'none';

export const ITEM_TEMPLATES = [
    {
        "typeid": "potion-health-minor",
        "name": "Minor Health Potion",
        "type": "Consumable",
        "equippableLocation": "none",
        "heals": 5,
        "useMessages": [
            "{user} drinks {item} and recovers {value} health."
        ]
    },
    {
        "typeid": "potion-health",
        "name": "Health Potion",
        "type": "Consumable",
        "equippableLocation": "none",
        "heals": 15,
        "useMessages": [
            "{user} drinks {item} and recovers {value} health."
        ]
    },
    {
        "typeid": "potion-health-major",
        "name": "Major Health Potion",
        "type": "Consumable",
        "equippableLocation": "none",
        "heals": 35,
        "useMessages": [
            "{user} drinks {item} and recovers {value} health."
        ]
    },
    {
        "typeid": "potion-mana-minor",
        "name": "Minor Mana Potion",
        "type": "Consumable",
        "equippableLocation": "none",
        "restores": 5,
        "useMessages": [
            "{user} drinks {item} and restores {value} mana."
        ]
    },
    {
        "typeid": "potion-mana",
        "name": "Mana Potion",
        "type": "Consumable",
        "equippableLocation": "none",
        "restores": 15,
        "useMessages": [
            "{user} drinks {item} and restores {value} mana."
        ]
    },
    {
        "typeid": "potion-mana-major",
        "name": "Major Mana Potion",
        "type": "Consumable",
        "equippableLocation": "none",
        "restores": 35,
        "useMessages": [
            "{user} drinks {item} and restores {value} mana."
        ]
    },
    {
        "typeid": "food-bread",
        "name": "Loaf of Bread",
        "type": "Consumable",
        "equippableLocation": "none",
        "heals": 4,
        "useMessages": [
            "{user} eats {item} and recovers {value} health."
        ]
    },
    {
        "typeid": "food-cheese",
        "name": "Cheese Wheel",
        "type": "Consumable",
        "equippableLocation": "none",
        "heals": 4,
        "useMessages": [
            "{user} eats {item} and recovers {value} health."
        ]
    },
    {
        "typeid": "food-apple",
        "name": "Shiny Apple",
        "type": "Consumable",
        "equippableLocation": "none",
        "heals": 3,
        "useMessages": [
            "{user} eats {item} and recovers {value} health."
        ]
    },
    {
        "typeid": "food-meat",
        "name": "Cooked Meat",
        "type": "Consumable",
        "equippableLocation": "none",
        "heals": 6,
        "useMessages": [
            "{user} eats {item} and recovers {value} health."
        ]
    },
    {
        "typeid": "weapon-dagger-rusty",
        "name": "Rusty Dagger",
        "type": "Weapon",
        "equippableLocation": "right-hand",
        "damage": 4,
        "resilience": 10,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "weapon-big-stick",
        "name": "Big Stick",
        "type": "Weapon",
        "equippableLocation": "right-hand",
        "plusArmor": 1,
        "damage": 4,
        "resilience": 5,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "weapon-sword-iron",
        "name": "Iron Sword",
        "type": "Weapon",
        "equippableLocation": "right-hand",
        "plusArmor": 2,
        "damage": 6,
        "resilience": 25,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "weapon-sword-steel",
        "name": "Steel Sword",
        "type": "Weapon",
        "equippableLocation": "right-hand",
        "plusArmor": 1,
        "damage": 6,
        "resilience": 35,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "weapon-magic-blade",
        "name": "Magic Blade",
        "type": "Weapon",
        "equippableLocation": "right-hand",
        "plusArmor": 3,
        "damage": 11,
        "resilience": 66,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "weapon-axe-battle",
        "name": "Battle Axe",
        "type": "Weapon",
        "equippableLocation": "right-hand",
        "plusArmor": 2,
        "damage": 8,
        "resilience": 30,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "weapon-mace-heavy",
        "name": "Heavy Mace",
        "type": "Weapon",
        "equippableLocation": "right-hand",
        "plusArmor": 1,
        "damage": 7,
        "resilience": 40,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "weapon-spear-long",
        "name": "Long Spear",
        "type": "Weapon",
        "equippableLocation": "right-hand",
        "plusArmor": 3,
        "damage": 6,
        "resilience": 30,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
    {
        "typeid": "weapon-bow-short",
        "name": "Short Bow",
        "type": "Weapon",
        "equippableLocation": "left-hand",
        "plusArmor": 1,
        "damage": 2,
        "resilience": 20,
        "useMessages": [
            "{user} equips {item}."
        ]
    },
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
    {
        "typeid": "trinket-ring",
        "name": "Ring",
        "type": "Trinket",
        "equippableLocation": "left-finger",
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