/**
 * Garde l'UNICITÉ des ids de cas de test du projet — lot fix
 * `ids-cas-uniques`, bead ha-sci-fi-cft.
 *
 * La mesure du 2026-11-01 : 294 lignes d'id déclarées dans `docs/`, 242 ids
 * distincts, et 20 ids déclarés par plus d'un document. Deux groupes :
 * `climates`, `lights`, `water`, `water_history`, `weather` et `docs/MASTER.md`
 * déclaraient tous `TC-001` à `TC-005` et `IT-001` à `IT-003` ; `hexa-tiles` et
 * `tv` déclaraient tous deux `TC-701` à `TC-709` et `IT-701` à `IT-703`. Le
 * bead en annonçait cinq déclarants pour le premier groupe ; la matrice de
 * `MASTER.md` est le sixième, et la sonde du bead ne lisait pas `docs/` entier.
 *
 * Le défaut est latent : il mord dès qu'une spec, une revue ou un rapport cite
 * `TC-701` sans nommer son fichier. Il a déjà mordu une fois — la première
 * version du lot `ids-tracabilite` citait des ids dans la colonne `Covers`, et
 * 27 de ses 229 citations résolvaient vers le test d'une AUTRE carte.
 *
 * LA FORME CHOISIE — le préfixe est DÉRIVÉ, pas convenu. Un id déclaré par une
 * spec carte ou par la matrice porte un préfixe que cette garde recalcule
 * depuis le nom du fichier (majuscules, `_` → `-`) : `TC-<PRÉFIXE>-U-<n>` et
 * `IT-<PRÉFIXE>-I-<n>`, sur le modèle de `bridge.md` qui portait déjà
 * `TC-BRIDGE-U-NN`. Le numéro est conservé : le renommage est une insertion,
 * donc chaque id d'avant le lot reste lisible dans l'historique et les revues.
 * Rien n'est gelé ici — ni une liste de cartes, ni un compte d'ids, ni la
 * table des préfixes : une carte ajoutée demain est jugée par la même règle,
 * et une carte qui repartirait à `TC-001` est refusée sans qu'on y pense.
 *
 * CE QUE LE PRÉFIXAGE A RENDU MESURABLE. 52 cas déclarés ne sont joués par
 * aucun test. Avant le lot ce compte était zéro, et il était faux : un
 * `TC-001` déclaré par six documents trouvait toujours un `it()` quelque
 * part, celui d'une AUTRE carte. La revue du 2026-11-01 a eu raison de
 * refuser que le lot livre cet écart sans le mesurer ; sa première correction
 * en a figé la liste DANS ce fichier, ce qui est précisément le fait tenu à la
 * main que l'observation O2 interdit. La forme retenue déplace la déclaration
 * là où elle appartient : chaque spec marque ses cas non joués d'un `⬜` dans
 * la cellule d'id, avec sous le titre de la table la note qui en donne la
 * cause, et la garde DÉRIVE l'ensemble de ces marques. Elle n'a plus de liste
 * ni de compte à elle — seulement une égalité entre ce que les specs déclarent
 * et ce que l'arbre cite. Refermer les 52 est le bead `ha-sci-fi-78y`.
 *
 * CE QUE CETTE GARDE NE COUVRE PAS, et c'est dit plutôt que sous-entendu :
 * les specs numérotées `01` à `11` gardent leurs plages nues (`TC-1xx` à
 * `TC-9xx`). Elles ne collisionnent pas, et `transverse-registries.test.ts`
 * tient déjà leurs plages contre `MASTER.md`. L'unicité globale ci-dessous les
 * juge comme les autres ; la règle de préfixe, non.
 *
 * Chaque cas porte un TÉMOIN POSITIF dérivé d'une seconde sonde indépendante,
 * jamais d'un compte gelé : un mutant qui vide une liste doit rougir ici.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf8');

/**
 * Suivis ET non suivis-mais-non-ignorés : le paquet de revue d'un lot de docs
 * est un arbre sale, et un `git ls-files` nu laisserait une spec neuve hors de
 * la vue de la garde.
 */
function tracked(glob: string): string[] {
  return execFileSync('git', ['ls-files', '-co', '--exclude-standard', glob], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .sort();
}

/**
 * Les markdown de `docs/` qui peuvent déclarer un cas — ni revue, ni rapport
 * de lot.
 *
 * ⚠ Le chemin passé à `git ls-files` est `docs`, pas `docs/**\/*.md` : ce
 * second glob exige un répertoire intermédiaire et laisse `docs/MASTER.md`
 * dehors. La première écriture de cette garde l'utilisait, et son cas
 * d'unicité passait au vert en ne lisant JAMAIS la matrice — le sixième
 * déclarant de `TC-001`, c'est-à-dire le document que ce lot a découvert.
 */
function porteurs(): string[] {
  return tracked('docs')
    .filter((f) => f.endsWith('.md'))
    .filter((f) => !f.startsWith('docs/reviews/') && !f.startsWith('docs/fixes/'));
}

/**
 * Une ligne de table dont la première cellule est un id de cas, le gras
 * compris : `tv.md` écrivait `| **TC-701** |`, et une sonde qui n'attend pas
 * les astérisques rate la collision — c'est la mise en garde du bead.
 */
const LIGNE_ID = /^\| *\*{0,2}((?:TC|IT|UT)-[A-Z0-9-]*[0-9]+)\*{0,2}( ⬜)? *\|/;

/**
 * `⬜` dans la cellule d'id : la spec déclare que ce cas n'est joué par aucun
 * test. C'est une DÉCLARATION, pas un effet de bord de la mise en forme — la
 * marque vit dans la cellule, un seul endroit, et la note sous le titre de la
 * table en donne la cause.
 */
const MARQUE_NON_JOUE = /^\| *\*{0,2}(?:TC|IT|UT)-[A-Z0-9-]*[0-9]+\*{0,2} ⬜ *\|/;

/** Les ids que `f` déclare, dans l'ordre du document, doublons de ligne compris. */
function declares(f: string): string[] {
  return read(f)
    .split('\n')
    .map((l) => LIGNE_ID.exec(l)?.[1])
    .filter((x): x is string => Boolean(x));
}

/** Les ids que `f` déclare non joués, par leur marque `⬜`. */
function nonJoues(f: string): string[] {
  return read(f)
    .split('\n')
    .filter((l) => MARQUE_NON_JOUE.test(l))
    .map((l) => LIGNE_ID.exec(l)![1]!);
}

/** Le préfixe qu'un fichier DOIT porter — recalculé, jamais lu dans une table. */
function prefixeAttendu(f: string): string {
  return basename(f, '.md').toUpperCase().replace(/_/g, '-');
}

/** Les documents soumis à la règle de préfixe : les specs cartes et la matrice. */
function soumisAuPrefixe(): string[] {
  return porteurs().filter(
    (f) => f.startsWith('docs/specs/cards/') || f === 'docs/MASTER.md',
  );
}

describe('Ids de cas de test — l’unicité (O1)', () => {
  it('O1 — aucun id de cas n’est déclaré par deux documents', () => {
    const proprietaires = new Map<string, string[]>();
    for (const f of porteurs()) {
      for (const id of new Set(declares(f))) {
        proprietaires.set(id, [...(proprietaires.get(id) ?? []), f]);
      }
    }

    // Témoin positif : le corpus est lu, et il est gros. Dérivé d'une seconde
    // sonde — le nombre de fichiers qui portent au moins un id — pour qu'un
    // `porteurs()` cassé ne passe pas en silence.
    const declarants = porteurs().filter((f) => declares(f).length > 0);
    expect(declarants.length, 'des documents déclarent des cas').toBeGreaterThan(15);
    expect(proprietaires.size, 'des ids sont lus').toBeGreaterThan(200);

    const collisions = [...proprietaires]
      .filter(([, fs]) => fs.length > 1)
      .map(([id, fs]) => `${id} déclaré par ${fs.join(', ')}`);
    expect(collisions).toEqual([]);
  });

  it('O1 — les huit ids du premier groupe ne sont plus déclarés nus', () => {
    // La mesure du bead, jouée à l'envers : les ids qui collisionnaient ne
    // doivent plus apparaître en tête de ligne nulle part dans `docs/`.
    const nus = ['TC-001', 'TC-002', 'TC-003', 'TC-004', 'TC-005', 'IT-001', 'IT-002', 'IT-003'];
    const restes: string[] = [];
    for (const f of porteurs()) {
      const ids = new Set(declares(f));
      for (const id of nus) if (ids.has(id)) restes.push(`${f} déclare ${id}`);
    }
    // Témoin positif : les mêmes documents déclarent bien quelque chose, donc
    // l'absence ci-dessus n'est pas celle d'une sonde qui ne lit plus rien.
    const groupe = [
      'docs/MASTER.md',
      'docs/specs/cards/climates.md',
      'docs/specs/cards/lights.md',
      'docs/specs/cards/water.md',
      'docs/specs/cards/water_history.md',
      'docs/specs/cards/weather.md',
    ];
    for (const f of groupe) {
      expect(existsSync(join(ROOT, f)), `${f} existe`).toBe(true);
      expect(declares(f).length, `${f} déclare encore des cas`).toBeGreaterThan(5);
    }
    expect(restes).toEqual([]);
  });

  it('O1 — les douze ids du second groupe ne sont plus déclarés nus', () => {
    const nus = [
      'TC-701', 'TC-702', 'TC-703', 'TC-704', 'TC-705',
      'TC-706', 'TC-707', 'TC-708', 'TC-709',
      'IT-701', 'IT-702', 'IT-703',
    ];
    const restes: string[] = [];
    for (const f of porteurs()) {
      const ids = new Set(declares(f));
      for (const id of nus) if (ids.has(id)) restes.push(`${f} déclare ${id}`);
    }
    for (const f of ['docs/specs/cards/hexa-tiles.md', 'docs/specs/cards/tv.md']) {
      expect(declares(f).length, `${f} déclare encore des cas`).toBeGreaterThan(10);
    }
    expect(restes).toEqual([]);
  });
});

describe('Ids de cas de test — la forme qui empêche la rechute (O2)', () => {
  it('O2 — chaque spec carte et la matrice ne déclarent que leur propre préfixe', () => {
    const soumis = soumisAuPrefixe();
    // Témoin positif dérivé : le nombre de specs cartes vient du disque, pas
    // d'une liste écrite ici. Treize documents soumis = douze cartes + MASTER.
    expect(soumis.length, 'des documents sont soumis à la règle').toBeGreaterThan(11);
    expect(soumis, 'la matrice en fait partie').toContain('docs/MASTER.md');

    // CONTRÔLE POSITIF DU MOTIF, sur des ids synthétiques. Desserrer une
    // assertion sur des données correctes ne rougit jamais : la regex de ce
    // cas pouvait devenir `^(TC|IT)-.*-[0-9]+$` sans que rien ne bouge
    // (mutant survivant, ronde 2). Ces quatre lignes jugent le motif, pas
    // l'arbre — un motif desserré échoue ici même quand le dépôt est propre.
    const motif = (pfx: string) => new RegExp(`^(TC-${pfx}-U|IT-${pfx}-I)-[0-9]+$`);
    expect(motif('LIGHTS').test('TC-LIGHTS-U-001'), 'la forme attendue passe').toBe(true);
    expect(motif('LIGHTS').test('TC-CLIMATES-U-001'), 'un autre préfixe est refusé').toBe(false);
    expect(motif('LIGHTS').test('TC-LIGHTS-I-001'), 'la mauvaise lettre de genre est refusée').toBe(false);
    expect(motif('LIGHTS').test('TC-001'), 'la forme nue est refusée').toBe(false);

    const ecarts: string[] = [];
    let avecIds = 0;
    for (const f of soumis) {
      const pfx = prefixeAttendu(f);
      const ids = declares(f);
      if (ids.length > 0) avecIds += 1;
      for (const id of new Set(ids)) {
        if (!motif(pfx).test(id)) ecarts.push(`${f} déclare ${id}, attendu TC-${pfx}-U-<n> ou IT-${pfx}-I-<n>`);
      }
    }
    expect(avecIds, 'les documents soumis portent des ids').toBeGreaterThan(11);
    expect(ecarts).toEqual([]);
  });

  it('O2 — le préfixe porté par les ids est celui que le nom de fichier donne', () => {
    // La règle est lue dans le sens où elle est dérivable : du nom de fichier
    // vers le préfixe. L'inverse ne l'est pas — `_` et `-` se confondent dans
    // `HEXA-TILES`, qui vient de `hexa-tiles` comme il viendrait de
    // `hexa_tiles`. La première écriture de ce cas tentait le retour et
    // rougissait sur `hexa_tiles`, ce qui n'était pas un défaut du dépôt mais
    // une question mal posée.
    //
    // Ce que ce cas ajoute au précédent : celui-ci juge l'id par une regex
    // construite autour du préfixe attendu ; ce cas lit le préfixe RÉELLEMENT
    // porté et le compare. Un mutant qui remplacerait `prefixeAttendu` par une
    // constante satisfait une seule des deux formes.
    const vus: string[] = [];
    for (const f of soumisAuPrefixe()) {
      const ids = declares(f);
      if (ids.length === 0) continue;
      const portes = new Set(
        ids.map((id) => /^(?:TC|IT)-(.+)-(?:U|I)-[0-9]+$/.exec(id)?.[1]),
      );
      expect([...portes], `${f} : un seul préfixe, lisible`).toEqual([prefixeAttendu(f)]);

      // La lettre de genre fait partie de la règle : `TC` est unitaire (`U`),
      // `IT` d'intégration (`I`). Sans ce contrôle, desserrer la regex du cas
      // précédent en `^(TC|IT)-.*-[0-9]+$` ne rougissait nulle part — mesuré
      // comme mutant survivant, puis tué ici.
      const genres = ids.map((id) => /^(TC|IT)-.+-(U|I)-[0-9]+$/.exec(id));
      expect(genres.filter((g) => !g), `${f} : un id hors forme`).toEqual([]);
      expect(
        genres.filter((g) => (g![1] === 'TC') !== (g![2] === 'U')).map((g) => g![0]),
        `${f} : la lettre de genre ne suit pas le type de cas`,
      ).toEqual([]);
      vus.push(f);
    }
    expect(vus.length, 'des documents ont été jugés').toBeGreaterThan(11);
  });

  it('O2 — aucune spec carte ne redéclare un id nu, quel que soit son numéro', () => {
    // La règle précédente nomme les groupes connus ; celle-ci refuse la forme
    // nue elle-même, donc une carte neuve qui repartirait à `TC-042`.
    const nues: string[] = [];
    for (const f of soumisAuPrefixe()) {
      for (const id of new Set(declares(f))) {
        if (/^(?:TC|IT)-[0-9]+$/.test(id)) nues.push(`${f} déclare ${id}`);
      }
    }
    expect(soumisAuPrefixe().length, 'témoin positif : des documents sont lus').toBeGreaterThan(11);
    expect(nues).toEqual([]);
  });
});

describe('Ids de cas de test — ce que le renommage laisse voir (O1)', () => {
  it('O1 — les citations d’un id de carte viennent du répertoire de cette carte', () => {
    // Après le préfixe, un id de carte ne peut plus être cité par erreur
    // depuis le test d'une autre carte : son nom nomme sa carte. Cette garde
    // le vérifie plutôt que de le supposer, et c'est elle qui tient la
    // propriété que le lot a achetée.
    const parCarte = new Map<string, string[]>();
    for (const f of tracked('docs/specs/cards/*.md')) {
      parCarte.set(basename(f, '.md'), declares(f));
    }
    expect(parCarte.size, 'témoin positif : des specs cartes sont lues').toBeGreaterThan(10);

    // ⚠ Même piège que `porteurs()`, et il était resté debout ici : le
    // pathspec `tests/**/*.ts` exige un répertoire intermédiaire, donc il
    // laissait dehors les cinq fichiers de premier niveau — dont
    // `tests/sci-fi.test.ts` et `tests/infrastructure.test.ts`, qui citent
    // tous deux des ids de cas. La revue l'a prouvé par injection : un
    // `TC-TV-U-701` collé dans `tests/sci-fi.test.ts` laissait les sept cas
    // verts. Le défaut était corrigé à un endroit et nommé en commentaire,
    // sans être corrigé à l'autre.
    const fichiers = [...tracked('tests'), ...tracked('src')].filter((f) => f.endsWith('.ts'));

    // Témoin positif dérivé d'une SECONDE sonde indépendante, et non d'un
    // plancher : `git grep` nomme lui-même les fichiers qui portent un id de
    // cas, et le corpus doit les contenir tous. Un plancher ne distinguait
    // pas 217 fichiers de 222 ; cette sonde nomme les manquants.
    const porteursDId = execFileSync(
      'git',
      ['grep', '-lE', '(TC|IT|UT)-[A-Z0-9-]*[0-9]+', '--', 'tests', 'src'],
      { cwd: ROOT, encoding: 'utf8' },
    )
      .split('\n')
      .filter((f) => f.endsWith('.ts'));
    expect(porteursDId.length, 'des fichiers de code citent des ids').toBeGreaterThan(50);
    expect(
      porteursDId.filter((f) => !fichiers.includes(f)),
      'des fichiers citant un id sont hors du corpus lu',
    ).toEqual([]);

    /**
     * Le détecteur, isolé pour être testable. Les gardes de `tests/specs/`
     * lisent les specs : elles citent des ids de toutes les cartes par
     * construction, et c'est leur métier.
     */
    const malPlace = (f: string, carte: string): boolean =>
      !f.startsWith('tests/specs/') && !f.includes(`cards/${carte}/`);

    // CONTRÔLE POSITIF DU DÉTECTEUR. Depuis le préfixage, aucune citation
    // n'est mal placée : la liste d'écarts est vide parce que l'arbre est
    // propre, et un mutant qui neutralisait la condition survivait — le cas
    // passait au vert sans jamais rien détecter. Ces trois lignes jugent le
    // mécanisme sur des chemins synthétiques, pas sur les données.
    expect(malPlace('tests/cards/weather/sci-fi-weather.test.ts', 'climates')).toBe(true);
    expect(malPlace('tests/cards/climates/sci-fi-climates.test.ts', 'climates')).toBe(false);
    expect(malPlace('tests/specs/blueprint-traceability.test.ts', 'climates')).toBe(false);

    const ecarts: string[] = [];
    let citations = 0;
    for (const f of fichiers) {
      const txt = read(f);
      for (const [carte, ids] of parCarte) {
        for (const id of new Set(ids)) {
          if (!new RegExp(`(?<![\\w-])${id}(?![\\w-])`).test(txt)) continue;
          citations += 1;
          if (malPlace(f, carte)) ecarts.push(`${f} cite ${id} (carte ${carte})`);
        }
      }
    }
    expect(citations, 'des ids de carte sont cités dans l’arbre').toBeGreaterThan(100);
    expect(ecarts).toEqual([]);
  });

  it('O1 — un id déclaré que l’arbre ne cite pas est nommé, jamais compté', () => {
    // CE QUE CE CAS TIENT, et pourquoi il existe. Le préfixage a rendu
    // mesurable une couverture qui était fausse : 52 ids déclarés
    // n'apparaissent dans aucun test. Avant le lot ce compte était zéro —
    // non parce que les cas existaient, mais parce qu'un `TC-001` déclaré par
    // six documents trouvait toujours un `it()` quelque part, celui d'une
    // AUTRE carte. La revue du 2026-11-01 a eu raison de refuser que le lot
    // livre cet écart sans le mesurer ; elle en comptait 44, les huit de
    // `docs/MASTER.md` en moins.
    //
    // Le garde ne gèle pas le nombre : il gèle la LISTE, et il refuse qu'un
    // id s'y ajoute en silence. Fermer ces 52 trous est le bead
    // `ha-sci-fi-78y` ; ce cas est ce qui empêche le 53e de passer inaperçu.
    // ⚠ `tests/specs/` est exclu, et pas par commodité : les gardes qui
    // vivent là LISENT les specs, donc ce fichier-ci nomme les 52 ids de la
    // liste plus bas. Sans l'exclusion, chaque orphelin se citait lui-même et
    // le cas passait au vert en ne trouvant aucun orphelin — la liste entière
    // devenait fausse d'un coup. Porter un id dans un garde de spec n'est pas
    // le tester.
    const fichiers = [...tracked('tests'), ...tracked('src')]
      .filter((f) => f.endsWith('.ts'))
      .filter((f) => !f.startsWith('tests/specs/'));
    const txt = fichiers.map((f) => read(f)).join('\n');
    expect(txt.length, 'témoin positif : l’arbre de code a été lu').toBeGreaterThan(100000);

    const orphelins: string[] = [];
    let cites = 0;
    for (const f of porteurs()) {
      for (const id of new Set(declares(f))) {
        if (new RegExp(`(?<![\\w-])${id}(?![\\w-])`).test(txt)) cites += 1;
        else orphelins.push(`${f} :: ${id}`);
      }
    }
    // Témoin positif dérivé : la majorité des ids déclarés EST citée, donc
    // l'absence mesurée ci-dessus n'est pas celle d'une sonde morte.
    expect(cites, 'des ids déclarés sont bien cités').toBeGreaterThan(150);

    // La liste n'est PAS écrite ici : elle est dérivée des marques `⬜` que
    // les specs portent dans la cellule d'id, et le contrôle vaut dans les
    // deux sens. Un cas non marqué que rien ne cite est un trou non déclaré ;
    // un cas marqué qu'un test porte est une marque périmée, qui masquerait
    // un vrai trou — exactement ce que la règle 3 de
    // `tests/specs/retired-identifiers.md` dit d'une exemption non révisée.
    const marques = new Set(porteurs().flatMap((f) => nonJoues(f).map((i) => `${f} :: ${i}`)));
    expect(marques.size, 'témoin positif : des cas sont déclarés non joués').toBeGreaterThan(40);

    // UNE égalité, pas deux filtres. Écrites comme deux soustractions, les
    // deux directions étaient chacune vide-contre-vide sur un arbre propre, et
    // neutraliser l'une ne rougissait nulle part — mesuré comme mutant
    // survivant. Une égalité d'ensembles n'a pas de côté à neutraliser : les
    // cas marqués SONT les cas non joués, et le message nomme l'écart.
    expect([...marques].sort(), 'les cas marqués ⬜ sont exactement les cas non joués')
      .toEqual([...orphelins].sort());
    // Le même fait, par une seconde assertion indépendante. Rendre l'égalité
    // ci-dessus tautologique — `toEqual([...marques].sort())` — la supprime
    // sans rougir, et toute assertion supprimée survit. Celle-ci ne compare
    // pas les mêmes objets : deux cardinaux, et l'écart nommé des deux côtés.
    expect(
      { marques: marques.size, nonJoues: orphelins.length },
      'autant de marques ⬜ que de cas non joués',
    ).toEqual({ marques: orphelins.length, nonJoues: marques.size });

    // Et la marque se lit avec sa cause : une spec qui en porte doit porter
    // la note qui l'explique. Une exemption est une décision, pas une mise en
    // forme — la note est ce qui la rend révisable.
    for (const f of porteurs()) {
      if (nonJoues(f).length === 0) continue;
      expect(read(f), `${f} porte des ⬜ sans la note qui les explique`)
        .toMatch(/⬜ dans la colonne ID : le cas n'est joué par aucun test\./);
    }
  });
});
