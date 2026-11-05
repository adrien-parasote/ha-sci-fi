/**
 * Repo-wide guard — lot `repo-wide-ids-guard`, bead ha-sci-fi-78y.8.
 *
 * Every `it`, `test` or `describe` title under `tests/**` cites only ids that
 * a spec declares as a row head, and the spec that declares an id is the one
 * its NAME says (bare ranges: the numbered specs; derived prefix: the card
 * spec or the matrix; any other prefix: exactly one lot spec). Nothing is
 * frozen: no list of ids, files, cards or counts; each set is derived from the
 * tracked files at each run, and each witness comes from a second probe.
 *
 * Titles are read with the TypeScript parser, never a regex: `it.each` tables
 * hold parentheses and strings hold `it(`.
 *
 * This file spells no id declared by a card spec or by the matrix, and none
 * marked unplayed: fixtures use ghost ids, and the ids that must exist are
 * assembled from fragments (the card-citation rule of `ids-cas-uniques`).
 * Fixture sources are one-line strings: a fixture line that starts with a test
 * call would raise the raw witness of the corpus case.
 */
import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf8');

// ---------------------------------------------------------------- FR-1 titles

interface Titles {
  titles: string[];
  fragments: string[];
  opaque: string[];
  refused: string[];
}
interface ExtractOptions {
  roots: ReadonlySet<string>;
  followCalls: boolean;
}
const DEFAULT_OPTIONS: ExtractOptions = {
  roots: new Set(['it', 'test', 'describe', 'suite', 'bench']),
  followCalls: true,
};
const RENAMEABLE = ['it', 'test', 'describe'];

const bindingNames = (name: ts.BindingName, out: Set<string>): void => {
  if (ts.isIdentifier(name)) out.add(name.text);
  else for (const el of name.elements) if (!ts.isOmittedExpression(el)) bindingNames(el.name, out);
};

/** A binding of that name between the call and the module scope hides the root. */
const isShadowed = (call: ts.Node, name: string): boolean => {
  for (let n: ts.Node | undefined = call.parent; n && !ts.isSourceFile(n); n = n.parent) {
    const names = new Set<string>();
    if (ts.isFunctionLike(n)) for (const p of n.parameters) bindingNames(p.name, names);
    if (ts.isBlock(n) || ts.isModuleBlock(n) || ts.isCaseClause(n) || ts.isDefaultClause(n))
      for (const s of n.statements) {
        if (ts.isVariableStatement(s))
          for (const d of s.declarationList.declarations) bindingNames(d.name, names);
        else if ((ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) && s.name) names.add(s.name.text);
      }
    if ((ts.isForStatement(n) || ts.isForInStatement(n) || ts.isForOfStatement(n)) && n.initializer && ts.isVariableDeclarationList(n.initializer))
      for (const d of n.initializer.declarations) bindingNames(d.name, names);
    if (ts.isCatchClause(n) && n.variableDeclaration) bindingNames(n.variableDeclaration.name, names);
    if (names.has(name)) return true;
  }
  return false;
};

const rootOf = (e: ts.Node, followCalls: boolean): ts.Identifier | null => {
  let cur: ts.Node = e;
  for (;;) {
    if (ts.isIdentifier(cur)) return cur;
    if (ts.isCallExpression(cur) && !followCalls) return null;
    if (
      ts.isPropertyAccessExpression(cur) ||
      ts.isElementAccessExpression(cur) ||
      ts.isCallExpression(cur) ||
      ts.isParenthesizedExpression(cur) ||
      ts.isNonNullExpression(cur)
    )
      cur = cur.expression;
    else return null;
  }
};

const isLiteral = (n: ts.Node): n is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral =>
  ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n);

function extract(src: string, file: string, opts: ExtractOptions): Titles {
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind);
  const out: Titles = { titles: [], fragments: [], opaque: [], refused: [] };
  const consts = new Map<string, string>();

  const prepare = (n: ts.Node): void => {
    if (
      ts.isVariableDeclaration(n) &&
      ts.isIdentifier(n.name) &&
      n.initializer &&
      isLiteral(n.initializer) &&
      ts.isVariableDeclarationList(n.parent) &&
      (n.parent.flags & ts.NodeFlags.Const) !== 0
    )
      consts.set(n.name.text, n.initializer.text);
    if (ts.isImportDeclaration(n) && n.importClause?.namedBindings && ts.isNamedImports(n.importClause.namedBindings))
      for (const el of n.importClause.namedBindings.elements)
        if (el.propertyName && RENAMEABLE.includes(el.propertyName.text) && el.name.text !== el.propertyName.text)
          out.refused.push(`${file}: import ${el.propertyName.text} as ${el.name.text}`);
    if (
      ts.isImportDeclaration(n) &&
      ts.isStringLiteral(n.moduleSpecifier) &&
      n.moduleSpecifier.text === 'vitest' &&
      n.importClause?.namedBindings &&
      ts.isNamespaceImport(n.importClause.namedBindings)
    )
      out.refused.push(`${file}: import * as ${n.importClause.namedBindings.name.text}`);
    if (ts.isVariableDeclaration(n) && n.initializer && ts.isIdentifier(n.initializer) && RENAMEABLE.includes(n.initializer.text))
      out.refused.push(`${file}: alias ${n.name.getText(sf)} = ${n.initializer.text}`);
    ts.forEachChild(n, prepare);
  };
  prepare(sf);

  const pieces = (n: ts.Node, acc: string[]): void => {
    if (isLiteral(n)) acc.push(n.text);
    else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) acc.push(n.text);
    ts.forEachChild(n, (c) => pieces(c, acc));
  };

  const handle = (call: ts.CallExpression): void => {
    const parent = call.parent;
    if (ts.isCallExpression(parent) && parent.expression === call) return;
    const root = rootOf(call.expression, opts.followCalls);
    if (!root || !opts.roots.has(root.text) || isShadowed(call, root.text)) return;
    const arg = call.arguments[0];
    if (!arg) return;
    if (isLiteral(arg)) out.titles.push(arg.text);
    else if (ts.isTemplateExpression(arg))
      out.titles.push(
        arg.head.text +
          arg.templateSpans
            .map((sp) => {
              const v = ts.isIdentifier(sp.expression) ? consts.get(sp.expression.text) : undefined;
              return (v ?? `\${${sp.expression.getText(sf)}}`) + sp.literal.text;
            })
            .join(''),
      );
    else if (ts.isIdentifier(arg)) {
      const value = consts.get(arg.text);
      if (value === undefined) out.opaque.push(`${file}: ${arg.text}`);
      else out.titles.push(value);
    } else {
      const acc: string[] = [];
      pieces(arg, acc);
      if (acc.length === 0) out.opaque.push(`${file}: ${arg.getText(sf)}`);
      else {
        out.fragments.push(...acc);
        for (const piece of acc) {
          const stem = /(?<![\w-])(?:TC|IT|UT)-[\w-]*$/.exec(piece);
          if (stem && stem[0].endsWith('-')) out.refused.push(`${file}: dynamic id ${stem[0]}`);
        }
      }
    }
  };
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) handle(n);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}
const titlesOf = (src: string, file: string): Titles => extract(src, file, DEFAULT_OPTIONS);

// -------------------------------------------------------------- FR-2 corpus

const parseZ = (raw: string): string[] => raw.split('\0').filter(Boolean);
const lsZ = (dir: string): string[] =>
  parseZ(
    execFileSync('git', ['ls-files', '-z', '-co', '--exclude-standard', dir], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }),
  ).filter((p) => existsSync(join(ROOT, p)));
const WITNESS_LINE = /^[ \t]*(?:it|test|describe)\b[.(]/gm;
const witnessLines = (src: string): number => (src.match(WITNESS_LINE) ?? []).length;
const belowWitness = (src: string, file: string, opts: ExtractOptions): boolean => {
  const t = extract(src, file, opts);
  return t.titles.length + t.fragments.length < witnessLines(src);
};
interface CorpusGaps {
  below: string[];
  countsAgree: boolean;
  notInCorpus: string[];
}
const corpusGaps = (files: string[], per: Map<string, Titles>, onDisk: string[], linesOf: (f: string) => number): CorpusGaps => {
  const below = files.filter((f) => {
    const t = per.get(f);
    return !t || t.titles.length + t.fragments.length < linesOf(f);
  });
  const withTitles = files.filter((f) => (per.get(f)?.titles.length ?? 0) > 0).length;
  const withLines = files.filter((f) => linesOf(f) > 0).length;
  const corpus = new Set(files);
  return { below, countsAgree: withTitles === withLines, notInCorpus: onDisk.filter((p) => !corpus.has(p)) };
};
const walkTests = (dir: string): string[] =>
  readdirSync(join(ROOT, dir)).flatMap((n) => {
    if (n === 'node_modules' || n.startsWith('.')) return []; // dot-dirs are transient (tests/.eit-base-<pid>)
    const p = `${dir}/${n}`;
    const st = lstatSync(join(ROOT, p));
    if (st.isSymbolicLink()) return [];
    if (st.isDirectory()) return walkTests(p);
    return /\.test\.tsx?$/.test(n) ? [p] : [];
  });

// ------------------------------------------------------------ FR-3..5 ids

const ROW_HEAD = /^\| *\*{0,2}((?:TC|IT|UT)-[A-Z0-9]+(?:-[A-Z0-9]+)*)\*{0,2}( ⬜)? *\|/;
const EXACT = /^(?:TC|IT|UT)-[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

interface Doc {
  path: string;
  text: string;
}
interface Declarations {
  heads: Map<string, Set<string>>;
  unplayed: Set<string>;
}
const declarations = (docs: Doc[]): Declarations => {
  const heads = new Map<string, Set<string>>();
  const unplayed = new Set<string>();
  for (const d of docs)
    for (const line of d.text.split('\n')) {
      const m = ROW_HEAD.exec(line);
      if (!m || !m[1]) continue;
      if (!heads.has(m[1])) heads.set(m[1], new Set());
      heads.get(m[1])?.add(d.path);
      if (m[2]) unplayed.add(m[1]);
    }
  return { heads, unplayed };
};

/** Cited ids of a text, and the runs that the grammar cannot place. */
function readIds(text: string): { ids: string[]; refused: string[] } {
  const ids: string[] = [];
  const refused: string[] = [];
  for (const m of text.matchAll(/(?<![\w-])(?:TC|IT|UT)-[\w-]*(\$\{)?/g)) {
    const run = m[0].replace(/\$\{$/, '');
    if (m[1]) refused.push(`${run}\${…}`);
    else if (run.endsWith('-')) continue;
    else if (/^(?:TC|IT|UT)-\d+x+$/.test(run)) continue;
    else if (EXACT.test(run) && /\d/.test(run)) ids.push(run);
    else if (!/\d/.test(run)) {
      if (/^(?:TC|IT|UT)-[A-Z]+(?:-[A-Z]+)*$/.test(run)) refused.push(run);
    } else refused.push(run);
  }
  return { ids, refused };
}

const prefixOf = (path: string): string =>
  (path.split('/').pop() ?? '').replace(/\.md$/, '').toUpperCase().replace(/_/g, '-');
const NUMBERED = /^docs\/specs\/\d\d_[^/]+\.md$/;
const CARD = /^docs\/specs\/cards\/[^/]+\.md$/;
const LOT = /^docs\/specs\/(?!cards\/)[^/]+\/spec\.md$/;

/** Derived prefix → the one file that owns it (card specs and the matrix). */
const derivedPrefixes = (paths: string[]): Map<string, string> => {
  const out = new Map<string, string>();
  for (const p of paths) if (CARD.test(p) || p === 'docs/MASTER.md') out.set(prefixOf(p), p);
  return out;
};

/** What is wrong with the way `files` declare `id`, or null. */
function ownerProblem(id: string, files: string[], derived: Map<string, string>): string | null {
  const list = [...files].sort().join(', ');
  if (/^(?:TC|IT)-\d+$/.test(id)) {
    const wrong = files.filter((f) => !NUMBERED.test(f));
    return wrong.length ? `${id} is bare: declared by ${list}, owner is a numbered docs/specs/NN_*.md` : null;
  }
  const m = /^(TC|IT)-(.+)-(U|I)-\d+$/.exec(id);
  if (!m || (m[1] === 'TC') !== (m[3] === 'U')) return `${id} has no placeable shape`;
  const owner = derived.get(m[2] ?? '');
  if (owner) {
    const wrong = files.filter((f) => f !== owner);
    return wrong.length ? `${id} carries a derived prefix: declared by ${list}, owner is ${owner}` : null;
  }
  const lots = files.filter((f) => LOT.test(f));
  if (files.length === 1 && lots.length === 1) return null;
  return `${id} is a lot id: declared by ${list}, owner is exactly one docs/specs/<dir>/spec.md`;
}

interface Entry {
  file: string;
  text: string;
}
const start = (e: Entry): string => `${e.file} :: ${e.text.slice(0, 60)}`;
const refusalsOf = (entries: Entry[]): string[] =>
  entries.flatMap((e) => readIds(e.text).refused.map((r) => `${start(e)} :: refused ${r}`));
const undeclaredOf = (entries: Entry[], decl: Declarations): string[] =>
  entries.flatMap((e) =>
    readIds(e.text)
      .ids.filter((id) => !decl.heads.has(id))
      .map((id) => `${e.file} :: ${id} :: ${e.text.slice(0, 60)}`),
  );
const misownedOf = (entries: Entry[], decl: Declarations, derived: Map<string, string>): string[] =>
  entries.flatMap((e) =>
    readIds(e.text).ids.flatMap((id) => {
      const files = decl.heads.get(id);
      const p = files ? ownerProblem(id, [...files], derived) : null;
      return p ? [`${e.file} :: ${p}`] : [];
    }),
  );

// -------------------------------------------------------------- the tree

interface Tree {
  files: string[];
  per: Map<string, Titles>;
  entries: Entry[];
  docs: Doc[];
  decl: Declarations;
  derived: Map<string, string>;
}
let cached: Tree | null = null;
const tree = (): Tree => {
  if (cached) return cached;
  const files = lsZ('tests').filter((p) => /\.tsx?$/.test(p));
  const per = new Map<string, Titles>();
  const entries: Entry[] = [];
  for (const f of files) {
    const t = titlesOf(read(f), f);
    per.set(f, t);
    for (const x of [...t.titles, ...t.fragments]) entries.push({ file: f, text: x });
  }
  const docs = lsZ('docs')
    .filter((p) => p.endsWith('.md') && !p.startsWith('docs/reviews/') && !p.startsWith('docs/fixes/'))
    .map((p) => ({ path: p, text: read(p) }));
  cached = { files, per, entries, docs, decl: declarations(docs), derived: derivedPrefixes(docs.map((d) => d.path)) };
  return cached;
};

// ------------------------------------------------------------- fixtures

const G = 'TC-GHOSTRWG-U-01';
const bare = (n: number | string): string => `TC-${n}`;
const fx = (title: string): Entry[] => [{ file: 'fixture.test.ts', text: title }];
const doc = (path: string, ...heads: string[]): Doc => ({ path, text: heads.map((h) => `| ${h} | Unit | x |`).join('\n') });
const problemsOf = (title: string, docs: Doc[]): string[] => {
  const decl = declarations(docs);
  const derived = derivedPrefixes(docs.map((d) => d.path));
  return [...undeclaredOf(fx(title), decl), ...misownedOf(fx(title), decl, derived)];
};

describe('repo-wide ids guard', () => {
  it('TC-RWG-U-01: titlesOf reads every call form and no decoy', () => {
    const real: Array<[string, string]> = [
      ["it('a1', f);", 'a1'],
      ["test('a2', f);", 'a2'],
      ["describe('a3', () => { it('a4', f); });", 'a3|a4'],
      ["it.each([\n  ['x(', 1],\n  [')', 2],\n])('a5', f);", 'a5'],
      ["describe.each([\n  ['(', 1],\n])('a6', f);", 'a6'],
      ["it.skip('a7', f);", 'a7'],
      ["it.only('a8', f);", 'a8'],
      ["it.todo('a9');", 'a9'],
      ["it.concurrent('b1', f);", 'b1'],
      ["it.fails('b2', f);", 'b2'],
      ["it.skipIf(c)('b3', f);", 'b3'],
      ["it.runIf(c)('b4', f);", 'b4'],
      ["it.skip.each([1])('b5', f);", 'b5'],
      ['it(`b6 ${n}`, f);', 'b6 ${n}'],
    ];
    const decoys =
      "\nconst s = \"it('x1', f)\"; // it('x2', f)\nconst t = `it('x3', f)`; /* test('x4', f) */\nre.test('y');\n";
    for (const [src, want] of real) {
      const r = titlesOf(src + decoys, 'f.test.ts');
      expect(r.titles, src).toEqual(want.split('|'));
      expect([r.fragments, r.opaque, r.refused], src).toEqual([[], [], []]);
    }
    const all = titlesOf(real.map(([s]) => s.replace(/\n/g, ' ')).join('\n') + decoys, 'f.test.ts');
    expect(all.titles).toHaveLength(real.map(([, w]) => w.split('|').length).reduce((a, b) => a + b, 0));
  });

  it('TC-RWG-U-02: unresolved, concatenated, resolved, shadowed and renamed forms', () => {
    const opaque = titlesOf('it(seg, f);', 'f.test.ts');
    expect(opaque).toEqual({ titles: [], fragments: [], opaque: ['f.test.ts: seg'], refused: [] });
    const concat = titlesOf("it('a' + 'TC-GHOSTRWG-U-2', f);", 'f.test.ts');
    expect([concat.titles, concat.fragments]).toEqual([[], ['a', 'TC-GHOSTRWG-U-2']]);
    const viaConst = titlesOf(`const T = '${G}: x'; it(T, f);`, 'f.test.ts');
    expect(viaConst.titles).toEqual([`${G}: x`]);
    expect(readIds(viaConst.titles[0] ?? '').ids).toEqual([G]);
    const viaTemplate = titlesOf(`const T = '${G}'; it(\`\${T} y \${n}\`, f);`, 'f.test.ts');
    expect(viaTemplate.titles).toEqual([`${G} y \${n}`]);
    expect(readIds(viaTemplate.titles[0] ?? '').ids).toEqual([G]);
    const dyn = titlesOf("it('TC-' + n + ': x', f);", 'f.test.ts');
    expect(dyn.refused).toEqual(['f.test.ts: dynamic id TC-']);
    const ns = titlesOf("import * as v from 'vitest';\nv.it('q', f);", 'f.test.ts');
    expect(ns.refused).toEqual(['f.test.ts: import * as v']);
    expect(titlesOf("const t = it;\nt('q', f);", 'f.test.ts').refused).toEqual(['f.test.ts: alias t = it']);
    for (const src of [
      "for (const test of xs) test('zz');",
      'function g() { function it(x) {} it(`fd`); }',
      "try { f(); } catch (it) { it('c'); }",
      "switch (k) { case 1: function test() {} test('s'); }",
    ])
      expect(titlesOf(src, 'f.test.ts').titles, src).toEqual([]);
    expect(titlesOf("suite('s1', f);", 'f.test.ts').titles).toEqual(['s1']);
    expect(titlesOf("bench('s2', f);", 'f.test.ts').titles).toEqual(['s2']);
    expect(titlesOf('function g(test) { test(seg); }', 'f.test.ts')).toEqual({ titles: [], fragments: [], opaque: [], refused: [] });
    const helper = titlesOf("function h() { const it = 1; it('no', f); }\nit('yes', f);", 'f.test.ts');
    expect(helper.titles).toEqual(['yes']);
    const renamed = titlesOf("import { it as t } from 'vitest';\nt('z', f);", 'f.test.ts');
    expect(renamed.refused).toEqual(['f.test.ts: import it as t']);
    expect(renamed.titles).toEqual([]);
  });

  it('TC-RWG-U-03: the corpus is complete and every file meets its witness', () => {
    const { files, per } = tree();
    expect(files.length).toBeGreaterThan(0);
    const real = corpusGaps(files, per, walkTests('tests'), (f) => witnessLines(read(f)));
    expect(real).toEqual({ below: [], countsAgree: true, notInCorpus: [] });
    const empty: Titles = { titles: [], fragments: [], opaque: [], refused: [] };
    const full: Titles = { ...empty, titles: ['t'] };
    const lines = (f: string): number => (f === 'a.test.ts' ? 1 : 0);
    expect(corpusGaps(['a.test.ts'], new Map([['a.test.ts', empty]]), ['a.test.ts'], lines)).toEqual({
      below: ['a.test.ts'],
      countsAgree: false,
      notInCorpus: [],
    });
    expect(corpusGaps(['a.test.ts'], new Map([['a.test.ts', full]]), ['a.test.ts', 'b.test.ts'], lines).notInCorpus).toEqual(['b.test.ts']);
    expect(parseZ('tests/é-ü.test.ts\0tests/a.test.ts\0')).toEqual(['tests/é-ü.test.ts', 'tests/a.test.ts']);
    const multi = "describe('d', () => {\n  it.each([\n    [1],\n  ])('e', f);\n  it('i', f);\n});\n";
    expect(belowWitness(multi, 'f.test.ts', DEFAULT_OPTIONS)).toBe(false);
    const noDescribe = { ...DEFAULT_OPTIONS, roots: new Set(['it', 'test']) };
    expect(belowWitness(multi, 'f.test.ts', noDescribe)).toBe(true);
    expect(belowWitness(multi, 'f.test.ts', { ...DEFAULT_OPTIONS, followCalls: false })).toBe(true);
  });

  it('TC-RWG-U-04: every id of every title and fragment is a row head', () => {
    const { entries, decl, per } = tree();
    expect(undeclaredOf(entries, decl)).toEqual([]);
    const all = [...per.values()];
    expect(all.flatMap((t) => t.opaque)).toEqual([]);
    expect(all.flatMap((t) => t.refused)).toEqual([]);
    const miss = problemsOf(`${G}: x`, [doc('docs/specs/cards/other.md', 'TC-GHOSTOTHERRWG-U-01')]);
    expect(miss.some((p) => p.includes(G))).toBe(true);
    expect(problemsOf(`${G}: x`, [doc('docs/specs/cards/ghostrwg.md', G)])).toEqual([]);
    const bold = { path: 'docs/specs/cards/ghostrwg.md', text: `| **${G}** | Unit |` };
    const marked = { path: 'docs/specs/cards/ghostrwg.md', text: `| ${G} ⬜ | Unit |` };
    expect(problemsOf(`${G}: x`, [bold])).toEqual([]);
    expect(problemsOf(`${G}: x`, [marked])).toEqual([]);
    expect(declarations([marked]).unplayed.has(G)).toBe(true);
  });

  it('TC-RWG-U-05: the owner of an id is the file its shape names', () => {
    const { entries, decl, derived } = tree();
    expect(misownedOf(entries, decl, derived)).toEqual([]);
    const b = bare(9901);
    const ok = doc('docs/specs/05_ghost.md', b);
    expect(problemsOf(`${b}: x`, [ok])).toEqual([]);
    for (const p of ['docs/specs/cards/ghostrwg.md', 'docs/specs/ghostlot/spec.md', 'docs/MASTER.md'])
      expect(problemsOf(`${b}: x`, [doc(p, b)]).length, p).toBe(1);
    const card = doc('docs/specs/cards/ghostrwg.md', G);
    expect(problemsOf(`${G}: x`, [card])).toEqual([]);
    expect(problemsOf(`${G}: x`, [card, doc('docs/specs/other_card.md', G)]).length).toBe(1);
    expect(problemsOf(`${G}: x`, [doc('docs/specs/ghostlot/spec.md', G), card]).length).toBeGreaterThan(0);
    expect(problemsOf(`${G}: x`, [doc('docs/specs/ghostlot/spec.md', G), doc('docs/specs/ghostrwg/spec.md', G)]).length).toBe(1);
    const lot = 'TC-GHOSTLOTRWG-U-01';
    expect(problemsOf(`${lot}: x`, [doc('docs/specs/ghostlot/spec.md', lot)])).toEqual([]);
    expect(problemsOf(`${lot}: x`, [doc('docs/specs/ghostlot/spec.md', lot), doc('docs/specs/ghostlot2/spec.md', lot)]).length).toBe(1);
    const wrongType = 'TC-GHOSTLOTRWG-I-01';
    expect(problemsOf(`${wrongType}: x`, [doc('docs/specs/ghostlot/spec.md', wrongType)]).length).toBe(1);
    const wrongType2 = 'IT-GHOSTLOTRWG-U-01';
    expect(problemsOf(`${wrongType2}: x`, [doc('docs/specs/ghostlot/spec.md', wrongType2)]).length).toBe(1);
    const nested = 'TC-GHOSTNEST-U-01';
    expect(problemsOf(`${nested}: x`, [doc('docs/specs/cards/ghostnest/spec.md', nested)]).length).toBe(1);
  });

  it('TC-RWG-U-06: stems, wildcards and lowercase are prose, the other shapes are refused', () => {
    const prose = ['TC-7xx a', 'TC-15xx b', 'TC-VACUUM-U- c', 'tc-202 d', 'TC-GHOSTRWG-U-1- e'];
    for (const t of prose) expect(readIds(t), t).toEqual({ ids: [], refused: [] });
    const bad = [
      'TC-GHOSTRWG-U-1b',
      'TC-GHOSTRWG-U-1bis',
      'TC-GHOSTRWG-U-1-old',
      'TC-GHOSTRWG-U-1_x',
      'TC-GHOSTRWG',
      'TC-${n}: x',
      'IT-${n}',
    ];
    for (const t of bad) {
      const r = readIds(t);
      expect([t, r.ids, r.refused.length]).toEqual([t, [], 1]);
    }
    expect(refusalsOf(fx(`${bad[0]}: y`))).toHaveLength(1);
    expect(refusalsOf(tree().entries)).toEqual([]);
  });

  it('TC-RWG-U-07: the reworded titles, the new spec row and the single declarations', () => {
    const { per, decl, docs } = tree();
    const id = (...p: string[]): string => p.join('-');
    const cases: Array<[string, string, string[]]> = [
      ['tests/cards/vacuum/vacuum-ids-declared.test.ts', id('TC', 'VOI', 'U', '10') + ':', [id('TC', '1528'), id('TC', '1529'), id('TC', '1530')]],
      ['tests/cards/vacuum/vacuum-ids-declared.test.ts', id('TC', 'VOI', 'U', '04') + ':', [id('TC', 'VE') + ' ']],
      ['tests/cards/water/water-history-aligned.test.ts', id('TC', 'WSA', 'U', '05') + ':', [id('IT', '003')]],
      ['tests/docs/spec-numbering.test.ts', id('TC', 'RN', 'U', '07') + ':', [id('TC', 'RN', 'U', '07b')]],
      ['tests/selectors/house.test.ts', id('TC', '208') + ':', [id('TC', '202b')]],
    ];
    for (const [file, head, dropped] of cases) {
      const titles = per.get(file)?.titles ?? [];
      expect(titles.some((t) => t.startsWith(head)), `${file} ${head}`).toBe(true);
      for (const d of dropped) expect(titles.filter((t) => t.includes(d)), `${file} ${d}`).toEqual([]);
    }
    const spec2 = read('docs/specs/02_domain_selectors.md').split('\n');
    const row = (p: string): number => spec2.findIndex((l) => l.startsWith(`| ${p} `) || l.startsWith(`| **${p}**`));
    const [i207, i208, i201] = [row(bare(207)), row(bare(208)), row(id('IT', '201'))];
    expect(i208).toBe(i207 + 1);
    expect(i201).toBeGreaterThan(i208);
    for (const w of ['getAreasByFloor', 'nonexistent_floor', '[]']) expect(spec2[i208], w).toContain(w);
    const cell = `tests/selectors/house.test.ts :: ${[201, 202, 205, 208].map(bare).join(', ')}, ${id('IT', '203')}`;
    expect(spec2.some((l) => l.includes(cell) && l.includes('F-DOM-04'))).toBe(true);
    for (const once of [bare(208), id('TC', 'RN', 'U', '07')]) {
      const n = docs.reduce((a, d) => a + d.text.split('\n').filter((l) => ROW_HEAD.exec(l)?.[1] === once).length, 0);
      expect([once, n]).toEqual([once, 1]);
    }
    expect([...(decl.heads.get(bare(208)) ?? [])]).toEqual(['docs/specs/02_domain_selectors.md']);
  });

  it('TC-RWG-U-08: this source spells only its own, ghost and fixture ids', () => {
    const { decl, derived } = tree();
    const src = read('tests/docs/repo-wide-ids-guard.test.ts');
    const tokens = [...new Set(src.match(/(?<![\w-])(?:TC|IT|UT)-[A-Z0-9]+(?:-[A-Z0-9]+)*[a-z]*(?![\w-])/g) ?? [])];
    expect(tokens.length).toBeGreaterThan(0);
    const allowed = /^(?:TC|IT)-(?:RWG-[UI]-\d+|GHOST[A-Z]*(?:-[UI]-\d+[a-z]*)?|99\d\d|\d+x+)$/;
    expect(tokens.filter((t) => !allowed.test(t))).toEqual([]);
    const cardOwned = new Set([...derived.values()]);
    const forbidden = tokens.filter(
      (t) => decl.unplayed.has(t) || [...(decl.heads.get(t) ?? [])].some((f) => cardOwned.has(f)),
    );
    expect(forbidden).toEqual([]);
  });

  it('TC-RWG-U-09: per-lot guards, retired cases and their lot specs', () => {
    const { decl, docs, entries } = tree();
    const id = (...p: string[]): string => p.join('-');
    const guards: Array<[string, string]> = [
      ['tests/cards/tv/tv-ids-declared.test.ts', 'TVO'],
      ['tests/cards/vacuum/vacuum-ids-declared.test.ts', 'VOI'],
      ['tests/cards/plugs/alias-ids-declared.test.ts', 'AOI'],
      ['tests/utils/bare-range-ids-declared.test.ts', 'BRI'],
      ['tests/cards/weather/weather-ids-declared.test.ts', 'WOI'],
      ['tests/cards/vehicles/vehicles-ids-declared.test.ts', 'VEHOI'],
      ['tests/cards/water/water-ids-declared.test.ts', 'WATOI'],
      ['tests/docs/spec-numbering.test.ts', 'RN'],
      ['tests/cards/water/water-history-aligned.test.ts', 'WSA'],
    ];
    const titlesIn = (f: string): string[] => entries.filter((e) => e.file === f).map((e) => e.text);
    for (const [f, p] of guards) {
      expect(existsSync(join(ROOT, f)), f).toBe(true);
      expect(titlesIn(f).some((t) => t.startsWith(id('TC', p, 'U', ''))), f).toBe(true);
    }
    const lots = docs.filter((d) => LOT.test(d.path));
    const retired = lots.flatMap((d) =>
      d.text.split('\n').flatMap((l) => {
        const m = /^\| *\*{0,2}((?:TC|IT)-[A-Z0-9]+(?:-[A-Z0-9]+)*)\*{0,2} \[RETIRED\]/.exec(l);
        return m?.[1] ? [m[1]] : [];
      }),
    );
    expect(retired.length).toBeGreaterThan(0);
    const cited = new Set(entries.flatMap((e) => readIds(e.text).ids));
    expect(retired.filter((r) => decl.heads.has(r) || cited.has(r))).toEqual([]);
    for (const kept of [id('TC', 'TVO', 'U', '01'), id('TC', 'WATOI', 'U', '02')]) {
      expect(decl.heads.has(kept), kept).toBe(true);
      expect(cited.has(kept), kept).toBe(true);
    }
    const edited = lots.filter((d) => d.text.includes(' [RETIRED]'));
    expect(edited.length).toBeGreaterThan(0);
    for (const d of edited) {
      const lines = d.text.split('\n');
      const frs = lines.flatMap((l) => /^- \*\*(FR-\d+)\*\*/.exec(l)?.[1] ?? []);
      const covered = new Set<string>();
      for (const l of lines) {
        const cells = l.split('|').map((c) => c.trim());
        if (!/^\*{0,2}(?:TC|IT)-/.test(cells[1] ?? '') || (cells[1] ?? '').includes('[RETIRED]')) continue;
        for (const c of (cells[3] ?? '').split(',').map((x) => x.trim())) {
          const r = /^FR-(\d+)\.\.FR-(\d+)$/.exec(c);
          if (r) for (let n = Number(r[1]); n <= Number(r[2]); n++) covered.add(`FR-${n}`);
          else covered.add(c);
        }
      }
      expect(frs.filter((f) => !covered.has(f)), d.path).toEqual([]);
      for (const l of lines.filter((x) => x.startsWith('- **FR-'))) {
        expect(l, d.path).not.toMatch(/fails on a fixture|absorbs/);
      }
    }
    expect(read('tests/cards/water/water-ids-declared.test.ts')).toContain('const mixed =');
  });
});
