import {css, html} from 'lit';

import common_style from '../../helpers/styles/common_style.js';
import {defineCustomElement} from '../../helpers/utils/import.js';
import {SciFiButton} from './sf-button.js';

export class SciFiCardButton extends SciFiButton {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          --title-text-color: var(--title-color, var(--secondary-light-color));
          --label-text-color: var(--label-color, var(--secondary-light-color));
          --btn-icon-color: var(
            --primary-icon-color,
            var(--primary-light-color)
          );
          --btn-icon-size: var(--icon-size, var(--icon-size-small));
          --btn-space: var(--btn-padding, 10px);
          --btn-font-weight: var(--font-weight, bold);
          --btn-font-size: var(--font-size, var(--font-size-small));
          --btn-border: var(
            --border,
            var(--border-width) solid var(--primary-bg-color)
          );
          --btn-min-width: var(--min-width, 90px);
          --btn-label-text-alignment: var(--text-align, start);
          --label-alone: var(--margin-top-label-alone, 5px);
        }
        .btn {
          display: flex;
          flex-direction: row;
          font-weight: var(--btn-font-weight);
          border: var(--btn-border);
          border-radius: var(--border-radius);
          font-size: var(--btn-font-size);
          padding: var(--btn-space);
          align-items: center;
          text-transform: capitalize;
          min-width: var(--btn-min-width);
          justify-content: left;
          column-gap: 10px;
          cursor: pointer;
        }
        .btn.col {
          flex-direction: column;
        }
        .btn:hover {
          background-color: var(--secondary-light-light-alpha-color);
        }
        .btn .label {
          display: flex;
          flex: 1;
          flex-direction: column;
          row-gap: 5px;
          color: var(--label-text-color);
          text-align: var(--btn-label-text-alignment);
        }
        .btn .label div:first-of-type {
          font-size: var(--font-size-xsmall);
          font-weight: normal;
          color: var(--title-text-color);
        }
        .btn .label-alone {
          margin-top: var(--label-alone);
        }
        .btn sci-fi-icon {
          --icon-color: var(--btn-icon-color);
          --icon-width: var(--btn-icon-size);
          --icon-height: var(--btn-icon-size);
        }
      `,
    ];
  }

  static get properties() {
    let p = super.properties;
    p['title'] = {type: String};
    p['text'] = {type: String};
    p['noTitle'] = {type: Boolean, attribute: 'no-title'};
    return p;
  }

  constructor() {
    super();
    this.title = this.title ? this.title : '';
    this.text = this.text ? this.text : '';
    this.noTitle = this.noTitle ? this.noTitle : false;
  }

  displayBtn() {
    return html`
      <div class="btn ${this.noTitle ? 'col' : ''}" @click="${this.click}">
        <sci-fi-icon icon=${this.icon}></sci-fi-icon>
        ${this.__displayLabel()}
      </div>
    `;
  }

  __displayLabel() {
    if (this.noTitle) {
      return html`<div class="label label-alone">${this.text}</div>`;
    }
    return html`<div class="label">
      <div>${this.title}</div>
      <div>${this.text}</div>
    </div>`;
  }
}

defineCustomElement('sci-fi-button-card', SciFiCardButton);
