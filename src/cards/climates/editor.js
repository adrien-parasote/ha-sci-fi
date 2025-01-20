import {css, html} from 'lit';

import {SciFiBaseEditor} from '../../helpers/card/base_editor.js';
import common_style from '../../helpers/common_style.js';
import editor_common_style from '../../helpers/editor_common_style.js';
import '../../helpers/form/form.js';
import {getIcon} from '../../helpers/icons/icons.js';
import editor_style from './style_editor.js';

export class SciFiClimatesEditor extends SciFiBaseEditor {
  static get styles() {
    return [common_style, editor_common_style, editor_style];
  }

  _climates; // Privates
  _edit = false;

  static get properties() {
    return {
      _config: {type: Object},
      _custom_info: {type: Object},
    };
  }

  set hass(hass) {
    this._hass = hass;
    // initialized entity kind list
    if (hass.states) {
      if (!this._climates || this._climates.length == 0)
        this._climates = Object.keys(hass.states)
          .filter((key) => key.startsWith('climate.'))
          .map((key) => {
            return hass.states[key];
          });
    } else {
      this._climates = [];
    }
  }

  render() {
    if (!this._hass || !this._config) return html``;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">
          ${this.__renderConfig()} ${this.__renderStatesModeAppearance('state')}
          ${this.__renderStatesModeAppearance('mode')}
        </div>
        <div class="editor ${this._edit}">${this.__renderCustomization()}</div>
      </div>
    `;
  }

  __renderConfig() {
    return html` <section>
      <h1>
        <span>${getIcon('mdi:tune-vertical-variant')}</span>Settings (optionnal)
      </h1>
      <sci-fi-input
        label="Unit (optionnal)"
        value=${this._config.unit}
        element-id="unit"
        kind="unit"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-dropdown-multi-entities-input
        label="Entities to exclude (optionnal)"
        element-id="entities_to_exclude"
        kind="entities_to_exclude"
        values="${JSON.stringify(this._config.entities_to_exclude)}"
        items="${JSON.stringify(this._climates)}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-multi-entities-input>
    </section>`;
  }

  __capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  __renderStatesModeAppearance(kind) {
    const icon = kind == 'state' ? 'mdi:state-machine' : 'mdi:auto-mode';
    const data =
      kind == 'state'
        ? ['auto', 'off', 'heat']
        : ['none', 'frost_protection', 'eco', 'comfort', "comfort-1", "comfort-2", "auto", "boost"];
    return html` 
        <sci-fi-accordion-card
          title="${kind} (optionnal)"
          icon="${icon}"
        >
          ${data.map((d) => {
            return this.__renderStateModeRow(kind, d);
          })}
        </sci-fi-accordion-card>`;
  }

  __renderStateModeRow(kind, state) {
    const icon =
      kind == 'state'
        ? this._config.state_icons[state]
        : this._config.mode_icons[state];
    const color =
      kind == 'state'
        ? this._config.state_colors[state]
        : this._config.mode_colors[state];
    return html`
      <div class="state-mode-row">
        <sci-fi-input
          label="Icon ${state.replace('_', ' ')} (optionnal)"
          value=${icon}
          icon=${icon}
          disabled
          style="--input-icon-color:${color};"
        ></sci-fi-input>
        <sci-fi-button
          icon="mdi:pencil-outline"
          @button-click="${(e) => this.__editStateMode(kind, state)}"
        ></sci-fi-button>
      </div>
    `;
  }

  __editStateMode(kind, state) {
    this._custom_info = {
      kind: kind,
      state: state,
    };
    this._edit = !this._edit;
  }

  __renderCustomization() {
    if (!this._custom_info) return html``;
    const state = this._custom_info.state;
    const icon =
      this._custom_info.kind == 'state'
        ? this._config.state_icons[state]
        : this._config.mode_icons[state];
    const color =
      this._custom_info.kind == 'state'
        ? this._config.state_colors[state]
        : this._config.mode_colors[state];

    return html`
      <div class="head">
        <sci-fi-button
          icon="mdi:chevron-left"
          @button-click=${this.__endCustomization}
        ></sci-fi-button>
        <span
          >Edit ${this.__capitalizeFirstLetter(this._custom_info.kind)}
          ${state.replace('_', ' ')}</span
        >
      </div>
      <sci-fi-dropdown-icon-input
        label="${this._custom_info.state.replace('_', ' ')} icon (optionnal)"
        element-id="${this._custom_info.kind == 'state'
          ? 'state_icons'
          : 'mode_icons'}"
        kind="${this._custom_info.state}"
        icon=${icon}
        value=${icon}
        @input-update=${this.__update}
        style="--input-icon-color:${color};"
      ></sci-fi-dropdown-icon-input>

      <sci-fi-color-picker
        label="${this._custom_info.state.replace('_', ' ')} color (optionnal)"
        element-id="${this._custom_info.kind == 'state'
          ? 'state_colors'
          : 'mode_colors'}"
        kind="${this._custom_info.state}"
        icon="mdi:format-color-fill"
        value=${color}
        @input-update=${this.__update}
        style="--input-icon-color:${color};"
      >
      </sci-fi-color-picker>
    `;
  }

  __endCustomization() {
    this._edit = !this._edit;
    this._custom_info = null;
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    switch (e.detail.type) {
      case 'remove':
        newConfig[e.detail.kind].splice(e.detail.value, 1);
        break;
      default:
        // Update
        if (e.detail.kind == 'entities_to_exclude') {
          newConfig[e.detail.kind].push(e.detail.value);
        } else {
          if (e.detail.id == e.detail.kind) {
            newConfig[e.detail.id] = e.detail.value;
          } else {
            newConfig[e.detail.id][e.detail.kind] = e.detail.value;
          }
        }
        break;
    }
    this.__dispatchChange(e, newConfig);
  }

  /*
  state_icons: {
    auto: 'sci:radiator-auto',
    off: 'sci:radiator-off',
    heat: 'sci:radiator-heat',
  },
  state_colors: {
    auto: '#69d4fb',
    off: '#6c757d',
    heat: '#ff7f50',
  },
  mode_icons: {
    frost_protection: 'mdi:snowflake',
    eco: 'mdi:leaf',
    comfort: 'mdi:sun-thermometer-outline',
  },
  mode_colors: {
    frost_protection: '#acd5f3',
    eco: '#4fe38b',
    comfort: '#ffff8f',
  },
  */
}
