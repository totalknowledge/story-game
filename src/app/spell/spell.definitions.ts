import { SpellModel } from "./spell.model";

export const SPELL_TEMPLATES: Partial<SpellModel>[] = [
    {
        "typeid": "spell-arcane-blast",
        "name": "ArcaneBlast",
        "effect": "area",
        "damage": 3,
        "manaCost": 7,
        "castMessages": [
            "Magical energy erupts throughout the room!"
        ],
        "type": "Arcane",
        "combatRating": 1.3
    },
    {
        "typeid": "spell-magic-missile",
        "name": "MagicMissile",
        "effect": "additional-target",
        "damage": 2,
        "manaCost": 3,
        "castMessages": [
            "Three darts of glowing blue energy streak toward the target."
        ],
        "type": "Arcane",
        "combatRating": 0.8
    },
    {
        "typeid": "spell-fireball",
        "name": "Fireball",
        "effect": "single-target",
        "damage": 9,
        "manaCost": 5,
        "castMessages": [
            "{user} hurls a blazing sphere of fire!"
        ],
        "type": "Fire",
        "combatRating": 2.7
    },
    {
        "typeid": "spell-scorch",
        "name": "Scorch",
        "effect": "single-target",
        "damage": 4,
        "manaCost": 4,
        "castMessages": [
            "A sudden burst of intense heat flares up under the target."
        ],
        "type": "Fire",
        "combatRating": 1.2
    },
    {
        "typeid": "spell-blizzard",
        "name": "Blizzard",
        "effect": "area",
        "damage": 9,
        "manaCost": 10,
        "castMessages": [
            "Freezing winds and heavy slush pummel the area."
        ],
        "type": "Frost",
        "combatRating": 4.1
    },
    {
        "typeid": "spell-ice-spike",
        "name": "IceSpike",
        "effect": "single-target",
        "damage": 8,
        "manaCost": 6,
        "castMessages": [
            "A jagged shard of ice forms in the air and launches forward."
        ],
        "type": "Frost",
        "combatRating": 2.4
    },
    {
        "typeid": "spell-holy-nova",
        "name": "HolyNova",
        "effect": "area",
        "damage": 6,
        "healsUser": 4,
        "manaCost": 10,
        "castMessages": [
            "An explosion of light both harms the foe and mends {user}'s wounds."
        ],
        "type": "Holy",
        "combatRating": 3.6
    },
    {
        "typeid": "spell-greater-heal",
        "name": "GreaterHeal",
        "effect": "heal",
        "damage": 0,
        "healsUser": 20,
        "manaCost": 12,
        "castMessages": [
            "A brilliant radiance washes away {user}'s injuries."
        ],
        "type": "Holy",
        "combatRating": 3
    },
    {
        "typeid": "spell-smite",
        "name": "Smite",
        "effect": "single-target",
        "damage": 10,
        "manaCost": 7,
        "castMessages": [
            "A pillar of righteous light descends from the ceiling!"
        ],
        "type": "Holy",
        "combatRating": 3
    },
    {
        "typeid": "spell-lesser-heal",
        "name": "LesserHeal",
        "effect": "heal",
        "healsUser": 9,
        "manaCost": 5,
        "castMessages": [
            "A soft, golden light envelops {user}."
        ],
        "type": "Holy",
        "combatRating": 1.3
    },
    {
        "typeid": "spell-acid-splash",
        "name": "AcidSplash",
        "effect": "single-target",
        "damage": 4,
        "manaCost": 4,
        "castMessages": [
            "{user} flings a bubble of corrosive green liquid."
        ],
        "type": "Nature",
        "combatRating": 1.2
    },
    {
        "typeid": "spell-vampiric-touch",
        "name": "VampiricTouch",
        "effect": "vampiric",
        "damage": 6,
        "healsUser": 4,
        "manaCost": 6,
        "castMessages": [
            "{user}'s hand glows with a sickly purple light as they reach out."
        ],
        "type": "Necromancy",
        "combatRating": 2.9
    },
    {
        "typeid": "spell-drain-life",
        "name": "DrainLife",
        "effect": "vampiric",
        "damage": 5,
        "healsUser": 2,
        "manaCost": 4,
        "castMessages": [
            "A dark, wispy tendril siphons energy from the target."
        ],
        "type": "Necromancy",
        "combatRating": 2.2
    },
    {
        "typeid": "spell-chain-lightning",
        "name": "ChainLightning",
        "effect": "additional-target",
        "damage": 9,
        "manaCost": 7,
        "castMessages": [
            "A jagged bolt of electricity arcs through the air!"
        ],
        "type": "Storm",
        "combatRating": 3.5
    },
    {
        "typeid": "spell-thunder-clap",
        "name": "ThunderClap",
        "effect": "area",
        "damage": 6,
        "manaCost": 11,
        "castMessages": [
            "The air booms with a deafening crack of thunder!"
        ],
        "type": "Storm",
        "combatRating": 2.7
    },
    {
        "typeid": "spell-shocking-grasp",
        "name": "ShockingGrasp",
        "type": "Storm",
        "effect": "single-target",
        "damage": 3,
        "manaCost": 2,
        "castMessages": ["{user} grasps {target} and electric sparks dance between them."],
        "combatRating": 0.9
    }
];