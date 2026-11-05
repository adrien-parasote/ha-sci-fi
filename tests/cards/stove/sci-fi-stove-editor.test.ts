// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import '../../../src/cards/stove/sci-fi-stove-editor.js';
import type { SciFiStoveEditor } from '../../../src/cards/stove/sci-fi-stove-editor.js';
import {
  STOVE_PELLET_QUANTITY_THRESHOLD_DEFAULT,
  STOVE_STORAGE_COUNTER_THRESHOLD_DEFAULT,
} from '../../../src/cards/stove/config.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-stove', ...overrides };
}

async function createElement(): Promise<SciFiStoveEditor> {
  const el = document.createElement('sci-fi-stove-editor') as SciFiStoveEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-stove-editor', () => {
  it('renders "No config" when config is not set', async () => {
    const el = await createElement();
    const result = el.render();
    expect(result).toBeDefined();
  });

  it('renders the editor structure when config is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;
    const card = el.shadowRoot!.querySelector('.card');
    expect(card).not.toBeNull();
  });

  it('renders slider inputs for technical settings', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;
    const sliders = el.shadowRoot!.querySelectorAll('sf-editor-slider');
    expect(sliders.length).toBeGreaterThan(0);
  });

  it('dispatches config-changed on sensor field update', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ sensors: {} }));
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const card = el.shadowRoot!.querySelector('.card')!;
    card.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'sensor_inside_temperature', kind: 'sensor', value: 'sensor.temp' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.sensors?.sensor_inside_temperature).toBe('sensor.temp');
  });

  it('dispatches config-changed on technical slider update (parses float)', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const card = el.shadowRoot!.querySelector('.card')!;
    card.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'pellet_quantity_threshold', kind: 'technical', value: '0.3' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.pellet_quantity_threshold).toBe(0.3);
  });

  it('dispatches config-changed on a field of the else branch (kind the editor really emits)', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const card = el.shadowRoot!.querySelector('.card')!;
    card.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'storage_counter', kind: 'storage', value: 'counter.bags' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.storage_counter).toBe('counter.bags');
  });

  it('TC-SPL-U-1123: exposes number_power_level right after the eco switch', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ number_power_level: 'number.stove_power_level' }));
    await el.updateComplete;
    const order = [...el.shadowRoot!.querySelectorAll('[element-id]')].map((n) => n.getAttribute('element-id'));
    expect(order[order.indexOf('switch_eco_mode') + 1]).toBe('number_power_level');
    const input = el.shadowRoot!.querySelector('[element-id="number_power_level"]') as HTMLElement & { value: string };
    expect(input.getAttribute('kind')).toBe('entity');
    expect(input.getAttribute('label')).toBe('Power level number');
    expect(input.value).toBe('number.stove_power_level');

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));
    el.shadowRoot!.querySelector('.card')!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'number_power_level', kind: 'entity', value: 'input_number.stove_power' },
    }));
    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.number_power_level).toBe('input_number.stove_power');
  });

  it('TC-SFS-U-1108: exposes number_fan_speed right after number_power_level', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ number_fan_speed: 'number.stove_fan_speed' }));
    await el.updateComplete;
    const order = [...el.shadowRoot!.querySelectorAll('[element-id]')].map((n) => n.getAttribute('element-id'));
    expect(order[order.indexOf('number_power_level') + 1]).toBe('number_fan_speed');
    const input = el.shadowRoot!.querySelector('[element-id="number_fan_speed"]') as HTMLElement & { value: string };
    expect(input.getAttribute('kind')).toBe('entity');
    expect(input.getAttribute('label')).toBe('Fan speed number');
    expect(input.value).toBe('number.stove_fan_speed');
    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));
    el.shadowRoot!.querySelector('.card')!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'number_fan_speed', kind: 'entity', value: 'number.other_fan' },
    }));
    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.number_fan_speed).toBe('number.other_fan');
  });

  it('TC-SDG-U-09: exposes the three diagnostic sensors right after sensor_status', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ sensors: {
      sensor_door: 'binary_sensor.stove_door', sensor_alert: 'sensor.stove_alert', sensor_error: 'sensor.stove_error',
    } }));
    await el.updateComplete;
    const order = [...el.shadowRoot!.querySelectorAll('[element-id]')].map((n) => n.getAttribute('element-id'));
    const i = order.indexOf('sensor_status');
    expect(order.slice(i + 1, i + 4)).toEqual(['sensor_door', 'sensor_alert', 'sensor_error']);
    for (const [id, label] of [['sensor_door', 'Stove door'], ['sensor_alert', 'Stove alert'], ['sensor_error', 'Stove error']]) {
      expect(el.shadowRoot!.querySelector(`[element-id="${id}"]`)!.getAttribute('label')).toBe(label);
    }
    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));
    el.shadowRoot!.querySelector('.card')!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'sensor_alert', kind: 'sensor', value: 'light.x' },
    }));
    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.sensors.sensor_alert).toBe('light.x');
  });

  it('TC-SWC-U-07: exposes the five wear counters right after sensor_error', async () => {
    const keys = ['sensor_heating_time', 'sensor_fuel_used', 'sensor_igniter_starts', 'sensor_misfires', 'sensor_overheatings'];
    const labels = ['Heating time', 'Fuel used', 'Igniter starts', 'Misfires', 'Overheatings'];
    const el = await createElement();
    el.setConfig(makeConfig({ sensors: Object.fromEntries(keys.map((k) => [k, `sensor.stove_${k.slice(7)}`])) }));
    await el.updateComplete;
    const order = [...el.shadowRoot!.querySelectorAll('[element-id]')].map((n) => n.getAttribute('element-id'));
    const i = order.indexOf('sensor_error');
    expect(order.slice(i + 1, i + 6)).toEqual(keys);
    keys.forEach((k, j) => {
      expect(el.shadowRoot!.querySelector(`[element-id="${k}"]`)!.getAttribute('label')).toBe(labels[j]);
    });
    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));
    el.shadowRoot!.querySelector('.card')!.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'sensor_misfires', kind: 'sensor', value: 'sensor.m' },
    }));
    expect(received).toHaveLength(1);
    expect(received[0]!.detail.config.sensors.sensor_misfires).toBe('sensor.m');
  });

  /**
   * Lot stove-config-surface — the configuration surface of this editor was
   * never asserted: the three tests above pin `room_temperature`, `threshold`
   * and `custom_field`, none of which exists in SciFiStoveSensors or
   * SciFiStoveConfig, so every label and default below was free to drift.
   */
  describe('O1/O4/O6 — the field contract (regression)', () => {
    const labelOf = (el: SciFiStoveEditor, id: string): string | null =>
      el.shadowRoot!.querySelector(`[element-id="${id}"]`)!.getAttribute('label');

    const mounted = async (overrides: Record<string, unknown> = {}): Promise<SciFiStoveEditor> => {
      const el = await createElement();
      el.setConfig(makeConfig(overrides));
      await el.updateComplete;
      return el;
    };

    // O1 — the editor labelled `sensor_actual_power` "consumed" and
    // `sensor_power` "rendered", while the card renders the first as Render and
    // the second as Consume: whoever configured through the UI filled the wrong
    // field. docs/cards/stove.md agrees with the card.
    it('O1 — labels each power sensor the way the card renders it', async () => {
      const el = await mounted({ sensors: {} });
      expect(labelOf(el, 'sensor_actual_power')).toBe('Stove power rendered');
      expect(labelOf(el, 'sensor_power')).toBe('Stove power consumed');
    });

    // O4 — the `entity` field borrowed the status sensor's label key, so the
    // climate entity showed up as "Stove status".
    it('O4 — labels the main entity field with its own key', async () => {
      const el = await mounted({ sensors: {} });
      expect(labelOf(el, 'entity')).toBe('Stove entity');
      expect(labelOf(el, 'entity')).not.toBe(labelOf(el, 'sensor_status'));
    });

    // O6 — nothing asserted that the real sensor keys are rendered at all.
    it('O6 — renders an input for every key of the sensors contract', async () => {
      const el = await mounted({ sensors: {} });
      // `entity` is the climate dropdown (bead ha-sci-fi-iu8m), the rest free text
      const ids = [...el.shadowRoot!.querySelectorAll('sf-editor-input, sf-editor-dropdown-entity')]
        .map((n) => n.getAttribute('element-id'));
      expect(ids).toEqual(expect.arrayContaining([
        'entity',
        'sensor_actual_power',
        'sensor_combustion_chamber_temperature',
        'sensor_inside_temperature',
        'sensor_pressure',
        'sensor_fan_speed',
        'sensor_power',
        'sensor_status',
        'sensor_time_to_service',
        'sensor_pellet_quantity',
        'storage_counter',
        'switch_eco_mode',
      ]));
    });

    // O6 — and that a real key, not an invented one, round-trips.
    it('O6 — emits a real sensor key under config.sensors', async () => {
      const el = await mounted({ sensors: {} });
      const received: CustomEvent[] = [];
      el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

      el.shadowRoot!.querySelector('.card')!.dispatchEvent(new CustomEvent('input-update', {
        bubbles: true,
        composed: false,
        detail: { id: 'sensor_pellet_quantity', kind: 'sensor', value: 'sensor.pellets' },
      }));

      expect(received).toHaveLength(1);
      expect(received[0]!.detail.config.sensors.sensor_pellet_quantity).toBe('sensor.pellets');
    });
  });

  /**
   * O2/O3 — `pellet_quantity_threshold` had four different defaults (docs 0.5,
   * the card 0.1, this slider 0.2) and `storage_counter_threshold` three. The
   * literal now lives once in config.ts; these pin that the slider starts where
   * the card actually computes.
   */
  describe('O2/O3 — threshold defaults (regression)', () => {
    const sliderValue = async (id: string): Promise<string> => {
      const el = await createElement();
      el.setConfig(makeConfig());
      await el.updateComplete;
      const slider = el.shadowRoot!.querySelector(`sf-editor-slider[element-id="${id}"]`) as HTMLElement & { value: string };
      return slider.value;
    };

    it('O2 — the pellet slider starts on the default the card applies', async () => {
      expect(await sliderValue('pellet_quantity_threshold'))
        .toBe(String(STOVE_PELLET_QUANTITY_THRESHOLD_DEFAULT));
    });

    it('O3 — the storage slider starts on the default the card applies', async () => {
      expect(await sliderValue('storage_counter_threshold'))
        .toBe(String(STOVE_STORAGE_COUNTER_THRESHOLD_DEFAULT));
    });

    // The value docs/cards/stove.md publishes, and what every delivered
    // dashboard already lives with: changing it is a behaviour change, so it is
    // pinned rather than left to drift silently a second time.
    it('O2/O3 — both documented defaults are 0.1', () => {
      expect(STOVE_PELLET_QUANTITY_THRESHOLD_DEFAULT).toBe(0.1);
      expect(STOVE_STORAGE_COUNTER_THRESHOLD_DEFAULT).toBe(0.1);
    });

    // The review found the drift surviving in the `Full` YAML example a user is
    // most likely to copy, twelve lines above the options table the lot had
    // corrected. Both places are now read from the doc itself.
    it('O2/O3 — the user doc publishes those defaults, in its table and its example', () => {
      const doc = fs.readFileSync(
        path.resolve(__dirname, '../../../docs/cards/stove.md'),
        'utf8',
      );
      const published = (field: string): string[] => [
        ...[...doc.matchAll(new RegExp(`^\\| \`${field}\`.*\\| \`([0-9.]+)\` \\|$`, 'gm'))].map((m) => m[1]!),
        ...[...doc.matchAll(new RegExp(`^${field}: ([0-9.]+)$`, 'gm'))].map((m) => m[1]!),
      ];

      const pellet = published('pellet_quantity_threshold');
      expect(pellet, 'the doc states pellet_quantity_threshold twice').to.have.lengthOf(2);
      expect(pellet.map(Number)).to.deep.equal([
        STOVE_PELLET_QUANTITY_THRESHOLD_DEFAULT,
        STOVE_PELLET_QUANTITY_THRESHOLD_DEFAULT,
      ]);

      const storage = published('storage_counter_threshold');
      expect(storage, 'the doc states storage_counter_threshold twice').to.have.lengthOf(2);
      expect(storage.map(Number)).to.deep.equal([
        STOVE_STORAGE_COUNTER_THRESHOLD_DEFAULT,
        STOVE_STORAGE_COUNTER_THRESHOLD_DEFAULT,
      ]);
    });
  });
});
