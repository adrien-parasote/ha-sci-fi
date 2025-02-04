import Chart from 'chart.js/auto';
import {LitElement, html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import common_style from '../../helpers/common_style.js';
import '../../helpers/components/tiles.js';
import {
  DailyForecast,
  HourlyForecast,
  SunEntity,
  WeatherEntity,
} from '../../helpers/entities/weather.js';
import {WEEK_DAYS} from '../../helpers/entities/weather_const.js';
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
  _chartDataKind;
  _daily_subscribed;
  _hourly_subscribed;
  _day_selected = 0;

  static get properties() {
    return {
      _config: {type: Object},
      _sun: {type: Object},
      _weather: {type: Object},
      _weather_daily_forecast: {type: Array},
      _weather_hourly_forecast: {type: Array},
      _date: {type: Object},
      _alert: {type: Object},
    };
  }

  constructor() {
    super();
    // Default
    this._date = new Date();
    // Auto update date
    setInterval(() => {
      this._date = new Date();
    }, 10000);
  }

  __validateConfig(config) {
    if (!config.weather_entity)
      throw new Error('You need to define a weather entity');
    if (!config.weather_entity.startsWith('weather.'))
      throw new Error(config.weather_entity + 'is not a weather entity.');
    if (!config.weather_daily_forecast_limit)
      config.weather_daily_forecast_limit = 10; // max 15
    if (config.weather_daily_forecast_limit > 15)
      throw new Error('Daily forecast is limited to 15 days max');
    if (!config.chart_first_kind_to_render)
      config.chart_first_kind_to_render = 'temperature';
    if (!Object.keys(SENSORS_MAP).includes(config.chart_first_kind_to_render))
      throw new Error(
        'Chart first kind to render must be "temperature", "precipitation" or "wind_speed"'
      );
    return config;
  }

  setConfig(config) {
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
    this._chartDataKind = this._config.chart_first_kind_to_render;

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

    // Get Weather and sun entity once (no need to track change)
    if (!this._sun) this._sun = new SunEntity(hass, 'sun.sun');
    if (!this._weather)
      this._weather = new WeatherEntity(hass, this._config.weather_entity);

    // Get forecast once (no need to track change)
    if (!this._weather_daily_forecast) this.__getDaysForecasts(hass);
    if (!this._weather_hourly_forecast) this.__getHoursForecasts(hass);

    if (this._config.alert) {
      const alert = hass.states[this._config.alert.entity_id];
      if (alert) {
        if (!this._alert && !isEqual(alert, this.alert)) this._alert = alert;
      }
    }
  }

  __getDaysForecasts(hass) {
    const unsub = hass.connection.subscribeMessage(
      (event) => {
        this._weather_daily_forecast = event.forecast.map(
          (value) => new DailyForecast(value, this.temperature_unit)
        );
        unsub.then((unsub) => unsub());
      },
      {
        type: 'weather/subscribe_forecast',
        forecast_type: 'daily',
        entity_id: this._config.weather_entity,
      }
    );
  }

  __getHoursForecasts(hass) {
    const unsub = hass.connection.subscribeMessage(
      (event) => {
        this._weather_hourly_forecast = event.forecast.map(
          (value) => new HourlyForecast(value, this.temperature_unit)
        );
        unsub.then((unsub) => unsub());
        // draw chart
        this.__drawChart();
      },
      {
        type: 'weather/subscribe_forecast',
        forecast_type: 'hourly',
        entity_id: this._config.weather_entity,
      }
    );
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="container">
        <div class="header">${this.__renderHeader()}</div>
        <div class="alerts">${this.__renderAlerts()}</div>
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

  __renderAlerts() {
    if (!this._alert || this._alert.state == this._config.alert.state_green)
      return nothing;
    let alert_states = {};
    alert_states[this._config.alert.state_yellow] = 'yellow';
    alert_states[this._config.alert.state_orange] = 'orange';
    alert_states[this._config.alert.state_red] = 'red';

    return html` ${Object.keys(this._alert.attributes)
      .filter((x) =>
        Object.keys(alert_states).includes(this._alert.attributes[x])
      )
      .map(
        (key) =>
          html`<div class="alert ${alert_states[this._alert.attributes[key]]}">
            ${getIcon('mdi:alert')}
            <div>${key}</div>
          </div>`
      )}`;
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
    if (!this._weather_daily_forecast) return nothing;
    return html` <div class="content">
      ${this._weather_daily_forecast
        .slice(0, this._config.weather_daily_forecast_limit)
        .map((daily_forecast, idx) => {
          return html` <div
            class="weather ${this._day_selected == idx ? 'selected' : ''}"
            @click="${(e) => this.__selectDay(idx)}"
          >
            ${daily_forecast.render(true)}
          </div>`;
        })}
    </div>`;
  }

  __selectDay(idx) {
    if (idx != this._day_selected) {
      this._day_selected = idx;
      this._chart.data = this.__getChartDatasets();
      this._chart.update();
      this.requestUpdate();
    }
  }

  __renderChart() {
    return html`
      <div class="chart-header">
        ${this.__getChartTitle()} ${this.__getDropdownMenu()}
      </div>
    `;
  }

  __getDropdownMenu() {
    return html` <div class="dropdown">
      <button @click=${this.__toggleDropdown} class="dropdow-button">
        ${getWeatherIcon(SENSORS_MAP[this._chartDataKind].dropdown.icon)}
        ${getIcon('mdi:chevron-down')}
      </button>
      <div class="dropdown-content">
        ${Object.keys(SENSORS_MAP).map(
          (key) =>
            html` <div
              @click=${(e) => this.__selectChartDataKind(e, key)}
              class="dropdown-item"
            >
              ${getWeatherIcon(SENSORS_MAP[key].dropdown.icon)}
              <div class="dropdown-item-label">
                ${SENSORS_MAP[key].dropdown.label}
              </div>
            </div>`
        )}
      </div>
    </div>`;
  }

  __getChartTitle() {
    return html`
      <div class="title">
        ${getWeatherIcon(SENSORS_MAP[this._chartDataKind].chartTitle.icon)}
        <div class="label">
          ${SENSORS_MAP[this._chartDataKind].chartTitle.label}
          (${this._weather.getUnit(this._chartDataKind)})
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
    ].map((sensor) =>
      this.__renderTodaySensor(sensor.name, sensor.icon, sensor.value)
    );
    return html`${sensors}`;
  }

  __renderTodaySensor(name, icon, value) {
    return html`<div class="sensor">
      <div class="label">${name}</div>
      <div class="state">${getWeatherIcon(icon)}</div>
      <div class="label">${value}</div>
    </div>`;
  }

  __drawChart() {
    if (!this._chart) {
      let ctx = this.shadowRoot
        .querySelector('.chart-container')
        .appendChild(document.createElement('canvas'));
      ctx = ctx.getContext('2d');
      this._chart = new Chart(ctx, {
        data: this.__getChartDatasets(),
        options: {
          scales: SENSORS_MAP[this._chartDataKind].chartOptionsScales,
          plugins: {
            title: {
              display: true,
              text: '',
              padding: 15,
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
    const datasets = [
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
    const forecastDate = this._weather_daily_forecast[this._day_selected].date;
    this._weather_hourly_forecast
      .filter((hour) => hour.isPartOfDay(forecastDate))
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
      weather_entity: null,
      weather_daily_forecast_limit: 10,
      chart_first_kind_to_render: 'temperature',
      alert: {},
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
