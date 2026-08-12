/**
 * @vitest-environment happy-dom
 *
 * Needs a DOM: reading `static styles` means importing the card modules, which
 * register custom elements. The other tests/styles/* specs stay on node.
 *
 * Locks the effective CSS of every card against a baseline captured before the
 * ADR-017 style-kernel work (step 8). Any hoist into src/styles/card-chrome.ts,
 * and any token substitution in step 9, must leave every card's resolved rule
 * set byte-identical — this is the only mechanical guard the stylesheets have.
 *
 * Regenerate deliberately, never casually:
 *   UPDATE_CSS_BASELINE=1 npx vitest run tests/styles/card-css-baseline.test.ts
 * A regeneration means "this visual change is intended" and must be reviewed in
 * the workbench.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { flattenStyles, foldCss, diffFolded, type FoldedCss } from './css-equivalence.js';

import '../../src/cards/bridge/sci-fi-bridge.js';
import '../../src/cards/climates/sci-fi-climates.js';
import '../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import '../../src/cards/lights/sci-fi-lights.js';
import '../../src/cards/plugs/sci-fi-plugs.js';
import '../../src/cards/stove/sci-fi-stove.js';
import '../../src/cards/tv/sci-fi-tv.js';
import '../../src/cards/vacuum/sci-fi-vacuum.js';
import '../../src/cards/vehicles/sci-fi-vehicles.js';
import '../../src/cards/water/sci-fi-water-management.js';
import '../../src/cards/weather/sci-fi-weather.js';

const CARD_TAGS = [
  'sci-fi-bridge',
  'sci-fi-climates',
  'sci-fi-hexa-tiles',
  'sci-fi-lights',
  'sci-fi-plugs',
  'sci-fi-stove',
  'sci-fi-tv',
  'sci-fi-vacuum',
  'sci-fi-vehicles',
  'sci-fi-water-management',
  'sci-fi-weather',
] as const;

const BASELINE = join(dirname(fileURLToPath(import.meta.url)), 'card-css-baseline.json');

function currentFolded(): Record<string, FoldedCss> {
  const out: Record<string, FoldedCss> = {};
  for (const tag of CARD_TAGS) {
    const cls = customElements.get(tag) as (CustomElementConstructor & { styles?: unknown }) | undefined;
    if (!cls) throw new Error(`custom element not registered: ${tag}`);
    out[tag] = foldCss(flattenStyles(cls.styles));
  }
  return out;
}

describe('card CSS baseline (ADR-017 step 8)', () => {
  if (process.env['UPDATE_CSS_BASELINE'] === '1') {
    it('regenerates the baseline', () => {
      writeFileSync(BASELINE, JSON.stringify(currentFolded(), null, 2) + '\n');
      expect(existsSync(BASELINE)).toBe(true);
    });
    return;
  }

  const baseline = JSON.parse(readFileSync(BASELINE, 'utf8')) as Record<string, FoldedCss>;
  const current = currentFolded();

  for (const tag of CARD_TAGS) {
    it(`${tag} resolves to the same CSS as the baseline`, () => {
      const problems = diffFolded(baseline[tag]!, current[tag]!);
      expect(problems, problems.join('\n')).toEqual([]);
    });
  }

  it('every card has a non-trivial rule set (guards against a silent empty parse)', () => {
    for (const tag of CARD_TAGS) {
      expect(Object.keys(current[tag]!).length, tag).toBeGreaterThan(10);
    }
  });
});
