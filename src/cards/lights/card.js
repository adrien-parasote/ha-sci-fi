import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/wheel.js';
import common_style from '../../helpers/common_style.js';
import {getIcon} from '../../helpers/icons/icons.js';
import {PACKAGE} from './const.js';
import {SciFiLightsEditor} from './editor.js';
import style from './style.js';
import { House } from '../../helpers/entities/house.js';
import { ENTITY_KIND_LIGHT, STATE_LIGHT_ON } from '../../helpers/entities/const.js';

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
    if (!config.floors)
      throw new Error('You need to specify a "floors" config entry');
    if (!config.floors.first_to_render)
      throw new Error(
        'You need to specify the first floor you want to display in the screen'
      );
    if (!config.floors.to_exclude) config.floors.to_exclude = []; // TODO check if working

    if (!config.areas)
      throw new Error('You need to specify an "areas" config entry');
    if (!config.areas.first_to_render)
      throw new Error(
        'You need to specify the first area you want to display in the screen'
      );
    if (!config.areas.to_exclude) config.areas.to_exclude = []; // TODO check if working

    if (!config.default_icons)
      throw new Error('You need to define default light icon (on / off)');
    if (!config.default_icons.on)
      config.default_icons.on = 'mdi:lightbulb-on-outline';
    if (!config.default_icons.off)
      config.default_icons.off = 'mdi:lightbulb-outline';
    return config;
  }

  setConfig(config) {
    if (!config) return;
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));

    // Setup first time attribute
    this._active_floor_id = this._config.floors.first_to_render;
    this._active_area_id = this._config.areas.first_to_render;

    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  getCardSize() {
    return 1;
  }

  set hass(hass) {
    this._hass = hass;

    if (!this._config) return; // Can't assume setConfig is called before hass is set

    // Build house
    const house = new House(hass);
    if (!this._house || !isEqual(house, this._house))
      this._house = house;
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="container">
        <div class="floors">${this.__displayHouseFloors()}</div>
        <div class="floor-content">
          ${this.__displayFloorInfo()}
        </div>
        <div class="areas">
          ${this.__displayAreas()}
          ${this.__displayAreaInfo()}
        </div>
      </div>
    `;





    const floor_state = this._floors[this._selected_floor_id].state;
    const active_area = this.__getCurrentArea();
    return html`
      <div class="container">
        <div class="header ${floor_state}">
          <sci-fi-wheel
            .items="${Object.values(this._floors)}"
            selected-id="${this._selected_floor_id}"
            state="${floor_state}"
            @wheel-change=${this.__changeFocusFloor}
            @wheel-click=${this.__clickOnFloor}
          >
          </sci-fi-wheel>
          <div class="h-separator">
            <div class="circle ${floor_state}"></div>
            <div class="h-path ${floor_state}"></div>
            <div class="circle ${floor_state}"></div>
          </div>
          <div class="card-corner floor-info ${floor_state}">
            ${this.__displayFloorInfo()}
          </div>
        </div>
        <div class="content">
          <div class="left ${floor_state}">
            <div class="circle ${floor_state} left-circle"></div>
            ${this.__displayAreas()}
          </div>
          <div class="card-corner area-info right ${active_area.state}">
            ${this.__displayAreaInfo(active_area)}
          </div>
        </div>
      </div>
    `;
  }

  __displayHouseFloors(){
    return this._house.floors.map((floor) => {
      return floor.render(ENTITY_KIND_LIGHT, this._active_floor_id == floor.id);
    })
  }

  __displayFloorInfo() {
    const floor = this._house.getFloor(this._active_floor_id);
    const active_floor = floor.isActive(ENTITY_KIND_LIGHT);
    const entities = floor.getEntitiesByKind(ENTITY_KIND_LIGHT);
    const entity_on_count = entities.filter((entity) => entity.state == STATE_LIGHT_ON).length
    return html`
    <div class="info ${active_floor ? 'on' : 'off'}">
      <div class="title">${floor.name} (level : ${floor.level}) ${this.__displayPowerBtn(active_floor)}</div>
      <div class="floor-lights">
        <div class="on">${getIcon(this._config.default_icons.on)} x${entity_on_count}</div>
        <div class="off">${getIcon(this._config.default_icons.off)} x${entities.length - entity_on_count}</div>
      </div>
    </div>`;
  }

  __displayAreas() {
    return html`<div class="area-list">
        ${this._house.getFloor(this._active_floor_id).getAreas().map((area, idx) => {
          const area_state = area.isActive(ENTITY_KIND_LIGHT) ? 'on' : 'off';
          const separator_visible = this._active_area_id == area.id ? 'show' : 'hide';
          return html`
          <div
            class="row"
            style="margin-left: calc(var(--default-hexa-width) / 2 * ${idx %2});"
          >
            ${area.render(ENTITY_KIND_LIGHT)}
            <div class="h-separator ${separator_visible}">
              <div class="circle ${area_state}"></div>
              <div
                class="h-path ${area_state} ${idx % 2 ? '' : 'full'}"
                style="width: ${idx % 2 ? '15px' : '45px'};"
              ></div>
              <div class="circle ${area_state}"></div>
            </div>
          </div>`
        })}
      </div>`;
  }

  __displayAreaInfo(){
    const area = this._house.getArea(this._active_floor_id, this._active_area_id);
    const active = area.isActive(ENTITY_KIND_LIGHT);
    return html`
      <div class="card-corner area-content ${active ? 'on' : 'off'}">
        <div class="title">
          ${area.name} ${this.__displayPowerBtn(active)}
        </div>
        ${this.__displayAreaLights(area, active)}
      </div>
    `;
  }

  __displayPowerBtn(active){
    if(!active) return;
    return html`<div class="power">${getIcon('mdi:power-standby')}</div>`;
  }
  
  __displayAreaLights(area, active) {
    if (!active)return html`<div class="no-light">No light to display</div>`;
    return html` <div class="lights">
      ${area.getEntities(ENTITY_KIND_LIGHT).map((light) => {
        return html`
          <div
            class="light ${light.state}"
          >
            ${this.__getLightIcon(light)}
            <div>${light.friendly_name}</div>
          </div>
        `;
      })}
    </div>`;
  }

  __getLightIcon(entity) {
    // TODO Deal with custom entity icon
    return getIcon(
      entity.state == 'on'
        ? this._config.default_icons.on
        : this._config.default_icons.off
    );
  }

  /*
  __changeFocusFloor(e) {
    e.preventDefault();
    e.stopPropagation();
    // Update selected floor
    this._selected_floor_id = e.detail.id;
    // Select first area to render
    this._selected_area_id = this._areas[this._selected_floor_id][0].id;
  }

  __changeFocusArea(e, area) {
    e.preventDefault();
    e.stopPropagation();
    this._selected_area_id = area.id;
  }
  __getFloorLights() {
    let on = [];
    let off = [];
    this._areas[this._selected_floor_id].map((area) => {
      area.lights.map((entity_id) => {
        const entity = this._hass.states[entity_id];
        if (entity.state == 'on') {
          on.push(entity.entity_id);
        } else {
          off.push(entity.entity_id);
        }
      });
    });
    return {on: on, off: off};
  }

  __clickOnFloor(e) {
    e.preventDefault();
    e.stopPropagation();
    this.__callService(
      this._areas[this._selected_floor_id]
        .map((area) => {
          return area.lights;
        })
        .flat(),
      this._floors[this._selected_floor_id].state == 'on'
        ? 'turn_off'
        : 'turn_on'
    );
  }

  __clickOnArea(e, area) {
    e.preventDefault();
    e.stopPropagation();
    this.__callService(
      area.lights,
      area.state == 'on' ? 'turn_off' : 'turn_on'
    );
  }

  __clickOnLigth(e, entity_id) {
    e.preventDefault();
    e.stopPropagation();
    this.__callService(
      [entity_id],
      this._hass.states[entity_id].state == 'on' ? 'turn_off' : 'turn_on'
    );
  }

  __callService(entities, action) {
    this._hass.callService('light', action, {
      entity_id: entities,
    });
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }
  static getStubConfig() {
    return {
      default_icons: {
        on: 'mdi:lightbulb-on-outline',
        off: 'mdi:lightbulb-outline',
      },
      floors: {
        to_exclude: [],
        first_to_render: '',
      },
      areas: {
        to_exclude: [],
      },
      entities: {},
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
