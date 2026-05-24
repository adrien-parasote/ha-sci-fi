/**
 * <sf-editor-input> — Base text/number input field for card editors.
 *
 * Dispatches 'input-update' with { id, kind, value } on user input.
 * All other editor inputs extend this component.
 *
 * Spec 10 § Editor Input Components
 */

import { LitElement, html, css, nothing, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../sf-icon/sf-icon.js';

/** Payload dispatched by all editor input components. */
export interface InputUpdateDetail {
  id: string;
  kind: string;
  value: string;
  type?: 'add' | 'remove';
}

@customElement('sf-editor-input')
export class SfEditorInput extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: String }) icon = '';
  @property({ type: String }) value = '';
  @property({ attribute: 'element-id', type: String }) elementId = '';
  @property({ type: String }) kind = '';
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) type = 'text';
  @property({ type: String }) placeholder = '';

  static override styles: CSSResultGroup = css`
    :host {
      display: block;
      width: 100%;
    }

    .container {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(0, 210, 255, 0.2);
      border-radius: 8px;
      padding: 0 12px;
      min-height: 56px;
      transition: border-color 200ms;
      box-sizing: border-box;
      width: 100%;
    }

    .container:focus-within {
      border-color: var(--primary-color, #00d2ff);
    }

    .container.has-icon {
      padding-left: 40px;
    }

    .icon-slot {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
      pointer-events: none;
    }

    .input-group {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 18px 0 6px 0;
    }

    label {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      font-size: 0.875rem;
      color: var(--secondary-text-color, rgba(224, 232, 255, 0.6));
      pointer-events: none;
      transition: all 200ms cubic-bezier(0, 0, 0.2, 1);
      transform-origin: left top;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 90%;
    }

    input:focus ~ label,
    input:not(:placeholder-shown) ~ label,
    .has-value label {
      top: 8px;
      transform: translateY(0) scale(0.75);
      color: var(--primary-color, #00d2ff);
    }

    input {
      background: none;
      border: none;
      outline: none;
      color: var(--primary-text-color, #e0e8ff);
      font-size: 0.875rem;
      width: 100%;
      padding: 0;
      margin-top: 5px;
      caret-color: var(--primary-color, #00d2ff);
    }

    input:disabled {
      color: var(--disabled-text-color, rgba(224, 232, 255, 0.3));
    }

    input[type='color'] {
      width: 36px;
      height: 28px;
      padding: 0;
      cursor: pointer;
      border-radius: 4px;
    }
  `;

  protected _onInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this._dispatch(input.value);
  }

  protected _dispatch(value: string, type?: 'add' | 'remove'): void {
    const detail: InputUpdateDetail = {
      id: this.elementId,
      kind: this.kind,
      value,
      ...(type !== undefined ? { type } : {}),
    };
    this.dispatchEvent(
      new CustomEvent<InputUpdateDetail>('input-update', {
        bubbles: true,
        composed: true,
        detail,
      })
    );
  }

  protected renderIcon(): TemplateResult | typeof nothing {
    if (!this.icon) return nothing;
    return html`
      <div class="icon-slot">
        <sf-icon icon="${this.icon}" style="--icon-width:18px;--icon-height:18px;"></sf-icon>
      </div>
    `;
  }

  override render(): TemplateResult {
    const hasValue = this.value !== '' && this.value !== undefined;
    return html`
      <div class="container ${this.icon ? 'has-icon' : ''} ${hasValue ? 'has-value' : ''}">
        ${this.renderIcon()}
        <div class="input-group">
          <input
            .type="${this.type}"
            .value="${this.value}"
            placeholder=" "
            ?disabled="${this.disabled}"
            @input="${this._onInput}"
          />
          <label>${this.label}</label>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-editor-input': SfEditorInput;
  }
}
