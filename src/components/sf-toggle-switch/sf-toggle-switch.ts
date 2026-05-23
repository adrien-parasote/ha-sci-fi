/**
 * <sf-toggle-switch> — Styled boolean toggle switch component
 * Dispatches 'sf-toggle-change' with composed:true for Lovelace config editors.
 */

import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('sf-toggle-switch')
export class SfToggleSwitch extends LitElement {
  @property({ type: Boolean })
  checked = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }

    .track {
      width: 36px;
      height: 20px;
      border-radius: 10px;
      background: rgba(224, 232, 255, 0.2);
      position: relative;
      transition: background 200ms ease;
      flex-shrink: 0;
    }

    :host([checked]) .track {
      background: var(--primary-color, #00d2ff);
    }

    .thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }

    :host([checked]) .thumb {
      transform: translateX(16px);
    }

    .label {
      font-size: 0.875rem;
      color: var(--primary-text-color, #e0e8ff);
      user-select: none;
    }
  `;

  private _handleClick(): void {
    if (this.disabled) return;
    const newValue = !this.checked;
    this.checked = newValue;
    this.dispatchEvent(
      new CustomEvent<{ checked: boolean }>('sf-toggle-change', {
        bubbles: true,
        composed: true,
        detail: { checked: newValue },
      })
    );
  }

  override render(): TemplateResult {
    return html`
      <div
        class="track"
        role="switch"
        aria-checked="${this.checked}"
        aria-label="${this.label}"
        tabindex="0"
        @click="${() => this._handleClick()}"
        @keydown="${(e: KeyboardEvent) => e.key === ' ' || e.key === 'Enter' ? this._handleClick() : undefined}"
      >
        <div class="thumb"></div>
      </div>
      ${this.label ? html`<span class="label">${this.label}</span>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-toggle-switch': SfToggleSwitch;
  }
}
