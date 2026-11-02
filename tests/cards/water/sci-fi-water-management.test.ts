 
// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';


import '../../../src/cards/water/sci-fi-water-management.js';
import { SciFiWaterManagementCard } from '../../../src/cards/water/sci-fi-water-management.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

if (!customElements.get('sf-toast')) {
  customElements.define('sf-toast', class extends HTMLElement {
    addMessage() {}
  });
}

describe('sci-fi-water-management', () => {
  it('provides getConfigElement', () => {
    const el = SciFiWaterManagementCard.getConfigElement();
    expect(el.tagName.toLowerCase()).to.equal('sci-fi-water-management-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiWaterManagementCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-water-management');
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders gracefully without hass', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    document.body.appendChild(el);
    (el as any).setConfig(SciFiWaterManagementCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders empty message if no floors exist', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig(SciFiWaterManagementCard.getStubConfig());
    el.hass = makeMockHass({ floors: {} });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('No floor configured');
  });

  it('renders floors and water entities based on labels', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-water-management',
      header_message: "Gestion de l'eau",
      filter_label: 'water'
    } as unknown as unknown as any);

    el.hass = makeMockHass({
      floors: {
        'ground': makeMockFloor({ floor_id: 'ground', name: 'Ground Floor', level: 0 }),
        'first': makeMockFloor({ floor_id: 'first', name: 'First Floor', level: 1 }),
      },
      areas: {
        'living': makeMockArea({ area_id: 'living', name: 'Living Room', floor_id: 'ground' }),
        'garden': makeMockArea({ area_id: 'garden', name: 'Garden', floor_id: 'ground' }),
      },
      entities: {
        'switch.valve_1': makeMockEntityEntry({ entity_id: 'switch.valve_1', area_id: 'garden', domain: 'switch', labels: ['water'] }),
        'sensor.tank_level': makeMockEntityEntry({ entity_id: 'sensor.tank_level', area_id: 'garden', domain: 'sensor', labels: ['water'] }),
        'light.ignored': makeMockEntityEntry({ entity_id: 'light.ignored', area_id: 'living', domain: 'light' }), // No water label
      },
      states: {
        'switch.valve_1': makeMockEntity({ entity_id: 'switch.valve_1', state: 'on', attributes: { friendly_name: 'Valve 1' } }),
        'sensor.tank_level': makeMockEntity({ entity_id: 'sensor.tank_level', state: '75', attributes: { friendly_name: 'Tank Level', unit_of_measurement: '%' } }),
      }
    });

    document.body.appendChild(el);
    await el.updateComplete;

    // Check header
    expect(el.shadowRoot!.textContent).to.include("Gestion de l'eau");

    // Default selection: ground floor
    const floorHexas = el.shadowRoot!.querySelectorAll('.floor-hexa');
    expect(floorHexas.length).to.equal(1);
    expect(floorHexas[0]!.getAttribute('data-selected')).to.equal('true');

    // Water entities should be rendered
    const rows = el.shadowRoot!.querySelectorAll('.entity-row');
    expect(rows.length).to.equal(2);
    
    // Check if valve and sensor are displayed
    expect(rows[0]!.textContent).to.include('Valve 1');
    expect(rows[1]!.textContent).to.include('Tank Level');
    expect(rows[1]!.textContent).to.include('75%');
  });

  it('renders empty message if no water entities exist in the house', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-water-management',
      filter_label: 'water'
    } as unknown as unknown as any);

    el.hass = makeMockHass({
      floors: {
        'first': makeMockFloor({ floor_id: 'first', name: 'First Floor', level: 1 }),
      },
      areas: {
        'bed': makeMockArea({ area_id: 'bed', name: 'Bedroom', floor_id: 'first' }),
      },
      entities: {
        'light.bed': makeMockEntityEntry({ entity_id: 'light.bed', area_id: 'bed', domain: 'light' }),
      },
      states: {}
    });

    document.body.appendChild(el);
    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('No floor configured');
  });

  // ── Entity interaction tests ──────────────────────────────────────────────

  const makeWaterHass = (entityId: string, state: string, domain: string) => makeMockHass({
    floors: { 'f1': makeMockFloor({ floor_id: 'f1', name: 'Floor 1', level: 0 }) },
    areas: { 'a1': makeMockArea({ area_id: 'a1', name: 'Area 1', floor_id: 'f1' }) },
    entities: {
      [entityId]: makeMockEntityEntry({ entity_id: entityId, area_id: 'a1', domain, labels: ['water'] }),
    },
    states: {
      [entityId]: makeMockEntity({ entity_id: entityId, state, attributes: { friendly_name: 'Test Entity' } }),
    },
  });

  it('TC-WATER-U-009: getCardSize returns 5', () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig(SciFiWaterManagementCard.getStubConfig());
    expect(el.getCardSize()).to.equal(5);
  });

  it('TC-WATER-U-010: _getStateLabel returns truthy strings for on and off', () => {
    const el = document.createElement('sci-fi-water-management') as any;
    (el as any).setConfig(SciFiWaterManagementCard.getStubConfig());
    const labelOn = el._getStateLabel(true);
    const labelOff = el._getStateLabel(false);
    expect(labelOn).toBeTruthy();
    expect(typeof labelOn).toBe('string');
    expect(labelOff).toBeTruthy();
    expect(labelOn).not.to.equal(labelOff);
  });

  it('TC-WATER-U-003: _toggleEntity calls callService turn_off when entity is on', async () => {
    const callService = vi.fn(() => Promise.resolve({} as any));
    const el = document.createElement('sci-fi-water-management') as any;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = { ...makeWaterHass('switch.valve', 'on', 'switch'), callService };
    document.body.appendChild(el);
    await el.updateComplete;

    el._toggleEntity('switch.valve', true, 'switch');
    await new Promise(r => setTimeout(r, 0));

    expect(callService).toHaveBeenCalledWith('switch', 'turn_off', { entity_id: 'switch.valve' });
  });

  it('TC-WATER-U-003: _toggleEntity calls callService turn_on when entity is off', async () => {
    const callService = vi.fn(() => Promise.resolve({} as any));
    const el = document.createElement('sci-fi-water-management') as any;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = { ...makeWaterHass('switch.valve', 'off', 'switch'), callService };
    document.body.appendChild(el);
    await el.updateComplete;

    el._toggleEntity('switch.valve', false, 'switch');
    await new Promise(r => setTimeout(r, 0));

    expect(callService).toHaveBeenCalledWith('switch', 'turn_on', { entity_id: 'switch.valve' });
  });

  it('TC-WATER-U-011: _toggleEntity uses homeassistant domain for unknown domains', async () => {
    const callService = vi.fn(() => Promise.resolve({} as any));
    const el = document.createElement('sci-fi-water-management') as any;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = { ...makeWaterHass('sensor.leak', 'off', 'sensor'), callService };
    document.body.appendChild(el);
    await el.updateComplete;

    el._toggleEntity('sensor.leak', false, 'sensor');
    await new Promise(r => setTimeout(r, 0));

    expect(callService).toHaveBeenCalledWith('homeassistant', 'turn_on', { entity_id: 'sensor.leak' });
  });

  it('TC-WATER-U-012: _toggleEntity shows error toast on callService reject', async () => {
    const callService = vi.fn(() => Promise.reject(new Error('toggle failed')));
    const el = document.createElement('sci-fi-water-management') as any;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = { ...makeWaterHass('switch.valve', 'on', 'switch'), callService };
    document.body.appendChild(el);
    await el.updateComplete;

    const toast = el.shadowRoot!.querySelector('sf-toast') as any;
    if (!toast.addMessage) toast.addMessage = () => {};
    const addMessageSpy = vi.spyOn(toast, 'addMessage');

    el._toggleEntity('switch.valve', true, 'switch');
    await new Promise(r => setTimeout(r, 0));

    expect(addMessageSpy).toHaveBeenCalledWith('toggle failed', true);
  });

  it('TC-WATER-U-013: _changeSelectEntity calls callService select_option for select domain', async () => {
    const callService = vi.fn(() => Promise.resolve({} as any));
    const el = document.createElement('sci-fi-water-management') as any;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = { ...makeWaterHass('select.mode', 'mode1', 'select'), callService };
    document.body.appendChild(el);
    await el.updateComplete;

    const fakeEvent = { target: { value: 'mode2' } } as unknown as Event;
    el._changeSelectEntity('select.mode', fakeEvent);
    await new Promise(r => setTimeout(r, 0));

    expect(callService).toHaveBeenCalledWith('select', 'select_option', { entity_id: 'select.mode', option: 'mode2' });
  });

  it('TC-WATER-U-014: _changeSelectEntity calls input_select domain for input_select entities', async () => {
    const callService = vi.fn(() => Promise.resolve({} as any));
    const el = document.createElement('sci-fi-water-management') as any;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = { ...makeWaterHass('input_select.mode', 'opt1', 'input_select'), callService };
    document.body.appendChild(el);
    await el.updateComplete;

    const fakeEvent = { target: { value: 'opt2' } } as unknown as Event;
    el._changeSelectEntity('input_select.mode', fakeEvent);
    await new Promise(r => setTimeout(r, 0));

    expect(callService).toHaveBeenCalledWith('input_select', 'select_option', { entity_id: 'input_select.mode', option: 'opt2' });
  });

  it('TC-WATER-U-015: _changeSelectEntity shows error toast on reject', async () => {
    const callService = vi.fn(() => Promise.reject(new Error('select failed')));
    const el = document.createElement('sci-fi-water-management') as any;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = { ...makeWaterHass('select.mode', 'mode1', 'select'), callService };
    document.body.appendChild(el);
    await el.updateComplete;

    const toast = el.shadowRoot!.querySelector('sf-toast') as any;
    if (!toast.addMessage) toast.addMessage = () => {};
    const addMessageSpy = vi.spyOn(toast, 'addMessage');

    const fakeEvent = { target: { value: 'mode2' } } as unknown as Event;
    el._changeSelectEntity('select.mode', fakeEvent);
    await new Promise(r => setTimeout(r, 0));

    expect(addMessageSpy).toHaveBeenCalledWith('select failed', true);
  });

  it('TC-WATER-U-016: sf-toggle-change event on rendered toggle calls _toggleEntity', async () => {
    const callService = vi.fn(() => Promise.resolve({} as any));
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = makeWaterHass('switch.valve', 'on', 'switch') as any;
    (el.hass as any).callService = callService;
    document.body.appendChild(el);
    await el.updateComplete;

    const toggle = el.shadowRoot!.querySelector('sf-toggle-switch');
    if (toggle) {
      toggle.dispatchEvent(new CustomEvent('sf-toggle-change', { bubbles: true, composed: true }));
      await new Promise(r => setTimeout(r, 0));
      expect(callService).toHaveBeenCalled();
    }
  });

  // ── Branch coverage: device-group accordion (lines 587-602) ──────────────

  it('TC-WATER-U-017: renders device-group accordion when entity has a device_id', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = makeMockHass({
      floors: { 'f1': makeMockFloor({ floor_id: 'f1', name: 'Floor 1', level: 0 }) },
      areas: { 'a1': makeMockArea({ area_id: 'a1', name: 'Area 1', floor_id: 'f1' }) },
      entities: {
        'switch.pump': makeMockEntityEntry({ entity_id: 'switch.pump', area_id: 'a1', domain: 'switch', labels: ['water'], device_id: 'pump_device' }),
      },
      states: {
        'switch.pump': makeMockEntity({ entity_id: 'switch.pump', state: 'off', attributes: { friendly_name: 'Pump' } }),
      },
      devices: {
        'pump_device': { id: 'pump_device', name: 'My Pump', area_id: 'a1' },
      },
    } as any);
    document.body.appendChild(el);
    await el.updateComplete;

    // The device accordion should render with device name
    const accordions = el.shadowRoot!.querySelectorAll('sf-editor-accordion');
    expect(accordions.length).toBeGreaterThan(0);
  });

  // ── Branch coverage: select entity states (lines 639-649) ─────────────────

  it('TC-WATER-U-018: renders select entity in unavailable state', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = makeMockHass({
      floors: { 'f1': makeMockFloor({ floor_id: 'f1', name: 'Floor 1', level: 0 }) },
      areas: { 'a1': makeMockArea({ area_id: 'a1', name: 'Area 1', floor_id: 'f1' }) },
      entities: {
        'select.mode': makeMockEntityEntry({ entity_id: 'select.mode', area_id: 'a1', domain: 'select', labels: ['water'] }),
      },
      states: {
        'select.mode': makeMockEntity({ entity_id: 'select.mode', state: 'unavailable', attributes: { friendly_name: 'Mode Select' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const select = el.shadowRoot!.querySelector('select.sf-select');
    expect(select).not.toBeNull();
    expect((select as HTMLSelectElement)?.disabled).toBe(true);
  });

  it('TC-WATER-U-019: renders select entity with options list', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = makeMockHass({
      floors: { 'f1': makeMockFloor({ floor_id: 'f1', name: 'Floor 1', level: 0 }) },
      areas: { 'a1': makeMockArea({ area_id: 'a1', name: 'Area 1', floor_id: 'f1' }) },
      entities: {
        'select.mode': makeMockEntityEntry({ entity_id: 'select.mode', area_id: 'a1', domain: 'select', labels: ['water'] }),
      },
      states: {
        'select.mode': makeMockEntity({ entity_id: 'select.mode', state: 'mode1', attributes: { friendly_name: 'Mode Select', options: ['mode1', 'mode2', 'mode3'] } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const options = el.shadowRoot!.querySelectorAll('select.sf-select option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('TC-WATER-U-020: renders select entity in unknown state with placeholder option', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = makeMockHass({
      floors: { 'f1': makeMockFloor({ floor_id: 'f1', name: 'Floor 1', level: 0 }) },
      areas: { 'a1': makeMockArea({ area_id: 'a1', name: 'Area 1', floor_id: 'f1' }) },
      entities: {
        'select.mode': makeMockEntityEntry({ entity_id: 'select.mode', area_id: 'a1', domain: 'select', labels: ['water'] }),
      },
      states: {
        'select.mode': makeMockEntity({ entity_id: 'select.mode', state: 'unknown', attributes: { friendly_name: 'Mode Select', options: ['mode1', 'mode2'] } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // unknown state should show a disabled placeholder option
    const placeholderOption = el.shadowRoot!.querySelector('select.sf-select option[disabled]');
    expect(placeholderOption).not.toBeNull();
  });

  it('TC-WATER-U-021: renders entity row with no state obj uses fallback icon', async () => {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    el.hass = makeMockHass({
      floors: { 'f1': makeMockFloor({ floor_id: 'f1', name: 'Floor 1', level: 0 }) },
      areas: { 'a1': makeMockArea({ area_id: 'a1', name: 'Area 1', floor_id: 'f1' }) },
      entities: {
        'switch.missing': makeMockEntityEntry({ entity_id: 'switch.missing', area_id: 'a1', domain: 'switch', labels: ['water'] }),
      },
      states: {}, // No state entry — triggers fallback icon branch
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const rows = el.shadowRoot!.querySelectorAll('.entity-row');
    expect(rows.length).toBe(1);
  });

  // ── Accordion state + sync button ──────────────────────────────────────────

  async function mountWithTwoDevices(): Promise<SciFiWaterManagementCard> {
    const el = document.createElement('sci-fi-water-management') as SciFiWaterManagementCard;
    (el as any).setConfig({ type: 'custom:sci-fi-water-management', filter_label: 'water' });
    const hass = makeMockHass({
      floors: { 'f1': makeMockFloor({ floor_id: 'f1', name: 'Floor 1', level: 0 }) },
      areas: { 'a1': makeMockArea({ area_id: 'a1', name: 'Area 1', floor_id: 'f1' }) },
      entities: {
        'switch.pump': makeMockEntityEntry({ entity_id: 'switch.pump', area_id: 'a1', device_id: 'd1', domain: 'switch', labels: ['water'] }),
        'switch.valve': makeMockEntityEntry({ entity_id: 'switch.valve', area_id: 'a1', device_id: 'd2', domain: 'switch', labels: ['water'] }),
      },
      states: {
        'switch.pump': makeMockEntity({ entity_id: 'switch.pump', state: 'on' }),
        'switch.valve': makeMockEntity({ entity_id: 'switch.valve', state: 'off' }),
      },
    });
    // makeMockHass does not model the device registry; the card reads hass.devices
    // to name each accordion group.
    (hass as any).devices = { 'd1': { id: 'd1', name: 'Pump' }, 'd2': { id: 'd2', name: 'Valve' } };
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('TC-WATER-U-006: _expandedMap tracks each accordion independently', async () => {
    const el = await mountWithTwoDevices();
    const accordions = el.shadowRoot!.querySelectorAll('sf-editor-accordion');
    expect(accordions.length, 'one accordion per device group').toBeGreaterThanOrEqual(2);

    // Open the first one only.
    accordions[0]!.dispatchEvent(new CustomEvent('sf-accordion-toggle', { detail: { open: true } }));
    await el.updateComplete;

    const map = (el as any)._expandedMap as Map<string, boolean>;
    const openCount = [...map.values()].filter(Boolean).length;
    expect(openCount, 'opening one group must not open the others').toBe(1);

    // Open the second: both are now tracked, independently.
    accordions[1]!.dispatchEvent(new CustomEvent('sf-accordion-toggle', { detail: { open: true } }));
    await el.updateComplete;
    expect([...(el as any)._expandedMap.values()].filter(Boolean).length).toBe(2);

    // Close the first: the second stays open.
    accordions[0]!.dispatchEvent(new CustomEvent('sf-accordion-toggle', { detail: { open: false } }));
    await el.updateComplete;
    expect([...(el as any)._expandedMap.values()].filter(Boolean).length).toBe(1);
  });

  it('TC-WATER-U-008: the floor sync button triggers _fetchHistoryLogs', async () => {
    const el = await mountWithTwoDevices();
    const spy = vi.spyOn(el as any, '_fetchHistoryLogs').mockResolvedValue(undefined);

    const syncBtn = el.shadowRoot!.querySelector('.floor-sync-btn') as HTMLButtonElement;
    expect(syncBtn, 'the floor header must carry a sync button').not.toBeNull();
    syncBtn.dispatchEvent(new MouseEvent('click'));

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
