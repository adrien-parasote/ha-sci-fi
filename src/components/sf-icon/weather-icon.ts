/**
 * An animated weather icon rendered through <sf-icon>, never as a bare template.
 *
 * A WEATHER_ICON_SET template dropped straight into a card's shadow DOM keeps
 * its literal SVG ids, so two of them in one card resolve each other's
 * `xlink:href` / `url(#…)` / SMIL syncbases (bead ha-sci-fi-dcgo). <sf-icon>
 * scopes the ids of each instance (svg-id-scope.ts).
 */
import { html, nothing, type TemplateResult } from 'lit';
import WEATHER_ICON_SET from './data/sf-weather-icons.js';
import './sf-icon.js';

/** `<sf-icon icon="sf:<key>">` for the first of `keys` the weather set holds, or nothing. */
export function weatherIcon(...keys: string[]): TemplateResult | typeof nothing {
  const key = keys.find((k) => Object.prototype.hasOwnProperty.call(WEATHER_ICON_SET, k));
  return key ? html`<sf-icon icon="sf:${key}"></sf-icon>` : nothing;
}

/** Whether the weather set holds `key`. */
export function isWeatherIcon(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(WEATHER_ICON_SET, key);
}
