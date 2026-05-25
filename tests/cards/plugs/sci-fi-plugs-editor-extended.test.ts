/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Extended tests — sci-fi-plugs-editor.ts
 * Covers: _updateDeviceField, _updateSensor, _getPowerSensorEntityId,
 * _getEnergySensorEntityId, _renderDevice with sensors set.
 */
import { expect, describe, it, afterEach } from 'vitest';

import '../../../src/cards/plugs/sci-fi-plugs-editor.js';
import type { SciFiPlugsEditor } from '../../../src/cards/plugs/sci-fi-plugs-editor.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-plugs', ...overrides };
}

async function createElement(): Promise<SciFiPlugsEditor> {
  const el = document.createElement('sci-fi-plugs-editor') as SciFiPlugsEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-plugs-editor extended', () => {
  afterEach(() => { document.body.replaceChildren(); });

  it('dispatches config-changed when device entity is updated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [{ entity_id: 'switch.plug1', name: 'Plug 1' }] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // sf-editor-dropdown-entity for entity_id
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

    // Power sensor dropdown is the 2nd sf-editor-dropdown-entity (kind=plug-power-sensor)
    const dropdowns = el.shadowRoot!.querySelectorAll('sf-editor-dropdown-entity');
    // Find the power sensor dropdown by kind attribute or by order (2nd for power)
    const powerDropdown = dropdowns[1]; // power_sensor is the 2nd entity dropdown
    powerDropdown?.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: true,
      detail: { id: 'power_sensor', kind: 'plug-power-sensor', value: 'sensor.power1' },
    }));

    expect(received).toHaveLength(1);
    const updatedDevice = received[0]!.detail.config.devices[0];
    // The sensor should be stored with power: true
    expect(updatedDevice.sensors?.['sensor.power1']).toEqual({ show: true, name: 'Power', power: true });
  });

  it('dispatches config-changed when energy sensor is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ devices: [{ entity_id: 'switch.plug1', name: 'Plug 1' }] }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // Energy sensor is the 3rd entity dropdown
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
    // sensors cleared when empty entity passed
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
