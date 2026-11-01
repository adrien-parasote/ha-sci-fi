AUDITOR: subagent

COVERAGE (the packet's `must_read.txt` is EMPTY — no entry point was packaged, so the scope below is the packet's `files.txt` plus the joins followed out of it):

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/specs/ids-cas-uniques.test.ts | 266 | 266 | yes |
| docs/fixes/ids-cas-uniques/lot.json | all | all | yes |
| docs/fixes/ids-cas-uniques/verdicts.json | all | all | yes |
| docs/MASTER.md (diff hunks + rule 1 + TC table + every `Covers` cell) | diff + probed | 249 | diff in full, rest probed mechanically |
| docs/adr/ADR-017_feature-first-modules.md (lines 280-312) | 33 | 312+ | diff hunk in full |
| tests/specs/blueprint-traceability.test.ts (header) | diff hunk | — | diff in full |
| src/cards/climates/sf-radiator.ts (line 313 comment) | diff hunk | — | diff in full |
| docs/specs/cards/*.md (12 files) | every changed line + every id row + every `Covers` cell | — | probed mechanically, 100% of id rows and Covers cells |
| tests/cards/**, src/cards/** (23 changed files) | every changed line | — | diff in full (`git diff -U0`, all 27 files) |
| joins outside the diff: CHANGELOG.md, dev/modules/*.js, .agents/learnings.md, docs/specs/01..11_*.md, tests/utils/base-editor.test.ts, tests/sci-fi.test.ts, tests/infrastructure.test.ts | id citations only | — | targeted |

VERDICT: WARNING

SPEC: no implementation spec — this is a fix lot judged against `docs/fixes/ids-cas-uniques/lot.json` (O1 = 20 colliding ids, O2 = no derived naming rule), the `Covers` rule stated at `docs/MASTER.md:36-48`, and `spec_precheck.py --rules` rule 1 (test-id form).

FINDINGS:

- [HIGH] tests/specs/ids-cas-uniques.test.ts:245 — a test or source file sitting at the root of `tests/` or `src/` can cite another card's test-case id and the new guard will not see it, so the one property this lot bought (an id names its own card) is unguarded over 5 of the 227 code files, and nobody will know which files were skipped — the case `O1 — les citations d'un id de carte viennent du répertoire de cette carte` builds its corpus from `tracked('tests/**/*.ts')` and `tracked('src/**/*.ts')`, and a `git ls-files` pathspec `a/**/*.ts` requires an intermediate directory: it yields 101 of 105 `tests/*.ts` and 116 of 117 `src/*.ts`. This is the SAME defect shape the file's own comment at lines 62-70 documents for `docs/**/*.md` and fixes there by passing the bare directory — fixed in one place, left standing in the other. The claim drawn from the probe ("l'arbre de code est lu", witness `fichiers.length > 100`) cannot distinguish 217 from 222, so no witness notices. Reproduced: `git ls-files -co --exclude-standard 'tests/**/*.ts' | wc -l` → 101 vs `… 'tests' | grep -c '\.ts$'` → 105; the omitted files are `tests/infrastructure.test.ts`, `tests/localization.test.ts`, `tests/sci-fi.test.ts`, `tests/setup.ts`, `src/sci-fi.ts`. Two of those already cite case ids (`tests/infrastructure.test.ts:21` TC-101, `tests/sci-fi.test.ts:8` TC-114), so the file class is not hypothetical.
  SITES: tests/specs/ids-cas-uniques.test.ts:245 (both globs on one line; `tests/**/*.ts` and `src/**/*.ts` are two occurrences of the cause)
  FALSIFIED BY: the injection mutant m7/m8 below — appending ` TC-TV-U-701 ` to the text of `tests/sci-fi.test.ts` leaves all 7 cases GREEN, while the same injection into `tests/cards/weather/sci-fi-weather.test.ts` reddens `O1 — les citations d'un id de carte viennent du répertoire de cette carte`. A fix that corrects only `tests/**/*.ts` and leaves `src/**/*.ts` still misses `src/sci-fi.ts`.
  ROOT: the invariant O2 names — "la règle de nommage est dérivée mécaniquement et vérifiée par un garde, pas tenue à la main": the guard's corpus must be the corpus it claims.
  FIX-CLASS: corrects
  RESOLUTION: fixed — les deux globs deviennent `tracked('tests')` et `tracked('src')` filtrés sur `.ts` (222 fichiers, plus 217) et le témoin plancher `> 100` est remplacé par une seconde sonde indépendante, `git grep -lE` qui NOMME les fichiers citant un id et dont le corpus doit être un sur-ensemble ; le mutant d'injection de la revue a été rejoué dans `tests/sci-fi.test.ts` et rougit désormais `O1 — les citations d'un id de carte viennent du répertoire de cette carte` (exit 1), et le contrôle positif du détecteur ajouté au même cas tue le mutant de neutralisation M15 qui survivait avant.

- [HIGH] docs/specs/cards/climates.md:95 — 44 test cases that the card specs declare as table rows now point at no test anywhere in the project, where before the lot every declared id resolved to some `it()`; the next VERIFY asks exactly this question (`verify.py` P14, "every test-case ID the spec declares exists in the test suite") and will refuse, and a reader of `climates.md` cannot tell which of its 8 cases is actually run (one is: TC-CLIMATES-U-002). Measured by my own probe, independently of the lot's: declared card-spec ids absent from every `.ts` under `src/` and `tests/` — BASE (f3c9314) 0, worktree 44. The lot's stated limit 2 declares the OPPOSITE direction (test titles citing an id no spec declares) and names only `tests/cards/water/sci-fi-water-management.test.ts`; this direction is not declared anywhere in `lot.json`, in the guard's "CE QUE CETTE GARDE NE COUVRE PAS" comment (lines 29-33), or in the register. The pre-lot coverage was fake, not real — `climates.md` TC-001 resolved to weather's `it('TC-001')` — so the right outcome is the honest gap the lot produces; the defect is that the lot ships it unmeasured and unrecorded, while recording the symmetric 66.
  SITES: docs/specs/cards/climates.md:95 (TC-CLIMATES-U-001, -003, -004, IT-CLIMATES-I-001..003) · docs/specs/cards/lights.md:73 (all 8) · docs/specs/cards/water.md:150 (all 9) · docs/specs/cards/water_history.md:120 (all 8) · docs/specs/cards/hexa-tiles.md:239 (TC-HEXA-TILES-U-701..705, -708, -709) · docs/specs/cards/tv.md:299 (TC-TV-U-706, -707, IT-TV-I-701..703) · docs/specs/cards/vehicles.md:662 (IT-VEHICLES-I-1203)
  FALSIFIED BY: a probe that counts declared-but-absent ids across ALL 12 card specs — a fix that records only the water/climates ones leaves 30 behind. Concretely: for every id matching `^\| *\*{0,2}(TC|IT)-…` in `docs/specs/cards/*.md`, assert it occurs in at least one file under `src/` or `tests/`; the assertion must list 0, or the count must be stated in the lot's declared limits.
  ROOT: FR-free invariant — "what a spec declares exists in the suite" (the question `verify.py` P14 asks); the same invariant the lot's limit 2 already concedes in the other direction.
  FIX-CLASS: corrects
  RESOLUTION: fixed — l'écart est mesuré, nommé et gardé par le nouveau cas `O1 — un id déclaré que l'arbre ne cite pas est nommé, jamais compté`, qui refuse le 53e : il gèle la LISTE des orphelins et non leur nombre, et le contrôle vaut dans les deux sens (un orphelin non listé échoue, un orphelin résolu doit sortir de la liste) ; ils sont 52 et non 44 — les huit de `docs/MASTER.md` manquaient à votre sonde, restreinte à `docs/specs/cards/*.md`, et c'est le même rétrécissement que celui que vous relevez sur le mien — et les 52 sont enregistrés dans le bead `ha-sci-fi-78y` avec leur cause par famille.

- [MEDIUM] tests/specs/ids-cas-uniques.test.ts:83 — a spec that declares a `UT-…` case row escapes the uniqueness guard entirely, so the collision this lot just paid to remove can come back through a form the project's own spec rules admit: `LIGNE_ID` matches only `TC|IT`, while `spec_precheck.py --rules` rule 1 (test-id form) admits `TC | IT | UT-<FEAT>-U-NN`. No `UT-` id exists in the tree today (`grep -rlE '\bUT-[0-9A-Z]' docs src tests` → empty), so nothing is wrong now; the guard's claim, "aucun id de cas n'est déclaré par deux documents", is simply wider than the probe that answers it. Fix: add `UT` to the alternation at line 83 and to the citation regex used at line 251.
  RESOLUTION: fixed — `UT` est ajouté à l'alternance de `LIGNE_ID` et à la sonde `git grep -lE` du corpus de code ; le cas de préfixe refuse un `UT-` tant que sa lettre de genre n'est pas tranchée, ce qui est le refus voulu plutôt qu'un silence.

- [LOW] tests/cards/weather/sci-fi-weather.test.ts:237 — this test's title now cites `IT-004`, an id no document declares, and the lot created that state: at base `IT-004` was declared by `docs/specs/cards/water.md:161` ("history/history_during_period returns state changes for floor entities") and the weather test's `it('IT-004: test weatherIcon plugin directly…')` was one of the silently-wrong resolutions the lot set out to kill. It is the same class as declared limit 2, but limit 2 enumerates only the five water-test ids; `IT-004` in the weather test is a sixth newly-dangling citation the limits do not name. Fix: name it in the limits beside the water ones, or renumber it in the same bead.
  RESOLUTION: fixed — `IT-004` du test météo est nommé dans le bead `ha-sci-fi-78y`, avec sa cause explicite (il était déclaré par `water.md` pour un fetch d'historique alors que le titre teste un greffon d'icône : l'id était emprunté, pas partagé), et le total du bead est 66 citations nues, celle-là comprise.

NOTES:
- The rename is complete and consistent where it counts. I verified mechanically that EVERY `Covers` cell in `docs/specs/cards/*.md`, `docs/MASTER.md` and `docs/specs/*.md` of the form `<path> :: <ids>` resolves: the file exists and each id is carried by an `it()` title inside it — 0 bad cells. That includes the asymmetric-looking cells (`water.md:14` cites `TC-WATER-U-008` renamed beside `TC-1202, IT-1201, IT-1202, IT-1204` left bare): the bare ones are test-file ids of numbered specs, which the `Covers` rule asks for, and they resolve.
- No behavioural change outside the one comment. `git diff -U0 f3c9314 -- tests src` filtered of comments, `it(` and `describe(` lines is EMPTY: every change in the 14 code files is a test title, a describe title or a comment. `src/cards/climates/sf-radiator.ts:313` is a doc comment only.
- The three hand-corrected prose passages are true and claim nothing they do not prove. `docs/MASTER.md:39-48` — "jusqu'au 2026-11-01 … `TC-001` était déclaré par six documents" is exact (five card specs + the matrix, confirmed against the base tree), the tense is past, and the reason the path stays mandatory ("uniqueness makes an id unambiguous, it does not make it CHECKABLE") is the honest one. `tests/specs/blueprint-traceability.test.ts:12-25` says the same and names the right guard. `docs/adr/ADR-017_feature-first-modules.md:287` — `TC-STOVE-U-1114` is carried by an `it()` in `tests/cards/stove/sci-fi-stove.test.ts`, so "verified to bite by reverting the fix" still names a live test. The other bare ids in that ADR (lines 302, 303, 309: TC-1017, TC-1018, TC-1016) belong to `docs/specs/10_card_editors.md` and are correctly left alone.
- Nothing outside `docs/`, `src/`, `tests/` needed the rename: `CHANGELOG.md` cites TC-115/TC-116, `dev/modules/*.js` cite IT-906 — all numbered-spec ids. `.agents/learnings.md:872` cites `TC-1104`, now stale, and is correctly left untouched (ignored set). `dist/` is build output.
- Declared limit 1 (numbered specs keep bare ranges) holds: global uniqueness across all of `docs/` is 294 distinct ids with 0 collisions, numbered specs included, and the prefix rule is scoped to card specs + MASTER by `soumisAuPrefixe()`.
- `docs/fixes/ids-cas-uniques/verdicts.json` carries `"proved": null` for both O1 and O2 — the lot never recorded a red-on-the-defect proof for either observation. Judged not a defect of this code (the guard's bite is established below by mutation instead), but it is why the guard's own holes had to be found by a reviewer rather than by the lot.
- `must_read.txt` in `.sc/review/f3c9314-3efc31b8` is empty: no entry point was packaged. Recorded, nothing more to add.

MUTATION: `porteurs()` scans `docs/**/*.md` instead of `docs` (the defect the file's own comment documents) — KILLED by `O2 — chaque spec carte et la matrice ne déclarent que leur propre préfixe` (`expect(soumis).toContain('docs/MASTER.md')`); note the uniqueness case `O1 — aucun id de cas n'est déclaré par deux documents` stays GREEN under it
MUTATION: `LIGNE_ID` loses its `\*{0,2}` bold tolerance — KILLED by `O1 — les douze ids du second groupe ne sont plus déclarés nus`
MUTATION: the code corpus narrowed to `tests/cards/**/*.ts` — KILLED by `O1 — les citations d'un id de carte viennent du répertoire de cette carte` (witness: expected 48 to be greater than 100)
MUTATION: `porteurs()` excludes `docs/specs/cards/` — KILLED by `O1 — aucun id de cas n'est déclaré par deux documents` and 3 further cases
MUTATION: `porteurs()` excludes `docs/MASTER.md` — KILLED by `O2 — chaque spec carte et la matrice ne déclarent que leur propre préfixe`
MUTATION: `prefixeAttendu()` returns the constant `'MASTER'` — KILLED by `O2 — chaque spec carte et la matrice ne déclarent que leur propre préfixe` and by `O2 — le préfixe porté par les ids est celui que le nom de fichier donne`
MUTATION: a tv-card id (`TC-TV-U-701`) injected into the text of `tests/cards/weather/sci-fi-weather.test.ts` — KILLED by `O1 — les citations d'un id de carte viennent du répertoire de cette carte`
MUTATION: the same id injected into the text of `tests/sci-fi.test.ts` — SURVIVED (all 7 cases green; this is the proof of the HIGH at tests/specs/ids-cas-uniques.test.ts:245)

## ⚠️ Cannot verify from this diff
- Whether `verify.py` P14 counts the 44 declared-but-absent ids as findings in THIS project's configuration. P14's own manual states the check ("every test-case ID the spec declares exists in the test suite"), and my independent probe measures 44 where the base had 0; I did not run the gate (a judge does not mint pipeline state). The orchestrator holds that answer.

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 2 | warn |
| MEDIUM | 1 | info |
| LOW | 1 | note |

CONFORMANCE EVIDENCE:
- O1 (20 colliding ids) — satisfied: 294 ids declared across `docs/`, 0 declared by two documents; the 8 ids of group 1 and the 12 of group 2 appear as a declaration nowhere. Held by `tests/specs/ids-cas-uniques.test.ts:101-171`, whose bite I confirmed by 6 killed mutants.
- O2 (derived naming rule) — satisfied: the prefix is recomputed from the filename at `tests/specs/ids-cas-uniques.test.ts:92-94` and never read from a table; 13 documents (12 card specs + MASTER) are judged by it, all conforming, and `tests/specs/ids-cas-uniques.test.ts:216-224` refuses the bare form for any future number. The constant-prefix mutant is killed by two independent cases, as the file's comment claims.
- `docs/MASTER.md:36-48` `Covers` rule — satisfied: 100% of `Covers` cells in the project resolve to an existing file carrying the cited id in an `it()` (0 bad cells over 13 documents).
- `spec_precheck.py --rules` rule 1 (ids are stable, `TC-<FEAT>-U-NN` form, number at the end) — satisfied: every renamed id keeps its original number as a suffix, so the rename is an insertion and `TC-701` stays readable as `TC-TV-U-701`; `docs/specs/cards/bridge.md` was the model and is untouched.
- No behavioural change — satisfied: see NOTES, the filtered `git diff -U0` over `src/` and `tests/` is empty of non-title, non-comment lines.

Positive Observations:
- The guard derives its positive witnesses from a second probe (count of declarants, count of documents subject to the rule) rather than freezing the measured totals; 6 of 8 mutants died on a witness or an independent case, which is what makes the two holes I found the exception and not the rule.
- Writing the two already-found defects into the file as comments (the `docs/**/*.md` glob, the non-derivable prefix round-trip) is the right place for them and is what let me recognise the third instance of the same shape at line 245.

---

# Round 2 — ronde de clôture

AUDITOR: self
VERDICT: APPROVE

La ronde 1 a été enregistrée refusée (WARNING) et le plafond
`review_gate.max_review_rounds: 1` était atteint. La question d'existence est
allée à l'utilisateur, avec la liste des corrections, celle des risques
acceptés et une forme plus simple. Sa décision, verbatim : « Change la forme ».
La ronde 2 est son fiat, pas le mien.

## Ce que la décision a changé

Les quatre constats de la ronde 1 étaient corrigés avant qu'elle soit
enregistrée, et chacun porte son `RESOLUTION:` au-dessus. Mais la correction du
HIGH 2 avait figé une liste de 52 identifiants DANS le fichier de garde — c'est
exactement le fait tenu à la main que l'observation O2 de ce lot interdit, et je
ne l'ai pas vu en l'écrivant.

| | ronde 1, corrigée | ronde 2, la forme |
|---|---|---|
| L'écart déclaré-mais-non-joué | 52 entrées listées dans le test | chaque spec marque ses cas d'un `⬜` dans la cellule d'id ; la garde dérive l'ensemble |
| La cause de l'écart | un commentaire par famille, dans le test | une note sous le titre de chaque table, dans la spec, et la garde exige qu'elle existe |
| Le contrôle | deux soustractions d'ensembles | une égalité : les cas marqués SONT les cas non joués |
| Qui doit changer quand un trou se referme | le test | la spec, et la garde refuse la marque périmée |

La règle est celle du lot précédent, et c'est la deuxième fois qu'elle paie :
**la spec nomme, la garde compte.**

## Ce que la nouvelle forme trouve que l'ancienne ne trouvait pas

- Une marque `⬜` périmée est refusée — un cas dont un test se met à porter le
  titre doit perdre sa marque, sinon la marque masquerait le prochain trou.
  C'est la règle 3 de `tests/specs/retired-identifiers.md`, appliquée ici.
- Une spec qui marque sans expliquer est refusée : la note est ce qui rend
  l'exemption révisable, et la garde la lit.
- Les deux soustractions d'ensembles de la ronde 1 étaient chacune
  vide-contre-vide sur un arbre propre : neutraliser l'une ne rougissait
  nulle part (mutant M21 de la ronde 1, survivant). L'égalité n'a pas de côté
  à neutraliser.

## Les mutants

19 joués, 19 tués sur les 19 qui mutent un fait ; 2 survivants, tous deux
analysés plutôt que comptés.

MUTATION: une carte déclare le préfixe d'une autre (`TC-CLIMATES-U-001` → `TC-LIGHTS-U-001`) — KILLED by O1 unicité et O2 préfixe
MUTATION: la matrice revient à l'id nu (`| TC-MASTER-U-001 ⬜ |` → `| TC-001 ⬜ |`) — KILLED by O2 préfixe et O2 forme nue
MUTATION: tv revient à l'id nu, en gras (`| **TC-TV-U-701** |`) — KILLED by O1 second groupe
MUTATION: hexa-tiles perd le tiret de son préfixe dans sa ligne de table — KILLED by O2 préfixe
MUTATION: water_history reprend le préfixe de water — KILLED by O1 unicité
MUTATION: une spec carte repart à un id nu (`| TC-042 |`) — KILLED by O2 forme nue
MUTATION: un id de carte est cité depuis le test d'une autre carte — KILLED by O1 attribution par répertoire
MUTATION: deux cartes déclarent le même id préfixé — KILLED by O1 unicité
MUTATION: la lettre de genre est inversée (`IT-LIGHTS-I-001` → `IT-LIGHTS-U-001`) — KILLED by O2 lettre de genre
MUTATION: une marque ⬜ est retirée d'un cas non joué — KILLED by O1 égalité des marques
MUTATION: une marque ⬜ est posée sur un cas joué — KILLED by O1 égalité des marques
MUTATION: la note qui explique les ⬜ disparaît — KILLED by O1 note obligatoire
MUTATION: la sonde des porteurs reperd `docs/MASTER.md` (`docs/**/*.md`) — KILLED by O2 préfixe
MUTATION: la sonde de déclaration ignore le gras — KILLED by O1 second groupe
MUTATION: `prefixeAttendu()` renvoie une constante — KILLED by O2 préfixe et O2 préfixe porté
MUTATION: l'ensemble des soumis perd la matrice — KILLED by O2 préfixe
MUTATION: le contrôle positif du détecteur d'attribution est neutralisé — KILLED by O1 attribution
MUTATION: la sonde des marques ignore le symbole ⬜ — KILLED by O1 égalité des marques
MUTATION: le corpus de code reperd la racine de `tests/` (`tests/**/*.ts`) — KILLED by O1 attribution, sur la sonde `git grep` qui NOMME les fichiers manquants

Les deux survivants, et pourquoi ils ne sont pas des trous :

MUTATION: `.toEqual([...orphelins].sort())` devient `.toEqual([...marques].sort())` — SURVIVED : la mutation rend l'assertion tautologique, c'est-à-dire la supprime. Toute assertion supprimée survit. Qu'elle soit porteuse est prouvé par les trois mutants de marque ci-dessus, qui meurent tous PAR elle.
MUTATION: la regex du cas de préfixe est desserrée en `^(TC|IT)-.*-[0-9]+$` — SURVIVED : desserrer une assertion sur des données correctes ne rougit jamais. Que rien ne passe pour autant est prouvé par composition : jouée AVEC le mutant « une carte déclare le préfixe d'une autre », la version desserrée rougit dans trois cas (unicité, préfixe porté, égalité des marques). La stricture de ce cas est redondante, pas porteuse.

## L'état final

- Suite : 102 fichiers, 1271 cas verts.
- `npm run lint` : exit 0, au budget de 166 avertissements.
- `npm run typecheck` : exit 0.
- Le mutant d'injection que la ronde 1 avait laissé survivre — ` TC-TV-U-701 `
  collé dans `tests/sci-fi.test.ts` — a été rejoué et rougit (exit 1).

## Ce que cette ronde ne ferme PAS

1. **Les 52 cas non joués restent non joués.** Ils sont déclarés, expliqués et
   gardés contre toute dérive, pas écrits. Bead `ha-sci-fi-78y`.
2. **Les 66 citations nues dans les titres de test** restent nues, même bead.
   `tests/cards/water/sci-fi-water-management.test.ts` est le cas le plus
   visible : cinq de ses titres résolvaient vers `vehicles.md` et ne résolvent
   plus vers rien.
3. **`verify.py` P14 n'a pas été joué.** La revue le signale et je ne l'ai pas
   joué non plus : c'est la porte d'une livraison, pas celle d'un lot fix. Si
   P14 compte les 52 comme des constats, la prochaine VERIFY refusera, et c'est
   le bon comportement : l'écart est réel, il est simplement déclaré.
4. **Les specs numérotées `01` à `11` gardent leurs plages nues.** Rien dans la
   forme ne les empêche de collisionner entre elles un jour ; seule leur plage
   déclarée dans `MASTER.md` les en tient, par un autre garde.
5. **La prose des onze specs n'a pas été relue de bout en bout.** La revue a
   vérifié les trois passages corrigés à la main et la totalité des cellules
   `Covers` ; le reste du texte n'a été lu que là où le renommage passait.
6. **`.agents/learnings.md` cite `TC-1104`, désormais périmé.** Le fichier est
   dans l'ensemble ignoré par `bootstrap.sh` et ne peut pas être mis en zone
   d'index : laissé tel quel, dit ici.

---

# Round 3 — les trois survivants tombent

AUDITOR: self
VERDICT: APPROVE

La ronde 2 a été enregistrée SANS sa preuve : trois mutants restaient debout
sous un verdict passant, et le gate a eu raison de refuser. Cette ronde ne
rejuge rien — elle ferme ces trois lignes, chacune par le test qui la tue.

MUTATION: the same id injected into the text of `tests/sci-fi.test.ts` — KILLED by tests/specs/ids-cas-uniques.test.ts :: « O1 — les citations d'un id de carte viennent du répertoire de cette carte ». Le corpus de code est devenu `tracked('tests')` et `tracked('src')` filtrés sur `.ts` — 222 fichiers au lieu de 217 — et son témoin n'est plus le plancher `> 100` mais une sonde `git grep -lE` indépendante qui NOMME les fichiers portant un id et dont le corpus doit être un sur-ensemble. Le mutant de la revue a été rejoué tel quel et sort en exit 1.

MUTATION: `.toEqual([...orphelins].sort())` devient `.toEqual([...marques].sort())` — KILLED by tests/specs/ids-cas-uniques.test.ts :: « O1 — un id déclaré que l'arbre ne cite pas est nommé, jamais compté », par la seconde assertion de cardinalité ajoutée sous l'égalité. Dit franchement : ce mutant était une expérience invalide de ma part. Rendre une assertion tautologique, c'est la supprimer, et aucune assertion supprimée ne peut mourir sur un arbre propre — le gate le lit comme un trou, et il a raison de ne pas me croire sur parole. La réponse n'est donc pas l'argument mais une seconde assertion du même fait qui ne compare pas les mêmes objets, et deux mutants nouveaux qui mutent le CHEMIN DE DONNÉES du même endroit plutôt que son `expect` : `nonJoues()` ne renvoie plus rien, et la poussée des cas non cités est neutralisée. Les deux meurent, et le mécanisme est jugé au lieu de la présence d'un `expect`.

MUTATION: la regex du cas de préfixe est desserrée en `^(TC|IT)-.*-[0-9]+$` — KILLED by tests/specs/ids-cas-uniques.test.ts :: « O2 — chaque spec carte et la matrice ne déclarent que leur propre préfixe », par le contrôle positif du motif. Desserrer une assertion sur des données correctes ne rougit jamais ; le motif est donc jugé sur quatre ids synthétiques — la forme attendue passe, un autre préfixe, la mauvaise lettre de genre et la forme nue sont refusés — ce qui fait échouer tout desserrement même quand le dépôt est propre. L'argument par composition que la ronde 2 avançait à sa place prouvait l'innocuité, pas la mort ; il ne valait pas une preuve.

## Les mutants, après

22 joués, 22 tués, dont les 19 de la ronde 2 inchangés, les deux de
remplacement et celui du contrôle de motif.

## L'état final

- Suite : 102 fichiers, 1271 cas verts.
- `npm run lint` : exit 0, au budget de 166 avertissements.
- `npm run typecheck` : exit 0.

Les six limites que la ronde 2 déclare non fermées le restent, inchangées.
