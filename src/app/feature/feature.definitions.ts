export type FeatureType = 'Bank' | 'Store' | 'Chest' | 'Wellspring' | 'Decoration';

export const FEATURE_TEMPLATES = [
    {
        typeid: 'feature-bank-vault',
        name: 'Bank Vault',
        type: 'Bank',
        description: 'A secure vault where you can store your belongings.',
        interactable: true,
        itemSlots: 20,
        items: []
    },
    {
        typeid: 'feature-general-store',
        name: 'Store',
        type: 'Store',
        description: 'A merchant sells various goods here.',
        interactable: true,
        sellMultiplier: 0.5,
        gold: 1000,
        items: []
    },
    {
        typeid: 'feature-treasure-chest',
        name: 'Treasure Chest',
        type: 'Chest',
        description: 'A wooden chest bound with iron.',
        interactable: true,
        items: []
    },
    {
        typeid: 'feature-mana-wellspring',
        name: 'Mana Wellspring',
        type: 'Wellspring',
        description: 'A shimmering pool of magical energy.',
        interactable: true
    },
    {
        typeid: 'feature-statue',
        name: 'Ancient Statue',
        type: 'Decoration',
        description: 'A weathered stone statue of a forgotten hero.',
        interactable: false
    },
    {
        typeid: 'feature-blacksmith-forge',
        name: 'Blacksmith Forge',
        type: 'store',
        interactable: true,
        description: 'A massive stone forge with glowing embers.',
        items: []
    },
    {
        typeid: 'feature-hidden-cache',
        name: 'Hidden Cache',
        type: 'Chest',
        description: 'A concealed stash tucked into the cave wall.',
        interactable: true,
        items: ['key-catacombs']
    }
];