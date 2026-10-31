 
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-vehicle
 * Covers: render guards, plugIcon (unavailable/charging/idle), powerDisplay
 *         kW branch (rawPower >= 1000), statusLabel branches, entityName fallback,
 *         isUnavailable guard.
 */
import { expect, describe, it, afterEach } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-vehicle.js';
import { makeMockHass, makeMockEntity } from '../../../fixtures/mock-hass.js';
import { setLocale } from '../../../../src/locales/localization.js';

// ── Stubs ─────────────────────────────────────────────────────────────────────
for (const tag of ['sf-icon']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_CONFIG = { power_sensor: 'sensor.ev_power' };

function makeEl(): any {
  return document.createElement('sf-bridge-vehicle') as any;
}

function makeHass(powerState: string, attributes: Record<string, any> = {}) {
  return makeMockHass({
    states: {
      'sensor.ev_power': makeMockEntity({
        entity_id: 'sensor.ev_power',
        state: powerState,
        attributes,
      }),
    },
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-vehicle', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Render guards ──────────────────────────────────────────────────────────

  it('renders empty when hass is not set', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  it('renders empty when config is not set', async () => {
    const el = makeEl();
    el.hass = makeHass('0');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  // ── plugIcon: unavailable branch (line 24) ────────────────────────────────

  it('renders landspeeder-error-plug icon when power sensor is unavailable', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('unavailable');
    document.body.appendChild(el);
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('sf-icon[icon="sci:landspeeder-error-plug"]');
    expect(icon).not.to.be.null;
  });

  // ── plugIcon: charging branch (line 27) ───────────────────────────────────

  it('TC-BRIDGE-U-26: power > 0 → "En charge" label and the plugged icon', async () => {
    await setLocale('fr');
    const el = makeEl();
    el.config = BASE_CONFIG;
    // U-26 is specified with power = '2300'.
    el.hass = makeHass('2300');
    document.body.appendChild(el);
    await el.updateComplete;

    // The status label is what U-26 is about; the icon comes second.
    expect(el.shadowRoot!.querySelector('.vehicle-status-label')!.textContent!.trim()).to.equal(
      'En charge',
    );
    // Anchored INSIDE .vehicle-body — the real container of the plug icon.
    // `sf-icon[icon="sci:landspeeder*"]` on the whole shadowRoot also matches
    // the .bridge-section-title icon, which renders unconditionally.
    const body = el.shadowRoot!.querySelector('.vehicle-body');
    expect(body, '.vehicle-body must exist for this anchor to mean anything').not.to.be.null;
    expect(body!.querySelector('sf-icon[icon="sci:landspeeder-plugged"]')).not.to.be.null;
  });

  // ── plugIcon: idle branch (line 29) ───────────────────────────────────────

  it('TC-BRIDGE-U-25: power = 0 → "Non connectée" label and the idle icon', async () => {
    await setLocale('fr');
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('0');
    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.vehicle-status-label')!.textContent!.trim()).to.equal(
      'Non connectée',
    );
    // The old assertion was tautological: the section-title icon is also
    // `sci:landspeeder`, so it passed for power = 3500 just as well. The label
    // discriminates the idle branch; the body anchor pins the plug icon.
    const body = el.shadowRoot!.querySelector('.vehicle-body');
    expect(body, '.vehicle-body must exist for this anchor to mean anything').not.to.be.null;
    expect(body!.querySelector('sf-icon[icon="sci:landspeeder"]')).not.to.be.null;
    expect(body!.querySelector('sf-icon[icon="sci:landspeeder-plugged"]')).to.be.null;
  });

  // ── powerDisplay: W branch (rawPower < 1000) ──────────────────────────────

  it('renders power in W when rawPower < 1000', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('800');
    document.body.appendChild(el);
    await el.updateComplete;
    const powerEl = el.shadowRoot!.querySelector('.vehicle-power-value');
    expect(powerEl?.textContent).toContain('W');
  });

  // ── powerDisplay: kW branch (line 52 — rawPower >= 1000) ─────────────────

  it('renders power in kW when rawPower >= 1000', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('3500');
    document.body.appendChild(el);
    await el.updateComplete;
    const powerEl = el.shadowRoot!.querySelector('.vehicle-power-value');
    expect(powerEl?.textContent).toContain('kW');
  });

  // ── statusLabel branches ──────────────────────────────────────────────────

  it('renders "charging" class when charging', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('3500');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.vehicle-power-value.charging')).not.to.be.null;
  });

  it('renders "idle" class when not charging', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('0');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.vehicle-power-value.idle')).not.to.be.null;
  });

  // ── entityName: from config.name ──────────────────────────────────────────

  it('renders entity name from config.name when provided', async () => {
    const el = makeEl();
    el.config = { ...BASE_CONFIG, name: 'Tesla Model 3' };
    el.hass = makeHass('0');
    document.body.appendChild(el);
    await el.updateComplete;
    const nameEl = el.shadowRoot!.querySelector('.vehicle-entity-name');
    expect(nameEl).not.to.be.null;
    expect(nameEl?.textContent).toContain('Tesla Model 3');
  });

  // ── entityName: from friendly_name fallback (line 68) ────────────────────

  it('renders friendly_name when config.name is not set', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG; // no name
    el.hass = makeHass('0', { friendly_name: 'My EV' });
    document.body.appendChild(el);
    await el.updateComplete;
    const nameEl = el.shadowRoot!.querySelector('.vehicle-entity-name');
    expect(nameEl).not.to.be.null;
    expect(nameEl?.textContent).toContain('My EV');
  });

  // ── entityName: null branch (no name rendered) ────────────────────────────

  it('does NOT render entity name element when name and friendly_name are absent', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('0');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.vehicle-entity-name')).to.be.null;
  });
});
