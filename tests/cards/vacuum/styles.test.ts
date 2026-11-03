// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';
import '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { SciFiVacuumCard } from '../../../src/cards/vacuum/sci-fi-vacuum.js';
import { vacuumStyles } from '../../../src/cards/vacuum/styles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('vacuum styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: empty export; rename a class in the sheet
  it('TC-BTG-U-25 — vacuumStyles is a non-empty CSSResult with :host and the classes of the rendered card', async () => {
    expect(vacuumStyles).to.be.instanceOf(CSSResult);
    const css = vacuumStyles.cssText;
    expect(css.replace(/\s+/g, '')).not.to.equal('');
    expect(css).to.include(':host');

    // Class names read from the rendered card, never typed from memory
    const el = document.createElement('sci-fi-vacuum') as SciFiVacuumCard;
    (el as any).setConfig({ type: 'custom:sci-fi-vacuum', vacuums: [{ entity: 'vacuum.bot' }] });
    el.hass = makeMockHass({
      states: { 'vacuum.bot': makeMockEntity({ entity_id: 'vacuum.bot', state: 'docked' }) },
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
