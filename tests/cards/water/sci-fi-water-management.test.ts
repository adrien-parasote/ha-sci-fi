/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/water/sci-fi-water-management.js';
import { SciFiWaterManagementCard } from '../../../src/cards/water/sci-fi-water-management.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement {
    addMessage() {}
  });
}

describe('sci-fi-water-management', () => {
  it('provides getConfigElement', () => {
    const el = SciFiWaterManagementCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-water-management-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiWaterManagementCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-water-management');
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    document.body.appendChild(el);
    (el as any).setConfig(SciFiWaterManagementCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders empty message if no floors exist', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig(SciFiWaterManagementCard.getStubConfig());
    el.hass = makeMockHass({ floors: {} });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Aucun étage configuré');
  });

  it('renders floors and water entities based on labels', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-water-management',
      header_message: "Gestion de l'eau",
      filter_label: 'water'
    } as unknown as unknown as any);

    el.hass = makeMockHass({
      floors: {
        'ground': makeMockFloor({ floor_id: 'ground', name: 'Ground Floor', level: 0 }),
        'first': makeMockFloor({ floor_id: 'first', name: 'First Floor', level: 1 }),
      },
      areas: {
        'living': makeMockArea({ area_id: 'living', name: 'Living Room', floor_id: 'ground' }),
        'garden': makeMockArea({ area_id: 'garden', name: 'Garden', floor_id: 'ground' }),
      },
      entities: {
        'switch.valve_1': makeMockEntityEntry({ entity_id: 'switch.valve_1', area_id: 'garden', domain: 'switch', labels: ['water'] }),
        'sensor.tank_level': makeMockEntityEntry({ entity_id: 'sensor.tank_level', area_id: 'garden', domain: 'sensor', labels: ['water'] }),
        'light.ignored': makeMockEntityEntry({ entity_id: 'light.ignored', area_id: 'living', domain: 'light' }), // No water label
      },
      states: {
        'switch.valve_1': makeMockEntity({ entity_id: 'switch.valve_1', state: 'on', attributes: { friendly_name: 'Valve 1' } }),
        'sensor.tank_level': makeMockEntity({ entity_id: 'sensor.tank_level', state: '75', attributes: { friendly_name: 'Tank Level', unit_of_measurement: '%' } }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // Check header
    expect(el.shadowRoot!.textContent).to.include("Gestion de l'eau");

    // Default selection: ground floor
    const floorHexas = el.shadowRoot!.querySelectorAll('.floor-hexa');
    expect(floorHexas.length).to.equal(1);
    expect(floorHexas[0]!.getAttribute('data-selected')).to.equal('true');

    // Water entities should be rendered
    const rows = el.shadowRoot!.querySelectorAll('.entity-row');
    expect(rows.length).to.equal(2);
    
    // Check if valve and sensor are displayed
    expect(rows[0]!.textContent).to.include('Valve 1');
    expect(rows[1]!.textContent).to.include('Tank Level');
    expect(rows[1]!.textContent).to.include('75%');
  });

  it('renders empty message if no water entities exist in the house', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-water-management',
      filter_label: 'water'
    } as unknown as unknown as any);

    el.hass = makeMockHass({
      floors: {
        'first': makeMockFloor({ floor_id: 'first', name: 'First Floor', level: 1 }),
      },
      areas: {
        'bed': makeMockArea({ area_id: 'bed', name: 'Bedroom', floor_id: 'first' }),
      },
      entities: {
        'light.bed': makeMockEntityEntry({ entity_id: 'light.bed', area_id: 'bed', domain: 'light' }),
      },
      states: {}
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Aucun étage configuré');
  });
});
