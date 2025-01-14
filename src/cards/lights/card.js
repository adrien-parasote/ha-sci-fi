import {LitElement, html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {isEqual} from 'lodash-es';

import '../../helpers/card/tiles.js';
import common_style from '../../helpers/common_style.js';
import {
  ENTITY_KIND_LIGHT,
  STATE_LIGHT_ON,
} from '../../helpers/entities/const.js';
import {House} from '../../helpers/entities/house.js';
import {getIcon} from '../../helpers/icons/icons.js';
import {PACKAGE} from './const.js';
import {SciFiLightsEditor} from './editor.js';
import style from './style.js';

export class SciFiLights extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private

  static get properties() {
    return {
      _config: {type: Object},
      _house: {type: Object},
      _active_floor_id: {type: String}, // selected floor pointer
      _active_area_id: {type: String}, // selected area pointer
    };
  }

  constructor() {
    super();
  }

  __validateConfig(config) {
    if (!config.default_icon_on)
      config.default_icon_on = 'mdi:lightbulb-on-outline';
    if (!config.default_icon_off)
      config.default_icon_off = 'mdi:lightbulb-outline';
    if (!config.custom_entities) config.custom_entities = {};
    return config;
  }

  setConfig(config) {
    if (!config) return;
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
    this._active_floor_id = this._config.first_floor_to_render;
    this._active_area_id = this._config.first_area_to_render;

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

    // Build house
    const house = new House(hass);
    if (!this._house || !isEqual(house, this._house)) this._house = house;
  }

  render() {
    if (!this._hass || !this._config) return html``;
    // Setup first time attribute
    if (!this._active_floor_id)
      this._active_floor_id = this._house.getDefaultFloor(ENTITY_KIND_LIGHT).id;
    if (!this._active_area_id)
      this._active_area_id = this._house.getDefaultArea(
        this._active_floor_id,
        ENTITY_KIND_LIGHT
      ).id;

    return html`
      <div class="container">
        <div class="floors">${this.__displayHouseFloors()}</div>
        <div class="floor-content">${this.__displayFloorInfo()}</div>
        <div class="areas">
          ${this.__displayAreas()} ${this.__displayAreaInfo()}
        </div>
      </div>
    `;
  }

  __displayHouseFloors() {
    return this._house.floors.map((floor) => {
      if (!floor.hasEntityKind(ENTITY_KIND_LIGHT)) return;
      return html` <sci-fi-hexa-tile
        active-tile
        state="${floor.isActive(ENTITY_KIND_LIGHT) ? 'on' : 'off'}"
        class="${this._active_floor_id == floor.id ? 'selected' : ''}"
        @click="${(e) => this.__onFloorSelect(e, floor)}"
      >
        <div class="item-icon">${getIcon(floor.icon)}</div>
      </sci-fi-hexa-tile>`;
    });
  }

  __displayFloorInfo() {
    const floor = this._house.getFloor(this._active_floor_id);
    const entities = floor.getEntitiesByKind(ENTITY_KIND_LIGHT);
    return html` <div
      class="info ${floor.isActive(ENTITY_KIND_LIGHT) ? 'on' : 'off'}"
    >
      <div class="title">
        ${floor.name} (level : ${floor.level}) ${this.__displayPowerBtn(floor)}
      </div>
      <div class="floor-lights">
        ${this.__displayOnLights(
          entities.length,
          entities.filter((entity) => entity.state == STATE_LIGHT_ON).length
        )}
      </div>
    </div>`;
  }

  __displayOnLights(total, total_on) {
    let on = total_on;
    let res = [];
    for (let i = 0; i < total; i++) {
      res.push(on > 0 ? '<div class="on"></div>' : '<div class="off"></div>');
      on--;
    }
    return html`${unsafeHTML(res.join(''))}`;
  }

  __displayAreas() {
    return html`<div class="area-list">
      ${this._house
        .getFloor(this._active_floor_id)
        .getAreas()
        .filter((area) => area.hasEntityKind(ENTITY_KIND_LIGHT))
        .map((area, idx) => {
          const area_state = area.isActive(ENTITY_KIND_LIGHT) ? 'on' : 'off';
          return html` <div
            class="row"
            style="margin-left: calc(var(--default-hexa-width) / 2 * ${idx %
            2});"
          >
            ${this.__displayArea(area)}
            <div
              class="h-separator ${this._active_area_id == area.id
                ? 'show'
                : 'hide'}"
            >
              <div class="circle ${area_state}"></div>
              <div
                class="h-path ${area_state} ${idx % 2 ? '' : 'full'}"
                style="width: ${idx % 2 ? '15px' : '45px'};"
              ></div>
              <div class="circle ${area_state}"></div>
            </div>
          </div>`;
        })}
    </div>`;
  }

  __displayArea(area) {
    const area_state = area.isActive(ENTITY_KIND_LIGHT) ? 'on' : 'off';
    return html`
      <sci-fi-hexa-tile
        active-tile
        state="${area_state}"
        class="${area_state}"
        @click="${(e) => this.__onAreaSelect(e, area)}"
      >
        <div class="item-icon">${getIcon(area.icon)}</div>
      </sci-fi-hexa-tile>
    `;
  }

  __displayAreaInfo() {
    const area = this._house.getArea(
      this._active_floor_id,
      this._active_area_id
    );
    const active = area.isActive(ENTITY_KIND_LIGHT);
    return html`
      <div class="card-corner area-content ${active ? 'on' : 'off'}">
        <div class="title">${area.name} ${this.__displayPowerBtn(area)}</div>
        ${this.__displayAreaLights(area)}
      </div>
    `;
  }

  __displayPowerBtn(element) {
    return html`<div
      class="power"
      @click="${(e) => this.__onPowerBtnClick(e, element)}"
    >
      ${getIcon('mdi:power-standby')}
    </div>`;
  }

  __displayAreaLights(area) {
    return html` <div class="lights">
      ${area.getEntitiesByKind(ENTITY_KIND_LIGHT).map((light) => {
        const custom = this._config.custom_entities[light.entity_id];
        return html`
          <div
            class="light ${light.state}"
            @click="${(e) => this.__onLightClick(e, light)}"
          >
            ${this.__getLightIcon(light, custom)}
            <div>
              ${custom && custom.name ? custom.name : light.friendly_name}
            </div>
          </div>
        `;
      })}
    </div>`;
  }

  __getLightIcon(entity, custom) {
    let icon = null;
    if (entity.state == 'on') {
      icon =
        custom && custom.icon_on
          ? custom.icon_on
          : this._config.default_icon_on;
    } else {
      icon =
        custom && custom.icon_off
          ? custom.icon_off
          : this._config.default_icon_off;
    }
    return getIcon(icon);
  }

  __onFloorSelect(e, floor) {
    e.preventDefault();
    e.stopPropagation();
    // Update selected floor
    this._active_floor_id = floor.id;
    // Select first area to render
    this._active_area_id = floor.getFirstArea(ENTITY_KIND_LIGHT).id;
  }

  __onAreaSelect(e, area) {
    e.preventDefault();
    e.stopPropagation();
    this._active_area_id = area.id;
  }

  __onPowerBtnClick(e, element) {
    e.preventDefault();
    e.stopPropagation();
    element.callService(this._hass, ENTITY_KIND_LIGHT);
  }

  __onLightClick(e, light) {
    e.preventDefault();
    e.stopPropagation();
    light.callService(this._hass);
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return {
      default_icon_on: 'mdi:lightbulb-on-outline',
      default_icon_off: 'mdi:lightbulb-outline',
      first_floor_to_render: null,
      first_area_to_render: null,
      custom_entities: {},
    };
  }
}

window.customElements.get(PACKAGE) ||
  window.customElements.define(PACKAGE, SciFiLights);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiLightsEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi lights card',
  description: 'Render sci-fi lights management.',
});
