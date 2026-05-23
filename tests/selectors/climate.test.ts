import { expect, describe, it, beforeEach } from 'vitest';
import {
  getClimateEntities,
  getClimateEntitiesExcluding,
  getClimateState,
  isClimateActive,
} from '../../src/selectors/climate.js';
import { makeMockHass, makeMockEntityEntry, makeMockEntity } from '../fixtures/mock-hass.js';

describe('climate selectors', () => {
  it('getClimateEntities returns only enabled climate entities', () => {
    const hass = makeMockHass({
      entities: {
        'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', domain: 'climate' }),
        'climate.disabled': makeMockEntityEntry({ entity_id: 'climate.disabled', domain: 'climate', disabled_by: 'user' }),
        'light.salon': makeMockEntityEntry({ entity_id: 'light.salon', domain: 'light' }),
      },
    });

    const climates = getClimateEntities(hass);
    expect(climates.length).to.equal(1);
    expect(climates[0]!.entity_id).to.equal('climate.salon');
  });

  it('getClimateEntitiesExcluding filters out specified IDs', () => {
    const hass = makeMockHass({
      entities: {
        'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', domain: 'climate' }),
        'climate.cuisine': makeMockEntityEntry({ entity_id: 'climate.cuisine', domain: 'climate' }),
      },
    });

    const climates = getClimateEntitiesExcluding(hass, ['climate.cuisine']);
    expect(climates.length).to.equal(1);
    expect(climates[0]!.entity_id).to.equal('climate.salon');
  });

  it('getClimateState returns the state if present', () => {
    const hass = makeMockHass({
      states: {
        'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'heat' }),
      },
    });
    const entry = makeMockEntityEntry({ entity_id: 'climate.salon' });

    const state = getClimateState(hass, entry);
    expect(state).to.exist;
    expect(state!.state).to.equal('heat');
  });

  it('getClimateState returns undefined if not present', () => {
    const hass = makeMockHass({ states: {} });
    const entry = makeMockEntityEntry({ entity_id: 'climate.salon' });

    const state = getClimateState(hass, entry);
    expect(state).to.be.undefined;
  });

  it('isClimateActive returns true if not off', () => {
    const hass = makeMockHass({
      states: {
        'climate.heat': makeMockEntity({ entity_id: 'climate.heat', state: 'heat' }),
        'climate.off': makeMockEntity({ entity_id: 'climate.off', state: 'off' }),
      },
    });

    expect(isClimateActive(hass, 'climate.heat')).to.be.true;
    expect(isClimateActive(hass, 'climate.off')).to.be.false;
    expect(isClimateActive(hass, 'climate.unknown')).to.be.false;
  });
});
