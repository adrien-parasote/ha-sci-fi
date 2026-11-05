/**
 * Gardes du lot fix `specs-design-abandonne` (épique ha-sci-fi-zdw).
 *
 * Deux specs cartes décrivaient une maquette de conception que le code n'a
 * jamais suivie. La première rédaction de ces gardes épinglait chaque
 * correction par un cas écrit à la main — un regex par section, une affirmation
 * du genre « la spec DIT ceci ». La revue l'a cassée en trois coups : un
 * sélecteur inventé (`.status.purple`) passait parce que la réduction du nom
 * s'arrêtait au premier point ; une classe inexistante (`.e.NOPE-path`) passait
 * parce qu'aucun cas ne la cherchait ; et une prescription glissée dans un bloc
 * de citation passait parce que le filtre qui laissait les notes de révision
 * nommer les symboles morts exemptait tout le bloc.
 *
 * Les trois trous avaient la même cause : la forme. Vingt-trois affirmations
 * sur de la prose, chacune avec son découpage, laissent vingt-trois endroits où
 * se tromper de découpage.
 *
 * Cette rédaction inverse le sens. Une extraction, une règle :
 *
 *   tout identifiant qu'une spec nomme existe dans `src/`, sauf s'il est
 *   inscrit dans `retired-identifiers.md` avec sa raison.
 *
 * Pas de découpage par section, donc aucune section à renommer hors de vue.
 * Pas d'exemption de mise en forme, donc rien à cacher dans un `>`. Le jugement
 * — quels noms sont légitimement morts — vit dans un fichier relu, pas dans de
 * la prose dispersée. Les trois mutants meurent par construction.
 *
 * Restent quelques cas de présence, pour les affirmations que l'extraction ne
 * sait pas porter (« la spec DOIT mentionner X »). Ils sont marqués comme tels.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, isAbsolute } from 'node:path';
import { collidingNumbers, collisionReport, isTitledSpec, specNumbers } from '../fixtures/spec-numbers';

const ROOT = resolve(__dirname, '../..');

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

function lsFiles(dir: string): string[] {
  return execFileSync('git', ['ls-files', '-co', '--exclude-standard', dir], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter((f) => f !== '')
    .sort();
}

/** Les specs qui portent un titre `# Spec N` : docs/specs/*.md et docs/specs/cards/*.md. */
function titledSpecFiles(): string[] {
  return lsFiles('docs/specs').filter(isTitledSpec);
}

/** Les specs que la règle couvre, et le fichier qui porte leurs exemptions. */
const SPECS = ['docs/specs/cards/stove.md', 'docs/specs/cards/bridge.md'];
const RETIRED = 'tests/specs/retired-identifiers.md';

/**
 * `src/` sans ses commentaires. Un nom qui ne survit que dans un commentaire de
 * suppression n'est pas porté par l'arbre — et le compter comme présent était un
 * trou mesuré : `.bar-fill`, `.sensor-tile` et `stoveStylesPart2` passaient
 * ainsi, nommés par le commentaire qui dit qu'ils ont été retirés.
 */
function sourceWithoutComments(): string {
  return lsFiles('src')
    .map((f) =>
      read(f)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(?<!:)\/\/[^\n]*/g, ''),
    )
    .join('\n');
}

type Id = { kind: string; name: string };

/** Tout identifiant qu'une spec nomme entre accents graves. */
function identifiers(text: string): Id[] {
  const out = new Map<string, Id>();
  const add = (kind: string, name: string) => out.set(`${kind}:${name}`, { kind, name });

  for (const m of text.matchAll(/`(\.[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*)`/g)) {
    // `.a.b` est un composé : chaque segment est un nom à lui seul.
    for (const part of m[1]!.replace(/^\./, '').split('.')) add('classe', part);
  }
  for (const m of text.matchAll(/`(_[a-zA-Z][a-zA-Z0-9]*)\(?\)?`/g)) add('méthode', m[1]!);
  for (const m of text.matchAll(/`(sf-[a-z][a-z0-9-]*)`/g)) add('composant', m[1]!);
  for (const m of text.matchAll(/`([a-z][a-zA-Z0-9]*Styles(?:Part\d+)?)`/g)) add('feuille', m[1]!);

  return [...out.values()];
}

/** Les exemptions déclarées, par spec. */
function retiredBySpec(): Map<string, Map<string, string>> {
  const lines = read(RETIRED).split('\n');
  const parSpec = new Map<string, Map<string, string>>();
  let courante: Map<string, string> | null = null;
  for (const l of lines) {
    const titre = /^##\s+(docs\/specs\/\S+\.md)\s*$/.exec(l);
    if (titre) {
      courante = new Map();
      parSpec.set(titre[1]!, courante);
      continue;
    }
    if (courante === null) continue;
    const row = /^\|\s*`([^`]+)`\s*\|\s*(.+?)\s*\|\s*$/.exec(l);
    if (row) courante.set(row[1]!.replace(/^\./, ''), row[2]!);
  }
  return parSpec;
}

describe('La règle — tout identifiant nommé par une spec existe, ou il est déclaré retiré', () => {
  it('chaque spec couverte a sa section dans la liste de retraits', () => {
    const parSpec = retiredBySpec();
    // Témoin : le fichier a bien été lu comme un tableau, pas comme du texte.
    expect([...parSpec.values()].reduce((n, m) => n + m.size, 0)).toBeGreaterThan(10);
    for (const s of SPECS) expect(parSpec.has(s), `${s} n’a pas de section`).toBe(true);
  });

  it('aucun identifiant nommé n’est absent de src/ sans exemption déclarée', () => {
    const blob = sourceWithoutComments();
    // Témoin dérivé d'une seconde sonde : la même recherche trouve ce qui EXISTE.
    // Sans lui, un blob vide rendrait tout « absent » — ou un blob qui contient
    // tout rendrait la règle muette.
    expect(blob).toContain('_renderStatus');
    expect(blob).not.toContain('_renderSensorTile');

    const parSpec = retiredBySpec();
    const orphelins: string[] = [];
    let total = 0;
    for (const s of SPECS) {
      const retires = parSpec.get(s) ?? new Map<string, string>();
      for (const id of identifiers(read(s))) {
        total += 1;
        if (blob.includes(id.name)) continue;
        if (retires.has(id.name)) continue;
        orphelins.push(`${s}: ${id.kind} ${id.name}`);
      }
    }
    // Témoin : l'extraction a bien trouvé des noms. Un regex cassé rendrait 0
    // identifiant et zéro orphelin — vert, et aveugle.
    expect(total).toBeGreaterThan(60);
    expect(orphelins).toEqual([]);
  });

  it('aucune exemption n’est périmée — un nom revenu dans src/ doit sortir de la liste', () => {
    const blob = sourceWithoutComments();
    const perimees: string[] = [];
    for (const [spec, retires] of retiredBySpec()) {
      for (const name of retires.keys()) {
        if (blob.includes(name)) perimees.push(`${spec}: ${name} existe à nouveau`);
      }
    }
    expect(perimees).toEqual([]);
  });

  it('chaque exemption porte une raison, et dit où le nom a vécu', () => {
    const maigres: string[] = [];
    for (const [spec, retires] of retiredBySpec()) {
      for (const [name, raison] of retires) {
        if (raison.replace(/[`*]/g, '').trim().length < 30) maigres.push(`${spec}: ${name}`);
      }
    }
    expect(maigres).toEqual([]);
  });

  it('aucun identifiant exempté n’est prescrit — une note constate, elle n’exige pas', () => {
    /**
     * Le trou que ce cas ferme, et ce qu'il laisse ouvert.
     *
     * La liste exempte un NOM, où qu'il apparaisse dans la spec. Elle ne sait
     * donc pas distinguer « cette classe a été supprimée » de « cette classe
     * DOIT être déclarée » : un mutant qui glissait
     * `> La feuille DOIT déclarer .sensors-grid` a survécu deux fois, parce que
     * les deux noms étaient légitimement exemptés.
     *
     * Le seul distinguo mécanique est le mode : une note de retrait constate au
     * passé, une prescription exige. Ce cas refuse donc un nom exempté sur une
     * ligne impérative — y compris dans un bloc de citation, qui n'est plus
     * exempté de rien.
     *
     * Ce qu'il ne couvre pas : une prescription écrite sans mot d'impératif
     * (« la feuille déclare `.sensors-grid` ») passerait encore. Le mode d'une
     * phrase n'est pas mesurable au regex, et je n'ai pas de sonde pour ça.
     */
    const imperatif = /\bMUST\b|\bSHALL\b|\bDOIT\b|\bDOIVENT\b|\bdoit\b|\bdoivent\b/;
    const fautives: string[] = [];
    for (const [spec, retires] of retiredBySpec()) {
      if (!SPECS.includes(spec)) continue;
      for (const brute of read(spec).split('\n')) {
        // Le barré `~~…~~` est retiré avant l'examen : c'est le marqueur de
        // rétractation de markdown, porté par le texte exact qu'il annule, et
        // une ligne a besoin de citer l'affirmation fausse qu'elle corrige.
        // Ce n'est pas l'exemption de bloc qui a laissé passer M-C : elle
        // portait sur tout un `>`, celle-ci sur la portion barrée, et les noms
        // qu'elle contient restent jugés par la règle principale.
        const ligne = brute.replace(/~~[\s\S]*?~~/g, '');
        if (!imperatif.test(ligne)) continue;
        for (const id of identifiers(ligne)) {
          if (retires.has(id.name)) fautives.push(`${spec}: « ${ligne.trim().slice(0, 90)} »`);
        }
      }
    }
    expect(fautives).toEqual([]);
  });

  it('une exemption ne vaut que pour sa spec', () => {
    const parSpec = retiredBySpec();
    const blob = sourceWithoutComments();
    const fuites: string[] = [];
    for (const s of SPECS) {
      const miennes = parSpec.get(s) ?? new Map<string, string>();
      for (const [autre, leurs] of parSpec) {
        if (autre === s) continue;
        for (const name of leurs.keys()) {
          if (miennes.has(name) || blob.includes(name)) continue;
          if (identifiers(read(s)).some((i) => i.name === name)) {
            fuites.push(`${s} nomme ${name}, exempté seulement pour ${autre}`);
          }
        }
      }
    }
    expect(fuites).toEqual([]);
  });
});

describe('Les zones de stove.md sont épinglées sur la classe que leur méthode rend', () => {
  /**
   * La règle ci-dessus refuse un nom inexistant, mais pas un nom existant
   * attribué à la mauvaise zone — et c'est l'erreur que la première rédaction
   * de la spec a commise, en inversant `.e.top-path` et `.e.bottom-path`.
   * Ce cas lit l'association dans le code, puis l'exige dans l'arbre.
   */
  it('chaque méthode de zone est documentée avec la classe qu’elle rend', () => {
    const src = read('src/cards/stove/sci-fi-stove.ts');
    const spec = read('docs/specs/cards/stove.md');

    const zones = [...src.matchAll(/private (_render\w+Zone)\([^)]*\)[^{]*\{[\s\S]*?class="([^"]+)"/g)]
      .map((m) => ({ methode: m[1]!, classe: m[2]! }));
    // Témoin dérivé : le module porte bien plusieurs zones.
    expect(zones.length).toBeGreaterThan(2);

    const faux: string[] = [];
    for (const { methode, classe } of zones) {
      // La ligne de l'arbre qui nomme cette méthode doit nommer SA classe.
      const ligne = spec.split('\n').find((l) => l.includes(methode) && l.includes('├──') || (l.includes(methode) && l.includes('└──')));
      if (ligne === undefined) {
        faux.push(`${methode} n’apparaît dans aucune ligne de l’arbre`);
        continue;
      }
      const attendue = classe.split(' ').pop()!;
      if (!ligne.includes(attendue)) faux.push(`${methode} documenté sur « ${ligne.trim()} », rend .${attendue}`);
    }
    expect(faux).toEqual([]);
  });

  it('l’arbre nomme les six lignes de `.temperatures` dans l’ordre rendu', () => {
    const src = read('src/cards/stove/sci-fi-stove.ts');
    const zone = src.slice(src.indexOf('<div class="temperatures">'));
    const appels = [...zone.slice(0, zone.indexOf('</div>')).matchAll(/this\.(_render\w+)\(/g)].map(
      (m) => m[1]!,
    );
    // stove-diagnostics: .diagnostics joins the five lines (FR-6).
    expect(appels.length).toBe(6);

    const spec = read('docs/specs/cards/stove.md');
    // Les deux bornes sont vérifiées avant la tranche : un `indexOf` à -1
    // transforme silencieusement `slice` en « tout le document », et la
    // vérification redevient le `includes()` global qu'elle remplace — verte.
    const debut = spec.indexOf('ha-card\n');
    expect(debut).toBeGreaterThan(-1);
    const arbre = spec.slice(debut);
    const fin = arbre.indexOf('```');
    expect(fin).toBeGreaterThan(-1);
    const bloc = arbre.slice(0, fin);
    const cites = [...bloc.matchAll(/_render\w+/g)].map((m) => m[0]!);
    for (const a of new Set(appels)) {
      expect(cites, `${a} ne figure pas dans l’arbre`).toContain(a);
    }
  });
});

describe('Présence — ce que l’extraction ne sait pas porter', () => {
  it('le numéro des specs ne collisionne avec aucune autre', () => {
    const files = titledSpecFiles().map((f) => ({ path: f, text: read(f) }));
    // Témoin : la sonde a bien lu des numéros sur l'ENSEMBLE des specs.
    expect(specNumbers(files).size).toBeGreaterThan(8);
    expect(collisionReport(collidingNumbers(files))).toEqual([]);
  });

  it('chaque sélecteur gelé par stove.md est lu par le test cité — tous les noms de la ligne', () => {
    // The power-level and fan-speed selectors are read by their own test files (lots stove-power-level, stove-fan-speed).
    const test = read('tests/cards/stove/sci-fi-stove.test.ts') + read('tests/cards/stove/sci-fi-stove-power-level.test.ts')
      + read('tests/cards/stove/sci-fi-stove-fan-speed.test.ts') + read('tests/cards/stove/sci-fi-stove-diagnostics.test.ts')
      + read('tests/cards/stove/sci-fi-stove-wear-counters.test.ts');
    const lines = read('docs/specs/cards/stove.md').split('\n');
    const i = lines.findIndex((l) => /^##\s+Test Selectors/.test(l));
    const j = lines.findIndex((l, k) => k > i && /^##\s/.test(l));
    const section = lines.slice(i, j === -1 ? lines.length : j);

    // Toutes les lignes de table, et dans chacune TOUS les accents graves —
    // la première rédaction ne lisait que le premier, ce qui laissait les cinq
    // classes de couleur et deux composants sur trois hors de vue.
    const rows = section.filter((l) => /^\|\s*`/.test(l));
    const noms = rows.flatMap((l) => [...l.matchAll(/`([^`]+)`/g)].map((m) => m[1]!));
    expect(rows.length).toBeGreaterThan(2);
    expect(noms.length).toBeGreaterThan(rows.length);

    const absents = noms.filter((n) => {
      const nu = n.replace(/^[.#]/, '').replace(/\[.*$/, '');
      // Un composé `.status.red` : chaque segment doit être lu par le test.
      return nu.split('.').some((seg) => seg !== '' && !test.includes(seg));
    });
    expect(absents).toEqual([]);
  });

  it('chaque lien relatif des deux specs résout sur un fichier suivi', () => {
    const suivis = new Set(lsFiles('.'));
    expect(suivis.size).toBeGreaterThan(100);

    const casses: string[] = [];
    for (const s of SPECS) {
      const cibles = [...read(s).matchAll(/\]\((\.{1,2}\/[^)#]+)(#[^)]*)?\)/g)].map((m) => m[1]!);
      expect(cibles.length).toBeGreaterThan(3);
      for (const c of cibles) {
        const abs = resolve(dirname(resolve(ROOT, s)), c);
        const rel = abs.startsWith(ROOT) ? abs.slice(ROOT.length + 1) : abs;
        if (isAbsolute(rel) || !suivis.has(rel)) casses.push(`${s} → ${c}`);
      }
    }
    expect(casses).toEqual([]);
  });

  it('chaque service que la carte poêle appelle est nommé par sa spec', () => {
    const src = read('src/cards/stove/sci-fi-stove.ts');
    const services = [
      ...new Set(
        [...src.matchAll(/callService\((?:'(\w+)'|DOMAIN\.(\w+)),\s*'(\w+)'/g)].map((m) => `${m[1] ?? m[2]!.toLowerCase()}.${m[3]}`),
      ),
    ];
    expect(services.length).toBeGreaterThan(2);
    const spec = read('docs/specs/cards/stove.md');
    expect(services.filter((s) => !spec.includes(s))).toEqual([]);
  });

  it('les deux cas d’icône personnalisée du bridge lisent `sf-icon`, et la spec les suit', () => {
    const alertes = read('tests/cards/bridge/sections/sf-bridge-alerts.test.ts');
    const acces = read('tests/cards/bridge/sections/sf-bridge-access.test.ts');
    expect(alertes).toContain('TC-BRIDGE-U-17:');
    expect(acces).toContain('TC-BRIDGE-U-18:');
    for (const t of [alertes, acces]) {
      expect(t).toMatch(/querySelector\('\.[a-z-]+ sf-icon'\)/);
      expect(t).not.toMatch(/querySelector\('\.[a-z-]+ ha-icon'\)/);
    }
    // Et aucun bloc de rendu de la spec ne nomme le tag que le module ignore.
    const bridge = read('docs/specs/cards/bridge.md');
    const blocs = bridge.split('\n').filter((l) => /^[│├└\s]*[├└]──/.test(l));
    expect(blocs.length).toBeGreaterThan(20);
    expect(blocs.filter((l) => l.includes('ha-icon'))).toEqual([]);
  });

  it('l’anti-patron de couleur de stove.md n’interdit pas ce qu’ADR-018 légalise', () => {
    const adr = read('docs/adr/ADR-018_palette-fixed-identity.md');
    expect(adr).toMatch(/illustrations and domain palettes[^|]*\|[^|]*bespoke literals/);
    expect(adr).toContain('No theme-chained token replaces a hardcoded colour');

    const litteraux = read('src/cards/stove/styles.ts')
      .split('\n')
      .filter((l) => /#[0-9a-fA-F]{3,6}|rgba?\(/.test(l) && !l.includes('var(--'));
    expect(litteraux.length).toBeGreaterThan(5);

    const ligne = read('docs/specs/cards/stove.md')
      .split('\n')
      .find((l) => /^\|\s*4\s*\|/.test(l) && /littéral de couleur/.test(l));
    expect(ligne, 'l’anti-patron sur les littéraux a disparu').toBeDefined();
    expect(ligne!).toContain('ADR-018');
    expect(ligne!).toMatch(/chaîné/);
  });

  it('un MUST que le code ne porte pas est marqué non livré', () => {
    const src = read('src/cards/stove/sci-fi-stove.ts');
    // Mesure : aucune branche de carte ne lit ces deux états.
    const branches = src
      .split('\n')
      .filter((l) => /'unavailable'|=== 'unknown'/.test(l) && !/^\s*\w+:\s*'/.test(l));
    expect(branches).toEqual([]);

    const lignes = read('docs/specs/cards/stove.md')
      .split('\n')
      .filter((l) => l.includes('Offline') || /unavailable/.test(l));
    expect(lignes.length).toBeGreaterThan(0);
    // Chacune doit porter la marque de non-livraison plutôt qu'un impératif.
    const promesses = lignes.filter((l) => /\bMUST\b|\bDOIT\b/.test(l) && !l.includes('⬜'));
    expect(promesses).toEqual([]);
  });
});
