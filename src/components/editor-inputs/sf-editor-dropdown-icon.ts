/**
 * <sf-editor-dropdown-icon> — Icon picker dropdown for card editors.
 *
 * Extends SfEditorDropdown. Shows sf: custom icons + common MDI icons.
 * Icon list is loaded once at module level (not per-instance).
 * The 200-item limit is applied AFTER query filtering to allow full-set searching.
 *
 * Spec 10 § sf-editor-dropdown-icon
 */

import { html, css, nothing, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SfEditorDropdown } from './sf-editor-dropdown.js';
import CUSTOM_ICONS from '../sf-icon/data/sf-icons.js';
import '../sf-icon/sf-icon.js';

/** Common MDI icons used in sci-fi cards (curated list, not the full 7000+ MDI set) */
const COMMON_MDI_ICONS: readonly string[] = [
  'mdi:home', 'mdi:home-outline', 'mdi:lightbulb', 'mdi:lightbulb-outline',
  'mdi:lightbulb-off', 'mdi:lightbulb-off-outline', 'mdi:power', 'mdi:power-off',
  'mdi:power-plug', 'mdi:power-plug-off', 'mdi:thermometer', 'mdi:thermometer-low',
  'mdi:thermometer-high', 'mdi:snowflake', 'mdi:fire', 'mdi:leaf',
  'mdi:fan', 'mdi:fan-off', 'mdi:weather-sunny', 'mdi:weather-cloudy',
  'mdi:weather-rainy', 'mdi:weather-snowy', 'mdi:weather-windy', 'mdi:weather-fog',
  'mdi:weather-night', 'mdi:weather-partly-cloudy', 'mdi:weather-lightning',
  'mdi:weather-lightning-rainy', 'mdi:weather-pouring', 'mdi:weather-hail',
  'mdi:car', 'mdi:car-electric', 'mdi:car-battery', 'mdi:car-key',
  'mdi:car-door-lock', 'mdi:ev-station', 'mdi:gas-station',
  'mdi:robot-vacuum', 'mdi:robot-vacuum-variant', 'mdi:broom',
  'mdi:battery', 'mdi:battery-charging', 'mdi:battery-outline',
  'mdi:battery-10', 'mdi:battery-20', 'mdi:battery-50', 'mdi:battery-80',
  'mdi:lock', 'mdi:lock-open', 'mdi:lock-outline', 'mdi:lock-open-outline',
  'mdi:map-marker', 'mdi:map-marker-outline', 'mdi:navigation',
  'mdi:speedometer', 'mdi:fuel', 'mdi:flash', 'mdi:flash-off',
  'mdi:checkbox-marked-circle', 'mdi:close-circle', 'mdi:alert-circle',
  'mdi:check-circle', 'mdi:information', 'mdi:information-outline',
  'mdi:cog', 'mdi:cog-outline', 'mdi:wrench', 'mdi:hammer',
  'mdi:water', 'mdi:water-off', 'mdi:water-boiler', 'mdi:water-pump',
  'mdi:radiator', 'mdi:radiator-off', 'mdi:heat-pump', 'mdi:heat-pump-outline',
  'mdi:air-conditioner', 'mdi:hvac', 'mdi:hvac-off',
  'mdi:television', 'mdi:television-off', 'mdi:speaker', 'mdi:speaker-off',
  'mdi:volume-high', 'mdi:volume-off', 'mdi:music', 'mdi:music-off',
  'mdi:moon-waning-crescent', 'mdi:brightness-5', 'mdi:brightness-7',
  'mdi:motion-sensor', 'mdi:motion-sensor-off', 'mdi:door', 'mdi:door-open',
  'mdi:window-closed', 'mdi:window-open', 'mdi:garage', 'mdi:garage-open',
  'mdi:eye', 'mdi:eye-off', 'mdi:account', 'mdi:account-outline',
  'mdi:security', 'mdi:shield', 'mdi:shield-outline', 'mdi:shield-off',
  'mdi:alert', 'mdi:alert-outline', 'mdi:bell', 'mdi:bell-off',
  'mdi:stove', 'mdi:fireplace', 'mdi:fireplace-off',
];

/** All available icons for the picker — loaded once at module level */
const ALL_ICONS: readonly string[] = [
  ...Object.keys(CUSTOM_ICONS as Record<string, string>).map(k => `sci:${k}`),
  ...COMMON_MDI_ICONS,
];

const MAX_VISIBLE = 200;

@customElement('sf-editor-dropdown-icon')
export class SfEditorDropdownIcon extends SfEditorDropdown {

  static override styles: import("lit").CSSResultGroup = [
    SfEditorDropdown.styles,
    css`
      .dropdown-item {
        align-items: center;
      }

      .icon-preview {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-name {
        font-size: 0.8rem;
        font-family: monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    // Set items to ALL_ICONS — the parent dropdown will filter by query
    this.items = ALL_ICONS as unknown[];
  }

  /** Show the currently selected icon as a preview on the left of the input field. */
  protected override renderIcon() {
    const iconToShow = this.value || this.icon;
    if (!iconToShow) return nothing;
    return html`
      <div class="icon-slot">
        <sf-icon icon="${iconToShow}" style="--icon-width:18px;--icon-height:18px;"></sf-icon>
      </div>
    `;
  }

  protected override _itemMatchesQuery(item: unknown, query: string): boolean {
    return String(item).toUpperCase().includes(query);
  }

  protected override _renderDropdown(): TemplateResult {
    if (!this._open) return html``;
    this._updateFilter();
    // Apply 200-limit AFTER filtering (spec: user can search full set)
    const visibleItems = this._filteredItems.slice(0, MAX_VISIBLE);
    return html`
      <div class="dropdown-menu ${this._open ? 'open' : ''}">
        ${visibleItems.map((item, i) => this._renderItem(item, i))}
      </div>
    `;
  }

  protected override _renderItem(item: unknown, index: number): TemplateResult {
    const iconName = String(item);
    return html`
      <div
        class="dropdown-item"
        data-index="${index}"
        @mousedown="${(e: Event) => { e.preventDefault(); this._selectItem(iconName); }}"
      >
        <div class="icon-preview">
          <sf-icon icon="${iconName}" style="--icon-width:18px;--icon-height:18px;"></sf-icon>
        </div>
        <span class="icon-name">${iconName}</span>
      </div>
    `;
  }

  /** Force has-icon class when a value is selected so the left padding renders. */
  override render(): TemplateResult {
    const hasValue = this.value !== '' && this.value !== undefined;
    const hasIconSlot = !!(this.value || this.icon);
    const displayValue = this._open ? this._filterQuery : this.value;
    return html`
      <div class="container ${hasIconSlot ? 'has-icon' : ''} ${hasValue ? 'has-value' : ''} ${this._open ? 'open' : ''}">
        ${this.renderIcon()}
        <div class="input-group">
          <input
            type="text"
            .value="${displayValue}"
            placeholder=" "
            ?disabled="${this.disabled}"
            @focus="${this._onFocus}"
            @blur="${this._onBlur}"
            @input="${this._onInput}"
          />
          <label>${this.label}</label>
        </div>
      </div>
      ${this._renderDropdown()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-dropdown-icon': SfEditorDropdownIcon;
  }
}
