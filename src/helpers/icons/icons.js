import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import WEATHER_ICON_SET from './weather_iconset.js';

export function getWeatherIcon(weather) {
  let icon = weather;
  if (!WEATHER_ICON_SET[icon]) {
    console.info('Weather : ' + weather + ' cannot be found');
    icon = 'na';
  }
  return html`<div class="svg-container">
    ${unsafeHTML(WEATHER_ICON_SET[icon])}
  </div>`;
}
