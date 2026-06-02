/**
 * <sf-bridge-vehicle> — Vehicle section (EV charging, read-only)
 * Section-title icon: sci:landspeeder
 * Body icon: plug variant colored by state (no square wrapper)
 * - Charging  → sci:landspeeder-plugged   (cyan)
 * - Idle      → sci:landspeeder           (grey)
 * - Unavail.  → sci:landspeeder-error-plug (red dim)
 */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeVehicleConfig } from '../../../types/config.js';
import '../../../components/sf-icon/sf-icon.js';

const TAG = 'sf-bridge-vehicle';

/** Pick the right sci-fi plug icon + CSS color based on charging state */
function plugIcon(isCharging: boolean, isUnavailable: boolean): { icon: string; color: string } {
  if (isUnavailable) {
    return { icon: 'sci:landspeeder-error-plug', color: 'var(--sf-error, #ff4d6d)' };
  }
  if (isCharging) {
    return { icon: 'sci:landspeeder-plugged', color: 'var(--sf-primary, #00d2ff)' };
  }
  return { icon: 'sci:landspeeder', color: 'var(--sf-text-disabled, #666)' };
}

@localized()
@customElement(TAG)
export class SfBridgeVehicle extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ attribute: false }) config!: BridgeVehicleConfig;
  @property({ attribute: false }) hass: any;

  override render(): TemplateResult {
    if (!this.hass || !this.config) return html``;

    const stateObj = this.hass.states[this.config.power_sensor];
    const rawPower = parseFloat(stateObj?.state ?? 'NaN');
    const isCharging = !isNaN(rawPower) && rawPower > 0;
    const isUnavailable = isNaN(rawPower);

    let powerDisplay = '0 W';
    if (!isUnavailable) {
      if (rawPower >= 1000) {
        powerDisplay = `${(rawPower / 1000).toFixed(1)}\u00a0kW`;
      } else {
        powerDisplay = `${rawPower}\u00a0W`;
      }
    }

    const { icon: vehicleIcon, color: iconColor } = plugIcon(isCharging, isUnavailable);
    const statusLabel = isCharging
      ? msg('Charging')
      : isUnavailable
      ? msg('N/A')
      : msg('Not connected');

    // Optional friendly name from entity
    const entityName = this.config.name
      ?? stateObj?.attributes?.friendly_name
      ?? null;

    return html`
      <div class="bridge-section">
        <div class="bridge-section-title">
          <!-- sci:landspeeder as section title icon -->
          <sf-icon
            icon="sci:landspeeder"
            .connection="${this.hass.connection}"
          ></sf-icon>
          ${msg('Vehicle')}
        </div>

        <div class="vehicle-body">
          <!-- Plug icon colored by state — no square wrapper -->
          <sf-icon
            icon="${vehicleIcon}"
            style="--icon-color: ${iconColor}; --icon-width: 48px; --icon-height: 48px;"
            .connection="${this.hass.connection}"
          ></sf-icon>

          <!-- Right: power + status + name -->
          <div class="vehicle-right">
            <div class="vehicle-power-row">
              <span class="vehicle-power-value ${isCharging ? 'charging' : 'idle'}">
                ${powerDisplay}
              </span>
            </div>
            <div class="vehicle-status-label">${statusLabel}</div>
            ${entityName ? html`
              <div class="vehicle-entity-name">${entityName}</div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeVehicle;
  }
}
