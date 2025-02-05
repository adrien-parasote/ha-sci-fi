import {LitElement, css, html} from 'lit';

import common_style from '../../helpers/common_style.js';

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

class SciFiHexaTile extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --border: var(--hexa-border, var(--secondary-light-alpha-color));
          --background: var(--hexa-background, var(--primary-bg-color));
        }
        .hexa {
          width: var(--hexa-width);
        }
        .hexa svg .background {
          fill: var(--background);
          stroke-width: 4px;
          stroke: var(--secondary-bg-color);
          stroke-opacity: 0.8;
          stroke-linejoin: round;
        }
        .hexa svg .border {
          fill: var(--primary-bg-color);
          stroke: var(--border);
          stroke-width: 5px;
          stroke-linejoin: round;
        }
        .item {
          position: relative;
        }
        .item:hover {
          cursor: pointer;
        }
        .item .item-content {
          position: absolute;
          top: 47%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        .item-on svg .border {
          stroke: var(--primary-light-color);
        }
        .item-on .item-content {
          color: var(--primary-light-color);
          text-shadow: 0px 0px 5px var(--secondary-light-color);
        }
        .item-off .item-content {
          color: var(--secondary-bg-color);
          text-shadow: none;
        }
        .item-error svg .border {
          stroke: var(--primary-error-color);
        }
        .item-error .item-content {
          color: var(--primary-error-color);
          text-shadow: 0px 0px 5px var(--primary-error-alpha-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      activeTile: {type: Boolean, attribute: 'active-tile'},
      state: {type: String},
    };
  }

  constructor() {
    super();
    this.activeTile = this.activeTile ? this.activeTile : false;
    this.state = this.state ? this.state : 'off';
  }

  render() {
    if (!this.activeTile) return this.__getInactiveTile();
    return this.__getActiveTile();
  }

  __getInactiveTile() {
    return html` <div class="hexa item">
      <svg viewBox="0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}">
        <path class="background" d="${BG_HEXA_INACTIVE}" />
      </svg>
    </div>`;
  }

  __getActiveTile() {
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

export class SciFiHexaHalfTile extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        .hexa svg .border {
          fill: var(--primary-bg-color);
          stroke: var(--secondary-light-alpha-color);
          stroke-width: 5px;
          stroke-linejoin: round;
        }
        .hexa svg .background {
          fill: var(--primary-bg-color);
          stroke-width: 4px;
          stroke: var(--secondary-bg-color);
          stroke-opacity: 0.8;
          stroke-linejoin: round;
        }
        .half {
          width: calc(var(--hexa-width) / 2);
        }
      `,
    ];
  }

  static get properties() {
    return {
      right: {type: Boolean},
    };
  }

  constructor() {
    super();
    this.right = this.right ? this.right : false;
  }

  render() {
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

window.customElements.get('sci-fi-hexa-tile') ||
  window.customElements.define('sci-fi-hexa-tile', SciFiHexaTile);
window.customElements.get('sci-fi-half-hexa-tile') ||
  window.customElements.define('sci-fi-half-hexa-tile', SciFiHexaHalfTile);
