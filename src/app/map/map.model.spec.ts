import { MapModel } from './map.model';

describe('MapModel', () => {
  it('should create an instance with required config', () => {
    const mapConfig = {
      name: 'Oakhaven',
      type: 'town' as const
    };

    const map = new MapModel(mapConfig);

    expect(map).toBeTruthy();
    expect(map.name).toBe('Oakhaven');
    expect(map.type).toBe('town');
  });

  it('should generate a unique UUID on initialization', () => {
    const map = new MapModel({ name: 'Test Map', type: 'dungeon' });

    expect(map.id).toBeDefined();
    expect(map.id.length).toBeGreaterThan(0);
  });

  it('should default isPersistent to false if not provided', () => {
    const map = new MapModel({ name: 'Temporal Rift', type: 'wilderness' });

    expect(map.isPersistent).toBeFalsy();
  });

  it('should respect the isPersistent flag when provided', () => {
    const map = new MapModel({
      name: 'Vault',
      type: 'interior',
      isPersistent: true
    });

    expect(map.isPersistent).toBeTruthy();
  });
});