import { inject, Injectable } from '@angular/core';
import { CharacterModel } from '../character/character.model';
import { GameEngineService } from '../game-engine/game-engine.service';
import { CharacterService } from '../character/character.service';
import { d10, pickRandom } from '../utilities/dice.definitions';

@Injectable({
  providedIn: 'root',
})
export class EnemyDecision {
  private gameEngine = inject(GameEngineService);
  private characterService = inject(CharacterService);

  processEnemyTurns(): string[] {
    const combatLog: string[] = [];
    const enemies = this.characterService.getActiveEnemies();
    const player = this.characterService.getPlayer()();

    if (!player || player.isDead) return combatLog;

    enemies.forEach(enemy => {
      // Enemy AI logic here
      const enemyAction = this.decideEnemyAction(enemy, player);
      combatLog.push(...enemyAction);
    });

    return combatLog;
  }

  private decideEnemyAction(enemy: CharacterModel, player: CharacterModel): string[] {
    const decisionRoll = d10();
    const outputDialog: string[] = [];
    let result;
    if (enemy.spells.length > 0) {
      result = this.gameEngine.cast(enemy, pickRandom(enemy.spells), player.name);
    } else {
      result = this.gameEngine.attack(enemy, player.name);
    }
    outputDialog.push(...result);
    return outputDialog;
  }
}
