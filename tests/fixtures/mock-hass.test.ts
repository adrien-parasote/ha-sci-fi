import { expect, describe, it, beforeEach } from 'vitest';
import { makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity, makeMockHass } from './mock-hass.js';

describe('mock-hass factories', () => {
  it('makeMockFloor creates a floor', () => {
    const floor = makeMockFloor({ name: 'Test' });
    expect(floor.name).to.equal('Test');
    expect(floor.floor_id).to.equal('ground');
  });

  it('makeMockArea creates an area', () => {
    const area = makeMockArea({ area_id: 'test_area' });
    expect(area.area_id).to.equal('test_area');
    expect(area.floor_id).to.equal('ground');
  });

  it('makeMockEntityEntry creates an entity entry', () => {
    const entry = makeMockEntityEntry({ domain: 'climate' });
    expect(entry.domain).to.equal('climate');
    expect(entry.entity_id).to.equal('light.salon');
  });

  it('makeMockEntity creates an entity state', () => {
    const state = makeMockEntity({ state: 'on' });
    expect(state.state).to.equal('on');
  });

  it('makeMockHass creates a complete mock HomeAssistant object', () => {
    const hass = makeMockHass();
    expect(hass.floors).to.have.property('ground');
    expect(hass.areas).to.have.property('living_room');
    expect(hass.entities).to.have.property('light.salon');
    expect(hass.states).to.have.property('light.salon');
    expect(hass.locale.language).to.equal('fr');
  });
});
