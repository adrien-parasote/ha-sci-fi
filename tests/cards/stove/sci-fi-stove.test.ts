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
    // ADR-005: field is entity (not entity_id)
    expect(config.entity).to.equal('climate.poele');
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    document.body.appendChild(el);
    (el as any).setConfig(SciFiStoveCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders error message if entity not found', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    // ADR-005: entity (not entity_id)
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Entité poêle non trouvée');
  });

  it('renders correctly in ON state with all sensors', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    // ADR-005: entity (not entity_id)
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      header_message: 'Stove Status',
      sensors: {
        sensor_actual_power: 'sensor.poele_power',
        sensor_combustion_chamber_temperature: 'sensor.poele_temp',
        sensor_pellet_quantity: 'sensor.poele_pellets',
      }
    });

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

    // Check pellet bar — ADR-005: class is 'bar-fill pellet' not 'pellet-bar-fill'
    const barFill = el.shadowRoot!.querySelector('.bar-fill.pellet') as HTMLElement;
    expect(barFill.style.width).to.equal('75%');

    // Check icon — ADR-005: sci:stove-heat when ON (not mdi:fire)
    const icon = el.shadowRoot!.querySelector('sf-icon') as unknown as any;
    expect(icon?.icon).to.equal('sci:stove-heat');
  });

  it('renders correctly in OFF state with missing sensors', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    // ADR-005: entity (not entity_id)
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: {
        // defined but missing in hass
        sensor_actual_power: 'sensor.poele_power_missing',
      }
    });

    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'off' }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('off');

    // Check icon — ADR-005: sci:stove-off when OFF (not mdi:fire-off)
    const icon = el.shadowRoot!.querySelector('sf-icon') as unknown as any;
    expect(icon?.icon).to.equal('sci:stove-off');

    // Sensors grid should be empty or not throw error
    const tiles = el.shadowRoot!.querySelectorAll('.sensor-tile');
    expect(tiles.length).to.equal(0);
  });

  it('renders storage_counter tile with threshold warning', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    // ADR-005: storage_counter + storage_counter_threshold
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      storage_counter: 'counter.sacs_pellets',
      storage_counter_threshold: 0.5,
    });

    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heating' }),
        'counter.sacs_pellets': makeMockEntity({
          entity_id: 'counter.sacs_pellets',
          state: '2',
          attributes: { maximum: 10 }
        }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // 2/10 = 20% < 50% threshold → warn class
    const counterTile = el.shadowRoot!.querySelector('.sensor-tile.warn');
    expect(counterTile).not.to.be.null;
    expect(el.shadowRoot!.textContent).to.include('2 / 10');
  });

  it('renders storage_counter tile without maximum (no bar)', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    // Branch coverage: pct = null when no maximum attribute → bar not rendered
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      storage_counter: 'counter.sacs_pellets',
    });

    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heating' }),
        'counter.sacs_pellets': makeMockEntity({
          entity_id: 'counter.sacs_pellets',
          state: '5',
          attributes: {} // no maximum → pct = null
        }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('5');
    // No bar should be rendered when maximum is absent
    const bar = el.shadowRoot!.querySelector('.bar-fill.storage');
    expect(bar).to.be.null;
    // No threshold → no warn class
    const warnTile = el.shadowRoot!.querySelector('.sensor-tile.warn');
    expect(warnTile).to.be.null;
  });

  it('does not render pellet bar when sensor state is non-numeric (NaN branch)', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    // Branch coverage: _renderPelletBar() L154 — isNaN(pct) early return
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_pellet_quantity: 'sensor.pellets' }
    });

    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heating' }),
        'sensor.pellets': makeMockEntity({ entity_id: 'sensor.pellets', state: 'unavailable' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // NaN → no pellet bar rendered
    const bar = el.shadowRoot!.querySelector('.bar-fill.pellet');
    expect(bar).to.be.null;
  });
});
