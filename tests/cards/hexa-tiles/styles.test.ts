// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';
import { hexaTilesStyles } from '../../../src/cards/hexa-tiles/styles.js';
import '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import type { SciFiHexaTilesCard } from '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('hexa-tiles styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: the export becomes an empty `css```, or a class of the sheet is renamed
  // (the card keeps rendering the old one).
  it('TC-BTG-U-24: the sheet is a non-empty CSSResult styling the classes the card renders', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [{ entity: 'switch.t1', name: 'Tile 1' }],
    } as unknown as any);
    el.hass = makeMockHass({
      states: { 'switch.t1': makeMockEntity({ entity_id: 'switch.t1', state: 'on' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // Class names read from the rendered card, never typed from memory: every grid
    // class the tiles render (the `hexa-` family), so renaming `.hexa-row` or
    // `.hexa-tile` in the sheet alone turns this red. The header classes
    // (avatar, status-badge...) come first in the DOM and would hide that.
    const classes = Array.from(new Set(Array.from(el.shadowRoot!.querySelectorAll('[class]')).flatMap(n => Array.from(n.classList)))).filter(c => c.startsWith('hexa-'));
    expect(classes.length, 'the card must render its hexa grid classes').toBeGreaterThanOrEqual(2);

    expect(hexaTilesStyles).toBeInstanceOf(CSSResult);
    const cssText = hexaTilesStyles.cssText;
    expect(cssText.replace(/\s/g, '')).not.toBe('');
    expect(cssText).toContain(':host');
    for (const cls of classes) {
      expect(cssText, `.${cls} must be styled by the sheet`).toMatch(new RegExp(`\\.${cls}(?![\\w-])`));
    }
  });
});
