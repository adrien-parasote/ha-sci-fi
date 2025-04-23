import {msg} from '@lit/localize';
import {html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import {Plug} from '../../helpers/entities/plug.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {PACKAGE} from './const.js';
import style from './style.js';

export class SciFiPlugs extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _hass; // private

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
    console.log(plug);
    return html`<div class="content">
      <div class="power">Power</div>
      <div class="image">IMAGE</div>
      <div>Child lock</div>
      <div>Power outage memory</div>
      <div>Others</div>
    </div>`;
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
