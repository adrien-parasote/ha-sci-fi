import {msg} from '@lit/localize';
import {html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import {VacuumEntity} from '../../helpers/entities/vacuum/vacuum.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {PACKAGE} from './const.js';
import style from './style.js';

export class SciFiVacuum extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;

  static get properties() {
    return {
      _config: {type: Object},
      _vacuums: {type: Array},
      _vacuum_selected_id: {type: Number},
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

    // Get vacuums entities
    const vacuum_entities = this._config.vacuums.map(
      (conf) => new VacuumEntity(hass, conf)
    );

    if (!this._vacuum_selected_id) this._vacuum_selected_id = 0;
    if (
      !this._vacuums ||
      !vacuum_entities
        .map((v, id) => {
          return isEqual(
            v.renderAsEntity(),
            this._vacuums[id].renderAsEntity()
          );
        })
        .every((v) => v === true)
    )
      this._vacuums = vacuum_entities;
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="container">
        ${this.__renderHeader()}${this.__renderSubHeader()}
        ${this.__renderInfo()} ${this.__renderMap()} ${this.__renderActions()}
        ${this.__renderDevices()}
      </div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __renderHeader() {
    const vacuum = this._vacuums[this._vacuum_selected_id];
    return html`<div class="header">
      <div class="name">${vacuum.name}</div>
      <div class="infoH">
        <sci-fi-icon icon="mdi:fan"></sci-fi-icon>
        <div>${vacuum.fan_speed}</div>

        <div class="spacer"></div>
        ${vacuum.mop_intensite ? this.__renderMopIntensite() : nothing}
        <div class="spacer"></div>
        ${vacuum.battery ? this.__renderBattery() : nothing}
      </div>
    </div>`;
  }

  __renderMopIntensite() {
    const vacuum = this._vacuums[this._vacuum_selected_id];
    return html`<sci-fi-icon
        icon="${vacuum.mop_intensite.icon
          ? vacuum.mop_intensite.icon
          : 'mdi:water-opacity'}"
      ></sci-fi-icon>
      <div>${vacuum.mop_intensite.value}</div>`;
  }

  __renderBattery() {
    const vacuum = this._vacuums[this._vacuum_selected_id];
    return html`<sci-fi-icon icon="${vacuum.battery.icon}"></sci-fi-icon>
      <div>${vacuum.battery.value}${vacuum.battery.unit_of_measurement}</div>`;
  }

  __renderSubHeader() {
    const vacuum = this._vacuums[this._vacuum_selected_id];
    return html` <div class="sub-header">
      <sci-fi-icon icon="${vacuum.icon}" class="${vacuum.activity}">
      </sci-fi-icon>
    </div>`;
  }

  __renderDevices() {
    if (this._vacuums.length == 1) return nothing;
    return html`<div class="devices">
      <sci-fi-button
        icon="mdi:chevron-left"
        @button-click=${this._next}
      ></sci-fi-button>
      <div class="number">
        ${this._vacuums.map((e, id) => {
          return html`<div
            class="${id == this._vacuum_selected_id ? 'active' : ''}"
          ></div>`;
        })}
      </div>
      <sci-fi-button
        icon="mdi:chevron-right"
        @button-click=${this._next}
      ></sci-fi-button>
    </div>`;
  }

  _next(e) {
    if (e.detail.element.icon == 'mdi:chevron-left') {
      this._vacuum_selected_id == 0
        ? (this._vacuum_selected_id = this._vacuums.length - 1)
        : (this._vacuum_selected_id -= 1);
    } else {
      this._vacuum_selected_id == this._vacuums.length - 1
        ? (this._vacuum_selected_id = 0)
        : (this._vacuum_selected_id += 1);
    }
  }

  __renderMap() {
    const vacuum = this._vacuums[this._vacuum_selected_id];
    if (!vacuum.map)
      return html`<div class="map">
        <div class="map-content">${msg('No map defined')}</div>
      </div>`;
    return html`<div class="map">
      <img
        class="image"
        src="${location.protocol +
        '//' +
        location.host +
        vacuum.map.attributes.entity_picture}"
      />
    </div>`;
  }

  __renderInfo() {
    const sensors = this._vacuums[this._vacuum_selected_id].sensors;
    if (sensors.length == 0) return nothing;
    return html`<div class="info">
      ${sensors.map((s) => {
        return html`<div class="sensor">
          <div class="data">
            <sci-fi-icon icon="${s.icon}"> </sci-fi-icon>
            <div class="value">${s.value ? s.value.toFixed(2) : ''}</div>
            <div class="unit">${s.unit_of_measurement}</div>
          </div>
          <div class="name">${s.friendly_name}</div>
        </div>`;
      })}
    </div>`;
  }

  __renderActions() {
    return html`<div class="actions">
      <div class="default">${this.__renderAction()}</div>
      <div class="shortcuts">${this.__renderShortcuts()}</div>
    </div>`;
  }

  __renderAction() {
    const actions = this._vacuums[this._vacuum_selected_id].actions;
    if (actions.length == 0) return nothing;
    return actions.map((a) => {
      return html`
        <sci-fi-button
          icon="${a.icon}"
          @button-click="${(e) => this._runAction(a.key, false)}"
        ></sci-fi-button>
      `;
    });
  }

  __renderShortcuts() {
    const shortcuts = this._vacuums[this._vacuum_selected_id].shortcuts;
    if (shortcuts.length == 0) return nothing;
    return shortcuts.map((s, id) => {
      return html`
        <sci-fi-button
          icon="${s.icon}"
          @button-click="${(e) => this._runAction(id, true)}"
        ></sci-fi-button>
      `;
    });
  }

  _runAction(id, is_shortcut) {
    this._vacuums[this._vacuum_selected_id].callService(id, is_shortcut).then(
      () => this.__toast(false),
      (e) => this.__toast(true, e)
    );
  }

  __toast(error, e) {
    const txt = error ? e.message : msg('done');
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
