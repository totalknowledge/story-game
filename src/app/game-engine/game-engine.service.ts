import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  movePlayer(command: string) {
    throw new Error('Method not implemented.');
  }
  attemptSearch() {
    throw new Error('Method not implemented.');
  }
  lookAround() {
    throw new Error('Method not implemented.');
  }
  
}
