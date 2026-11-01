AUDITOR: subagent

Lot `ids-tracabilite` (bead ha-sci-fi-zv1), review packet `.sc/review/3ced212-0f4faa44`, base 2af243b, branch fix/ids-tracabilite.

COVERAGE (the packet's `must_read.txt` is EMPTY — no entry point was packaged; scope taken from `files.txt`):

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/specs/blueprint-traceability.test.ts | 294 | 294 | yes |
| docs/MASTER.md | 26 (the added section, via diff) + 237 scanned | 237 | diff + targeted |
| docs/fixes/ids-tracabilite/lot.json | 66 | 66 | yes |
| docs/fixes/ids-tracabilite/verdicts.json | 54 | 54 | yes |
| docs/specs/01_infrastructure.md | 117 | 117 | yes |
| docs/specs/04_components.md | Blueprint + Test Case tables | 197 | sections |
| docs/specs/cards/water.md | 170 | 170 | yes |
| docs/specs/cards/water_history.md | 148 | 148 | yes |
| docs/specs/cards/hexa-tiles.md | 264 | 264 | yes |
| docs/specs/cards/tv.md | Blueprint + TC tables | 346 | sections |
| docs/specs/02,03,05,06,09,10,11 + cards/{bridge,plugs,stove,vacuum,vehicles,weather}.md | Blueprint table + Test Case table of each, extracted and compared row by row | 119/163/301/111/213/983/196/1563/930/620/969/728/153 | sections |
| tests/** (99 files) | every `it()` title indexed for TC/IT ids; read in full: tests/cards/water/sci-fi-water-management.test.ts, tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts (titles), tests/cards/weather/sci-fi-weather.test.ts (titles), tests/styles/card-css-baseline.test.ts, tests/cards/stove/styles.test.ts, tests/localization.test.ts | — | targeted |

The review is therefore PARTIAL on the six long card specs outside the water/hexa/tv group: their Blueprint and Test Case tables were read whole and cross-checked against the suite, their prose was not.

VERDICT: BLOCK
SPEC: docs/MASTER.md § "Ce qu'une table Blueprint Coverage porte, et qui en porte une" (the three rules this lot wrote) + docs/fixes/ids-tracabilite/lot.json observations O1–O7

FINDINGS:

- [CRITICAL] docs/specs/cards/water.md:9 — anyone who follows the new traceability link from a water-card requirement lands on a test of the WEATHER card, reads the row as covered, and the test that really covers it is named nowhere; the lot delivered as its fix for "no requirement → test traceability" a mapping that is wrong on 25 of its 229 citations. O1 (a `Covers` column naming the TC/IT ids that cover each row) is satisfied in form and violated in substance.
  Verified by indexing every `it()` title under tests/ and resolving each cited id:
  * water.md F-WATER-01 → TC-002, IT-001; F-WATER-02 → TC-004, IT-002; F-WATER-03 → TC-003, TC-005, IT-003; F-WATER-06 → IT-004; F-WATER-07 → TC-001. All nine ids exist in the suite ONLY as `it('TC-00n: …')` / `it('IT-00n: …')` of tests/cards/weather/sci-fi-weather.test.ts (TC-002 also tests/cards/climates/sci-fi-climates.test.ts:196) — e.g. F-WATER-07 "Resilient UI" cites TC-001, which is `tests/cards/weather/sci-fi-weather.test.ts:123 'TC-001: Header rendering'`. The water card's real cases (`TC-W01`…`TC-W15`, `TC-1201`…`TC-1205`, `IT-1201`…`IT-1205` in tests/cards/water/sci-fi-water-management.test.ts) are cited by no row.
  * water_history.md:13-16 — all 8 citations (TC-001..005, IT-001..003) resolve the same way to the weather card; the cases that actually cover those four rows are TC-1201..1205 / IT-1201..1202 of tests/cards/water/sci-fi-water-management.test.ts, whose descriptions match the spec's own TC text one for one.
  * hexa-tiles.md:13-20 — F-HEX-01 (TC-701, TC-702), F-HEX-02 (TC-704), F-HEX-03 (TC-705), F-HEX-05 (TC-703), F-HEX-07 (TC-708, TC-709): those seven ids exist in the suite only in tests/cards/tv/sci-fi-tv.test.ts (TC-701 there is "throws error when mandatory entity is missing"). hexa-tiles' own file implements only TC-706, TC-707, IT-701..703; its user-header and grid tests exist but are untitled, so the rows credit the TV card.
  * vehicles.md:19 — F-VEH-D06 cites IT-1203, whose only implementation is tests/cards/water/sci-fi-water-management.test.ts:321 (a water log-fetch test); vehicles.md:662 declares IT-1203 as a grep check that no test performs.
  The lot knew the id space was shared (O7) and escalated it, but still shipped `✅` + `Covers` across it with no caveat on the affected cells.
  SITES:
  docs/specs/cards/water.md:9
  docs/specs/cards/water.md:10
  docs/specs/cards/water.md:11
  docs/specs/cards/water.md:14 (IT-004)
  docs/specs/cards/water.md:15
  docs/specs/cards/water_history.md:13
  docs/specs/cards/water_history.md:14
  docs/specs/cards/water_history.md:15
  docs/specs/cards/water_history.md:16
  docs/specs/cards/hexa-tiles.md:13
  docs/specs/cards/hexa-tiles.md:14
  docs/specs/cards/hexa-tiles.md:15
  docs/specs/cards/hexa-tiles.md:17
  docs/specs/cards/hexa-tiles.md:19
  docs/specs/cards/vehicles.md:19
  FALSIFIED BY: a case added to tests/specs/blueprint-traceability.test.ts that, for every cited TC/IT id, requires at least one `it()` whose title carries that id in a test file under the directory of the card the spec owns (or an explicit `→ <path>` in the cell) — it fails on water_history.md and hexa-tiles.md even after water.md alone is corrected.
  ROOT: O1 — requirement → test traceability (the lot's objective)
  FIX-CLASS: corrects

- [HIGH] tests/specs/blueprint-traceability.test.ts:91 — the guard cannot see a whole Blueprint table disappear, so the rules it was written to hold stop being held the moment a spec is edited: every positive-witness threshold was set to the PRE-lot count, and the tree now exceeds each of them (18 tables vs `>= 17`, 153 F rows vs `>= 145`, 152 owners vs `>= 140`, 29 `⬜` cells vs `>= 20`, 124 covered vs `>= 100`, 86 pointers vs `>= 50`). Two mutations run against the suite in a scratch copy stayed green (below). This violates the clause of MASTER § "Ce qu'une table Blueprint Coverage porte" that each of the three rules "est tenue par une garde de tests/specs/blueprint-traceability.test.ts".
  SITES:
  tests/specs/blueprint-traceability.test.ts:91 (`toBeGreaterThanOrEqual(17)`)
  tests/specs/blueprint-traceability.test.ts:110 (`>= 145`)
  tests/specs/blueprint-traceability.test.ts:160-161 (`>= 20`, `>= 100`)
  tests/specs/blueprint-traceability.test.ts:217 (`>= 140`)
  tests/specs/blueprint-traceability.test.ts:252 (`>= 50`)
  tests/specs/blueprint-traceability.test.ts:71 (row regex `^\| ` — a row written `|F-X-01 |` is invisible)
  FALSIFIED BY: pinning the counts to equality against a committed expected set (or asserting one row per F id per spec file) — raising only the 17 to 18 leaves the row-level mutant (missing space after the pipe) alive.
  ROOT: invariant "every Blueprint row stays under the guard"
  FIX-CLASS: corrects

- [HIGH] docs/specs/cards/stove.md:17 — four rows declare "no case pins this" while a test does pin it, so the next person to change the pinned value hits a red suite the spec told them did not exist (and a reader may write a duplicate case for coverage that is already there). The lot's own O6 standard is that each cell states the state measured today, and the lot already shows the right form elsewhere (`⬜ aucun id TC — testé par tests/components/editor-inputs/…`, docs/specs/10_card_editors.md:16).
  * stove.md:17 F-STOVE-D04 "`ha-card` background `rgba(39,40,43,0.3)` … ⬜ aucun id TC — valeur de fond, aucun cas ne la pine": tests/styles/card-css-baseline.test.ts:75 asserts each card's resolved CSS against tests/styles/card-css-baseline.json, which carries `"background": "rgba(39, 40, 43, 0.3) !important"` for the stove.
  * stove.md:18-19 (F-STOVE-D05 selectors, F-STOVE-D06 pellet-bar colours) are pinned by the same baseline.
  * plugs.md:17 F-PLG-D04 "le graphe de puissance et la fenêtre de 24 h ne sont pinés par aucun cas déclaré": tests/cards/plugs/sci-fi-plugs.test.ts:815 is `'asks history for a rolling 24-hour window, not midnight yesterday'`, plus the `_loadPowerChart` cases at 659-685.
  SITES:
  docs/specs/cards/stove.md:17
  docs/specs/cards/stove.md:18
  docs/specs/cards/stove.md:19
  docs/specs/cards/plugs.md:17
  FALSIFIED BY: a case requiring every `⬜` cell either to name the file of the test that covers the row or to assert that no test file mentions the row's pinned artifact — it still fails on plugs.md after the three stove rows are corrected.
  ROOT: O6 — a Blueprint cell states the state measured today
  FIX-CLASS: corrects

- [MEDIUM] tests/specs/blueprint-traceability.test.ts:243 — the O5 pointer check accepts a pointer that names a section which does not exist, so the defect O5 was opened on can come back under a green suite: the cell text is split on ` — ` and the longest matching PREFIX wins, with the tail discarded unchecked. Mutating docs/specs/cards/water.md's `✅ This spec § Key Methods` into `✅ This spec § Features — § Chapitre Inexistant` keeps all 13 cases green. Only 3 cells in the tree need the shortened-prefix path at all (docs/specs/10_card_editors.md F-EDITOR-10, F-EDITOR-22, F-EDITOR-23), and in all three the tail is prose, never another `§`.
  Fix: reject a tail that itself contains `§`, or hold the comment in its own column so the pointer can be matched whole.

- [MEDIUM] docs/fixes/ids-tracabilite/lot.json:O7 — the escalation that was supposed to carry the ambiguity out of the lot records a scope narrower than the fact, so bead ha-sci-fi-cft will renumber tv.md and leave untouched the collision the CRITICAL above actually lives in. Its text says "Deux specs cartes se partagent le meme espace d ids" and "aucun autre couple de specs ne collisionne (temoin positif : les autres cartes emploient des plages distinctes, 1101+ pour stove, 1301+ pour plugs)". Measured on this tree: TC-001..005 and IT-001..003 are each declared as table rows by FIVE specs — docs/specs/cards/{climates,lights,water,water_history,weather}.md — on top of the TC/IT-70x pair; and the suite reuses the 12xx range of docs/specs/cards/vehicles.md for the water card's tests.
  Fix: correct the O7 text (and the escalated bead) to the measured 20 ids / 7 specs before the lot records, since the CRITICAL's resolution depends on which ids the follow-up renumbers.

- [LOW] docs/specs/cards/tv.md:13 — the single Covers cell of this spec names a prose RANGE, "TC-701 à TC-715, IT-701 à IT-704", so the guard checks only the four endpoints and the cell does not satisfy MASTER rule 1 ("nomme les ids de cas de test … qui la couvrent"). Of those endpoints TC-715 is the one cited id with no implementation anywhere: tests/cards/tv/sci-fi-tv-editor.test.ts:133 carries it as a `// TC-715` comment and the `it()` title below it omits the id, so no `-t TC-715` run reaches it.

- [LOW] docs/MASTER.md:38 — the rule states the absence marker as `⬜ aucun id TC`, and 8 of the 29 absence cells write `⬜ aucun cas de test` instead (docs/specs/01_infrastructure.md:15,16,18, docs/specs/02_domain_selectors.md:13,19, docs/specs/11_guidelines_remediation.md:13 among them), so the normative wording and the tree disagree on day one. The guard keys on `⬜` alone, so neither form is held: replacing MASTER's `` `⬜ aucun id TC`, suivi de la raison `` by "une case vide" keeps all 13 cases green.

- [LOW] docs/specs/09_workbench_editor_i18n.md:13 — this spec's Blueprint rows are `F1`…`F6`, not the `F-<DOMAINE>-NN` schema MASTER.md:30 now declares as the house referential, and such bare ids are the most collision-prone of all under MASTER rule 3 ("un id F est déclaré dans une seule spec"). The file is in the lot's diff and was not reconciled with the rule the lot wrote.

- [LOW] tests/specs/blueprint-traceability.test.ts:40 — `specFiles()` lists specs with `git ls-files docs/specs`, so a spec added but not yet committed is outside every one of the 13 cases, and the review packet of a doc lot is exactly a dirty tree; `blueprint()` likewise requires the heading to be exactly `## …Blueprint Coverage`, so a table under `###` is invisible.

MUTATION: `## Blueprint Coverage` renamed to `## Feature Map` in docs/specs/cards/stove.md (its 7 F rows and 7 pointers leave the guard's view) — SURVIVED
MUTATION: the leading space removed after the pipe on docs/specs/cards/plugs.md F-PLG-D01 and F-PLG-D02 and their Covers cells emptied (`|F-PLG-D01 | … | |`) — SURVIVED
MUTATION: `✅ This spec § Key Methods` in docs/specs/cards/water.md replaced by `✅ This spec § Features — § Chapitre Inexistant` — SURVIVED
MUTATION: docs/MASTER.md absence-marker sentence `` `⬜ aucun id TC`, suivi de la raison `` replaced by "une case vide" — SURVIVED
MUTATION: docs/specs/cards/water.md F-WATER-07 Covers changed from TC-001 to the unrelated TC-006 — SURVIVED
MUTATION: `↗` removed from docs/specs/cards/tv.md F-CARD-09 (F id then owned by two specs) — KILLED by "O4: un id F n'est déclaré que par une spec, sauf cité avec ↗"

NOTES:
- O6's three factual claims are TRUE as measured on this tree today: no `vite.config*` at the repo root and `package.json:7` has `"dev": "rollup -c --watch --environment NODE_ENV:development"`; no `.devcontainer/`; no `sf-tabs` anywhere under `src/` (only CSS class names), while `src/components/sf-toggle-switch/` and `src/components/editor-inputs/sf-editor-accordion` do exist. The three cells read correctly.
- The 229 cited ids all exist as declared TC/IT rows in their own spec AND as an `it()` title somewhere in the suite (only TC-715 is missing an implementation, see the LOW). The CRITICAL is about WHICH test the id resolves to, not about a dangling id.
- No security surface: the lot is markdown plus one test file. It reads with `readFileSync`/`readdirSync` on paths derived from `import.meta.url`, and shells out only through `execFileSync('git', [...])` with a fixed argument vector (no shell, no interpolated input). No secret, no network, no user input.
- Positional `cells[3]` for the Covers column is correct for all 153 rows today (every Blueprint table has exactly 4 columns); a 5-column table would silently shift the read while the header assertion still passed. Not a defect today — the spec does not pin the column count.
- MASTER.md attributes the new section to bead `ha-sci-fi-p6v.4`, which is O4's sub-bead rather than the lot bead `ha-sci-fi-zv1`; that is the rule's own provenance and reads correctly.
- Thresholds expressed as `>=` are a deliberate style; what is reported above is not the style but the gap between them and the measured state.
- Mutants were run against a full copy of the tree in the session scratchpad with the repository's node_modules symlinked; nothing in the repository was written or restored.

CONFORMANCE EVIDENCE (the load-bearing clauses that ARE satisfied):
- MASTER rule 1, "a `Covers` column on every Blueprint table": 18/18 tables carry it as the last column (header asserted at tests/specs/blueprint-traceability.test.ts:94); all 153 F rows have a non-empty cell (tests/…:110).
- MASTER rule 2, "a `Reference` spec carries no Blueprint table": docs/specs/cards/weather.md:3 now reads `> Document Type: Reference` like climates.md and lights.md, and none of the three has a Blueprint section (tests/…:191); their requirements live at docs/specs/05_cards.md F-CARD-02/03/05.
- MASTER rule 3, "one owner per F id": 152 distinct owners, no F id declared twice, docs/specs/cards/tv.md:13 citing F-CARD-09 with `↗` instead of redeclaring it — and this is the one rule a mutation could not get past (see the KILLED mutant).
- O2: docs/specs/cards/water.md:5-16 creates the missing table with F-WATER-01..08 under `> Document type: Implementation`.
- O5: of the 86 `This spec § X` pointers in Blueprint tables, 86 resolve to a real heading of their own file (83 exactly, 3 via a prose tail — see the MEDIUM).

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 1     | fail   |
| HIGH     | 2     | warn   |
| MEDIUM   | 2     | info   |
| LOW      | 4     | note   |
