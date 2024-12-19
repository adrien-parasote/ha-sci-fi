import {LitElement, html} from 'lit';
import {isEqual} from 'lodash-es';

import '../../helpers/card/tiles.js';
import common_style from '../../helpers/common_style.js';
import '../../helpers/entities/person.js';
import {getIcon, getWeatherIcon} from '../../helpers/icons/icons.js';
import {LANDSCAPE_DISPLAY, PACKAGE, PORTRAIT_DISPLAY} from './const.js';
import {SciFiHexaTilesEditor} from './editor.js';
import style from './style.js';

export class SciFiHexaTiles extends LitElement {
  static get styles() {
    return [common_style, style];
  }

  _hass; // private
  _display; // private

  static get properties() {
    return {
      _config: {type: Object},
      _entities: {type: Array},
      _user: {type: Object},
      _weather: {type: Object},
    };
  }

  constructor() {
    super();
    // Define first orientation
    this.__defineRowsCols(
      window.matchMedia('(orientation: landscape)').matches
    );
    // Add listener
    window
      .matchMedia('(orientation: landscape)')
      .addEventListener('change', (e) => {
        this.__defineRowsCols(e.matches);
        this.requestUpdate();
      });
    window.addEventListener('resize', (e) => {
      this.__defineRowsCols(
        window.matchMedia('(orientation: landscape)').matches
      );
      this.requestUpdate();
    });
  }

  __defineRowsCols(landscape) {
    this._display = landscape ? LANDSCAPE_DISPLAY : PORTRAIT_DISPLAY;
  }

  __validateConfig(config) {
    // Default value
    if (!config.header) {
      config['header'] = {message: 'Welcome'};
    }

    //validate Weather
    if (!config.weather) {
      config['weather'] = {
        activate: false,
        sun_entity: null,
        weather_entity: null,
        link: null,
      };
    } else {
      if (config.weather.activate) {
        if (!config.weather.sun_entity)
          throw new Error('You need to define a sun entity');
        if (!config.weather.weather_entity)
          throw new Error('You need to define a weather entity');
      }
    }

    // Validate tiles
    if (!config.tiles) {
      throw new Error('You need to define a tiles list entry');
    }
    config.tiles.map((tile) => {
      if (!tile.standalone) {
        if (!tile.entity_kind)
          throw new Error('You need to define an entity kind (ex: light)');
        if (!tile.entity_to_exclude) tile.entity_to_exclude = [];
      } else {
        if (!tile.entity)
          throw new Error('You need to define an entity (ex: sensor.light)');
        tile.entity_kind = null;
        tile.entity_to_exclude = [];
      }
      if (!tile.state_on || tile.state_on.length < 1)
        throw new Error(
          'You need to define an entity kind state active list (ex: ["on"])'
        );

      // Default value
      if (!tile.active_icon) tile.active_icon = 'mdi:ufo-outline';
      if (!tile.inactive_icon) tile.inactive_icon = 'mdi:ufo-outline';
      if (!tile.name) tile.name = '';
      if (!tile.state_error) tile.state_error = null;
      if (!tile.link) tile.link = null;

      // Sort & filter states & entity to exclude
      tile.state_on = Array.from(new Set(tile.state_on.sort()));
      tile.entity_to_exclude = Array.from(
        new Set(tile.entity_to_exclude.sort())
      );
    });
    return config;
  }

  setConfig(config) {
    this._config = this.__validateConfig(JSON.parse(JSON.stringify(config)));
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

    // Extract entity for kind part
    const updatedEntity = this.__extractEntity();
    if (!this._entities || !isEqual(updatedEntity, this._entities)) {
      this._entities = updatedEntity;
    }
    // Extract person info
    const updatedUser = this._getConnectedUser();
    if (!this._user || !isEqual(updatedUser, this._user)) {
      this._user = updatedUser;
    }
    // Extract weather info if needed
    if (this._config.weather.activate) {
      const updatedWeather = this._getWeather();
      if (!this._weather || !isEqual(updatedWeather, this._weather)) {
        this._weather = updatedWeather;
      }
    }
  }

  _getWeather() {
    const sun_entity = this._hass.states[this._config.weather.sun_entity];
    const weather_entity =
      this._hass.states[this._config.weather.weather_entity];
    return {
      state: weather_entity.state,
      name: weather_entity.attributes.friendly_name,
      day: sun_entity.state == 'above_horizon',
    };
  }

  _getConnectedUser() {
    return Object.keys(this._hass.states)
      .filter((key) => key.startsWith('person.'))
      .reduce((cur, key) => {
        return this._hass.states[key].attributes.user_id == this._hass.user.id
          ? this._hass.states[key]
          : cur;
      }, {});
  }

  __extractEntity() {
    return this._config.tiles.map((c) => {
      const states = !c.standalone
        ? this.__extractHassKindState(c.entity_kind, c.entity_to_exclude)
        : [this._hass.states[c.entity].state];

      const state = this.__getEntityGlobalState(
        states,
        c.state_on,
        c.state_error
      );

      return {
        link: c.link,
        state: state,
        icon: state == 'on' ? c.active_icon : c.inactive_icon,
        title: c.name,
      };
    });
  }

  __extractHassKindState(kind, exclusion) {
    return Array.from(
      new Set(
        Object.keys(this._hass.states)
          .filter((key) => key.startsWith(kind))
          .filter((key) => !exclusion.includes(key))
          .reduce((cur, key) => {
            return cur.concat(this._hass.states[key].state);
          }, [])
      )
    ).sort();
  }

  __getEntityGlobalState(states, state_on, state_error = null) {
    if (state_error && states.includes(state_error)) {
      return 'error';
    } else {
      return state_on
        .map((s) => {
          return states.includes(s);
        })
        .includes(true)
        ? 'on'
        : 'off';
    }
  }

  render() {
    if (!this._hass || !this._config) return html``;
    const matrix = this.__getEntitiesMatrix();
    return html`
      <div class="container">
        <div class="header">
          <sci-fi-person
            entity-id="${this._user.entity_id}"
            state="${this._user.state}"
            picture="${this._user.attributes.entity_picture}"
          ></sci-fi-person>
          <div class="info">
            <div class="message">${this._config.header.message}</div>
            <div class="name">${this._user.attributes.friendly_name}</div>
          </div>
        </div>
        ${matrix.map((cols, i) => {
          return html` <div class="hexa-row">
            ${this.__renderColumns(cols, i & 1)}
          </div>`;
        })}
      </div>
    `;
  }

  __getEntitiesMatrix() {
    const neededRows = this.__defineRowNeeded();
    let matrix = [];
    let idx = 0;
    let addWeatherTile = this._config.weather.activate;
    // Rows Loop
    for (let r = 0; r < neededRows; r++) {
      // Cols Loop
      let cols = [];
      for (let c = 0; c < this._display.cols; c++) {
        if (
          c < this._display.gap ||
          c == this._display.cols - this._display.gap ||
          idx >= this._entities.length
        ) {
          cols.push(html`<sci-fi-hexa-tile></sci-fi-hexa-tile>`);
        } else {
          if (addWeatherTile && idx == 0) {
            // If weather tilee is activated, push it first
            cols.push(this.__getWeatherTile());
            addWeatherTile = false;
          } else {
            cols.push(this.__getActiveTile(this._entities[idx]));
            idx += 1;
          }
        }
      }
      matrix.push(cols);
    }
    return matrix;
  }

  __defineRowNeeded() {
    const tiles_per_row = this._display.cols - 2 * this._display.gap;
    const current_slots = tiles_per_row * this._display.min_rows;
    const entities_count = this._config.weather.activate
      ? this._entities.length + 1
      : this._entities.length;
    const requested_rows = Math.ceil(entities_count / tiles_per_row);
    return current_slots < entities_count
      ? requested_rows
      : this._display.min_rows;
  }

  __getWeatherTile() {
    const state = this._weather.day ? 'on' : 'off';
    return html`
      <sci-fi-hexa-tile
        id="weather-tile"
        active
        link=${this._config.weather.link}
        state=${state}
        title=${this._weather.name}
        class="state-${state}"
      >
        ${getWeatherIcon(this._weather.state, this._weather.day)}
      </sci-fi-hexa-tile>
    `;
  }

  __getActiveTile(entity) {
    return html`
      <sci-fi-hexa-tile
        active
        link=${entity.link}
        state=${entity.state}
        title=${entity.title}
        class="state-${entity.state}"
      >
        ${getIcon(entity.icon)}
      </sci-fi-hexa-tile>
    `;
  }

  __renderColumns(cols, odd = true) {
    return html`
      ${odd ? '' : html`<sci-fi-half-hexa-tile right></sci-fi-half-hexa-tile>`}
      ${cols.map((entity) => {
        return entity;
      })}
      ${!odd ? '' : html`<sci-fi-half-hexa-tile></sci-fi-half-hexa-tile>`}
    `;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }
  static getStubConfig() {
    return {
      header: {
        message: 'Welcome',
      },
      weather: {
        activate: false,
        sun_entity: 'sun.sun',
        weather_entity: null,
        link: null,
      },
      tiles: [
        {
          entity_kind: 'light',
          entity_to_exclude: [],
          active_icon: 'mdi:lightbulb-on-outline',
          inactive_icon: 'mdi:lightbulb-outline',
          name: 'Lights',
          state_on: ['on'],
          state_error: null,
          link: null,
        },
      ],
    };
  }
}

window.customElements.get(PACKAGE) ||
  window.customElements.define(PACKAGE, SciFiHexaTiles);

window.customElements.get(PACKAGE + '-editor') ||
  window.customElements.define(PACKAGE + '-editor', SciFiHexaTilesEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: PACKAGE,
  name: 'Sci-fi hexa tiles card',
  description:
    'Render sci-fi hexa tiles card with header and special weather tile if activated.',
});
