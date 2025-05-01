import {LitElement, css, html} from 'lit';

import common_style from '../../helpers/styles/common_style.js';
import {defineCustomElement} from '../../helpers/utils/import.js';

export class SciFiButton extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --btn-icon-color: var(
            --primary-icon-color,
            var(--primary-light-color)
          );
          --btn-icon-size: var(--btn-size, var(--icon-size-normal));
          --btn-icon-disabled-color: var(
            --disabled-icon-color,
            var(--primary-dark-color)
          );
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
          border-radius: var(--border-radius);
          border: var(--border-width) solid var(--primary-light-color);
          width: var(--icon-size-small);
          height: var(--icon-size-small);
          fill: var(--primary-light-color);
          padding: 5px;
        }
        .btn-rounded {
          border: 50%;
        }
        .btn sci-fi-icon {
          --icon-color: var(--btn-icon-color);
          --icon-width: var(--btn-icon-size);
          --icon-height: var(--btn-icon-size);
          cursor: pointer;
        }
        .btn-border sci-fi-icon {
          --icon-width: var(--icon-size-small);
          --icon-height: var(--icon-size-small);
        }
        .btn.disabled sci-fi-icon {
          --icon-color: var(--btn-icon-disabled-color);
          cursor: unset;
        }
        .btn-border:hover {
          background-color: var(--secondary-light-alpha-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      hasBorder: {type: Boolean, attribute: 'has-border'},
      icon: {type: String},
      disabled: {type: Boolean},
      rounded: {type: Boolean},
    };
  }

  constructor() {
    super();
    this.hasBorder = this.hasBorder ? this.hasBorder : false;
    this.icon = this.icon ? this.icon : '';
    this.disabled = this.disabled ? this.disabled : false;
    this.rounded = this.rounded ? this.rounded : false;
  }

  render() {
    return this.displayBtn();
  }

  displayBtn() {
    return html`
    <div
      class="btn ${this.hasBorder ? 'btn-border' : ''} ${this.rounded ? 'btn-rounded' : ''} ${this.disabled
        ? 'disabled'
        : ''}"
      @click="${this.click}"
    >
      <sci-fi-icon icon=${this.icon}></sci-fi-icon>
    </div>
  `;
  }

  click(e) {
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

defineCustomElement('sci-fi-button', SciFiButton);
