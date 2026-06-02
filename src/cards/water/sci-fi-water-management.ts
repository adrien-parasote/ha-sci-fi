import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { msg } from '@lit/localize';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiWaterManagementConfig } from '../../types/config.js';
import type { HassFloor, HassEntityEntry } from '../../types/ha.js';
import { fireHassAction } from '../../utils/action.js';
import { getFloors, getAreasByFloor } from '../../selectors/house.js';
import WEATHER_ICON_SET from '../../components/sf-icon/data/sf-weather-icons.js';
import '../../components/editor-inputs/sf-editor-accordion.js';

import { waterStyles } from './styles.js';

const TAG = 'sci-fi-water-management';

// SVG hexagon points (pointy-top, portrait orientation)
const HEXA_BG = '66,2 130,42 130,122 66,162 2,122 2,42';
const HEXA_BORDER = '66,4 128,43 128,121 66,160 4,121 4,43';
const DEFAULT_FLOOR_ICON = 'mdi:floor-plan';

@customElement(TAG)
export class SciFiWaterManagementCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, waterStyles];

  @state() private _activeFloorId: string | null = null;
  @state() private _devices: Record<string, any> = {};
  @state() private _entities: Record<string, any> = {};
  @state() private _rawLogs: any[] = [];
  @state() private _historyLogs: any[] = [];
  @state() private _historyLogsLoading: boolean = false;
  @state() private _activeFilter: 'all' | 'alerts' = 'all';
  @state() private _expandedMap: Map<string, boolean> = new Map();

  declare config: SciFiWaterManagementConfig;
  declare entityIds: string[];
  declare expanded?: boolean;
  private _fetchId: number = 0;

  constructor() {
    super();
    this.entityIds = [];
  }


  static override get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      entityIds: { type: Array },
      expanded: { type: Boolean }
    };
  }

  protected firstUpdated(): void {
    if (this.hass) {
      void this._fetchRegistry();
    }
  }


  private async _fetchRegistry() {
    try {
      const callWS = (this.hass as any).callWS || this.hass.connection.sendMessagePromise.bind(this.hass.connection);
      const devices = await callWS({ type: 'config/device_registry/list' });
      const entities = await callWS({ type: 'config/entity_registry/list' });
      
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
        this._historyLogs = [];
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

    const floorChanged = changedProperties.has('_activeFloorId');
    const entityIdsChanged = changedProperties.has('entityIds');
    const expandedChanged = changedProperties.has('expanded');

    const shouldFetch = 
      (expandedChanged && this.expanded === true) ||
      (this.expanded !== false && (floorChanged || entityIdsChanged));

    if (shouldFetch) {
      void this._fetchHistoryLogs();
    }
  }

  private _syncLogs(): void {
    void this._fetchHistoryLogs();
  }


  async _fetchHistoryLogs(): Promise<void> {
    // Clear old logs immediately to prevent stale state display while fetching or on floor switch
    this._rawLogs = [];
    this._historyLogs = [];

    if (!this.hass) {
      // Local Development Sandbox Mock Mode
      this._historyLogsLoading = true;
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulated network latency
      
      this._rawLogs = [
        { name: 'Arrosage Jardin', entity_id: 'switch.arrosage_terrasse', state: 'off', when: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
        { name: 'Fuite Cuisine', entity_id: 'sensor.leak_kitchen', state: 'on', when: new Date(Date.now() - 45 * 60 * 1000).toISOString(), device_class: 'moisture' },
        { name: 'Vanne Principale', entity_id: 'switch.arrosage_haie', state: 'unavailable', when: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
        { name: 'Remplissage Cuve', entity_id: 'switch.arrosage_terrasse', state: 'on', when: new Date(Date.now() - 4 * 3600 * 1000).toISOString() }
      ];
      this._historyLogsLoading = false;
      this._applyFiltersAndLimit();
      return;
    }

    if (!this.entityIds || this.entityIds.length === 0) {
      this._historyLogsLoading = false;
      return;
    }

    this._fetchId = (this._fetchId || 0) + 1;
    const currentFetchId = this._fetchId;
    this._historyLogsLoading = true;

    // Domains that produce meaningful execution events for water management.
    // sensor IS included: when switch/automation are excluded from recorder (common config),
    // power/energy sensors are the best proxy for device activity (e.g. water heater on/off).
    const MEANINGFUL_DOMAINS = new Set(['switch', 'valve', 'automation', 'binary_sensor', 'input_boolean', 'sensor']);

    try {
      const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const callWS = (this.hass as any).callWS || this.hass.connection.sendMessagePromise.bind(this.hass.connection);

      // Filter entityIds to only meaningful domains before querying
      const queryIds = this.entityIds.filter(id => MEANINGFUL_DOMAINS.has((id.split('.')[0] as string)));

      if (queryIds.length === 0) {
        this._historyLogsLoading = false;
        this._applyFiltersAndLimit();
        return;
      }

      let logs: any[] = [];

      try {
        // Primary: history/history_during_period (recorder DB — records all state changes).
        // significant_changes_only=true avoids sensor noise: only meaningful threshold crossings
        // are returned (e.g. water heater power: 5W standby → 2000W heating).
        const result = await callWS({
          type: 'history/history_during_period',
          start_time: startTime,
          entity_ids: queryIds,
          no_attributes: true,
          minimal_response: true,
          significant_changes_only: true,
        }) as Record<string, any[]>;

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
            if (state && when) {
              logs.push({ entity_id: entityId, state, when, name, device_class: deviceClass });
            }
          }
        }
      } catch (histErr) {
        // Fallback: logbook/get_events (older HA or if history API unavailable)
        console.warn('[SciWater] history API failed, falling back to logbook:', histErr);
        const events = await callWS({
          type: 'logbook/get_events',
          start_time: startTime,
          entity_ids: queryIds,
        });
        if (Array.isArray(events)) {
          logs = events.map((e: any) => ({
            entity_id: e.entity_id,
            state: e.state,
            when: e.when,
            name: e.name || this.hass.states[e.entity_id]?.attributes?.friendly_name || e.entity_id,
            device_class: e.device_class || this.hass.states[e.entity_id]?.attributes?.device_class,
          }));
        }
      }

      if (this._fetchId !== currentFetchId) return; // Discard superseded response
      this._rawLogs = logs;

    } catch (err) {
      console.warn('Sci-Fi Water: Failed to fetch history', err);
    } finally {
      if (this._fetchId === currentFetchId) {
        this._historyLogsLoading = false;
        this._applyFiltersAndLimit();
      }
    }
  }

  _applyFiltersAndLimit(): void {
    let filtered = [...this._rawLogs];
    
    if (this._activeFilter === 'alerts') {
      filtered = filtered.filter(log => {
        const isWarningState = ['unavailable', 'unknown', 'problem'].includes(log.state);
        const deviceClass = this.hass?.states[log.entity_id]?.attributes?.device_class || log.device_class;
        const isMoistureAlert = (log.entity_id.startsWith('binary_sensor.') || log.entity_id.startsWith('sensor.')) && deviceClass === 'moisture' && log.state === 'on';
        return isWarningState || isMoistureAlert;
      });
    }

    // Sort in reverse-chronological order (newest first)
    filtered.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

    // Apply the 50 limit *after* filtering
    this._historyLogs = filtered.slice(0, 50);
  }

  private _setFilter(filter: 'all' | 'alerts'): void {
    this._activeFilter = filter;
    this._applyFiltersAndLimit();
  }

  private _getLogStatus(log: any): 'success' | 'running' | 'warning' {
    const isWarningState = ['unavailable', 'unknown', 'problem'].includes(log.state);
    const deviceClass = this.hass?.states[log.entity_id]?.attributes?.device_class || log.device_class;
    const isMoistureAlert = (log.entity_id.startsWith('binary_sensor.') || log.entity_id.startsWith('sensor.')) && deviceClass === 'moisture' && log.state === 'on';
    
    if (isWarningState || isMoistureAlert) {
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
    const filterSet = new Set(filterEntityIds);

    let filtered = this._rawLogs.filter(log => filterSet.has(log.entity_id));
    if (this._activeFilter === 'alerts') {
      filtered = filtered.filter(log => {
        const isWarningState = ['unavailable', 'unknown', 'problem'].includes(log.state);
        const deviceClass = this.hass?.states[log.entity_id]?.attributes?.device_class || log.device_class;
        const isMoistureAlert = (log.entity_id.startsWith('binary_sensor.') || log.entity_id.startsWith('sensor.')) && deviceClass === 'moisture' && log.state === 'on';
        return isWarningState || isMoistureAlert;
      });
    }
    filtered.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
    const logs = filtered.slice(0, 50);

    return html`
      <div class="log-console">
        <div class="log-header">
          <span class="log-title">${msg("LOGS D'EXÉCUTION")}</span>
          <div class="log-filters">
            <button class="log-filter-btn ${this._activeFilter === 'all' ? 'active' : ''}" @click="${() => this._setFilter('all')}">${msg("Tout")}</button>
            <button class="log-filter-btn ${this._activeFilter === 'alerts' ? 'active' : ''}" @click="${() => this._setFilter('alerts')}">${msg("Alertes")}</button>
          </div>
        </div>
        
        ${this._historyLogsLoading ? html`
          <div class="log-scanner">
            <div class="scanner-bar"></div>
            <span>${msg("SYSTEM SCANNING...")}</span>
          </div>
        ` : logs.length === 0 ? html`
          <div class="empty-log">${msg("Aucun événement enregistré.")}</div>
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
    entities.add('sun.sun');

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

    // Validate active floor or fallback
    const floorExists = !!this._activeFloorId && !!this.hass.floors?.[this._activeFloorId];
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
          if (matched) resolvedFloorId = matched.floor_id;
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
    const sun = this.hass?.states['sun.sun'];
    const isDay = sun ? sun.state === 'above_horizon' : true;
    const key = isDay ? 'sunny-day' : 'sunny-night';
    return (WEATHER_ICON_SET as Record<string, TemplateResult>)[key] ?? html``;
  }

  private _renderHeader(): TemplateResult {
    const label = this.config.header_message ?? 'Water Management';
    return html`
      <div class="header">
        <div class="info">
          <span class="header-text" @click="${this._handleHeaderClick}" style="${this.config.tap_action ? 'cursor: pointer;' : ''}">${label}</span>
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
          title="${msg('Rafraîchir les logs')}"
          @click="${() => this._syncLogs()}"
        >
          <sf-icon icon="mdi:refresh" style="--icon-width:18px;--icon-height:18px;" .connection="${this.hass.connection}"></sf-icon>
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
            style="margin-bottom: 12px; display: block;"
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
            style="margin-bottom: 12px; display: block;"
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
    const isSensor = domain === 'sensor' || domain === 'number';
    const isSelect = domain === 'select';
    const name = stateObj?.attributes?.friendly_name || entityEntry.entity_id;
    
    // Formatting sensor values
    let stateDisplay = stateObj?.state || 'Unknown';
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
    const serviceDomain = ['switch', 'valve', 'automation', 'input_boolean'].includes(domain) ? domain : 'homeassistant';
    
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
    const serviceDomain = domain === 'input_select' ? 'input_select' : 'select';
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
