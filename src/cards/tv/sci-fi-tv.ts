/**
 * <sci-fi-tv> — v1.1
 * Futuristic TV remote control with orbital volume dial and bridge D-pad.
 */

import { html, type TemplateResult } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { tvStyles } from './style.js';
import { fireHassAction } from '../../utils/action.js';
import type { SciFiTVConfig, SciFiTVCustomActions } from '../../types/config.js';

const TAG = 'sci-fi-tv';

// Honeycomb pointy-top hexagon points
const HEXA_BG = '22,1 43,13 43,38 22,50 1,38 1,13';
const HEXA_BORDER = '22,2 42,14 42,37 22,49 2,37 2,14';

const D_PAD_KEYS = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  confirm: 'Confirm',
  back: 'Back',
  home: 'Home',
  menu: 'Menu',
} as const;

@customElement(TAG)
export class SciFiTVCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    tvStyles,
  ];

  @query('.dial-svg') private _dialSvg!: SVGSVGElement | null;

  @state() private _isDragging = false;
  @state() private _activePointerId: number | null = null;
  @state() private _localVolume: number | null = null;

  private _lastVolumeCall = 0;

  declare config: SciFiTVConfig;

  protected override getRelevantEntities(): string[] {
    return [
      this.config.entity,
      this.config.remote_entity
    ].filter((e): e is string => e !== undefined && e !== null && e !== '');
  }

  override setConfig(config: SciFiTVConfig): void {
    if (!config.entity) {
      throw new Error('Missing entity configuration parameter.');
    }
    super.setConfig(config);
  }

  protected override renderCard(): TemplateResult {
    const entityId = this.config.entity;
    const tvState = this.hass.states[entityId];

    if (!tvState) {
      return html`
        <ha-card>
          <div class="offline-banner">${msg('TACTICAL BRIDGE DISCONNECTED')}</div>
        </ha-card>
      `;
    }

    const stateStr = tvState.state;
    const isUnavailable = stateStr === 'unavailable' || stateStr === 'unknown';
    const isOff = stateStr === 'off';
    const isOn = !isOff && !isUnavailable;

    // Get current volume
    const currentVolume = tvState.attributes.volume_level !== undefined 
      ? Number(tvState.attributes.volume_level) 
      : 0.0;
    
    const displayVolume = this._isDragging && this._localVolume !== null
      ? this._localVolume
      : currentVolume;

    const volumePercent = Math.round(displayVolume * 100);

    // Get title/source text
    const sourceLabel = tvState.attributes.source as string | undefined;
    const mediaTitle = tvState.attributes.media_title as string | undefined;
    
    let subtext = msg('SYSTEM ONLINE');
    if (isUnavailable) {
      subtext = msg('SYSTEM OFFLINE');
    } else if (isOff) {
      subtext = msg('STANDBY');
    } else if (mediaTitle) {
      subtext = mediaTitle;
    } else if (sourceLabel) {
      subtext = sourceLabel;
    }

    // Render volume arc math
    // 270 degrees total sweep. Circumference = 2 * PI * 75 = 471.24
    // Length of stroke = 270 / 360 * 471.24 = 353.43
    // Offset ranges from 353.43 (0%) to 0 (100%)
    const maxSweep = 270;
    const circ = 2 * Math.PI * 75;
    const strokeLength = (maxSweep / 360) * circ;
    
    // Minimum 3 degrees visible arc (3 / 270 = 0.011) to avoid total zero length
    const normalizedVol = displayVolume <= 0.0 && isOn ? 0.011 : displayVolume;
    const activeSweep = normalizedVol * strokeLength;
    const dashOffset = strokeLength - activeSweep;

    // Orbit satellite coordinates along circular track
    const angleDegrees = 225 - normalizedVol * 270;
    const angleRad = (angleDegrees * Math.PI) / 180;
    const satelliteX = 100 + 75 * Math.cos(angleRad);
    const satelliteY = 100 - 75 * Math.sin(angleRad);

    return html`
      <ha-card>
        <div class="container">
          <!-- Header Row -->
          <div class="header">
            <div class="info">
              <button
                class="header-power ${isOff ? 'is-off' : ''}"
                title="${isOn ? msg('Turn Off') : msg('Turn On')}"
                ?disabled="${isUnavailable}"
                @click="${() => this._togglePower(isOn)}"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 2v10M6.34 5.34a9 9 0 1 0 11.32 0" stroke="round" stroke-linecap="round"/>
                </svg>
              </button>
              <span class="header-text">${this.config.name ?? 'Planet Orbit Exit'}</span>
            </div>
          </div>

          <!-- Telemetry Status Bar -->
          <div class="telemetry-status-bar">
            <div class="status-segment segment-left">
              <span class="segment-indicator ${isUnavailable ? 'is-offline' : (isOff ? 'is-standby' : 'is-active')}"></span>
              <span class="segment-title">${msg('TRANSMISSION:')}</span>
              <span class="segment-value">${isUnavailable ? msg('OFFLINE') : (isOff ? msg('STANDBY') : msg('ACTIVE'))}</span>
            </div>
            <div class="status-segment segment-right">
              <span class="segment-title">${msg('PLAYING:')}</span>
              <span class="segment-value highlight">${isUnavailable ? msg('DISCONNECTED') : (isOff ? msg('STANDBY') : (mediaTitle || sourceLabel || msg('IDLE')))}</span>
            </div>
          </div>

          <!-- Active Workspace Viewport -->
          <div class="bridge-layout">
            
            <!-- SVGs Dial -->
            <div class="dial-section">
              <svg 
                class="dial-svg" 
                viewBox="0 0 200 200"
                @pointerdown="${(e: PointerEvent) => this._onPointerDown(e)}"
                @pointermove="${(e: PointerEvent) => this._onPointerMove(e)}"
                @pointerup="${(e: PointerEvent) => this._onPointerUp(e)}"
                @pointercancel="${(e: PointerEvent) => this._onPointerUp(e)}"
              >
                <!-- Radar grid markings -->
                <circle cx="100" cy="100" r="95" class="dial-grid" stroke-dasharray="2, 6"/>
                <circle cx="100" cy="100" r="55" class="dial-grid" stroke-dasharray="1, 4"/>
                
                <!-- Central sci-fi planet with ring -->
                <g class="planet-group">
                  <!-- Diagonal ring backing -->
                  <ellipse cx="100" cy="100" rx="32" ry="6" transform="rotate(-25 100 100)" class="planet-ring-back" />
                  <!-- Planet body -->
                  <circle cx="100" cy="100" r="18" class="planet-body" />
                  <!-- Diagonal ring front -->
                  <path d="M 68 100 A 32 6 0 0 0 132 100" transform="rotate(-25 100 100)" class="planet-ring-front" />
                  <!-- Planet orbiting satellite -->
                  <g transform="rotate(-25 100 100)">
                    <circle cx="100" cy="100" r="2.5" class="planet-orbit-satellite ${isOff || isUnavailable ? 'is-off' : ''}" />
                  </g>
                </g>

                <!-- Background dial track (opening at bottom-center: starts -135deg, sweeps 270deg) -->
                <path 
                  d="M 46.97 153.03 A 75 75 0 1 1 153.03 153.03" 
                  class="dial-track"
                />
                
                <!-- Active dial sweep -->
                <path 
                  d="M 46.97 153.03 A 75 75 0 1 1 153.03 153.03" 
                  class="dial-active ${isOff || isUnavailable ? 'is-off' : ''}"
                  stroke-dasharray="${strokeLength}"
                  stroke-dashoffset="${dashOffset}"
                  opacity="${isOff || isUnavailable ? 0.2 : (displayVolume <= 0.0 ? 0.4 : 1.0)}"
                />

                <!-- Orbit Satellite Marker -->
                ${isOn ? html`
                  <circle 
                    cx="${satelliteX}" 
                    cy="${satelliteY}" 
                    r="5" 
                    class="dial-satellite"
                  />
                ` : ''}
              </svg>
              
              <!-- Core volume state reading -->
              <div class="dial-label-container">
                <span class="dial-value ${isOff || isUnavailable ? 'is-off' : ''}">
                  ${isUnavailable ? '---' : (isOff ? msg('OFF') : `${volumePercent}%`)}
                </span>
                <span class="dial-title">${subtext}</span>
              </div>
            </div>

            <!-- Tactical Controls panel -->
            <div class="control-section">
              <!-- Grid D-pad -->
              <div class="dpad-container">
                <button class="dpad-btn btn-up" data-key="up" ?disabled="${!isOn}" @click="${() => this._handleDpadClick('up')}">
                  <sf-icon icon="mdi:chevron-up" .connection="${this.hass.connection}"></sf-icon>
                </button>
                <button class="dpad-btn btn-left" data-key="left" ?disabled="${!isOn}" @click="${() => this._handleDpadClick('left')}">
                  <sf-icon icon="mdi:chevron-left" .connection="${this.hass.connection}"></sf-icon>
                </button>
                <button class="dpad-btn btn-confirm" data-key="confirm" ?disabled="${!isOn}" @click="${() => this._handleDpadClick('confirm')}">
                  <sf-icon icon="mdi:circle-outline" .connection="${this.hass.connection}"></sf-icon>
                </button>
                <button class="dpad-btn btn-right" data-key="right" ?disabled="${!isOn}" @click="${() => this._handleDpadClick('right')}">
                  <sf-icon icon="mdi:chevron-right" .connection="${this.hass.connection}"></sf-icon>
                </button>
                <button class="dpad-btn btn-down" data-key="down" ?disabled="${!isOn}" @click="${() => this._handleDpadClick('down')}">
                  <sf-icon icon="mdi:chevron-down" .connection="${this.hass.connection}"></sf-icon>
                </button>
              </div>

              <!-- Supplementary Buttons Row -->
              <div class="remote-row">
                <button class="row-btn" data-key="back" ?disabled="${!isOn}" @click="${() => this._handleDpadClick('back')}">${msg('Back')}</button>
                <button class="row-btn" data-key="home" ?disabled="${!isOn}" @click="${() => this._handleDpadClick('home')}">${msg('Home')}</button>
                <button class="row-btn" data-key="menu" ?disabled="${!isOn}" @click="${() => this._handleDpadClick('menu')}">${msg('Menu')}</button>
              </div>
            </div>
          </div>

          <!-- Honeycomb Quick-Select Panel -->
          ${this.config.sources && this.config.sources.length > 0 ? html`
            <div class="sources-panel">
              ${this.config.sources.map(src => {
                const isActive = sourceLabel === src;
                return html`
                  <div
                    class="source-hexa"
                    data-active="${isActive}"
                    data-disabled="${!isOn}"
                    title="${msg('Select Source')}: ${src}"
                    @click="${() => { if (isOn) this._selectSource(src); }}"
                  >
                    <svg viewBox="0 0 44 51">
                      <polygon class="hexa-bg" points="${HEXA_BG}"/>
                      <polygon class="hexa-border" points="${HEXA_BORDER}"/>
                    </svg>
                    <div class="hexa-content">${src}</div>
                  </div>
                `;
              })}
            </div>
          ` : ''}

          <!-- Offline / Standsby caution bar -->
          ${isUnavailable ? html`<div class="offline-banner">${msg('TACTICAL BRIDGE DISCONNECTED')}</div>` : ''}
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  // ── Drag & Trigonometry Math ───────────────────────────────────────────────

  private _onPointerDown(e: PointerEvent): void {
    const tvState = this.hass.states[this.config.entity];
    if (!tvState || tvState.state === 'off' || tvState.state === 'unavailable') return;

    if (this._dialSvg) {
      e.preventDefault();
      this._dialSvg.setPointerCapture(e.pointerId);
      this._isDragging = true;
      this._activePointerId = e.pointerId;
      this._handleDrag(e);
    }
  }

  private _onPointerMove(e: PointerEvent): void {
    if (this._isDragging && this._activePointerId === e.pointerId) {
      e.preventDefault();
      this._handleDrag(e);
    }
  }

  private _onPointerUp(e: PointerEvent): void {
    if (this._isDragging && this._activePointerId === e.pointerId) {
      e.preventDefault();
      if (this._dialSvg) {
        this._dialSvg.releasePointerCapture(e.pointerId);
      }
      this._isDragging = false;
      this._activePointerId = null;
      this._localVolume = null;
    }
  }

  override disconnectedCallback(): void {
    this._isDragging = false;
    this._activePointerId = null;
    super.disconnectedCallback();
  }

  private _handleDrag(e: PointerEvent): void {
    if (!this._dialSvg) return;

    // Coordinate conversion (DOM -> SVG viewbox)
    const bbox = this._dialSvg.getBoundingClientRect();
    const svgX = ((e.clientX - bbox.left) / bbox.width) * 200;
    const svgY = ((e.clientY - bbox.top) / bbox.height) * 200;
    
    const cx = 100;
    const cy = 100;

    // Angle math & clamp
    const thetaDeg = Math.atan2(svgY - cy, svgX - cx) * (180 / Math.PI);
    
    // Shift origin so -135deg (top-left) corresponds to 0deg
    const shiftedDeg = (thetaDeg + 135 + 360) % 360;
    
    // Dead-zone clamp: if pointer lands in bottom 90-degree gap, snap to nearest end
    const clampedDeg = shiftedDeg > 270 ? (shiftedDeg > 315 ? 0 : 270) : shiftedDeg;
    
    const volumeLevel = Math.round((clampedDeg / 270) * 100) / 100;

    this._localVolume = volumeLevel;
    this._throttleVolumeCall(this.config.entity, volumeLevel);
  }

  private _throttleVolumeCall(entityId: string, volume: number): void {
    const now = Date.now();
    if (now - this._lastVolumeCall >= 80) {
      this._lastVolumeCall = now;
      void this.hass.callService('media_player', 'volume_set', {
        entity_id: entityId,
        volume_level: volume
      }).catch((err: Error) => {
        this._showToast(err.message);
      });
    }
  }

  // ── Remote Action Executors ───────────────────────────────────────────────

  private _handleDpadClick(btn: keyof SciFiTVCustomActions): void {
    const customAction = this.config.custom_actions?.[btn];
    
    if (customAction) {
      // Lovelace Tap Action mode
      fireHassAction(this, { tap_action: customAction }, 'tap');
    } else if (this.config.remote_entity) {
      // Default remote mapping mode (PascalCase command strings)
      const commandString = D_PAD_KEYS[btn];
      void this.hass.callService('remote', 'send_command', {
        entity_id: this.config.remote_entity,
        command: commandString,
      }).catch(() => {
        this._showToast('Remote command failed');
      });
    }
  }

  private _selectSource(source: string): void {
    void this.hass.callService('media_player', 'select_source', {
      entity_id: this.config.entity,
      source,
    }).catch((err: Error) => {
      this._showToast(err.message);
    });
  }

  private _togglePower(isOn: boolean): void {
    void this.hass.callService('media_player', isOn ? 'turn_off' : 'turn_on', {
      entity_id: this.config.entity,
    }).catch((err: Error) => {
      this._showToast(err.message);
    });
  }

  private _showToast(text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, true);
  }

  // ── Element registration hooks ────────────────────────────────────────────

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiTVConfig {
    return {
      type: `custom:${TAG}`,
      entity: 'media_player.bravia_4k_vh22',
    };
  }

  override getCardSize(): number {
    return 5;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiTVCard;
  }
}
