import {html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import {ENTITY_KIND_CLIMATE} from '../../helpers/entities/climate/climate_const.js';
import {House} from '../../helpers/entities/house.js';
import {Season} from '../../helpers/entities/sensor/sensor.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {PACKAGE} from './const.js';
import style from './style.js';

export class SciFiClimates extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _hass; // private
  _season;
  _temp_unit;

  static get properties() {
    return {
      _config: {type: Object},
      _house: {type: Object},
      _active_floor_id: {type: String}, // selected floor pointer
      _active_area_id: {type: String}, // selected area pointer
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

    if (!this._temp_unit) this._temp_unit = hass.config.unit_system.temperature; // Gather HA temperature unit only once
    if (!this._season && hass.states['sensor.season'])
      this._season = new Season('sensor.season', hass);
    // Build house
    const house = new House(hass);
    if (!this._house || !isEqual(house, this._house)) this._house = house;
  }

  render() {
    if (!this._hass || !this._config) return nothing;

    // Setup first time attribute
    if (!this._active_floor_id)
      this._active_floor_id = this._house.getDefaultFloor(
        ENTITY_KIND_CLIMATE,
        this._config.entities_to_exclude
      ).id;
    if (!this._active_area_id)
      this._active_area_id = this._house.getDefaultArea(
        this._active_floor_id,
        ENTITY_KIND_CLIMATE,
        this._config.entities_to_exclude
      ).id;
    return html`
      <div class="container">
        <div class="header">${this.__displayHeader()}</div>
        <div class="floors">${this.__displayFloors()}</div>
        <div class="floor-content">${this.__displayFloorInfo()}</div>
        <div class="areas">
          <div class="area-list">${this.__displayAreas()}</div>
          ${this.__displayAreaInfo()}
        </div>
      </div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __displayHeader() {
    return html`
      <div class="info">
        <sci-fi-icon icon="mdi:home-thermometer-outline"></sci-fi-icon>
        <div class="text">
          ${this._house.getTemperature(this._config.entities_to_exclude)}${this
            ._temp_unit}
        </div>
      </div>
      <div class="actions">${this.__displayActionHeader()}</div>
      <div class="season ${this._season ? this._season.color : ''}">
        ${this._season ? this._season.state_icon : nothing}
      </div>
    `;
  }

  __displayActionHeader() {
    if (!this._config.header.display) return nothing;
    const active = this._house.isActive(
      ENTITY_KIND_CLIMATE,
      this._config.entities_to_exclude
    );
    const icon = active
      ? this._config.header.icon_summer_state
      : this._config.header.icon_winter_state;
    return html`<div class="action" @click="${this.__globalOnOffClimates}">
      <sci-fi-icon icon=${icon}></sci-fi-icon>
      <div>
        ${active
          ? this._config.header.message_summer_state
          : this._config.header.message_winter_state}
      </div>
    </div>`;
  }

  __displayFloors() {
    const cells = this._house
      .getFloorsOrderedByLevel()
      .filter((floor) =>
        floor.hasEntityKind(
          ENTITY_KIND_CLIMATE,
          this._config.entities_to_exclude
        )
      )
      .map((floor) => {
        return {
          id: floor.id,
          state: this._active_floor_id == floor.id ? 'on' : 'off',
          selected: this._active_floor_id == floor.id,
          active: floor.isActive(
            ENTITY_KIND_CLIMATE,
            this._config.entities_to_exclude
          )
            ? 'on'
            : 'off',
          icon: floor.icon,
        };
      });
    return html`<sci-fi-hexa-row
      .cells=${cells}
      @cell-selected="${this.__onFloorSelect}"
    ></sci-fi-hexa-row>`;
  }

  __displayFloorInfo() {
    const floor = this._house.getFloor(this._active_floor_id);
    const temperature = floor.getTemperature(this._config.entities_to_exclude);
    const icon = temperature ? 'mdi:thermometer' : 'mdi:thermometer-off';
    const label = temperature ? temperature + this._temp_unit : 'Off';
    return html`
      <div class="title ${!temperature ? 'off' : 'on'}">${floor.name} -</div>
      <div class="temperature ${!temperature ? 'off' : 'on'}">
        <sci-fi-icon icon=${icon}></sci-fi-icon>
        <div>${label}</div>
      </div>
    `;
  }

  __onFloorSelect(e) {
    e.preventDefault();
    e.stopPropagation();
    const cell_floor = e.detail.cell;
    // Update selected floor
    this._active_floor_id = cell_floor.id;
    // Select first area to render
    const floor = this._house.getFloor(cell_floor.id);
    this._active_area_id = floor.getFirstArea(
      ENTITY_KIND_CLIMATE,
      this._config.entities_to_exclude
    ).id;
  }

  __displayAreas() {
    const cells = this._house
      .getFloor(this._active_floor_id)
      .getAreas()
      .filter((area) =>
        area.hasEntityKind(
          ENTITY_KIND_CLIMATE,
          this._config.entities_to_exclude
        )
      )
      .map((area) => {
        return {
          id: area.id,
          state: this._active_area_id == area.id ? 'on' : 'off',
          selected: this._active_area_id == area.id,
          active: area.isActive(
            ENTITY_KIND_CLIMATE,
            this._config.entities_to_exclude
          )
            ? 'on'
            : 'off',
          icon: area.icon,
        };
      });
    return html`<sci-fi-hexa-row
      .cells=${cells}
      @cell-selected="${this.__onAreaSelect}"
    ></sci-fi-hexa-row>`;
  }

  __onAreaSelect(e) {
    e.preventDefault();
    e.stopPropagation();
    const cell_area = e.detail.cell;
    this._active_area_id = cell_area.id;
  }

  __displayAreaInfo() {
    const area = this._house.getArea(
      this._active_floor_id,
      this._active_area_id
    );
    const active = area.isActive(
      ENTITY_KIND_CLIMATE,
      this._config.entities_to_exclude
    );
    const climates = area.getEntitiesByKind(
      ENTITY_KIND_CLIMATE,
      this._config.entities_to_exclude
    );
    return html`
      <div class="area-content ${active ? 'on' : 'off'}">
        <div class="climates">
          <div class="title">${area.name}</div>
          <div class="slider">
            <div class="number">${this.__displaySliderBubbles(climates)}</div>
            <div class="slides">${this.__displayAreaClimates(climates)}</div>
          </div>
        </div>
      </div>
    `;
  }

  __displaySliderBubbles(climates) {
    return climates.map(() => html`<div></div>`);
  }

  __displayAreaClimates(climates) {
    const styles = {
      state: {
        icons: this._config.state_icons,
        colors: this._config.state_colors,
      },
      mode: {
        icons: this._config.mode_icons,
        colors: this._config.mode_colors,
      },
    };
    return climates.map(
      (climate) =>
        html`<div class="climate">
          <sci-fi-radiator
            id="${climate.entity_id}"
            .climateEntity="${climate.renderAsEntity()}"
            .unit="${this._temp_unit}"
            .styles="${styles}"
            @change-preset-mode="${this._changePresetMode}"
            @change-hvac-mode="${this._changeHvacMode}"
            @change-temperature="${this._changeTemperature}"
          ></sci-fi-radiator>
        </div>`
    );
  }

  _changeTemperature(e) {
    const climate = this._house
      .getEntitiesByKind(ENTITY_KIND_CLIMATE, this._config.entities_to_exclude)
      .filter((climate) => climate.entity_id == e.detail.id)[0];
    climate.setTemperature(this._hass, e.detail.temperature).then(
      () => this.__toast(false),
      (e) => this.__toast(true, e)
    );
  }

  _changeHvacMode(e) {
    const climate = this._house
      .getEntitiesByKind(ENTITY_KIND_CLIMATE, this._config.entities_to_exclude)
      .filter((climate) => climate.entity_id == e.detail.id)[0];
    climate.setHvacMode(this._hass, e.detail.mode).then(
      () => this.__toast(false),
      (e) => this.__toast(true, e)
    );
  }

  _changePresetMode(e) {
    const climate = this._house
      .getEntitiesByKind(ENTITY_KIND_CLIMATE, this._config.entities_to_exclude)
      .filter((climate) => climate.entity_id == e.detail.id)[0];
    climate.setPresetMode(this._hass, e.detail.mode).then(
      () => this.__toast(false),
      (e) => this.__toast(true, e)
    );
  }

  __globalOnOffClimates(e) {
    this._house
      .turnOnOffClimate(this._hass, this._config.entities_to_exclude)
      .then(
        () => this.__toast(false),
        (e) => this.__toast(true, e)
      );
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
