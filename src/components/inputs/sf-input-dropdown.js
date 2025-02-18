import {css, html, nothing} from 'lit';

import {defineCustomElement} from '../../helpers/utils/import.js';
import {SciFiInput} from './sf-input.js';

export class SciFiDropdownInput extends SciFiInput {
  static get styles() {
    return super.styles.concat([
      css`
        :host {
          position: relative;
          --secondary-light-alpha-color: rgba(102, 156, 210, 0.2);
        }
        .container:after {
          content: '❯';
          width: 1em;
          height: 1em;
          align-self: self-end;
          margin-bottom: 10px;
          transform: rotate(90deg);
          transition: all 0.35s;
          margin-left: 5px;
        }
        .container.open:after {
          transform: rotate(270deg);
          margin-bottom: 15px;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background: var(--primary-bg-color);
          z-index: 1000;
          display: none;
          text-align: left;
          max-height: 160px;
          overflow: auto;
        }
        .dropdown-menu.open {
          display: block;
        }
        .dropdown-menu .dropdown-item {
          font-size: var(--font-size-normal);
          padding: 10px 20px;
        }
        .dropdown-menu .dropdown-item:hover {
          cursor: pointer;
          color: var(--primary-light-color);
          background-color: var(--secondary-light-alpha-color);
        }
      `,
    ]);
  }

  static get properties() {
    let p = super.properties;
    p['items'] = {type: Array};
    return p;
  }

  // Private
  __filter_items;

  constructor() {
    super();
    this.items = this.items ? this.items : [];
  }

  set items(items) {
    this._items = items;
    this.__filter_items = JSON.parse(JSON.stringify(items));
  }

  render() {
    this.__dropdownItems(this.value);
    return html`
      <div class="container">
        <div class="icon">${this.renderIcon(this.icon)}</div>
        <div class="input-group">
          <input
            type="text"
            placeholder="Name"
            value=${this.value}
            ?disabled=${this.disabled}
            @focusin=${this.__focus}
            @keyup=${this.__filterKeyUp}
          />
          <label for="name">${this.label}</label>
          ${this.value
            ? html`<span class="remove" @click="${this.__cleanInput}"
                ><sci-fi-icon icon="mdi:close"></sci-fi-icon
              ></span>`
            : nothing}
        </div>
      </div>
      <div class="dropdown-menu">
        ${this.__filter_items.map((item) => this.__renderItem(item))}
      </div>
    `;
  }

  __dropdownItems(value) {
    if(!value){
      this.__filter_items = JSON.parse(JSON.stringify(this._items));
      return;
    }
    this.__filter_items = this._items.filter((item) => {
      return item.toUpperCase().includes(value.toUpperCase());
    });
  }

  __filterKeyUp(e) {
    if (e.key !== 'Enter') {
      this.value = e.srcElement.value;
      this.shadowRoot.querySelector('.dropdown-menu').classList.add('open');
    }
  }

  __renderItem(item) {
    return html`<div
      class="dropdown-item"
      @click="${(e) => this.__selectedItem(e, item)}"
    >
      ${item}
    </div>`;
  }

  __selectedItem(e, item) {
    this.__dispatchEvent(e, item);
    this.shadowRoot.querySelector('input').value = item;
    this.shadowRoot.querySelector('.container').classList.toggle('open');
    this.shadowRoot.querySelector('.dropdown-menu').classList.toggle('open');
  }

  __focus() {
    this.shadowRoot.querySelector('.container').classList.toggle('open');
    this.shadowRoot.querySelector('.dropdown-menu').classList.toggle('open');
  }
}

defineCustomElement('sci-fi-dropdown-input', SciFiDropdownInput);
