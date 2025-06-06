import {css, html} from 'lit';

import {defineCustomElement} from '../../helpers/utils/import.js';
import {getAllIconNames} from '../icons/sf-icon.js';
import {SciFiDropdownInput} from './sf-input-dropdown.js';

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
        .dropdown-menu .dropdown-item sci-fi-icon {
          --icon-color: var(--secondary-light-color);
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
    getAllIconNames()
      .then((icons) => {
        this.items = icons;
      })
      .catch((e) => {
        this.items = [];
        console.error(`Error fetching icons : ${e}`);
      });
  }

  __dropdownItems(value) {
    if (!value) {
      this.__filter_items = [];
      return;
    }
    if (this.disabledFilter) {
      this.__filter_items = JSON.parse(JSON.stringify(this._items));
    } else {
      this.__filter_items = this._items.filter((item) => {
        return item.name.toUpperCase().includes(value.toUpperCase());
      });
    }
  }

  __renderItem(item) {
    return html`<div
      class="dropdown-item"
      @click="${(e) => this.__selectedItem(e, item.name)}"
    >
      <sci-fi-icon icon=${item.name}></sci-fi-icon>
      <div class="name">${item.name}</div>
    </div>`;
  }
}

defineCustomElement('sci-fi-dropdown-icon-input', SciFiDropdownIconInput);
