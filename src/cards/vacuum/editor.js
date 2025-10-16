import {html, nothing} from 'lit';

import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';
import editor_style from './style_editor.js';

export class SciFiVacuumEditor extends SciFiBaseEditor {
  _sensors;
  _vacuum_entities;
  _edit = false;

  static get styles() {
    return super.styles.concat([editor_style]);
  }

  static get properties() {
    return {
      _config: {type: Object},
      _shortcut_id: {type: String},
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return;
    if (!this._vacuum_entities)
      this._vacuum_entities = Object.values(hass.states).filter((e) =>
        e.entity_id.startsWith('vacuum')
      );
    if (this._config.entity) {
      this._sensors = Object.values(hass.entities)
        .filter(
          (e) =>
            e.entity_id.startsWith(
              'sensor.' + this._config.entity.split('.')[1]
            ) ||
            e.entity_id.startsWith(
              'camera.' + this._config.entity.split('.')[1]
            )
        )
        .map((e) => {
          return {
            entity_id: e.entity_id,
            attributes: {
              friendly_name: e.original_name,
            },
          };
        });
    } else {
      this._sensors = [];
    }
  }

  render() {
    if (!this._hass || !this._config || !this._vacuum_entities) return nothing;
    return html`
      <div class="card card-corner">
        <div class="container ${!this._edit}">
          ${this.__renderGeneral()} ${this.__renderDefaultActions()}
          ${this.__shortcuts()} ${this.__renderSensors()}
        </div>
        <div class="editor ${this._edit}">${this.__renderShortcutCustom()}</div>
      </div>
    `;
  }

  __renderGeneral() {
    return html`
      <section>
        <h1>
          <span
            ><sci-fi-icon
              icon="mdi:selection-ellipse-arrow-inside"
            ></sci-fi-icon></span
          >${this.getLabel('section-title-entity')}
          ${this.getLabel('text-required')}
        </h1>
        <sci-fi-dropdown-entity-input
          icon="mdi:robot-vacuum"
          label="${this.getLabel('input-entity-id')} ${this.getLabel(
            'text-required'
          )}"
          element-id="entity"
          kind="entity"
          value="${this._config.entity}"
          .items="${this._vacuum_entities}"
          @input-update=${this.__update}
        ></sci-fi-dropdown-entity-input>
      </section>
    `;
  }

  __renderDefaultActions() {
    let actions = {
      start: 'mdi:play-circle-outline',
      pause: 'mdi:pause-circle-outline',
      stop: 'mdi:stop-circle-outline',
      return_to_base: 'mdi:home-import-outline',
    };
    return html`
      <sci-fi-accordion-card
        title="${this.getLabel(
          'section-title-default-actions'
        )} ${this.getLabel('text-required')}"
        icon="mdi:gesture-tap-button"
      >
        ${Object.keys(actions).map((a) => {
          return html`
            <sci-fi-toggle
              label="${this.getLabel(
                'text-switch-action-' + a.replaceAll('_', '-')
              )}"
              icon="${actions[a]}"
              element-id="${a}"
              ?checked=${this._config[a]}
              ?disabled=${this._config.entity == null}
              @toggle-change=${this.__update}
            ></sci-fi-toggle>
          `;
        })}
      </sci-fi-accordion-card>
    `;
  }

  __shortcuts() {
    let service = this._config.shortcuts
      ? this._config.shortcuts.service
        ? this._config.shortcuts.service
        : ''
      : '';
    let shortcuts = this._config.shortcuts
      ? this._config.shortcuts.description
        ? this._config.shortcuts.description
        : []
      : [];
    return html`
      <sci-fi-accordion-card
        title="${this.getLabel('section-title-shortcuts')} ${this.getLabel(
          'text-optionnal'
        )}"
        icon="mdi:arrow-top-right-bold-box-outline"
      >
        <sci-fi-input
          label="${this.getLabel('input-service')} ${this.getLabel(
            'text-required'
          )}"
          icon="mdi:api"
          value=${service}
          element-id="service"
          kind="service"
          @input-update=${this.__updateShortcuts}
          ?disabled=${this._config.entity == null}
        ></sci-fi-input>
        <section>
          <h1>
            <span><sci-fi-icon icon="mdi:floor-plan"></sci-fi-icon></span
            >${this.getLabel('section-title-segments')}
          </h1>

          <div class="shortcuts">
            ${shortcuts.map((e, id) => {
              return html`
                <div class="shortcut">
                  <sci-fi-input
                    label="${this.getLabel('input-name')}"
                    icon="${e.icon}"
                    value=${e.name}
                    disabled
                  ></sci-fi-input>
                  <sci-fi-button
                    icon="sci:edit"
                    @button-click="${(e) => this.__editShortcut(id)}"
                    ?disabled=${this._config.entity == null}
                  >
                  </sci-fi-button>
                  <sci-fi-button
                    icon="mdi:delete-outline"
                    @button-click="${(e) => this.__deleteShortcut(e, id)}"
                    ?disabled=${this._config.entity == null}
                  >
                  </sci-fi-button>
                </div>
              `;
            })}
          </div>
          <sci-fi-button
            has-border
            icon="mdi:plus"
            @button-click=${this.__addShortcut}
            ?disabled=${this._config.entity == null}
          ></sci-fi-button>
        </section>
      </sci-fi-accordion-card>
    `;
  }

  __renderShortcutCustom() {
    if (!this._shortcut_id && this._shortcut_id != 0) return nothing;
    const shortcut = this._config.shortcuts.description[this._shortcut_id];
    return html`
      <div class="head">
        <sci-fi-button
          icon="mdi:chevron-left"
          @button-click=${this.__endShortcutEdit}
        ></sci-fi-button>
        <span>${this.getLabel('edit-section-title')} ${shortcut.name}</span>
      </div>
      <section>
        <h1>
          <span><sci-fi-icon icon="mdi:palette-outline"></sci-fi-icon></span
          >${this.getLabel('section-title-appearance')}
        </h1>

        <sci-fi-input
          icon="mdi:cursor-text"
          label="${this.getLabel('input-name')} ${this.getLabel(
            'text-optionnal'
          )}"
          value="${shortcut.name}"
          element-id="description"
          kind="name"
          @input-update=${this.__updateShortcuts}
        ></sci-fi-input>

        <sci-fi-dropdown-icon-input
          label="${this.getLabel('input-icon')}"
          element-id="description"
          kind="icon"
          icon=${shortcut.icon}
          value=${shortcut.icon}
          @input-update=${this.__updateShortcuts}
        ></sci-fi-dropdown-icon-input>
      </section>
      <section>
        <h1>
          <span><sci-fi-icon icon="mdi:floor-plan"></sci-fi-icon></span
          >${this.getLabel('section-title-segments')}
        </h1>
        <div class="segments">
          ${(shortcut.segments ? shortcut.segments : []).map((s, id) => {
            return html`
              <div class="segment">
                <sci-fi-input
                  type="number"
                  icon="mdi:counter"
                  label="${this.getLabel('input-segment')}"
                  value="${s}"
                  element-id="description"
                  kind="segment"
                  @input-update=${(e) => this.__updateSegment(e, id)}
                ></sci-fi-input>
                <sci-fi-button
                  icon="mdi:delete-outline"
                  @button-click="${(e) => this.__deleteSegment(e, id)}"
                >
                </sci-fi-button>
              </div>
            `;
          })}
          <sci-fi-button
            has-border
            icon="mdi:plus"
            @button-click=${this.__addSegment}
          ></sci-fi-button>
        </div>
      </section>
    `;
  }

  __updateSegment(e, id) {
    let newConfig = this.__getNewConfig();
    newConfig.shortcuts.description[this._shortcut_id].segments[id] = parseInt(
      e.detail.value
    );
    this.__dispatchChange(e, newConfig);
  }

  __addSegment(e) {
    let newConfig = this.__getNewConfig();
    if (!newConfig.shortcuts)
      newConfig['shortcuts'] = {service: null, description: []};
    if (!newConfig.shortcuts.description[this._shortcut_id].segments)
      newConfig.shortcuts.description[this._shortcut_id]['segments'] = [];
    newConfig.shortcuts.description[this._shortcut_id].segments.push(null);
    this.__dispatchChange(e, newConfig);
  }

  __deleteSegment(e) {
    let newConfig = this.__getNewConfig();
    newConfig.shortcuts.description[this._shortcut_id].segments.splice(e, 1);
    this.__dispatchChange(e, newConfig);
  }

  __endShortcutEdit() {
    this._edit = !this._edit;
    this._shortcut_id = null;
  }

  __deleteShortcut(e) {
    let newConfig = this.__getNewConfig();
    newConfig.shortcuts.description.splice(e, 1);
    this.__dispatchChange(e, newConfig);
  }

  __editShortcut(id) {
    this._shortcut_id = id;
    this._edit = true;
  }

  __addShortcut(e) {
    let newConfig = this.__getNewConfig();
    if (!newConfig.shortcuts)
      newConfig['shortcuts'] = {service: null, description: []};
    if (!newConfig.shortcuts.description)
      newConfig.shortcuts['description'] = [];
    newConfig.shortcuts.description.push({
      name: '',
      icon: 'mdi:broom',
      segments: [],
    });
    this.__dispatchChange(e, newConfig);
  }

  __renderSensors() {
    let newConfig = this.__sensorsDefaultValues(this.__getNewConfig());
    return html`<sci-fi-accordion-card
      title="${this.getLabel('section-title-sensor')} ${this.getLabel(
        'text-optionnal'
      )}"
      icon="mdi:cog-transfer-outline"
    >        ${Object.keys(newConfig.sensors).map((config_sensor_id) => {
      const sensor_id = newConfig.sensors[config_sensor_id];
      return html`
        <sci-fi-dropdown-entity-input
          icon="${config_sensor_id == 'camera'
            ? 'mdi:video-outline'
            : 'mdi:leak'}"
          label="${this.getLabel(
            'input-' + config_sensor_id.replaceAll('_', '-')
          )}  ${this.getLabel('text-optionnal')}"
          element-id="sensors"
          kind="${config_sensor_id}"
          value=${sensor_id}
          .items="${this._sensors}"
          @input-update=${this.__update}
          ?disabled=${this._config.entity == null}
        ></sci-fi-dropdown-entity-input>
      `;
    })}


      </div>
    </sci-fi-accordion-card>`;
  }

  __sensorsDefaultValues(config) {
    if (!config.sensors) config['sensors'] = {};
    [
      'current_clean_area',
      'current_clean_duration',
      'last_clean_area',
      'last_clean_duration',
      'camera',
    ].forEach((id) => {
      if (!config.sensors[id]) config.sensors[id] = '';
    });
    return config;
  }

  __updateShortcuts(e) {
    let newConfig = this.__getNewConfig();
    if (!newConfig.shortcuts)
      newConfig['shortcuts'] = {service: null, description: []};

    if (e.detail.id == 'service') {
      newConfig.shortcuts.service = e.detail.value;
    } else if (e.detail.id == 'description') {
      newConfig.shortcuts.description[this._shortcut_id][e.detail.kind] =
        e.detail.value;
    }
    this.__dispatchChange(e, newConfig);
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    if (e.detail.kind == e.detail.id) {
      newConfig[e.detail.id] = e.detail.value;
    } else if (e.detail.id == 'sensors') {
      if (!newConfig.sensors) config['sensors'] = {};
      newConfig.sensors[e.detail.kind] = e.detail.value;
    } else {
      newConfig[e.detail.id] = e.detail.value;
    }
    this.__dispatchChange(e, newConfig);
  }
}
