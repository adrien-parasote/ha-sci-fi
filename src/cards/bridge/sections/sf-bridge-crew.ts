/**
 * <sf-bridge-crew> — Crew presence section
 * Halo glow (box-shadow) matching zone state, icon colored in halo color.
 * - Green halo  → home (--sf-accent-on)
 * - Grey halo   → not_home / away (--sf-accent-off)
 * - Yellow halo → work, school — named zones (--sf-warning)
 * - Blue halo   → any OTHER known zone (--sf-primary)
 * - Thin ring, no glow → unavailable / unknown (--sf-text-disabled)
 * Zone icon overlaid top-right corner of avatar.
 */
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { sciFiCommonStyles } from '../../../styles/common.js';
import { bridgeStyles } from '../styles.js';
import type { BridgePersonEntry } from '../config.js';
import '../../../components/sf-icon/sf-icon.js';

const TAG = 'sf-bridge-crew';

/** States for which no zone is known — neither home, nor away, nor a zone */
const UNKNOWN_STATES = new Set(['unavailable', 'unknown']);

/** CSS class driving the box-shadow halo */
function ringClass(state: string): 'ring-home' | 'ring-away' | 'ring-other' | 'ring-unknown' {
  if (state === 'home')     return 'ring-home';
  if (state === 'not_home') return 'ring-away';
  // `unavailable`/`unknown` are NOT "at some known zone": they used to fall
  // through to ring-other, which paints the cyan known-zone halo on a person
  // whose entity is simply not reporting.
  if (UNKNOWN_STATES.has(state)) return 'ring-unknown';
  return 'ring-other';
}

/**
 * CSS color matching the ring halo — drives the icons AND the halo, via the
 * `--ring-color` custom property.
 *
 * `work` and `school` are named zones, not "somewhere else": the Zone → colour
 * mapping gives them `--sf-warning`, and cyan is reserved for any OTHER known
 * zone. The code already told them apart in `zoneIcon`; only the colour was
 * missing, so all three states fell through to cyan.
 */
function ringColor(state: string): string {
  if (state === 'home')     return 'var(--sf-accent-on, #00ff9d)';
  // not_home is `--sf-accent-off`; `--sf-text-disabled` belongs to the
  // unavailable/unknown row below, and used to be applied here by mistake.
  if (state === 'not_home') return 'var(--sf-accent-off, rgba(224, 232, 255, 0.25))';
  if (state === 'work' || state === 'school') return 'var(--sf-warning, #ffd60a)';
  if (UNKNOWN_STATES.has(state)) return 'var(--sf-text-disabled, rgba(224, 232, 255, 0.3))';
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
        <div class="crew-avatar-wrap ${ring}" style="--ring-color:${color};">
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
