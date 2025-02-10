import {css, html} from 'lit';

import {getIcon} from '../../helpers/icons/icons.js';
import {SciFiCardButton} from './sf-button-card.js';

export class SciFiCardSelectButton extends SciFiCardButton {
  static get styles() {
    return super.styles.concat([
      css`
        :host {
          position: relative;
        }
        .items.hide {
          display: none;
        }
        .items {
          position: absolute;
          transform: translateY(-100%);
          display: flex;
          background-color: black;
          flex-direction: column;
          min-height: fit-content;
          border: var(--border-width) solid var(--primary-bg-color);
          border-bottom: none;
          border-top-left-radius: var(--border-radius);
          border-top-right-radius: var(--border-radius);
          color: var(--secondary-light-color);
          font-size: var(--font-size-small);
          cursor: pointer;
        }
        .items.left {
          bottom: 0;
          -webkit-transform: translateX(-100%);
          transform: translateX(-100%);
          border-radius: var(--border-radius);
          border-bottom: var(--border-width) solid var(--primary-bg-color);
        }
        .items.left.down {
          top: 0;
        }
        .items .item {
          display: flex;
          flex-direction: row;
          column-gap: 5px;
          padding: 5px;
          border-bottom: var(--border-width) solid var(--primary-bg-color);
          min-width: 90px;
          text-transform: capitalize;
          align-items: center;
        }
        .items .item:hover {
          background-color: var(--secondary-light-alpha-color);
        }
        .items .item:last-of-type {
          border-bottom: none;
        }
        .items .item svg {
          fill: var(--secondary-light-color);
          width: var(--icon-size-small);
          height: var(--icon-size-small);
        }
      `,
    ]);
  }

  static get properties() {
    let p = super.properties;
    p['items'] = {type: Array};
    p['position'] = {type: String};
    return p;
  }

  constructor() {
    super();
    this.items = this.items ? this.items : [];
    this.position = this.position ? this.position : 'top';
  }

  render() {
    return html` ${this.displayBtn()} ${this.__displayItems()} `;
  }

  __displayItems() {
    return html`
      <div class="items hide ${this.position}">
        ${this.items.map((item, idx) => {
          return html`<div
            class="item"
            style="color:${item.color
              ? item.color
              : 'var(--secondary-light-color)'}"
            @click="${(e) => this.__select(e, idx)}"
          >
            ${getIcon(item.icon, item.color)}
            <div>${item.text}</div>
          </div>`;
        })}
      </div>
    `;
  }

  __select(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    this.click();
    this.dispatchEvent(
      new CustomEvent('button-select', {
        bubbles: true,
        composed: true,
        detail: this.items[idx],
      })
    );
  }

  click() {
    this.shadowRoot.querySelector('.items').classList.toggle('hide');
  }
}

window.customElements.get('sci-fi-button-select-card') ||
  window.customElements.define(
    'sci-fi-button-select-card',
    SciFiCardSelectButton
  );
