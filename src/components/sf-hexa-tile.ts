import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sciFiCommonStyles } from '../styles/common.js';

const SVG_VIEWBOX_WIDTH = 132;
const SVG_VIEWBOX_HEIGHT = 164;
const BG_HEXA_INACTIVE =
  'M 66.021 2 L 130 41.989 L 130 121.978 L 66.021 161.958 L 2 121.978 L 2 41.989 L 66.021 2 Z';
const BG_HEXA_ACTIVE_BORDER =
  'M 66.037 7 L 126.032 44.5 L 126.032 119.509 L 66.037 157 L 6 119.509 L 6 44.5 L 66.037 7 Z';
const BG_HEXA_ACTIVE_BACKGROUND =
  'M 66.019 13 L 121 47.366 L 121 116.106 L 66.019 150.463 L 11 116.106 L 11 47.366 L 66.019 13 Z';
const BG_HEXA_HR = 'M 2 2 L 65.979 41.989 L 65.979 121.978 L 2 161.958 L 2 2 Z';
const BG_HEXA_HL = 'M 66.021 161.958 L 2 121.978 L 2 41.989 L 66.021 2 Z';

@customElement('sf-hexa-tile')
export class SciFiHexaTile extends LitElement {
  static override styles = [
    sciFiCommonStyles,
    css`
      :host {
        --custom-border: var(--sf-hexa-border, var(--sf-border, rgba(224, 232, 255, 0.1)));
      }
      .hexa {
        width: var(--sf-hexa-width, 100px);
      }
      .hexa svg .background {
        fill: var(--sf-bg-primary, #101626);
        stroke-width: 4px;
        stroke: var(--sf-bg-secondary, #1a2235);
        stroke-opacity: 0.8;
        stroke-linejoin: round;
      }
      .hexa svg .border {
        fill: var(--sf-bg-primary, #101626);
        stroke: var(--custom-border);
        stroke-width: 5px;
        stroke-linejoin: round;
        transition: stroke 0.15s, filter 0.15s;
      }
      .item {
        position: relative;
        transition: transform 0.2s ease;
      }
      .item:hover {
        cursor: pointer;
        transform: scale(1.08);
      }
      .item:hover svg .border {
        stroke: var(--sf-primary, #00d2ff);
        filter: drop-shadow(0 0 5px var(--sf-primary, #00d2ff));
      }
      .item .item-content {
        position: absolute;
        top: 47%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }
      .item-on svg .border {
        stroke: var(--custom-border, var(--sf-primary));
      }
      .item-on .item-content {
        color: var(--custom-border, var(--sf-primary));
        text-shadow: 0px 0px 5px var(--custom-border, var(--sf-primary-dim));
      }
      .item-off .item-content {
        color: var(--custom-border, var(--sf-text-secondary));
        text-shadow: none;
      }
      .item-error svg .border {
        stroke: var(--sf-error);
      }
      .item-error .item-content {
        color: var(--sf-error);
        text-shadow: 0px 0px 5px var(--sf-error);
      }
      :host(.selected) .hexa svg .border {
        stroke: var(--sf-primary, #00d2ff);
        filter: drop-shadow(0px 0px 5px var(--sf-primary, #00d2ff));
      }
      :host(.selected) .item-content {
        color: var(--sf-primary, #00d2ff) !important;
        text-shadow: 0px 0px 5px var(--sf-primary, #00d2ff) !important;
      }
    `,
  ];

  @property({ type: Boolean, attribute: 'active-tile' })
  activeTile = false;

  @property({ type: String })
  state = 'off';

  protected override render(): TemplateResult {
    if (!this.activeTile) return this.__getInactiveTile();
    return this.__getActiveTile();
  }

  private __getInactiveTile(): TemplateResult {
    return html` <div class="hexa item">
      <svg viewBox="0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}">
        <path class="background" d="${BG_HEXA_INACTIVE}" />
      </svg>
    </div>`;
  }

  private __getActiveTile(): TemplateResult {
    return html` <div class="hexa item item-${this.state}">
      <div class="item-content">
        <slot></slot>
      </div>
      <svg viewBox="0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}">
        <path class="background" d="${BG_HEXA_INACTIVE}" />
        <path class="border" d="${BG_HEXA_ACTIVE_BORDER}" />
        <path class="background" d="${BG_HEXA_ACTIVE_BACKGROUND}" />
      </svg>
    </div>`;
  }
}

@customElement('sf-half-hexa-tile')
export class SciFiHexaHalfTile extends LitElement {
  static override styles = [
    sciFiCommonStyles,
    css`
      .hexa svg .border {
        fill: var(--sf-bg-primary);
        stroke: var(--sf-border);
        stroke-width: 5px;
        stroke-linejoin: round;
      }
      .hexa svg .background {
        fill: var(--sf-bg-primary);
        stroke-width: 4px;
        stroke: var(--sf-bg-secondary);
        stroke-opacity: 0.8;
        stroke-linejoin: round;
      }
      .half {
        width: calc(var(--sf-hexa-width, 100px) / 2);
      }
    `,
  ];

  @property({ type: Boolean })
  right = false;

  protected override render(): TemplateResult {
    const path = this.right ? BG_HEXA_HR : BG_HEXA_HL;
    return html`
      <div class="hexa half">
        <svg viewBox="0 0 ${SVG_VIEWBOX_WIDTH / 2} ${SVG_VIEWBOX_HEIGHT}">
          <path class="background" d="${path}" />
        </svg>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-hexa-tile': SciFiHexaTile;
    'sf-half-hexa-tile': SciFiHexaHalfTile;
  }
}
