/**
 * <sf-editor-chips> — Multi-value tag list input for card editors.
 *
 * Extends SfEditorInput. Shows existing values as chips above the input.
 * Pressing Enter adds a new chip.
 * - 'input-update' with type:'add' on Enter
 * - 'input-update' with type:'remove' on chip X click
 *
 * Spec 10 § sf-editor-chips
 */

import { html, css, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { editorChipsStyles } from '../../styles/editor-inputs-shared.js';
import { SfEditorInput } from './sf-editor-input.js';

@customElement('sf-editor-chips')
export class SfEditorChips extends SfEditorInput {
  /** Currently saved values — use property binding `.values="${array}"` */
  @property({ attribute: false }) values: string[] = [];

  static override styles: CSSResultGroup = [
    SfEditorInput.styles,
    editorChipsStyles,
    css`
      .chip {
        padding: 2px 8px 2px 8px;
      }
    `,
  ];

  private _onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const newValue = input.value.trim();
      if (!newValue) return;
      input.value = '';
      this.value = '';
      this._dispatch(newValue, 'add');
    }
  }

  private _removeChip(index: number): void {
    this._dispatch(String(index), 'remove');
  }

  override render(): TemplateResult {
    return html`
      <div class="container ${this.values.length > 0 ? 'has-value' : ''}">
        ${this.values.length > 0
          ? html`
            <div class="chips-row">
              ${this.values.map((v, i) => html`
                <div class="chip">
                  <span>${v}</span>
                  <button
                    class="chip-delete"
                    @click="${(e: Event) => { e.stopPropagation(); this._removeChip(i); }}"
                  >✕</button>
                </div>
              `)}
            </div>
          `
          : ''}
        <div class="input-group">
          <input
            type="text"
            .value="${this.value}"
            placeholder=" "
            ?disabled="${this.disabled}"
            @input="${(e: Event) => { this.value = (e.target as HTMLInputElement).value; }}"
            @keydown="${this._onKeydown}"
          />
          <label>${this.label}</label>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-chips': SfEditorChips;
  }
}
