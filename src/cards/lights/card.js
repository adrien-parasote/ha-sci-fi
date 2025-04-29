import {html, nothing} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {isEqual} from 'lodash-es';

import {House} from '../../helpers/entities/house.js';
import {
  ENTITY_KIND_LIGHT,
  STATE_LIGHT_ON,
} from '../../helpers/entities/light/light_const.js';
import {SunEntity} from '../../helpers/entities/weather.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {PACKAGE} from './const.js';
import style from './style.js';
import { msg } from '@lit/localize';

export class SciFiLights extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _sun;

  static get properties() {
    return {
      _config: {type: Object},
      _house: {type: Object},
      _active_floor_id: {type: String}, // selected floor pointer
      _active_area_id: {type: String}, // selected area pointer
    };
  }

  setConfig(config) {
    super.setConfig(config);
    this._active_floor_id = this._config.first_floor_to_render;
    this._active_area_id = this._config.first_area_to_render;
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

    if (!this._sun && hass.states['sun.sun'])
      this._sun = new SunEntity(hass, 'sun.sun');

    // Build house
    const house = new House(hass);
    if (!this._house || !isEqual(house, this._house)) this._house = house;
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    // Setup first time attribute
    if (!this._active_floor_id)
      this._active_floor_id = this._house.getDefaultFloor(
        ENTITY_KIND_LIGHT,
        this._config.ignored_entities
      ).id;
    if (!this._active_area_id)
      this._active_area_id = this._house.getDefaultArea(
        this._active_floor_id,
        ENTITY_KIND_LIGHT,
        this._config.ignored_entities
      ).id;

    const max_areas = Math.max.apply(
      null,
      this._house.floors.map((floor) => Object.keys(floor.areas).length)
    );
    return html`
      <div class="container">
        <div class="header">${this.__displayHeader()}</div>
        <div class="floors">${this.__displayHouseFloors()}</div>
        <div class="floor-content">${this.__displayFloorInfo()}</div>
        <div class="areas" style="--hexa-max-count: ${max_areas}">
          ${this.__displayAreas()} ${this.__displayAreaInfo()}
        </div>
      </div>
      <sci-fi-toast></sci-fi-toast>
    `;
  }

  __displayHeader() {
    return html`
      <div class="info">
        <sci-fi-button
          icon="mdi:power-standby"
          class="${this._house.isActive(
            ENTITY_KIND_LIGHT,
            this._config.ignored_entities
          )
            ? 'off'
            : 'on'}"
          @button-click="${this.__turnOnOffHouse}"
        ></sci-fi-button>
        <div class="text">${this._config.header}</div>
      </div>
      <div class="weather">${this.__displaySun()}</div>
    `;
  }

  __displaySun() {
    if (!this._sun) return nothing;
    return html`<sci-fi-weather-icon
      icon="${this._sun.dayPhaseIcon()}"
    ></sci-fi-weather-icon>`;
  }

  __turnOnOffHouse(e) {
    e.preventDefault();
    e.stopPropagation();
    this._house.turnOnOffLight(this._hass, this._config.ignored_entities).then(
      () => this.__toast(false),
      (e) => this.__toast(true, e)
    );
  }

  __displayHouseFloors() {
    const cells = this._house
      .getFloorsOrderedByLevel()
      .filter((floor) =>
        floor.hasEntityKind(ENTITY_KIND_LIGHT, this._config.ignored_entities)
      )
      .map((floor) => {
        return {
          id: floor.id,
          state: this._active_floor_id == floor.id ? 'on' : 'off',
          selected: this._active_floor_id == floor.id,
          active: floor.isActive(
            ENTITY_KIND_LIGHT,
            this._config.ignored_entities
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
    const entities = floor.getEntitiesByKind(
      ENTITY_KIND_LIGHT,
      this._config.ignored_entities
    );
    const isActiveFloor = floor.isActive(
      ENTITY_KIND_LIGHT,
      this._config.ignored_entities
    )
      ? 'on'
      : 'off';
    return html` <div class="info ${isActiveFloor}">
      <div class="title">
        ${floor.name} ${this.__displayPowerBtn(floor, isActiveFloor)}
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
        .filter((area) =>
          area.hasEntityKind(ENTITY_KIND_LIGHT, this._config.ignored_entities)
        )
        .map((area, idx) => {
          const area_state = area.isActive(
            ENTITY_KIND_LIGHT,
            this._config.ignored_entities
          )
            ? 'on'
            : 'off';
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
    const isActiveArea = area.isActive(
      ENTITY_KIND_LIGHT,
      this._config.ignored_entities
    )
      ? 'on'
      : 'off';
    return html`
      <sci-fi-hexa-tile
        active-tile
        state="${area.id == this._active_area_id ? 'on' : 'off'}"
        class="${isActiveArea}"
        @click="${(e) => this.__onAreaSelect(e, area)}"
      >
        <div class="item-icon ${isActiveArea}">
          <sci-fi-icon icon=${area.icon}></sci-fi-icon>
        </div>
      </sci-fi-hexa-tile>
    `;
  }

  __displayAreaInfo() {
    const area = this._house.getArea(
      this._active_floor_id,
      this._active_area_id
    );
    const active = area.isActive(
      ENTITY_KIND_LIGHT,
      this._config.ignored_entities
    );
    return html`
      <div class="card-corner area-content ${active ? 'on' : 'off'}">
        <div class="title">
          ${area.name} ${this.__displayPowerBtn(area, active ? 'off' : 'on')}
        </div>
        ${this.__displayAreaLights(area)}
      </div>
    `;
  }

  __displayPowerBtn(element, active) {
    return html`<sci-fi-button
      icon="mdi:power-standby"
      class="${active}"
      @button-click="${(e) => this.__onPowerBtnClick(e, element)}"
    ></sci-fi-button>`;
  }

  __displayAreaLights(area) {
    return html` <div class="lights">
      ${area
        .getEntitiesByKind(ENTITY_KIND_LIGHT, this._config.ignored_entities)
        .map((light) => {
          const custom = this._config.custom_entities[light.entity_id];
          return html`
            <sci-fi-button-card
              class="${light.state}"
              no-title
              icon="${this.__getLightIcon(light, custom)}"
              text="${custom && custom.name
                ? custom.name
                : light.friendly_name}"
              @button-click="${(e) => this.__onLightClick(e, light)}"
            ></sci-fi-button-card>
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
    return icon;
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
      ENTITY_KIND_LIGHT,
      this._config.ignored_entities
    ).id;
  }

  __onAreaSelect(e, area) {
    e.preventDefault();
    e.stopPropagation();
    this._active_area_id = area.id;
  }

  __onPowerBtnClick(e, element) {
    e.preventDefault();
    e.stopPropagation();
    element
      .callService(this._hass, ENTITY_KIND_LIGHT, this._config.ignored_entities)
      .then(
        () => this.__toast(false),
        (e) => this.__toast(true, e)
      );
  }

  __onLightClick(e, light) {
    e.preventDefault();
    e.stopPropagation();
    light.callService(this._hass).then(
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
