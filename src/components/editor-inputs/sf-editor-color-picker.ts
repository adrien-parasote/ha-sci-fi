/**
 * <sf-editor-color-picker> — Color picker input for card editors.
 *
 * Extends SfEditorInput. Replaces the text input with a color input.
 * Label is always displayed in the floated-up position.
 * Shows a color swatch using the current value as CSS background.
 *
 * Spec 10 § sf-editor-color-picker
 */

import { html, css, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SfEditorInput } from './sf-editor-input.js';

@customElement('sf-editor-color-picker')
export class SfEditorColorPicker extends SfEditorInput {

  static override styles: CSSResultGroup = [
    SfEditorInput.styles,
    css`
      .container {
        min-height: 56px;
        align-items: center;
      }

      label {
        /* Always floated up for color pickers */
        top: 8px !important;
        transform: translateY(0) scale(0.75) !important;
        color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
      }

      .color-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding: 20px 0 6px 0;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid rgba(0, 210, 255, 0.3);
        flex-shrink: 0;
      }

      input[type='color'] {
        width: 0;
        height: 0;
        padding: 0;
        border: none;
        opacity: 0;
        position: absolute;
      }

      .color-value {
        font-size: 0.8rem;
        color: var(--primary-text-color, #e0e8ff);
        font-family: monospace;
        cursor: pointer;
        flex: 1;
      }
    `,
  ];

  override render(): TemplateResult {
    return html`
      <div class="container ${this.icon ? 'has-icon' : ''} has-value">
        ${this.renderIcon()}
        <div class="input-group">
          <label>${this.label}</label>
          <div class="color-row">
            <div
              class="color-swatch"
              style="background: ${this.value || 'transparent'};"
              @click="${() => this.shadowRoot?.querySelector<HTMLInputElement>('input[type=color]')?.click()}"
            ></div>
            <input
              type="color"
              .value="${this.value || '#000000'}"
              @input="${this._onInput}"
            />
            <span class="color-value" @click="${() => this.shadowRoot?.querySelector<HTMLInputElement>('input[type=color]')?.click()}">
              ${this.value || '—'}
            </span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-color-picker': SfEditorColorPicker;
  }
}
