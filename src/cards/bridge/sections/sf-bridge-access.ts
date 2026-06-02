/**
 * <sf-bridge-access> — Access points section (covers + locks)
 * Spec: docs/specs/cards/bridge.md §sf-bridge-access
 * - Bigger action buttons (screen 3 feedback)
 * - State-colored icon + tag
 * - Toast feedback on button press
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeAccessConfig } from '../../../types/config.js';
import { bridgeToast } from '../bridge-toast.js';
import '../../../components/sf-icon/sf-icon.js';

const TAG = 'sf-bridge-access';

function coverStateInfo(state: string): { cls: string; label: string; iconColor: string } {
  switch (state) {
    case 'closed':
      return { cls: 'state-closed', label: msg('Closed'), iconColor: 'var(--sf-accent-on, #00ff9d)' };
    case 'open':
      return { cls: 'state-open', label: msg('Open'), iconColor: 'var(--sf-warning, #ffd60a)' };
    case 'opening':
    case 'closing':
      return { cls: 'state-moving', label: msg('Moving…'), iconColor: 'var(--sf-primary, #00d2ff)' };
    default:
      return { cls: 'state-unavailable', label: msg('Unavailable'), iconColor: 'var(--sf-text-disabled, #555)' };
  }
}

function lockClass(state: string | null): string {
  if (state === 'locked')   return 'lock-locked';
  if (state === 'unlocked') return 'lock-unlocked';
  return 'lock-unavailable';
}

@localized()
@customElement(TAG)
export class SfBridgeAccess extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ attribute: false }) config!: BridgeAccessConfig;
  @property({ attribute: false }) hass: any;

  override render(): TemplateResult {
    if (!this.hass || !this.config?.items?.length) return html``;
    const sectionIcon = this.config.icon ?? 'mdi:door-closed';

    return html`
      <div class="bridge-section">
        <div class="bridge-section-title">
          <sf-icon icon="${sectionIcon}" .connection="${this.hass.connection}"></sf-icon>
          ${msg('Access')}
        </div>
        ${this.config.items.map(entry => {
          const stateObj = this.hass.states[entry.entity];
          const state = stateObj?.state ?? 'unavailable';
          const { cls, label, iconColor } = coverStateInfo(state);
          const entryIcon = entry.icon ?? 'mdi:garage';

          const lockEntity = entry.lock;
          const lockState = lockEntity
            ? this.hass.states[lockEntity]?.state ?? 'unknown'
            : null;
          const lockCls = lockClass(lockState);

          const isOpen = state === 'open';
          const isClosed = state === 'closed';
          const unavailable = state === 'unavailable';

          return html`
            <div class="access-entry">
              <!-- Left: icon + name + state tag -->
              <div class="access-identity">
                <div class="access-icon-wrap">
                  <sf-icon
                    icon="${entryIcon}"
                    style="--icon-color: ${iconColor};"
                    .connection="${this.hass.connection}"
                  ></sf-icon>
                </div>
                <div class="access-info">
                  <span class="access-name">${entry.name}</span>
                  <span class="access-state-tag ${cls}">${label}</span>
                </div>
              </div>

              <!-- Right: action buttons + lock indicator -->
              <div class="access-actions">
                <!-- Open button -->
                <button
                  class="access-btn ${isOpen || unavailable ? 'disabled' : ''}"
                  title="${msg('Open')}"
                  @click="${() => this._openCover(entry.entity, entry.name)}"
                >
                  <sf-icon icon="mdi:arrow-up" .connection="${this.hass.connection}"></sf-icon>
                </button>

                <!-- Close button -->
                <button
                  class="access-btn ${isClosed || unavailable ? 'disabled' : ''}"
                  title="${msg('Close')}"
                  @click="${() => this._closeCover(entry.entity, entry.name)}"
                >
                  <sf-icon icon="mdi:arrow-down" .connection="${this.hass.connection}"></sf-icon>
                </button>

                <!-- Lock indicator (visual only) -->
                ${lockEntity && lockState !== null ? html`
                  <sf-icon
                    icon="${lockState === 'locked' ? 'mdi:lock' : 'mdi:lock-open'}"
                    class="${lockCls}"
                    .connection="${this.hass.connection}"
                  ></sf-icon>
                ` : nothing}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _openCover(entity: string, name: string): void {
    void this.hass.callService('cover', 'open_cover', { entity_id: entity });
    bridgeToast(this, `${name} — ${msg('Opening…')}`, false);
  }

  private _closeCover(entity: string, name: string): void {
    void this.hass.callService('cover', 'close_cover', { entity_id: entity });
    bridgeToast(this, `${name} — ${msg('Closing…')}`, false);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeAccess;
  }
}
