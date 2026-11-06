/**
 * Icon contract guards — docs/specs/icon-contract/spec.md.
 * TC-ICC-U-04, 07, 08, 10, 11. Each detector is fed a negative fixture it must
 * flag (spec anti-pattern 7), and every scan states what it scanned.
 */
import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import WEATHER_ICONS from '../../src/components/sf-icon/data/sf-weather-icons.js';

const ROOT = process.cwd();
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf8');

/** Every .ts file under src/, read from the filesystem (new files are untracked). */
function srcFiles(dir = join(ROOT, 'src')): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return srcFiles(p);
    return p.endsWith('.ts') && !p.endsWith('.d.ts') ? [relative(ROOT, p)] : [];
  });
}
const SRC = srcFiles();

// ─── TC-ICC-U-04 ─────────────────────────────────────────────────────────────

const overridesRenderRoot = (text: string): boolean => /\bcreateRenderRoot\s*\(/.test(text);

describe('TC-ICC-U-04 FR-4 light-DOM components are pinned', () => {
  it('TC-ICC-U-04: only sf-icon.ts overrides createRenderRoot, and the detector flags a fixture', () => {
    expect(SRC.length).toBeGreaterThan(50);
    expect(overridesRenderRoot('protected override createRenderRoot(): HTMLElement { return this; }')).toBe(true);
    expect(SRC.filter((f) => overridesRenderRoot(read(f)))).toEqual(['src/components/sf-icon/sf-icon.ts']);
  });

  it('TC-ICC-U-04: Spec 04 AP#3 names sf-icon and sci-icon as the exception', () => {
    const row = read('docs/specs/04_components.md')
      .split('\n')
      .find((l) => l.startsWith('| 3 | Component styles leak'))!;
    expect(row).toContain('`sf-icon`');
    expect(row).toContain('`sci-icon`');
    expect(row).toContain('light DOM');
  });
});

// ─── TC-ICC-U-07 ─────────────────────────────────────────────────────────────

/** Bare package specifiers imported by one source text, in every import form. */
export function bareSpecifiers(text: string): string[] {
  const sf = ts.createSourceFile('x.ts', text, ts.ScriptTarget.Latest, true);
  const found: string[] = [];
  const add = (lit: ts.Node | undefined): void => {
    if (lit && ts.isStringLiteralLike(lit)) found.push(lit.text);
  };
  const visit = (n: ts.Node): void => {
    if (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) add(n.moduleSpecifier);
    else if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) add(n.arguments[0]);
    else if (ts.isImportTypeNode(n) && ts.isLiteralTypeNode(n.argument)) add(n.argument.literal);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found
    .filter((s) => !s.startsWith('.') && !s.startsWith('/') && !s.startsWith('node:'))
    .map((s) => (s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0]!));
}

describe('TC-ICC-U-07 FR-7 every bare import is declared', () => {
  const pkg = JSON.parse(read('package.json')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);

  it('TC-ICC-U-07: sf-toast.ts renders through lit, not lit-html', () => {
    expect(read('src/components/sf-toast.ts')).not.toMatch(/from\s+['"]lit-html['"]/);
    expect(bareSpecifiers(read('src/components/sf-toast.ts'))).toContain('lit');
  });

  it.each([
    ["import 'lit-html';"],
    ["import x from 'lit-html';"],
    ["export { x } from 'lit-html';"],
    ["export * from 'lit-html';"],
    ["const m = await import('lit-html');"],
    ['type T = import("lit-html").X;'],
  ])('TC-ICC-U-07: the detector reports %s as undeclared', (fixture) => {
    const bare = bareSpecifiers(fixture);
    expect(bare).toEqual(['lit-html']);
    expect(declared.has('lit-html')).toBe(false);
  });

  it('TC-ICC-U-07: no undeclared specifier under src/', () => {
    const undeclared = SRC.flatMap((f) =>
      bareSpecifiers(read(f))
        .filter((s) => !declared.has(s))
        .map((s) => `${f}: ${s}`),
    );
    expect(undeclared).toEqual([]);
    expect(SRC.flatMap((f) => bareSpecifiers(read(f))).length).toBeGreaterThan(20);
  });
});

// ─── TC-ICC-U-08 ─────────────────────────────────────────────────────────────

/** Element names written in backticks in the "Covered here" cell, before any ⬜. */
export function claimedElements(row: string): string[] {
  const cell = row.split('|')[3] ?? '';
  if (!cell.includes('✅')) return [];
  const claimed = cell.split('⬜')[0]!;
  return [...claimed.matchAll(/`([^`]+)`/g)].map((m) => m[1]!).filter((t) => /^(sf|sci)-[a-z0-9-]+$/.test(t));
}

const declaredElements = new Set(
  SRC.flatMap((f) => [...read(f).matchAll(/@customElement\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]!)),
);
const missing = (row: string): string[] => claimedElements(row).filter((n) => !declaredElements.has(n));

describe('TC-ICC-U-08 FR-5 a ✅ row names only elements that exist', () => {
  it('TC-ICC-U-08: the detector on fixtures', () => {
    expect(missing('| F-X | d | ✅ `sf-ghost` | t |')).toEqual(['sf-ghost']);
    expect(missing('| F-X | d | ✅ `sf-icon` ⬜ `sf-tabs` | t |')).toEqual([]);
    expect(missing('| F-X | d | ✅ ⬜ `sf-tabs` | t |')).toEqual([]);
    expect(missing('| F-X | d | ✅ `sf-tabs` ⬜ none | t |')).toEqual(['sf-tabs']);
    expect(missing('| F-X | d | ✅ `sf-icon.ts` | t |')).toEqual([]);
    expect(missing('| F-X | d | ✅ `src/components/sf-icon/` | t |')).toEqual([]);
    expect(missing('| F-X | d | ⬜ `sf-ghost` | t |')).toEqual([]);
  });

  it('TC-ICC-U-08: every real ✅ element of Blueprint Coverage has a @customElement', () => {
    const section = read('docs/specs/04_components.md').split('## Blueprint Coverage')[1]!.split('\n---')[0]!;
    const rows = section.split('\n').filter((l) => /^\| F-COMP-\d+/.test(l));
    expect(rows.length).toBeGreaterThanOrEqual(6);
    expect(declaredElements.has('sf-icon')).toBe(true);
    expect(rows.flatMap(missing)).toEqual([]);
    expect(rows.flatMap(claimedElements).length).toBeGreaterThan(0);
  });
});

// ─── TC-ICC-U-10 ─────────────────────────────────────────────────────────────

describe('TC-ICC-U-10 FR-8 the texts say what the code does', () => {
  const spec04 = read('docs/specs/04_components.md');
  const line = (start: string): string => spec04.split('\n').find((l) => l.startsWith(start)) ?? '';

  it('TC-ICC-U-10: sci-icon.ts header no longer claims to mirror sf-icon', () => {
    const header = read('src/components/sf-icon/sci-icon.ts').split('*/')[0]!;
    expect(header.length).toBeGreaterThan(20);
    expect(header).not.toMatch(/Mirrors/);
    expect(header).not.toMatch(/identical/);
  });

  it('TC-ICC-U-10: Spec 04 rows carry the amended wording', () => {
    expect(line('| `<sci-icon>`')).toContain('subclass');
    expect(line('| 5 | Fetch flood')).toContain('by construction');
    expect(line('| 5 | Fetch flood')).toMatch(/per `?connection`?/);
    const picker = spec04.split('### HA Icon Picker API')[1]!.split('\n---')[0]!;
    expect(picker).toContain('STATIC_ICON_NAMES');
    expect(line('| TC-407')).toContain('STATIC_ICON_NAMES');
    expect(line('| TC-408')).toContain('TC-ICC-U-01');
    const errors = spec04.split('## Error Handling')[1]!;
    expect(errors).toContain('window.customIcons.sci.getIcon');
  });

  it('TC-ICC-U-10: the lot spec bans the cast in src/components/sf-icon/ (its AP#1)', () => {
    const ap1 = read('docs/specs/icon-contract/spec.md')
      .split('\n')
      .find((l) => l.startsWith('| 1 | A double cast'))!;
    expect(ap1).toContain('`src/components/sf-icon/`');
  });
});

// ─── TC-ICC-U-11 ─────────────────────────────────────────────────────────────

describe('TC-ICC-U-11 FR-9 release note', () => {
  it('TC-ICC-U-11: CHANGELOG.md announces the weather icons leaving the picker', () => {
    expect(existsSync(join(ROOT, 'CHANGELOG.md'))).toBe(true);
    // Under `# Unreleased` until the release, then under its version heading: the note stays once, wherever it sits.
    const changelog = read('CHANGELOG.md');
    // The number is the count of weather icons in the data file, not a figure copied from the spec.
    const count = String(Object.keys(WEATHER_ICONS).length);
    const hit = changelog
      .split('\n')
      .filter((l) => l.includes(`the ${count} animated`) && l.includes('icon picker') && l.includes('<sf-icon>'));
    expect(hit).toHaveLength(1);
  });
});
