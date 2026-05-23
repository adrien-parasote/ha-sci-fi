/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import '../../../src/cards/stove/sci-fi-stove.js';
import { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('sci-fi-stove', () => {
  it('provides getConfigElement', () => {
    const el = SciFiStoveCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-stove-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiStoveCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-stove');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    document.body.appendChild(el);
    el.setConfig(SciFiStoveCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders error message if entity not found', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    el.setConfig({ type: 'custom:sci-fi-stove', entity_id: 'climate.poele' } as unknown as unknown as any);
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Entité poêle non trouvée');
  });

  it('renders correctly in ON state with all sensors', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    el.setConfig({
      type: 'custom:sci-fi-stove',
      entity_id: 'climate.poele',
      header_message: 'Stove Status',
      sensors: {
        sensor_actual_power: 'sensor.poele_power',
        sensor_combustion_chamber_temperature: 'sensor.poele_temp',
        sensor_pellet_quantity: 'sensor.poele_pellets',
      }
} as unknown as unknown as any);

    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heating', attributes: { friendly_name: 'Poêle Salon' } }),
        'sensor.poele_power': makeMockEntity({ entity_id: 'sensor.poele_power', state: '1500' }),
        'sensor.poele_temp': makeMockEntity({ entity_id: 'sensor.poele_temp', state: '120' }),
        'sensor.poele_pellets': makeMockEntity({ entity_id: 'sensor.poele_pellets', state: '75' }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Stove Status');
    expect(el.shadowRoot!.textContent).to.include('Poêle Salon');
    expect(el.shadowRoot!.textContent).to.include('heating');

    // Check sensors
    expect(el.shadowRoot!.textContent).to.include('1500 W');
    expect(el.shadowRoot!.textContent).to.include('120°');
    expect(el.shadowRoot!.textContent).to.include('75%');

    // Check pellet bar
    const barFill = el.shadowRoot!.querySelector('.pellet-bar-fill') as HTMLElement;
    expect(barFill.style.width).to.equal('75%');

    // Check icon
    const icon = el.shadowRoot!.querySelector('sf-icon') as unknown as any;
    expect(icon?.icon).to.equal('mdi:fire');
  });

  it('renders correctly in OFF state with missing sensors', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    el.setConfig({
      type: 'custom:sci-fi-stove',
      entity_id: 'climate.poele',
      sensors: {
        // defined but missing in hass
        sensor_actual_power: 'sensor.poele_power_missing',
      }
} as unknown as unknown as any);

    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'off' }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('off');
    
    // Check icon
    const icon = el.shadowRoot!.querySelector('sf-icon') as unknown as any;
    expect(icon?.icon).to.equal('mdi:fire-off');

    // Sensors grid should be empty or not throw error
    const tiles = el.shadowRoot!.querySelectorAll('.sensor-tile');
    expect(tiles.length).to.equal(0);
  });
});
