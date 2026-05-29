import { html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import '../../components/editor-inputs/sf-editor-chips.js';
import type { SciFiWaterManagementConfig } from '../../types/config.js';

const TAG = 'sci-fi-water-management-editor';

@customElement(TAG)
export class SciFiWaterManagementEditor extends SciFiBaseEditor {
  static override styles = [sciFiEditorCommonStyles, css`
    .card-config > * {
      margin-bottom: 16px;
      display: block;
    }
    .card-config > *:last-child {
      margin-bottom: 0;
    }
  `];

  protected renderEditor(): TemplateResult {
    const config = this.config as SciFiWaterManagementConfig;
    if (!config || !this.hass) return html``;

    return html`
      <div class="card-config">
        <sf-editor-input
          label="Message d'en-tête (optionnel)"
          .value=${config.header_message ?? ''}
          .configValue=${'header_message'}
          @value-changed=${this._valueChanged}
        ></sf-editor-input>

        <sf-editor-input
          label="Label de filtrage HA (ex: water)"
          .value=${config.filter_label ?? 'water'}
          .configValue=${'filter_label'}
          @value-changed=${this._valueChanged}
        ></sf-editor-input>

        <sf-editor-input
          label="Étage par défaut (ID de l'étage)"
          .value=${config.first_floor_to_render ?? ''}
          .configValue=${'first_floor_to_render'}
          @value-changed=${this._valueChanged}
        ></sf-editor-input>

        <sf-editor-dropdown-icon
          label="Icône par défaut"
          .value=${config.default_icon ?? 'mdi:water'}
          .configValue=${'default_icon'}
          @value-changed=${this._valueChanged}
        ></sf-editor-dropdown-icon>

        <sf-editor-chips
          label="Entités ignorées (motifs avec * acceptés)"
          .values=${config.ignored_entities ?? []}
          .configValue=${'ignored_entities'}
          @input-update=${this._chipsChanged}
        ></sf-editor-chips>
      </div>
    `;
  }

  private _chipsChanged(ev: CustomEvent): void {
    if (!this.hass) return;
    
    const target = ev.target as any;
    if (!target.configValue) return;

    const detail = ev.detail;
    let currentValues = [...((this.config as any)[target.configValue] || [])];

    if (detail.type === 'add') {
      if (!currentValues.includes(detail.value)) {
        currentValues.push(detail.value);
      }
    } else if (detail.type === 'remove') {
      const idx = parseInt(detail.value, 10);
      if (!isNaN(idx) && idx >= 0 && idx < currentValues.length) {
        currentValues.splice(idx, 1);
      }
    }

    const newConfig = this._getNewConfig<SciFiWaterManagementConfig>();
    (newConfig as any)[target.configValue] = currentValues.length > 0 ? currentValues : undefined;
    this._dispatchChange(newConfig);
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this.hass) return;
    
    const target = ev.target as any;
    if (!target.configValue) return;

    let value = ev.detail.value;
    if (value === '') value = undefined;

    const newConfig = this._getNewConfig<SciFiWaterManagementConfig>();
    (newConfig as any)[target.configValue] = value;

    this._dispatchChange(newConfig);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiWaterManagementEditor;
  }
}
