// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';
import '../../../src/cards/climates/sci-fi-climates.js';
import { SciFiClimatesCard } from '../../../src/cards/climates/sci-fi-climates.js';
import { climateStyles } from '../../../src/cards/climates/styles.js';
import { makeMockHass, makeMockEntity, makeMockEntityEntry } from '../../fixtures/mock-hass.js';

describe('climates styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: empty export; rename a class in the sheet
  it('TC-BTG-U-26 — climateStyles is a non-empty CSSResult with :host and the classes of the rendered card', async () => {
    expect(climateStyles).to.be.instanceOf(CSSResult);
    const css = climateStyles.cssText;
    expect(css.replace(/\s+/g, '')).not.to.equal('');
    expect(css).to.include(':host');

    // Class names read from the rendered card, never typed from memory
    const el = document.createElement('sci-fi-climates') as SciFiClimatesCard;
    el.setConfig(SciFiClimatesCard.getStubConfig());
    el.hass = makeMockHass({
      entities: { 'climate.salon': makeMockEntityEntry({ entity_id: 'climate.salon', domain: 'climate' }) },
      states: { 'climate.salon': makeMockEntity({ entity_id: 'climate.salon', state: 'heat' }) },
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
