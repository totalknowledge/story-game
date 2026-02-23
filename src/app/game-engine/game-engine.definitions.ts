import { CharacterModel } from "../character/character.model";
import { FeatureModel } from "../feature/feature.model";
import { ItemModel } from "../item/item.model";

export type TargetDeterminationScheme = 'area' | 'single-target' | 'heal' | 'vampiric' | 'dead' | 'additional-target' | 'use';

export interface TargetingResult {
  hostileTargets?: CharacterModel[];
  friendlyTargets?: CharacterModel[];
  itemTargets?: ItemModel[];
  featureTargets?: FeatureModel[];
}

export interface TargetingRequest {
    actor: CharacterModel;
    targetFragment?: string;
    charactersInRoom?: CharacterModel[];
    featuresInRoom?: FeatureModel[];
    determinationScheme?: TargetDeterminationScheme;
}
  