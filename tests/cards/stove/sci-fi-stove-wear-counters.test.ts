// @vitest-environment happy-dom
/**
 * sci-fi-stove — wear counters.
 * Spec: docs/specs/stove-wear-counters/spec.md
 */
import { expect, describe, it, beforeEach } from 'vitest';
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
const BASE_SENSORS = { sensor_status: STATUS, sensor_inside_temperature: INSIDE };

async function mount(sensors: Record<string, unknown>, states: Record<string, any>, extra: Record<string, unknown> = {}): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, sensors: { ...BASE_SENSORS, ...sensors } });
  el.hass = { ...makeMockHass({ states, language: 'en' }), ...extra } as any;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}
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
});
