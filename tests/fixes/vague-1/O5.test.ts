// @vitest-environment happy-dom
/** Fix lot vague-1, O5 (bead ha-sci-fi-iu8m): the stove editor picks its entity among climate.* only. */
import { describe, it, expect, afterEach } from 'vitest';
import '../../../src/cards/stove/sci-fi-stove-editor.js';
import type { SciFiStoveEditor } from '../../../src/cards/stove/sci-fi-stove-editor.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

afterEach(() => { document.body.innerHTML = ''; });

async function editor(): Promise<SciFiStoveEditor> {
  const el = document.createElement('sci-fi-stove-editor') as SciFiStoveEditor;
  el.hass = makeMockHass({
    states: {
      'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'heat', attributes: { friendly_name: 'Poêle' } }),
      'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'off' }),
      'sensor.power': makeMockEntity({ entity_id: 'sensor.power', state: '1' }),
    },
  }) as any;
  el.setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('O5', () => {
  it('test_O5_stove_entity_is_a_dropdown_of_climate_entities_only', async () => {
    const el = await editor();
    const dd = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="entity"]') as any;
    expect(dd, 'entity is a dropdown').not.toBeNull();
    expect(dd.value).toBe('climate.poele');
    expect((dd.items as { entity_id: string }[]).map((e) => e.entity_id).sort()).toEqual(['climate.poele', 'climate.salon']);
    expect(el.shadowRoot!.querySelector('sf-editor-input[element-id="entity"]'), 'no free-text entity field left').toBeNull();
  });

  it('test_O5_picking_an_entity_writes_config_entity', async () => {
    const el = await editor();
    let received: any;
    el.addEventListener('config-changed', (e: Event) => { received = (e as CustomEvent).detail.config; });
    const dd = el.shadowRoot!.querySelector('sf-editor-dropdown-entity[element-id="entity"]') as any;
    dd._selectItem('climate.salon');
    expect(received?.entity).toBe('climate.salon');
  });
});
