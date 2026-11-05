// @vitest-environment happy-dom
/**
 * sci-fi-stove — fan speed wheel (number_fan_speed).
 * Spec: docs/specs/stove-fan-speed/spec.md
 */
import { expect, describe, it, afterEach, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import '../../../src/components/sf-toast.js';
import '../../../src/cards/stove/sci-fi-stove.js';
import type { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';

const CLIMATE = 'climate.poele';
const POWER = 'number.stove_power_level';
const FAN = 'number.stove_fan_speed';

function climate(state = 'heat') {
  return makeMockEntity({
    entity_id: CLIMATE,
    state,
    attributes: { friendly_name: 'Poêle', hvac_modes: ['off', 'heat'], min_temp: 18, max_temp: 22, temperature: 20 },
  });
}

function num(id: string, state: unknown, attributes: Record<string, unknown> | undefined = { min: 0, max: 5, step: 1 }) {
  return makeMockEntity({ entity_id: id, state: state as string, attributes: attributes ?? {} });
}

function normalize(markup: string): string {
  return markup.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
}

const hassOf = (states: Record<string, any>, callService?: any) => makeMockHass({ states, callService, language: 'en' });

async function mount(config: Record<string, unknown>, states: Record<string, any>, callService?: any): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, ...config });
  el.hass = hassOf(states, callService);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}


const fanWheel = (el: SciFiStoveCard): any => el.shadowRoot!.querySelector('sf-wheel.fan-speed');
const powerWheel = (el: SciFiStoveCard): any => el.shadowRoot!.querySelector('sf-wheel.power-level');
const texts = (w: any): string[] => (w.items as Array<{ text: string }>).map((i) => i.text);
const ids = (w: any): string[] => (w.items as Array<{ id: string }>).map((i) => i.id);
const range = (a: number, b: number): string[] => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));

async function setHass(el: SciFiStoveCard, states: Record<string, any>, callService?: any): Promise<void> {
  el.hass = hassOf(states, callService);
  await el.updateComplete;
}

async function pickOn(el: SciFiStoveCard, w: any, id: string): Promise<void> {
  w.dispatchEvent(new CustomEvent('wheel-change', { detail: { id, text: id }, bubbles: true, composed: true }));
  await el.updateComplete;
}

const spyToast = (el: SciFiStoveCard) => vi.spyOn(el.shadowRoot!.querySelector('sf-toast') as any, 'addMessage');

const BOTH = { number_power_level: POWER, number_fan_speed: FAN };
const fanOnly = (state: unknown, attrs?: Record<string, unknown>, climateState = 'heat') => ({
  [CLIMATE]: climate(climateState),
  [FAN]: num(FAN, state, attrs),
});
const both = (p: unknown = '2', f: unknown = '2') => ({
  [CLIMATE]: climate(),
  [POWER]: num(POWER, p, { min: 1, max: 5, step: 1 }),
  [FAN]: num(FAN, f),
});
const read = (rel: string): string => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

describe('sci-fi-stove — fan speed', () => {
  beforeEach(async () => {
    await setLocale('en');
  });
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('TC-SFS-U-1101: without number_fan_speed .bottom renders exactly as before, with or without power', async () => {
    const bare = await mount({}, { [CLIMATE]: climate() });
    expect(normalize(bare.shadowRoot!.querySelector('.bottom')!.innerHTML)).toMatchSnapshot('no power');
    document.body.replaceChildren();
    const withPower = await mount(
      { number_power_level: POWER },
      { [CLIMATE]: climate(), [POWER]: num(POWER, '2', { min: 1, max: 5, step: 1 }) },
    );
    const bottom = withPower.shadowRoot!.querySelector('.bottom')!;
    expect(normalize(bottom.innerHTML)).toMatchSnapshot('with power');
    expect(bottom.querySelector('sf-wheel.fan-speed')).toBeNull();
    const relevant = (withPower as any).getRelevantEntities() as string[];
    expect(relevant.some((id) => id.endsWith('_fan_speed'))).toBe(false);
  });

  it('TC-SFS-U-1102: fallback trio 0/5/1 per bound, the entity is relevant', async () => {
    const el = await mount({ number_fan_speed: FAN }, fanOnly('0', undefined));
    const w = fanWheel(el);
    expect(ids(w)).toEqual(range(0, 5));
    expect(texts(w)).toEqual(range(0, 5));
    expect(w.selectedId).toBe('0');
    expect(w.disabled).toBe(false);
    expect((el as any).getRelevantEntities()).toContain(FAN);
    await setHass(el, fanOnly('3', { min: 0, max: 5, step: 1 }));
    expect(fanWheel(el).selectedId).toBe('3');
    for (const attrs of [{ min: 7 }, { max: 'x' }]) {
      await setHass(el, fanOnly('3', attrs));
      expect(texts(fanWheel(el))).toEqual(range(0, 5));
    }
  });

  it('TC-SFS-U-1103: placed after power, before eco; guarded by presence and domain', async () => {
    const eco = { 'switch.eco': makeMockEntity({ entity_id: 'switch.eco', state: 'on' }) };
    const el = await mount({ ...BOTH, switch_eco_mode: 'switch.eco' }, { ...both(), ...eco });
    const order = () => [...el.shadowRoot!.querySelector('.bottom')!.children].map((c) => `${c.tagName.toLowerCase()}.${c.className}`);
    const o = order();
    expect(o.length).toBe(5);
    expect(o[0]).toContain('sf-button-card-select');
    expect(o[1]).toBe('sf-wheel.');
    expect(o[2]).toBe('sf-wheel.power-level');
    expect(o[3]).toBe('sf-wheel.fan-speed');
    const noPower = { ...both(), ...eco } as Record<string, any>;
    delete noPower[POWER];
    await setHass(el, noPower);
    expect(order()[2]).toBe('sf-wheel.fan-speed');
    const noFan = { ...both(), ...eco } as Record<string, any>;
    delete noFan[FAN];
    await setHass(el, noFan);
    expect(fanWheel(el)).toBeNull();
    document.body.replaceChildren();
    const sw = await mount({ number_fan_speed: 'switch.fan' }, {
      [CLIMATE]: climate(), 'switch.fan': makeMockEntity({ entity_id: 'switch.fan', state: 'on' }),
    });
    expect(fanWheel(sw)).toBeNull();
  });

  it('TC-SFS-U-1104: label Fan, title only when disabled', async () => {
    const el = await mount({ number_fan_speed: FAN }, fanOnly('2'));
    expect(fanWheel(el).getAttribute('text')).toBe('Fan');
    expect(fanWheel(el).getAttribute('aria-label')).toBe('Fan');
    expect(fanWheel(el).hasAttribute('title')).toBe(false);
    await setHass(el, fanOnly('unavailable'));
    expect(fanWheel(el).disabled).toBe(true);
    expect(fanWheel(el).getAttribute('title')).toBe('Fan speed unavailable');
    expect(fanWheel(el).getAttribute('aria-label')).toBe('Fan');
  });

  it('TC-SFS-U-1105: set_value on the fan entity after 400 ms, success and error toasts', async () => {
    for (const [outcome, want] of [
      [() => Promise.resolve({}), ['Fan speed changed', false]],
      [() => Promise.reject(new Error('boom')), ['boom', true]],
    ] as const) {
      vi.useFakeTimers();
      const call = vi.fn(outcome);
      const el = await mount({ number_fan_speed: FAN }, fanOnly('1'), call);
      const toast = spyToast(el);
      await pickOn(el, fanWheel(el), '0');
      await vi.advanceTimersByTimeAsync(400);
      expect(call).toHaveBeenCalledWith('number', 'set_value', { entity_id: FAN, value: 0 });
      expect(toast).toHaveBeenCalledWith(...want);
      vi.useRealTimers();
      document.body.replaceChildren();
    }
    vi.useFakeTimers();
    const call = vi.fn(() => Promise.resolve({}));
    const IN = 'input_number.stove_fan';
    const el = await mount({ number_fan_speed: IN }, { [CLIMATE]: climate(), [IN]: num(IN, '1') }, call);
    await pickOn(el, fanWheel(el), '2');
    await vi.advanceTimersByTimeAsync(400);
    expect(call).toHaveBeenCalledWith('input_number', 'set_value', { entity_id: IN, value: 2 });
  });

  it('TC-SFS-U-1106: the two wheels debounce independently; removal cancels both', async () => {
    vi.useFakeTimers();
    const call = vi.fn(() => Promise.resolve({}));
    const el = await mount(BOTH, both(), call);
    const toast = spyToast(el);
    await pickOn(el, powerWheel(el), '3');
    await vi.advanceTimersByTimeAsync(300);
    await pickOn(el, fanWheel(el), '1');
    await vi.advanceTimersByTimeAsync(100);
    expect(call).toHaveBeenCalledTimes(1);
    expect(call).toHaveBeenLastCalledWith('number', 'set_value', { entity_id: POWER, value: 4 });
    expect(fanWheel(el).selectedId).toBe('1');
    await vi.advanceTimersByTimeAsync(300);
    expect(call).toHaveBeenCalledTimes(2);
    expect(call).toHaveBeenLastCalledWith('number', 'set_value', { entity_id: FAN, value: 1 });
    expect(toast).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
    document.body.replaceChildren();

    vi.useFakeTimers();
    const call2 = vi.fn(() => Promise.resolve({}));
    const el2 = await mount(BOTH, both('2', '2'), call2);
    await pickOn(el2, powerWheel(el2), '4');
    await pickOn(el2, fanWheel(el2), '4');
    el2.remove();
    await vi.advanceTimersByTimeAsync(1000);
    expect(call2).not.toHaveBeenCalled();
    document.body.appendChild(el2);
    await el2.updateComplete;
    expect(powerWheel(el2).selectedId).toBe('1');
    expect(fanWheel(el2).selectedId).toBe('2');
  });

  it('TC-SFS-U-1107: one shared mechanism in the card source', () => {
    const src = read('src/cards/stove/sci-fi-stove.ts');
    expect(src).toContain('NumberWheelSpec');
    expect(src).toContain('numberGrid');
    expect(src).not.toContain('powerGrid');
  });

  it('TC-SFS-U-1110: .bottom wraps on narrow cards', () => {
    const css = read('src/cards/stove/styles.ts');
    const block = css.slice(css.indexOf('.bottom {'), css.indexOf('}', css.indexOf('.bottom {')));
    expect(block).toContain('flex-wrap: wrap');
  });

  it('TC-SFS-U-1111: a fan entity equal to the power entity gets no fan wheel', async () => {
    vi.useFakeTimers();
    const call = vi.fn(() => Promise.resolve({}));
    const P = 'number.stove_power';
    const el = await mount({ number_power_level: P, number_fan_speed: P }, {
      [CLIMATE]: climate(), [P]: num(P, '2', { min: 1, max: 5, step: 1 }),
    }, call);
    expect(fanWheel(el)).toBeNull();
    expect(el.shadowRoot!.querySelectorAll('sf-wheel.power-level').length).toBe(1);
    await pickOn(el, powerWheel(el), '3');
    await vi.advanceTimersByTimeAsync(400);
    expect(call).toHaveBeenCalledTimes(1);
    expect(call).toHaveBeenCalledWith('number', 'set_value', { entity_id: P, value: 4 });
  });

  it('TC-SFS-U-1112: release is per wheel', async () => {
    vi.useFakeTimers();
    const call = vi.fn(() => Promise.resolve({}));
    const el = await mount(BOTH, both('2', '2'), call);
    await pickOn(el, fanWheel(el), '1');
    await vi.advanceTimersByTimeAsync(400);
    expect(call).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(50);
    await pickOn(el, powerWheel(el), '3');
    await vi.advanceTimersByTimeAsync(50);
    await setHass(el, both('2', '2'), call);
    expect(fanWheel(el).selectedId).toBe('2');
    expect(powerWheel(el).selectedId).toBe('3');
    await vi.advanceTimersByTimeAsync(100);
    const noFan = both('2', '2') as Record<string, any>;
    delete noFan[FAN];
    await setHass(el, noFan, call);
    expect(fanWheel(el)).toBeNull();
    expect(powerWheel(el).selectedId).toBe('3');
    await vi.advanceTimersByTimeAsync(250);
    expect(call).toHaveBeenCalledTimes(2);
    expect(call).toHaveBeenLastCalledWith('number', 'set_value', { entity_id: POWER, value: 4 });
  });

  it('TC-SFS-U-1113: degenerate bounds, out-of-grid states, error text', async () => {
    const el = await mount({ number_fan_speed: FAN }, fanOnly('2'));
    for (const [attrs, want] of [
      [{ min: 'NaN', max: 5 }, range(0, 5)],
      [{ max: 'Infinity' }, range(0, 5)],
      [{ min: -2, max: 2, step: 1 }, ['-2', '-1', '0', '1', '2']],
      [{ step: 0 }, range(0, 5)],
      [{ step: -1 }, range(0, 5)],
    ] as const) {
      await setHass(el, fanOnly('0', attrs as Record<string, unknown>));
      expect(texts(fanWheel(el))).toEqual(want);
    }
    for (const [state, want] of [['9', '5'], ['-3', '0'], ['abc', null]] as const) {
      await setHass(el, fanOnly(state));
      expect(fanWheel(el).selectedId).toBe(want);
    }
    expect(fanWheel(el).disabled).toBe(true);
    document.body.replaceChildren();
    vi.useFakeTimers();
    const bad = await mount({ number_fan_speed: FAN }, fanOnly('2'), vi.fn(() => Promise.reject(new Error('<b>x</b>'))));
    const toast = spyToast(bad);
    await pickOn(bad, fanWheel(bad), '3');
    await vi.advanceTimersByTimeAsync(400);
    expect(toast).toHaveBeenCalledWith('<b>x</b>', true);
    const body = (bad.shadowRoot!.querySelector('sf-toast') as any).shadowRoot.querySelector('.toast-body');
    expect(body.textContent).toBe('<b>x</b>');
    expect(body.querySelector('b')).toBeNull();
  });

  it('TC-SFS-U-1114: out-of-grid picks are ignored', async () => {
    vi.useFakeTimers();
    const call = vi.fn(() => Promise.resolve({}));
    const el = await mount({ number_fan_speed: FAN }, fanOnly('2'), call);
    for (const id of ['99', 'abc', '-1']) await pickOn(el, fanWheel(el), id);
    await vi.advanceTimersByTimeAsync(1000);
    expect(call).not.toHaveBeenCalled();
    expect(fanWheel(el).selectedId).toBe('2');
  });

  it('TC-SFS-U-1115: a pending pick is dropped silently when the entity turns unavailable', async () => {
    vi.useFakeTimers();
    const call = vi.fn(() => Promise.resolve({}));
    const el = await mount({ number_fan_speed: FAN }, fanOnly('2'), call);
    const toast = spyToast(el);
    await pickOn(el, fanWheel(el), '4');
    await vi.advanceTimersByTimeAsync(200);
    await setHass(el, fanOnly('unavailable'), call);
    await vi.advanceTimersByTimeAsync(1000);
    expect(call).not.toHaveBeenCalled();
    expect(toast).not.toHaveBeenCalled();
    expect(fanWheel(el).disabled).toBe(true);
  });

  it('TC-SFS-U-1109: strings translated, stove.md documents the fan speed', () => {
    const xlf = read('xliff/fr.xlf');
    const js = read('src/locales/locales/fr.js');
    for (const [source, target] of [
      ['Fan', 'Ventilation'],
      ['Fan speed changed', 'Ventilation modifiée'],
      ['Fan speed number', 'Entité vitesse de ventilation'],
      ['Fan speed unavailable', 'Ventilation indisponible'],
    ]) {
      expect(xlf).toMatch(new RegExp(`<source>${source}</source>\\s*<target>${target}</target>`));
      expect(js).toContain(`\`${target}\``);
    }
    const doc = read('docs/specs/cards/stove.md');
    for (const token of ['F-STOVE-D10', 'number_fan_speed', 'sf-wheel.fan-speed', "Activer l'entité vitesse de ventilation dans Home Assistant"]) {
      expect(doc).toContain(token);
    }
  });

  describe('real element in the document', () => {
    it('IT-SFS-I-1101: a pick on the shadow fan wheel writes set_value and toasts success', async () => {
      vi.useFakeTimers();
      const call = vi.fn(() => Promise.resolve({}));
      const el = await mount({ number_fan_speed: FAN }, fanOnly('2', undefined, 'off'), call);
      expect(fanWheel(el).disabled).toBe(false);
      await pickOn(el, fanWheel(el), '4');
      await vi.advanceTimersByTimeAsync(400);
      expect(call).toHaveBeenCalledTimes(1);
      expect(call).toHaveBeenCalledWith('number', 'set_value', { entity_id: FAN, value: 4 });
      const root = (el.shadowRoot!.querySelector('sf-toast') as any).shadowRoot;
      expect(root.querySelector('.toast-body').textContent).toBe('Fan speed changed');
    });

    it('IT-SFS-I-1102: the fan wheel stays, disabled, when the entity turns unavailable', async () => {
      const el = await mount({ number_fan_speed: FAN }, fanOnly('2', undefined, 'off'));
      await setHass(el, fanOnly('unavailable', undefined, 'off'));
      expect(fanWheel(el)).not.toBeNull();
      expect(fanWheel(el).disabled).toBe(true);
      expect(fanWheel(el).getAttribute('title')).toBe('Fan speed unavailable');
    });

    it('IT-SFS-I-1103: two number wheels, fan after power; none without the field', async () => {
      const el = await mount(BOTH, both());
      const wheels = [...el.shadowRoot!.querySelectorAll('sf-wheel.power-level, sf-wheel.fan-speed')].map((w) => w.className);
      expect(wheels).toEqual(['power-level', 'fan-speed']);
      (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, number_power_level: POWER });
      await el.updateComplete;
      expect(powerWheel(el)).not.toBeNull();
      expect(fanWheel(el)).toBeNull();
    });
  });
});
