import {css, html, nothing} from 'lit';

import {getIcon} from '../../helpers/icons/icons.js';
import {SciFiInput} from './sf-input.js';

export class SciFiColorPicker extends SciFiInput {
  static get styles() {
    return super.styles.concat([
      css`
        .container {
          border-radius: 5px;
        }
        .container:focus-within {
          border: none;
        }
        .input-group label {
          transform: translateY(-106%) scale(0.75);
          color: var(--primary-light-color);
        }
      `,
    ]);
  }

  render() {
    return html`
      <div class="container">
        <div class="icon">${this.icon ? getIcon(this.icon) : nothing}</div>
        <div class="input-group">
          <label for="name">${this.label}</label>
          <input
            type="color"
            value="${this.value}"
            @input=${this._changeValue}
          />
        </div>
      </div>
    `;
  }

  _changeValue(e) {
    this.__dispatchEvent(e, e.target.value);
  }
}

window.customElements.get('sci-fi-color-picker') ||
  window.customElements.define('sci-fi-color-picker', SciFiColorPicker);
