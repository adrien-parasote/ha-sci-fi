import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const TEST_FILES = ['tests/cards/tv/sci-fi-tv.test.ts', 'tests/cards/tv/sci-fi-tv-editor.test.ts'];
const SPEC = 'docs/specs/cards/tv.md';

const titlesOf = (src: string): string[] =>
  [...src.matchAll(/\bit\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)].map((m) => m[2] ?? '');
const citedIds = (title: string): string[] => title.match(/\b(?:TC|IT)-[A-Z0-9-]+/g) ?? [];
const declaredIds = (spec: string): string[] =>
  [...spec.matchAll(/^\|\s*\*\*((?:TC|IT)-[A-Z0-9-]+)\*\*/gm)].map((m) => m[1] ?? '');
const orphans = (src: string, spec: string): string[] => {
  const declared = new Set(declaredIds(spec));
  return titlesOf(src).flatMap(citedIds).filter((id) => !declared.has(id));
};

// Ids of the behavioural-test-gaps lot (TC-BTG-U-NN / IT-BTG-I-NN) are declared in its own spec.
const LOT_SPEC = 'docs/specs/behavioural-test-gaps/spec.md';
const lotIds = (): string[] =>
  [...readFileSync(join(process.cwd(), LOT_SPEC), 'utf8').matchAll(/^\|\s*((?:TC-BTG-U|IT-BTG-I)-\d+)\s*\|/gm)].map((m) => m[1] ?? '');
const spec = read(SPEC) + '\n' + lotIds().map((id) => `| **${id}** |`).join('\n');
const sources = TEST_FILES.map(read);

describe('tv ids declared', () => {
  it('TC-TVO-U-01: every id cited by a tv test title is declared in tv.md', () => {
    for (const src of sources) expect(orphans(src, spec)).toEqual([]);
  });

  it('TC-TVO-U-02: rejects a fixture title citing an undeclared id', () => {
    const fixture = "it('TC-TV-U-99999: ghost', () => {});";
    expect(orphans(fixture, spec)).toEqual(['TC-TV-U-99999']);
  });

  it('TC-TVO-U-03: the 30 ids 716..745 are each a row head exactly once', () => {
    const heads = declaredIds(spec);
    for (let n = 716; n <= 745; n++) {
      expect(heads.filter((h) => h === `TC-TV-U-${n}`)).toHaveLength(1);
    }
  });

  it('TC-TVO-U-04: no tv test title carries an unprefixed TC-7xx', () => {
    for (const src of sources) {
      expect(titlesOf(src).filter((t) => /\bTC-7\d\d/.test(t))).toEqual([]);
    }
  });

  it('TC-TVO-U-05: no tv test uses it.skip, it.todo or it.only', () => {
    for (const src of sources) expect(src).not.toMatch(/\b(?:it|describe)\.(?:skip|todo|only)\b/);
  });
});
