import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/wheel.js';
import common_style from '../../helpers/common_style.js';
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
      _floors: {type: Object}, // Floors object to display
      _areas: {type: Object}, // Areas object to display
      _selected_floor_id: {type: String}, // selected floor pointer
      _selected_area_id: {type: String}, // selected area pointer
      _current_states: {type: Array}, // Force render pointer
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
    this._selected_floor_id = this._config.floors.first_to_render;
    this._selected_area_id = this._config.areas.first_to_render;

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

    // Extract entities to watch
    const map_area_entities = this.__getEntitiesPerAreas(hass);
    // Extract floors & areas
    const data = this.__getAreasFloors(map_area_entities, hass);
    if (!this._areas || !isEqual(data.areas, this._areas))
      this._areas = data['areas'];
    if (!this._floors || !isEqual(data.floors, this._floors))
      this._floors = data['floors'];

    // Update card on state update
    const current_states = this.__getLightState(
      map_area_entities[this._selected_area_id],
      hass
    );
    if (!this._current_states || !isEqual(current_states, this._current_states))
      this._current_states = current_states;
  }

  __getLightState(lights, hass) {
    let states = [];
    if (lights)
      lights.map((light) => {
        states.push(hass.states[light].state);
      });
    return states;
  }

  __getAreasFloors(map_area_entities, hass) {
    let floors = {};
    let areas = {};
    Object.values(hass.areas).map((area) => {
      if (!areas[area.floor_id]) areas[area.floor_id] = [];
      if (!floors[area.floor_id]) {
        floors[area.floor_id] = {
          id: area.floor_id,
          icon: hass.floors[area.floor_id].icon,
          level: hass.floors[area.floor_id].level,
          name: hass.floors[area.floor_id].name,
          state: 'off',
          inactive: this._config.floors.to_exclude.includes(area.floor_id),
        };
      }
      // Case of area doesn't have lights
      let area_state = 'off';
      if (map_area_entities[area.area_id]) {
        area_state = map_area_entities[area.area_id]
          .map((entity_id) => this._hass.states[entity_id].state)
          .includes('on')
          ? 'on'
          : 'off';
      }
      let room = {
        name: area.name,
        icon: area.icon,
        id: area.area_id,
        lights: map_area_entities[area.area_id]
          ? map_area_entities[area.area_id]
          : [],
        state: area_state,
        inactive: this._config.areas.to_exclude.includes(area.area_id),
      };
      areas[area.floor_id].push(room);

      if (room.state == 'on') floors[area.floor_id].state = 'on';
    });
    return {areas: areas, floors: floors};
  }

  __getEntitiesPerAreas(hass) {
    const map_devices_entities = Object.keys(hass.entities)
      .filter((key) => key.startsWith('light.'))
      .reduce((cur, key) => {
        const d = {};
        d[hass.entities[key].device_id] = hass.entities[key].entity_id;
        return Object.assign({}, cur, d);
      }, {});
    let devices = {};
    Object.keys(hass.devices)
      .filter((key) => Object.keys(map_devices_entities).includes(key))
      .map((key) => {
        const area_id = hass.devices[key].area_id;
        if (!devices[area_id]) devices[area_id] = [];
        devices[area_id].push(map_devices_entities[key]);
      });
    return devices;
  }

  __getCurrentArea() {
    return this._areas[this._selected_floor_id].filter(
      (el) => el.id == this._selected_area_id
    )[0];
  }

  render() {
    if (!this._hass || !this._config) return html``;
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

  __displayFloorInfo() {
    const floor = this._floors[this._selected_floor_id];
    const areas = this._areas[this._selected_floor_id];
    const floor_lights = this.__getFloorLights();
    const inactive = areas.filter((el) => {
      return el.inactive;
    }).length;
    return html`
      <div class="title">${floor.name} (level : ${floor.level})</div>
      <div class="rooms">Rooms : ${areas.length} (${inactive} excluded)</div>
      <ul class="devices">
        <li>Light on : ${floor_lights.on.length}</li>
        <li>Light off : ${floor_lights.off.length}</li>
      </ul>
    `;
  }

  __displayAreas() {
    return this._areas[this._selected_floor_id].map((area, id) => {
      const area_state = area.state;
      const separator_visible =
        this._selected_area_id == area.id ? 'show' : 'hide';
      return html` <div
        class="row"
        style="margin-left: calc(var(--wheel-hexa-width) / 2 * ${id %
        2} - 20px * ${id % 2});"
      >
        <sci-fi-hexa-tile
          active
          state="${area_state}"
          class="${area_state}"
          @click="${(e) => this.__changeFocusArea(e, area)}"
        >
          <div class="item-icon">${getIcon(area.icon)}</div>
        </sci-fi-hexa-tile>
        <div class="h-separator ${separator_visible}">
          <div class="circle ${area_state}"></div>
          <div
            class="h-path ${area_state} ${id % 2 ? '' : 'full'}"
            style="width: ${id % 2 ? '15px' : '45px'};"
          ></div>
          <div class="circle ${area_state}"></div>
        </div>
      </div>`;
    });
  }

  __displayAreaInfo(active_area) {
    return html`
      <div class="title">
        ${active_area.name} ${this.__displayAreaPower(active_area)}
      </div>
      ${this.__displayAreaLights(active_area)}
    `;
  }

  __displayAreaPower(active_area) {
    if (active_area.lights.length == 0) return;
    return html`
      <div class="power" @click="${(e) => this.__clickOnArea(e, active_area)}">
        ${getIcon('mdi:power-standby')}
      </div>
    `;
  }

  __displayAreaLights(active_area) {
    if (active_area.lights.length == 0)
      return html`<div class="no-light">No light to display</div>`;
    return html` <div class="lights">
      ${active_area.lights.map((light) => {
        const entity = this._hass.states[light];
        return html`
          <div
            class="light ${entity.state}"
            @click="${(e) => this.__clickOnLigth(e, entity.entity_id)}"
          >
            ${this.__getLightIcon(entity)}
            <div>${entity.attributes.friendly_name}</div>
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
