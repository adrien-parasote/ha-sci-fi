import {LitElement, css, svg, nothing} from 'lit';
import WEATHER_ICONSET from './data/sf-weather-icons.js';
import common_style from '../../helpers/styles/common_style.js';
import {defineCustomElement} from '../../helpers/utils/import.js';
import './sf-svg-icon.js';

class SciFiWeatherIcon extends LitElement {
  static get styles() {
    return [
      common_style,
      css`
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          vertical-align: center;
          width: var(--weather-icon-width, var(--icon-size-normal));
          height: var(--weather-icon-height, var(--icon-size-normal));
        }
        svg {
          width: 100%;
          height: 100%;
        }
      `,
    ];
  }

  static get properties() {
    return {
      icon: {type: String},
    };
  }

  constructor() {
    super();
    this.icon = this.icon ? this.icon : null;
  }

  render() {
    if (!this.icon) return nothing;
    let icon = WEATHER_ICONSET[this.icon];
    if(!icon){
      console.info('Weather icon : ' + this.icon + ' cannot be found');
      icon = WEATHER_ICONSET['na'];
    }
    return svg`
      <svg
        xmlns="http://www.w3.org/2000/svg" 
        xmlns:xlink="http://www.w3.org/1999/xlink" 
        viewBox="${icon.viewBox}">
        ${icon.content}
      </svg>`;
  }
}

defineCustomElement('sci-fi-weather-icon', SciFiWeatherIcon);
