/**
 * Guards Spec 03 § Palette rule 2: `var(--sf-token, <literal>)` is the idiom.
 *
 * A `var(--x)` written WITHOUT a fallback, whose token is declared nowhere in
 * `src/`, is invalid at computed-value time: the property computes to its
 * inherited value if it inherits, otherwise to its initial value. A `fill`
 * becomes `none`-ish black, a `background-color` becomes `transparent`, a
 * `border-color` disappears. The declaration silently does nothing, and CSS
 * reports no error because a reference to an undefined custom property is
 * legal.
 *
 * This is mechanical on purpose: it copies no list of token names, so it also
 * covers tokens added after it was written. A reference that IS undefined but
 * carries a fallback is healthy and deliberately not flagged — that is the
 * documented idiom for elements that may render outside a card tree.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src');

/**
 * Blank out `/* *\/` and `//` comment bodies, preserving every offset and
 * newline so reported line numbers stay exact. Without this, the documentation
 * comments in `cards/vehicles/*` — which quote `var(--primary-green-color)` in
 * prose beside the literal that actually renders — read as broken references.
 */
export function blankComments(text: string): string {
  const out = text.split('');
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? text.length : end + 2;
      for (let k = i; k < stop; k++) if (out[k] !== '\n') out[k] = ' ';
      i = stop;
    } else if (c === '/' && next === '/') {
      const end = text.indexOf('\n', i);
      const stop = end === -1 ? text.length : end;
      for (let k = i; k < stop; k++) out[k] = ' ';
      i = stop;
    } else if (c === '"' || c === "'") {
      i++;
      while (i < text.length && text[i] !== c && text[i] !== '\n') {
        if (text[i] === '\\') i++;
        i++;
      }
      i++;
    } else {
      i++;
    }
  }
  return out.join('');
}

/** Every `--x:` declaration — a token defined somewhere in `src/`. */
function collectDefined(text: string, into: Set<string>): void {
  for (const m of text.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) into.add(m[1]!);
}

interface Ref {
  token: string;
  line: number;
  hasFallback: boolean;
}

/**
 * Every `var(--x…)`, with balanced-paren scanning so a comma inside a nested
 * `var()` or `rgba()` is not mistaken for this reference's fallback separator.
 */
export function collectRefs(text: string): Ref[] {
  const refs: Ref[] = [];
  for (const m of text.matchAll(/\bvar\(\s*(--[A-Za-z0-9_-]+)/g)) {
    let i = m.index! + m[0].length;
    let depth = 1;
    let hasFallback = false;
    while (i < text.length && depth > 0) {
      const c = text[i];
      if (c === '(') depth++;
      else if (c === ')') {
        depth--;
        if (depth === 0) break;
      } else if (c === ',' && depth === 1) hasFallback = true;
      i++;
    }
    refs.push({
      token: m[1]!,
      line: text.slice(0, m.index!).split('\n').length,
      hasFallback,
    });
  }
  return refs;
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (entry.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

describe('CSS custom-property references (Spec 03 § Palette rule 2)', () => {
  it('TC-307: no var(--x) without a fallback targets a token defined nowhere in src/', () => {
    const files = walk(SRC);
    expect(files.length, 'no source files found — check the SRC path').toBeGreaterThan(20);

    const defined = new Set<string>();
    const refsByFile = new Map<string, Ref[]>();

    for (const file of files) {
      const text = blankComments(readFileSync(file, 'utf8'));
      collectDefined(text, defined);
      refsByFile.set(relative(SRC, file), collectRefs(text));
    }

    const violations: string[] = [];
    for (const [file, refs] of refsByFile) {
      for (const { token, line, hasFallback } of refs) {
        if (hasFallback || defined.has(token)) continue;
        violations.push(
          `${token} at src/${file}:${line} — declared nowhere in src/ and written without a fallback, ` +
            `so this declaration is invalid at computed-value time and the property renders unset. ` +
            `Write var(${token}, <literal>) or declare the token.`,
        );
      }
    }

    expect(violations, `\n${violations.join('\n')}\n`).toEqual([]);
  });

  it('TC-307: the scanner ignores var() written inside comments and reads nested fallbacks', () => {
    const sample = [
      '/* main: color: var(--from-block-comment) */',
      '// var(--from-line-comment)',
      'css`',
      '  .a { color: var(--bare); }',
      '  .b { color: var(--with-fb, red); }',
      '  .c { color: var(--outer, var(--inner, rgba(0, 0, 0, 0.5))); }',
      '`;',
    ].join('\n');

    const refs = collectRefs(blankComments(sample));
    expect(refs.map((r) => r.token)).toEqual(['--bare', '--with-fb', '--outer', '--inner']);
    expect(refs.map((r) => r.hasFallback)).toEqual([false, true, true, true]);
    // line numbers survive comment blanking
    expect(refs[0]!.line).toBe(4);
  });
});
