import { expect, describe, it, beforeEach } from 'vitest';
import {
  getClimateEntities,
  getClimateEntitiesExcluding,
  isClimateNotOff,
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

  it('getClimateEntities returns empty array if no entities exist', () => {
    const hass = makeMockHass();
    delete (hass as unknown as any)  .entities; // simulate missing entities
    expect(getClimateEntities(hass)).to.deep.equal([]);
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

  it('isClimateNotOff returns true if not off', () => {
    const hass = makeMockHass({
      states: {
        'climate.heat': makeMockEntity({ entity_id: 'climate.heat', state: 'heat' }),
        'climate.off': makeMockEntity({ entity_id: 'climate.off', state: 'off' }),
      },
    });

    expect(isClimateNotOff(hass, 'climate.heat')).to.be.true;
    expect(isClimateNotOff(hass, 'climate.off')).to.be.false;
    expect(isClimateNotOff(hass, 'climate.unknown')).to.be.false;
  });
});
