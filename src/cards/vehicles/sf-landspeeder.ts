/**
 * sf-landspeeder.ts — Landspeeder display component
 * Ported from main:src/components/landspeeder/sf-landspeeder.js
 * Spec 12 § sf-landspeeder
 */
import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../styles/common.js';
import type { SciFiVehicleEntry } from './config.js';
import {
  CHARGE_STATE_ICONS,
  PLUG_STATE_ICONS,
  VEHICLE_CHARGE_STATES_CHARGE_ERROR,
  VEHICLE_CHARGE_STATES_UNAVAILABLE,
  VEHICLE_PLUG_STATES_ERROR,
  VEHICLE_SENSOR_ON_STATE,
} from './vehicle_const.js';
import '../../components/sf-icon/sf-icon.js';
import '../../components/buttons/sf-button.js';
import { LANDSPEEDER_SVG } from './landspeeder-svg.js';

const TAG = 'sf-landspeeder';

@customElement(TAG)
export class SciFiLandspeeder extends LitElement {
  static override styles = [
    sciFiCommonStyles,
    css`
      /* ── HOST ── flex:1 fills parent in all modes (card/panel/PC/phone).
         height:100% only resolves when parent has explicit px height (phone/tablet).
         flex:1 works whether height comes from px or flex layout. */
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        font-size: 12px;
        padding-top: 5px;
        padding-bottom: 5px;
        --speeder-width: 200px;
        --speeder-height: 350px;
        --top-height: 50px;
      }
      /* ── CIRCLE ── main: background-color: var(--secondary-light-alpha-color) = rgba(102,156,210,0.5) */
      .circle {
        background-color: rgba(102, 156, 210, 0.5);
        border-radius: 50%;
        width: 8px;
        height: 8px;
        flex-shrink: 0;
      }
      /* ── H-PATH ── main: border-color: var(--secondary-light-alpha-color) */
      .h-path {
        border-top: 1px solid rgba(102, 156, 210, 0.5);
        width: 30px;
        flex-shrink: 0;
      }
      /* flex:1 instead of height:100% — resolves against flex parent in all modes */
      .content {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;
        flex: 1;
        min-height: 0;
      }
      .image {
        width: var(--speeder-width);
        height: var(--speeder-height);
        position: absolute;
        top: calc(var(--top-height) + 20px);
        left: calc((100% - var(--speeder-width)) / 2);
      }
      .top,
      .middle {
        display: flex;
        flex-direction: row;
        position: relative;
      }
      .top {
        height: calc(var(--top-height) - 10px);
        padding: 10px;
        align-items: center;
      }
      /* ── DEFAULT ICON ── main: --icon-color: var(--secondary-light-alpha-color) */
      sf-icon {
        --icon-color: rgba(102, 156, 210, 0.5);
      }
      /* ── COMPONENT TEXT ── main: color: var(--primary-light-color) = rgb(105,211,251) */
      .component {
        display: flex;
        flex-direction: column;
        flex: 1;
        color: rgb(105, 211, 251);
        text-align: center;
        column-gap: 3px;
      }
      /* ── SUB-INFO ── main: color: var(--secondary-bg-color) = rgb(55,61,69) */
      .component .sub-info {
        color: rgb(55, 61, 69);
        font-size: 10px;
      }
      .component .location {
        display: flex;
        column-gap: 5px;
        justify-content: center;
        flex-direction: row;
        text-transform: capitalize;
      }
      /* ── LOCATION BUTTON ── main: --primary-icon-color: var(--primary-light-color), --btn-size: var(--icon-size-xsmall) */
      .component .location sf-button {
        --primary-icon-color: rgb(105, 211, 251);
        --btn-size: 16px;
      }
      .middle {
        flex: 1;
      }
      .middle .lock {
        position: absolute;
        left: calc(50% - 130px);
        /* min() caps position at mobile design value (230px) so lock stays
           within the car body regardless of .middle height in PC/panel mode.
           On short screens, 55% kicks in proportionally. */
        top: min(55%, 230px);
      }
      .middle .lock div,
      .middle .charging div,
      .middle .fuel div,
      .middle .battery div {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      /* ── LOCK (GREEN) ── main: var(--primary-green-color) = rgb(79,227,139) */
      .middle .lock div sf-icon {
        border: 1px solid rgb(79, 227, 139);
        border-radius: 5px;
        padding: 3px;
        --icon-color: rgb(79, 227, 139);
        background: rgba(79, 227, 139, 0.3);
      }
      /* ── GREEN CIRCLES ── main: background: var(--primary-green-color) */
      .middle .lock div .circle,
      .middle .charging.on div .circle,
      .middle .battery div .circle {
        background: rgb(79, 227, 139);
      }
      /* ── ORANGE CIRCLES ── main: var(--primary-error-alpha-color) = rgba(250,146,29,0.9) */
      .middle .lock div.orange .circle,
      .middle .battery.orange div .circle {
        background: rgba(250, 146, 29, 0.9);
      }
      /* ── RED CIRCLES ── main: var(--primary-emergency-color) = rgb(255,49,49) */
      .middle .battery.red div .circle,
      .middle .charging.error div .circle {
        background: rgb(255, 49, 49);
      }
      /* ── GREEN H-PATHS ── */
      .middle .lock div .h-path,
      .middle .charging.on div .h-path,
      .middle .battery div .h-path {
        border-color: rgb(79, 227, 139);
      }
      /* ── LOCK ORANGE ── main: var(--primary-error-color) = rgb(250,146,29) */
      .middle .lock div.orange sf-icon {
        border: 1px solid rgb(250, 146, 29);
        --icon-color: rgb(250, 146, 29);
        background: rgba(250, 146, 29, 0.3);
      }
      /* ── ORANGE H-PATHS ── */
      .middle .lock div.orange .h-path,
      .middle .battery.orange div .h-path {
        border-color: rgb(250, 146, 29);
      }
      /* ── RED H-PATHS ── main: var(--primary-emergency-color) */
      .middle .battery.red div .h-path,
      .middle .charging.error div .h-path {
        border-color: rgb(255, 49, 49);
      }
      .middle .fuel {
        position: absolute;
        /* min() caps at mobile design value so fuel stays at car bottom-left
           regardless of .middle height in PC/panel mode */
        top: min(70%, 300px);
        left: calc(50% - 179px);
      }
      .middle .fuel .h-path,
      .middle .battery .h-path {
        width: 40px;
      }
      /* ── DEFAULT COMPONENTS BOX ── main: border: var(--secondary-light-alpha-color), bg: var(--secondary-light-light-alpha-color) = rgba(102,156,210,0.2) */
      .middle .fuel .components,
      .middle .charging .components,
      .middle .battery .components {
        min-width: 75px;
        border: 1px solid rgba(102, 156, 210, 0.5);
        border-radius: 5px;
        padding: 3px;
        background: rgba(102, 156, 210, 0.2);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        row-gap: 3px;
      }
      /* ── GREEN COMPONENTS BOX ── main: var(--primary-green-color) + var(--primary-green-alpha-color) */
      .middle .battery .components,
      .middle .charging.on .components {
        border: 1px solid rgb(79, 227, 139);
        background: rgba(79, 227, 139, 0.3);
      }
      .middle .battery .components .component,
      .middle .charging.on .components .component {
        color: rgb(79, 227, 139);
      }
      .middle .battery .components sf-icon,
      .middle .charging.on sf-icon {
        --icon-color: rgb(79, 227, 139);
      }
      /* ── ORANGE COMPONENTS BOX ── main: var(--primary-error-color) + var(--primary-error-light-alpha-color) */
      .middle .battery.orange .components {
        border: 1px solid rgb(250, 146, 29);
        background: rgba(250, 146, 29, 0.3);
      }
      .middle .battery.orange .components .component {
        color: rgb(250, 146, 29);
      }
      .middle .battery.orange .components sf-icon {
        --icon-color: rgb(250, 146, 29);
      }
      /* ── RED COMPONENTS BOX ── main: var(--primary-emergency-color) + var(--primary-emergency-alpha-color) */
      .middle .battery.red .components,
      .middle .charging.error .components {
        border: 1px solid rgb(255, 49, 49);
        background: rgba(255, 49, 49, 0.3);
      }
      .middle .battery.red .components .component,
      .middle .charging.error .components .component {
        color: rgb(255, 49, 49);
      }
      .middle .battery.red .components sf-icon,
      .middle .charging.error sf-icon {
        --icon-color: rgb(255, 49, 49);
      }
      .middle .battery {
        position: absolute;
        /* min() caps at mobile design value so battery stays at car bottom-right
           regardless of .middle height in PC/panel mode */
        top: min(70%, 300px);
        left: calc(50% + 35px);
      }
      .middle .charging {
        position: absolute;
        top: 10px;
        left: 50%;
      }
      .middle .charging .components {
        min-width: 120px;
        max-width: 130px;
      }
      .middle .charging .components .component {
        text-align: start;
      }
      .middle .charging .h-path {
        width: 34px;
      }
    `,
  ];

  @property({ type: Object }) vehicle: SciFiVehicleEntry | null = null;
  @property({ type: Object }) hass: any = null;

  protected override render(): TemplateResult | typeof nothing {
    if (!this.vehicle || !this.hass) return nothing;
    return html`
      <div class="content">
        ${this._renderSpeeder()}
        ${this._renderTop()}
        ${this._renderMiddle()}
      </div>
    `;
  }

  // ── LABEL MAP ─────────────────────────────────────────────────────────────

  private _getLabel(key: string): string {
    const labels: Record<string, string> = {
      home:                           msg('home'),
      not_home:                       msg('not home'),
      unavailable:                    msg('unavailable'),
      not_in_charge:                  msg('Not in charge'),
      waiting_for_a_planned_charge:   msg('Waiting for planned charge'),
      waiting_for_current_charge:     msg('Waiting for current charge'),
      charge_in_progress:             msg('In progress'),
      charge_ended:                   msg('Ended'),
      charge_error:                   msg('Error'),
      energy_flap_opened:             msg('Flap opened'),
      unplugged:                      msg('Unplugged'),
      plugged:                        msg('Plugged'),
      plugged_waiting_for_charge:     msg('Waiting for charge'),
      plug_error:                     msg('Error'),
    };
    return (key in labels ? labels[key] : undefined) ?? key;
  }

  // ── SVG IMAGE ─────────────────────────────────────────────────────────────

  private _renderSpeeder(): TemplateResult {
    return html`<div class="image">${LANDSPEEDER_SVG}</div>`;
  }

  // ── TOP ZONE: location + mileage ──────────────────────────────────────────

  private _renderTop(): TemplateResult {
    const v = this.vehicle!;
    const location = this.hass.states[v.location ?? '']?.state ?? VEHICLE_CHARGE_STATES_UNAVAILABLE;
    const locationGps = this.hass.states[v.location ?? '']?.attributes;
    const lastActivity = this.hass.states[v.location_last_activity ?? '']?.state;
    const mileageState = this.hass.states[v.mileage ?? ''];
    const mileage = mileageState?.state;
    const mileageUnit = mileageState?.attributes?.unit_of_measurement ?? 'km';

    return html`
      <div class="top">
        <div class="component">
          <sf-icon icon="mdi:map-marker" .connection="${this.hass.connection}"></sf-icon>
          <div class="location">
            <div>${this._getLabel(location)}</div>
            ${locationGps?.latitude !== null && locationGps?.latitude !== undefined ? html`
              <sf-button
                icon="mdi:open-in-new"
                @button-click="${() => this._openLocation(locationGps.latitude, locationGps.longitude)}"
              ></sf-button>
            ` : nothing}
          </div>
          ${lastActivity ? html`
            <div class="sub-info">${new Date(lastActivity).toLocaleString()}</div>
          ` : nothing}
        </div>
        <div class="component">
          <sf-icon icon="mdi:counter" .connection="${this.hass.connection}"></sf-icon>
          ${mileage && !isNaN(Number(mileage)) ? html`<div>${Number(mileage).toLocaleString()} ${mileageUnit}</div>` : nothing}
        </div>
      </div>
    `;
  }

  private _openLocation(latitude: number, longitude: number): void {
    if (latitude === null || latitude === undefined) return;
    const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    const url = isApple
      ? `maps://?q=${latitude},${longitude}`
      : `https://maps.google.com/?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  }

  // ── MIDDLE ZONE ───────────────────────────────────────────────────────────

  private _renderMiddle(): TemplateResult {
    return html`
      <div class="middle">
        ${this._renderLock()}
        ${this._renderFuel()}
        ${this._renderBattery()}
        ${this._renderCharging()}
      </div>
    `;
  }

  private _renderLock(): TemplateResult {
    const v = this.vehicle!;
    const isLocked = this.hass.states[v.lock_status ?? '']?.state === 'locked';
    const icon = isLocked ? 'mdi:lock-check-outline' : 'mdi:lock-open-alert-outline';
    return html`
      <div class="lock">
        <div class="${isLocked ? '' : 'orange'}">
          <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
          <div class="h-path"></div>
          <div class="circle"></div>
        </div>
      </div>
    `;
  }

  private _renderFuel(): TemplateResult {
    const v = this.vehicle!;
    const fuelAutonomyState = this.hass.states[v.fuel_autonomy ?? ''];
    const fuelQtyState = this.hass.states[v.fuel_quantity ?? ''];
    const fuelAutonomy = fuelAutonomyState
      ? `${fuelAutonomyState.state} ${fuelAutonomyState.attributes?.unit_of_measurement ?? 'km'}`
      : null;
    const fuelQty = fuelQtyState
      ? `${fuelQtyState.state} ${fuelQtyState.attributes?.unit_of_measurement ?? 'L'}`
      : null;

    return html`
      <div class="fuel">
        <div>
          <div class="components">
            <div class="component">
              <sf-icon icon="mdi:gas-station" .connection="${this.hass.connection}"></sf-icon>
              <div>${fuelAutonomy ?? '--'}</div>
            </div>
            <div class="component">
              <sf-icon icon="mdi:fuel" .connection="${this.hass.connection}"></sf-icon>
              <div>${fuelQty ?? '--'}</div>
            </div>
          </div>
          <div class="h-path"></div>
          <div class="circle"></div>
        </div>
      </div>
    `;
  }

  private _renderBattery(): TemplateResult | typeof nothing {
    const v = this.vehicle!;
    if (!v.battery_level && !v.battery_autonomy) return nothing;

    const rawBattery = parseFloat(this.hass.states[v.battery_level ?? '']?.state ?? '');
    if (isNaN(rawBattery)) return nothing;

    const batteryLevel = Math.round(rawBattery / 10) * 10;
    const batteryColor = rawBattery >= 60 ? 'green' : rawBattery >= 20 ? 'orange' : 'red';
    const isCharging = this.hass.states[v.charging ?? '']?.state === VEHICLE_SENSOR_ON_STATE;

    const batteryIcon = this._getBatteryLevelIcon(batteryLevel, isCharging);
    const autonomyState = this.hass.states[v.battery_autonomy ?? ''];
    const batteryAutonomy = autonomyState
      ? `${autonomyState.state} ${autonomyState.attributes?.unit_of_measurement ?? 'km'}`
      : null;

    return html`
      <div class="battery ${batteryColor}">
        <div>
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="components">
            <div class="component">
              <sf-icon icon="mdi:ev-station" .connection="${this.hass.connection}"></sf-icon>
              <div>${batteryAutonomy ?? '--'}</div>
            </div>
            <div class="component">
              <sf-icon icon="${batteryIcon}" .connection="${this.hass.connection}"></sf-icon>
              <div>${rawBattery}%</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _getBatteryLevelIcon(batteryLevel: number, isCharging: boolean): string {
    if (!isCharging) {
      if (batteryLevel === 100) return 'mdi:battery';
      if (batteryLevel === 0) return 'mdi:battery-outline';
      return `mdi:battery-${batteryLevel}`;
    }
    return batteryLevel <= 10 ? 'mdi:battery-charging-10' : `mdi:battery-charging-${batteryLevel}`;
  }

  private _renderCharging(): TemplateResult | typeof nothing {
    const v = this.vehicle!;
    if (!v.charging && !v.charge_state) return nothing;

    const chargeState = this.hass.states[v.charge_state ?? '']?.state;
    const plugState = this.hass.states[v.plug_state ?? '']?.state;
    const isCharging = this.hass.states[v.charging ?? '']?.state === VEHICLE_SENSOR_ON_STATE;
    const chargingTimeState = this.hass.states[v.charging_remaining_time ?? ''];

    const stateClass = (() => {
      if (chargeState === VEHICLE_CHARGE_STATES_CHARGE_ERROR ||
          plugState === VEHICLE_PLUG_STATES_ERROR) return 'error';
      return isCharging ? 'on' : 'off';
    })();

    const chargeIcon = chargeState
      ? (CHARGE_STATE_ICONS[chargeState] ?? 'mdi:battery-unknown')
      : 'mdi:battery-unknown';
    const plugIcon = plugState
      ? (PLUG_STATE_ICONS[plugState] ?? 'sci:landspeeder-unknown-plug')
      : 'sci:landspeeder-unknown-plug';

    return html`
      <div class="charging ${stateClass}">
        <div>
          <div class="circle"></div>
          <div class="h-path"></div>
          <div class="components">
            <div class="component">
              <sf-icon icon="${chargeIcon}" .connection="${this.hass.connection}"></sf-icon>
              <div>${chargeState ? this._getLabel(chargeState) : VEHICLE_CHARGE_STATES_UNAVAILABLE}</div>
            </div>
            <div class="component">
              <sf-icon icon="${plugIcon}" .connection="${this.hass.connection}"></sf-icon>
              <div>${plugState ? this._getLabel(plugState) : '--'}</div>
            </div>
            ${isCharging && chargingTimeState ? html`
              <div class="component">
                <sf-icon icon="mdi:update" .connection="${this.hass.connection}"></sf-icon>
                <div>${chargingTimeState.state} ${chargingTimeState.attributes?.unit_of_measurement ?? 'min'}</div>
              </div>
            ` : nothing}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SciFiLandspeeder;
  }
}
