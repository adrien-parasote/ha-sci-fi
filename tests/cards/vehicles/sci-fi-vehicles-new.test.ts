/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
// Spec 12 — Vehicle Card Design Update
// TC-1201 → TC-1214
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';

import '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { SciFiVehiclesCard } from '../../../src/cards/vehicles/sci-fi-vehicles.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

// TC-1213 — vehicle_const.ts exports
import {
  HASS_RENAULT_SERVICE,
  HASS_RENAULT_SERVICE_ACTION_START_AC,
  HASS_RENAULT_SERVICE_ACTION_STOP_AC,
  VEHICLE_CHARGE_STATES_NOT_IN_CHARGE,
  VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS,
  VEHICLE_PLUG_STATES_UNPLUGGED,
  VEHICLE_PLUG_STATES_PLUGGED,
} from '../../../src/cards/vehicles/vehicle_const.js';

// TC-1214 — vehicleStyles export
import { vehicleStyles } from '../../../src/cards/vehicles/styles.js';

const BASE_CONFIG = {
  type: 'custom:sci-fi-vehicles',
  vehicles: [{ id: 'v1', name: 'Tesla' }],
} as const;

const TWO_VEHICLE_CONFIG = {
  type: 'custom:sci-fi-vehicles',
  vehicles: [
    { id: 'v1', name: 'Tesla' },
    { id: 'v2', name: 'Renault' },
  ],
} as const;

function mountCard(config: any, hass?: any) {
  const el = document.createElement('sci-fi-vehicles') as SciFiVehiclesCard;
  (el as any).setConfig(config);
  if (hass) el.hass = hass;
  document.body.appendChild(el);
  return el;
}

describe('sci-fi-vehicles (Spec 12)', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.resetAllMocks();
  });

  // ── TC-1201 Static ─────────────────────────────────────────────────────────

  it('TC-1201: getConfigElement returns correct editor tag', () => {
    const el = SciFiVehiclesCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-vehicles-editor');
  });

  it('TC-1202: getStubConfig returns correct type', () => {
    const config = SciFiVehiclesCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-vehicles');
  });

  // ── TC-1203 Empty without hass ─────────────────────────────────────────────

  it('TC-1203: renders empty without hass', async () => {
    const el = mountCard(BASE_CONFIG);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent?.trim()).to.equal('');
  });

  // ── TC-1204 Vehicle name in header ─────────────────────────────────────────

  it('TC-1204: renders vehicle name in header', async () => {
    const el = mountCard(BASE_CONFIG, makeMockHass());
    await el.updateComplete;
    const header = el.shadowRoot!.querySelector('.header .title');
    expect(header?.textContent?.trim()).to.equal('Tesla');
  });

  // ── TC-1205 Prev/next hidden for 1 vehicle ─────────────────────────────────

  it('TC-1205: prev/next navigation hidden for single vehicle', async () => {
    const el = mountCard(BASE_CONFIG, makeMockHass());
    await el.updateComplete;
    const hiddenDivs = el.shadowRoot!.querySelectorAll('.header .hide');
    expect(hiddenDivs.length).to.equal(2);
  });

  // ── TC-1206 Prev/next visible for multiple vehicles ────────────────────────

  it('TC-1206: prev/next navigation visible for multiple vehicles', async () => {
    const el = mountCard(TWO_VEHICLE_CONFIG, makeMockHass());
    await el.updateComplete;
    const hiddenDivs = el.shadowRoot!.querySelectorAll('.header .hide');
    expect(hiddenDivs.length).to.equal(0);
  });

  // ── TC-1207 sf-landspeeder in shadow DOM ───────────────────────────────────

  it('TC-1207: sf-landspeeder is present in shadow DOM', async () => {
    const el = mountCard(BASE_CONFIG, makeMockHass());
    await el.updateComplete;
    const speeder = el.shadowRoot!.querySelector('sf-landspeeder');
    expect(speeder).not.to.be.null;
  });

  // ── TC-1208 sf-landspeeder vehicle prop ────────────────────────────────────

  it('TC-1208: sf-landspeeder receives vehicle prop matching config.vehicles[0]', async () => {
    const el = mountCard(BASE_CONFIG, makeMockHass());
    await el.updateComplete;
    const speeder = el.shadowRoot!.querySelector('sf-landspeeder') as any;
    expect(speeder).not.to.be.null;
    expect(speeder.vehicle.id).to.equal('v1');
    expect(speeder.vehicle.name).to.equal('Tesla');
  });

  // ── TC-1209 Actions section ─────────────────────────────────────────────────

  it('TC-1209: actions section is present', async () => {
    const el = mountCard(BASE_CONFIG, makeMockHass());
    await el.updateComplete;
    const actions = el.shadowRoot!.querySelector('.actions');
    expect(actions).not.to.be.null;
  });

  // ── TC-1210 Temperature wheel ──────────────────────────────────────────────

  it('TC-1210: temperature sf-wheel is present in actions', async () => {
    const el = mountCard(BASE_CONFIG, makeMockHass());
    await el.updateComplete;
    const wheel = el.shadowRoot!.querySelector('sf-wheel');
    expect(wheel).not.to.be.null;
  });

  // ── TC-1211 Start and Stop AC buttons ─────────────────────────────────────

  it('TC-1211: Start and Stop AC sf-button-card elements present', async () => {
    const el = mountCard(BASE_CONFIG, makeMockHass());
    await el.updateComplete;
    const buttons = el.shadowRoot!.querySelectorAll('.ac sf-button-card');
    expect(buttons.length).to.equal(2);
  });

  // ── TC-1212 Prev navigation ────────────────────────────────────────────────

  it('TC-1212: prev navigation cycles to last vehicle from first', async () => {
    const el = mountCard(TWO_VEHICLE_CONFIG, makeMockHass());
    await el.updateComplete;

    // Initially shows Tesla (idx 0)
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Tesla');

    // Click prev button (first button in header)
    const prevBtn = el.shadowRoot!.querySelector('.header sf-button') as any;
    expect(prevBtn).not.to.be.null;
    prevBtn.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true, detail: { element: { icon: 'mdi:chevron-left' } } }));
    await el.updateComplete;

    // Should now show Renault (idx 1 = last)
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Renault');
  });

  // ── TC-1213 Next navigation ────────────────────────────────────────────────

  it('TC-1213: next navigation cycles to first vehicle from last', async () => {
    const el = mountCard(TWO_VEHICLE_CONFIG, makeMockHass());
    await el.updateComplete;

    // Click next (move to Renault first)
    const buttons = el.shadowRoot!.querySelectorAll('.header sf-button') as NodeListOf<any>;
    buttons[1].dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true, detail: { element: { icon: 'mdi:chevron-right' } } }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Renault');

    // Click next again → wraps to Tesla
    buttons[1].dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true, detail: { element: { icon: 'mdi:chevron-right' } } }));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.header .title')?.textContent?.trim()).to.equal('Tesla');
  });

  // ── TC-1214 vehicle_const.ts exports ────────────────────────────────────────

  it('TC-1214: vehicle_const.ts exports correct service and state constants', () => {
    expect(HASS_RENAULT_SERVICE).to.equal('renault');
    expect(HASS_RENAULT_SERVICE_ACTION_START_AC).to.equal('ac_start');
    expect(HASS_RENAULT_SERVICE_ACTION_STOP_AC).to.equal('ac_cancel');
    expect(VEHICLE_CHARGE_STATES_NOT_IN_CHARGE).to.equal('not_in_charge');
    expect(VEHICLE_CHARGE_STATES_CHARGE_IN_PROGRESS).to.equal('charge_in_progress');
    expect(VEHICLE_PLUG_STATES_UNPLUGGED).to.equal('unplugged');
    expect(VEHICLE_PLUG_STATES_PLUGGED).to.equal('plugged');
  });

  // ── TC-1215 styles.ts export ────────────────────────────────────────────────

  it('TC-1215: vehicleStyles exports a Lit CSSResult', () => {
    expect(vehicleStyles).to.be.an('object');
    expect((vehicleStyles as any).cssText).to.be.a('string');
  });

  // ── IT-1201 Integration: customElements registration ───────────────────────

  it('IT-1201: sci-fi-vehicles is registered in customElements', () => {
    const cls = customElements.get('sci-fi-vehicles');
    expect(cls).not.to.be.undefined;
  });

  // ── IT-1202 Integration: full render sections ───────────────────────────────

  it('IT-1202: card renders header + sf-landspeeder + actions', async () => {
    const el = mountCard(BASE_CONFIG, makeMockHass());
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.header')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('sf-landspeeder')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.actions')).not.to.be.null;
  });
});
