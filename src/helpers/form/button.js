import {LitElement, css, html} from 'lit';

import common_style from '../common_style.js';
import {getIcon} from '../icons/icons.js';

export class SciFiButton extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
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
          fill: var(--secondary-light-color);
          width: var(--icon-size-normal);
          height: var(--icon-size-normal);
        }
        .btn-border .svg-container {
          width: var(--icon-size-small);
          height: var(--icon-size-small);
        }
        .btn:hover .svg-container {
          cursor: pointer;
          fill: var(--primary-light-color);
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
    };
  }

  constructor() {
    super();
    this.hasBorder = this.hasBorder ? this.hasBorder : false;
    this.icon = this.icon ? this.icon : '';
  }

  render() {
    return html`
      <div
        class="btn ${this.hasBorder ? 'btn-border' : ''}"
        @click="${this.click}"
      >
        ${getIcon(this.icon)}
      </div>
    `;
  }

  click(e) {
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

export class SciFiToggleSwitch extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        .container {
          display: flex;
          flex-direction: row;
          column-gap: 10px;
          align-items: center;
        }
        .title {
          font-size: var(--font-size-normal);
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 24px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--secondary-bg-color);
          -webkit-transition: 0.4s;
          transition: 0.4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: '';
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: var(--secondary-light-color);
          -webkit-transition: 0.4s;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--secondary-light-color);
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(16px);
          -ms-transform: translateX(16px);
          transform: translateX(16px);
          background-color: var(--primary-light-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      elementId: {type: String, attribute: 'element-id'},
      label: {type: String},
      checked: {type: Boolean},
    };
  }

  constructor() {
    super();
    this.elementId = this.elementId ? this.elementId : 'in';
    this.label = this.label ? this.label : '';
    this.checked = this.checked ? this.checked : false;
  }

  render() {
    return html`
      <div class="container">
        <div class="title">${this.label}</div>
        <label class="switch">
          <input
            type="checkbox"
            ?checked=${this.checked}
            @change="${this.__toggle}"
          />
          <span class="slider"></span>
        </label>
      </div>
    `;
  }

  __toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('toggle-change', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.elementId,
          value: this.shadowRoot.querySelector('input').checked,
        },
      })
    );
  }
}
