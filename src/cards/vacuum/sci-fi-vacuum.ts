/**
 * <sci-fi-vacuum> — v1.0.0
 * Robot vacuum control: animated sub-header icon, header (name + fan speed + battery + mop),
 * info sensors (area + duration), full-width map, actions bar (sf-button), device navigation.
 * Spec 15 — ported from main:src/cards/vacuum/card.js
 * ADR-005: uses entity (not entity_id), mop_intensite (FR), shortcuts preserved.
 */

import { html, nothing, type TemplateResult, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';

import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { vacuumStyles } from './styles.js';
import type {
  SciFiVacuumConfig,
  SciFiVacuumEntry,
  SciFiVacuumShortcutDescription,
} from '../../types/config.js';
import {
  VACUUM_ICONS,
  VACUUM_ACTIVITY_STATE,
  VACUUM_ACTIONS_ICONS,
  VACUUM_ACTION_KEYS,
  VACUUM_ACTION_SET_FAN_SPEED,
} from './vacuum_const.js';

import '../../components/sf-icon/sf-icon.js';
import '../../components/buttons/sf-button.js';
import '../../components/sf-dropdown.js';
import '../../components/sf-toast.js';

const TAG = 'sci-fi-vacuum';

@customElement(TAG)
export class SciFiVacuumCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, vacuumStyles];

  protected override getRelevantEntities(): string[] {
    const entities = new Set<string>();

    if (this.config.vacuums) {
      for (const v of this.config.vacuums) {
        if (v.entity) {
          entities.add(v.entity);
        }
        if (v.sensors) {
          if (v.sensors.battery) entities.add(v.sensors.battery);
          if (v.sensors.mop_intensite) entities.add(v.sensors.mop_intensite);
          if (v.sensors.current_clean_area) entities.add(v.sensors.current_clean_area);
          if (v.sensors.current_clean_duration) entities.add(v.sensors.current_clean_duration);
          if (v.sensors.map) entities.add(v.sensors.map);
        }
      }
    }

    return Array.from(entities);
  }

  declare config: SciFiVacuumConfig;

  @state() private _vacuum_selected_id: number = 0;

  override willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has('config')) {
      const len = this.config.vacuums?.length ?? 0;
      if (this._vacuum_selected_id >= len) {
        this._vacuum_selected_id = Math.max(0, len - 1);
      }
    }
  }

  protected override renderCard(): TemplateResult {
    const vacuums = this.config.vacuums;
    if (!vacuums?.length) {
      return html`<ha-card></ha-card>`;
    }

    const vacuum = vacuums[this._vacuum_selected_id]!;

    return html`
      <ha-card>
        <div class="container">
          ${this._renderHeader(vacuum)}
          ${this._renderSubHeader(vacuum)}
          ${this._renderInfo(vacuum)}
          ${this._renderMap(vacuum)}
          ${this._renderActions(vacuum)}
          ${this._renderDevices()}
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  // ── Header: name + fan speed + mop_intensite + battery ──────────────────

  private _renderHeader(v: SciFiVacuumEntry): TemplateResult {
    const entityState = this.hass.states[v.entity];
    const name = entityState?.attributes.friendly_name ?? v.entity;
    const fanSpeed = (entityState?.attributes as any)?.fan_speed as string | undefined;

    const batteryState = v.sensors?.battery
      ? this.hass.states[v.sensors.battery]
      : undefined;
    const mopState = v.sensors?.mop_intensite
      ? this.hass.states[v.sensors.mop_intensite]
      : undefined;

    // Battery color thresholds (mirrors sf-landspeeder pattern)
    const batteryLevel = batteryState ? parseFloat(batteryState.state) : NaN;
    const batteryClass = !isNaN(batteryLevel)
      ? batteryLevel < 20 ? 'battery-critical'
      : batteryLevel < 30 ? 'battery-warn'
      : ''
      : '';

    return html`
      <div class="header">
        <div class="name">${name}</div>
        <div class="infoH">
          ${fanSpeed ? html`
            <sf-dropdown
              icon="mdi:fan"
              text="${fanSpeed}"
              .items="${this._getFanSpeedItems(v.entity, fanSpeed)}"
              @dropdown-select="${(e: CustomEvent) => this._setFanSpeed(v.entity, e.detail.id)}"
              class="fan-select"
            ></sf-dropdown>
          ` : nothing}
          <div class="spacer"></div>
          ${mopState ? html`
            <sf-icon
              icon="${(mopState.attributes as any).icon ?? 'mdi:water-opacity'}"
              .connection="${this.hass.connection}"
            ></sf-icon>
            <div>${mopState.state}</div>
          ` : nothing}
          <div class="spacer"></div>
          ${batteryState ? html`
            <sf-icon
              class="${batteryClass}"
              icon="${(batteryState.attributes as any).icon ?? 'mdi:battery'}"
              .connection="${this.hass.connection}"
            ></sf-icon>
            <div class="${batteryClass}">${batteryState.state}${(batteryState.attributes as any).unit_of_measurement ?? ''}</div>
          ` : nothing}
        </div>
      </div>
    `;
  }

  // ── Sub-header: animated icon based on vacuum state ──────────────────────

  private _renderSubHeader(v: SciFiVacuumEntry): TemplateResult {
    const stateStr = this.hass.states[v.entity]?.state ?? 'unknown';
    const icon = VACUUM_ICONS[stateStr] ?? 'mdi:robot-vacuum-off';
    const activity = VACUUM_ACTIVITY_STATE[stateStr] ?? 'IDLE';

    return html`
      <div class="sub-header">
        <sf-icon icon="${icon}" class="${activity}" .connection="${this.hass.connection}"></sf-icon>
      </div>
    `;
  }

  // ── Info: current_clean_area + current_clean_duration sensor cards ────────

  private _formatSensorValue(raw: string, isDuration: boolean): string {
    if (!isDuration) return raw;
    const n = parseFloat(raw);
    return isNaN(n) ? raw : String(Math.round(n));
  }

  private _renderInfo(v: SciFiVacuumEntry): TemplateResult {
    const areaId     = v.sensors?.current_clean_area;
    const durationId = v.sensors?.current_clean_duration;
    const areaState     = areaId     ? this.hass.states[areaId]     : undefined;
    const durationState = durationId ? this.hass.states[durationId] : undefined;

    const entries = [
      { state: areaState,     icon: 'mdi:floor-plan',    label: msg('Area'),     isDuration: false },
      { state: durationState, icon: 'mdi:timer-outline', label: msg('Duration'), isDuration: true  },
    ].filter((e): e is typeof e & { state: NonNullable<typeof e.state> } => e.state !== undefined);

    if (entries.length === 0) return html``;

    return html`
      <div class="info">
        ${entries.map((e) => html`
          <div class="sensor">
            <div class="data">
              <sf-icon icon="${e.icon}" .connection="${this.hass.connection}"></sf-icon>
              <div class="value">${this._formatSensorValue(e.state.state, e.isDuration)}</div>
              <div class="unit">${(e.state.attributes as any).unit_of_measurement ?? ''}</div>
            </div>
            <div class="name">${(e.state.attributes as any).friendly_name ?? e.label}</div>
          </div>
        `)}
      </div>
    `;
  }

  // ── Map: full-width image or fallback text ────────────────────────────────

  private _renderMap(v: SciFiVacuumEntry): TemplateResult {
    const mapState = v.sensors?.map
      ? this.hass.states[v.sensors.map]
      : undefined;
    const mapUrl = mapState?.attributes['entity_picture'] as string | undefined;

    return html`
      <div class="map">
        ${mapUrl
          ? html`<img class="image" src="${mapUrl}" alt="${msg('Vacuum map')}" />`
          : html`<div class="map-content">${msg('No map defined')}</div>`
        }
      </div>
    `;
  }

  // ── Actions: default action buttons + shortcut buttons ───────────────────

  private _renderActions(v: SciFiVacuumEntry): TemplateResult {
    // set_fan_speed is toggled via the fan icon in the header, not the action bar
    const BAR_ACTIONS = VACUUM_ACTION_KEYS.filter((k) => k !== VACUUM_ACTION_SET_FAN_SPEED);
    const enabledActions = BAR_ACTIONS
      .filter((k) => (v as any)[k] !== false)
      .map((k) => ({ key: k, icon: VACUUM_ACTIONS_ICONS[k] ?? 'mdi:cog' }));

    const shortcuts = v.shortcuts?.description ?? [];

    return html`
      <div class="actions">
        <div class="default">
          ${enabledActions.map((a) => html`
            <sf-button
              icon="${a.icon}"
              @button-click="${() => this._callAction(v.entity, a.key)}"
            ></sf-button>
          `)}
        </div>
        <div class="shortcuts">
          ${shortcuts.map((s, id) => html`
            <sf-button
              icon="${s.icon ?? 'mdi:broom'}"
              @button-click="${() => this._callShortcut(v, id)}"
            ></sf-button>
          `)}
        </div>
      </div>
    `;
  }

  // ── Devices: bottom navigation bar (hidden for single vacuum) ─────────────

  private _renderDevices(): TemplateResult {
    if (this.config.vacuums.length <= 1) return html``;

    return html`
      <div class="devices">
        <sf-button icon="mdi:chevron-left" @button-click="${this._prev}"></sf-button>
        <div class="number">
          ${this.config.vacuums.map((_, id) => html`
            <div class="${id === this._vacuum_selected_id ? 'active' : ''}"></div>
          `)}
        </div>
        <sf-button icon="mdi:chevron-right" @button-click="${this._next}"></sf-button>
      </div>
    `;
  }

  private readonly _prev = (): void => {
    const len = this.config.vacuums.length;
    this._vacuum_selected_id = this._vacuum_selected_id === 0
      ? len - 1
      : this._vacuum_selected_id - 1;
  };

  private readonly _next = (): void => {
    const len = this.config.vacuums.length;
    this._vacuum_selected_id = this._vacuum_selected_id === len - 1
      ? 0
      : this._vacuum_selected_id + 1;
  };

  // ── Service calls ─────────────────────────────────────────────────────────

  private _getFanSpeedItems(entityId: string, currentFanSpeed: string | undefined) {
    const state = this.hass.states[entityId];
    const speeds = ((state?.attributes as any)?.fan_speed_list as string[] | undefined)
      ?? ['quiet', 'standard', 'strong', 'max'];
    return speeds.map(speed => ({
      id: speed,
      text: speed,
      icon: 'mdi:fan',
      color: speed === currentFanSpeed ? 'var(--sf-accent-on, #00ff9d)' : undefined,
    }));
  }

  private _setFanSpeed(entityId: string, fanSpeed: string): void {
    void this.hass.callService('vacuum', 'set_fan_speed', { entity_id: entityId, fan_speed: fanSpeed })
      .then(() => this._toast(false, msg('done')))
      .catch((e: Error) => this._toast(true, e.message));
  }

  private _callAction(entityId: string, service: string): void {
    void this.hass.callService('vacuum', service, { entity_id: entityId })
      .then(() => this._toast(false, msg('done')))
      .catch((e: Error) => this._toast(true, e.message));
  }

  /**
   * ADR-005: shortcut service call per spec:
   * service: 'vacuum.send_command', command: 'app_segment_clean', params: [{ segments }]
   */
  private _callShortcut(v: SciFiVacuumEntry, idx: number): void {
    const sc = v.shortcuts;
    if (!sc?.service) return;
    const [domain, service] = sc.service.split('.');
    if (!domain || !service) return;
    const desc: SciFiVacuumShortcutDescription | undefined = sc.description?.[idx];
    if (!desc) return;
    void this.hass.callService(domain, service, {
      entity_id: v.entity,
      command: sc.command ?? 'app_segment_clean',
      params: [{ segments: desc.segments }],
    })
      .then(() => this._toast(false, msg('done')))
      .catch((e: Error) => this._toast(true, e.message));
  }

  private _toast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, error);
  }

  override getCardSize(): number {
    return this.config ? 6 : 3;
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
