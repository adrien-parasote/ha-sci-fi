import {LitElement, css, html, svg} from 'lit';

import common_style from '../common_style.js';

class SciFiCircleProgressBar extends LitElement {
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
          position: relative;
        }
        .text {
          text-align: center;
          font-weight: bold;
        }
        .value {
          fill: var(--primary-light-color);
        }
        .warning {
          color: var(--primary-error-color);
          fill: var(--primary-error-color);
        }

        .circular-progress circle {
          stroke-width: 16px;
          fill: transparent;
        }
        .circular-progress circle.bg {
          stroke: var(--secondary-light-alpha-color);
        }
        .circular-progress circle.fg {
          stroke-linecap: round;
          stroke: var(--primary-light-color);
          filter: drop-shadow(0px 0px 5px var(--primary-light-color));
          -webkit-filter: drop-shadow(0px 0px 5px var(--primary-light-color));
        }
        .circular-progress.warning circle.fg {
          stroke: var(--primary-error-color);
          filter: drop-shadow(0px 0px 5px var(--primary-error-color));
          -webkit-filter: drop-shadow(0px 0px 5px var(--primary-error-color));
        }
      `,
    ];
  }

  static get properties() {
    return {
      val: {type: Number},
      text: {type: String},
      threshold: {type: Number},
    };
  }

  constructor() {
    super();
    this.val = this.val ? this.val : 0;
    this.threshold = this.threshold ? this.threshold : 0.5;
  }

  render() {
    const warning = this.val / 100 < this.threshold;
    const progress = (565 * this.val) / 100;
    const text_pos = this.val < 10 ? '90px' : this.val > 99 ? '60px' : '80px';
    return html`
      <div class="container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 250 250"
          class="circular-progress ${warning ? 'warning' : ''}"
          style="transform:rotate(-90deg)"
        >
          <circle class="bg" r="100" cx="125" cy="125"></circle>
          <circle
            class="fg"
            r="100"
            cx="125"
            cy="125"
            stroke-dashoffset="${progress}px"
            stroke-dasharray="565.48px"
          ></circle>
          <text
            class="value ${warning ? 'warning' : ''}"
            x="${text_pos}"
            y="90px"
            font-size="52px"
            font-weight="bold"
            style="transform:rotate(90deg) translate(0px, -196px)"
          >
            ${this.val}%
          </text>
        </svg>
        <div class="text ${warning ? 'warning' : ''}">${this.text}</div>
      </div>
    `;
  }
}

window.customElements.get('sci-fi-circle-progress-bar') ||
  window.customElements.define(
    'sci-fi-circle-progress-bar',
    SciFiCircleProgressBar
  );
