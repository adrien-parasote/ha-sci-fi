// @vitest-environment happy-dom
// Regression tests of fix lot `water` (docs/fixes/water/lot.json): one per observation.
import { expect, describe, it, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import '../../../src/cards/water/sci-fi-water-management.js';
import { waterStyles } from '../../../src/cards/water/styles.js';
import { callWS } from '../../../src/utils/ws.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement {
    addMessage() {}
  });
}

const houseHass = (): any => makeMockHass({
  floors: {
    ground: makeMockFloor({ floor_id: 'ground', name: 'Ground Floor', level: 0 }),
    first: makeMockFloor({ floor_id: 'first', name: 'First Floor', level: 1 }),
  },
  areas: {
    garden: makeMockArea({ area_id: 'garden', name: 'Garden', floor_id: 'ground' }),
    bedroom: makeMockArea({ area_id: 'bedroom', name: 'Bedroom', floor_id: 'first' }),
  },
  entities: {
    'switch.valve_1': makeMockEntityEntry({ entity_id: 'switch.valve_1', area_id: 'garden', domain: 'switch', labels: ['water'] }),
    'switch.pump': makeMockEntityEntry({ entity_id: 'switch.pump', area_id: 'garden', domain: 'switch', labels: ['water'], device_id: 'pump_device' }),
  },
  states: {
    'switch.valve_1': makeMockEntity({ entity_id: 'switch.valve_1', state: 'on', attributes: { friendly_name: 'Valve 1' } }),
    'switch.pump': makeMockEntity({ entity_id: 'switch.pump', state: 'off', attributes: { friendly_name: 'Pump' } }),
  },
});

const mount = async (config: Record<string, unknown> = {}): Promise<any> => {
  const el = document.createElement('sci-fi-water-management') as any;
  el.setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water', ...config });
  el.hass = houseHass();
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

describe('fix lot water', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('test_O2_logbook_rows_without_state_are_dropped_with_a_warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('sci-fi-water-management') as any;
    el.entityIds = ['automation.watering'];
    el.hass = {
      states: {},
      callWS: (p: any) => p.type === 'history/history_during_period'
        ? Promise.reject(new Error('no recorder'))
        : Promise.resolve([
            { entity_id: 'automation.watering', when: '2026-06-01T08:00:00Z', name: 'Watering', message: 'triggered' },
            { entity_id: 'automation.watering', state: 'on', when: '2026-06-01T09:00:00Z', name: 'Watering' },
          ]),
    };
    await el._fetchHistoryLogs();
    expect(el._rawLogs).toHaveLength(1);
    expect(el._rawLogs[0].state).toBe('on');
    expect(warn.mock.calls.some((c) => String(c[0]).includes('ignored 1 logbook row'))).toBe(true);
  });

  it('test_O3_sync_spin_targets_the_rendered_sf_icon', () => {
    const css = waterStyles.cssText;
    expect(css).toMatch(/\.floor-sync-btn\.syncing sf-icon\s*\{[^}]*animation: spin/);
    expect(css).not.toContain('.floor-sync-btn.syncing ha-icon');
  });

  it('test_O4_one_log_contract_read_by_the_render', async () => {
    const el = await mount();
    expect(el._historyLogs).toBeUndefined();
    el._rawLogs = [
      { entity_id: 'switch.valve_1', state: 'on', when: '2026-06-01T08:00:00Z', name: 'Valve 1' },
      { entity_id: 'switch.valve_1', state: 'unavailable', when: '2026-06-01T09:00:00Z', name: 'Valve 1' },
      { entity_id: 'switch.other', state: 'unavailable', when: '2026-06-01T10:00:00Z', name: 'Other' },
    ];
    expect(el._visibleLogs(['switch.valve_1']).map((l: any) => l.state)).toEqual(['unavailable', 'on']);
    el._activeFilter = 'alerts';
    expect(el._visibleLogs(['switch.valve_1']).map((l: any) => l.state)).toEqual(['unavailable']);
  });

  it('test_O5_template_carries_no_inline_style', async () => {
    const el = await mount({ tap_action: { action: 'more-info' } });
    expect(el.shadowRoot.querySelectorAll('sf-editor-accordion').length).toBe(2);
    expect(el.shadowRoot.querySelectorAll('[style]').length).toBe(0);
    expect(el.shadowRoot.querySelector('.header-text.clickable')).not.toBeNull();
  });

  it('test_O6_first_floor_without_water_entity_falls_back_to_a_listed_floor', async () => {
    const el = await mount({ first_floor_to_render: 'first' });
    await el.updateComplete;
    expect(el._activeFloorId).toBe('ground');
    expect(el.shadowRoot.textContent).not.toContain('No water equipment configured for this floor');
  });

  it('test_O7_expanded_neither_triggers_nor_inhibits_the_fetch', async () => {
    const el = document.createElement('sci-fi-water-management') as any;
    el.setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = makeMockHass({});
    el.expanded = false;
    el.entityIds = ['switch.valve_1'];
    let count = 0;
    el._fetchHistoryLogs = () => { count++; };
    document.body.appendChild(el);
    await el.updateComplete;
    count = 0;
    el.entityIds = ['switch.valve_2'];
    await el.updateComplete;
    expect(count).toBe(1);
    count = 0;
    el.expanded = true;
    el.requestUpdate('expanded', false);
    await el.updateComplete;
    expect(count).toBe(0);
  });

  it('test_O8_switch_to_a_floor_without_entities_discards_the_fetch_in_flight', async () => {
    const el = document.createElement('sci-fi-water-management') as any;
    let release: (v: unknown) => void = () => {};
    el.hass = { states: {}, callWS: () => new Promise((r) => { release = r; }) };
    el.entityIds = ['switch.valve_1'];
    const first = el._fetchHistoryLogs();
    el.entityIds = [];
    await el._fetchHistoryLogs();
    release({ 'switch.valve_1': [{ s: 'on', lu: 1780000000 }] });
    await first;
    expect(el._rawLogs).toEqual([]);
  });

  it('test_O9_callWS_is_typed_and_falls_back_to_the_connection', async () => {
    const viaConnection = { connection: { sendMessagePromise: vi.fn(() => Promise.resolve(['c'])) } } as any;
    expect(await callWS(viaConnection, { type: 'x' })).toEqual(['c']);
    expect(viaConnection.connection.sendMessagePromise).toHaveBeenCalledWith({ type: 'x' });
    const viaHelper = { callWS: vi.fn(() => Promise.resolve(['h'])), connection: { sendMessagePromise: vi.fn() } } as any;
    expect(await callWS(viaHelper, { type: 'y' })).toEqual(['h']);
    expect(viaHelper.connection.sendMessagePromise).not.toHaveBeenCalled();
  });

  it('test_O8_every_early_exit_clears_the_loading_flag', async () => {
    const el = document.createElement('sci-fi-water-management') as any;
    el.hass = { states: {}, callWS: () => Promise.resolve({}) };
    el.entityIds = [];
    await el._fetchHistoryLogs();
    expect(el._historyLogsLoading).toBe(false);
    el.entityIds = ['light.not_meaningful'];
    await el._fetchHistoryLogs();
    expect(el._historyLogsLoading).toBe(false);
  });

  it('test_O9_editor_falls_back_to_hass_entities_when_the_registry_fetch_fails', async () => {
    await import('../../../src/cards/water/sci-fi-water-management-editor.js');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const hass = houseHass();
    hass.callWS = () => Promise.reject(new Error('registry down'));
    const el = document.createElement('sci-fi-water-management-editor') as any;
    el.setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = hass;
    document.body.appendChild(el);
    await el._fetchRegistry();
    const grouped = el._getGroupedWaterEntities();
    const ids = Object.values(grouped).flat().map((e: any) => e.entity_id).sort();
    expect(ids).toEqual(['switch.pump', 'switch.valve_1']);
  });

  it('test_O10_spec_and_code_query_input_boolean', async () => {
    const spec = readFileSync(resolve(__dirname, '../../../docs/specs/cards/water.md'), 'utf8');
    const line = spec.split('\n').find((l) => l.includes('Only queries meaningful domains')) ?? '';
    expect(line).toContain('`input_boolean`');
    const el = document.createElement('sci-fi-water-management') as any;
    let payload: any = null;
    el.hass = { states: {}, callWS: (p: any) => { payload = p; return Promise.resolve({}); } };
    el.entityIds = ['input_boolean.arrosage', 'light.ignored'];
    await el._fetchHistoryLogs();
    expect(payload.entity_ids).toEqual(['input_boolean.arrosage']);
  });
});
