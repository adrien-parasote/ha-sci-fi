import {msg} from '@lit/localize';
import Chart from 'chart.js/auto';
import {html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import {Person} from '../../helpers/entities/person.js';
import {Plug} from '../../helpers/entities/plug.js';
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
          device.power_sensor,
          device.other_sensors
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
    this.__loadPowerChart(plug);
    return html`<div class="content">
      <div class="info">
        <div class="image">IMAGE</div>
        <div>Child lock</div>
        <div>Power outage memory</div>
        <div>Others</div>
      </div>
      <div class="chart-container"></div>
    </div>`;
  }

  __loadPowerChart(plug) {
    // Request
    plug.getPowerHistory().then((data) => {
      const history = this.__parseHistory(data[0]);
      const datasets = this.__buildChartDatasets(Object.values(history));
      const labels = this.__buildChartLabel(Object.keys(history));
      if (!this._chart) {
        this.__drawChart(datasets, labels);
      } else {
        this.__updateChart(datasets, labels);
      }
    });
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
      const value = isNaN(parseInt(el.state)) ? 0 : parseInt(el.state);
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
          tooltip: {enabled: false},
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
    //this.requestUpdate();
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
          (d, i) =>
            html`<div
              class="${i == this._selected_plug_id ? 'active' : ''}"
            ></div>`
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

  __toast(error, e) {
    const msg = error ? e.message : 'done';
    this.shadowRoot.querySelector('sci-fi-toast').addMessage(msg, error);
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return buildStubConfig(configMetadata);
  }
}
