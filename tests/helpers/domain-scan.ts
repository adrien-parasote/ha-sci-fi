/**
 * domain-scan — the AST scanner behind the domain-literal guard (lot domain-constants,
 * FR-5). Reads TypeScript sources and reports every string that is a Home Assistant
 * domain written as a literal: `exact` ('light'), `prefix` ('light.' or a template
 * head `sensor.${x}`). Full entity ids ('sun.sun') are `fullid` and are not probed.
 *
 * Import strings, type-level literals (`Config['weather']`) and comments are never
 * nodes of the kinds scanned, so they never match. Literal-only: a string built at
 * run time ('li' + 'ght') is invisible to it — a drift probe, not an integrity control.
 */
import ts from 'typescript';
import { DOMAIN } from '../../src/types/domains.js';

/** Every DOMAIN value plus the other HA domains the scan must also catch (FR-5, F-03). */
export const UNIVERSE: readonly string[] = [
  // the 24 DOMAIN values
  'light', 'climate', 'sensor', 'binary_sensor', 'switch', 'cover', 'lock', 'media_player',
  'vacuum', 'weather', 'person', 'zone', 'remote', 'select', 'number', 'counter',
  'automation', 'script', 'input_boolean', 'input_select', 'input_number', 'input_button',
  'valve', 'homeassistant',
  // other HA domains
  'fan', 'camera', 'button', 'alarm_control_panel', 'humidifier', 'water_heater',
  'device_tracker', 'sun', 'calendar', 'event', 'input_text', 'input_datetime', 'scene',
  'group', 'timer', 'update', 'siren', 'text',
];

export type LiteralClass = 'exact' | 'prefix' | 'fullid';

export interface Finding {
  file: string;
  line: number;
  token: string;
  cls: LiteralClass;
  context: string;
}

const DOMAIN_SET = new Set(UNIVERSE);

/** Classify a literal's text; undefined when it is not a domain literal. */
export function classify(text: string): { token: string; cls: LiteralClass } | undefined {
  if (DOMAIN_SET.has(text)) return { token: text, cls: 'exact' };
  const dot = text.indexOf('.');
  if (dot <= 0) return undefined;
  const head = text.slice(0, dot);
  if (!DOMAIN_SET.has(head)) return undefined;
  return { token: head, cls: dot === text.length - 1 ? 'prefix' : 'fullid' };
}

const nameOf = (n: ts.Node | undefined): string => {
  if (!n) return '';
  if (ts.isIdentifier(n)) return n.text;
  if (ts.isPropertyAccessExpression(n)) return n.name.text;
  if (ts.isStringLiteralLike(n)) return n.text;
  return '';
};

/** Syntactic position: kind of the nearest enclosing carrier, `:`, its name (FR-5 d). */
export function contextOf(node: ts.Node): string {
  for (let c: ts.Node | undefined = node.parent, child: ts.Node = node; c; child = c, c = c.parent) {
    if (ts.isPropertyAssignment(c)) return `PropertyAssignment:${nameOf(c.name)}`;
    if (ts.isBinaryExpression(c)) {
      const other = c.left === child ? c.right : c.left;
      return `BinaryExpression:${nameOf(other)}`;
    }
    if (ts.isCallExpression(c)) return `CallExpression:${nameOf(c.expression)}`;
    if (ts.isCaseClause(c)) return `CaseClause:${nameOf(c.expression)}`;
    if (ts.isArrayLiteralExpression(c)) {
      const p = c.parent;
      const owner = p && ts.isVariableDeclaration(p) ? nameOf(p.name) : p && ts.isPropertyAssignment(p) ? nameOf(p.name) : '';
      return `ArrayLiteralExpression:${owner}`;
    }
    if (ts.isVariableDeclaration(c)) return `VariableDeclaration:${nameOf(c.name)}`;
    if (ts.isPropertyDeclaration(c)) return `PropertyDeclaration:${nameOf(c.name)}`;
    if (ts.isParameter(c)) return `Parameter:${nameOf(c.name)}`;
    if (ts.isStatement(c)) break;
  }
  return 'Other:';
}

const isTypeLevel = (n: ts.Node): boolean => !!n.parent && ts.isLiteralTypeNode(n.parent);
const isModuleSpecifier = (n: ts.Node): boolean =>
  !!n.parent &&
  ((ts.isImportDeclaration(n.parent) && n.parent.moduleSpecifier === n) ||
    (ts.isExportDeclaration(n.parent) && n.parent.moduleSpecifier === n) ||
    (ts.isExternalModuleReference(n.parent)) ||
    (ts.isImportTypeNode(n.parent)));

/** Every domain literal (all classes) of one source text. */
export function scanSource(file: string, text: string): Finding[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out: Finding[] = [];
  const push = (n: ts.Node, value: string): void => {
    const hit = classify(value);
    if (!hit) return;
    const { line } = sf.getLineAndCharacterOfPosition(n.getStart(sf));
    out.push({ file, line: line + 1, token: hit.token, cls: hit.cls, context: contextOf(n) });
  };
  const visit = (n: ts.Node): void => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      if (!isTypeLevel(n) && !isModuleSpecifier(n)) push(n, n.text);
    } else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) {
      push(n, n.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

/** Only what the guard probes: exact and prefix. */
export const probed = (f: Finding): boolean => f.cls !== 'fullid';

/** Differently-shaped scan (FR-5 b): quoted universe tokens, line by line, no AST. */
export interface RegexHit {
  file: string;
  line: number;
  /** 0-based column of the opening quote. */
  col: number;
  token: string;
  text: string;
}
export function regexTokens(file: string, text: string): RegexHit[] {
  const out: RegexHit[] = [];
  const alt = UNIVERSE.join('|');
  const re = new RegExp(`(['"\`])(${alt})\\.?\\1|\`(${alt})\\.`, 'g');
  text.split('\n').forEach((lineText, i) => {
    for (const m of lineText.matchAll(re)) {
      out.push({ file, line: i + 1, col: m.index ?? 0, token: (m[2] ?? m[3]) as string, text: lineText });
    }
  });
  return out;
}

/**
 * A regex hit that is not code: a comment, a type-level index (`Config['weather']`) or a
 * markup attribute value (`type="text"`, `[role="button"]`) inside an html / css template.
 */
export function explainedByNonCode(hit: RegexHit): boolean {
  const t = hit.text.trim();
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return true;
  const slashes = hit.text.indexOf('//');
  if (slashes !== -1 && slashes < hit.col) return true;
  const before = hit.text.slice(0, hit.col);
  if (/\w\[$/.test(before)) return true;
  return hit.text[hit.col] === '"' && before.endsWith('=');
}

// ─── Allow-list, cross-check and file-set controls (FR-5 b, c, d) ───────────────────

/** One allowed literal: where (file + syntactic context), how many, and why. */
export interface AllowEntry {
  file: string;
  /** `light` for an exact literal, `light.` for a prefix. */
  literal: string;
  context: string;
  max: number;
  reason: string;
}

const literalOf = (f: Finding): string => (f.cls === 'prefix' ? `${f.token}.` : f.token);
const KNOWN = new Set<string>(Object.values(DOMAIN));

/** Problems of the guard: literals outside the allow-list and every allow-list defect. */
export function checkAllowList(findings: readonly Finding[], allow: readonly AllowEntry[]): string[] {
  const problems: string[] = [];
  const probedFindings = findings.filter(probed);
  const found = new Map<AllowEntry, number>();
  allow.forEach((e) => found.set(e, 0));
  for (const e of allow) {
    if (!e.reason.trim()) problems.push(`allow-list entry ${e.file} '${e.literal}': empty reason — fill the reason`);
    if (!(e.max >= 1)) problems.push(`allow-list entry ${e.file} '${e.literal}': max must be >= 1`);
  }
  for (const f of probedFindings) {
    const entry = allow.find((e) => e.file === f.file && e.literal === literalOf(f) && e.context === f.context);
    if (entry) {
      const n = (found.get(entry) ?? 0) + 1;
      found.set(entry, n);
      if (n > entry.max) {
        problems.push(
          `over bound: '${literalOf(f)}' at ${f.file}:${f.line} (${f.context}) exceeds max ${entry.max} — fix the source, or raise max only if the new site is legitimate`
        );
      }
      continue;
    }
    if (f.cls === 'exact' && !KNOWN.has(f.token)) {
      problems.push(
        `unknown domain '${f.token}' at ${f.file}:${f.line} — add ${f.token.toUpperCase()}: '${f.token}' to DOMAIN in src/types/domains.ts (and to the value table)`
      );
    } else {
      problems.push(
        `domain literal '${literalOf(f)}' at ${f.file}:${f.line} — use DOMAIN.${f.token.toUpperCase()} from src/types/domains.ts`
      );
    }
  }
  for (const e of allow) {
    const n = found.get(e) ?? 0;
    if (n === 0) {
      const elsewhere = probedFindings.filter((f) => f.file === e.file && literalOf(f) === e.literal);
      problems.push(
        elsewhere.length > 0
          ? `wrong context: allow-list entry ${e.file} '${e.literal}' expects ${e.context}, found in ${[...new Set(elsewhere.map((f) => f.context))].join(', ')} — delete the entry or fix its context`
          : `stale: allow-list entry ${e.file} '${e.literal}' (${e.context}) matches nothing — delete the entry`
      );
    } else if (n < e.max) {
      problems.push(`stale bound: allow-list entry ${e.file} '${e.literal}' (${e.context}) found ${n} < max ${e.max} — lower max`);
    }
  }
  return problems;
}

/** Regex hits that neither non-code nor an AST finding (same file, line, token) explains. */
export function crossCheck(
  sources: readonly { file: string; text: string }[],
  astFindings: readonly Finding[]
): string[] {
  const missed: string[] = [];
  for (const s of sources) {
    for (const hit of regexTokens(s.file, s.text)) {
      if (explainedByNonCode(hit)) continue;
      if (astFindings.some((f) => f.file === hit.file && f.line === hit.line && f.token === hit.token)) continue;
      missed.push(`${hit.file}:${hit.line} '${hit.token}'`);
    }
  }
  return missed;
}

/** Differences between the files a scan visited and the files that exist (FR-5 c). */
export function visitedDiff(visited: readonly string[], expected: readonly string[]): string[] {
  const v = new Set(visited);
  const e = new Set(expected);
  return [
    ...expected.filter((f) => !v.has(f)).map((f) => `dropped: ${f}`),
    ...visited.filter((f) => !e.has(f)).map((f) => `unexpected: ${f}`),
  ];
}
