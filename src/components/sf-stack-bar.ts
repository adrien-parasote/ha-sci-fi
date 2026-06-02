/**
 * sf-stack-bar — Stacked horizontal SVG bar (pellet bag stock)
 * Port from sf-stack_bar.js (main branch) — adapted to --sf-* tokens
 * Used by: sci-fi-stove (storage counter stack visualization)
 */
import { LitElement, css, html, svg, type TemplateResult, type SVGTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sciFiCommonStyles } from '../styles/common.js';

const BAR_NUMBER = 20;

@customElement('sf-stack-bar')
export class SciFiStackBar extends LitElement {
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
        color: var(--secondary-bg-color, rgba(224, 232, 255, 0.6));
        font-size: var(--sf-text-sm, 12px);
        background: transparent;
      }
      /* dark = disabled bar — matches main --secondary-light-alpha-color */
      .path {
        fill: none;
        stroke: var(--secondary-light-alpha-color, rgba(110, 203, 245, 0.15));
        stroke-width: 5px;
      }
      /* light = normal colored bar — matches main --primary-light-color */
      .path.light {
        stroke: var(--primary-light-color, #6ecbf5);
        filter: drop-shadow(0px 0px 5px var(--primary-light-color, #6ecbf5));
      }
      /* warning = low stock — matches main --primary-error-color (amber) */
      .path.warning {
        stroke: rgb(250, 146, 29);
        filter: drop-shadow(0px 0px 5px rgb(250, 146, 29));
      }
      .text {
        text-align: center;
        font-weight: bold;
      }
      .warning {
        color: rgb(250, 146, 29);
      }
    `,
  ];

  @property({ type: Number }) val = 0;
  @property({ type: Number }) max = 100;
  @property({ type: String }) text = '';
  @property({ type: Number }) threshold = 0.5;

  protected override render(): TemplateResult {
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
          ${this._buildRows(warning)}
        </svg>
        <div class="text ${warning ? 'warning' : ''}">
          ${this.text} (${this.val})
        </div>
      </div>
    `;
  }

  private _buildRows(warning: boolean): SVGTemplateResult {
    const nbColored = Math.floor((this.val * BAR_NUMBER) / this.max);
    const rows = Array.from({ length: BAR_NUMBER }, (_, i) => i);
    return svg`${rows.map(nb => this._buildRow(nb, nb <= BAR_NUMBER - nbColored - 1, warning))}`;
  }

  private _buildRow(nb: number, disabled: boolean, warning: boolean): SVGTemplateResult {
    const yPos = 5 + nb * 10;
    const cls = disabled ? 'dark' : warning ? 'warning' : 'light';
    return svg`<path d="M 5 ${yPos} L 95 ${yPos}" class="path ${cls}"/>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-stack-bar': SciFiStackBar;
  }
}
