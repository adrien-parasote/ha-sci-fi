/**
 * <sci-fi-hexa-tiles> — v1.0.0
 * Hexagonal tile dashboard: weather overview, person presence, custom tiles.
 * ADR-005: tiles use entity/active_icon/inactive_icon/state_on/link (not entity_id/icon/tap_action).
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiHexaTilesConfig, SciFiHexaTileConfig } from '../../types/config.js';
import type { HassEntity } from '../../types/ha.js';

const TAG = 'sci-fi-hexa-tiles';

const WEATHER_ICON_MAP: Record<string, string> = {
  'clear-night': 'mdi:weather-night',
  'cloudy': 'mdi:weather-cloudy',
  'fog': 'mdi:weather-fog',
  'hail': 'mdi:weather-hail',
  'lightning': 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy',
  'partlycloudy': 'mdi:weather-partly-cloudy',
  'pouring': 'mdi:weather-pouring',
  'rainy': 'mdi:weather-rainy',
  'snowy': 'mdi:weather-snowy',
  'snowy-rainy': 'mdi:weather-snowy-rainy',
  'sunny': 'mdi:weather-sunny',
  'windy': 'mdi:weather-windy',
  'windy-variant': 'mdi:weather-windy-variant',
};

@customElement(TAG)
export class SciFiHexaTilesCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      ha-card {
        background: #000000 !important;
        border: none !important;
        padding: var(--sf-spacing-md) 0;
        display: block;
        width: 100%;
        height: 100% !important;
        min-height: 100vh;
        box-sizing: border-box;
      }

      .container {
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }

      .header {
        display: flex;
        flex-direction: row;
        column-gap: 16px;
        margin-bottom: var(--sf-spacing-md);
        padding: 0 var(--sf-spacing-md);
        align-items: center;
        width: 100%;
        box-sizing: border-box;
      }
      .avatar-container {
        position: relative;
        width: 60px;
        height: 60px;
      }
      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid var(--sf-primary, #00d2ff);
        box-shadow: 0 0 8px var(--sf-primary, #00d2ff);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.04);
        position: relative;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar-initials {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--sf-primary, #00d2ff);
      }
      .status-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .status-badge sf-icon {
        --icon-width: 14px;
        --icon-height: 14px;
        --icon-color: var(--sf-primary, #00d2ff);
      }
      .header-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .header-message {
        font-size: 0.8rem;
        color: var(--sf-primary, #00d2ff);
        margin-bottom: 2px;
        text-transform: capitalize;
      }
      .header-name {
        font-size: 1.2rem;
        font-weight: bold;
        color: #ffffff;
        text-shadow: 0 0 6px var(--sf-primary, #00d2ff);
      }

      /* Icon mapping for Light DOM sf-icon */
      sf-icon svg, .sf-icon {
        width: var(--icon-width, 24px);
        height: var(--icon-height, 24px);
        fill: var(--icon-color, currentColor);
        display: inline-block;
      }

      :host {
        --tile-width: calc(100% / (var(--cols, 2) + 0.5));
        --tile-height: calc(var(--tile-width) * 1.1547);
        display: block;
        height: 100%;
      }
      .hexa-grid {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      .hexa-row {
        display: flex;
        flex-direction: row;
        justify-content: center;
        height: var(--tile-height);
        margin-bottom: calc(var(--tile-height) * -0.25);
        width: 100%;
      }
      .hexa-row:last-child {
        margin-bottom: 0;
      }

      /* Hexagon tile */
      .hexa-tile {
        position: relative;
        width: var(--tile-width);
        height: var(--tile-height);
        margin: 0;
        cursor: pointer;
        display: block;
      }
      .hexa-half {
        width: calc(var(--tile-width) / 2);
        height: var(--tile-height);
        margin: 0;
      }
      .hexa-half svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .hexa-half svg polygon {
        fill: rgba(16, 22, 38, 0.6);
        stroke: rgba(224, 232, 255, 0.1);
        stroke-width: 1.5px;
      }

      /* SVG structures */
      .hexa-svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .hexa-bg {
        transition: fill var(--sf-transition-fast);
      }
      .hexa-border {
        transition: stroke var(--sf-transition-fast), filter var(--sf-transition-fast);
        fill: none;
      }

      /* Active vs Inactive tile styles */
      .hexa-tile[data-active="true"] .hexa-bg {
        fill: rgba(0, 210, 255, 0.08);
      }
      .hexa-tile[data-active="true"] .hexa-border {
        stroke: var(--sf-primary, #00d2ff);
        stroke-width: 2px;
        filter: drop-shadow(0 0 4px var(--sf-primary, #00d2ff));
      }
      .hexa-tile[data-active="false"] .hexa-bg {
        fill: rgba(16, 22, 38, 0.6);
      }
      .hexa-tile[data-active="false"] .hexa-border {
        stroke: rgba(224, 232, 255, 0.1);
        stroke-width: 1.5px;
      }

      /* Hover effects */
      .hexa-tile:hover .hexa-border {
        stroke: var(--sf-primary, #00d2ff);
        filter: drop-shadow(0 0 6px var(--sf-primary, #00d2ff));
      }

      /* Center content */
      .hexa-content {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 6px;
        box-sizing: border-box;
        z-index: 2;
        pointer-events: none; /* Let clicks pass to the wrapper */
      }
      .hexa-content sf-icon {
        --icon-width: 22px;
        --icon-height: 22px;
        transition: color var(--sf-transition-fast), filter var(--sf-transition-fast);
      }
      .hexa-tile[data-active="true"] .hexa-content sf-icon {
        --icon-color: var(--sf-primary, #00d2ff);
        filter: drop-shadow(0 0 3px var(--sf-primary, #00d2ff));
      }
      .hexa-tile[data-active="false"] .hexa-content sf-icon {
        --icon-color: rgba(224, 232, 255, 0.4);
      }
      .hexa-tile.weather-tile[data-active="true"] .hexa-content sf-icon {
        --icon-color: #ffd60a;
        filter: drop-shadow(0 0 3px #ffd60a);
      }

      .tile-label {
        font-size: 0.625rem;
        font-weight: 500;
        margin-top: 4px;
        max-width: 90%;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        transition: color var(--sf-transition-fast);
      }
      .hexa-tile[data-active="true"] .tile-label {
        color: #ffffff;
        text-shadow: 0 0 5px var(--sf-primary, #00d2ff);
      }
      .hexa-tile[data-active="false"] .tile-label {
        color: rgba(224, 232, 255, 0.4);
      }

      .weather-alert {
        padding: var(--sf-spacing-sm);
        border-radius: var(--sf-radius-sm);
        margin-bottom: var(--sf-spacing-md);
        text-align: center;
        font-size: var(--sf-font-size-sm);
        font-weight: 600;
        width: calc(100% - 2 * var(--sf-spacing-md));
        box-sizing: border-box;
      }
      .weather-alert[data-level="green"] { background: rgba(0,255,157,0.1); color: #00ff9d; }
      .weather-alert[data-level="yellow"] { background: rgba(255,214,10,0.1); color: #ffd60a; }
      .weather-alert[data-level="orange"] { background: rgba(255,107,53,0.1); color: #ff6b35; }
      .weather-alert[data-level="red"] { background: rgba(255,77,109,0.15); color: #ff4d6d; }
    `,
  ];

  @state() private _cols = 2;
  @state() private _minRows = 5;

  private _resizeObserver?: ResizeObserver;

  constructor() {
    super();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.style.setProperty('--cols', String(this._cols));
    
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          this._updateLayout(width);
          this.requestUpdate();
        }
      }
    });
    this._resizeObserver.observe(this);
  }

  override disconnectedCallback(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    super.disconnectedCallback();
  }

  private _updateLayout(width: number): void {
    if (width <= 0) return;

    // Calculate cols based on target width of 150px per hexagon
    // Ensuring minimum 2 columns (for mobile)
    const targetWidth = 150;
    let cols = Math.floor(width / targetWidth - 0.5);
    if (cols < 2) {
      cols = 2;
    }
    
    // Set host style property so :host CSS can read it!
    this.style.setProperty('--cols', String(cols));
    
    // Calculate minRows to fill the screen height
    const headerHeight = 120; // estimated header + margins + alerts
    const tileWidth = width / (cols + 0.5);
    const tileHeight = tileWidth * 1.1547;
    const remainingHeight = window.innerHeight - headerHeight;
    const rowStepHeight = tileHeight * 0.75;
    
    const rowsNeeded = Math.ceil((remainingHeight - tileHeight * 0.25) / rowStepHeight);
    
    this._cols = cols;
    this._minRows = Math.max(rowsNeeded, cols === 2 ? 5 : 2);
  }

  declare config: SciFiHexaTilesConfig;

  protected override renderCard(): TemplateResult {
    const tiles = this.config.tiles ?? [];
    const weather = this.config.weather;

    // connected user details
    const connectedPerson = Object.values(this.hass.states).find(
      state => state.entity_id.startsWith('person.') && state.attributes.user_id === this.hass.user?.id
    );
    const userId = connectedPerson?.entity_id;

    // filter tiles by person visibility
    const visibleTiles = tiles.filter(tile => {
      if (!tile.visibility || tile.visibility.length === 0) return true;
      return userId ? tile.visibility.includes(userId) : true;
    });

    const renderedTiles: TemplateResult[] = [];

    // Prepend weather tile if active
    if (weather?.activate && weather.weather_entity) {
      renderedTiles.push(this._renderWeatherTile(weather));
    }

    // Append custom tiles
    for (const tile of visibleTiles) {
      renderedTiles.push(this._renderCustomTile(tile));
    }

    const tilesPerRow = this._cols;
    const entitiesCount = renderedTiles.length;
    const neededRows = Math.ceil(entitiesCount / tilesPerRow);
    const totalRows = Math.max(neededRows, this._minRows);
    const totalSlots = totalRows * tilesPerRow;

    while (renderedTiles.length < totalSlots) {
      renderedTiles.push(this._renderEmptyTile());
    }

    const tileRows: TemplateResult[][] = [];
    for (let i = 0; i < renderedTiles.length; i += this._cols) {
      tileRows.push(renderedTiles.slice(i, i + this._cols));
    }

    return html`
      <ha-card style="--cols: ${this._cols}">
        ${this._renderHeader(connectedPerson)}
        <div class="container">
          ${weather?.activate ? this._renderWeatherAlert(weather) : ''}
          <div class="hexa-grid">
            ${tileRows.map((row, i) => {
              const isEvenRow = i % 2 === 0;
              return html`
                <div class="hexa-row">
                  ${isEvenRow ? this._renderHalfTile(true) : ''}
                  ${row}
                  ${!isEvenRow ? this._renderHalfTile(false) : ''}
                </div>
              `;
            })}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderHeader(connectedPerson: HassEntity | undefined): TemplateResult {
    const userName = connectedPerson?.attributes.friendly_name ?? this.hass.user?.name ?? 'User';
    const userPicture = connectedPerson?.attributes.entity_picture as string | undefined;
    const personId = connectedPerson?.entity_id;
    const personState = connectedPerson?.state ?? 'home';

    let zoneIcon = 'mdi:home';
    if (personId) {
      const activeZone = Object.values(this.hass.states).find(
        s => s.entity_id.startsWith('zone.') && 
             Array.isArray(s.attributes.persons) && 
             s.attributes.persons.includes(personId)
      );
      if (activeZone?.attributes.icon) {
        zoneIcon = activeZone.attributes.icon as string;
      } else if (personState === 'not_home') {
        zoneIcon = 'mdi:home-off-outline';
      }
    } else {
      if (personState === 'not_home') {
        zoneIcon = 'mdi:home-off-outline';
      }
    }

    return html`
      <div class="header">
        <div class="avatar-container">
          <div class="avatar">
            <div class="avatar-initials">${userName[0]?.toUpperCase()}</div>
            ${userPicture 
              ? html`<img src="${userPicture}" alt="${userName}" style="position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" @error="${(e: Event) => (e.target as HTMLElement).style.display = 'none'}" />` 
              : ''
            }
          </div>
          <div class="status-badge">
            <sf-icon .icon="${zoneIcon}" .connection="${this.hass.connection}"></sf-icon>
          </div>
        </div>
        <div class="header-info">
          <div class="header-message">${this.config.header_message ?? 'Hey, Welcome Back!'}</div>
          <div class="header-name">${userName}</div>
        </div>
      </div>
    `;
  }

  private _renderHalfTile(isLeft: boolean): TemplateResult {
    // For isLeft (left edge), we want the cut line on the left: '0,2 64,42 64,122 0,162'
    // For isRight (right edge), we want the cut line on the right: '66,2 66,162 2,122 2,42'
    const points = isLeft ? '0,2 64,42 64,122 0,162' : '66,2 66,162 2,122 2,42';
    return html`
      <div class="hexa-half ${isLeft ? 'left' : 'right'}">
        <svg viewBox="0 0 66 164">
          <polygon points="${points}" />
        </svg>
      </div>
    `;
  }

  private _renderEmptyTile(): TemplateResult {
    return html`
      <div class="hexa-tile" data-active="false">
        <svg class="hexa-svg" viewBox="0 0 132 164">
          <polygon class="hexa-bg" points="66,2 130,42 130,122 66,162 2,122 2,42" />
          <polygon class="hexa-border" points="66,4 128,43 128,121 66,160 4,121 4,43" />
        </svg>
      </div>
    `;
  }

  private _renderWeatherAlert(weather: NonNullable<SciFiHexaTilesConfig['weather']>): TemplateResult {
    const alertState = weather.weather_alert_entity
      ? this.hass.states[weather.weather_alert_entity]?.state
      : null;
    if (!alertState) return html``;

    const stateToLevel = (state: string): string => {
      const lowerState = state.toLowerCase().trim();
      const green = (weather.state_green ?? 'vert').toLowerCase().trim();
      const yellow = (weather.state_yellow ?? 'jaune').toLowerCase().trim();
      const orange = (weather.state_orange ?? 'orange').toLowerCase().trim();
      const red = (weather.state_red ?? 'rouge').toLowerCase().trim();

      if (lowerState === green) return 'green';
      if (lowerState === yellow) return 'yellow';
      if (lowerState === orange) return 'orange';
      if (lowerState === red) return 'red';
      return 'green';
    };

    const level = stateToLevel(alertState);
    if (level === 'green') return html``; // Hidden on green state per Spec 07

    return html`
      <div class="weather-alert" data-level="${level}">
        ⚠️ Alerte météo : ${alertState}
      </div>
    `;
  }

  private _renderWeatherTile(weather: SciFiHexaTilesConfig['weather']): TemplateResult {
    if (!weather?.weather_entity) return html``;
    const state = this.hass.states[weather.weather_entity];
    if (!state) return html``;
    const name = state.attributes.friendly_name ?? 'Météo';
    const condition = state.state?.toLowerCase();
    const icon = WEATHER_ICON_MAP[condition] ?? 'mdi:weather-cloudy';
    const isActive = condition !== 'clear-night';

    return html`
      <div class="hexa-tile weather-tile" data-active="${isActive ? 'true' : 'false'}" aria-label="${name}" @click="${() => weather.link ? this._navigate(weather.link) : undefined}">
        <svg class="hexa-svg" viewBox="0 0 132 164">
          <polygon class="hexa-bg" points="66,2 130,42 130,122 66,162 2,122 2,42" />
          <polygon class="hexa-border" points="66,4 128,43 128,121 66,160 4,121 4,43" />
        </svg>
        <div class="hexa-content">
          <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
          <span class="tile-label">${name}</span>
        </div>
      </div>
    `;
  }

  private _renderCustomTile(tile: SciFiHexaTileConfig): TemplateResult {
    const entityId = tile.entity;

    // Helper to evaluate active state of a single entity based on config criteria
    const isEntityActive = (entityState: string, id?: string): boolean => {
      const isMedia = id?.startsWith('media_player.');
      if (tile.state_on) {
        if (tile.state_on.includes(entityState)) return true;
        // Special case: if state_on contains 'on', also accept common active states for media_player
        if (tile.state_on.includes('on') && isMedia && ['playing', 'paused', 'on'].includes(entityState)) return true;
        return false;
      }
      if (isMedia) {
        return ['on', 'playing', 'paused'].includes(entityState);
      }
      return entityState === 'on';
    };

    let isActive = false;
    const state = entityId ? this.hass.states[entityId] : undefined;

    if (tile.standalone !== false && entityId) {
      // Standalone tile logic
      isActive = state ? isEntityActive(state.state, entityId) : false;
    } else if (tile.entity_kind) {
      // Aggregated kind tile logic (aggregates multiple entities of the same type/domain)
      const prefix = `${tile.entity_kind}.`;
      const excludes = tile.entities_to_exclude ?? [];

      isActive = Object.values(this.hass.states).some(s => {
        if (!s.entity_id.startsWith(prefix)) return false;
        if (excludes.includes(s.entity_id)) return false;
        return isEntityActive(s.state, s.entity_id);
      });
    }

    const name = tile.name ?? state?.attributes.friendly_name ?? entityId ?? '';

    // Spec 07 domain/kind fallbacks
    const kind = tile.entity_kind ?? (entityId ? entityId.split('.')[0] : '');
    const defaultIcon = kind === 'light' ? 'mdi:lightbulb' 
                      : kind === 'switch' ? 'mdi:power'
                      : kind === 'climate' ? 'mdi:thermometer'
                      : 'mdi:toggle-switch';

    const icon = isActive
      ? (tile.active_icon ?? state?.attributes.icon ?? defaultIcon)
      : (tile.inactive_icon ?? state?.attributes.icon ?? defaultIcon);

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
        <svg class="hexa-svg" viewBox="0 0 132 164">
          <polygon class="hexa-bg" points="66,2 130,42 130,122 66,162 2,122 2,42" />
          <polygon class="hexa-border" points="66,4 128,43 128,121 66,160 4,121 4,43" />
        </svg>
        <div class="hexa-content">
          <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
          <span class="tile-label">${name}</span>
        </div>
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
