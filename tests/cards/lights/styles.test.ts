// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';
import '../../../src/cards/lights/sci-fi-lights.js';
import { SciFiLightsCard } from '../../../src/cards/lights/sci-fi-lights.js';
import { lightStyles } from '../../../src/cards/lights/styles.js';
import { makeMockHass, makeMockFloor, makeMockArea, makeMockEntityEntry, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('lights styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: empty export; rename a class in the sheet
  it('TC-BTG-U-27 — lightStyles is a non-empty CSSResult with :host and the classes of the rendered card', async () => {
    expect(lightStyles).to.be.instanceOf(CSSResult);
    const css = lightStyles.cssText;
    expect(css.replace(/\s+/g, '')).not.to.equal('');
    expect(css).to.include(':host');

    // Class names read from the rendered card, never typed from memory
    const el = document.createElement('sci-fi-lights') as SciFiLightsCard;
    (el as any).setConfig(SciFiLightsCard.getStubConfig());
    el.hass = makeMockHass({
      floors: { ground: makeMockFloor({ floor_id: 'ground', level: 0 }) },
      areas: { living: makeMockArea({ area_id: 'living', floor_id: 'ground' }) },
      entities: { 'light.salon': makeMockEntityEntry({ entity_id: 'light.salon', area_id: 'living', domain: 'light' }) },
      states: { 'light.salon': makeMockEntity({ entity_id: 'light.salon', state: 'on' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const root = el.shadowRoot!;
    const picked = Array.from(new Set(Array.from(root.querySelectorAll('[class]')).flatMap(n => Array.from(n.classList)))).slice(0, 2);
    expect(picked.length, 'the card must render two classes').toBe(2);
    for (const cls of picked) {
      // Whole class name: '.containerX' must not satisfy '.container'
      expect(css, cls).to.match(new RegExp('\\.' + cls + '(?![\\w-])'));
    }
  });
});
