import {LitElement, css, html, nothing} from 'lit';

import common_style from '../../helpers/styles/common_style.js';
import {defineCustomElement} from '../../helpers/utils/import.js';

export class SciFiInput extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --input-icon--color: var(--input-icon-color, white);
          color: var(--secondary-light-color);
          --background-color: var(
            --input-background-color,
            var(--primary-bg-color)
          );
          --disabled-text-color: var(
            --input-disabled-text-color,
            var(--secondary-light-color)
          );
          --label-text-color: var(
            --input-label-text-color,
            var(--secondary-light-color)
          );
          --label-active-text-color: var(
            --input-label-active-text-color,
            var(--primary-light-color)
          );
          --input--color: var(--input-text-color, white);
        }
        input::placeholder {
          opacity: 0;
        }
        .container {
          display: flex;
          flex-direction: row;
          flex: 1;
          align-items: center;
          border-top-left-radius: var(--border-radius);
          border-top-right-radius: var(--border-radius);
          padding: 0 16px;
          background: var(--background-color);
          height: 58px;
        }
        .container:focus-within {
          border-bottom: var(--border-width) solid var(--primary-light-color);
        }
        .icon sci-fi-icon {
          --icon-color: var(--input-icon--color);
          margin-right: 10px;
        }
        .input-group {
          position: relative;
          height: 100%;
          width: 100%;
          align-content: end;
        }
        .input-group label {
          position: absolute;
          pointer-events: none;
          color: var(--label-text-color);
          font-size: var(--font-size-small);
          top: 38%;
          padding-inline: 0.3em;
          transition: transform 200ms;
          transform-origin: left;
        }
        .input-group input {
          border: none;
          margin-bottom: 5px;
          width: 100%;
          outline: none;
          height: 28px;
          background: none;
          font-size: var(--font-size-normal);
          caret-color: var(--primary-light-color);
          color: var(--input--color);
        }
        .input-group input:disabled {
          color: var(--disabled-text-color);
        }
        .input-group input:focus + label,
        .input-group input:not(:placeholder-shown) + label {
          transform: translateY(-95%) scale(0.75);
          color: var(--label-active-text-color);
        }
        .input-group .remove {
          position: absolute;
          right: 0;
          top: 50%;
        }
        .input-group .remove:hover {
          cursor: pointer;
        }
        .input-group .remove sci-fi-icon {
          --icon-color: var(--secondary-light-color);
        }
        .input-group .remove:hover sci-fi-icon {
          --icon-color: var(--primary-light-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      elementId: {type: String, attribute: 'element-id'},
      noCloseBox: {type: Boolean, attribute: 'no-close-box'},
      kind: {type: String},
      label: {type: String},
      icon: {type: String},
      value: {type: String},
      disabled: {type: Boolean},
      type: {type: String},
    };
  }

  constructor() {
    super();
    this.elementId = this.elementId ? this.elementId : 'in';
    this.icon = this.icon ? this.icon : null;
    this.kind = this.kind ? this.kind : null;
    this.label = this.label ? this.label : '';
    this.value = this.value ? this.value : null;
    this.disabled = this.disabled ? this.disabled : false;
    this.noCloseBox = this.noCloseBox ? this.noCloseBox : false;
    this.type = this.type ? this.type : 'text';
  }

  renderIcon(icon) {
    if (!icon) return nothing;
    return html`<sci-fi-icon icon=${icon}></sci-fi-icon>`;
  }

  render() {
    return html`
      <div class="container">
        <div class="icon">${this.renderIcon(this.icon)}</div>
        <div class="input-group">
          <input
            type=${this.type}
            placeholder="Name"
            .value="${this.value}"
            ?disabled=${this.disabled}
            @focusout=${this.__focusOut}
          />
          <label for="name">${this.label}</label>
          ${this.value && !this.disabled && !this.noCloseBox
            ? html`<span class="remove" @click="${this.__cleanInput}"
                ><sci-fi-icon icon="mdi:close"></sci-fi-icon
              ></span>`
            : ''}
        </div>
      </div>
    `;
  }

  __cleanInput(e) {
    this.shadowRoot.querySelector('input').value = '';
    this.__dispatchEvent(e, '');
  }

  __focusOut(e) {
    this.__dispatchEvent(e, e.srcElement.value);
  }

  __dispatchEvent(e, value, type = 'update', eventName = 'input-update') {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail: {
          id: this.elementId,
          kind: this.kind,
          value: value,
          type: type,
        },
      })
    );
  }
}

defineCustomElement('sci-fi-input', SciFiInput);
