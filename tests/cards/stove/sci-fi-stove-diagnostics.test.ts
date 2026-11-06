// @vitest-environment happy-dom
/**
 * sci-fi-stove — diagnostics (door, alert, error).
 * Spec: docs/specs/stove-diagnostics/spec.md
 */
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import '../../../src/components/sf-toast.js';
import '../../../src/cards/stove/sci-fi-stove.js';
import type { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';

const CLIMATE = 'climate.poele';
const STATUS = 'sensor.stove_detailed_stove_status';
const INSIDE = 'sensor.stove_inside_temperature';
const DOOR = 'binary_sensor.stove_door';
const ALERT = 'sensor.stove_alert';
const ERROR = 'sensor.stove_error';
const POWER = 'number.stove_power_level';
const FAN = 'number.stove_fan_speed';

function climate() {
  return makeMockEntity({
    entity_id: CLIMATE,
    state: 'heat',
    attributes: { friendly_name: 'Poêle', hvac_modes: ['off', 'heat'], min_temp: 18, max_temp: 22, temperature: 20 },
  });
}

/** B-1: Lit comments removed, consecutive whitespace collapsed, trimmed. */
function normalize(markup: string): string {
  return markup.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
}

const read = (rel: string): string => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

const BASE_SENSORS = { sensor_status: STATUS, sensor_inside_temperature: INSIDE };
const baseStates = (): Record<string, any> => ({
  [CLIMATE]: climate(),
  [STATUS]: makeMockEntity({ entity_id: STATUS, state: 'combustion' }),
  [INSIDE]: makeMockEntity({ entity_id: INSIDE, state: '20.5' }),
});
const DIAG = { sensor_door: DOOR, sensor_alert: ALERT, sensor_error: ERROR };
const ent = (id: string, state: unknown, attributes: Record<string, unknown> = {}) =>
  makeMockEntity({ entity_id: id, state: state as string, attributes });

const hassOf = (states: Record<string, any>, extra: Record<string, unknown> = {}, callService?: any) =>
  ({ ...makeMockHass({ states, language: 'en', callService }), ...extra }) as any;

async function mount(
  sensors: Record<string, unknown>,
  states: Record<string, any>,
  extra: Record<string, unknown> = {},
  config: Record<string, unknown> = {},
  callService?: any,
): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, sensors: { ...BASE_SENSORS, ...sensors }, ...config });
  el.hass = hassOf(states, extra, callService);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const root = (el: SciFiStoveCard): ShadowRoot => el.shadowRoot!;
const content = (el: SciFiStoveCard): string => normalize(root(el).querySelector('.content')!.innerHTML);
const snapshotFile = path.join(__dirname, '__snapshots__', 'sci-fi-stove-diagnostics.test.ts.snap');
/** FR-0: the pre-lot content, read from the committed snapshot (never rewritten). */
function preLot(): string {
  const snap = fs.readFileSync(snapshotFile, 'utf8');
  const m = snap.match(/pre-lot content 1`\] = `"([\s\S]*)"`;/);
  if (!m) throw new Error('pre-lot snapshot missing');
  return m[1]!.replace(/\\`/g, '`').replace(/\\\\/g, '\\');
}
const noDiagnostics = (el: SciFiStoveCard) => {
  expect(root(el).querySelector('.diagnostics')).toBeNull();
  expect(root(el).querySelector('.diagnostic')).toBeNull();
  expect(root(el).querySelector('.diagnostic-badge')).toBeNull();
  expect(content(el)).toBe(preLot());
};
const textOf = (el: SciFiStoveCard, kind: string): string | undefined =>
  root(el).querySelector(`.diagnostic.${kind} .diagnostic-text`)?.textContent?.trim();

const NAMES = ['NUMBER_DEBOUNCE_MS', 'NUMBER_MAX_ITEMS', 'NUMBER_DOMAINS', 'NumberTrio', 'NumberWheelKey', 'NumberWheelSpec',
  'NUMBER_WHEELS', 'NumberPick', 'NumberPicks', 'NumberGrid', 'NumberEntity', 'isNumeric', 'decimals', 'gridOf', 'numberGrid',
  'numberValue', 'isNumberDisabled'];
const VALUES = ['NUMBER_DEBOUNCE_MS', 'NUMBER_MAX_ITEMS', 'NUMBER_DOMAINS', 'NUMBER_WHEELS', 'isNumeric', 'decimals', 'gridOf',
  'numberGrid', 'numberValue', 'isNumberDisabled'];

/** CSS rule bodies whose selector list holds `sel` exactly (exact) or as a compound (compound). */
function rules(css: string, sel: string, exact: boolean): string {
  const out: string[] = [];
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1]!.split(',').map((s) => s.trim().replace(/\s+/g, ' '));
    const hit = selectors.some((s) => (exact ? s === sel : s.split(' ').includes(sel)));
    if (hit) out.push(m[2]!);
  }
  return out.join('\n');
}

describe('sci-fi-stove — diagnostics', () => {
  beforeEach(async () => {
    await setLocale('en');
    document.body.innerHTML = '';
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('TC-SDG-U-00: pre-lot content', async () => {
    const el = await mount({}, baseStates());
    expect(content(el)).toMatchSnapshot('pre-lot content');
  });

  it('TC-SDG-U-01: the number-wheel mechanism lives in number-wheel.ts', async () => {
    const mod: Record<string, unknown> = await import('../../../src/cards/stove/number-wheel.js');
    for (const n of VALUES) expect(typeof mod[n], n).not.toBe('undefined');
    const wheel = read('src/cards/stove/number-wheel.ts');
    const card = read('src/cards/stove/sci-fi-stove.ts');
    for (const n of NAMES) {
      expect(wheel, n).toMatch(new RegExp(`^export (const|function|interface|type) ${n}\\b`, 'm'));
      expect(card, n).not.toMatch(new RegExp(`^(export )?(const|function|interface|type) ${n}\\b`, 'm'));
    }
    expect(card).toContain("from './number-wheel");
    const el = await mount({}, baseStates());
    expect(content(el)).toBe(preLot());
  });

  it('TC-SDG-U-02: invalid or absent fields change nothing', async () => {
    const a = await mount({}, baseStates());
    noDiagnostics(a);
    const b = await mount({ sensor_door: 42, sensor_alert: ['x'], sensor_error: '  ' }, baseStates());
    noDiagnostics(b);
    const ids = (b as any).getRelevantEntities() as unknown[];
    expect(ids.some((i) => /_door|_alert|_error/.test(String(i)) || i === 42 || Array.isArray(i))).toBe(false);
    expect(ids).not.toContain('  ');
  });

  it('TC-SDG-U-03: inactive states render nothing', async () => {
    const cases: Array<[unknown, unknown, unknown]> = [
      ['off', 'none', 'none'],
      ['unavailable', 'unknown', 'unavailable'],
      ['OFF', ' None ', 'UNKNOWN'],
      ['off', '', '   '],
    ];
    for (const [d, a, e] of cases) {
      const el = await mount(DIAG, { ...baseStates(), [DOOR]: ent(DOOR, d), [ALERT]: ent(ALERT, a), [ERROR]: ent(ERROR, e) });
      noDiagnostics(el);
      const ids = (el as any).getRelevantEntities() as string[];
      expect(ids).toEqual(expect.arrayContaining([DOOR, ALERT, ERROR]));
      el.remove();
    }
    noDiagnostics(await mount(DIAG, baseStates()));
    const proto = Object.assign(
      Object.create({ [DOOR]: ent(DOOR, 'on'), [ALERT]: ent(ALERT, 'low_fuel'), [ERROR]: ent(ERROR, 'e101', { code: 'E101' }) }),
      baseStates(),
    );
    noDiagnostics(await mount(DIAG, proto));
  });

  it('TC-SDG-U-04: door open renders a line and no badge', async () => {
    for (const state of ['on', ' ON ']) {
      const el = await mount({ sensor_door: DOOR }, { ...baseStates(), [DOOR]: ent(DOOR, state) });
      const zone = root(el).querySelector('.diagnostics') as HTMLElement;
      expect(zone).not.toBeNull();
      expect(zone.previousElementSibling!.classList.contains('status')).toBe(true);
      expect(zone.getAttribute('role')).toBe('status');
      expect(zone.getAttribute('aria-live')).toBe('polite');
      const lines = zone.querySelectorAll('.diagnostic');
      expect(lines.length).toBe(1);
      expect(lines[0]!.classList.contains('door')).toBe(true);
      const icon = lines[0]!.querySelector('sf-icon')!;
      expect(icon.getAttribute('icon')).toBe('mdi:door-open');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      const text = lines[0]!.querySelector('.diagnostic-text')!;
      expect(text.textContent!.trim()).toBe('Door open');
      expect(text.getAttribute('title')).toBe('Door open');
      expect(root(el).querySelector('.diagnostic-badge')).toBeNull();
      el.remove();
    }
  });

  it('TC-SDG-U-05: error text with its code', async () => {
    const cases: Array<[unknown, string]> = [
      ['E101', 'Ignition failure (E101)'],
      [undefined, 'Ignition failure'],
      [101, 'Ignition failure (101)'],
      [0, 'Ignition failure (0)'],
      ['', 'Ignition failure'],
      ['  ', 'Ignition failure'],
      [NaN, 'Ignition failure'],
      [Infinity, 'Ignition failure'],
      [{}, 'Ignition failure'],
      [true, 'Ignition failure'],
      [' E101 ', 'Ignition failure (E101)'],
    ];
    for (const [code, expected] of cases) {
      const fmt = vi.fn(() => 'Ignition failure');
      const err = ent(ERROR, 'e101', code === undefined ? {} : { code });
      const el = await mount({ sensor_error: ERROR }, { ...baseStates(), [ERROR]: err }, { formatEntityState: fmt });
      const text = textOf(el, 'error')!;
      expect(text).toBe(expected);
      expect(text).not.toContain('()');
      expect(text).not.toContain('( )');
      expect(fmt).toHaveBeenCalledWith(err);
      el.remove();
    }
    const el = await mount({ sensor_error: ERROR }, { ...baseStates(), [ERROR]: ent(ERROR, 'e101', { code: 'E101' }) },
      { formatEntityState: () => 'e101' });
    expect(textOf(el, 'error')).toBe('E101');
  });

  it('TC-SDG-U-06: alert label via formatEntityState, with a fallback', async () => {
    const errors = vi.spyOn(console, 'error');
    const states = () => ({ ...baseStates(), [ALERT]: ent(ALERT, 'low_fuel') });
    const a = await mount({ sensor_alert: ALERT }, states());
    expect(textOf(a, 'alert')).toBe('low fuel');
    expect(root(a).querySelector('.diagnostic.alert sf-icon')!.getAttribute('icon')).toBe('mdi:alert');
    a.remove();
    const b = await mount({ sensor_alert: ALERT }, states(), { formatEntityState: () => '<b>x</b>' });
    expect(textOf(b, 'alert')).toBe('<b>x</b>');
    expect(root(b).querySelector('.diagnostic.alert .diagnostic-text')!.getAttribute('title')).toBe('<b>x</b>');
    expect(root(b).querySelector('b')).toBeNull();
    b.remove();
    for (const fmt of [() => { throw new Error('boom'); }, () => 42, () => '', () => '  ']) {
      const el = await mount({ sensor_alert: ALERT }, states(), { formatEntityState: fmt });
      expect(textOf(el, 'alert')).toBe('low fuel');
      el.remove();
    }
    expect(errors).not.toHaveBeenCalled();
  });

  it('TC-SDG-U-07: order, no badge, door/alert fusion', async () => {
    const labels: Record<string, string> = { low_fuel: 'Low fuel', e110: 'Flue gas', door_open: 'Door open alert', ' DOOR_OPEN ': 'Door open alert' };
    const fmt = (s: any) => labels[s.state] ?? s.state;
    const all = await mount(DIAG, {
      ...baseStates(), [DOOR]: ent(DOOR, 'on'), [ALERT]: ent(ALERT, 'low_fuel'), [ERROR]: ent(ERROR, 'e110', { code: 'E110' }),
    }, { formatEntityState: fmt });
    const kinds = [...root(all).querySelectorAll('.diagnostics .diagnostic')].map((n) => n.classList[1]);
    expect(kinds).toEqual(['door', 'alert', 'error']);
    expect(root(all).querySelector('.diagnostic-badge')).toBeNull();
    all.remove();
    const two = await mount(DIAG, { ...baseStates(), [DOOR]: ent(DOOR, 'on'), [ALERT]: ent(ALERT, 'low_fuel') }, { formatEntityState: fmt });
    expect([...root(two).querySelectorAll('.diagnostics .diagnostic')].map((n) => n.classList[1])).toEqual(['door', 'alert']);
    two.remove();
    for (const alert of ['door_open', ' DOOR_OPEN ']) {
      const el = await mount(DIAG, {
        ...baseStates(), [DOOR]: ent(DOOR, 'on'), [ALERT]: ent(ALERT, alert), [ERROR]: ent(ERROR, 'none'),
      }, { formatEntityState: fmt });
      expect(root(el).querySelectorAll('.diagnostic').length).toBe(1);
      expect(root(el).querySelector('.diagnostic.door')).toBeNull();
      expect(textOf(el, 'alert')).toBe('Door open alert');
      el.remove();
    }
  });

  it('TC-SDG-U-08: stylesheet of the diagnostics', () => {
    const css = read('src/cards/stove/styles.ts');
    expect(rules(css, '.content', true)).toMatch(/position:\s*relative/);
    expect(css).not.toContain('.diagnostic-badge');
    expect(rules(css, '.content .info .m .temperatures .temperature.high div:last-child', true)).toContain('#ff4444');
    for (const kind of ['door', 'alert', 'error']) {
      expect(rules(css, `.diagnostic.${kind}`, false), kind).toContain('#ff4444');
    }
    expect(rules(css, '.diagnostic', true)).toMatch(/display:\s*flex/);
    const t = rules(css, '.diagnostic-text', true);
    for (const decl of [/white-space:\s*nowrap/, /overflow:\s*hidden/, /text-overflow:\s*ellipsis/, /min-width:\s*0/]) {
      expect(t).toMatch(decl);
    }
  });

  it('TC-SDG-U-10: strings translated, stove.md documents the diagnostics', () => {
    const xlf = read('xliff/fr.xlf');
    const js = read('src/locales/locales/fr.js');
    for (const [source, target] of [
      ['Door open', 'Porte ouverte'],
      ['Stove door', 'Porte du poêle'],
      ['Stove alert', 'Alerte du poêle'],
      ['Stove error', 'Erreur du poêle'],
    ]) {
      expect(xlf).toMatch(new RegExp(`<source>${source}</source>\\s*<target>${target}</target>`));
      expect(js).toContain(`\`${target}\``);
    }
    const doc = read('docs/specs/cards/stove.md');
    for (const token of ['F-STOVE-D11', '### Diagnostics — porte, alerte, erreur', '.diagnostics', '.diagnostic-text',
      'aria-live', 'door_open', '200 caractères', 'domaine inattendu', 'formatEntityState']) {
      expect(doc, token).toContain(token);
    }
  });

  it('TC-SDG-U-11: the card stays within 800 lines', () => {
    expect(read('src/cards/stove/sci-fi-stove.ts').split('\n').length).toBeLessThanOrEqual(800);
  });

  it('TC-SDG-U-12: an unexpected domain is ignored', async () => {
    const warn = vi.spyOn(console, 'warn');
    const err = vi.spyOn(console, 'error');
    // The card's own sf-icons warn about the mock connection; any other call counts.
    const other = (spy: typeof warn) => spy.mock.calls.filter((c) => !String(c[0]).startsWith('[sf-icon]'));
    const el = await mount(
      { sensor_door: 'sensor.stove_door', sensor_alert: 'binary_sensor.stove_alert', sensor_error: 'switch.stove_error' },
      {
        ...baseStates(),
        'sensor.stove_door': ent('sensor.stove_door', 'on'),
        'binary_sensor.stove_alert': ent('binary_sensor.stove_alert', 'low_fuel'),
        'switch.stove_error': ent('switch.stove_error', 'e101', { code: 'E101' }),
      },
    );
    noDiagnostics(el);
    expect(other(warn)).toEqual([]);
    expect(other(err)).toEqual([]);
  });

  it('TC-SDG-U-13: long texts are capped in title', async () => {
    const A = 'a'.repeat(300);
    const e1 = await mount({ sensor_error: ERROR }, { ...baseStates(), [ERROR]: ent(ERROR, 'e101', { code: 'E101' }) },
      { formatEntityState: () => A });
    const t1 = root(e1).querySelector('.diagnostic.error .diagnostic-text')!;
    expect(t1.textContent!.trim()).toBe(`${A} (E101)`);
    const title1 = t1.getAttribute('title')!;
    expect(title1.length).toBeLessThanOrEqual(200);
    expect(title1.endsWith('… (E101)')).toBe(true);
    e1.remove();
    const a1 = await mount({ sensor_alert: ALERT }, { ...baseStates(), [ALERT]: ent(ALERT, 'low_fuel') },
      { formatEntityState: () => 'b'.repeat(300) });
    expect(root(a1).querySelector('.diagnostic.alert .diagnostic-text')!.getAttribute('title')).toBe(`${'b'.repeat(199)}…`);
    a1.remove();
    const C = 'C'.repeat(40);
    const e2 = await mount({ sensor_error: ERROR }, { ...baseStates(), [ERROR]: ent(ERROR, 'e101', { code: C }) },
      { formatEntityState: () => A });
    const t2 = root(e2).querySelector('.diagnostic.error .diagnostic-text')!;
    expect(t2.textContent!.trim()).toBe(`${A} (${C})`);
    const title2 = t2.getAttribute('title')!;
    expect(title2.length).toBeLessThanOrEqual(200);
    expect(title2.endsWith(`… (${'C'.repeat(32)})`)).toBe(true);
    e2.remove();
  });

  it('IT-SDG-I-01: real element shows the error', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, sensors: { ...BASE_SENSORS, sensor_error: ERROR } });
    el.hass = hassOf({ ...baseStates(), [ERROR]: ent(ERROR, 'e101', { code: 'E101' }) }, { formatEntityState: () => 'Ignition failure' });
    document.body.appendChild(el);
    await el.updateComplete;
    const t = root(el).querySelector('.diagnostics[role="status"][aria-live="polite"] .diagnostic.error .diagnostic-text');
    expect(t!.textContent!.trim()).toBe('Ignition failure (E101)');
    expect(root(el).querySelector('.diagnostic-badge')).toBeNull();
  });

  it('test_O1_a_diagnostic_is_shown_once_in_the_status_zone_with_no_badge', async () => {
    const el = await mount(DIAG, { ...baseStates(), [DOOR]: ent(DOOR, 'on'), [ERROR]: ent(ERROR, 'e101', { code: 'E101' }) }, { formatEntityState: () => 'Ignition failure' });
    const content = root(el).querySelector('.content')!;
    expect([...content.children].map((c) => c.tagName.toLowerCase() + (c.className ? `.${c.className}` : ''))).toEqual(['sf-stove-image', 'div.info']);
    expect(content.querySelectorAll('.diagnostics .diagnostic').length).toBe(2);
    expect(root(el).querySelector('.diagnostic-badge')).toBeNull();
    expect(root(el).querySelectorAll('sf-icon[icon="mdi:door-open"]').length).toBe(1);
  });

  it('IT-SDG-I-02: the error going back to none removes everything', async () => {
    const el = await mount({ sensor_error: ERROR }, { ...baseStates(), [ERROR]: ent(ERROR, 'e101', { code: 'E101' }) },
      { formatEntityState: () => 'Ignition failure' });
    expect(root(el).querySelector('.diagnostics')).not.toBeNull();
    el.hass = hassOf({ ...baseStates(), [ERROR]: ent(ERROR, 'none') }, { formatEntityState: () => 'None' });
    await el.updateComplete;
    noDiagnostics(el);
  });

  it('IT-SDG-I-03: diagnostics do not disturb the number wheels', async () => {
    vi.useFakeTimers();
    const call = vi.fn(() => Promise.resolve({}));
    const el = await mount(DIAG, {
      ...baseStates(), [DOOR]: ent(DOOR, 'on'), [ALERT]: ent(ALERT, 'none'), [ERROR]: ent(ERROR, 'none'),
      [POWER]: ent(POWER, '2', { min: 1, max: 5, step: 1 }), [FAN]: ent(FAN, '2', { min: 0, max: 5, step: 1 }),
    }, {}, { number_power_level: POWER, number_fan_speed: FAN }, call);
    const power = root(el).querySelector('sf-wheel.power-level')!;
    expect(root(el).querySelector('sf-wheel.fan-speed')).not.toBeNull();
    expect(root(el).querySelector('.diagnostic.door')).not.toBeNull();
    power.dispatchEvent(new CustomEvent('wheel-change', { detail: { id: '3', text: '3' }, bubbles: true, composed: true }));
    await el.updateComplete;
    await vi.advanceTimersByTimeAsync(400);
    expect(call).toHaveBeenCalledTimes(1);
    expect(call).toHaveBeenCalledWith('number', 'set_value', expect.objectContaining({ entity_id: POWER }));
  });

  it('IT-SDG-I-04: a long error renders whole, the stylesheet ellipsises it', async () => {
    const A = 'a'.repeat(300);
    const el = await mount({ sensor_error: ERROR }, { ...baseStates(), [ERROR]: ent(ERROR, 'e101') }, { formatEntityState: () => A });
    expect(textOf(el, 'error')).toBe(A);
    const ctor = customElements.get('sci-fi-stove') as any;
    const sheets = ([] as any[]).concat(ctor.styles).flat(Infinity).map((s: any) => String(s.cssText ?? s)).join('\n');
    const t = rules(sheets, '.diagnostic-text', true);
    expect(t).toMatch(/white-space:\s*nowrap/);
    expect(t).toMatch(/text-overflow:\s*ellipsis/);
  });
});
