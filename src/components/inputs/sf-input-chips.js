import {css, html} from 'lit';

import {defineCustomElement} from '../../helpers/utils/import.js';
import {SciFiInput} from './sf-input';

export class SciFiChipsInput extends SciFiInput {
  static get styles() {
    return super.styles.concat([
      css`
        .container {
          flex-direction: column;
          height: fit-content;
        }
        .input-group input {
          margin-top: 5px;
        }
        ul {
          list-style: none;
          padding: 0px;
          margin: 5px 0 0 0;
          display: inline-flex;
          align-self: flex-start;
          flex-wrap: wrap;
        }
        li {
          background: var(--secondary-light-alpha-color);
          color: white;
          border-radius: 15px;
          margin: 0 3px;
          font-size: var(--font-size-small);
          max-width: 70px;
          min-width: 40px;
          display: flex;
          padding: 3px;
        }
        li .delete {
          padding: 2px 4px;
          border-radius: 50%;
          font-size: var(--font-size-xsmall);
          color: var(--secondary-light-color);
        }
        li .delete:hover {
          color: var(--primary-light-color);
          background: var(--secondary-light-alpha-color);
          cursor: pointer;
        }
        li .chip-text {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `,
    ]);
  }

  static get properties() {
    let p = super.properties;
    delete p['value'];
    p['values'] = {type: Array};
    return p;
  }

  constructor() {
    super();
    this.values = this.values ? this.values : [];
  }

  render() {
    return html`
      <div class="container">
        <ul class="chips">
          ${this.__renderChips()}
        </ul>
        <div class="input-group">
          <input
            type="text"
            placeholder="Name"
            ?disabled=${this.disabled}
            @focusout="${this.__focusOut}"
          />
          <label for="name">${this.label}</label>
        </div>
      </div>
    `;
  }

  __focusOut(e) {
    if (e.srcElement.value && !this.values.includes(e.srcElement.value)) {
      this.__dispatchEvent(e, e.srcElement.value, 'add');
      e.srcElement.value = '';
    }
  }

  __renderChips() {
    return this.values.map(
      (v, id) =>
        html`<li>
          <span class="delete" @click="${(e) => this.__removeChip(e, id)}"
            >X</span
          >
          <span class="chip-text">${v}</span>
        </li>`
    );
  }

  __removeChip(e, id) {
    this.__dispatchEvent(e, id, 'remove');
    this.shadowRoot.querySelector('input').value = '';
  }
}

defineCustomElement('sci-fi-chips-input', SciFiChipsInput);
