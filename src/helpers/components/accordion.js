import {LitElement, css, html} from 'lit';

import common_style from '../common_style.js';
import {getIcon} from '../icons/icons.js';

export class SciFiAccordionCard extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        .accordion {
          flex: 1;
          border: var(--border-width) solid var(--secondary-light-color);
          overflow: hidden;
          border-radius: var(--border-radius);
          width: 100%;
        }
        .row {
          display: flex;
          flex-direction: row;
          flex: 1;
        }
        .column-gap {
          gap: 10px;
        }
        .tab {
          position: relative;
        }
        .tab input {
          position: absolute;
          opacity: 0;
          z-index: -1;
        }
        .content {
          max-height: 0;
          overflow: hidden;
          transition: all 0.35s;
        }
        .content > div {
          padding: 10px;
          margin: 0;
          display: flex;
          flex-direction: column;
          row-gap: 10px;
        }
        .tab input:checked ~ .content {
          max-height: fit-content;
        }
        .label {
          display: flex;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.2) 100%
          );
          background-color: var(--secondary-light-alpha-color);
          cursor: pointer;
          justify-content: space-between;
          padding: 10px;
          text-transform: uppercase;
          font-size: var(--font-size-small);
        }
        .label > div {
          align-items: center;
          color: var(--secondary-light-color);
        }
        .label:hover > div {
          color: var(--primary-light-color);
        }
        .label::after {
          content: '❯';
          width: 1em;
          height: 1em;
          text-align: center;
          align-self: center;
          transform: rotate(90deg);
          transition: all 0.35s;
        }
        .tab input:checked + .label::after {
          transform: rotate(270deg);
        }
        .tab input:not(:checked) + .label:hover::after {
          animation: bounce 0.5s infinite;
          -webkit-animation: bounce 0.5s infinite;
        }
        .label .svg-container {
          width: var(--icon-size-small);
          height: var(--icon-size-small);
          fill: var(--secondary-light-color);
        }
        .label:hover .svg-container {
          fill: var(--primary-light-color);
        }
        .delete {
          margin-top: 6px;
        }
        @-webkit-keyframes bounce {
          25% {
            transform: rotate(90deg) translate(0.25rem);
          }
          75% {
            transform: rotate(90deg) translate(-0.25rem);
          }
        }
        @keyframes bounce {
          25% {
            transform: rotate(90deg) translate(0.25rem);
          }
          75% {
            transform: rotate(90deg) translate(-0.25rem);
          }
        }
      `,
    ];
  }

  static get properties() {
    return {
      elementId: {type: String, attribute: 'element-id'},
      title: {type: String},
      open: {type: Boolean},
      icon: {type: String},
      deletable: {type: Boolean},
    };
  }

  constructor() {
    super();
    this.elementId = this.elementId ? this.elementId : 'ac';
    this.title = this.title ? this.title : '';
    this.open = this.open ? this.open : false;
    this.deletable = this.deletable ? this.deletable : false;
    this.icon = this.icon ? this.icon : null;
  }

  render() {
    return html` <div class="row column-gap">
      <section class="accordion">
        <div class="tab">
          <input
            type="checkbox"
            name="accordion-1"
            id="${this.elementId}"
            ?checked=${this.open}
          />
          <label for="${this.elementId}" class="label">
            <div class="row column-gap">
              ${this.icon ? getIcon(this.icon) : ''}
              <div>${this.title}</div>
            </div>
          </label>
          <div class="content">
            <div><slot></slot></div>
          </div>
        </div>
      </section>
      ${this.deletable ? this.__renderDeleteIcon() : ''}
    </div>`;
  }

  __renderDeleteIcon() {
    return html`
      <div class="delete">
        <sci-fi-button
          icon="mdi:delete-outline"
          @button-click="${this.__delete}"
        ></sci-fi-button>
      </div>
    `;
  }

  __delete(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('accordion-delete', {
        bubbles: true,
        composed: true,
        detail: {
          id: this.elementId,
          type: 'delete',
        },
      })
    );
  }
}

// Define elements
const elements = {
  'sci-fi-accordion-card': SciFiAccordionCard,
};
Object.entries(elements).forEach(([key, value]) => {
  window.customElements.get(key) || window.customElements.define(key, value);
});
