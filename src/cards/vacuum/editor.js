import {html, nothing} from 'lit';

import {SciFiBaseEditor} from '../../helpers/utils/base_editor.js';
import editor_style from './style_editor.js';

export class SciFiVacuumEditor extends SciFiBaseEditor {
  _vacuum_entities;
  _edit = false;
  _sensors = {
    battery: 'mdi:battery',
    current_clean_area: 'mdi:leak',
    current_clean_duration: 'mdi:leak',
    map: 'mdi:floor-plan',
    mop_intensite: 'mdi:water-opacity',
  };

  static get styles() {
    return super.styles.concat([editor_style]);
  }

  static get properties() {
    return {
      _config: {type: Object},
      _shortcut_id: {type: String},
      _active_vacuum: {type: Number},
    };
  }

  set hass(hass) {
    super.hass = hass;
    if (!this._config) return;
    if (!this._vacuum_entities)
      this._vacuum_entities = Object.values(hass.states).filter((e) =>
        e.entity_id.startsWith('vacuum')
      );
    if (!this._active_vacuum) this._active_vacuum = 0;
  }

  __emptyVacuum() {
    return {
      entity: null,
      sensors: {
        battery: null,
        mop_intensite: null,
        current_clean_area: null,
        current_clean_duration: null,
        map: null,
      },
      start: false,
      pause: false,
      stop: false,
      return_to_base: false,
      set_fan_speed: false,
      shortcuts: {},
    };
  }

  render() {
    if (!this._hass || !this._config || !this._vacuum_entities) return nothing;
    return html`
      <div class="card card-corner">
        <sci-fi-tabs-card
          count=${this._config.vacuums.length}
          active=${this._active_vacuum}
          @tab-add=${this.__addVacuum}
          @tab-select=${this.__selectVacuum}
        >
          <div class="container ${!this._edit}">
            ${this.__renderGeneral()} ${this.__renderDefaultActions()}
            ${this.__shortcuts()} ${this.__renderSensors()}
          </div>
          <div class="editor ${this._edit}">
            ${this.__renderShortcutCustom()}
          </div>
        </sci-fi-tabs-card>
      </div>
    `;
  }

  __addVacuum(e) {
    let newConfig = this.__getNewConfig();
    newConfig.vacuums.push(this.__emptyVacuum());
    this._active_vacuum += 1;
    this.__dispatchChange(e, newConfig);
  }

  __selectVacuum(e) {
    this._active_vacuum = e.detail.id;
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
          value="${this._config.vacuums[this._active_vacuum].entity}"
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
              ?checked=${this._config.vacuums[this._active_vacuum][a]}
              ?disabled=${this._config.vacuums[this._active_vacuum].entity ==
              null}
              @toggle-change=${this.__update}
            ></sci-fi-toggle>
          `;
        })}
      </sci-fi-accordion-card>
    `;
  }

  __shortcuts() {
    let service = this._config.vacuums[this._active_vacuum].shortcuts
      ? this._config.vacuums[this._active_vacuum].shortcuts.service
        ? this._config.vacuums[this._active_vacuum].shortcuts.service
        : ''
      : '';
    let command = this._config.vacuums[this._active_vacuum].shortcuts
      ? this._config.vacuums[this._active_vacuum].shortcuts.command
        ? this._config.vacuums[this._active_vacuum].shortcuts.command
        : ''
      : '';
    let shortcuts = this._config.vacuums[this._active_vacuum].shortcuts
      ? this._config.vacuums[this._active_vacuum].shortcuts.description
        ? this._config.vacuums[this._active_vacuum].shortcuts.description
        : []
      : [];
    console.log(service);
    console.log(command);
    console.log(shortcuts);
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
          icon="mdi:send"
          value=${service}
          element-id="service"
          kind="service"
          @input-update=${this.__updateShortcuts}
          ?disabled=${this._config.vacuums[this._active_vacuum].entity == null}
        ></sci-fi-input>
        <sci-fi-input
          label="${this.getLabel('input-command')} ${this.getLabel(
            'text-required'
          )}"
          icon="mdi:api"
          value=${command}
          element-id="command"
          kind="command"
          @input-update=${this.__updateShortcuts}
          ?disabled=${this._config.vacuums[this._active_vacuum].entity == null}
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
                    ?disabled=${this._config.vacuums[this._active_vacuum]
                      .entity == null}
                  >
                  </sci-fi-button>
                  <sci-fi-button
                    icon="mdi:delete-outline"
                    @button-click="${(e) => this.__deleteShortcut(e, id)}"
                    ?disabled=${this._config.vacuums[this._active_vacuum]
                      .entity == null}
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
            ?disabled=${this._config.vacuums[this._active_vacuum].entity ==
            null}
          ></sci-fi-button>
        </section>
      </sci-fi-accordion-card>
    `;
  }

  __renderShortcutCustom() {
    if (!this._shortcut_id && this._shortcut_id != 0) return nothing;
    const shortcut =
      this._config.vacuums[this._active_vacuum].shortcuts.description[
        this._shortcut_id
      ];
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
    newConfig.vacuums[this._active_vacuum].shortcuts.description[
      this._shortcut_id
    ].segments[id] = parseInt(e.detail.value);
    this.__dispatchChange(e, newConfig);
  }

  __addSegment(e) {
    let newConfig = this.__getNewConfig();
    if (!newConfig.vacuums[this._active_vacuum].shortcuts)
      newConfig.vacuums[this._active_vacuum]['shortcuts'] = {
        service: null,
        description: [],
      };
    if (
      !newConfig.vacuums[this._active_vacuum].shortcuts.description[
        this._shortcut_id
      ].segments
    )
      newConfig.vacuums[this._active_vacuum].shortcuts.description[
        this._shortcut_id
      ]['segments'] = [];
    newConfig.vacuums[this._active_vacuum].shortcuts.description[
      this._shortcut_id
    ].segments.push(null);
    this.__dispatchChange(e, newConfig);
  }

  __deleteSegment(e) {
    let newConfig = this.__getNewConfig();
    newConfig.vacuums[this._active_vacuum].shortcuts.description[
      this._shortcut_id
    ].segments.splice(e, 1);
    this.__dispatchChange(e, newConfig);
  }

  __endShortcutEdit() {
    this._edit = !this._edit;
    this._shortcut_id = null;
  }

  __deleteShortcut(e) {
    let newConfig = this.__getNewConfig();
    newConfig.vacuums[this._active_vacuum].shortcuts.description.splice(e, 1);
    this.__dispatchChange(e, newConfig);
  }

  __editShortcut(id) {
    this._shortcut_id = id;
    this._edit = true;
  }

  __addShortcut(e) {
    let newConfig = this.__getNewConfig();
    if (!newConfig.vacuums[this._active_vacuum].shortcuts)
      newConfig.vacuums[this._active_vacuum]['shortcuts'] = {
        service: null,
        description: [],
      };
    if (!newConfig.vacuums[this._active_vacuum].shortcuts.description)
      newConfig.vacuums[this._active_vacuum].shortcuts['description'] = [];
    newConfig.vacuums[this._active_vacuum].shortcuts.description.push({
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
    >        ${Object.keys(newConfig.vacuums[this._active_vacuum].sensors).map(
      (config_sensor_id) => {
        const sensor_id =
          newConfig.vacuums[this._active_vacuum].sensors[config_sensor_id];
        return html`
          <sci-fi-input
            icon="${this._sensors[config_sensor_id]}"
            label="${this.getLabel(
              'input-' + config_sensor_id.replaceAll('_', '-')
            )}  ${this.getLabel('text-optionnal')}"
            element-id="sensors"
            kind="${config_sensor_id}"
            value=${sensor_id}
            @input-update=${this.__update}
            ?disabled=${this._config.vacuums[this._active_vacuum].entity ==
            null}
          ></sci-fi-input>
        `;
      }
    )}
      </div>
    </sci-fi-accordion-card>`;
  }

  __sensorsDefaultValues(config) {
    if (!config.vacuums[this._active_vacuum].sensors)
      config.vacuums[this._active_vacuum]['sensors'] = {};
    Object.keys(this._sensors).forEach((id) => {
      if (!config.vacuums[this._active_vacuum].sensors[id])
        config.vacuums[this._active_vacuum].sensors[id] = '';
    });
    return config;
  }

  __updateShortcuts(e) {
    let newConfig = this.__getNewConfig();
    if (!newConfig.vacuums[this._active_vacuum].shortcuts)
      newConfig.vacuums[this._active_vacuum]['shortcuts'] = {
        service: null,
        description: [],
      };

    if (e.detail.id == 'service') {
      newConfig.vacuums[this._active_vacuum].shortcuts.service = e.detail.value;
    } else if (e.detail.id == 'description') {
      newConfig.vacuums[this._active_vacuum].shortcuts.description[
        this._shortcut_id
      ][e.detail.kind] = e.detail.value;
    } else {
      newConfig.vacuums[this._active_vacuum].shortcuts.command = e.detail.value;
    }
    this.__dispatchChange(e, newConfig);
  }

  __update(e) {
    let newConfig = this.__getNewConfig();
    if (e.detail.kind == e.detail.id) {
      newConfig.vacuums[this._active_vacuum][e.detail.id] = e.detail.value;
    } else if (e.detail.id == 'sensors') {
      if (!newConfig.vacuums[this._active_vacuum].sensors)
        config.vacuums[this._active_vacuum]['sensors'] = {};
      newConfig.vacuums[this._active_vacuum].sensors[e.detail.kind] =
        e.detail.value;
    } else {
      newConfig.vacuums[this._active_vacuum][e.detail.id] = e.detail.value;
    }
    this.__dispatchChange(e, newConfig);
  }
}
