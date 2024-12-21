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
      _floors: {type: Object},
      _areas: {type: Object},
      _selected_floor_id: {type: String},
      _selected_area_id: {type: String},
    };
  }

  constructor() {
    super();
  }

  setConfig(config) {
    if (!config) return;
    this._config = config;

    if (!this._config.floors)
      throw new Error('You need to specify a "floors" config entry');
    if (!this._config.floors.first_to_render)
      throw new Error(
        'You need to specify the first floor you want to display in the screen'
      );
    if (!this._config.floors.to_exclude) this._config.floors.to_exclude = []; // TODO check if working

    if (!this._config.areas)
      throw new Error('You need to specify an "areas" config entry');
    if (!this._config.areas.first_to_render)
      throw new Error(
        'You need to specify the first area you want to display in the screen'
      );
    if (!this._config.areas.to_exclude) this._config.areas.to_exclude = []; // TODO check if working

    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
    // Extract floors & areas
    const data = this.__getAreasFloors();
    if (!this._areas || !isEqual(data[0], this._areas)) {
      this._areas = data[0];
    }
    if (!this._floors || !isEqual(data[1], this._floors)) {
      this._floors = data[1];
    }
    // Setup attribute
    this._selected_floor_id = this._config.floors.first_to_render;
    this._selected_area_id = this._config.areas.first_to_render;
  }

  getCardSize() {
    return 1;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set
  }

  __getAreasFloors() {
    let floors = {};
    let areas = {};
    Object.values(this._hass.areas).map((area) => {
      if (!areas[area.floor_id]) areas[area.floor_id] = [];
      if (!floors[area.floor_id]) {
        floors[area.floor_id] = {
          id: area.floor_id,
          icon: this._hass.floors[area.floor_id].icon,
          level: this._hass.floors[area.floor_id].level,
          name: this._hass.floors[area.floor_id].name,
          inactive: this._config.floors.to_exclude.includes(area.floor_id),
        };
      }
      let room = {
        name: area.name,
        icon: area.icon,
        id: area.area_id,
        inactive: this._config.areas.to_exclude.includes(area.area_id),
      };
      areas[area.floor_id].push(room);
    });
    return [areas, floors];
  }

  render() {
    if (!this._hass || !this._config) return html``;

    const floor_state = 'off';

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
          <div class="left">
            <div class="circle off left-circle"></div>
            <!-- todo gestion area state -->
            ${this.__displayAreas()}
          </div>
          <div class="card-corner right off">
            <!-- todo gestion area state -->
          </div>
        </div>
      </div>
    `;
  }

  __displayFloorInfo() {
    const floor = this._floors[this._selected_floor_id];
    const areas = this._areas[this._selected_floor_id];
    const inactive = areas.filter((el) => {
      return el.inactive;
    }).length;
    return html`
      <div class="title">${floor.name} (level : ${floor.level})</div>
      <div class="rooms">Rooms : ${areas.length} (${inactive} excluded)</div>
      <div class="devices">
        Lights (xx excluded):
        <ul>
          <li>On : todo</li>
          <li>Off : todo</li>
        </ul>
      </div>
    `;
  }

  __displayAreas() {
    return this._areas[this._selected_floor_id].map((area, id) => {
      const area_state = 'off'; // TODO
      const separator_visible =
        this._selected_area_id == area.id ? 'show' : 'hide';
      return html` <div
        class="row"
        style="margin-left: calc(var(--wheel-hexa-width) / 2 * ${id %
        2} - 20px * ${id % 2});"
      >
        <sci-fi-hexa-tile active state="${area_state}" class="${area_state}">
          <div class="item-icon">${getIcon(area.icon)}</div>
        </sci-fi-hexa-tile>
        <div class="h-separator ${separator_visible}">
          <div class="circle ${area_state}"></div>
          <div
            class="h-path ${area_state} ${id % 2 ? '' : 'full'}"
            style="width: calc((var(--wheel-hexa-width) / 2 - 10px) * ${id % 2
              ? 0
              : 1} + 15px);"
          ></div>
          <div class="circle ${area_state}"></div>
        </div>
      </div>`;
    });
  }

  __changeFocusFloor(e) {
    e.preventDefault();
    e.stopPropagation();
    // Update selected floor
    this._selected_floor_id = e.detail.id;
    // Select first area to render
    this._selected_area_id = this._areas[this._selected_floor_id][0].id;
  }

  __clickOnFloor(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('click floor => todo on/off light in the floor :', e.detail.id);
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }
  static getStubConfig() {
    return {
      floors: {
        to_exclude: [],
        first_to_render: '',
      },
      areas: {
        to_exclude: [],
      },
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
