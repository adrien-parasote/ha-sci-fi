import {html, nothing} from 'lit';

import {User} from '../../helpers/entities/person.js';
import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';
import editor_style from './style_editor.js';

export class SciFiHexaTilesEditor extends SciFiBaseEditor {
  _entity_kind; // list from hass
  _people;

  static get styles() {
    return super.styles.concat([editor_style]);
  }

  set hass(hass) {
    super.hass = hass;
    // initialized entity kind list
    if (hass.states) {
      if (!this._entity_kind || this._entity_kind.length == 0)
        this._entity_kind = Object.keys(hass.states).reduce((cur, key) => {
          const k = key.split('.')[0];
          if (cur[k]) {
            cur[k].push(hass.states[key]);
          } else {
            cur[k] = [hass.states[key]];
          }
          return cur;
        }, {});

      if (!this._people) {
        // Init once
        this._people = Object.keys(hass.states)
          .filter((id) => id.startsWith('person.'))
          .map((id) => new User(id, hass));
      }
    } else {
      this._entity_kind = [];
    }
  }

  render() {
    if (!this._hass || !this._config) return nothing;
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
        <h1>
          <span><sci-fi-icon icon="mdi:page-layout-header"></sci-fi-icon></span>
          ${this.getLabel('section-title-header')}
        </h1>
        <sci-fi-input
          icon="mdi:cursor-text"
          label="${this.getLabel('input-message-text')} ${this.getLabel(
            'text-optionnal'
          )}"
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
        <h1>
          <span><sci-fi-icon icon="mdi:theme-light-dark"></sci-fi-icon></span>
          ${this.getLabel('section-title-weather')}
        </h1>
        <sci-fi-toggle
          label="${this.getLabel('text-switch-hexa-add-weather-tile')}"
          element-id="weather"
          ?checked=${this._config.weather.activate}
          @toggle-change=${this.__toggle}
        ></sci-fi-toggle>
        ${this._config.weather.activate
          ? this.__renderWeatherEntities()
          : nothing}
      </section>
    `;
  }

  __renderWeatherEntities() {
    return html`
      <sci-fi-dropdown-entity-input
        label="${this.getLabel('input-weather-entity')} ${this.getLabel(
          'text-required'
        )}"
        element-id="weather"
        kind="weather_entity"
        value="${this._config.weather.weather_entity}"
        .items="${this._entity_kind['weather'].flat()}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
      <sci-fi-input
        icon="mdi:link-edit"
        label="${this.getLabel('input-link')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${this._config.weather.link}
        element-id="weather"
        kind="link"
        @input-update=${this.__update}
      ></sci-fi-input>
    `;
  }

  __renderTiles() {
    return html`
      ${this._config.tiles.map(
        (entity, id) =>
          html`<sci-fi-accordion-card
            element-id=${id}
            title="${this.getLabel('section-title-tile')} ${id + 1}"
            icon="mdi:hexagon-slice-6"
            ?deletable=${this._config.tiles.length > 1}
            @accordion-delete=${this.__update}
            ?open=${id == 0}
          >
            ${this.__renderEntity(id, entity)}
            ${this.__renderAppearance(id, entity)}
            ${this.__renderTechnical(id, entity)}
            ${this.__renderVisibility(id, entity)}
          </sci-fi-accordion-card>`
      )}
      <sci-fi-button
        has-border
        icon="mdi:plus"
        @button-click=${this.__addElement}
      ></sci-fi-button>
    `;
  }

  __renderEntity(id, entity) {
    return html` <section>
      <h1>
        <span
          ><sci-fi-icon
            icon="mdi:selection-ellipse-arrow-inside"
          ></sci-fi-icon></span
        >${this.getLabel('section-title-entity')}
      </h1>
      <sci-fi-toggle
        label="${this.getLabel('text-switch-hexa-standalone')}"
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
        label="${this.getLabel('section-title-entity')} ${this.getLabel(
          'text-required'
        )}"
        element-id="${id}"
        kind="entity"
        value="${entity.entity}"
        .items="${Object.values(this._entity_kind).flat()}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-entity-input>
    `;
  }

  __renderKind(id, entity) {
    return html`
      <sci-fi-dropdown-input
        label="${this.getLabel('input-entity-kind')} ${this.getLabel(
          'text-required'
        )}"
        value=${entity.entity_kind}
        element-id="${id}"
        kind="entity_kind"
        .items="${Object.keys(this._entity_kind)}"
        @select-item=${this.__update}
        @input-update=${this.__update}
      ></sci-fi-dropdown-input>
      <sci-fi-dropdown-multi-entities-input
        label="${this.getLabel('input-entities-to-exclude')} ${this.getLabel(
          'text-optionnal'
        )}"
        element-id="${id}"
        kind="entities_to_exclude"
        .values="${entity.entities_to_exclude}"
        .items="${this._entity_kind[entity.entity_kind]}"
        ?disabled=${!entity.entity_kind}
        @input-update=${this.__update}
      ></sci-fi-dropdown-multi-entities-input>
    `;
  }

  __renderAppearance(id, entity) {
    return html` <section>
      <h1>
        <span><sci-fi-icon icon="mdi:palette-outline"></sci-fi-icon></span
        >${this.getLabel('section-title-appearance')}
      </h1>
      <sci-fi-input
        label="${this.getLabel('input-name')} ${this.getLabel(
          'text-optionnal'
        )}"
        value=${entity.name}
        element-id="${id}"
        kind="name"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-active-icon')} ${this.getLabel(
          'text-optionnal'
        )}"
        element-id="${id}"
        kind="active_icon"
        icon=${entity.active_icon}
        value=${entity.active_icon}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-inactive-icon')} ${this.getLabel(
          'text-optionnal'
        )}"
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
        <h1>
          <span><sci-fi-icon icon="mdi:cog-outline"></sci-fi-icon></span
          >${this.getLabel('section-title-technical')}
        </h1>
        <sci-fi-chips-input
          label="${this.getLabel('input-states-on')} ${this.getLabel(
            'text-required'
          )}"
          element-id="${id}"
          kind="state_on"
          .values="${entity.state_on}"
          @input-update=${this.__update}
        ></sci-fi-chips-input>
        <sci-fi-input
          icon="mdi:alert-circle"
          label="${this.getLabel('input-state-error')} ${this.getLabel(
            'text-optionnal'
          )}"
          element-id="${id}"
          kind="state_error"
          @input-update=${this.__update}
          value="${entity.state_error}"
        ></sci-fi-input>
        <sci-fi-input
          icon="mdi:link-edit"
          label="${this.getLabel('input-link')} ${this.getLabel(
            'text-optionnal'
          )}"
          element-id="${id}"
          kind="link"
          @input-update=${this.__update}
          value="${entity.link}"
        ></sci-fi-input>
      </section>
    `;
  }

  __renderVisibility(id, entity) {
    return html`
      <section>
        <h1>
          <span><sci-fi-icon icon="mdi:eye-outline"></sci-fi-icon></span
          >${this.getLabel('section-title-visibility')}
        </h1>
        <div class="people">
          ${this._people.map((user) => {
            return html`
              <div class="people-row">
                <sci-fi-person .user="${user}"></sci-fi-person>
                <div>${user.friendly_name}</div>
                <sci-fi-button
                  icon="${this._isVisible(entity, user)
                    ? 'mdi:eye-outline'
                    : 'mdi:eye-off-outline'}"
                  @button-click="${(e) =>
                    this.__updateVisibility(e, id, user.id)}"
                ></sci-fi-button>
              </div>
            `;
          })}
        </div>
      </section>
    `;
  }

  _isVisible(entity, user) {
    // Manage version update
    if (entity.visibility == null || entity.visibility.length == 0)
      return false;
    return entity.visibility.includes(user.id);
  }

  __updateVisibility(e, id, user_id) {
    let newConfig = this.__getNewConfig();
    // Manage version update
    if (newConfig.tiles[id].visibility == null)
      newConfig.tiles[id].visibility = [];

    if (newConfig.tiles[id].visibility.includes(user_id)) {
      // remove user
      newConfig.tiles[id].visibility = newConfig.tiles[id].visibility.filter(
        (e) => e !== user_id
      );
    } else {
      // Add user
      newConfig.tiles[id].visibility.push(user_id);
    }
    this.__dispatchChange(e, newConfig);
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

  __getEmptyConfig() {
    return {
      entity_kind: 'light',
      entities_to_exclude: [],
      active_icon: 'mdi:lightbulb-on-outline',
      inactive_icon: 'mdi:lightbulb-outline',
      name: 'Lights',
      state_on: ['on'],
      state_error: null,
      link: null,
      visibility: [],
    };
  }

  __addElement(e) {
    let newConfig = this.__getNewConfig();
    newConfig.tiles.push(this.__getEmptyConfig());
    this.__dispatchChange(e, newConfig);
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    const elemmentId = e.detail.id;
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
          if (e.detail.kind == 'entities_to_exclude') {
            if (!newConfig.tiles[elemmentId].entities_to_exclude)
              newConfig.tiles[elemmentId].entities_to_exclude = [];
            newConfig.tiles[elemmentId].entities_to_exclude.push(
              e.detail.value
            );
          } else {
            newConfig.tiles[elemmentId][e.detail.kind] = e.detail.value;
          }
          break;
      }
      newConfig.tiles[elemmentId].state_on = Array.from(
        new Set(newConfig.tiles[elemmentId].state_on.sort())
      );
      newConfig.tiles[elemmentId].entities_to_exclude = Array.from(
        new Set(newConfig.tiles[elemmentId].entities_to_exclude)
      );
    } else {
      if (elemmentId == 'header_message') {
        newConfig[elemmentId] = e.detail.value;
      } else {
        // Update data
        newConfig[elemmentId][e.detail.kind] = e.detail.value;
      }
    }
    this.__dispatchChange(e, newConfig);
  }
}
