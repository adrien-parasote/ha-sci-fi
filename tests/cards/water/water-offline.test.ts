// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import '../../../src/cards/water/sci-fi-water-management.js';
import { setLocale } from '../../../src/locales/localization.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

// Water history offline display — docs/specs/water-offline/spec.md
const ROOT = resolve(__dirname, '../../..');
const HIST = 'history/history_during_period';
const LOGBOOK = 'logbook/get_events';

type WsFn = (message: any) => Promise<unknown>;
type Mode = 'ok' | 'fail' | 'pending' | 'logbook-only';

interface Ctl {
  mode: Mode;
  rows: number;
  names: string[];
  callWS: Mock<WsFn>;
}

function historyResult(entityId: string, rows: number, names: string[]): Record<string, any[]> {
  const base = Math.floor(Date.now() / 1000);
  const states = Array.from({ length: rows }, (_, i) => ({ s: i % 2 ? 'off' : 'on', lu: base - i * 60 }));
  void names;
  return { [entityId]: states };
}

/** A hass whose callWS obeys `ctl.mode` for the two history endpoints. */
function makeHass(ctl: Ctl, opts: { twoFloors?: boolean; entityName?: string } = {}) {
  const floors: Record<string, any> = { ground: makeMockFloor({ floor_id: 'ground', level: 0 }) };
  const areas: Record<string, any> = { living_room: makeMockArea({ area_id: 'living_room', floor_id: 'ground' }) };
  const entities: Record<string, any> = {
    'switch.valve': makeMockEntityEntry({ entity_id: 'switch.valve', area_id: 'living_room', domain: 'switch', labels: ['water'] }),
  };
  const states: Record<string, any> = {
    'switch.valve': makeMockEntity({ entity_id: 'switch.valve', state: 'off', attributes: { friendly_name: opts.entityName ?? 'Valve A' } }),
  };
  if (opts.twoFloors) {
    floors.first = makeMockFloor({ floor_id: 'first', name: 'First Floor', level: 1 });
    areas.bedroom = makeMockArea({ area_id: 'bedroom', name: 'Bedroom', floor_id: 'first' });
    entities['switch.valve_b'] = makeMockEntityEntry({ entity_id: 'switch.valve_b', area_id: 'bedroom', domain: 'switch', labels: ['water'] });
    states['switch.valve_b'] = makeMockEntity({ entity_id: 'switch.valve_b', state: 'off', attributes: { friendly_name: 'Valve B' } });
  }
  const hass: any = makeMockHass({ floors, areas, entities, states });
  ctl.callWS = vi.fn<WsFn>((message: any) => {
    if (message.type === HIST || message.type === LOGBOOK) {
      if (ctl.mode === 'pending') return new Promise(() => {});
      if (ctl.mode === 'fail') return Promise.reject(new Error('offline'));
      if (ctl.mode === 'logbook-only') {
        if (message.type === HIST) return Promise.reject(new Error('no recorder'));
        const id = message.entity_ids[0];
        return Promise.resolve([{ entity_id: id, state: 'on', when: new Date().toISOString(), name: 'Logbook row' }]);
      }
      if (message.type === HIST) return Promise.resolve(historyResult(message.entity_ids[0], ctl.rows, ctl.names));
      return Promise.resolve([]);
    }
    return Promise.resolve([]);
  });
  hass.callWS = ctl.callWS;
  return hass;
}

function newCtl(mode: Mode = 'ok', rows = 2): Ctl {
  return { mode, rows, names: [], callWS: vi.fn<WsFn>() };
}

const flush = async (ms = 0) => { await vi.advanceTimersByTimeAsync(ms); };

async function mount(ctl: Ctl, opts: { twoFloors?: boolean; entityName?: string } = {}): Promise<any> {
  const el = document.createElement('sci-fi-water-management') as any;
  el.setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water', first_floor_to_render: 'ground' });
  el.hass = makeHass(ctl, opts);
  document.body.appendChild(el);
  await el.updateComplete;
  await flush();
  await el.updateComplete;
  return el;
}

const histCalls = (ctl: Ctl) => ctl.callWS.mock.calls.filter((c: any[]) => c[0].type === HIST).length;
const allHistoryCalls = (ctl: Ctl) => ctl.callWS.mock.calls.filter((c: any[]) => c[0].type === HIST || c[0].type === LOGBOOK).length;
const q = (el: any, sel: string) => el.shadowRoot.querySelector(sel);
const qa = (el: any, sel: string) => Array.from(el.shadowRoot.querySelectorAll(sel)) as Element[];

async function goOffline(el: any, ctl: Ctl): Promise<void> {
  ctl.mode = 'fail';
  q(el, '.floor-sync-btn').click();
  await flush();
  await el.updateComplete;
}

describe('water history offline display', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date(2026, 10, 5, 14, 32, 0));
    await setLocale('en');
  });
  afterEach(async () => {
    document.body.replaceChildren();
    vi.useRealTimers();
    await setLocale('fr');
  });

  it('TC-WO-U-01: a pending fetch keeps the previous rows', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl);
    expect(el._rawLogs.length).toBe(2);
    ctl.mode = 'pending';
    void el._fetchHistoryLogs();
    expect(el._rawLogs.length).toBe(2);
  });

  it('TC-WO-U-02: both sources reject -> offline, cache kept and rendered', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl);
    await goOffline(el, ctl);
    expect(el._historyOffline).toBe(true);
    expect(el._rawLogs.length).toBe(2);
    const badge = q(el, '.log-offline');
    expect(badge).not.toBeNull();
    expect(badge.getAttribute('role')).toBe('status');
    expect(q(el, '.log-console').classList.contains('offline')).toBe(true);
    expect(qa(el, '.log-entry').length).toBe(2);
  });

  it('TC-WO-U-03: offline rows are dimmed orange and the header wraps', async () => {
    const css = (await import('../../../src/cards/water/styles.js')).waterStyles.cssText;
    const block = (sel: string) => {
      const i = css.indexOf(sel + ' {');
      expect(i).toBeGreaterThanOrEqual(0);
      return css.slice(i, css.indexOf('}', i));
    };
    const entry = block('.log-console.offline .log-entry');
    expect(entry).toMatch(/color:\s*#ffaa00/);
    const opacity = Number(/opacity:\s*([0-9.]+)/.exec(entry)?.[1]);
    expect(opacity).toBeGreaterThanOrEqual(0.7);
    expect(opacity).toBeLessThan(1);
    expect(block('.log-header')).toMatch(/flex-wrap:\s*wrap/);
  });

  it('TC-WO-U-04: offline with no cache shows History unavailable', async () => {
    const ctl = newCtl('fail');
    const el = await mount(ctl);
    expect(q(el, '.log-offline').textContent.trim()).toBe('[ OFFLINE ]');
    expect(q(el, '.empty-log').textContent.trim()).toBe('History unavailable');
    expect(el.shadowRoot.textContent).not.toContain('No events recorded.');
  });

  it('TC-WO-U-05: one retry at 5000 ms recovers', async () => {
    const ctl = newCtl('fail');
    const el = await mount(ctl);
    const before = histCalls(ctl);
    ctl.mode = 'ok';
    ctl.rows = 0;
    await flush(4999);
    expect(histCalls(ctl)).toBe(before);
    await flush(1);
    await el.updateComplete;
    expect(histCalls(ctl)).toBe(before + 1);
    expect(el._historyOffline).toBe(false);
    expect(q(el, '.log-offline')).toBeNull();
    expect(q(el, '.empty-log').textContent.trim()).toBe('No events recorded.');
  });

  it('TC-WO-U-06: a failing retry re-arms nothing; a failing click arms one', async () => {
    const ctl = newCtl('fail');
    const el = await mount(ctl);
    await flush(5000); // retry fires and fails
    const afterRetry = allHistoryCalls(ctl);
    await flush(60000);
    expect(allHistoryCalls(ctl)).toBe(afterRetry);
    q(el, '.floor-sync-btn').click();
    await flush();
    const afterClick = allHistoryCalls(ctl);
    expect(afterClick).toBeGreaterThan(afterRetry);
    await flush(5000);
    expect(allHistoryCalls(ctl)).toBe(afterClick + 2);
    await flush(60000);
    expect(allHistoryCalls(ctl)).toBe(afterClick + 2);
  });

  it('TC-WO-U-07: a floor change or a removal cancels the pending retry', async () => {
    // (a) floor change
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl, { twoFloors: true });
    await goOffline(el, ctl);
    ctl.mode = 'pending';
    el._activeFloorId = 'first';
    await el.updateComplete;
    expect(el._historyOffline).toBe(false);
    expect(el._rawLogs).toEqual([]);
    expect(el._cachedAt).toBeNull();
    const calls = allHistoryCalls(ctl);
    await flush(10000);
    expect(allHistoryCalls(ctl)).toBe(calls);

    // (b) removal
    const ctl2 = newCtl('ok', 2);
    const el2 = await mount(ctl2);
    await goOffline(el2, ctl2);
    el2.remove();
    const calls2 = allHistoryCalls(ctl2);
    await flush(10000);
    expect(allHistoryCalls(ctl2)).toBe(calls2);
  });

  it('TC-WO-U-08: a superseded rejection leaves the new floor online', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl, { twoFloors: true });
    let rejectA: (e: Error) => void = () => {};
    const pendingA = new Promise((_r, rej) => { rejectA = rej; });
    ctl.callWS.mockImplementationOnce(() => pendingA);
    q(el, '.floor-sync-btn').click();
    ctl.mode = 'ok';
    el._activeFloorId = 'first';
    await el.updateComplete;
    await flush();
    ctl.mode = 'fail';
    rejectA(new Error('late'));
    await flush();
    expect(el._historyOffline).toBe(false);
    expect(el._offlineRetryTimer).toBeNull();
  });

  it('TC-WO-U-09: the sandbox never goes offline', async () => {
    const el = document.createElement('sci-fi-water-management') as any;
    el.setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    const p = el._fetchHistoryLogs();
    await flush(600);
    await p;
    expect(el._historyOffline).toBe(false);
  });

  it('TC-WO-U-10: the card specs state the offline behaviour', () => {
    const hist = readFileSync(resolve(ROOT, 'docs/specs/cards/water_history.md'), 'utf8');
    const water = readFileSync(resolve(ROOT, 'docs/specs/cards/water.md'), 'utf8');
    const offlineRow = hist.split('\n').find(l => l.includes('**HA API timeout / offline**')) ?? '';
    expect(offlineRow).toContain('[ OFFLINE');
    const d12 = hist.split('\n').find(l => l.startsWith('| D12')) ?? '';
    expect(d12).toContain('resolved');
    expect(d12).toContain('water-offline');
    // the rewritten history case row (FR-8, FR-14)
    expect(hist).toContain('| A fetch keeps the old logs while it runs |');
    expect(hist).not.toContain('Logs cleared when a fetch starts');
    const apiFailure = water.split('\n').find(l => l.startsWith('| API Failure')) ?? '';
    expect(apiFailure).toMatch(/history log/i);
  });

  it('TC-WO-U-11: OFFLINE and History unavailable are localised', () => {
    const card = readFileSync(resolve(ROOT, 'src/cards/water/sci-fi-water-management.ts'), 'utf8');
    expect(card).toContain("msg('OFFLINE')");
    expect(card).toContain("msg('History unavailable')");
    const xlf = readFileSync(resolve(ROOT, 'xliff/fr.xlf'), 'utf8');
    const fr = readFileSync(resolve(ROOT, 'src/locales/locales/fr.js'), 'utf8');
    for (const [src, tgt] of [['OFFLINE', 'HORS LIGNE'], ['History unavailable', 'Historique indisponible']]) {
      expect(xlf).toContain(`<source>${src}</source>`);
      expect(xlf).toContain(`<target>${tgt}</target>`);
      expect(fr).toContain(tgt);
    }
  });

  it('TC-WO-U-12: nothing to query clears the cache and the offline state', async () => {
    for (const ids of [[], ['light.x']]) {
      const ctl = newCtl('ok', 2);
      const el = await mount(ctl);
      await goOffline(el, ctl);
      expect(el._cachedAt).not.toBeNull();
      el.entityIds = ids;
      await el._fetchHistoryLogs();
      await el.updateComplete;
      expect(el._rawLogs).toEqual([]);
      expect(el._historyOffline).toBe(false);
      expect(el._cachedAt).toBeNull();
      expect(el._offlineRetryTimer).toBeNull();
      expect(q(el, '.log-offline')).toBeNull();
      el.remove();
    }
  });

  it('TC-WO-U-13: recorder down, logbook up is online', async () => {
    const ctl = newCtl('logbook-only');
    const el = await mount(ctl);
    expect(el._historyOffline).toBe(false);
    expect(el._rawLogs.length).toBe(1);
    expect(el._offlineRetryTimer).toBeNull();
  });

  it('TC-WO-U-14: the badge carries the cache time', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl);
    await goOffline(el, ctl);
    expect(q(el, '.log-offline').textContent.trim()).toBe('[ OFFLINE · 14:32 ]');
    await setLocale('fr');
    el.requestUpdate();
    await el.updateComplete;
    expect(q(el, '.log-offline').textContent.trim()).toBe('[ HORS LIGNE · 14:32 ]');
  });

  it('TC-WO-U-15: cached names render as text', async () => {
    const ctl = newCtl('ok', 1);
    const el = await mount(ctl, { entityName: '<img src=x onerror=alert(1)>' });
    await goOffline(el, ctl);
    expect(q(el, '.log-console img')).toBeNull();
    expect(q(el, '.log-entry').textContent).toContain('<img src=x');
  });

  it('TC-WO-U-16: the scanner shows while an offline fetch is in flight, badge kept', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl);
    await goOffline(el, ctl);
    ctl.mode = 'pending';
    q(el, '.floor-sync-btn').click();
    await el.updateComplete;
    expect(q(el, '.log-scanner')).not.toBeNull();
    expect(q(el, '.log-offline')).not.toBeNull();
  });

  it('IT-WO-I-01: real element goes offline on sync, recovers on the retry', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl);
    expect(qa(el, '.log-entry').length).toBe(2);
    await goOffline(el, ctl);
    expect(q(el, '.log-offline')).not.toBeNull();
    expect(qa(el, '.log-entry').length).toBe(2);
    ctl.mode = 'ok';
    ctl.rows = 1;
    await flush(5000);
    await el.updateComplete;
    expect(q(el, '.log-offline')).toBeNull();
    expect(qa(el, '.log-entry').length).toBe(1);
  });

  it('IT-WO-I-02: a removed element never calls callWS again', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl);
    await goOffline(el, ctl);
    el.remove();
    const n = ctl.callWS.mock.calls.length;
    await flush(10000);
    expect(ctl.callWS.mock.calls.length).toBe(n);
  });

  it('IT-WO-I-03: switching floor drops the offline cache and the retry', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl, { twoFloors: true });
    await goOffline(el, ctl);
    ctl.mode = 'ok';
    ctl.rows = 1;
    qa(el, '.floor-hexa')[1]!.dispatchEvent(new MouseEvent('click'));
    await el.updateComplete;
    await flush();
    await el.updateComplete;
    const n = ctl.callWS.mock.calls.length;
    expect(q(el, '.log-offline')).toBeNull();
    const entries = qa(el, '.log-entry');
    expect(entries.length).toBe(1);
    expect(entries[0]!.textContent).toContain('Valve B');
    await flush(10000);
    expect(ctl.callWS.mock.calls.length).toBe(n);
  });

  it('IT-WO-I-04: reattaching an offline element fetches once and recovers', async () => {
    const ctl = newCtl('ok', 2);
    const el = await mount(ctl);
    await goOffline(el, ctl);
    el.remove();
    ctl.mode = 'ok';
    ctl.rows = 1;
    const n = allHistoryCalls(ctl);
    document.body.appendChild(el);
    await el.updateComplete;
    await flush();
    await el.updateComplete;
    expect(allHistoryCalls(ctl)).toBe(n + 1);
    expect(q(el, '.log-offline')).toBeNull();
    expect(qa(el, '.log-entry').length).toBe(1);
  });
});
