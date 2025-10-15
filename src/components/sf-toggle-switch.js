import {LitElement, css, html} from 'lit';

import common_style from '../helpers/styles/common_style.js';
import {defineCustomElement} from '../helpers/utils/import.js';

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
          width: 100%;
        }
        .title {
          font-size: var(--font-size-normal);
          flex: 1;
        }
        .title.hide {
          display: none;
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
      disabled: {type: Boolean},
      icon: {type: String},
    };
  }

  constructor() {
    super();
    this.elementId = this.elementId ? this.elementId : 'in';
    this.label = this.label ? this.label : '';
    this.checked = this.checked ? this.checked : false;
    this.disabled = this.disabled ? this.disabled : false;
    this.icon = this.icon ? this.icon : null;
  }

  render() {
    return html`
      <div class="container">
        ${this.__renderIcon()}
        <div class="title ${this.label == '' ? 'hide' : 'show'}">
          ${this.label}
        </div>
        <label class="switch">
          <input
            type="checkbox"
            ?checked=${this.checked}
            ?disabled=${this.disabled}
            @change="${this.__toggle}"
          />
          <span class="slider"></span>
        </label>
      </div>
    `;
  }

  __renderIcon() {
    if (!this.icon) return html``;
    return html`<sci-fi-icon icon="${this.icon}"></sci-fi-icon>`;
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

defineCustomElement('sci-fi-toggle', SciFiToggleSwitch);
