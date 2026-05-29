import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
import type { SciFiWaterManagementConfig } from '../../types/config.js';

const TAG = 'sci-fi-water-management-editor';

@customElement(TAG)
export class SciFiWaterManagementEditor extends SciFiBaseEditor {
  static override styles = [sciFiEditorCommonStyles];

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

        <sf-editor-multi-entity
          label="Entités ignorées (optionnel)"
          .hass=${this.hass}
          .value=${config.ignored_entities ?? []}
          .configValue=${'ignored_entities'}
          @value-changed=${this._valueChanged}
        ></sf-editor-multi-entity>
      </div>
    `;
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
