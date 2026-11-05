 
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

  // ── O1 (ha-sci-fi-uvl): the status chip never lit up ─────────────────────
  //
  // config.status never carries the string 'on': the HACS binary_sensor wrote the
  // raw status text, and core fumis only has the 14-value detailed_stove_status
  // enum. The chip must read membership of the off set, not equality to 'on'.

  const HEATING_STATES = [
    'combustion', 'eco', 'pre_heating', 'ignition', 'pre_combustion',
    'wood_combustion', 'wood_start', 'hybrid_init', 'hybrid_start', 'cold_start',
  ];
  const OFF_STATES = ['off', 'cooling', 'cold_start_off', 'wood_burning_off', 'unknown', 'unavailable'];

  for (const state of HEATING_STATES) {
    it(`test_O1_chip_is_active_on_heating_state: '${state}' lights the chip`, async () => {
      const el = makeEl();
      el.config = BASE_CONFIG;
      el.hass = makeHass('60', '15', state);
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.stove-on'), state).not.to.be.null;
      expect(el.shadowRoot!.querySelector('.stove-off'), state).to.be.null;
      expect(
        el.shadowRoot!.querySelector('.stove-status-row sf-icon')!.getAttribute('icon'),
      ).to.equal('sci:stove-heat');
    });
  }

  for (const state of OFF_STATES) {
    it(`test_O1_chip_is_inactive_on_off_state: '${state}' leaves the chip off`, async () => {
      const el = makeEl();
      el.config = BASE_CONFIG;
      el.hass = makeHass('60', '15', state);
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('.stove-off'), state).not.to.be.null;
      expect(el.shadowRoot!.querySelector('.stove-on'), state).to.be.null;
      expect(
        el.shadowRoot!.querySelector('.stove-status-row sf-icon')!.getAttribute('icon'),
      ).to.equal('sci:stove-off');
    });
  }

  it('test_O1_chip_is_inactive_when_status_entity_is_absent', async () => {
    const el = makeEl();
    el.config = { ...BASE_CONFIG, status: 'binary_sensor.does_not_exist' };
    el.hass = makeHass('60', '15', 'combustion');
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

  // ── stockMax: default 100 when no attributes, as the stove card ──────────

  it('test_O4_stock_max_defaults_to_100_like_the_stove_card', async () => {
    const el = makeEl();
    el.config = BASE_CONFIG;
    el.hass = makeHass('50', '10');
    document.body.appendChild(el);
    await el.updateComplete;
    expect((el.shadowRoot!.querySelector('sf-stack-bar') as any).max).to.equal(100);
  });

  // ── low_threshold config ──────────────────────────────────────────────────

  it('uses config.low_threshold when provided', async () => {
    const el = makeEl();
    el.config = { ...BASE_CONFIG, low_threshold: 0.2 };
    el.hass = makeHass('60', '15');
    document.body.appendChild(el);
    await el.updateComplete;
    const circle = el.shadowRoot!.querySelector('sf-circle-progress-bar') as any;
    expect(circle.threshold).to.equal(0.2);
  });

  // ── Section icon ───────────────────────────────────────────────────────────

  it('TC-BRIDGE-U-19: uses config.icon for the section title, defaulting to sci:stove', async () => {
    const custom = makeEl();
    custom.config = { ...BASE_CONFIG, icon: 'mdi:campfire' };
    custom.hass = makeHass('60', '15');
    document.body.appendChild(custom);
    await custom.updateComplete;
    expect(
      custom.shadowRoot!.querySelector('.bridge-section-title sf-icon')!.getAttribute('icon'),
    ).to.equal('mdi:campfire');

    document.body.replaceChildren();

    const fallback = makeEl();
    fallback.config = { ...BASE_CONFIG };
    fallback.hass = makeHass('60', '15');
    document.body.appendChild(fallback);
    await fallback.updateComplete;
    expect(
      fallback.shadowRoot!.querySelector('.bridge-section-title sf-icon')!.getAttribute('icon'),
    ).to.equal('sci:stove');
  });

  // ── Low-pellet warning ─────────────────────────────────────────────────────

  it('TC-BRIDGE-U-24: pellet quantity below low_threshold puts the gauges in warning state', async () => {
    const el = makeEl();
    el.config = { ...BASE_CONFIG, low_threshold: 0.3 };
    // Ratio input: 0.2 → 20 %, below the 0.3 threshold.
    el.hass = makeHass('0.2', '3', 'off', 20);
    document.body.appendChild(el);
    await el.updateComplete;

    const circle = el.shadowRoot!.querySelector('sf-circle-progress-bar') as any;
    expect(circle).not.to.be.null;
    expect(circle.val).to.equal(20);
    expect(circle.threshold).to.equal(0.3);
    // The props above are the inputs; the warning STATE is what U-24 is about.
    // Re-deriving `val / 100 < threshold` here only restated the widget's own
    // formula — it stayed green even if the widget stopped rendering warning
    // at all. Assert the rendered class instead.
    await circle.updateComplete;
    expect(circle.shadowRoot!.querySelector('.circular-progress.warning')).not.to.be.null;

    const stack = el.shadowRoot!.querySelector('sf-stack-bar') as any;
    expect(stack.threshold).to.equal(0.3);
    await stack.updateComplete;
    expect(stack.shadowRoot!.querySelector('.warning')).not.to.be.null;
  });

  it('TC-BRIDGE-U-24: pellet quantity above low_threshold leaves BOTH gauges clear', async () => {
    // The counterpart: without it, a widget stuck in permanent warning would
    // satisfy the case above. It has to query sf-stack-bar too — checking only
    // the circle let a permanently-warning stack bar survive, against the
    // amended row that requires neither of the two.
    const el = makeEl();
    el.config = { ...BASE_CONFIG, low_threshold: 0.3 };
    el.hass = makeHass('0.8', '18', 'off', 20);
    document.body.appendChild(el);
    await el.updateComplete;

    const circle = el.shadowRoot!.querySelector('sf-circle-progress-bar') as any;
    expect(circle.val).to.equal(80);
    await circle.updateComplete;
    expect(circle.shadowRoot!.querySelector('.circular-progress.warning')).to.be.null;

    const stack = el.shadowRoot!.querySelector('sf-stack-bar') as any;
    expect(stack.val / stack.max).to.be.greaterThan(stack.threshold);
    await stack.updateComplete;
    expect(stack.shadowRoot!.querySelector('.warning')).to.be.null;
  });
});
