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
});
