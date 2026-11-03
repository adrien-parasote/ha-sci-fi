/**
 * Detector for French copy written outside the translation circuit
 * (spec i18n-hardcoded-fr FR-1). Pure functions, TypeScript AST only:
 * never a line regex over the file.
 */
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface Finding {
  file: string;
  line: number;
  text: string;
}

export interface Analysis {
  findings: Finding[];
  literalCount: number;
}

const ACCENT = /[àâäçèéêëîïôöùûüÿœ]/i;

/**
 * French function words, each chosen because a census literal used it
 * (Nom DE la source, AjoutER une source, Aucune lumiere, Tout allumer,
 * Bouton ..., d'action, l'..., (ex: ...), pour cet etage).
 */
const FRENCH_WORDS = [
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', "d'", "l'",
  'aucun', 'aucune', 'ajouter', 'pour', 'cet', 'cette', 'ex:', 'tout', 'toute', 'bouton',
];
const WORD_RE = new RegExp(
  FRENCH_WORDS.map((w) =>
    w.endsWith("'") || w.endsWith(':')
      ? `(?<![\\p{L}\\p{N}_])${w}`
      : `(?<![\\p{L}\\p{N}_])${w}(?![\\p{L}\\p{N}_])`
  ).join('|'),
  'iu'
);

const SINK_ATTRS = new Set(['label', 'title', 'text', 'placeholder', 'aria-label']);
const TOAST_CALLS = new Set(['_showToast', '__toast', 'showToast']);
const SLOT = '\u0000';

function stripCommentRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const re = /<!--[\s\S]*?-->/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) ranges.push([m.index, m.index + m[0].length]);
  return ranges;
}

function isStringLeaf(n: ts.Node): n is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral {
  return ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n);
}

/** String literals that are the whole expression or a branch of ?:, ??, || or &&. */
function leavesOf(expr: ts.Expression): ts.Node[] {
  if (ts.isParenthesizedExpression(expr)) return leavesOf(expr.expression);
  if (ts.isConditionalExpression(expr)) return [...leavesOf(expr.whenTrue), ...leavesOf(expr.whenFalse)];
  if (ts.isBinaryExpression(expr)) {
    const k = expr.operatorToken.kind;
    if (k === ts.SyntaxKind.QuestionQuestionToken || k === ts.SyntaxKind.BarBarToken || k === ts.SyntaxKind.AmpersandAmpersandToken) {
      return [...leavesOf(expr.left), ...leavesOf(expr.right)];
    }
    return [];
  }
  if (isStringLeaf(expr)) return [expr];
  if (ts.isTemplateExpression(expr)) return [expr];
  return [];
}

function staticTextOf(n: ts.Node): string {
  if (isStringLeaf(n)) return n.text;
  if (ts.isTemplateExpression(n)) return [n.head.text, ...n.templateSpans.map((s) => s.literal.text)].join(' ');
  return '';
}

interface TemplateScan {
  /** words judged in static attribute values and text nodes */
  staticSinks: string[];
  /** per ${} slot: the sink attribute name, 'text' for text position, or null */
  slots: Array<string | null>;
}

/** Walks the static chunks of an html template as a tiny tag/text state machine. */
function scanHtml(joined: string): TemplateScan {
  const staticSinks: string[] = [];
  const slots: Array<string | null> = [];
  let i = 0;
  let text = '';
  const flushText = () => {
    if (text.trim()) staticSinks.push(text.replaceAll(SLOT, ' '));
    text = '';
  };
  while (i < joined.length) {
    if (joined.startsWith('<!--', i)) {
      const end = joined.indexOf('-->', i + 4);
      const stop = end === -1 ? joined.length : end + 3;
      for (const c of joined.slice(i, stop)) if (c === SLOT) slots.push(null);
      i = stop;
      continue;
    }
    const c = joined[i]!;
    if (c === '<' && /[A-Za-z/]/.test(joined[i + 1] ?? '')) {
      flushText();
      let quote = '';
      let buf = '<';
      i++;
      while (i < joined.length) {
        const d = joined[i]!;
        if (d === SLOT) {
          const m = /([.?@]?[A-Za-z][\w:-]*)\s*=\s*(?:"[^"]*|'[^']*|)$/.exec(buf);
          const name = m ? m[1]! : '';
          const bare = name.replace(/^[.?]/, '');
          slots.push(SINK_ATTRS.has(bare) ? bare : null);
        }
        if (quote) {
          if (d === quote) quote = '';
        } else if (d === '"' || d === "'") {
          quote = d;
        } else if (d === '>') {
          buf += d;
          i++;
          break;
        }
        buf += d;
        i++;
      }
      const attr = /(?:^|\s)([a-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
      let a: RegExpExecArray | null;
      while ((a = attr.exec(buf)) !== null) {
        if (SINK_ATTRS.has(a[1]!)) staticSinks.push((a[2] ?? a[3] ?? a[4] ?? '').replaceAll(SLOT, ' '));
      }
      continue;
    }
    if (c === SLOT) slots.push('text');
    text += c;
    i++;
  }
  flushText();
  return { staticSinks, slots };
}

function isTag(n: ts.TaggedTemplateExpression, names: string[]): boolean {
  return ts.isIdentifier(n.tag) && names.includes(n.tag.text);
}

export function analyseSource(source: string, fileName: string): Analysis {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  // public API only: an in-memory program reports the syntactic diagnostics of this one file
  const host = ts.createCompilerHost({});
  const realGet = host.getSourceFile.bind(host);
  host.getSourceFile = (name, ...rest) => (name === fileName ? sf : realGet(name, ...rest));
  const program = ts.createProgram([fileName], { noLib: true, noResolve: true, target: ts.ScriptTarget.Latest }, host);
  const diags = program.getSyntacticDiagnostics(sf);
  if (diags.length > 0) {
    const d = diags[0]!;
    throw new Error(`parse failure in ${fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
  }
  const findings = new Map<number, Finding>();
  let literalCount = 0;
  const skipData = fileName.endsWith('.fr-data.ts');

  const report = (node: ts.Node, text: string, at?: number) => {
    if (skipData) return; // FR-1: a *.fr-data.ts file is exempt as a whole
    const pos = at ?? node.getStart(sf);
    const line = ts.getLineAndCharacterOfPosition(sf, pos).line + 1;
    if (findings.has(pos)) return;
    findings.set(pos, { file: fileName, line, text: text.trim().slice(0, 80) });
  };
  const judgeWords = (node: ts.Node, text: string) => {
    if (WORD_RE.test(text)) report(node, text);
  };
  const judgeAccents = (node: ts.Node, text: string) => {
    if (ACCENT.test(text)) report(node, text);
  };

  const checkHtml = (tpl: ts.TemplateLiteral) => {
    const parts = ts.isNoSubstitutionTemplateLiteral(tpl)
      ? [tpl.text]
      : [tpl.head.text, ...tpl.templateSpans.map((s) => s.literal.text)];
    const joined = parts.join(SLOT);
    // accented letters outside HTML comments, per template part
    const comments = stripCommentRanges(joined);
    let offset = 0;
    const nodes: ts.Node[] = ts.isNoSubstitutionTemplateLiteral(tpl) ? [tpl] : [tpl.head, ...tpl.templateSpans.map((s) => s.literal)];
    parts.forEach((p, idx) => {
      // blank (not drop) comment characters so offsets still map back to the source
      const kept = [...p].map((ch, k) => (comments.some(([a, b]) => offset + k >= a && offset + k < b) ? ' ' : ch)).join('');
      let lineStart = 0;
      for (const lineText of kept.split('\n')) {
        const hit = ACCENT.exec(lineText);
        if (hit) report(nodes[idx]!, lineText, nodes[idx]!.getStart(sf) + 1 + lineStart + hit.index);
        lineStart += lineText.length + 1;
      }
      offset += p.length + 1;
    });
    const scan = scanHtml(joined);
    // sinks come in document order: locate each in the template source so the finding names ITS line
    const tplText = tpl.getText(sf);
    let cursor = 0;
    for (const s of scan.staticSinks) {
      const token = s.trim().split(/\s+/)[0] ?? '';
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, (ch) => `\\${ch}`);
      const found = token
        ? new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'u').exec(tplText.slice(cursor))
        : null;
      const idx = found ? cursor + found.index : -1;
      if (idx >= 0) cursor = idx + 1;
      if (!WORD_RE.test(s)) continue;
      const at = tpl.getStart(sf) + Math.max(idx, 0);
      const atLine = ts.getLineAndCharacterOfPosition(sf, at).line + 1;
      // an accent already reported on this line of the template is the same text: report it once
      if ([...findings.values()].some((x) => x.line === atLine)) continue;
      report(tpl, s, at);
    }
    if (ts.isTemplateExpression(tpl)) {
      tpl.templateSpans.forEach((span, idx) => {
        if (scan.slots[idx]) for (const leaf of leavesOf(span.expression)) judgeWords(leaf, staticTextOf(leaf));
      });
    }
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return;
    if (ts.isTypeNode(node)) return;
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (ts.isIdentifier(callee) && callee.text === 'msg') return;
      const name = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : '';
      if (TOAST_CALLS.has(name)) {
        for (const arg of node.arguments) for (const leaf of leavesOf(arg)) judgeWords(leaf, staticTextOf(leaf));
      }
    }
    if (ts.isTaggedTemplateExpression(node)) {
      if (isTag(node, ['css'])) return; // a str`` inside msg() never reaches here: msg() returns above
      if (isTag(node, ['html', 'svg'])) {
        if (!skipData) checkHtml(node.template);
        // string pieces counted below through the generic walk
      }
    }
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken || node.operatorToken.kind === ts.SyntaxKind.BarBarToken)
    ) {
      for (const leaf of leavesOf(node.right)) judgeWords(leaf, staticTextOf(leaf));
    }
    if (isStringLeaf(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      literalCount++;
      if (!skipData && !isHtmlTemplatePiece(node)) judgeAccents(node, node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { findings: [...findings.values()].sort((a, b) => a.line - b.line), literalCount };
}

/** True for a piece of an html`…` template (judged as a whole by checkHtml). */
function isHtmlTemplatePiece(node: ts.Node): boolean {
  if (ts.isStringLiteral(node)) return false;
  const tpl = ts.isNoSubstitutionTemplateLiteral(node) ? node : ts.isTemplateHead(node) ? node.parent : node.parent.parent;
  const p = tpl.parent;
  return !!p && ts.isTaggedTemplateExpression(p) && p.template === tpl && isTag(p, ['html', 'svg']);
}

export function findFrenchLiterals(source: string, fileName: string): Finding[] {
  return analyseSource(source, fileName).findings;
}

/** Anti-pattern 7: `cond ? msg('A') : msg('B')`. */
export function findMsgTernaries(source: string, fileName: string): Finding[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out: Finding[] = [];
  const unwrap = (e: ts.Expression): ts.Expression => (ts.isParenthesizedExpression(e) ? unwrap(e.expression) : e);
  const isMsg = (e: ts.Expression) => {
    const u = unwrap(e);
    return ts.isCallExpression(u) && ts.isIdentifier(u.expression) && u.expression.text === 'msg';
  };
  const visit = (n: ts.Node) => {
    if (ts.isConditionalExpression(n) && isMsg(n.whenTrue) && isMsg(n.whenFalse)) {
      out.push({ file: fileName, line: ts.getLineAndCharacterOfPosition(sf, n.getStart(sf)).line + 1, text: n.getText(sf).slice(0, 80) });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

/** The msg() sources of a file; a `str` template keeps its `${…}` as written. */
export function msgSourcesOf(source: string, fileName: string): string[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const out: string[] = [];
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'msg' && n.arguments[0]) {
      const a = n.arguments[0];
      if (isStringLeaf(a)) out.push(a.text);
      else if (ts.isTaggedTemplateExpression(a) && ts.isIdentifier(a.tag) && a.tag.text === 'str') {
        const t = a.template;
        out.push(
          ts.isNoSubstitutionTemplateLiteral(t)
            ? t.text
            : t.head.text + t.templateSpans.map((s) => `\${${s.expression.getText(sf)}}` + s.literal.text).join('')
        );
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

/** FR-1.1: `git ls-files -co --exclude-standard src`, *.ts, minus src/locales/. */
export function listSourceFiles(root: string): string[] {
  const out = execFileSync('git', ['ls-files', '-co', '--exclude-standard', 'src'], { cwd: root, encoding: 'utf8' });
  return [...new Set(out.split('\n').filter(Boolean))]
    .filter((f) => f.endsWith('.ts') && !f.startsWith('src/locales/') && existsSync(join(root, f)))
    .sort();
}

/** Independent probe: fs recursion, minus git-ignored paths. */
export function listSourceFilesByFs(root: string): string[] {
  const all: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (e.endsWith('.ts')) all.push(relative(root, p));
    }
  };
  walk(join(root, 'src'));
  const candidates = all.filter((f) => !f.startsWith('src/locales/'));
  let ignored = new Set<string>();
  try {
    const res = execFileSync('git', ['check-ignore', '--stdin'], { cwd: root, encoding: 'utf8', input: candidates.join('\n') });
    ignored = new Set(res.split('\n').filter(Boolean));
  } catch (e) {
    // exit 1 = nothing ignored; anything else (128, git missing) is a real failure
    if ((e as { status?: number }).status !== 1) throw e;
  }
  return candidates.filter((f) => !ignored.has(f)).sort();
}
