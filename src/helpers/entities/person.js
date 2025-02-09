import {LitElement, css, html} from 'lit';

import {getIcon} from '../icons/icons.js';
import common_style from '../styles/common_style.js';

const STATE_HOME = 'home';

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
        .svg-container {
          fill: var(--primary-light-color);
          width: var(--icon-size-small);
          height: var(--icon-size-small);
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
      entityId: {type: String, attribute: 'entity-id'},
      state: {type: String},
      picture: {type: String},
    };
  }

  constructor() {
    super();
    this.entityId = this.entityId ? this.entityId : null;
    this.state = this.state ? this.state : STATE_HOME;
    this.picture = this.picture ? this.picture : null;
  }

  render() {
    return html`
      <div class="avatar">
        <img src="${this.picture ? this.picture : ''}" />
        <div class="icon-container">
          ${getIcon(
            this.state == STATE_HOME
              ? 'mdi:home-outline'
              : 'mdi:home-off-outline'
          )}
        </div>
      </div>
    `;
  }
}

window.customElements.get('sci-fi-person') ||
  window.customElements.define('sci-fi-person', SciFiPerson);
