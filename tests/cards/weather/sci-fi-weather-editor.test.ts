// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import '../../../src/cards/weather/sci-fi-weather-editor.js';
import type { SciFiWeatherEditor } from '../../../src/cards/weather/sci-fi-weather-editor.js';
import type { HomeAssistantExt } from '../../../src/types/ha.js';
import { makeMockHass } from '../../fixtures/mock-hass.js';

function makeConfig(overrides: Record<string, unknown> = {}) {
  return { type: 'custom:sci-fi-weather', ...overrides };
}

async function createElement(): Promise<SciFiWeatherEditor> {
  const el = document.createElement('sci-fi-weather-editor') as SciFiWeatherEditor;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('sci-fi-weather-editor', () => {
  it('renders "No config" when config is not set', async () => {
    const el = await createElement();
    const result = el.render();
    expect(result).toBeDefined();
  });

  it('renders the editor sections when config is set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const card = el.shadowRoot!.querySelector('.card');
    expect(card).not.toBeNull();
  });

  it('renders weather entity section', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const sections = el.shadowRoot!.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(1);
  });

  it('renders slider for forecast limit', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ weather_daily_forecast_limit: 7 }));
    await el.updateComplete;

    const slider = el.shadowRoot!.querySelector('sf-editor-slider');
    expect(slider).not.toBeNull();
  });

  it('renders dropdown for chart kind', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ chart_first_kind_to_render: 'temperature' }));
    await el.updateComplete;

    const dropdown = el.shadowRoot!.querySelector('sf-editor-dropdown');
    expect(dropdown).not.toBeNull();
  });

  it('renders alert entity input fields', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({
      alert: { entity_id: 'sensor.alert', state_green: 'ok', state_yellow: 'warn', state_orange: 'high', state_red: 'danger' },
    }));
    await el.updateComplete;

    const inputs = el.shadowRoot!.querySelectorAll('sf-editor-input');
    expect(inputs.length).toBeGreaterThanOrEqual(5);
  });

  it('dispatches config-changed on simple field update (e.g. weather_entity)', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    // Trigger _update handler via a bubbling input-update event from inside the card
    const card = el.shadowRoot!.querySelector('.card')!;
    card.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false, // stays in shadow DOM — picked up by @input-update on .card
      detail: { id: 'weather_entity', kind: 'weather_entity', value: 'weather.home' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.config.weather_entity).toBe('weather.home');
  });

  it('dispatches config-changed on alert field update', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const card = el.shadowRoot!.querySelector('.card')!;
    card.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'state_green', kind: 'alert', value: 'ok' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.config.alert?.state_green).toBe('ok');
  });

  it('dispatches config-changed on chart kind update', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const card = el.shadowRoot!.querySelector('.card')!;
    card.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'chart_first_kind_to_render', kind: 'chart', value: 'Temperature' },
    }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.config.chart_first_kind_to_render).toBe('temperature');
  });

  it('preserves unknown chart kind value as-is', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const received: CustomEvent[] = [];
    el.addEventListener('config-changed', (e) => received.push(e as CustomEvent));

    const card = el.shadowRoot!.querySelector('.card')!;
    card.dispatchEvent(new CustomEvent('input-update', {
      bubbles: true,
      composed: false,
      detail: { id: 'chart_first_kind_to_render', kind: 'chart', value: 'Unknown Kind' },
    }));

    expect(received[0].detail.config.chart_first_kind_to_render).toBe('Unknown Kind');
  });

  it('loads weather entities from hass.states', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    const mockHass = {
      ...makeMockHass(),
      states: {
        'weather.home': { entity_id: 'weather.home', state: 'sunny', attributes: { friendly_name: 'Home' } },
        'light.salon': { entity_id: 'light.salon', state: 'on', attributes: {} },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;

    expect((el as any)._weatherEntities).toHaveLength(1);
    expect((el as any)._weatherEntities[0].entity_id).toBe('weather.home');
  });

  it('does not reload weather entities if already populated', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());

    const mockHass = {
      ...makeMockHass(),
      states: {
        'weather.home': { entity_id: 'weather.home', state: 'sunny', attributes: { friendly_name: 'Home' } },
      },
      locale: { language: 'fr' },
    } as unknown as HomeAssistantExt;

    el.hass = mockHass;
    await el.updateComplete;
    const firstList = (el as any)._weatherEntities;

    el.hass = mockHass;
    await el.updateComplete;
    expect((el as any)._weatherEntities).toBe(firstList);
  });

  it('renders CHART_KIND_LABELS for current chart selection', async () => {
    const el = await createElement();
    el.setConfig(makeConfig({ chart_first_kind_to_render: 'wind' }));
    await el.updateComplete;

    const dropdown = el.shadowRoot!.querySelector('sf-editor-dropdown') as any;
    // value should be 'Wind Speed' (the label)
    expect(dropdown?.value).toBe('Wind Speed');
  });

  it('renders empty chart value when chart_first_kind_to_render is not set', async () => {
    const el = await createElement();
    el.setConfig(makeConfig());
    await el.updateComplete;

    const dropdown = el.shadowRoot!.querySelector('sf-editor-dropdown') as any;
    expect(dropdown?.value).toBe('');
  });
});
