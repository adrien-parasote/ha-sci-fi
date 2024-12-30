import {LitElement, css, html} from 'lit';
import object from 'lodash-es/object.js';

import common_style from '../../helpers/common_style.js';
import editor_common_style from '../../helpers/editor_common_style.js';
import {ENTITY_KIND_LIGHT} from '../../helpers/entities/const.js';
import {House} from '../../helpers/entities/house.js';
import '../../helpers/form/form.js';
import {getIcon} from '../../helpers/icons/icons.js';

export class SciFiLightsEditor extends LitElement {
  static get styles() {
    return [
      common_style,
      editor_common_style,
      css`
        .customization {
          display: flex;
          flex-direction: column;
          margin-left: 15px;
          row-gap: 10px;
        }
      `,
    ];
  }

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  _hass; // private

  set hass(hass) {
    this._hass = hass;
    // Setup only once for editor
    if (!this._house) {
      this._house = new House(hass);
      this._floors = this._house.floors.filter((floor) =>
        floor.hasEntityKind(ENTITY_KIND_LIGHT)
      );
      this._lights_entities = this._house.floors
        .map((floor) => floor.getEntitiesByKind(ENTITY_KIND_LIGHT))
        .flat()
        .map((entity) => entity.renderAsEntity());
    }
  }

  setConfig(config) {
    this._config = config;
  }

  __getFloors(hass) {
    return;
  }

  __getAreas(hass) {
    return;
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
        <div class="container">
          ${this.__renderSectionDefaultIcon()}
          ${this.__renderSectionFloorAreaSelection()}
          ${this.__renderSectionCustomEntities()}
        </div>
      </div>
    `;
  }

  __renderSectionDefaultIcon() {
    return html` <section>
      <h1>
        <span>${getIcon('mdi:home-lightbulb-outline')}</span>Lights appearance
      </h1>
      <sci-fi-dropdown-icon-input
        label="Active icon*"
        element-id="default_icons"
        kind="on"
        icon=${this._config.default_icons.on}
        value=${this._config.default_icons.on}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
      <sci-fi-dropdown-icon-input
        label="Inactive icon*"
        element-id="default_icons"
        kind="off"
        icon=${this._config.default_icons.off}
        value=${this._config.default_icons.off}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
    </section>`;
  }

  __renderSectionFloorAreaSelection() {
    // Setup default
    if (!this._config.first_floor_to_render)
      this._config.first_floor_to_render =
        this._house.getDefaultFloor(ENTITY_KIND_LIGHT).id;
    if (!this._config.first_area_to_render)
      this._config.first_area_to_render = this._house.getDefaultArea(
        this._config.first_floor_to_render,
        ENTITY_KIND_LIGHT
      ).id;
    // Get Floors
    const floors = this._floors.map((floor) => floor.renderAsEntity());
    // Get Areas
    let areas = [];
    if (this._config.first_floor_to_render) {
      areas = this._house
        .getFloor(this._config.first_floor_to_render)
        .getAreas()
        .filter((area) => area.hasEntityKind(ENTITY_KIND_LIGHT))
        .map((area) => area.renderAsEntity());
    }
    return html` <section>
      <h1>
        <span>${getIcon('mdi:home-search-outline')}</span>Display selection
      </h1>
      <sci-fi-dropdown-entity-input
        icon="mdi:floor-plan"
        label="First floor to render"
        value=${this._config.first_floor_to_render}
        element-id="first_floor_to_render"
        items="${JSON.stringify(floors)}"
        @select-item=${this.__update}
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
      <sci-fi-dropdown-entity-input
        icon="mdi:texture-box"
        label="First area to render"
        ?disabled=${areas.length == 0}
        value=${this._config.first_area_to_render}
        element-id="first_area_to_render"
        items="${JSON.stringify(areas)}"
        @select-item=${this.__update}
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
    </section>`;
  }

  __renderSectionCustomEntities() {
    return html` <section>
      <h1>
        <span>${getIcon('mdi:selection-ellipse-arrow-inside')}</span>Light
        entities customization
      </h1>
      ${Object.entries(this._config.custom_entities).map(
        ([entity_id, entity_info]) => {
          return this.__renderCustomEntity(entity_id, entity_info);
        }
      )}
      <sci-fi-button
        has-border
        icon="mdi:plus"
        @button-click=${this.__addElement}
      ></sci-fi-button>
    </section>`;
  }

  __renderCustomEntity(entity_id, entity_info) {
    //${entity_id}, ${entity_info}`
    return html`
      <sci-fi-dropdown-entity-input
        label="Entity id*"
        element-id="${entity_id}"
        kind="custom_entities"
        value="${entity_id}"
        items="${JSON.stringify(this._lights_entities)}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
      <div class="customization">
        <sci-fi-input
          label="Custom name"
          value=${entity_info.name}
          element-id="${entity_id}"
          kind="name"
          @input-update=${this.__update}
        ></sci-fi-input>
        <sci-fi-dropdown-icon-input
          label="Custom active icon"
          element-id="${entity_id}"
          kind="icon_on"
          icon=${entity_info.icon_on}
          value=${entity_info.icon_on}
          @input-update=${this.__update}
        ></sci-fi-dropdown-icon-input>
        <sci-fi-dropdown-icon-input
          label="Custom inactive icon"
          element-id="${entity_id}"
          kind="icon_off"
          icon=${entity_info.icon_off}
          value=${entity_info.icon_off}
          @input-update=${this.__update}
        ></sci-fi-dropdown-icon-input>
      </div>
    `;
  }

  __addElement(e) {
    let newConfig = this.__getNewConfig();
    if (!newConfig.custom_entities) newConfig.custom_entities = {};
    newConfig.custom_entities['light.new'] = {
      name: 'Custom light Name',
      icon_on: 'mdi:lightbulb-on-outline',
      icon_off: 'mdi:lightbulb-outline',
    };
    this.__dispatchChange(e, newConfig);
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    switch (e.detail.id) {
      case 'default_icons':
        newConfig[e.detail.id][e.detail.kind] = e.detail.value;
        break;
      case 'first_floor_to_render':
        newConfig[e.detail.id] = e.detail.value;
        newConfig.first_area_to_render = null;
        break;
      case 'first_area_to_render':
        newConfig[e.detail.id] = e.detail.value;
        break;
      default:
        // Custom entity
        if (e.detail.kind == 'custom_entities') {
          // Create new entity
          newConfig.custom_entities[e.detail.value] =
            newConfig.custom_entities[e.detail.id];
          // Delete the old one
          delete newConfig.custom_entities[e.detail.id];
        } else {
          newConfig.custom_entities[e.detail.id][e.detail.kind] =
            e.detail.value;
        }
        break;
    }
    this.__dispatchChange(e, newConfig);
  }

  __getNewConfig() {
    return JSON.parse(JSON.stringify(this._config));
  }

  __dispatchChange(e, newConfig) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: {config: newConfig},
        bubbles: true,
        composed: true,
      })
    );
  }
}
