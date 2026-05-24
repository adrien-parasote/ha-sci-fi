// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import '../../../src/cards/stove/sci-fi-stove-editor.js';
import type { SciFiStoveEditor } from '../../../src/cards/stove/sci-fi-stove-editor.js';

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
      detail: { id: 'room_temperature', kind: 'sensor', value: 'sensor.temp' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.config.sensors?.room_temperature).toBe('sensor.temp');
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
      detail: { id: 'threshold', kind: 'technical', value: '15.5' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.config.threshold).toBe(15.5);
  });

  it('dispatches config-changed on generic field update', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const card = el.shadowRoot!.querySelector('.card')!;
    card.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'custom_field', kind: 'other', value: 'something' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.config.custom_field).toBe('something');
  });
});
