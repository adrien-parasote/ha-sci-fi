/**
 * <sf-bridge-alerts> — Alerts section (smoke + toggles + occupancy)
 * Spec: docs/specs/cards/bridge.md §sf-bridge-alerts
 * - Smoke: mdi:smoke-detector-variant (ok) / mdi:smoke-detector-variant-alert (active)
 * - Icons + text colored to match state (not white)
 * - Toast feedback on toggle
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeAlertsConfig } from '../../../types/config.js';
import { bridgeToast } from '../bridge-toast.js';
import '../../../components/sf-icon/sf-icon.js';

const TAG = 'sf-bridge-alerts';

function toggleDefaultIcon(entity: string): string {
  const domain = entity.split('.')[0];
  const icons: Record<string, string> = {
    automation: 'mdi:robot',
    input_boolean: 'mdi:toggle-switch',
    switch: 'mdi:power-plug',
  };
  return icons[domain ?? ''] ?? 'mdi:toggle-switch';
}

function toggleService(entity: string, isOn: boolean): [string, string] {
  const domain = entity.split('.')[0] as string;
  return [domain, isOn ? 'turn_off' : 'turn_on'];
}

@localized()
@customElement(TAG)
export class SfBridgeAlerts extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ attribute: false }) config!: BridgeAlertsConfig;
  @property({ attribute: false }) hass: any;

  override render(): TemplateResult {
    if (!this.hass || !this.config) return html``;
    const sectionIcon = this.config.icon ?? 'mdi:shield-alert';

    return html`
      <div class="bridge-section">
        <div class="bridge-section-title">
          <sf-icon icon="${sectionIcon}" .connection="${this.hass.connection}"></sf-icon>
          ${msg('Alerts')}
        </div>
        ${this._renderSmoke()}
        ${this._renderToggles()}
        ${this._renderOccupancy()}
      </div>
    `;
  }

  private _renderSmoke(): TemplateResult | typeof nothing {
    if (!this.config.smoke?.length) return nothing;
    return html`
      <div class="alerts-smoke-row">
        ${this.config.smoke.map(entry => {
          const stateObj = this.hass.states[entry.entity];
          const state = stateObj?.state ?? 'unavailable';
          const isActive = state === 'on';
          // Use smoke-detector-variant icons (user spec)
          const icon = entry.icon ?? (isActive
            ? 'mdi:smoke-detector-variant-alert'
            : 'mdi:smoke-detector-variant');

          return html`
            <div class="smoke-chip ${isActive ? 'smoke-active' : 'smoke-ok'}">
              <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
              <span class="smoke-name">${entry.name}</span>
              <sf-icon
                icon="${isActive ? 'mdi:alert-circle' : 'mdi:check-circle'}"
                .connection="${this.hass.connection}"
              ></sf-icon>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderToggles(): TemplateResult | typeof nothing {
    if (!this.config.toggles?.length) return nothing;
    return html`
      <div class="alerts-toggles-row">
        ${this.config.toggles.map(entry => {
          const stateObj = this.hass.states[entry.entity];
          const state = stateObj?.state ?? 'off';
          const isOn = state === 'on' || state === 'enabled';
          const icon = entry.icon ?? toggleDefaultIcon(entry.entity);
          return html`
            <div class="toggle-row">
              <!-- Icon colored to match state -->
              <sf-icon
                icon="${icon}"
                style="--icon-color: ${isOn ? 'var(--sf-accent-on, #00ff9d)' : 'var(--sf-text-disabled, #555)'};"
                .connection="${this.hass.connection}"
              ></sf-icon>
              <!-- Name colored to match state -->
              <span class="toggle-name ${isOn ? 'toggle-on' : 'toggle-off'}">${entry.name}</span>
              <button
                class="sf-toggle"
                data-on="${isOn}"
                aria-pressed="${isOn}"
                @click="${() => this._toggle(entry.entity, isOn, entry.name)}"
              >
                <div class="sf-toggle-track">
                  <div class="sf-toggle-thumb"></div>
                </div>
              </button>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderOccupancy(): TemplateResult | typeof nothing {
    if (!this.config.occupancy) return nothing;
    const stateObj = this.hass.states[this.config.occupancy];
    const isOccupied = stateObj?.state === 'on';
    return html`
      <div class="occupancy-badge">
        <sf-icon
          icon="${isOccupied ? 'mdi:home-account' : 'mdi:home-off'}"
          style="--icon-color: ${isOccupied ? 'var(--sf-accent-on, #00ff9d)' : 'var(--sf-text-disabled, #555)'};"
          .connection="${this.hass.connection}"
        ></sf-icon>
        <span class="occupancy-pill ${isOccupied ? 'occupied' : 'empty'}">
          ${isOccupied ? msg('Occupied') : msg('Empty')}
        </span>
      </div>
    `;
  }

  private _toggle(entity: string, isOn: boolean, name: string): void {
    const [domain, service] = toggleService(entity, isOn);
    void this.hass.callService(domain, service, { entity_id: entity });
    const nextState = isOn ? msg('deactivated') : msg('activated');
    bridgeToast(this, `${name} ${nextState}`, false);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeAlerts;
  }
}
