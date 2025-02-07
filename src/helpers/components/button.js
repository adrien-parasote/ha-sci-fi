import {LitElement, css, html} from 'lit';

import common_style from '../common_style.js';
import {getIcon} from '../icons/icons.js';

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

export class SciFiCardButton extends SciFiButton {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --title-text-color: var(--title-color, var(--secondary-light-color));
          --label-text-color: var(--label-color, var(--secondary-light-color));
          --btn-icon-color: var(
            --primary-icon-color,
            var(--primary-light-color)
          );
          --btn-space: var(--btn-padding, 10px);
        }
        .btn {
          display: flex;
          flex-direction: row;
          font-weight: bold;
          border: var(--border-width) solid var(--primary-bg-color);
          border-radius: var(--border-radius);
          font-size: var(--font-size-small);
          padding: var(--btn-space);
          align-items: center;
          text-transform: capitalize;
          min-width: 90px;
          height: fit-content;
          justify-content: left;
          column-gap: 10px;
          cursor: pointer;
        }
        .btn:hover {
          background-color: var(--secondary-light-light-alpha-color);
        }
        .btn .label {
          display: flex;
          flex: 1;
          flex-direction: column;
          row-gap: 5px;
          color: var(--label-text-color);
        }
        .btn .label div:first-of-type {
          font-size: var(--font-size-xsmall);
          font-weight: normal;
          color: var(--title-text-color);
        }
        .btn svg {
          fill: var(--btn-icon-color);
          width: var(--icon-size-small);
          height: var(--icon-size-small);
        }
      `,
    ];
  }

  static get properties() {
    return {
      icon: {type: String},
      title: {type: String},
      text: {type: String},
    };
  }

  constructor() {
    super();
    this.icon = this.icon ? this.icon : '';
    this.title = this.title ? this.title : '';
    this.text = this.text ? this.text : '';
  }

  render() {
    return this.displayBtn();
  }

  displayBtn() {
    return html`
      <div class="btn" @click="${this.click}">
        ${getIcon(this.icon)}
        <div class="label">
          <div>${this.title}</div>
          <div>${this.text}</div>
        </div>
      </div>
    `;
  }
}

export class SciFiCardSelectButton extends SciFiCardButton {
  static get styles() {
    return super.styles.concat([
      css`
        :host {
          position: relative;
        }
        .items.hide {
          display: none;
        }
        .items {
          position: absolute;
          transform: translateY(-100%);
          display: flex;
          background-color: black;
          flex-direction: column;
          min-height: fit-content;
          border: var(--border-width) solid var(--primary-bg-color);
          border-bottom: none;
          border-top-left-radius: var(--border-radius);
          border-top-right-radius: var(--border-radius);
          color: var(--secondary-light-color);
          font-size: var(--font-size-small);
          cursor: pointer;
        }
        .items.left {
          bottom: 0;
          -webkit-transform: translateX(-100%);
          transform: translateX(-100%);
          border-radius: var(--border-radius);
          border-bottom: var(--border-width) solid var(--primary-bg-color);
        }
        .items.left.down {
          top: 0;
        }
        .items .item {
          display: flex;
          flex-direction: row;
          column-gap: 5px;
          padding: 5px;
          border-bottom: var(--border-width) solid var(--primary-bg-color);
          min-width: 90px;
          text-transform: capitalize;
          align-items: center;
        }
        .items .item:hover {
          background-color: var(--secondary-light-alpha-color);
        }
        .items .item:last-of-type {
          border-bottom: none;
        }
        .items .item svg {
          fill: var(--secondary-light-color);
          width: var(--icon-size-small);
          height: var(--icon-size-small);
        }
      `,
    ]);
  }

  static get properties() {
    let p = super.properties;
    p['items'] = {type: Array};
    p['position'] = {type: String};
    return p;
  }

  constructor() {
    super();
    this.items = this.items ? this.items : [];
    this.position = this.position ? this.position : 'top';
  }

  render() {
    return html` ${this.displayBtn()} ${this.__displayItems()} `;
  }

  __displayItems() {
    return html`
      <div class="items hide ${this.position}">
        ${this.items.map((item, idx) => {
          return html`<div
            class="item"
            style="color:${item.color
              ? item.color
              : 'var(--secondary-light-color)'}"
            @click="${(e) => this.__select(e, idx)}"
          >
            ${getIcon(item.icon, item.color)}
            <div>${item.text}</div>
          </div>`;
        })}
      </div>
    `;
  }

  __select(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    this.click();
    this.dispatchEvent(
      new CustomEvent('button-select', {
        bubbles: true,
        composed: true,
        detail: this.items[idx],
      })
    );
  }

  click() {
    this.shadowRoot.querySelector('.items').classList.toggle('hide');
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

// Define elements
const elements = {
  'sci-fi-button': SciFiButton,
  'sci-fi-button-card': SciFiCardButton,
  'sci-fi-button-select-card': SciFiCardSelectButton,
  'sci-fi-toggle': SciFiToggleSwitch,
};
Object.entries(elements).forEach(([key, value]) => {
  window.customElements.get(key) || window.customElements.define(key, value);
});
