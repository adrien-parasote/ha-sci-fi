/**
 * Shared machinery of the `--sf-*` token guards (spec sf-token-declarations).
 *
 * A plain module, not a test file: importing a `*.test.ts` from another test
 * would re-register its `describe` blocks and duplicate the test titles.
 * Everything here is a pure function over `{ path, text }` sources, so the
 * fixtures and the real `src/` tree feed the same code.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';

export interface Source {
  /** Repo-relative posix path, e.g. `src/cards/tv/style.ts`. */
  path: string;
  text: string;
}

/** The 8 follow-up beads of the lot, and the card family each one settles. */
export const FOLLOW_UP_BEADS = ['yj6', '03i', 'xi7', 'rhd', '3z0j', '7ge9', 'gmvv', 'td4b'] as const;
export const FAMILY_BEAD: Record<string, string> = {
  bridge: 'yj6',
  vacuum: '03i',
  stove: 'xi7',
  climates: 'rhd',
  tv: '3z0j',
  'hexa-tiles': '7ge9',
  weather: 'gmvv',
  water: 'td4b',
};

export function loadSources(srcDir: string, repoRoot: string): Source[] {
  const out: Source[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry.endsWith('.ts')) {
        out.push({ path: relative(repoRoot, full).split(sep).join('/'), text: readFileSync(full, 'utf8') });
      }
    }
  };
  walk(srcDir);
  return out;
}

/** `cards/<family>/…` -> family, otherwise null (socle). */
export function familyOf(path: string): string | null {
  const m = /^src\/cards\/([^/]+)\//.exec(path);
  return m ? m[1]! : null;
}

/**
 * Blank out `/* *\/` and `//` comment bodies, preserving every offset and
 * newline so reported line numbers stay exact. Without this, the documentation
 * comments in `cards/vehicles/*` — which quote `var(--primary-green-color)` in
 * prose beside the literal that actually renders — read as broken references.
 * A `//` right after `:` or `(` is a URL (`https://`, `url(//cdn/x.png)`), not
 * a comment.
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
    } else if (c === '/' && next === '/' && text[i - 1] !== ':' && text[i - 1] !== '(') {
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

export interface Ref {
  token: string;
  line: number;
  hasFallback: boolean;
  /** Raw fallback text (balanced), empty when there is none. */
  fallback: string;
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
    let comma = -1;
    while (i < text.length && depth > 0) {
      const c = text[i];
      if (c === '(') depth++;
      else if (c === ')') {
        depth--;
        if (depth === 0) break;
      } else if (c === ',' && depth === 1 && comma === -1) comma = i;
      i++;
    }
    refs.push({
      token: m[1]!,
      line: text.slice(0, m.index!).split('\n').length,
      hasFallback: comma !== -1,
      fallback: comma === -1 ? '' : text.slice(comma + 1, i).trim(),
    });
  }
  return refs;
}

/** Index of the closing backtick of a template literal opened just before `start`. */
function endOfTemplate(text: string, start: number): number {
  let i = start;
  while (i < text.length) {
    const c = text[i];
    if (c === '\\') i += 2;
    else if (c === '`') return i;
    else if (c === '$' && text[i + 1] === '{') i = endOfExpr(text, i + 2);
    else i++;
  }
  return text.length;
}

/** Index just past the `}` closing a `${` expression that starts at `start`. */
function endOfExpr(text: string, start: number): number {
  let depth = 1;
  let i = start;
  while (i < text.length && depth > 0) {
    const c = text[i];
    if (c === '`') i = endOfTemplate(text, i + 1) + 1;
    else {
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
  }
  return i;
}

/**
 * The text of every `css\`…\`` template and every inline `style="…"` of a
 * (comment-blanked) source: the only places where `--sf-x:` is a declaration.
 */
export function declarationRegions(text: string): string[] {
  const regions: string[] = [];
  for (const m of text.matchAll(/\bcss\s*`/g)) {
    const start = m.index! + m[0].length;
    regions.push(text.slice(start, endOfTemplate(text, start)));
  }
  for (const m of text.matchAll(/\bstyle\s*=\s*(["'`])/g)) {
    const start = m.index! + m[0].length;
    const q = m[1]!;
    const end = q === '`' ? endOfTemplate(text, start) : text.indexOf(q, start);
    regions.push(text.slice(start, end === -1 ? text.length : end));
  }
  return regions;
}

const TEST_PATH = /(^|\/)tests?\/|\.test\.ts$/;

/** `--sf-*` names a source declares (css block or inline style, never a string/comment/test file). */
export function declaredSfNames(path: string, text: string): string[] {
  if (TEST_PATH.test(path)) return [];
  const names = new Set<string>();
  for (const region of declarationRegions(blankComments(text))) {
    for (const m of region.matchAll(/(--sf-[A-Za-z0-9_-]+)\s*:/g)) names.add(m[1]!);
  }
  return [...names];
}

export interface FileRef extends Ref {
  file: string;
}

export interface Scan {
  /** `--sf-*` name -> files declaring it (bounded scope, global across files). */
  declaredSf: Map<string, Set<string>>;
  /** Every `--x:` anywhere in a blanked source: the old, broad rule for non-`--sf-` names. */
  declaredAny: Set<string>;
  refs: FileRef[];
}

export function scan(sources: Source[]): Scan {
  const declaredSf = new Map<string, Set<string>>();
  const declaredAny = new Set<string>();
  const refs: FileRef[] = [];
  for (const { path, text } of sources) {
    const blanked = blankComments(text);
    for (const m of blanked.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) declaredAny.add(m[1]!);
    for (const name of declaredSfNames(path, text)) {
      if (!declaredSf.has(name)) declaredSf.set(name, new Set());
      declaredSf.get(name)!.add(path);
    }
    for (const r of collectRefs(blanked)) refs.push({ ...r, file: path });
  }
  return { declaredSf, declaredAny, refs };
}

/** `--sf-*` names read somewhere (with the files that read them). */
export function readSfNames(s: Scan): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const r of s.refs) {
    if (!r.token.startsWith('--sf-')) continue;
    if (!out.has(r.token)) out.set(r.token, new Set());
    out.get(r.token)!.add(r.file);
  }
  return out;
}

/** FR-1: the violations of TC-307. */
export function findUndeclared(
  s: Scan,
  hooks: Record<string, unknown>,
  open: Record<string, unknown>,
): string[] {
  const out: string[] = [];
  for (const { token, line, hasFallback, file } of s.refs) {
    if (token.startsWith('--sf-')) {
      if (s.declaredSf.has(token) || token in hooks || token in open) continue;
      out.push(
        `${token} at ${file}:${line} — declared nowhere in src/ (a fallback does not make it healthy: ` +
          `the property always renders the fallback). Three exits: declare it in src/styles/common.ts, ` +
          `rename it to the canonical token, or remove the reference.`,
      );
    } else {
      if (hasFallback || s.declaredAny.has(token)) continue;
      out.push(
        `${token} at ${file}:${line} — declared nowhere in src/ and written without a fallback, ` +
          `so this declaration is invalid at computed-value time and the property renders unset. ` +
          `Write var(${token}, <literal>), declare the token, or remove the reference.`,
      );
    }
  }
  return out;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface OpenName {
  bead: string;
  since: string;
  also?: string;
}

/** FR-2: the ratchet and the bounds of HOOKS / OPEN_CARD_NAMES. */
export function checkNameTables(
  s: Scan,
  hooks: Record<string, string>,
  open: Record<string, OpenName>,
): string[] {
  const out: string[] = [];
  const read = readSfNames(s);
  const beads: readonly string[] = FOLLOW_UP_BEADS;
  for (const name of Object.keys(hooks)) {
    const reason = hooks[name];
    if (name in open) out.push(`${name} is in both HOOKS and OPEN_CARD_NAMES — keep one line.`);
    if (typeof reason !== 'string' || reason.trim() === '') out.push(`HOOKS ${name}: empty reason.`);
    else if (reason.length > 200) out.push(`HOOKS ${name}: reason over 200 characters.`);
    if (s.declaredSf.has(name)) out.push(`HOOKS ${name} is now declared in src/ — delete the HOOKS line.`);
    else if (!read.has(name)) out.push(`HOOKS ${name} is no longer referenced — delete the HOOKS line.`);
  }
  for (const [name, entry] of Object.entries(open)) {
    if (!entry || !entry.bead || !entry.since) {
      out.push(`OPEN_CARD_NAMES ${name}: bead and since are required.`);
      continue;
    }
    if (!ISO_DATE.test(entry.since)) out.push(`OPEN_CARD_NAMES ${name}: since is not an ISO date.`);
    if (s.declaredSf.has(name)) {
      out.push(`OPEN_CARD_NAMES ${name} is now declared in src/ — delete the OPEN_CARD_NAMES line.`);
      continue;
    }
    const files = read.get(name);
    if (!files) {
      out.push(`OPEN_CARD_NAMES ${name} is no longer referenced — delete the OPEN_CARD_NAMES line.`);
      continue;
    }
    const socle = [...files].filter((f) => familyOf(f) === null);
    if (socle.length > 0) {
      out.push(`OPEN_CARD_NAMES ${name} is read by a socle file (${socle.join(', ')}) — a card allow-list cannot hold it.`);
    }
    const families = new Set([...files].map(familyOf).filter((f): f is string => f !== null));
    const familyBeads = new Set([...families].map((f) => FAMILY_BEAD[f]).filter((b): b is string => !!b));
    if (!beads.includes(entry.bead)) out.push(`OPEN_CARD_NAMES ${name}: bead ${entry.bead} is not one of the 8 follow-up beads.`);
    else if (!familyBeads.has(entry.bead)) {
      out.push(`OPEN_CARD_NAMES ${name}: bead ${entry.bead} is not the bead of a family that reads it (${[...families].join(', ')}).`);
    }
    if (entry.also !== undefined) {
      if (!beads.includes(entry.also)) out.push(`OPEN_CARD_NAMES ${name}: also ${entry.also} is not one of the 8 follow-up beads.`);
      else if (!familyBeads.has(entry.also)) out.push(`OPEN_CARD_NAMES ${name}: also ${entry.also} is not the bead of a family that reads it.`);
    }
  }
  return out;
}

/* ───────────── inheritance chain (FR-5) ───────────── */

interface ClassInfo {
  name: string;
  ext: string | null;
  body: string;
}

function endOfBlock(text: string, open: number): number {
  let depth = 0;
  let i = open;
  while (i < text.length) {
    const c = text[i];
    if (c === '`') i = endOfTemplate(text, i + 1) + 1;
    else {
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) return i + 1;
      }
      i++;
    }
  }
  return text.length;
}

function parseClasses(text: string): ClassInfo[] {
  const out: ClassInfo[] = [];
  for (const m of text.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)(?:\s+extends\s+([A-Za-z_$][\w$.]*))?[^{;]*\{/g)) {
    const open = m.index! + m[0].length - 1;
    out.push({ name: m[1]!, ext: m[2] ?? null, body: text.slice(open, endOfBlock(text, open)) });
  }
  return out;
}

/** Text of the `static styles` / `static get styles()` member, or null when the class has none. */
function stylesMember(body: string): string | null {
  const m = /static\s+(?:override\s+)?(get\s+)?styles\b/.exec(body);
  if (!m) return null;
  if (m[1]) {
    const open = body.indexOf('{', m.index);
    return body.slice(m.index, endOfBlock(body, open));
  }
  let depth = 0;
  let i = m.index;
  while (i < body.length) {
    const c = body[i];
    if (c === '`') i = endOfTemplate(body, i + 1) + 1;
    else {
      if (c === '(' || c === '[' || c === '{') depth++;
      else if (c === ')' || c === ']' || c === '}') depth--;
      else if (c === ';' && depth === 0) break;
      i++;
    }
  }
  return body.slice(m.index, i);
}

function importsOf(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of text.matchAll(/import\s+(?:type\s+)?(?:\{([^}]*)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/g)) {
    const from = m[3]!;
    if (m[2]) out.set(m[2], from);
    else {
      for (const part of m[1]!.split(',')) {
        const [orig, alias] = part.trim().split(/\s+as\s+/);
        if (orig) out.set((alias ?? orig).trim(), from);
      }
    }
  }
  return out;
}

const UNRESOLVED = Symbol('unresolved');

function resolveImport(from: string, spec: string, known: Set<string>): string | null | typeof UNRESOLVED {
  if (!spec.startsWith('.')) return null; // external package
  const target = posix.normalize(posix.join(posix.dirname(from), spec)).replace(/\.js$/, '.ts');
  return known.has(target) ? target : UNRESOLVED;
}

/** Build `includesCommonStyles(file)` for a set of sources (FR-5). */
export function makeIncludesCommonStyles(sources: Source[]): (file: string) => boolean | null {
  const blanked = new Map(sources.map((s) => [s.path, blankComments(s.text)]));
  const known = new Set(blanked.keys());
  const classes = new Map([...blanked].map(([p, t]) => [p, parseClasses(t)]));
  const imports = new Map([...blanked].map(([p, t]) => [p, importsOf(t)]));

  const classIncludes = (path: string, name: string, seen: Set<string>): boolean => {
    const key = `${path}#${name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    const info = classes.get(path)?.find((c) => c.name === name);
    if (!info) throw new Error(`includesCommonStyles: class ${name} not found in ${path}`);
    const member = stylesMember(info.body);
    if (member !== null) {
      if (/\bsciFiCommonStyles\b/.test(member)) return true;
      if (!/\bsuper\.styles\b/.test(member)) return false;
    }
    if (!info.ext) return false;
    const local = classes.get(path)!.find((c) => c.name === info.ext);
    if (local) return classIncludes(path, local.name, seen);
    const spec = imports.get(path)!.get(info.ext);
    if (spec === undefined) return false; // global (HTMLElement…): no common styles
    const target = resolveImport(path, spec, known);
    if (target === null) return false; // LitElement and other packages
    if (target === UNRESOLVED) {
      throw new Error(`includesCommonStyles: ${path} extends ${info.ext} imported from ${spec}, which resolves to no file of src/`);
    }
    return classIncludes(target, info.ext, seen);
  };

  const importers = new Map<string, string[]>();
  for (const [p, imps] of imports) {
    for (const spec of new Set(imps.values())) {
      const target = resolveImport(p, spec, known);
      if (target && target !== UNRESOLVED) importers.set(target, [...(importers.get(target) ?? []), p]);
    }
  }

  // a class that declares no `styles` and extends nothing is a helper, not a styled element
  const styled = (path: string): ClassInfo[] =>
    (classes.get(path) ?? []).filter((c) => stylesMember(c.body) !== null || c.ext);

  const resolve = (file: string, seen: Set<string>): boolean | null => {
    if (!classes.has(file)) throw new Error(`includesCommonStyles: ${file} is not a source of src/`);
    const own = styled(file);
    if (own.length > 0) return own.every((c) => classIncludes(file, c.name, new Set()));
    // class-less sheet: resolved through its importers; a class-less importer is followed in turn
    if (seen.has(file)) return null;
    seen.add(file);
    let verdict: boolean | null = null;
    for (const p of importers.get(file) ?? []) {
      const v = resolve(p, seen);
      if (v === true) return true;
      if (v === false) verdict = false;
    }
    return verdict;
  };

  return (file: string): boolean | null => resolve(file, new Set());
}

export function includesCommonStyles(file: string, sources: Source[]): boolean | null {
  return makeIncludesCommonStyles(sources)(file);
}

/* ───────────── drift guard (FR-4) ───────────── */

const norm = (v: string): string => v.replace(/\s+/g, '');

/** token -> accepted fallbacks (declared value, terminal literal), whitespace removed. */
export function canonicalValues(commonText: string): Map<string, Set<string>> {
  const text = blankComments(commonText);
  const start = text.indexOf(':host');
  const open = text.indexOf('{', start);
  const block = text.slice(open + 1, endOfBlock(text, open) - 1);
  const raw = new Map<string, string>();
  for (const m of block.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g)) raw.set(m[1]!, m[2]!.trim());
  const terminal = (value: string, guard = 0): string => {
    const m = /^var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,([\s\S]*))?\)$/.exec(value.trim());
    if (!m || guard > 8) return value;
    const next = raw.get(m[1]!);
    if (m[2] === undefined && next !== undefined) return terminal(next, guard + 1);
    if (m[2] !== undefined) return terminal(m[2], guard + 1);
    return value;
  };
  const out = new Map<string, Set<string>>();
  for (const [name, value] of raw) out.set(name, new Set([norm(value), norm(terminal(value))]));
  return out;
}

export interface DriftOptions {
  canon: Map<string, Set<string>>;
  /** true: includes; false: live fallback (exempt); null: a class-less sheet no including class uses (policed). */
  includes: (file: string) => boolean | null;
}

/** `<file>::<token>` -> sites whose fallback is neither the declared value nor its terminal literal. */
export function findDrift(s: Scan, opt: DriftOptions): Map<string, FileRef[]> {
  const out = new Map<string, FileRef[]>();
  const includeCache = new Map<string, boolean | null>();
  const selfDeclared = (file: string, token: string): boolean => s.declaredSf.get(token)?.has(file) ?? false;
  for (const r of s.refs) {
    const accepted = opt.canon.get(r.token);
    if (!accepted || !r.hasFallback) continue;
    if (r.file === 'src/styles/common.ts') continue;
    if (accepted.has(norm(r.fallback))) continue;
    if (!includeCache.has(r.file)) includeCache.set(r.file, opt.includes(r.file));
    if (includeCache.get(r.file) === false) continue; // live fallback (FR-5); null (unresolved sheet) is policed
    if (selfDeclared(r.file, r.token)) continue; // local redefinition, out of scope (gmvv)
    const key = `${r.file}::${r.token}`;
    out.set(key, [...(out.get(key) ?? []), r]);
  }
  return out;
}

export interface OpenDriftEntry {
  bead: string;
  since: string;
  max: number;
}

/** FR-4: the drift guard's verdict against OPEN_DRIFT (allow-list, bounds, ratchet). */
export function checkDrift(
  drift: Map<string, FileRef[]>,
  table: Record<string, OpenDriftEntry>,
  canon: Map<string, Set<string>>,
): string[] {
  const out: string[] = [];
  const beads: readonly string[] = FOLLOW_UP_BEADS;
  for (const [key, sites] of drift) {
    const entry = table[key];
    if (!entry) {
      out.push(
        `${key} drifts from common.ts at ${sites.map((r) => `line ${r.line} (${r.fallback})`).join(', ')} — ` +
          `write the declared value or its terminal literal.`,
      );
    } else if (!Number.isInteger(entry.max) || entry.max < 1) {
      out.push(`OPEN_DRIFT ${key}: max must be an integer of at least 1, got ${String(entry.max)}.`);
    } else if (sites.length > entry.max) {
      out.push(`OPEN_DRIFT ${key}: ${sites.length} drifting sites, max says ${entry.max} — a violation.`);
    }
  }
  for (const [key, entry] of Object.entries(table)) {
    const [file, token] = key.split('::') as [string, string];
    if (!file.startsWith('src/cards/')) out.push(`OPEN_DRIFT ${key}: the file is not under src/cards/ — a socle file cannot be keyed.`);
    if (!canon.has(token)) out.push(`OPEN_DRIFT ${key}: ${token} is not declared by common.ts.`);
    if (!beads.includes(entry.bead)) out.push(`OPEN_DRIFT ${key}: bead ${entry.bead} is not one of the 8 follow-up beads.`);
    else if (FAMILY_BEAD[familyOf(file) ?? ''] !== entry.bead) out.push(`OPEN_DRIFT ${key}: bead ${entry.bead} is not the bead of its family.`);
    if (!ISO_DATE.test(entry.since)) out.push(`OPEN_DRIFT ${key}: since is not an ISO date.`);
    const measured = drift.get(key)?.length ?? 0;
    if (measured === 0) out.push(`OPEN_DRIFT ${key} no longer drifts — delete the OPEN_DRIFT line.`);
    else if (entry.max > measured) out.push(`OPEN_DRIFT ${key}: max ${entry.max} is slack, measured ${measured} — lower it.`);
  }
  return out;
}
