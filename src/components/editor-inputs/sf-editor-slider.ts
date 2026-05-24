/**
 * <sf-editor-slider> — Range slider input for card editors.
 *
 * Extends SfEditorInput. Replaces the text input with a range input.
 * Dispatches 'input-update' with the numeric value as string on slider move.
 *
 * Spec 10 § sf-editor-slider
 */

import { html, css, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SfEditorInput } from './sf-editor-input.js';

@customElement('sf-editor-slider')
export class SfEditorSlider extends SfEditorInput {
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;

  static override styles: CSSResultGroup = [
    SfEditorInput.styles,
    css`
      .slider-group {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 4px 0;
      }

      input[type='range'] {
        flex: 1;
        appearance: none;
        background: rgba(0, 210, 255, 0.15);
        height: 4px;
        border-radius: 2px;
        outline: none;
        cursor: pointer;
      }

      input[type='range']::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color, #00d2ff);
        cursor: pointer;
        transition: transform 150ms;
      }

      input[type='range']::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }

      .value-display {
        font-size: 0.85rem;
        color: var(--primary-color, #00d2ff);
        min-width: 32px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      label {
        font-size: 0.75rem;
        color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
        position: static;
        transform: none;
        margin-bottom: 4px;
        display: block;
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <div class="container ${this.icon ? 'has-icon' : ''}">
        ${this.renderIcon()}
        <div class="input-group" style="padding: 10px 0 6px 0;">
          <label>${this.label}</label>
          <div class="slider-group">
            <input
              type="range"
              .min="${String(this.min)}"
              .max="${String(this.max)}"
              .step="${String(this.step)}"
              .value="${String(this.value ?? this.min)}"
              ?disabled="${this.disabled}"
              @input="${this._onInput}"
            />
            <span class="value-display">${this.value ?? this.min}</span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-slider': SfEditorSlider;
  }
}
