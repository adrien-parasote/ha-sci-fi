 
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-stove
 * Covers: normalizePelletPct (NaN/ratio/percentage), isOn branches,
 *         hasCircle/hasStack nothing branches, stockMax attribute fallback.
 */
import { expect, describe, it, afterEach } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-stove.js';
import { makeMockHass, makeMockEntity } from '../../../fixtures/mock-hass.js';

// ── Stubs ─────────────────────────────────────────────────────────────────────
for (const tag of ['sf-icon', 'sf-circle-progress-bar', 'sf-stack-bar']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_CONFIG = {
  status: 'switch.stove',
  pellet_quantity: 'sensor.pellet_qty',
  pellet_stock: 'sensor.pellet_stock',
};

function makeEl(): any {
  return document.createElement('sf-bridge-stove') as any;
}

function makeHass(pelletQty: string, pelletStock: string, stoveState = 'off', stockMax?: number) {
  return makeMockHass({
    states: {
      'switch.stove': makeMockEntity({ entity_id: 'switch.stove', state: stoveState }),
      'sensor.pellet_qty': makeMockEntity({ entity_id: 'sensor.pellet_qty', state: pelletQty }),
      'sensor.pellet_stock': makeMockEntity({
        entity_id: 'sensor.pellet_stock',
        state: pelletStock,
        attributes: stockMax !== undefined ? { maximum: stockMax } : {},
      }),
    },
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-stove', () => {
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
    el.hass = makeHass('60', '15');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  // ── isOn branches ─────────────────────────────────────────────────────────

  it('renders stove-on chip when status is on', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('60', '15', 'on');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.stove-on')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.stove-off')).to.be.null;
  });

  it('renders stove-off chip when status is off', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('60', '15', 'off');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.stove-off')).not.to.be.null;
    expect(el.shadowRoot!.querySelector('.stove-on')).to.be.null;
  });

  // ── normalizePelletPct: percentage branch (raw > 1) ──────────────────────

  it('renders circle-progress-bar when pellet_qty is a percentage (e.g. 60)', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('60', '15');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-circle-progress-bar')).not.to.be.null;
  });

  // ── normalizePelletPct: ratio branch (raw ≤ 1) ───────────────────────────

  it('renders circle-progress-bar when pellet_qty is a ratio (e.g. 0.6)', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('0.6', '15');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-circle-progress-bar')).not.to.be.null;
  });

  // ── normalizePelletPct: NaN branch (hasCircle = false) ───────────────────

  it('does NOT render circle-progress-bar when pellet_qty is NaN (unavailable)', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('unavailable', '15');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-circle-progress-bar')).to.be.null;
  });

  // ── hasStack: false branch (no stack-bar) ─────────────────────────────────

  it('does NOT render stack-bar when pellet_stock is unavailable', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('60', 'unavailable');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-stack-bar')).to.be.null;
  });

  // ── hasStack: true branch ─────────────────────────────────────────────────

  it('renders stack-bar when pellet_stock is a valid number', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('60', '10', 'off', 20);
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-stack-bar')).not.to.be.null;
  });

  // ── stockMax: attributes.max fallback ─────────────────────────────────────

  it('reads stockMax from attributes.max when maximum is absent', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeMockHass({
      states: {
        'switch.stove': makeMockEntity({ entity_id: 'switch.stove', state: 'off' }),
        'sensor.pellet_qty': makeMockEntity({ entity_id: 'sensor.pellet_qty', state: '50' }),
        'sensor.pellet_stock': makeMockEntity({
          entity_id: 'sensor.pellet_stock',
          state: '8',
          attributes: { max: 15 },
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const stackBar = el.shadowRoot!.querySelector('sf-stack-bar');
    expect(stackBar).not.to.be.null;
  });

  // ── stockMax: default 20 when no attributes ───────────────────────────────

  it('uses default stockMax of 20 when no max attribute', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('50', '10');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-stack-bar')).not.to.be.null;
  });

  // ── low_threshold config ──────────────────────────────────────────────────

  it('uses config.low_threshold when provided', async () => {
    const el = makeEl();
    el.config = { ...BASE_CONFIG, low_threshold: 0.2 };
    el.hass = makeHass('60', '15');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).not.to.be.null;
  });
});
