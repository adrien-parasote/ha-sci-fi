import {html, nothing} from 'lit';
import {isEqual} from 'lodash-es';

import {Person} from '../../helpers/entities/person.js';
import {SciFiBaseCard, buildStubConfig} from '../../helpers/utils/base-card.js';
import configMetadata from './config-metadata.js';
import {LANDSCAPE_DISPLAY, PACKAGE, PORTRAIT_DISPLAY} from './const.js';
import style from './style.js';

export class SciFiHexaTiles extends SciFiBaseCard {
  static get styles() {
    return super.styles.concat([style]);
  }

  _configMetadata = configMetadata;
  _display; // private
  _user;

  static get properties() {
    return {
      _config: {type: Object},
      _entities: {type: Array},
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

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return; // Can't assume setConfig is called before hass is set

    // Extract person entity
    const user = new Person(hass);
    if (!this._user || !isEqual(user, this._user)) {
      this._user = user;
    }

    // Extract entity for kind part
    const updatedEntity = this.__extractEntity();
    if (!this._entities || !isEqual(updatedEntity, this._entities)) {
      this._entities = updatedEntity;
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
    const sun_entity = this._hass.states['sun.sun'];
    const weather_entity =
      this._hass.states[this._config.weather.weather_entity];
    const weather_alert_state = this._config.weather.weather_alert_entity
      ? this._hass.states[this._config.weather.weather_alert_entity]
        ? this._hass.states[this._config.weather.weather_alert_entity].state
        : null
      : null;

    //Define state if possible
    let alert = null;
    if (weather_alert_state) {
      const alert_extract = [
        'state_green',
        'state_yellow',
        'state_orange',
        'state_red',
      ].filter((state) => this._config.weather[state] == weather_alert_state);
      alert = alert_extract.length > 0 ? alert_extract[0].split('_')[1] : null;
    }
    return {
      state: weather_entity.state,
      name: weather_entity.attributes.friendly_name,
      day: sun_entity.state == 'above_horizon',
      alert: alert,
    };
  }

  __extractEntity() {
    return this._config.tiles
      .filter((t) => t.visibility.includes(this._user.id))
      .map((c) => {
        // Get entities
        var entities = this.__defineEntities(c);
        // Check entities availability
        var state = c.state_error;
        var icon = 'mdi:alert-circle';
        if (this.__entitiesAvailability(entities)) {
          state = this.__getEntityGlobalState(
            entities,
            c.state_on,
            c.state_error
          );
          icon = state == 'on' ? c.active_icon : c.inactive_icon;
        }

        return {
          link: c.link,
          state: state,
          icon: icon,
          title: c.name,
        };
      });
  }

  __defineEntities(c) {
    if (c.standalone) return [c.entity];
    return Array.from(
      new Set(
        Object.keys(this._hass.states)
          .filter((key) => key.startsWith(c.entity_kind))
          .filter((key) => !c.entities_to_exclude.includes(key))
      )
    ).sort();
  }

  __entitiesAvailability(entities) {
    if (entities.length == 0) return false;
    const available = [
      ...new Set(
        entities.map((e) => {
          return this._hass.states[e] != undefined;
        })
      ),
    ];
    return available.length > 1 ? false : available[0];
  }

  __getEntityGlobalState(entities, state_on, state_error = null) {
    const states = entities.reduce((cur, key) => {
      return cur.concat(this._hass.states[key].state);
    }, []);

    if (state_error && states.includes(state_error)) {
      return 'error';
    } else {
      return state_on.map((s) => states.includes(s)).includes(true)
        ? 'on'
        : 'off';
    }
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    const matrix = this.__getEntitiesMatrix();
    return html`
      <div class="container">
        <div class="header">
          <sci-fi-person .user="${this._user}" display-state></sci-fi-person>
          <div class="info">
            <div class="message">${this._config.header_message}</div>
            <div class="name">${this._user.friendly_name}</div>
          </div>
        </div>
        ${matrix.map(
          (cols, i) =>
            html` <div class="hexa-row">
              ${this.__renderColumns(cols, i & 1)}
            </div>`
        )}
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
    const alert = this._weather.alert ? this._weather.alert : '';
    return html`
      <a href="${this._config.weather.link}">
        <sci-fi-hexa-tile
          id="weather-tile"
          active-tile
          state=${state}
          class="state-${state} ${alert}"
        >
          <div class="item-icon">
            <sci-fi-weather-icon
              icon=${[
                this._weather.state,
                this._weather.day ? 'day' : 'night',
              ].join('-')}
            ></sci-fi-weather-icon>
          </div>
          <div class="item-name">${this._weather.name}</div>
        </sci-fi-hexa-tile>
      </a>
    `;
  }

  __getActiveTile(entity) {
    return html`
      <a href="${entity.link}">
        <sci-fi-hexa-tile
          active-tile
          state=${entity.state}
          class="state-${entity.state}"
        >
          <div class="item-icon">
            <sci-fi-icon icon=${entity.icon}></sci-fi-icon>
          </div>
          <div class="item-name">${entity.title}</div>
        </sci-fi-hexa-tile>
      </a>
    `;
  }

  __renderColumns(cols, odd = true) {
    return html`
      ${odd
        ? nothing
        : html`<sci-fi-half-hexa-tile right></sci-fi-half-hexa-tile>`}
      ${cols.map((entity) => entity)}
      ${!odd ? nothing : html`<sci-fi-half-hexa-tile></sci-fi-half-hexa-tile>`}
    `;
  }

  /**** DEFINE CARD EDITOR ELEMENTS ****/
  static getConfigElement() {
    return document.createElement(PACKAGE + '-editor');
  }

  static getStubConfig() {
    return buildStubConfig(configMetadata);
  }
}
