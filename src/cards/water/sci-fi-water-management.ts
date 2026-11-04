import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { msg } from '@lit/localize';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { floorNavStyles } from '../../styles/floor-nav.js';
import type { SciFiWaterManagementConfig } from './config.js';
import type { HassFloor, HassEntityEntry } from '../../types/ha.js';
import { fireHassAction } from '../../utils/action.js';
import { getFloors, getAreasByFloor } from '../../selectors/house.js';
import WEATHER_ICON_SET from '../../components/sf-icon/data/sf-weather-icons.js';
import '../../components/editor-inputs/sf-editor-accordion.js';

import { waterStyles } from './styles.js';
import { DOMAIN } from '../../types/domains.js';
import { callWS } from '../../utils/ws.js';
import { ENTITY_ID } from '../../types/entity-ids.js';
const TAG = 'sci-fi-water-management';

// SVG hexagon points (pointy-top, portrait orientation)
const HEXA_BG = '66,2 130,42 130,122 66,162 2,122 2,42';
const HEXA_BORDER = '66,4 128,43 128,121 66,160 4,121 4,43';
const DEFAULT_FLOOR_ICON = 'mdi:floor-plan';

@customElement(TAG)
export class SciFiWaterManagementCard extends SciFiBaseCard {
  // floorNavStyles BEFORE waterStyles: the shared shell must be overridable by
  // the card, never the other way round (ADR-017 step 8).
  static override styles = [sciFiCommonStyles, floorNavStyles, waterStyles];

  @state() private _activeFloorId: string | null = null;
  @state() private _devices: Record<string, any> = {};
  @state() private _entities: Record<string, any> = {};
  @state() private _rawLogs: any[] = [];
  @state() private _historyLogsLoading: boolean = false;
  @state() private _activeFilter: 'all' | 'alerts' = 'all';
  @state() private _expandedMap: Map<string, boolean> = new Map();

  declare config: SciFiWaterManagementConfig;
  declare entityIds: string[];
  private _fetchId: number = 0;

  constructor() {
    super();
    this.entityIds = [];
  }


  static override get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entityIds: { type: Array }
    };
  }

  protected override firstUpdated(): void {
    if (this.hass) {
      void this._fetchRegistry();
    }
  }


  private async _fetchRegistry() {
    try {
      const devices = await callWS<unknown>(this.hass, { type: 'config/device_registry/list' });
      const entities = await callWS<unknown>(this.hass, { type: 'config/entity_registry/list' });
      
      const deviceDict: Record<string, any> = {};
      if (Array.isArray(devices)) {
        for (const d of devices) deviceDict[d.id] = d;
      }
      
      const entityDict: Record<string, any> = {};
      if (Array.isArray(entities)) {
        for (const e of entities) entityDict[e.entity_id] = e;
      }

      this._devices = deviceDict;
      this._entities = entityDict;
    } catch (e) {
      console.warn('Sci-Fi Water: Failed to fetch HA registry', e);
    }
  }

  override setConfig(config: SciFiWaterManagementConfig): void {
    super.setConfig(config);
    this._activeFloorId = config.first_floor_to_render ?? null;
  }

  override willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has('_activeFloorId') || changedProperties.has('_entities') || changedProperties.has('_devices') || changedProperties.has('hass')) {
      if (changedProperties.has('_activeFloorId')) {
        // Floor changed: clear stale logs and reset accordion states
        this._rawLogs = [];
        this._expandedMap = new Map();
      }
      if (this._activeFloorId) {
        const waterEntities = this._getWaterEntitiesForFloor(this._activeFloorId);
        const newEntityIds = waterEntities.map(e => e.entity_id);
        if (JSON.stringify(this.entityIds) !== JSON.stringify(newEntityIds)) {
          this.entityIds = newEntityIds;
        }
      }
    }
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    // Fetch once per floor load (water.md AP "Fetch on accordion open"); the
    // sync button is the only other trigger. ha-sci-fi-xrc
    if (changedProperties.has('_activeFloorId') || changedProperties.has('entityIds')) {
      void this._fetchHistoryLogs();
    }
  }

  private _syncLogs(): void {
    void this._fetchHistoryLogs();
  }


  /**
   * Domains that produce meaningful execution events for water management.
   * sensor IS included: when switch/automation are excluded from recorder (a
   * common config), power/energy sensors are the best proxy for device activity
   * (e.g. water heater on/off).
   */
  private static readonly MEANINGFUL_DOMAINS = new Set<string>([
    DOMAIN.SWITCH, DOMAIN.VALVE, DOMAIN.AUTOMATION, DOMAIN.BINARY_SENSOR, DOMAIN.INPUT_BOOLEAN, DOMAIN.SENSOR,
  ]);

  async _fetchHistoryLogs(): Promise<void> {
    // Every call supersedes the one in flight, early returns included, so a
    // late response for the previous floor never lands. ha-sci-fi-p5a
    this._fetchId += 1;
    const currentFetchId = this._fetchId;
    // Clear old logs immediately to prevent stale state display while fetching or on floor switch
    this._rawLogs = [];

    if (!this.hass) {
      await this._loadSandboxLogs(currentFetchId);
      return;
    }

    // Every exit after this point goes through the finally below, which alone
    // clears the loading flag for the current fetch. ha-sci-fi-p5a
    this._historyLogsLoading = true;

    try {
      if (!this.entityIds || this.entityIds.length === 0) return;

      const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Query only the domains that carry meaningful events.
      const queryIds = this.entityIds.filter(
        id => SciFiWaterManagementCard.MEANINGFUL_DOMAINS.has(id.split('.')[0] as string)
      );

      if (queryIds.length === 0) return;

      let logs: any[];
      try {
        logs = await this._queryHistory(startTime, queryIds);
      } catch (histErr) {
        console.warn('[SciWater] history API failed, falling back to logbook:', histErr);
        logs = await this._queryLogbook(startTime, queryIds);
      }

      if (this._fetchId !== currentFetchId) return; // Discard superseded response
      this._rawLogs = logs;

    } catch (err) {
      console.warn('Sci-Fi Water: Failed to fetch history', err);
    } finally {
      if (this._fetchId === currentFetchId) {
        this._historyLogsLoading = false;
      }
    }
  }

  /** Local development sandbox: no hass, so serve a fixture after a fake latency. */
  private async _loadSandboxLogs(fetchId: number): Promise<void> {
    this._historyLogsLoading = true;
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulated network latency
    if (this._fetchId !== fetchId) return; // superseded while waiting

    this._rawLogs = [
      { name: 'Arrosage Jardin', entity_id: ENTITY_ID.DEMO_IRRIGATION_TERRACE, state: 'off', when: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
      { name: 'Fuite Cuisine', entity_id: ENTITY_ID.DEMO_LEAK_KITCHEN, state: 'on', when: new Date(Date.now() - 45 * 60 * 1000).toISOString(), device_class: 'moisture' },
      { name: 'Vanne Principale', entity_id: ENTITY_ID.DEMO_IRRIGATION_HEDGE, state: 'unavailable', when: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { name: 'Remplissage Cuve', entity_id: ENTITY_ID.DEMO_IRRIGATION_TERRACE, state: 'on', when: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }
    ];
    this._historyLogsLoading = false;
  }

  /**
   * Primary source: history/history_during_period (recorder DB — records all
   * state changes). significant_changes_only avoids sensor noise: only
   * meaningful threshold crossings come back (e.g. water heater power:
   * 5W standby -> 2000W heating).
   */
  private async _queryHistory(startTime: string, queryIds: string[]): Promise<any[]> {
    const result = await callWS<Record<string, any[]>>(this.hass, {
      type: 'history/history_during_period',
      start_time: startTime,
      entity_ids: queryIds,
      no_attributes: true,
      minimal_response: true,
      significant_changes_only: true,
    });

    const logs: any[] = [];
    let skipped = 0;
    for (const [entityId, states] of Object.entries(result)) {
      if (!Array.isArray(states)) continue;
      const stateObj = this.hass.states[entityId];
      const name = stateObj?.attributes?.friendly_name || entityId;
      const deviceClass = stateObj?.attributes?.device_class;
      for (const entry of states) {
        // minimal_response uses 's' for state, 'lu' for last_updated (Unix float)
        const state = entry.s ?? entry.state ?? '';
        const when = entry.lu
          ? new Date(entry.lu * 1000).toISOString()
          : (entry.last_changed || entry.last_updated || '');
        if (typeof state === 'string' && state && typeof when === 'string' && when) {
          logs.push({ entity_id: entityId, state, when, name, device_class: deviceClass });
        } else {
          skipped += 1;
        }
      }
    }
    if (skipped > 0) console.warn(`[SciWater] ignored ${skipped} history row(s) without state or time`);
    return logs;
  }

  /** Fallback for older HA, or when the history API is unavailable. */
  private async _queryLogbook(startTime: string, queryIds: string[]): Promise<any[]> {
    const events = await callWS<unknown>(this.hass, {
      type: 'logbook/get_events',
      start_time: startTime,
      entity_ids: queryIds,
    });
    if (!Array.isArray(events)) return [];
    // Logbook entries of automations and scripts carry no state: a row is kept
    // only when it names an entity, a state and a time. ha-sci-fi-5aw
    const valid = events.filter((e: any) =>
      typeof e?.entity_id === 'string' && typeof e.state === 'string' && e.state !== '' &&
      typeof e.when === 'string' && e.when !== ''
    );
    if (valid.length < events.length) {
      console.warn(`[SciWater] ignored ${events.length - valid.length} logbook row(s) without entity, state or time`);
    }
    return valid.map((e: any) => ({
      entity_id: e.entity_id,
      state: e.state,
      when: e.when,
      name: e.name || this.hass.states[e.entity_id]?.attributes?.friendly_name || e.entity_id,
      device_class: e.device_class || this.hass.states[e.entity_id]?.attributes?.device_class,
    }));
  }

  /**
   * The one place the log contract lives: the entries of `entityIds`, the
   * active filter, newest first, 50 at most (the limit applies after the
   * filter). ha-sci-fi-ijw
   */
  _visibleLogs(entityIds: string[]): any[] {
    const ids = new Set(entityIds);
    return this._rawLogs
      .filter(log => ids.has(log.entity_id))
      .filter(log => this._activeFilter !== 'alerts' || this._isAlertLog(log))
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, 50);
  }

  private _setFilter(filter: 'all' | 'alerts'): void {
    this._activeFilter = filter;
  }

  private _isAlertLog(log: any): boolean {
    const isWarningState = ['unavailable', 'unknown', 'problem'].includes(log.state);
    const deviceClass = this.hass?.states[log.entity_id]?.attributes?.device_class || log.device_class;
    const isMoistureAlert = (log.entity_id.startsWith(`${DOMAIN.BINARY_SENSOR}.`) || log.entity_id.startsWith(`${DOMAIN.SENSOR}.`)) && deviceClass === 'moisture' && log.state === 'on';
    return isWarningState || isMoistureAlert;
  }

  private _getLogStatus(log: any): 'success' | 'running' | 'warning' {
    if (this._isAlertLog(log)) {
      return 'warning';
    }
    if (['on', 'active', 'open'].includes(log.state)) {
      return 'running';
    }
    return 'success';
  }

  private _getLogBadge(log: any): string {
    const status = this._getLogStatus(log);
    if (status === 'warning') return 'WARN';
    if (status === 'running') return 'RUN';
    return 'OK';
  }

  private _formatTimestamp(when: string): string {
    try {
      const date = new Date(when);
      // `new Date('nonsense')` does not throw — it yields an Invalid Date whose
      // getters return NaN, so the catch below never fired and the fallback
      // rendered as 'NaN/NaN NaN:NaN'. Check validity explicitly.
      if (Number.isNaN(date.getTime())) return '00/00 00:00';
      const dd = String(date.getDate()).padStart(2, '0');
      const mo = String(date.getMonth() + 1).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return `${dd}/${mo} ${hh}:${mm}`;
    } catch {
      return '00/00 00:00';
    }
  }

  // Render history logs filtered to a specific set of entity_ids
  private _renderHistoryLogs(filterEntityIds: string[]): TemplateResult {
    const logs = this._visibleLogs(filterEntityIds);

    return html`
      <div class="log-console">
        <div class="log-header">
          <span class="log-title">${msg('RUNTIME LOGS')}</span>
          <div class="log-filters">
            <button class="log-filter-btn ${this._activeFilter === 'all' ? 'active' : ''}" @click="${() => this._setFilter('all')}">${msg('All')}</button>
            <button class="log-filter-btn ${this._activeFilter === 'alerts' ? 'active' : ''}" @click="${() => this._setFilter('alerts')}">${msg('Alerts')}</button>
          </div>
        </div>
        
        ${this._historyLogsLoading ? html`
          <div class="log-scanner">
            <div class="scanner-bar"></div>
            <span>${msg("SYSTEM SCANNING...")}</span>
          </div>
        ` : logs.length === 0 ? html`
          <div class="empty-log">${msg('No events recorded.')}</div>
        ` : html`
          <div class="log-timeline">
            ${logs.map(log => {
              const status = this._getLogStatus(log);
              const badge = this._getLogBadge(log);
              return html`
                <div class="log-entry" data-status="${status}">
                  <div class="log-meta">
                    <span class="log-time">[${this._formatTimestamp(log.when)}]</span>
                    <span class="log-badge">${badge}</span>
                  </div>
                  <div class="log-content">
                    <span class="log-text">${log.name} -> ${log.state.toUpperCase()}</span>
                  </div>
                </div>
              `;
            })}
          </div>
        `}
      </div>
    `;
  }


  protected override getRelevantEntities(): string[] {
    const entities = new Set<string>();
    entities.add(ENTITY_ID.SUN);

    const label = this.config.filter_label || 'water';
    const ignored = this.config.ignored_entities || [];

    const entitiesSource = Object.keys(this._entities).length > 0 ? this._entities : (this.hass?.entities || {});
    const devicesSource = Object.keys(this._devices).length > 0 ? this._devices : (this.hass?.devices || {});

    for (const [entityId, entry] of Object.entries(entitiesSource)) {
      const ent = entry;
      let hasLabel = ent.labels?.includes(label);
      if (!hasLabel && ent.device_id && devicesSource[ent.device_id]) {
        const device = devicesSource[ent.device_id];
        if (device.labels?.includes(label)) {
          hasLabel = true;
        }
      }
      if (hasLabel && !ignored.includes(entityId)) {
        entities.add(entityId);
      }
    }

    return Array.from(entities);
  }

  // Find all HA entities that match the specified label
  private _getWaterEntitiesForFloor(floorId: string): HassEntityEntry[] {
    const label = this.config.filter_label || 'water';
    const ignored = this.config.ignored_entities || [];
    const floorAreas = getAreasByFloor(this.hass, floorId).map(a => a.area_id);
    
    const matched: HassEntityEntry[] = [];
    const entitiesSource = Object.keys(this._entities).length > 0 ? this._entities : (this.hass?.entities || {});
    const devicesSource = Object.keys(this._devices).length > 0 ? this._devices : (this.hass?.devices || {});
    
    for (const [entityId, entry] of Object.entries(entitiesSource)) {
      const ent = entry; // Cast for accessing labels
        
      let hasLabel = ent.labels?.includes(label);
      if (!hasLabel && ent.device_id && devicesSource[ent.device_id]) {
        const device = devicesSource[ent.device_id];
        if (device.labels?.includes(label)) {
          hasLabel = true;
        }
      }

      if (hasLabel && !ignored.includes(entityId)) {
        // Find areaId from entity, fallback to device
        let areaId = ent.area_id;
        if (!areaId && ent.device_id && devicesSource[ent.device_id]) {
          areaId = devicesSource[ent.device_id]!.area_id;
        }
        // Check if entity is assigned to an area that is on this floor
        if (areaId && floorAreas.includes(areaId)) {
          matched.push(ent);
        }
      }
    }
    return matched;
  }

  protected override renderCard(): TemplateResult {
    let floors = getFloors(this.hass);
    // Only keep floors that have at least one water entity
    floors = floors.filter(f => this._getWaterEntitiesForFloor(f.floor_id).length > 0);

    if (floors.length === 0) {
      return html`<ha-card><div class="empty-state">${msg('No floor configured')}</div></ha-card>`;
    }

    // The active floor must be one the selector offers: a configured floor
    // without water entity falls back to the first listed. ha-sci-fi-rd4
    const floorExists = !!this._activeFloorId && floors.some(f => f.floor_id === this._activeFloorId);
    if (!floorExists) {
      if (!this.hass.floors) {
        // HA floors not loaded yet, preserve config target
        this._activeFloorId = this.config?.first_floor_to_render ?? null;
      } else {
        let resolvedFloorId: string | null = null;
        const targetConfig = this.config?.first_floor_to_render;
        
        if (targetConfig) {
          const target = targetConfig.toLowerCase();
          const matched = Object.values(this.hass.floors).find(
            f => f.floor_id.toLowerCase() === target || (f.name && f.name.toLowerCase() === target)
          );
          if (matched && floors.some(f => f.floor_id === matched.floor_id)) resolvedFloorId = matched.floor_id;
        }

        this._activeFloorId = resolvedFloorId ?? floors[0]?.floor_id ?? null;
      }
    }

    const currentFloor = this._activeFloorId ? (this.hass.floors?.[this._activeFloorId] ?? null) : null;
    const waterEntities = this._activeFloorId ? this._getWaterEntitiesForFloor(this._activeFloorId) : [];

    return html`
      <ha-card>
        <div class="container">
          ${this._renderHeader()}
          <div class="floors">
            ${repeat(floors, f => f.floor_id, f => this._renderFloorHexa(f))}
          </div>
          ${currentFloor ? this._renderFloorInfo(currentFloor) : ''}
          <div class="entities-section">
            ${waterEntities.length > 0 
              ? this._renderEntitiesGrouped(waterEntities)
              : html`<div class="empty-state">${msg("No water equipment configured for this floor")}</div>`
            }
          </div>
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  private _getDayNightIcon(): TemplateResult {
    const sun = this.hass?.states[ENTITY_ID.SUN];
    const isDay = sun ? sun.state === 'above_horizon' : true;
    const key = isDay ? 'sunny-day' : 'sunny-night';
    return (WEATHER_ICON_SET as Record<string, TemplateResult>)[key] ?? html``;
  }

  private _renderHeader(): TemplateResult {
    const label = this.config.header_message ?? 'Water Management';
    return html`
      <div class="header">
        <div class="info">
          <span class="header-text ${this.config.tap_action ? 'clickable' : ''}" @click="${this._handleHeaderClick}">${label}</span>
        </div>
        <div class="weather-icon">${this._getDayNightIcon()}</div>
      </div>
    `;
  }

  private _handleHeaderClick(e: MouseEvent): void {
    if (this.config.tap_action) {
      e.preventDefault();
      e.stopPropagation();
      fireHassAction(this, this.config, 'tap');
    }
  }

  private _renderFloorHexa(floor: HassFloor): TemplateResult {
    const isSelected = floor.floor_id === this._activeFloorId;
    const isActive = this._getWaterEntitiesForFloor(floor.floor_id).some(e => {
      const stateObj = this.hass.states[e.entity_id];
      return stateObj && stateObj.state === 'on';
    });
    const icon = floor.icon ?? DEFAULT_FLOOR_ICON;

    return html`
      <div
        class="floor-hexa"
        data-selected="${isSelected}"
        data-active="${isActive}"
        title="${floor.name}"
        @click="${() => { this._activeFloorId = floor.floor_id; }}"
      >
        <svg viewBox="0 0 132 164">
          <polygon class="hexa-bg" points="${HEXA_BG}" />
          <polygon class="hexa-border" points="${HEXA_BORDER}" />
        </svg>
        <div class="hexa-content">
          <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        </div>
      </div>
    `;
  }

  private _renderFloorInfo(floor: HassFloor): TemplateResult {
    return html`
      <div class="floor-content">
        <div class="floor-info">
          <div class="floor-title">
            ${floor.name}
          </div>
        </div>
        <button
          class="floor-sync-btn ${this._historyLogsLoading ? 'syncing' : ''}"
          title="${msg('Refresh logs')}"
          @click="${() => this._syncLogs()}"
        >
          <sf-icon class="sync-icon" icon="mdi:refresh" .connection="${this.hass.connection}"></sf-icon>
        </button>
      </div>
    `;
  }

  private _renderEntitiesGrouped(entities: any[]): TemplateResult {
    const grouped = new Map<string, any[]>();
    for (const e of entities) {
      const devId = e.device_id || 'no_device';
      if (!grouped.has(devId)) {
        grouped.set(devId, []);
      }
      grouped.get(devId)!.push(e);
    }

    const groups: TemplateResult[] = [];
    
    // Sort so devices come first, then standalone entities
    const sortedDeviceIds = Array.from(grouped.keys()).sort((a, b) => {
      if (a === 'no_device') return 1;
      if (b === 'no_device') return -1;
      return 0;
    });

    const devicesSource = Object.keys(this._devices).length > 0 ? this._devices : (this.hass?.devices || {});

    for (const devId of sortedDeviceIds) {
      const groupEntities = grouped.get(devId)!;
      const groupEntityIds = groupEntities.map((e: any) => e.entity_id);
      const isExpanded = this._expandedMap.get(devId) ?? false;

      if (devId === 'no_device') {
        groups.push(html`
          <sf-editor-accordion
            title=${msg("Automations")}
            ?open="${isExpanded}"
            @sf-accordion-toggle="${(e: CustomEvent<{open: boolean}>) => {
              this._expandedMap = new Map(this._expandedMap).set(devId, e.detail.open);
            }}"
            class="device-accordion"
          >
            ${repeat(groupEntities, (e: any) => e.entity_id, (e: any) => this._renderEntityRow(e))}
            ${this._renderHistoryLogs(groupEntityIds)}
          </sf-editor-accordion>
        `);
      } else {
        const deviceName = devicesSource[devId]?.name || msg('Device');
        groups.push(html`
          <sf-editor-accordion
            title="${deviceName}"
            ?open="${isExpanded}"
            @sf-accordion-toggle="${(e: CustomEvent<{open: boolean}>) => {
              this._expandedMap = new Map(this._expandedMap).set(devId, e.detail.open);
            }}"
            class="device-accordion"
          >
            ${repeat(groupEntities, (e: any) => e.entity_id, (e: any) => this._renderEntityRow(e))}
            ${this._renderHistoryLogs(groupEntityIds)}
          </sf-editor-accordion>
        `);
      }
    }
    
    return html`${groups}`;
  }

  private _renderEntityRow(entityEntry: any): TemplateResult {
    const stateObj = this.hass.states[entityEntry.entity_id];
    const isOn = stateObj?.state === 'on';
    const domain = entityEntry.entity_id.split('.')[0];
    const isSensor = domain === DOMAIN.SENSOR || domain === DOMAIN.NUMBER;
    const isSelect = domain === DOMAIN.SELECT;
    const name = stateObj?.attributes?.friendly_name || entityEntry.entity_id;
    
    // Formatting sensor values
    let stateDisplay = stateObj?.state || msg('Unknown');
    if (isSensor && stateObj?.attributes?.unit_of_measurement) {
      stateDisplay += String(stateObj.attributes.unit_of_measurement);
    }

    return html`
      <div class="entity-row ${isOn || isSensor || isSelect ? '' : 'row-off'}">
        <div class="entity-info">
          ${stateObj
            ? html`<ha-state-icon .hass="${this.hass}" .stateObj="${stateObj}"></ha-state-icon>`
            : html`<sf-icon .icon="${this.config.default_icon || 'mdi:water'}" .connection="${this.hass.connection}"></sf-icon>`
          }
          <div class="entity-text">
            <span class="entity-name">${name}</span>
            <span class="entity-domain">${domain.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="entity-controls">
          ${isSensor ? html`
            <span class="entity-state">${stateDisplay}</span>
          ` : isSelect ? html`
            <select class="sf-select" @change="${(e: Event) => this._changeSelectEntity(entityEntry.entity_id, e)}" ?disabled="${!stateObj || stateObj.state === 'unavailable'}">
              ${!stateObj || stateObj.state === 'unavailable'
                ? html`<option value="">${msg('Unavailable')}</option>`
                : (Array.isArray(stateObj.attributes?.options) 
                  ? html`
                      ${stateObj.state === 'unknown' ? html`<option value="" disabled selected>${msg('Select...')}</option>` : ''}
                      ${stateObj.attributes.options.map((opt: string) => html`
                        <option value="${opt}" ?selected="${opt === stateObj.state}">${opt}</option>
                      `)}
                    `
                  : html`<option value="">${msg('Unknown')}</option>`)
              }
            </select>
          ` : html`
            <span class="entity-state ${isOn ? 'state-active' : ''}">${this._getStateLabel(isOn)}</span>
            <sf-toggle-switch
              .checked="${isOn}"
              @sf-toggle-change="${() => this._toggleEntity(entityEntry.entity_id, isOn, domain)}"
            ></sf-toggle-switch>
          `}
        </div>
      </div>
    `;
  }

  private _getStateLabel(isOn: boolean): string {
    return [msg('OFF'), msg('ACTIVE')][isOn ? 1 : 0] as string;
  }

  private _toggleEntity(entityId: string, isOn: boolean, domain: string): void {
    const serviceDomain = new Set<string>([DOMAIN.SWITCH, DOMAIN.VALVE, DOMAIN.AUTOMATION, DOMAIN.INPUT_BOOLEAN]).has(domain) ? domain : DOMAIN.HOMEASSISTANT;
    
    void this.hass
      .callService(serviceDomain, isOn ? 'turn_off' : 'turn_on', { entity_id: entityId })
      .then(() => {
        const toastText = [msg('Turned on'), msg('Turned off')][isOn ? 1 : 0] as string;
        this._showToast(false, toastText);
      })
      .catch((e: Error) => { this._showToast(true, e.message); });
  }

  private _changeSelectEntity(entityId: string, e: Event): void {
    const target = e.target as HTMLSelectElement;
    if (!target) return;
    const domain = entityId.split('.')[0];
    const serviceDomain = domain === DOMAIN.INPUT_SELECT ? DOMAIN.INPUT_SELECT : DOMAIN.SELECT;
    void this.hass
      .callService(serviceDomain, 'select_option', { entity_id: entityId, option: target.value })
      .then(() => { this._showToast(false, msg('Option changed')); })
      .catch((err: Error) => { this._showToast(true, err.message); });
  }

  private _showToast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, error);
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiWaterManagementConfig {
    return { type: `custom:${TAG}` };
  }

  override getCardSize(): number {
    return 5;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiWaterManagementCard;
  }
}
