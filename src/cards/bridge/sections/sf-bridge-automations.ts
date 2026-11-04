/**
 * <sf-bridge-automations> — Automations section (toggle + slider)
 * Spec: docs/specs/cards/bridge.md §sf-bridge-automations
 * Slider debounced 300ms to avoid WS flood
 */
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgeAutomationsConfig, BridgeAutomationEntry } from '../config.js';
import { bridgeCall } from '../bridge-call.js';
import { warnOnce } from '../bridge-warn.js';
import { renderSfToggle } from '../bridge-toggle.js';
import { DOMAIN } from '../../../types/domains.js';
import '../../../components/sf-icon/sf-icon.js';

const TAG = 'sf-bridge-automations';

// Icon auto per domain (spec §Icône auto par domain)
function autoDefaultIcon(entity: string): string {
  const domain = entity.split('.')[0];
  const icons: Record<string, string> = {
    [DOMAIN.AUTOMATION]: 'mdi:robot',
    [DOMAIN.SWITCH]: 'mdi:power-plug',
    [DOMAIN.INPUT_BOOLEAN]: 'mdi:toggle-switch',
    [DOMAIN.INPUT_NUMBER]: 'mdi:tune',
  };
  return icons[domain ?? ''] ?? 'mdi:robot';
}

// Toggle service per domain (spec §Toggle services)
function resolveToggleService(entity: string, isOn: boolean): [string, string] {
  const domain = entity.split('.')[0] as string;
  return isOn ? [domain, 'turn_off'] : [domain, 'turn_on'];
}

@localized()
@customElement(TAG)
export class SfBridgeAutomations extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ attribute: false }) config!: BridgeAutomationsConfig;
  @property({ attribute: false }) hass: any;

  private _debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  @state() private _localValues: Map<string, number> = new Map();

  override render(): TemplateResult {
    if (!this.hass || !this.config?.items?.length) return html``;
    const sectionIcon = this.config.icon ?? 'mdi:robot';

    return html`
      <div class="bridge-section">
        <div class="bridge-section-title">
          <sf-icon icon="${sectionIcon}" .connection="${this.hass.connection}"></sf-icon>
          ${msg('Automations')}
        </div>
        ${this.config.items.map(entry =>
          entry.type === 'slider'
            ? this._renderSlider(entry)
            : this._renderToggle(entry)
        )}
      </div>
    `;
  }

  private _renderToggle(entry: BridgeAutomationEntry): TemplateResult {
    const stateObj = this.hass.states[entry.entity];
    const absent = stateObj === undefined;
    if (absent) warnOnce('not-found', entry.entity);
    const state = stateObj?.state ?? 'off';
    const isOn = state === 'on' || state === 'enabled';
    const icon = entry.icon ?? autoDefaultIcon(entry.entity);

    return html`
      <div class="auto-row">
        <!-- Icon colored to match state -->
        <sf-icon
          icon="${icon}"
          style="--icon-color: ${isOn ? 'var(--sf-accent-on, #00ff9d)' : 'var(--sf-text-disabled, rgba(224, 232, 255, 0.3))'}"
          .connection="${this.hass.connection}"
        ></sf-icon>
        <span class="auto-name ${absent ? 'toggle-unknown' : isOn ? 'toggle-on' : 'toggle-off'}">${entry.name}</span>
        ${renderSfToggle(absent, isOn, () => this._toggle(entry.entity, isOn, entry.name))}
      </div>
    `;
  }

  private _renderSlider(entry: BridgeAutomationEntry): TemplateResult {
    const stateObj = this.hass.states[entry.entity];
    const absent = stateObj === undefined;
    if (absent) warnOnce('not-found', entry.entity);
    const rawValue = parseFloat(stateObj?.state ?? '0');
    const hassValue = isNaN(rawValue) ? (entry.min ?? 0) : rawValue;
    // Use local value for immediate display feedback
    const value = this._localValues.get(entry.entity) ?? hassValue;
    const unit = entry.unit ?? '';
    const icon = entry.icon ?? autoDefaultIcon(entry.entity);

    return html`
      <div class="slider-row">
        <div class="slider-header">
          <sf-icon icon="${icon}" .connection="${this.hass.connection}"></sf-icon>
          <span class="auto-name">${entry.name}</span>
          <span class="slider-value">${absent ? '--' : `${value}${unit ? `\u00a0${unit}` : ''}`}</span>
        </div>
        <input
          type="range"
          min="${entry.min ?? 0}"
          max="${entry.max ?? 100}"
          step="${entry.step ?? 1}"
          .value="${String(value)}"
          ?disabled="${absent}"
          @input="${(e: Event) => this._onSliderInput(entry, e)}"
        />
      </div>
    `;
  }

  private _toggle(entity: string, isOn: boolean, name: string): void {
    const [domain, service] = resolveToggleService(entity, isOn);
    void bridgeCall(
      this,
      this.hass,
      domain,
      service,
      { entity_id: entity },
      `${name} — ${isOn ? msg('deactivated') : msg('activated')}`
    );
  }

  private _onSliderInput(entry: BridgeAutomationEntry, e: Event): void {
    // A control bound to an absent entity never calls a service (FR-6.2)
    if (this.hass.states[entry.entity] === undefined) return;
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (isNaN(value)) return;

    // Immediately update display
    this._localValues = new Map(this._localValues).set(entry.entity, value);

    // Debounce 300ms (spec §Slider service)
    const existing = this._debounceTimers.get(entry.entity);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this._setSliderValue(entry.entity, value);
      this._debounceTimers.delete(entry.entity);
    }, 300);
    this._debounceTimers.set(entry.entity, timer);
  }

  private _setSliderValue(entity: string, value: number): void {
    const domain = entity.split('.')[0] as string;
    void bridgeCall(
      this,
      this.hass,
      domain,
      'set_value',
      { entity_id: entity, value },
      `${value}`
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Clear all debounce timers on disconnect
    for (const timer of this._debounceTimers.values()) clearTimeout(timer);
    this._debounceTimers.clear();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeAutomations;
  }
}
