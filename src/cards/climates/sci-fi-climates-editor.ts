/**
 * <sci-fi-climates-editor> — Graphical editor for the sci-fi-climates card.
 *
 * Main view: Header toggle + seasonal icons/msgs, entities-to-exclude,
 *            state icons/colors (heat, off, auto),
 *            mode icons/colors (frost_protection, eco, comfort, comfort-1, comfort-2, boost).
 * Edit view: Icon + color picker for the selected state or mode key.
 *
 * Spec 10 § sci-fi-climates-editor
 */

import type { HomeAssistantExt } from '../../types/ha.js';
import { html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type {
  SciFiClimatesConfig,
  SciFiClimatesHeaderConfig,
} from '../../types/config.js';
import type { InputUpdateDetail } from '../../components/editor-inputs/sf-editor-input.js';
import type { EditorHassEntity } from '../../components/editor-inputs/sf-editor-dropdown-entity.js';

import '../../components/editor-inputs/sf-editor-input.js';
import '../../components/editor-inputs/sf-editor-dropdown-icon.js';
import '../../components/editor-inputs/sf-editor-multi-entity.js';
import '../../components/editor-inputs/sf-editor-color-picker.js';
import '../../components/sf-toggle-switch/sf-toggle-switch.js';
import '../../components/buttons/sf-button.js';

type EditTarget = { key: string; kind: 'state' | 'mode' };

const STATE_KEYS = ['auto', 'heat', 'off'] as const;
const MODE_KEYS = ['frost_protection', 'eco', 'comfort', 'comfort-1', 'comfort-2', 'boost'] as const;

@customElement('sci-fi-climates-editor')
export class SciFiClimatesEditor extends SciFiBaseEditor {
  @state() private _climateEntities: EditorHassEntity[] = [];
  @state() private _edit = false;
  @state() private _editTarget: EditTarget | null = null;

  static override styles = [sciFiEditorCommonStyles];

  override set hass(hass: HomeAssistantExt | undefined) {
    super.hass = hass;
    if (!hass || this._climateEntities.length > 0) return;
    this._climateEntities = Object.values(hass.states)
      .filter(e => e.entity_id.startsWith('climate.'))
      .map(e => ({
        entity_id: e.entity_id,
        attributes: {
          friendly_name: e.attributes['friendly_name'],
          icon: e.attributes['icon'] as string | undefined,
        },
      }));
  }

  private _toggleHeader(e: CustomEvent<{ checked: boolean }>): void {
    const newConfig = this._getNewConfig<SciFiClimatesConfig>();
    newConfig.header = {
      ...(newConfig.header ?? {}),
      display: e.detail.checked,
    } as SciFiClimatesHeaderConfig;
    this._dispatchChange(newConfig);
  }

  private _updateHeader(e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiClimatesConfig>();
    newConfig.header = {
      ...(newConfig.header ?? {}),
      [e.detail.id]: e.detail.value,
    } as SciFiClimatesHeaderConfig;
    this._dispatchChange(newConfig);
  }

  private _updateExclude(e: CustomEvent<InputUpdateDetail>): void {
    const newConfig = this._getNewConfig<SciFiClimatesConfig>();
    const current = [...(newConfig.entities_to_exclude ?? [])];
    if (e.detail.type === 'add') {
      current.push(e.detail.value);
    } else if (e.detail.type === 'remove') {
      current.splice(parseInt(e.detail.value, 10), 1);
    }
    (newConfig as unknown as Record<string, unknown>)['entities_to_exclude'] = current;
    this._dispatchChange(newConfig);
  }

  private _startEdit(key: string, kind: 'state' | 'mode'): void {
    this._editTarget = { key, kind };
    this._edit = true;
  }

  private _endEdit(): void {
    this._edit = false;
    this._editTarget = null;
  }

  private _updateEditTarget(e: CustomEvent<InputUpdateDetail>): void {
    if (!this._editTarget) return;
    const newConfig = this._getNewConfig<SciFiClimatesConfig>();
    const group = e.detail.kind; // 'state_icons' | 'state_colors' | 'mode_icons' | 'mode_colors'
    (newConfig as unknown as Record<string, unknown>)[group] = {
      ...((newConfig as unknown as Record<string, unknown>)[group] as Record<string, string> ?? {}),
      [e.detail.id]: e.detail.value,
    };
    this._dispatchChange(newConfig);
  }

  private _renderStateRow(key: string): TemplateResult {
    const config = this.config as SciFiClimatesConfig;
    const icon = (config.state_icons as Record<string, string> | undefined)?.[key] ?? '';
    const color = (config.state_colors as Record<string, string> | undefined)?.[key] ?? '';
    return html`
      <div class="row">
        <sf-editor-dropdown-icon
          element-id="${key}"
          kind="state_icons"
          label="${this.getLabel('input-icon-' + key)} ${this.getLabel('text-required')}"
          icon="${icon}"
          .value="${icon}"
          style="flex:1;--input-icon-color:${color};"
          disabled
        ></sf-editor-dropdown-icon>
        <button class="edit-btn" @click="${() => this._startEdit(key, 'state')}">✎</button>
      </div>
    `;
  }

  private _renderModeRow(key: string): TemplateResult {
    const config = this.config as SciFiClimatesConfig;
    const icon = (config.mode_icons as Record<string, string> | undefined)?.[key] ?? '';
    const color = (config.mode_colors as Record<string, string> | undefined)?.[key] ?? '';
    return html`
      <div class="row">
        <sf-editor-dropdown-icon
          element-id="${key}"
          kind="mode_icons"
          label="${this.getLabel('input-icon-' + key)} ${this.getLabel('text-required')}"
          icon="${icon}"
          .value="${icon}"
          style="flex:1;--input-icon-color:${color};"
          disabled
        ></sf-editor-dropdown-icon>
        <button class="edit-btn" @click="${() => this._startEdit(key, 'mode')}">✎</button>
      </div>
    `;
  }

  private _renderEditView(): TemplateResult {
    if (!this._editTarget) return html``;
    const { key, kind } = this._editTarget;
    const config = this.config as SciFiClimatesConfig;
    const iconGroup = kind === 'state' ? 'state_icons' : 'mode_icons';
    const colorGroup = kind === 'state' ? 'state_colors' : 'mode_colors';
    const icon = ((config as unknown as Record<string, unknown>)[iconGroup] as Record<string, string> | undefined)?.[key] ?? '';
    const color = ((config as unknown as Record<string, unknown>)[colorGroup] as Record<string, string> | undefined)?.[key] ?? '';
    const titleKey = `edit-section-${kind}-${key}-title`;
    return html`
      <div class="head">
        <sf-button
          icon="mdi:chevron-left"
          @button-click="${this._endEdit}"
        ></sf-button>
        <span>${this.getLabel(titleKey) || `${this.getLabel('edit-section-title')} \u2014 ${key}`}</span>
      </div>
      <sf-editor-dropdown-icon
        element-id="${key}"
        kind="${iconGroup}"
        label="${this.getLabel('input-icon-' + key)} ${this.getLabel('text-required')}"
        icon="${icon}"
        .value="${icon}"
        style="--input-icon-color:${color};"
        @input-update="${this._updateEditTarget}"
      ></sf-editor-dropdown-icon>
      <sf-editor-color-picker
        element-id="${key}"
        kind="${colorGroup}"
        label="${this.getLabel('input-color-' + key)} ${this.getLabel('text-required')}"
        icon="mdi:format-color-fill"
        .value="${color}"
        style="--input-icon-color:${color};"
        @input-update="${this._updateEditTarget}"
      ></sf-editor-color-picker>
    `;
  }

  protected override renderEditor(): TemplateResult {
    const config = this.config as SciFiClimatesConfig;
    const headerDisplay = config.header?.display ?? true;
    return html`
      <div class="card">
        <div class="container ${this._edit ? 'false' : 'true'}">

          <!-- Header -->
          <section>
            <h1>${this.getSectionTitle('section-title-header')}</h1>
            <sf-toggle-switch
              .checked="${headerDisplay}"
              label="${this.getLabel('text-switch-climate-global-turn-on_off')}"
              @sf-toggle-change="${this._toggleHeader}"
            ></sf-toggle-switch>
            ${headerDisplay ? html`
              <sf-editor-input
                element-id="icon_winter_state"
                kind="header"
                label="${this.getLabel('input-icon-header-section-winter')}"
                icon="mdi:cursor-text"
                .value="${config.header?.icon_winter_state ?? ''}"
                @input-update="${this._updateHeader}"
              ></sf-editor-input>
              <sf-editor-input
                element-id="message_winter_state"
                kind="header"
                label="${this.getLabel('input-message-header-section-winter')}"
                icon="mdi:cursor-text"
                .value="${config.header?.message_winter_state ?? ''}"
                @input-update="${this._updateHeader}"
              ></sf-editor-input>
              <sf-editor-input
                element-id="icon_summer_state"
                kind="header"
                label="${this.getLabel('input-icon-header-section-summer')}"
                icon="mdi:cursor-text"
                .value="${config.header?.icon_summer_state ?? ''}"
                @input-update="${this._updateHeader}"
              ></sf-editor-input>
              <sf-editor-input
                element-id="message_summer_state"
                kind="header"
                label="${this.getLabel('input-message-header-section-summer')}"
                icon="mdi:cursor-text"
                .value="${config.header?.message_summer_state ?? ''}"
                @input-update="${this._updateHeader}"
              ></sf-editor-input>
            ` : nothing}
          </section>

          <!-- Exclude entities -->
          <section>
            <h1>${this.getSectionTitle('section-title-settings')}</h1>
            <sf-editor-multi-entity
              element-id="entities_to_exclude"
              kind="exclude"
              label="${this.getLabel('input-entities-to-exclude')}"
              .values="${[...(config.entities_to_exclude ?? [])]}"
              .items="${this._climateEntities}"
              @input-update="${this._updateExclude}"
            ></sf-editor-multi-entity>
          </section>

          <!-- States -->
          <section>
            <h1>${this.getSectionTitle('section-title-state')}</h1>
            ${STATE_KEYS.map(k => this._renderStateRow(k))}
          </section>

          <!-- Modes -->
          <section>
            <h1>${this.getSectionTitle('section-title-mode')}</h1>
            ${MODE_KEYS.map(k => this._renderModeRow(k))}
          </section>

        </div>

        <!-- Edit panel -->
        <div class="editor ${this._edit ? 'true' : 'false'}">
          ${this._edit ? this._renderEditView() : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sci-fi-climates-editor': SciFiClimatesEditor;
  }
}
