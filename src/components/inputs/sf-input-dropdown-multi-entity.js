import {css, html, nothing} from 'lit';

import {getIcon} from '../../helpers/icons/icons.js';
import {SciFiDropdownEntityInput} from './sf-input-dropdown-entity.js';

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
        <div class="icon">${this.icon ? getIcon(this.icon) : nothing}</div>
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

window.customElements.get('sci-fi-dropdown-multi-entity-input') ||
  window.customElements.define(
    'sci-fi-dropdown-multi-entity-input',
    SciFiDropdownMultiEntitiesInput
  );
