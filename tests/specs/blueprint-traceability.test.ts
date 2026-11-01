/**
 * Guards the TRACEABILITY of the house requirement schema — lot fix
 * `ids-tracabilite`, bead ha-sci-fi-zv1.
 *
 * The retrocheck of 2026-10-31 found that none of the 21 specs carries a
 * `## Requirements` section or an `FR-NN` id, and read that as a missing
 * referential. It is not: the project traces its requirements with
 * `F-<DOMAIN>-NN` rows in a `## Blueprint Coverage` table. What was missing is
 * the other half of the link — those rows pointed at spec SECTIONS and never
 * at the tests.
 *
 * The `Covers` column cites TEST FILES, not test-case ids, and that is the
 * round-1 review's doing. The first version of this lot cited ids, and 27 of
 * its 229 citations resolved, in the suite, to a test of a DIFFERENT card:
 * `TC-001` is declared as a table row by five specs, and the only `it()` that
 * carries that title tests the weather card. An id is ambiguous across specs
 * (bead `ha-sci-fi-cft` tracks the 20 colliding ids); a path is not, and a
 * path is checkable — which is why the guard below can verify the whole
 * column instead of trusting the mapping its author wrote.
 *
 * Every case carries a POSITIVE WITNESS, and no witness is a frozen count.
 * Round 1 also showed why: the thresholds were set to the pre-lot numbers, the
 * tree grew past all six, and renaming a `## Blueprint Coverage` heading took
 * a whole table out of the guard's view while the suite stayed green. Each
 * witness here is now derived from the tree by a SECOND, independent probe, so
 * the two have to agree.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf8');

/**
 * Tracked AND untracked-but-not-ignored files: the review packet of a doc lot
 * is a dirty tree, so a bare `git ls-files` would leave a new spec outside
 * every case below (CLAUDE.md: `-co --exclude-standard`, never bare).
 */
function lsFiles(dir: string): string[] {
  return execFileSync('git', ['ls-files', '-co', '--exclude-standard', dir], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter((f) => f !== '')
    .sort();
}

const specFiles = (): string[] => lsFiles('docs/specs').filter((f) => f.endsWith('.md'));
const testFiles = (): string[] => lsFiles('tests').filter((f) => f.endsWith('.ts'));

/** A line that opens a requirement row, bold id and `↗` marker included. */
const F_ROW = /^\|\s*\*{0,2}(F[A-Z0-9-]*\d+)\s*(↗)?\s*\*{0,2}\s*\|/;

/** The Blueprint Coverage section of a spec, or null when it has none. */
function blueprint(text: string): string | null {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^#{2,4} .*Blueprint Coverage/.test(l));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^#{2,4} /.test(lines[i]!)) {
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

/** The rows of a Blueprint table, as trimmed cell arrays. */
function rows(section: string): string[][] {
  return section
    .split('\n')
    .filter((l) => F_ROW.test(l))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
}

/** Requirement-row lines anywhere in a file — the independent second probe. */
function fRowLines(text: string): string[] {
  return text.split('\n').filter((l) => F_ROW.test(l));
}

/**
 * A `Covers` cell is one or more groups separated by ` · `, each
 * `<test file> :: <id>[, <id>]*` or a bare `<test file>` when the covering
 * case carries no id. An absence is declared with `⬜` and its reason.
 */
function coverGroups(cell: string): { path: string; ids: string[] }[] {
  return cell
    .split(' · ')
    .map((g) => g.trim())
    .filter((g) => g.startsWith('tests/'))
    .map((g) => {
      const [left, right] = g.split(' :: ');
      return {
        path: left!.split(' ')[0]!.trim(),
        ids: [...(right ?? '').matchAll(/\b(?:TC|IT)-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g)].map((m) => m[0]),
      };
    });
}

/** id -> the test files whose `it()` titles carry it. */
function caseIndex(): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const f of testFiles()) {
    for (const m of read(f).matchAll(/\bit\(\s*['"`]([^'"`]+)['"`]/g)) {
      for (const idm of m[1]!.matchAll(/\b(?:TC|IT)-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g)) {
        const key = idm[0];
        if (!index.has(key)) index.set(key, new Set());
        index.get(key)!.add(f);
      }
    }
  }
  return index;
}

const SPECS = specFiles();
const WITH_TABLE = SPECS.filter((f) => blueprint(read(f)) !== null);
const REFERENCE = [
  'docs/specs/cards/climates.md',
  'docs/specs/cards/lights.md',
  'docs/specs/cards/weather.md',
];

describe('Blueprint Coverage — la colonne Covers (O1)', () => {
  it('O1: aucune ligne F ne vit hors d’une table Blueprint reconnue', () => {
    // Témoin dérivé, pas figé : la seconde sonde compte les lignes F partout
    // dans le fichier, la première ne les voit qu'à travers le titre de
    // section. Renommer `## Blueprint Coverage` fait divergher les deux.
    const orphelines: string[] = [];
    let total = 0;
    for (const f of SPECS) {
      const text = read(f);
      const partout = fRowLines(text).length;
      total += partout;
      const dansTable = blueprint(text) === null ? 0 : rows(blueprint(text)!).length;
      if (partout !== dansTable) orphelines.push(`${f}: ${partout} lignes F, ${dansTable} dans la table`);
    }
    expect(total).toBeGreaterThan(0);
    expect(orphelines).toEqual([]);
  });

  it('O1: toute table Blueprint porte Covers en dernière colonne', () => {
    expect(WITH_TABLE.length).toBe(SPECS.filter((f) => fRowLines(read(f)).length > 0).length);
    const sans = WITH_TABLE.filter((f) => {
      const head = blueprint(read(f))!
        .split('\n')
        .find((l) => /^\|\s*(Feature ID|ID)\s*\|/.test(l));
      return !head || !/\|\s*Covers\s*\|\s*$/.test(head);
    });
    expect(sans).toEqual([]);
  });

  it('O1: toute ligne F porte une cellule Covers non vide', () => {
    const vides: string[] = [];
    let seen = 0;
    for (const f of WITH_TABLE) {
      for (const cells of rows(blueprint(read(f))!)) {
        seen += 1;
        if (cells.length < 4 || cells[3] === '') vides.push(`${f} ${cells[0]}`);
      }
    }
    // Témoin dérivé : autant de lignes lues que la seconde sonde en trouve.
    expect(seen).toBe(SPECS.reduce((n, f) => n + fRowLines(read(f)).length, 0));
    expect(vides).toEqual([]);
  });

  it('O1: tout fichier de test cité existe, et tout id cité y est déclaré', () => {
    const index = caseIndex();
    const tracked = new Set(testFiles());
    const fautifs: string[] = [];
    let groupes = 0;
    let idsVerifies = 0;
    for (const f of WITH_TABLE) {
      for (const cells of rows(blueprint(read(f))!)) {
        for (const g of coverGroups(cells[3] ?? '')) {
          groupes += 1;
          if (!tracked.has(g.path)) {
            fautifs.push(`${f} ${cells[0]}: fichier absent — ${g.path}`);
            continue;
          }
          for (const id of g.ids) {
            idsVerifies += 1;
            if (!index.get(id)?.has(g.path)) {
              fautifs.push(`${f} ${cells[0]}: ${id} n'est porté par aucun it() de ${g.path}`);
            }
          }
        }
      }
    }
    // Témoins dérivés : l'index a trouvé des cas, et la colonne cite des groupes.
    expect(index.size).toBeGreaterThan(0);
    expect(groupes).toBeGreaterThan(0);
    expect(idsVerifies).toBeGreaterThan(0);
    expect(fautifs).toEqual([]);
  });

  it('O1: une absence de couverture est déclarée, jamais laissée implicite', () => {
    // La marque ⬜ décide, PAS la présence d'un id : un mutant qui remplaçait
    // « ⬜ aucun cas … — <raison> » par « aucun cas …, <raison> » a survécu à
    // la première version de ce cas, qui lisait les ids.
    let marquees = 0;
    let couvertes = 0;
    const muettes: string[] = [];
    for (const f of WITH_TABLE) {
      for (const cells of rows(blueprint(read(f))!)) {
        const cell = cells[3] ?? '';
        const groupes = coverGroups(cell).length;
        if (cell.includes('⬜')) {
          marquees += 1;
          // La raison est ce qui suit la marque : une phrase, pas « ⬜ aucun ».
          const raison = cell.slice(cell.indexOf('⬜') + 1).replace(/^[\s—:]+/, '');
          if (raison.length < 20) muettes.push(`${f} ${cells[0]}: raison absente — ${cell}`);
        } else if (groupes === 0 && !/\]\(\.{1,2}\//.test(cell)) {
          muettes.push(`${f} ${cells[0]}: ni test, ni renvoi, ni marque ⬜ — ${cell}`);
        } else {
          couvertes += 1;
        }
      }
    }
    expect(marquees + couvertes).toBe(
      SPECS.reduce((n, f) => n + fRowLines(read(f)).length, 0), // témoin dérivé
    );
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
    // Chaque phrase normative est citée ici : la supprimer fait rougir ce cas.
    expect(master).toContain("Ce qu'une table Blueprint Coverage porte, et qui en porte une");
    expect(master).toContain('Chaque ligne F porte une colonne `Covers`');
    expect(master).toContain('le fichier de test qui la');
    expect(master).toContain('la marque `⬜` suivie de la raison');
    expect(master).toContain('ne porte PAS de table Blueprint');
    expect(master).toContain('Un id F est déclaré dans une seule spec');
    expect(master).toContain('tests/specs/blueprint-traceability.test.ts');
  });

  it('O4: un id F n’est déclaré que par une spec, sauf cité avec ↗', () => {
    const owners = new Map<string, string[]>();
    for (const f of WITH_TABLE) {
      for (const line of fRowLines(read(f))) {
        const m = F_ROW.exec(line)!;
        if (m[2] === '↗') continue; // réalise l'exigence d'une autre spec
        owners.set(m[1]!, [...(owners.get(m[1]!) ?? []), f]);
      }
    }
    expect(owners.size).toBeGreaterThan(0); // témoin
    expect([...owners].filter(([, fs]) => fs.length > 1)).toEqual([]);
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
        const whole = m[1]!.trim();
        if (hs.has(whole)) continue;
        // Un titre peut contenir un tiret cadratin, et une cellule peut en
        // ajouter du commentaire. Un seul repli est permis : la tête avant le
        // PREMIER ` — `, et seulement si la queue ne nomme aucune autre
        // section — sinon un pointeur inventé passerait derrière un vrai.
        const cut = whole.indexOf(' — ');
        const head = cut === -1 ? whole : whole.slice(0, cut).trim();
        const tail = cut === -1 ? '' : whole.slice(cut + 3);
        if (!hs.has(head) || tail.includes('§')) casses.push(`${f} ${cells[0]} -> § ${whole}`);
      }
    }
    expect(checked).toBeGreaterThan(0); // témoin
    expect(casses).toEqual([]);
  });
});

describe('Blueprint Coverage — les ✅ non gagnés (O6)', () => {
  const s01 = (): string => blueprint(read('docs/specs/01_infrastructure.md'))!;
  const rowOf = (section: string, id: string): string =>
    section.split('\n').find((l) => l.startsWith(`| ${id} `)) ?? '';

  it('O6: F-INFRA-03 ne promet pas de serveur de dev dédié tant qu’il n’existe pas', () => {
    expect(readdirSync(ROOT).filter((e) => e.startsWith('vite.config'))).toEqual([]);
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
    const components = lsFiles('src/components').join('\n');
    expect(components).toContain('sf-toggle-switch'); // témoin positif
    expect(components).not.toContain('sf-tabs');
    const row = rowOf(blueprint(read('docs/specs/04_components.md'))!, 'F-COMP-03');
    expect(row).not.toBe('');
    expect(row).toContain('sf-toggle-switch');
    expect(row).toContain('⬜');
    expect(row).toMatch(/Aucun composant `sf-tabs` n'existe/);
  });

  it('O6: F-STOVE-D04 dit le fond que la carte applique vraiment', () => {
    // Le constat HIGH de la ronde 1 disait que la base CSS pine
    // rgba(39, 40, 43, 0.3) pour le poêle. Mesuré : elle pine
    // `background: var(--sf-bg)`, et cette valeur-là n'est nulle part dans
    // l'entrée sci-fi-stove. La ligne de spec était donc fausse aussi.
    const baseline = JSON.parse(read('tests/styles/card-css-baseline.json')) as Record<
      string,
      Record<string, Record<string, string>>
    >;
    const haCard = baseline['sci-fi-stove']?.['ha-card'];
    expect(haCard, 'sci-fi-stove ha-card absent de la base CSS').toBeDefined();
    expect(haCard!['background']).toBe('var(--sf-bg)');
    const row = rowOf(blueprint(read('docs/specs/cards/stove.md'))!, 'F-STOVE-D04');
    // La ligne peut NOMMER l'ancienne valeur, mais pour dire qu'elle ne
    // s'applique pas — ce qui est interdit, c'est de l'annoncer comme le fond.
    expect(row).toContain('background `var(--sf-bg)`');
    expect(row).not.toMatch(/background `rgba/);
  });
});
