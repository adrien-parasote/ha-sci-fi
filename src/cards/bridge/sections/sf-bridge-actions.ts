/**
 * <sf-bridge-actions> — Configurable action buttons panel (full-width)
 * Spec: docs/specs/cards/bridge.md §sf-bridge-actions
 *
 * Config: actions.items = [{ entity, name?, icon?, color? }, ...]
 * Each item fires a HA service call (input_button.press / script.turn_on /
 * automation.trigger) and dispatches a bridge-toast event for feedback.
 *
 * Entity domain → service mapping:
 *   input_button → input_button.press
 *   script       → script.turn_on
 *   automation   → automation.trigger
 *   *            → homeassistant.turn_on  (generic fallback)
 */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeActionsConfig, BridgeActionItem } from '../../../types/config.js';
import { bridgeToast } from '../bridge-toast.js';
import '../../../components/sf-icon/sf-icon.js';

const TAG = 'sf-bridge-actions';

/** Map entity domain to the correct HA service for "trigger" semantics */
function resolveActionService(entity: string): [string, string] {
  const domain = entity.split('.')[0] as string;
  switch (domain) {
    case 'input_button': return ['input_button', 'press'];
    case 'script':       return ['script', 'turn_on'];
    case 'automation':   return ['automation', 'trigger'];
    default:             return ['homeassistant', 'turn_on'];
  }
}

@localized()
@customElement(TAG)
export class SfBridgeActions extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ attribute: false }) config!: BridgeActionsConfig;
  @property({ attribute: false }) hass: any;

  // Track which buttons are loading (entity_id → boolean)
  @state() private _loading: Set<string> = new Set();

  override render(): TemplateResult {
    if (!this.hass || !this.config?.items?.length) return html``;
    const sectionIcon = this.config.icon ?? 'mdi:lightning-bolt';

    return html`
      <div class="bridge-section">
        <div class="bridge-section-title">
          <sf-icon icon="${sectionIcon}" .connection="${this.hass.connection}"></sf-icon>
          ${msg('Actions')}
        </div>

        <div class="actions-grid">
          ${this.config.items.map((item) => this._renderActionBtn(item))}
        </div>
      </div>
    `;
  }

  private _renderActionBtn(item: BridgeActionItem): TemplateResult {
    const icon    = item.icon  ?? 'mdi:play';
    const label   = item.name  ?? item.entity.split('.').pop() ?? '—';
    const color   = item.color ?? 'var(--sf-primary, #00d2ff)';
    const loading = this._loading.has(item.entity);

    return html`
      <button
        class="action-btn"
        style="--action-color: ${color};"
        ?disabled="${loading}"
        @click="${() => this._trigger(item)}"
        aria-label="${label}"
      >
        <sf-icon
          icon="${loading ? 'mdi:loading' : icon}"
          class="${loading ? 'spin' : ''}"
          style="--icon-color: ${color};"
          .connection="${this.hass.connection}"
        ></sf-icon>
        <span class="action-label">${label}</span>
      </button>
    `;
  }

  private _trigger(item: BridgeActionItem): void {
    if (this._loading.has(item.entity)) return;

    const [domain, service] = resolveActionService(item.entity);
    const label = item.name ?? item.entity.split('.').pop() ?? '—';

    // Start loading state
    this._loading = new Set([...this._loading, item.entity]);

    void this.hass
      .callService(domain, service, { entity_id: item.entity })
      .finally(() => {
        const next = new Set(this._loading);
        next.delete(item.entity);
        this._loading = next;
      });

    bridgeToast(this, `📣 ${label}`, false);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeActions;
  }
}
