/**
 * <sci-fi-hexa-tiles> — v2
 * Hexagonal tile dashboard: weather overview, person presence, vehicle location, custom tiles.
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
    `,
  ];

  declare config: SciFiHexaTilesConfig;

  protected override renderCard(): TemplateResult {
    const tiles = this.config.tiles ?? [];
    const persons = this.config.persons ?? [];
    const vehicles = this.config.vehicles ?? [];
    const weather = this.config.weather;

    return html`
      <ha-card>
        ${this.config.header_message ? html`<div class="sf-header">${this.config.header_message}</div>` : ''}
        <div class="container">
          ${weather?.activate ? this._renderWeatherAlert(weather) : ''}
          <div class="hexa-grid">
            ${this._renderWeatherTile(weather)}
            ${repeat(persons, p => p, p => this._renderPersonTile(p))}
            ${repeat(vehicles, v => v, v => this._renderVehicleTile(v))}
            ${repeat(tiles, t => t.entity_id, t => this._renderCustomTile(t))}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderWeatherAlert(weather: NonNullable<SciFiHexaTilesConfig['weather']>): TemplateResult {
    const alertState = weather.weather_alert_entity_id
      ? this.hass.states[weather.weather_alert_entity_id]?.state
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
    if (!weather?.weather_entity_id) return html``;
    const state = this.hass.states[weather.weather_entity_id];
    if (!state) return html``;
    const temp = state.attributes['temperature'] as number | undefined;
    return html`
      <div class="hexa-tile" data-active="false" @click="${() => weather.link ? window.location.assign(weather.link) : undefined}">
        <sf-icon .icon="mdi:weather-cloudy" .connection="${this.hass.connection}"></sf-icon>
        <span class="tile-label">${temp !== null ? `${temp}°` : state.state}</span>
      </div>
    `;
  }

  private _renderPersonTile(entityId: string): TemplateResult {
    const state = this.hass.states[entityId];
    if (!state) return html``;
    const isHome = state.state === 'home';
    const name = state.attributes.friendly_name ?? entityId;
    return html`
      <div class="hexa-tile" data-active="${isHome}">
        <sf-icon
          .icon="${isHome ? 'mdi:account-check' : 'mdi:account-off'}"
          .connection="${this.hass.connection}"
        ></sf-icon>
        <span class="tile-label">${name}</span>
      </div>
    `;
  }

  private _renderVehicleTile(entityId: string): TemplateResult {
    const state = this.hass.states[entityId];
    if (!state) return html``;
    const name = state.attributes.friendly_name ?? entityId;
    return html`
      <div class="hexa-tile" data-active="false">
        <sf-icon .icon="mdi:car" .connection="${this.hass.connection}"></sf-icon>
        <span class="tile-label">${name}</span>
      </div>
    `;
  }

  private _renderCustomTile(tile: SciFiHexaTileConfig): TemplateResult {
    const state = this.hass.states[tile.entity_id];
    const isActive = state?.state === 'on';
    const name = tile.name ?? state?.attributes.friendly_name ?? tile.entity_id;
    return html`
      <div
        class="hexa-tile"
        data-active="${isActive}"
        role="button"
        tabindex="0"
        aria-label="${name}"
        @click="${() => tile.tap_action ? this._executeAction(tile) : undefined}"
      >
        <sf-icon .icon="${tile.icon}" .connection="${this.hass.connection}"></sf-icon>
        <span class="tile-label">${name}</span>
      </div>
    `;
  }

  private _executeAction(tile: SciFiHexaTileConfig): void {
    const action = tile.tap_action;
    if (!action) return;
    if (action.action === 'navigate' && action.navigation_path) {
      window.location.assign(action.navigation_path);
    } else if (action.action === 'call-service' && action.service) {
      const [domain, service] = action.service.split('.');
      if (domain && service) {
        void this.hass.callService(domain, service, action.service_data ?? {});
      }
    }
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
