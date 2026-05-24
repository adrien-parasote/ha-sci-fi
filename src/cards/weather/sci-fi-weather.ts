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
        font-size: var(--font-size-small);
        height: 100%;
        width: 100%;
        background-color: black;
      }
      .container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      /* HEADER */
      .header {
        padding-top: 10px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        column-gap: 20px;
        border-top: var(--border-width) solid var(--primary-bg-color);
        background-color: var(--primary-bg-alpha-color);
      }
      .header .weather-icon {
        width: var(--main-weather-icon-size);
        height: var(--main-weather-icon-size);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .header .weather-clock {
        display: flex;
        flex-direction: column;
        align-self: center;
        color: var(--secondary-light-color);
      }
      .header .weather-clock .state { text-align: end; text-transform: capitalize; }
      .header .weather-clock .hour {
        font-size: var(--font-size-large);
        text-align: center;
        color: var(--primary-light-color);
        text-shadow: 0px 0px 5px var(--secondary-light-color);
        line-height: normal;
      }
      .header .weather-clock .date {
        text-align: center;
      }
      /* ALERTS */
      .alerts {
        display: flex;
        flex-direction: row;
        column-gap: 10px;
        background-color: var(--primary-bg-alpha-color);
        width: 100%;
        justify-content: center;
      }
      .alerts .alert {
        display: flex;
        flex-direction: column;
        text-align: center;
      }
      .alerts .alert.yellow { color: var(--yellow); }
      .alerts .alert.orange { color: var(--orange); }
      .alerts .alert.red { color: var(--red); }
      .alerts .alert.yellow sf-icon { --icon-color: var(--yellow); }
      .alerts .alert.orange sf-icon { --icon-color: var(--orange); }
      .alerts .alert.red sf-icon { --icon-color: var(--red); }

      /* TODAY SUMMARY */
      .today-summary {
        display: flex;
        width: 100%;
        justify-content: center;
        flex-direction: row;
        border-bottom: var(--border-width) solid var(--primary-bg-color);
        background-color: var(--primary-bg-alpha-color);
        padding-bottom: 25px;
      }
      .today-summary .sensor {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 55px;
        padding: 10px;
      }
      .today-summary .sensor .state {
        width: 40px;
        height: 40px;
      }
      .today-summary .sensor .label {
        color: var(--secondary-light-color);
        text-align: center;
      }
      .today-summary .sensor .label:last-of-type {
        color: var(--primary-light-color);
        text-shadow: 0px 0px 5px var(--secondary-light-color);
      }
      /* CHART */
      .chart-container {
        margin: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        height: 180px;
      }
      .chart-container canvas {
        width: 100% !important;
        height: 100% !important;
      }
      .chart-container .chart-header {
        display: flex;
        flex-direction: row;
        margin-bottom: 5px;
      }
      .chart-container .chart-header .title {
        display: flex;
        flex: 1;
        flex-direction: row;
        align-items: center;
        gap: 5px;
      }
      .chart-container .chart-header .title .title-icon {
        width: 24px;
        height: 24px;
      }
      .chart-container .chart-header .title .label {
        align-self: center;
        color: var(--primary-light-color);
        text-shadow: 0px 0px 5px var(--secondary-light-color);
      }
      .chart-container .chart-header .dropdown {
        position: relative;
        display: inline-block;
        margin-right: 10px;
        align-content: center;
        z-index: 10;
      }
      .chart-container .chart-header .dropdown .dropdow-button {
        border-radius: var(--border-radius);
        border: var(--border-width) solid var(--primary-bg-color);
        background-color: var(--primary-bg-alpha-color);
        cursor: pointer;
        display: flex;
        flex-direction: row;
        padding: 4px;
        align-items: center;
        gap: 4px;
      }
      .chart-container .chart-header .dropdown .dropdow-button .btn-icon {
        width: 20px;
        height: 20px;
      }
      .chart-container .chart-header .dropdown .dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        top: 100%;
        border: var(--border-width) solid var(--primary-bg-color);
        background-color: var(--primary-bg-color);
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 20;
      }
      .chart-container .chart-header .dropdown .dropdown-content.show {
        display: block;
      }
      .chart-container .chart-header .dropdown .dropdown-content .dropdown-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        padding: 5px 10px;
        min-width: 120px;
        color: var(--primary-light-alpha-color);
        border-top: var(--border-width) solid var(--secondary-bg-color);
        border-bottom: var(--border-width) solid var(--secondary-bg-color);
        cursor: pointer;
      }
      .chart-container .chart-header .dropdown .dropdown-content .dropdown-item:hover {
        background-color: var(--secondary-bg-color);
      }
      .chart-container .chart-header .dropdown .dropdown-content .dropdown-item .item-icon {
        width: 20px;
        height: 20px;
      }

      /* DAILY FORECAST */
      .days-forecast {
        display: grid;
        border-bottom: var(--border-width) solid var(--primary-bg-color);
        border-top: var(--border-width) solid var(--primary-bg-color);
        padding: 20px 10px;
        background-color: var(--primary-bg-alpha-color);
        color: var(--secondary-light-color);
        font-weight: bold;
      }
      .days-forecast .content {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        gap: 5px;
        -webkit-overflow-scrolling: touch;
      }
      .days-forecast .content::-webkit-scrollbar {
        display: none;
      }
      .days-forecast .content .weather {
        border: var(--border-width) solid var(--secondary-light-alpha-color);
        border-radius: var(--border-radius);
        padding: 10px 15px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 60px;
      }
      .days-forecast .content .weather.selected {
        background-color: var(--secondary-light-light-alpha-color);
      }
      .days-forecast .content .weather .state {
        width: 40px;
        height: 40px;
        margin: 5px 0;
      }
      .days-forecast .content .weather .label,
      .days-forecast .content .weather .temp {
        text-align: center;
      }
      .days-forecast .content .weather .label { margin-bottom: 5px; }
      .days-forecast .content .weather .temp {
        color: var(--primary-light-color);
        text-shadow: 0px 0px 5px var(--secondary-light-color);
      }
      .days-forecast .content .weather .temp.hight {
        color: var(--primary-error-color);
        text-shadow: 0px 0px 5px var(--primary-error-alpha-color);
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
    this._renderChart();
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
    const condition = weatherEntity.state;
    const tempUnit = weatherEntity.attributes.temperature_unit ?? '°C';

    const timeOptions: Intl.DateTimeFormatOptions = { timeStyle: 'short' };
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
    
    const timeStr = new Intl.DateTimeFormat(navigator.language, timeOptions).format(this._date);
    const dateStr = new Intl.DateTimeFormat(navigator.language, dateOptions).format(this._date);

    return html`
      <div class="weather-icon">
        ${this._getWeatherIcon(condition, this._isDay())}
      </div>
      <div class="weather-clock">
        <div class="state">${this._getlabels(condition)}, ${tempUnit}</div>
        <div class="hour">${timeStr}</div>
        <div class="date">${dateStr}</div>
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

    const renderSensor = (name: string, iconKey: string, value: string) => html`
      <div class="sensor">
        <div class="label">${this._getlabels(name)}</div>
        <div class="state">
          ${(WEATHER_ICON_SET as any)[iconKey] ?? (WEATHER_ICON_SET as any)['cloudy-day']}
        </div>
        <div class="label">${value}</div>
      </div>
    `;

    return html`
      ${renderSensor('cloud', 'cloudy-day', cloud)}
      ${renderSensor('precipitation', 'pouring-day', precip)}
      ${renderSensor('rainy', 'rainy-day', rain)}
      ${renderSensor('frozen', 'snowy-day', freeze)}
      ${renderSensor('snowy', 'snowy-day', snow)}
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

  private _renderChartSection(weatherEntity: any) {
    const config = SENSORS_MAP[this._chartDataKind];
    const unit = weatherEntity.attributes[`${this._chartDataKind}_unit`] ?? 
                 (this._chartDataKind === 'temperature' ? weatherEntity.attributes.temperature_unit : '');
                 
    return html`
      <div class="chart-header">
        <div class="title">
          <div class="title-icon">
             ${(WEATHER_ICON_SET as any)[config.chartTitle.icon] ?? html``}
          </div>
          <div class="label">
            ${this._getlabels(config.chartTitle.label)} (${unit})
          </div>
        </div>
        
        <div class="dropdown">
          <button @click=${(e: Event) => this._toggleDropdown(e)} class="dropdow-button">
            <div class="btn-icon">
              ${(WEATHER_ICON_SET as any)[config.dropdown.icon] ?? html``}
            </div>
            <sf-icon icon="mdi:chevron-down"></sf-icon>
          </button>
          <div class="dropdown-content">
            ${Object.keys(SENSORS_MAP).map(key => html`
              <div @click=${(e: Event) => this._selectChartDataKind(e, key)} class="dropdown-item">
                <div class="item-icon">
                  ${(WEATHER_ICON_SET as any)[SENSORS_MAP[key].dropdown.icon] ?? html``}
                </div>
                <div class="dropdown-item-label">
                  ${this._getlabels(SENSORS_MAP[key].dropdown.label)}
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
      <canvas id="weather-chart"></canvas>
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
      return new Intl.DateTimeFormat(navigator.language, { weekday: 'short' }).format(dt);
    };

    return html`
      <div class="content">
        ${daily.map((d, idx) => html`
          <div class="weather ${this._day_selected === idx ? 'selected' : ''}" @click="${() => this._selectDay(idx)}">
            <div class="label">${getDayName(d.datetime)}</div>
            <div class="state">${this._getWeatherIcon(d.condition, true)}</div>
            <div class="temp">${d.templow}${tempUnit}</div>
            <div class="temp hight">${d.temperature}${tempUnit}</div>
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
