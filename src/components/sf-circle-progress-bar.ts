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
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: 5px;
        color: var(--sf-text-secondary);
        font-size: var(--sf-font-size-sm, 0.75rem);
        position: relative;
      }
      .text {
        text-align: center;
        font-weight: bold;
      }
      .value {
        fill: var(--sf-primary, #00d2ff);
      }
      .warning {
        color: var(--sf-error, #ff6b35);
        fill: var(--sf-error, #ff6b35);
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
        stroke: var(--sf-error, #ff6b35);
        filter: drop-shadow(0px 0px 5px var(--sf-error, #ff6b35));
      }
    `,
  ];

  @property({ type: Number }) val = 0;
  @property({ type: String }) text = '';
  @property({ type: Number }) threshold = 0.5;

  protected override render(): TemplateResult {
    const warning = this.val / 100 < this.threshold;
    const dashoffset = Math.round(CIRCUMFERENCE * ((100 - this.val) / 100));
    const textX = this.val < 10 ? '90px' : this.val > 99 ? '60px' : '80px';

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
            stroke-dashoffset="${dashoffset}px"
            stroke-dasharray="${CIRCUMFERENCE}px"
          ></circle>
          <text
            class="value ${warning ? 'warning' : ''}"
            x="${textX}"
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

declare global {
  interface HTMLElementTagNameMap {
    'sf-circle-progress-bar': SciFiCircleProgressBar;
  }
}
