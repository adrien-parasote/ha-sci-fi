/**
 * <sci-fi-lights> — v2
 * Shows lights by floor → area, with hexagonal area selector.
 * Layout matches production (main branch): hexa floor row + vertical hexa area list + right panel.
 */

import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiLightsConfig } from '../../types/config.js';
import type { HassFloor, HassArea, HassEntityEntry } from '../../types/ha.js';
import { fireHassAction } from '../../utils/action.js';
import {
  getFloors,
  getAreasByFloor,
  getAreaById,
} from '../../selectors/house.js';
import {
  getLightEntities,
  hasActiveLights,
} from '../../selectors/light.js';
import WEATHER_ICON_SET from '../../components/sf-icon/data/sf-weather-icons.js';

import { lightStyles } from './styles.js';

const TAG = 'sci-fi-lights';

// SVG hexagon points (pointy-top, portrait orientation)
const HEXA_BG = '66,2 130,42 130,122 66,162 2,122 2,42';
const HEXA_BORDER = '66,4 128,43 128,121 66,160 4,121 4,43';

// Default icon fallbacks
const DEFAULT_FLOOR_ICON = 'mdi:floor-plan';
const DEFAULT_AREA_ICON = 'mdi:home-outline';

@customElement(TAG)
export class SciFiLightsCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    lightStyles,
  ];

  protected override getRelevantEntities(): string[] {
    const entities = new Set<string>();
    entities.add('sun.sun');

    const ignored = this.config.ignored_entities ?? [];
    for (const entityId of Object.keys(this.hass?.states || {})) {
      if (entityId.startsWith('light.') && !ignored.includes(entityId)) {
        entities.add(entityId);
      }
    }

    return Array.from(entities);
  }

  @state() private _activeFloorId: string | null = null;
  @state() private _activeAreaId: string | null = null;

  declare config: SciFiLightsConfig;

  override setConfig(config: SciFiLightsConfig): void {
    super.setConfig(config);
    this._activeFloorId = config.first_floor_to_render ?? null;
    this._activeAreaId = config.first_area_to_render ?? null;
  }

  protected override renderCard(): TemplateResult {
    const floors = getFloors(this.hass);
    if (floors.length === 0) {
      return html`<ha-card><div class="empty-state">Aucun étage configuré</div></ha-card>`;
    }

    const ignored = this.config.ignored_entities ?? [];

    // Helper: light-bearing areas for a floor
    const lightAreas = (floorId: string) =>
      getAreasByFloor(this.hass, floorId).filter(
        a => getLightEntities(this.hass, a.area_id)
               .filter(e => !ignored.includes(e.entity_id)).length > 0
      );


    // Validate _activeFloorId: must exist in hass.floors.
    // If not (stale/missing ID or friendly name from config), fall back to first floor with lights, then any floor.
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

        this._activeFloorId = resolvedFloorId ??
          floors.find(f => lightAreas(f.floor_id).length > 0)?.floor_id ??
          floors[0]?.floor_id ?? null;
      }
    }

    const areasWithLights = this._activeFloorId ? lightAreas(this._activeFloorId) : [];
    const allAreasOnFloor = this._activeFloorId
      ? getAreasByFloor(this.hass, this._activeFloorId)
      : [];

    // Validate _activeAreaId: must be in any area of the active floor.
    // Falls back to first light area, then first area on the floor.
    if (!allAreasOnFloor.some(a => a.area_id === this._activeAreaId)) {
      this._activeAreaId = areasWithLights[0]?.area_id ?? allAreasOnFloor[0]?.area_id ?? null;
    }

    const activeLights = this._activeAreaId
      ? getLightEntities(this.hass, this._activeAreaId).filter(e => !ignored.includes(e.entity_id))
      : [];

    // Global house has active lights?
    const houseActive = floors.some(f =>
      getAreasByFloor(this.hass, f.floor_id).some(a => hasActiveLights(this.hass, a.area_id))
    );

    // Current floor stats
    const floorAllLights = areasWithLights.flatMap(a =>
      getLightEntities(this.hass, a.area_id).filter(e => !ignored.includes(e.entity_id))
    );
    const floorOnCount = floorAllLights.filter(e => this.hass.states[e.entity_id]?.state === 'on').length;
    const floorTotal = floorAllLights.length;
    const floorActive = floorOnCount > 0;
    const currentFloor = this._activeFloorId ? (this.hass.floors?.[this._activeFloorId] ?? null) : null;

    return html`
      <ha-card>
        <div class="container">
          ${this._renderHeader(houseActive)}
          <div class="floors">
            ${repeat(floors, f => f.floor_id, f => this._renderFloorHexa(f))}
          </div>
          ${currentFloor ? this._renderFloorInfo(currentFloor, floorTotal, floorOnCount, floorActive) : ''}
          <div class="areas-section">
            ${areasWithLights.length > 0 ? html`
              <div class="area-list">
                ${repeat(areasWithLights, a => a.area_id, (a, idx) => this._renderAreaRow(a, idx))}
              </div>
              <div class="area-content ${this._activeAreaId && hasActiveLights(this.hass, this._activeAreaId) ? '' : 'area-off'}">
                ${this._renderAreaContent(activeLights)}
              </div>
            ` : html`<div class="empty-state">Aucune lumière configurée pour cet étage</div>`}
          </div>
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  // ── Header ──────────────────────────────────────────────────────────────────

  private _getDayNightIcon(): TemplateResult {
    const sun = this.hass?.states['sun.sun'];
    const isDay = sun ? sun.state === 'above_horizon' : true;
    const key = isDay ? 'sunny-day' : 'sunny-night';
    return (WEATHER_ICON_SET as Record<string, TemplateResult>)[key] ?? html``;
  }

  private _renderHeader(houseActive: boolean): TemplateResult {
    const label = this.config.header_message ?? 'Lumières';
    return html`
      <div class="header">
        <div class="info">
          <button
            class="power-btn header-power ${houseActive ? '' : 'is-off'}"
            title="${houseActive ? 'Tout éteindre' : 'Tout allumer'}"
            @click="${() => this._toggleAllLights(houseActive)}"
          >${this._powerSvg()}</button>
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

  // ── Floor hexagon ────────────────────────────────────────────────────────────

  private _renderFloorHexa(floor: HassFloor): TemplateResult {
    const isSelected = floor.floor_id === this._activeFloorId;
    // Active = ≥1 light ON in any area of this floor
    const isActive = getAreasByFloor(this.hass, floor.floor_id).some(a =>
      hasActiveLights(this.hass, a.area_id)
    );
    const icon = floor.icon ?? DEFAULT_FLOOR_ICON;

    return html`
      <div
        class="floor-hexa"
        data-selected="${isSelected}"
        data-active="${isActive}"
        title="${floor.name}"
        @click="${() => this._selectFloor(floor.floor_id)}"
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

  // ── Floor info bar ───────────────────────────────────────────────────────────

  private _renderFloorInfo(
    floor: HassFloor,
    total: number,
    onCount: number,
    active: boolean
  ): TemplateResult {
    const dots: TemplateResult[] = [];
    let remaining = onCount;
    for (let i = 0; i < total; i++) {
      dots.push(html`<div class="${remaining-- > 0 ? '' : 'dot-off'}"></div>`);
    }

    return html`
      <div class="floor-content">
        <div class="floor-info ${active ? '' : 'floor-off'}">
          <div class="floor-title">
            ${floor.name}
            <button
              class="power-btn ${active ? '' : 'is-off'}"
              title="${active ? 'Éteindre cet étage' : 'Allumer cet étage'}"
              @click="${() => this._toggleFloorLights(floor.floor_id, active)}"
            >${this._powerSvg()}</button>
          </div>
          <div class="floor-lights">${dots}</div>
        </div>
      </div>
    `;
  }

  // ── Area row (hexa + connector) ──────────────────────────────────────────────

  private _renderAreaRow(area: HassArea, idx: number): TemplateResult {
    const isSelected = area.area_id === this._activeAreaId;
    // Active = ≥1 light ON in this area
    const isActive = hasActiveLights(this.hass, area.area_id);
    const icon = area.icon ?? DEFAULT_AREA_ICON;
    const isOdd = idx % 2 === 1;

    return html`
      <div class="area-row ${isOdd ? 'row-odd' : ''}">
        <div
          class="area-hexa"
          data-selected="${isSelected}"
          data-active="${isActive}"
          title="${area.name}"
          @click="${() => this._selectArea(area.area_id)}"
        >
          <svg viewBox="0 0 132 164">
            <polygon class="hexa-bg" points="${HEXA_BG}" />
            <polygon class="hexa-border" points="${HEXA_BORDER}" />
          </svg>
          <div class="hexa-content">
            <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
          </div>
        </div>
        <!-- Connector: visible=selected, bright=active -->
        <div class="h-separator ${isSelected ? 'show' : ''}">
          <div class="sep-circle ${isActive ? 'active' : ''}"></div>
          <div class="sep-line ${isActive ? 'active' : ''}"></div>
          <div class="sep-circle ${isActive ? 'active' : ''}"></div>
        </div>
      </div>
    `;
  }

  // ── Area content panel ───────────────────────────────────────────────────────

  private _renderAreaContent(lights: readonly HassEntityEntry[]): TemplateResult {
    if (!this._activeAreaId) {
      return html`<div class="empty-state">Sélectionnez une pièce</div>`;
    }

    const area = getAreaById(this.hass, this._activeAreaId);
    const active = hasActiveLights(this.hass, this._activeAreaId);
    const overrides = this.config.custom_entities ?? {};

    return html`
      <div class="area-title">
        ${area?.name ?? ''}
        <button
          class="power-btn ${active ? '' : 'is-off'}"
          title="${active ? 'Éteindre la pièce' : 'Allumer la pièce'}"
          @click="${() => this._toggleAreaLights(this._activeAreaId!, active)}"
        >${this._powerSvg()}</button>
      </div>
      <div class="lights-grid">
        ${lights.length === 0
          ? html`<div class="empty-state" style="grid-column:1/-1">Aucune lumière</div>`
          : repeat(lights, l => l.entity_id, l => this._renderLightBtn(l, overrides))
        }
      </div>
    `;
  }

  private _renderLightBtn(
    light: HassEntityEntry,
    overrides: Readonly<Record<string, { name?: string; icon_on?: string; icon_off?: string }>>
  ): TemplateResult {
    const stateObj = this.hass.states[light.entity_id];
    const isOn = stateObj?.state === 'on';
    const override = overrides[light.entity_id];

    // Name priority: YAML custom_entities.name → HA friendly_name → entity_id
    const name = override?.name
      ?? stateObj?.attributes?.friendly_name
      ?? light.entity_id;

    // Icon priority: YAML custom_entities.icon_on/off → HA entity icon attr → config default → hardcoded
    const haIcon = stateObj?.attributes?.icon as string | undefined;
    const iconOn = override?.icon_on
      ?? haIcon
      ?? this.config.default_icon_on
      ?? 'mdi:lightbulb-on-outline';
    const iconOff = override?.icon_off
      ?? haIcon
      ?? this.config.default_icon_off
      ?? 'mdi:lightbulb-outline';
    const icon = isOn ? iconOn : iconOff;


    return html`
      <button
        class="light-btn ${isOn ? '' : 'light-off'}"
        title="${name}"
        @click="${() => this._toggleLight(light.entity_id, isOn)}"
      >
        <sf-icon .icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
        <span class="light-label">${name}</span>
      </button>
    `;
  }

  // ── Power SVG icon ───────────────────────────────────────────────────────────

  private _powerSvg(): TemplateResult {
    return html`
      <svg viewBox="0 0 24 24">
        <path d="M12 2v10M6.34 5.34a9 9 0 1 0 11.32 0" stroke-linecap="round"/>
      </svg>
    `;
  }

  // ── Service calls ────────────────────────────────────────────────────────────

  private _selectFloor(floorId: string): void {
    if (this._activeFloorId === floorId) return;
    this._activeFloorId = floorId;
    this._activeAreaId = null;
  }

  private _selectArea(areaId: string): void {
    this._activeAreaId = areaId;
  }

  private _toggleLight(entityId: string, isOn: boolean): void {
    void this.hass
      .callService('light', isOn ? 'turn_off' : 'turn_on', { entity_id: entityId })
      .then(() => { this._showToast(false, isOn ? 'Lumière éteinte' : 'Lumière allumée'); })
      .catch((e: Error) => { this._showToast(true, e.message); });
  }

  private _toggleAreaLights(areaId: string, active: boolean): void {
    const ignored = this.config.ignored_entities ?? [];
    const entityIds = getLightEntities(this.hass, areaId)
      .filter(e => !ignored.includes(e.entity_id))
      .map(l => l.entity_id);
    if (entityIds.length === 0) return;
    void this.hass
      .callService('light', active ? 'turn_off' : 'turn_on', { entity_id: entityIds })
      .then(() => { this._showToast(false, active ? 'Pièce éteinte' : 'Pièce allumée'); })
      .catch((e: Error) => { this._showToast(true, e.message); });
  }

  private _toggleFloorLights(floorId: string, active: boolean): void {
    const ignored = this.config.ignored_entities ?? [];
    const entityIds = getAreasByFloor(this.hass, floorId).flatMap(a =>
      getLightEntities(this.hass, a.area_id)
        .filter(e => !ignored.includes(e.entity_id))
        .map(l => l.entity_id)
    );
    if (entityIds.length === 0) return;
    void this.hass
      .callService('light', active ? 'turn_off' : 'turn_on', { entity_id: entityIds })
      .then(() => { this._showToast(false, active ? 'Étage éteint' : 'Étage allumé'); })
      .catch((e: Error) => { this._showToast(true, e.message); });
  }

  private _toggleAllLights(active: boolean): void {
    const ignored = this.config.ignored_entities ?? [];
    const entityIds = getFloors(this.hass).flatMap(f =>
      getAreasByFloor(this.hass, f.floor_id).flatMap(a =>
        getLightEntities(this.hass, a.area_id)
          .filter(e => !ignored.includes(e.entity_id))
          .map(l => l.entity_id)
      )
    );
    if (entityIds.length === 0) return;
    void this.hass
      .callService('light', active ? 'turn_off' : 'turn_on', { entity_id: entityIds })
      .then(() => { this._showToast(false, active ? 'Tout éteint' : 'Tout allumé'); })
      .catch((e: Error) => { this._showToast(true, e.message); });
  }

  private _showToast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, error);
  }

  // ── Card registration ────────────────────────────────────────────────────────

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiLightsConfig {
    return { type: `custom:${TAG}` };
  }

  override getCardSize(): number {
    return this.config ? 5 : 3;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiLightsCard;
  }
}
