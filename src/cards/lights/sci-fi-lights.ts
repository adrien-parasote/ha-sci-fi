/**
 * <sci-fi-lights> — v2
 * Shows lights by floor → area, with hexagonal area selector.
 * Layout matches production (main branch): hexa floor row + vertical hexa area list + right panel.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiLightsConfig } from '../../types/config.js';
import type { HassFloor, HassArea, HassEntityEntry } from '../../types/ha.js';
import {
  getFloors,
  getAreasByFloor,
  getAreaById,
} from '../../selectors/house.js';
import {
  getLightEntities,
  hasActiveLights,
} from '../../selectors/light.js';
import WEATHER_ICON_SET from '../../components/icons/data/sf-weather-icons.js';

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
    css`
      /* ── Host / Card shell ───────────────────────────────── */
      :host {
        --light-on-color: rgb(255, 193, 7);
        --hexa-w: 60px;
        --hexa-h: calc(var(--hexa-w) * 1.1547);
        --corner-size: 10px;
        display: block;
        height: 100%;
      }

      ha-card {
        background: #000000 !important;
        border: none !important;
        height: 100%;
        width: 100%;
        display: block;
        box-sizing: border-box;
      }

      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
      }

      /* ── Header ─────────────────────────────────────────── */
      .header {
        display: flex;
        flex-direction: row;
        border-bottom: 1px solid rgba(0,210,255,0.2);
        background-color: rgba(0,0,0,0.6);
        padding: 5px 10px 0 10px;
        align-items: center;
        min-height: 44px;
      }
      .header .info {
        flex: 1;
        display: flex;
        flex-direction: row;
        column-gap: 5px;
        align-items: center;
        padding-bottom: 5px;
      }
      .header-text {
        font-size: 0.9rem;
        color: var(--sf-primary, #00d2ff);
        text-shadow: 0 0 5px var(--sf-primary, #00d2ff);
      }
      /* Day/night icon — top-right of header */
      .header .weather-icon {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .header .weather-icon svg {
        width: 100%;
        height: 100%;
      }

      /* ── Floors row (hexa) ───────────────────────────────── */
      .floors {
        display: flex;
        flex-direction: row;
        column-gap: 5px;
        justify-content: center;
        align-items: center;
        margin: 10px 0;
        padding: 0 8px;
      }

      .floor-hexa {
        position: relative;
        width: var(--hexa-w);
        height: var(--hexa-h);
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      .floor-hexa:hover { transform: scale(1.08); }
      /* Selected floor is visually larger (matches main branch) */
      .floor-hexa[data-selected="true"] {
        transform: scale(1.3);
        z-index: 1;
      }
      .floor-hexa[data-selected="true"]:hover { transform: scale(1.35); }

      .floor-hexa svg { width: 100%; height: 100%; display: block; }
      .floor-hexa .hexa-bg { transition: fill 0.15s; }
      .floor-hexa .hexa-border { fill: none; transition: stroke 0.15s, filter 0.15s; }

      /*
       * Floor hexa states:
       *   data-selected="true"  → border glow (this floor is selected)
       *   data-active="true"    → icon bright (≥1 light ON in this floor)
       */
      .floor-hexa .hexa-bg { fill: rgba(16,22,38,0.6); }
      .floor-hexa .hexa-border { stroke: rgba(224,232,255,0.15); stroke-width: 1.5px; }

      /* Selected = glowing border */
      .floor-hexa[data-selected="true"] .hexa-bg { fill: rgba(0,210,255,0.12); }
      .floor-hexa[data-selected="true"] .hexa-border {
        stroke: var(--sf-primary, #00d2ff);
        stroke-width: 2.5px;
        filter: drop-shadow(0 0 6px var(--sf-primary, #00d2ff));
      }
      .floor-hexa:hover .hexa-border {
        stroke: var(--sf-primary, #00d2ff);
        filter: drop-shadow(0 0 5px var(--sf-primary, #00d2ff));
      }

      .floor-hexa .hexa-content {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        padding: 4px;
        box-sizing: border-box;
      }
      .floor-hexa .hexa-content sf-icon {
        --icon-width: 20px;
        --icon-height: 20px;
        /* Default: dim (no lights on) */
        --icon-color: rgba(224,232,255,0.35);
        display: block;
      }
      /* Active = icon bright (≥1 light on in floor) */
      .floor-hexa[data-active="true"] .hexa-content sf-icon {
        --icon-color: var(--sf-primary, #00d2ff);
      }
      .floor-hexa .floor-name {
        font-size: 0.48rem;
        font-weight: 600;
        /* Default: dim */
        color: rgba(224,232,255,0.35);
        margin-top: 2px;
        text-align: center;
        max-width: 90%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      /* Active = name bright */
      .floor-hexa[data-active="true"] .floor-name { color: var(--sf-primary, #00d2ff); }

      /* ── Floor info panel ────────────────────────────────── */
      .floor-content {
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid rgba(0,210,255,0.15);
        border-top: 1px solid rgba(0,210,255,0.15);
        padding: 10px 0;
        margin: 0 0 16px 0;
        background-color: rgba(0,0,0,0.4);
      }
      .floor-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
        min-width: 200px;
        color: var(--sf-primary, #00d2ff);
      }
      .floor-info.floor-off { color: rgba(224,232,255,0.4); }
      .floor-title {
        font-size: 0.9rem;
        font-weight: bold;
        border-bottom: 1px solid currentColor;
        padding-bottom: 5px;
        margin-bottom: 8px;
        width: 100%;
        /* Center the name, button floats right (absolute) */
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .floor-title .power-btn {
        position: absolute;
        right: 0;
      }
      .floor-lights {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
        padding: 0 10px;
      }
      .floor-lights > div {
        border-radius: 50%;
        height: 10px;
        width: 10px;
        background-color: var(--light-on-color);
        box-shadow: 0 0 4px var(--light-on-color);
      }
      .floor-lights > div.dot-off {
        background-color: rgba(255,255,255,0.12);
        box-shadow: none;
      }

      /* ── Areas section — left column + right panel ───────── */
      .areas-section {
        display: flex;
        flex-direction: row;
        flex: 1;                  /* fill all remaining vertical space in .container */
        align-items: stretch;     /* right panel stretches to same height as area-list */
        padding: 0 10px;
        gap: 0;
        overflow: hidden;
      }

      /* ── Area list (vertical column) ─────────────────────── */
      /*
       * Each area row contains: hexagon + connector line.
       * Odd rows (1, 3, …) are offset right by hexa-w/2 to create
       * the staggered honeycomb column effect matching the main branch.
       * The negative bottom margin creates the vertical overlap.
       */
      .area-list {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        /* width = max possible: hexa-w + hexa-w/2 offset */
        width: calc(var(--hexa-w) * 1.5 + 60px); /* hexa + connector */
      }
      .area-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        /* Vertical overlap to create honeycomb stacking */
        margin-bottom: calc(var(--hexa-h) * -0.27);
        position: relative;
      }
      .area-row:last-child { margin-bottom: 0; }

      /* Stagger: odd rows shift right by half a hexagon */
      .area-row.row-odd {
        padding-left: calc(var(--hexa-w) / 2);
      }

      /* ── Area hexagon ─────────────────────────────────────── */
      .area-hexa {
        position: relative;
        width: var(--hexa-w);
        height: var(--hexa-h);
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.15s;
      }
      .area-hexa:hover { transform: scale(1.05); }
      .area-hexa svg { width: 100%; height: 100%; display: block; }
      .area-hexa .hexa-bg { transition: fill 0.15s; }
      .area-hexa .hexa-border { fill: none; transition: stroke 0.15s, filter 0.15s; }

      /*
       * Area hexa states:
       *   data-selected="true"  → border glow (this area is selected)
       *   data-active="true"    → icon bright (≥1 light ON in this area)
       */
      .area-hexa .hexa-bg { fill: rgba(16,22,38,0.6); }
      .area-hexa .hexa-border { stroke: rgba(224,232,255,0.12); stroke-width: 1.5px; }

      /* Selected = glowing border */
      .area-hexa[data-selected="true"] .hexa-bg { fill: rgba(0,210,255,0.12); }
      .area-hexa[data-selected="true"] .hexa-border {
        stroke: var(--sf-primary, #00d2ff);
        stroke-width: 2.5px;
        filter: drop-shadow(0 0 7px var(--sf-primary, #00d2ff));
      }

      .area-hexa .hexa-content {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }
      .area-hexa .hexa-content sf-icon {
        --icon-width: 22px;
        --icon-height: 22px;
        /* Default: dim (no lights on) */
        --icon-color: rgba(224,232,255,0.3);
        display: block;
      }
      /* Active = icon bright (≥1 light on in area) */
      .area-hexa[data-active="true"] .hexa-content sf-icon {
        --icon-color: var(--sf-primary, #00d2ff);
      }

      /* ── Connector: hexa → content panel ─────────────────── */
      /*
       *  Visible  = selected area  (show class)
       *  Bright   = active area (≥1 light ON)  (.active class on sep-circle/sep-line)
       */
      .h-separator {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 8px;
        width: 0;
        overflow: hidden;
        opacity: 0;
        transition: width 0.2s ease, opacity 0.2s ease;
      }
      /* Visible when selected */
      .h-separator.show {
        width: 50px;
        opacity: 1;
      }
      /* Dim by default (selected but no lights on) */
      .sep-circle {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        flex-shrink: 0;
        background-color: rgba(255,255,255,0.2);
      }
      /* Bright when area is active */
      .sep-circle.active {
        background-color: var(--sf-primary, #00d2ff);
        box-shadow: 0 0 4px var(--sf-primary, #00d2ff);
      }
      .sep-line {
        flex: 1;
        height: 1px;
        background-color: rgba(255,255,255,0.2);
      }
      .sep-line.active { background-color: var(--sf-primary, #00d2ff); }

      /* ── Area content panel (right) ──────────────────── */
      .area-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 10px;
        min-width: 0;
        /* Vertically align with first area row */
        margin-top: calc(var(--hexa-h) * 0.1);

        /* Sci-fi corner decoration (from main branch common_style) */
        border-width: 1px;
        border-style: solid;
        border-color: var(--sf-primary, #00d2ff);
        mask:
          conic-gradient(#000 0 0) content-box,
          conic-gradient(
            at var(--corner-size) var(--corner-size),
            #0000 75%,
            #000 0
          )
          0 0 / calc(100% - var(--corner-size)) calc(100% - var(--corner-size));
      }
      .area-content.area-off {
        border-color: rgba(255,255,255,0.15);
        color: rgba(224,232,255,0.4);
      }
      .area-title {
        font-size: 0.9rem;
        font-weight: bold;
        border-bottom: 1px solid currentColor;
        padding-bottom: 5px;
        margin-bottom: 8px;
        /* Center the name, button floats right (absolute) */
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 28px;
      }
      .area-title .power-btn {
        position: absolute;
        right: 0;
      }
      /* Power button is last child → pushed to right by space-between */

      /* ── Light buttons grid ───────────────────────────────── */
      .lights-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5px;
        padding: 5px 0;
        justify-items: center;
        width: 100%;
      }
      .light-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        border: 1px solid var(--sf-primary, #00d2ff);
        border-radius: 6px;
        padding: 6px 4px;
        cursor: pointer;
        background: transparent;
        transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
        width: 100%;
        box-sizing: border-box;
        min-width: 0;
      }
      .light-btn.light-off { border-color: rgba(255,255,255,0.12); }
      .light-btn:hover { box-shadow: 0 0 8px rgba(0,210,255,0.35); }
      .light-btn sf-icon {
        --icon-width: 20px;
        --icon-height: 20px;
        --icon-color: var(--light-on-color);
        display: block;
      }
      .light-btn.light-off sf-icon { --icon-color: rgba(255,255,255,0.2); }
      .light-label {
        font-size: 0.55rem;
        color: var(--sf-primary, #00d2ff);
        text-align: center;
        line-height: 1.2;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .light-btn.light-off .light-label { color: rgba(255,255,255,0.25); }

      /* ── Shared: power button ─────────────────────────────── */
      .power-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.15s;
        flex-shrink: 0;
      }
      .power-btn:hover { background: rgba(0,210,255,0.12); }
      .power-btn svg {
        width: 14px;
        height: 14px;
        fill: none;
        stroke: var(--sf-primary, #00d2ff);
        stroke-width: 2;
        filter: drop-shadow(0 0 3px var(--sf-primary, #00d2ff));
        transition: stroke 0.15s, filter 0.15s;
      }
      .power-btn.is-off svg { stroke: rgba(255,255,255,0.2); filter: none; }
      .header-power svg { width: 18px; height: 18px; }

      /* ── Empty state ──────────────────────────────────────── */
      .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        color: rgba(255,255,255,0.3);
        font-size: 0.8rem;
      }
    `,
  ];

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
    // If not (stale/missing ID), fall back to first floor with lights, then any floor.
    const floorExists = !!this._activeFloorId && !!this.hass.floors?.[this._activeFloorId];
    if (!floorExists) {
      this._activeFloorId =
        floors.find(f => lightAreas(f.floor_id).length > 0)?.floor_id ??
        floors[0]?.floor_id ?? null;
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
          <span class="header-text">${label}</span>
        </div>
        <div class="weather-icon">${this._getDayNightIcon()}</div>
      </div>
    `;
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
          <span class="floor-name">${floor.name}</span>
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
    void this.hass.callService('light', isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
  }

  private _toggleAreaLights(areaId: string, active: boolean): void {
    const ignored = this.config.ignored_entities ?? [];
    const entityIds = getLightEntities(this.hass, areaId)
      .filter(e => !ignored.includes(e.entity_id))
      .map(l => l.entity_id);
    if (entityIds.length === 0) return;
    void this.hass.callService('light', active ? 'turn_off' : 'turn_on', { entity_id: entityIds });
  }

  private _toggleFloorLights(floorId: string, active: boolean): void {
    const ignored = this.config.ignored_entities ?? [];
    const entityIds = getAreasByFloor(this.hass, floorId).flatMap(a =>
      getLightEntities(this.hass, a.area_id)
        .filter(e => !ignored.includes(e.entity_id))
        .map(l => l.entity_id)
    );
    if (entityIds.length === 0) return;
    void this.hass.callService('light', active ? 'turn_off' : 'turn_on', { entity_id: entityIds });
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
    void this.hass.callService('light', active ? 'turn_off' : 'turn_on', { entity_id: entityIds });
  }

  // ── Card registration ────────────────────────────────────────────────────────

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiLightsConfig {
    return { type: `custom:${TAG}` };
  }

  override getCardSize(): number {
    return 5;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiLightsCard;
  }
}
