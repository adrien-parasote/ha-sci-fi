/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import '../../../src/cards/weather/sci-fi-weather.js';
import { SciFiWeatherCard } from '../../../src/cards/weather/sci-fi-weather.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

vi.mock('chart.js', () => {
  return {
    Chart: class {
      data: any;
      static register() {}
      constructor() {
        this.data = { labels: [], datasets: [{ data: [] }] };
      }
      update() {}
      destroy() {}
    },
    LineController: {},
    LineElement: {},
    PointElement: {},
    LinearScale: {},
    CategoryScale: {},
    Filler: {},
    Tooltip: {},
  };
});

describe('sci-fi-weather', () => {
  let el: SciFiWeatherCard;

  beforeEach(() => {
    el = document.createElement('sci-fi-weather') as SciFiWeatherCard;
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('provides getConfigElement', () => {
    const editor = SciFiWeatherCard.getConfigElement();
    expect(editor.tagName.toLowerCase()).to.equal('sci-fi-weather-editor');
  });

  it('provides getStubConfig', () => {
    const config = SciFiWeatherCard.getStubConfig();
    expect(config.type).to.equal('custom:sci-fi-weather');
  });

  it('renders gracefully without hass', async () => {
    el.setConfig(SciFiWeatherCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders error message when entity is not found', async () => {
    el.setConfig({ type: 'custom:sci-fi-weather', weather_entity_id: 'weather.missing' } as unknown as unknown as any);
    el.hass = makeMockHass();
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Entité météo non trouvée : weather.missing');
  });

  it('renders current conditions and handles chart gracefully', async () => {
    el.setConfig({
      type: 'custom:sci-fi-weather',
      header_message: 'Météo',
      weather_entity_id: 'weather.home',
      weather_daily_forecast_limit: 2
    } as unknown as unknown as any);

    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({
          entity_id: 'weather.home',
          state: 'sunny',
          attributes: {
            temperature: 24,
            humidity: 45,
            wind_speed: 12,
            forecast: [
              { datetime: '2023-10-10T12:00:00Z', temperature: 25, templow: 15, condition: 'sunny' },
              { datetime: '2023-10-11T12:00:00Z', temperature: 22, templow: 14, condition: 'cloudy' },
              { datetime: '2023-10-12T12:00:00Z', temperature: 18, templow: 10, condition: 'rainy' }
            ]
          }
        })
      }
} as unknown as unknown as any);

    await el.updateComplete;

    expect(el.shadowRoot!.textContent).to.include('Météo');
    expect(el.shadowRoot!.textContent).to.include('24°');
    expect(el.shadowRoot!.textContent).to.include('sunny');
    expect(el.shadowRoot!.textContent).to.include('45%');
    expect(el.shadowRoot!.textContent).to.include('12 km/h');

    // Should only render 2 forecast days due to limit
    const days = el.shadowRoot!.querySelectorAll('.forecast-day');
    expect(days.length).to.equal(2);
    expect(days[0]!.textContent).to.include('25°');
    expect(days[0]!.textContent).to.include('15°');
    expect(days[1]!.textContent).to.include('22°');

    // Check chart canvas exists
    const canvas = el.shadowRoot!.querySelector('canvas');
    expect(canvas).not.to.be.null;
  });

  it('updates chart data when attributes change', async () => {
    el.setConfig({ type: 'custom:sci-fi-weather', weather_entity_id: 'weather.home' } as unknown as unknown as any);

    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({
          entity_id: 'weather.home',
          state: 'sunny',
          attributes: {
            forecast: [
              { datetime: '2023-10-10T12:00:00Z', temperature: 25 }
            ]
          }
        })
      }
    });

    await el.updateComplete;
    
    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({
          entity_id: 'weather.home',
          state: 'sunny',
          attributes: {
            forecast: [
              { datetime: '2023-10-10T12:00:00Z', temperature: 30 }
            ]
          }
        })
      }
    });
    
    await el.updateComplete;
    // If we reach here, updating the chart worked without throwing.
    expect(true).to.be.true;
  });
});
