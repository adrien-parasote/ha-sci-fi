/**
 * <sf-bridge-crew> — Crew presence section
 * Halo glow (box-shadow) matching zone state, icon colored in halo color.
 * - Green halo → home
 * - Grey halo  → not_home / away
 * - Blue halo  → other (work, school, etc.)
 * Zone icon overlaid top-right corner of avatar.
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgePersonEntry } from '../../../types/config.js';
import '../../../components/sf-icon/sf-icon.js';

const TAG = 'sf-bridge-crew';

/** CSS class driving the box-shadow halo */
function ringClass(state: string): 'ring-home' | 'ring-away' | 'ring-other' {
  if (state === 'home')     return 'ring-home';
  if (state === 'not_home') return 'ring-away';
  return 'ring-other';
}

/** CSS color matching the ring halo — used to color the fallback icon */
function ringColor(state: string): string {
  if (state === 'home')     return 'var(--sf-accent-on, #00ff9d)';
  if (state === 'not_home') return 'var(--sf-text-disabled, #888)';
  return 'var(--sf-primary, #00d2ff)';
}

/** MDI icon representing the zone */
function zoneIcon(state: string): string {
  const map: Record<string, string> = {
    home:     'mdi:home',
    not_home: 'mdi:home-off',
    work:     'mdi:briefcase',
    school:   'mdi:school',
  };
  return map[state] ?? 'mdi:map-marker';
}

@localized()
@customElement(TAG)
export class SfBridgeCrew extends LitElement {
  static override styles = [sciFiCommonStyles, bridgeStyles];

  @property({ type: Array }) persons: BridgePersonEntry[] = [];
  @property({ attribute: false }) hass: any;

  override render(): TemplateResult {
    if (!this.hass || !this.persons.length) return html``;

    return html`
      <div class="bridge-section">
        <div class="bridge-section-title">
          <sf-icon icon="mdi:account-group" .connection="${this.hass.connection}"></sf-icon>
          ${msg('Crew')}
        </div>
        <div class="crew-row">
          ${this.persons.map(p => this._renderBadge(p))}
        </div>
      </div>
    `;
  }

  private _renderBadge(p: BridgePersonEntry): TemplateResult {
    const stateObj = this.hass.states[p.entity];
    if (!stateObj) return nothing as unknown as TemplateResult;

    const state: string = stateObj.state ?? 'unknown';
    const name: string = stateObj.attributes?.friendly_name ?? p.entity;
    const picture: string | null = stateObj.attributes?.entity_picture ?? null;
    const ring = ringClass(state);
    const color = ringColor(state);    // CSS color for icon
    const zIcon = zoneIcon(state);

    return html`
      <div class="crew-badge">
        <!-- Avatar wrap: halo via box-shadow -->
        <div class="crew-avatar-wrap ${ring}">
          <div class="crew-avatar">
            ${picture
              ? html`<img src="${picture}" alt="${name}" />`
              : html`<sf-icon
                  icon="mdi:account"
                  style="--icon-color:${color};--icon-width:28px;--icon-height:28px;"
                  .connection="${this.hass.connection}"
                ></sf-icon>`
            }
          </div>
          <!-- Zone icon — top-right corner, sized to be visible -->
          <div class="crew-zone-badge">
            <sf-icon
              icon="${zIcon}"
              style="--icon-width:22px;--icon-height:22px;--icon-color:${color};"
              .connection="${this.hass.connection}"
            ></sf-icon>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG]: SfBridgeCrew;
  }
}
