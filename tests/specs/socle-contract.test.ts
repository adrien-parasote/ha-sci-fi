/**
 * Tests — le socle (specs 01 à 03) dit ce que le socle livre.
 *
 * Ces cas épinglent les corrections du lot fix `socle-specs-01-03`. Ils lisent
 * les trois specs du socle et `src/`, et chaque règle est écrite pour mesurer
 * quelque chose de l'arbre plutôt que de geler un nombre : un compte figé passe
 * encore le jour où la chose comptée disparaît.
 *
 * Covers: F-INFRA-05, F-BASE-08 · TC-310 (le hook surchargé par chaque carte)
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.join(__dirname, '..', '..');
const SPECS = [
  'docs/specs/01_infrastructure.md',
  'docs/specs/02_domain_selectors.md',
  'docs/specs/03_base_classes.md',
];

const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p: string) => fs.existsSync(path.join(ROOT, p));

/** Les dossiers de `src/cards/` — la liste des cartes, dérivée, jamais gelée. */
function cardDirs(): string[] {
  const dir = path.join(ROOT, 'src', 'cards');
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/**
 * Les cartes qui portent `motif`, hors `src/selectors/`. Rend des noms de
 * DOSSIER, pas de fichier : `src/cards/bridge/` en porte plusieurs, et compter
 * les fichiers est l'erreur exacte que la première rédaction de ce lot a faite
 * (« 10 cartes » pour neuf).
 */
function cardsCarrying(motif: string): string[] {
  // Mot entier, jamais une sous-chaîne : `getAreas` est un préfixe de
  // `getAreasByFloor`, `getClimateEntities` de `getClimateEntitiesExcluding`,
  // `getEntitiesByArea` de `getEntitiesByAreaAndDomain`. Un `includes()` ici
  // attribuait à trois fonctions les appelants de leurs homonymes plus longs.
  const motEntier = new RegExp(`(?<![\\w-])${motif.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);
  const dir = path.join(ROOT, 'src', 'cards');
  const out = new Set<string>();
  for (const carte of cardDirs()) {
    const marche = (d: string) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) marche(full);
        else if (e.name.endsWith('.ts') && motEntier.test(fs.readFileSync(full, 'utf8'))) {
          out.add(carte);
        }
      }
    };
    marche(path.join(dir, carte));
  }
  return [...out].sort();
}

/** Les cartes dont `getRelevantEntities()` contient un `return []`. */
function cardsReturningEmpty(): string[] {
  const dir = path.join(ROOT, 'src', 'cards');
  return cardDirs().filter((carte) => {
    const sous = path.join(dir, carte);
    return fs
      .readdirSync(sous)
      .filter((f) => f.endsWith('.ts'))
      .some((f) => {
        const src = fs.readFileSync(path.join(sous, f), 'utf8');
        const debut = src.indexOf('getRelevantEntities(');
        if (debut < 0) return false;
        // Le corps du hook seul : jusqu'à la prochaine déclaration de membre.
        const corps = src.slice(debut, debut + 1200).split(/\n\s{2}(?:private|protected|public|override|static|render)/)[0]!;
        return /return \[\];/.test(corps);
      });
  });
}

/** Les cellules d'une table markdown, par ligne, pour une section donnée. */
function rows(spec: string, titre: string, fin: RegExp): string[][] {
  const texte = read(spec);
  const debut = texte.indexOf(titre);
  expect(debut, `§ ${titre} introuvable dans ${spec}`).toBeGreaterThan(-1);
  const reste = texte.slice(debut + titre.length);
  const stop = reste.search(fin);
  expect(stop, `la fin de § ${titre} est introuvable`).toBeGreaterThan(-1);
  return reste
    .slice(0, stop)
    .split('\n')
    .filter((l) => l.startsWith('| `'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
}

/**
 * Les chemins que le socle nomme SANS que le dépôt les porte, chacun parce que
 * la spec dit elle-même qu'ils ne sont pas livrés. Une entrée de plus se
 * justifie dans la spec, pas ici.
 */
const ABSENTS_ASSUMES = new Map<string, string>([
  ['.devcontainer/', 'F-INFRA-06 ⬜ non livré — le dossier n’existe pas, la spec le dit'],
  ['.devcontainer/devcontainer.json', 'idem F-INFRA-06'],
  ['.devcontainer/docker-compose.yml', 'idem F-INFRA-06'],
  ['vite.config.ts', 'AP#3 et F-INFRA-03 : nommé pour dire qu’il n’existe pas'],
  ['.eslintrc.json', 'nommé par la note de correction du 2026-11-01, qui dit son absence'],
  ['editor.ts', 'nommé par l’AP#4 corrigé, qui dit que ce fichier n’existe pas'],
  ['src/utils/toast.ts', '§ Un seul toast dit sa suppression (lot vague-2, bead ha-sci-fi-ckw)'],
]);

// ── La règle générale : une spec ne nomme pas un fichier fantôme ────────────

describe('le socle ne nomme aucun fichier que le dépôt ne porte pas', () => {
  it('chaque chemin de fichier cité dans les specs 01-03 existe, ou est déclaré absent', () => {
    // Témoin positif : l'extraction doit attraper un chemin réel et un chemin
    // délibérément absent, sinon « zéro fantôme » ne dit rien.
    const sondes = SPECS.map(read).join('\n');
    expect(sondes).toContain('eslint.config.mjs');
    expect(sondes).toContain('.devcontainer/');

    // Une exemption ne vaut que sur une ligne qui DIT l'absence. Sans cela elle
    // blanchirait le nom partout, y compris sur la ligne qui le prescrit — c'est
    // la différence entre « ce fichier n'existe pas » et « importez ce fichier ».
    const DIT_L_ABSENCE = /n'existe pas|n’existe pas|non livré|⬜|retirée?s? /i;
    // …et qui ne PRESCRIT rien. Une ligne impérative qui nomme un fichier
    // absent demande de l'utiliser : l'exemption ne doit pas la blanchir.
    // (Mutant de la revue : « Importer `editor.ts` ; aucun autre fichier »
    //  passait parce que « aucun » comptait comme un constat d'absence.)
    const PRESCRIT = /\bMUST\b|\bSHALL\b|\bDOIT\b|\bDOIVENT\b|\bdoit\b|\bdoivent\b|^\s*\|?\s*Import|Importer|Utilise[rz]?\b|Use\b/;

    const fantomes: string[] = [];
    let total = 0;
    for (const spec of SPECS) {
      const lignes = read(spec).split('\n');
      for (const ligne of lignes) {
        // Deux formes : entre accents graves dans la prose et les tables, OU nu
        // en tête d'une entrée de § File Tree (`├── eslint.config.mjs  [NEW]`).
        // La seconde manquait, et le mutant de la revue a ressuscité
        // `.devcontainer/devcontainer.json [NEW]` sans que rien ne bronche.
        const arbre = /^[│├└─\s]*([.\w/-]+\.(?:ts|mjs|json|js|yml|yaml|md|html))\s+\[/.exec(ligne);
        const trouves = [
          ...[...ligne.matchAll(/`([.\w/-]+\.(?:ts|mjs|json|js|yml|yaml|md|html))`/g)],
          ...(arbre ? [arbre] : []),
        ];
        for (const m of trouves) {
        const brut = m[1]!;
        total += 1;
        if (ABSENTS_ASSUMES.has(brut) && DIT_L_ABSENCE.test(ligne) && !PRESCRIT.test(ligne)) {
          continue;
        }
        // Un nom seul (`base-card.ts`) est cherché dans l'arbre ; un chemin
        // depuis la racine est vérifié tel quel.
        if (brut.includes('/')) {
          if (exists(brut)) continue;
        } else if (trouveParNom(brut)) {
          continue;
        }
        fantomes.push(`${spec}: ${brut}`);
        }
      }
    }
    expect(total, 'l’extraction n’a trouvé aucun chemin : la regex est cassée').toBeGreaterThan(30);
    expect(fantomes).toEqual([]);
  });

  it('aucune exemption ne couvre un fichier qui existe', () => {
    const perimees = [...ABSENTS_ASSUMES.keys()].filter(
      (p) => exists(p) || (!p.includes('/') && trouveParNom(p))
    );
    expect(
      perimees,
      'une exemption périmée masque un fichier vivant — exactement le trou qu’elle doit fermer'
    ).toEqual([]);
  });
});

function trouveParNom(nom: string): boolean {
  const vus: string[] = [];
  const marche = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue; // dot-dirs: transient, gitignored (tests/.eit-base-*)
      const full = path.join(dir, e.name);
      if (e.isDirectory()) marche(full);
      else vus.push(e.name);
    }
  };
  for (const racine of ['src', 'tests', 'docs', 'dev']) {
    if (fs.existsSync(path.join(ROOT, racine))) marche(path.join(ROOT, racine));
  }
  for (const f of ['package.json', 'tsconfig.json', 'rollup.config.mjs', 'eslint.config.mjs',
                   'vitest.config.ts', 'hacs.json']) {
    vus.push(f);
  }
  return vus.includes(nom);
}

// ── Le contrat de rendu sélectif est écrit, pas seulement livré ─────────────

describe('spec 03 — le contrat de rendu sélectif', () => {
  const spec = () => read('docs/specs/03_base_classes.md');

  it('nomme les deux symboles dans chacune des quatre tables qui les omettaient', () => {
    const texte = spec();
    const section = (titre: string, suivant: RegExp) => {
      const debut = texte.indexOf(titre);
      expect(debut, `§ ${titre} introuvable`).toBeGreaterThan(-1);
      const reste = texte.slice(debut + titre.length);
      const fin = reste.search(suivant);
      expect(fin, `la fin de § ${titre} est introuvable`).toBeGreaterThan(-1);
      return reste.slice(0, fin);
    };

    const blueprint = section('## Blueprint Coverage', /\n## /);
    expect(blueprint, 'aucune ligne Blueprint ne porte le hook').toContain('getRelevantEntities');

    const publique = section(' ### Public Interface', /\n---/);
    expect(publique).toContain('getRelevantEntities');
    expect(publique).toContain('shouldUpdate');

    const antipatterns = section('## Anti-Patterns', /\n## /);
    expect(antipatterns).toContain('getRelevantEntities');
    expect(antipatterns, 'rien n’interdit de surcharger shouldUpdate').toContain('shouldUpdate');

    const cas = section('## Test Case Specifications', /\n## /);
    expect(cas).toContain('getRelevantEntities');
  });

  it('dit que le défaut vide re-rend tout, et que le hook est surchargeable', () => {
    const texte = spec();
    expect(texte).toMatch(/Contrat de rendu sélectif/);
    // Le fait décisif, celui dont trois cartes périmées découlent.
    expect(texte).toMatch(/défaut `\[\]`[\s\S]{0,400}re-rend/);
    expect(texte).toMatch(/silence/);
  });

  it('les cas qu’il cite existent sous ces titres', () => {
    const testFile = read('tests/utils/base-card.test.ts');
    for (const id of ['TC-309', 'TC-310', 'IT-301']) {
      expect(testFile, `${id} est cité par la spec 03 et n’existe pas`).toContain(id);
    }
    // Le veto est délibérément renvoyé à un cas préexistant plutôt que doublé.
    expect(spec()).toContain('IT-301, IT-403');
  });
});

// ── La Public Interface de la spec 02 nomme ce que src/selectors exporte ────

describe('spec 02 — la Public Interface est complète ET mesurée', () => {
  /**
   * La règle qui remplace huit assertions de prose : la colonne « Consommé
   * par » est DÉRIVÉE de src/, et la spec doit l'égaler. Une attribution
   * plausible est indistinguable d'une attribution vraie à la lecture — la
   * première rédaction de ce lot en a écrit trois fausses, et la mesure en a
   * trouvé trois autres parmi les lignes d'origine.
   */
  it('chaque ligne nomme exactement les cartes qui appellent la fonction', () => {
    const table = rows('docs/specs/02_domain_selectors.md', ' ### Public Interface', /\n---/);
    expect(table.length, 'la table de Public Interface n’a pas été lue').toBeGreaterThan(12);

    const ecarts: string[] = [];
    let avecAppelant = 0;
    for (const [element, consommateurs] of table) {
      const nom = /`(\w+)\(/.exec(element!)?.[1];
      expect(nom, `ligne illisible : ${element}`).toBeDefined();
      const mesure = cardsCarrying(nom!);
      if (mesure.length > 0) avecAppelant += 1;
      const attendu = mesure.length === 0 ? '⬜ aucun appelant' : mesure.join(', ');
      // On compare le texte brut de la cellule, mise en forme comprise : une
      // cellule qui dit « les cartes » ou « All cards » n'égale aucun ensemble.
      if (consommateurs !== attendu) {
        ecarts.push(`${nom} : la spec dit « ${consommateurs} », src/ dit « ${attendu} »`);
      }
    }
    // Témoins : la règle doit voir des deux côtés, sinon elle passe à vide.
    expect(avecAppelant, 'aucune fonction n’a d’appelant : la sonde est cassée').toBeGreaterThan(5);
    expect(
      table.length - avecAppelant,
      'plus aucun export n’est sans appelant — la spec doit le refléter'
    ).toBeGreaterThan(0);
    expect(ecarts).toEqual([]);
  });

  it('chaque fonction exportée par src/selectors est nommée dans la spec', () => {
    const dir = path.join(ROOT, 'src', 'selectors');
    const exportes: string[] = [];
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.ts')) continue;
      for (const m of fs.readFileSync(path.join(dir, f), 'utf8')
        .matchAll(/export function (\w+)/g)) {
        exportes.push(m[1]!);
      }
    }
    // Témoin : l'extraction doit voir la fonction que la table portait déjà et
    // une de celles qui manquaient.
    expect(exportes).toContain('getFloors');
    expect(exportes).toContain('isClimateOn');
    expect(exportes.length, 'l’extraction des exports est cassée').toBeGreaterThan(12);

    // La table, pas le document : un nom cité ailleurs dans la spec — dans une
    // note, dans un anti-patron — ne le met pas en Public Interface. C'est
    // exactement ce qu'un `includes()` sur tout le fichier laisserait passer.
    const spec = read('docs/specs/02_domain_selectors.md');
    const debut = spec.indexOf(' ### Public Interface');
    expect(debut, '§ Public Interface introuvable dans la spec 02').toBeGreaterThan(-1);
    const reste = spec.slice(debut);
    const fin = reste.indexOf('\n---');
    expect(fin, 'la fin de § Public Interface est introuvable').toBeGreaterThan(-1);
    const table = reste.slice(0, fin);
    // La table doit bien être une table : sinon « tout est absent » ou « rien ».
    expect(table.split('\n').filter((l) => l.startsWith('| `')).length).toBeGreaterThan(10);

    const absents = exportes.filter((n) => !new RegExp(`\\|\\s*\`${n}\\(`).test(table));
    expect(absents, 'ces exports sont consommables et absents de la spec qui les produit').toEqual([]);
  });
});

// ── Les faits chiffrés de la spec 01 viennent du dépôt ─────────────────────

describe('spec 01 — le budget de lint et les cellules vides', () => {
  const spec = () => read('docs/specs/01_infrastructure.md');

  it('le budget écrit dans la spec est celui du script de lint', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string | undefined> };
    const lint = pkg.scripts.lint;
    expect(lint, 'package.json ne déclare plus de script lint').toBeDefined();
    const m = /--max-warnings (\d+)/.exec(lint!);
    expect(m, 'le script de lint ne déclare plus de budget').not.toBeNull();
    const budget = m![1]!;
    expect(
      spec(),
      `la spec doit citer le budget réel (${budget}), pas un nombre recopié`
    ).toContain(`--max-warnings ${budget}`);
    // Et la somme des deux règles doit faire le budget.
    const regles = [...spec().matchAll(/\| `@typescript-eslint\/[a-z-]+` \| (\d+) \|/g)]
      .map((r) => Number(r[1]));
    expect(regles.length, 'la table de répartition a disparu').toBe(2);
    expect(regles.reduce((a, b) => a + b, 0)).toBe(Number(budget));
  });

  it('TC-104 n’exige plus zéro avertissement', () => {
    const ligne = spec().split('\n').find((l) => l.startsWith('| TC-104 '));
    expect(ligne, 'TC-104 a disparu').toBeDefined();
    expect(ligne!).not.toMatch(/zero lint warnings/);
  });

  it('aucune cellule de table n’est vide dans les specs du socle', () => {
    const vides: string[] = [];
    let lignes = 0;
    for (const s of SPECS) {
      for (const brute of read(s).split('\n')) {
        if (!brute.startsWith('|') || /^\|[\s:|-]+\|$/.test(brute)) continue;
        lignes += 1;
        const cellules = brute.split('|').slice(1, -1);
        if (cellules.some((c) => c.trim() === '')) vides.push(`${s}: ${brute.trim().slice(0, 80)}`);
      }
    }
    expect(lignes, 'aucune ligne de table lue : le filtre est cassé').toBeGreaterThan(80);
    expect(vides, 'une cellule vide est un critère de succès qui n’existe pas').toEqual([]);
  });
});

// ── Les comptes que le socle énonce sur lui-même ───────────────────────────

describe('le socle ne se trompe pas sur sa propre taille', () => {
  it('aucun fichier de src/utils n’annonce un nombre de cartes', () => {
    const dir = path.join(ROOT, 'src', 'utils');
    const fautifs: string[] = [];
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.ts')) continue;
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      for (const m of src.matchAll(/all (\d+) (?:sci-fi Lovelace )?cards?|all (\d+) card editors/g)) {
        fautifs.push(`${f}: « ${m[0]} »`);
      }
    }
    expect(
      fautifs,
      'un compte de cartes dans un commentaire se périme à la carte suivante'
    ).toEqual([]);
  });

  it('la table du toast nomme exactement les cartes mesurées, et showToast ne revient pas', () => {
    const table = rows('docs/specs/03_base_classes.md', '## Un seul toast', /\n## /);
    expect(table.length, 'la table du toast n’a pas été lue').toBe(1);

    const attendu = new Map([['sf-toast', cardsCarrying('sf-toast')]]);
    // Témoin : la voie vivante a bien des cartes.
    expect(attendu.get('sf-toast')!.length).toBeGreaterThan(5);
    // Le module impératif supprimé (bead ha-sci-fi-ckw) ne réapparaît dans aucune carte.
    expect(cardsCarrying('showToast'), 'showToast est revenu — le § Un seul toast ne décrit plus le dépôt').toEqual([]);

    for (const [mecanisme, cartes] of attendu) {
      const ligne = table.find((r) => r[0]!.includes(mecanisme));
      expect(ligne, `aucune ligne pour ${mecanisme}`).toBeDefined();
      expect(
        ligne![3],
        `${mecanisme} : la spec doit nommer les cartes, pas les compter`
      ).toBe(cartes.length === 0 ? '⬜ aucun appelant' : cartes.join(', '));
    }

    // `_showToast` est une méthode privée de carte, pas le symbole du socle :
    // c'est la sous-chaîne qui a fait écrire cinq faux consommateurs.
    expect(
      cardsCarrying('_showToast').length,
      'les méthodes privées _showToast ont disparu — le § les nomme'
    ).toBeGreaterThan(0);
  });

  it('les deux cartes qui rendent [] délibérément sont nommées', () => {
    // L'affirmation « chaque carte surcharge le hook donc aucune ne rend [] »
    // était fausse, et faisait prescrire l'AP#7 contre du code déjà relu.
    const spec = read('docs/specs/03_base_classes.md');
    const delibere = cardsReturningEmpty();
    expect(delibere.length, 'plus aucune carte ne rend [] — le § doit le dire').toBeGreaterThan(0);
    const absentes = delibere.filter((c) => !new RegExp(`^\\| ${c} \\|`, 'm').test(spec));
    expect(absentes, 'ces cartes rendent [] et la spec ne les nomme pas').toEqual([]);

    // Et la réciproque : une ligne qui survit au comportement qu'elle décrit
    // fait croire à une échappatoire qui n'existe plus. C'est le sens de
    // lecture que le premier jet oubliait, et un mutant l'a montré.
    const nommees = cardDirs().filter((c) => new RegExp(`^\\| ${c} \\|`, 'm').test(spec));
    expect(nommees.length, 'la table ne nomme plus aucune carte').toBeGreaterThan(0);
    expect(
      nommees.filter((c) => !delibere.includes(c)),
      'la spec leur prête un return [] que leur hook ne porte pas'
    ).toEqual([]);
  });
});

// ── Les beads que le socle cite doivent survivre au lot qui les cite ───────

describe('les beads cités par les specs 01-03', () => {
  it('aucune spec ne renvoie à un bead d’observation de lot', () => {
    // Un bead d'observation porte un suffixe `.N` sous l'épique de son lot
    // (`ha-sci-fi-y6l.6`) et se FERME quand le lot fusionne : la spec pointerait
    // alors sur une dette déclarée réglée. Le travail qui reste va dans un bead
    // à part entière, sans suffixe. Mesuré ici parce que la première rédaction
    // de ce lot avait fait l'erreur sur huit renvois.
    const fautifs: string[] = [];
    let total = 0;
    for (const s of SPECS) {
      for (const m of read(s).matchAll(/`(ha-sci-fi-[a-z0-9]+(\.\d+)?)`/g)) {
        total += 1;
        if (m[2]) fautifs.push(`${s}: ${m[1]}`);
      }
    }
    expect(total, 'aucun renvoi de bead trouvé : la regex est cassée').toBeGreaterThan(8);
    expect(fautifs, 'ces beads se ferment avec leur lot — la dette doit vivre ailleurs').toEqual([]);
  });
});

// ── Les liens internes du socle résolvent ──────────────────────────────────

describe('les liens des specs 01-03', () => {
  it('chaque lien relatif pointe sur un fichier qui existe', () => {
    const casses: string[] = [];
    let total = 0;
    for (const s of SPECS) {
      const base = path.dirname(path.join(ROOT, s));
      for (const m of read(s).matchAll(/\]\((\.\.?\/[^)\s#]+)(#[^)]*)?\)/g)) {
        total += 1;
        if (!fs.existsSync(path.resolve(base, m[1]!))) casses.push(`${s}: ${m[1]}`);
      }
    }
    expect(total, 'aucun lien relatif trouvé : la regex est cassée').toBeGreaterThan(8);
    expect(casses).toEqual([]);
  });

  it('chaque ancre de section pointe sur un titre qui existe', () => {
    // Un lien vers une ancre inexistante atterrit en haut du fichier : il a
    // l'air de marcher. Les ancres de ligne (#L12) ne sont pas des titres.
    const slug = (titre: string) =>
      titre
        .toLowerCase()
        .replace(/[`*_]/g, '')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .trim()
        .replace(/\s+/g, '-');

    const titres = (p: string) =>
      new Set(
        read(p)
          .split('\n')
          .filter((l) => /^#{1,6} /.test(l))
          .map((l) => slug(l.replace(/^#+ /, '')))
      );

    const casses: string[] = [];
    let total = 0;
    for (const s of SPECS) {
      const base = path.dirname(path.join(ROOT, s));
      for (const m of read(s).matchAll(/\]\((\.\.?\/[^)\s#]+)#([^)]+)\)/g)) {
        const ancre = m[2]!;
        if (/^L\d+$/.test(ancre)) continue;
        const cible = path.resolve(base, m[1]!);
        if (!fs.existsSync(cible)) continue; // déjà couvert par le cas ci-dessus
        total += 1;
        if (!titres(path.relative(ROOT, cible)).has(ancre)) {
          casses.push(`${s}: ${m[1]}#${ancre}`);
        }
      }
    }
    expect(total, 'aucune ancre de section trouvée : la regex est cassée').toBeGreaterThan(2);
    expect(casses, 'ces ancres atterrissent en haut du fichier sans rien dire').toEqual([]);
  });
});
