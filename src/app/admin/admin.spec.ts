import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Admin } from './admin';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sorts item rows by type then combat rating then name', () => {
    component.activeTab = 'items';
    component.items = [
      { typeid: 'b-1', type: 'Weapon', name: 'Beta Blade', damage: 8 },
      { typeid: 'a-1', type: 'Consumable', name: 'Apple Tonic', heals: 5 },
      { typeid: 'a-2', type: 'Consumable', name: 'Berry Tonic', heals: 10 },
      { typeid: 'b-2', type: 'Weapon', name: 'Alpha Blade', damage: 8 },
    ];

    const sorted = component.currentData;

    expect(sorted[0].name).toBe('Berry Tonic');
    expect(sorted[1].name).toBe('Apple Tonic');
    expect(sorted[2].name).toBe('Alpha Blade');
    expect(sorted[3].name).toBe('Beta Blade');
  });

  it('edits the correct source row when view is sorted', () => {
    component.activeTab = 'items';
    component.items = [
      { typeid: 'a', type: 'Weapon', name: 'Zulu Blade', damage: 5 },
      { typeid: 'b', type: 'Consumable', name: 'Apple Tonic', heals: 5 },
    ];

    const sorted = component.currentData;
    expect(sorted[0].name).toBe('Apple Tonic');

    component.edit(sorted[0], 0);

    expect(component.editRow).toBe(1);
    expect(component.newData.name).toBe('Apple Tonic');
  });

  it('normalizes add-row input types to match schema', () => {
    component.activeTab = 'items';
    component.newData = {
      typeid: 'custom-item',
      name: 'Custom Item',
      type: 'Consumable',
      quantity: '5',
      excludeFromRandom: 'true',
      useMessages: '["custom use"]',
      teaches: '[]',
      heals: '12'
    };

    component.addRow(false);

    const created = component.items[component.items.length - 1];
    expect(typeof created.quantity).toBe('number');
    expect(created.quantity).toBe(5);
    expect(typeof created.excludeFromRandom).toBe('boolean');
    expect(created.excludeFromRandom).toBe(true);
    expect(Array.isArray(created.useMessages)).toBe(true);
    expect(created.useMessages).toEqual(['custom use']);
    expect(Array.isArray(created.teaches)).toBe(true);
    expect(created.teaches).toEqual([]);
    expect(typeof created.heals).toBe('number');
    expect(created.heals).toBe(12);
  });
});
