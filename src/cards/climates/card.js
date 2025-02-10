import {html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import '../../components/sf-radiator.js';
import '../../components/sf-tiles.js';
import '../../components/sf-toast.js';
import {ENTITY_KIND_CLIMATE} from '../../helpers/entities/climate_const.js';
import {House} from '../../helpers/entities/house.js';
import {Season} from '../../helpers/entities/sensor.js';
import {getIcon} from '../../helpers/icons/icons.js';
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

  static get properties() {
    return {
      _config: {type: Object},
      _house: {type: Object},
      _active_floor_id: {type: String}, // selected floor pointer
      _active_area_id: {type: String}, // selected area pointer
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

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
          ${this.__displayAreas()} ${this.__displayAreaInfo()}
        </div>
      </div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __displayHeader() {
    return html`
      <div class="info">
        ${getIcon('mdi:home-thermometer-outline')}
        <div class="text">
          ${this._house.getTemperature(this._config.entities_to_exclude)}${this
            ._config.unit}
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
      ${getIcon(icon)}
      <div>
        ${active
          ? this._config.header.message_summer_state
          : this._config.header.message_winter_state}
      </div>
    </div>`;
  }

  __displayFloors() {
    return this._house
      .getFloorsOrderedByLevel()
      .filter((floor) =>
        floor.hasEntityKind(
          ENTITY_KIND_CLIMATE,
          this._config.entities_to_exclude
        )
      )
      .map((floor) => {
        const active = floor.getTemperature(this._config.entities_to_exclude)
          ? 'on'
          : 'off';
        return html` <sci-fi-hexa-tile
          active-tile
          state="${this._active_floor_id == floor.id ? 'on' : 'off'}"
          class="${this._active_floor_id == floor.id ? 'selected' : ''}"
          @click="${(e) => this.__onFloorSelect(e, floor)}"
        >
          <div class="item-icon ${active}">${getIcon(floor.icon)}</div>
        </sci-fi-hexa-tile>`;
      });
  }

  __displayFloorInfo() {
    const floor = this._house.getFloor(this._active_floor_id);
    const temperature = floor.getTemperature(this._config.entities_to_exclude);
    const icon = temperature ? 'mdi:thermometer' : 'mdi:thermometer-off';
    const label = temperature ? temperature + this._config.unit : 'Off';
    return html`
      <div class="title ${!temperature ? 'off' : 'on'}">${floor.name} -</div>
      <div class="temperature ${!temperature ? 'off' : 'on'}">
        ${getIcon(icon)}
        <div>${temperature}${this._config.unit}</div>
      </div>
    `;
  }

  __onFloorSelect(e, floor) {
    e.preventDefault();
    e.stopPropagation();
    // Update selected floor
    this._active_floor_id = floor.id;
    // Select first area to render
    this._active_area_id = floor.getFirstArea(
      ENTITY_KIND_CLIMATE,
      this._config.entities_to_exclude
    ).id;
  }

  __displayAreas() {
    return html`<div class="area-list">
      ${this._house
        .getFloor(this._active_floor_id)
        .getAreas()
        .filter((area) =>
          area.hasEntityKind(
            ENTITY_KIND_CLIMATE,
            this._config.entities_to_exclude
          )
        )
        .map(
          (area) => html` <div class="col">${this.__displayArea(area)}</div>`
        )}
    </div>`;
  }

  __displayArea(area) {
    return html`
      <sci-fi-hexa-tile
        active-tile
        state="${this._active_area_id == area.id ? 'on' : 'off'}"
        class="${area.isActive(
          ENTITY_KIND_CLIMATE,
          this._config.entities_to_exclude
        )
          ? 'on'
          : 'off'} ${this._active_area_id == area.id ? 'selected' : ''}"
        @click="${(e) => this.__onAreaSelect(e, area)}"
      >
        <div class="item-icon">${getIcon(area.icon)}</div>
      </sci-fi-hexa-tile>
    `;
  }

  __onAreaSelect(e, area) {
    e.preventDefault();
    e.stopPropagation();
    this._active_area_id = area.id;
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
            climate-entity="${JSON.stringify(climate.renderAsEntity())}"
            unit="${this._config.unit}"
            styles="${JSON.stringify(styles)}"
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
