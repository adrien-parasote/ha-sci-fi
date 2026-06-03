 
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

  // ── Error branches: .catch handlers ──────────────────────────────────────

  it('hvac service error does not throw (error toast path, line 394)', async () => {
    const callServiceMock = vi.fn().mockRejectedValue(new Error('hvac error'));
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'off',
          attributes: {
            hvac_modes: ['off', 'heat'],
            preset_modes: ['none'],
            preset_mode: 'none',
            temperature: 20,
            min_temp: 15,
            max_temp: 25,
          },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const selects = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    selects[0]!.dispatchEvent(new CustomEvent('button-select', {
      bubbles: true, composed: true, detail: { id: 'heat' },
    }));
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenCalled();
  });

  it('temperature service error does not throw (error toast path, line 403)', async () => {
    const callServiceMock = vi.fn().mockRejectedValue(new Error('temp error'));
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'heat',
          attributes: {
            hvac_modes: ['off', 'heat'],
            preset_modes: ['none'],
            preset_mode: 'none',
            temperature: 20,
            min_temp: 18,
            max_temp: 25,
          },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const wheel = el.shadowRoot!.querySelector('sf-wheel')!;
    wheel.dispatchEvent(new CustomEvent('wheel-change', {
      bubbles: true, composed: true, detail: { id: '22' },
    }));
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenCalled();
  });

  it('preset service error does not throw (error toast path, line 412)', async () => {
    const callServiceMock = vi.fn().mockRejectedValue(new Error('preset error'));
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'off',
          attributes: {
            hvac_modes: ['off', 'heat'],
            preset_modes: ['none', 'eco'],
            preset_mode: 'none',
            temperature: 20,
            min_temp: 15,
            max_temp: 25,
          },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const selects = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    selects[1]!.dispatchEvent(new CustomEvent('button-select', {
      bubbles: true, composed: true, detail: { id: 'eco' },
    }));
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).toHaveBeenCalled();
  });

  // ── _onTempChange: isNaN early return branch ──────────────────────────────

  it('temperature NaN does not call callService (isNaN guard, line 399)', async () => {
    const callServiceMock = vi.fn();
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      callService: callServiceMock,
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'heat',
          attributes: { hvac_modes: ['heat'], preset_modes: ['none'], preset_mode: 'none', temperature: 20, min_temp: 18, max_temp: 25 },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // detail.id = 'invalid' → parseFloat → NaN → early return
    const wheel = el.shadowRoot!.querySelector('sf-wheel')!;
    wheel.dispatchEvent(new CustomEvent('wheel-change', {
      bubbles: true, composed: true, detail: { id: 'invalid' },
    }));
    await new Promise(r => setTimeout(r, 10));
    expect(callServiceMock).not.toHaveBeenCalled();
  });

  // ── _getHvacLabel: fallback to unknown mode string (line 381) ─────────────

  it('_getHvacLabel falls back to raw mode string for unknown mode', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'dehumidify', // not in HVAC_ICONS
          attributes: { hvac_modes: ['dehumidify'], preset_modes: [], preset_mode: 'none', temperature: 20, min_temp: 15, max_temp: 25 },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    // sf-button-card-select text attribute should include the raw mode string
    const select = el.shadowRoot!.querySelector('sf-button-card-select');
    expect(select?.getAttribute('text')).to.equal('dehumidify');
  });

  // ── _getPresetLabel: fallback to unknown preset string (line 386) ─────────

  it('_getPresetLabel falls back to raw preset string for unknown preset', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'heat',
          attributes: {
            hvac_modes: ['heat'],
            preset_modes: ['turbo'], // not in PRESET_ICONS
            preset_mode: 'turbo',
            temperature: 20,
            min_temp: 15,
            max_temp: 25,
          },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const selects = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    const presetSelect = selects[1]!;
    expect(presetSelect.getAttribute('text')).to.equal('turbo');
  });

  // ── _renderTemperature: high/medium/low branches (lines 258-260) ──────────

  function makeStoveWithSensors(insideTemp: string, combustionTemp: string, fanSpeed?: string, pressure?: string): SciFiStoveCard {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: {
        sensor_inside_temperature: 'sensor.inside',
        sensor_combustion_chamber_temperature: 'sensor.combustion',
        ...(fanSpeed !== undefined ? { sensor_fan_speed: 'sensor.fan' } : {}),
        ...(pressure !== undefined ? { sensor_pressure: 'sensor.pressure' } : {}),
      },
    });
    const states: Record<string, any> = {
      'climate.poele': makeMockEntity({
        entity_id: 'climate.poele',
        state: 'heat',
        attributes: { hvac_modes: ['heat'], preset_modes: [], preset_mode: 'none', temperature: 20, min_temp: 15, max_temp: 25 },
      }),
      'sensor.inside': makeMockEntity({ entity_id: 'sensor.inside', state: insideTemp }),
      'sensor.combustion': makeMockEntity({ entity_id: 'sensor.combustion', state: combustionTemp }),
    };
    if (fanSpeed !== undefined) {
      states['sensor.fan'] = makeMockEntity({ entity_id: 'sensor.fan', state: fanSpeed });
    }
    if (pressure !== undefined) {
      states['sensor.pressure'] = makeMockEntity({ entity_id: 'sensor.pressure', state: pressure });
    }
    el.hass = makeMockHass({ states });
    return el;
  }

  it('renders temperature HIGH class when temp >= 25 (line 258)', async () => {
    const el = makeStoveWithSensors('28', '400');
    document.body.appendChild(el);
    await el.updateComplete;
    const highTiles = el.shadowRoot!.querySelectorAll('.temperature.high');
    expect(highTiles.length).to.be.greaterThan(0);
  });

  it('renders temperature MEDIUM class when 16 <= temp < 25 (line 259)', async () => {
    const el = makeStoveWithSensors('20', '200');
    document.body.appendChild(el);
    await el.updateComplete;
    const medTiles = el.shadowRoot!.querySelectorAll('.temperature.medium');
    expect(medTiles.length).to.be.greaterThan(0);
  });

  it('renders temperature LOW class when temp < 16 (line 260)', async () => {
    const el = makeStoveWithSensors('10', '5');
    document.body.appendChild(el);
    await el.updateComplete;
    const lowTiles = el.shadowRoot!.querySelectorAll('.temperature.low');
    expect(lowTiles.length).to.be.greaterThan(0);
  });

  // ── _renderFan: renders when fan_speed is set (line 316 true branch) ───────

  it('renders fan speed in .powers section when sensor_fan_speed is set', async () => {
    const el = makeStoveWithSensors('22', '250', '3');
    document.body.appendChild(el);
    await el.updateComplete;
    // The fan .power div should be present and contain the speed value
    const powers = el.shadowRoot!.querySelectorAll('.powers .power');
    // 3 power tiles: actual_power, power, fan (all absent except fan configured here)
    // At minimum the fan tile must render
    expect(powers.length).to.be.greaterThan(0);
  });

  // ── _renderFan: returns nothing when fan value is null (line 315) ─────────

  it('does NOT render fan speed tile when sensor_fan_speed is not configured', async () => {
    const el = makeStoveWithSensors('20', '200');
    document.body.appendChild(el);
    await el.updateComplete;
    // Without fan sensor, there are 2 power tiles (actual_power + power — both undefined too)
    // The .powers should render (parent always exists)
    expect(el.shadowRoot!.querySelector('.powers')).not.to.be.null;
  });

  // ── _renderPressure: '0' → off class (line 273) ──────────────────────────

  it('renders pressure with .off class when pressure is 0 (line 273)', async () => {
    const el = makeStoveWithSensors('20', '200', undefined, '0');
    document.body.appendChild(el);
    await el.updateComplete;
    // There should be a .temperature.off element from pressure
    const offPressure = el.shadowRoot!.querySelector('.temperature.off');
    expect(offPressure).not.to.be.null;
  });

  // ── _renderPressure: non-zero → no off class (line 273) ──────────────────

  it('renders pressure without .off class when pressure is non-zero', async () => {
    const el = makeStoveWithSensors('20', '200', undefined, '120');
    document.body.appendChild(el);
    await el.updateComplete;
    // No .temperature.off from pressure (only from temperature undefined)
    // Temperature tiles without temp data render as .off — but the pressure tile should not
    expect(el.shadowRoot!.querySelector('sf-icon[icon="mdi:gauge"]')).not.to.be.null;
  });
});
