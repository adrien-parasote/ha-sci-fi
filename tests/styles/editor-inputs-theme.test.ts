/**
 * @vitest-environment happy-dom
 *
 * editor-inputs-theme — docs/specs/editor-inputs-theme/spec.md.
 *
 * The 11 editor-inputs read the `--editor-*` family declared on the card
 * editor's `:host` (editor-common.ts), each with today's literal as fallback.
 * The port is visually neutral: the folded CSS is compared with a baseline
 * captured on the pre-port sheets at base commit 5251aa3 (IT-EIT-I-05 binds it).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, rmSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';
import { flattenStyles, foldCss, diffFolded, type FoldedCss } from './css-equivalence.js';
import { blankComments } from '../helpers/blank-comments.js';
import { sciFiEditorCommonStyles } from '../../src/styles/editor-common.js';

import { SfEditorAccordion } from '../../src/components/editor-inputs/sf-editor-accordion.js';
import { SfEditorAction } from '../../src/components/editor-inputs/sf-editor-action.js';
import { SfEditorChips } from '../../src/components/editor-inputs/sf-editor-chips.js';
import { SfEditorColorPicker } from '../../src/components/editor-inputs/sf-editor-color-picker.js';
import { SfEditorDropdownEntity } from '../../src/components/editor-inputs/sf-editor-dropdown-entity.js';
import { SfEditorDropdownIcon } from '../../src/components/editor-inputs/sf-editor-dropdown-icon.js';
import { SfEditorDropdown } from '../../src/components/editor-inputs/sf-editor-dropdown.js';
import { SfEditorInput } from '../../src/components/editor-inputs/sf-editor-input.js';
import { SfEditorMultiEntity } from '../../src/components/editor-inputs/sf-editor-multi-entity.js';
import { SfEditorSlider } from '../../src/components/editor-inputs/sf-editor-slider.js';
import { SfEditorSourceList } from '../../src/components/editor-inputs/sf-editor-source-list.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const INPUTS_DIR = join(ROOT, 'src', 'components', 'editor-inputs');
const COMMON_PATH = join(ROOT, 'src', 'styles', 'editor-common.ts');
const SHARED_PATH = join(ROOT, 'src', 'styles', 'editor-inputs-shared.ts');
const BASELINE_REL = 'tests/styles/editor-inputs-css-baseline.json';
const BASELINE_PATH = join(ROOT, BASELINE_REL);

export const COMPONENTS: Record<string, { styles?: unknown }> = {
  'sf-editor-accordion': SfEditorAccordion,
  'sf-editor-action': SfEditorAction,
  'sf-editor-chips': SfEditorChips,
  'sf-editor-color-picker': SfEditorColorPicker,
  'sf-editor-dropdown-entity': SfEditorDropdownEntity,
  'sf-editor-dropdown-icon': SfEditorDropdownIcon,
  'sf-editor-dropdown': SfEditorDropdown,
  'sf-editor-input': SfEditorInput,
  'sf-editor-multi-entity': SfEditorMultiEntity,
  'sf-editor-slider': SfEditorSlider,
  'sf-editor-source-list': SfEditorSourceList,
};

/** § Token table: token -> [Declared value, Fallback literal]. */
const TOKEN_TABLE: Record<string, [string, string]> = {
  '--editor-accent': ['var(--primary-color, #00d2ff)', '#00d2ff'],
  '--editor-text': ['var(--primary-text-color, #e0e8ff)', '#e0e8ff'],
  '--editor-text-secondary': ['var(--secondary-text-color, rgba(224, 232, 255, 0.6))', 'rgba(224, 232, 255, 0.6)'],
  '--editor-text-hint': ['var(--secondary-text-color, rgba(224, 232, 255, 0.5))', 'rgba(224, 232, 255, 0.5)'],
  '--editor-text-disabled': ['var(--disabled-text-color, rgba(224, 232, 255, 0.3))', 'rgba(224, 232, 255, 0.3)'],
  '--editor-error': ['var(--error-color, #ff4444)', '#ff4444'],
  '--editor-error-soft': ['rgba(255, 68, 68, 0.12)', 'rgba(255, 68, 68, 0.12)'],
  '--editor-error-faint': ['rgba(255, 68, 68, 0.1)', 'rgba(255, 68, 68, 0.1)'],
  '--editor-surface': ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.02)'],
  '--editor-surface-input': ['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.04)'],
  '--editor-field-bg': ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.3)'],
  '--editor-field-border': ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.1)'],
  '--editor-accent-border': ['rgba(0, 210, 255, 0.2)', 'rgba(0, 210, 255, 0.2)'],
  '--editor-accent-faint': ['rgba(0, 210, 255, 0.1)', 'rgba(0, 210, 255, 0.1)'],
  '--editor-chip-bg': ['rgba(0, 210, 255, 0.12)', 'rgba(0, 210, 255, 0.12)'],
  '--editor-accent-track': ['rgba(0, 210, 255, 0.15)', 'rgba(0, 210, 255, 0.15)'],
  '--editor-chip-border': ['rgba(0, 210, 255, 0.25)', 'rgba(0, 210, 255, 0.25)'],
  '--editor-accent-line': ['rgba(0, 210, 255, 0.3)', 'rgba(0, 210, 255, 0.3)'],
  '--editor-accent-strong-border': ['rgba(0, 210, 255, 0.4)', 'rgba(0, 210, 255, 0.4)'],
  '--editor-accent-strong': ['rgba(0, 210, 255, 0.8)', 'rgba(0, 210, 255, 0.8)'],
  '--editor-popup-bg': ['var(--ha-card-background, rgba(15, 20, 35, 0.98))', 'rgba(15, 20, 35, 0.98)'],
  '--editor-shadow': ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.4)'],
  '--editor-accordion-border': ['var(--secondary-light-color, rgb(102, 156, 210))', 'rgb(102, 156, 210)'],
  '--editor-accordion-header-bg': ['var(--secondary-light-alpha-color, rgba(102, 156, 210, 0.5))', 'rgba(102, 156, 210, 0.5)'],
  '--editor-accordion-accent': ['var(--primary-light-color, rgb(105, 211, 251))', 'rgb(105, 211, 251)'],
  '--editor-font-small': ['var(--font-size-small, 12px)', '12px'],
  '--editor-radius': ['var(--border-radius, 5px)', '5px'],
  '--editor-border-width': ['var(--border-width, 1px)', '1px'],
  '--editor-accordion-shade-top': ['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.7)'],
  '--editor-accordion-shade-bottom': ['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.2)'],
};

const PRE_EXISTING: Record<string, string> = {
  '--editor-gap': '10px',
  '--editor-section-color': 'var(--secondary-text-color, rgba(224, 232, 255, 0.6))',
  '--editor-border': 'var(--divider-color, rgba(0, 210, 255, 0.2))',
  '--editor-chip-bg': 'rgba(0, 210, 255, 0.12)',
  '--editor-chip-color': 'var(--primary-text-color, #e0e8ff)',
  '--editor-icon-size': '18px',
};

const norm = (s: string): string => s.trim().replace(/\s+/g, ' ');

// ── source helpers ──────────────────────────────────────────────────────────

/** The text of each `css\`…\`` block of a source. */
export function cssBlocks(src: string): string[] {
  const out: string[] = [];
  let i = src.indexOf('css`');
  while (i >= 0) {
    const start = i + 4;
    const end = src.indexOf('`', start);
    if (end < 0) break;
    out.push(src.slice(start, end));
    i = src.indexOf('css`', end + 1);
  }
  return out;
}

/** The editor-input sources: the 11 components plus the shared sheet they compose. */
export function inputSources(): Array<[string, string]> {
  const files = readdirSync(INPUTS_DIR)
    .filter((f) => f.endsWith('.ts'))
    .sort()
    .map((f) => join(INPUTS_DIR, f));
  files.push(SHARED_PATH);
  return files.map((p) => [relative(ROOT, p), blankComments(readFileSync(p, 'utf8'))]);
}

// ── § Resolver ──────────────────────────────────────────────────────────────

interface VarRef {
  start: number;
  end: number; // index after the closing paren
  name: string;
  fallback: string | null;
  fbStart: number;
  fbEnd: number;
}

/** Parses the `var(` at index i (depth-counting, never a regex). */
function parseVarAt(css: string, i: number): VarRef {
  let depth = 1;
  let j = i + 4;
  let comma = -1;
  while (j < css.length && depth > 0) {
    const ch = css[j];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 1 && comma < 0) comma = j;
    if (depth > 0) j++;
  }
  const argStart = i + 4;
  const name = norm(css.slice(argStart, comma < 0 ? j : comma));
  const fallback = comma < 0 ? null : css.slice(comma + 1, j).trim();
  return { start: i, end: j + 1, name, fallback, fbStart: comma + 1, fbEnd: j };
}

/** Every `var(` of a css text, nested ones included. */
function allVars(css: string): VarRef[] {
  const refs: VarRef[] = [];
  let i = css.indexOf('var(');
  while (i >= 0) {
    if (!/[-\w]/.test(css[i - 1] ?? '')) refs.push(parseVarAt(css, i));
    i = css.indexOf('var(', i + 1);
  }
  return refs;
}

/** Parses the first `:host { … }` rule's custom-property declarations. */
function parseHostDecls(css: string): Array<[string, string]> {
  const host = /:host\s*\{([^}]*)\}/.exec(css);
  if (!host) return [];
  const out: Array<[string, string]> = [];
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(host[1]!))) out.push([m[1]!, norm(m[2]!)]);
  return out;
}

const DECLARED: Record<string, string> = Object.fromEntries(
  parseHostDecls(flattenStyles(sciFiEditorCommonStyles)).filter(([n]) => n.startsWith('--editor-')),
);

/** Collects and drops the `--_x: V;` locals of the `:host` rules only; returns the stripped css and the map. */
function takeLocals(css: string): [string, Record<string, string>] {
  const locals: Record<string, string> = {};
  const stripped = css.replace(/:host\s*\{[^}]*\}/g, (rule) =>
    rule.replace(/(--_[\w-]+)\s*:\s*([^;]+);/g, (_m, n: string, v: string) => {
      locals[n] = v.trim();
      return '';
    }),
  );
  return [stripped, locals];
}

export function resolveVars(
  css: string,
  mode: 'declared' | 'fallback' | 'locals',
  declared: Record<string, string> = DECLARED,
): string {
  let text = css;
  let locals: Record<string, string> = {};
  if (mode === 'locals' || mode === 'fallback') [text, locals] = takeLocals(text);

  let i = text.indexOf('var(');
  while (i >= 0) {
    if (/[-\w]/.test(text[i - 1] ?? '')) { i = text.indexOf('var(', i + 1); continue; }
    const ref = parseVarAt(text, i);
    let replacement: string | null = null;
    let rescan = false;
    if (mode === 'declared') {
      if (ref.name.startsWith('--editor-')) {
        const v = declared[ref.name];
        if (v === undefined) throw new Error(`undeclared token ${ref.name}`);
        replacement = v;
      }
    } else if (mode === 'locals') {
      if (ref.name.startsWith('--_') && ref.name in locals) replacement = locals[ref.name]!;
    } else {
      rescan = true;
      if (ref.fallback !== null) replacement = ref.fallback;
      else if (ref.name in locals) replacement = locals[ref.name]!;
      else throw new Error(`no fallback for ${ref.name}`);
    }
    if (replacement === null) { i = text.indexOf('var(', ref.end); continue; }
    text = text.slice(0, i) + replacement + text.slice(ref.end);
    i = rescan ? text.indexOf('var(', i) : text.indexOf('var(', i + replacement.length);
  }
  return text;
}

export function foldComponent(cls: { styles?: unknown }, mode: 'declared' | 'fallback' | 'locals', declared?: Record<string, string>): FoldedCss {
  return foldCss(resolveVars(flattenStyles(cls.styles), mode, declared));
}

// ── FR-2 / FR-3 scanner ─────────────────────────────────────────────────────

const NAMED_COLOURS = (
  'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
  'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
  'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred ' +
  'darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue ' +
  'dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray ' +
  'green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen ' +
  'lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink ' +
  'lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen ' +
  'linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue ' +
  'mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy ' +
  'oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip ' +
  'peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown ' +
  'seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal ' +
  'thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
).split(' ');

/** Offsets of colour literals (FR-3) inside declaration values of a css text. */
function colourLiterals(css: string): number[] {
  const hits: number[] = [];
  const decl = /([-a-zA-Z]+)\s*:([^;{}]*)(?=[;}])/g;
  let d: RegExpExecArray | null;
  while ((d = decl.exec(css))) {
    const value = d[2]!;
    const base = d.index + d[0].length - value.length;
    const re = new RegExp(
      '#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z])|(?<![-a-zA-Z])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\\(|' +
        `(?<![-a-zA-Z])(?:${NAMED_COLOURS.join('|')})(?![-a-zA-Z])`,
      'gi',
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(value))) {
      if (m[0].startsWith('#') && ![4, 5, 7, 9].includes(m[0].length)) continue;
      hits.push(base + m.index);
    }
  }
  return hits;
}

/** The U-02 scan: returns one problem string per violation. */
export function scanCss(css: string): string[] {
  const problems: string[] = [];
  if (css.includes('${')) problems.push('interpolation ${');
  if (css.includes('color-mix(')) problems.push('color-mix(');
  const vars = allVars(css);
  const spans: Array<[number, number]> = [];
  for (const v of vars) {
    if (!v.name.startsWith('--editor-')) problems.push(`var(${v.name}) is not an --editor-* token`);
    else if (v.fallback === null) problems.push(`var(${v.name}) has no fallback`);
    else spans.push([v.fbStart, v.fbEnd]);
  }
  for (const at of colourLiterals(css)) {
    if (!spans.some(([s, e]) => at >= s && at < e)) {
      problems.push(`colour literal outside a fallback: ${css.slice(at, at + 24).split(/[;\n]/)[0]}`);
    }
  }
  return problems;
}

function readBaseline(): { baseCommit: string; inEditor: Record<string, FoldedCss>; standalone: { accordion: FoldedCss } } {
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
}

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

// ── unit ────────────────────────────────────────────────────────────────────

describe('editor-inputs-theme — unit', () => {
  it('TC-EIT-U-01: no --_ local in editor-inputs', () => {
    expect(inputSources().map(([f]) => f)).toContain(join('src', 'styles', 'editor-inputs-shared.ts'));
    const hits = inputSources().flatMap(([f, src]) => (src.match(/--_/g) ?? []).map(() => f));
    expect(hits).toEqual([]);
  });

  it('TC-EIT-U-02: every var( is an --editor-* with fallback, colours only as fallbacks', () => {
    const problems = inputSources().flatMap(([f, src]) => cssBlocks(src).flatMap((b) => scanCss(b).map((p) => `${f}: ${p}`)));
    expect(problems).toEqual([]);
    expect(readFileSync(COMMON_PATH, 'utf8')).not.toContain('color-mix(');
  });

  it('TC-EIT-U-03: reads match the token table; editor-common declares each once', () => {
    const decls = parseHostDecls(flattenStyles(sciFiEditorCommonStyles)).filter(([n]) => n.startsWith('--editor-'));
    const names = decls.map(([n]) => n);
    expect(names.filter((n, k) => names.indexOf(n) !== k)).toEqual([]);
    for (const [token, [declared]] of Object.entries(TOKEN_TABLE)) expect(DECLARED[token], token).toBe(declared);
    for (const [token, value] of Object.entries(PRE_EXISTING)) expect(DECLARED[token], token).toBe(value);

    const problems: string[] = [];
    for (const [f, src] of inputSources()) {
      for (const block of cssBlocks(src)) {
        for (const v of allVars(block)) {
          if (!v.name.startsWith('--editor-')) continue;
          const row = TOKEN_TABLE[v.name];
          if (!row) problems.push(`${f}: ${v.name} not in the token table`);
          else if (norm(v.fallback ?? '') !== row[1]) problems.push(`${f}: ${v.name} fallback "${v.fallback}" != "${row[1]}"`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('TC-EIT-U-04: no editor-input imports editor-common', () => {
    const hits = inputSources().filter(([, src]) => /import[^;]*(editor-common|sciFiEditorCommonStyles)/.test(src));
    expect(hits.map(([f]) => f)).toEqual([]);
  });

  it('TC-EIT-U-05: dropdown-entity secondary text reads --editor-text-hint', () => {
    const src = blankComments(readFileSync(join(INPUTS_DIR, 'sf-editor-dropdown-entity.ts'), 'utf8'));
    expect(cssBlocks(src).join('')).toContain('var(--editor-text-hint, rgba(224, 232, 255, 0.5))');
    expect(DECLARED['--editor-text-hint']).toBe('var(--secondary-text-color, rgba(224, 232, 255, 0.5))');
    expect(DECLARED['--editor-text-secondary']).toBe('var(--secondary-text-color, rgba(224, 232, 255, 0.6))');
  });

  it('TC-EIT-U-06: resolver fixtures', () => {
    expect(resolveVars('a: var(--x, rgba(1, 2, 3, 0.5));', 'fallback')).toBe('a: rgba(1, 2, 3, 0.5);');
    expect(resolveVars('a: var(--x, var(--y, #fff));', 'fallback')).toBe('a: #fff;');
    expect(resolveVars('a: var(--editor-accent, #00d2ff);', 'declared', { '--editor-accent': 'var(--primary-color, #00d2ff)' }))
      .toBe('a: var(--primary-color, #00d2ff);');
    expect(() => resolveVars('a: var(--editor-nope, #000);', 'declared')).toThrow('undeclared token');
    expect(() => resolveVars('a: var(--z);', 'fallback')).toThrow('no fallback');
    // locals are taken from the :host rule only (§ Resolver step 3)
    expect(norm(resolveVars(':host { --_a: 1px; } .x { --_b: 2px; b: var(--_a); }', 'locals')))
      .toBe(':host { } .x { --_b: 2px; b: 1px; }');
  });

  it.each([
    ['color: red;', true],
    ['color: hsl(0, 0%, 0%);', true],
    ['color: #ff4444aa;', true],
    ['color: oklch(0.5 0.1 200);', true],
    ['color: var(--primary-color, #fff);', true],
    ['color: ${x};', true],
    ['color: color-mix(in srgb, #fff, #000);', true],
    ['white-space: nowrap;', false],
    ['color: var(--editor-text, #e0e8ff);', false],
  ])('TC-EIT-U-07: scanner negative control %s', (fixture, flagged) => {
    expect(scanCss(`.x { ${fixture} }`).length > 0).toBe(flagged);
  });

  it('TC-EIT-U-08: ADR-018 carries the 2026-11-05 addendum', () => {
    const adr = readFileSync(join(ROOT, 'docs', 'adr', 'ADR-018_palette-fixed-identity.md'), 'utf8');
    const at = adr.indexOf('## Addendum — 2026-11-05');
    expect(at).toBeGreaterThanOrEqual(0);
    const tail = adr.slice(at);
    expect(tail).toMatch(/\]\([^)]*editor-inputs-theme\/spec\.md\)/);
    expect(tail).toContain('sf-editor-slider.ts');
    expect(tail).toContain('sf-editor-input.ts');
  });
});

// ── integration ─────────────────────────────────────────────────────────────

describe('editor-inputs-theme — integration', () => {
  it.each(Object.keys(COMPONENTS))('IT-EIT-I-01: %s in a card editor folds to the baseline', (name) => {
    const baseline = readBaseline();
    expect(diffFolded(baseline.inEditor[name]!, foldComponent(COMPONENTS[name]!, 'declared'))).toEqual([]);
  });

  it('IT-EIT-I-02: the water-card accordion folds to the fallback baseline', () => {
    expect(diffFolded(readBaseline().standalone.accordion, foldComponent(SfEditorAccordion, 'fallback'))).toEqual([]);
  });

  it('IT-EIT-I-03: every <sf-editor- mount is a card editor with editor-common, or the water card', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir)) {
        const p = join(dir, e);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.ts')) files.push(p);
      }
    };
    walk(join(ROOT, 'src'));
    const mounts = files
      .filter((p) => !p.startsWith(INPUTS_DIR + sep))
      .map((p) => [relative(ROOT, p).split(sep).join('/'), blankComments(readFileSync(p, 'utf8'))] as const)
      .filter(([, src]) => src.includes('<sf-editor-'));
    expect(mounts.length).toBeGreaterThan(0);

    const problems: string[] = [];
    let editors = 0;
    for (const [rel, src] of mounts) {
      if (rel === 'src/cards/water/sci-fi-water-management.ts') continue;
      // The stove card's wear section (lot stove-wear-counters) is a card face, like the water card.
      if (rel === 'src/cards/stove/wear-counters.ts') continue;
      if (!/^src\/cards\/.+-editor\.ts$/.test(rel)) { problems.push(`${rel}: not a card editor`); continue; }
      const m = /static\s+[^=;]*styles[^=;]*=/.exec(src);
      let init = '';
      if (m) {
        let depth = 0;
        let j = m.index + m[0].length;
        for (; j < src.length; j++) {
          const ch = src[j]!;
          if ('([{'.includes(ch)) depth++;
          else if (')]}'.includes(ch)) depth--;
          else if (ch === ';' && depth === 0) break;
        }
        init = src.slice(m.index, j);
      }
      if (!/\bsciFiEditorCommonStyles\b/.test(init)) problems.push(`${rel}: static styles lacks sciFiEditorCommonStyles`);
      else editors++;
    }
    expect(problems).toEqual([]);
    expect({ editors, total: mounts.length }).toEqual({ editors: 11, total: 13 });
  });

  it('IT-EIT-I-04: mutation controls go red', () => {
    const baseline = readBaseline();
    const accCss = flattenStyles(SfEditorAccordion.styles).replace('#ff4444', '#ff4445');
    expect(accCss).toContain('#ff4445');
    expect(diffFolded(baseline.standalone.accordion, foldCss(resolveVars(accCss, 'fallback')))).not.toEqual([]);

    const mutated = { ...DECLARED, '--editor-accent': 'var(--primary-color, #00d2fe)' };
    expect(diffFolded(baseline.inEditor['sf-editor-input']!, foldComponent(SfEditorInput, 'declared', mutated))).not.toEqual([]);

    const entry: FoldedCss = structuredClone(baseline.inEditor['sf-editor-input']!);
    const rule = Object.keys(entry).find((k) => Object.keys(entry[k]!).length > 0)!;
    delete entry[rule]![Object.keys(entry[rule]!)[0]!];
    expect(diffFolded(entry, foldComponent(SfEditorInput, 'declared'))).not.toEqual([]);
  });

  it('IT-EIT-I-05: the baseline regenerates from its base commit', async () => {
    const { baseCommit, inEditor, standalone } = readBaseline();
    expect(baseCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(git('rev-parse', '--is-shallow-repository')).toBe('false');
    git('merge-base', '--is-ancestor', baseCommit, 'HEAD'); // throws when not an ancestor
    // under tests/ so the tsconfig include (decorators) applies; gitignored
    const dir = join(ROOT, 'tests', `.eit-base-${process.pid}`);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    const define = customElements.define.bind(customElements);
    customElements.define = (n: string, c: CustomElementConstructor, o?: ElementDefinitionOptions) => {
      if (!customElements.get(n)) define(n, c, o);
    };
    try {
      const tar = join(dir, 'src.tar');
      git('archive', '--format=tar', '-o', tar, baseCommit, 'src');
      execFileSync('tar', ['-xf', tar, '-C', dir]);
      for (const [name, cls] of Object.entries(COMPONENTS)) {
        const mod = (await import(join(dir, 'src', 'components', 'editor-inputs', `${name}.ts`))) as Record<string, { styles?: unknown }>;
        const base = mod[(cls as { name: string }).name]!;
        expect(base, name).toBeDefined();
        expect(diffFolded(inEditor[name]!, foldComponent(base, 'locals')), name).toEqual([]);
        if (name === 'sf-editor-accordion') {
          expect(diffFolded(standalone.accordion, foldComponent(base, 'fallback'))).toEqual([]);
        }
      }
    } finally {
      customElements.define = define;
      rmSync(dir, { recursive: true, force: true });
    }
  }, 60_000);
});
