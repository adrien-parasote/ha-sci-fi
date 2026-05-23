/**
 * <sci-fi-vacuum> — v2
 * Robot vacuum control: status, map display, fan speed, controls.
 * Decoupled from House (ADR-004 fix) — multi-vacuum supported.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiVacuumConfig, SciFiVacuumEntry } from '../../types/config.js';

const TAG = 'sci-fi-vacuum';

const FAN_SPEEDS = ['quiet', 'standard', 'strong', 'max'] as const;

@customElement(TAG)
export class SciFiVacuumCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }
      .vacuum-tabs {
        display: flex;
        gap: var(--sf-spacing-sm);
        margin-bottom: var(--sf-spacing-md);
        overflow-x: auto;
      }
      .vacuum-tab {
        background: var(--sf-bg-secondary);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius-sm);
        color: var(--sf-text-secondary);
        padding: var(--sf-spacing-xs) var(--sf-spacing-sm);
        cursor: pointer;
        font-size: var(--sf-font-size-sm);
        transition: all var(--sf-transition-fast);
      }
      .vacuum-tab[aria-selected="true"] {
        background: var(--sf-primary-dim);
        border-color: var(--sf-primary);
        color: var(--sf-primary);
      }
      .vacuum-main {
        display: flex;
        gap: var(--sf-spacing-md);
        margin-bottom: var(--sf-spacing-md);
      }
      .vacuum-info { flex: 1; }
      .vacuum-state {
        font-size: var(--sf-font-size-xl);
        font-weight: 700;
        margin-bottom: var(--sf-spacing-sm);
      }
      .sensors-row {
        display: flex;
        gap: var(--sf-spacing-md);
        flex-wrap: wrap;
        font-size: var(--sf-font-size-sm);
        color: var(--sf-text-secondary);
      }
      .sensor-item { display: flex; align-items: center; gap: 4px; }
      .map-container {
        width: 120px;
        height: 120px;
        border-radius: var(--sf-radius-sm);
        overflow: hidden;
        border: 1px solid var(--sf-border);
        flex-shrink: 0;
      }
      .map-container img { width: 100%; height: 100%; object-fit: cover; }
      .controls {
        display: flex;
        gap: var(--sf-spacing-sm);
        flex-wrap: wrap;
      }
      .ctrl-btn {
        flex: 1 1 80px;
        padding: var(--sf-spacing-sm);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius-sm);
        background: var(--sf-bg-secondary);
        color: var(--sf-text-primary);
        cursor: pointer;
        font-size: var(--sf-font-size-sm);
        text-align: center;
        transition: all var(--sf-transition-fast);
      }
      .ctrl-btn:hover { border-color: var(--sf-primary); background: var(--sf-primary-dim); }
      .fan-select {
        background: var(--sf-bg);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius-sm);
        color: var(--sf-text-primary);
        padding: var(--sf-spacing-xs) var(--sf-spacing-sm);
        font-size: var(--sf-font-size-sm);
      }
    `,
  ];

  declare config: SciFiVacuumConfig;

  @state() private _activeIndex = 0;

  protected override renderCard(): TemplateResult {
    const vacuums = this.config.vacuums;
    const active = vacuums[this._activeIndex];

    if (!active) {
      return html`<ha-card><div class="container">Aucun aspirateur configuré</div></ha-card>`;
    }

    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : ''}
        <div class="container">
          ${vacuums.length > 1 ? this._renderTabs(vacuums) : ''}
          ${this._renderVacuum(active)}
        </div>
      </ha-card>
    `;
  }

  private _renderTabs(vacuums: readonly SciFiVacuumEntry[]): TemplateResult {
    return html`
      <div class="vacuum-tabs">
        ${repeat(
          vacuums,
          (v, i) => `${v.entity_id}-${i}`,
          (v, i) => {
            const name = this.hass.states[v.entity_id]?.attributes.friendly_name ?? v.entity_id;
            return html`
              <button
                class="vacuum-tab"
                aria-selected="${i === this._activeIndex}"
                @click="${() => { this._activeIndex = i; }}"
              >${name}</button>
            `;
          }
        )}
      </div>
    `;
  }

  private _renderVacuum(v: SciFiVacuumEntry): TemplateResult {
    const vacState = this.hass.states[v.entity_id];
    const state = vacState?.state ?? 'inconnu';
    const battery = v.sensors?.battery
      ? this.hass.states[v.sensors.battery]?.state
      : undefined;
    const area = v.sensors?.current_clean_area
      ? this.hass.states[v.sensors.current_clean_area]?.state
      : undefined;
    const mapCameraState = v.sensors?.map
      ? this.hass.states[v.sensors.map]
      : undefined;
    const mapUrl = mapCameraState?.attributes['entity_picture'] as string | undefined;

    return html`
      <div class="vacuum-main">
        <div class="vacuum-info">
          <div class="vacuum-state sf-state-${state === 'cleaning' ? 'on' : 'off'}">
            <sf-icon .icon="${state === 'cleaning' ? 'mdi:robot-vacuum' : 'mdi:robot-vacuum-off'}"
              .connection="${this.hass.connection}"></sf-icon>
            ${state}
          </div>
          <div class="sensors-row">
            ${battery !== null ? html`<span class="sensor-item">🔋 ${battery}%</span>` : ''}
            ${area !== null ? html`<span class="sensor-item">📐 ${area} m²</span>` : ''}
          </div>
        </div>
        ${mapUrl ? html`
          <div class="map-container">
            <img src="${mapUrl}" alt="Carte aspirateur" />
          </div>
        ` : ''}
      </div>

      <div class="controls">
        ${v.start !== false ? html`<button class="ctrl-btn" @click="${() => this._call(v.entity_id, 'start')}">▶ Démarrer</button>` : ''}
        ${v.pause !== false ? html`<button class="ctrl-btn" @click="${() => this._call(v.entity_id, 'pause')}">⏸ Pause</button>` : ''}
        ${v.stop !== false ? html`<button class="ctrl-btn" @click="${() => this._call(v.entity_id, 'stop')}">⏹ Stop</button>` : ''}
        ${v.return_to_base !== false ? html`<button class="ctrl-btn" @click="${() => this._call(v.entity_id, 'return_to_base')}">🏠 Base</button>` : ''}
        ${v.set_fan_speed !== false ? html`
          <select class="fan-select" @change="${(e: Event) => this._setFanSpeed(v.entity_id, (e.target as HTMLSelectElement).value)}">
            ${FAN_SPEEDS.map(s => html`<option value="${s}">${s}</option>`)}
          </select>
        ` : ''}
      </div>
    `;
  }

  private _call(entityId: string, service: string): void {
    void this.hass.callService('vacuum', service, { entity_id: entityId });
  }

  private _setFanSpeed(entityId: string, speed: string): void {
    void this.hass.callService('vacuum', 'set_fan_speed', { entity_id: entityId, fan_speed: speed });
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiVacuumConfig {
    return { type: `custom:${TAG}`, vacuums: [{ entity_id: 'vacuum.robot' }] };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiVacuumCard;
  }
}
