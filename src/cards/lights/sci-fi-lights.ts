/**
 * <sci-fi-lights> — v2
 * Shows lights by floor → area, with hexagonal area selector.
 */

import { html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiLightsConfig } from '../../types/config.js';
import type { HassEntityEntry } from '../../types/ha.js';
import {
  getFloors,
  getFirstFloor,
  getAreasByFloor,
} from '../../selectors/house.js';
import {
  getLightEntities,
  countActiveLights,
  hasActiveLights,
} from '../../selectors/light.js';

const TAG = 'sci-fi-lights';

@customElement(TAG)
export class SciFiLightsCard extends SciFiBaseCard {
  static override styles = [
    sciFiCommonStyles,
    css`
      .container { padding: var(--sf-spacing-md); }
      .floors-nav {
        display: flex;
        gap: var(--sf-spacing-sm);
        margin-bottom: var(--sf-spacing-md);
        overflow-x: auto;
        padding-bottom: var(--sf-spacing-xs);
      }
      .floor-btn {
        background: var(--sf-bg-secondary);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius);
        color: var(--sf-text-secondary);
        font-size: var(--sf-font-size-sm);
        padding: var(--sf-spacing-xs) var(--sf-spacing-sm);
        cursor: pointer;
        white-space: nowrap;
        transition: all var(--sf-transition-fast);
      }
      .floor-btn[aria-selected="true"] {
        background: var(--sf-primary-dim);
        border-color: var(--sf-primary);
        color: var(--sf-primary);
      }
      .areas-grid {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sf-spacing-sm);
      }
      .area-tile {
        flex: 1 1 120px;
        background: var(--sf-bg-secondary);
        border: 1px solid var(--sf-border);
        border-radius: var(--sf-radius);
        padding: var(--sf-spacing-sm);
        cursor: pointer;
        transition: all var(--sf-transition-base);
      }
      .area-tile[data-active="true"] {
        border-color: var(--sf-primary);
        background: var(--sf-primary-dim);
      }
      .area-tile .area-name {
        font-size: var(--sf-font-size-sm);
        color: var(--sf-text-secondary);
        margin-bottom: 4px;
      }
      .area-tile .light-count {
        font-size: var(--sf-font-size-lg);
        font-weight: 600;
        color: var(--sf-accent-on);
      }
      .area-tile[data-active="false"] .light-count {
        color: var(--sf-text-disabled);
      }
      .light-list {
        margin-top: var(--sf-spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--sf-spacing-sm);
      }
      .light-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--sf-spacing-sm);
        background: var(--sf-bg-secondary);
        border-radius: var(--sf-radius-sm);
        border: 1px solid var(--sf-border);
      }
      .light-name {
        font-size: var(--sf-font-size-base);
        color: var(--sf-text-primary);
      }

      /* ── Responsive ───────────────────────────────────────── */
      @container sf-card (max-width: 1023px) {
        .area-tile { flex: 1 1 100px; }
      }
      @container sf-card (max-width: 599px) {
        .area-tile { flex: 1 1 80px; }
        .floor-btn {
          padding: var(--sf-spacing-xs) 6px;
          font-size: 0.7rem;
        }
        .container { padding: var(--sf-spacing-sm); }
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
      return html`<ha-card><div class="container">Aucun étage configuré</div></ha-card>`;
    }

    // Auto-select first floor if none selected
    if (!this._activeFloorId) {
      this._activeFloorId = getFirstFloor(this.hass)?.floor_id ?? null;
    }

    const areas = this._activeFloorId
      ? getAreasByFloor(this.hass, this._activeFloorId)
      : [];

    // Auto-select first area of current floor
    if (!this._activeAreaId && areas.length > 0) {
      this._activeAreaId = areas[0]?.area_id ?? null;
    }

    const activeLights = this._activeAreaId
      ? getLightEntities(this.hass, this._activeAreaId).filter(e => {
          // ADR-005: ignored_entities (not ignored_entity_ids)
          const ignored = this.config.ignored_entities ?? [];
          return !ignored.includes(e.entity_id);
        })
      : [];

    return html`
      <ha-card>
        ${this.config.header_message
          ? html`<div class="sf-header">${this.config.header_message}</div>`
          : ''}
        <div class="container">
          ${this._renderFloorsNav(floors)}
          ${this._renderAreasGrid(areas)}
          ${this._renderLightList(activeLights)}
        </div>
      </ha-card>
    `;
  }

  private _renderFloorsNav(floors: readonly import('../../types/ha.js').HassFloor[]): TemplateResult {
    return html`
      <nav class="floors-nav" aria-label="Étages">
        ${repeat(
          floors,
          f => f.floor_id,
          f => html`
            <button
              class="floor-btn"
              aria-selected="${f.floor_id === this._activeFloorId}"
              @click="${() => this._selectFloor(f.floor_id)}"
            >${f.name}</button>
          `
        )}
      </nav>
    `;
  }

  private _renderAreasGrid(areas: readonly import('../../types/ha.js').HassArea[]): TemplateResult {
    return html`
      <div class="areas-grid">
        ${repeat(
          areas,
          a => a.area_id,
          a => {
            const count = countActiveLights(this.hass, a.area_id);
            const active = hasActiveLights(this.hass, a.area_id);
            return html`
              <div
                class="area-tile"
                data-active="${active}"
                role="button"
                tabindex="0"
                aria-pressed="${a.area_id === this._activeAreaId}"
                @click="${() => this._selectArea(a.area_id)}"
              >
                <div class="area-name">${a.name}</div>
                <div class="light-count">${count}</div>
              </div>
            `;
          }
        )}
      </div>
    `;
  }

  private _renderLightList(lights: readonly HassEntityEntry[]): TemplateResult {
    if (lights.length === 0) return html``;
    // ADR-005: custom_entities (not entity_overrides)
    const overrides = this.config.custom_entities ?? {};

    return html`
      <div class="light-list">
        ${repeat(
          lights,
          l => l.entity_id,
          l => {
            const state = this.hass.states[l.entity_id];
            const isOn = state?.state === 'on';
            const override = overrides[l.entity_id];
            const name = override?.name ?? state?.attributes.friendly_name ?? l.entity_id;
            const icon = isOn
              ? (override?.icon_on ?? 'mdi:lightbulb')
              : (override?.icon_off ?? 'mdi:lightbulb-outline');

            return html`
              <div class="light-row">
                <span class="light-name ${isOn ? 'sf-state-on' : 'sf-state-off'}">${name}</span>
                <sf-icon
                  .icon="${icon}"
                  .connection="${this.hass.connection}"
                ></sf-icon>
              </div>
            `;
          }
        )}
      </div>
    `;
  }

  private _selectFloor(floorId: string): void {
    if (this._activeFloorId === floorId) return;
    this._activeFloorId = floorId;
    this._activeAreaId = null; // reset area when floor changes
  }

  private _selectArea(areaId: string): void {
    this._activeAreaId = areaId;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiLightsConfig {
    return { type: `custom:${TAG}` };
  }

  getCardSize(): number {
    return 4;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiLightsCard;
  }
}
