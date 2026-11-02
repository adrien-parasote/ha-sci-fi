import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const TEST_FILES = ['tests/cards/vacuum/sci-fi-vacuum.test.ts', 'tests/cards/vacuum/sci-fi-vacuum-editor.test.ts'];
const SPEC = 'docs/specs/cards/vacuum.md';
const PLUGS = 'src/cards/plugs/sci-fi-plugs.ts';

const TITLE_RE = /\b(?:it|test)(?:\.each\([^)]*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const titlesOf = (src: string): string[] => [...src.matchAll(TITLE_RE)].map((m) => m[2] ?? '');
const nonLiteralTitles = (src: string): string[] =>
  [...src.matchAll(/\b(?:it|test)(?:\.each\([^)]*\))?\(\s*([^'"`\s][^,]*),/g)].map((m) => m[1] ?? '');
const citedIds = (title: string): string[] =>
  title.match(/\b(?:TC|IT)-[A-Z0-9]+(?:-[A-Za-z0-9]+)*/g) ?? [];
const declaredIds = (spec: string): string[] =>
  [...spec.matchAll(/^\|\s*(?:\*\*)?((?:TC|IT)-[A-Z0-9]+(?:-[A-Za-z0-9]+)*)(?:\*\*)?\s*\|/gm)].map((m) => m[1] ?? '');
const orphans = (src: string, spec: string): string[] => {
  const declared = new Set(declaredIds(spec));
  return titlesOf(src).flatMap(citedIds).filter((id) => !declared.has(id));
};
const walk = (dir: string): string[] =>
  readdirSync(join(root, dir)).flatMap((n) => {
    const p = `${dir}/${n}`;
    return statSync(join(root, p)).isDirectory() ? walk(p) : [p];
  });

const spec = read(SPEC);
const sources = TEST_FILES.map(read);

describe('vacuum ids declared', () => {
  it('TC-VOI-U-01: every id cited by a vacuum test title is declared in vacuum.md', () => {
    for (const src of sources) expect(orphans(src, spec)).toEqual([]);
    expect(orphans("it('TC-VACUUM-U-1501 x', () => {});", '| **TC-VACUUM-U-1501** | a |')).toEqual([]);
  });

  it('TC-VOI-U-02: rejects a fixture title citing an undeclared id', () => {
    expect(orphans("it('TC-VACUUM-U-99999: ghost', () => {});", spec)).toEqual(['TC-VACUUM-U-99999']);
  });

  it('TC-VOI-U-03: ids 1528..1536 are each a row head exactly once, 1527 is not', () => {
    const heads = declaredIds(spec);
    for (let n = 1528; n <= 1536; n++) {
      expect(heads.filter((h) => h === `TC-VACUUM-U-${n}`)).toHaveLength(1);
    }
    expect(heads).not.toContain('TC-VACUUM-U-1527');
  });

  it('TC-VOI-U-04: no vacuum test title carries an unprefixed TC-15xx, TC-VE, TC-1016 or TC-506', () => {
    for (const src of sources) {
      expect(titlesOf(src).filter((t) => /(?<![A-Z-])TC-(?:15\d\d|VE|1016|506)/.test(t))).toEqual([]);
    }
  });

  it('TC-VOI-U-05: no vacuum test uses it.skip, it.todo or it.only', () => {
    for (const src of sources) expect(src).not.toMatch(/\b(?:it|describe)\.(?:skip|todo|only)\b/);
  });

  it('TC-VOI-U-06: src cites no unprefixed TC-15xx and sci-fi-plugs.ts cites no vacuum id', () => {
    expect(read(PLUGS)).not.toMatch(/TC-VACUUM-U-\d+/);
    for (const f of walk('src').filter((p) => /\.(ts|js)$/.test(p))) {
      expect(read(f).match(/(?<![A-Z-])TC-15\d\d/g) ?? [], f).toEqual([]);
    }
  });

  it('TC-VOI-U-07: every id cited in a title starts with TC-VACUUM-U- or IT-VACUUM-I-', () => {
    for (const src of sources) {
      expect(titlesOf(src).flatMap(citedIds).filter((id) => !/^(?:TC-VACUUM-U-|IT-VACUUM-I-)/.test(id))).toEqual([]);
    }
  });

  it('TC-VOI-U-08: the declared set is non-empty and contains TC-VACUUM-U-1501', () => {
    const heads = declaredIds(spec);
    expect(heads.length).toBeGreaterThan(0);
    expect(heads).toContain('TC-VACUUM-U-1501');
  });

  it('TC-VOI-U-09: extraction reads test( and it.each( titles and flags non-literal titles', () => {
    expect(titlesOf("test('TC-VACUUM-U-1 a', () => {});")).toEqual(['TC-VACUUM-U-1 a']);
    expect(titlesOf("it.each([1, 2])('TC-VACUUM-U-2 b', () => {});")).toEqual(['TC-VACUUM-U-2 b']);
    expect(nonLiteralTitles('it(title, () => {});')).toEqual(['title']);
    for (const src of sources) expect(nonLiteralTitles(src)).toEqual([]);
  });

  it('TC-VOI-U-10: the vacuum.md note names 1534 and 1535 and no unprefixed TC-1528, TC-1529, TC-1530', () => {
    const note = spec.split('\n').find((l) => l.includes('must be completely deleted or replaced')) ?? '';
    expect(note).toContain('TC-VACUUM-U-1534');
    expect(note).toContain('TC-VACUUM-U-1535');
    expect(spec).not.toMatch(/(?<![A-Z-])TC-(?:1528|1529|1530)\b/);
  });
});
