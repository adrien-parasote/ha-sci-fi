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
        .warning {
          color: var(--primary-error-color);
        }
        .value {
          position: absolute;
          left: 39%;
          top: 30%;
          font-size: var(--font-size-small);
          font-weight: bold;
        }
        .circular-progress {
          --size: 250px;
          --half-size: calc(var(--size) / 2);
          --stroke-width: 10px;
          --radius: calc((var(--size) - var(--stroke-width)) / 2);
          --circumference: calc(var(--radius) * pi * 2);
          --dash: calc((var(--progress) * var(--circumference)) / 100);
          animation: progress-animation 5s linear 0s 1 forwards;
        }
        .circular-progress circle {
          cx: var(--half-size);
          cy: var(--half-size);
          r: var(--radius);
          stroke-width: var(--stroke-width);
          fill: none;
          stroke-linecap: round;
        }
        .circular-progress circle.bg {
          stroke: var(--secondary-light-alpha-color);
        }
        .circular-progress circle.fg {
          transform: rotate(-90deg);
          transform-origin: var(--half-size) var(--half-size);
          stroke-dasharray: var(--dash) calc(var(--circumference) - var(--dash));
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
    return html`
      <div class="container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 250 250"
          class="circular-progress ${warning ? 'warning' : ''}"
          style="--progress:${this.val};"
        >
          <circle class="bg"></circle>
          <circle class="fg"></circle>
        </svg>
        <div class="value ${warning ? 'warning' : ''}">${this.val}%</div>
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
