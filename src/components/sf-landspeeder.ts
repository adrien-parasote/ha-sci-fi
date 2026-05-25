/**
 * sf-landspeeder.ts — Landspeeder display component
 * Ported from main:src/components/landspeeder/sf-landspeeder.js
 * Spec 12 § sf-landspeeder
 */
import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { sciFiCommonStyles } from '../styles/common.js';
import type { SciFiVehicleEntry } from '../types/config.js';
import {
  CHARGE_STATE_ICONS,
  PLUG_STATE_ICONS,
  VEHICLE_CHARGE_STATES_CHARGE_ERROR,
  VEHICLE_CHARGE_STATES_UNAVAILABLE,
  VEHICLE_PLUG_STATES_ERROR,
  VEHICLE_SENSOR_ON_STATE,
} from './vehicle_const.js';
import './sf-icon/sf-icon.js';
import './buttons/sf-button.js';

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
    return html`<div class="image"><?xml version="1.0" encoding="utf-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 450">
    <defs>
      <linearGradient
        id="primary-dark-color"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(0.74, 0, 0, 0.74, -204.49, 81.80)"
      >
        <stop style="stop-color: rgb(34, 34, 34);" />
      </linearGradient>
      <linearGradient
        id="secondary-dark-color"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(0.88, 0, 0, 0.83, -91.38, -41.66)"
      >
        <stop style="stop-color: rgb(54, 55, 56);" />
      </linearGradient>
      <linearGradient
        id="light-color"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(0.666667, 0, 0, 1.24, 52.36, -74.61)"
      >
        <stop style="stop-color: rgba(102, 156, 210, 0.737);" />
      </linearGradient>
      <linearGradient
        id="internal-light"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(0.39, 0, 0, 0.28, 47.36, 31.15)"
      >
        <stop style="stop-color: rgb(245, 245, 220);" />
      </linearGradient>
      <linearGradient
        id="internal-dark"
        gradientUnits="userSpaceOnUse"
        gradientTransform="matrix(0.39, 0, 0, 0.28, 92.60, 68.79)"
      >
        <stop style="stop-color: rgb(211, 211, 194);" />
      </linearGradient>
    </defs>
    <path
      d="M 50.107 213.223 C 49.587 202.858 42.575 194.015 32.642 189.912 L 32.642 140.232 L 21.16 140.232 C 41.613 132.672 56.936 101.698 56.969 64.611 L 173.3 64.611 C 173.35 101.697 188.688 132.676 209.151 140.232 L 197.634 140.232 L 197.634 189.912 C 187.308 194.178 180.138 203.566 180.138 214.462 C 180.138 214.511 180.138 214.561 180.138 214.61 L 180.107 214.61 C 180.107 266.26 180.107 327.831 180.107 371.363 L 179.952 371.363 C 179.952 373.789 179.952 375.086 179.952 375.087 C 179.952 410.986 150.851 440.087 114.952 440.087 C 79.053 440.087 49.952 410.986 49.952 375.087 C 49.952 375.072 49.952 375.058 49.952 375.043 L 49.952 331.42 L 50.107 331.42 L 50.107 213.223 Z"
      style='fill: url("#primary-dark-color");'
      transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)"
    />
    <g transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)">
      <path
        d="M 60.412 64.611 L 32.316 64.611 L 32.316 134.199 L 35.761 134.199 C 35.801 104.269 45.799 78.317 60.412 65.444 L 60.412 64.611 Z"
        style='transform-box: fill-box; transform-origin: 50% 50%; fill: url("#primary-dark-color");'
        transform="matrix(-1, 0, 0, -1, 0.000005, 0.000011)"
      />
      <path
        d="M 197.953 134.199 L 169.857 134.199 L 169.857 64.611 L 173.302 64.611 C 173.342 94.541 183.34 120.493 197.953 133.366 L 197.953 134.199 Z"
        style='transform-origin: 183.905px 99.405px; fill: url("#primary-dark-color");'
      />
      <rect
        x="49.474"
        y="126.324"
        width="8"
        height="5"
        style='fill: url("#secondary-dark-color"); fill-opacity: 0.6;'
      />
      <rect
        x="-180.79"
        y="126.324"
        width="8"
        height="5"
        style='fill: url("#secondary-dark-color"); fill-opacity: 0.6;'
        transform="matrix(-1, 0, 0, 1, 0, 0)"
      />
      <rect
        x="32.668"
        y="152.032"
        width="27.842"
        height="28.463"
        style='fill: url("#primary-dark-color"); stroke: url("#light-color");'
      />
      <rect
        x="169.849"
        y="152.032"
        width="27.842"
        height="28.463"
        style='fill: url("#primary-dark-color"); stroke: url("#light-color");'
      />
    </g>
    <g transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)">
      <path
        d="M 169.787 376.079 C 169.787 400.908 150.746 421.588 125.543 426.101 L 120.35 418.987 L 109.65 418.987 L 104.501 426.04 C 79.464 421.405 60.59 400.798 60.59 376.079 C 60.59 375.893 60.591 375.707 60.592 375.523 L 60.59 375.523 L 60.59 314.824 L 70.747 304.668 C 77.026 314.443 88.459 321.849 102.26 324.71 L 106.013 329.495 C 106.904 330.63 108.063 331.198 109.491 331.198 L 120.509 331.198 C 121.937 331.198 123.096 330.63 123.987 329.495 L 127.747 324.701 C 141.504 321.838 152.903 314.459 159.182 304.721 L 169.787 315.327 L 169.787 375.523 L 169.785 375.523 C 169.786 375.707 169.787 375.893 169.787 376.079 Z"
        style='fill: url("#primary-dark-color"); stroke: url("#light-color"); stroke-width: 2px;'
      />
      <path
        d="M 164.887 64.622 L 169.787 64.622 L 169.787 310.711 L 164.887 305.887 L 164.887 305.85 L 160.971 301.995 L 160.971 301.444 C 162.242 298.799 163.31 296.038 164.15 293.179 C 164.675 291.708 164.971 289.694 164.916 287.471 C 164.91 287.222 164.899 286.976 164.885 286.733 L 164.887 286.733 L 164.887 188.011 L 164.775 188.011 C 162.369 164.296 141.003 145.744 115 145.744 C 89.771 145.744 68.908 163.208 65.49 185.907 L 65.49 286.733 L 65.492 286.733 C 65.478 286.976 65.467 287.222 65.461 287.471 C 65.406 289.694 65.702 291.708 66.227 293.179 C 67.067 296.038 68.135 298.799 69.406 301.444 L 69.406 301.995 L 65.49 305.85 L 65.49 305.887 L 60.59 310.711 L 60.59 64.622 L 65.49 64.622 L 65.49 71.829 C 68.907 102.768 89.772 126.571 115 126.571 C 141.474 126.571 163.143 100.36 164.887 67.196 Z"
        style='fill: url("#primary-dark-color"); stroke: url("#light-color"); stroke-width: 2px;'
      />
      <path
        d="M 124.244 363.743 C 124.244 390.708 120.105 412.567 115 412.567 C 109.895 412.567 105.756 390.708 105.756 363.743 C 105.756 352.044 106.535 341.306 107.834 332.898 C 108.339 333.098 108.891 333.198 109.491 333.198 L 120.509 333.198 C 121.109 333.198 121.661 333.098 122.166 332.898 C 123.465 341.306 124.244 352.044 124.244 363.743 Z"
        style='fill-opacity: 0.6; fill: url("#secondary-dark-color");'
      />
      <path
        d="M 144.958 341.308 L 152.958 345.41 C 153.625 345.752 153.958 346.265 153.958 346.949 L 153.958 355.153 C 153.958 355.837 153.625 356.35 152.958 356.692 L 144.958 360.794 C 144.856 360.846 144.755 360.89 144.653 360.927 L 144.653 341.175 C 144.755 341.212 144.856 341.256 144.958 341.308 Z"
        style='transform-box: fill-box; transform-origin: 50% 50%; fill-opacity: 0.6; fill: url("#secondary-dark-color");'
        transform="matrix(0, 1, -1, 0, 0.00002, -0.000006)"
      />
      <path
        d="M 73.748 329.599 C 73.748 329.194 73.768 328.794 73.808 328.397 L 76.82 326.877 C 77.663 326.452 78.507 326.452 79.35 326.877 L 89.467 331.982 C 90.31 332.407 90.732 333.046 90.732 333.897 L 90.732 344.107 C 90.732 344.296 90.711 344.474 90.67 344.642 C 81.136 343.736 73.748 337.347 73.748 329.599 Z"
        style='fill-opacity: 0.6; fill: url("#secondary-dark-color");'
      />
      <ellipse
        style='fill-opacity: 0.6; fill: url("#secondary-dark-color");'
        cx="70.498"
        cy="340.203"
        rx="4"
        ry="4"
      />
    </g>
    <g transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)">
      <g>
        <path
          d="M 205.937 100.824 L 217.363 100.824 C 219.363 103.123 220.64 106.604 220.65 110.504 L 202.65 110.504 C 202.659 106.604 203.936 103.123 205.937 100.824 Z M 220.36 209.296 L 202.94 209.296 C 197.687 204.981 194.15 196.885 194.15 187.608 L 229.15 187.608 C 229.15 196.885 225.613 204.981 220.36 209.296 Z M 194.651 186.055 C 194.651 153.851 198.028 125.709 203.057 110.504 L 220.245 110.504 C 225.274 125.709 228.651 153.851 228.651 186.055 C 228.651 186.574 228.65 187.091 228.648 187.608 L 194.654 187.608 C 194.652 187.091 194.651 186.574 194.651 186.055 Z"
          style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
        />
        <path
          d="M 211.615 209.079 C 203.933 209.079 197.682 200.828 197.481 190.548 L 225.749 190.548 C 225.548 200.828 219.297 209.079 211.615 209.079 Z M 211.406 209.079 C 206.61 209.079 202.709 200.828 202.583 190.548 L 220.23 190.548 C 220.104 200.828 216.202 209.079 211.406 209.079 Z M 194.154 190.499 L 229.24 190.502 M 211.313 209.471 L 211.446 190.741 M 199.359 205.003 L 224.087 204.871"
          style='fill: url("#secondary-dark-color"); fill-opacity: 0.6; stroke: url("#primary-dark-color");'
        />
        <path
          d="M 223 178.325 C 223 178.667 222.883 178.923 222.65 179.094 L 219.85 181.146 C 219.617 181.317 219.383 181.317 219.15 181.146 L 216.35 179.094 C 216.117 178.923 216 178.667 216 178.325 L 216 170 L 223 170 L 223 178.325 Z"
          style='fill: url("#secondary-dark-color"); fill-opacity: 0.6;'
        />
      </g>
      <g>
        <path
          d="M 13.226 100.825 L 24.652 100.825 C 26.652 103.124 27.929 106.605 27.939 110.505 L 9.939 110.505 C 9.948 106.605 11.225 103.124 13.226 100.825 Z M 1.939 186.056 C 1.939 153.852 5.316 125.71 10.345 110.505 L 27.533 110.505 C 32.562 125.71 35.939 153.852 35.939 186.056 C 35.939 186.575 35.938 187.092 35.936 187.609 L 1.942 187.609 C 1.94 187.092 1.939 186.575 1.939 186.056 Z M 27.649 209.297 L 10.229 209.297 C 4.976 204.982 1.439 196.886 1.439 187.609 L 36.439 187.609 C 36.439 196.886 32.902 204.982 27.649 209.297 Z"
          style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
        />
        <path
          d="M 18.9 208.905 C 11.218 208.905 4.967 200.654 4.766 190.374 L 33.034 190.374 C 32.833 200.654 26.582 208.905 18.9 208.905 Z M 18.691 208.905 C 13.895 208.905 9.994 200.654 9.868 190.374 L 27.515 190.374 C 27.389 200.654 23.487 208.905 18.691 208.905 Z M 1.439 190.325 L 36.525 190.328 M 18.598 209.297 L 18.731 190.567 M 6.644 204.829 L 31.372 204.697"
          style='fill: url("#secondary-dark-color"); stroke: url("#primary-dark-color");'
        />
        <path
          d="M 14 178.35 C 14 178.692 13.883 178.948 13.65 179.119 L 10.85 181.171 C 10.617 181.342 10.383 181.342 10.15 181.171 L 7.35 179.119 C 7.117 178.948 7 178.692 7 178.35 L 7 170.025 L 14 170.025 L 14 178.35 Z"
          style='fill: url("#secondary-dark-color"); fill-opacity: 0.6;'
        />
      </g>
      <g>
        <path
          d="M 123.82 114.025 L 106.4 114.025 C 101.147 109.71 97.61 101.614 97.61 92.337 L 132.61 92.337 C 132.61 101.614 129.073 109.71 123.82 114.025 Z M 98.109 90.785 C 98.109 58.581 101.486 30.437 106.515 15.237 L 123.703 15.237 C 128.732 30.437 132.109 58.581 132.109 90.785 C 132.109 91.304 132.108 91.821 132.106 92.338 L 98.112 92.338 C 98.11 91.821 98.109 91.304 98.109 90.785 Z M 109.397 5.557 L 120.823 5.557 C 122.823 7.857 124.1 11.337 124.11 15.237 L 106.11 15.237 C 106.119 11.337 107.396 7.857 109.397 5.557 Z"
          style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
        />
        <path
          d="M 115.071 113.633 C 107.389 113.633 101.138 105.382 100.937 95.102 L 129.205 95.102 C 129.004 105.382 122.753 113.633 115.071 113.633 Z M 114.862 113.633 C 110.066 113.633 106.165 105.382 106.039 95.102 L 123.686 95.102 C 123.56 105.382 119.658 113.633 114.862 113.633 Z M 97.61 95.053 L 132.696 95.056 M 114.769 114.025 L 114.902 95.295 M 102.815 109.557 L 127.543 109.425"
          style='fill: url("#secondary-dark-color"); stroke: url("#primary-dark-color");'
        />
        <path
          d="M 111.373 83.198 C 111.373 83.54 111.256 83.796 111.023 83.967 L 108.223 86.019 C 107.99 86.19 107.756 86.19 107.523 86.019 L 104.723 83.967 C 104.49 83.796 104.373 83.54 104.373 83.198 L 104.373 74.873 L 111.373 74.873 L 111.373 83.198 Z"
          style='fill: url("#secondary-dark-color"); fill-opacity: 0.6;'
        />
      </g>
    </g>
    <g transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)">
      <rect
        x="-156.19"
        y="130.207"
        width="19.244"
        height="10.284"
        style='fill: url("#secondary-dark-color"); fill-opacity: 0.6;'
        transform="matrix(-1, 0, 0, 1, 0, 0)"
      />
      <ellipse
        style='fill: url("#primary-dark-color");'
        cx="140.766"
        cy="137.786"
        rx="2"
        ry="2"
      />
      <ellipse
        style='fill: url("#primary-dark-color");'
        cx="146.398"
        cy="137.786"
        rx="2"
        ry="2"
      />
      <ellipse
        style='fill: url("#primary-dark-color");'
        cx="152.03"
        cy="137.786"
        rx="2"
        ry="2"
      />
      <polyline
        style='fill: rgb(216, 216, 216); stroke: url("#primary-dark-color");'
        points="136.856 132.847 156.229 132.904"
      />
    </g>
    <g transform="matrix(1, 0, 0, 1, 0, 7.105427357601002e-15)">
      <path
        d="M 115 151 C 139.853 151 160 168.298 160 189.636 L 160 282.364 C 160 303.702 139.853 321 115 321 C 90.147 321 70 303.702 70 282.364 L 70 189.636 C 70 168.298 90.147 151 115 151 Z"
        style="fill: black;"
      />
      <rect
        x="137.518"
        y="290.039"
        width="2"
        height="7"
        style='fill: url("#secondary-dark-color");'
      />
      <ellipse
        style='fill: url("#secondary-dark-color");'
        cx="138.518"
        cy="289.455"
        rx="9.442"
        ry="1.771"
      />
      <ellipse
        style='fill: url("#primary-dark-color");'
        cx="138.518"
        cy="289.455"
        rx="5"
        ry="0.938"
      />
      <path
        d="M 159.121 282.092 C 159.121 303.583 139.34 321 114.94 321 C 90.541 321 70.76 303.583 70.76 282.092 C 70.76 282.055 70.76 282.015 70.76 281.978 L 71.704 281.978 C 75.536 292.668 93.405 300.755 114.871 300.755 C 136.337 300.755 154.206 292.668 158.038 281.978 L 159.121 281.978 C 159.121 282.015 159.121 282.055 159.121 282.092 Z"
        style='fill: url("#internal-light");'
      />
      <rect
        x="53.508"
        y="244.374"
        width="17.508"
        height="8"
        style='transform-box: fill-box; transform-origin: 50% 50%; fill: url("#secondary-dark-color");'
        transform="matrix(0.932332, 0.361603, -0.361603, 0.932332, 26.512628, 53.880608)"
      />
      <rect
        x="53.508"
        y="244.37"
        width="17.508"
        height="8"
        style='transform-origin: 62.262px 248.366px; fill: url("#secondary-dark-color"); '
        transform="matrix(-0.932332, 0.361603, 0.361603, 0.932332, 78.114586, 53.930511)"
      />
      <path
        d="M 159.18 201.06 C 159.18 173.409 139.399 151 114.999 151 C 90.6 151 70.819 173.409 70.819 201.06 C 70.819 201.107 70.819 201.159 70.819 201.206 L 71.763 201.206 C 75.595 187.452 93.464 177.048 114.93 177.048 C 136.396 177.048 154.265 187.452 158.097 201.206 L 159.18 201.206 C 159.18 201.159 159.18 201.107 159.18 201.06 Z"
        style='fill: url("#internal-light");'
      />
      <path
        d="M 114.882 295.299 C 118.165 295.299 121.361 295.246 124.431 295.145 L 124.431 300.317 C 121.371 300.514 118.192 300.618 114.93 300.618 C 111.718 300.618 108.586 300.517 105.57 300.326 L 105.57 295.153 C 108.567 295.248 111.683 295.299 114.882 295.299 Z"
        style="fill: black;"
      />
      <ellipse
        style='fill: url("#light-color");'
        cx="118.011"
        cy="298.971"
        rx="1"
        ry="0.62"
      />
      <ellipse
        style='fill: url("#light-color");'
        cx="121.992"
        cy="298.414"
        rx="1"
        ry="0.62"
      />
      <ellipse
        style='fill: url("#light-color");'
        cx="112.595"
        cy="298.977"
        rx="1"
        ry="0.62"
      />
      <ellipse
        style='fill: url("#light-color");'
        cx="108.196"
        cy="298.361"
        rx="1"
        ry="0.62"
      />
      <path
        d="M 99.675 255.461 L 104.431 255.461 L 104.431 254.436 C 104.431 253.935 104.779 253.56 105.474 253.31 L 113.82 250.306 C 114.515 250.056 115.211 250.056 115.906 250.306 L 124.252 253.31 C 124.947 253.56 125.295 253.935 125.295 254.436 L 125.295 255.461 L 130.052 255.461 C 131.709 255.461 133.052 256.804 133.052 258.461 L 133.052 266.443 C 133.052 268.1 131.709 269.443 130.052 269.443 L 99.675 269.443 C 98.018 269.443 96.675 268.1 96.675 266.443 L 96.675 258.461 C 96.675 256.804 98.018 255.461 99.675 255.461 Z"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <path
        d="M 105.549 267.785 C 105.547 266.794 106.174 266.3 107.432 266.302 L 122.527 266.329 C 123.699 266.332 124.327 266.764 124.409 267.625 L 124.431 267.625 L 124.431 272.08 L 124.453 279.712 C 124.454 279.823 124.446 279.928 124.431 280.026 L 124.431 296.192 C 121.371 296.47 118.192 296.618 114.93 296.618 C 111.718 296.618 108.586 296.476 105.57 296.205 L 105.57 274.683 L 105.549 267.785 Z"
        style='fill: url("#internal-light"); stroke: url("#internal-dark");'
      />
      <path
        d="M 124.43 305.343 L 124.452 314.981 C 124.455 316.239 123.827 316.866 122.57 316.863 L 107.475 316.828 C 106.216 316.825 105.586 316.195 105.584 314.937 L 105.571 309.216 L 105.57 309.216 L 105.57 308.898 L 105.549 299.971 C 108.594 300.555 111.756 300.863 114.999 300.863 C 118.236 300.863 121.391 300.557 124.43 299.975 L 124.43 305.343 Z"
        style='fill: url("#internal-light"); stroke: url("#internal-dark");'
      />
      <ellipse
        style='fill:url("#internal-dark");'
        cx="110.863"
        cy="272.799"
        rx="2.292"
        ry="2.268"
      />
      <rect
        x="115.096"
        y="280.75"
        width="5"
        height="8"
        rx="1"
        ry="1"
        style='fill: url("#internal-dark");'
      />
      <rect
        x="126.607"
        y="245.771"
        width="28.759"
        height="30.141"
        rx="3"
        ry="3"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <path
        d="M 155.366 249.369 C 155.366 251.026 154.023 252.369 152.366 252.369 L 129.607 252.369 C 127.95 252.369 126.607 251.026 126.607 249.369 L 126.607 248.771 C 126.607 247.114 127.95 245.771 129.607 245.771 L 152.366 245.771 C 154.023 245.771 155.366 247.114 155.366 248.771 L 155.366 249.369 Z"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <path
        d="M 152.16 249.231 C 152.16 250.127 151.116 250.852 149.829 250.852 L 132.143 250.852 C 130.855 250.852 129.812 250.127 129.812 249.231 L 129.812 248.908 C 129.812 248.013 130.855 247.287 132.143 247.287 L 149.829 247.287 C 151.116 247.287 152.16 248.013 152.16 248.908 L 152.16 249.231 Z"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <rect
        x="74.269"
        y="245.771"
        width="28.759"
        height="30.141"
        rx="3"
        ry="3"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <path
        d="M 103.028 249.369 C 103.028 251.026 101.685 252.369 100.028 252.369 L 77.269 252.369 C 75.612 252.369 74.269 251.026 74.269 249.369 L 74.269 248.771 C 74.269 247.114 75.612 245.771 77.269 245.771 L 100.028 245.771 C 101.685 245.771 103.028 247.114 103.028 248.771 L 103.028 249.369 Z"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <path
        d="M 99.822 249.232 C 99.822 250.128 98.778 250.853 97.491 250.853 L 79.805 250.853 C 78.517 250.853 77.474 250.128 77.474 249.232 L 77.474 248.909 C 77.474 248.014 78.517 247.288 79.805 247.288 L 97.491 247.288 C 98.778 247.288 99.822 248.014 99.822 248.909 L 99.822 249.232 Z"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <path
        d="M 159.224 205.592 C 159.224 205.842 159.22 206.091 159.212 206.339 L 70.7 206.339 C 70.692 206.091 70.688 205.842 70.688 205.592 C 70.688 188.378 90.507 174.424 114.956 174.424 C 139.405 174.424 159.224 188.378 159.224 205.592 Z"
        style='stroke: url("#secondary-dark-color"); fill: url("#primary-dark-color");'
      />
      <path
        d="M 159.224 205.592 C 159.224 205.671 159.224 205.749 159.223 205.828 L 154.458 205.828 C 150.375 195.244 134.24 187.341 114.956 187.341 C 95.672 187.341 79.537 195.244 75.454 205.828 L 70.689 205.828 C 70.688 205.749 70.688 205.671 70.688 205.592 C 70.688 188.378 90.507 174.424 114.956 174.424 C 139.405 174.424 159.224 188.378 159.224 205.592 Z"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <path
        d="M 159.224 205.592 C 159.224 205.656 159.224 205.721 159.223 205.785 L 155.455 205.785 C 155.456 205.721 155.456 205.656 155.456 205.592 C 155.456 189.844 137.324 177.077 114.956 177.077 C 92.588 177.077 74.456 189.844 74.456 205.592 C 74.456 205.656 74.456 205.721 74.457 205.785 L 70.689 205.785 C 70.688 205.721 70.688 205.656 70.688 205.592 C 70.688 188.378 90.507 174.424 114.956 174.424 C 139.405 174.424 159.224 188.378 159.224 205.592 Z"
        style='stroke: url("#secondary-dark-color"); fill: url("#primary-dark-color");'
      />
      <rect
        x="70.629"
        y="206.435"
        width="88.807"
        height="6.108"
        style='fill: url("#primary-dark-color"); stroke: url("#secondary-dark-color");'
      />
      <rect
        x="76.541"
        y="206.962"
        width="17.401"
        height="36.028"
        rx="3"
        ry="3"
        style='stroke: url("#internal-dark"); transform-box: fill-box; transform-origin: 50% 50%; fill: url("#primary-dark-color");'
        transform="matrix(0, 1, -1, 0, 29.758507, 3.017043)"
      />
      <rect
        x="48.713"
        y="206.962"
        width="11.075"
        height="36.028"
        rx="3"
        ry="3"
        style='fill: url("#internal-light"); stroke: url("#internal-dark"); transform-origin: 54.251px 224.976px;'
        transform="matrix(0, 1, -1, 0, 34.669483, 11.058651)"
      />
      <rect
        x="48.713"
        y="206.962"
        width="11.075"
        height="36.028"
        rx="3"
        ry="3"
        style='fill: url("#internal-light"); stroke: url("#internal-dark"); transform-origin: 54.251px 224.976px;'
        transform="matrix(0, 1, -1, 0, 86.701405, 11.058651)"
      />
      <ellipse
        style='fill: url("#internal-dark");'
        cx="127.737"
        cy="224.685"
        rx="1.905"
        ry="1.837"
      />
      <ellipse
        style='fill: url("#internal-dark");'
        cx="102.511"
        cy="224.685"
        rx="1.905"
        ry="1.837"
      />
      <path
        d="M 115 151 C 139.853 151 160 168.298 160 189.636 L 160 282.364 C 160 303.702 139.853 321 115 321 C 90.147 321 70 303.702 70 282.364 L 70 189.636 C 70 168.298 90.147 151 115 151 Z M 73.5 192.213 L 73.5 279.786 C 73.5 299.939 92.079 316.277 115 316.277 C 137.921 316.277 156.5 299.939 156.5 279.786 L 156.5 192.213 C 156.5 172.06 137.921 155.722 115 155.722 C 92.079 155.722 73.5 172.06 73.5 192.213 Z"
        style='fill: url("#light-color"); fill-opacity: 0.4;'
      />
      <path
        d="M 115 151 C 139.853 151 160 168.298 160 189.636 L 160 282.364 C 160 303.702 139.853 321 115 321 C 90.147 321 70 303.702 70 282.364 L 70 189.636 C 70 168.298 90.147 151 115 151 Z"
        style='fill: url("#light-color"); fill-opacity: 0.6;'
      />
    </g>
  </svg></div>`;
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
