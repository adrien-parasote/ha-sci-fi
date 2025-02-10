import {css, html} from 'lit';

import {ICONSET} from '../../helpers/icons/icons.js';
import {defineCustomElement} from '../../helpers/utils/import.js';
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
      <sci-fi-icon icon=${item.name}></sci-fi-icon>
      <div class="name">${item.name}</div>
    </div>`;
  }
}

defineCustomElement('sci-fi-dropdown-icon-input', SciFiDropdownIconInput);
