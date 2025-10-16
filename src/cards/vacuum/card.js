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
      _vacuum: {type: Object},
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

    // Get vacuum entity
    const vacuum_entity = new VacuumEntity(hass, this._config);

    if (
      !this._vacuum ||
      !isEqual(vacuum_entity.renderAsEntity(), this._vacuum.renderAsEntity())
    )
      this._vacuum = vacuum_entity;
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="container">
        ${this.__renderHeader()}${this.__renderSubHeader()}
        ${this.__renderInfo()} ${this.__renderMap()} ${this.__renderActions()}
      </div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __renderHeader() {
    return html`<div class="header">
      <div class="name">${this._vacuum.friendly_name}</div>
      <div class="infoH">
        <sci-fi-icon icon="mdi:fan"></sci-fi-icon>
        <div>${this._vacuum.fan_speed}</div>
        <div class="spacer"></div>
        <sci-fi-icon icon="${this._vacuum.battery_icon}"></sci-fi-icon>
        <div>${this._vacuum.battery_level}%</div>
      </div>
    </div>`;
  }

  __renderSubHeader() {
    return html` <div class="sub-header">
      <sci-fi-icon icon="${this._vacuum.icon}" class="${this._vacuum.activity}">
      </sci-fi-icon>
    </div>`;
  }

  __renderMap() {
    if (!this._vacuum.camera)
      return html`<div class="map">
        <div class="map-content">No camera defined</div>
      </div>`;
    console.log(this._vacuum.camera);
    return html`<div class="map">
      <img
        class="image"
        src="${location.protocol +
        '//' +
        location.host +
        this._vacuum.camera.attributes.entity_picture}"
      />
    </div>`;
  }

  __renderInfo() {
    const sensors = this._vacuum.sensors;
    if (sensors.length == 0) return nothing;
    return html`<div class="info">
      ${sensors.map((s) => {
        return html`<div class="sensor">
          <div class="data">
            <sci-fi-icon icon="${s.icon}"> </sci-fi-icon>
            <div class="value">${s.value.toFixed(2)}</div>
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
    const actions = this._vacuum.actions;
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
    const shortcuts = this._vacuum.shortcuts;
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
    this._vacuum.callService(id, is_shortcut).then(
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
