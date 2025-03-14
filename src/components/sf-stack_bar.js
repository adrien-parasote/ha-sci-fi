import {LitElement, css, html, svg} from 'lit';

import common_style from '../helpers/styles/common_style.js';
import {defineCustomElement} from '../helpers/utils/import.js';

class SciFiStackBar extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: flex;
          justify-content: center;
        }
        .container {
          display: flex;
          flex-direction: column;
          gap: 5px;
          color: var(--secondary-bg-color);
          font-size: var(--font-size-small);
        }
        .path {
          fill: none;
          stroke: var(--secondary-light-alpha-color);
          stroke-width: 5px;
        }
        .path.light {
          stroke: var(--primary-light-color);
          filter: drop-shadow(0px 0px 5px var(--primary-light-color));
          -webkit-filter: drop-shadow(0px 0px 5px var(--primary-light-color));
        }
        .path.warning {
          stroke: var(--primary-error-color);
          filter: drop-shadow(0px 0px 5px var(--primary-error-color));
          -webkit-filter: drop-shadow(0px 0px 5px var(--primary-error-color));
        }
        .text {
          text-align: center;
          font-weight: bold;
        }
        .warning {
          color: var(--primary-error-color);
        }
      `,
    ];
  }

  _bar_number = 20;

  static get properties() {
    return {
      val: {type: Number},
      max: {type: Number},
      text: {type: String},
      threshold: {type: Number},
    };
  }

  constructor() {
    super();
    this.text = this.text ? this.text : '';
    this.val = this.val ? this.val : 0;
    this.max = this.max ? this.val : 100;
    this.threshold = this.threshold ? this.threshold : 50;
  }

  render() {
    const warning = this.val / this.max <= this.threshold;
    return html`
      <div class="container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 100 200"
          style="background: none;"
        >
          ${this.__buildRows(warning)}
        </svg>
        <div class="text ${warning ? 'warning' : ''}">
          ${this.text} (${this.val})
        </div>
      </div>
    `;
  }

  __buildRows(warning) {
    const nb_colored = Math.floor((this.val * this._bar_number) / this.max);
    const rows = Array.from(Array(this._bar_number).keys());
    return svg`${rows.map((nb) => {
      return this.__buildRow(
        nb,
        nb <= this._bar_number - nb_colored - 1,
        warning
      );
    })}`;
  }

  __buildRow(nb, disable, warning) {
    const yPos = 5 + nb * 10;
    const cls = disable ? 'dark' : warning ? 'warning' : 'light';
    return svg`
    <path d="M 5 ${yPos} L 95 ${yPos}" class="path ${cls}"/>
    `;
  }
}

defineCustomElement('sci-fi-stack-bar', SciFiStackBar);
