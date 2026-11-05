// @vitest-environment happy-dom
/** Fix lot tests, O2 (bead ha-sci-fi-knps): DOMAIN.NUMBER, COUNTER and VALVE are pinned by behaviour. */
for (const tag of ['sf-editor-dropdown-icon', 'sf-editor-accordion', 'sf-editor-input', 'sf-editor-dropdown', 'sf-editor-dropdown-entity']) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}
import { describe, it, expect, vi, afterEach } from 'vitest';
import '../../../src/cards/bridge/sci-fi-bridge-editor.js';
import '../../../src/cards/water/sci-fi-water-management.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

afterEach(() => { document.body.innerHTML = ''; });

/** Every entity id offered by any entity dropdown of the bridge editor. */
async function offeredByBridgeEditor(): Promise<string[]> {
  const el = document.createElement('sci-fi-bridge-editor') as any;
  el.hass = makeMockHass({
    states: {
      'counter.stock': makeMockEntity({ entity_id: 'counter.stock', state: '5' }),
      'number.target': makeMockEntity({ entity_id: 'number.target', state: '20' }),
    },
  });
  el.setConfig({
    type: 'custom:sci-fi-bridge',
    stove: { pellet_quantity: '', pellet_stock: '', status: '' },
    automations: { items: [{ entity: 'number.target', name: 'T', type: 'slider' }] },
  });
  document.body.appendChild(el);
  await el.updateComplete;
  return Array.from(el.shadowRoot!.querySelectorAll('sf-editor-dropdown-entity'))
    .flatMap((d: any) => ((d.items ?? []) as { entity_id: string }[]).map((e) => e.entity_id));
}

async function waterCard(entityId: string, state: string, attributes: Record<string, unknown> = {}): Promise<any> {
  const domain = entityId.split('.')[0]!;
  const el = document.createElement('sci-fi-water-management') as any;
  el.setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
  el.hass = makeMockHass({
    floors: { f1: makeMockFloor({ floor_id: 'f1', name: 'Floor 1', level: 0 }) },
    areas: { a1: makeMockArea({ area_id: 'a1', name: 'Area 1', floor_id: 'f1' }) },
    entities: { [entityId]: makeMockEntityEntry({ entity_id: entityId, area_id: 'a1', domain, labels: ['water'] }) },
    states: { [entityId]: makeMockEntity({ entity_id: entityId, state, attributes: { friendly_name: 'E', ...attributes } }) },
  });
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('O2', () => {
  it('test_O2_bridge_editor_offers_counter_and_number_entities', async () => {
    const offered = await offeredByBridgeEditor();
    expect(offered).toContain('counter.stock');
    expect(offered).toContain('number.target');
  });

  it('test_O2_water_valve_toggle_calls_the_valve_domain', async () => {
    const el = await waterCard('valve.main', 'on');
    const callService = vi.fn(() => Promise.resolve({}));
    el.hass = { ...el.hass, callService };
    await el.updateComplete;
    el.shadowRoot!.querySelector('sf-toggle-switch')!
      .dispatchEvent(new CustomEvent('sf-toggle-change', { bubbles: true, composed: true }));
    expect(callService).toHaveBeenCalledWith('valve', 'turn_off', { entity_id: 'valve.main' });
  });

  it('test_O2_water_number_entity_renders_as_a_reading', async () => {
    const el = await waterCard('number.level', '42', { unit_of_measurement: '%' });
    expect(el.shadowRoot!.querySelector('sf-toggle-switch')).toBeNull();
    expect(el.shadowRoot!.querySelector('.entity-state')?.textContent).toBe('42%');
  });
});
