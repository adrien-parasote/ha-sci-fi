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
          --btn-space: var(--btn-padding, 10px);
        }
        .btn {
          display: flex;
          flex-direction: row;
          font-weight: bold;
          border: var(--border-width) solid var(--primary-bg-color);
          border-radius: var(--border-radius);
          font-size: var(--font-size-small);
          padding: var(--btn-space);
          align-items: center;
          text-transform: capitalize;
          min-width: 90px;
          height: fit-content;
          justify-content: left;
          column-gap: 10px;
          cursor: pointer;
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
        }
        .btn .label div:first-of-type {
          font-size: var(--font-size-xsmall);
          font-weight: normal;
          color: var(--title-text-color);
        }
        .btn sci-fi-icon {
          --icon-color: var(--btn-icon-color);
          --icon-width: var(--icon-size-small);
          --icon-height: var(--icon-size-small);
        }
      `,
    ];
  }

  static get properties() {
    return {
      icon: {type: String},
      title: {type: String},
      text: {type: String},
    };
  }

  constructor() {
    super();
    this.icon = this.icon ? this.icon : '';
    this.title = this.title ? this.title : '';
    this.text = this.text ? this.text : '';
  }

  render() {
    return this.displayBtn();
  }

  displayBtn() {
    return html`
      <div class="btn" @click="${this.click}">
        <sci-fi-icon icon=${this.icon}></sci-fi-icon>
        <div class="label">
          <div>${this.title}</div>
          <div>${this.text}</div>
        </div>
      </div>
    `;
  }
}

defineCustomElement('sci-fi-button-card', SciFiCardButton);
