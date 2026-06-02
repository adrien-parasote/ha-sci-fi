/**
 * sf-circle-progress-bar — Circular SVG progress gauge
 * Port from sf-circle_progress_bar.js (main branch) — adapted to --sf-* tokens
 * Used by: sci-fi-stove (pellet quantity gauge)
 */
import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sciFiCommonStyles } from '../styles/common.js';

const CIRCUMFERENCE = 628.31; // 2π × r=100

@customElement('sf-circle-progress-bar')
export class SciFiCircleProgressBar extends LitElement {
  static override styles = [
    sciFiCommonStyles,
    css`
      :host {
        display: flex;
        justify-content: center;
        background: transparent;
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: 5px;
        color: var(--sf-text-secondary);
        font-size: var(--sf-font-size-sm, 0.75rem);
        position: relative;
        background: transparent;
      }
      .text {
        text-align: center;
        font-weight: bold;
      }
      .value {
        fill: var(--sf-primary, #00d2ff);
      }
      .warning {
        color: rgb(250, 146, 29);
        fill: rgb(250, 146, 29);
      }
      .critical {
        color: #ff4444;
        fill: #ff4444;
      }
      .circular-progress circle {
        stroke-width: 16px;
        fill: transparent;
      }
      .circular-progress circle.bg {
        stroke: rgba(224, 232, 255, 0.15);
      }
      .circular-progress circle.fg {
        stroke-linecap: round;
        stroke: var(--sf-primary, #00d2ff);
        filter: drop-shadow(0px 0px 5px var(--sf-primary, #00d2ff));
      }
      .circular-progress.warning circle.fg {
        stroke: rgb(250, 146, 29);
        filter: drop-shadow(0px 0px 5px rgb(250, 146, 29));
      }
      .circular-progress.critical circle.fg {
        stroke: #ff4444;
        filter: drop-shadow(0px 0px 5px #ff4444);
      }
    `,
  ];

  @property({ type: Number }) val = 0;
  @property({ type: String }) text = '';
  @property({ type: Number }) threshold = 0.5;

  protected override render(): TemplateResult {
    const critical = this.val <= 10;
    const warning = this.val / 100 < this.threshold;
    const classes = [
      warning ? 'warning' : '',
      critical ? 'critical' : '',
    ].filter(Boolean).join(' ');

    const dashoffset = Math.round(CIRCUMFERENCE * ((100 - this.val) / 100));
    const textX = this.val < 10 ? '90px' : this.val > 99 ? '60px' : '80px';

    return html`
      <div class="container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 250 250"
          class="circular-progress ${classes}"
          style="transform:rotate(-90deg)"
        >
          <circle class="bg" r="100" cx="125" cy="125"></circle>
          <circle
            class="fg"
            r="100"
            cx="125"
            cy="125"
            stroke-dashoffset="${dashoffset}px"
            stroke-dasharray="${CIRCUMFERENCE}px"
          ></circle>
          <text
            class="value ${classes}"
            x="${textX}"
            y="90px"
            font-size="52px"
            font-weight="bold"
            style="transform:rotate(90deg) translate(0px, -196px)"
          >
            ${this.val}%
          </text>
        </svg>
        <div class="text ${classes}">${this.text}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-circle-progress-bar': SciFiCircleProgressBar;
  }
}
