import * as mdi from '@mdi/js';
import {html} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

import CUSTOM_ICON_SET from './iconset.js';
import WEATHER_ICON_SET from './weather_iconset.js';

let SVG_ICONSET = {};
// MDI ICONS
Object.keys(mdi).forEach((k) => {
  const ha_name =
    k.substring(0, 3) +
    ':' +
    k
      .substring(3, k.length)
      .split(/(?=[A-Z0-9])/)
      .map((v) => v.toLowerCase())
      .join('-');
  SVG_ICONSET[ha_name] = {
    name: ha_name,
    path: mdi[k],
  };
});
// Add custom icon
export const ICONSET = Object.assign({}, SVG_ICONSET, CUSTOM_ICON_SET);

export function getIcon(name) {
  let icon = name;
  if (!ICONSET[icon]) {
    console.info('Icon : ' + name + ' cannot be found');
    icon = 'mdi:alert';
  }
  return html`
    <div class="svg-container">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="${ICONSET[icon].path}" />
      </svg>
    </div>
  `;
}

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
