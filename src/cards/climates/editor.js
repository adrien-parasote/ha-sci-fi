import {html, nothing} from 'lit';

import {
  HASS_CLIMATE_PRESET_MODE_BOOST,
  HASS_CLIMATE_PRESET_MODE_COMFORT,
  HASS_CLIMATE_PRESET_MODE_COMFORT_1,
  HASS_CLIMATE_PRESET_MODE_COMFORT_2,
  HASS_CLIMATE_PRESET_MODE_ECO,
  HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION,
  STATE_CLIMATE_AUTO,
  STATE_CLIMATE_HEAT,
  STATE_CLIMATE_OFF,
} from '../../helpers/entities/climate/climate_const.js';
import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';
import editor_style from './style_editor.js';

export class SciFiClimatesEditor extends SciFiBaseEditor {
  static get styles() {
    return super.styles.concat([editor_style]);
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
    super.hass = hass;
    // initialized entity kind list
    if (hass.states) {
      if (!this._climates || this._climates.length == 0)
        this._climates = Object.keys(hass.states)
          .filter((key) => key.startsWith('climate.'))
          .map((key) => hass.states[key]);
    } else {
      this._climates = [];
    }
  }

  render() {
    if (!this._hass || !this._config) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">
          ${this.__renderAppearance()} ${this.__renderConfig()}
          ${this.__renderStatesModeAppearance('state')}
          ${this.__renderStatesModeAppearance('mode')}
        </div>
        <div class="editor ${this._edit}">${this.__renderCustomization()}</div>
      </div>
    `;
  }

  __renderAppearance() {
    return html` <section>
      <h1>
        <span><sci-fi-icon icon="mdi:page-layout-header"></sci-fi-icon></span
        >${this.getLabel('section-title-header')}
      </h1>
      <sci-fi-toggle
        label="${this.getLabel('text-switch-climate-global-turn-on_off')}"
        element-id="header_display"
        ?checked=${this._config.header.display}
        @toggle-change=${this.__update}
      ></sci-fi-toggle>
      <sci-fi-input
        class="${!this._config.header.display ? 'hide' : 'show'}"
        icon="mdi:cursor-text"
        label="${this.getLabel(
          'input-message-header-section-winter'
        )} ${this.getLabel('text-optionnal')}"
        value=${this._config.header.message_winter_state}
        element-id="header"
        kind="message_winter_state"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-dropdown-icon-input
        class="${!this._config.header.display ? 'hide' : ''}"
        label="${this.getLabel(
          'input-icon-header-section-winter'
        )} ${this.getLabel('text-optionnal')}"
        element-id="header"
        kind="icon_winter_state"
        icon=${this._config.header.icon_winter_state}
        value=${this._config.header.icon_winter_state}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
      <sci-fi-input
        class="${!this._config.header.display ? 'hide' : ''}"
        icon="mdi:cursor-text"
        label="${this.getLabel(
          'input-message-header-section-summer'
        )} ${this.getLabel('text-optionnal')}"
        value=${this._config.header.message_summer_state}
        element-id="header"
        kind="message_summer_state"
        @input-update=${this.__update}
      ></sci-fi-input>
      <sci-fi-dropdown-icon-input
        class="${!this._config.header.display ? 'hide' : ''}"
        label="${this.getLabel(
          'input-icon-header-section-summer'
        )} ${this.getLabel('text-optionnal')}"
        element-id="header"
        kind="icon_summer_state"
        icon=${this._config.header.icon_summer_state}
        value=${this._config.header.icon_summer_state}
        @input-update=${this.__update}
      ></sci-fi-dropdown-icon-input>
    </section>`;
  }

  __renderConfig() {
    return html` <section>
      <h1>
        <span><sci-fi-icon icon="mdi:tune-vertical-variant"></sci-fi-icon></span
        >${this.getLabel('section-title-settings')}
      </h1>
      <sci-fi-dropdown-multi-entities-input
        label="${this.getLabel('input-entities-to-exclude')} ${this.getLabel(
          'text-optionnal'
        )}"
        element-id="entities_to_exclude"
        kind="entities_to_exclude"
        .values="${this._config.entities_to_exclude}"
        .items="${this._climates}"
        @input-update=${this.__update}
      ></sci-fi-dropdown-multi-entities-input>
    </section>`;
  }

  __renderStatesModeAppearance(kind) {
    const data = {
      state: {
        icon: 'mdi:state-machine',
        data: [STATE_CLIMATE_HEAT, STATE_CLIMATE_OFF, STATE_CLIMATE_AUTO],
        title:
          this.getLabel('section-title-state') +
          ' ' +
          this.getLabel('text-required'),
      },
      mode: {
        icon: 'mdi:auto-mode',
        data: [
          HASS_CLIMATE_PRESET_MODE_FROST_PROTECTION,
          HASS_CLIMATE_PRESET_MODE_ECO,
          HASS_CLIMATE_PRESET_MODE_COMFORT,
          HASS_CLIMATE_PRESET_MODE_COMFORT_1,
          HASS_CLIMATE_PRESET_MODE_COMFORT_2,
          HASS_CLIMATE_PRESET_MODE_BOOST,
        ],
        title:
          this.getLabel('section-title-mode') +
          ' ' +
          this.getLabel('text-required'),
      },
    };
    return html` <sci-fi-accordion-card
      title="${data[kind].title}"
      icon="${data[kind].icon}"
    >
      ${data[kind].data.map((d) => this.__renderStateModeRow(kind, d))}
    </sci-fi-accordion-card>`;
  }

  __renderStateModeRow(kind, state) {
    const data = {
      state: {
        icon: this._config.state_icons[state],
        color: this._config.state_colors[state],
      },
      mode: {
        icon: this._config.mode_icons[state],
        color: this._config.mode_colors[state],
      },
    };
    return html`
      <div class="state-mode-row">
        <sci-fi-input
          label="${this.getLabel('input-icon-' + state)} ${this.getLabel(
            'text-required'
          )}"
          value=${data[kind].icon}
          icon=${data[kind].icon}
          disabled
          style="--input-icon-color:${data[kind].color};"
        ></sci-fi-input>
        <sci-fi-button
          icon="sci:edit"
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
    if (!this._custom_info) return nothing;
    const state = this._custom_info.state;
    const kind = this._custom_info.kind;
    let icon;
    let color;
    if (kind == 'state') {
      icon = this._config.state_icons[state];
      color = this._config.state_colors[state];
    } else {
      icon = this._config.mode_icons[state];
      color = this._config.mode_colors[state];
    }
    return html`
      <div class="head">
        <sci-fi-button
          icon="mdi:chevron-left"
          @button-click=${this.__endCustomization}
        ></sci-fi-button>
        <span
          >${this.getLabel(
            ['edit-section', kind, state, 'title'].join('-')
          )}</span
        >
      </div>
      <sci-fi-dropdown-icon-input
        label="${this.getLabel('input-icon-' + state)} ${this.getLabel(
          'text-required'
        )}"
        element-id="${kind == 'state' ? 'state_icons' : 'mode_icons'}"
        kind="${state}"
        icon=${icon}
        value=${icon}
        @input-update=${this.__update}
        style="--input-icon-color:${color};"
      ></sci-fi-dropdown-icon-input>
      <sci-fi-color-picker
        label="${this.getLabel('input-color-' + state)} ${this.getLabel(
          'text-required'
        )}"
        element-id="${kind == 'state' ? 'state_colors' : 'mode_colors'}"
        kind="${state}"
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
    if (e.detail.id == 'header_display') {
      newConfig.header.display = e.detail.value;
    } else {
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
    }
    this.__dispatchChange(e, newConfig);
  }
}
