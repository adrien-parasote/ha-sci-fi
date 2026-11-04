/** Fix lot socle, O4 (bead ha-sci-fi-oyir.4 / ha-sci-fi-djb): the predicate is named for what it returns — "not off". */
import { describe, it, expect } from 'vitest';
import * as climate from '../../../src/selectors/climate.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('O4', () => {
  it('test_O4_climate_predicate_is_named_not_off', () => {
    expect(Object.keys(climate)).not.toContain('isClimateActive');
    const isClimateNotOff = (climate as Record<string, unknown>)['isClimateNotOff'] as
      | ((h: unknown, id: string) => boolean)
      | undefined;
    expect(isClimateNotOff).toBeTypeOf('function');
    const hass = makeMockHass({
      states: {
        'climate.a': makeMockEntity({ entity_id: 'climate.a', state: 'heat' }),
        'climate.b': makeMockEntity({ entity_id: 'climate.b', state: 'off' }),
        'climate.c': makeMockEntity({ entity_id: 'climate.c', state: 'unavailable' }),
      },
    });
    expect(isClimateNotOff!(hass, 'climate.a')).toBe(true);
    expect(isClimateNotOff!(hass, 'climate.b')).toBe(false);
    // the delivered contract (spec 02): anything but 'off' counts, unavailable included
    expect(isClimateNotOff!(hass, 'climate.c')).toBe(true);
    expect(isClimateNotOff!(hass, 'climate.missing')).toBe(false);
  });
});
