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
  declare config: SciFiWaterManagementConfig;

  static override get properties() {
    return {
      hass: { type: Object },
      config: { type: Object }
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
      if (devId === 'no_device') {
        groups.push(html`
          <sf-editor-accordion
            title=${msg("Automations")}
            ?open="${true}"
            style="margin-bottom: 12px; display: block;"
          >
            ${repeat(groupEntities, e => e.entity_id, e => this._renderEntityRow(e))}
          </sf-editor-accordion>
        `);
      } else {
        const deviceName = devicesSource[devId]?.name || msg('Device');
        groups.push(html`
          <sf-editor-accordion
            title="${deviceName}"
            ?open="${true}"
            style="margin-bottom: 12px; display: block;"
          >
            ${repeat(groupEntities, e => e.entity_id, e => this._renderEntityRow(e))}
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
            <span class="entity-state ${isOn ? 'state-active' : ''}">${isOn ? msg('ACTIVE') : msg('OFF')}</span>
            <sf-toggle-switch
              .checked="${isOn}"
              @sf-toggle-change="${() => this._toggleEntity(entityEntry.entity_id, isOn, domain)}"
            ></sf-toggle-switch>
          `}
        </div>
      </div>
    `;
  }

  private _toggleEntity(entityId: string, isOn: boolean, domain: string): void {
    const serviceDomain = ['switch', 'valve', 'automation', 'input_boolean'].includes(domain) ? domain : 'homeassistant';
    
    void this.hass
      .callService(serviceDomain, isOn ? 'turn_off' : 'turn_on', { entity_id: entityId })
      .then(() => { this._showToast(false, isOn ? msg('Turned off') : msg('Turned on')); })
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
