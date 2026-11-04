/** Fix lot ui, O6 (bead ha-sci-fi-rskp.6 / ha-sci-fi-jbun): an unreachable thermostat is not "on" (decision 2026-11-04). */
import { describe, it, expect } from 'vitest';
import * as climate from '../../../src/selectors/climate.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('O6', () => {
  it('test_O6_unavailable_or_unknown_climate_is_not_on', () => {
    expect(Object.keys(climate)).not.toContain('isClimateNotOff');
    const isClimateOn = (climate as Record<string, unknown>)['isClimateOn'] as
      | ((h: unknown, id: string) => boolean)
      | undefined;
    expect(isClimateOn).toBeTypeOf('function');
    const hass = makeMockHass({
      states: {
        'climate.a': makeMockEntity({ entity_id: 'climate.a', state: 'heat' }),
        'climate.b': makeMockEntity({ entity_id: 'climate.b', state: 'off' }),
        'climate.c': makeMockEntity({ entity_id: 'climate.c', state: 'unavailable' }),
        'climate.d': makeMockEntity({ entity_id: 'climate.d', state: 'unknown' }),
      },
    });
    expect(isClimateOn!(hass, 'climate.a')).toBe(true);
    expect(isClimateOn!(hass, 'climate.b')).toBe(false);
    expect(isClimateOn!(hass, 'climate.c')).toBe(false);
    expect(isClimateOn!(hass, 'climate.d')).toBe(false);
    expect(isClimateOn!(hass, 'climate.missing')).toBe(false);
  });
});
