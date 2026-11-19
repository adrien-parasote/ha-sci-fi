// @vitest-environment happy-dom
/**
 * Hexa tiles quick actions — card behaviour.
 * Spec: docs/specs/hexa-tiles-quick-actions/spec.md (FR-1..FR-10, Test Case Specifications).
 *
 * Every expected string is the English source (locale forced to `en`): the
 * French catalogue is checked by TC-HQA-U-16.
 */
import { expect, describe, it, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import type { SciFiHexaTilesCard } from '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import {
  HOLD_MS,
  MOVE_TOLERANCE_PX,
  DOUBLE_TAP_MS,
  resolvePendingTimeoutMs,
} from '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';
import type { HassEntity } from '../../../src/types/ha.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

type Tile = Record<string, unknown>;
type StateSpec = string | { state: string; attributes?: Record<string, unknown> };
type States = Record<string, StateSpec>;
interface HassActionDetail { action: string; config: Record<string, unknown> & { tap_action?: unknown; hold_action?: unknown } }

/** The target config of the frame (spec § Config cible). */
const PORTAIL: Tile = {
  standalone: true,
  entity: 'cover.portail',
  name: 'Portail',
  tap_action: { action: 'toggle' },
  states: {
    closed: { color: 'var(--sf-accent-on)', icon: 'mdi:gate', label: 'Fermé' },
    open: { color: 'var(--sf-error)', icon: 'mdi:gate-open', label: 'Ouvert' },
  },
};
const LIGHT: Tile = {
  standalone: true,
  entity: 'light.zbmini_l_dressing_parent',
  name: 'Lumière',
  subtitle: 'Chambre parents',
  tap_action: { action: 'toggle' },
  states: {
    on: { color: 'var(--sf-warning)', icon: 'mdi:lightbulb-on' },
    off: { icon: 'mdi:lightbulb-outline' },
  },
};
/** Production config of hexa-tiles.md (the one TC-HQA-U-09's snapshot was recorded on). */
const CLOU: Tile = {
  standalone: true, entity: 'climate.clou', active_icon: 'sci:stove-heat', inactive_icon: 'sci:stove-off',
  name: 'Poêle', state_on: ['cool', 'heat'], link: 'stove',
};
const AGG: Tile = {
  standalone: false, entity_kind: 'light', name: 'Lumières', link: 'lights',
  active_icon: 'mdi:lightbulb-group', inactive_icon: 'mdi:lightbulb-group-off',
};
const GATE_ATTRS = { device_class: 'gate', supported_features: 3 };

interface Snap { outer: string; inner: string; icon: string }
const SNAPSHOT = JSON.parse(
  readFileSync(join(process.cwd(), 'tests/cards/hexa-tiles/fixtures/pre-lot-snapshot.json'), 'utf8'),
) as Record<string, Snap>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hassOf(states: States, language = 'en') {
  const s: Record<string, HassEntity> = {};
  for (const [id, v] of Object.entries(states)) {
    const { state, attributes } = typeof v === 'string' ? { state: v, attributes: {} } : v;
    s[id] = makeMockEntity({ entity_id: id, state, attributes: attributes ?? {} });
  }
  return makeMockHass({ states: s, language });
}

interface Mounted { el: SciFiHexaTilesCard; actions: Mock<(d: HassActionDetail) => void> }

async function mount(tiles: Tile[], states: States, extra: Record<string, unknown> = {}, language = 'en'): Promise<Mounted> {
  const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
  el.setConfig({ type: 'custom:sci-fi-hexa-tiles', tiles, ...extra } as never);
  el.hass = hassOf(states, language);
  const actions = vi.fn<(d: HassActionDetail) => void>();
  el.addEventListener('hass-action', (e) => actions((e as CustomEvent<HassActionDetail>).detail));
  document.body.appendChild(el);
  await el.updateComplete;
  return { el, actions };
}

async function setStates(el: SciFiHexaTilesCard, states: States): Promise<void> {
  el.hass = hassOf(states);
  await el.updateComplete;
}

async function advance(el: SciFiHexaTilesCard, ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
  await el.updateComplete;
}

/** Custom tiles only (role="button"), in render order — the weather tile and empty slots excluded. */
function tilesOf(el: SciFiHexaTilesCard): HTMLElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.hexa-tile[role="button"]'));
}
const tile0 = (el: SciFiHexaTilesCard): HTMLElement => tilesOf(el)[0]!;

const iconOf = (t: Element): string =>
  (t.querySelector('.hexa-content > sf-icon:not(.tile-mark)') as unknown as { icon: string }).icon;
const subtitleOf = (t: Element): string | null => t.querySelector('.tile-subtitle')?.textContent?.trim() ?? null;
const colorOf = (t: HTMLElement): string => t.style.getPropertyValue('--sf-tile-state-color').trim();
const marksOf = (t: Element): Array<{ icon: string }> =>
  Array.from(t.querySelectorAll('.tile-mark')) as unknown as Array<{ icon: string }>;
/**
 * FR-2 normalisation: Lit comment markers removed, whitespace runs collapsed — and the
 * light-DOM content `<sf-icon>` draws for itself emptied. That content depends on whether
 * the sf-icon element is registered in the run (the pre-lot card did not import it, the
 * recorder saw it empty), not on the tile markup; the icon is compared by its `.icon`.
 */
const norm = (s: string): string => s
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<sf-icon([^>]*)>[\s\S]*?<\/sf-icon>/g, '<sf-icon$1></sf-icon>')
  .replace(/\s+/g, ' ')
  .trim();

function spyToast(el: SciFiHexaTilesCard): Mock {
  const toast = el.shadowRoot!.querySelector('sf-toast') as unknown as { addMessage: (t: string, e: boolean) => void };
  expect(toast, 'the card renders one sf-toast').not.toBeNull();
  return vi.spyOn(toast, 'addMessage').mockImplementation(() => undefined) as unknown as Mock;
}

function pointer(t: HTMLElement, type: string, x = 0, y = 0): PointerEvent {
  const ev = new PointerEvent(type, { bubbles: true, composed: true, cancelable: true, button: 0, clientX: x, clientY: y, pointerId: 1 });
  t.dispatchEvent(ev);
  return ev;
}
function key(t: HTMLElement, k: string, repeat = false): KeyboardEvent {
  const ev = new KeyboardEvent('keydown', { key: k, repeat, bubbles: true, composed: true, cancelable: true });
  t.dispatchEvent(ev);
  return ev;
}
/** A real finger tap: pointerdown, pointerup, click. */
function fingerTap(t: HTMLElement): void {
  pointer(t, 'pointerdown');
  pointer(t, 'pointerup');
  t.click();
}
async function hold(el: SciFiHexaTilesCard, t: HTMLElement): Promise<void> {
  pointer(t, 'pointerdown');
  await advance(el, HOLD_MS);
  pointer(t, 'pointerup');
}

const ofAction = (actions: Mounted['actions'], action: string): HassActionDetail[] =>
  actions.mock.calls.map(c => c[0]).filter(d => d.action === action);

/** Stubs window navigation the way the pre-lot suite does (sci-fi-hexa-tiles.test.ts, TC-501). */
function stubNavigation(): { pushState: Mock; dispatched: string[] } {
  const pushState = vi.fn();
  const dispatched: string[] = [];
  vi.stubGlobal('window', {
    ...window,
    history: { pushState },
    dispatchEvent: (e: Event) => { dispatched.push(e.type); return true; },
    location: window.location,
    open: vi.fn(),
  });
  return { pushState, dispatched };
}

/** A parent that plays HA: on a toggle it re-assigns hass with the inverse state 3 s later (IT-HQA-I-01/02). */
function haSimulator(el: SciFiHexaTilesCard, states: Record<string, string>, opts: { mute?: boolean } = {}): void {
  const parent = document.createElement('div');
  el.replaceWith(parent);
  parent.appendChild(el);
  parent.addEventListener('hass-action', (e) => {
    const d = (e as CustomEvent<HassActionDetail>).detail;
    const conf = d.action === 'hold' ? d.config.hold_action : d.config.tap_action;
    const entity = d.config.entity as string | undefined;
    if (opts.mute || !entity || (conf as { action?: string } | undefined)?.action !== 'toggle') return;
    setTimeout(() => {
      const cur = states[entity];
      states[entity] = cur === 'closed' ? 'open' : cur === 'open' ? 'closed' : cur === 'on' ? 'off' : 'on';
      el.hass = hassOf(states);
    }, 3000);
  });
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('sci-fi-hexa-tiles quick actions', () => {
  beforeEach(async () => {
    await setLocale('en');
    vi.stubGlobal('innerWidth', 375);
    vi.stubGlobal('innerHeight', 812);
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.unstubAllGlobals(); // first: a stubbed window (stubNavigation) has no removeEventListener for the teardown
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.restoreAllMocks();
    await setLocale('fr');
  });

  it('TC-HQA-U-01: per-state colour, icon and second line follow hass; an unmatched state renders as before', async () => {
    const { el } = await mount([PORTAIL], { 'cover.portail': { state: 'closed', attributes: GATE_ATTRS } });
    let t = tile0(el);
    expect(t.getAttribute('data-state-color')).toBe('true');
    expect(t.getAttribute('style')).toContain('--sf-tile-state-color');
    expect(colorOf(t)).toBe('var(--sf-accent-on)');
    expect(iconOf(t)).toBe('mdi:gate');
    expect(subtitleOf(t)).toBe('Fermé');

    await setStates(el, { 'cover.portail': { state: 'open', attributes: GATE_ATTRS } });
    t = tile0(el);
    expect(colorOf(t)).toBe('var(--sf-error)');
    expect(iconOf(t)).toBe('mdi:gate-open');
    expect(subtitleOf(t)).toBe('Ouvert');

    await setStates(el, { 'cover.portail': { state: 'opening', attributes: GATE_ATTRS } });
    t = tile0(el);
    expect(t.hasAttribute('data-state-color')).toBe(false);
    expect(colorOf(t)).toBe('');
    expect(iconOf(t)).toBe('mdi:toggle-switch'); // the icon computed before the lot (cover, inactive, no attribute icon)
    expect(t.querySelector('.tile-subtitle')).toBeNull();
  });

  it('TC-HQA-U-02: the second line is label, else subtitle, else absent; a hostile colour stays inside the custom property', async () => {
    const lightOn = { 'light.zbmini_l_dressing_parent': 'on' };
    let { el } = await mount([{ ...LIGHT }], lightOn);
    let sub = tile0(el).querySelector('.tile-subtitle')!;
    expect(sub.textContent!.trim()).toBe('Chambre parents');
    expect(sub.getAttribute('title')).toBe('Chambre parents');
    el.remove();

    ({ el } = await mount([{ ...LIGHT, states: { on: { color: 'var(--sf-warning)', label: 'Allumée' } } }], lightOn));
    sub = tile0(el).querySelector('.tile-subtitle')!;
    expect(sub.textContent!.trim()).toBe('Allumée');
    expect(sub.getAttribute('title')).toBe('Allumée');
    el.remove();

    ({ el } = await mount([{ standalone: true, entity: 'light.zbmini_l_dressing_parent', name: 'Lumière' }], lightOn));
    expect(tile0(el).querySelector('.tile-subtitle')).toBeNull();
    el.remove();

    ({ el } = await mount([{ ...LIGHT, states: { on: { color: 'red;background:url(x)' } } }], lightOn));
    const t = tile0(el);
    const value = t.style.getPropertyValue('--sf-tile-state-color');
    const attr = t.getAttribute('style') ?? '';
    expect(attr.replace(value, '')).not.toContain('background:');
  });

  it('TC-HQA-U-03: a toggle tap emits one hass-action with the tile config, no confirmation, and starts pending', async () => {
    const { el, actions } = await mount([LIGHT], { 'light.zbmini_l_dressing_parent': 'off' });
    tile0(el).click();
    await el.updateComplete;
    expect(actions).toHaveBeenCalledTimes(1);
    const d = actions.mock.calls[0]![0];
    expect(d.action).toBe('tap');
    expect(d.config.entity).toBe('light.zbmini_l_dressing_parent');
    expect(d.config.tap_action).toEqual({ action: 'toggle' });
    expect(Object.keys(d.config)).not.toContain('confirmation');
    expect(el.shadowRoot!.querySelector('dialog, [role="dialog"], [role="alertdialog"]')).toBeNull();
    expect(tile0(el).getAttribute('data-pending')).toBe('true');
  });

  it('TC-HQA-U-04: pending is announced, a second tap during pending still emits, a state change ends it on the new state', async () => {
    const { el, actions } = await mount([PORTAIL], { 'cover.portail': { state: 'closed', attributes: GATE_ATTRS } });
    tile0(el).click();
    await el.updateComplete;
    let t = tile0(el);
    expect(t.getAttribute('data-pending')).toBe('true');
    expect(t.getAttribute('aria-busy')).toBe('true');
    expect(t.getAttribute('aria-label')).toBe('Portail, Pending');

    await advance(el, 1000);
    tile0(el).click();
    await el.updateComplete;
    expect(actions).toHaveBeenCalledTimes(2);
    expect(tile0(el).getAttribute('data-pending')).toBe('true');

    await advance(el, 7000);
    await setStates(el, { 'cover.portail': { state: 'open', attributes: GATE_ATTRS } });
    t = tile0(el);
    expect(t.hasAttribute('data-pending')).toBe(false);
    expect(t.hasAttribute('aria-busy')).toBe(false);
    expect(t.hasAttribute('data-no-change')).toBe(false);
    expect(colorOf(t)).toBe('var(--sf-error)');
    expect(iconOf(t)).toBe('mdi:gate-open');
  });

  it('TC-HQA-U-05: the no-change mark lands at the timeout, not one ms before, with one toast and the unchanged colour', async () => {
    const { el } = await mount([PORTAIL], { 'cover.portail': { state: 'closed', attributes: GATE_ATTRS } });
    const toast = spyToast(el);
    tile0(el).click();
    await advance(el, 29_999);
    expect(tile0(el).getAttribute('data-pending')).toBe('true');
    expect(tile0(el).hasAttribute('data-no-change')).toBe(false);

    await advance(el, 1);
    const t = tile0(el);
    expect(t.getAttribute('data-no-change')).toBe('true');
    expect(t.hasAttribute('data-pending')).toBe(false);
    expect(marksOf(t).map(m => m.icon)).toEqual(['mdi:alert-circle-outline']);
    expect(t.getAttribute('aria-label')).toBe('Portail, No change');
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('Portail : No change', true);
    expect(colorOf(t)).toBe('var(--sf-accent-on)');
    expect(colorOf(t)).not.toBe('var(--sf-error)');

    await setStates(el, { 'cover.portail': { state: 'open', attributes: GATE_ATTRS } });
    expect(tile0(el).hasAttribute('data-no-change')).toBe(false);
    expect(marksOf(tile0(el))).toHaveLength(0);
  });

  it('TC-HQA-U-05: pending_timeout 5 marks at 5 000 ms, not at 4 999 ms; 86400 marks at 86 400 000 ms only', async () => {
    let { el } = await mount([{ ...PORTAIL, pending_timeout: 5 }], { 'cover.portail': 'closed' });
    tile0(el).click();
    await advance(el, 4_999);
    expect(tile0(el).hasAttribute('data-no-change')).toBe(false);
    await advance(el, 1);
    expect(tile0(el).getAttribute('data-no-change')).toBe('true');
    el.remove();

    ({ el } = await mount([{ ...PORTAIL, pending_timeout: 86_400 }], { 'cover.portail': 'closed' }));
    tile0(el).click();
    await advance(el, 30_000);
    expect(tile0(el).hasAttribute('data-no-change')).toBe(false);
    await advance(el, 86_399_999 - 30_000);
    expect(tile0(el).hasAttribute('data-no-change')).toBe(false);
    await advance(el, 1);
    expect(tile0(el).getAttribute('data-no-change')).toBe('true');
  });

  it('TC-HQA-U-05: an out-of-range or non-numeric pending_timeout falls back to 30 s', async () => {
    for (const v of [0, -1, 'x', 86_401, 1e9]) {
      const { el } = await mount([{ ...PORTAIL, pending_timeout: v }], { 'cover.portail': 'closed' });
      tile0(el).click();
      await advance(el, 29_999);
      expect(tile0(el).hasAttribute('data-no-change'), `pending_timeout ${String(v)} at 29 999 ms`).toBe(false);
      await advance(el, 1);
      expect(tile0(el).getAttribute('data-no-change'), `pending_timeout ${String(v)} at 30 000 ms`).toBe('true');
      el.remove();
    }
    const rows: Array<[unknown, number]> = [
      [undefined, 30_000], [5, 5_000], [0, 30_000], [-1, 30_000], ['x', 30_000],
      [86_401, 30_000], [1e9, 30_000], [86_400, 86_400_000], [Number.NaN, 30_000], [Infinity, 30_000],
    ];
    for (const [v, ms] of rows) expect(resolvePendingTimeoutMs(v), String(v)).toBe(ms);
  });

  describe('TC-HQA-U-06: hold', () => {
    const tile = { ...LIGHT };
    const off = { 'light.zbmini_l_dressing_parent': 'off' };

    it('TC-HQA-U-06: HOLD_MS is 500 and MOVE_TOLERANCE_PX is 10', () => {
      expect(HOLD_MS).toBe(500);
      expect(MOVE_TOLERANCE_PX).toBe(10);
    });

    it('TC-HQA-U-06: a 500 ms hold without hold_action opens more-info, and the click that follows emits nothing', async () => {
      const { el, actions } = await mount([tile], off);
      const t = tile0(el);
      pointer(t, 'pointerdown');
      await advance(el, 499);
      expect(actions).not.toHaveBeenCalled();
      await advance(el, 1);
      expect(actions).toHaveBeenCalledTimes(1);
      expect(actions.mock.calls[0]![0]).toEqual({
        action: 'tap',
        config: { entity: 'light.zbmini_l_dressing_parent', tap_action: { action: 'more-info' } },
      });
      pointer(t, 'pointerup');
      t.click();
      expect(actions).toHaveBeenCalledTimes(1);
      expect(actions.mock.calls.some(c => (c[0].config.tap_action as { action: string }).action === 'toggle')).toBe(false);
    });

    it('TC-HQA-U-06: released at 499 ms there is no hold and the click taps', async () => {
      const { el, actions } = await mount([tile], off);
      const t = tile0(el);
      pointer(t, 'pointerdown');
      await advance(el, 499);
      pointer(t, 'pointerup');
      t.click();
      await advance(el, 1000);
      expect(actions).toHaveBeenCalledTimes(1);
      expect(actions.mock.calls[0]![0].action).toBe('tap');
      expect(actions.mock.calls[0]![0].config.tap_action).toEqual({ action: 'toggle' });
    });

    it('TC-HQA-U-06: a move beyond 10 px cancels the hold and swallows the click', async () => {
      const { el, actions } = await mount([tile], off);
      const t = tile0(el);
      pointer(t, 'pointerdown', 0, 0);
      await advance(el, 200);
      pointer(t, 'pointermove', 11, 0);
      await advance(el, 300);
      pointer(t, 'pointerup', 11, 0);
      t.click();
      await advance(el, 1000);
      expect(actions).not.toHaveBeenCalled();
    });

    it('TC-HQA-U-06: a move within 10 px keeps the hold', async () => {
      const { el, actions } = await mount([tile], off);
      const t = tile0(el);
      pointer(t, 'pointerdown', 0, 0);
      pointer(t, 'pointermove', 6, 8); // exactly 10 px away
      await advance(el, 500);
      expect(actions).toHaveBeenCalledTimes(1);
    });

    it('TC-HQA-U-06: hold_action navigate emits a hold with the tile config; hold_action none emits nothing', async () => {
      const nav = { ...tile, hold_action: { action: 'navigate', navigation_path: '/x' } };
      let { el, actions } = await mount([nav], off);
      pointer(tile0(el), 'pointerdown');
      await advance(el, 500);
      expect(actions).toHaveBeenCalledTimes(1);
      expect(actions.mock.calls[0]![0].action).toBe('hold');
      expect(actions.mock.calls[0]![0].config).toEqual(nav);
      el.remove();

      ({ el, actions } = await mount([{ ...tile, hold_action: { action: 'none' } }], off));
      pointer(tile0(el), 'pointerdown');
      await advance(el, 1000);
      expect(actions).not.toHaveBeenCalled();
    });

    it('TC-HQA-U-06: contextmenu is prevented on a custom tile', async () => {
      const { el } = await mount([tile], off);
      const ev = new MouseEvent('contextmenu', { bubbles: true, composed: true, cancelable: true });
      tile0(el).dispatchEvent(ev);
      expect(ev.defaultPrevented).toBe(true);
    });

    it('TC-HQA-U-06: a stale ignore flag is cleared by the next pointerdown; pointercancel swallows the click; the keyboard ignores the flag', async () => {
      let { el, actions } = await mount([tile], off);
      let t = tile0(el);
      pointer(t, 'pointerdown');
      await advance(el, 500); // hold fires: more-info
      pointer(t, 'pointercancel'); // no click follows
      fingerTap(t);
      await el.updateComplete;
      expect(ofAction(actions, 'tap').filter(d => (d.config.tap_action as { action: string }).action === 'toggle')).toHaveLength(1);
      el.remove();

      ({ el, actions } = await mount([tile], off));
      t = tile0(el);
      pointer(t, 'pointerdown');
      pointer(t, 'pointercancel');
      t.click();
      await advance(el, 1000);
      expect(actions).not.toHaveBeenCalled();
      el.remove();

      ({ el, actions } = await mount([tile], off));
      t = tile0(el);
      pointer(t, 'pointerdown');
      await advance(el, 500); // hold fires, no click
      expect(actions).toHaveBeenCalledTimes(1);
      key(t, 'Enter');
      expect(actions).toHaveBeenCalledTimes(2);
      expect(actions.mock.calls[1]![0].config.tap_action).toEqual({ action: 'toggle' });
    });
  });

  describe('TC-HQA-U-07: double tap', () => {
    const dbl = (entity: string): Tile => ({ standalone: true, entity, name: entity, double_tap_action: { action: 'more-info' } });
    const on = { 'light.a': 'on', 'light.b': 'on' };

    it('TC-HQA-U-07: DOUBLE_TAP_MS is 250; two clicks 100 ms apart emit one double_tap and no tap', async () => {
      expect(DOUBLE_TAP_MS).toBe(250);
      const { el, actions } = await mount([dbl('light.a')], on);
      tile0(el).click();
      await advance(el, 100);
      tile0(el).click();
      await advance(el, 1000);
      expect(actions).toHaveBeenCalledTimes(1);
      expect(actions.mock.calls[0]![0].action).toBe('double_tap');
    });

    it('TC-HQA-U-07: a single click taps at the end of the window; without double_tap_action it taps at once', async () => {
      let { el, actions } = await mount([dbl('light.a')], on);
      tile0(el).click();
      await advance(el, 249);
      expect(actions).not.toHaveBeenCalled();
      await advance(el, 1);
      expect(ofAction(actions, 'tap')).toHaveLength(1);
      el.remove();

      ({ el, actions } = await mount([{ standalone: true, entity: 'light.a', name: 'A' }], on));
      tile0(el).click();
      expect(ofAction(actions, 'tap')).toHaveLength(1);
    });

    it('TC-HQA-U-07: windows are per tile — A at 0, B at 100 ms tap at 250 and 350 ms', async () => {
      const { el, actions } = await mount([dbl('light.a'), dbl('light.b')], on);
      const [a, b] = tilesOf(el);
      a!.click();
      await advance(el, 100);
      b!.click();
      await advance(el, 149);
      expect(actions).not.toHaveBeenCalled();
      await advance(el, 1);
      expect(actions).toHaveBeenCalledTimes(1);
      expect(actions.mock.calls[0]![0]).toMatchObject({ action: 'tap', config: { entity: 'light.a' } });
      await advance(el, 99);
      expect(actions).toHaveBeenCalledTimes(1);
      await advance(el, 1);
      expect(actions).toHaveBeenCalledTimes(2);
      expect(actions.mock.calls[1]![0]).toMatchObject({ action: 'tap', config: { entity: 'light.b' } });
      expect(ofAction(actions, 'double_tap')).toHaveLength(0);
    });
  });

  describe('TC-HQA-U-08: error tiles', () => {
    it('TC-HQA-U-08: unavailable renders the error mark, mutes tap and double tap with a toast, and hold opens more-info', async () => {
      const tile = {
        ...PORTAIL,
        double_tap_action: { action: 'toggle' },
        states: { ...(PORTAIL.states as object), unavailable: { color: 'red', label: 'X', icon: 'mdi:x' } },
      };
      const { el, actions } = await mount([tile], { 'cover.portail': 'unavailable' });
      const toast = spyToast(el);
      const t = tile0(el);
      expect(t.getAttribute('data-error')).toBe('true');
      expect(t.hasAttribute('data-state-color')).toBe(false);
      expect(colorOf(t)).toBe('');
      expect(marksOf(t).map(m => m.icon)).toEqual(['mdi:alert-octagon-outline']);
      expect(subtitleOf(t)).toBe('Unavailable');
      expect(t.getAttribute('aria-label')).toBe('Portail, Unavailable');
      expect(iconOf(t)).not.toBe('mdi:x'); // states.unavailable ignored

      t.click();
      await advance(el, 250);
      expect(actions).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledTimes(1);
      expect(toast).toHaveBeenLastCalledWith('Portail : Unavailable', true);

      tile0(el).click();
      await advance(el, 100);
      tile0(el).click();
      await advance(el, 500);
      expect(actions).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledTimes(2);
      expect(toast).toHaveBeenLastCalledWith('Portail : Unavailable', true);

      await hold(el, tile0(el));
      expect(actions).toHaveBeenCalledTimes(1);
      expect(actions.mock.calls[0]![0]).toEqual({
        action: 'tap',
        config: { entity: 'cover.portail', tap_action: { action: 'more-info' } },
      });
      expect(toast).toHaveBeenCalledTimes(2);
    });

    it('TC-HQA-U-08: a hold on an unavailable entity opens more-info even with a toggle hold_action, and starts no pending', async () => {
      const { el, actions } = await mount(
        [{ ...PORTAIL, hold_action: { action: 'toggle' } }],
        { 'cover.portail': 'unavailable' },
      );
      const toast = spyToast(el);
      await hold(el, tile0(el));
      expect(actions).toHaveBeenCalledTimes(1);
      expect(actions.mock.calls[0]![0]).toEqual({
        action: 'tap',
        config: { entity: 'cover.portail', tap_action: { action: 'more-info' } },
      });
      expect(ofAction(actions, 'hold')).toHaveLength(0);
      expect(tile0(el).hasAttribute('data-pending')).toBe(false);
      await advance(el, 30_000);
      expect(toast).not.toHaveBeenCalled();
      expect(tile0(el).hasAttribute('data-no-change')).toBe(false);
    });

    it('TC-HQA-U-08: an absent entity renders the error mark and emits nothing, even on hold; its tap toasts', async () => {
      const { el, actions } = await mount(
        [{ standalone: true, entity: 'cover.absent', tap_action: { action: 'toggle' } }, PORTAIL],
        { 'cover.portail': 'closed' },
      );
      const toast = spyToast(el);
      const t = tile0(el);
      expect(t.getAttribute('data-error')).toBe('true');
      expect(marksOf(t)).toHaveLength(1);
      expect(subtitleOf(t)).toBe('Unavailable');
      t.click();
      await hold(el, tile0(el));
      tile0(el).click();
      await advance(el, 1000);
      expect(actions).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith('cover.absent : Unavailable', true);
    });

    it('TC-HQA-U-08: a state equal to state_error renders the error mark and still taps', async () => {
      const { el, actions } = await mount(
        [{ standalone: true, entity: 'vacuum.x', name: 'Dobby', state_error: 'error' }],
        { 'vacuum.x': 'error' },
      );
      const t = tile0(el);
      expect(t.getAttribute('data-error')).toBe('true');
      expect(marksOf(t)).toHaveLength(1);
      t.click();
      expect(ofAction(actions, 'tap')).toHaveLength(1);
    });

    it('TC-HQA-U-08: in error at the timeout a tile carries a single mark, the error one', async () => {
      const { el } = await mount([{ ...PORTAIL, state_error: 'closed' }], { 'cover.portail': 'closed' });
      spyToast(el);
      tile0(el).click();
      await advance(el, 30_000);
      expect(marksOf(tile0(el)).map(m => m.icon)).toEqual(['mdi:alert-octagon-outline']);
    });
  });

  it('TC-HQA-U-09: a pre-lot production tile renders the recorded snapshot and still navigates', async () => {
    const { el, actions } = await mount([CLOU], { 'climate.clou': 'heat' });
    for (const st of ['heat', 'off']) {
      await setStates(el, { 'climate.clou': st });
      const t = tile0(el);
      const snap = SNAPSHOT[`clou_${st}`]!;
      expect(norm(t.innerHTML), `innerHTML in ${st}`).toBe(snap.inner);
      expect(iconOf(t)).toBe(snap.icon);
      const before = document.createElement('template');
      before.innerHTML = snap.outer;
      expect(t.getAttributeNames().sort(), `attributes in ${st}`).toEqual(before.content.firstElementChild!.getAttributeNames().sort());
      for (const name of t.getAttributeNames()) {
        expect(t.getAttribute(name)).toBe(before.content.firstElementChild!.getAttribute(name));
      }
    }
    const nav = stubNavigation();
    tile0(el).click();
    expect(nav.pushState).toHaveBeenCalledWith(null, '', 'stove');
    expect(nav.dispatched).toContain('location-changed');
    expect(actions).not.toHaveBeenCalled();
  });

  it('TC-HQA-U-10: Enter and Space tap with preventDefault; other keys and repeats do nothing; the keyboard never waits for a double tap', async () => {
    let { el, actions } = await mount([{ standalone: true, entity: 'light.a', name: 'A', tap_action: { action: 'more-info' } }], { 'light.a': 'on' });
    const t = tile0(el);
    const enter = key(t, 'Enter');
    expect(enter.defaultPrevented).toBe(true);
    expect(ofAction(actions, 'tap')).toHaveLength(1);
    const space = key(t, ' ');
    expect(space.defaultPrevented).toBe(true);
    expect(ofAction(actions, 'tap')).toHaveLength(2);
    key(t, 'a');
    key(t, 'Enter', true);
    await advance(el, 1000);
    expect(actions).toHaveBeenCalledTimes(2);
    el.remove();

    ({ el, actions } = await mount([{ standalone: true, entity: 'light.a', name: 'A', double_tap_action: { action: 'more-info' } }], { 'light.a': 'on' }));
    key(tile0(el), 'Enter');
    expect(ofAction(actions, 'tap')).toHaveLength(1);
  });

  it('TC-HQA-U-11: a perform-action tap is passed through untouched and never starts pending', async () => {
    const tap = { action: 'perform-action', perform_action: 'script.x', data: { a: 1 } };
    const { el, actions } = await mount([{ standalone: true, entity: 'light.a', name: 'A', tap_action: tap }], { 'light.a': 'on' });
    tile0(el).click();
    await el.updateComplete;
    expect(actions).toHaveBeenCalledTimes(1);
    expect(actions.mock.calls[0]![0].config.tap_action).toEqual(tap);
    expect(tile0(el).hasAttribute('data-pending')).toBe(false);
    await advance(el, 60_000);
    expect(tile0(el).hasAttribute('data-pending')).toBe(false);
    expect(tile0(el).hasAttribute('data-no-change')).toBe(false);
  });

  it('TC-HQA-U-12: disconnecting cancels every timer and clears pending; interrupted double tap and hold emit nothing', async () => {
    const closed = { 'cover.portail': 'closed' };
    let { el, actions } = await mount([PORTAIL], closed);
    tile0(el).click();
    await advance(el, 1000);
    el.remove();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(60_000);
    document.body.appendChild(el);
    await el.updateComplete;
    expect(tile0(el).hasAttribute('data-pending')).toBe(false);
    expect(tile0(el).hasAttribute('data-no-change')).toBe(false);
    el.remove();

    ({ el, actions } = await mount([{ ...PORTAIL, double_tap_action: { action: 'more-info' } }], closed));
    tile0(el).click();
    await advance(el, 100);
    el.remove();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(actions).not.toHaveBeenCalled();

    ({ el, actions } = await mount([PORTAIL], closed));
    pointer(tile0(el), 'pointerdown');
    await advance(el, 200);
    el.remove();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(1000);
    expect(actions).not.toHaveBeenCalled();
  });

  it('TC-HQA-U-18: malformed states are ignored without throwing, and a valid tile of the same card still applies', async () => {
    const malformed: unknown[] = [null, 'x', [], { closed: null, open: 'red' }, { closed: { color: 5, icon: ['x'], label: '' } }];
    const tiles: Tile[] = malformed.map((states, i) => ({ standalone: true, entity: 'cover.portail', name: `T${i}`, states }));
    tiles.push(PORTAIL);
    const { el } = await mount(tiles, { 'cover.portail': 'closed' });
    const rendered = tilesOf(el);
    expect(rendered).toHaveLength(6);
    for (const t of rendered.slice(0, 5)) {
      expect(t.hasAttribute('data-state-color')).toBe(false);
      expect(iconOf(t)).toBe('mdi:toggle-switch');
      expect(t.querySelector('.tile-subtitle')).toBeNull();
    }
    expect(rendered[5]!.getAttribute('data-state-color')).toBe('true');
  });

  it('TC-HQA-U-19: pending is per entity — the last tap re-arms it with its own timeout, and the mark lands on every tile once', async () => {
    const A = { ...PORTAIL, name: 'A', pending_timeout: 5 };
    const B = { ...PORTAIL, name: 'B', pending_timeout: 20 };
    let { el, actions } = await mount([A, B], { 'cover.portail': 'closed' });
    let toast = spyToast(el);
    tilesOf(el)[0]!.click();
    await el.updateComplete;
    expect(tilesOf(el).map(t => t.getAttribute('data-pending'))).toEqual(['true', 'true']);
    await advance(el, 1000);
    tilesOf(el)[1]!.click();
    expect(actions).toHaveBeenCalledTimes(2);
    await advance(el, 4000); // t = 5 000
    expect(tilesOf(el).some(t => t.hasAttribute('data-no-change'))).toBe(false);
    await advance(el, 15_999); // t = 20 999
    expect(tilesOf(el).some(t => t.hasAttribute('data-no-change'))).toBe(false);
    await advance(el, 1); // t = 21 000
    expect(tilesOf(el).map(t => t.getAttribute('data-no-change'))).toEqual(['true', 'true']);
    expect(toast).toHaveBeenCalledTimes(1);
    el.remove();

    ({ el, actions } = await mount([A, B], { 'cover.portail': 'closed' }));
    toast = spyToast(el);
    tilesOf(el)[0]!.click();
    await advance(el, 5000);
    expect(tilesOf(el).map(t => t.getAttribute('data-no-change'))).toEqual(['true', 'true']);
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it('TC-HQA-U-20: a moving entity renders pending without timer or mark and never blocks a gesture', async () => {
    const garage = { standalone: true, entity: 'cover.garage', name: 'Garage', tap_action: { action: 'toggle' }, hold_action: { action: 'toggle' } };
    let { el, actions } = await mount([garage], { 'cover.garage': 'opening' });
    let t = tile0(el);
    expect(t.getAttribute('data-pending')).toBe('true');
    expect(t.getAttribute('aria-busy')).toBe('true');
    expect(t.getAttribute('aria-label')).toBe('Garage, Pending');
    t.click();
    await hold(el, tile0(el));
    expect(actions.mock.calls.map(c => c[0].action)).toEqual(['tap', 'hold']);
    expect(vi.getTimerCount()).toBe(0);
    await advance(el, 60_000);
    expect(marksOf(tile0(el))).toHaveLength(0);
    expect(tile0(el).getAttribute('data-pending')).toBe('true');
    await setStates(el, { 'cover.garage': 'open' });
    expect(tile0(el).hasAttribute('data-pending')).toBe(false);
    fingerTap(tile0(el)); // a real tap: its pointerdown clears the flag the hold left
    expect(actions).toHaveBeenCalledTimes(3);
    el.remove();

    // closed -> tap -> opening -> open: pending never breaks, no mark
    ({ el, actions } = await mount([PORTAIL], { 'cover.portail': 'closed' }));
    tile0(el).click();
    await advance(el, 2000);
    expect(tile0(el).getAttribute('data-pending')).toBe('true');
    await setStates(el, { 'cover.portail': 'opening' });
    expect(tile0(el).getAttribute('data-pending')).toBe('true');
    for (let s = 0; s < 6; s++) {
      await advance(el, 10_000);
      expect(tile0(el).getAttribute('data-pending'), `pending at ${2 + (s + 1) * 10} s`).toBe('true');
      expect(marksOf(tile0(el))).toHaveLength(0);
    }
    tile0(el).click();
    expect(actions).toHaveBeenCalledTimes(2);
    await setStates(el, { 'cover.portail': 'open' });
    expect(tile0(el).hasAttribute('data-pending')).toBe(false);
    el.remove();

    // closed -> tap -> opening -> closed: ends without mark, on the rendering of closed
    ({ el } = await mount([PORTAIL], { 'cover.portail': 'closed' }));
    tile0(el).click();
    await advance(el, 2000);
    await setStates(el, { 'cover.portail': 'opening' });
    await advance(el, 2000);
    await setStates(el, { 'cover.portail': 'closed' });
    expect(tile0(el).hasAttribute('data-pending')).toBe(false);
    await advance(el, 60_000);
    t = tile0(el);
    expect(marksOf(t)).toHaveLength(0);
    expect(t.hasAttribute('data-no-change')).toBe(false);
    expect(colorOf(t)).toBe('var(--sf-accent-on)');
    expect(subtitleOf(t)).toBe('Fermé');
  });

  it('TC-HQA-U-21: every toggle gesture re-arms pending, another action does not, and the deferred tap re-checks availability', async () => {
    const T = { ...PORTAIL, hold_action: { action: 'toggle' }, double_tap_action: { action: 'toggle' } };
    const N = { standalone: true, entity: 'cover.portail', name: 'Portail 2', hold_action: { action: 'perform-action', perform_action: 'script.x' } };
    let { el, actions } = await mount([T, N], { 'cover.portail': 'closed' });
    spyToast(el);
    const [t, n] = tilesOf(el);
    t!.click();
    await advance(el, 250); // deferred tap
    expect(actions.mock.calls.map(c => c[0].action)).toEqual(['tap']);
    expect(tilesOf(el)[0]!.getAttribute('data-pending')).toBe('true');
    await advance(el, 750); // t = 1 000
    pointer(t!, 'pointerdown');
    await advance(el, 500); // t = 1 500, hold
    pointer(t!, 'pointerup');
    await advance(el, 500); // t = 2 000
    fingerTap(t!);
    await advance(el, 50); // t = 2 050, double tap
    fingerTap(t!);
    await el.updateComplete;
    expect(actions.mock.calls.map(c => c[0].action)).toEqual(['tap', 'hold', 'double_tap']);
    await advance(el, 950); // t = 3 000
    pointer(n!, 'pointerdown');
    await advance(el, 500); // t = 3 500, neighbour hold (perform-action)
    pointer(n!, 'pointerup');
    expect(actions.mock.calls.map(c => c[0].action)).toEqual(['tap', 'hold', 'double_tap', 'hold']);
    expect(actions.mock.calls[3]![0].config.hold_action).toEqual({ action: 'perform-action', perform_action: 'script.x' });
    await advance(el, 32_049 - 3_500);
    expect(tilesOf(el)[0]!.hasAttribute('data-no-change'), 'no mark before 32 050 ms').toBe(false);
    await advance(el, 1); // 30 s after the double tap — the perform-action hold did not re-arm
    expect(tilesOf(el)[0]!.getAttribute('data-no-change')).toBe('true');
    el.remove();

    ({ el, actions } = await mount([T], { 'cover.portail': 'closed' }));
    const toast = spyToast(el);
    tile0(el).click();
    await advance(el, 100);
    await setStates(el, { 'cover.portail': 'unavailable' });
    await advance(el, 150);
    expect(actions).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('Portail : Unavailable', true);
    el.remove();

    const S = { ...PORTAIL, name: 'Portail 3' };
    ({ el, actions } = await mount([T, S], { 'cover.portail': 'closed' }));
    tilesOf(el)[0]!.click();
    await advance(el, 100);
    tilesOf(el)[1]!.click();
    expect(actions).toHaveBeenCalledTimes(1);
    expect(actions.mock.calls[0]![0].config.name).toBe('Portail 3');
    await advance(el, 150);
    expect(actions).toHaveBeenCalledTimes(2);
    expect(actions.mock.calls[1]![0]).toMatchObject({ action: 'tap', config: { name: 'Portail' } });
  });

  it('TC-HQA-U-22: labels and the single live region announce the state, its change and the no-change mark', async () => {
    const { el } = await mount([PORTAIL], { 'cover.portail': 'closed' });
    spyToast(el);
    expect(tile0(el).getAttribute('aria-label')).toBe('Portail, Fermé');
    tile0(el).click();
    await advance(el, 3000);
    await setStates(el, { 'cover.portail': 'open' });
    const live = el.shadowRoot!.querySelectorAll('.sf-live');
    expect(live).toHaveLength(1);
    expect(live[0]!.getAttribute('role')).toBe('status');
    expect(live[0]!.getAttribute('aria-live')).toBe('polite');
    expect(live[0]!.closest('.hexa-tile')).toBeNull();
    expect(live[0]!.textContent!.trim()).toBe('Portail, Ouvert');
    expect(tile0(el).getAttribute('aria-label')).toBe('Portail, Ouvert');
    tile0(el).click();
    await advance(el, 30_000);
    expect(el.shadowRoot!.querySelector('.sf-live')!.textContent!.trim()).toBe('Portail, No change');
  });

  it('IT-HQA-I-01: through a parent that plays HA, a tap ends on the new state; a lost pulse ends on the no-change mark', async () => {
    const states = { 'cover.portail': 'closed' };
    let { el } = await mount([PORTAIL], states);
    haSimulator(el, states);
    tile0(el).click();
    await advance(el, 2999);
    expect(tile0(el).getAttribute('data-pending')).toBe('true');
    await advance(el, 1);
    let t = tile0(el);
    expect(t.hasAttribute('data-pending')).toBe(false);
    expect(colorOf(t)).toBe('var(--sf-error)');
    expect(iconOf(t)).toBe('mdi:gate-open');
    expect(subtitleOf(t)).toBe('Ouvert');
    await advance(el, 30_000);
    expect(marksOf(tile0(el))).toHaveLength(0);
    document.body.replaceChildren();

    const muted = { 'cover.portail': 'closed' };
    ({ el } = await mount([PORTAIL], muted));
    haSimulator(el, muted, { mute: true });
    spyToast(el);
    tile0(el).click();
    await advance(el, 30_000);
    t = tile0(el);
    expect(t.getAttribute('data-no-change')).toBe('true');
    expect(colorOf(t)).toBe('var(--sf-accent-on)');
    expect(iconOf(t)).toBe('mdi:gate');
    expect(subtitleOf(t)).toBe('Fermé');
  });

  it('IT-HQA-I-02: through the same parent, the light turns on with its style and a later hold opens more-info without a second toggle', async () => {
    const states = { 'light.zbmini_l_dressing_parent': 'off' };
    const { el, actions } = await mount([LIGHT], states);
    haSimulator(el, states);
    tile0(el).click();
    await advance(el, 3000);
    const t = tile0(el);
    expect(t.hasAttribute('data-pending')).toBe(false);
    expect(colorOf(t)).toBe('var(--sf-warning)');
    expect(iconOf(t)).toBe('mdi:lightbulb-on');
    expect(subtitleOf(t)).toBe('Chambre parents');

    pointer(t, 'pointerdown');
    await advance(el, 500);
    pointer(t, 'pointerup');
    t.click();
    await advance(el, 5000);
    const toggles = actions.mock.calls.filter(c => (c[0].config.tap_action as { action?: string } | undefined)?.action === 'toggle');
    expect(toggles).toHaveLength(1);
    expect(actions.mock.calls[1]![0]).toEqual({
      action: 'tap',
      config: { entity: 'light.zbmini_l_dressing_parent', tap_action: { action: 'more-info' } },
    });
    expect(actions).toHaveBeenCalledTimes(2);
  });

  it('IT-HQA-I-03: on a mixed card the weather, aggregated and production tiles keep their pre-lot rendering', async () => {
    await setLocale('fr'); // the snapshot was recorded in the default locale: the weather tile reads « Météo »
    const { el, actions } = await mount(
      [AGG, CLOU, PORTAIL],
      { 'weather.home': 'sunny', 'sun.sun': 'above_horizon', 'light.a': 'on', 'light.b': 'off', 'climate.clou': 'heat', 'cover.portail': 'closed' },
      { weather: { activate: true, weather_entity: 'weather.home', link: 'weather' } },
      'fr',
    );
    const weather = el.shadowRoot!.querySelector<HTMLElement>('.hexa-tile.weather-tile')!;
    const [agg, clou, portail] = tilesOf(el);
    for (const [name, t] of [['mixed_weather', weather], ['mixed_aggregated', agg!], ['mixed_clou', clou!]] as const) {
      expect(norm(t.innerHTML), name).toBe(SNAPSHOT[name]!.inner);
      expect(iconOf(t), name).toBe(SNAPSHOT[name]!.icon);
    }
    expect(portail!.getAttribute('data-state-color')).toBe('true');

    const nav = stubNavigation();
    pointer(agg!, 'pointerdown');
    await advance(el, 500);
    pointer(agg!, 'pointerup');
    agg!.click();
    expect(actions).not.toHaveBeenCalled();
    expect(nav.pushState).not.toHaveBeenCalled();

    weather.click();
    expect(nav.pushState).toHaveBeenCalledWith(null, '', 'weather');
    expect(nav.dispatched).toContain('location-changed');
  });
});
