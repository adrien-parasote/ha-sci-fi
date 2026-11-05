// @vitest-environment happy-dom
/** Fix lot vague-2, O1 (bead ha-sci-fi-dcgo): weather icons of a card go through sf-icon, so two never share an SVG id. */
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { html, render } from 'lit';
import { weatherIcon } from '../../../src/components/sf-icon/weather-icon.js';

const settle = (): Promise<void> => new Promise((r) => setTimeout(r, 50));
const read = (rel: string): string => readFileSync(resolve(__dirname, '../../..', rel), 'utf8');

afterEach(() => { document.body.innerHTML = ''; });

describe('O1', () => {
  it('test_O1_two_weather_icons_of_one_card_have_unique_ids', async () => {
    // a card shadow root holding two of the same animated icon, as the forecast row does
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    render(html`${weatherIcon('lightning-day')}${weatherIcon('lightning-day')}`, root);
    await settle();
    const ids = Array.from(root.querySelectorAll('[id]')).map((e) => e.id);
    expect(ids.length).toBeGreaterThan(2);
    expect(new Set(ids).size, 'duplicate SVG id in one card').toBe(ids.length);
    expect(root.querySelectorAll('sf-icon')).toHaveLength(2);
  });

  it('test_O1_weather_icon_falls_back_in_order_and_renders_nothing_unknown', async () => {
    const root = document.createElement('div');
    render(html`${weatherIcon('no-such-icon', 'cloudy-day')}|${weatherIcon('no-such-icon')}`, root);
    expect(root.querySelector('sf-icon')?.getAttribute('icon')).toBe('sf:cloudy-day');
    expect(root.querySelectorAll('sf-icon')).toHaveLength(1);
  });

  it('test_O1_cards_render_no_bare_weather_template', () => {
    // lights and water no longer read the set; weather reads it only for the chart canvas (drawn as an image)
    expect(read('src/cards/lights/sci-fi-lights.ts')).not.toMatch(/WEATHER_ICON_SET/);
    expect(read('src/cards/water/sci-fi-water-management.ts')).not.toMatch(/WEATHER_ICON_SET/);
    const weather = read('src/cards/weather/sci-fi-weather.ts');
    expect(weather.match(/WEATHER_ICON_SET as any\)\[/g)).toHaveLength(2);
    expect(weather).toMatch(/const iconSvg = \(WEATHER_ICON_SET as any\)\[iconName\]/);
  });
});
