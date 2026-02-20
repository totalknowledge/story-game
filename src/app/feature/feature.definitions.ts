export type FeatureType = 'bank' | 'store' | 'chest' | 'wellspring' | 'decoration';

export const FEATURE_TEMPLATES = [
    {
        typeid: 'feature-bank-vault',
        name: 'Bank Vault',
        type: 'bank',
        description: 'A secure vault where you can store your belongings.',
        interactable: true,
        itemSlots: 20,
        items: []
    },
    {
        typeid: 'feature-general-store',
        name: 'Store',
        type: 'store',
        description: 'A merchant sells various goods here.',
        interactable: true,
        sellMultiplier: 0.5,
        gold: 1000,
        items: []
    },
    {
        typeid: 'feature-treasure-chest',
        name: 'Treasure Chest',
        type: 'chest',
        description: 'A wooden chest bound with iron.',
        interactable: true,
        items: []
    },
    {
        typeid: 'feature-mana-wellspring',
        name: 'Mana Wellspring',
        type: 'wellspring',
        description: 'A shimmering pool of magical energy.',
        interactable: true
    },
    {
        typeid: 'feature-statue',
        name: 'Ancient Statue',
        type: 'decoration',
        description: 'A weathered stone statue of a forgotten hero.',
        interactable: false
    }
];