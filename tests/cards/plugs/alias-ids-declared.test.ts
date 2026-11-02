import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const j = (...p: string[]) => p.join('-');

const PLUGS_TEST = 'tests/cards/plugs/sci-fi-plugs.test.ts';
const VEH_TEST = 'tests/cards/vehicles/sci-fi-vehicles.test.ts';
const PLUGS_SPEC = 'docs/specs/cards/plugs.md';
const VEH_SPEC = 'docs/specs/cards/vehicles.md';

const ALIAS_RE = new RegExp(['TC', '(?:PLG|VEH)', '000\\d'].join('-'), 'g');
const TITLE_RE = /\b(?:it|test)(?:\.each\([^)]*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const SKIP_RE = /\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|skipIf|todo|only)\b/;
const titlesOf = (src: string): string[] => [...src.matchAll(TITLE_RE)].map((m) => m[2] ?? '');
const aliasesIn = (src: string): string[] => titlesOf(src).flatMap((t) => t.match(ALIAS_RE) ?? []);
const headCount = (spec: string, id: string): number =>
  spec.split('\n').filter((l) => new RegExp(`^\\|\\s*(?:\\*\\*)?(${id})(?:\\*\\*)?\\s*\\|`).test(l)).length;
const walk = (dir: string): string[] =>
  readdirSync(join(root, dir)).flatMap((n) => {
    if (n === 'node_modules') return [];
    const p = `${dir}/${n}`;
    return statSync(join(root, p)).isDirectory() ? walk(p) : [p];
  });

const plg = (n: number) => j('TC', 'PLUGS', 'U', String(n));
const veh = (n: number) => j('TC', 'VEHICLES', 'U', String(n));
const plgAlias = (n: string) => j('TC', 'PLG', n);
const vehAlias = (n: string) => j('TC', 'VEH', n);

const NEW_STARTS: [string, string][] = [
  [PLUGS_TEST, `${plg(1301)} — provides getConfigElement`],
  [PLUGS_TEST, `${plg(1302)} — provides getStubConfig`],
  [VEH_TEST, `${veh(1201)}: getConfigElement returns correct editor tag`],
  [VEH_TEST, `${veh(1202)}: getStubConfig returns correct type`],
];

describe('alias ids declared', () => {
  it('TC-AOI-U-01: the four declared ids are each a row head once in their spec', () => {
    const p = read(PLUGS_SPEC);
    const v = read(VEH_SPEC);
    expect(headCount(p, plg(1301))).toBe(1);
    expect(headCount(p, plg(1302))).toBe(1);
    expect(headCount(v, veh(1201))).toBe(1);
    expect(headCount(v, veh(1202))).toBe(1);
  });

  it('TC-AOI-U-02: detector flags an alias in it, test and it.each forms, ignores a ghost id', () => {
    const a = plgAlias('0001');
    expect(aliasesIn(`it('${a} x', () => {});`)).toEqual([a]);
    expect(aliasesIn(`test('${a} x', () => {});`)).toEqual([a]);
    expect(aliasesIn(`it.each([1, 2])('${a} x', () => {});`)).toEqual([a]);
    const b = vehAlias('0002');
    expect(aliasesIn(`it('${b} x', () => {});`)).toEqual([b]);
    expect(aliasesIn(`it('${j('TC', 'GHOST', 'U', '99')} x', () => {});`)).toEqual([]);
  });

  it('TC-AOI-U-03: no file under tests/ cites an alias; the four new title starts exist', () => {
    for (const f of walk('tests').filter((p) => p.endsWith('.ts'))) {
      expect(read(f).match(ALIAS_RE) ?? [], f).toEqual([]);
    }
    for (const [file, start] of NEW_STARTS) {
      expect(titlesOf(read(file)).some((t) => t.startsWith(start)), start).toBe(true);
    }
    for (const [file, start] of NEW_STARTS) {
      const id = start.split(/[ :]/)[0] ?? '';
      expect(titlesOf(read(file)).filter((t) => t.startsWith(`${id},`)), id).toEqual([]);
    }
  });

  it('TC-AOI-U-04: the two test files skip nothing; skip fixtures are detected', () => {
    expect(read(PLUGS_TEST)).not.toMatch(SKIP_RE);
    expect(read(VEH_TEST)).not.toMatch(SKIP_RE);
    expect(['test', 'skip'].join('.') + '(').toMatch(SKIP_RE);
    expect(['it', 'skipIf'].join('.') + '(').toMatch(SKIP_RE);
  });

  it('TC-AOI-U-05: file-tree lines end with declared ids, tables keep their aliases', () => {
    const cases: [string, string, string, string, string, string][] = [
      [PLUGS_SPEC, '└── tests/cards/plugs/sci-fi-plugs.test.ts', plg(1301), plg(1302), plgAlias('0001'), plgAlias('0002')],
      [VEH_SPEC, '└── tests/cards/vehicles/sci-fi-vehicles.test.ts', veh(1201), veh(1202), vehAlias('0001'), vehAlias('0002')],
    ];
    for (const [spec, prefix, id1, id2, al1, al2] of cases) {
      const lines = read(spec).split('\n');
      const tree = lines.find((l) => l.startsWith(prefix)) ?? '';
      expect(tree.endsWith(`preserve ${id1} (getConfigElement) and ${id2} (getStubConfig)`)).toBe(true);
      expect(tree).not.toMatch(new RegExp(ALIAS_RE.source));
      expect(lines.filter((l) => l.includes(`| ${al1} |`)).length).toBe(1);
      expect(lines.filter((l) => l.includes(`| ${al2} |`)).length).toBe(1);
    }
  });
});
