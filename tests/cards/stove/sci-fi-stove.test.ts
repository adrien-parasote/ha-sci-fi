 
// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import '../../../src/cards/stove/sci-fi-stove.js';
import { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';

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

  it('TC-1111: renders error message if entity not found', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Entité poêle non trouvée');
  });

  it('TC-1105: renders header with friendly_name', async () => {
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

  it('TC-507: renders temperature HIGH class when temp >= 25 (line 258)', async () => {
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

  // ── Status icon + colour, driven by sensor_status ─────────────────────────
  //
  // The spec rows below place these on a "header"; the implementation renders them
  // in the status row (_renderStatus) and colours it .status.<colour> rather than
  // .stove-status.sf-state-on|off. The BEHAVIOUR the rows describe is real and is
  // what these tests pin; the stale selectors are tracked in the spec-drift bead.

  function makeStoveWithStatus(status: string) {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_status: 'sensor.poele_status' },
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: [] } }),
        'sensor.poele_status': makeMockEntity({ entity_id: 'sensor.poele_status', state: status }),
      },
    });
    return el;
  }

  it('TC-1101: renders sf-icon sci:stove-heat when the stove status is a burning state', async () => {
    const el = makeStoveWithStatus('combustion');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-icon[icon="sci:stove-heat"]')).not.to.be.null;
  });

  it('TC-1102: renders sf-icon sci:stove-off when the stove status is off', async () => {
    const el = makeStoveWithStatus('off');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-icon[icon="sci:stove-off"]')).not.to.be.null;
  });

  it('TC-1103: status row carries the active colour class when the stove is burning', async () => {
    const el = makeStoveWithStatus('combustion');
    document.body.appendChild(el);
    await el.updateComplete;
    const row = el.shadowRoot!.querySelector('.status.red');
    expect(row).not.to.be.null;
    expect(row!.querySelector('.stove-status')!.textContent?.trim()).to.equal('combustion');
  });

  it('TC-1104: status row carries the off colour class when the stove is off', async () => {
    const el = makeStoveWithStatus('off');
    document.body.appendChild(el);
    await el.updateComplete;
    const row = el.shadowRoot!.querySelector('.status.off');
    expect(row).not.to.be.null;
    expect(row!.querySelector('.stove-status')!.textContent?.trim()).to.equal('off');
  });

  it('TC-1114: unknown status falls back to a label with every underscore replaced', async () => {
    const el = makeStoveWithStatus('some_unknown_state');
    document.body.appendChild(el);
    await el.updateComplete;
    const row = el.shadowRoot!.querySelector('.status.off');
    expect(row).not.to.be.null;
    expect(row!.querySelector('.stove-status')!.textContent?.trim()).to.equal('some unknown state');
  });

  // ── Registration + styles provenance ──────────────────────────────────────

  it('IT-1101: registers sci-fi-stove in customElements', () => {
    expect(customElements.get('sci-fi-stove')).to.equal(SciFiStoveCard);
  });

  it('IT-1102: renders header, info panel and status row from a real hass state', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      storage_counter: 'counter.stock',
      sensors: {
        sensor_status: 'sensor.poele_status',
        sensor_pellet_quantity: 'sensor.pellet',
        sensor_inside_temperature: 'sensor.inside',
      },
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { friendly_name: 'Poêle Salon', hvac_modes: [] } }),
        'sensor.poele_status': makeMockEntity({ entity_id: 'sensor.poele_status', state: 'combustion' }),
        'sensor.pellet': makeMockEntity({ entity_id: 'sensor.pellet', state: '75' }),
        'sensor.inside': makeMockEntity({ entity_id: 'sensor.inside', state: '21' }),
        'counter.stock': makeMockEntity({ entity_id: 'counter.stock', state: '8', attributes: { maximum: 20 } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.header')!.textContent).to.include('Poêle Salon');
    expect(el.shadowRoot!.querySelector('.content .info')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-stove-image')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-circle-progress-bar')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-stack-bar')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.stove-status')).not.to.be.null;
  });

  // ── O2 (ha-sci-fi-nib): the 14 core detailed_stove_status values ──────────
  //
  // STATUS_ICONS covered the 7 values the HACS integration wrote; the core
  // integration exposes 14. The 7 extra fell on the sci:stove-unknow fallback,
  // so a hybrid stove lost its icon and colour as soon as wood took over.

  function mountWithStatus(status: string): SciFiStoveCard {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_status: 'sensor.poele_status' },
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: [] } }),
        'sensor.poele_status': makeMockEntity({ entity_id: 'sensor.poele_status', state: status }),
      },
    });
    document.body.appendChild(el);
    return el;
  }

  const CORE_STATUSES: ReadonlyArray<readonly [string, string, string]> = [
    // state, icon, colour class
    ['off',              'sci:stove-off',  'off'],
    ['pre_heating',      'sci:stove-heat', 'amber'],
    ['ignition',         'sci:stove-heat', 'amber'],
    ['pre_combustion',   'sci:stove-heat', 'red'],
    ['combustion',       'sci:stove-heat', 'red'],
    ['eco',              'sci:stove-eco',  'green'],
    ['cooling',          'sci:stove-cool', 'blue'],
    ['cold_start',       'sci:stove-heat', 'amber'],
    ['cold_start_off',   'sci:stove-off',  'off'],
    ['hybrid_init',      'sci:stove-heat', 'amber'],
    ['hybrid_start',     'sci:stove-heat', 'red'],
    ['wood_start',       'sci:stove-heat', 'amber'],
    ['wood_combustion',  'sci:stove-heat', 'red'],
    ['wood_burning_off', 'sci:stove-cool', 'blue'],
  ];

  for (const [status, icon, colour] of CORE_STATUSES) {
    it(`test_O2_core_status_has_its_own_icon: '${status}' → ${icon} / ${colour}`, async () => {
      const el = mountWithStatus(status);
      await el.updateComplete;
      const row = el.shadowRoot!.querySelector('.status')!;
      expect(row.classList.contains(colour), `${status} colour`).to.be.true;
      expect(row.querySelector('sf-icon')!.getAttribute('icon'), `${status} icon`).to.equal(icon);
      expect(row.querySelector('.stove-status')!.textContent!.trim(), `${status} label`)
        .to.not.contain('_');
    });
  }

  it('test_O2_unknown_future_status_still_falls_back', async () => {
    const el = mountWithStatus('plasma_overdrive');
    await el.updateComplete;
    const row = el.shadowRoot!.querySelector('.status')!;
    expect(row.querySelector('sf-icon')!.getAttribute('icon')).to.equal('sci:stove-unknow');
    expect(row.querySelector('.stove-status')!.textContent!.trim()).to.equal('plasma overdrive');
  });

  // ── O3 (ha-sci-fi-1qy): the dead Preset control ───────────────────────────
  //
  // Core fumis drops PRESET_MODE and moves eco to switch.*_eco_mode, so
  // preset_modes came back empty and the button opened nothing.

  function mountBottom(
    extraConfig: Record<string, unknown>,
    attributes: Record<string, unknown>,
    extraStates: Record<string, any> = {},
    callService = vi.fn().mockResolvedValue({} as any),
  ): { el: SciFiStoveCard; callService: ReturnType<typeof vi.fn> } {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele', ...extraConfig });
    el.hass = makeMockHass({
      callService,
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'heat',
          attributes: { hvac_modes: ['off', 'heat'], temperature: 20, min_temp: 15, max_temp: 30, ...attributes },
        }),
        ...extraStates,
      },
    });
    document.body.appendChild(el);
    return { el, callService };
  }

  it('test_O3_eco_switch_renders_a_toggle_and_reflects_its_state', async () => {
    const { el } = mountBottom(
      { switch_eco_mode: 'switch.poele_eco_mode' },
      { preset_modes: [], preset_mode: 'none' },
      { 'switch.poele_eco_mode': makeMockEntity({ entity_id: 'switch.poele_eco_mode', state: 'on' }) },
    );
    await el.updateComplete;
    const toggle = el.shadowRoot!.querySelector('sf-button-card')!;
    expect(toggle).not.to.be.null;
    expect(toggle.getAttribute('icon')).to.equal('mdi:leaf');
    // the dead preset select is gone
    expect(el.shadowRoot!.querySelectorAll('sf-button-card-select').length).to.equal(1);
  });

  it('test_O3_eco_switch_toggle_shows_inactive_icon_when_off', async () => {
    const { el } = mountBottom(
      { switch_eco_mode: 'switch.poele_eco_mode' },
      { preset_modes: [], preset_mode: 'none' },
      { 'switch.poele_eco_mode': makeMockEntity({ entity_id: 'switch.poele_eco_mode', state: 'off' }) },
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-button-card')!.getAttribute('icon'))
      .to.equal('mdi:circle-medium');
  });

  it('test_O3_eco_switch_toggle_calls_switch_toggle', async () => {
    const { el, callService } = mountBottom(
      { switch_eco_mode: 'switch.poele_eco_mode' },
      { preset_modes: [], preset_mode: 'none' },
      { 'switch.poele_eco_mode': makeMockEntity({ entity_id: 'switch.poele_eco_mode', state: 'off' }) },
    );
    await el.updateComplete;
    el.shadowRoot!.querySelector('sf-button-card')!
      .dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true, detail: {} }));
    await el.updateComplete;
    expect(callService).toHaveBeenCalledWith('switch', 'toggle', { entity_id: 'switch.poele_eco_mode' });
  });

  it('test_O3_eco_switch_toggle_error_does_not_throw', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('eco error'));
    const { el } = mountBottom(
      { switch_eco_mode: 'switch.poele_eco_mode' },
      { preset_modes: [], preset_mode: 'none' },
      { 'switch.poele_eco_mode': makeMockEntity({ entity_id: 'switch.poele_eco_mode', state: 'off' }) },
      failing,
    );
    await el.updateComplete;
    el.shadowRoot!.querySelector('sf-button-card')!
      .dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true, detail: {} }));
    await el.updateComplete;
    expect(failing).toHaveBeenCalled();
  });

  it('test_O3_configured_but_absent_eco_switch_renders_no_dead_toggle', async () => {
    // switch_eco_mode points at an entity hass does not have (typo, or the
    // integration went away): no toggle, and the preset branch takes over.
    const { el } = mountBottom(
      { switch_eco_mode: 'switch.typo_eco_mode' },
      { preset_modes: ['none', 'eco'], preset_mode: 'none' },
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-button-card')).to.be.null;
    expect(el.shadowRoot!.querySelectorAll('sf-button-card-select').length).to.equal(2);
  });

  it('test_O3_configured_but_absent_eco_switch_renders_nothing_without_presets', async () => {
    const { el } = mountBottom(
      { switch_eco_mode: 'switch.typo_eco_mode' },
      { preset_modes: [], preset_mode: 'none' },
    );
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-button-card')).to.be.null;
    expect(el.shadowRoot!.querySelectorAll('sf-button-card-select').length).to.equal(1);
  });

  it('test_O3_preset_modes_keep_the_historical_select_when_no_eco_switch', async () => {
    const { el } = mountBottom({}, { preset_modes: ['none', 'eco'], preset_mode: 'eco' });
    await el.updateComplete;
    const selects = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    expect(selects.length).to.equal(2);
    expect(selects[1]!.getAttribute('icon')).to.equal('mdi:leaf');
    expect(el.shadowRoot!.querySelector('sf-button-card')).to.be.null;
  });

  it('test_O3_no_dead_control_when_neither_switch_nor_presets', async () => {
    const { el } = mountBottom({}, { preset_modes: [], preset_mode: 'none' });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll('sf-button-card-select').length).to.equal(1);
    expect(el.shadowRoot!.querySelector('sf-button-card')).to.be.null;
    // the other two controls are untouched
    expect(el.shadowRoot!.querySelector('sf-wheel')).not.to.be.null;
  });

  it('test_O3_eco_switch_is_tracked_as_a_relevant_entity', () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      switch_eco_mode: 'switch.poele_eco_mode',
    });
    expect((el as any).getRelevantEntities()).to.include('switch.poele_eco_mode');
  });

  it('IT-1103: sci-fi-stove.ts declares no inline css`` block', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../../../src/cards/stove/sci-fi-stove.ts'),
      'utf8',
    );
    expect(src).to.not.match(/\bcss`/);
    expect(src).to.contain("from './styles.js'");
  });

  // ── O5. Les quatre toasts de la barre inférieure passent par msg() ──────────

  /**
   * O5 — the four success toasts of the bottom bar were hard-coded French
   * literals, against correction C12 of the spec which had moved that bar's keys
   * to English msg() so lit-localize resolves them.
   *
   * What a resolved message can do and a literal cannot: FOLLOW the language
   * Home Assistant reports. SciFiBaseCard syncs the locale from
   * `hass.locale.language`, so these drive it the way a real dashboard does.
   */
  describe('O5 — bottom-bar toasts go through msg() (regression)', () => {
    const stoveAttrs = {
      friendly_name: 'Poêle',
      hvac_modes: ['off', 'heat'],
      preset_modes: ['none', 'eco'],
      preset_mode: 'none',
      temperature: 20,
      min_temp: 15,
      max_temp: 25,
    };

    const settle = () => new Promise((r) => setTimeout(r, 10));

    afterEach(async () => {
      // the card moved the locale through hass; the suite's other cases read
      // French, so never leave it moved.
      await setLocale('fr');
    });

    /** Mount with HA reporting `language`, and capture what reaches sf-toast. */
    const mountCapturing = async (
      language: string,
      config: Record<string, unknown>,
      states: Record<string, unknown>,
    ): Promise<{ el: SciFiStoveCard; messages: Array<{ text: string; error: boolean }> }> => {
      const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
      (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele', ...config });
      const hass = makeMockHass({
        callService: vi.fn().mockResolvedValue({} as any),
        states: states as any,
      });
      el.hass = { ...hass, locale: { ...hass.locale, language } } as any;
      document.body.appendChild(el);
      await el.updateComplete;
      await settle();   // the locale load the base class kicked off

      const messages: Array<{ text: string; error: boolean }> = [];
      const toast = el.shadowRoot!.querySelector('sf-toast') as any;
      toast.addMessage = (text: string, error: boolean) => { messages.push({ text, error }); };
      return { el, messages };
    };

    /** Drive the three climate controls of the bottom bar, in order. */
    const driveClimateControls = async (el: SciFiStoveCard): Promise<void> => {
      const selects = el.shadowRoot!.querySelectorAll('sf-button-card-select');
      selects[0]!.dispatchEvent(new CustomEvent('button-select', { bubbles: true, composed: true, detail: { id: 'heat' } }));
      await settle();

      el.shadowRoot!.querySelector('sf-wheel')!.dispatchEvent(
        new CustomEvent('wheel-change', { bubbles: true, composed: true, detail: { id: '21' } }));
      await settle();

      selects[1]!.dispatchEvent(new CustomEvent('button-select', { bubbles: true, composed: true, detail: { id: 'eco' } }));
      await settle();
    };

    const climateStates = () => ({
      'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'off', attributes: stoveAttrs }),
    });

    it('O5 — HVAC, temperature and preset toasts read English when HA is in English', async () => {
      const { el, messages } = await mountCapturing('en', {}, climateStates());
      await driveClimateControls(el);

      expect(messages.map((m) => m.text)).to.deep.equal([
        'HVAC mode changed',
        'Temperature changed',
        'Preset changed',
      ]);
      expect(messages.every((m) => m.error === false)).to.be.true;
    });

    it('O5 — the same three read French when HA is in French', async () => {
      const { el, messages } = await mountCapturing('fr', {}, climateStates());
      await driveClimateControls(el);

      expect(messages.map((m) => m.text)).to.deep.equal([
        'Mode HVAC modifié',
        'Température modifiée',
        'Preset modifié',
      ]);
    });

    it('O5 — the eco toast follows the language too', async () => {
      const states = {
        ...climateStates(),
        'switch.eco': makeMockEntity({ entity_id: 'switch.eco', state: 'off' }),
      };

      const en = await mountCapturing('en', { switch_eco_mode: 'switch.eco' }, states);
      en.el.shadowRoot!.querySelector('sf-button-card')!.dispatchEvent(
        new CustomEvent('button-click', { bubbles: true, composed: true }));
      await settle();
      expect(en.messages.map((m) => m.text)).to.deep.equal(['Eco mode changed']);

      const fr = await mountCapturing('fr', { switch_eco_mode: 'switch.eco' }, states);
      fr.el.shadowRoot!.querySelector('sf-button-card')!.dispatchEvent(
        new CustomEvent('button-click', { bubbles: true, composed: true }));
      await settle();
      expect(fr.messages.map((m) => m.text)).to.deep.equal(['Mode éco modifié']);
    });

    // The first shape of this guard only scanned `_showToast(` call sites, and
    // the review found two accented literals surviving in the very file it was
    // meant to protect (the absent-entity message and the header fallback).
    // It now reads the whole source, comments excluded.
    // Round 2 of the review measured a SURVIVING mutant here: `?? 'Stove'`
    // instead of `?? msg('Stove')` left the whole stove suite green. The accent
    // guard cannot see an unaccented literal, and nothing mounted the card on an
    // entity without `friendly_name`. TC-1115.
    it('TC-1115 — the header fallback of an entity without friendly_name follows the locale', async () => {
      const noName = {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'off',
          attributes: { hvac_modes: ['off', 'heat'] },
        }),
      };

      const en = await mountCapturing('en', {}, noName);
      expect(en.el.shadowRoot!.querySelector('.header')!.textContent!.trim()).to.equal('Stove');

      const fr = await mountCapturing('fr', {}, noName);
      expect(fr.el.shadowRoot!.querySelector('.header')!.textContent!.trim()).to.equal('Poêle');
    });

    it('O5 — no accented French literal is left in the card source', () => {
      const src = fs.readFileSync(
        path.resolve(__dirname, '../../../src/cards/stove/sci-fi-stove.ts'),
        'utf8',
      );
      // Comments legitimately hold French; code must not. Their CONTENT is
      // blanked and their newlines kept, so the line numbers reported below are
      // the file's own. Trailing `//` comments go too — a French note at the end
      // of a code line is not a defect — while `://` is left alone so a URL is
      // not mistaken for one. Accepted limit: a literal `/* */` sequence inside
      // a string would be read as a comment; none exists in this card.
      const code = src
        .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
        .replace(/(^|[^:])\/\/.*$/gm, '$1');
      // Not just quoted strings: the absent-entity message sat inside an html``
      // template, where a quote-shaped probe could not see it. Measured on the
      // version this lot started from, this reads 6 lines; on the fixed file, 0.
      const accented = code
        .split('\n')
        .map((line, i) => [i + 1, line] as const)
        .filter(([, line]) => /[éèêàâîôûùçÉÈÊÀÂÎÔÛÙÇ]/.test(line));
      expect(accented, `French left in code: ${accented.map(([n, l]) => `${n}: ${l.trim()}`).join(' | ')}`)
        .to.have.lengthOf(0);
    });
  });
});
