/**
 * <sf-bridge-stove> — Stove section (status + pellet graphs)
 * Layout: status row (icon + chip) | graphs row (circle-progress + stack-bar)
 * Both graphs have fixed wrapper dimensions so they don't overflow the card.
 */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeStoveConfig } from '../config.js';
import { readSlotOrWarn, warnOnce } from '../bridge-warn.js';
import '../../../components/sf-icon/sf-icon.js';
import '../../../components/sf-circle-progress-bar.js';
import '../../../components/sf-stack-bar.js';

const TAG = 'sf-bridge-stove';

/**
 * States in which the stove is NOT producing heat.
 *
 * `config.status` never carries the string `on`: the HACS integration's
 * binary_sensor wrote the raw status text despite its `device_class: running`,
 * and the core `fumis` integration exposes no running binary_sensor at all —
 * only the 14-value `sensor.*_detailed_stove_status` enum. So the running state
 * is decided by MEMBERSHIP of the off set, never by equality to `on`.
 * A real binary_sensor still works: `on` is absent from the set, `off` is in it.
 *
 * `cooling` sits on the off side on purpose: the stove is no longer heating.
 *
 * Spec: docs/specs/cards/bridge.md § sf-bridge-stove (bead ha-sci-fi-uvl).
 */
const STOVE_OFF_STATES = new Set([
  'off',
  'cooling',
  'cold_start_off',
  'wood_burning_off',
  'unknown',
  'unavailable',
]);

// Normalize pellet quantity to 0–100 int for sf-circle-progress-bar
function normalizePelletPct(raw: number): number {
  const pct = raw > 1 ? raw : raw * 100;
  return Math.min(Math.max(Math.round(pct), 0), 100);
}

@localized()
@customElement(TAG)
export class SfBridgeStove extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ attribute: false }) config!: BridgeStoveConfig;
  @property({ attribute: false }) hass: any;

  override render(): TemplateResult {
    if (!this.hass || !this.config) return html``;
    const sectionIcon = this.config.icon ?? 'sci:stove';

    // Pellet quantity — normalized to 0–100 for circle-progress-bar
    const rawQty = readSlotOrWarn(this.hass.states, this.config.pellet_quantity);
    const pelletPct = rawQty === undefined ? undefined : normalizePelletPct(rawQty);
    const threshold = this.config.low_threshold ?? 0.3; // ratio 0–1

    // Pellet stock — val + max from entity attributes
    const stockState = this.hass.states[this.config.pellet_stock];
    const stockRaw = readSlotOrWarn(this.hass.states, this.config.pellet_stock);
    const pelletStock = stockRaw === undefined ? undefined : Math.floor(stockRaw);
    const stockMax: number =
      (stockState?.attributes?.maximum as number | undefined) ??
      (stockState?.attributes?.max as number | undefined) ??
      20;

    // Stove on/off — membership, not equality (see STOVE_OFF_STATES)
    const rawStatus: string | undefined = this.hass.states[this.config.status]?.state;
    const statusAbsent = rawStatus === undefined;
    if (statusAbsent) warnOnce('not-found', this.config.status);
    const isOn = !statusAbsent && !STOVE_OFF_STATES.has(rawStatus);

    return html`
      <div class="bridge-section">
        <div class="bridge-section-title">
          <sf-icon icon="${sectionIcon}" .connection="${this.hass.connection}"></sf-icon>
          ${msg('Stove')}
        </div>

        <!-- Status row: icon + chip -->
        <div class="stove-status-row">
          <sf-icon
            icon="${isOn ? 'sci:stove-heat' : 'sci:stove-off'}"
            style="--icon-color: ${isOn ? 'var(--sf-warning, #ffd60a)' : 'var(--sf-text-disabled, rgba(224, 232, 255, 0.3))'};"
            .connection="${this.hass.connection}"
          ></sf-icon>
          <span class="stove-status-chip ${isOn ? 'stove-on' : 'stove-off'} ${statusAbsent ? 'stove-unknown' : ''}">
            ${statusAbsent ? '--' : isOn ? msg('Active') : msg('Inactive')}
          </span>
        </div>

        <!-- Graphs row — each graph wrapped in fixed-size container -->
        <div class="stove-graphs-row">
          ${pelletPct === undefined ? html`
            <div class="stove-graph-wrap stove-circle-wrap">
              <span class="stove-pellet-placeholder">--\u00a0%</span>
            </div>
          ` : html`
            <div class="stove-graph-wrap stove-circle-wrap">
              <sf-circle-progress-bar
                text="${msg('Fuel quantity')}"
                .val=${pelletPct}
                .threshold=${threshold}
                style="background:transparent;"
              ></sf-circle-progress-bar>
            </div>
          `}

          ${pelletStock === undefined ? html`
            <div class="stove-graph-wrap stove-stack-wrap">
              <span class="stove-stock-placeholder">--</span>
            </div>
          ` : html`
            <div class="stove-graph-wrap stove-stack-wrap">
              <sf-stack-bar
                text="${msg('Stock')}"
                .val=${pelletStock}
                .max=${stockMax}
                .threshold=${threshold}
                style="background:transparent;"
              ></sf-stack-bar>
            </div>
          `}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeStove;
  }
}
