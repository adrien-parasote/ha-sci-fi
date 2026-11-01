 
// @vitest-environment happy-dom
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import '../../../src/cards/weather/sci-fi-weather.js';
import { SciFiWeatherCard } from '../../../src/cards/weather/sci-fi-weather.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

vi.mock('chart.js', () => {
  class DummyClass {}
  return {
    Chart: class {
      data: any;
      options: any;
      static register() {}
      constructor(ctx: any, config: any) {
        if ((globalThis as any).__mockChartShouldThrow) {
          throw new Error('Mock Init Failure');
        }
        this.data = config.data || { labels: [], datasets: [{ data: [] }] };
        this.options = config.options || {};
      }
      update() {}
      destroy() {}
    },
    LineController: DummyClass,
    BarController: DummyClass,
    LineElement: DummyClass,
    BarElement: DummyClass,
    PointElement: DummyClass,
    LinearScale: DummyClass,
    CategoryScale: DummyClass,
    Filler: DummyClass,
    Tooltip: DummyClass
  };
});

describe('sci-fi-weather', () => {
  let el: SciFiWeatherCard;

  beforeEach(() => {
    vi.useFakeTimers();
    el = document.createElement('sci-fi-weather') as SciFiWeatherCard;
    document.body.appendChild(el);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    el.remove();
  });

  describe('Cross-spec Contracts', () => {
    it('provides getConfigElement', () => {
      const editor = SciFiWeatherCard.getConfigElement();
      expect(editor.tagName.toLowerCase()).to.equal('sci-fi-weather-editor');
    });

    it('TC-502: provides getStubConfig', () => {
      const config = SciFiWeatherCard.getStubConfig();
      expect(config.type).to.equal('custom:sci-fi-weather');
      expect(config.weather_entity).to.equal('weather.forecast_home');
    });
  });

  describe('UI Restoration (Unit Tests)', () => {
    beforeEach(async () => {
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
          'weather.home': makeMockEntity({
            entity_id: 'weather.home',
            state: 'sunny',
            attributes: {
              temperature: 24,
              temperature_unit: '°C',
              friendly_name: 'Home',
            }
          }),
          'sun.sun': makeMockEntity({
            entity_id: 'sun.sun',
            state: 'above_horizon',
            attributes: {
              next_dawn: '2026-05-25T04:00:00.000Z',
              next_dusk: '2026-05-24T20:00:00.000Z',
            }
          }),
          'sensor.home_daily_precipitation': makeMockEntity({ state: '2', attributes: { unit_of_measurement: 'mm' } }),
          'sensor.home_freeze_chance': makeMockEntity({ state: '0', attributes: { unit_of_measurement: '%' } }),
          'sensor.home_rain_chance': makeMockEntity({ state: '10', attributes: { unit_of_measurement: '%' } }),
          'sensor.home_snow_chance': makeMockEntity({ state: '0', attributes: { unit_of_measurement: '%' } }),
          'sensor.home_cloud_cover': makeMockEntity({ state: '20', attributes: { unit_of_measurement: '%' } }),
          'sensor.meteo_alert': makeMockEntity({
            entity_id: 'sensor.meteo_alert',
            state: 'Orange',
            attributes: {
              'Crues': 'Orange',
              'Orages': 'Jaune'
            }
          })
        }
      });
      // Mock subscriptions to populate forecast data immediately
      el.hass.connection.subscribeMessage = async (callback: any, params: any) => {
        if (params.forecast_type === 'hourly') {
          callback({ forecast: [{ datetime: '2026-05-24T12:00:00Z', temperature: 25 }] });
        } else if (params.forecast_type === 'daily') {
          callback({ forecast: [{ datetime: '2026-05-24T00:00:00Z', temperature: 25, templow: 15 }] });
        }
        return () => {};
      };
      await el.updateComplete;
    });

    it('TC-WEATHER-U-001: Header rendering', () => {
      const header = el.shadowRoot!.querySelector('.header');
      expect(header).not.to.be.null;
      const clock = header!.querySelector('.weather-clock');
      expect(clock).not.to.be.null;
      expect(clock!.querySelector('.hour')).not.to.be.null;
      expect(clock!.querySelector('.date')).not.to.be.null;
    });

    it('TC-WEATHER-U-002, TC-503: Alerts rendering', () => {
      const alerts = el.shadowRoot!.querySelector('.alerts');
      expect(alerts).not.to.be.null;
      // Should show 'Crues' (Orange) and 'Orages' (Jaune)
      expect(alerts!.textContent).to.include('Crues');
      expect(alerts!.textContent).to.include('Orages');
    });

    it('TC-WEATHER-U-003: Today summary rendering', () => {
      const summary = el.shadowRoot!.querySelector('.today-summary');
      expect(summary).not.to.be.null;
      const sensors = summary!.querySelectorAll('.sensor');
      expect(sensors.length).to.equal(5);
    });

    it('TC-WEATHER-U-004: Chart rendering', () => {
      const chartContainer = el.shadowRoot!.querySelector('.chart-container');
      expect(chartContainer).not.to.be.null;
      const canvas = chartContainer!.querySelector('canvas');
      expect(canvas).not.to.be.null;
    });

    it('TC-WEATHER-U-005: Days list rendering', () => {
      const days = el.shadowRoot!.querySelector('.days-forecast');
      expect(days).not.to.be.null;
      const weathers = days!.querySelectorAll('.weather');
      expect(weathers.length).to.be.greaterThan(0);
    });
  });

  describe('UI Restoration (Integration Tests)', () => {
    beforeEach(async () => {
      (el as any).setConfig({
        type: 'custom:sci-fi-weather',
        weather_entity: 'weather.home'
      });
      el.hass = makeMockHass({
        states: {
          'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny', attributes: { temperature: 24 } }),
          'sun.sun': makeMockEntity({ entity_id: 'sun.sun', state: 'above_horizon', attributes: {} })
        }
      });
      el.hass.connection.subscribeMessage = async (callback: any, params: any) => {
        if (params.forecast_type === 'hourly') {
          callback({ forecast: [{ datetime: '2026-05-24T12:00:00Z', temperature: 25 }] });
        } else if (params.forecast_type === 'daily') {
          callback({ forecast: [{ datetime: '2026-05-24T00:00:00Z', temperature: 25, templow: 15 }] });
        }
        return () => {};
      };
      await el.updateComplete;
    });

    it('IT-WEATHER-I-001: Chart Interaction (Dropdown updates chartDataKind)', async () => {
      const dropdownBtn = el.shadowRoot!.querySelector('.dropdow-button') as HTMLButtonElement;
      expect(dropdownBtn).not.to.be.null;
      dropdownBtn.click(); // Open dropdown
      await el.updateComplete;

      const dropdownItems = el.shadowRoot!.querySelectorAll('.dropdown-item');
      expect(dropdownItems.length).to.be.greaterThan(1);
      
      const windSpeedItem = Array.from(dropdownItems).find(i => i.textContent?.includes('Wind speeds')) as HTMLElement;
      if (windSpeedItem) {
        windSpeedItem.click();
        await el.updateComplete;
        expect((el as any)._chartDataKind).to.equal('wind_speed');
      }
    });

    it('IT-WEATHER-I-002: Day Selection updates _day_selected', async () => {
      // Mock daily forecast to return 2 days
      el.hass.connection.subscribeMessage = async (callback: any, params: any) => {
        if (params.forecast_type === 'daily') {
          callback({ forecast: [
            { datetime: '2026-05-24T00:00:00Z', temperature: 25, templow: 15 },
            { datetime: '2026-05-25T00:00:00Z', temperature: 22, templow: 14 }
          ] });
        }
        return () => {};
      };
      (el as any)._unsubscribeForecasts(); // force clear
      await (el as any)._subscribeForecasts(); // force resubscribe
      await el.updateComplete;

      const weathers = el.shadowRoot!.querySelectorAll('.weather');
      expect(weathers.length).to.equal(2);
      
      const secondDay = weathers[1] as HTMLElement;
      secondDay.click();
      await el.updateComplete;

      expect((el as any)._day_selected).to.equal(1);
    });

    it('IT-WEATHER-I-003: Clock Update via Interval', async () => {
      const initialDate = (el as any)._date.getTime();
      
      // Advance timers by 11 seconds (interval is 10s)
      vi.advanceTimersByTime(11000);
      
      const newDate = (el as any)._date.getTime();
      expect(newDate).to.be.greaterThan(initialDate);
    });

    it('IT-004: test weatherIcon plugin directly and handles init failure gracefully', async () => {
      const plugin = (el as any)._getChartPlugins();
      expect(plugin.id).to.equal('weatherIcon');

      const drawImageSpy = vi.fn();
      const mockChart = {
        ctx: {
          save: vi.fn(),
          restore: vi.fn(),
          drawImage: drawImageSpy
        },
        data: {
          datasets: [{
            weather: ['sunny-day'],
            data: [25]
          }]
        },
        chartArea: { top: 10 },
        getDatasetMeta: () => ({
          data: [{ x: 50 }]
        })
      };

      const originalImage = globalThis.Image;
      class MockImage {
        onload: any = null;
        set src(val: string) {
          if (this.onload) this.onload();
        }
      }
      globalThis.Image = MockImage as any;

      plugin.afterDatasetsDraw(mockChart);

      expect(drawImageSpy).toHaveBeenCalled();
      globalThis.Image = originalImage;

      // Test initialization failure error handling
      (globalThis as any).__mockChartShouldThrow = true;
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      (el as any)._chart = undefined;
      (el as any)._renderChart();

      expect(consoleWarnSpy).toHaveBeenCalledWith("Chart.js failed to init", expect.any(Error));

      (globalThis as any).__mockChartShouldThrow = false;
      consoleWarnSpy.mockRestore();
    });

    it('IT-005: _renderIcon falls back to sf-icon when icon not in WEATHER_ICON_SET (line 389)', async () => {
      // Invoke _renderIcon directly with a key not in the weather icon set (plain mdi name)
      const result: any = (el as any)._renderIcon('unknown-weather-icon');
      // It should be a TemplateResult containing 'sf-icon' (the fallback branch at line 389)
      expect(String(result?.strings ?? '')).to.include('sf-icon');
    });

    it('IT-006: _getChartData covers precipitation and wind_speed branches (lines 501-503)', () => {
      // Seed hourly forecast with precipitation and wind_speed data
      (el as any)._hourlyForecast = [
        { datetime: '2026-05-24T12:00:00Z', temperature: 22, precipitation: 3.5, wind_speed: 45, condition: 'rainy' },
      ];
      (el as any)._dailyForecast = [
        { datetime: '2026-05-24T00:00:00Z', temperature: 25, templow: 15 },
      ];
      (el as any)._day_selected = 0;

      // Test precipitation branch (line 501)
      (el as any)._chartDataKind = 'precipitation';
      const precipData = (el as any)._getChartData();
      expect(precipData.datasets[0].data[0]).to.equal(3.5);

      // Test wind_speed branch (line 502)
      (el as any)._chartDataKind = 'wind_speed';
      const windData = (el as any)._getChartData();
      expect(windData.datasets[0].data[0]).to.equal(45);

      // Restore to valid kind
      (el as any)._chartDataKind = 'temperature';
    });

    it('IT-007: _selectChartDataKind updates chart when already initialized (line 419)', async () => {
      // Force a real chart to be present so the if (this._chart) branch fires
      (el as any)._chartDataKind = 'temperature';
      (el as any)._hourlyForecast = [
        { datetime: '2026-05-24T12:00:00Z', temperature: 22, precipitation: 1, wind_speed: 30, condition: 'sunny' },
      ];
      (el as any)._dailyForecast = [{ datetime: '2026-05-24T00:00:00Z', temperature: 25, templow: 15 }];

      // Simulate chart already initialized (by setting a stub object with update spy)
      const updateSpy = vi.fn();
      (el as any)._chart = { data: { datasets: [] }, options: {}, update: updateSpy, destroy: vi.fn() };

      // Fire _selectChartDataKind with a mock event
      const mockEvent = new Event('click');
      mockEvent.preventDefault = vi.fn();
      mockEvent.stopPropagation = vi.fn();
      (el as any)._selectChartDataKind(mockEvent, 'precipitation');

      expect((el as any)._chartDataKind).to.equal('precipitation');
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('O1 — chart_first_kind_to_render (regression)', () => {
    const makeHass = () =>
      makeMockHass({
        states: {
          'weather.home': makeMockEntity({
            entity_id: 'weather.home',
            state: 'sunny',
            attributes: { temperature: 24, temperature_unit: '°C', friendly_name: 'Home' },
          }),
          'sun.sun': makeMockEntity({
            entity_id: 'sun.sun',
            state: 'above_horizon',
            attributes: {
              next_dawn: '2026-05-25T04:00:00.000Z',
              next_dusk: '2026-05-24T20:00:00.000Z',
            },
          }),
        },
      });

    // Home Assistant configures and feeds a card BEFORE it enters the DOM, and
    // connectedCallback is where chart_first_kind_to_render is read. Mounting in
    // the other order leaves that line unexecuted, so the config value never
    // reaches _chartDataKind and the test proves nothing.
    let card: SciFiWeatherCard;

    const mount = async (kind: unknown) => {
      card = document.createElement('sci-fi-weather') as SciFiWeatherCard;
      (card as any).setConfig({
        type: 'custom:sci-fi-weather',
        weather_entity: 'weather.home',
        chart_first_kind_to_render: kind,
      });
      card.hass = makeHass();
      card.hass.connection.subscribeMessage = async () => () => {};
      document.body.appendChild(card);
      await card.updateComplete;
    };

    afterEach(() => {
      card?.remove();
    });

    // The visual editor writes 'wind'; weather.md documents 'wind_speed'. Both
    // spellings exist in the wild, so both must render their chart.
    it.each(['temperature', 'precipitation', 'wind', 'wind_speed'])(
      'renders the chart for chart_first_kind_to_render: %s',
      async kind => {
        await mount(kind);
        expect(card.shadowRoot!.querySelector('.sf-error-card')).to.be.null;
        expect(card.shadowRoot!.querySelector('.chart-header .dropdow-button')).not.to.be.null;
      }
    );

    it('maps the editor value wind onto the wind_speed series', async () => {
      await mount('wind');
      expect((card as any)._chartDataKind).to.equal('wind_speed');
    });

    it('falls back to temperature on a value no series answers', async () => {
      await mount('tornado');
      expect(card.shadowRoot!.querySelector('.sf-error-card')).to.be.null;
      expect((card as any)._chartDataKind).to.equal('temperature');
    });
  });
});
