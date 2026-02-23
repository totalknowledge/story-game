import { inject, Injectable } from "@angular/core";
import { CharacterModel } from "../character/character.model";
import { CharacterService } from "../character/character.service";

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private characterService = inject(CharacterService);
  private readonly SELL_MULTIPLIER = 0.65;

  public formatMoney(totalCopper: number): string {
    const gold = Math.floor(totalCopper / 100);
    const silver = Math.floor((totalCopper % 100) / 10);
    const copper = totalCopper % 10;

    const parts = [];
    if (gold > 0) parts.push(`${gold}g`);
    if (silver > 0) parts.push(`${silver}s`);
    if (copper > 0 || parts.length === 0) parts.push(`${copper}c`);

    return parts.join(' ');
  }

  public processPlace(player: CharacterModel, item: any, feature: any): { isSale: boolean, message?: string } {
    if (feature.type === 'Store') {
      const baseValue = item.price || 100;
      const sellValue = Math.round(baseValue * this.SELL_MULTIPLIER);
      const playerFunds = this.characterService.getFlatCurrencyAmount(player);

      this.characterService.updateMoneyFromFlat(player, playerFunds + sellValue);

      return {
        isSale: true,
        message: `You sell ${item.name} for ${this.formatMoney(sellValue)}.`
      };
    }

    return { isSale: false };
  }

  public processTake(player: CharacterModel, item: any, feature: any): { allowed: boolean, message?: string } {
    if (feature.type === 'Store') {
      const price = item.price || 100;
      const playerFunds = this.characterService.getFlatCurrencyAmount(player);

      if (playerFunds < price) {
        return {
          allowed: false,
          message: `That costs ${this.formatMoney(price)}. You only have ${this.formatMoney(playerFunds)}.`
        };
      }

      this.characterService.updateMoneyFromFlat(player, playerFunds - price);
    }

    return { allowed: true };
  }
}