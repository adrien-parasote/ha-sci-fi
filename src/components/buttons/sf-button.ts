import { LitElement, css, html, type TemplateResult, type CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sciFiCommonStyles } from '../../styles/common.js';

@customElement('sf-button')
export class SciFiButton extends LitElement {
  static override styles: CSSResultGroup = [
    sciFiCommonStyles,
    css`
      :host {
        display: block; /* needed for margin:auto centering to work in flex parents */
        --btn-icon-color: var(--sf-primary-icon-color, var(--sf-primary));
        --btn-icon-size: var(--btn-size, var(--sf-icon-size-md, 24px));
        --btn-icon-disabled-color: var(--sf-disabled-icon-color, var(--sf-primary-dim));
      }
      .btn {
        background-color: transparent;
        border: none;
        margin: auto;
      }
      .btn-border {
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.7) 0%,
          rgba(0, 0, 0, 0.2) 100%
        );
        border-radius: var(--sf-border-radius, 8px);
        border: var(--sf-border-width, 1px) solid var(--sf-primary);
        width: var(--sf-icon-size-sm, 16px);
        height: var(--sf-icon-size-sm, 16px);
        fill: var(--sf-primary);
        padding: 5px;
      }
      .btn-rounded {
        border: 50%;
      }
      .btn sf-icon {
        --icon-color: var(--btn-icon-color);
        --icon-width: var(--btn-icon-size);
        --icon-height: var(--btn-icon-size);
        cursor: pointer;
      }
      .btn-border sf-icon {
        --icon-width: var(--sf-icon-size-sm, 16px);
        --icon-height: var(--sf-icon-size-sm, 16px);
      }
      .btn.disabled sf-icon {
        --icon-color: var(--btn-icon-disabled-color);
        cursor: unset;
      }
      .btn-border:hover {
        background-color: var(--sf-bg-tertiary);
      }
    `,
  ];

  @property({ type: Boolean, attribute: 'has-border' })
  hasBorder = false;

  @property({ type: String })
  icon = '';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  rounded = false;

  protected override render(): TemplateResult {
    return this.displayBtn();
  }

  displayBtn(): TemplateResult {
    return html`
      <div
        class="btn ${this.hasBorder ? 'btn-border' : ''} ${this.rounded
          ? 'btn-rounded'
          : ''} ${this.disabled ? 'disabled' : ''}"
        @click="${this.clickBtn}"
      >
        <sf-icon .icon=${this.icon}></sf-icon>
      </div>
    `;
  }

  clickBtn(e: Event): void {
    if (this.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('button-click', {
        bubbles: true,
        composed: true,
        detail: {
          element: this,
        },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sf-button': SciFiButton;
  }
}
