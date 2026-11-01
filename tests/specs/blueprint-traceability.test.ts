/**
 * Guards the TRACEABILITY of the house requirement schema — lot fix
 * `ids-tracabilite`, bead ha-sci-fi-zv1.
 *
 * The retrocheck of 2026-10-31 found that none of the 21 specs carries a
 * `## Requirements` section or an `FR-NN` id, and read that as a missing
 * referential. It is not: the project traces its requirements with
 * `F-<DOMAIN>-NN` rows in a `## Blueprint Coverage` table. What was missing is
 * the other half of the link — those rows pointed at spec SECTIONS and never
 * at test cases, so requirement → test traceability existed in none of them.
 *
 * The user arbitrated on 2026-11-01: keep the house schema, make it traceable.
 * These cases hold the three rules `docs/MASTER.md` § "Ce qu'une table
 * Blueprint Coverage porte, et qui en porte une" now states — a `Covers`
 * column on every row, no Blueprint table on a `Reference` spec, one owner per
 * F id — plus the two measurement defects the same pass found: pointers aiming
 * at sections that do not exist, and ✅ cells claiming code that was never
 * written.
 *
 * Every case carries a POSITIVE WITNESS. Five probes across the three lots of
 * this wave returned a confident zero because their pattern could not match
 * what was there — an id regex refusing the digit inside `F-I18N`, another
 * refusing the second dash of `F-WATER-HIST-01`, a third refusing the bold
 * `| **TC-701** |` of `tv.md`. A guard that can only report absence cannot
 * tell "nothing is wrong" from "nothing was read".
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf8');

/** Tracked spec files, so an ignored or stray markdown file never counts. */
function specFiles(): string[] {
  return execFileSync('git', ['ls-files', 'docs/specs'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f.endsWith('.md'))
    .sort();
}

/** The `## Blueprint Coverage` section of a spec, or null when it has none. */
function blueprint(text: string): string | null {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^## .*Blueprint Coverage/.test(l));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i]!.startsWith('## ')) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n');
}

/** Every heading of a markdown file, h2 to h6, text only. */
function headings(text: string): string[] {
  return [...text.matchAll(/^#{2,6} +(.+?)\s*$/gm)].map((m) => m[1]!.trim());
}

/**
 * The rows of a Blueprint table, as cell arrays. The id may be bold —
 * `tv.md` writes `| **TC-701** |`, and the probe that ignored that in the
 * measurement pass missed a 12-id collision.
 */
function rows(section: string): string[][] {
  return section
    .split('\n')
    .filter((l) => /^\| \*{0,2}F[A-Z0-9-]*\d+ *(↗ *)?\*{0,2} *\|/.test(l))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
}

/** The test-case ids a spec DECLARES as table rows (not the ones it cites). */
function declaredCaseIds(text: string): Set<string> {
  return new Set(
    [...text.matchAll(/^\| \*{0,2}((?:TC|IT)-[A-Z0-9-]*\d+)\*{0,2} *\|/gm)].map((m) => m[1]!),
  );
}

const SPECS = specFiles();
const WITH_TABLE = SPECS.filter((f) => blueprint(read(f)) !== null);
const REFERENCE = ['docs/specs/cards/climates.md', 'docs/specs/cards/lights.md', 'docs/specs/cards/weather.md'];

describe('Blueprint Coverage — la colonne Covers (O1)', () => {
  it('O1: toute table Blueprint porte Covers en dernière colonne', () => {
    expect(WITH_TABLE.length).toBeGreaterThanOrEqual(17); // témoin positif
    const sans = WITH_TABLE.filter((f) => {
      const head = blueprint(read(f))!
        .split('\n')
        .find((l) => /^\| *(Feature ID|ID) *\|/.test(l));
      return !head || !/\| *Covers *\|\s*$/.test(head);
    });
    expect(sans).toEqual([]);
  });

  it('O1: toute ligne F porte une cellule Covers non vide', () => {
    let seen = 0;
    const vides: string[] = [];
    for (const f of WITH_TABLE) {
      for (const cells of rows(blueprint(read(f))!)) {
        seen += 1;
        if (cells.length < 4 || cells[3] === '') vides.push(`${f} ${cells[0]}`);
      }
    }
    expect(seen).toBeGreaterThanOrEqual(145); // témoin positif
    expect(vides).toEqual([]);
  });

  it('O1: tout id TC/IT cité dans Covers est déclaré par la même spec', () => {
    let checked = 0;
    const inconnus: string[] = [];
    for (const f of WITH_TABLE) {
      const text = read(f);
      const declared = declaredCaseIds(text);
      for (const cells of rows(blueprint(text)!)) {
        const cell = cells[3] ?? '';
        // Une cellule qui renvoie à un autre fichier y délègue ses ids.
        if (/\]\(\.{1,2}\//.test(cell)) continue;
        for (const id of cell.match(/\b(?:TC|IT)-[A-Z0-9-]*\d+\b/g) ?? []) {
          checked += 1;
          if (!declared.has(id)) inconnus.push(`${f} ${cells[0]} -> ${id}`);
        }
      }
    }
    expect(checked).toBeGreaterThanOrEqual(200); // témoin positif
    expect(inconnus).toEqual([]);
  });

  it("O1: une absence de couverture est déclarée, jamais laissée implicite", () => {
    // La marque ⬜ décide, PAS la présence d'un id quelque part dans la cellule :
    // une cellule peut mentionner un id en prose sans le revendiquer, et un
    // mutant qui remplaçait « ⬜ aucun cas de test — … » par « aucun cas de
    // test, … » a survécu à la première version de ce cas, qui lisait les ids.
    let marquees = 0;
    let couvertes = 0;
    const muettes: string[] = [];
    for (const f of WITH_TABLE) {
      for (const cells of rows(blueprint(read(f))!)) {
        const cell = cells[3] ?? '';
        const ids = (cell.match(/\b(?:TC|IT)-[A-Z0-9-]*\d+\b/g) ?? []).length;
        const delegue = /\]\(\.{1,2}\//.test(cell);
        if (cell.includes('⬜')) {
          marquees += 1;
          // Une absence déclarée doit porter sa raison, après un tiret cadratin.
          if (!/—/.test(cell)) muettes.push(`${f} ${cells[0]}: raison absente — ${cell}`);
        } else if (ids === 0 && !delegue) {
          muettes.push(`${f} ${cells[0]}: ni id, ni renvoi, ni marque ⬜ — ${cell}`);
        } else {
          couvertes += 1;
        }
      }
    }
    expect(marquees).toBeGreaterThanOrEqual(20); // témoin positif
    expect(couvertes).toBeGreaterThanOrEqual(100); // témoin positif
    expect(muettes).toEqual([]);
  });
});

describe('Blueprint Coverage — qui porte une table (O2, O3, O4)', () => {
  it('O2: water.md, typée Implementation, porte sa table et ses huit lignes', () => {
    const text = read('docs/specs/cards/water.md');
    expect(text).toMatch(/^> Document type: Implementation$/m);
    const section = blueprint(text);
    expect(section).not.toBeNull();
    const ids = rows(section!).map((c) => c[0]);
    expect(ids).toEqual([
      'F-WATER-01',
      'F-WATER-02',
      'F-WATER-03',
      'F-WATER-04',
      'F-WATER-05',
      'F-WATER-06',
      'F-WATER-07',
      'F-WATER-08',
    ]);
  });

  it('O3: les trois annexes de contrat YAML se déclarent Reference', () => {
    for (const f of REFERENCE) {
      expect(read(f), f).toMatch(/^> Document Type: Reference$/m);
    }
  });

  it('O3+O4: une spec Reference ne porte pas de table Blueprint', () => {
    const fautives = REFERENCE.filter((f) => blueprint(read(f)) !== null);
    expect(fautives).toEqual([]);
    // Témoin positif : leur exigence vit bien dans 05_cards.md.
    const s05 = blueprint(read('docs/specs/05_cards.md'))!;
    for (const id of ['F-CARD-02', 'F-CARD-03', 'F-CARD-05']) {
      expect(s05, id).toContain(id);
    }
  });

  it('O4: MASTER.md énonce les trois règles et nomme cette garde', () => {
    const master = read('docs/MASTER.md');
    expect(master).toContain("Ce qu'une table Blueprint Coverage porte, et qui en porte une");
    expect(master).toContain('Chaque ligne F porte une colonne `Covers`');
    expect(master).toContain('ne porte PAS de table Blueprint');
    expect(master).toContain('Un id F est déclaré dans une seule spec');
    expect(master).toContain('tests/specs/blueprint-traceability.test.ts');
  });

  it('O4: un id F n’est déclaré que par une spec, sauf cité avec ↗', () => {
    const owners = new Map<string, string[]>();
    for (const f of WITH_TABLE) {
      for (const cells of rows(blueprint(read(f))!)) {
        const raw = cells[0]!;
        if (raw.includes('↗')) continue; // réalise l'exigence d'une autre spec
        const id = raw.replace(/\*/g, '').trim();
        owners.set(id, [...(owners.get(id) ?? []), f]);
      }
    }
    expect(owners.size).toBeGreaterThanOrEqual(140); // témoin positif
    const partages = [...owners].filter(([, fs]) => fs.length > 1);
    expect(partages).toEqual([]);
  });
});

describe('Blueprint Coverage — les pointeurs de section (O5)', () => {
  it('O5: tout pointeur « This spec § X » nomme un titre existant', () => {
    let checked = 0;
    const casses: string[] = [];
    for (const f of WITH_TABLE) {
      const text = read(f);
      const hs = new Set(headings(text));
      for (const cells of rows(blueprint(text)!)) {
        const cell = cells[2] ?? '';
        const m = /This spec § ?(.+)/.exec(cell);
        if (!m) continue;
        checked += 1;
        // Le pointeur court jusqu'à la fin de la cellule, mais un titre peut
        // lui-même contenir un tiret cadratin (`Constants — plug_const.ts`) et
        // une cellule peut en ajouter du commentaire. On essaie donc la forme
        // longue d'abord, puis les préfixes successifs : le premier titre
        // reconnu gagne, et une cellule qui ne nomme aucun titre échoue.
        const parts = m[1]!.trim().split(' — ');
        let resolved = '';
        for (let n = parts.length; n > 0; n -= 1) {
          const candidate = parts.slice(0, n).join(' — ').trim();
          if (hs.has(candidate)) {
            resolved = candidate;
            break;
          }
        }
        if (resolved === '') casses.push(`${f} ${cells[0]} -> § ${parts[0]}`);
      }
    }
    expect(checked).toBeGreaterThanOrEqual(50); // témoin positif
    expect(casses).toEqual([]);
  });
});

describe('Blueprint Coverage — les ✅ non gagnés (O6)', () => {
  const s01 = (): string => blueprint(read('docs/specs/01_infrastructure.md'))!;
  const rowOf = (section: string, id: string): string =>
    section.split('\n').find((l) => l.startsWith(`| ${id} `)) ?? '';

  it('O6: F-INFRA-03 ne promet pas de serveur de dev dédié tant qu’il n’existe pas', () => {
    const vite = readdirSync(ROOT).filter((e) => e.startsWith('vite.config'));
    expect(vite).toEqual([]); // la mesure du 2026-11-01
    const row = rowOf(s01(), 'F-INFRA-03');
    expect(row).not.toBe('');
    expect(row).toContain('⬜ not delivered');
    expect(row).not.toContain('Vite dev server');
  });

  it('O6: F-INFRA-06 ne promet pas de devcontainer tant qu’il n’existe pas', () => {
    expect(existsSync(join(ROOT, '.devcontainer'))).toBe(false);
    const row = rowOf(s01(), 'F-INFRA-06');
    expect(row).not.toBe('');
    expect(row).toContain('⬜ not delivered');
  });

  it('O6: F-COMP-03 ne revendique pas sf-tabs, qui n’existe pas', () => {
    const components = execFileSync('git', ['ls-files', 'src/components'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(components).toContain('sf-toggle-switch'); // témoin positif
    expect(components).not.toContain('sf-tabs');
    const row = rowOf(blueprint(read('docs/specs/04_components.md'))!, 'F-COMP-03');
    expect(row).not.toBe('');
    // La ligne peut NOMMER sf-tabs, mais pour dire qu'il n'existe pas : ce qui
    // est interdit, c'est de le compter parmi les composants livrés.
    expect(row).toContain('sf-toggle-switch');
    expect(row).toContain('⬜');
    expect(row).toMatch(/Aucun composant `sf-tabs` n'existe/);
    expect(row).not.toMatch(/✅[^⬜]*`sf-tabs`/);
  });
});
