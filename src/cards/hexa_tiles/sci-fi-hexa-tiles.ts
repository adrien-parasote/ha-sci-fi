/**
 * <sci-fi-hexa-tiles> — v1.0.0
 * Hexagonal tile dashboard: weather overview, person presence, custom tiles.
 * ADR-005: tiles use entity/active_icon/inactive_icon/state_on/link (not entity_id/icon/tap_action).
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiHexaTilesConfig, SciFiHexaTileConfig } from '../../types/config.js';

const TAG = 'sci-fi-hexa-tiles';

@customElement(TAG)
export class SciFiHexaTilesCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }

      /* Hexagonal grid layout */
      .hexa-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        justify-content: center;
      }

      /* Hexagon tile */
      .hexa-tile {
        width: 90px;
        height: 100px;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        background: var(--sf-bg-secondary);
        border: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: filter var(--sf-transition-fast);
        position: relative;
        overflow: hidden;
      }

      .hexa-tile:hover { filter: brightness(1.2); }
      .hexa-tile[data-active="true"] { background: var(--sf-primary-dim); }

      .hexa-tile .tile-icon { font-size: 1.5rem; }
      .hexa-tile .tile-label {
        font-size: 0.625rem;
        color: var(--sf-text-secondary);
        text-align: center;
        margin-top: 4px;
        max-width: 70px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Weather alert band */
      .weather-alert {
        padding: var(--sf-spacing-sm);
        border-radius: var(--sf-radius-sm);
        margin-bottom: var(--sf-spacing-md);
        text-align: center;
        font-size: var(--sf-font-size-sm);
        font-weight: 600;
      }
      .weather-alert[data-level="green"] { background: rgba(0,255,157,0.1); color: #00ff9d; }
      .weather-alert[data-level="yellow"] { background: rgba(255,214,10,0.1); color: #ffd60a; }
      .weather-alert[data-level="orange"] { background: rgba(255,107,53,0.1); color: #ff6b35; }
      .weather-alert[data-level="red"] { background: rgba(255,77,109,0.15); color: #ff4d6d; }

      /* ── Responsive ───────────────────────────────────────── */
      @container sf-card (max-width: 1023px) {
        .hexa-tile {
          width: 80px;
          height: 89px;
        }
        .hexa-tile .tile-label { max-width: 62px; }
      }
      /* ── Mobile : 2 tuiles par rangée, taille fluide ─────── */
      @container sf-card (max-width: 599px) {
        /* Grid en 2 colonnes serrées qui remplissent la largeur */
        .hexa-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          justify-items: center;
        }
        /* Chaque tuile prend 90% de sa cellule grid */
        .hexa-tile {
          width: 90%;
          /* ratio hexagonal : hauteur ≈ largeur × 1.155 */
          aspect-ratio: 1 / 1.155;
          height: auto;
        }
        .hexa-tile .tile-icon { font-size: 2rem; }
        .hexa-tile .tile-label {
          font-size: 0.7rem;
          max-width: 90%;
          white-space: normal;
          line-height: 1.2;
        }
        .container { padding: var(--sf-spacing-sm); }
      }
    `,
  ];

  declare config: SciFiHexaTilesConfig;

  protected override renderCard(): TemplateResult {
    const tiles = this.config.tiles ?? [];
    const weather = this.config.weather;

    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : ''}
        <div class="container">
          ${weather?.activate ? this._renderWeatherAlert(weather) : ''}
          <div class="hexa-grid">
            ${this._renderWeatherTile(weather)}
            ${repeat(
              tiles,
              // ADR-005: tiles use entity (not entity_id), fallback to name/index
              (t, i) => t.entity ?? t.name ?? String(i),
              t => this._renderCustomTile(t)
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderWeatherAlert(weather: NonNullable<SciFiHexaTilesConfig['weather']>): TemplateResult {
    // ADR-005: weather_alert_entity (not weather_alert_entity_id)
    const alertState = weather.weather_alert_entity
      ? this.hass.states[weather.weather_alert_entity]?.state
      : null;
    if (!alertState) return html``;

    const stateToLevel = (state: string): string => {
      if (state === weather.state_green) return 'green';
      if (state === weather.state_yellow) return 'yellow';
      if (state === weather.state_orange) return 'orange';
      if (state === weather.state_red) return 'red';
      return 'green';
    };

    return html`
      <div class="weather-alert" data-level="${stateToLevel(alertState)}">
        ⚠️ Alerte météo : ${alertState}
      </div>
    `;
  }

  private _renderWeatherTile(weather: SciFiHexaTilesConfig['weather']): TemplateResult {
    // ADR-005: weather_entity (not weather_entity_id)
    if (!weather?.weather_entity) return html``;
    const state = this.hass.states[weather.weather_entity];
    if (!state) return html``;
    const temp = state.attributes['temperature'] as number | undefined;
    return html`
      <div class="hexa-tile" data-active="false" @click="${() => weather.link ? this._navigate(weather.link) : undefined}">
        <sf-icon .icon="mdi:weather-cloudy" .connection="${this.hass.connection}"></sf-icon>
        <span class="tile-label">${temp !== null && temp !== undefined ? `${temp}°` : state.state}</span>
      </div>
    `;
  }

  private _renderCustomTile(tile: SciFiHexaTileConfig): TemplateResult {
    // ADR-005: tile uses entity (not entity_id), active_icon/inactive_icon (not icon)
    const entityId = tile.entity;
    const state = entityId ? this.hass.states[entityId] : undefined;

    // Determine if tile is "active" using state_on array or fallback to state === 'on'
    const isActive = state
      ? (tile.state_on
          ? tile.state_on.includes(state.state)
          : state.state === 'on')
      : false;

    const name = tile.name ?? state?.attributes.friendly_name ?? entityId ?? '';

    // ADR-005: active_icon/inactive_icon (not icon)
    const icon = (isActive
      ? (tile.active_icon ?? 'mdi:toggle-switch')
      : (tile.inactive_icon ?? 'mdi:toggle-switch-off'));

    // ADR-005: link navigation (not tap_action)
    const handleClick = (): void => {
      if (tile.link) this._navigate(tile.link);
    };

    return html`
      <div
        class="hexa-tile"
        data-active="${isActive}"
        role="button"
        tabindex="0"
        aria-label="${name}"
        @click="${handleClick}"
      >
        <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        <span class="tile-label">${name}</span>
      </div>
    `;
  }

  /** HA-native navigation: internal paths use pushState + location-changed event.
   *  External URLs (http/https) use window.open to avoid replacing the HA app. */
  private _navigate(path: string): void {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }
    window.history.pushState(null, '', path);
    window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiHexaTilesConfig {
    return { type: `custom:${TAG}`, tiles: [] };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiHexaTilesCard;
  }
}
