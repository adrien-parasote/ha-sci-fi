/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
/**
 * <sci-fi-weather> — v1.0.0
 * Weather card with current conditions + hourly/daily forecast chart (Chart.js bundled).
 * Restored UI from legacy main branch.
 */

import { html, css, type TemplateResult, type PropertyValues, render } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiWeatherConfig } from '../../types/config.js';
import WEATHER_ICON_SET from '../../components/icons/data/sf-weather-icons.js';

import {
  Chart,
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

const TAG = 'sci-fi-weather';

const CHART_BG_COLOR = 'rgba(105, 211, 251, 0.5)';
const CHART_BORDER_COLOR = 'rgb(102, 156, 210)';

const SENSORS_MAP: Record<string, any> = {
  temperature: {
    dropdown: { label: 'temp', icon: 'thermometer-glass' },
    chartTitle: { label: 'forecasted_temp', icon: 'thermometer' },
    chartDataKind: 'line',
    chartDatafill: true,
    chartOptionsScales: { y: { suggestedMin: undefined, suggestedMax: 30 } },
  },
  precipitation: {
    dropdown: { label: 'precipitation', icon: 'raindrop-measure' },
    chartTitle: { label: 'forecasted_precipitation', icon: 'raindrops' },
    chartDataKind: 'bar',
    chartDatafill: true,
    chartOptionsScales: { y: { suggestedMin: 0, suggestedMax: 10 } },
  },
  wind_speed: {
    dropdown: { label: 'wind_speed', icon: 'windy-day' },
    chartTitle: { label: 'forecasted_wind_speed', icon: 'windsock' },
    chartDataKind: 'line',
    chartDatafill: false,
    chartOptionsScales: { y: { suggestedMin: 0, suggestedMax: 90 } },
  },
};

@customElement(TAG)
export class SciFiWeatherCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
        :host {
          --default-hexa-width: 60px;
          --main-weather-icon-size: 150px;
          --yellow: rgb(255, 255, 102);
          --orange: orange;
          --red: red;
          font-size: var(--font-size-small, 14px);
          height: 100%;
          width: 100%;
          background-color: transparent;
        }
        ha-card {
          background: rgba(39, 40, 43, 0.3) !important;
          border: none !important;
          box-shadow: none !important;
          height: 100%;
          width: 100%;
          display: block;
          box-sizing: border-box;
        }
        .container {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        /******** HEADER *********/
        .header {
          padding-top: 0px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          column-gap: 20px;
          border-top: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
          background-color: var(--primary-bg-alpha-color, transparent);
        }
        .header .weather-icon svg {
          width: var(--main-weather-icon-size, 150px);
          height: var(--main-weather-icon-size, 150px);
        }
        .header .weather-clock {
          display: flex;
          flex-direction: column;
          align-self: center;
          color: var(--secondary-light-color, #7ca8c9);
        }
        .header .weather-clock .state {
          text-align: end;
        }
        .header .weather-clock .state::first-letter {
          text-transform: capitalize;
        }
        .header .weather-clock .hour {
          font-size: var(--font-size-large, 54px);
          text-align: center;
          color: var(--primary-light-color, #6ecbf5);
          text-shadow: 0px 0px 10px var(--secondary-light-color, rgba(110, 203, 245, 0.5));
          line-height: normal;
          margin: -5px 0;
        }
        .header .weather-clock .date {
          text-align: center;
        }
        /******** ALERTS *********/
        .alerts {
          display: flex;
          flex-direction: row;
          column-gap: 10px;
          background-color: var(--primary-bg-alpha-color, transparent);
          width: 100%;
          justify-content: center;
        }
        .alerts .alert {
          display: flex;
          flex-direction: column;
          text-align: center;
        }
        .alerts .alert.yellow {
          color: var(--yellow, rgb(255, 255, 102));
        }
        .alerts .alert.orange {
          color: var(--orange, orange);
        }
        .alerts .alert.red {
          color: var(--red, red);
        }
        .alerts .alert.yellow sf-icon {
          --icon-color: var(--yellow, rgb(255, 255, 102));
        }
        .alerts .alert.orange sf-icon {
          --icon-color: var(--orange, orange);
        }
        .alerts .alert.red sf-icon {
          --icon-color: var(--red, red);
        }

        /******** TODAY SUMMARY *********/
        .today-summary {
          display: flex;
          width: 100%;
          justify-content: center;
          flex-direction: row;
          border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
          background-color: var(--primary-bg-alpha-color, transparent);
          padding-bottom: 10px;
          margin-top: 0px;
        }
        .today-summary .sensor {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 55px;
          padding: 10px;
          row-gap: 20px;
        }
        .today-summary div .label {
          color: var(--secondary-light-color, #7ca8c9);
          text-align: center;
        }
        .today-summary div .label:last-of-type {
          color: var(--primary-light-color, #6ecbf5);
          text-shadow: 0px 0px 5px var(--secondary-light-color, rgba(110, 203, 245, 0.3));
        }
        /******** CHART *********/
        .chart-container {
          height: 190px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin: 0;
          padding: 10px 0;
          background-color: black;
        }
        .chart-container .chart-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        .chart-container .chart-header .title {
          display: flex;
          flex-direction: row;
          align-items: center;
          color: var(--secondary-light-color, #7ca8c9);
        }
        .chart-header .title .title-icon {
          width: 32px;
          height: 32px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chart-header .title .title-icon svg {
          width: 100%;
          height: 100%;
          fill: var(--primary-text-color);
        }
        .canvas-wrapper {
          position: relative;
          flex: 1;
          width: 100%;
          min-height: 0;
        }
        .chart-container .chart-header .dropdown {
          position: relative;
          display: inline-block;
          margin-right: 10px;
          align-content: center;
        }
        .chart-container .chart-header .dropdown .dropdow-button {
          border-radius: var(--border-radius, 8px);
          border: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
          background-color: rgba(39, 40, 43, 0.3);
          cursor: pointer;
          display: flex;
          flex-direction: row;
          padding: 5px 10px;
          align-items: center;
          column-gap: 10px;
        }

        .chart-container .chart-header .dropdown .dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          border: 1px solid var(--primary-bg-color, rgba(255,255,255,0.1));
          background-color: var(--primary-bg-color, #1a2332);
          box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.5);
          z-index: 10;
        }
        .chart-container .chart-header .dropdown .dropdown-content.show {
          display: block;
        }
        .chart-container .dropdown .dropdown-content .dropdown-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 8px 10px;
          min-width: 150px;
          color: var(--primary-light-alpha-color, #c5d6e6);
          border-bottom: 1px solid var(--secondary-bg-color, rgba(255,255,255,0.05));
          cursor: pointer;
        }
        .chart-container .dropdown .dropdown-content .dropdown-item:hover {
          background-color: var(--secondary-bg-color, rgba(255,255,255,0.1));
        }
        .chart-container .dropdown .dropdown-content .dropdown-item:last-child {
          border: none;
        }
        .chart-container .dropdown .dropdown-content .dropdown-item svg,
        .chart-container .dropdown .dropdow-button .btn-icon svg {
          width: 32px;
          height: 32px;
          fill: var(--primary-text-color);
        }
        .chart-container .dropdown .dropdow-button sf-icon {
          --icon-color: var(--secondary-light-alpha-color, #7ca8c9);
        }
        .chart-container .dropdown .dropdown-content .dropdown-item-label {
          margin-left: 10px;
        }
        /******** DAILY FORECAST *********/
        .days-forecast {
          display: grid;
          border-bottom: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
          border-top: 1px solid var(--sf-border, rgba(0, 210, 255, 0.15));
          padding: 20px 10px;
          background-color: var(--primary-bg-alpha-color, transparent);
          color: var(--secondary-light-color, #7ca8c9);
          font-weight: bold;
        }
        .days-forecast .content {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 15px;
          -webkit-overflow-scrolling: touch;
          padding: 5px;
        }
        .days-forecast .content::-webkit-scrollbar {
          display: none;
        }
        .days-forecast .content .weather {
          display: flex;
          flex-direction: column;
          row-gap: 5px;
          align-items: center;
          min-width: 60px;
          cursor: pointer;
          border-radius: 10px;
          padding: 5px;
          border: 1px solid var(--primary-bg-color, rgba(255,255,255,0.05));
        }
        .days-forecast .content .weather.selected {
          border-color: var(--primary-light-color, #6ecbf5);
          background-color: var(--primary-bg-alpha-color, rgba(255,255,255,0.05));
        }
        .days-forecast .content .weather .state svg {
          width: 45px;
          height: 45px;
        }
        .days-forecast .content .weather .label,
        .days-forecast .content .weather .temp {
          text-align: center;
        }
        .days-forecast .content .weather .label {
          margin-bottom: 5px;
        }
        .days-forecast .content .weather .temp {
          color: var(--primary-light-color, #6ecbf5);
          text-shadow: 0px 0px 5px var(--secondary-light-color, rgba(110, 203, 245, 0.3));
        }
        .days-forecast .content .weather .temp.high {
          color: var(--orange, orange);
          text-shadow: 0px 0px 5px rgba(255, 165, 0, 0.5);
        }
      `,
  ];

  @query('#weather-chart') private _chartCanvas?: HTMLCanvasElement;
  private _chart?: Chart;

  @state() private _hourlyForecast: any[] = [];
  @state() private _dailyForecast: any[] = [];
  @state() private _date: Date = new Date();
  @state() private _day_selected: number = 0;
  @state() private _chartDataKind: string = 'temperature';
  
  private _unsubHourly?: () => void | Promise<void>;
  private _unsubDaily?: () => void | Promise<void>;
  private _subscribedEntity?: string;
  private _clockInterval?: number;

  declare config: SciFiWeatherConfig;

  override connectedCallback(): void {
    super.connectedCallback();
    this._clockInterval = window.setInterval(() => {
      this._date = new Date();
    }, 10000);
    if (this.hass && this.config) {
      if (this.config.chart_first_kind_to_render) {
        this._chartDataKind = this.config.chart_first_kind_to_render;
      }
      void this._subscribeForecasts();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubscribeForecasts();
    if (this._clockInterval) {
      window.clearInterval(this._clockInterval);
    }
    if (this._chart) {
      this._chart.destroy();
      this._chart = undefined;
    }
  }

  override updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (!this._subscribedEntity || this._subscribedEntity !== this.config?.weather_entity) {
      void this._subscribeForecasts();
    }
    
    const shouldRenderChart = !this._chart || 
      changedProps.has('_hourlyForecast') ||
      changedProps.has('_dailyForecast') ||
      changedProps.has('_chartDataKind') ||
      changedProps.has('_day_selected');

    if (shouldRenderChart && this._chartCanvas) {
      this._renderChart();
    }
  }

  private async _subscribeForecasts(): Promise<void> {
    if (!this.hass || !this.config?.weather_entity) return;
    const entityId = this.config.weather_entity;
    
    if (this._subscribedEntity === entityId) return;
    
    this._unsubscribeForecasts();
    this._subscribedEntity = entityId;

    try {
      this._unsubHourly = await this.hass.connection.subscribeMessage?.<{ forecast?: any[] }>(
        (message) => {
          this._hourlyForecast = message.forecast ?? [];
        },
        {
          type: 'weather/subscribe_forecast',
          forecast_type: 'hourly',
          entity_id: entityId,
        }
      );
    } catch {
      this._hourlyForecast = (this.hass.states[entityId]?.attributes['forecast'] as any[]) ?? [];
    }

    try {
      this._unsubDaily = await this.hass.connection.subscribeMessage?.<{ forecast?: any[] }>(
        (message) => {
          this._dailyForecast = message.forecast ?? [];
        },
        {
          type: 'weather/subscribe_forecast',
          forecast_type: 'daily',
          entity_id: entityId,
        }
      );
    } catch {
      this._dailyForecast = (this.hass.states[entityId]?.attributes['forecast'] as any[]) ?? [];
    }
  }

  private _unsubscribeForecasts(): void {
    if (this._unsubHourly) { void this._unsubHourly(); this._unsubHourly = undefined; }
    if (this._unsubDaily) { void this._unsubDaily(); this._unsubDaily = undefined; }
    this._subscribedEntity = undefined;
  }

  // MARK: Data Helpers

  private _getlabels(key: string): string {
    const labels: Record<string, string> = {
      clear: 'Clear sky', 'clear-night': 'Clear night', cloudy: 'Cloudy',
      exceptional: 'Exceptional', fog: 'Fog', hail: 'Risk of hail',
      lightning: 'Thunderstorms', 'lightning-rainy': 'Lightning rainy',
      partlycloudy: 'Sunshine', pouring: 'Heavy rain', rainy: 'Rain',
      snowy: 'Snow', 'snowy-rainy': 'Freezing rain', sunny: 'Sunny',
      windy: 'Windy', 'windy-variant': 'Variable winds', temp: 'Temperature',
      forecasted_temp: 'Forecasted temperatures', precipitation: 'Precipitation',
      forecasted_precipitation: 'Forecasted precipitation', wind_speed: 'Wind speeds',
      forecasted_wind_speed: 'Forecasted wind speeds', cloud: 'Cloud', frozen: 'Frozen',
    };
    return labels[key] ?? key;
  }

  private _isDay(): boolean {
    if (!this.hass) return true;
    const sun = this.hass.states['sun.sun'];
    if (!sun) return true;
    return sun.state !== 'below_horizon';
  }

  private _getWeatherIcon(condition: string, day: boolean): TemplateResult {
    const key = `${condition}-${day ? 'day' : 'night'}`;
    return (WEATHER_ICON_SET as any)[key] ?? (WEATHER_ICON_SET as any)['cloudy-day'] ?? html``;
  }

  private _getIconForHourly(hourlyItem: any): string {
    const dt = new Date(hourlyItem.datetime);
    const sun = this.hass?.states['sun.sun'];
    let state = 'day';
    
    if (sun) {
      // Basic approximation: 6 AM to 8 PM is day
      const h = dt.getHours();
      if (h < 6 || h > 20) state = 'night';
    }
    return `${hourlyItem.condition}-${state}`;
  }

  private _isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  private _getDailyForecasts(): any[] {
    const limit = this.config.weather_daily_forecast_limit ?? 5;
    return this._dailyForecast.slice(0, limit);
  }

  private _getHourlyForSelectedDay(): any[] {
    const daily = this._getDailyForecasts();
    if (daily.length === 0) return [];
    
    const selectedDate = new Date(daily[this._day_selected]?.datetime);
    if (isNaN(selectedDate.getTime())) return [];

    return this._hourlyForecast.filter(hour => {
      const hd = new Date(hour.datetime);
      return this._isSameDay(hd, selectedDate);
    });
  }

  // MARK: Render Helpers

  private _renderHeader(weatherEntity: any) {
    const timeOptions: Intl.DateTimeFormatOptions = { timeStyle: 'short' };
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
    const time = new Intl.DateTimeFormat(this.hass?.locale?.language || navigator.language, timeOptions).format(this._date);
    const date = new Intl.DateTimeFormat(this.hass?.locale?.language || navigator.language, dateOptions).format(this._date);

    const sunEntity = this.hass?.states['sun.sun'];
    const isDay = sunEntity ? sunEntity.state !== 'below_horizon' : true;
    const condition = weatherEntity.state;
    const temp = weatherEntity.attributes.temperature;

    return html`
      <div class="weather-icon">
        ${this._getWeatherIcon(condition, isDay)}
      </div>
      <div class="weather-clock">
        <div class="state">
          ${this._getlabels(condition)}, ${temp}${weatherEntity.attributes.temperature_unit ?? '°C'}
        </div>
        <div class="hour">${time}</div>
        <div class="date">${date}</div>
      </div>
    `;
  }

  private _renderAlerts() {
    if (!this.hass || !this.config.alert?.entity_id) return html``;
    const alertCfg = this.config.alert;
    const alertEntity = this.hass.states[alertCfg.entity_id];
    if (!alertEntity || alertEntity.state === alertCfg.state_green) return html``;

    const alertLevels: Record<string, string> = {
      [alertCfg.state_yellow ?? '']: 'yellow',
      [alertCfg.state_orange ?? '']: 'orange',
      [alertCfg.state_red ?? '']: 'red',
    };

    const activeAlerts = Object.keys(alertEntity.attributes)
      .filter(key => alertLevels[alertEntity.attributes[key] as string])
      .map(key => {
        const levelClass = alertLevels[alertEntity.attributes[key] as string];
        return html`
          <div class="alert ${levelClass}">
            <sf-icon icon="mdi:alert"></sf-icon>
            <div>${key}</div>
          </div>
        `;
      });

    return activeAlerts.length > 0 ? html`${activeAlerts}` : html``;
  }

  private _renderTodaySummary(weatherEntity: any) {
    // Look up extra sensors
    const city = weatherEntity.entity_id.split('.')[1]; // e.g. "home"
    const getSensorVal = (suffix: string) => {
      const s = this.hass?.states[`sensor.${city}_${suffix}`];
      return s ? `${s.state}${s.attributes.unit_of_measurement ? String(s.attributes.unit_of_measurement) : ''}` : '0';
    };

    const cloud = getSensorVal('cloud_cover');
    const precip = getSensorVal('daily_precipitation');
    const rain = getSensorVal('rain_chance');
    const freeze = getSensorVal('freeze_chance');
    const snow = getSensorVal('snow_chance');

    const renderSensor = (name: string, value: string) => html`
      <div class="sensor">
        <div class="label">${this._getlabels(name)}</div>
        <div class="label">${value}</div>
      </div>
    `;

    return html`
      ${renderSensor('cloud', cloud)}
      ${renderSensor('precipitation', precip)}
      ${renderSensor('rainy', rain)}
      ${renderSensor('frozen', freeze)}
      ${renderSensor('snowy', snow)}
    `;
  }

  private _toggleDropdown(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const content = this.shadowRoot?.querySelector('.dropdown-content');
    content?.classList.toggle('show');
  }

  private _selectChartDataKind(e: Event, key: string) {
    this._chartDataKind = key;
    this._toggleDropdown(e);
    if (this._chart) {
      const { datasets } = this._getChartData();
      this._chart.data.datasets = datasets;
      this._chart.options.scales = SENSORS_MAP[this._chartDataKind].chartOptionsScales;
      this._chart.update();
    }
    this.requestUpdate();
  }

  private _renderIcon(iconName: string) {
    if ((WEATHER_ICON_SET as any)[iconName]) {
      return (WEATHER_ICON_SET as any)[iconName];
    }
    return html`<sf-icon .icon=${'mdi:' + iconName} .connection=${this.hass?.connection}></sf-icon>`;
  }

  private _renderChartSection(weatherEntity: any) {
    const config = SENSORS_MAP[this._chartDataKind];
    const unit = this._chartDataKind === 'precipitation' ? 'mm' : 
                 (this._chartDataKind === 'wind_speed' ? 'km/h' : 
                 (this._chartDataKind === 'temperature' ? weatherEntity.attributes.temperature_unit : ''));
                 
    return html`
      <div class="chart-header">
        <div class="title">
          <div class="title-icon">
             ${this._renderIcon(config.chartTitle.icon)}
          </div>
          <div class="label">
            ${this._getlabels(config.chartTitle.label)} (${unit})
          </div>
        </div>
        
        <div class="dropdown">
          <button @click=${(e: Event) => this._toggleDropdown(e)} class="dropdow-button">
            <div class="btn-icon">
              ${this._renderIcon(config.dropdown.icon)}
            </div>
            <sf-icon icon="mdi:chevron-down"></sf-icon>
          </button>
          
          <div class="dropdown-content">
            ${Object.keys(SENSORS_MAP).map(key => html`
              <div class="dropdown-item" @click=${(e: Event) => this._selectChartDataKind(e, key)}>
                ${this._renderIcon(SENSORS_MAP[key].dropdown.icon)}
                <div class="dropdown-item-label">${this._getlabels(SENSORS_MAP[key].dropdown.label)}</div>
              </div>
            `)}
          </div>
        </div>
      </div>
      <div class="canvas-wrapper">
        <canvas id="weather-chart"></canvas>
      </div>
    `;
  }

  private _selectDay(idx: number) {
    if (idx !== this._day_selected) {
      this._day_selected = idx;
      if (this._chart) {
        const { labels, datasets } = this._getChartData();
        this._chart.data.labels = labels;
        this._chart.data.datasets = datasets;
        this._chart.update();
      }
      this.requestUpdate();
    }
  }

  private _renderDays(weatherEntity: any) {
    const daily = this._getDailyForecasts();
    if (daily.length === 0) return html``;
    const tempUnit = weatherEntity.attributes.temperature_unit ?? '°C';

    const getDayName = (dtStr: string) => {
      const dt = new Date(dtStr);
      return new Intl.DateTimeFormat(this.hass?.locale?.language || navigator.language, { weekday: 'short' }).format(dt);
    };

    return html`
      <div class="content">
        ${daily.map((d, idx) => html`
          <div class="weather ${this._day_selected === idx ? 'selected' : ''}" @click="${() => this._selectDay(idx)}">
            <div class="label">${getDayName(d.datetime)}</div>
            <div class="state">${this._getWeatherIcon(d.condition, true)}</div>
            <div class="temp">${d.templow}${tempUnit}</div>
            <div class="temp ${d.temperature > 20 ? 'high' : 'low'}">${d.temperature}${tempUnit}</div>
          </div>
        `)}
      </div>
    `;
  }

  protected override renderCard(): TemplateResult {
    if (!this.hass || !this.config?.weather_entity) return html``;
    const weatherEntity = this.hass.states[this.config.weather_entity];
    if (!weatherEntity) return html`<ha-card><div class="container">Entité météo non trouvée</div></ha-card>`;

    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : html``}
        <div class="container">
          <div class="header">${this._renderHeader(weatherEntity)}</div>
          <div class="alerts">${this._renderAlerts()}</div>
          <div class="today-summary">${this._renderTodaySummary(weatherEntity)}</div>
          <div class="chart-container">${this._renderChartSection(weatherEntity)}</div>
          <div class="days-forecast">${this._renderDays(weatherEntity)}</div>
        </div>
      </ha-card>
    `;
  }

  // MARK: Chart Logic

  private _getChartData() {
    const config = SENSORS_MAP[this._chartDataKind];
    const hourly = this._getHourlyForSelectedDay();

    const labels = hourly.map(h => {
      return new Intl.DateTimeFormat(navigator.language, { hour: '2-digit' }).format(new Date(h.datetime));
    });

    const dataPoints = hourly.map(h => {
      if (this._chartDataKind === 'temperature') return h.temperature;
      if (this._chartDataKind === 'precipitation') return h.precipitation;
      if (this._chartDataKind === 'wind_speed') return h.wind_speed;
      return 0;
    });

    const icons = hourly.map(h => this._getIconForHourly(h));

    const dataset = {
      data: dataPoints,
      weather: icons,
      fill: config.chartDatafill,
      backgroundColor: CHART_BG_COLOR,
      borderColor: CHART_BORDER_COLOR,
      tension: 0.1,
      type: config.chartDataKind,
      borderWidth: config.chartDataKind === 'bar' ? 2 : 3,
      borderRadius: config.chartDataKind === 'bar' ? 5 : 0,
    };

    return { labels, datasets: [dataset] };
  }

  private _getChartPlugins() {
    return {
      id: 'weatherIcon',
      afterDatasetsDraw: (chart: any) => {
        const { ctx, data, chartArea: { top } } = chart;
        ctx.save();
        const dataset = data.datasets[0];
        const dataLength = dataset.weather?.length ?? 0;
        
        dataset.weather?.forEach((iconName: string, idx: number) => {
          if (dataLength < 10 || (dataLength >= 10 && idx % 2 === 0)) {
            const xPos = chart.getDatasetMeta(0).data[idx].x;
            const iconSvg = (WEATHER_ICON_SET as any)[iconName] ?? (WEATHER_ICON_SET as any)['cloudy-day'];
            if (!iconSvg) return;
            
            // Convert lit svg to string
            const div = document.createElement('div');
            render(iconSvg, div);
            
            const image = new Image();
            image.onload = () => {
              ctx.drawImage(image, xPos - 10, top - 25, 20, 20);
            };
            image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(div.innerHTML);
          }
        });
        ctx.restore();
      }
    };
  }

  private _renderChart(): void {
    if (!this._chartCanvas) return;
    
    if (!this._chart) {
      const { labels, datasets } = this._getChartData();
      
      try {
        this._chart = new Chart(this._chartCanvas, {
          data: { labels, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: SENSORS_MAP[this._chartDataKind].chartOptionsScales,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            layout: {
              padding: { top: 30 } // Space for icons
            }
          },
          plugins: [this._getChartPlugins()],
        });
      } catch (err) {
        console.warn("Chart.js failed to init", err);
      }
    } else {
      const { labels, datasets } = this._getChartData();
      this._chart.data.labels = labels;
      this._chart.data.datasets = datasets;
      this._chart.options.scales = SENSORS_MAP[this._chartDataKind].chartOptionsScales;
      this._chart.update();
    }
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiWeatherConfig {
    return { type: `custom:${TAG}`, weather_entity: 'weather.forecast_home' };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiWeatherCard;
  }
}
