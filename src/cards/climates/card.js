import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/tiles.js';
import '../../helpers/card/toast.js';
import common_style from '../../helpers/common_style.js';
import '../../helpers/entities/climate.js';
import {ENTITY_KIND_CLIMATE} from '../../helpers/entities/climate_const.js';
import {House} from '../../helpers/entities/house.js';
import {SunEntity} from '../../helpers/entities/weather.js';
import {getIcon, getWeatherIcon} from '../../helpers/icons/icons.js';
import {PACKAGE} from './const.js';
import {SciFiClimatesEditor} from './editor.js';
import style from './style.js';

export class SciFiClimates extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private
  _sun;

  static get properties() {
    return {
      _config: {type: Object},
      _house: {type: Object},
      _active_floor_id: {type: String}, // selected floor pointer
      _active_area_id: {type: String}, // selected area pointer
    };
  }

  __validateConfig(config) {
    if (!config.unit) config.unit = '°C';
    if (!config.entities_to_exclude) config.entities_to_exclude = [];

    if (!config.header) config.header = {};
    if (!config.header.icon_winter_state)
      config.header.icon_winter_state = 'mdi:thermometer-chevron-up';
    if (!config.header.message_winter_state)
      config.header.message_winter_state = 'Winter is coming';
    if (!config.header.icon_summer_state)
      config.header.icon_summer_state = 'mdi:thermometer-chevron-down';
    if (!config.header.message_summer_state)
      config.header.message_summer_state = 'Summer time';

    if (!config.state_icons) config.state_icons = {};
    if (!config.state_icons.auto) config.state_icons.auto = 'sci:radiator-auto';
    if (!config.state_icons.off) config.state_icons.off = 'sci:radiator-off';
    if (!config.state_icons.heat) config.state_icons.heat = 'sci:radiator-heat';

    if (!config.mode_icons) config.mode_icons = {};
    if (!config.mode_icons.none)
      config.mode_icons.none = 'mdi:circle-off-outline';
    if (!config.mode_icons.frost_protection)
      config.mode_icons.frost_protection = 'mdi:snowflake';
    if (!config.mode_icons.eco) config.mode_icons.eco = 'mdi:leaf';
    if (!config.mode_icons.comfort)
      config.mode_icons.comfort = 'mdi:sun-thermometer-outline';
    if (!config.mode_icons['comfort-1'])
      config.mode_icons['comfort-1'] = 'mdi:sun-thermometer-outline';
    if (!config.mode_icons['comfort-2'])
      config.mode_icons['comfort-2'] = 'mdi:sun-thermometer-outline';
    if (!config.mode_icons.auto)
      config.mode_icons.auto = 'mdi:thermostat-box-auto';
    if (!config.mode_icons.boost) config.mode_icons.boost = 'mdi:fire';
    if (!config.mode_icons.external)
      config.mode_icons.external = 'mdi:open-in-new';
    if (!config.mode_icons.prog) config.mode_icons.prog = 'mdi:cogs';

    if (!config.mode_colors) config.mode_colors = {};
    if (!config.mode_colors.none) config.mode_colors.none = '#6c757d';
    if (!config.mode_colors.frost_protection)
      config.mode_colors.frost_protection = '#acd5f3';
    if (!config.mode_colors.eco) config.mode_colors.eco = '#4fe38b';
    if (!config.mode_colors.comfort) config.mode_colors.comfort = '#fdda0d';
    if (!config.mode_colors['comfort-1'])
      config.mode_colors['comfort-1'] = '#ffea00';
    if (!config.mode_colors['comfort-2'])
      config.mode_colors['comfort-2'] = '#ffff8f';
    if (!config.mode_colors.auto) config.mode_colors.auto = '#69d4fb';
    if (!config.mode_colors.boost) config.mode_colors.boost = '#ff7f50';
    if (!config.mode_colors.external) config.mode_colors.external = '#6c757d';
    if (!config.mode_colors.prog) config.mode_colors.prog = '#6c757d';

    if (!config.state_colors) config.state_colors = {};
    if (!config.state_colors.auto) config.state_colors.auto = '#69d4fb';
    if (!config.state_colors.off) config.state_colors.off = '#6c757d';
    if (!config.state_colors.heat) config.state_colors.heat = '#ff7f50';

    return config;
  }

  setConfig(config) {
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
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

    if (!this._sun && hass.states['sun.sun'])
      this._sun = new SunEntity(hass, 'sun.sun');
    // Build house
    const house = new House(hass);
    if (!this._house || !isEqual(house, this._house)) this._house = house;
  }

  render() {
    if (!this._hass || !this._config) return html``;

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
    const active = this._house.isActive(
      ENTITY_KIND_CLIMATE,
      this._config.entities_to_exclude
    );
    const icon = active
      ? this._config.header.icon_summer_state
      : this._config.header.icon_winter_state;
    return html`
      <div class="info">
        ${getIcon('mdi:home-thermometer-outline')}
        <div class="text">
          ${this._house.getTemperature(this._config.entities_to_exclude)}${this
            ._config.unit}
        </div>
      </div>
      <div class="actions">
        <div class="action" @click="${this.__globalOnOffClimates}">
          ${getIcon(icon)}
          <div>
            ${active
              ? this._config.header.message_summer_state
              : this._config.header.message_winter_state}
          </div>
        </div>
      </div>
      <div class="weather">
        ${this._sun ? getWeatherIcon(this._sun.dayPhaseIcon()) : ''}
      </div>
    `;
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
          ></sci-fi-radiator>
        </div>`
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
    return {
      unit: '°C',
      entities_to_exclude: [],
      header: {
        icon_winter_state: 'mdi:thermometer-chevron-up',
        message_winter_state: 'Winter is coming',
        icon_summer_state: 'mdi:thermometer-chevron-down',
        message_summer_state: 'Summer time',
      },
      state_icons: {
        auto: 'sci:radiator-auto',
        off: 'sci:radiator-off',
        heat: 'sci:radiator-heat',
      },
      state_colors: {
        auto: '#69d4fb',
        off: '#6c757d',
        heat: '#ff7f50',
      },
      mode_icons: {
        frost_protection: 'mdi:snowflake',
        eco: 'mdi:leaf',
        comfort: 'mdi:sun-thermometer-outline',
        'comfort-1': 'mdi:sun-thermometer-outline',
        'comfort-2': 'mdi:sun-thermometer-outline',
        boost: 'mdi:fire',
      },
      mode_colors: {
        frost_protection: '#acd5f3',
        eco: '#4fe38b',
        comfort: '#fdda0d',
        'comfort-1': '#ffea00',
        'comfort-2': '#ffff8f',
        boost: '#ff7f50',
      },
    };
  }
}

window.customElements.get(PACKAGE) ||
  window.customElements.define(PACKAGE, SciFiClimates);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiClimatesEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi Climates card',
  description: 'Render sci-fi Climates card.',
});
