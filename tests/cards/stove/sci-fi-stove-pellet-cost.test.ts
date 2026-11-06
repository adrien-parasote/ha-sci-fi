// @vitest-environment happy-dom
/**
 * sci-fi-stove — pellet cost.
 * Spec: docs/specs/stove-pellet-cost/spec.md
 */
import { expect, describe, it, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import '../../../src/components/sf-toast.js';
import '../../../src/cards/stove/sci-fi-stove.js';
import type { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';
import { formatPelletCost } from '../../../src/cards/stove/pellet-cost.js';

const CLIMATE = 'climate.poele';
const STOCK = 'counter.pellet_stock';
const QUANTITY = 'sensor.stove_pellet_quantity';
const COST = 'input_number.pellet_cout_saison';

/** Intl's fr format uses no-break spaces (U+00A0, U+202F): normalised before asserting. */
const nbsp = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');
const read = (rel: string): string => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
/** Declarations of the CSS rules whose selector list contains `sel` exactly. */
function rules(css: string, sel: string): string[] {
  const out: string[] = [];
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1]!.split(',').map((x) => x.trim().replace(/\s+/g, ' '));
    if (selectors.includes(sel)) out.push(m[2]!);
  }
  return out;
}
/** The markdown section starting at `heading`, up to the next `## ` heading. */
function section(doc: string, heading: string): string {
  const start = doc.indexOf(`\n${heading}\n`);
  if (start < 0) return '';
  const next = doc.indexOf('\n## ', start + heading.length + 1);
  return doc.slice(start, next < 0 ? undefined : next);
}

/** Lit comments removed, consecutive whitespace collapsed, trimmed. */
function normalize(markup: string): string {
  return markup.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
}

const ent = (id: string, state: unknown, attributes: Record<string, unknown> = {}) =>
  makeMockEntity({ entity_id: id, state: state as string, attributes });
const baseStates = (): Record<string, any> => ({
  [CLIMATE]: ent(CLIMATE, 'heat', { friendly_name: 'Poêle', hvac_modes: ['off', 'heat'], min_temp: 18, max_temp: 22, temperature: 20 }),
  [STOCK]: ent(STOCK, '68', { maximum: 100 }),
  [QUANTITY]: ent(QUANTITY, '55'),
});

async function mount(config: Record<string, unknown>, states: Record<string, any>, language = 'fr'): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, ...config });
  el.hass = makeMockHass({ states, language }) as any;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}
const quantities = (el: SciFiStoveCard): HTMLElement => el.shadowRoot!.querySelector('.quantities') as HTMLElement;
const cell = (el: SciFiStoveCard): HTMLElement | null => el.shadowRoot!.querySelector('div.pellet-cost');
const cellText = (el: SciFiStoveCard): string => nbsp(cell(el)!.querySelector('.text')!.textContent!.trim());
const costStates = (state: unknown, attributes: Record<string, unknown> = { unit_of_measurement: '€' }) =>
  ({ ...baseStates(), [COST]: ent(COST, state, attributes) });
const settle = async (el: SciFiStoveCard): Promise<void> => {
  await el.updateComplete;
  await el.updateComplete;
};

const PRE_LOT_CONFIG = { storage_counter: STOCK, sensors: { sensor_pellet_quantity: QUANTITY } };
const snapshotFile = path.join(__dirname, '__snapshots__', 'sci-fi-stove-pellet-cost.test.ts.snap');
/** FR-3: the pre-lot `.quantities`, read from the committed snapshot (never rewritten). */
function preLot(name: string): string {
  if (!fs.existsSync(snapshotFile)) throw new Error('pre-lot snapshot missing');
  const re = new RegExp(`${name} 1\`\\] = \`"([\\s\\S]*?)"\`;`);
  const m = fs.readFileSync(snapshotFile, 'utf8').match(re);
  if (!m) throw new Error('pre-lot snapshot missing');
  return m[1]!.replace(/\\`/g, '`').replace(/\\\\/g, '\\');
}

describe('sci-fi-stove — pellet cost', () => {
  beforeEach(async () => {
    await setLocale('fr');
    document.body.innerHTML = '';
  });

  it('TC-SPC-U-04: without pellet_cost the quantities markup and entities are the pre-lot ones', async () => {
    const el = await mount(PRE_LOT_CONFIG, baseStates());
    const markup = normalize(quantities(el).innerHTML);
    const ids = JSON.stringify(((el as any).getRelevantEntities() as string[]).slice().sort());
    expect(markup).toMatchSnapshot('pre-lot quantities');
    expect(ids).toMatchSnapshot('pre-lot entities');
    expect(preLot('pre-lot quantities')).toBe(markup);
    expect(preLot('pre-lot entities')).toBe(ids);
    expect(quantities(el).querySelector('div.pellet-cost')).toBeNull();
  });

  it('TC-SPC-U-01: the cost cell follows the stock bar, icon then text', async () => {
    const el = await mount({ storage_counter: STOCK, pellet_cost: COST }, costStates('26.0'));
    const children = [...quantities(el).children].map((n) => `${n.tagName.toLowerCase()}${n.className ? '.' + n.className : ''}`);
    expect(children).toEqual(['sf-stack-bar', 'div.pellet-cost']);
    const kids = [...cell(el)!.children];
    expect(kids.map((n) => n.tagName.toLowerCase())).toEqual(['sf-icon', 'div']);
    expect(kids[0]!.getAttribute('icon')).toBe('mdi:cash');
    expect(kids[0]!.getAttribute('aria-hidden')).toBe('true');
    expect(kids[1]!.className).toBe('text');
    expect(cellText(el)).toBe('Coût (26,00 €)');
    expect((el as any).getRelevantEntities()).toContain(COST);
  });

  it('TC-SPC-U-02: formatPelletCost formats two decimals at the locale, then the unit', () => {
    for (const [args, want] of [
      [[26, '€', 'fr'], '26,00 €'],
      [[1234.5, '€', 'en'], '1,234.50 €'],
      [[0, undefined, 'fr'], '0,00'],
      [[-3.456, '€', 'en'], '-3.46 €'],
      [[5, '  ', 'en'], '5.00'],
      [[-0, '€', 'en'], '0.00 €'],
    ] as const) {
      expect(nbsp(formatPelletCost(args[0], args[1], args[2])), JSON.stringify(args)).toBe(want);
    }
  });

  it('TC-SPC-U-03: an unreadable cost state renders no cell, the stock bar stays', async () => {
    const absent = await mount({ storage_counter: STOCK, pellet_cost: COST }, baseStates());
    expect(cell(absent)).toBeNull();
    expect(quantities(absent).querySelector('sf-stack-bar')).not.toBeNull();
    for (const state of ['unavailable', 'unknown', '', '  ', 'abc', 'NaN', 'Infinity', '1e300', '-1e9']) {
      document.body.innerHTML = '';
      const el = await mount({ storage_counter: STOCK, pellet_cost: COST }, costStates(state));
      expect(cell(el), state).toBeNull();
      expect(quantities(el).querySelector('sf-stack-bar'), state).not.toBeNull();
    }
    document.body.innerHTML = '';
    const big = await mount({ storage_counter: STOCK, pellet_cost: COST }, costStates('999999999'));
    expect(cell(big)).not.toBeNull();
  });

  it('TC-SPC-U-05: without the stock bar the cell comes last; hass.language is the fallback', async () => {
    await setLocale('en');
    const el = await mount({ sensors: { sensor_pellet_quantity: QUANTITY }, pellet_cost: COST }, costStates('19.5'), 'en');
    // hass.locale.language 'en' beats a top-level hass.language 'de' (FR-4.1 order).
    const hass = { ...makeMockHass({ states: costStates('19.5'), language: 'en' }), language: 'de' } as any;
    el.hass = hass;
    await settle(el);
    expect(quantities(el).lastElementChild).toBe(cell(el));
    expect(cellText(el)).toBe('Cost (19.50 €)');
    // 'de' differs from the final 'en' default: dropping the hass.language read fails here.
    const noLocale = { ...makeMockHass({ states: costStates('19.5'), language: 'en' }), language: 'de' } as any;
    delete noLocale.locale;
    el.hass = noLocale;
    await settle(el);
    expect(cellText(el)).toBe('Cost (19,50 €)');
  });

  it('TC-SPC-U-07: styles let the row wrap and keep the cost text on one line', () => {
    const css = read('src/cards/stove/styles.ts');
    const row = rules(css, '.content .info .e.bottom-path .quantities').find((r) => /column-gap:\s*20px/.test(r));
    expect(row).toMatch(/flex-wrap:\s*wrap/);
    expect(row).toMatch(/row-gap:\s*10px/);
    const box = rules(css, '.content .info .e.bottom-path .quantities .pellet-cost').join('\n');
    expect(box).toMatch(/flex-direction:\s*column/);
    expect(box).toMatch(/min-width:\s*0/);
    expect(rules(css, '.content .info .e.bottom-path .quantities .pellet-cost .text').join('\n')).toMatch(/white-space:\s*nowrap/);
  });

  it('TC-SPC-U-08: Cost and Pellet cost are translated', () => {
    const xlf = read('xliff/fr.xlf');
    const js = read('src/locales/locales/fr.js');
    for (const [source, target] of [['Cost', 'Coût'], ['Pellet cost', 'Coût des pellets']]) {
      expect(xlf).toMatch(new RegExp(`<source>${source}</source>\\s*<target>${target}</target>`));
      expect(js).toContain(`\`${target}\``);
    }
  });

  it('TC-SPC-U-09: the user doc documents the option and the cost setup', () => {
    const doc = read('docs/cards/stove.md');
    const full = section(doc, '### Full');
    expect(full).toContain('pellet_cost:');
    expect(doc).toMatch(/\| `pellet_cost` \| String \|/);
    const cost = section(doc, '## Pellet cost');
    expect(cost).not.toBe('');
    for (const token of ['input_number.pellet_bag_price', 'input_number.pellet_cost', 'counter.pellet_stock',
      'not_from: [unavailable, unknown]', 'trigger.from_state.state | int > trigger.to_state.state | int',
      'mode: queued', 'price in force', 'manual correction', 'now().month == 10', 'Troubleshooting']) {
      expect(cost, token).toContain(token);
    }
  });

  it('TC-SPC-U-10: the stock automation ignores a return from unavailable', () => {
    const stock = section(read('docs/cards/stove.md'), '## Pellet storage counter automation');
    expect(stock).not.toBe('');
    for (const token of ['trigger: numeric_state', 'for: "00:02:00"', 'trigger.from_state.state | is_number']) {
      expect(stock, token).toContain(token);
    }
    expect(stock).not.toContain('trigger: state');
  });

  it('TC-SPC-U-11: the card spec carries F-STOVE-D13 and the frozen selector', () => {
    const doc = read('docs/specs/cards/stove.md');
    expect(doc).toContain('F-STOVE-D13');
    expect(section(doc, '## Test Selectors — Frozen Contract')).toContain('div.pellet-cost');
  });

  it('TC-SPC-U-12: formatPelletCost never throws on a bad locale or unit', async () => {
    for (const language of ['fr_FR', '', 'zz_ZZ', undefined, 42]) {
      expect(() => formatPelletCost(26, '€', language)).not.toThrow();
      expect(formatPelletCost(26, '€', language), String(language)).toBe('26.00 €');
    }
    for (const unit of [42, {}, ['€'], null, 'EUR / sac']) {
      expect(formatPelletCost(26, unit, 'en'), JSON.stringify(unit)).toBe('26.00');
    }
    const states = costStates('26', { unit_of_measurement: 42 });
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, pellet_cost: COST });
    const hass = makeMockHass({ states, language: 'fr' }) as any;
    hass.locale = { ...hass.locale, language: 'fr_FR' };
    el.hass = hass;
    document.body.appendChild(el);
    await settle(el);
    // The base card maps only `fr` / `fr-*` to the French catalogue: `fr_FR` renders the label in English.
    expect(cellText(el)).toBe('Cost (26.00)');
  });

  it('TC-SPC-U-13: markup in the unit is rendered as text', async () => {
    await setLocale('en');
    const el = await mount({ pellet_cost: COST }, costStates('26', { unit_of_measurement: '<b>€</b>' }), 'en');
    expect(cell(el)!.querySelector('b')).toBeNull();
    expect(cellText(el)).toBe('Cost (26.00 <b>€</b>)');
  });

  it('IT-SPC-I-01: the real element renders the cost in its shadow DOM', async () => {
    const el = await mount({ storage_counter: STOCK, pellet_cost: COST }, costStates('26'));
    expect(el.shadowRoot!.querySelector('div.pellet-cost sf-icon')).not.toBeNull();
    expect(nbsp(el.shadowRoot!.querySelector('div.pellet-cost .text')!.textContent!.trim())).toBe('Coût (26,00 €)');
  });

  it('IT-SPC-I-02: a new hass updates the cost, then hides it when unavailable', async () => {
    const el = await mount({ storage_counter: STOCK, pellet_cost: COST }, costStates('26'));
    el.hass = makeMockHass({ states: costStates('32.5'), language: 'fr' }) as any;
    await settle(el);
    expect(cellText(el)).toBe('Coût (32,50 €)');
    el.hass = makeMockHass({ states: costStates('unavailable'), language: 'fr' }) as any;
    await settle(el);
    expect(cell(el)).toBeNull();
    expect(quantities(el).querySelector('sf-stack-bar')).not.toBeNull();
  });

  it('IT-SPC-I-03: a config without pellet_cost removes the cell', async () => {
    const el = await mount({ storage_counter: STOCK, pellet_cost: COST }, costStates('26'));
    expect(el.shadowRoot!.querySelectorAll('div.pellet-cost')).toHaveLength(1);
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, storage_counter: STOCK });
    await settle(el);
    expect(el.shadowRoot!.querySelectorAll('div.pellet-cost')).toHaveLength(0);
  });
});
