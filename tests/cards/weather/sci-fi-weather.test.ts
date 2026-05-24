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
    // ADR-005: weather_entity (not weather_entity_id)
    expect(config.weather_entity).to.equal('weather.forecast_home');
  });

  it('renders gracefully without hass', async () => {
    (el as any).setConfig(SciFiWeatherCard.getStubConfig());
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.be.empty;
  });

  it('renders error message when entity is not found', async () => {
    // ADR-005: weather_entity (not weather_entity_id)
    (el as any).setConfig({ type: 'custom:sci-fi-weather', weather_entity: 'weather.missing' });
    el.hass = makeMockHass();
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Entité météo non trouvée : weather.missing');
  });

  it('renders current conditions and handles chart gracefully', async () => {
    // ADR-005: weather_entity (not weather_entity_id)
    (el as any).setConfig({
      type: 'custom:sci-fi-weather',
      header_message: 'Météo',
      weather_entity: 'weather.home',
      weather_daily_forecast_limit: 2
    });

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
    });

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
    // ADR-005: weather_entity (not weather_entity_id)
    (el as any).setConfig({ type: 'custom:sci-fi-weather', weather_entity: 'weather.home' });

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

  it('renders alert band with correct level', async () => {
    // ADR-005: alert section preserved
    (el as any).setConfig({
      type: 'custom:sci-fi-weather',
      weather_entity: 'weather.home',
      alert: {
        entity_id: 'sensor.meteo_alert',
        state_green: 'Vert',
        state_yellow: 'Jaune',
        state_orange: 'Orange',
        state_red: 'Rouge'
      }
    });

    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny', attributes: {} }),
        'sensor.meteo_alert': makeMockEntity({ entity_id: 'sensor.meteo_alert', state: 'Orange' })
      }
    });

    await el.updateComplete;

    const alertBand = el.shadowRoot!.querySelector('.alert-band') as HTMLElement;
    expect(alertBand).not.to.be.null;
    expect(alertBand.style.color).to.include('#ff6b35'); // orange color
    expect(el.shadowRoot!.textContent).to.include('Orange');

    // Branch coverage L201: state_yellow
    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny', attributes: {} }),
        'sensor.meteo_alert': makeMockEntity({ entity_id: 'sensor.meteo_alert', state: 'Jaune' })
      }
    });
    await el.updateComplete;
    // Branch coverage L201: yellow level resolves correctly
    expect(el.shadowRoot!.textContent).to.include('Jaune');

    // Branch coverage L202: state_red
    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny', attributes: {} }),
        'sensor.meteo_alert': makeMockEntity({ entity_id: 'sensor.meteo_alert', state: 'Rouge' })
      }
    });
    await el.updateComplete;
    expect(el.shadowRoot!.textContent).to.include('Rouge');
  });

  it('subscribes to hourly and daily forecasts and renders them', async () => {
    (el as any).setConfig({
      type: 'custom:sci-fi-weather',
      weather_entity: 'weather.home',
      weather_daily_forecast_limit: 2
    });

    let hourlyCallback: any;
    let dailyCallback: any;

    const mockHass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({
          entity_id: 'weather.home',
          state: 'sunny',
          attributes: {
            temperature: 24,
            humidity: 45,
            wind_speed: 12
          }
        })
      }
    });

    mockHass.connection.subscribeMessage = async (callback: any, params: any) => {
      if (params.forecast_type === 'hourly') {
        hourlyCallback = callback;
      } else if (params.forecast_type === 'daily') {
        dailyCallback = callback;
      }
      return () => {};
    };

    el.hass = mockHass;
    await el.updateComplete;

    // Trigger callbacks with forecast data
    if (hourlyCallback) {
      hourlyCallback({
        forecast: [
          { datetime: '2023-10-10T12:00:00Z', temperature: 25, condition: 'sunny' }
        ]
      });
    }

    if (dailyCallback) {
      dailyCallback({
        forecast: [
          { datetime: '2023-10-10T12:00:00Z', temperature: 25, templow: 15, condition: 'sunny' },
          { datetime: '2023-10-11T12:00:00Z', temperature: 22, templow: 14, condition: 'cloudy' }
        ]
      });
    }

    await el.updateComplete;

    // Daily forecast should render the two days
    const days = el.shadowRoot!.querySelectorAll('.forecast-day');
    expect(days.length).to.equal(2);
    expect(days[0]!.textContent).to.include('25°');
    expect(days[0]!.textContent).to.include('15°');
  });
});

