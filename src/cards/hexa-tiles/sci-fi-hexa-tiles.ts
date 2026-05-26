/**
 * <sci-fi-hexa-tiles> — v1.0.0
 * Hexagonal tile dashboard: weather overview, person presence, custom tiles.
 * ADR-005: tiles use entity/active_icon/inactive_icon/state_on/link (not entity_id/icon/tap_action).
 */

import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiHexaTilesConfig, SciFiHexaTileConfig } from '../../types/config.js';
import type { HassEntity } from '../../types/ha.js';
import { fireHassAction } from '../../utils/action.js';

import { hexaTilesStyles } from './styles.js';

const TAG = 'sci-fi-hexa-tiles';

@customElement(TAG)
export class SciFiHexaTilesCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    hexaTilesStyles,
  ];

  protected override getRelevantEntities(): string[] {
    const entities = new Set<string>();

    if (this.config.weather?.weather_entity) {
      entities.add(this.config.weather.weather_entity);
    }
    if (this.config.weather?.weather_alert_entity) {
      entities.add(this.config.weather.weather_alert_entity);
    }

    // Track person and zone entities for header
    for (const entityId of Object.keys(this.hass?.states || {})) {
      if (entityId.startsWith('person.') || entityId.startsWith('zone.')) {
        entities.add(entityId);
      }
    }

    // Track custom tiles
    if (this.config.tiles) {
      for (const tile of this.config.tiles) {
        if (tile.entity) {
          entities.add(tile.entity);
        }
        if (tile.entity_kind) {
          const prefix = `${tile.entity_kind}.`;
          const excludes = tile.entities_to_exclude ?? [];
          for (const entityId of Object.keys(this.hass?.states || {})) {
            if (entityId.startsWith(prefix) && !excludes.includes(entityId)) {
              entities.add(entityId);
            }
          }
        }
      }
    }

    return Array.from(entities);
  }

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
      this._resizeObserver = undefined;
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

  private _getAlertLevel(weather: NonNullable<SciFiHexaTilesConfig['weather']>): string {
    const alertState = weather.weather_alert_entity
      ? this.hass.states[weather.weather_alert_entity]?.state
      : null;
    if (!alertState) return 'green';

    const lowerState = alertState.toLowerCase().trim();
    const green = (weather.state_green ?? 'vert').toLowerCase().trim();
    const yellow = (weather.state_yellow ?? 'jaune').toLowerCase().trim();
    const orange = (weather.state_orange ?? 'orange').toLowerCase().trim();
    const red = (weather.state_red ?? 'rouge').toLowerCase().trim();

    if (lowerState === green) return 'green';
    if (lowerState === yellow) return 'yellow';
    if (lowerState === orange) return 'orange';
    if (lowerState === red) return 'red';
    return 'green';
  }

  private _renderWeatherAlert(weather: NonNullable<SciFiHexaTilesConfig['weather']>): TemplateResult {
    const alertEntity = weather.weather_alert_entity
      ? this.hass.states[weather.weather_alert_entity]
      : null;
    if (!alertEntity) return html``;

    const level = this._getAlertLevel(weather);
    if (level === 'green') return html``; // Hidden on green state per Spec 07

    // Same logic as sci-fi-weather: attribute keys are phenomenon names (e.g. "canicule"),
    // attribute values are the alert level color (e.g. "Jaune"). Display matching keys.
    const nonGreenValues = new Set([
      (weather.state_yellow ?? 'jaune').toLowerCase().trim(),
      (weather.state_orange ?? 'orange').toLowerCase().trim(),
      (weather.state_red ?? 'rouge').toLowerCase().trim(),
    ]);
    const activeLabels = Object.keys(alertEntity.attributes)
      .filter(key => nonGreenValues.has(String(alertEntity.attributes[key]).toLowerCase().trim()))
      .join(', ');

    const label = activeLabels || alertEntity.state;

    return html`
      <div class="weather-alert" data-level="${level}">
        ⚠️ Alerte météo : ${label}
      </div>
    `;
  }

  private _renderWeatherTile(weather: SciFiHexaTilesConfig['weather']): TemplateResult {
    if (!weather?.weather_entity) return html``;
    const state = this.hass.states[weather.weather_entity];
    if (!state) return html``;
    const name = state.attributes.friendly_name ?? 'Météo';
    const condition = state.state?.toLowerCase() ?? 'unknown';
    
    // Determine day/night for animated weather icons
    const sunEntity = this.hass?.states['sun.sun'];
    const isDay = sunEntity ? sunEntity.state !== 'below_horizon' : true;
    
    // Default fallback to cloudy if condition is unknown/unsupported by sf icons
    let iconName = `${condition}-${isDay ? 'day' : 'night'}`;
    // Basic check for supported sf weather icons (since we know the list)
    const supportedConditions = ['clear-night', 'clear', 'cloudy', 'fog', 'hail', 'lightning', 'lightning-rainy', 'partlycloudy', 'pouring', 'rainy', 'snowy', 'snowy-rainy', 'sunny', 'windy', 'windy-variant'];
    if (!supportedConditions.includes(condition)) {
      iconName = `cloudy-${isDay ? 'day' : 'night'}`;
    }
    
    const icon = `sf:${iconName}`;
    const isActive = condition !== 'clear-night';

    // Compute alert level to color the tile border accordingly
    const alertLevel = weather.weather_alert_entity ? this._getAlertLevel(weather) : 'green';

    return html`
      <div
        class="hexa-tile weather-tile"
        data-active="${isActive ? 'true' : 'false'}"
        data-alert-level="${alertLevel}"
        aria-label="${name}"
        @click="${() => weather.link ? this._navigate(weather.link) : undefined}"
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

    const handleClick = (e: MouseEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      if (tile.tap_action) {
        fireHassAction(this, tile, 'tap');
      } else if (tile.link) {
        this._navigate(tile.link);
      } else if (tile.entity) {
        fireHassAction(this, {
          entity: tile.entity,
          tap_action: { action: 'more-info' }
        }, 'tap');
      }
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

  override getCardSize(): number {
    return this.config ? 6 : 3;
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
