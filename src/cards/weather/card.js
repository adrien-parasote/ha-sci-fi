import {msg} from '@lit/localize';
import Chart from 'chart.js/auto';
import {html, nothing, svg} from 'lit';
import {isEqual} from 'lodash-es';

import WEATHER_ICON_SET from '../../components/icons/data/sf-weather-icons.js';
import {Person} from '../../helpers/entities/person.js';
import {
  DailyForecast,
  HourlyForecast,
  SunEntity,
  WeatherEntity,
} from '../../helpers/entities/weather.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import {templateToString} from '../../helpers/utils/utils.js';
import configMetadata from './config-metadata.js';
import {
  CHART_BG_COLOR,
  CHART_BORDER_COLOR,
  PACKAGE,
  SENSORS_MAP,
} from './const.js';
import style from './style.js';

export class SciFiWeather extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _chart;
  _chartDataKind;
  _daily_subscribed;
  _hourly_subscribed;
  _day_selected = 0;
  _user;

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

  setConfig(config) {
    super.setConfig(config);
    this._chartDataKind = this._config.chart_first_kind_to_render;
  }

  set hass(hass) {
    super.hass = hass;
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
    if (!this._user) this._user = new Person(hass); // Only once
  }

  __getDaysForecasts(hass) {
    const unsub = hass.connection.subscribeMessage(
      (event) => {
        this._weather_daily_forecast = event.forecast.map(
          (value) =>
            new DailyForecast(value, this._weather.getUnit('temperature'))
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
          (value) =>
            new HourlyForecast(value, this._weather.getUnit('temperature'))
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

  __getlabels(key) {
    const labels = {
      clear: msg('Clear sky'),
      'clear-night': msg('Clear night'),
      cloudy: msg('Cloudy'),
      exceptional: msg('Exceptional'),
      fog: msg('Fog'),
      hail: msg('Risk of hail'),
      lightning: msg('Thunderstorms'),
      'lightning-rainy': msg('Lightning rainy'),
      partlycloudy: msg('Sunshine'),
      pouring: msg('Heavy rain'),
      rainy: msg('Rain'),
      snowy: msg('Snow'),
      'snowy-rainy': msg('Freezing rain'),
      sunny: msg('Sunny'),
      windy: msg('Windy'),
      'windy-variant': msg('Variable winds'),

      temp: msg('Temperature'),
      forecasted_temp: msg('Forecasted temperatures'),
      precipitation: msg('Precipitation'),
      forecasted_precipitation: msg('Forecasted precipitation'),
      wind_speed: msg('Wind speeds'),
      forecasted_wind_speed: msg('Forecasted wind speeds'),
    };
    return key in labels ? labels[key] : key;
  }

  __renderHeader() {
    return html`
      <div class="weather-icon">
        ${this._weather.getWeatherIcon(this._sun.isDay())}
      </div>
      <div class="weather-clock">
        <div class="state">
          ${this.__getlabels(this._weather.state)},
          ${this._weather.temperatureUnit}
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
            <sci-fi-icon icon="mdi:alert"></sci-fi-icon>
            <div>${key}</div>
          </div>`
      )}`;
  }

  __getHour() {
    const options = {
      timeStyle: 'short',
    };
    return new Intl.DateTimeFormat(this._user.date_format, options).format(
      this._date
    );
  }

  __getDate() {
    const options = {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat(this._user.date_format, options).format(
      this._date
    );
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
            ${daily_forecast.render(this._user)}
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
        <sci-fi-weather-icon
          icon="${SENSORS_MAP[this._chartDataKind].dropdown.icon}"
        ></sci-fi-weather-icon>
        <sci-fi-icon icon="mdi:chevron-down"></sci-fi-icon>
      </button>
      <div class="dropdown-content">
        ${Object.keys(SENSORS_MAP).map(
          (key) =>
            html` <div
              @click=${(e) => this.__selectChartDataKind(e, key)}
              class="dropdown-item"
            >
              <sci-fi-weather-icon
                icon="${SENSORS_MAP[key].dropdown.icon}"
              ></sci-fi-weather-icon>
              <div class="dropdown-item-label">
                ${this.__getlabels(SENSORS_MAP[key].dropdown.label)}
              </div>
            </div>`
        )}
      </div>
    </div>`;
  }

  __getChartTitle() {
    return html`
      <div class="title">
        <sci-fi-weather-icon
          icon="${SENSORS_MAP[this._chartDataKind].chartTitle.icon}"
        ></sci-fi-weather-icon>
        <div class="label">
          ${this.__getlabels(SENSORS_MAP[this._chartDataKind].chartTitle.label)}
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
      <div class="state">
        <sci-fi-weather-icon icon="${icon}"></sci-fi-weather-icon>
      </div>
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
        const dataLength = data.datasets[0].weather.length;
        data.datasets[0].weather.map((iconName, idx) => {
          if (dataLength < 10 || (dataLength >= 10 && idx % 2 === 0)) {
            const xPos = chart.getDatasetMeta(0).data[idx].x;
            const icon = WEATHER_ICON_SET[iconName]
              ? WEATHER_ICON_SET[iconName]
              : WEATHER_ICON_SET['na'];
            var image = new Image();
            image.onload = function () {
              ctx.drawImage(image, xPos - 10, top - 25, 20, 20);
            };
            image.src =
              'data:image/svg+xml;charset=utf-8,' +
              encodeURIComponent(templateToString(html`${icon}`));
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
          x: hourly.getHours(this._user),
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
    return buildStubConfig(configMetadata);
  }
}
