/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/stove/sci-fi-stove.js';
import { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement {
    addMessage() {}
  });
}

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
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Entité poêle non trouvée');
  });

  it('renders header with friendly_name', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'off',
          attributes: { friendly_name: 'Austroflamm Clou Pellet', hvac_modes: ['off', 'heat'] }
        }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    // Header contains friendly_name
    const header = el.shadowRoot!.querySelector('.header');
    expect(header).not.to.be.null;
    expect(header!.textContent).to.include('Austroflamm Clou Pellet');
  });

  it('renders stove-image component with correct state', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'heat',
          attributes: { friendly_name: 'Poêle', hvac_modes: ['off', 'heat'] }
        }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const stoveImg = el.shadowRoot!.querySelector('sf-stove-image') as any;
    expect(stoveImg).not.to.be.null;
    expect(stoveImg.state).to.equal('heat');
  });

  it('renders .content with .info panel', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'off',
          attributes: { friendly_name: 'Poêle', hvac_modes: ['off'] }
        }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.content')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.info')).not.to.be.null;
  });

  it('renders .bottom interactive section', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'off',
          attributes: {
            friendly_name: 'Poêle',
            hvac_modes: ['off', 'heat'],
            preset_modes: ['none', 'eco'],
            preset_mode: 'none',
            temperature: 20,
            min_temp: 15,
            max_temp: 30,
          }
        }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bottom')).not.to.be.null;
    // sf-wheel for temperature
    expect(el.shadowRoot!.querySelector('sf-wheel')).not.to.be.null;
    // two sf-button-card-select (hvac + preset)
    const selects = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    expect(selects.length).to.equal(2);
  });

  it('renders sf-circle-progress-bar for pellet quantity', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_pellet_quantity: 'sensor.poele_pellets' },
      pellet_quantity_threshold: 0.1,
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'heat',
          attributes: { friendly_name: 'Poêle', hvac_modes: ['off', 'heat'] }
        }),
        'sensor.poele_pellets': makeMockEntity({ entity_id: 'sensor.poele_pellets', state: '75' }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    // ADR-005: pellet circle gauge must be present
    const gauge = el.shadowRoot!.querySelector('sf-circle-progress-bar') as any;
    expect(gauge).not.to.be.null;
    expect(gauge.val).to.equal(75);
  });

  it('does not render pellet gauge when state is non-numeric (NaN branch)', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_pellet_quantity: 'sensor.pellets' }
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: [] } }),
        'sensor.pellets': makeMockEntity({ entity_id: 'sensor.pellets', state: 'unavailable' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    // NaN state → gauge not rendered
    expect(el.shadowRoot!.querySelector('sf-circle-progress-bar')).to.be.null;
  });

  it('renders sf-stack-bar for storage_counter', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      storage_counter: 'counter.sacs_pellets',
      storage_counter_threshold: 0.5,
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: [] } }),
        'counter.sacs_pellets': makeMockEntity({
          entity_id: 'counter.sacs_pellets',
          state: '2',
          attributes: { maximum: 10 }
        }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    // ADR-005: stack bar for storage
    const stackBar = el.shadowRoot!.querySelector('sf-stack-bar') as any;
    expect(stackBar).not.to.be.null;
    expect(stackBar.val).to.equal(2);
    expect(stackBar.max).to.equal(10);
  });

  it('renders .stove-status in status section', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_status: 'sensor.poele_status' },
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'off', attributes: { hvac_modes: [] } }),
        'sensor.poele_status': makeMockEntity({ entity_id: 'sensor.poele_status', state: 'off' }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;
    // ADR-005: .stove-status selector must exist
    const statusEl = el.shadowRoot!.querySelector('.stove-status');
    expect(statusEl).not.to.be.null;
  });

  it('calls climate services and shows sf-toast on hvac/temp/preset actions', async () => {
    const callServiceMock = vi.fn().mockResolvedValue({} as any);
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
    });
    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'off',
          attributes: {
            friendly_name: 'Poêle',
            hvac_modes: ['off', 'heat'],
            preset_modes: ['none', 'eco'],
            preset_mode: 'none',
            temperature: 20,
            min_temp: 15,
            max_temp: 25,
          }
        }),
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // sf-toast must be present in shadow root
    const toast = el.shadowRoot!.querySelector('sf-toast');
    expect(toast).not.to.be.null;

    // Trigger hvac mode change via sf-button-card-select event
    const selects = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    selects[0]!.dispatchEvent(new CustomEvent('button-select', {
      bubbles: true, composed: true, detail: { id: 'heat' }
    }));
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenCalledWith('climate', 'set_hvac_mode', { entity_id: 'climate.poele', hvac_mode: 'heat' });

    // Trigger temperature change via sf-wheel event
    const wheel = el.shadowRoot!.querySelector('sf-wheel')!;
    wheel.dispatchEvent(new CustomEvent('wheel-change', {
      bubbles: true, composed: true, detail: { id: '21' }
    }));
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenCalledWith('climate', 'set_temperature', { entity_id: 'climate.poele', temperature: 21 });

    // Trigger preset change via second sf-button-card-select event
    selects[1]!.dispatchEvent(new CustomEvent('button-select', {
      bubbles: true, composed: true, detail: { id: 'eco' }
    }));
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenCalledWith('climate', 'set_preset_mode', { entity_id: 'climate.poele', preset_mode: 'eco' });
  });
});
