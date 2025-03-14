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
          --btn-icon-disable-color: var(
            --disable-icon-color,
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
        .btn.disable sci-fi-icon {
          --icon-color: var(--btn-icon-disable-color);
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
      disable: {type: Boolean},
    };
  }

  constructor() {
    super();
    this.hasBorder = this.hasBorder ? this.hasBorder : false;
    this.icon = this.icon ? this.icon : '';
    this.disable = this.disable ? this.disable : false;
  }

  render() {
    return html`
      <div
        class="btn ${this.hasBorder ? 'btn-border' : ''} ${this.disable
          ? 'disable'
          : ''}"
        @click="${this.click}"
      >
        <sci-fi-icon icon=${this.icon}></sci-fi-icon>
      </div>
    `;
  }

  click(e) {
    if (this.disable) return;
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
