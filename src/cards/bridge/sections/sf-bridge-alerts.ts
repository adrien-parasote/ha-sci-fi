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
import type { BridgeAlertsConfig } from '../config.js';
import { bridgeCall } from '../bridge-call.js';
import { warnOnce } from '../bridge-warn.js';
import { renderSfToggle } from '../bridge-toggle.js';
import { DOMAIN } from '../../../types/domains.js';
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
        ${this._renderSiren()}
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
          const absent = stateObj === undefined;
          if (absent) warnOnce('not-found', entry.entity);
          const isActive = stateObj?.state === 'on';
          // Use smoke-detector-variant icons (user spec)
          const icon = entry.icon ?? (isActive
            ? 'mdi:smoke-detector-variant-alert'
            : 'mdi:smoke-detector-variant');

          return html`
            <div class="smoke-chip ${absent ? 'smoke-unknown' : isActive ? 'smoke-active' : 'smoke-ok'}">
              <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
              <span class="smoke-name">${entry.name}</span>
              ${absent
                ? html`<span class="smoke-state-placeholder">--</span>`
                : html`<sf-icon
                    icon="${isActive ? 'mdi:alert-circle' : 'mdi:check-circle'}"
                    .connection="${this.hass.connection}"
                  ></sf-icon>`}
            </div>
          `;
        })}
      </div>
    `;
  }

  /** Siren switch row: a structural marker class only (`.siren-row`), styled by `.toggle-row`. */
  private _renderSiren(): TemplateResult | typeof nothing {
    const id = this.config.smoke_switch;
    if (typeof id !== 'string' || id === '') return nothing;
    const stateObj = this.hass.states[id];
    if (stateObj === undefined) warnOnce('not-found', id);
    const state: string | undefined = stateObj?.state;
    const unusable = state === undefined || state === 'unavailable' || state === 'unknown';
    const isOn = state === 'on';
    return html`
      <div class="toggle-row siren-row">
        <sf-icon
          icon="mdi:alarm-light"
          style="--icon-color: ${isOn ? 'var(--sf-accent-on, #00ff9d)' : 'var(--sf-text-disabled, #555)'};"
          .connection="${this.hass.connection}"
        ></sf-icon>
        <span class="toggle-name ${unusable ? 'toggle-unknown' : isOn ? 'toggle-on' : 'toggle-off'}">${msg('Sirens')}</span>
        ${renderSfToggle(unusable, isOn, () => this._toggleSiren(id, isOn))}
      </div>
    `;
  }

  private _renderToggles(): TemplateResult | typeof nothing {
    if (!this.config.toggles?.length) return nothing;
    return html`
      <div class="alerts-toggles-row">
        ${this.config.toggles.map(entry => {
          const stateObj = this.hass.states[entry.entity];
          const absent = stateObj === undefined;
          if (absent) warnOnce('not-found', entry.entity);
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
              <span class="toggle-name ${absent ? 'toggle-unknown' : isOn ? 'toggle-on' : 'toggle-off'}">${entry.name}</span>
              ${renderSfToggle(absent, isOn, () => this._toggle(entry.entity, isOn, entry.name))}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderOccupancy(): TemplateResult | typeof nothing {
    if (this.config.occupancy === undefined || this.config.occupancy === null) return nothing;
    const stateObj = this.hass.states[this.config.occupancy];
    const absent = stateObj === undefined;
    if (absent) warnOnce('not-found', this.config.occupancy);
    const isOccupied = stateObj?.state === 'on';
    return html`
      <div class="occupancy-badge">
        <sf-icon
          icon="${isOccupied ? 'mdi:home-account' : 'mdi:home-off'}"
          style="--icon-color: ${isOccupied ? 'var(--sf-accent-on, #00ff9d)' : 'var(--sf-text-disabled, #555)'};"
          .connection="${this.hass.connection}"
        ></sf-icon>
        <span class="occupancy-pill ${absent ? 'unknown' : isOccupied ? 'occupied' : 'empty'}">
          ${absent ? '--' : isOccupied ? msg('Occupied') : msg('Empty')}
        </span>
      </div>
    `;
  }

  private _toggleSiren(entity: string, isOn: boolean): void {
    void bridgeCall(
      this,
      this.hass,
      DOMAIN.SWITCH,
      isOn ? 'turn_off' : 'turn_on',
      { entity_id: entity },
      isOn ? msg('Sirens off') : msg('Sirens on')
    );
  }

  private _toggle(entity: string, isOn: boolean, name: string): void {
    const [domain, service] = toggleService(entity, isOn);
    const nextState = isOn ? msg('deactivated') : msg('activated');
    void bridgeCall(
      this,
      this.hass,
      domain,
      service,
      { entity_id: entity },
      `${name} ${nextState}`
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeAlerts;
  }
}
