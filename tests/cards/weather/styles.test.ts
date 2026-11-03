// @vitest-environment happy-dom
import { expect, describe, it, afterEach, vi } from 'vitest';
import { CSSResult } from 'lit';
vi.mock('chart.js', () => {
  class DummyClass {}
  return {
    Chart: class {
      static register() {}
      update() {}
      destroy() {}
    },
    LineController: DummyClass,
    BarController: DummyClass,
    LineElement: DummyClass,
    BarElement: DummyClass,
    PointElement: DummyClass,
    LinearScale: DummyClass,
    CategoryScale: DummyClass,
    Filler: DummyClass,
    Tooltip: DummyClass,
  };
});

import '../../../src/cards/weather/sci-fi-weather.js';
import { SciFiWeatherCard } from '../../../src/cards/weather/sci-fi-weather.js';
import { weatherStyles } from '../../../src/cards/weather/styles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('weather styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: styles.ts exports an empty css`` or renames a class the card renders
  it('TC-BTG-U-30: weatherStyles is a non-empty CSSResult styling :host and two classes of the rendered card', async () => {
    const el = document.createElement('sci-fi-weather') as SciFiWeatherCard;
    (el as any).setConfig({ type: 'custom:sci-fi-weather', weather_entity: 'weather.home' });
    el.hass = makeMockHass({
      states: {
        'weather.home': makeMockEntity({ entity_id: 'weather.home', state: 'sunny', attributes: { temperature: 24, temperature_unit: '°C', friendly_name: 'Home' } }),
      },
    });
    el.hass.connection.subscribeMessage = async () => () => {};
    document.body.appendChild(el);
    await el.updateComplete;

    expect(weatherStyles).toBeInstanceOf(CSSResult);
    const css = weatherStyles.cssText;
    expect(css.replace(/\s/g, '')).not.toBe('');
    expect(css).toContain(':host');

    // Two class names read from the rendered shadow root, never typed here.
    const classes = Array.from(el.shadowRoot!.querySelectorAll('[class]'))
      .flatMap(node => Array.from(node.classList));
    const picked = Array.from(new Set(classes)).slice(0, 2);
    expect(picked.length).toBe(2);
    for (const cls of picked) {
      expect(css, `.${cls} must be styled`).toMatch(new RegExp(`\\.${cls}(?![\\w-])`));
    }
  });
});
