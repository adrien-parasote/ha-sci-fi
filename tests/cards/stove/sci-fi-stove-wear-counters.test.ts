// @vitest-environment happy-dom
/**
 * sci-fi-stove — wear counters.
 * Spec: docs/specs/stove-wear-counters/spec.md
 */
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import '../../../src/components/sf-toast.js';
import '../../../src/cards/stove/sci-fi-stove.js';
import type { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';
import { SciFiStoveCard as CardClass } from '../../../src/cards/stove/sci-fi-stove.js';
import { formattedState, rawState, stateLabel } from '../../../src/cards/stove/state-label.js';
import { wearValue, wearEntityIds, wearRows, WEAR_COUNTERS, WEAR_MISSING } from '../../../src/cards/stove/wear-counters.js';

const CLIMATE = 'climate.poele';
const STATUS = 'sensor.stove_detailed_stove_status';
const INSIDE = 'sensor.stove_inside_temperature';

/** B-1: Lit comments removed, consecutive whitespace collapsed, trimmed. */
function normalize(markup: string): string {
  return markup.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
}

const ent = (id: string, state: unknown, attributes: Record<string, unknown> = {}) =>
  makeMockEntity({ entity_id: id, state: state as string, attributes });
const baseStates = (): Record<string, any> => ({
  [CLIMATE]: ent(CLIMATE, 'heat', { friendly_name: 'Poêle', hvac_modes: ['off', 'heat'], min_temp: 18, max_temp: 22, temperature: 20 }),
  [STATUS]: ent(STATUS, 'combustion'),
  [INSIDE]: ent(INSIDE, '20.5'),
});
const IDS = {
  sensor_heating_time: 'sensor.stove_heating_time',
  sensor_fuel_used: 'sensor.stove_fuel_used',
  sensor_igniter_starts: 'sensor.stove_igniter_starts',
  sensor_misfires: 'sensor.stove_misfires',
  sensor_overheatings: 'sensor.stove_overheatings',
} as const;
const KEYS = ['heating_time', 'fuel_used', 'igniter_starts', 'misfires', 'overheatings'];
const LABELS = ['Heating time', 'Fuel used', 'Igniter starts', 'Misfires', 'Overheatings'];
const ICONS = ['mdi:timer-outline', 'mdi:fuel', 'mdi:fire', 'mdi:fire-alert', 'mdi:thermometer-alert'];
const VALUES = ['1 234 h', '56.7 kg', '890', '12', '3'];
const counterStates = (states: readonly unknown[]): Record<string, any> =>
  Object.fromEntries(Object.values(IDS).map((id, i) => [id, ent(id, states[i])]));
const formatter = (values: readonly string[]) =>
  vi.fn((e: any) => values[Object.values(IDS).indexOf(e.entity_id)] ?? String(e.state));
const read = (rel: string): string => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
const BASE_SENSORS = { sensor_status: STATUS, sensor_inside_temperature: INSIDE };

async function mount(sensors: Record<string, unknown>, states: Record<string, any>, extra: Record<string, unknown> = {}): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, sensors: { ...BASE_SENSORS, ...sensors } });
  el.hass = { ...makeMockHass({ states, language: 'en' }), ...extra } as any;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}
const accordion = (el: SciFiStoveCard): any => el.shadowRoot!.querySelector('sf-editor-accordion.wear-counters');
const rowsOf = (el: SciFiStoveCard): HTMLElement[] => [...el.shadowRoot!.querySelectorAll('.wear-counter')] as HTMLElement[];
const valueOf = (row: HTMLElement): HTMLElement => row.querySelector('.wear-value') as HTMLElement;
const settle = async (el: SciFiStoveCard): Promise<void> => {
  await el.updateComplete;
  const acc = accordion(el);
  if (acc) await acc.updateComplete;
  await el.updateComplete;
};
const container = (el: SciFiStoveCard): string => normalize(el.shadowRoot!.querySelector('.container')!.innerHTML);

const snapshotFile = path.join(__dirname, '__snapshots__', 'sci-fi-stove-wear-counters.test.ts.snap');
/** FR-0: the pre-lot container, read from the committed snapshot (never rewritten). */
function preLotContainer(): string {
  if (!fs.existsSync(snapshotFile)) throw new Error('pre-lot snapshot missing');
  const m = fs.readFileSync(snapshotFile, 'utf8').match(/pre-lot container 1`\] = `"([\s\S]*)"`;/);
  if (!m) throw new Error('pre-lot snapshot missing');
  return m[1]!.replace(/\\`/g, '`').replace(/\\\\/g, '\\');
}

describe('sci-fi-stove — wear counters', () => {
  beforeEach(async () => {
    await setLocale('en');
    document.body.innerHTML = '';
  });

  it('TC-SWC-U-00: pre-lot container', async () => {
    const el = await mount({}, baseStates());
    const normalized = container(el);
    expect(normalized).toMatchSnapshot('pre-lot container');
    expect(preLotContainer()).not.toBe('');
    expect(preLotContainer()).toBe(normalized);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('TC-SWC-U-01: the state label helper lives in state-label.ts', () => {
    const errors = vi.spyOn(console, 'error');
    const entity = ent('sensor.stove_alert', 'low_fuel');
    const call = vi.fn(() => 'Low fuel');
    const h = (format: unknown) => ({ formatEntityState: format }) as any;
    expect(formattedState(h(call), entity)).toBe('Low fuel');
    expect(stateLabel(h(call), entity)).toBe('Low fuel');
    expect(call).toHaveBeenCalledWith(entity);
    expect((call.mock.calls[0] as unknown[]).length).toBe(1);
    const failing = [() => { throw new Error('boom'); }, () => 42, () => '  ', undefined];
    for (const format of failing) {
      expect(formattedState(h(format), entity)).toBeUndefined();
      expect(stateLabel(h(format), entity)).toBe('low fuel');
    }
    expect(rawState(entity)).toBe('low fuel');
    expect(errors).not.toHaveBeenCalled();
    const card = read('src/cards/stove/sci-fi-stove.ts');
    expect(card).not.toContain('_stateLabel');
    expect(card).not.toContain('formatEntityState');
    expect(card).toContain("from './state-label");
  });

  it('TC-SWC-U-02: no configured counter renders the pre-lot container', async () => {
    const plain = await mount({}, baseStates());
    expect(container(plain)).toBe(preLotContainer());
    expect(accordion(plain)).toBeNull();
    document.body.innerHTML = '';
    const junk = await mount({ sensor_heating_time: 42, sensor_fuel_used: ['x'], sensor_misfires: '  ' }, baseStates());
    expect(container(junk)).toBe(preLotContainer());
    expect(accordion(junk)).toBeNull();
    const ids = (junk as any).getRelevantEntities() as unknown[];
    expect(ids).not.toContain(42);
    for (const id of Object.values(IDS)) expect(ids).not.toContain(id);
  });

  it('TC-SWC-U-03: configured but unreadable counters keep a dash row', async () => {
    const sensors = { ...IDS, sensor_heating_time: ` ${IDS.sensor_heating_time} ` };
    const first = await mount(sensors, { ...baseStates(), ...counterStates(VALUES) });
    const ids = (first as any).getRelevantEntities() as string[];
    for (const id of Object.values(IDS)) expect(ids).toContain(id);
    const protoStates = () => Object.assign(Object.create(counterStates(VALUES)), baseStates());
    const cases: Array<Record<string, any>> = [
      { ...baseStates(), ...counterStates(Array(5).fill('unavailable')) },
      { ...baseStates(), ...counterStates(Array(5).fill('UNKNOWN')) },
      { ...baseStates(), ...counterStates(Array(5).fill('')) },
      { ...baseStates(), ...counterStates(Array(5).fill('   ')) },
      baseStates(),
    ];
    for (const states of cases) {
      document.body.innerHTML = '';
      const el = await mount(sensors, states);
      expect(accordion(el)).not.toBeNull();
      const rows = rowsOf(el);
      expect(rows.map((r) => r.classList[1])).toEqual(KEYS);
      for (const r of rows) {
        expect(valueOf(r).textContent!.trim()).toBe('—');
        expect(valueOf(r).getAttribute('title')).toBe('—');
      }
    }
    document.body.innerHTML = '';
    const proto = await mount(sensors, baseStates(), {});
    proto.hass = { ...proto.hass, states: protoStates() } as any;
    await settle(proto);
    expect(rowsOf(proto).map((r) => valueOf(r).textContent!.trim())).toEqual(Array(5).fill('—'));
  });

  it('TC-SWC-U-04: five readable counters render after .bottom, collapsed', async () => {
    const el = await mount({ ...IDS }, { ...baseStates(), ...counterStates(['1', '2', '3', '4', '5']) }, { formatEntityState: formatter(VALUES) });
    const acc = accordion(el);
    expect(acc).not.toBeNull();
    expect(acc.previousElementSibling.classList.contains('bottom')).toBe(true);
    expect(acc.title).toBe('Wear');
    expect(acc.open).toBe(false);
    const rows = rowsOf(el);
    expect(rows.map((r) => r.classList[1])).toEqual(KEYS);
    rows.forEach((r, i) => {
      expect(r.classList.contains('wear-counter')).toBe(true);
      const label = r.querySelector('.wear-label')!;
      expect(label.textContent!.trim()).toBe(LABELS[i]);
      expect(label.getAttribute('title')).toBe(LABELS[i]);
      expect(valueOf(r).textContent!.trim()).toBe(VALUES[i]);
      const icon = r.querySelector('sf-icon')!;
      expect(icon.getAttribute('icon')).toBe(ICONS[i]);
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
    document.body.innerHTML = '';
    const one = await mount({ ...IDS }, { ...baseStates(), ...counterStates(['1', 'unavailable', '3', '4', '5']) }, { formatEntityState: formatter(VALUES) });
    expect(rowsOf(one)).toHaveLength(5);
    expect(one.shadowRoot!.querySelector('.wear-counter.fuel_used .wear-value')!.textContent!.trim()).toBe('—');
    document.body.innerHTML = '';
    const only = await mount({ sensor_misfires: IDS.sensor_misfires }, { ...baseStates(), ...counterStates(['1', '2', '3', '4', '5']) });
    expect(accordion(only)).not.toBeNull();
    expect(rowsOf(only).map((r) => r.classList[1])).toEqual(['misfires']);
  });

  it('TC-SWC-U-05: wearValue without a formatter, and rendered as text', async () => {
    const none = {} as any;
    expect(wearValue(none, ent('sensor.a', '1234', { unit_of_measurement: 'h' }))).toBe('1234 h');
    expect(wearValue(none, ent('sensor.a', '1234', { unit_of_measurement: 'h' }))).not.toContain(' ');
    expect(wearValue(none, ent('sensor.a', '12.5'))).toBe('12.5');
    expect(wearValue(none, ent('sensor.a', '12.5', { unit_of_measurement: '  ' }))).toBe('12.5');
    expect(wearValue(none, ent('sensor.a', '12.5', { unit_of_measurement: 42 }))).toBe('12.5');
    const inherited = { ...ent('sensor.a', '12.5'), attributes: Object.create({ unit_of_measurement: 'h' }) };
    expect(wearValue(none, inherited)).toBe('12.5');
    const throwing = { formatEntityState: () => { throw new Error('x'); } } as any;
    expect(wearValue(throwing, ent('sensor.a', '7', { unit_of_measurement: 'kg' }))).toBe('7 kg');
    const markup = await mount({ sensor_heating_time: IDS.sensor_heating_time }, { ...baseStates(), ...counterStates(['1']) }, { formatEntityState: () => '<b>x</b>' });
    expect(valueOf(rowsOf(markup)[0]!).textContent!.trim()).toBe('<b>x</b>');
    expect(markup.shadowRoot!.querySelector('.wear-value b')).toBeNull();
    document.body.innerHTML = '';
    const long = 'x'.repeat(500);
    const el = await mount({ sensor_heating_time: IDS.sensor_heating_time }, { ...baseStates(), ...counterStates(['1']) }, { formatEntityState: () => long });
    const v = valueOf(rowsOf(el)[0]!);
    expect(v.textContent!.trim()).toHaveLength(200);
    expect(v.textContent!.trim().endsWith('…')).toBe(true);
    expect(v.getAttribute('title')).toBe(long);
  });

  it('TC-SWC-U-06: wrong domains and malformed ids render a dash, never read', async () => {
    const warns = vi.spyOn(console, 'warn');
    const errors = vi.spyOn(console, 'error');
    const longId = 'sensor.' + 'a'.repeat(300);
    const sensors = {
      sensor_heating_time: 'sensor.x', sensor_fuel_used: 'binary_sensor.x', sensor_igniter_starts: longId,
      sensor_misfires: 'switch.x', sensor_overheatings: 'sensor.X <b>',
    };
    const states = { ...baseStates(), 'sensor.x': ent('sensor.x', '5'), 'binary_sensor.x': ent('binary_sensor.x', 'on'),
      [longId]: ent(longId, '6'), 'switch.x': ent('switch.x', 'on'), 'sensor.X <b>': ent('sensor.X <b>', '7') };
    const el = await mount(sensors, states);
    const rows = rowsOf(el);
    expect(rows).toHaveLength(5);
    expect(valueOf(rows[0]!).textContent!.trim()).toBe('5');
    for (const r of rows.slice(1)) expect(valueOf(r).textContent!.trim()).toBe('—');
    const ids = (el as any).getRelevantEntities() as string[];
    expect(ids).toEqual(expect.arrayContaining(['sensor.x', 'binary_sensor.x', 'switch.x']));
    expect(ids).not.toContain(longId);
    expect(ids).not.toContain('sensor.X <b>');
    expect(wearEntityIds(sensors)).toEqual(['sensor.x', 'binary_sensor.x', 'switch.x']);
    expect(wearRows({ states } as any, sensors).map((r) => r.fullValue)).toEqual(['5', WEAR_MISSING, WEAR_MISSING, WEAR_MISSING, WEAR_MISSING]);
    expect(WEAR_COUNTERS.map((c) => c.key)).toEqual(Object.keys(IDS));
    // sf-icon's own missing-connection warning (card icons outside the lot, the accordion's header icon) is not the lot's logging.
    const ours = warns.mock.calls.filter((c) => !String(c[0]).startsWith('[sf-icon]'));
    expect(ours).toEqual([]);
    expect(errors).not.toHaveBeenCalled();
  });

  it('TC-SWC-U-08: styles, translations and the card doc', () => {
    const sheets = ([] as any[]).concat((CardClass as any).styles).flat(Infinity).map((s: any) => String(s.cssText ?? s)).join('\n');
    const rule = (sel: string): string => {
      const out: string[] = [];
      for (const m of sheets.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (m[1]!.split(',').map((x) => x.trim()).includes(sel)) out.push(m[2]!);
      }
      return out.join(';').replace(/\s+/g, ' ');
    };
    const expectDecl = (sel: string, decls: string[]) => {
      const body = rule(sel);
      for (const d of decls) expect(body, `${sel} ${d}`).toMatch(new RegExp(`(^|[;{ ])${d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(;|$)`));
    };
    expectDecl('.wear-counter', ['display: flex', 'align-items: center', 'gap: 8px']);
    expectDecl('.wear-label', ['flex: 1', 'min-width: 0', 'overflow: hidden', 'text-overflow: ellipsis', 'white-space: nowrap']);
    expectDecl('.wear-value', ['white-space: nowrap', 'overflow: hidden', 'text-overflow: ellipsis', 'max-width: 50%']);
    const xlf = read('xliff/fr.xlf').replace(/&apos;/g, "'");
    const js = read('src/locales/locales/fr.js');
    const pairs: Array<[string, string]> = [['Wear', 'Usure'], ['Heating time', 'Temps de chauffe'], ['Fuel used', 'Combustible consommé'],
      ['Igniter starts', 'Allumages'], ['Misfires', "Ratés d'allumage"], ['Overheatings', 'Surchauffes']];
    for (const [src, fr] of pairs) {
      const m = xlf.match(new RegExp(`<trans-unit id="([^"]+)">\\s*<source>${src}</source>\\s*<target>${fr}</target>`));
      expect(m, src).not.toBeNull();
      expect(js).toContain(`'${m![1]}': \`${fr}\``);
    }
    const doc = read('docs/specs/cards/stove.md');
    for (const needle of ['F-STOVE-D12', '### Usure — compteurs fumis', 'sf-editor-accordion.wear-counters', '.wear-value', '« — »', 'recrée']) {
      expect(doc).toContain(needle);
    }
    expect(doc).toMatch(/^\|.*compteur d'usure.*\|/m);
  });

  it('TC-SWC-U-09: sci-fi-stove.ts stays under its line ceiling', () => {
    expect(read('src/cards/stove/sci-fi-stove.ts').split('\n').length - 1).toBeLessThanOrEqual(790);
  });

  it('IT-SWC-I-01: the accordion toggles from its label', async () => {
    const el = await mount({ ...IDS }, { ...baseStates(), ...counterStates(VALUES) });
    expect(customElements.get('sf-editor-accordion')).toBeDefined();
    const acc = accordion(el);
    await acc.updateComplete;
    const label = acc.shadowRoot.querySelector('.label') as HTMLElement;
    expect(label).not.toBeNull();
    expect(acc.open).toBe(false);
    label.click();
    await settle(el);
    expect(acc.open).toBe(true);
    expect((el as any)._wearOpen).toBe(true);
    label.click();
    await settle(el);
    expect(acc.open).toBe(false);
    expect((el as any)._wearOpen).toBe(false);
  });

  it('IT-SWC-I-02: a new hass keeps the section open', async () => {
    const el = await mount({ ...IDS }, { ...baseStates(), ...counterStates(VALUES) }, { formatEntityState: formatter(VALUES) });
    const acc = accordion(el);
    await acc.updateComplete;
    (acc.shadowRoot.querySelector('.label') as HTMLElement).click();
    await settle(el);
    const states = { ...el.hass.states, [IDS.sensor_heating_time]: ent(IDS.sensor_heating_time, '1300') };
    el.hass = { ...el.hass, states, formatEntityState: formatter(['1 300 h', ...VALUES.slice(1)]) } as any;
    await settle(el);
    expect(accordion(el).open).toBe(true);
    expect(valueOf(rowsOf(el)[0]!).textContent!.trim()).toBe('1 300 h');
  });

  it('IT-SWC-I-03: diagnostics, power and counters together; a new element starts collapsed', async () => {
    const ERROR = 'sensor.stove_error';
    const POWER = 'number.stove_power_level';
    const sensors = { ...IDS, sensor_error: ERROR };
    const states = { ...baseStates(), ...counterStates(VALUES),
      [ERROR]: ent(ERROR, 'e101', { code: 'E101' }),
      [POWER]: ent(POWER, '3', { min: 1, max: 5, step: 1 }) };
    const make = async () => {
      const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
      (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, sensors: { ...BASE_SENSORS, ...sensors }, number_power_level: POWER });
      el.hass = { ...makeMockHass({ states, language: 'en' }), formatEntityState: (e: any) => (e.entity_id === ERROR ? 'Ignition failure' : String(e.state)) } as any;
      document.body.appendChild(el);
      await settle(el);
      return el;
    };
    const el = await make();
    expect(el.shadowRoot!.querySelector('.diagnostic.error .diagnostic-text')!.textContent!.trim()).toBe('Ignition failure (E101)');
    expect(el.shadowRoot!.querySelector('sf-wheel.power-level')).not.toBeNull();
    const acc = accordion(el);
    expect(acc).not.toBeNull();
    await acc.updateComplete;
    (acc.shadowRoot.querySelector('.label') as HTMLElement).click();
    await settle(el);
    expect(acc.open).toBe(true);
    const fresh = await make();
    expect(accordion(fresh).open).toBe(false);
  });

  it('IT-SWC-I-04: the accordion checkbox is keyboard reachable', async () => {
    const el = await mount({ ...IDS }, { ...baseStates(), ...counterStates(VALUES) });
    const acc = accordion(el);
    await acc.updateComplete;
    const input = acc.shadowRoot.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.disabled).toBe(false);
    expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    const style = getComputedStyle(input);
    expect(style.display).not.toBe('none');
    expect(style.visibility).not.toBe('hidden');
    const label = acc.shadowRoot.querySelector(`label[for="${input.id}"]`) as HTMLElement;
    expect(label).not.toBeNull();
    expect(label.textContent).toContain('Wear');
    input.focus();
    expect(acc.shadowRoot.activeElement).toBe(input);
    expect(input.checked).toBe(false);
    input.click();
    await settle(el);
    expect(input.checked).toBe(true);
    expect(acc.open).toBe(true);
    expect((el as any)._wearOpen).toBe(true);
  });
});
