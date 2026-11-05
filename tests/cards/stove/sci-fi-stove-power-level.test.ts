// @vitest-environment happy-dom
/**
 * sci-fi-stove — power level wheel (number_power_level).
 * Spec: docs/specs/stove-power-level/spec.md
 */
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/stove/sci-fi-stove.js';
import type { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

const CLIMATE = 'climate.poele';

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

function normalize(markup: string): string {
  return markup.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
}

async function mount(config: Record<string, unknown>, states: Record<string, any>, callService?: any): Promise<SciFiStoveCard> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: CLIMATE, ...config });
  el.hass = makeMockHass({ states, callService });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-stove — power level', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('TC-STOVE-U-1116: a config without number_power_level renders .bottom exactly as before', async () => {
    const el = await mount({}, { [CLIMATE]: climate('heat') });
    const bottom = el.shadowRoot!.querySelector('.bottom')!;
    expect(normalize(bottom.innerHTML)).toMatchSnapshot();
    expect(bottom.querySelectorAll('sf-wheel').length).toBe(1);
    const ids = (el as any).getRelevantEntities() as string[];
    expect(ids.some((id) => id.startsWith('number.') || id.startsWith('input_number.'))).toBe(false);
  });
});
