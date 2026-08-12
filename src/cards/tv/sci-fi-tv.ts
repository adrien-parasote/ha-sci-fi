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
import type { HassEntity } from '../../types/ha.js';
import type { SciFiTVConfig, SciFiTVCustomActions } from './config.js';

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


/** Volume-arc geometry for the orbital dial. */
interface DialGeometry {
  readonly strokeLength: number;
  readonly dashOffset: number;
  readonly satelliteX: number;
  readonly satelliteY: number;
}

/** Everything the render needs, derived from hass once per render. */
interface TvViewModel {
  readonly isUnavailable: boolean;
  readonly isOff: boolean;
  readonly isOn: boolean;
  readonly displayVolume: number;
  readonly volumePercent: number;
  readonly sourceLabel: string | undefined;
  readonly mediaTitle: string | undefined;
  readonly appName: string | undefined;
  readonly appId: string | undefined;
  readonly subtext: string;
  readonly dial: DialGeometry;
}

/**
 * 270-degree sweep on a r=75 circle. Circumference = 2 * PI * 75 = 471.24,
 * so the full stroke is 270/360 * 471.24 = 353.43 and the offset runs from
 * 353.43 (0%) down to 0 (100%). A muted-but-on dial keeps a 3-degree arc
 * (3/270 = 0.011) so it never collapses to zero length.
 */
function computeDialGeometry(displayVolume: number, isOn: boolean): DialGeometry {
  const strokeLength = (270 / 360) * (2 * Math.PI * 75);
  const normalizedVol = displayVolume <= 0.0 && isOn ? 0.011 : displayVolume;
  const angleRad = ((225 - normalizedVol * 270) * Math.PI) / 180;
  return {
    strokeLength,
    dashOffset: strokeLength - normalizedVol * strokeLength,
    satelliteX: 100 + 75 * Math.cos(angleRad),
    satelliteY: 100 - 75 * Math.sin(angleRad),
  };
}

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
      this.config.volume_entity,
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
    const tvState = this.hass.states[this.config.entity];
    if (!tvState) {
      return html`
        <ha-card>
          <div class="offline-banner">${msg('TACTICAL BRIDGE DISCONNECTED')}</div>
        </ha-card>
      `;
    }

    const vm = this._readViewModel(tvState);
    return html`
      <ha-card>
        <div class="container">
          ${this._renderHeader(vm)}
          ${this._renderTelemetryBar(vm)}
          <div class="bridge-layout">
            ${this._renderDial(vm)}
            ${this._renderControls(vm)}
          </div>
          ${this._renderSourcesPanel(vm)}
          ${vm.isUnavailable
            ? html`<div class="offline-banner">${msg('TACTICAL BRIDGE DISCONNECTED')}</div>`
            : ''}
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  // ── View model ─────────────────────────────────────────────────────────────

  /**
   * Everything the render derives from hass, computed once. Keeping this out of
   * renderCard() is what keeps the render a composition rather than a 261-line
   * function (ADR-017 step 6).
   */
  private _readViewModel(tvState: HassEntity): TvViewModel {
    const entityId = this.config.entity;
    const stateStr = tvState.state;
    const isUnavailable = stateStr === 'unavailable' || stateStr === 'unknown';
    const isOff = stateStr === 'off';
    const isOn = !isOff && !isUnavailable;

    // Volume comes from volume_entity when configured, otherwise the main entity.
    const volState = this.hass.states[this.config.volume_entity || entityId];
    const currentVolume = volState?.attributes?.volume_level !== undefined
      ? Number(volState.attributes.volume_level)
      : 0.0;
    const displayVolume = this._isDragging && this._localVolume !== null
      ? this._localVolume
      : currentVolume;

    const appState = this.hass.states[this.config.app_entity || entityId];

    // Metadata from the app entity first…
    let sourceLabel = appState?.attributes?.source as string | undefined;
    let mediaTitle = appState?.attributes?.media_title as string | undefined;
    let appName = appState?.attributes?.app_name as string | undefined;
    let appId = appState?.attributes?.app_id as string | undefined;

    // …and if it provides nothing (e.g. idle cast), fall back to volume/main entity.
    if (!sourceLabel && !mediaTitle && !appName && !appId) {
      sourceLabel = (volState?.attributes?.source || tvState.attributes.source) as string | undefined;
      mediaTitle = (volState?.attributes?.media_title || tvState.attributes.media_title) as string | undefined;
      appName = (volState?.attributes?.app_name || tvState.attributes.app_name) as string | undefined;
      appId = (volState?.attributes?.app_id || tvState.attributes.app_id) as string | undefined;
    }

    let subtext = msg('SYSTEM ONLINE');
    if (isUnavailable) subtext = msg('SYSTEM OFFLINE');
    else if (isOff) subtext = msg('STANDBY');
    else if (mediaTitle) subtext = mediaTitle;
    else if (appName) subtext = appName;
    else if (sourceLabel) subtext = sourceLabel;
    else if (appId) subtext = appId;

    return {
      isUnavailable,
      isOff,
      isOn,
      displayVolume,
      volumePercent: Math.round(displayVolume * 100),
      sourceLabel,
      mediaTitle,
      appName,
      appId,
      subtext,
      dial: computeDialGeometry(displayVolume, isOn),
    };
  }

  // ── Header ─────────────────────────────────────────────────────────────────

  private _renderHeader(vm: TvViewModel): TemplateResult {
    return html`
      <div class="header">
        <div class="info">
          <button
            class="header-power ${vm.isOff ? 'is-off' : ''}"
            title="${this._getPowerButtonTitle(vm.isOn)}"
            ?disabled="${vm.isUnavailable}"
            @click="${() => this._togglePower(vm.isOn)}"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 2v10M6.34 5.34a9 9 0 1 0 11.32 0" stroke="round" stroke-linecap="round"/>
            </svg>
          </button>
          <span class="header-text">${this.config.name ?? 'Planet Orbit Exit'}</span>
        </div>
      </div>
    `;
  }

  private _renderTelemetryBar(vm: TvViewModel): TemplateResult {
    const indicator = vm.isUnavailable ? 'is-offline' : (vm.isOff ? 'is-standby' : 'is-active');
    return html`
      <div class="telemetry-status-bar">
        <div class="status-segment segment-left">
          <span class="segment-indicator ${indicator}"></span>
          <span class="segment-title">${msg('TRANSMISSION:')}</span>
          <span class="segment-value">${this._getTransmissionStatus(vm.isUnavailable, vm.isOff)}</span>
        </div>
        <div class="status-segment segment-right">
          <span class="segment-title">${msg('PLAYING:')}</span>
          <span class="segment-value highlight">${this._getPlayingStatus(vm.isUnavailable, vm.isOff, vm.mediaTitle, vm.appName, vm.sourceLabel, vm.appId)}</span>
        </div>
      </div>
    `;
  }

  // ── Orbital volume dial ────────────────────────────────────────────────────

  private _renderDial(vm: TvViewModel): TemplateResult {
    const dimmed = vm.isOff || vm.isUnavailable;
    return html`
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
            <ellipse cx="100" cy="100" rx="32" ry="6" transform="rotate(-25 100 100)" class="planet-ring-back" />
            <circle cx="100" cy="100" r="18" class="planet-body" />
            <path d="M 68 100 A 32 6 0 0 0 132 100" transform="rotate(-25 100 100)" class="planet-ring-front" />
            <g transform="rotate(-25 100 100)">
              <circle cx="100" cy="100" r="2.5" class="planet-orbit-satellite ${dimmed ? 'is-off' : ''}" />
            </g>
          </g>

          <!-- Background dial track (opening at bottom-center: starts -135deg, sweeps 270deg) -->
          <path d="M 46.97 153.03 A 75 75 0 1 1 153.03 153.03" class="dial-track" />

          <!-- Active dial sweep -->
          <path
            d="M 46.97 153.03 A 75 75 0 1 1 153.03 153.03"
            class="dial-active ${dimmed ? 'is-off' : ''}"
            stroke-dasharray="${vm.dial.strokeLength}"
            stroke-dashoffset="${vm.dial.dashOffset}"
            opacity="${dimmed ? 0.2 : (vm.displayVolume <= 0.0 ? 0.4 : 1.0)}"
          />

          <!-- Orbit satellite marker -->
          ${vm.isOn
            ? html`<circle cx="${vm.dial.satelliteX}" cy="${vm.dial.satelliteY}" r="5" class="dial-satellite" />`
            : ''}
        </svg>

        <!-- Core volume state reading -->
        <div class="dial-label-container">
          <span class="dial-value ${dimmed ? 'is-off' : ''}">
            ${vm.isUnavailable ? '---' : (vm.isOff ? msg('OFF') : `${vm.volumePercent}%`)}
          </span>
          <span class="dial-title">${vm.subtext}</span>
        </div>

        <!-- Mute button row -->
        <div class="mute-row">
          <button class="mute-btn" data-key="volume_mute" ?disabled="${!vm.isOn}" @click="${() => this._handleDpadClick('volume_mute')}">
            <sf-icon icon="mdi:volume-off" .connection="${this.hass.connection}"></sf-icon>
          </button>
        </div>
      </div>
    `;
  }

  // ── D-pad + supplementary buttons ──────────────────────────────────────────

  private _renderControls(vm: TvViewModel): TemplateResult {
    const dpad = (
      [
        ['up', 'btn-up', 'mdi:chevron-up'],
        ['left', 'btn-left', 'mdi:chevron-left'],
        ['confirm', 'btn-confirm', 'mdi:circle-outline'],
        ['right', 'btn-right', 'mdi:chevron-right'],
        ['down', 'btn-down', 'mdi:chevron-down'],
      ] as const
    ).map(([key, cls, icon]) => html`
      <button class="dpad-btn ${cls}" data-key="${key}" ?disabled="${!vm.isOn}" @click="${() => this._handleDpadClick(key)}">
        <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
      </button>
    `);

    return html`
      <div class="control-section">
        <div class="dpad-container">${dpad}</div>
        <div class="remote-row">
          <button class="row-btn" data-key="back" ?disabled="${!vm.isOn}" @click="${() => this._handleDpadClick('back')}">${msg('Back')}</button>
          <button class="row-btn" data-key="home" ?disabled="${!vm.isOn}" @click="${() => this._handleDpadClick('home')}">${msg('Home')}</button>
          <button class="row-btn" data-key="menu" ?disabled="${!vm.isOn}" @click="${() => this._handleDpadClick('menu')}">${msg('Menu')}</button>
        </div>
      </div>
    `;
  }

  // ── Honeycomb quick-select panel ───────────────────────────────────────────

  private _renderSourcesPanel(vm: TvViewModel): TemplateResult | string {
    const sources = this.config.sources;
    if (!sources || sources.length === 0) return '';

    const activeLabels = [vm.appName, vm.sourceLabel, vm.appId, vm.mediaTitle]
      .filter(Boolean)
      .map(v => v!.toLowerCase());

    const activeSourceIndex = sources.findIndex(src => {
      const srcName = typeof src === 'string' ? src : src.name;
      const srcId = typeof src === 'object' && ((src as any).data?.media_content_id || (src as any).service_data?.media_content_id);
      return activeLabels.some(val => val === srcName.toLowerCase() || (srcId && val === srcId.toLowerCase()));
    });

    return html`
      <div class="sources-panel">
        ${sources.map((src, index) => {
          const srcName = typeof src === 'string' ? src : src.name;
          return html`
            <div
              class="source-hexa"
              data-active="${index === activeSourceIndex}"
              data-disabled="${!vm.isOn}"
              title="${msg('Select Source')}: ${srcName}"
              @click="${() => { if (vm.isOn) this._selectSource(src); }}"
            >
              <svg viewBox="0 0 44 51">
                <polygon class="hexa-bg" points="${HEXA_BG}"/>
                <polygon class="hexa-border" points="${HEXA_BORDER}"/>
              </svg>
              <div class="hexa-content">${srcName}</div>
            </div>
          `;
        })}
      </div>
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
    const volEntityId = this.config.volume_entity || this.config.entity;
    this._throttleVolumeCall(volEntityId, volumeLevel);
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
      const commandString = D_PAD_KEYS[btn as keyof typeof D_PAD_KEYS];
      void this.hass.callService('remote', 'send_command', {
        entity_id: this.config.remote_entity,
        command: commandString,
      }).catch(() => {
        this._showToast('Remote command failed');
      });
    }
  }

  private _selectSource(source: string | Record<string, any>): void {
    if (typeof source === 'string') {
      const targetEntityId = this.config.volume_entity || this.config.entity;
      void this.hass.callService('media_player', 'select_source', {
        entity_id: targetEntityId,
        source,
      }).catch((err: Error) => {
        this._showToast(err.message);
      });
    } else {
      // Direct service execution for 'call-service' or 'perform-action'
      if (source.action === 'call-service' || source.action === 'perform-action') {
        const [domain, srv] = (source.service || source.perform_action || '').split('.');
        if (domain && srv) {
          const payload = { 
            ...(source.data || source.service_data || {}),
            ...(source.target || {})
          };
          void this.hass.callService(domain, srv, payload).catch((err: Error) => {
            this._showToast(err.message);
          });
          return;
        }
      }
      
      // Fallback for other actions (navigate, url, etc.)
      fireHassAction(this, { tap_action: source as any }, 'tap');
    }
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

  private _getPowerButtonTitle(isOn: boolean): string {
    return [msg('Turn On'), msg('Turn Off')][isOn ? 1 : 0] as string;
  }

  private _getTransmissionStatus(isUnavailable: boolean, isOff: boolean): string {
    if (isUnavailable) {
      return msg('OFFLINE');
    }
    return [msg('ACTIVE'), msg('STANDBY')][isOff ? 1 : 0] as string;
  }

  private _getPlayingStatus(
    isUnavailable: boolean,
    isOff: boolean,
    mediaTitle: string | undefined,
    appName: string | undefined,
    sourceLabel: string | undefined,
    appId: string | undefined
  ): string {
    if (isUnavailable) {
      return msg('DISCONNECTED');
    }
    if (isOff) {
      return msg('STANDBY');
    }
    return mediaTitle || appName || sourceLabel || appId || msg('IDLE');
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
