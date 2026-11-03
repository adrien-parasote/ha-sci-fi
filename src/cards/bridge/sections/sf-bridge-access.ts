/**
 * <sf-bridge-access> — Access points section (covers + locks)
 * Spec: docs/specs/cards/bridge.md §sf-bridge-access
 * - Bigger action buttons (screen 3 feedback)
 * - State-colored icon + tag
 * - Toast feedback on button press
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeAccessConfig } from '../config.js';
import { bridgeCall } from '../bridge-call.js';
import { warnOnce } from '../bridge-warn.js';
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

function lockClass(state: string | null | undefined): string {
  if (state === undefined) return 'lock-unknown';
  if (state === 'locked')   return 'lock-locked';
  if (state === 'unlocked') return 'lock-unlocked';
  if (state === 'locking' || state === 'unlocking') return 'lock-pending';
  if (state === 'jammed')   return 'lock-jammed';
  return 'lock-unavailable';
}

function lockIcon(state: string | undefined): string {
  switch (state) {
    case undefined:   return 'mdi:lock-question';
    case 'locked':    return 'mdi:lock';
    case 'locking':
    case 'unlocking': return 'mdi:lock-clock';
    case 'jammed':    return 'mdi:lock-alert';
    default:          return 'mdi:lock-open';
  }
}

/** Action or state named on the lock button (title and aria-label). */
function lockTitle(state: string | undefined, codeRequired: boolean): string {
  if (codeRequired) return msg('Code required');
  switch (state) {
    case 'locked':    return msg('Unlock');
    case 'unlocked':  return msg('Lock');
    case 'locking':   return msg('Locking…');
    case 'unlocking': return msg('Unlocking…');
    case 'jammed':    return msg('Lock jammed');
    default:          return msg('Lock unavailable');
  }
}

@localized()
@customElement(TAG)
export class SfBridgeAccess extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ attribute: false }) config!: BridgeAccessConfig;
  @property({ attribute: false }) hass: any;

  /** Lock entities with a service call in flight; replaced, never mutated, so Lit re-renders. */
  @state() private _lockPending: ReadonlySet<string> = new Set();

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
          if (stateObj === undefined) warnOnce('not-found', entry.entity);
          const state = stateObj?.state ?? 'unavailable';
          const { cls, label, iconColor } = coverStateInfo(state);
          const entryIcon = entry.icon ?? 'mdi:garage';

          const lockEntity = entry.lock;
          const lockObj = lockEntity ? this.hass.states[lockEntity] : undefined;
          if (lockEntity && lockObj === undefined) warnOnce('not-found', lockEntity);
          // null: no lock configured · undefined: configured but absent
          const lockState = lockEntity ? lockObj?.state ?? undefined : null;
          const lockCls = lockClass(lockState);
          const codeRequired = !!lockObj?.attributes?.code_format;
          const lockUsable = (lockState === 'locked' || lockState === 'unlocked') && !codeRequired
            && !(lockEntity && this._lockPending.has(lockEntity));
          const lockLabel = lockTitle(lockState ?? undefined, codeRequired);

          const isOpen = state === 'open';
          const isClosed = state === 'closed';
          const unavailable = state === 'unavailable';
          const absent = stateObj === undefined;

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
                  ?disabled="${absent}"
                  title="${msg('Open')}"
                  @click="${() => this._openCover(entry.entity, entry.name)}"
                >
                  <sf-icon icon="mdi:arrow-up" .connection="${this.hass.connection}"></sf-icon>
                </button>

                <!-- Close button -->
                <button
                  class="access-btn ${isClosed || unavailable ? 'disabled' : ''}"
                  ?disabled="${absent}"
                  title="${msg('Close')}"
                  @click="${() => this._closeCover(entry.entity, entry.name)}"
                >
                  <sf-icon icon="mdi:arrow-down" .connection="${this.hass.connection}"></sf-icon>
                </button>

                <!-- Lock button: one click, no confirmation -->
                ${lockEntity && lockState !== null ? html`
                  <button
                    class="lock-btn"
                    title="${lockLabel}"
                    aria-label="${lockLabel}"
                    ?disabled="${!lockUsable}"
                    aria-disabled="${lockUsable ? 'false' : 'true'}"
                    @click="${() => this._toggleLock(lockEntity, lockState)}"
                  >
                    <sf-icon
                      icon="${lockIcon(lockState)}"
                      class="${lockCls}"
                      .connection="${this.hass.connection}"
                    ></sf-icon>
                  </button>
                ` : nothing}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _toggleLock(entity: string, lockState: string | undefined): void {
    if (this._lockPending.has(entity)) return;
    const service = lockState === 'locked' ? 'unlock' : lockState === 'unlocked' ? 'lock' : undefined;
    if (service === undefined) return;
    this._lockPending = new Set(this._lockPending).add(entity);
    void bridgeCall(
      this,
      this.hass,
      'lock',
      service,
      { entity_id: entity },
      service === 'unlock' ? msg('Door unlocked') : msg('Door locked'),
      {
        after: () => {
          const next = new Set(this._lockPending);
          next.delete(entity);
          this._lockPending = next;
        },
      }
    );
  }

  private _openCover(entity: string, name: string): void {
    void bridgeCall(
      this,
      this.hass,
      'cover',
      'open_cover',
      { entity_id: entity },
      `${name} — ${msg('Opening…')}`
    );
  }

  private _closeCover(entity: string, name: string): void {
    void bridgeCall(
      this,
      this.hass,
      'cover',
      'close_cover',
      { entity_id: entity },
      `${name} — ${msg('Closing…')}`
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeAccess;
  }
}
