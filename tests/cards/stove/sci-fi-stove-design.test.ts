/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Spec 11 — Stove Card Design Update tests
 * Covers TC-1101 → TC-1111 from docs/specs/11_stove_card_design_update.md
 *
 * RED phase: these tests are written BEFORE implementation.
 * They must fail on the current code and pass after implementation.
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
  friendlyName = 'Poêle Salon'
): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele', ...overrides });
  el.hass = makeMockHass({
    states: {
      'climate.poele': makeMockEntity({
        entity_id: 'climate.poele',
        state,
        attributes: { friendly_name: friendlyName },
      }),
    },
  });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

// ── TC-1101 — Header: sf-icon sci:stove-heat when ON ─────────────────────────

describe('TC-1101 — header icon when ON', () => {
  it('renders sf-icon with sci:stove-heat when state is heating', async () => {
    const el = await mountStove('heating');
    const icon = el.shadowRoot!.querySelector('sf-icon') as any;
    expect(icon?.icon).to.equal('sci:stove-heat');
  });
});

// ── TC-1102 — Header: sf-icon sci:stove-off when OFF ─────────────────────────

describe('TC-1102 — header icon when OFF', () => {
  it('renders sf-icon with sci:stove-off when state is off', async () => {
    const el = await mountStove('off');
    const icon = el.shadowRoot!.querySelector('sf-icon') as any;
    expect(icon?.icon).to.equal('sci:stove-off');
  });
});

// ── TC-1103 — Header: .stove-status.sf-state-on when heating ─────────────────

describe('TC-1103 — stove-status class when ON', () => {
  it('adds sf-state-on class to .stove-status when heating', async () => {
    const el = await mountStove('heating');
    const status = el.shadowRoot!.querySelector('.stove-status');
    expect(status).not.to.be.null;
    expect(status!.classList.contains('sf-state-on')).to.be.true;
  });
});

// ── TC-1104 — Header: .stove-status.sf-state-off when OFF ────────────────────

describe('TC-1104 — stove-status class when OFF', () => {
  it('adds sf-state-off class to .stove-status when off', async () => {
    const el = await mountStove('off');
    const status = el.shadowRoot!.querySelector('.stove-status');
    expect(status).not.to.be.null;
    expect(status!.classList.contains('sf-state-off')).to.be.true;
  });
});

// ── TC-1105 — Header: friendly_name in header-info ───────────────────────────

describe('TC-1105 — friendly_name in header', () => {
  it('displays friendly_name in the .header-info section', async () => {
    const el = await mountStove('heating', {}, 'Poêle Pellet Test');
    const headerInfo = el.shadowRoot!.querySelector('.header-info');
    expect(headerInfo).not.to.be.null;
    expect(headerInfo!.textContent).to.include('Poêle Pellet Test');
  });

  it('falls back to "Poêle" when friendly_name is absent', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({
          entity_id: 'climate.poele',
          state: 'heating',
          attributes: {}, // no friendly_name
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Poêle');
  });
});

// ── TC-1106 — .sensor-tile count = 0 when sensors undefined ──────────────────

describe('TC-1106 — empty sensor grid when no sensors configured', () => {
  it('renders 0 .sensor-tile elements when sensors object is empty', async () => {
    const el = await mountStove('heating', { sensors: {} });
    const tiles = el.shadowRoot!.querySelectorAll('.sensor-tile');
    expect(tiles.length).to.equal(0);
  });
});

// ── TC-1107 — .bar-fill.pellet width matches percentage ──────────────────────

describe('TC-1107 — pellet bar width', () => {
  it('sets .bar-fill.pellet width to the pellet percentage', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_pellet_quantity: 'sensor.pellets' },
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heating' }),
        'sensor.pellets': makeMockEntity({ entity_id: 'sensor.pellets', state: '62' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const bar = el.shadowRoot!.querySelector('.bar-fill.pellet') as HTMLElement;
    expect(bar).not.to.be.null;
    expect(bar.style.width).to.equal('62%');
  });
});

// ── TC-1108 — .sensor-tile.warn when pellets below threshold ─────────────────

describe('TC-1108 — pellet warn tile below threshold', () => {
  it('adds .warn class when pellet level is below threshold', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      sensors: { sensor_pellet_quantity: 'sensor.pellets' },
      pellet_quantity_threshold: 0.5, // 50%
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heating' }),
        'sensor.pellets': makeMockEntity({ entity_id: 'sensor.pellets', state: '20' }), // 20% < 50%
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const warnTile = el.shadowRoot!.querySelector('.sensor-tile.warn');
    expect(warnTile).not.to.be.null;
  });
});

// ── TC-1109 — .bar-fill.storage null when no maximum attr ────────────────────

describe('TC-1109 — no storage bar when maximum absent', () => {
  it('.bar-fill.storage is null when counter has no maximum attribute', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-stove',
      entity: 'climate.poele',
      storage_counter: 'counter.sacs',
    });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heating' }),
        'counter.sacs': makeMockEntity({
          entity_id: 'counter.sacs',
          state: '3',
          attributes: {}, // no maximum
        }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const bar = el.shadowRoot!.querySelector('.bar-fill.storage');
    expect(bar).to.be.null;
  });
});

// ── TC-1110 — header_message renders in .sf-header ───────────────────────────

describe('TC-1110 — header_message in .sf-header', () => {
  it('renders header_message inside .sf-header div', async () => {
    const el = await mountStove('heating', { header_message: 'Mon Poêle' });
    const sfHeader = el.shadowRoot!.querySelector('.sf-header');
    expect(sfHeader).not.to.be.null;
    expect(sfHeader!.textContent).to.include('Mon Poêle');
  });
});

// ── TC-1111 — Error message when entity not found ─────────────────────────────

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
    // Lit CSSResult has a cssText property
    expect(stoveStyles).to.have.property('cssText');
  });
});
