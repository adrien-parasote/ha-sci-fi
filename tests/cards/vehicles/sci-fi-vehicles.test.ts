/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Consolidated tests — Spec 12 § Vehicles Card Design Update
 * Combines base, new (TC-1201 → TC-1215), and extended tests into a single suite.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';

import '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { SciFiVehiclesCard } from '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

// Constant imports from vehicle_const
import {
  HASS_RENAULT_SERVICE,
  HASS_RENAULT_SERVICE_ACTION_START_AC,
  HASS_RENAULT_SERVICE_ACTION_STOP_AC,
  VEHICLE_CHARGE_STATES_NOT_IN_CHARGE,
  VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS,
  VEHICLE_PLUG_STATES_UNPLUGGED,
  VEHICLE_PLUG_STATES_PLUGGED,
} from '../../../src/components/vehicle_const.js';

// vehicleStyles export
import { vehicleStyles } from '../../../src/cards/vehicles/styles.js';

const V1 = { id: 'v1', name: 'Tesla' };
const V2 = { id: 'v2', name: 'Zoe' };


function makeHass(callService?: any) {
  return makeMockHass({ callService });
}

async function mountCard(vehicles: any[], hass = makeHass()): Promise<SciFiVehiclesCard> {
  const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
  (el as any).setConfig({ type: 'custom:sci-fi-vehicles', vehicles });
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-vehicles — Spec 12 design', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  // ── TC-1201 / Static & Stub Config ─────────────────────────────────────────

  it('TC-1201: getConfigElement returns correct editor tag', () => {
    const el = SciFiVehiclesCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-vehicles-editor');
  });

  it('TC-1202: getStubConfig returns correct type', () => {
    const config = SciFiVehiclesCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-vehicles');
  });

  // ── TC-1203 Empty without HASS ─────────────────────────────────────────────

  it('TC-1203: renders empty without hass', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    document.body.appendChild(el);
    (el as any).setConfig(SciFiVehiclesCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent?.trim()).to.equal('');
  });

  // ── TC-1204 / Header Renders ───────────────────────────────────────────────

  it('TC-1204: renders vehicle name in header', async () => {
    const el = await mountCard([V1]);
    const header = el.shadowRoot!.querySelector('.header .title');
    expect(header?.textContent?.trim()).to.equal('Tesla');
  });

  // ── TC-1205 / Single Vehicle Hide Navigation ──────────────────────────────

  it('TC-1205: prev/next navigation hidden for single vehicle', async () => {
    const el = await mountCard([V1]);
    const hiddenDivs = el.shadowRoot!.querySelectorAll('.header .hide');
    expect(hiddenDivs.length).to.equal(2);
  });

  // ── TC-1206 / Multiple Vehicles Show Navigation ────────────────────────────

  it('TC-1206: prev/next navigation visible for multiple vehicles', async () => {
    const el = await mountCard([V1, V2]);
    const hiddenDivs = el.shadowRoot!.querySelectorAll('.header .hide');
    expect(hiddenDivs.length).to.equal(0);
  });

  // ── TC-1207 / TC-1208 sf-landspeeder in shadow DOM ──────────────────────────

  it('TC-1207: sf-landspeeder is present in shadow DOM', async () => {
    const el = await mountCard([V1]);
    const speeder = el.shadowRoot!.querySelector('sf-landspeeder');
    expect(speeder).not.to.be.null;
  });

  it('TC-1208: sf-landspeeder receives vehicle prop matching config.vehicles[0]', async () => {
    const el = await mountCard([V1]);
    const speeder = el.shadowRoot!.querySelector('sf-landspeeder') as any;
    expect(speeder).not.to.be.null;
    expect(speeder.vehicle.id).to.equal('v1');
    expect(speeder.vehicle.name).to.equal('Tesla');
  });

  // ── TC-1209 / Actions section ──────────────────────────────────────────────

  it('TC-1209: actions section is present', async () => {
    const el = await mountCard([V1]);
    const actions = el.shadowRoot!.querySelector('.actions');
    expect(actions).not.to.be.null;
  });

  // ── TC-1210 / Temperature sf-wheel ─────────────────────────────────────────

  it('TC-1210: temperature sf-wheel is present in actions', async () => {
    const el = await mountCard([V1]);
    const wheel = el.shadowRoot!.querySelector('sf-wheel');
    expect(wheel).not.to.be.null;
  });

  // ── TC-1211 / AC Buttons ───────────────────────────────────────────────────

  it('TC-1211: Start and Stop AC sf-button-card elements present', async () => {
    const el = await mountCard([V1]);
    const buttons = el.shadowRoot!.querySelectorAll('.ac sf-button-card');
    expect(buttons.length).to.equal(2);
  });

  // ── TC-1212 & TC-1213 / Navigation Cycling ─────────────────────────────────

  it('TC-1212: prev navigation cycles to last vehicle from first', async () => {
    const el = await mountCard([V1, V2]);
    // Initially shows Tesla (idx 0)
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Tesla');

    // Click prev button (first button in header)
    const prevBtn = el.shadowRoot!.querySelector('.header sf-button[icon="mdi:chevron-left"]') as HTMLElement;
    expect(prevBtn).not.to.be.null;
    prevBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;

    // Should now show Zoe (idx 1 = last)
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Zoe');
  });

  it('TC-1213: next navigation cycles to first vehicle from last', async () => {
    const el = await mountCard([V1, V2]);
    // Click next (move to Zoe first)
    const nextBtn = el.shadowRoot!.querySelector('.header sf-button[icon="mdi:chevron-right"]') as HTMLElement;
    nextBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Zoe');

    // Click next again → wraps to Tesla
    nextBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Tesla');
  });

  // ── TC-1214 / Constant Exports ─────────────────────────────────────────────

  it('TC-1214: vehicle_const.ts exports correct service and state constants', () => {
    expect(HASS_RENAULT_SERVICE).to.equal('renault');
    expect(HASS_RENAULT_SERVICE_ACTION_START_AC).to.equal('ac_start');
    expect(HASS_RENAULT_SERVICE_ACTION_STOP_AC).to.equal('ac_cancel');
    expect(VEHICLE_CHARGE_STATES_NOT_IN_CHARGE).to.equal('not_in_charge');
    expect(VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS).to.equal('charge_in_progress');
    expect(VEHICLE_PLUG_STATES_UNPLUGGED).to.equal('unplugged');
    expect(VEHICLE_PLUG_STATES_PLUGGED).to.equal('plugged');
  });

  // ── TC-1215 / vehicleStyles Export ─────────────────────────────────────────

  it('TC-1215: vehicleStyles exports a Lit CSSResult', () => {
    expect(vehicleStyles).to.be.an('object');
    expect((vehicleStyles as any).cssText).to.be.a('string');
  });

  // ── IT-1201 / customElements Registration ──────────────────────────────────

  it('IT-1201: sci-fi-vehicles is registered in customElements', () => {
    const cls = customElements.get('sci-fi-vehicles');
    expect(cls).not.to.be.undefined;
  });

  // ── IT-1202 / Full Render Sections ─────────────────────────────────────────

  it('IT-1202: card renders header + sf-landspeeder + actions', async () => {
    const el = await mountCard([V1]);
    expect(el.shadowRoot!.querySelector('.header')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-landspeeder')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.actions')).not.to.be.null;
  });

  // ── Base Tests / Missing Sensors & Unlock State ────────────────────────────

  it('renders vehicle with missing sensors gracefully', async () => {
    const el = await mountCard([V1]);
    expect(el.shadowRoot!.textContent).to.include('Tesla');
  });

  it('renders vehicle name in header and sf-landspeeder with data', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-vehicles',
      vehicles: [
        {
          id: 'v1',
          name: 'Tesla',
          battery_level: 'sensor.tesla_battery',
          charging: 'switch.tesla_charging',
          battery_autonomy: 'sensor.tesla_range',
          mileage: 'sensor.tesla_mileage',
          location: 'device_tracker.tesla',
          lock_status: 'lock.tesla'
        }
      ]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'sensor.tesla_battery': makeMockEntity({ entity_id: 'sensor.tesla_battery', state: '85' }),
        'switch.tesla_charging': makeMockEntity({ entity_id: 'switch.tesla_charging', state: 'on' }),
        'sensor.tesla_range': makeMockEntity({ entity_id: 'sensor.tesla_range', state: '450' }),
        'sensor.tesla_mileage': makeMockEntity({ entity_id: 'sensor.tesla_mileage', state: '15000' }),
        'device_tracker.tesla': makeMockEntity({ entity_id: 'device_tracker.tesla', state: 'home' }),
        'lock.tesla': makeMockEntity({ entity_id: 'lock.tesla', state: 'locked' })
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Tesla');
    const speeder = el.shadowRoot!.querySelector('sf-landspeeder') as any;
    expect(speeder).not.to.be.null;
    expect(speeder.vehicle.id).to.equal('v1');
    expect(el.shadowRoot!.querySelector('.actions')).not.to.be.null;
  });

  it('renders card correctly for unlocked vehicle (header shows name)', async () => {
    const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-vehicles',
      vehicles: [{ id: 'v1', name: 'Tesla', lock_status: 'lock.tesla' }]
    } as unknown as any);

    el.hass = makeMockHass({
      states: {
        'lock.tesla': makeMockEntity({ entity_id: 'lock.tesla', state: 'unlocked' })
      }
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Tesla');
    const speeder = el.shadowRoot!.querySelector('sf-landspeeder') as any;
    expect(speeder.vehicle.lock_status).to.equal('lock.tesla');
  });

  // ── Consolidated Extended Tests / Services & AC Commands ───────────────────

  it('_startAc calls callService with renault_ac service', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const el = await mountCard([V1], makeHass(mockCallService));

    const startBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:play"]')!;
    startBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));

    expect(mockCallService).toHaveBeenCalledWith(
      'renault',
      'ac_start',
      { vehicle: 'v1', temperature: 18 } // default temp idx 2 → 16+2=18
    );
  });

  it('_startAc sets loading and resets after resolve', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const el = await mountCard([V1], makeHass(mockCallService));

    const startBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:play"]')!;
    startBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));

    expect((el as any)._is_ac_loading).toBe(true);

    await new Promise(r => setTimeout(r, 0));
    expect((el as any)._is_ac_loading).toBe(false);
  });

  it('_stopAc calls callService with stop_vehicle_ac service', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const el = await mountCard([V1], makeHass(mockCallService));

    const stopBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:stop"]')!;
    stopBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));

    expect(mockCallService).toHaveBeenCalledWith(
      'renault',
      'ac_cancel',
      { vehicle: 'v1' }
    );
  });

  it('_stopAc handles errors and resets loading', async () => {
    const mockCallService = vi.fn(() => Promise.reject(new Error('service unavailable')));
    const el = await mountCard([V1], makeHass(mockCallService));

    const stopBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:stop"]')!;
    stopBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));

    expect((el as any)._is_ac_loading).toBe(false);
  });

  it('_onTempChange updates selected temp id', async () => {
    const el = await mountCard([V1]);
    const wheel = el.shadowRoot!.querySelector('sf-wheel')!;
    wheel.dispatchEvent(new CustomEvent('wheel-change', {
      bubbles: true,
      composed: true,
      detail: { id: '5' },
    }));
    await el.updateComplete;
    expect((el as any)._selected_temp_id).toBe(5);
  });

  it('temp change affects AC call temperature', async () => {
    const mockCallService = vi.fn(() => Promise.resolve({} as any));
    const el = await mountCard([V1], makeHass(mockCallService));

    const wheel = el.shadowRoot!.querySelector('sf-wheel')!;
    wheel.dispatchEvent(new CustomEvent('wheel-change', {
      bubbles: true,
      composed: true,
      detail: { id: '4' },
    }));
    await el.updateComplete;

    const startBtn = el.shadowRoot!.querySelector('sf-button-card[icon="mdi:play"]')!;
    startBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 0));

    expect(mockCallService).toHaveBeenCalledWith('renault', 'ac_start', { vehicle: 'v1', temperature: 20 });
  });

  it('renders sf-wheel with 10 temperature items', async () => {
    const el = await mountCard([V1]);
    const wheel = el.shadowRoot!.querySelector('sf-wheel') as any;
    expect(wheel?.items?.length).toBe(10);
  });
});
