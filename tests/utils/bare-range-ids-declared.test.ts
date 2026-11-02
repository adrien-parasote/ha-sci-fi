import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const SPEC_11 = 'docs/specs/11_guidelines_remediation.md';
const SPEC_03 = 'docs/specs/03_base_classes.md';
const TESTS = {
  'TC-116': 'tests/sci-fi.test.ts',
  'TC-308': 'tests/utils/base-editor.test.ts',
} as const;

const TITLE_RE =
  /\b(?:it|test)(?:\.each\([^)]*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const titlesOf = (src: string): string[] => [...src.matchAll(TITLE_RE)].map((m) => m[2] ?? '');
const rowHeads = (spec: string, id: string): number =>
  spec.split('\n').filter((l) => new RegExp(`^\\|\\s*(?:\\*\\*)?(${id})(?:\\*\\*)?\\s*\\|`).test(l))
    .length;
const rowOf = (spec: string, id: string): string =>
  spec.split('\n').find((l) => new RegExp(`^\\|\\s*(?:\\*\\*)?(${id})(?:\\*\\*)?\\s*\\|`).test(l)) ?? '';
const declared = (spec: string): Set<string> =>
  new Set(
    spec
      .split('\n')
      .map((l) => l.match(/^\|\s*(?:\*\*)?((?:TC|IT)-\d+)(?:\*\*)?\s*\|/)?.[1])
      .filter((x): x is string => !!x),
  );
const orphans = (src: string, spec: string): string[] => {
  const dec = declared(spec);
  const out: string[] = [];
  for (const t of titlesOf(src))
    for (const id of t.match(/\b(?:TC|IT)-\d+\b/g) ?? [])
      if (!dec.has(id) && !out.includes(id)) out.push(id);
  return out;
};
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    if (n === 'node_modules') return [];
    const p = join(dir, n);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) return [];
    if (st.isDirectory()) return walk(p);
    return p.endsWith('.md') ? [p] : [];
  });
const strip = (s: string): string => s.replace(/`/g, '');

describe('bare range ids declared', () => {
  it('TC-BRI-U-01: TC-116 / TC-308 are row heads once, in the right spec only', () => {
    const files = walk(join(root, 'docs/specs'));
    for (const [id, file] of [
      ['TC-116', SPEC_11],
      ['TC-308', SPEC_03],
    ] as const) {
      const counts = files.map((f) => [f, rowHeads(readFileSync(f, 'utf8'), id)] as const);
      expect(counts.reduce((a, [, n]) => a + n, 0), id).toBe(1);
      expect(rowHeads(read(file), id), `${id} in ${file}`).toBe(1);
    }
    for (const id of ['TC-115']) expect(rowHeads(read(SPEC_11), id)).toBe(1);
    for (const id of ['TC-307', 'TC-309']) expect(rowHeads(read(SPEC_03), id)).toBe(1);
  });

  it('TC-BRI-U-02: test titles still start with their ids', () => {
    for (const [id, file] of Object.entries(TESTS)) {
      expect(titlesOf(read(file)).some((t) => t.startsWith(`${id}:`)), file).toBe(true);
    }
  });

  it('TC-BRI-U-03: orphan detector reports a ghost id, then none once declared', () => {
    const fixture = "it('TC-9999: ghost', () => {});";
    expect(orphans(fixture, '| TC-1 | Unit | x |')).toEqual(['TC-9999']);
    expect(orphans(fixture, '| TC-9999 | Unit | x |')).toEqual([]);
    const specs = read(SPEC_03) + '\n' + read(SPEC_11);
    for (const [id, file] of Object.entries(TESTS))
      expect(orphans(read(file), specs).filter((o) => o === id)).toEqual([]);
  });

  it('TC-BRI-U-04: the new rows name what their tests assert', () => {
    const r116 = strip(rowOf(read(SPEC_11), 'TC-116'));
    for (const t of ['window.customCards', 'custom:']) expect(r116).toContain(t);
    const r308 = strip(rowOf(read(SPEC_03), 'TC-308'));
    for (const t of ['section-title-header', 'En-tête', 'hass.locale.language = fr'])
      expect(r308).toContain(t);
  });

  it('TC-BRI-U-05: feature-map cells list the new ids', () => {
    expect(read(SPEC_11)).toContain('tests/sci-fi.test.ts :: TC-114, TC-115, TC-116');
    expect(read(SPEC_03)).toContain('tests/utils/base-editor.test.ts :: TC-305, TC-308');
  });
});
