import {LitElement, css, nothing, svg} from 'lit';

import common_style from '../../common_style.js';

class SciFiSvgIcon extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          vertical-align: center;
          fill: var(--svg-color, var(--primary-light-color));
          width: var(--svg-width, var(--icon-size-normal));
          height: var(--svg-height, var(--icon-size-normal));
        }
        svg {
          width: 100%;
          height: 100%;
        }
      `,
    ];
  }

  static get properties() {
    return {
      path: {type: String},
      viewbox: {type: String},
    };
  }

  constructor() {
    super();
    this.path = this.path ? this.path : null;
    this.viewbox = this.viewbox ? this.viewbox : '0 0 24 24';
  }

  render() {
    if (!this.path) return nothing;
    return svg`
    <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="${this.viewbox}"
        >
        <path d="${this.path}" />
    </svg>`;
  }
}

customElements.get('sci-fi-svg-icon') ||
  customElements.define('sci-fi-svg-icon', SciFiSvgIcon);
