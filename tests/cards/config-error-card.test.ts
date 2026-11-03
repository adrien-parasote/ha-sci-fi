// @vitest-environment happy-dom
// config-error-card: per-card opt-in of the missing-entity banner.
// Shared by the seven cards of FR-6 (plus the four that must not opt in), so one
// fixture table drives TC-CEC-U-09, TC-CEC-U-15, TC-CEC-U-19 and IT-CEC-I-02/03/05.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SciFiBaseCard } from '../../src/utils/base-card.js';
import '../../src/cards/vacuum/sci-fi-vacuum.js';
import '../../src/cards/stove/sci-fi-stove.js';
import '../../src/cards/tv/sci-fi-tv.js';
import '../../src/cards/vehicles/sci-fi-vehicles.js';
import '../../src/cards/plugs/sci-fi-plugs.js';
import '../../src/cards/weather/sci-fi-weather.js';
import '../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import '../../src/cards/bridge/sci-fi-bridge.js';
import '../../src/cards/lights/sci-fi-lights.js';
import '../../src/cards/climates/sci-fi-climates.js';
import '../../src/cards/water/sci-fi-water-management.js';
import { makeMockHass, makeMockEntity } from '../fixtures/mock-hass.js';
import type { HassEntity } from '../../src/types/ha.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement { addMessage() {} });
}

type Card = SciFiBaseCard & Record<string, any>;
interface Fixture {
  tag: string;
  config: Record<string, unknown>;
  /** configured ids, in declaration order */
  ids: string[];
}

const FIXTURES: Fixture[] = [
  { tag: 'sci-fi-vacuum', ids: ['vacuum.a', 'sensor.vb'],
    config: { type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.a', sensors: { battery: 'sensor.vb' } }] } },
  { tag: 'sci-fi-stove', ids: ['climate.stove', 'sensor.stove_power'],
    config: { type: 'custom:sci-fi-stove', entity: 'climate.stove', sensors: { sensor_power: 'sensor.stove_power' } } },
  { tag: 'sci-fi-tv', ids: ['media_player.tv', 'media_player.vol'],
    config: { type: 'custom:sci-fi-tv', entity: 'media_player.tv', volume_entity: 'media_player.vol' } },
  { tag: 'sci-fi-vehicles', ids: ['device_tracker.v', 'sensor.v_batt'],
    config: { type: 'custom:sci-fi-vehicles', vehicles: [{ id: 'v1', name: 'V', battery_level: 'sensor.v_batt', location: 'device_tracker.v' }] } },
  { tag: 'sci-fi-plugs', ids: ['switch.p1', 'sensor.p1_power', 'switch.p2'],
    config: { type: 'custom:sci-fi-plugs', devices: [
      { device_id: 'd1', entity_id: 'switch.p1', sensors: { 'sensor.p1_power': { power: true } } },
      { device_id: 'd2', entity_id: 'switch.p2' } ] } },
  { tag: 'sci-fi-weather', ids: ['weather.home', 'sensor.alert'],
    config: { type: 'custom:sci-fi-weather', weather_entity: 'weather.home', alert: { entity_id: 'sensor.alert' } } },
  { tag: 'sci-fi-hexa-tiles', ids: ['light.t1', 'light.t2', 'weather.w'],
    config: { type: 'custom:sci-fi-hexa-tiles', tiles: [{ entity: 'light.t1' }, { entity: 'light.t2' }],
      weather: { activate: true, weather_entity: 'weather.w' } } },
];
const NOT_OPTED_IN: Fixture[] = [
  { tag: 'sci-fi-bridge', ids: [], config: { type: 'custom:sci-fi-bridge', persons: [{ entity: 'person.x' }] } },
  { tag: 'sci-fi-lights', ids: [], config: { type: 'custom:sci-fi-lights' } },
  { tag: 'sci-fi-climates', ids: [], config: { type: 'custom:sci-fi-climates', header: { display: true } } },
  { tag: 'sci-fi-water-management', ids: [], config: { type: 'custom:sci-fi-water-management' } },
];

const entity = (id: string): HassEntity => makeMockEntity({ entity_id: id, state: 'on' });
const hassOf = (ids: string[]) =>
  makeMockHass({ language: 'en', states: Object.fromEntries(ids.map(i => [i, entity(i)])) });

async function mount(fx: Fixture, present: string[] | null, config = fx.config): Promise<Card> {
  const el = document.createElement(fx.tag) as Card;
  el.setConfig(config as never);
  if (present) el.hass = hassOf(present);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}
const msgOf = (el: Card) => el.shadowRoot!.querySelector('.sf-error-message')?.textContent ?? null;
const isBanner = (el: Card) => (msgOf(el) ?? '').startsWith('Entity not found:');

describe('config-error-card per-card opt-in', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('TC-CEC-U-09: seven cards return configured ids only; four keep []; no card overrides render', () => {
    const base = SciFiBaseCard.prototype as unknown as Record<string, unknown>;
    for (const fx of [...FIXTURES, ...NOT_OPTED_IN]) {
      const el = document.createElement(fx.tag) as Card;
      el.setConfig(fx.config as never);
      el.hass = hassOf([]);
      const configured = el['getConfiguredEntities']() as string[];
      const relevant = el['getRelevantEntities']() as string[];
      if (fx.ids.length) {
        expect(configured, fx.tag).toEqual(fx.ids);
        expect(configured.every(i => relevant.includes(i)), fx.tag).toBe(true);
        expect(configured.some(i => /^(sun\.sun|person\.|zone\.)/.test(i)), fx.tag).toBe(false);
      } else {
        expect(configured, fx.tag).toEqual([]);
      }
      let proto = Object.getPrototypeOf(el) as object;
      while (proto !== SciFiBaseCard.prototype) {
        expect(Object.prototype.hasOwnProperty.call(proto, 'render'), `${fx.tag} overrides render`).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(proto, 'getMissingEntities'), `${fx.tag} overrides getMissingEntities`).toBe(false);
        proto = Object.getPrototypeOf(proto) as object;
      }
      expect(el['getMissingEntities']).toBe(base['getMissingEntities']);
    }
  });

  it.each(FIXTURES.map(f => [f.tag, f] as const))(
    'IT-CEC-I-02: %s shows the banner when all absent, its own content when one is present',
    async (_tag, fx) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const empty = await mount(fx, []);
      const expected = `Entity not found: ${fx.ids.slice(0, 3).join(', ')}${fx.ids.length > 3 ? `, … (+${fx.ids.length - 3})` : ''}`;
      expect(msgOf(empty)).toBe(expected);
      expect(empty.shadowRoot!.textContent).toContain(fx.ids[0]);
      const one = await mount(fx, [fx.ids[fx.ids.length - 1]!]);
      expect(isBanner(one)).toBe(false);
      expect(one.shadowRoot!.querySelector('ha-card')).not.toBeNull();
    },
  );

  it('IT-CEC-I-02: stove with the main entity missing and a sensor present keeps its own message', async () => {
    const fx = FIXTURES[1]!;
    const el = await mount(fx, ['sensor.stove_power']);
    expect(el.shadowRoot!.textContent).toContain('Stove entity not found: climate.stove');
    expect(isBanner(el)).toBe(false);
  });

  it.each(NOT_OPTED_IN.map(f => [f.tag, f] as const))(
    'IT-CEC-I-03: %s never renders the generic banners',
    async (_tag, fx) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const el = await mount(fx, []);
      const text = el.shadowRoot!.textContent ?? '';
      expect(text).not.toContain('Entity not found:');
      expect(text).not.toContain('Card setup required:');
    },
  );

  it('IT-CEC-I-05: tv and plugs keep their own treatment under partial absence, banner supersedes when all absent', async () => {
    const tv = FIXTURES[2]!;
    const partial = await mount(tv, ['media_player.vol']);
    expect(partial.shadowRoot!.querySelector('.offline-banner')?.textContent).toContain('TACTICAL BRIDGE DISCONNECTED');
    expect(isBanner(partial)).toBe(false);
    const none = await mount(tv, []);
    expect(none.shadowRoot!.querySelector('.offline-banner')).toBeNull();
    expect(isBanner(none)).toBe(true);

    const plugs = FIXTURES[4]!;
    const one = await mount(plugs, ['switch.p2']);
    expect(isBanner(one)).toBe(false);
    expect(one.shadowRoot!.querySelector('ha-card')).not.toBeNull();
    const all = await mount(plugs, []);
    expect(msgOf(all)).toBe('Entity not found: switch.p1, sensor.p1_power, switch.p2');
  });

  it('TC-CEC-U-12: a malformed vacuum config never throws out of render()', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const el = document.createElement('sci-fi-vacuum') as Card;
    el.setConfig({ type: 'custom:sci-fi-vacuum', vacuums: 5 } as never);
    el.hass = hassOf([]);
    expect(() => el.render()).not.toThrow();
  });

  it('TC-CEC-U-15: invalid setConfig still throws, no banner is attached to it', async () => {
    const el = document.createElement('sci-fi-tv') as Card;
    expect(() => el.setConfig({ type: 'custom:sci-fi-tv' } as never)).toThrow();
    expect(() => el.setConfig(null as never)).toThrow();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('ha-card')).toBeNull();

    const kept = await mount(FIXTURES[2]!, ['media_player.tv']);
    expect(() => kept.setConfig({ type: 'custom:sci-fi-tv' } as never)).toThrow();
    kept.requestUpdate();
    await kept.updateComplete;
    expect(kept.shadowRoot!.textContent).not.toContain('Card setup required');
    expect(isBanner(kept)).toBe(false);
    expect(kept.shadowRoot!.querySelector('ha-card')).not.toBeNull();
  });

  it('TC-CEC-U-19: hexa-tiles lists configured ids only, weather ones only when activated', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const hexa = FIXTURES[6]!;
    const cfg = (extra: Record<string, unknown>) => ({ type: 'custom:sci-fi-hexa-tiles', ...extra });
    // (a) partial absence renders
    const a = await mount(hexa, ['light.t1']);
    expect(isBanner(a)).toBe(false);
    // (b) tiles missing, weather inactive: banner names tiles, not weather
    const b = await mount(hexa, [], cfg({
      tiles: [{ entity: 'light.t1' }, { entity: 'light.t2' }],
      weather: { activate: false, weather_entity: 'weather.w' },
    }));
    expect(msgOf(b)).toBe('Entity not found: light.t1, light.t2');
    // (c) no tile, weather inactive: empty list, no banner
    const c = await mount(hexa, [], cfg({ tiles: [], weather: { activate: false, weather_entity: 'weather.w' } }));
    expect(c['getConfiguredEntities']()).toEqual([]);
    expect(isBanner(c)).toBe(false);
    // entity_kind expansions are never "configured"
    const d = await mount(hexa, ['light.k1', 'light.k2'], cfg({ tiles: [{ entity_kind: 'light' }] }));
    expect(d['getConfiguredEntities']()).toEqual([]);
  });

  it.each(FIXTURES.map(f => [f.tag, f] as const))(
    'IT-CEC-I-06: %s follows the data on the SAME element (banner -> card -> banner, real oldHass)',
    async (_tag, fx) => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const el = await mount(fx, []);
      expect(isBanner(el)).toBe(true);
      el.hass = hassOf(fx.ids);
      await el.updateComplete;
      expect(isBanner(el)).toBe(false);
      expect(el.shadowRoot!.querySelector('ha-card')).not.toBeNull();
      el.hass = hassOf([]);
      await el.updateComplete;
      expect(isBanner(el)).toBe(true);
    },
  );

  it('IT-CEC-I-07: plugs draws its power chart after the entities reappear on the same element (FR-5)', async () => {
    const fx = FIXTURES[4]!;
    const el = await mount(fx, []);
    expect(isBanner(el)).toBe(true);
    const callApi = vi.fn().mockResolvedValue([[
      { last_changed: '2026-01-01T10:00:00Z', state: '1' },
      { last_changed: '2026-01-01T11:00:00Z', state: '2' },
    ]]);
    const hass = hassOf(fx.ids);
    (hass as unknown as Record<string, unknown>).callApi = callApi;
    el.hass = hass;
    await el.updateComplete;
    await vi.waitFor(() => expect(el.shadowRoot!.querySelector('.chart-container canvas')).not.toBeNull());
    // card -> banner -> card again: the chart container is new, the canvas must come back
    const destroy = vi.fn();
    el['_chart'] = { destroy, data: {}, update: vi.fn() };
    const hass2 = hassOf([]);
    (hass2 as unknown as Record<string, unknown>).callApi = callApi;
    el.hass = hass2;
    await el.updateComplete;
    expect(isBanner(el)).toBe(true);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(el['_chart']).toBeNull();
    const hass3 = hassOf(fx.ids);
    (hass3 as unknown as Record<string, unknown>).callApi = callApi;
    el.hass = hass3;
    await el.updateComplete;
    await vi.waitFor(() => expect(el.shadowRoot!.querySelector('.chart-container canvas')).not.toBeNull());
  });

  it('IT-CEC-I-07: plugs with an empty history keeps its empty-state message after banner -> card', async () => {
    const fx = FIXTURES[4]!;
    const el = await mount(fx, []);
    const callApi = vi.fn().mockResolvedValue([[]]);
    const withApi = (ids: string[]) => {
      const h = hassOf(ids);
      (h as unknown as Record<string, unknown>).callApi = callApi;
      return h;
    };
    el.hass = withApi(fx.ids);
    await el.updateComplete;
    await vi.waitFor(() => expect(el.shadowRoot!.querySelector('.msg-container')?.textContent).toBe('No power data to display'));
    el.hass = withApi([]);
    await el.updateComplete;
    el.hass = withApi(fx.ids);
    await el.updateComplete;
    await vi.waitFor(() => expect(el.shadowRoot!.querySelector('.msg-container')?.textContent).toBe('No power data to display'));
    expect((el.shadowRoot!.querySelector('.chart-container') as HTMLElement).style.display).toBe('none');
    expect(callApi).toHaveBeenCalledTimes(1);
  });

  it('IT-CEC-I-08: weather drops a chart bound to a canvas the banner removed', async () => {
    const fx = FIXTURES[5]!;
    const el = await mount(fx, fx.ids);
    const canvas = el.shadowRoot!.querySelector('#weather-chart') as HTMLCanvasElement | null;
    expect(canvas).not.toBeNull();
    const destroy = vi.fn();
    el['_chart'] = { canvas: document.createElement('canvas'), destroy, data: {}, options: {}, update: vi.fn() };
    el.requestUpdate();
    await el.updateComplete;
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(el['_chart']?.destroy).not.toBe(destroy);
  });
});
