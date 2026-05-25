/**
 * sci-fi-vehicles — v2.0.0
 * Spec 12 § sci-fi-vehicles.ts — Full reconstruction: header + landspeeder + AC actions.
 * Aligned with main branch architecture (sf-landspeeder component, Renault AC service).
 */

import { html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { SciFiBaseCard } from '../../utils/base-card.js';
import { sciFiCommonStyles } from '../../styles/common.js';
import { vehicleStyles } from './styles.js';
import type { SciFiVehiclesConfig, SciFiVehicleEntry } from '../../types/config.js';
import {
  HASS_RENAULT_SERVICE,
  HASS_RENAULT_SERVICE_ACTION_START_AC,
  HASS_RENAULT_SERVICE_ACTION_STOP_AC,
} from '../../components/vehicle_const.js';

import '../../components/sf-landspeeder.js';
import '../../components/sf-wheel.js';
import '../../components/buttons/sf-button-card.js';
import '../../components/buttons/sf-button.js';

const TAG = 'sci-fi-vehicles';

@customElement(TAG)
export class SciFiVehiclesCard extends SciFiBaseCard {
  static override styles = [sciFiCommonStyles, vehicleStyles];

  protected override getRelevantEntities(): string[] {
    const entities = new Set<string>();

    if (this.config.vehicles) {
      for (const v of this.config.vehicles) {
        if (v.charging) entities.add(v.charging);
        if (v.lock_status) entities.add(v.lock_status);
        if (v.location) entities.add(v.location);
        if (v.battery_autonomy) entities.add(v.battery_autonomy);
        if (v.fuel_autonomy) entities.add(v.fuel_autonomy);
        if (v.battery_level) entities.add(v.battery_level);
        if (v.location_last_activity) entities.add(v.location_last_activity);
        if (v.charge_state) entities.add(v.charge_state);
        if (v.plug_state) entities.add(v.plug_state);
        if (v.mileage) entities.add(v.mileage);
        if (v.fuel_quantity) entities.add(v.fuel_quantity);
        if (v.charging_remaining_time) entities.add(v.charging_remaining_time);
      }
    }

    return Array.from(entities);
  }

  declare config: SciFiVehiclesConfig;

  @state() private _active_vehicle_id: number = 0;
  @state() private _selected_temp_id: number = 2; // default 18°C
  @state() private _is_ac_loading: boolean = false;

  protected override renderCard(): TemplateResult {
    return html`
      <ha-card>
        <div class="container">
          ${this._renderHeader()}
          <sf-landspeeder
            .vehicle="${this.config.vehicles[this._active_vehicle_id]}"
            .hass="${this.hass}"
          ></sf-landspeeder>
          ${this._renderActions()}
        </div>
        <sf-toast></sf-toast>
      </ha-card>
    `;
  }

  // ── HEADER ────────────────────────────────────────────────────────────────

  private _renderHeader(): TemplateResult {
    const multiple = this.config.vehicles.length > 1;
    const v = this.config.vehicles[this._active_vehicle_id]!;
    return html`
      <div class="header">
        <div class="${multiple ? '' : 'hide'}">
          <sf-button icon="mdi:chevron-left" @button-click="${this._prev}"></sf-button>
        </div>
        <div class="title">${v.name}</div>
        <div class="${multiple ? '' : 'hide'}">
          <sf-button icon="mdi:chevron-right" @button-click="${this._next}"></sf-button>
        </div>
      </div>
    `;
  }

  private _prev = (): void => {
    const len = this.config.vehicles.length;
    this._active_vehicle_id = this._active_vehicle_id === 0 ? len - 1 : this._active_vehicle_id - 1;
  };

  private _next = (): void => {
    const len = this.config.vehicles.length;
    this._active_vehicle_id = this._active_vehicle_id === len - 1 ? 0 : this._active_vehicle_id + 1;
  };

  // ── ACTIONS ───────────────────────────────────────────────────────────────

  private _renderActions(): TemplateResult {
    const v = this.config.vehicles[this._active_vehicle_id]!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tempUnit = (this.hass as any).config?.unit_system?.temperature ?? '°C';
    const tempItems = Array.from({ length: 10 }, (_, idx) => ({
      id: String(idx),
      text: `${idx + 16} ${tempUnit}`,
    }));

    return html`
      <div class="actions">
        <div class="ac">
          <sf-wheel
            in-line
            .items="${tempItems}"
            selected-id="${String(this._selected_temp_id)}"
            text="${msg('Temperature')}"
            @wheel-change="${this._onTempChange}"
            ?disabled="${this._is_ac_loading}"
          ></sf-wheel>
          <sf-button-card
            icon="mdi:play"
            title="${msg('Air-cond')}"
            text="${msg('Start')}"
            @button-click="${() => this._startAc(v)}"
            ?disabled="${this._is_ac_loading}"
          ></sf-button-card>
          <sf-button-card
            icon="mdi:stop"
            title="${msg('Air-cond')}"
            text="${msg('Stop')}"
            @button-click="${() => this._stopAc(v)}"
            ?disabled="${this._is_ac_loading}"
          ></sf-button-card>
        </div>
      </div>
    `;
  }

  private _onTempChange = (e: CustomEvent<{ id: string }>): void => {
    this._selected_temp_id = Number(e.detail.id);
  };

  private _startAc(v: SciFiVehicleEntry): void {
    this._is_ac_loading = true;
    const temperature = this._selected_temp_id + 16;
    void this.hass
      .callService(HASS_RENAULT_SERVICE, HASS_RENAULT_SERVICE_ACTION_START_AC, {
        vehicle: v.id,
        temperature,
      })
      .then(() => { this._showToast(false, msg('done')); })
      .catch((e: Error) => { this._showToast(true, e.message); })
      .finally(() => { this._is_ac_loading = false; });
  }

  private _stopAc(v: SciFiVehicleEntry): void {
    this._is_ac_loading = true;
    void this.hass
      .callService(HASS_RENAULT_SERVICE, HASS_RENAULT_SERVICE_ACTION_STOP_AC, {
        vehicle: v.id,
      })
      .then(() => { this._showToast(false, msg('done')); })
      .catch((e: Error) => { this._showToast(true, e.message); })
      .finally(() => { this._is_ac_loading = false; });
  }

  private _showToast(error: boolean, text: string): void {
    const toast = this.shadowRoot?.querySelector('sf-toast') as any;
    if (toast?.addMessage) toast.addMessage(text, error);
  }

  // ── STATIC CONFIG ─────────────────────────────────────────────────────────

  static getConfigElement(): HTMLElement {
    return document.createElement(`${TAG}-editor`);
  }

  static getStubConfig(): SciFiVehiclesConfig {
    return { type: `custom:${TAG}`, vehicles: [{ id: 'v1', name: 'Mon véhicule' }] };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiVehiclesCard;
  }
}
