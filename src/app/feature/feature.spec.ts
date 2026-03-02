import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { Feature } from './feature';

describe('Feature', () => {
  let component: Feature;
  let fixture: ComponentFixture<Feature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Feature);
    component = fixture.componentInstance;
    // assign input signal; cast through any to satisfy InputSignal branding
    component.feature = signal({ id: 'f1', name: 'Feat', type: 'Decoration', options: [] } as any) as any;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
