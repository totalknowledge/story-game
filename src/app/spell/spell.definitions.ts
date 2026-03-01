import { SpellModel } from "./spell.model";

export const SPELL_TEMPLATES: Partial<SpellModel>[] = [
    {
        "typeid": "spell-fireball",
        "name": "Fireball",
        "effect": "single-target",
        "damage": 9,
        "manaCost": 4,
        "school": "Fire",
        "castMessages": [
            "{user} hurls a blazing sphere of fire!"
        ]
    },
    {
        "typeid": "spell-magic-missile",
        "name": "MagicMissile",
        "effect": "additional-target",
        "damage": 2,
        "manaCost": 2,
        "school": "Arcane",
        "castMessages": [
            "Three darts of glowing blue energy streak toward the target."
        ]
    },
    {
        "typeid": "spell-lesser-heal",
        "name": "LesserHeal",
        "effect": "heal",
        "healsUser": 9,
        "manaCost": 4,
        "school": "Holy",
        "castMessages": [
            "A soft, golden light envelops {user}."
        ]
    },
    {
        "typeid": "spell-ice-spike",
        "name": "IceSpike",
        "effect": "single-target",
        "damage": 8,
        "manaCost": 5,
        "school": "Frost",
        "castMessages": [
            "A jagged shard of ice forms in the air and launches forward."
        ]
    },
    {
        "typeid": "spell-thunder-clap",
        "name": "ThunderClap",
        "effect": "area",
        "damage": 6,
        "manaCost": 10,
        "school": "Storm",
        "castMessages": [
            "The air booms with a deafening crack of thunder!"
        ]
    },
    {
        "typeid": "spell-drain-life",
        "name": "DrainLife",
        "effect": "vampiric",
        "damage": 5,
        "healsUser": 2,
        "manaCost": 3,
        "school": "Necromancy",
        "castMessages": [
            "A dark, wispy tendril siphons energy from the target."
        ]
    },
    {
        "typeid": "spell-smite",
        "name": "Smite",
        "effect": "single-target",
        "damage": 10,
        "manaCost": 6,
        "school": "Holy",
        "castMessages": [
            "A pillar of righteous light descends from the ceiling!"
        ]
    },
    {
        "typeid": "spell-acid-splash",
        "name": "AcidSplash",
        "effect": "single-target",
        "damage": 4,
        "manaCost": 3,
        "school": "Nature",
        "castMessages": [
            "{user} flings a bubble of corrosive green liquid."
        ]
    },
    {
        "typeid": "spell-vampiric-touch",
        "name": "VampiricTouch",
        "effect": "vampiric",
        "damage": 6,
        "healsUser": 4,
        "manaCost": 5,
        "school": "Necromancy",
        "castMessages": [
            "{user}'s hand glows with a sickly purple light as they reach out."
        ]
    },
    {
        "typeid": "spell-arcane-blast",
        "name": "ArcaneBlast",
        "effect": "area",
        "damage": 3,
        "manaCost": 6,
        "school": "Arcane",
        "castMessages": [
            "Magical energy erupts throughout the room!"
        ]
    },
    {
        "typeid": "spell-scorch",
        "name": "Scorch",
        "effect": "single-target",
        "damage": 4,
        "manaCost": 3,
        "school": "Fire",
        "castMessages": [
            "A sudden burst of intense heat flares up under the target."
        ]
    },
    {
        "typeid": "spell-holy-nova",
        "name": "HolyNova",
        "effect": "area",
        "damage": 6,
        "healsUser": 4,
        "manaCost": 9,
        "school": "Holy",
        "castMessages": [
            "An explosion of light both harms the foe and mends {user}'s wounds."
        ]
    },
    {
        "typeid": "spell-blizzard",
        "name": "Blizzard",
        "effect": "area",
        "damage": 9,
        "manaCost": 9,
        "school": "Frost",
        "castMessages": [
            "Freezing winds and heavy slush pummel the area."
        ]
    },
    {
        "typeid": "spell-chain-lightning",
        "name": "ChainLightning",
        "effect": "additional-target",
        "damage": 9,
        "manaCost": 6,
        "school": "Storm",
        "castMessages": [
            "A jagged bolt of electricity arcs through the air!"
        ]
    },
    {
        "typeid": "spell-greater-heal",
        "name": "GreaterHeal",
        "effect": "heal",
        "damage": 0,
        "healsUser": 20,
        "manaCost": 11,
        "school": "Holy",
        "castMessages": [
            "A brilliant radiance washes away {user}'s injuries."
        ]
    }
]