import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { Character } from './character';

describe('Character', () => {
  let component: Character;
  let fixture: ComponentFixture<Character>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Character]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Character);
    component = fixture.componentInstance;
    component.character = signal({ id: '1', name: 'Test', typeid: 'player', type: 'Beast', named: false, classification: 'normal', baseHealth: 10, currentHealth: 10, maxHealth: 10, baseMana: 0, currentMana: 0, equipment: new Map(), items: [], spells: [], money: { gold: 0, silver: 0, copper: 0 }, roomCoordinatesKey: '' } as any) as any;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('determines castability based on current mana and spell mana cost', () => {
    component.character = signal({
      id: '1',
      name: 'Mage',
      typeid: 'player',
      type: 'Humanoid',
      named: false,
      classification: 'normal',
      baseHealth: 10,
      currentHealth: 10,
      maxHealth: 10,
      baseMana: 10,
      currentMana: 4,
      equipment: new Map(),
      items: [],
      spells: [],
      money: { gold: 0, silver: 0, copper: 0 },
      roomCoordinatesKey: ''
    } as any) as any;

    expect(component.canCastSpell({ manaCost: 3 })).toBe(true);
    expect(component.canCastSpell({ manaCost: 5 })).toBe(false);
  });
});
