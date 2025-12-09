import {LitElement, css, html, nothing} from 'lit';

import common_style from '../helpers/styles/common_style.js';
import {defineCustomElement} from '../helpers/utils/import.js';

export class SciFiTabsCard extends LitElement {
  static get properties() {
    return {
      count: {type: Number},
      active: {type: Number},
    };
  }

  constructor() {
    super();
    this.count = this.count ? this.count : 1;
    this.active = this.active ? this.active : 1;
  }

  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: flex;
          flex-direction: column;
        }
        .toolbar {
          display: flex;
          flex: 1;
          flex-direction: row;
        }
        .group {
          display: flex;
          flex-direction: row;
          flex: 1;
        }
        .content {
          border-width: var(--border-width);
          border-style: solid;
          border-color: var(--secondary-bg-color);
          padding: 10px;
        }
        .actions {
          display: flex;
          flex-direction: row;
          column-gap: 5px;
        }
      `,
    ];
  }

  render() {
    return html`
      <div class="toolbar">
        <div class="group">${this.__renderTabsGroup()}</div>
        <div class="actions">
          ${this.__renderDelete()}
          <sci-fi-button
            icon="mdi:plus"
            @button-click=${this.__addTab}
          ></sci-fi-button>
        </div>
      </div>
      <div class="content"><slot></slot></div>
    `;
  }
  __renderDelete() {
    if (this.count == 1) return nothing;
    return html`<sci-fi-button
      icon="mdi:delete-outline"
      @button-click=${this.__removeTab}
    ></sci-fi-button> `;
  }

  __removeTab(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('tab-delete', {
        bubbles: true,
        composed: true,
        detail: {id: this.active},
      })
    );
  }

  __renderTabsGroup() {
    return Array.from(Array(this.count).keys()).map((n) => {
      return html`<sci-fi-tab-card
        title=${n + 1}
        element-id=${n}
        .active="${n == this.active}"
        @tab-tapped="${this.__tapped}"
      ></sci-fi-tab-card>`;
    });
  }

  __tapped(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.detail.id != this.active) {
      this.dispatchEvent(
        new CustomEvent('tab-select', {
          bubbles: true,
          composed: true,
          detail: {id: e.detail.id},
        })
      );
    }
  }

  __addTab(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('tab-add', {
        bubbles: true,
        composed: true,
        detail: {},
      })
    );
  }
}

export class SciFiTabCard extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: inline-flex;
          align-items: center;
          font: inherit;
          white-space: nowrap;
          user-select: none;
          cursor: pointer;
          color: var(--primary-light-alpha-color);
        }
        :host(:hover) {
          color: var(--primary-light-color);
        }
        div {
          padding: 1em 1.5em;
        }
        .active {
          color: var(--primary-light-color);
          border-bottom: var(--border-width) solid var(--primary-light-color);
        }
      `,
    ];
  }

  static get properties() {
    return {
      elementId: {type: Number, attribute: 'element-id'},
      title: {type: String},
      active: {type: Boolean},
    };
  }

  render() {
    return html`<div
      class="${this.active ? 'active' : ''}"
      @click="${this.__tapped}"
    >
      ${this.title}
    </div>`;
  }

  __tapped(e) {
    this.dispatchEvent(
      new CustomEvent('tab-tapped', {
        bubbles: true,
        composed: true,
        detail: {id: this.elementId},
      })
    );
  }
}

defineCustomElement('sci-fi-tabs-card', SciFiTabsCard);
defineCustomElement('sci-fi-tab-card', SciFiTabCard);
