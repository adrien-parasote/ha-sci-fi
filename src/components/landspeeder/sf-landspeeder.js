import {LitElement, css, html, nothing} from 'lit';

import common_style from '../../helpers/styles/common_style.js';
import {defineCustomElement} from '../../helpers/utils/import.js';
import top_speeder from './data/top.js';

class SciFiLandspeeder extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: flex;
          height: 100%;
        }
        .content {
          width: 250px;
          margin: auto;
        }
      `,
    ];
  }

  static get properties() {
    return {
      vehicle: {type: Object},
    };
  }

  constructor() {
    super();
    this.vehicle = this.vehicle ? this.vehicle : null;
  }

  render() {
    if (!this.vehicle) nothing;
    return html`<div class="content">${top_speeder}</div>`;
  }
}

defineCustomElement('sci-fi-landspeeder', SciFiLandspeeder);
