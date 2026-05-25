// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import '../../../src/cards/plugs/sci-fi-plugs-editor.js';
import type { SciFiPlugsEditor } from '../../../src/cards/plugs/sci-fi-plugs-editor.js';
import type { HomeAssistantExt } from '../../../src/types/ha.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-plugs', ...overrides };
}

async function createElement(): Promise<SciFiPlugsEditor> {
  const el = document.createElement('sci-fi-plugs-editor') as SciFiPlugsEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-plugs-editor', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders "No config" when config is not set', async () => {
    const el = await createElement();
    const result = el.render();
    expect(result).toBeDefined();
  });

  it('renders the editor structure when config is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [] }));
    await el.updateComplete;

    const card = el.shadowRoot!.querySelector('.card');
    expect(card).not.toBeNull();
  });

  it('renders add-device button', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [] }));
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.add-btn');
    expect(btn).not.toBeNull();
  });

  it('renders one accordion per device', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      devices: [
        { entity_id: 'switch.plug1', name: 'Plug 1' },
        { entity_id: 'switch.plug2', name: 'Plug 2' },
      ],
    }));
    await el.updateComplete;

    const accordions = el.shadowRoot!.querySelectorAll('sf-editor-accordion');
    expect(accordions.length).toBe(2);
  });

  it('dispatches config-changed when add-device clicked', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const btn = el.shadowRoot!.querySelector('.add-btn') as HTMLButtonElement;
    btn.click();

    expect(received).toHaveLength(1);
    expect(Array.isArray(received[0]!.detail.config.devices)).toBe(true);
    expect(received[0]!.detail.config.devices.length).toBe(1);
  });

  it('dispatches config-changed when device is removed', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      devices: [{ entity_id: 'switch.plug1', name: 'Plug 1' }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const accordion = el.shadowRoot!.querySelector('sf-editor-accordion')!;
    accordion.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: '0', kind: 'accordion', value: '0', type: 'remove' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.devices).toHaveLength(0);
  });

  it('ignores remove when id is NaN', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [{ entity_id: 'switch.plug1', name: 'Plug 1' }] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const accordion = el.shadowRoot!.querySelector('sf-editor-accordion')!;
    accordion.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'bad', kind: 'accordion', value: 'bad', type: 'remove' },
    }));

    expect(received).toHaveLength(0);
  });

  it('loads switch and sensor entities from hass', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [] }));
    const mockHass = {
      ...makeMockHass(),
      states: {
        'switch.plug1': { entity_id: 'switch.plug1', state: 'on', attributes: {} },
        'sensor.power1': { entity_id: 'sensor.power1', state: '100', attributes: {} },
        'light.salon': { entity_id: 'light.salon', state: 'on', attributes: {} },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    expect((el as any)._switchEntities).toHaveLength(1);
    expect((el as any)._sensorEntities).toHaveLength(1);
  });

  // ── Consolidated Extended Tests ────────────────────────────────────────────

  it('dispatches config-changed when device entity is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [{ entity_id: 'switch.plug1', name: 'Plug 1' }] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const dropdown = el.shadowRoot!.querySelector('sf-editor-dropdown-entity')!;
    dropdown.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'entity_id', kind: 'plug-switch', value: 'switch.plug2' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.devices[0].entity_id).toBe('switch.plug2');
  });

  it('dispatches config-changed when device name is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [{ entity_id: 'switch.plug1', name: 'Old Name' }] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const input = el.shadowRoot!.querySelector('sf-editor-input')!;
    input.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'name', kind: 'plug-name', value: 'New Name' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.devices[0].name).toBe('New Name');
  });

  it('dispatches config-changed when power sensor is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [{ entity_id: 'switch.plug1', name: 'Plug 1' }] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const dropdowns = el.shadowRoot!.querySelectorAll('sf-editor-dropdown-entity');
    const powerDropdown = dropdowns[1];
    powerDropdown?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'power_sensor', kind: 'plug-power-sensor', value: 'sensor.power1' },
    }));

    expect(received).toHaveLength(1);
    const updatedDevice = received[0]!.detail.config.devices[0];
    expect(updatedDevice.sensors?.['sensor.power1']).toEqual({ show: true, name: 'Power', power: true });
  });

  it('dispatches config-changed when energy sensor is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [{ entity_id: 'switch.plug1', name: 'Plug 1' }] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const dropdowns = el.shadowRoot!.querySelectorAll('sf-editor-dropdown-entity');
    const energyDropdown = dropdowns[2];
    energyDropdown?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'energy_sensor', kind: 'plug-energy-sensor', value: 'sensor.energy1' },
    }));

    expect(received).toHaveLength(1);
    const updatedDevice = received[0]!.detail.config.devices[0];
    expect(updatedDevice.sensors?.['sensor.energy1']).toEqual({ show: true, name: 'Energy', power: false });
  });

  it('replaces existing power sensor when power sensor entity is changed', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      devices: [{
        entity_id: 'switch.plug1',
        name: 'Plug 1',
        sensors: {
          'sensor.old_power': { show: true, name: 'Power', power: true },
        },
      }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const dropdowns = el.shadowRoot!.querySelectorAll('sf-editor-dropdown-entity');
    const powerDropdown = dropdowns[1];
    powerDropdown?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'power_sensor', kind: 'plug-power-sensor', value: 'sensor.new_power' },
    }));

    expect(received).toHaveLength(1);
    const updatedDevice = received[0]!.detail.config.devices[0];
    expect(updatedDevice.sensors?.['sensor.old_power']).toBeUndefined();
    expect(updatedDevice.sensors?.['sensor.new_power']).toBeDefined();
  });

  it('clears sensor when empty string is set as entity', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      devices: [{
        entity_id: 'switch.plug1',
        name: 'Plug 1',
        sensors: {
          'sensor.power1': { show: true, name: 'Power', power: true },
        },
      }],
    }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const dropdowns = el.shadowRoot!.querySelectorAll('sf-editor-dropdown-entity');
    const powerDropdown = dropdowns[1];
    powerDropdown?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'power_sensor', kind: 'plug-power-sensor', value: '' },
    }));

    expect(received).toHaveLength(1);
    const updatedDevice = received[0]!.detail.config.devices[0];
    expect(updatedDevice.sensors).toBeUndefined();
  });

  it('dispatches config-changed when active_icon is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [{ entity_id: 'switch.plug1', name: 'Plug 1' }] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const iconDropdowns = el.shadowRoot!.querySelectorAll('sf-editor-dropdown-icon');
    const activeIconDropdown = iconDropdowns[0];
    activeIconDropdown?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'active_icon', kind: 'plug-icon', value: 'mdi:power' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.devices[0].active_icon).toBe('mdi:power');
  });
});
