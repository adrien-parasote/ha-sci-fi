import {css, html} from 'lit';

import {getIcon} from '../../helpers/icons/icons.js';
import { SciFiDropdownInput } from './sf-input-dropdown.js';

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

window.customElements.get('sci-fi-dropdown-entity-input') ||
  window.customElements.define(
    'sci-fi-dropdown-entity-input',
    SciFiDropdownEntityInput
  );
