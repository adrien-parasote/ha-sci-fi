import {html, nothing} from 'lit';

import {House} from '../../helpers/entities/house.js';
import {ENTITY_KIND_LIGHT} from '../../helpers/entities/light/light_const.js';
import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';
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
    super.hass = hass;
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

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">
          ${this.__renderHeader()} ${this.__renderSectionDefaultIcon()}
          ${this.__renderSectionFloorAreaSelection()}
          ${this.__renderSectionExcludeEntities()}
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
          <span><sci-fi-icon icon="mdi:page-layout-header"></sci-fi-icon></span>
          ${this.getLabel('section-title-header')}
        </h1>
        <sci-fi-input
          icon="mdi:cursor-text"
          label="${this.getLabel('input-message-text')} ${this.getLabel('text-optionnal')}"
          value=${this._config.header}
          element-id="header_message"
          kind="header_message"
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
        <span><sci-fi-icon icon="mdi:palette-outline"></sci-fi-icon></span
        >${this.getLabel('section-title-appearance')}
      </h1>
      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-active-icon')} ${this.getLabel('text-required')}"
        element-id="default_icons"
        kind="default_icon_on"
        icon=${this._config.default_icon_on}
        value=${this._config.default_icon_on}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-inactive-icon')} ${this.getLabel('text-required')}"
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
        <span><sci-fi-icon icon="mdi:home-search-outline"></sci-fi-icon></span
        >${this.getLabel('section-title-home-selection')}
      </h1>
      <sci-fi-dropdown-entity-input
        icon="mdi:floor-plan"
        label="${this.getLabel('input-floor-id')} ${this.getLabel('text-optionnal')}"
        value=${this._config.first_floor_to_render}
        element-id="first_floor_to_render"
        .items="${floors}"
        @select-item=${this.__update}
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
      <sci-fi-dropdown-entity-input
        icon="mdi:texture-box"
        label="${this.getLabel('input-area-id')} ${this.getLabel('text-optionnal')}"
        ?disabled=${areas.length == 0}
        value=${this._config.first_area_to_render}
        element-id="first_area_to_render"
        .items="${areas}"
        @select-item=${this.__update}
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
    </section>`;
  }

  __renderSectionExcludeEntities() {
    return html`<section>
      <h1>
        <span><sci-fi-icon icon="mdi:eye-remove-outline"></sci-fi-icon></span
        >${this.getLabel('input-entities-to-exclude')}
      </h1>
      <sci-fi-dropdown-multi-entities-input
        label="${this.getLabel('input-entity-id')} ${this.getLabel('text-optionnal')}"
        element-id="ignored_entities"
        kind="ignored_entities"
        .values="${this._config.ignored_entities}"
        .items="${this._lights_entities}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-multi-entities-input>
    </section> `;
  }

  __renderSectionCustomEntities() {
    return html` <section>
      <h1>
        <span
          ><sci-fi-icon
            icon="mdi:selection-ellipse-arrow-inside"
          ></sci-fi-icon></span
        >${this.getLabel('section-title-entity-light-custom')}
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
          label="${this.getLabel('input-entity-id')} ${this.getLabel('text-required')}"
          element-id="${entity_id}"
          kind="custom_entities"
          value="${entity_id}"
          .items="${this._lights_entities}"
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
        <sci-fi-button
          icon="mdi:delete-outline"
          @button-click="${(e) => this.__deleteCustomEntity(e, entity_id)}"
        >
        </sci-fi-button>
        <sci-fi-button
          icon="sci:edit"
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
        <span
          >${this.getLabel('edit-section-title')}
          ${this._custom_entity_id}</span
        >
      </div>
      <sci-fi-input
        icon="mdi:cursor-text"
        label="${this.getLabel('input-name')} ${this.getLabel('text-optionnal')}"
        value=${entity_info.name}
        element-id="${this._custom_entity_id}"
        kind="name"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-active-icon')} ${this.getLabel('text-optionnal')}"
        element-id="${this._custom_entity_id}"
        kind="icon_on"
        icon=${entity_info.icon_on}
        value=${entity_info.icon_on}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-inactive-icon')} ${this.getLabel('text-optionnal')}"
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
      case 'header_message':
        newConfig[e.detail.id] = e.detail.value;
        break;
      case 'first_floor_to_render':
        newConfig[e.detail.id] = e.detail.value;
        newConfig.first_area_to_render = null;
        break;
      case 'first_area_to_render':
        newConfig[e.detail.id] = e.detail.value;
        break;
      case 'ignored_entities':
        if (e.detail.type == 'update')
          newConfig[e.detail.id].push(e.detail.value);
        if (e.detail.type == 'remove')
          newConfig[e.detail.id].splice(e.detail.value, 1);
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
