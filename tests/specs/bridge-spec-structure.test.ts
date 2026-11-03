/**
 * Guards the STRUCTURE and the FACTUAL CLAIMS of docs/specs/cards/bridge.md —
 * lot fix `bridge-md-structure`, bead ha-sci-fi-1b3.
 *
 * The retrocheck of 2026-10-31 found a spec no tool could read as a contract: a
 * nested fence swallowed the last fifty lines into a code block, two
 * `## Test Case Specifications` tables disagreed, a feature row pointed at a
 * section nobody had written, and the File Tree mixed a tree with import
 * statements and a literal truncation marker. None of it was visible to the
 * suite, because nothing in the suite read the spec.
 *
 * Round 1 of the review then found twelve more defects — four of them in the
 * first version of THESE guards, which greened what they were written to catch:
 * a pointer regex that stopped at the first space and accepted `§ Test Cases`
 * by substring, a test-id check that asserted the id was in the spec rather
 * than carried by a test, a `Call Kids` check that whitelisted the very block
 * holding the stale name, and a `this.config` check blind to the inherited
 * fields. Each of those is now mechanical in BOTH directions.
 *
 * The rule the whole file follows: re-measure the defect, never match the
 * corrected string. A guard that matches today's wording passes tomorrow's
 * rewording of the same mistake.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SPEC = join(ROOT, 'docs', 'specs', 'cards', 'bridge.md');
const HISTORY = join(ROOT, 'docs', 'specs', 'bridge-md-structure', 'spec-history.md');
const CONFIG_TS = join(ROOT, 'src', 'cards', 'bridge', 'config.ts');
const BASE_CONFIG_TS = join(ROOT, 'src', 'types', 'config.ts');
const METADATA_TS = join(ROOT, 'src', 'cards', 'bridge', 'config-metadata.ts');
const STYLES_TS = join(ROOT, 'src', 'cards', 'bridge', 'styles.ts');
const CARD_TS = join(ROOT, 'src', 'cards', 'bridge', 'sci-fi-bridge.ts');
const EDITOR_TS = join(ROOT, 'src', 'cards', 'bridge', 'sci-fi-bridge-editor.ts');

const spec = readFileSync(SPEC, 'utf8');
const specLines = spec.split('\n');

/**
 * Walk the document's fenced code blocks the way CommonMark does: a block
 * opened with N backticks is closed by the first line of at least N backticks
 * carrying no info string. A fence-looking line INSIDE an open block is
 * content — which is exactly how the nested ```yaml of the original defect
 * went unnoticed.
 */
function walkFences(lines: string[]): { unclosedFrom: number | null; inCode: Set<number> } {
  let openLen: number | null = null;
  let openedAt = 0;
  const inCode = new Set<number>();
  lines.forEach((line, idx) => {
    const m = /^(`{3,})(.*)$/.exec(line);
    if (m) {
      const ticks = m[1]!.length;
      const info = m[2]!.trim();
      if (openLen === null) {
        openLen = ticks;
        openedAt = idx + 1;
      } else if (info === '' && ticks >= openLen) {
        openLen = null;
      }
      return;
    }
    if (openLen !== null) inCode.add(idx + 1);
  });
  return { unclosedFrom: openLen === null ? null : openedAt, inCode };
}

/** Headings of the document itself — those NOT trapped inside a code block. */
function liveHeadings(): string[] {
  const { inCode } = walkFences(specLines);
  return specLines
    .map((line, idx) => ({ line, no: idx + 1 }))
    .filter(({ line, no }) => /^#{2,4} /.test(line) && !inCode.has(no))
    .map(({ line }) => line.replace(/^#+ /, '').trim());
}

/** The body of a `## `/`### ` section, up to the next heading of that level or above. */
function section(title: string): string[] {
  const start = specLines.findIndex((l) => l.trim() === title);
  expect(start, `témoin positif : ${title} existe`).toBeGreaterThan(-1);
  const level = /^#+/.exec(title)![0].length;
  const end = specLines.findIndex(
    (l, i) => i > start && new RegExp(`^#{2,${level}} `).test(l),
  );
  return specLines.slice(start, end === -1 ? undefined : end);
}

/** `{ InterfaceName: { field: isOptional } }` for every `export interface` in a text. */
function parseInterfaces(text: string): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  const re = /export interface (\w+)(?: extends \w+)? \{([\s\S]*?)\n\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const fields: Record<string, boolean> = {};
    for (const f of m[2]!.matchAll(/^\s*(?:readonly )?([a-zA-Z_]\w*)(\??):/gm)) {
      fields[f[1]!] = f[2] === '?';
    }
    out[m[1]!] = fields;
  }
  return out;
}

/** Every file the repository tracks (or has added) under tests/, concatenated. */
function testSources(): string {
  const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', 'tests'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter((f) => f.endsWith('.ts'));
  expect(files.length, 'témoin positif : des fichiers de test sont trouvés').toBeGreaterThan(10);
  return files.map((f) => readFileSync(join(ROOT, f), 'utf8')).join('\n');
}

describe('bridge.md — structure du document', () => {
  it('O1 — chaque renvoi « This spec § X » résout vers un titre EXACT du document', () => {
    const headings = liveHeadings();
    const siblings = [
      'sf-bridge-crew', 'sf-bridge-alerts', 'sf-bridge-access', 'sf-bridge-automations',
      'sf-bridge-appliances', 'sf-bridge-stove', 'sf-bridge-vehicle', 'sf-bridge-actions',
    ];
    for (const s of siblings) expect(headings, `témoin positif ${s}`).toContain(s);

    // The pointer is the whole table cell after `This spec § `, not its first
    // word: round 1 proved that a regex stopping at the space turns the dangling
    // `§ Test Cases` into an accepted `Test`. Exact equality, never `includes`.
    const pointers = [...spec.matchAll(/This spec § ?([^|\n]+)/g)].map((m) => m[1]!.trim());
    expect(pointers.length, 'la spec porte des renvois').toBeGreaterThan(10);
    expect(pointers.filter((p) => !headings.includes(p))).toEqual([]);
  });

  it('O2 — fences équilibrés, et aucune section du document prise dans un bloc de code', () => {
    const { unclosedFrom, inCode } = walkFences(specLines);
    expect(unclosedFrom, 'un fence ouvert jusqu\'à la fin du fichier').toBeNull();

    const headings = liveHeadings();
    for (const h of ['Deep Links', 'Shared Artifact Schema', 'Assumptions', 'Test Case Specifications']) {
      expect(headings, `§${h} doit rester du document`).toContain(h);
    }
    // No heading of the document may hide inside a block, in either direction:
    // every `## ` line trapped in code must belong to a quoted sample, and the
    // only sample left in the spec is the YAML config one, which has no heading.
    const trapped = specLines
      .map((line, idx) => ({ line, no: idx + 1 }))
      .filter(({ line, no }) => /^#{2,4} /.test(line) && inCode.has(no));
    expect(trapped.map((t) => t.line)).toEqual([]);
  });

  it('O3 — une table de Test Cases, aucun id emprunté, et chaque id porté par un test', () => {
    expect(liveHeadings().filter((h) => h === 'Test Case Specifications')).toHaveLength(1);

    // TC-101..105 / IT-101..103 belong to 01_infrastructure.md and sci-fi.test.ts.
    expect([...spec.matchAll(/(?<![A-Z-])(TC|IT)-1\d{2}(?![\d-])/g)].map((m) => m[0])).toEqual([]);

    // Uniqueness belongs to the TABLE: an id may also be cited in prose (the
    // behavioral-claims block cites TC-BRIDGE-U-22/23 and U-24), and that is not
    // a duplicate row.
    const rows = [...spec.matchAll(/^\| ((?:TC|IT)-BRIDGE-[A-Z]-\d+) \|/gm)].map((m) => m[1]!);
    expect(rows.length, 'témoin positif : la table a des lignes').toBeGreaterThan(30);
    expect(new Set(rows).size, 'aucun id en double dans la table').toBe(rows.length);

    const ids = [...new Set([...spec.matchAll(/(?:TC|IT)-BRIDGE-[A-Z]-\d+/g)].map((m) => m[0]))];
    expect(ids.filter((id) => !rows.includes(id)), 'id cité en prose et absent de la table').toEqual([]);

    // The direction round 1 caught missing: an id the spec mints but no test
    // carries is an orphan, and asserting the string is in the spec proves
    // nothing. Both directions, so a renamed id cannot drift either way.
    const tests = testSources();
    expect(ids.filter((id) => !tests.includes(id)), 'ids de la spec que nul test ne porte').toEqual([]);
    const inTests = [...tests.matchAll(/(?:TC|IT)-BRIDGE-[A-Z]-\d+/g)].map((m) => m[0]);
    expect(inTests.length).toBeGreaterThan(30);
    expect([...new Set(inTests)].filter((id) => !ids.includes(id)), 'ids cités par un test et absents de la spec').toEqual([]);
  });

  it('O4 — le §File Tree est un arbre, pas un collage d\'imports et de troncatures', () => {
    const sec = section('### File Tree');
    const open = sec.findIndex((l) => l.trim() === '```');
    const close = sec.findIndex((l, i) => i > open && l.trim() === '```');
    expect(open, 'témoin positif : l\'arbre est dans un bloc').toBeGreaterThan(-1);
    const tree = sec.slice(open + 1, close).join('\n');

    expect(tree).not.toMatch(/^import /m);
    expect(tree).not.toContain('[EXTERNAL]');
    expect(tree).not.toContain('remaining file content remains unchanged');
    // dev/workbench.html used to be a tree node receiving README.md and
    // lit/decorators.js as children — it is not part of the card's tree.
    expect(tree).not.toContain('workbench.html');
    expect(tree, 'témoin positif : les sections y sont').toContain('sf-bridge-actions.ts');
  });

  it('O5 — l\'en-tête Covers couvre la table Blueprint Coverage réelle', () => {
    const rows = [...spec.matchAll(/^\| (F-BR-\d+) \|/gm)].map((m) => m[1]!);
    expect(rows.length, 'témoin positif : la table a des lignes').toBeGreaterThan(0);
    const header = /> Covers: F-BR-01 → (F-BR-\d+)/.exec(spec);
    expect(header, 'l\'en-tête annonce une plage').not.toBeNull();
    expect(header![1]).toBe(rows[rows.length - 1]!);
  });

  it('O6 — le §config-metadata publié est celui que le code porte, clé pour clé', () => {
    const code = readFileSync(METADATA_TS, 'utf8');
    const keysOf = (text: string): string[] =>
      [...text.matchAll(/^\s{2}(\w+): \{ type: '(\w+)'/gm)].map((m) => `${m[1]}:${m[2]}`);

    const published = keysOf(section('## config-metadata').join('\n'));
    const declared = keysOf(code);
    expect(declared.length, 'témoin positif : le code déclare des clés').toBeGreaterThan(5);
    expect(published).toEqual(declared);
    // access/automations are objects: §TypeScript Interfaces types them so, and
    // anti-pattern 12 forbids iterating them as arrays.
    expect(declared).toContain('access:object');
    expect(declared).toContain('automations:object');
    expect(declared, 'persons EST un tableau — la garde ne doit pas tout aplatir').toContain('persons:array');
  });

  it('O7 — §Responsive Layout publie les DEUX régimes que styles.ts rend', () => {
    const styles = readFileSync(STYLES_TS, 'utf8');
    expect(styles, 'témoin positif : le code fait le flux colonne').toMatch(/display: block;[\s\S]*columns: 2;/);
    expect(styles, 'témoin positif : le code fait le column-span').toMatch(/column-span: all;/);

    const block = section('### Responsive Layout — styles.ts').join('\n');
    expect(block).not.toContain('grid-template-columns: 1fr 1fr');
    for (const rule of ['display: block;', 'columns: 2;', 'break-inside: avoid;', 'column-span: all;']) {
      expect(block, `la spec publie ${rule}`).toContain(rule);
    }
    // The portrait rule alone was published, and it is inert under columns: 2 —
    // both must be there, so a reader knows which applies when.
    expect(block).toContain('grid-column: 1 / -1;');
  });

  it('O8 — « Call Kids » ne survit nulle part dans la spec', () => {
    // Round 1: the first version of this guard whitelisted code blocks, which is
    // where the stale name lived. The quoted CHANGELOG is archived now, so the
    // document owes zero occurrences — no exception to hide behind.
    expect(specLines.filter((l) => l.includes('Call Kids'))).toEqual([]);
    expect(spec, 'la section renommée est là').toMatch(/^\| \*\*Actions\*\* \|/m);
  });

  it('O9 — §Shared Artifact Schema décrit this.config, héritage compris', () => {
    const own = parseInterfaces(readFileSync(CONFIG_TS, 'utf8'))['SciFiBridgeConfig'];
    const base = parseInterfaces(readFileSync(BASE_CONFIG_TS, 'utf8'))['SciFiBaseConfig'];
    expect(own, 'témoin positif : SciFiBridgeConfig est trouvée').toBeDefined();
    expect(base, 'témoin positif : SciFiBaseConfig est trouvée').toBeDefined();
    const declared = new Set([...Object.keys(own!), ...Object.keys(base!)]);

    const published = section('### `this.config`')
      .map((l) => /^\| ([a-z_]+) \|/.exec(l))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => m[1]!);

    expect(published.length).toBeGreaterThan(5);
    expect(published.filter((f) => !declared.has(f)), 'champs publiés que l\'interface n\'a pas').toEqual([]);
    // The two the table omitted, and the four it inherits.
    for (const f of ['type', 'title', 'header_message', 'tap_action', 'hold_action', 'double_tap_action']) {
      expect(published, `${f} doit être publié`).toContain(f);
    }
  });

  it('O10 — aucun symbole TypeScript nommé par la spec n\'est absent de src/', () => {
    expect(spec).not.toMatch(/`BridgeConfig`/);
    expect(spec, 'le nom réel').toContain('`SciFiBridgeConfig`');
    expect(readFileSync(CONFIG_TS, 'utf8')).toContain('export interface SciFiBridgeConfig');
  });

  it('O11 — les interfaces de la carte sont renvoyées à son propre config.ts (ADR-017)', () => {
    expect(spec).not.toMatch(/src\/types\/config\.ts`? \(additions Bridge\)/);
    expect(spec).not.toMatch(/src\/types\/config\.ts`? \(MODIFY/);
    expect(spec).not.toMatch(/import type \{ SciFiBridgeConfig \} from '\.\.\/\.\.\/types\/config\.js'/);
    expect(spec, 'le fichier réel est cité').toContain('src/cards/bridge/config.ts');
    expect(spec, 'l\'illustration des imports').toContain("from './config.js'");
    expect(readFileSync(CARD_TS, 'utf8')).toContain("from './config.js'");
  });

  it('O13 — aucun bloc d\'en-tête de composant n\'est écrit deux fois', () => {
    // The defect the register first recorded UNREPRODUCED, on a probe whose
    // output had been truncated by `head`: `## Editor` carried **Tag :** and
    // **Extends :** twice in a row. Each custom element declares its tag once.
    const tags = specLines
      .map((l) => /^\*\*Tag(?: custom element)? :\*\* (.+)$/.exec(l))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => m[1]!.trim());
    expect(tags.length, 'témoin positif : des tags sont déclarés').toBeGreaterThan(8);
    const seen = new Set<string>();
    expect(tags.filter((t) => (seen.has(t) ? true : (seen.add(t), false))), 'tags déclarés deux fois').toEqual([]);

    // And the general shape of that defect: the same non-empty line repeated
    // within a four-line window, which is what a copy-paste leaves behind.
    const { inCode } = walkFences(specLines);
    const repeats: string[] = [];
    specLines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || inCode.has(idx + 1) || /^[-|>#]/.test(trimmed)) return;
      for (let k = 1; k <= 4 && idx + k < specLines.length; k++) {
        if (specLines[idx + k]!.trim() === trimmed && !inCode.has(idx + k + 1)) {
          repeats.push(`${idx + 1}+${idx + k + 1}: ${trimmed}`);
        }
      }
    });
    expect(repeats, 'lignes répétées à quatre lignes d\'intervalle').toEqual([]);
  });

  it('O12 — aucune behavioral claim ne reste ASSUMED dans une spec livrée', () => {
    expect(specLines.filter((l) => /\bASSUMED\b \(/.test(l))).toEqual([]);
    expect(spec, 'la décision est écrite').toMatch(/Behavioral claims — tranchées/);
  });
});

describe('bridge.md — les faits qu\'il affirme sur le code', () => {
  it('les interfaces reproduites par la spec sont celles de config.ts, champ pour champ', () => {
    // This is the guard that makes §TypeScript Interfaces unable to drift again:
    // round 1 found SciFiBridgeConfig without `extends SciFiBaseConfig`, without
    // `title?`, with `type: string` instead of the literal, and
    // BridgeVehicleConfig missing `name?` — four drifts in a block that is a
    // copy of the code by construction.
    const code = parseInterfaces(readFileSync(CONFIG_TS, 'utf8'));
    const published = parseInterfaces(spec);
    expect(Object.keys(code).length, 'témoin positif : config.ts déclare des interfaces').toBeGreaterThan(10);
    expect(Object.keys(published).length, 'témoin positif : la spec en reproduit').toBeGreaterThan(10);

    expect(Object.keys(published).filter((n) => !(n in code)), 'interfaces publiées qui n\'existent pas').toEqual([]);
    expect(Object.keys(code).filter((n) => !(n in published)), 'interfaces du code que la spec omet').toEqual([]);
    for (const name of Object.keys(published)) {
      expect(published[name], `les champs de ${name}`).toEqual(code[name]);
    }
    // And the inheritance the spec asserts must be the one the code declares.
    expect(spec).toContain('export interface SciFiBridgeConfig extends SciFiBaseConfig');
    expect(spec).toContain("readonly type: 'custom:sci-fi-bridge'");
  });

  it('§renderCard rend la coquille que renderCard() rend vraiment', () => {
    const card = readFileSync(CARD_TS, 'utf8');
    expect(card, 'témoin positif').toContain('<ha-card');
    const block = section('### renderCard() — Structure').join('\n');
    for (const piece of ['<ha-card', 'bridge-card-title', '<div class="bridge-grid">', '<sf-toast>']) {
      expect(block, `§renderCard doit nommer ${piece}`).toContain(piece);
    }
  });

  it('§External Invocations liste les quatre services que le panneau Actions appelle', () => {
    const resolver = readFileSync(
      join(ROOT, 'src', 'cards', 'bridge', 'sections', 'sf-bridge-actions.ts'),
      'utf8',
    );
    const called = [...resolver.matchAll(/return \[(?:'(\w+)'|DOMAIN\.(\w+)), '(\w+)'\]/g)].map((m) => `${m[1] ?? m[2]!.toLowerCase()}.${m[3]}`);
    expect(called, 'témoin positif : resolveActionService mappe des services').toHaveLength(4);

    const block = section('### External Invocations').join('\n');
    for (const svc of called) {
      const [domain, service] = svc.split('.');
      expect(block, `${svc} doit être publié`).toMatch(
        new RegExp(`\\| \`${domain}\` \\| \`${service}\``),
      );
    }
  });

  it('la table de l\'éditeur n\'annonce pas de champ que l\'éditeur ne rend pas', () => {
    const editor = readFileSync(EDITOR_TS, 'utf8');
    // Six sections render an icon-section field; the Actions one does not.
    const iconFields = [...editor.matchAll(/input-icon-section/g)].length;
    expect(iconFields, 'témoin positif : l\'éditeur rend des champs icône de section').toBeGreaterThan(4);
    const actionsFn = /_renderActionsSection\(\)[\s\S]*?\n {2}\}/.exec(editor);
    expect(actionsFn, 'témoin positif : la fonction existe').not.toBeNull();
    expect(actionsFn![0]).not.toContain('input-icon-section');

    const row = specLines.find((l) => l.startsWith('| **Actions** |'));
    expect(row, 'la ligne Actions existe').toBeDefined();
    expect(row!).not.toMatch(/Icon section \(text\)/);
  });

  it('l\'historique de livraison est archivé, et la spec y renvoie', () => {
    const history = readFileSync(HISTORY, 'utf8');
    expect(history).toContain('README & CHANGELOG Updates');
    expect(history, 'le nom corrigé y est tracé').toContain('Call Kids');
    expect(spec, 'la spec renvoie à l\'archive').toContain('bridge-md-structure/spec-history.md');
    // The prescription itself must be gone from the spec: it is what carried the
    // nested fence of O2.
    expect(spec).not.toContain('Ajouter la carte dans la table');
    expect(spec).not.toContain('tests-953%20passing');
  });
});
