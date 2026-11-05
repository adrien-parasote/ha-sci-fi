/** Fix lot vague-1, O1 (bead ha-sci-fi-nu33): the climates floor-fallback spec cites the code that exists. */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as house from '../../../src/selectors/house.js';

const read = (rel: string): string => readFileSync(resolve(__dirname, '../../..', rel), 'utf8');

describe('O1', () => {
  it('test_O1_floor_fallback_spec_cites_no_removed_selector', () => {
    const spec = read('docs/specs/climates-floor-fallback/spec.md');
    const card = read('src/cards/climates/sci-fi-climates.ts');
    // every selector of house.ts the spec names in backticks still exists
    for (const [, name] of spec.matchAll(/`(get(?:Floor|Area|Entit|First)\w*)\(/g)) {
      expect(Object.keys(house), `spec cites ${name}()`).toContain(name);
    }
    expect(spec).toContain('allFloors[0]?.floor_id');
    expect(card).toContain('allFloors[0]?.floor_id');
  });
});
