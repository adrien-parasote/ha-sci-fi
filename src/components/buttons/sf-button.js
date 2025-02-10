import {LitElement, css, html} from 'lit';

import {getIcon} from '../../helpers/icons/icons.js';
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
        .btn .svg-container {
          fill: var(--btn-icon-color);
          width: var(--icon-size-normal);
          height: var(--icon-size-normal);
        }
        .btn-border .svg-container {
          width: var(--icon-size-small);
          height: var(--icon-size-small);
        }
        .btn:hover .svg-container {
          cursor: pointer;
        }
        .btn.disable .svg-container {
          fill: var(--btn-icon-disable-color);
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
        ${getIcon(this.icon)}
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
