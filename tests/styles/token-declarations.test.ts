/**
 * @vitest-environment happy-dom
 *
 * Declarations of the `--sf-*` tokens (spec docs/specs/sf-token-declarations/spec.md):
 * the values of `common.ts`, the zero-visual-change proof on the touched
 * components, the CSS baseline replay, the documents and the ids. The scanner,
 * the tables and the drift guard are in token-refs.test.ts / token-scan.ts.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { collectRefs, blankComments } from './token-scan.js';
import { diffFolded, flattenStyles, foldCss, type FoldedCss } from './css-equivalence.js';

import '../../src/components/buttons/sf-button-card.js';
import '../../src/components/buttons/sf-button-card-select.js';
import '../../src/components/sf-dropdown.js';
import '../../src/components/sf-hexa-row.js';
import '../../src/components/sf-hexa-tile.js';
import '../../src/components/sf-wheel.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf8');

/** The 12 declarations of `common.ts` (FR-3), at the value the fallbacks rendered before the lot. */
const DECLARED: Record<string, string> = {
  '--sf-border-width': '1px',
  '--sf-icon-size-xs': '12px',
  '--sf-icon-size-sm': '16px',
  '--sf-icon-size-md': '24px',
  '--sf-icon-size-lg': '36px',
  '--sf-text-xs': '10px',
  '--sf-text-sm': '12px',
  '--sf-text-base': '14px',
  '--sf-bg-primary': '#0d1117',
  '--sf-bg-tile': '#101626',
  '--sf-bg-tertiary': 'rgba(0, 210, 255, 0.1)',
  '--sf-border-light': 'var(--sf-bg-tertiary)',
};

/** What each of those names rendered before the lot: its fallback, identical on every site. */
const BEFORE: Record<string, string> = {
  ...DECLARED,
  '--sf-border-light': 'rgba(0, 210, 255, 0.1)',
};

const ws = (v: string): string => v.replace(/\s+/g, '');

/** The `:host` declarations of a stylesheet, parsed here (not by the guards under test). */
function hostDeclarations(css: string): Record<string, string> {
  const text = blankComments(css);
  const start = text.indexOf(':host');
  const open = text.indexOf('{', start);
  const close = text.indexOf('\n  }', open);
  const out: Record<string, string> = {};
  for (const m of text.slice(open + 1, close).matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g)) out[m[1]!] = m[2]!.trim();
  return out;
}

describe('--sf-* token declarations (sf-token-declarations)', () => {
  it('TC-SFT-U-02: common.ts declares the 12 tokens at their rendered values, in px, rem tokens untouched', () => {
    const host = hostDeclarations(read('src/styles/common.ts'));
    for (const [name, value] of Object.entries(DECLARED)) {
      expect(host[name], name).toBeDefined();
      expect(ws(host[name]!), name).toBe(ws(value));
      expect(host[name], name).not.toMatch(/rem/);
    }
    expect(host['--sf-font-size-sm']).toBe('0.75rem');
    expect(host['--sf-font-size-base']).toBe('0.875rem');
    expect(host['--sf-font-size-lg']).toBe('1rem');
    expect(host['--sf-font-size-xl']).toBe('1.25rem');
  });

  describe('IT-SFT-I-02: zero visual change on the touched components (happy-dom)', () => {
    const commonCss = (): string => {
      const css = read('src/styles/common.ts');
      return css.slice(css.indexOf('`') + 1, css.indexOf('  /* ── Card wrapper'));
    };

    /** Computed value of `prop: <value>` inside a nested shadow root that sits under a host declaring the common styles. */
    function computed(decls: string[], prop: string): string[] {
      const outer = document.createElement('div');
      document.body.appendChild(outer);
      const r1 = outer.attachShadow({ mode: 'open' });
      const s1 = document.createElement('style');
      s1.textContent = commonCss();
      r1.appendChild(s1);
      const inner = document.createElement('div');
      r1.appendChild(inner);
      const r2 = inner.attachShadow({ mode: 'open' });
      const s2 = document.createElement('style');
      s2.textContent = decls.map((d, i) => `.p${i} { ${prop}: ${d}; }`).join('\n');
      r2.appendChild(s2);
      const values = decls.map((_, i) => {
        const el = document.createElement('div');
        el.className = `p${i}`;
        r2.appendChild(el);
        return getComputedStyle(el).getPropertyValue(prop);
      });
      outer.remove();
      return values;
    }

    it('the canary: a :host declaration reaches a nested var() read, through an alias too', () => {
      const outer = document.createElement('div');
      document.body.appendChild(outer);
      const r1 = outer.attachShadow({ mode: 'open' });
      const s1 = document.createElement('style');
      s1.textContent = ':host { --sf-canary: 7px; --sf-canary-alias: var(--sf-canary); }';
      r1.appendChild(s1);
      const inner = document.createElement('div');
      r1.appendChild(inner);
      const r2 = inner.attachShadow({ mode: 'open' });
      const s2 = document.createElement('style');
      s2.textContent = '.a { width: var(--sf-canary, 99px); } .b { width: var(--sf-canary-alias, 98px); }';
      r2.appendChild(s2);
      const a = document.createElement('div');
      a.className = 'a';
      const b = document.createElement('div');
      b.className = 'b';
      r2.append(a, b);
      const got = [getComputedStyle(a).width, getComputedStyle(b).width];
      outer.remove();
      expect(got, 'happy-dom does not resolve var() through :host — the before/after below would prove nothing').toEqual(['7px', '7px']);
    });

    const TAGS = ['sf-button-card', 'sf-button-card-select', 'sf-hexa-tile', 'sf-hexa-row', 'sf-wheel', 'sf-dropdown'];
    for (const tag of TAGS) {
      it(`${tag}: every read of a declared token renders what its fallback rendered before`, () => {
        const cls = customElements.get(tag) as (CustomElementConstructor & { styles?: unknown }) | undefined;
        expect(cls, `${tag} is not registered`).toBeDefined();
        const refs = collectRefs(flattenStyles(cls!.styles)).filter((r) => r.token in BEFORE && r.hasFallback);
        expect(refs.length, `${tag} reads none of the declared tokens`).toBeGreaterThan(0);
        for (const kind of ['width', 'background-color'] as const) {
          const sites = refs.filter((r) => (/^(#|rgb)/.test(BEFORE[r.token]!) ? 'background-color' : 'width') === kind);
          if (sites.length === 0) continue;
          const after = computed(sites.map((r) => `var(${r.token}, ${r.fallback})`), kind);
          // before: what the site rendered on its own fallback alone, read from the site, not from a table
          const before = computed(sites.map((r) => r.fallback), kind);
          sites.forEach((r, i) => expect(after[i], `${tag} ${r.token}`).toBe(before[i]));
          before.forEach((v, i) => expect(v, `${sites[i]!.token} did not compute`).not.toBe(''));
        }
      });
    }

    it('sf-hexa-tile reads --sf-bg-tile at #101626 and the dropdown popup keeps #0d1117', () => {
      const tile = flattenStyles((customElements.get('sf-hexa-tile') as { styles?: unknown }).styles);
      expect(tile).toContain('var(--sf-bg-tile, #101626)');
      expect(tile).not.toContain('var(--sf-bg-primary');
      const dropdown = flattenStyles((customElements.get('sf-dropdown') as { styles?: unknown }).styles);
      expect(dropdown).toContain('var(--sf-bg-primary, #0d1117)');
    });
  });

  it('IT-SFT-I-03: the CSS baseline gained the 12 :host declarations and nothing else', () => {
    const baseline = JSON.parse(read('tests/styles/card-css-baseline.json')) as Record<string, FoldedCss>;
    for (const [tag, folded] of Object.entries(baseline)) {
      for (const [name, value] of Object.entries(DECLARED)) {
        expect(ws(folded[':host']?.[name] ?? ''), `${tag} ${name}`).toBe(ws(value));
      }
    }
    // replay: the stylesheet with and without the 12 differs by exactly those additions
    const after = read('src/styles/common.ts');
    const body = after.slice(after.indexOf('`') + 1, after.lastIndexOf('`'));
    const withoutNew = body
      .split('\n')
      .filter((l) => !Object.keys(DECLARED).some((n) => new RegExp(`^\\s*${n}\\s*:`).test(l)))
      .join('\n');
    const diff = diffFolded(foldCss(withoutNew), foldCss(body));
    expect(diff.sort()).toEqual(
      Object.entries(DECLARED)
        .map(([n]) => `ADDED   :host { ${n}: ${foldCss(body)[':host']![n]} }`)
        .sort(),
    );
    expect(diff.length).toBe(Object.keys(DECLARED).length);
  });

  it('IT-SFT-I-04: ADR-018 carries the Erratum and 03_base_classes.md tells the truth', () => {
    const adr = read('docs/adr/ADR-018_palette-fixed-identity.md');
    const erratum = adr.slice(adr.search(/^#+ .*Erratum/m));
    expect(adr).toMatch(/^#+ .*Erratum/m);
    expect(erratum).toContain('sf-button-card');
    expect(erratum).toContain('super.styles');
    expect(erratum).toContain('sf-token-declarations');
    expect(erratum).toMatch(/ancestor/);
    expect(erratum).toMatch(/card-mod/);

    const base = read('docs/specs/03_base_classes.md');
    const rule2 = base.slice(base.indexOf('2. **`var(--sf-token'), base.indexOf('3. **A bespoke colour'));
    expect(rule2).toContain('sf-dropdown');
    expect(rule2).not.toContain('sf-button-card');
    expect(rule2).not.toMatch(/\bboth\b/);
    const row07 = base.split('\n').find((l) => l.startsWith('| F-BASE-07'))!;
    expect(row07).toContain('token-declarations.test.ts');
    const row307 = base.split('\n').find((l) => l.startsWith('| TC-307'))!;
    expect(row307).toMatch(/fallback or not/);
  });

  it('IT-SFT-I-05: every id of the spec is cited in exactly one test title (the four existing guards run green on their own)', () => {
    const spec = read('docs/specs/sf-token-declarations/spec.md');
    const ids = [...spec.matchAll(/^\| ((?:TC|IT)-SFT-[UI]-\d+) \|/gm)].map((m) => m[1]!);
    expect(ids.length).toBeGreaterThan(10);
    const titles = ['token-refs.test.ts', 'token-declarations.test.ts']
      .map((f) => read(`tests/styles/${f}`))
      .flatMap((t) => [...t.matchAll(/\b(?:it|describe)\(\s*[`'"]([^`'"]+)[`'"]/g)].map((m) => m[1]!));
    for (const id of ids) {
      const hits = titles.filter((t) => t.includes(id));
      expect(hits.length, `${id} must be cited in exactly one title`).toBe(1);
    }
  });
});
