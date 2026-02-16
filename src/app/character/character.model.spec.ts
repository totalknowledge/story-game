import { CharacterModel } from './character.model';

describe('CharacterModel', () => {
  it('should create an instance', () => {
    expect(new CharacterModel('Bob', 30, 10)).toBeTruthy();
  });
});
