import {css, html} from 'lit';

import {ICONSET, getIcon} from '../../helpers/icons/icons.js';
import { SciFiDropdownInput } from './sf-input-dropdown.js';

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

window.customElements.get('sci-fi-dropdown-icon-input') ||
  window.customElements.define(
    'sci-fi-dropdown-icon-input',
    SciFiDropdownIconInput
  );