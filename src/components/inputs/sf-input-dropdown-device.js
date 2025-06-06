import {css, html} from 'lit';

import {defineCustomElement} from '../../helpers/utils/import.js';
import {SciFiDropdownEntityInput} from './sf-input-dropdown-entity.js';

export class SciFiDropdownDeviceInput extends SciFiDropdownEntityInput {
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

  __dropdownItems(value) {
    if (!value) {
      this.__filter_items = [];
      return;
    }
    if (this.disabledFilter) {
      this.__filter_items = JSON.parse(JSON.stringify(this._items));
    } else {
      this.__filter_items = this._items.filter((device) => {
        return (
          device.name.toUpperCase().includes(value.toUpperCase()) ||
          device.name_by_user.toUpperCase().includes(value.toUpperCase())
        );
      });
    }
  }

  __renderItem(item) {
    return html`<div
      class="dropdown-item"
      @click="${(e) => this.__selectedItem(e, item)}"
    >
      <sci-fi-icon icon="mdi:information-off-outline"></sci-fi-icon>
      <div class="info">
        <div class="name">
          ${item.name_by_user ? item.name_by_user : item.name}
        </div>
        <div class="element_id">${item.id}</div>
      </div>
    </div>`;
  }

  __selectedItem(e, item) {
    this.__dispatchEvent(e, item);
    this.shadowRoot.querySelector('input').value = item.name_by_user
      ? item.name_by_user
      : item.name;
    this.shadowRoot.querySelector('.container').classList.toggle('open');
    this.shadowRoot.querySelector('.dropdown-menu').classList.toggle('open');
  }
}

defineCustomElement('sci-fi-dropdown-device-input', SciFiDropdownDeviceInput);
