import { describe, it, expect } from 'vitest';
import { makeMockHass, makeMockEntityEntry, makeMockEntity } from '../fixtures/mock-hass.js';
import { getLightEntities, countActiveLights, hasActiveLights } from '../../src/selectors/light.js';
import { getClimateEntities, getClimateEntitiesExcluding, isClimateActive } from '../../src/selectors/climate.js';
import { assertString, assertDefined, isValidCardType } from '../../src/types/config.js';

describe('entity selectors', () => {
  // TC-206: countActiveLights correct count
  it('TC-206: countActiveLights() returns count of on lights', () => {
    const hass = makeMockHass({
      entities: {
        'light.a': makeMockEntityEntry({ entity_id: 'light.a', area_id: 'living_room', domain: 'light' }),
        'light.b': makeMockEntityEntry({ entity_id: 'light.b', area_id: 'living_room', domain: 'light' }),
        'light.c': makeMockEntityEntry({ entity_id: 'light.c', area_id: 'living_room', domain: 'light' }),
      },
      states: {
        'light.a': makeMockEntity({ entity_id: 'light.a', state: 'on' }),
        'light.b': makeMockEntity({ entity_id: 'light.b', state: 'on' }),
        'light.c': makeMockEntity({ entity_id: 'light.c', state: 'off' }),
      },
    });
    expect(countActiveLights(hass, 'living_room')).toBe(2);
  });

  it('getLightEntities() returns only light domain entities', () => {
    const hass = makeMockHass();
    const lights = getLightEntities(hass, 'living_room');
    expect(lights.every(e => e.entity_id.startsWith('light.'))).toBe(true);
  });

  it('hasActiveLights() returns true if any light is on', () => {
    const hass = makeMockHass(); // light.salon is 'on' in living_room
    expect(hasActiveLights(hass, 'living_room')).toBe(true);
  });

  it('hasActiveLights() returns false when all lights are off', () => {
    const hass = makeMockHass({
      entities: {
        'light.a': makeMockEntityEntry({ entity_id: 'light.a', area_id: 'living_room', domain: 'light' }),
      },
      states: {
        'light.a': makeMockEntity({ entity_id: 'light.a', state: 'off' }),
      },
    });
    expect(hasActiveLights(hass, 'living_room')).toBe(false);
  });

  // TC-204: getClimateEntities skips non-climate
  it('TC-204: getClimateEntities() returns only climate domain entries', () => {
    const hass = makeMockHass();
    const climates = getClimateEntities(hass);
    expect(climates).toHaveLength(1);
    expect(climates[0]?.entity_id).toBe('climate.salon');
  });

  it('getClimateEntitiesExcluding() filters out excluded ids', () => {
    const hass = makeMockHass({
      entities: {
        'climate.a': makeMockEntityEntry({ entity_id: 'climate.a', area_id: 'living_room', domain: 'climate' }),
        'climate.b': makeMockEntityEntry({ entity_id: 'climate.b', area_id: 'kitchen', domain: 'climate' }),
      },
      states: {},
    });
    const result = getClimateEntitiesExcluding(hass, ['climate.a']);
    expect(result).toHaveLength(1);
    expect(result[0]?.entity_id).toBe('climate.b');
  });

  it('isClimateActive() returns true when state is not off', () => {
    const hass = makeMockHass(); // climate.salon state = 'heat'
    expect(isClimateActive(hass, 'climate.salon')).toBe(true);
  });

  it('isClimateActive() returns false when state is off', () => {
    const hass = makeMockHass({
      states: { 'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'off' }) },
      entities: { 'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', area_id: 'living_room', domain: 'climate' }) },
    });
    expect(isClimateActive(hass, 'climate.salon')).toBe(false);
  });

  // TC-207: type-guard rejects invalid config
  it('TC-207: assertString throws for non-string field', () => {
    expect(() => assertString(42, 'entity_id')).toThrow('entity_id');
  });

  it('TC-207: assertDefined throws for undefined field', () => {
    expect(() => assertDefined(undefined, 'type')).toThrow('type');
  });

  it('isValidCardType returns true for valid config', () => {
    expect(isValidCardType({ type: 'custom:sci-fi-lights' })).toBe(true);
  });

  it('isValidCardType returns false for non-object', () => {
    expect(isValidCardType('not an object')).toBe(false);
    expect(isValidCardType(null)).toBe(false);
  });

  // IT-202: performance — 500 entities
  // Threshold set to 10ms (not 5ms) to avoid flakiness on shared GitHub Actions runners.
  // A regression to O(n²) would still be caught: 500² iterations would take >> 10ms.
  it('IT-202: getLightEntities() completes under 10ms for 500 entities', () => {
    const entities: Record<string, ReturnType<typeof makeMockEntityEntry>> = {};
    for (let i = 0; i < 500; i++) {
      const id = `light.entity_${i}`;
      entities[id] = makeMockEntityEntry({
        entity_id: id,
        area_id: 'living_room',
        domain: i % 5 === 0 ? 'light' : 'switch',
      });
    }
    const hass = makeMockHass({ entities, states: {} });
    const start = performance.now();
    getLightEntities(hass, 'living_room');
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });
});
