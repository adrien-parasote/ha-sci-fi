/**
 * Domain-literal guard on the real src/ tree — lot domain-constants
 * (spec docs/specs/domain-constants/spec.md, FR-3, FR-5, FR-8, FR-9).
 * Instrument fixtures: tests/helpers/domain-scan.test.ts. The file set is derived from the
 * filesystem at each run (`git ls-files -co --exclude-standard`, new files are untracked
 * until HARDEN); nothing is frozen but the per-file per-key table and the allow-list.
 */
import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DOMAIN } from '../../src/types/domains.js';
import {
  UNIVERSE,
  scanSource,
  checkAllowList,
  crossCheck,
  visitedDiff,
  type AllowEntry,
  type Finding,
} from '../helpers/domain-scan.js';

const ROOT = process.cwd();
const DOMAINS_FILE = 'src/types/domains.ts';
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf8');

const lsFiles = (): string[] =>
  execFileSync('git', ['ls-files', '-co', '--exclude-standard', 'src/**/*.ts'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
/** Every source file the guard must scan: src/ minus locales and the constant module itself. */
const expectedFiles = (): string[] => lsFiles().filter((f) => !f.startsWith('src/locales/') && f !== DOMAINS_FILE);

/** The scan, returning what it visited next to what it found. */
function scanTree(files: readonly string[]): { visited: string[]; findings: Finding[] } {
  const visited: string[] = [];
  const findings: Finding[] = [];
  for (const f of files) {
    visited.push(f);
    findings.push(...scanSource(f, read(f)));
  }
  return { visited, findings };
}

const e = (file: string, literal: string, context: string, max: number, reason: string): AllowEntry => ({
  file,
  literal,
  context,
  max,
  reason,
});
const HEXA = 'src/cards/hexa-tiles/sci-fi-hexa-tiles.ts';
const HEXA_EDITOR = 'src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts';
const STOVE_EDITOR = 'src/cards/stove/sci-fi-stove-editor.ts';
const KINDS = 'ArrayLiteralExpression:ENTITY_KINDS';
const KIND_CMP = 'BinaryExpression:kind';

/** The bounded allow-list (D2, FR-9): 13 tokens. `renault` is outside the universe: no entry. */
export const ALLOW: readonly AllowEntry[] = [
  e(HEXA_EDITOR, 'light', KINDS, 1, 'config-kind vocabulary: the entity_kind choices of a tile'),
  e(HEXA_EDITOR, 'climate', KINDS, 1, 'config-kind vocabulary: the entity_kind choices of a tile'),
  e(HEXA_EDITOR, 'vacuum', KINDS, 1, 'config-kind vocabulary: the entity_kind choices of a tile'),
  e(HEXA_EDITOR, 'switch', KINDS, 1, 'config-kind vocabulary: the entity_kind choices of a tile'),
  e(HEXA_EDITOR, 'light', 'PropertyAssignment:entity_kind', 1, 'config-kind default of a new tile'),
  e(HEXA, 'light', KIND_CMP, 1, 'compares a hybrid config kind or entity domain (tile.entity_kind ?? split), D2'),
  e(HEXA, 'switch', KIND_CMP, 1, 'compares a hybrid config kind or entity domain (tile.entity_kind ?? split), D2'),
  e(HEXA, 'climate', KIND_CMP, 1, 'compares a hybrid config kind or entity domain (tile.entity_kind ?? split), D2'),
  e(STOVE_EDITOR, 'sensor', KIND_CMP, 1, 'stove editor config kind, not an entity domain'),
  e(STOVE_EDITOR, 'sensor', 'CallExpression:_renderInput', 1, 'stove editor config kind passed to the input renderer'),
  e('src/cards/bridge/sections/sf-bridge-access.ts', 'lock', 'VariableDeclaration:service', 1, 'the service action lock, not the lock domain'),
  e('src/components/sf-stack-bar.ts', 'light', 'VariableDeclaration:cls', 1, 'a CSS variant class, not a domain'),
  e('src/components/editor-inputs/sf-editor-input.ts', 'text', 'PropertyDeclaration:type', 1, 'an HTML input type; text is also a HA domain'),
];

describe('domain literals guard (real tree)', () => {
  it('IT-DC-I-01 leaves no domain literal outside the allow-list, and DOMAIN is referenced 111 times', () => {
    const { findings } = scanTree(expectedFiles());
    expect(checkAllowList(findings, ALLOW)).toEqual([]);
    expect(countDomainRefs(expectedFiles()).total).toBeGreaterThanOrEqual(111);
  });

  it('TC-DC-U-09 holds an allow-list of 13 tokens, each with reason, max and context, no renault', () => {
    for (const entry of ALLOW) {
      expect(entry.reason.trim().length, entry.file).toBeGreaterThan(0);
      expect(entry.max).toBeGreaterThanOrEqual(1);
      expect(entry.context).toMatch(/^[A-Za-z]+:.+/);
      expect(entry.literal).not.toBe('renault');
    }
    const perFile: Record<string, number> = {};
    for (const entry of ALLOW) perFile[entry.file] = (perFile[entry.file] ?? 0) + entry.max;
    expect(perFile).toEqual({
      [HEXA_EDITOR]: 5,
      [HEXA]: 3,
      [STOVE_EDITOR]: 2,
      'src/cards/bridge/sections/sf-bridge-access.ts': 1,
      'src/components/sf-stack-bar.ts': 1,
      'src/components/editor-inputs/sf-editor-input.ts': 1,
    });
    expect(ALLOW.reduce((n, x) => n + x.max, 0)).toBe(13);
  });

  it('TC-DC-U-10 pins the universe: DOMAIN values are inside it, renault and plug are not', () => {
    for (const value of Object.values(DOMAIN)) expect(UNIVERSE).toContain(value);
    expect(UNIVERSE).not.toContain('renault');
    expect(UNIVERSE).not.toContain('plug');
    expect(new Set(UNIVERSE).size).toBe(UNIVERSE.length);
  });

  it('TC-DC-U-11 scans exactly the files git lists for src/ (minus locales), and the regex agrees with the AST scan', () => {
    const files = expectedFiles();
    expect(files.length).toBeGreaterThan(100);
    expect(files.some((f) => f.startsWith('src/locales/'))).toBe(false);
    const { visited, findings } = scanTree(files);
    expect(visitedDiff(visited, files)).toEqual([]);
    // a scan that dropped one file reads clean there: the diff names it
    expect(visitedDiff(visited.slice(1), files)).toEqual([`dropped: ${files[0]}`]);
    // the differently-shaped scan finds nothing the AST scan did not
    const sources = files.map((file) => ({ file, text: read(file) }));
    expect(crossCheck(sources, findings)).toEqual([]);
    // AST layer stubbed to return nothing: the cross-check fails on the real tree (the instrument is not blind)
    // (post-refactor the tree holds only the allow-list literals, so these are what it must name)
    expect(crossCheck(sources, []).length).toBeGreaterThanOrEqual(ALLOW.length);
  });
});

// ─── per-file per-key table (TC-DC-U-08) ───────────────────────────────────────────────

/** `DOMAIN.<KEY>` references per file, counted on the AST (template spans and computed keys included). */
function countDomainRefs(files: readonly string[]): { total: number; perFile: Record<string, Record<string, number>> } {
  const perFile: Record<string, Record<string, number>> = {};
  let total = 0;
  for (const file of files) {
    const sf = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const visit = (n: ts.Node): void => {
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'DOMAIN') {
        const row = (perFile[file] ??= {});
        row[n.name.text] = (row[n.name.text] ?? 0) + 1;
        total++;
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  return { total, perFile };
}

interface SiteTable {
  base: string;
  total: number;
  files: Record<string, Record<string, number>>;
}
const table = (): SiteTable => JSON.parse(read('tests/specs/domain-site-table.json')) as SiteTable;

describe('per-file per-key table', () => {
  it('TC-DC-U-08 and IT-DC-I-02 match the committed table: each card uses the same domain keys as before, 117 in all', () => {
    // 111 at 35f1020, + 1 DOMAIN.CLIMATE in the stove editor (fix lot vague-1, bead ha-sci-fi-iu8m),
    // + DOMAIN.NUMBER and DOMAIN.INPUT_NUMBER in the stove card (lot stove-power-level, FR-12),
    // moved to number-wheel.ts, + BINARY_SENSOR and 2 SENSOR in stove diagnostics.ts (lot stove-diagnostics)
    const t = table();
    expect(t.base).toBe('35f1020');
    expect(t.total).toBe(117);
    expect(Object.values(t.files).flatMap((r) => Object.values(r)).reduce((a, b) => a + b, 0)).toBe(117);
    expect(countDomainRefs(expectedFiles()).perFile).toEqual(t.files);
  });

  it('TC-DC-U-07 keeps every one of the 24 DOMAIN keys in use, the precondition of the mutation protocol', () => {
    const used = new Set(Object.values(table().files).flatMap((r) => Object.keys(r)));
    expect([...used].sort()).toEqual(Object.keys(DOMAIN).sort());
  });
});

describe('spec 02 pointer', () => {
  it('IT-DC-I-03 names the lot and the 111 count in anti-pattern 5', () => {
    const row = read('docs/specs/02_domain_selectors.md')
      .split('\n')
      .find((l) => l.startsWith('| 5 | Hardcoded entity types'));
    expect(row).toBeDefined();
    expect(row).toContain('domain-constants');
    expect(row).toContain('111');
  });
});
