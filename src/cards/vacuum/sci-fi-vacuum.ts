/**
 * <sci-fi-vacuum> — v1.0.0
 * Robot vacuum control: status, map display, fan speed, controls, shortcuts.
 * ADR-005: uses entity (not entity_id), mop_intensite (FR), shortcuts preserved.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type {
  SciFiVacuumConfig,
  SciFiVacuumEntry,
  SciFiVacuumShortcutDescription,
} from '../../types/config.js';

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
        margin-bottom: var(--sf-spacing-md);
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
      /* ADR-005: shortcuts section */
      .shortcuts {
        border-top: 1px solid var(--sf-border);
        padding-top: var(--sf-spacing-sm);
      }
      .shortcuts-title {
        font-size: var(--sf-font-size-sm);
        color: var(--sf-text-secondary);
        margin-bottom: var(--sf-spacing-xs);
      }
      .shortcuts-grid {
        display: flex;
        gap: var(--sf-spacing-xs);
        flex-wrap: wrap;
      }
      .shortcut-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: var(--sf-spacing-xs) var(--sf-spacing-sm);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius-sm);
        background: var(--sf-bg-secondary);
        color: var(--sf-text-secondary);
        cursor: pointer;
        font-size: var(--sf-font-size-sm);
        transition: all var(--sf-transition-fast);
      }
      .shortcut-btn:hover { border-color: var(--sf-primary); background: var(--sf-primary-dim); color: var(--sf-primary); }
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
          (v, i) => `${v.entity}-${i}`,
          (v, i) => {
            // ADR-005: v.entity (not v.entity_id)
            const name = this.hass.states[v.entity]?.attributes.friendly_name ?? v.entity;
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
    // ADR-005: v.entity (not v.entity_id)
    const vacState = this.hass.states[v.entity];
    const stateStr = vacState?.state ?? 'inconnu';
    const battery = v.sensors?.battery
      ? this.hass.states[v.sensors.battery]?.state
      : undefined;
    const area = v.sensors?.current_clean_area
      ? this.hass.states[v.sensors.current_clean_area]?.state
      : undefined;
    // ADR-005: mop_intensite (FR spelling)
    const mopIntensity = v.sensors?.mop_intensite
      ? this.hass.states[v.sensors.mop_intensite]?.state
      : undefined;
    const duration = v.sensors?.current_clean_duration
      ? this.hass.states[v.sensors.current_clean_duration]?.state
      : undefined;
    const mapCameraState = v.sensors?.map
      ? this.hass.states[v.sensors.map]
      : undefined;
    const mapUrl = mapCameraState?.attributes['entity_picture'] as string | undefined;

    return html`
      <div class="vacuum-main">
        <div class="vacuum-info">
          <div class="vacuum-state sf-state-${stateStr === 'cleaning' ? 'on' : 'off'}">
            <sf-icon .icon="${stateStr === 'cleaning' ? 'mdi:robot-vacuum' : 'mdi:robot-vacuum-off'}"
              .connection="${this.hass.connection}"></sf-icon>
            ${stateStr}
          </div>
          <div class="sensors-row">
            ${battery !== null && battery !== undefined ? html`<span class="sensor-item">🔋 ${battery}%</span>` : ''}
            ${area !== null && area !== undefined ? html`<span class="sensor-item">📐 ${area} m²</span>` : ''}
            ${duration !== null && duration !== undefined ? html`<span class="sensor-item">⏱ ${duration}</span>` : ''}
            ${mopIntensity !== null && mopIntensity !== undefined ? html`<span class="sensor-item">💧 ${mopIntensity}</span>` : ''}
          </div>
        </div>
        ${mapUrl ? html`
          <div class="map-container">
            <img src="${mapUrl}" alt="Carte aspirateur" />
          </div>
        ` : ''}
      </div>

      <div class="controls">
        ${v.start !== false ? html`<button class="ctrl-btn" @click="${() => this._call(v.entity, 'start')}">▶ Démarrer</button>` : ''}
        ${v.pause !== false ? html`<button class="ctrl-btn" @click="${() => this._call(v.entity, 'pause')}">⏸ Pause</button>` : ''}
        ${v.stop !== false ? html`<button class="ctrl-btn" @click="${() => this._call(v.entity, 'stop')}">⏹ Stop</button>` : ''}
        ${v.return_to_base !== false ? html`<button class="ctrl-btn" @click="${() => this._call(v.entity, 'return_to_base')}">🏠 Base</button>` : ''}
        ${v.set_fan_speed !== false ? html`
          <select class="fan-select" @change="${(e: Event) => this._setFanSpeed(v.entity, (e.target as HTMLSelectElement).value)}">
            ${FAN_SPEEDS.map(s => html`<option value="${s}">${s}</option>`)}
          </select>
        ` : ''}
      </div>

      ${this._renderShortcuts(v)}
    `;
  }

  /** ADR-005: shortcuts section — was entirely missing in v1.0.0-wip. */
  private _renderShortcuts(v: SciFiVacuumEntry): TemplateResult {
    const sc = v.shortcuts;
    if (!sc?.description || sc.description.length === 0) return html``;

    return html`
      <div class="shortcuts">
        <div class="shortcuts-title">Raccourcis</div>
        <div class="shortcuts-grid">
          ${sc.description.map(d => this._renderShortcutButton(v, d))}
        </div>
      </div>
    `;
  }

  private _renderShortcutButton(v: SciFiVacuumEntry, d: SciFiVacuumShortcutDescription): TemplateResult {
    return html`
      <button
        class="shortcut-btn"
        aria-label="Nettoyage : ${d.name}"
        @click="${() => this._callShortcut(v, d)}"
      >
        ${d.icon ? html`<sf-icon .icon="${d.icon}" .connection="${this.hass.connection}"></sf-icon>` : ''}
        ${d.name}
      </button>
    `;
  }

  private _call(entityId: string, service: string): void {
    void this.hass.callService('vacuum', service, { entity_id: entityId });
  }

  /**
   * ADR-005: shortcut service call per spec:
   * service: 'vacuum.send_command', command: 'app_segment_clean', params: segments[]
   */
  private _callShortcut(v: SciFiVacuumEntry, d: SciFiVacuumShortcutDescription): void {
    const sc = v.shortcuts!;
    const [domain, service] = (sc.service ?? 'vacuum.send_command').split('.');
    if (!domain || !service) return;
    void this.hass.callService(domain, service, {
      entity_id: v.entity,
      command: sc.command ?? 'app_segment_clean',
      params: d.segments,
    });
  }

  private _setFanSpeed(entityId: string, speed: string): void {
    void this.hass.callService('vacuum', 'set_fan_speed', { entity_id: entityId, fan_speed: speed });
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiVacuumConfig {
    // ADR-005: entity (not entity_id)
    return { type: `custom:${TAG}`, vacuums: [{ entity: 'vacuum.robot' }] };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiVacuumCard;
  }
}
