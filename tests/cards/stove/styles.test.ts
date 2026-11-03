// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';

import '../../../src/cards/stove/sci-fi-stove.js';
import { SciFiStoveCard } from '../../../src/cards/stove/sci-fi-stove.js';
import { stoveStyles } from '../../../src/cards/stove/styles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('stove styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: styles.ts exports an empty css`` or renames a class the card renders
  it('TC-BTG-U-28: TC-STOVE-U-1113 — stoveStyles is a non-empty CSSResult styling :host and two classes of the rendered card', async () => {
    const el = document.createElement('sci-fi-stove') as SciFiStoveCard;
    (el as any).setConfig({ type: 'custom:sci-fi-stove', entity: 'climate.poele' });
    el.hass = makeMockHass({
      states: {
        'climate.poele': makeMockEntity({ entity_id: 'climate.poele', state: 'off', attributes: { friendly_name: 'Poele' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(stoveStyles).toBeInstanceOf(CSSResult);
    const css = stoveStyles.cssText;
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
