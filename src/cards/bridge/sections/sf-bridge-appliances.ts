/**
 * <sf-bridge-appliances> — Appliances section (cycles + consumables)
 * Spec: docs/specs/cards/bridge.md §sf-bridge-appliances
 * consumables is OPTIONAL (spec rule)
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeAppliancesConfig, BridgeCycleEntry } from '../../../types/config.js';
import '../../../components/sf-icon/sf-icon.js';

const TAG = 'sf-bridge-appliances';

// Cycle running detection (spec §Cycle state detection)
function isCycleRunning(stateObj: any, entry: BridgeCycleEntry): boolean {
  if (!stateObj) return false;
  const state: string = stateObj.state;
  const domain = entry.entity.split('.')[0];
  if (domain === 'binary_sensor') return state === 'on';
  // sensor: check against running_states (case-insensitive)
  if (entry.running_states?.length) {
    return entry.running_states.some(
      s => s.toLowerCase() === state.toLowerCase()
    );
  }
  return false;
}

@localized()
@customElement(TAG)
export class SfBridgeAppliances extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ attribute: false }) config!: BridgeAppliancesConfig;
  @property({ attribute: false }) hass: any;

  override render(): TemplateResult {
    if (!this.hass || !this.config) return html``;
    const sectionIcon = this.config.icon ?? 'mdi:washing-machine';

    return html`
      <div class="bridge-section">
        <div class="bridge-section-title">
          <sf-icon icon="${sectionIcon}" .connection="${this.hass.connection}"></sf-icon>
          ${msg('Appliances')}
        </div>
        ${this._renderCycles()}
        ${this._renderConsumables()}
      </div>
    `;
  }

  private _renderCycles(): TemplateResult | typeof nothing {
    if (!this.config.cycles?.length) return nothing;
    return html`
      <div class="appliances-cycles">
        ${this.config.cycles.map(entry => {
          const stateObj = this.hass.states[entry.entity];
          const running = isCycleRunning(stateObj, entry);
          return html`
            <div class="cycle-item">
              <div class="cycle-icon-wrap ${running ? 'cycle-running' : ''}">
                <sf-icon
                  icon="${entry.icon}"
                  style="color: ${running ? 'var(--sf-primary, #00d2ff)' : 'var(--sf-text-disabled, #555)'}"
                  .connection="${this.hass.connection}"
                ></sf-icon>
              </div>
              <div class="cycle-name">${entry.name}</div>
              <div class="cycle-status ${running ? 'running' : 'idle'}">
                ${running ? msg('Running') : msg('Inactive')}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderConsumables(): TemplateResult | typeof nothing {
    if (!this.config.consumables?.length) return nothing;
    return html`
      <div class="consumables-row">
        ${this.config.consumables.map(entry => {
          const stateObj = this.hass.states[entry.entity];
          const state = stateObj?.state ?? 'unknown';
          const isOk = state === entry.ok_when;
          return html`
            <div class="consumable-chip ${isOk ? 'consumable-ok' : 'consumable-warn'}">
              ${entry.name} ${isOk ? '✓' : '✗'}
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeAppliances;
  }
}
