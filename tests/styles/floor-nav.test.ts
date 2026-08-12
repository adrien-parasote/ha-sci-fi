// @vitest-environment happy-dom
//
// floorNavStyles is the hexagonal floor-navigation shell shared by the lights
// and water cards (ADR-017 step 8). Its correctness has two halves: it must
// carry the rules both cards stopped declaring, and it must sit BEFORE the
// card's own sheet in `static styles` — otherwise the shared shell would win
// over a card's override instead of losing to it, and the cascade silently
// inverts.

import { expect, describe, it } from 'vitest';
import { floorNavStyles } from '../../src/styles/floor-nav.js';
import { sciFiCommonStyles } from '../../src/styles/common.js';

import '../../src/cards/lights/sci-fi-lights.js';
import '../../src/cards/water/sci-fi-water-management.js';

const cssTextOf = (style: unknown): string =>
  (style as { cssText?: string }).cssText ?? '';

describe('floor-nav shared styles', () => {
  it('exports a Lit CSSResult carrying the shared shell rules', () => {
    expect(floorNavStyles).to.exist;
    const css = cssTextOf(floorNavStyles);

    // The widget both cards render: card frame, header with power button, and
    // the hexagonal floor tiles with their state variants.
    for (const selector of [
      'ha-card',
      '.container',
      '.header',
      '.header .info',
      '.header-text',
      '.floors',
      '.floor-hexa',
      '.floor-hexa .hexa-content',
      '.floor-hexa .floor-name',
      '.floor-hexa[data-selected="true"]',
      '.power-btn',
      '.power-btn svg',
    ]) {
      expect(css, `missing rule: ${selector}`).toContain(selector);
    }
  });

  it.each([
    ['sci-fi-lights'],
    ['sci-fi-water-management'],
  ])('%s lists floorNavStyles after the common sheet and before its own', (tag) => {
    const cls = customElements.get(tag) as (CustomElementConstructor & { styles?: unknown }) | undefined;
    expect(cls, `${tag} is not registered`).to.exist;

    const styles = cls!.styles;
    expect(Array.isArray(styles), `${tag}.styles must be an array`).toBe(true);

    const sheets = styles as unknown[];
    const commonIndex = sheets.indexOf(sciFiCommonStyles);
    const floorNavIndex = sheets.indexOf(floorNavStyles);

    expect(floorNavIndex, `${tag} does not use floorNavStyles`).toBeGreaterThan(-1);
    expect(commonIndex, `${tag} does not use sciFiCommonStyles`).toBeGreaterThan(-1);

    // common → floor-nav → the card's own sheet, which must be last so the card
    // can still override the shell.
    expect(floorNavIndex).toBeGreaterThan(commonIndex);
    expect(floorNavIndex).toBe(sheets.length - 2);
  });
});
