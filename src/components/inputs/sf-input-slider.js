import {css, html, nothing} from 'lit';

import {getIcon} from '../../helpers/icons/icons.js';
import {defineCustomElement} from '../../helpers/utils/import.js';
import {SciFiInput} from './sf-input.js';

export class SciFiSlider extends SciFiInput {
  static get styles() {
    return super.styles.concat([
      css`
        .container {
          border-radius: 5px;
        }
        .container:focus-within {
          border: none;
        }
        .value {
          margin-top: 18px;
          margin-left: 10px;
        }
        input[type='range'] {
          -webkit-appearance: none;
        }
        input[type='range']:focus {
          outline: none;
        }
        input[type='range']::-webkit-slider-runnable-track {
          height: 8px;
          cursor: pointer;
          background: var(--secondary-light-alpha-color);
          border-radius: 5px;
        }
        input[type='range']::-webkit-slider-thumb {
          height: 15px;
          width: 15px;
          border-radius: 50%;
          background: var(--primary-light-color);
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -3.6px;
        }
        input[type='range']:focus::-webkit-slider-runnable-track {
          background: var(--secondary-light-alpha-color);
        }
      `,
    ]);
  }
  static get properties() {
    let p = super.properties;
    p['min'] = {type: Number};
    p['max'] = {type: Number};
    p['step'] = {type: Number};
    return p;
  }

  constructor() {
    super();
    this.min = this.min ? this.min : null;
    this.max = this.max ? this.max : null;
    this.step = this.step ? this.step : 1;
  }

  render() {
    return html`
      <div class="container">
        <div class="icon">${this.icon ? getIcon(this.icon) : nothing}</div>
        <div class="input-group">
          <input
            type="range"
            min="${this.min}"
            max="${this.max}"
            value="${this.value}"
            step="${this.step}"
            class="slider"
            @input=${this._changeValue}
          />
          <label for="name">${this.label}</label>
        </div>
        <div class="value">${this.value}</div>
      </div>
    `;
  }

  _changeValue(e) {
    this.__dispatchEvent(e, e.target.value);
  }
}

defineCustomElement('sci-fi-slider', SciFiSlider);
