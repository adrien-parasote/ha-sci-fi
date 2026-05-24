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
import { SfEditorInput } from './sf-editor-input.js';

@customElement('sf-editor-chips')
export class SfEditorChips extends SfEditorInput {
  /** Currently saved values — use property binding `.values="${array}"` */
  @property({ attribute: false }) values: string[] = [];

  static override styles: CSSResultGroup = [
    SfEditorInput.styles,
    css`
      .container {
        flex-direction: column;
        height: fit-content;
        min-height: 56px;
        padding: 6px 12px;
        align-items: flex-start;
      }

      .chips-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        width: 100%;
        margin-bottom: 4px;
      }

      .chip {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(0, 210, 255, 0.12);
        border: 1px solid rgba(0, 210, 255, 0.25);
        border-radius: 12px;
        padding: 2px 8px 2px 8px;
        font-size: 0.75rem;
        color: var(--primary-text-color, #e0e8ff);
      }

      .chip-delete {
        background: none;
        border: none;
        color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
        cursor: pointer;
        font-size: 0.7rem;
        padding: 0 2px;
        border-radius: 50%;
        transition: color 150ms, background 150ms;
      }

      .chip-delete:hover {
        color: var(--error-color, #ff4444);
        background: rgba(255, 68, 68, 0.12);
      }

      .input-group {
        width: 100%;
        padding: 8px 0 4px 0;
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
