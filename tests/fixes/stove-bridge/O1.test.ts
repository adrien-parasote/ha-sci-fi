// @vitest-environment happy-dom
/** Fix lot stove-bridge, O1 (bead ha-sci-fi-15v): the stove card reads pellets as the bridge does. */
import { describe, it, expect } from 'vitest';
import '../../../src/cards/stove/sci-fi-stove.js';
import type { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

async function gaugeVal(state: string): Promise<number> {
  const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
  (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele', sensors: { sensor_pellet_quantity: 'sensor.p' } });
  el.hass = makeMockHass({
    states: {
      'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: ['off', 'heat'] } }),
      'sensor.p': makeMockEntity({ entity_id: 'sensor.p', state }),
    },
  });
  document.body.appendChild(el);
  await el.updateComplete;
  const val = (el.shadowRoot!.querySelector('sf-circle-progress-bar') as any).val as number;
  el.remove();
  return val;
}

describe('O1', () => {
  it('test_O1_stove_card_reads_a_pellet_ratio_as_a_percentage', async () => {
    expect(await gaugeVal('0.6')).toBe(60);
    // a percentage stays a percentage, bounded to 0–100
    expect(await gaugeVal('45')).toBe(45);
    expect(await gaugeVal('150')).toBe(100);
  });

  it('test_O1_ratio_boundary_is_one_inclusive', async () => {
    // ≤ 1 is a ratio (user decision): 1 is full, just above 1 is a percentage
    expect(await gaugeVal('1')).toBe(100);
    expect(await gaugeVal('1.0001')).toBe(1);
  });

  it('test_O1_non_finite_pellet_state_renders_no_gauge', async () => {
    for (const state of ['Infinity', '-Infinity', 'NaN', 'unavailable']) {
      const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
      (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele', sensors: { sensor_pellet_quantity: 'sensor.p' } });
      el.hass = makeMockHass({
        states: {
          'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { hvac_modes: ['off', 'heat'] } }),
          'sensor.p': makeMockEntity({ entity_id: 'sensor.p', state }),
        },
      });
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector('sf-circle-progress-bar'), state).toBeNull();
      el.remove();
    }
  });
});
