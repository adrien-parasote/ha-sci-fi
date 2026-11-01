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
