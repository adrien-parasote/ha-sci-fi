/**
 * <sf-bridge-stove> — Stove section (status + pellet graphs)
 * Layout: status row (icon + chip) | graphs row (circle-progress + stack-bar)
 * Both graphs have fixed wrapper dimensions so they don't overflow the card.
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeStoveConfig } from '../../../types/config.js';
import '../../../components/sf-icon/sf-icon.js';
import '../../../components/sf-circle-progress-bar.js';
import '../../../components/sf-stack-bar.js';

const TAG = 'sf-bridge-stove';

// Normalize pellet quantity to 0–100 int for sf-circle-progress-bar
function normalizePelletPct(raw: number): number {
  if (isNaN(raw)) return NaN;
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
    const sectionIcon = 'sci:stove';

    // Pellet quantity — normalized to 0–100 for circle-progress-bar
    const rawQty = parseFloat(this.hass.states[this.config.pellet_quantity]?.state ?? 'NaN');
    const pelletPct = normalizePelletPct(rawQty);
    const threshold = this.config.low_threshold ?? 0.3; // ratio 0–1

    // Pellet stock — val + max from entity attributes
    const stockState = this.hass.states[this.config.pellet_stock];
    const pelletStock = stockState ? parseInt(stockState.state, 10) : NaN;
    const stockMax: number =
      (stockState?.attributes?.maximum as number | undefined) ??
      (stockState?.attributes?.max as number | undefined) ??
      20;

    // Stove on/off
    const isOn = this.hass.states[this.config.status]?.state === 'on';

    const hasCircle = !isNaN(pelletPct);
    const hasStack  = !isNaN(pelletStock);

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
            style="--icon-color: ${isOn ? 'var(--sf-warning, #ffd60a)' : 'var(--sf-text-disabled, #666)'};"
            .connection="${this.hass.connection}"
          ></sf-icon>
          <span class="stove-status-chip ${isOn ? 'stove-on' : 'stove-off'}">
            ${isOn ? msg('Active') : msg('Inactive')}
          </span>
        </div>

        <!-- Graphs row — each graph wrapped in fixed-size container -->
        <div class="stove-graphs-row">
          ${hasCircle ? html`
            <div class="stove-graph-wrap stove-circle-wrap">
              <sf-circle-progress-bar
                text="${msg('Fuel quantity')}"
                .val=${pelletPct}
                .threshold=${threshold}
                style="background:transparent;"
              ></sf-circle-progress-bar>
            </div>
          ` : nothing}

          ${hasStack ? html`
            <div class="stove-graph-wrap stove-stack-wrap">
              <sf-stack-bar
                text="${msg('Stock')}"
                .val=${pelletStock}
                .max=${stockMax}
                .threshold=${threshold}
                style="background:transparent;"
              ></sf-stack-bar>
            </div>
          ` : nothing}
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
