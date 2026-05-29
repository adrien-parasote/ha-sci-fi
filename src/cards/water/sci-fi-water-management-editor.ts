import { html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SciFiBaseEditor } from '../../utils/base-editor.js';
import { sciFiEditorCommonStyles } from '../../styles/editor-common.js';
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
    .accordion-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
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

        <section class="visibility-section">
          <h1 class="visibility-header">
            <sf-icon icon="mdi:eye-outline" style="--icon-width:16px;--icon-height:16px;"></sf-icon>
            <span>Visibilité</span>
          </h1>
          <div class="accordion-group">
            ${Object.entries(this._getGroupedWaterEntities()).map(([devId, entities]) => {
              let title = 'Automatisations / Sans équipement';
              let icon = 'mdi:robot';
              if (devId !== 'no_device' && this.hass!.devices?.[devId]) {
                title = (this.hass!.devices[devId] as any).name || devId;
                icon = 'mdi:devices';
              }

              return html`
                <sf-editor-accordion title="${title}" icon="${icon}" ?open=${false}>
                  <div class="people" style="padding-top: 8px;">
                    ${entities.map(ent => {
                      const entityId = ent.entity_id;
                      const stateObj = this.hass!.states[entityId];
                      const name = stateObj?.attributes?.friendly_name || entityId;
                      const ignoredList = config.ignored_entities || [];
                      const isHidden = ignoredList.includes(entityId);
                      const active = !isHidden;
                      const initial = name.charAt(0).toUpperCase();
                      const domain = entityId.split('.')[0].toUpperCase();

                      return html`
                        <div class="people-row">
                          <div class="avatar">
                            <span class="avatar-initial">${initial}</span>
                          </div>
                          <div class="person-name" style="display:flex; flex-direction:column;">
                            <span>${name}</span>
                            <span style="font-size: 0.7em; opacity: 0.6; line-height: 1; margin-top: 2px;">
                              <strong style="color: var(--secondary-color, #4facfe);">${domain}</strong> • ${entityId}
                            </span>
                          </div>
                          <sf-button
                            icon="${active ? 'mdi:eye-outline' : 'mdi:eye-off-outline'}"
                            style="--btn-icon-color: ${active ? 'var(--secondary-light-color, rgb(102,156,210))' : 'rgba(224,232,255,0.3)'};"
                            @button-click="${() => this._toggleEntityVisibility(entityId, isHidden)}"
                          ></sf-button>
                        </div>
                      `;
                    })}
                  </div>
                </sf-editor-accordion>
              `;
            })}
          </div>
        </section>
      </div>
    `;
  }

  private _getGroupedWaterEntities(): Record<string, any[]> {
    const label = (this.config as SciFiWaterManagementConfig).filter_label || 'water';
    const byDevice: Record<string, any[]> = {};

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
          const devId = ent.device_id || 'no_device';
          if (!byDevice[devId]) byDevice[devId] = [];
          byDevice[devId].push(ent);
        }
      }
    }
    
    // sort entities inside groups
    for (const devId in byDevice) {
      byDevice[devId]!.sort((a, b) => {
        const aName = this.hass!.states[a.entity_id]?.attributes?.friendly_name || a.entity_id;
        const bName = this.hass!.states[b.entity_id]?.attributes?.friendly_name || b.entity_id;
        return aName.localeCompare(bName);
      });
    }
    return byDevice;
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
