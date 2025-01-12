import {html} from 'lit';

import {SciFiBaseEditor} from '../../helpers/card/base_editor.js';
import '../../helpers/form/form.js';
import {getIcon} from '../../helpers/icons/icons.js';

export class SciFiHexaTilesEditor extends SciFiBaseEditor {
  _entity_kind; // list from hass
  _empty_config; // basic config to add for new element

  set hass(hass) {
    this._hass = hass;
    // initialized entity kind list
    if (hass.states) {
      this._entity_kind = Object.keys(hass.states).reduce((cur, key) => {
        const k = key.split('.')[0];
        if (cur[k]) {
          cur[k].push(hass.states[key]);
        } else {
          cur[k] = [hass.states[key]];
        }
        return cur;
      }, {});
    } else {
      this._entity_kind = [];
    }
  }

  setConfig(config) {
    this._config = config;
    this._empty_config = this.__getNewConfig()['tiles'][0];
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
        <div class="container">
          ${this.__renderHeader()} ${this.__renderWeather()}
          ${this.__renderTiles()}
        </div>
      </div>
    `;
  }

  __renderHeader() {
    return html`
      <section>
        <h1>Header</h1>
        <sci-fi-input
          label="Message"
          value=${this._config.header_message}
          element-id="header_message"
          kind=""
          @input-update=${this.__update}
        ></sci-fi-input>
      </section>
    `;
  }

  __renderWeather() {
    return html`
      <section>
        <h1>Weather</h1>
        <sci-fi-toggle
          label="Add weather tile ?"
          element-id="weather"
          ?checked=${this._config.weather.activate}
          @toggle-change=${this.__toggle}
        ></sci-fi-toggle>
        ${this._config.weather.activate ? this.__renderWeatherEntities() : ''}
      </section>
    `;
  }

  __renderWeatherEntities() {
    return html`
      <sci-fi-dropdown-entity-input
        label="Sun entity (required)"
        element-id="weather"
        kind="sun_entity"
        value="${this._config.weather.sun_entity}"
        items="${JSON.stringify(this._entity_kind['sun'].flat())}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
      <sci-fi-dropdown-entity-input
        label="Weather entity (required)"
        element-id="weather"
        kind="weather_entity"
        value="${this._config.weather.weather_entity}"
        items="${JSON.stringify(this._entity_kind['weather'].flat())}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
      <sci-fi-input
        label="Link"
        value=${this._config.weather.link}
        element-id="weather"
        kind="link"
        @input-update=${this.__update}
      ></sci-fi-input>
    `;
  }

  __renderTiles() {
    return html`
      <section>
        <h1>Tiles</h1>
        ${this._config.tiles.map((entity, id) => {
          return html`<sci-fi-accordion-card
            element-id=${id}
            title="Tile ${id + 1}"
            icon="mdi:hexagon-slice-6"
            ?deletable=${this._config.tiles.length > 1}
            @accordion-delete=${this.__update}
            ?open=${id == 0}
          >
            ${this.__renderEntity(id, entity)}
            ${this.__renderAppearance(id, entity)}
            ${this.__renderTechnical(id, entity)}
          </sci-fi-accordion-card>`;
        })}
        <sci-fi-button
          has-border
          icon="mdi:plus"
          @button-click=${this.__addElement}
        ></sci-fi-button>
      </section>
    `;
  }

  __renderEntity(id, entity) {
    return html` <section>
      <h1>
        <span>${getIcon('mdi:selection-ellipse-arrow-inside')}</span>Entity
        (required)
      </h1>
      <sci-fi-toggle
        label="Standalone entity?"
        element-id="${id}"
        ?checked=${entity.standalone}
        @toggle-change=${this.__toggle}
      ></sci-fi-toggle>
      ${entity.standalone
        ? this.__renderStandAlone(id, entity)
        : this.__renderKind(id, entity)}
    </section>`;
  }

  __renderStandAlone(id, entity) {
    return html`
      <sci-fi-dropdown-entity-input
        label="Entity (required)"
        element-id="${id}"
        kind="entity"
        value="${entity.entity}"
        items="${JSON.stringify(Object.values(this._entity_kind).flat())}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
    `;
  }

  __renderKind(id, entity) {
    return html`
      <sci-fi-dropdown-input
        label="Entity kind (required)"
        value=${entity.entity_kind}
        element-id="${id}"
        kind="entity_kind"
        items="${JSON.stringify(Object.keys(this._entity_kind))}"
        @select-item=${this.__update}
        @input-update=${this.__update}
      ></sci-fi-dropdown-input>
      <sci-fi-dropdown-multi-entities-input
        label="Entities to exclude (optionnal)"
        element-id="${id}"
        kind="entity_to_exclude"
        values="${JSON.stringify(entity.entity_to_exclude)}"
        items="${JSON.stringify(this._entity_kind[entity.entity_kind])}"
        ?disabled=${!entity.entity_kind}
        @input-update=${this.__update}
      ></sci-fi-dropdown-multi-entities-input>
    `;
  }

  __renderAppearance(id, entity) {
    return html` <section>
      <h1><span>${getIcon('mdi:palette-outline')}</span>Appearance</h1>
      <sci-fi-input
        label="Name"
        value=${entity.name}
        element-id="${id}"
        kind="name"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-dropdown-icon-input
        label="Active icon (required)"
        element-id="${id}"
        kind="active_icon"
        icon=${entity.active_icon}
        value=${entity.active_icon}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
      <sci-fi-dropdown-icon-input
        label="Inactive icon (required)"
        element-id="${id}"
        kind="inactive_icon"
        icon=${entity.inactive_icon}
        value=${entity.inactive_icon}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
    </section>`;
  }

  __renderTechnical(id, entity) {
    return html`
      <section>
        <h1><span>${getIcon('mdi:cog-outline')}</span>Technical</h1>
        <sci-fi-chips-input
          label="State on (required)"
          element-id="${id}"
          kind="state_on"
          values="${JSON.stringify(entity.state_on)}"
          @input-update=${this.__update}
        ></sci-fi-chips-input>
        <sci-fi-input
          label="Error state (optionnal)"
          element-id="${id}"
          kind="state_error"
          @input-update=${this.__update}
          value="${entity.state_error}"
        ></sci-fi-input>
        <sci-fi-input
          label="Link (optionnal)"
          element-id="${id}"
          kind="link"
          @input-update=${this.__update}
          value="${entity.link}"
        ></sci-fi-input>
      </section>
    `;
  }

  __toggle(e) {
    if (e.detail.id == 'weather') {
      e.detail['kind'] = 'activate';
      e.detail['type'] = 'update';
    } else {
      e.detail['kind'] = 'standalone';
      e.detail['type'] = 'update';
    }
    this.__update(e);
  }

  __addElement(e) {
    let newConfig = this.__getNewConfig();
    newConfig.tiles.push(this._empty_config);
    this.__dispatchChange(e, newConfig);
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    const elemmentId = e.detail.id;
    console.log(e);
    if (e.type == 'accordion-delete') {
      newConfig.tiles.splice(elemmentId, 1);
    } else if (!['header_message', 'weather'].includes(elemmentId)) {
      switch (e.detail.type) {
        case 'add':
          newConfig.tiles[elemmentId][e.detail.kind].push(e.detail.value);
          break;
        case 'remove':
          newConfig.tiles[elemmentId][e.detail.kind].splice(e.detail.value, 1);
          break;
        default:
          // Update
          if (e.detail.kind == 'entity_to_exclude') {
            if (!newConfig.tiles[elemmentId][e.detail.kind])
              newConfig.tiles[elemmentId][e.detail.kind] = [];
            newConfig.tiles[elemmentId][e.detail.kind].push(e.detail.value);
          } else {
            newConfig.tiles[elemmentId][e.detail.kind] = e.detail.value;
          }
          break;
      }
      newConfig.tiles[elemmentId].state_on = Array.from(
        new Set(newConfig.tiles[elemmentId].state_on.sort())
      );
      newConfig.tiles[elemmentId].entity_to_exclude = Array.from(
        new Set(newConfig.tiles[elemmentId].entity_to_exclude)
      );
    } else {
      if (elemmentId == 'header_message') {
        newConfig[elemmentId] = e.detail.value;
      } else {
        // Update data
        newConfig[elemmentId][e.detail.kind] = e.detail.value;
        if (e.detail.kind == 'activate' && !newConfig[elemmentId]['sun_entity'])
          newConfig[elemmentId]['sun_entity'] = 'sun.sun';
      }
    }
    this.__dispatchChange(e, newConfig);
  }
}
