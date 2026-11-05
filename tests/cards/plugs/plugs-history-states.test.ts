// @vitest-environment happy-dom
/**
 * Plugs power-history states — docs/specs/plugs-history-states/spec.md
 * TC-PHS-U-01 → TC-PHS-U-28, IT-PHS-I-01 → IT-PHS-I-04.
 * Each regression of the three earlier attempts (bead ha-sci-fi-8ap) has its own case.
 */
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { msg } from '@lit/localize';

import '../../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiPlugsCard } from '../../../src/cards/plugs/sci-fi-plugs.js';
import { plugStyles } from '../../../src/cards/plugs/styles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const TV = {
  device_id: 'plug1',
  entity_id: 'switch.tv',
  name: 'TV Plug',
  sensors: { 'sensor.tv_power': { power: true, show: true } },
};

const LAMP = {
  device_id: 'plug2',
  entity_id: 'switch.lamp',
  name: 'Lamp Plug',
  sensors: { 'sensor.lamp_power': { power: true, show: true } },
};

const NO_POWER = { device_id: 'plug3', entity_id: 'switch.lamp', name: 'Bare Plug' };

const STATES = {
  'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on' }),
  'sensor.tv_power': makeMockEntity({ entity_id: 'sensor.tv_power', state: '45', attributes: { unit_of_measurement: 'W' } }),
  'switch.lamp': makeMockEntity({ entity_id: 'switch.lamp', state: 'off' }),
  'sensor.lamp_power': makeMockEntity({ entity_id: 'sensor.lamp_power', state: '0', attributes: { unit_of_measurement: 'W' } }),
};

const CONFIG = (devices: object[]) => ({ type: 'custom:sci-fi-plugs', devices });

function makeHass(callApi: unknown): any {
  const hass = makeMockHass({ states: STATES }) as any;
  hass.callApi = callApi;
  return hass;
}

/** `n` valid points, one per minute, values 1..n (distinct minute buckets). */
function points(n: number, value = (i: number) => String(i + 1)): Array<{ last_changed: string; state: string }> {
  const start = Date.parse('2026-11-04T00:00:00.000Z');
  return Array.from({ length: n }, (_, i) => ({
    last_changed: new Date(start + i * 60_000).toISOString(),
    state: value(i),
  }));
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const never = () => new Promise<never>(() => {});

async function flush(card: SciFiPlugsCard): Promise<void> {
  await vi.advanceTimersByTimeAsync(0);
  await card.updateComplete;
  await vi.advanceTimersByTimeAsync(0);
  await card.updateComplete;
}

async function mount(devices: object[], callApi: unknown): Promise<SciFiPlugsCard> {
  const card = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
  (card as any).setConfig(CONFIG(devices));
  card.hass = makeHass(callApi);
  document.body.appendChild(card);
  await flush(card);
  return card;
}

async function select(card: SciFiPlugsCard, idx: number): Promise<void> {
  (card as any)._selected_plug_id = idx;
  await flush(card);
}

const q = (card: SciFiPlugsCard, sel: string) => card.shadowRoot!.querySelector(sel) as HTMLElement | null;
const attempt = (card: SciFiPlugsCard, key: string) => (card as any)._historyAttempts.get(key);
const callsFor = (callApi: ReturnType<typeof vi.fn>, key: string) =>
  callApi.mock.calls.filter(c => String(c[1]).includes(`filter_entity_id=${encodeURIComponent(key)}`)).length;

async function clickRetry(card: SciFiPlugsCard): Promise<void> {
  q(card, 'sf-button.history-retry')!.click();
  await flush(card);
}

// ── Suite ────────────────────────────────────────────────────────────────────

describe('sci-fi-plugs — power history states', () => {
  let drawSpy: ReturnType<typeof vi.spyOn>;
  let toastSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    drawSpy = vi.spyOn(SciFiPlugsCard.prototype as any, '_drawChart');
    toastSpy = vi.spyOn(SciFiPlugsCard.prototype as any, '_toast');
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('TC-PHS-U-01 — a failed load is never re-fired by hass updates (round 2)', async () => {
    const callApi = vi.fn().mockRejectedValue(new Error('500'));
    const card = await mount([TV], callApi);
    for (let i = 0; i < 4; i++) {
      const prev = card.hass as any;
      card.hass = {
        ...prev,
        states: { ...prev.states, 'sensor.tv_power': makeMockEntity({ entity_id: 'sensor.tv_power', state: String(50 + i) }) },
      };
      await flush(card);
    }
    expect(callApi).toHaveBeenCalledTimes(1);
    expect(q(card, '.history-error')).to.exist;
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it('TC-PHS-U-02 — a pending request renders the loading state', async () => {
    const card = await mount([TV], vi.fn(never));
    expect(q(card, '.history-loading')!.textContent!.trim()).to.equal(msg('Loading history…'));
    expect(q(card, '.chart-container')!.style.display).to.equal('none');
    expect(q(card, '.msg-container')!.textContent!.trim()).to.equal('');
  });

  it('TC-PHS-U-03 — the 2000 ms budget is strict', async () => {
    const card = await mount([TV], vi.fn(never));
    await vi.advanceTimersByTimeAsync(1999);
    await card.updateComplete;
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loading');
    await vi.advanceTimersByTimeAsync(1);
    await flush(card);
    expect(attempt(card, 'sensor.tv_power').status).to.equal('error');
    expect(attempt(card, 'sensor.tv_power').reason).to.equal('timeout');
    expect(q(card, '.history-error')).to.exist;
    expect(card.shadowRoot!.textContent).not.to.include(msg('No power data to display'));
  });

  it('TC-PHS-U-04 — an answer at 1999 ms is accepted', async () => {
    const callApi = vi.fn(() => new Promise(r => setTimeout(() => r([points(3)]), 1999)));
    const card = await mount([TV], callApi);
    await vi.advanceTimersByTimeAsync(1999);
    await flush(card);
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loaded');
    expect(drawSpy).toHaveBeenCalled();
    expect(q(card, '.history-error')).to.be.null;
  });

  it('TC-PHS-U-05 — retry recovers a single-device dashboard (round 1)', async () => {
    const callApi = vi.fn().mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce([points(3)]);
    const card = await mount([TV], callApi);
    expect(q(card, '.history-error')).to.exist;
    await clickRetry(card);
    expect(callApi).toHaveBeenCalledTimes(2);
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loaded');
    expect(drawSpy).toHaveBeenCalled();
  });

  it('TC-PHS-U-06 — an empty answer renders the empty state', async () => {
    const card = await mount([TV], vi.fn().mockResolvedValue([[]]));
    expect(attempt(card, 'sensor.tv_power').status).to.equal('empty');
    expect(q(card, '.msg-container')!.textContent!.trim()).to.equal(msg('No power data to display'));
    expect(q(card, '.chart-container')!.style.display).to.equal('none');
    document.body.replaceChildren();
    const bare = await mount([TV], vi.fn().mockResolvedValue([]));
    expect(attempt(bare, 'sensor.tv_power').status).to.equal('empty');
    expect(q(bare, '.msg-container')!.textContent!.trim()).to.equal(msg('No power data to display'));
  });

  it('TC-PHS-U-07 — a late answer of plug 0 never paints plug 1 (round 4b)', async () => {
    const tv = deferred<unknown>();
    const callApi = vi.fn((_m: string, path: string) =>
      path.includes('sensor.tv_power') ? tv.promise : Promise.resolve([points(2, () => '7')]));
    const card = await mount([TV, LAMP], callApi);
    await select(card, 1);
    tv.resolve([points(3, () => '99')]);
    await flush(card);
    expect(callApi).toHaveBeenCalledTimes(2);
    expect(callsFor(callApi, 'sensor.tv_power')).to.equal(1);
    expect(callsFor(callApi, 'sensor.lamp_power')).to.equal(1);
    const lastDraw = drawSpy.mock.calls[drawSpy.mock.calls.length - 1]!;
    expect((lastDraw[0] as any[])[0].data).to.deep.equal([7, 7]);
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loaded');
    expect(q(card, '.header .title')!.textContent).to.include('Lamp Plug');
  });

  it('TC-PHS-U-08 — a late rejection of plug 0 never touches plug 1', async () => {
    const tv = deferred<unknown>();
    const callApi = vi.fn((_m: string, path: string) =>
      path.includes('sensor.tv_power') ? tv.promise : Promise.resolve([points(2)]));
    const card = await mount([TV, LAMP], callApi);
    await select(card, 1);
    tv.reject(new Error('late'));
    await flush(card);
    expect(attempt(card, 'sensor.lamp_power').status).to.equal('loaded');
    expect(q(card, '.history-error')).to.be.null;
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it('TC-PHS-U-09 — a config edit drops the removed plug\'s history (round 5)', async () => {
    const callApi = vi.fn((_m: string, path: string) =>
      Promise.resolve([points(2, () => (path.includes('sensor.tv_power') ? '99' : '7'))]));
    const card = await mount([TV, LAMP], callApi);
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loaded');
    drawSpy.mockClear();
    (card as any).setConfig(CONFIG([LAMP]));
    await flush(card);
    expect((card as any)._historyAttempts.has('sensor.tv_power')).to.be.false;
    expect(callsFor(callApi, 'sensor.lamp_power')).to.equal(1);
    expect(q(card, '.header .title')!.textContent).to.include('Lamp Plug');
    for (const call of drawSpy.mock.calls) {
      expect((call[0] as any[])[0].data).to.deep.equal([7, 7]);
    }
  });

  it('TC-PHS-U-10 — a loaded plug replays without a request; dead fields are gone', async () => {
    const callApi = vi.fn().mockResolvedValue([points(2)]);
    const card = await mount([TV, LAMP], callApi);
    await select(card, 1);
    await select(card, 0);
    expect(callsFor(callApi, 'sensor.tv_power')).to.equal(1);
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loaded');
    const src = readFileSync('src/cards/plugs/sci-fi-plugs.ts', 'utf8');
    for (const name of ['fetchedAt', '_chart_generation', '_chartLoaded']) {
      expect(src, name).not.to.include(name);
    }
  });

  it('TC-PHS-U-11 — a plug in error shows its error again without a request', async () => {
    const callApi = vi.fn((_m: string, path: string) =>
      path.includes('sensor.tv_power') ? Promise.reject(new Error('500')) : Promise.resolve([points(2)]));
    const card = await mount([TV, LAMP], callApi);
    await select(card, 1);
    await select(card, 0);
    expect(callsFor(callApi, 'sensor.tv_power')).to.equal(1);
    expect(q(card, '.history-error')).to.exist;
  });

  it('TC-PHS-U-12 — _withTimeout resolves in budget, rejects with timeout after it', async () => {
    const card = await mount([NO_POWER], vi.fn());
    await expect((card as any)._withTimeout(Promise.resolve(1), 2000)).resolves.to.equal(1);
    const late = (card as any)._withTimeout(never(), 2000);
    const settled = late.catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(2000);
    expect(await settled).toMatchObject({ reason: 'timeout' });
  });

  it('TC-PHS-U-13 — fr.xlf carries the three new targets', () => {
    const xlf = readFileSync('xliff/fr.xlf', 'utf8');
    const pairs: Array<[string, string]> = [
      ['Loading history…', "Chargement de l'historique…"],
      ['Power history unavailable', 'Historique de puissance indisponible'],
      ['Retry', 'Réessayer'],
    ];
    for (const [source, target] of pairs) {
      const re = new RegExp(`<source>${source}</source>\\s*<target>${target}</target>`);
      expect(xlf, source).to.match(re);
    }
  });

  it('TC-PHS-U-14 — roles, and focus moved to the section after retry', async () => {
    const card = await mount([TV], vi.fn().mockReturnValueOnce(never()).mockRejectedValueOnce(new Error('x')).mockReturnValue(never()));
    expect(q(card, '.history-loading')!.getAttribute('role')).to.equal('status');
    (card as any)._historyAttempts = new Map();
    await flush(card);
    expect(q(card, '.history-error')!.getAttribute('role')).to.equal('alert');
    await clickRetry(card);
    const active = card.shadowRoot!.activeElement as HTMLElement | null;
    expect(active?.classList.contains('chart-section')).to.be.true;
    expect(q(card, '.chart-section')!.getAttribute('tabindex')).to.equal('-1');
  });

  it('TC-PHS-U-15 — two retry clicks in the same tick start one request', async () => {
    const callApi = vi.fn().mockRejectedValueOnce(new Error('500')).mockReturnValue(never());
    const card = await mount([TV], callApi);
    const btn = q(card, 'sf-button.history-retry')!;
    btn.click();
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loading');
    btn.click();
    await flush(card);
    expect(callApi).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['{} is malformed', {}, 'error', 0],
    ['[[42]] holds no point', [[42]], 'empty', 0],
    ['non-finite states are dropped', [[{ last_changed: '2026-11-04T00:00:00.000Z', state: 'unavailable' }, { last_changed: '2026-11-04T00:01:00.000Z', state: 'NaN' }]], 'empty', 0],
    ['6000 points keep the latest 5000', [points(6000)], 'loaded', 5000],
  ])('TC-PHS-U-16 — %s', async (_t, answer, status, count) => {
    const card = await mount([TV], vi.fn().mockResolvedValue(answer));
    const rec = attempt(card, 'sensor.tv_power');
    expect(rec.status).to.equal(status);
    if (status === 'error') expect(rec.reason).to.equal('request');
    if (status === 'empty') expect(q(card, '.msg-container')!.textContent!.trim()).to.equal(msg('No power data to display'));
    if (status === 'loaded') {
      const data = (rec.datasets as any[])[0].data as number[];
      expect(data).to.have.length(count);
      expect(data[data.length - 1]).to.equal(6000);
      expect(data[0]).to.equal(1001);
    }
  });

  it('TC-PHS-U-17 — timeout and rejection render the same text', async () => {
    const timedOut = await mount([TV], vi.fn(never));
    await vi.advanceTimersByTimeAsync(2000);
    await flush(timedOut);
    const rejected = await mount([TV], vi.fn().mockRejectedValue(new Error('500')));
    const a = q(timedOut, '.history-error')!.textContent!.trim();
    const b = q(rejected, '.history-error')!.textContent!.trim();
    expect(a).to.equal(b);
    expect(a).to.equal(msg('Power history unavailable'));
  });

  it('TC-PHS-U-18 — the section reserves the same height in every state', async () => {
    const rule = /\.chart-section\s*\{[^}]*min-height:\s*(\d+)px/.exec(plugStyles.cssText);
    expect(rule, '.chart-section must declare a min-height').to.exist;
    expect(Number(rule![1])).to.be.greaterThan(0);
    const d = deferred<unknown>();
    const callApi = vi.fn().mockReturnValueOnce(d.promise).mockResolvedValueOnce([points(3)]);
    const card = await mount([TV], callApi);
    const loading = q(card, '.chart-section');
    d.reject(new Error('x'));
    await flush(card);
    const error = q(card, '.chart-section');
    await clickRetry(card);
    const loaded = q(card, '.chart-section');
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loaded');
    expect(loading).to.equal(error);
    expect(error).to.equal(loaded);
    expect(loaded!.getAttribute('style')).to.be.null;
  });

  it('TC-PHS-U-19 — disconnect clears timers and discards the late answer', async () => {
    const d = deferred<unknown>();
    const card = await mount([TV], vi.fn(() => d.promise));
    card.remove();
    expect(vi.getTimerCount()).to.equal(0);
    await vi.advanceTimersByTimeAsync(2000);
    d.resolve([points(3)]);
    await flush(card);
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loading');
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('TC-PHS-U-20 — the entity id is URL-encoded in the query', async () => {
    const odd = { ...TV, sensors: { 'sensor.a&x=1': { power: true, show: true } } };
    const callApi = vi.fn(never);
    await mount([odd], callApi);
    expect(String((callApi.mock.calls[0] as unknown[])[1])).to.include('filter_entity_id=sensor.a%26x%3D1');
  });

  it('TC-PHS-U-21 — at most one request per key in flight', async () => {
    const callApi = vi.fn(never);
    const card = await mount([TV, LAMP], callApi);
    await select(card, 1);
    await select(card, 0);
    await select(card, 1);
    expect(callApi).toHaveBeenCalledTimes(2);
    expect(callsFor(callApi, 'sensor.tv_power')).to.equal(1);
  });

  it('TC-PHS-U-22 — a plug without power sensor requests nothing', async () => {
    const callApi = vi.fn(never);
    const card = await mount([NO_POWER], callApi);
    expect(callApi).not.toHaveBeenCalled();
    expect((card as any)._historyAttempts.size).to.equal(0);
    expect(q(card, '.history-loading')).to.be.null;
  });

  it('TC-PHS-U-23 — a config edit keeping both keys keeps both records', async () => {
    const callApi = vi.fn().mockResolvedValue([points(2)]);
    const card = await mount([TV, LAMP], callApi);
    await select(card, 1);
    const tvRec = attempt(card, 'sensor.tv_power');
    const lampRec = attempt(card, 'sensor.lamp_power');
    (card as any).setConfig(CONFIG([{ ...TV }, { ...LAMP }]));
    await flush(card);
    expect(callApi).toHaveBeenCalledTimes(2);
    expect(attempt(card, 'sensor.tv_power')).to.equal(tvRec);
    expect(attempt(card, 'sensor.lamp_power')).to.equal(lampRec);
  });

  it('TC-PHS-U-24 — the existing plugs suite no longer seeds removed fields', () => {
    const src = readFileSync('tests/cards/plugs/sci-fi-plugs.test.ts', 'utf8');
    expect(src.split('_chart_generation').length - 1).to.equal(0);
    expect(src).not.to.include('fetchedAt');
  });

  it('TC-PHS-U-26 — _withTimeout is (promise, ms); timers live in a Set cleared on disconnect', async () => {
    const card = await mount([TV], vi.fn(never));
    expect((card as any)._withTimeout.length).to.equal(2);
    const timers = (card as any)._historyTimers;
    expect(timers).toBeInstanceOf(Set);
    expect(timers.size).to.equal(1);
    card.remove();
    expect(timers.size).to.equal(0);
  });

  it('TC-PHS-U-27 — a config edit leaves a dropped plug\'s budget running to its end', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const callApi = vi.fn((_m: string, path: string) =>
      path.includes('sensor.tv_power') ? never() : Promise.resolve([points(2)]));
    const card = await mount([TV, LAMP], callApi);
    const timers = (card as any)._historyTimers as Set<unknown>;
    expect(timers.size).to.equal(1);
    const [tvTimer] = [...timers];
    clearSpy.mockClear();
    (card as any).setConfig(CONFIG([LAMP]));
    await flush(card);
    expect(clearSpy.mock.calls.map(c => c[0])).not.to.include(tvTimer);
    expect(timers.has(tvTimer)).to.be.true;
    await vi.advanceTimersByTimeAsync(2000);
    await flush(card);
    expect(timers.has(tvTimer)).to.be.false;
    expect((card as any)._historyAttempts.has('sensor.tv_power')).to.be.false;
  });

  it('TC-PHS-U-28 — the history request is a typed hass.callApi(\'GET\', path)', async () => {
    const callApi = vi.fn().mockResolvedValue([points(2)]);
    await mount([TV], callApi);
    expect(callApi).toHaveBeenCalledTimes(1);
    expect(callApi.mock.calls[0]).toHaveLength(2);
    expect(callApi.mock.calls[0]?.[0]).to.equal('GET');
    const src = readFileSync('src/cards/plugs/sci-fi-plugs.ts', 'utf8');
    expect(src).not.toMatch(/as any\)\.callApi/);
  });

  it('TC-PHS-U-25 — plugs.md is amended', () => {
    const doc = readFileSync('docs/specs/cards/plugs.md', 'utf8');
    expect(doc).to.include('plugs-history-states/spec.md');
    for (const name of ['historyLoading', '_chartLoaded', 'fetchedAt']) {
      expect(doc, name).not.to.include(name);
    }
  });

  // ── Mount orders (round 4a) and full flow ──────────────────────────────────

  it('IT-PHS-I-01 — workbench order setConfig → appendChild → hass loads once', async () => {
    const callApi = vi.fn(never);
    const card = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    (card as any).setConfig(CONFIG([TV]));
    document.body.appendChild(card);
    await flush(card);
    card.hass = makeHass(callApi);
    await flush(card);
    expect(callApi).toHaveBeenCalledTimes(1);
    expect(attempt(card, 'sensor.tv_power').status).to.equal('loading');
  });

  it('IT-PHS-I-02 — editor order: stub config then a real one loads once', async () => {
    const callApi = vi.fn(never);
    const card = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    card.hass = makeHass(callApi);
    (card as any).setConfig(SciFiPlugsCard.getStubConfig());
    document.body.appendChild(card);
    await flush(card);
    expect(callApi).not.toHaveBeenCalled();
    (card as any).setConfig(CONFIG([TV]));
    await flush(card);
    expect(callApi).toHaveBeenCalledTimes(1);
  });

  it('IT-PHS-I-03 — loading → timeout error → retry → chart', async () => {
    const d = deferred<unknown>();
    const callApi = vi.fn().mockReturnValueOnce(never()).mockReturnValueOnce(d.promise);
    const card = await mount([TV], callApi);
    expect(q(card, '.history-loading')).to.exist;
    await vi.advanceTimersByTimeAsync(2000);
    await flush(card);
    expect(q(card, '.history-error')).to.exist;
    await clickRetry(card);
    expect(q(card, '.history-loading')).to.exist;
    d.resolve([points(3)]);
    await flush(card);
    expect(q(card, '.history-loading')).to.be.null;
    expect(q(card, '.chart-container')!.style.display).to.equal('block');
    expect(drawSpy).toHaveBeenCalled();
    expect(callApi).toHaveBeenCalledTimes(2);
  });

  it('IT-PHS-I-04 — mount order hass → setConfig → appendChild loads once', async () => {
    const callApi = vi.fn(never);
    const card = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    card.hass = makeHass(callApi);
    (card as any).setConfig(CONFIG([TV]));
    document.body.appendChild(card);
    await flush(card);
    expect(callApi).toHaveBeenCalledTimes(1);
  });
});
