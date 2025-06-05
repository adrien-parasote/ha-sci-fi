import {msg} from '@lit/localize';
import Chart from 'chart.js/auto';
import {html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import {Person} from '../../helpers/entities/person.js';
import {Plug} from '../../helpers/entities/plug/plug.js';
import {
  LockSensor,
  SelectSensor,
} from '../../helpers/entities/sensor/sensor.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {CHART_BG_COLOR, CHART_BORDER_COLOR, PACKAGE} from './const.js';
import style from './style.js';

export class SciFiPlugs extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _hass; // private
  _chart;
  _user;

  static get properties() {
    return {
      _config: {type: Object},
      _plugs: {type: Array},
      _selected_plug_id: {type: Number},
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set
    const plugs = this._config.devices.map(
      (device) =>
        new Plug(
          this._hass,
          device.device_id,
          device.entity_id,
          device.name,
          device.active_icon,
          device.inactive_icon,
          Object.keys(device.sensors)
            .filter((id) => device.sensors[id].show || device.sensors[id].power)
            .map((id) => Object.assign({}, {id: id}, device.sensors[id]))
        )
    );
    if (!this._plugs || !isEqual(plugs, this._plugs)) {
      this._plugs = plugs;
      if (!this._selected_plug_id) this._selected_plug_id = 0;
    }
    if (!this._user) this._user = new Person(hass); // Only once
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    const plug = this._plugs[this._selected_plug_id];
    return html`
      <div class="container">
        ${this.__displayHeader(plug)} ${this.__displayPlug(plug)}
        ${this.__displayFooter()}
      </div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __displayHeader(plug) {
    const area = plug.area;
    return html`<div class="header">
      <sci-fi-icon
        icon=${area ? area.icon : 'mdi:help'}
        class="${plug.state}"
      ></sci-fi-icon>
      <div class="info">
        <div class="title" class="${plug.state}">${plug.name}</div>
        <div class="sub-title">
          ${plug.model} ${msg('by')} ${plug.manufacturer}
        </div>
      </div>
    </div>`;
  }

  __displayPlug(plug) {
    // In case of no power sensor supply
    if (plug.power != null) this.__loadPowerChart(plug);
    return html`<div class="content">
      <div class="info">
        ${this.__displayImage(plug)} ${this.__displaySensors(plug)}
      </div>
      <div class="msg-container"></div>
      <div class="chart-container"></div>
    </div>`;
  }

  __displayImage(plug) {
    return html`<div class="image" @click="${(e) => this._turnOnOff(plug)}">
      <div class="cirle-container">
        <div class="circle"></div>
      </div>
      <div class="icon-container">
        <div class="icon">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
        </div>
        <sci-fi-icon
          icon="${plug.icon}"
          class="${plug.active ? 'on' : 'off'}"
        ></sci-fi-icon>
      </div>
      <div class="cirle-container ${plug.active ? 'on' : 'off'}">
        <div class="circle"></div>
      </div>
    </div>`;
  }

  __displaySensors(plug) {
    return html`<div class="sensors">
      ${plug.sensors
        .sort((s1, s2) => {
          if (s1.id < s2.id) return -1;
          if (s1.id > s2.id) return 1;
          return 0;
        })
        .map((s) => {
          return html`<div class="sensor">${this.__displaySensor(s)}</div>`;
        })}
    </div>`;
  }

  __displaySensor(sensor) {
    if (sensor instanceof LockSensor) return this.__displayLockBtn(sensor);
    if (sensor instanceof SelectSensor) return this.__displaySelectBtn(sensor);
    return html`
      <sci-fi-icon icon="${sensor.icon}"></sci-fi-icon>
      <div class="name">${sensor.friendly_name}</div>
      <div class="value">${sensor.value} ${sensor.unit_of_measurement}</div>
    `;
  }

  __displayLockBtn(sensor) {
    return html` <sci-fi-icon icon="${sensor.icon}"></sci-fi-icon>
      <div class="name">${sensor.friendly_name}</div>
      <div class="value">
        <sci-fi-button-card
          no-title
          text=${sensor.value.toUpperCase()}
          @button-click="${(e) => this._turnOnOffChildLock(sensor)}"
        ></sci-fi-button-card>
      </div>`;
  }

  __displaySelectBtn(sensor) {
    return html` <sci-fi-dropdown-input
      icon="${sensor.icon}"
      label="${sensor.friendly_name}"
      value=${sensor.value}
      no-close-box
      disabled-filter
      .items="${sensor.options}"
      @input-update=${(e) => this._updateSelectState(e, sensor)}
    ></sci-fi-dropdown-input>`;
  }

  _updateSelectState(e, sensor) {
    sensor.callService(this._hass, e.detail.value).then(
      () => this.__toast(false, msg('done')),
      (e) => this.__toast(true, e)
    );
  }

  _turnOnOffChildLock(sensor) {
    sensor.callService(this._hass).then(
      () => this.__toast(false, msg('done')),
      (e) => this.__toast(true, e)
    );
  }

  __loadPowerChart(plug) {
    // Request
    plug.getPowerHistory().then(
      (data) => {
        const history = this.__parseHistory(data[0]);
        if (
          Object.keys(history).length == 1 &&
          Object.values(history)[0] == 0
        ) {
          this.shadowRoot.querySelector('.msg-container').textContent = msg(
            'No power data to display'
          );
          this.shadowRoot.querySelector('.chart-container').style.display =
            'none';
        } else {
          this.shadowRoot.querySelector('.msg-container').textContent = '';
          this.shadowRoot.querySelector('.chart-container').style.display =
            'block';
        }
        const datasets = this.__buildChartDatasets(Object.values(history));
        const labels = this.__buildChartLabel(Object.keys(history));
        if (!this._chart) {
          this.__drawChart(datasets, labels);
        } else {
          this.__updateChart(datasets, labels);
        }
      },
      (e) => this.__toast(true, e)
    );
  }

  __parseHistory(data) {
    const res = {};
    data.forEach((el, idx) => {
      if (idx == 0) return; // don't take into account first element
      // Groupe date per minutes
      const d = new Date(el.last_changed);
      d.setMinutes(Math.round(d.getMinutes()));
      d.setSeconds(0);
      d.setMilliseconds(0);
      // Get value
      const value = isNaN(parseFloat(el.state))
        ? 0.0
        : parseFloat(parseFloat(el.state).toFixed(2));
      // Select max
      if (!(d in res)) {
        res[d] = value;
      } else {
        if (value > res[d]) res[d] = value;
      }
    });
    return res;
  }

  __buildChartDatasets(data) {
    return [
      {
        data: data,
        fill: true,
        backgroundColor: CHART_BG_COLOR,
        borderColor: CHART_BORDER_COLOR,
        tension: 0.1,
        borderWidth: 2,
        borderRadius: 5,
      },
    ];
  }

  __buildChartLabel(data) {
    return data.map((l) => {
      const d = new Date(l);
      if (d.getHours() == 0 && d.getMinutes() == 0) return this.__getDay(d);
      return this.__getHour(d);
    });
  }

  __getDay(d) {
    const options = {
      day: '2-digit',
      month: 'short',
    };
    return new Intl.DateTimeFormat(this._user.date_format, options).format(d);
  }

  __getHour(d) {
    const options = {
      timeStyle: 'short',
    };
    return new Intl.DateTimeFormat(this._user.date_format, options).format(d);
  }

  __drawChart(datasets, labels) {
    let ctx = this.shadowRoot
      .querySelector('.chart-container')
      .appendChild(document.createElement('canvas'));
    ctx = ctx.getContext('2d');
    this._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        animation: {
          delay: (context) => {
            let delay = 0;
            if (context.type === 'data' && context.mode === 'default') {
              delay = context.dataIndex * 10 + context.datasetIndex * 10;
            }
            return delay;
          },
        },
        scales: {
          y: {
            display: false,
            suggestedMin: 0,
            suggestedMax: null,
          },
          x: {
            ticks: {
              align: 'start',
              callback: function (val, index, values) {
                return index % 30 === 0 ? this.getLabelForValue(val) : null;
              },
              color: 'rgb(102, 156, 210)',
              font: {
                size: 10,
              },
            },
          },
        },
        plugins: {
          title: {display: false},
          legend: {display: false},
          tooltip: {
            enabled: true,
            callbacks: {
              title: (items) => msg('Power') + ' (' + items[0].label + ')',
              label: (context) =>
                context.raw +
                this._plugs[this._selected_plug_id].power_unit_of_measurement,
            },
          },
        },
      },
    });
  }

  __updateChart(datasets, labels) {
    this._chart.data = {
      labels: labels,
      datasets: datasets,
    };
    this._chart.update();
  }

  __displayFooter() {
    const multiple_plugs = this._plugs.length > 1;
    return html`<div class="footer">
      <div class="${multiple_plugs ? 'show' : 'hide'}">
        <sci-fi-button
          icon="mdi:chevron-left"
          @button-click=${this._next}
        ></sci-fi-button>
      </div>
      <div class="number">
        ${this._plugs.map(
          (p, i) =>
            html` <sci-fi-icon
              icon="${p.icon}"
              class="${i == this._selected_plug_id ? 'active' : ''}"
            ></sci-fi-icon>`
        )}
      </div>
      <div class="${multiple_plugs ? 'show' : 'hide'}">
        <sci-fi-button
          icon="mdi:chevron-right"
          @button-click=${this._next}
        ></sci-fi-button>
      </div>
    </div>`;
  }

  _next(e) {
    if (e.detail.element.icon == 'mdi:chevron-left') {
      this._selected_plug_id == 0
        ? (this._selected_plug_id = this._plugs.length - 1)
        : (this._selected_plug_id -= 1);
    } else {
      this._selected_plug_id == this._plugs.length - 1
        ? (this._selected_plug_id = 0)
        : (this._selected_plug_id += 1);
    }
  }

  _turnOnOff(plug) {
    plug.callService().then(
      () => this.__toast(false),
      (e) => this.__toast(true, e)
    );
  }

  __toast(error, e) {
    const txt = error ? (e.message ? e.message : e) : e;
    this.shadowRoot.querySelector('sci-fi-toast').addMessage(txt, error);
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return buildStubConfig(configMetadata);
  }
}
