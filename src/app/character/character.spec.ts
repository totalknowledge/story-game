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
    // supply required input
    // assign input signal; cast through any to satisfy InputSignal branding
    component.character = signal({ id: '1', name: 'Test', typeid: 'player', type: 'Beast', named: false, classification: 'normal', baseHealth: 10, currentHealth: 10, maxHealth: 10, baseMana: 0, currentMana: 0, equipment: new Map(), items: [], spells: [], money: { gold: 0, silver: 0, copper: 0 }, roomCoordinatesKey: '' } as any) as any;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
