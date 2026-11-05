// @vitest-environment happy-dom
/**
 * sci-fi-stove — diagnostics (door, alert, error).
 * Spec: docs/specs/stove-diagnostics/spec.md
 */
import { expect, describe, it, beforeEach } from 'vitest';

import '../../../src/components/sf-toast.js';
import '../../../src/cards/stove/sci-fi-stove.js';
import type { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';
import { setLocale } from '../../../src/locales/localization.js';

const CLIMATE = 'climate.poele';
const STATUS = 'sensor.stove_detailed_stove_status';
const INSIDE = 'sensor.stove_inside_temperature';

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

const BASE_SENSORS = { sensor_status: STATUS, sensor_inside_temperature: INSIDE };
const baseStates = (): Record<string, any> => ({
  [CLIMATE]: climate(),
  [STATUS]: makeMockEntity({ entity_id: STATUS, state: 'combustion' }),
  [INSIDE]: makeMockEntity({ entity_id: INSIDE, state: '20.5' }),
});

async function mount(sensors: Record<string, unknown>, states: Record<string, any>, extra: Record<string, unknown> = {}): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, sensors: { ...BASE_SENSORS, ...sensors } });
  el.hass = { ...makeMockHass({ states, language: 'en' }), ...extra } as any;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const content = (el: SciFiStoveCard): string => normalize(el.shadowRoot!.querySelector('.content')!.innerHTML);

describe('sci-fi-stove — diagnostics', () => {
  beforeEach(async () => {
    await setLocale('en');
    document.body.innerHTML = '';
  });

  it('TC-SDG-U-00: pre-lot content', async () => {
    const el = await mount({}, baseStates());
    expect(content(el)).toMatchSnapshot('pre-lot content');
  });
});
