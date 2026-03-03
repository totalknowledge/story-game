import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tooltip } from './tooltip';

describe('Tooltip', () => {
  let component: Tooltip;
  let fixture: ComponentFixture<Tooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tooltip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tooltip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses default input values', () => {
    expect(component.direction).toBe('right');
    expect(component.widthClass).toBe('w-56');
  });

  it('accepts a required entry input value', () => {
    const entry = { name: 'Iron Sword', type: 'Weapon' };
    component.entry = entry;

    expect(component.entry).toEqual(entry);
  });

  it('applies custom direction and widthClass inputs', async () => {
    fixture.componentRef.setInput('entry', { name: 'Arcane Orb' });
    fixture.componentRef.setInput('direction', 'left');
    fixture.componentRef.setInput('widthClass', 'w-72');
    await fixture.whenStable();

    expect(component.direction).toBe('left');
    expect(component.widthClass).toBe('w-72');
  });

  it('renders tooltip panel only when entry is present', async () => {
    fixture.componentRef.setInput('entry', undefined);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tooltip-panel')).toBeNull();

    fixture.componentRef.setInput('entry', { name: 'Health Potion' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tooltip-panel')).toBeTruthy();
  });

  it('shows consumable heal and restore values', async () => {
    fixture.componentRef.setInput('entry', {
      name: 'Potion of Clarity',
      type: 'Consumable',
      heals: 12,
      restores: 8,
    });
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Heals:');
    expect(text).toContain('12');
    expect(text).toContain('Restores:');
    expect(text).toContain('8');
  });
});
