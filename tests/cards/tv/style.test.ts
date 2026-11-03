// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';
import '../../../src/cards/tv/sci-fi-tv.js';
import { tvStyles } from '../../../src/cards/tv/style.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('tv styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: empty export (css``); renamed class
  it('TC-BTG-U-23: the sheet styles the host and the classes the rendered tv card uses', async () => {
    const el = document.createElement('sci-fi-tv') as any;
    el.setConfig({ type: 'custom:sci-fi-tv', entity: 'media_player.bravia_4k_vh22' });
    el.hass = makeMockHass({
      states: {
        'media_player.bravia_4k_vh22': makeMockEntity({ entity_id: 'media_player.bravia_4k_vh22', state: 'on' }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const classes = [...el.shadowRoot.querySelectorAll('[class]')]
      .map((n: Element) => (n.getAttribute('class') ?? '').trim().split(/\s+/)[0])
      .filter(Boolean);
    const [first, second] = [...new Set(classes)];
    expect(first).to.be.a('string');
    expect(second).to.be.a('string');

    expect(tvStyles).toBeInstanceOf(CSSResult);
    const css = (tvStyles as any).cssText as string;
    expect(css.replace(/\s/g, '')).not.to.equal('');
    expect(css).to.contain(':host');
    // `.x` not followed by a name character: `.containerx` must not satisfy `.container`.
    for (const cls of [first, second]) {
      expect(css, cls).to.match(new RegExp(`\\.${cls}(?![\\w-])`));
    }
  });
});
