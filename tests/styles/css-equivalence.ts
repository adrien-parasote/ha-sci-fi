/**
 * CSS equivalence harness — ADR-017 step 8.
 *
 * The card stylesheets are the one part of this codebase with no native safety
 * net: no test asserts a computed style, so a bad hoist into a shared chrome
 * sheet would only show up by eye in the workbench. This module gives the
 * refactor a mechanical check instead.
 *
 * It flattens a card's `static styles` into the order the browser sees, parses
 * the result into `(at-rule context, selector) -> declarations`, and folds
 * same-key rules in cascade order so the value that survives is the value that
 * would actually apply. Two stylesheets that produce the same folded map are
 * interchangeable for these cards: every selector here is a single class or
 * :host inside one shadow root, so specificity never varies between the rules
 * being compared and source order is the only tie-breaker.
 *
 * What it does NOT catch: a selector that changes specificity, and ordering
 * between DIFFERENT selectors that both match one element. Hoists must
 * therefore stay to rules that are byte-identical across cards.
 */

/** A parsed rule: its at-rule context (empty at top level) and its selector. */
export type RuleKey = string;

export type FoldedCss = Record<RuleKey, Record<string, string>>;

/** Recursively flattens Lit's `static styles` into one CSS string, in order. */
export function flattenStyles(styles: unknown): string {
  if (styles == null) return '';
  if (Array.isArray(styles)) return styles.map(flattenStyles).join('\n');
  const text = (styles as { cssText?: string }).cssText;
  return typeof text === 'string' ? text : '';
}

interface Block {
  context: string;
  selector: string;
  body: string;
}

/** Splits CSS into blocks, descending one level into at-rules that wrap rules. */
function collectBlocks(css: string, context = ''): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  let preludeStart = 0;

  while (i < css.length) {
    const ch = css[i];

    if (ch === '{') {
      const prelude = css.slice(preludeStart, i).trim();
      // find the matching close brace
      let depth = 1;
      let j = i + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      const body = css.slice(i + 1, j - 1);

      if (prelude.startsWith('@')) {
        // conditional group rule (@media / @container / @supports) — recurse
        const nested = context ? `${context} && ${prelude}` : prelude;
        blocks.push(...collectBlocks(body, nested));
      } else if (prelude) {
        for (const sel of prelude.split(',')) {
          blocks.push({ context, selector: sel.trim().replace(/\s+/g, ' '), body });
        }
      }
      i = j;
      preludeStart = i;
      continue;
    }

    if (ch === '}') {
      i++;
      preludeStart = i;
      continue;
    }

    i++;
  }

  return blocks;
}

/** Parses a declaration body, tolerating `url(...)`, quotes and nested parens. */
function parseDeclarations(body: string): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  let depth = 0;
  let quote: string | null = null;
  let current = '';

  const flush = () => {
    const decl = current.trim();
    current = '';
    if (!decl) return;
    const colon = decl.indexOf(':');
    if (colon < 0) return;
    out.push([decl.slice(0, colon).trim(), decl.slice(colon + 1).trim().replace(/\s+/g, ' ')]);
  };

  for (const ch of body) {
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; current += ch; continue; }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { flush(); continue; }
    if (ch === '{' || ch === '}') continue;   // nested rule, handled by collectBlocks
    current += ch;
  }
  flush();
  return out;
}

/**
 * Folds a stylesheet into the declarations that actually win, per
 * (at-rule context, selector). Later declarations overwrite earlier ones,
 * which is what source order does for equal specificity.
 */
export function foldCss(css: string): FoldedCss {
  const folded: FoldedCss = {};
  for (const { context, selector, body } of collectBlocks(stripComments(css))) {
    const key = context ? `${context} :: ${selector}` : selector;
    folded[key] ??= {};
    for (const [prop, value] of parseDeclarations(body)) {
      folded[key]![prop] = value;
    }
  }
  return folded;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Human-readable diff between two folded stylesheets. Empty array = identical. */
export function diffFolded(before: FoldedCss, after: FoldedCss): string[] {
  const problems: string[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of [...keys].sort()) {
    const b = before[key];
    const a = after[key];
    if (!b) { problems.push(`ADDED rule: ${key}`); continue; }
    if (!a) { problems.push(`REMOVED rule: ${key}`); continue; }
    const props = new Set([...Object.keys(b), ...Object.keys(a)]);
    for (const p of [...props].sort()) {
      if (!(p in b)) problems.push(`ADDED   ${key} { ${p}: ${a[p]} }`);
      else if (!(p in a)) problems.push(`REMOVED ${key} { ${p}: ${b[p]} }`);
      else if (b[p] !== a[p]) problems.push(`CHANGED ${key} { ${p} }: "${b[p]}" -> "${a[p]}"`);
    }
  }
  return problems;
}
