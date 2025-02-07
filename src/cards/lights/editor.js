import {html, nothing} from 'lit';

import {SciFiBaseEditor} from '../../helpers/base_editor.js';
import {House} from '../../helpers/entities/house.js';
import {ENTITY_KIND_LIGHT} from '../../helpers/entities/light_const.js';
import {getIcon} from '../../helpers/icons/icons.js';
import editor_style from './style_editor.js';

export class SciFiLightsEditor extends SciFiBaseEditor {
  static get styles() {
    return super.styles.concat([editor_style]);
  }

  static get properties() {
    return {
      _config: {type: Object},
      _custom_entity_id: {type: String},
    };
  }

  _edit = false;

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
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

    if (this._house && !this._config.first_floor_to_render) {
      this.__setupDefault();
    }
  }

  setConfig(config) {
    this._config = config;
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">
          ${this.__renderHeader()} ${this.__renderSectionDefaultIcon()}
          ${this.__renderSectionFloorAreaSelection()}
          ${this.__renderSectionCustomEntities()}
        </div>
        <div class="editor ${this._edit}">${this.__renderEntityCustom()}</div>
      </div>
    `;
  }

  __renderHeader() {
    return html`
      <section>
        <h1>
          <span>${getIcon('mdi:page-layout-header')}</span>
          Header
        </h1>
        <sci-fi-input
          icon="mdi:cursor-text"
          label="Header card message"
          value=${this._config.header}
          element-id="header"
          kind="header"
          @input-update=${this.__update}
        ></sci-fi-input>
      </section>
    `;
  }

  __setupDefault() {
    const first_floor_to_render =
      this._house.getDefaultFloor(ENTITY_KIND_LIGHT).id;
    const first_area_to_render = this._house.getDefaultArea(
      first_floor_to_render,
      ENTITY_KIND_LIGHT
    ).id;
    let newConfig = this.__getNewConfig();
    newConfig.first_floor_to_render = first_floor_to_render;
    newConfig.first_area_to_render = first_area_to_render;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: {config: newConfig},
        bubbles: true,
        composed: true,
      })
    );
  }

  __renderSectionDefaultIcon() {
    return html` <section>
      <h1>
        <span>${getIcon('mdi:home-lightbulb-outline')}</span>Lights appearance
      </h1>
      <sci-fi-dropdown-icon-input
        label="Active icon (required)"
        element-id="default_icons"
        kind="default_icon_on"
        icon=${this._config.default_icon_on}
        value=${this._config.default_icon_on}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
      <sci-fi-dropdown-icon-input
        label="Inactive icon (required)"
        element-id="default_icons"
        kind="default_icon_off"
        icon=${this._config.default_icon_off}
        value=${this._config.default_icon_off}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
    </section>`;
  }

  __renderSectionFloorAreaSelection() {
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
      ${Object.keys(this._config.custom_entities).map((entity_id) =>
        this.__renderCustomEntity(entity_id)
      )}
      <sci-fi-button
        has-border
        icon="mdi:plus"
        @button-click=${this.__addElement}
      ></sci-fi-button>
    </section>`;
  }

  __renderCustomEntity(entity_id) {
    return html`
      <div class="entity-row">
        <sci-fi-dropdown-entity-input
          label="Entity id (required)"
          element-id="${entity_id}"
          kind="custom_entities"
          value="${entity_id}"
          items="${JSON.stringify(this._lights_entities)}"
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
        <sci-fi-button
          icon="mdi:delete-outline"
          @button-click="${(e) => this.__deleteCustomEntity(e, entity_id)}"
        >
        </sci-fi-button>
        <sci-fi-button
          icon="mdi:pencil-outline"
          @button-click="${(e) => this.__editCustomEntity(entity_id)}"
        >
        </sci-fi-button>
      </div>
    `;
  }

  __renderEntityCustom() {
    if (!this._custom_entity_id) return nothing;
    const entity_info = this._config.custom_entities[this._custom_entity_id];
    return html`
      <div class="head">
        <sci-fi-button
          icon="mdi:chevron-left"
          @button-click=${this.__endCustomEntity}
        ></sci-fi-button>
        <span>Edit ${this._custom_entity_id}</span>
      </div>
      <sci-fi-input
        icon="mdi:cursor-text"
        label="Custom name"
        value=${entity_info.name}
        element-id="${this._custom_entity_id}"
        kind="name"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-dropdown-icon-input
        label="Custom active icon"
        element-id="${this._custom_entity_id}"
        kind="icon_on"
        icon=${entity_info.icon_on}
        value=${entity_info.icon_on}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
      <sci-fi-dropdown-icon-input
        label="Custom inactive icon"
        element-id="${this._custom_entity_id}"
        kind="icon_off"
        icon=${entity_info.icon_off}
        value=${entity_info.icon_off}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
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

  __deleteCustomEntity(e, entity_id) {
    let newConfig = this.__getNewConfig();
    delete newConfig.custom_entities[entity_id];
    this.__dispatchChange(e, newConfig);
  }

  __editCustomEntity(entity_id) {
    this._custom_entity_id = entity_id;
    this._edit = !this._edit;
  }

  __endCustomEntity() {
    this._edit = !this._edit;
    this._custom_entity_id = null;
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    switch (e.detail.id) {
      case 'header':
        newConfig[e.detail.id] = e.detail.value;
        break;
      case 'first_floor_to_render':
        newConfig[e.detail.id] = e.detail.value;
        newConfig.first_area_to_render = null;
        break;
      case 'first_area_to_render':
        newConfig[e.detail.id] = e.detail.value;
        break;
      case 'default_icons':
        newConfig[e.detail.kind] = e.detail.value;
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
}
