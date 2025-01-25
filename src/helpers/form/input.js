import {LitElement, css, html} from 'lit';

import common_style from '../common_style.js';
import {ICONSET, getIcon} from '../icons/icons.js';

export class SciFiInput extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --icon-color: var(--input-icon-color, white);
          color: var(--secondary-light-color);
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
          background: var(--primary-bg-color);
          height: 58px;
        }
        .container:focus-within {
          border-bottom: var(--border-width) solid var(--primary-light-color);
        }
        .icon .svg-container {
          width: var(--icon-size-normal);
          height: var(--icon-size-normal);
          fill: var(--icon-color);
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
          color: var(--secondary-light-color);
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
          color: white;
        }
        .input-group input:disabled {
          color: var(--secondary-light-color);
        }
        .input-group input:focus + label,
        .input-group input:not(:placeholder-shown) + label {
          transform: translateY(-106%) scale(0.75);
          color: var(--primary-light-color);
        }
        .input-group .remove {
          position: absolute;
          right: 0;
          top: 50%;
        }
        .input-group .remove:hover {
          cursor: pointer;
        }
        .input-group .remove .svg-container {
          width: var(--icon-size-small);
          height: var(--icon-size-small);
          fill: var(--secondary-light-color);
        }
        .input-group .remove:hover .svg-container {
          fill: var(--primary-light-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      elementId: {type: String, attribute: 'element-id'},
      kind: {type: String},
      label: {type: String},
      icon: {type: String},
      value: {type: String},
      disabled: {type: Boolean},
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
  }

  render() {
    return html`
      <div class="container">
        <div class="icon">${this.icon ? getIcon(this.icon) : ''}</div>
        <div class="input-group">
          <input
            type="text"
            placeholder="Name"
            value=${this.value}
            ?disabled=${this.disabled}
            @focusout=${this.__focusOut}
          />
          <label for="name">${this.label}</label>
          ${this.value && !this.disabled
            ? html`<span class="remove" @click="${this.__cleanInput}"
                >${getIcon('mdi:close')}</span
              >`
            : ''}
        </div>
      </div>
    `;
  }

  __cleanInput(e) {
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

export class SciFiChipsInput extends SciFiInput {
  static get styles() {
    return super.styles.concat([
      css`
        .container {
          flex-direction: column;
          height: fit-content;
        }
        .input-group input {
          margin-top: 5px;
        }
        ul {
          list-style: none;
          padding: 0px;
          margin: 5px 0 0 0;
          display: inline-flex;
          align-self: flex-start;
          flex-wrap: wrap;
        }
        li {
          background: var(--secondary-light-alpha-color);
          color: white;
          border-radius: 15px;
          margin: 0 3px;
          padding: 4px 5px 5px 10px;
          font-size: var(--font-size-small);
        }
        li .delete {
          margin-left: 5px;
          padding: 2px 4px;
          border-radius: 50%;
          font-size: var(--font-size-xsmall);
          color: var(--secondary-light-color);
        }
        li .delete:hover {
          color: var(--primary-light-color);
          background: var(--secondary-light-alpha-color);
          cursor: pointer;
        }
      `,
    ]);
  }

  static get properties() {
    let p = super.properties;
    delete p['value'];
    p['values'] = {type: Array};
    return p;
  }

  constructor() {
    super();
    this.values = this.values ? this.values : [];
  }

  render() {
    return html`
      <div class="container">
        <ul class="chips">
          ${this.__renderChips()}
        </ul>
        <div class="input-group">
          <input
            type="text"
            placeholder="Name"
            ?disabled=${this.disabled}
            @focusout="${this.__focusOut}"
          />
          <label for="name">${this.label}</label>
        </div>
      </div>
    `;
  }

  __focusOut(e) {
    if (e.srcElement.value && !this.values.includes(e.srcElement.value)) {
      this.__dispatchEvent(e, e.srcElement.value, 'add');
      e.srcElement.value = '';
    }
  }

  __renderChips() {
    return this.values.map(
      (v, id) =>
        html`<li>
          <span>${v}</span
          ><span class="delete" @click="${(e) => this.__removeChip(e, id)}"
            >X</span
          >
        </li>`
    );
  }

  __removeChip(e, id) {
    this.__dispatchEvent(e, id, 'remove');
    this.shadowRoot.querySelector('input').value = '';
  }
}

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
    return html`
      <div class="container">
        <div class="icon">${this.icon ? getIcon(this.icon) : ''}</div>
        <div class="input-group">
          <input
            type="text"
            placeholder="Name"
            value=${this.value}
            ?disabled=${this.disabled}
            @focusin=${this.__focus}
            @keyup=${this.__filter}
          />
          <label for="name">${this.label}</label>
          ${this.value
            ? html`<span class="remove" @click="${this.__cleanInput}"
                >${getIcon('mdi:close')}</span
              >`
            : ''}
        </div>
      </div>
      <div class="dropdown-menu">
        ${this.__filter_items.map((item) => this.__renderItem(item))}
      </div>
    `;
  }

  __filter(e) {
    if (e.key !== 'Enter' && e.srcElement.value) {
      this.__filter_items = this._items.filter((item) => {
        return item.toUpperCase().includes(e.srcElement.value.toUpperCase());
      });
      this.requestUpdate();
    } else if (!e.srcElement.value) {
      this.__filter_items = JSON.parse(JSON.stringify(this._items));
      this.requestUpdate();
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

export class SciFiDropdownEntityInput extends SciFiDropdownInput {
  static get styles() {
    return super.styles.concat([
      css`
        .dropdown-menu .dropdown-item {
          display: flex;
          flex-direction: row;
          column-gap: 20px;
          justify-content: center;
        }
        .dropdown-menu .dropdown-item .svg-container {
          width: var(--icon-size-normal);
          height: var(--icon-size-normal);
          fill: var(--secondary-light-color);
        }
        .dropdown-menu .dropdown-item .info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .dropdown-menu .dropdown-item .name {
          color: var(--primary-light-color);
          font-size: var(--font-size-small);
        }
        .dropdown-menu .dropdown-item .element_id {
          color: var(--secondary-light-color);
          font-size: var(--font-size-xsmall);
        }
      `,
    ]);
  }

  __filter(e) {
    if (e.key !== 'Enter' && e.srcElement.value) {
      this.__filter_items = this._items.filter((entity) => {
        return entity.entity_id
          .toUpperCase()
          .includes(e.srcElement.value.toUpperCase());
      });
      this.requestUpdate();
    } else if (!e.srcElement.value) {
      this.__filter_items = JSON.parse(JSON.stringify(this._items));
      this.requestUpdate();
    }
  }

  __renderItem(item) {
    const iconName = item.attributes.icon
      ? item.attributes.icon
      : 'mdi:information-off-outline';
    return html`<div
      class="dropdown-item"
      @click="${(e) => this.__selectedItem(e, item.entity_id)}"
    >
      ${getIcon(iconName)}
      <div class="info">
        <div class="name">${item.attributes.friendly_name}</div>
        <div class="element_id">${item.entity_id}</div>
      </div>
    </div>`;
  }

  __selectedItem(e, item) {
    this.__dispatchEvent(e, item);
    this.shadowRoot.querySelector('input').value = item;
    this.shadowRoot.querySelector('.container').classList.toggle('open');
    this.shadowRoot.querySelector('.dropdown-menu').classList.toggle('open');
  }
}

export class SciFiDropdownIconInput extends SciFiDropdownInput {
  static get styles() {
    return super.styles.concat([
      css`
        .dropdown-menu .dropdown-item {
          display: flex;
          flex-direction: row;
          column-gap: 20px;
          justify-content: center;
        }
        .dropdown-menu .dropdown-item .svg-container {
          width: var(--icon-size-normal);
          height: var(--icon-size-normal);
          fill: var(--secondary-light-color);
        }
        .dropdown-menu .dropdown-item .name {
          color: var(--primary-light-color);
          font-size: var(--font-size-small);
          flex: 1;
          align-content: center;
        }
      `,
    ]);
  }

  constructor() {
    super();
    this.items = Object.values(ICONSET);
  }

  __filter(e) {
    if (e.key !== 'Enter' && e.srcElement.value) {
      this.__filter_items = this._items.filter((item) => {
        return item.name
          .toUpperCase()
          .includes(e.srcElement.value.toUpperCase());
      });
      this.requestUpdate();
    } else if (!e.srcElement.value) {
      this.__filter_items = [];
      this.requestUpdate();
    }
  }

  __renderItem(item) {
    return html`<div
      class="dropdown-item"
      @click="${(e) => this.__selectedItem(e, item.name)}"
    >
      ${getIcon(item.name)}
      <div class="name">${item.name}</div>
    </div>`;
  }
}

export class SciFiDropdownMultiEntitiesInput extends SciFiDropdownEntityInput {
  static get styles() {
    return super.styles.concat([
      css`
        :host {
          position: relative;
        }
        .container {
          flex-direction: column;
          height: fit-content;
          min-height: 58px;
        }
        .input-group input {
          margin-top: 5px;
        }
        .container:after {
          position: absolute;
          right: 16px;
          bottom: 10px;
          content: '❯';
          width: 1em;
          height: 1em;
          transform: rotate(90deg);
          transition: all 0.35s;
          align-self: unset;
          margin-bottom: unset;
          margin-left: unset;
        }
        .container.open:after {
          transform: rotate(270deg);
          right: 18px;
          bottom: 3px;
        }
        ul {
          list-style: none;
          padding: 0px;
          margin: 5px 0 0 0;
          display: inline-flex;
          align-self: flex-start;
          flex-wrap: wrap;
        }
        li {
          background: var(--secondary-light-alpha-color);
          color: white;
          border-radius: 15px;
          margin: 3px;
          padding: 4px 5px 5px 10px;
          font-size: var(--font-size-small);
        }
        li .delete {
          margin-left: 5px;
          padding: 2px 4px;
          border-radius: 50%;
          font-size: var(--font-size-xsmall);
          color: var(--secondary-light-color);
        }
        li .delete:hover {
          color: var(--primary-light-color);
          background: var(--secondary-light-alpha-color);
          cursor: pointer;
        }
      `,
    ]);
  }

  static get properties() {
    let p = super.properties;
    delete p['value'];
    p['values'] = {type: Array};
    return p;
  }

  constructor() {
    super();
    this.values = this.values ? this.values : new Array();
  }

  set items(items) {
    this._items = items;
    this.__filter_items = JSON.parse(JSON.stringify(items));
  }

  __removeSelectedValues() {
    this.__filter_items = this.__filter_items.filter((entity) => {
      return !this.values.includes(entity.entity_id);
    });
  }

  render() {
    this.__removeSelectedValues();
    return html`
      <div class="container">
        <ul class="chips">
          ${this.__renderChips()}
        </ul>
        <div class="icon">${this.icon ? getIcon(this.icon) : ''}</div>
        <div class="input-group">
          <input
            type="text"
            placeholder="Name"
            ?disabled=${this.disabled}
            @focusin=${this.__focus}
            @keyup=${this.__filter}
          />
          <label for="name">${this.label}</label>
        </div>
      </div>
      <div class="dropdown-menu">
        ${this.__filter_items.map((item) => this.__renderItem(item))}
      </div>
    `;
  }

  __renderChips() {
    return this.values.map((v, id) => {
      return html`<li>
        <span>${v}</span
        ><span class="delete" @click="${(e) => this.__removeChip(e, id)}"
          >X</span
        >
      </li>`;
    });
  }

  __removeChip(e, id) {
    this.__dispatchEvent(e, id, 'remove');
    this.shadowRoot.querySelector('input').value = '';
  }

  __selectedItem(e, item) {
    super.__selectedItem(e, item);
    this.shadowRoot.querySelector('input').value = '';
  }
}

export class SciFiSlider extends SciFiInput {
  static get styles() {
    return super.styles.concat([
      css`
        .container {
          border-radius: 5px;
        }
        .container:focus-within {
          border: none;
        }
        .value {
          margin-top: 18px;
          margin-left: 10px;
        }
        input[type='range'] {
          -webkit-appearance: none;
        }
        input[type='range']:focus {
          outline: none;
        }
        input[type='range']::-webkit-slider-runnable-track {
          height: 8px;
          cursor: pointer;
          background: var(--secondary-light-alpha-color);
          border-radius: 5px;
        }
        input[type='range']::-webkit-slider-thumb {
          height: 15px;
          width: 15px;
          border-radius: 50%;
          background: var(--primary-light-color);
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -3.6px;
        }
        input[type='range']:focus::-webkit-slider-runnable-track {
          background: var(--secondary-light-alpha-color);
        }
      `,
    ]);
  }
  static get properties() {
    let p = super.properties;
    p['min'] = {type: Number};
    p['max'] = {type: Number};
    return p;
  }

  constructor() {
    super();
    this.min = this.min ? this.min : null;
    this.max = this.max ? this.max : null;
  }

  render() {
    return html`
      <div class="container">
        <div class="icon">${this.icon ? getIcon(this.icon) : ''}</div>
        <div class="input-group">
          <input
            type="range"
            min="${this.min}"
            max="${this.max}"
            value="${this.value}"
            class="slider"
            @input=${this._changeValue}
          />
          <label for="name">${this.label}</label>
        </div>
        <div class="value">${this.value}</div>
      </div>
    `;
  }

  _changeValue(e) {
    this.__dispatchEvent(e, e.target.value);
  }
}

export class SciFiColorPicker extends SciFiInput {
  static get styles() {
    return super.styles.concat([
      css`
        .container {
          border-radius: 5px;
        }
        .container:focus-within {
          border: none;
        }
        .input-group label {
          transform: translateY(-106%) scale(0.75);
          color: var(--primary-light-color);
        }
      `,
    ]);
  }

  render() {
    return html`
      <div class="container">
        <div class="icon">${this.icon ? getIcon(this.icon) : ''}</div>
        <div class="input-group">
          <label for="name">${this.label}</label>
          <input
            type="color"
            value="${this.value}"
            @input=${this._changeValue}
          />
        </div>
      </div>
    `;
  }

  _changeValue(e) {
    this.__dispatchEvent(e, e.target.value);
  }
}
