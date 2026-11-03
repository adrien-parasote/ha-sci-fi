/**
 * DOMAIN value table, type canary and plug constant — lot domain-constants
 * (spec docs/specs/domain-constants/spec.md, FR-1, FR-2, FR-6).
 */
import { describe, it, expect } from 'vitest';
import { DOMAIN, type Domain } from '../../src/types/domains.js';
import { getEntitiesByAreaAndDomain } from '../../src/selectors/house.js';
import { HASS_PLUG_SERVICE } from '../../src/cards/plugs/plug_const.js';
import { makeMockHass, makeMockEntityEntry } from '../fixtures/mock-hass.js';

const EXPECTED = [
  'light', 'climate', 'sensor', 'binary_sensor', 'switch', 'cover', 'lock', 'media_player',
  'vacuum', 'weather', 'person', 'zone', 'remote', 'select', 'number', 'counter',
  'automation', 'script', 'input_boolean', 'input_select', 'input_number', 'input_button',
  'valve', 'homeassistant',
];

describe('DOMAIN', () => {
  it('TC-DC-U-01 holds 24 keys, each the UPPER_SNAKE of its unique value', () => {
    const entries = Object.entries(DOMAIN);
    expect(entries).toHaveLength(24);
    for (const [key, value] of entries) expect(key).toBe(value.toUpperCase());
    expect(new Set(Object.values(DOMAIN)).size).toBe(24);
    expect([...Object.values(DOMAIN)].sort()).toEqual([...EXPECTED].sort());
    expect(DOMAIN.COUNTER).toBe('counter');
  });

  it('TC-DC-U-02 types the selector parameter as Domain (a misspelt domain does not compile)', () => {
    const hass = makeMockHass({
      entities: {
        'light.a': makeMockEntityEntry({ entity_id: 'light.a', area_id: 'x' }),
        'switch.b': makeMockEntityEntry({ entity_id: 'switch.b', area_id: 'x' }),
      },
    });
    const ok: Domain = DOMAIN.LIGHT;
    expect(getEntitiesByAreaAndDomain(hass, 'x', ok).map((e) => e.entity_id)).toEqual(['light.a']);
    // @ts-expect-error — 'lite' is not a Domain: tsc consumes this directive only if the parameter is typed
    expect(getEntitiesByAreaAndDomain(hass, 'x', 'lite')).toEqual([]);
  });

  it('TC-DC-U-06 keeps HASS_PLUG_SERVICE as the same string, defined as DOMAIN.SWITCH', () => {
    expect(HASS_PLUG_SERVICE).toBe('switch');
    expect(HASS_PLUG_SERVICE).toBe(DOMAIN.SWITCH);
  });
});
