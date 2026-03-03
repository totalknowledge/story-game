import { inject, Injectable } from '@angular/core';
import { CharacterService } from '../character/character.service';
import { MapService } from '../map/map.service';
import { CharacterModel } from '../character/character.model';
import { ItemModel } from '../item/item.model';
import { SpellFactory } from '../spell/spell.factory';
import { CombatEngineService } from './combat-engine.service';
import { TargetingEngine } from './target-engine.service';
import { TargetDeterminationScheme } from './game-engine.definitions';
import { FeatureService } from '../feature/feature.service';
import { d100 } from '../utilities/dice.definitions';

@Injectable({
  providedIn: 'root',
})
export class InteractionEngineService {
  private characterService = inject(CharacterService);
  private combatEngine = inject(CombatEngineService);
  private featureService = inject(FeatureService);
  private targetingEngine = inject(TargetingEngine);
  private spellFactory = inject(SpellFactory);
  private mapService = inject(MapService);

  public place(player: CharacterModel, itemName: string, feature: any): string[] {
    console.log('Attempting to place item:', itemName, 'into feature:', feature.name);
    console.log('Player inventory before placing:', player.items);
    console.log('Feature: ', feature);
    const itemToTransfer = player.items.find(inventoryItem =>
      inventoryItem.name.toLowerCase().includes(itemName.toLowerCase())
    );
    if (!itemToTransfer) return [`You don't have a "${itemName}".`];

    const transactionResult = this.featureService.processPlace(player, itemToTransfer, feature);

    if (transactionResult.isSale) {
      console.log('Item sold:', itemToTransfer.name);
      console.log('Player money after sale:', this.characterService.getFlatCurrencyAmount(player));
      player.items = player.items.filter(inventoryItem => inventoryItem.id !== itemToTransfer.id);
      feature.items.push(itemToTransfer);
      this.characterService.updateCharacter(player);
      return [transactionResult.message!];
    }

    if (feature.itemSlots && feature.items.length >= feature.itemSlots) {
      return [`The ${feature.name} is full.`];
    }

    feature.items.push(itemToTransfer);
    player.items = player.items.filter(inventoryItem => inventoryItem.id !== itemToTransfer.id);
    this.characterService.updateCharacter(player);

    return [`You placed ${itemToTransfer.name} in the ${feature.name}.`];
  }

  public take(player: CharacterModel, itemName: string, feature: any): string[] {
    const itemInFeature = feature.items?.find((targetItem: any) =>
      targetItem.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!itemInFeature) return [`The ${feature.name} does not have a "${itemName}".`];

    const transactionResult = this.featureService.processTake(player, itemInFeature, feature);
    if (!transactionResult.allowed) return [transactionResult.message!];

    const inventoryAcquired = this.characterService.acquireItem(player.id!, [itemInFeature]);
    if (!inventoryAcquired) return ['Your inventory is full.'];

    feature.items = feature.items.filter((targetItem: any) => targetItem.id !== itemInFeature.id);
    this.characterService.updateCharacter(player);

    const confirmationVerb = feature.type === 'store' ? 'bought' : 'took';
    return [`You ${confirmationVerb} ${itemInFeature.name} from the ${feature.name}.`];
  }

  public use(actor: CharacterModel, targetName: string, charactersInRoom: CharacterModel[] = []): string[] {
    const inventoryItem = actor.items.find(item =>
      item.name.toLowerCase().includes(targetName.toLowerCase())
    );

    if (inventoryItem) {
      return this.resolveItemUsage(actor, inventoryItem, charactersInRoom);
    }

    const currentRoom = this.mapService.currentRoom();
    if (!currentRoom) return [`You don't have or see a "${targetName}" to use.`];

    const targetingResult = this.targetingEngine.resolveTargets({
      actor: actor,
      targetFragment: targetName,
      featuresInRoom: currentRoom.features,
      determinationScheme: 'use'
    });

    const feature = targetingResult.featureTargets?.[0];

    if (feature) {
      return this.mapService.toggleFeature(feature.name);
    }

    return [`You don't have or see a "${targetName}" to use.`];
  }

  private resolveItemUsage(actor: CharacterModel, item: ItemModel, charactersInRoom: CharacterModel[] = []): string[] {
    const interactionLog: string[] = [];

    switch (item.type) {
      case 'Consumable':
        interactionLog.push(...this.applyConsumableEffects(actor, item));
        this.decrementOrRemoveInventoryItem(actor, item);
        break;

      case 'Armor':
      case 'Weapon':
      case 'Trinket':
      case 'Utility':
        const equipSuccess = this.characterService.equipItem(actor.id!, item);
        interactionLog.push(equipSuccess ? `You equipped ${item.name}.` : `You cannot equip ${item.name}.`);
        break;

      case 'Scroll':
        interactionLog.push(...this.resolveScrollUsage(actor, item, charactersInRoom));
        this.removeItemFromActor(actor, item);
        break;

      case 'SpellBook':
        if (item.teaches?.length) {
          item.teaches.forEach(spellName => {
            interactionLog.push(...this.learnsSpell(actor, spellName));
          });
        }
        break;
    }

    this.characterService.updateCharacter(actor);
    return interactionLog;
  }

  private applyConsumableEffects(actor: CharacterModel, item: ItemModel): string[] {
    const effectMessages: string[] = [];
    let numericalEffectValue = 0;

    if (item.heals) {
      actor.damage = Math.max(0, actor.damage - item.heals);
      numericalEffectValue = item.heals;
    }

    if (item.restores) {
      actor.usedMana = Math.max(0, actor.usedMana - item.restores);
      numericalEffectValue = item.restores;
    }

    const templateMessage = item.useMessages?.[0] || "{user} uses {item}.";
    const formattedMessage = templateMessage
      .replace('{user}', actor.name)
      .replace('{item}', item.name)
      .replace('{value}', numericalEffectValue.toString());

    effectMessages.push(formattedMessage);
    return effectMessages;
  }

  private learnsSpell(actor: CharacterModel, spelltypeId: string): string[] {
    let known = false;
    const interactionLog = [];
    actor.spells.forEach(spell => {
      if (spell.typeid === spelltypeId) known = true;
    });
    if (!known) {
      actor.spells.push(this.spellFactory.createSpell(spelltypeId));
      interactionLog.push(`${actor.name} learns: ${spelltypeId}.`);
    }
    return interactionLog;
  }

  private resolveScrollUsage(actor: CharacterModel, scroll: ItemModel, charactersInRoom: CharacterModel[] = []): string[] {
    const scrollLog: string[] = [];

    if (!scroll.teaches || scroll.teaches.length === 0) {
      return [`The ${scroll.name} is blank and does nothing.`];
    }

    const spellTypeId = scroll.teaches[0];

    scrollLog.push(`${actor.name} unfurls the ${scroll.name}...`);

    const spell = this.spellFactory.createSpell(spellTypeId);

    if (!spell) {
      return [`The magic within the ${scroll.name} sputters and dies.`];
    }

    spell.manaCost = 0;

    const targetingResult = this.targetingEngine.resolveTargets({
      actor,
      charactersInRoom,
      determinationScheme: spell.effect as TargetDeterminationScheme
    });

    const castResult = this.combatEngine.cast(
      actor,
      spell,
      targetingResult.hostileTargets || [],
      targetingResult.friendlyTargets || []
    );

    scrollLog.push(...castResult);

    const masteryRoll = d100();
    const learningThreshold = 10;

    const alreadyKnowsSpell = actor.spells.some(existingSpell => existingSpell.typeid === spell.typeid);

    if (masteryRoll <= learningThreshold && !alreadyKnowsSpell) {
      this.learnsSpell(actor, spell.typeid)
      scrollLog.push(`Insight flashes in ${actor.name}'s mind! You have mastered ${spell.name}.`);
    }

    return scrollLog;
  }

  private removeItemFromActor(actor: CharacterModel, item: ItemModel): void {
    actor.items = actor.items.filter(inventoryItem => inventoryItem.id !== item.id);
  }

  private decrementOrRemoveInventoryItem(actor: CharacterModel, item: ItemModel): void {
    const currentQuantity = item.quantity ?? 1;
    const updatedQuantity = currentQuantity - 1;

    if (updatedQuantity > 0) {
      item.quantity = updatedQuantity;
      return;
    }

    this.removeItemFromActor(actor, item);
  }
}