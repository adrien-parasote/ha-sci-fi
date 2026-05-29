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
    .visibility-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .visibility-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 6px;
      border: 1px solid rgba(0, 210, 255, 0.1);
    }
    .entity-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex: 1;
      padding-right: 12px;
    }
    .entity-info .name {
      font-size: 0.9rem;
      color: var(--primary-text-color, #e0e8ff);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .entity-info .id {
      font-size: 0.75rem;
      color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
    }
    .visibility-toggle {
      color: var(--primary-color, #00d2ff);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
    }
    .visibility-toggle:hover {
      background: rgba(0, 210, 255, 0.1);
    }
    .visibility-toggle.is-hidden {
      color: var(--secondary-text-color, rgba(224, 232, 255, 0.4));
    }
    .visibility-toggle.is-disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .visibility-toggle.is-disabled:hover {
      background: transparent;
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

        <sf-editor-accordion title="Visibilité des entités" ?open=${true}>
          <div class="visibility-list">
            ${this._getAllWaterEntities().map(entityId => {
              const stateObj = this.hass!.states[entityId];
              const name = stateObj?.attributes?.friendly_name || entityId;
              const ignoredList = config.ignored_entities || [];
              const isIgnoredExactly = ignoredList.includes(entityId);
              const isIgnoredByWildcard = ignoredList.some(pattern => {
                if (pattern.includes('*')) {
                  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                  return regex.test(entityId);
                }
                return false;
              });

              const isHidden = isIgnoredExactly || isIgnoredByWildcard;

              return html`
                <div class="visibility-item">
                  <div class="entity-info">
                    <span class="name">${name}</span>
                    <span class="id">${entityId}</span>
                  </div>
                  <div 
                    class="visibility-toggle ${isHidden ? 'is-hidden' : ''} ${isIgnoredByWildcard ? 'is-disabled' : ''}"
                    title=${isIgnoredByWildcard ? 'Masqué par un motif global (*)' : 'Basculer la visibilité'}
                    @click=${() => {
                      if (isIgnoredByWildcard) return;
                      this._toggleEntityVisibility(entityId, isIgnoredExactly);
                    }}
                  >
                    <ha-icon icon=${isHidden ? 'mdi:eye-off' : 'mdi:eye'}></ha-icon>
                  </div>
                </div>
              `;
            })}
          </div>
        </sf-editor-accordion>
      </div>
    `;
  }

  private _getAllWaterEntities(): string[] {
    const entities = new Set<string>();
    const label = (this.config as SciFiWaterManagementConfig).filter_label || 'water';

    if (this.hass?.entities) {
      for (const [entityId, entry] of Object.entries(this.hass.entities)) {
        const ent = entry as any;
        let hasLabel = ent.labels?.includes(label);
        if (!hasLabel && ent.device_id && this.hass.devices?.[ent.device_id]) {
          const device = this.hass.devices[ent.device_id] as any;
          if (device.labels?.includes(label)) {
            hasLabel = true;
          }
        }
        if (hasLabel) {
          entities.add(entityId);
        }
      }
    }
    return Array.from(entities).sort();
  }

  private _toggleEntityVisibility(entityId: string, currentlyIgnored: boolean): void {
    const config = this.config as SciFiWaterManagementConfig;
    let currentValues = [...(config.ignored_entities || [])];

    if (currentlyIgnored) {
      currentValues = currentValues.filter(id => id !== entityId);
    } else {
      currentValues.push(entityId);
    }

    const newConfig = this._getNewConfig<SciFiWaterManagementConfig>();
    newConfig.ignored_entities = currentValues.length > 0 ? currentValues : undefined;
    this._dispatchChange(newConfig);
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
