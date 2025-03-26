import {LitElement, css, html} from 'lit';

import common_style from '../helpers/styles/common_style.js';

export class SciFiPerson extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          width: fit-content;
          margin: 5px;
        }
        .avatar {
          border: 1px solid var(--secondary-light-color);
          box-shadow: 0 0 5px 1px var(--secondary-light-color);
          border-radius: 50%;
          width: var(--custom-avatar-size, var(--icon-size-title));
          height: var(--custom-avatar-size, var(--icon-size-title));
          position: relative;
        }
        .icon-container {
          background-color: var(--secondary-light-color-opacity);
          border-radius: 50%;
          width: var(--custom-state-size, var(--icon-size-small));
          height: var(--custom-state-size, var(--icon-size-small));
          position: absolute;
          top: -5px;
          right: -10px;
          text-align: center;
          align-content: end;
        }
        sci-fi-icon {
          --icon-color: var(--primary-light-color);
          --icon-width: var(--icon-size-small);
          --icon-height: var(--icon-size-small);
        }
        img {
          width: auto;
          height: 100%;
          border-radius: 50%;
        }
      `,
    ];
  }

  static get properties() {
    return {
      user: {type: Object},
    };
  }

  constructor() {
    super();
    this.user = this.user ? this.user : null;
  }

  render() {
    return html`
      <div class="avatar">
        <img src="${this.user.picture ? this.user.picture : ''}" />
        <div class="icon-container">
          <sci-fi-icon icon=${this.user.state_icon}></sci-fi-icon>
        </div>
      </div>
    `;
  }
}

window.customElements.get('sci-fi-person') ||
  window.customElements.define('sci-fi-person', SciFiPerson);
