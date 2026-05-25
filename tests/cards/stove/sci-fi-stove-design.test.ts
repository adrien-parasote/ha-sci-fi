/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Spec 11 v2 — Stove Card Full Reconstruction design tests
 * Covers the new tri-zone layout matching the original JS main branch.
 *
 * Preserved contracts (ADR-005):
 *  - .stove-status selector
 *  - .bar-fill.pellet, .bar-fill.storage (CSS only, no DOM in new design)
 *  - error message "Entité poêle non trouvée"
 */
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/stove/sci-fi-stove.js';
import { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

afterEach(() => {
  document.body.replaceChildren();
});

// ── Helper ────────────────────────────────────────────────────────────────────

async function mountStove(
  state: string,
  overrides: Record<string, unknown> = {},
  friendlyName = 'Austroflamm Clou Pellet'
): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele', ...overrides });
  el.hass = makeMockHass({
    states: {
      'climate.poele': makeMockEntity({
        entity_id: 'climate.poele',
        state,
        attributes: {
          friendly_name: friendlyName,
          hvac_modes: ['off', 'heat'],
          preset_modes: ['none', 'eco'],
          preset_mode: 'none',
          temperature: 20,
          min_temp: 15,
          max_temp: 30,
        },
      }),
    },
  });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

// ── TC-1101 — .header contains friendly_name ──────────────────────────────────

describe('TC-1101 — header with friendly_name', () => {
  it('renders .header with the stove friendly_name', async () => {
    const el = await mountStove('off', {}, 'Austroflamm Clou Pellet');
    const header = el.shadowRoot!.querySelector('.header');
    expect(header).not.to.be.null;
    expect(header!.textContent!.trim()).to.include('Austroflamm Clou Pellet');
  });
});

// ── TC-1102 — sf-stove-image state = heat ────────────────────────────────────

describe('TC-1102 — sf-stove-image state binding', () => {
  it('passes state=heat to sf-stove-image when state is heat', async () => {
    const el = await mountStove('heat');
    const img = el.shadowRoot!.querySelector('sf-stove-image') as any;
    expect(img).not.to.be.null;
    expect(img.state).to.equal('heat');
  });

  it('passes state=off to sf-stove-image when state is off', async () => {
    const el = await mountStove('off');
    const img = el.shadowRoot!.querySelector('sf-stove-image') as any;
    expect(img).not.to.be.null;
    expect(img.state).to.equal('off');
  });
});

// ── TC-1103 — .stove-status selector exists ───────────────────────────────────

describe('TC-1103 — .stove-status selector', () => {
  it('renders .stove-status element with status text', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_status: 'sensor.status' },
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'off', attributes: { hvac_modes: [] } }),
        'sensor.status': makeMockEntity({ entity_id: 'sensor.status', state: 'off' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    // ADR-005: .stove-status MUST exist
    const statusEl = el.shadowRoot!.querySelector('.stove-status');
    expect(statusEl).not.to.be.null;
  });
});

// ── TC-1104 — .content tri-zones present ─────────────────────────────────────

describe('TC-1104 — content tri-zones', () => {
  it('renders .e.bottom-path (quantities zone)', async () => {
    const el = await mountStove('off');
    expect(el.shadowRoot!.querySelector('.e.bottom-path')).not.to.be.null;
  });

  it('renders .m (middle/temperatures zone)', async () => {
    const el = await mountStove('off');
    expect(el.shadowRoot!.querySelector('.m')).not.to.be.null;
  });

  it('renders .e.top-path (powers zone)', async () => {
    const el = await mountStove('off');
    expect(el.shadowRoot!.querySelector('.e.top-path')).not.to.be.null;
  });
});

// ── TC-1105 — sf-circle-progress-bar for pellets ─────────────────────────────

describe('TC-1105 — sf-circle-progress-bar for pellet quantity', () => {
  it('renders sf-circle-progress-bar with correct val', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_pellet_quantity: 'sensor.pellets' },
      pellet_quantity_threshold: 0.1,
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: [] } }),
        'sensor.pellets': makeMockEntity({ entity_id: 'sensor.pellets', state: '81' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const gauge = el.shadowRoot!.querySelector('sf-circle-progress-bar') as any;
    expect(gauge).not.to.be.null;
    expect(gauge.val).to.equal(81);
  });

  it('does not render sf-circle-progress-bar when state is NaN', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_pellet_quantity: 'sensor.pellets' },
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: [] } }),
        'sensor.pellets': makeMockEntity({ entity_id: 'sensor.pellets', state: 'unavailable' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('sf-circle-progress-bar')).to.be.null;
  });
});

// ── TC-1106 — sf-stack-bar for storage ───────────────────────────────────────

describe('TC-1106 — sf-stack-bar for storage_counter', () => {
  it('renders sf-stack-bar with val and max', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      storage_counter: 'counter.sacs',
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: [] } }),
        'counter.sacs': makeMockEntity({ entity_id: 'counter.sacs', state: '5', attributes: { maximum: 20 } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const bar = el.shadowRoot!.querySelector('sf-stack-bar') as any;
    expect(bar).not.to.be.null;
    expect(bar.val).to.equal(5);
    expect(bar.max).to.equal(20);
  });

  it('does not render sf-stack-bar when no storage_counter config', async () => {
    const el = await mountStove('heat', {}); // no storage_counter
    expect(el.shadowRoot!.querySelector('sf-stack-bar')).to.be.null;
  });
});

// ── TC-1107 — .bottom interactive section ─────────────────────────────────────

describe('TC-1107 — .bottom interactive section', () => {
  it('renders sf-wheel for temperature control', async () => {
    const el = await mountStove('off');
    expect(el.shadowRoot!.querySelector('sf-wheel')).not.to.be.null;
  });

  it('renders 2 sf-button-card-select (hvac + preset)', async () => {
    const el = await mountStove('off');
    const selects = el.shadowRoot!.querySelectorAll('sf-button-card-select');
    expect(selects.length).to.equal(2);
  });
});

// ── TC-1109 — .bar-fill.storage null when no maximum ─────────────────────────

describe('TC-1109 — no .bar-fill.storage when maximum absent', () => {
  it('.bar-fill.storage is null when counter has no maximum attribute', async () => {
    // new layout uses sf-stack-bar; .bar-fill.storage is a CSS class only, not in DOM
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      storage_counter: 'counter.sacs',
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: [] } }),
        'counter.sacs': makeMockEntity({ entity_id: 'counter.sacs', state: '3', attributes: {} }), // no maximum
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    // .bar-fill.storage is not in the new DOM (replaced by sf-stack-bar)
    expect(el.shadowRoot!.querySelector('.bar-fill.storage')).to.be.null;
  });
});

// ── TC-1111 — error message when entity missing ────────────────────────────────

describe('TC-1111 — error message when entity missing', () => {
  it('shows "Entité poêle non trouvée" when entity is absent from hass', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.missing_stove' });
    el.hass = makeMockHass(); // empty states — entity not present
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Entité poêle non trouvée');
  });
});

// ── TC-1113 — styles.ts exports stoveStyles ──────────────────────────────────

describe('TC-1113 — styles.ts exports stoveStyles', () => {
  it('stoveStyles is a valid Lit CSSResult object', async () => {
    const { stoveStyles } = await import('../../../src/cards/stove/styles.js');
    expect(stoveStyles).to.be.an('object');
    expect(stoveStyles).to.have.property('cssText');
  });
});
