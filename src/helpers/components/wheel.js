import {LitElement, css, html, nothing} from 'lit';

import common_style from '../common_style.js';
import {getIcon} from '../icons/icons.js';
import './tiles.js';

class SciFiWheel extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --item-font-size: var(--item-font-size, var(--font-size-small));
          --item--color: var(--item-color, var(--secondary-light-color));
          --wheel-text-color: var(
            --text-font-color,
            var(--secondary-light-color)
          );
        }
        .container {
          display: flex;
          flex-direction: column;
          row-gap: 10px;
          border: var(--border-width) solid var(--primary-bg-color);
          border-radius: var(--border-radius);
          padding: 10px;
        }
        .text {
          font-size: var(--font-size-normal);
          color: var(--wheel-text-color);
        }
        .core {
          display: flex;
          flex-direction: column;
          row-gap: 5px;
        }
        .slider {
          display: flex;
          flex-direction: column;
        }
        .slider .slider-item {
          display: flex;
          flex-direction: column;
          font-size: var(--item-font-size);
          color: var(--item--color);
          font-weight: bold;
          align-items: center;
        }
        .slider .slider-item.hide {
          display: none;
        }
        .slider .slider-item .svg-container {
          width: var(--icon-size, var(--icon-size-normal));
          height: var(--icon-size, var(--icon-size-normal));
          fill: var(--secondary-light-color);
          margin-bottom: 5px;
        }
        .slider .slider-item.on .svg-container {
          fill: var(--item--color);
        }
      `,
    ];
  }
  _selectedId; // private
  _items;

  static get properties() {
    return {
      items: {type: Array},
      selectedId: {type: String, attribute: 'selected-id'},
      text: {type: String},
    };
  }

  constructor() {
    super();
    this.items = this.items ? this.items : [];
    this.selectedId = this.selectedId ? this.selectedId : null;
    this.text = this.text ? this.text : null;
  }

  render() {
    return html`
      <div class="container">
        <div class="core">
          <sci-fi-button
            class="up"
            icon="mdi:menu-up-outline"
            @button-click=${(e) => this.__click(e, 'up')}
          ></sci-fi-button>
          <div class="slider" @click="${(e) => this.__click(e, null)}">
            ${this.__buildSliderContent()}
          </div>
          <sci-fi-button
            class="down"
            icon="mdi:menu-down-outline"
            @button-click=${(e) => this.__click(e, 'down')}
          ></sci-fi-button>
        </div>
        ${this.__displayText()}
      </div>
    `;
  }

  __displayText() {
    if (!this.text) return nothing;
    return html`<div class="text">${this.text}</div>`;
  }

  __buildSliderContent() {
    return this.items.map(
      (el) => html`
        <div
          class="slider-item ${el.id == this.selectedId
            ? 'show'
            : 'hide'} ${this.state}"
        >
          ${el.icon ? getIcon(el.icon) : ''}
          <div>${el.text}</div>
        </div>
      `
    );
  }

  __findNext(direction) {
    let item_id = this.items.findIndex((e) => e.id == this.selectedId);
    if (direction) {
      if (direction == 'up') {
        item_id = item_id + 1 >= this.items.length ? 0 : item_id + 1;
      } else {
        item_id = item_id - 1 < 0 ? this.items.length - 1 : item_id - 1;
      }
    }
    return this.items[item_id];
  }

  __click(e, direction) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent(direction ? 'wheel-change' : 'wheel-click', {
        bubbles: true,
        composed: true,
        detail: this.__findNext(direction),
      })
    );
  }
}

window.customElements.get('sci-fi-wheel') ||
  window.customElements.define('sci-fi-wheel', SciFiWheel);
