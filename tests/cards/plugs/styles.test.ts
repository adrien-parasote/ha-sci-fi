// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';
import '../../../src/cards/plugs/sci-fi-plugs.js';
import { SciFiPlugsCard } from '../../../src/cards/plugs/sci-fi-plugs.js';
import { plugStyles } from '../../../src/cards/plugs/styles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('plugs styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: styles.ts exports an empty css`` or renames a class the card renders
  it('TC-BTG-U-14: plugStyles is a non-empty CSSResult styling :host and two classes of the rendered card', async () => {
    const el = document.createElement('sci-fi-plugs') as SciFiPlugsCard;
    (el as any).setConfig({
      type: 'custom:sci-fi-plugs',
      devices: [{ device_id: 'plug1', entity_id: 'switch.tv', name: 'TV Plug' }],
    });
    el.hass = makeMockHass({
      states: {
        'switch.tv': makeMockEntity({ entity_id: 'switch.tv', state: 'on', attributes: { friendly_name: 'TV' } }),
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    expect(plugStyles).toBeInstanceOf(CSSResult);
    const css = plugStyles.cssText;
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
