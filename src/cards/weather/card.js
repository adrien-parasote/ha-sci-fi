import Chart from 'chart.js/auto';
import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/tiles.js';
import common_style from '../../helpers/common_style.js';
import {WEEK_DAYS} from '../../helpers/entities/const.js';
import {SunEntity, WeatherEntity} from '../../helpers/entities/weather.js';
import {getIcon, getWeatherIcon} from '../../helpers/icons/icons.js';
import WEATHER_ICON_SET from '../../helpers/icons/weather_iconset.js';
import {
  CHART_BG_COLOR,
  CHART_BORDER_COLOR,
  PACKAGE,
  SENSORS_MAP,
} from './const.js';
import {SciFiWeatherEditor} from './editor.js';
import style from './style.js';

export class SciFiWeather extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private
  _chart;
  _chartDataKind = 'temperature';

  static get properties() {
    return {
      _config: {type: Object},
      _sun: {type: Object},
      _weather: {type: Object},
      _date: {type: Object},
      _activeDay: {type: Number},
    };
  }

  constructor() {
    super();
    // Clock
    this._date = new Date();
    // Auto update date
    setInterval(() => {
      this._date = new Date();
    }, 1000);
  }

  __validateConfig(config) {
    if (!config.sun_entity) throw new Error('You need to define a sun entity');
    if (!config.weather_entity)
      throw new Error('You need to define a weather entity');
    if (!config.weather_hourly_forecast_limit)
      config.weather_hourly_forecast_limit = 24; // max 72
    if (config.weather_hourly_forecast_limit > 72)
      throw new Error('Hourly forecast is limite to 72h max');
    if (!config.weather_daily_forecast_limit)
      config.weather_daily_forecast_limit = 15; // max 15
    if (config.weather_daily_forecast_limit > 15)
      throw new Error('Daily forecast is limite to 15 days max');

    return config;
  }

  setConfig(config) {
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
    this._activeDay = 0;
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  getCardSize() {
    return 4;
  }

  getLayoutOptions() {
    return {
      grid_rows: 4,
      grid_columns: 4,
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

    const sun = new SunEntity(hass, this._config.sun_entity);
    if (!this._sun || !isEqual(sun, this._sun)) this._sun = sun;

    const weather = new WeatherEntity(hass, this._config.weather_entity);
    if (!this._weather || !isEqual(weather, this._weather)) {
      this._weather = weather;
      // Get new forcast in case of global weather change
      this._weather.getForecasts(hass);
    }
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="container">
        <div class="header">${this.__renderHeader()}</div>
        <div class="today-summary">${this.__renderTodaySummary()}</div>
        <div class="chart-container">${this.__renderChart()}</div>
        <div class="days-forecast">${this.__renderDays()}</div>
      </div>
    `;
  }

  __renderHeader() {
    return html`
      <div class="weather-icon">
        ${this._weather.getWeatherIcon(this._sun.isDay())}
      </div>
      <div class="weather-clock">
        <div class="state">
          ${this._weather.weatherName}, ${this._weather.temperatureUnit}
        </div>
        <div class="hour">${this.__getHour()}</div>
        <div class="date">${this.__getDate()}</div>
      </div>
    `;
  }

  __getHour() {
    const options = {
      minimumIntegerDigits: 2,
      useGrouping: false,
    };
    return [
      this._date.getHours().toLocaleString('fr-FR', options),
      this._date.getMinutes().toLocaleString('fr-FR', options),
    ].join(':');
  }

  __getDate() {
    const options = {
      minimumIntegerDigits: 2,
      useGrouping: false,
    };
    return [
      [WEEK_DAYS[this._date.getDay()].short, ','].join(''),
      [
        this._date.getDate().toLocaleString('fr-FR', options),
        (this._date.getMonth() + 1).toLocaleString('fr-FR', options),
        this._date.getFullYear().toLocaleString('fr-FR', options),
      ].join('.'),
    ].join(' ');
  }

  __renderDays() {
    return html` <div class="content">
      ${this._weather.daily_forecast
        .slice(0, this._config.weather_daily_forecast_limit)
        .map((daily_forecast) => {
          return html`${daily_forecast.render(true)}`;
        })}
    </div>`;
  }

  __renderChart() {
    return html`
      <div class="chart-header">
        ${this.__getChartTitle()} ${this.__getDropdownMenu()}
      </div>
      <canvas id="chart"></canvas>
    `;
  }

  __getDropdownMenu() {
    return html` <div class="dropdown">
      <button @click=${this.__toggleDropdown} class="dropdow-button">
        ${getWeatherIcon(SENSORS_MAP[this._chartDataKind].dropdown.icon)}
        ${getIcon('mdi:chevron-down')}
      </button>
      <div class="dropdown-content">
        ${Object.keys(SENSORS_MAP).map((key) => {
          return html` <div
            @click=${(e) => this.__selectChartDataKind(e, key)}
            class="dropdown-item"
          >
            ${getWeatherIcon(SENSORS_MAP[key].dropdown.icon)}
            <div class="dropdown-item-label">
              ${SENSORS_MAP[key].dropdown.label}
            </div>
          </div>`;
        })}
      </div>
    </div>`;
  }

  __getChartTitle() {
    return html`
      <div class="title">
        ${getWeatherIcon(SENSORS_MAP[this._chartDataKind].chartTitle.icon)}
        <div class="label">
          ${SENSORS_MAP[this._chartDataKind].chartTitle.label}
        </div>
      </div>
    `;
  }

  __renderTodaySummary() {
    const sensors = [
      this._weather.cloud_cover,
      this._weather.daily_precipitation,
      this._weather.rain_chance,
      this._weather.freeze_chance,
      this._weather.snow_chance,
    ].map((sensor) => {
      return this.__renderTodaySensor(sensor.name, sensor.icon, sensor.value);
    });
    return html`${sensors}`;
  }

  __renderTodaySensor(name, icon, value) {
    return html`<div class="sensor">
      <div class="label">${name}</div>
      <div class="state">${getWeatherIcon(icon)}</div>
      <div class="label">${value}</div>
    </div>`;
  }

  firstUpdated(changedProperties) {
    let ctx = this.shadowRoot.querySelector('#chart');
    if (ctx) {
      ctx = ctx.getContext('2d');
      this._chart = new Chart(ctx, {
        data: this.__getChartDatasets(),
        options: {
          plugins: {
            title: {
              display: true,
              text: '',
              padding: 20,
            },
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
        },
        plugins: [this.__getChartPlugings()],
      });
    }
  }

  __getChartPlugings() {
    return {
      id: 'weatherIcon',
      afterDatasetsDraw(chart, args, plugins) {
        const {
          ctx,
          data,
          chartArea: {top, left, right},
        } = chart;
        ctx.save();
        data.datasets[0].weather.map((iconName, idx) => {
          if (idx % 2 === 0) {
            const xPos = chart.getDatasetMeta(0).data[idx].x;
            const icon = WEATHER_ICON_SET[iconName]
              ? WEATHER_ICON_SET[iconName]
              : WEATHER_ICON_SET['na'];
            var image = new Image();
            image.onload = function () {
              ctx.drawImage(image, xPos - 10, top - 25, 20, 20);
            };
            image.src =
              'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icon);
          }
        });
      },
    };
  }

  __getChartType() {
    return SENSORS_MAP[this._chartDataKind].chartDataKind;
  }

  __getChartDatasets() {
    let datasets = [
      {
        data: [],
        weather: [],
        fill: this.__getChartDataFill(),
        backgroundColor: this.__getChartBackgroundColor(),
        borderColor: this.__getChartBorderColor(),
        tension: 0.1,
        type: this.__getChartType(),
      },
    ];
    if (datasets[0].type == 'bar') {
      datasets[0].borderWidth = 2;
      datasets[0].borderRadius = 5;
    }
    this._weather.hourly_forecast
      .slice(0, this._config.weather_hourly_forecast_limit)
      .map((hourly) => {
        datasets[0].data.push({
          x: hourly.hours,
          y: hourly.getKindValue(this._chartDataKind),
        });
        datasets[0].weather.push(hourly.getIconName(this._sun));
      });
    return {datasets};
  }

  __getChartDataFill() {
    return SENSORS_MAP[this._chartDataKind].chartDatafill;
  }

  __getChartBackgroundColor() {
    return CHART_BG_COLOR;
  }

  __getChartBorderColor() {
    return CHART_BORDER_COLOR;
  }

  __toggleDropdown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.shadowRoot.querySelector('.dropdown-content').classList.toggle('show');
  }

  __selectChartDataKind(e, key) {
    this._chartDataKind = key;
    this._chart.data = this.__getChartDatasets();
    this._chart.options.scales =
      SENSORS_MAP[this._chartDataKind].chartOptionsScales;
    this._chart.update();
    this.__toggleDropdown(e);
    this.requestUpdate();
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }
  static getStubConfig() {
    return {
      sun_entity: 'sun.sun',
      weather_entity: null,
      weather_hourly_forecast_limit: 24,
      weather_daily_forecast_limit: 10,
    };
  }
}

window.customElements.get(PACKAGE) ||
  window.customElements.define(PACKAGE, SciFiWeather);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiWeatherEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi weather card',
  description: 'Render sci-fi weather card.',
});
