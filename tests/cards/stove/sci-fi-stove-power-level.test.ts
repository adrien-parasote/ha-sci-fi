// @vitest-environment happy-dom
/**
 * sci-fi-stove — power level wheel (number_power_level).
 * Spec: docs/specs/stove-power-level/spec.md
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

function climate(state = 'heat', attributes: Record<string, unknown> = {}) {
  return makeMockEntity({
    entity_id: CLIMATE,
    state,
    attributes: {
      friendly_name: 'Poêle',
      hvac_modes: ['off', 'heat'],
      min_temp: 18,
      max_temp: 22,
      temperature: 20,
      ...attributes,
    },
  });
}

function power(state: unknown, attributes: Record<string, unknown> = { min: 1, max: 5, step: 1 }, id = POWER) {
  return makeMockEntity({ entity_id: id, state: state as string, attributes });
}

function normalize(markup: string): string {
  return markup.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
}

function hassOf(states: Record<string, any>, callService?: any, language = 'en') {
  return makeMockHass({ states, callService, language });
}

async function mount(
  config: Record<string, unknown>,
  states: Record<string, any>,
  callService?: any,
  language = 'en',
): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, ...config });
  el.hass = hassOf(states, callService, language);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const wheel = (el: SciFiStoveCard): any => el.shadowRoot!.querySelector('sf-wheel.power-level');
const texts = (w: any): string[] => (w.items as Array<{ text: string }>).map((i) => i.text);
const ids = (w: any): string[] => (w.items as Array<{ id: string }>).map((i) => i.id);
const range = (a: number, b: number): string[] => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));

async function setHass(el: SciFiStoveCard, states: Record<string, any>, callService?: any): Promise<void> {
  el.hass = hassOf(states, callService);
  await el.updateComplete;
}

async function pick(el: SciFiStoveCard, id: string): Promise<void> {
  wheel(el).dispatchEvent(new CustomEvent('wheel-change', { detail: { id, text: id }, bubbles: true, composed: true }));
  await el.updateComplete;
}

function spyToast(el: SciFiStoveCard) {
  const toast = el.shadowRoot!.querySelector('sf-toast') as any;
  return vi.spyOn(toast, 'addMessage');
}

const withPower = (state: unknown, attrs?: Record<string, unknown>, climateState = 'heat') => ({
  [CLIMATE]: climate(climateState),
  [POWER]: power(state, attrs),
});

describe('sci-fi-stove — power level', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('TC-SPL-U-1116: a config without number_power_level renders .bottom exactly as before', async () => {
    await setLocale('fr');
    const el = await mount({}, { [CLIMATE]: climate('heat') }, undefined, 'fr');
    const bottom = el.shadowRoot!.querySelector('.bottom')!;
    expect(normalize(bottom.innerHTML)).toMatchSnapshot();
    expect(bottom.querySelectorAll('sf-wheel').length).toBe(1);
    const relevant = (el as any).getRelevantEntities() as string[];
    expect(relevant.some((id) => id.startsWith('number.') || id.startsWith('input_number.'))).toBe(false);
  });

  describe('with the en locale', () => {
    beforeEach(async () => {
      await setLocale('en');
    });

    it('TC-SPL-U-1117: renders the power wheel between the temperature wheel and the eco control', async () => {
      const el = await mount(
        { number_power_level: POWER, switch_eco_mode: 'switch.eco' },
        { ...withPower('3'), 'switch.eco': makeMockEntity({ entity_id: 'switch.eco', state: 'on' }) },
      );
      const w = wheel(el);
      expect(w).not.toBeNull();
      const children = [...el.shadowRoot!.querySelector('.bottom')!.children].map((c) => c.tagName.toLowerCase() + (c.classList.contains('power-level') ? '.power-level' : ''));
      expect(children).toEqual(['sf-button-card-select', 'sf-wheel', 'sf-wheel.power-level', 'sf-button-card']);
      expect(ids(w)).toEqual(['0', '1', '2', '3', '4']);
      expect(texts(w)).toEqual(['1', '2', '3', '4', '5']);
      expect(w.selectedId).toBe('2');
      expect(w.getAttribute('text')).toBe('Power');
      expect((el as any).getRelevantEntities()).toContain(POWER);
    });

    it('TC-SPL-U-1118: per-bound fallback, then the 1/5/1 trio', async () => {
      for (const [, attrs, want, selected] of [
      ['absent', {}, range(1, 5), '2'],
      ['2/10/2', { min: 2, max: 10, step: 2 }, ['2', '4', '6', '8', '10'], '1'],
      ['min 2 only', { min: 2 }, range(2, 5), '1'],
      ['string bounds', { min: '2', max: null, step: '' }, range(2, 5), '1'],
      ['non-finite', { max: Infinity, step: NaN }, range(1, 5), '2'],
      ['3abc', { min: '3abc' }, range(1, 5), '2'],
      ['min > max', { min: 5, max: 1, step: 1 }, range(1, 5), '2'],
      ['step 0', { step: 0 }, range(1, 5), '2'],
      ['step -1', { step: -1 }, range(1, 5), '2'],
      ] as const) {
        const el = await mount({ number_power_level: POWER }, withPower('3.0', attrs as Record<string, unknown>));
        expect(texts(wheel(el))).toEqual(want);
        expect(wheel(el).selectedId).toBe(selected);
        document.body.replaceChildren();
      }
    });

    it('TC-SPL-U-1119: disabled on unavailable, unknown or non-numeric states, settable with the stove off', async () => {
      for (const s of ['unavailable', 'unknown', '', 'abc']) {
        const el = await mount({ number_power_level: POWER }, withPower(s));
        expect(wheel(el).disabled).toBe(true);
        expect(wheel(el).getAttribute('title')).toBe('Power level unavailable');
        document.body.replaceChildren();
      }
      const el = await mount({ number_power_level: POWER }, withPower('2', undefined, 'off'));
      expect(wheel(el).disabled).toBe(false);
      expect(wheel(el).hasAttribute('title')).toBe(false);
    });

    it('TC-SPL-U-1120: no wheel when the configured entity is absent from hass', async () => {
      const el = await mount({ number_power_level: POWER }, { [CLIMATE]: climate() });
      expect(wheel(el)).toBeNull();
    });

    it('TC-SPL-U-1121: one set_value on the configured entity after 400 ms, one toast', async () => {
      const divergent = { [CLIMATE]: climate('heat', { entity_id: 'number.other' }), [POWER]: power('2') };
      for (const [outcome, want] of [
        [() => Promise.resolve({}), ['Power level changed', false]],
        [() => Promise.reject(new Error('boom')), ['boom', true]],
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- FR-8: a rejection that is not an Error
        [() => Promise.reject('nope'), ['nope', true]],
      ] as const) {
        vi.useFakeTimers();
        const call = vi.fn(outcome);
        const el = await mount({ number_power_level: POWER }, divergent, call);
        const toast = spyToast(el);
        await pick(el, '3');
        await vi.advanceTimersByTimeAsync(400);
        expect(call).toHaveBeenCalledTimes(1);
        expect(call).toHaveBeenCalledWith('number', 'set_value', { entity_id: POWER, value: 4 });
        expect(toast).toHaveBeenCalledTimes(1);
        expect(toast).toHaveBeenCalledWith(...want);
        vi.useRealTimers();
        document.body.replaceChildren();
      }
      for (const bad of ['x', '-1', '1.5', '5']) {
        vi.useFakeTimers();
        const call = vi.fn(() => Promise.resolve({}));
        const el = await mount({ number_power_level: POWER }, divergent, call);
        const toast = spyToast(el);
        await pick(el, bad);
        await vi.advanceTimersByTimeAsync(1000);
        expect(call).not.toHaveBeenCalled();
        expect(toast).not.toHaveBeenCalled();
        vi.useRealTimers();
        document.body.replaceChildren();
      }
      // stove-diagnostics FR-2: NUMBER_DOMAINS moved to number-wheel.ts.
      const src = fs.readFileSync(path.join(process.cwd(), 'src/cards/stove/number-wheel.ts'), 'utf8');
      expect(src).toContain('DOMAIN.NUMBER');
      expect(src).toContain('DOMAIN.INPUT_NUMBER');
    });

    it('TC-SPL-U-1124: the four strings are translated in xliff/fr.xlf and fr.js', () => {
      const xlf = fs.readFileSync(path.join(process.cwd(), 'xliff/fr.xlf'), 'utf8');
      const js = fs.readFileSync(path.join(process.cwd(), 'src/locales/locales/fr.js'), 'utf8');
      for (const [source, target] of [
        ['Power', 'Puissance'],
        ['Power level changed', 'Puissance modifiée'],
        ['Power level number', 'Entité niveau de puissance'],
        ['Power level unavailable', 'Puissance indisponible'],
      ]) {
        expect(xlf).toMatch(new RegExp(`<source>${source}</source>\\s*<target>${target}</target>`));
        expect(js).toContain(`\`${target}\``);
      }
    });

    it('TC-SPL-U-1125: stove.md documents the power level', () => {
      const doc = fs.readFileSync(path.join(process.cwd(), 'docs/specs/cards/stove.md'), 'utf8');
      for (const token of ['F-STOVE-D09', 'number_power_level', 'sf-wheel.power-level', 'input_number', 'set_value']) {
        expect(doc).toContain(token);
      }
    });

    it('TC-SPL-U-1126: fractional steps keep index ids and exact values', async () => {
      vi.useFakeTimers();
      const call = vi.fn(() => Promise.resolve({}));
      const el = await mount({ number_power_level: POWER }, withPower('0.3', { min: 0, max: 1, step: 0.1 }), call);
      expect(texts(wheel(el))).toEqual(['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0']);
      expect(wheel(el).selectedId).toBe('3');
      await pick(el, '3');
      await vi.advanceTimersByTimeAsync(400);
      expect(call).toHaveBeenCalledTimes(1);
      expect((call.mock.calls[0] as any)[2].value === 0.3).toBe(true);
      vi.useRealTimers();
      document.body.replaceChildren();
      const el2 = await mount({ number_power_level: POWER }, withPower('1.25', { min: 0.5, max: 2, step: 0.25 }));
      expect(texts(wheel(el2))).toEqual(['0.50', '0.75', '1.00', '1.25', '1.50', '1.75', '2.00']);
      expect(wheel(el2).selectedId).toBe('3');
    });

    it('TC-SPL-U-1127: the wheel always carries aria-label Power', async () => {
      const el = await mount({ number_power_level: POWER }, withPower('2'));
      expect(wheel(el).getAttribute('aria-label')).toBe('Power');
      await setHass(el, withPower('unavailable'));
      expect(wheel(el).disabled).toBe(true);
      expect(wheel(el).getAttribute('aria-label')).toBe('Power');
    });

    it('TC-SPL-U-1128: input_number is written through its own domain; other domains get no wheel', async () => {
      vi.useFakeTimers();
      const id = 'input_number.stove_power';
      const call = vi.fn(() => Promise.resolve({}));
      const el = await mount({ number_power_level: id }, { [CLIMATE]: climate(), [id]: power('1', undefined, id) }, call);
      expect(wheel(el)).not.toBeNull();
      await pick(el, '1');
      await vi.advanceTimersByTimeAsync(400);
      expect(call).toHaveBeenCalledWith('input_number', 'set_value', { entity_id: id, value: 2 });
      vi.useRealTimers();
      document.body.replaceChildren();
      const call2 = vi.fn(() => Promise.resolve({}));
      const el2 = await mount(
        { number_power_level: 'switch.stove' },
        { [CLIMATE]: climate(), 'switch.stove': makeMockEntity({ entity_id: 'switch.stove', state: 'on' }) },
        call2,
      );
      expect(wheel(el2)).toBeNull();
      expect(call2).not.toHaveBeenCalled();
    });

    it('TC-SPL-U-1129: at most 50 items', async () => {
      for (const [attrs, count] of [
        [{ min: 1, max: 50, step: 1 }, 50],
        [{ min: 1, max: 51, step: 1 }, 5],
        [{ min: 0, max: 1e9, step: 1 }, 5],
        [{ min: 0, max: 1, step: 1e-6 }, 5],
      ] as const) {
        const t0 = performance.now();
        const el = await mount({ number_power_level: POWER }, withPower('1', attrs));
        expect(performance.now() - t0).toBeLessThan(100);
        expect(wheel(el).items.length).toBe(count);
        if (count === 5) expect(texts(wheel(el))).toEqual(range(1, 5));
        document.body.replaceChildren();
      }
    });

    it('TC-SPL-U-1130: the last choice wins, one call after 400 ms of quiet', async () => {
      vi.useFakeTimers();
      const call = vi.fn(() => Promise.resolve({}));
      const el = await mount({ number_power_level: POWER }, withPower('1'), call);
      const toast = spyToast(el);
      await pick(el, '1');
      await vi.advanceTimersByTimeAsync(100);
      await pick(el, '2');
      await vi.advanceTimersByTimeAsync(100);
      await pick(el, '3');
      expect(wheel(el).selectedId).toBe('3');
      await vi.advanceTimersByTimeAsync(399);
      expect(call).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(call).toHaveBeenCalledTimes(1);
      expect(call).toHaveBeenCalledWith('number', 'set_value', { entity_id: POWER, value: 4 });
      expect(toast).toHaveBeenCalledTimes(1);
      await setHass(el, withPower('4'), call);
      expect(wheel(el).selectedId).toBe('3');
      expect((el as any)._powerPendingIndex).toBeNull();
      await pick(el, '2');
      await setHass(el, withPower('1'), call);
      expect(wheel(el).selectedId).toBe('2');
    });

    it('TC-SPL-U-1131: an out-of-grid state selects the nearest item', async () => {
      for (const [state, selected] of [['7', '4'], ['0', '0'], ['2.4', '1'], [3, '2']] as const) {
        const el = await mount({ number_power_level: POWER }, withPower(state));
        expect(wheel(el).selectedId).toBe(selected);
        expect(wheel(el).disabled).toBe(false);
        document.body.replaceChildren();
      }
    });

    it('TC-SPL-U-1132: an error message is shown as text', async () => {
      vi.useFakeTimers();
      const el = await mount({ number_power_level: POWER }, withPower('2'), vi.fn(() => Promise.reject(new Error('<b>x</b>'))));
      const toast = spyToast(el);
      await pick(el, '3');
      await vi.advanceTimersByTimeAsync(400);
      expect(toast).toHaveBeenCalledWith('<b>x</b>', true);
      const body = (el.shadowRoot!.querySelector('sf-toast') as any).shadowRoot.querySelector('.toast-body');
      expect(body.textContent).toBe('<b>x</b>');
      expect(body.querySelector('b')).toBeNull();
    });

    it('TC-SPL-U-1133: no call after the card is removed or the entity turns unavailable', async () => {
      vi.useFakeTimers();
      const call = vi.fn(() => Promise.resolve({}));
      const el = await mount({ number_power_level: POWER }, withPower('2'), call);
      await pick(el, '3');
      el.remove();
      await vi.advanceTimersByTimeAsync(1000);
      expect(call).not.toHaveBeenCalled();
      const el2 = await mount({ number_power_level: POWER }, withPower('2'), call);
      await pick(el2, '3');
      await setHass(el2, withPower('unavailable'), call);
      await vi.advanceTimersByTimeAsync(1000);
      expect(call).not.toHaveBeenCalled();
      expect(wheel(el2).selectedId).toBeNull();
      expect(wheel(el2).disabled).toBe(true);
      document.body.replaceChildren();
      const el3 = await mount({ number_power_level: POWER }, withPower('2'), call);
      await pick(el3, '4');
      await setHass(el3, withPower('2', { min: 1, max: 3, step: 1 }), call);
      expect(wheel(el3).selectedId).toBe('1');
      await vi.advanceTimersByTimeAsync(1000);
      expect(call).not.toHaveBeenCalled();
    });

    describe('real element in the document', () => {
      it('IT-SPL-I-1104: a pick on the shadow wheel writes number.set_value and toasts success', async () => {
        vi.useFakeTimers();
        const call = vi.fn(() => Promise.resolve({}));
        const el = await mount({ number_power_level: POWER }, withPower('2', undefined, 'off'), call);
        expect(wheel(el).disabled).toBe(false);
        await pick(el, '4');
        await vi.advanceTimersByTimeAsync(400);
        expect(call).toHaveBeenCalledTimes(1);
        expect(call).toHaveBeenCalledWith('number', 'set_value', { entity_id: POWER, value: 5 });
        const toastRoot = (el.shadowRoot!.querySelector('sf-toast') as any).shadowRoot;
        expect(toastRoot.querySelector('.toast-body').textContent).toBe('Power level changed');
        expect(toastRoot.querySelector('.toast.error')).toBeNull();
      });

      it('IT-SPL-I-1105: the wheel stays, disabled, when the entity turns unavailable', async () => {
        const el = await mount({ number_power_level: POWER }, withPower('2', undefined, 'off'));
        await setHass(el, { [CLIMATE]: climate('off'), [POWER]: power('unavailable') });
        expect(wheel(el)).not.toBeNull();
        expect(wheel(el).disabled).toBe(true);
        expect(wheel(el).getAttribute('title')).toBe('Power level unavailable');
      });

      it('IT-SPL-I-1106: no config or an absent entity leaves a single wheel in .bottom', async () => {
        for (const config of [{}, { number_power_level: POWER }]) {
          const el = await mount(config, { [CLIMATE]: climate('off') });
          const bottom = el.shadowRoot!.querySelector('.bottom')!;
          expect(bottom.querySelectorAll('sf-wheel').length).toBe(1);
          expect(wheel(el)).toBeNull();
          document.body.replaceChildren();
        }
      });
    });
  });
});
