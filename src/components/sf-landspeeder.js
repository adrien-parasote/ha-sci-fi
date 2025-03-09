import {LitElement, css, html, nothing} from 'lit';

import common_style from '../helpers/styles/common_style.js';
import {defineCustomElement} from '../helpers/utils/import.js';

class SciFiLandspeeder extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: flex;
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
    return html` TODO ${this.vehicle.name}`;
  }
}

defineCustomElement('sci-fi-landspeeder', SciFiLandspeeder);
