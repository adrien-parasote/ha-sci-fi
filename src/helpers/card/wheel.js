import {LitElement, css, html} from 'lit';

import common_style from '../common_style.js';
import {getIcon} from '../icons/icons.js';
import './tiles.js';

export class SciFiWheel extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          position: relative;
          --width: 100px;
        }
        .container sci-fi-hexa-tile {
          --hexa-width: var(--width);
          --hexa-height: calc(var(--width) * 1.1547);
        }
        .up {
          position: relative;
          top: -5px;
        }
        .down {
          position: relative;
          bottom: 0;
        }
        .slider {
          display: flex;
          flex-direction: column;
          width: var(--width);
          margin-bottom: 5px;
        }
        .slider .slider-item {
          display: flex;
          flex-direction: column;
          font-size: var(--font-size-small);
          align-items: center;
        }
        .slider .slider-item.hide {
          display: none;
        }
        .slider .slider-item .svg-container {
          width: var(--icon-size-normal);
          height: var(--icon-size-normal);
          fill: var(--secondary-light-color);
          margin-bottom: 5px;
        }
        .slider .slider-item.on .svg-container {
          fill: var(--primary-light-color);
        }
      `,
    ];
  }
  _selectedId; // private

  static get properties() {
    return {
      items: {type: Array},
      selectedId: {type: String, attribute: 'selected-id'},
      state: {type: String},
    };
  }

  constructor() {
    super();
    this.items = this.items ? this.items : [];
    this.selectedId = this.selectedId ? this.selectedId : null;
    this.state = this.state ? this.state : 'off';
  }

  render() {
    return html`
      <div class="container">
        <sci-fi-hexa-tile active state=${this.state}>
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
        </sci-fi-hexa-tile>
      </div>
    `;
  }

  __buildSliderContent() {
    return this.items.map((el) => {
      return html`
        <div
          class="slider-item ${el.id == this.selectedId
            ? 'show'
            : 'hide'} ${this.state}"
        >
          ${getIcon(el.icon)}
          <div>${el.name}</div>
        </div>
      `;
    });
  }

  __findNext(direction) {
    let item_id = this.items.findIndex((e) => e.id === this.selectedId);
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