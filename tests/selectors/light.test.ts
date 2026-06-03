import { expect, describe, it, beforeEach } from 'vitest';
import {
  getLightEntities,
  getLightState,
  countActiveLights,
  hasActiveLights,
} from '../../src/selectors/light.js';
import { makeMockHass, makeMockEntityEntry, makeMockEntity } from '../fixtures/mock-hass.js';

describe('light selectors', () => {
  it('getLightEntities returns only enabled light entities for an area', () => {
    const hass = makeMockHass({
      entities: {
        'light.1': makeMockEntityEntry({ entity_id: 'light.1', area_id: 'area1', domain: 'light' }),
        'light.disabled': makeMockEntityEntry({ entity_id: 'light.disabled', area_id: 'area1', domain: 'light', disabled_by: 'user' }),
        'light.other_area': makeMockEntityEntry({ entity_id: 'light.other_area', area_id: 'area2', domain: 'light' }),
      },
    });

    const lights = getLightEntities(hass, 'area1');
    expect(lights.length).to.equal(1);
    expect(lights[0]!.entity_id).to.equal('light.1');
  });

  it('getLightState returns the state if present', () => {
    const hass = makeMockHass({
      states: {
        'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'on' }),
      },
    });
    const entry = makeMockEntityEntry({ entity_id: 'light.salon' });

    const state = getLightState(hass, entry);
    expect(state).to.exist;
    expect(state!.state).to.equal('on');
  });

  it('countActiveLights counts lights that are on', () => {
    const hass = makeMockHass({
      entities: {
        'light.1': makeMockEntityEntry({ entity_id: 'light.1', area_id: 'area1', domain: 'light' }),
        'light.2': makeMockEntityEntry({ entity_id: 'light.2', area_id: 'area1', domain: 'light' }),
      },
      states: {
        'light.1': makeMockEntity({ entity_id: 'light.1', state: 'on' }),
        'light.2': makeMockEntity({ entity_id: 'light.2', state: 'off' }),
      },
    });

    expect(countActiveLights(hass, 'area1')).to.equal(1);
  });

  it('hasActiveLights returns true if any light is on', () => {
    const hass = makeMockHass({
      entities: {
        'light.1': makeMockEntityEntry({ entity_id: 'light.1', area_id: 'area1', domain: 'light' }),
      },
      states: {
        'light.1': makeMockEntity({ entity_id: 'light.1', state: 'off' }),
      },
    });

    expect(hasActiveLights(hass, 'area1')).to.be.false;

    (hass as unknown as any)  .states = { ...hass.states, 'light.1': makeMockEntity({ entity_id: 'light.1', state: 'on' }) };
    expect(hasActiveLights(hass, 'area1')).to.be.true;
  });
});
