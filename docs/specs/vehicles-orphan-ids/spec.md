---
spec: docs/specs/vehicles-orphan-ids/spec.md
sources:
  - docs/specs/cards/vehicles.md
  - docs/specs/05_cards.md
  - docs/specs/weather-orphan-ids/spec.md
  - tests/cards/vehicles/sci-fi-vehicles.test.ts
  - tests/specs/ids-cas-uniques.test.ts
  - tests/specs/blueprint-traceability.test.ts
---

# Vehicles test titles cite only declared ids — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-78y.6`, child of `78y`; the repo-wide guard is `78y.8`. Nine titles of `tests/cards/vehicles/sci-fi-vehicles.test.ts` cite a bare id that `docs/specs/cards/vehicles.md` does not declare: `TC-1215` (the `vehicleStyles` export) and `TC-V01`..`TC-V08` (`getRelevantEntities`, `getCardSize`, the AC toasts). The user decided (AskUserQuestion "Lignes dans vehicles.md", 2026-11-02): each of the nine cases gets a row in `vehicles.md`, worded from what its test asserts, and the title takes a prefixed id. The prefix is `TC-VEHICLES-U-`, the one `tests/specs/ids-cas-uniques.test.ts` derives from the file name (`vehicles.md` → `VEHICLES`), and the numbers continue the `12xx` series that `vehicles.md` already uses (`TC-VEHICLES-U-1201`..`1214`, Spec 12). The lot's own test cases use the prefix `VEHOI` (`TC-VEHOI-U-*`, `IT-VEHOI-I-*`); `VOI` belongs to the merged vacuum lot.

| # | Old id | New id | Asserts |
|---|---|---|---|
| 1 | `TC-1215` | `TC-VEHICLES-U-1215` | `vehicleStyles` is a Lit `CSSResult` |
| 2 | `TC-V01` | `TC-VEHICLES-U-1216` | `getRelevantEntities` lists every configured entity field |
| 3 | `TC-V02` | `TC-VEHICLES-U-1217` | it lists the fields of several vehicles |
| 4 | `TC-V03` | `TC-VEHICLES-U-1218` | it returns `[]` for a vehicle without sensors |
| 5 | `TC-V04` | `TC-VEHICLES-U-1219` | `getCardSize` is 5 with a config |
| 6 | `TC-V05` | `TC-VEHICLES-U-1220` | Start AC success shows a success toast |
| 7 | `TC-V06` | `TC-VEHICLES-U-1221` | Start AC failure shows the error toast |
| 8 | `TC-V07` | `TC-VEHICLES-U-1222` | Stop AC success shows a success toast |
| 9 | `TC-V08` | `TC-VEHICLES-U-1223` | `getCardSize` is 3 without a config |

`TC-1215` is a bare id of the `TC-NNN` family (the numbers of the numbered specs), so it is renamed, not declared: declaring it would put a card test in the bare-range of another spec. `TC-508` stays in the `TC-V01` title: unlike `TC-V01`, `docs/specs/05_cards.md` declares it (`| TC-508 | Unit | VehiclesCard affiche fuel_quantity`) and the `F-CARD-07` feature row lists `sci-fi-vehicles.test.ts :: TC-508`. Dropping it would leave the `TC-508` row uncited, which `ids-cas-uniques` refuses, and break `blueprint-traceability` O1. The `TC-508` row only loosely matches its test (a test of all entity fields, not of `fuel_quantity` alone); that looseness is not this lot's.

No test body, assertion or comment is edited; only the nine title strings change. A guard `tests/cards/vehicles/vehicles-ids-declared.test.ts` holds the invariant for this file until `78y.8` generalises it. Precedent: [weather lot](../weather-orphan-ids/spec.md). See [the vehicles spec](../cards/vehicles.md) and [the cards spec](../05_cards.md).

**Out of scope.** The test files `sci-fi-vehicles-editor.test.ts`, `sf-landspeeder.test.ts`, `styles.test.ts` and `vehicle_const.test.ts` cite no `TC-`/`IT-` id today; this guard reads `sci-fi-vehicles.test.ts` only, and `78y.8` takes whatever those files cite later. `describe(` titles and comments are not checked or edited (the header comment and the `// ── TC-V0n` section comments keep the old ids; they are not citations of a title, and the residue is accepted, Assumption 6). Titles with no id (the `O6` regression block and the untitled-by-id tests) are left alone.

## Requirements

- **FR-1**: Every id cited in an `it(`, `test(` or `it.each(` title of `tests/cards/vehicles/sci-fi-vehicles.test.ts` is a row head of `docs/specs/cards/vehicles.md`, or is one of the ids that the `F-CARD-07` feature row of `docs/specs/05_cards.md` lists for `tests/cards/vehicles/sci-fi-vehicles.test.ts` (today `TC-508`), which must also be a row head of `05_cards.md`. The other row heads of `05_cards.md` belong to other cards and do not count. Titles are read as literal source text. The guard `tests/cards/vehicles/vehicles-ids-declared.test.ts` enforces it, fails on a fixture title citing an undeclared id in the forms `it(`, `test(`, `it.concurrent(` and `it.each(`, and fails when a declared set is empty. When `78y.8` ships, it absorbs this guard or retires it.
- **FR-2** (written at SPEC in `vehicles.md`; the builder verifies it and adds only what is missing): `docs/specs/cards/vehicles.md` declares `TC-VEHICLES-U-1215`..`TC-VEHICLES-U-1223` as row heads of its Test Case Specifications table, each once, in numeric order directly after `TC-VEHICLES-U-1214` (the heads in table order read `1214, 1215, ..., 1223` with no other head between), without ⬜. Each row says what its test asserts: 1215 `vehicleStyles` is an object whose `cssText` is a string; 1216 a vehicle with its twelve entity fields set (`charging`, `lock_status`, `location`, `battery_autonomy`, `fuel_autonomy`, `battery_level`, `location_last_activity`, `charge_state`, `plug_state`, `mileage`, `fuel_quantity`, `charging_remaining_time`) gets all twelve ids back from `getRelevantEntities`; 1217 two vehicles, the `battery_level` of the first and the `fuel_quantity` of the second are both listed; 1218 a vehicle with only `id` and `name` gives an empty list; 1219 `getCardSize()` returns 5 on a mounted card; 1220 clicking Start AC (`mdi:play`) with `callService` resolving calls the toast `addMessage` with a string and `false`; 1221 the same with `callService` rejecting `Error('AC failure')` calls `addMessage('AC failure', true)`; 1222 clicking Stop AC (`mdi:stop`) with `callService` resolving calls `addMessage` with a string and `false`; 1223 `getCardSize()` returns 3 when `setConfig` was never called. No row names a source line. The `F-VEH-D06` cell of the Blueprint Coverage table cites `TC-VEHICLES-U-1215` in place of `TC-1215`, and the note under the Test Case Specifications title counts the rows again (`Une ligne sur dix-sept` becomes `Une ligne sur vingt-six`).
- **FR-3**: The nine titles change and nothing else in the test file does; each new title is the old title with its id token replaced by the new id (for `TC-V01` the token `TC-V01, TC-508` becomes `TC-VEHICLES-U-1216, TC-508`), the words after the colon unchanged:

  | Old title start | New title start |
  |---|---|
  | `TC-1215: vehicleStyles exports` | `TC-VEHICLES-U-1215: vehicleStyles exports` |
  | `TC-V01, TC-508: getRelevantEntities includes all` | `TC-VEHICLES-U-1216, TC-508: getRelevantEntities includes all` |
  | `TC-V02: getRelevantEntities includes sensors` | `TC-VEHICLES-U-1217: getRelevantEntities includes sensors` |
  | `TC-V03: getRelevantEntities returns empty` | `TC-VEHICLES-U-1218: getRelevantEntities returns empty` |
  | `TC-V04: getCardSize returns 5` | `TC-VEHICLES-U-1219: getCardSize returns 5` |
  | `TC-V05: _startAc shows success` | `TC-VEHICLES-U-1220: _startAc shows success` |
  | `TC-V06: _startAc shows error` | `TC-VEHICLES-U-1221: _startAc shows error` |
  | `TC-V07: _stopAc shows success` | `TC-VEHICLES-U-1222: _stopAc shows success` |
  | `TC-V08: getCardSize returns 3` | `TC-VEHICLES-U-1223: getCardSize returns 3` |

- **FR-4**: After the lot, no title of `sci-fi-vehicles.test.ts` cites `TC-1215` or `TC-V01`..`TC-V08` as a whole token (retired-id pattern `\bTC-(?:1215|V\d{2})\b`), and neither `sci-fi-vehicles.test.ts` nor the guard `vehicles-ids-declared.test.ts` uses `skip`, `skipIf`, `todo`, `only`, `runIf` or `fails` on `it`, `test` or `describe` (ban pattern `\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|skipIf|todo|only|runIf|fails)\b`).

- **FR-5** [ACCEPTED-LIMIT: the user scoped the lot to titles only (2026-11-02); no test can pin a comment's meaning]: the old ids in the header comment and the `// ── TC-V0n` section comments stay (Assumption 6).
- **FR-6** [ACCEPTED-LIMIT: the guard cannot tell a played head from a ⬜ one without duplicating ids-cas-uniques, which already refuses a ⬜ id cited by a test]: the guard's row-head matcher counts a ⬜ head as declared (Assumption 7).
- **FR-7** [ACCEPTED-LIMIT: a user decision, not a behaviour; the user answered AskUserQuestion "Lignes dans vehicles.md" on 2026-11-02 in the orchestrating chat, and no test can pin who decided]: each of the nine ids gets a row in `vehicles.md`, rather than the id being dropped from the title (Assumption 8).

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `TC-1215` and `TC-V01`..`TC-V08` are declared by no spec today (other specs may quote them in prose, e.g. the alias lot) | Low | SHOW — `grep -rnE "^\| \*{0,2}TC-(1215\|V0[1-8])\b" docs/specs` → no match (row heads only) | TC-VEHOI-U-01 |
| 2 | `TC-508` is a row head of `05_cards.md` (line 280 today), the `F-CARD-07` row (line 33 today) lists `sci-fi-vehicles.test.ts :: TC-508`, and `TC-VEHICLES-U-1201`..`1214` are row heads of `vehicles.md` (lines 651-664 today) | Low | SHOW — grep of the row heads and of the feature row | TC-VEHOI-U-01 |
| 3 | The nine tests assert what the rows of FR-2 say | Medium | SHOW — read at `sci-fi-vehicles.test.ts:187`, `:369`, `:408`, `:425`, `:438`, `:445`, `:462`, `:479`, `:496` (the `TC-V01` test checks twelve `include`s over twelve configured fields; the toast tests read `sf-toast`'s `addMessage` after a `button-click` on the `mdi:play` or `mdi:stop` button) | TC-VEHOI-U-05 |
| 4 | `ids-cas-uniques` accepts `TC-VEHICLES-U-1215`..`1223` as declared in `vehicles.md` and cited by a title | Low | SHOW — `grep -nE "^\| TC-VEHICLES-U-(1201\|1214) " docs/specs/cards/vehicles.md` → `651:\| TC-VEHICLES-U-1201 \|`, `664:\| TC-VEHICLES-U-1214 \|`: the derived prefix `VEHICLES` is the one already carried | IT-VEHOI-I-02 |
| 5 | Renaming a title changes no behaviour | Medium | SHOW — `grep -nE "it\('TC-(V0\|1215)" tests/cards/vehicles/sci-fi-vehicles.test.ts` → lines 187, 369, 408, 425, 438, 445, 462, 479, 496: each is the first-argument string of an `it(` call, the only thing that changes | IT-VEHOI-I-01 |
| 6 | The old ids left in the header comment and the `// ── TC-V0n` section comments are harmless residue: they are not title citations and `78y.8` reads titles only | Low | SHOW — `grep -nE "TC-(V0\|1215\|508)" sci-fi-vehicles.test.ts \| grep -v "it('"` → lines 5, 185, 367, 406, 423, 436, 443, 460, 477, 494, all comments, none an `it(` title; accepted by the user's "title only" scope | none (limit accepted) |
| 7 | The guard's row-head matcher counts a ⬜ head as declared; a title citing such a head is still refused by the two-way check of `ids-cas-uniques` | Low | SHOW — the nine new rows are written ✅, not ⬜ (`git diff --stat` → `docs/specs/cards/vehicles.md \| 13 +++++++++++--`), so a ⬜ head is not cited by any title | IT-VEHOI-I-02 |
| 8 | The user's decision to add a row to `vehicles.md` for each of the nine ids (rather than drop the ids) stands | Low | SHOW — `git diff --stat` on this branch → `docs/specs/cards/vehicles.md \| 13 +++++++++++--`: the rows were added after the user's answer to "Lignes dans vehicles.md", 2026-11-02 | none (decision recorded) |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | Declaring `TC-1215` or `TC-V0n` as they are | Rename to `TC-VEHICLES-U-<n>`: a bare `TC-NNN` is the numbered-spec family, and `TC-V0n` carries no card prefix |
| 2 | Dropping `TC-508` from the `TC-V01` title | `05_cards.md` declares it for vehicles and `F-CARD-07` cites it; leave it |
| 3 | Editing test bodies or comments while renaming | Touch the title string only |
| 4 | Putting the lot's guard under `tests/specs/` | Keep it under `tests/cards/vehicles/`: `ids-cas-uniques` ignores `tests/specs/` when it looks for citations |
| 5 | Marking the new rows ⬜ | They are played by the tests that cite them; ⬜ would fail the two-way check of `ids-cas-uniques` and not count as FR coverage |
| 6 | Counting every row head of `05_cards.md` as declared for vehicles | Only the ids that `F-CARD-07` lists for this file count |
| 7 | Naming the lot's own ids `TC-VOI-U-*` | `VOI` is the vacuum lot's prefix and `ids-cas-uniques` refuses a duplicate declaration; use `VEHOI` |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-VEHOI-U-01 | Every id cited by a title of `sci-fi-vehicles.test.ts` is in the declared set (row heads of `vehicles.md`, with or without `**`, plus the ids of the `F-CARD-07` row for this file); both parts are non-empty | FR-1 | The orphan list is empty (`toEqual([])`: a failure prints the orphan ids) |
| TC-VEHOI-U-02 | The orphan detector returns the ghost id for a fixture title in `it(`, `test(`, `it.concurrent(` and `it.each([f(1)])(` form against an empty declared set, and returns nothing when the set declares it; the ghost id is built from fragments | FR-1 | Orphan reported for the four forms, then none |
| TC-VEHOI-U-03 | `TC-VEHICLES-U-1215`..`1223` are each a row head of `vehicles.md` exactly once; the nine new titles are present (exact extracted title starts) and the nine old ones absent | FR-2, FR-3 | Nine single heads (`toEqual` on the array of heads, a failure prints it); nine new found, nine old absent |
| TC-VEHOI-U-04 | No title matches the retired-id pattern `\bTC-(?:1215\|V\d{2})\b` (built from fragments); a fixture title citing a built `TC-V99`-shaped token is matched by the same pattern, and so is a fixture citing `TC-1215` | FR-4 | None in the file; the fixtures are detected |
| TC-VEHOI-U-05 | Each of the nine rows names its anchor tokens after stripping backticks: 1215 `vehicleStyles` and `cssText`; 1216 `getRelevantEntities` and `charging_remaining_time`; 1217 `battery_level` and `fuel_quantity`; 1218 `getRelevantEntities` and `empty`; 1219 `getCardSize` and `returns 5`; 1220 `mdi:play` and `addMessage`; 1221 `AC failure` and `true`; 1222 `mdi:stop` and `addMessage`; 1223 `getCardSize`, `returns 3` and `setConfig`; no row matches `\blines? \d` | FR-2 | All tokens found, no line mention |
| TC-VEHOI-U-06 | Neither `sci-fi-vehicles.test.ts` nor the guard file itself matches the ban pattern of FR-4 (`skip`, `skipIf`, `todo`, `only`, `runIf`, `fails` on `it`, `test` or `describe`); fixtures built from fragments for `skip`, `skipIf`, `runIf` and `fails` are each detected | FR-4 | None in either file; the four fixtures detected |
| TC-VEHOI-U-07 | Against the real specs, a fixture title citing a non-vehicles `05_cards.md` head (`TC-501`) returns it as orphan, and a fixture title citing `TC-508` returns nothing; the `F-VEH-D06` row of `vehicles.md` cites `TC-VEHICLES-U-1215` and not the bare id; the two fixture heads (`TC-501`, `TC-508`) are first checked present in the real `05_cards.md` | FR-1, FR-2 | Only the ids of the `F-CARD-07` row pass; D06 cites the new id |
| TC-VEHOI-U-08 | In the table order of `vehicles.md`, the row heads from `TC-VEHICLES-U-1214` read `1214, 1215, ..., 1223` with no head between; none of the nine rows carries ⬜; the note under the Test Case Specifications title contains `vingt-six` and not `dix-sept` | FR-2 | Sequence equal; no ⬜ on the nine; note counts twenty-six |
| IT-VEHOI-I-01 ⬜ | `git diff --unified=0 <base> -- tests/cards/vehicles/sci-fi-vehicles.test.ts`, where `<base>` is `git merge-base HEAD main`; for each of the nine `-` lines, the matching `+` line equals it once its old id token is replaced by the new one of the FR-3 table | FR-3 | Nine `-` and nine `+` content lines (headers excluded), each an `it(` title line, each `+` equal to its `-` with only the id swapped |
| IT-VEHOI-I-02 ⬜ | Repo spec guards on the whole repo | FR-1, FR-2 | `tests/specs/ids-cas-uniques.test.ts` and `blueprint-traceability.test.ts` green |
| IT-VEHOI-I-03 ⬜ | Full vitest run | FR-1..FR-4 | All suites green |

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** Les trois `IT-VEHOI-I-*` sont joués par une commande au VERIFY, pas par un test qui cite l'id.

## Builder Calls

Answers to a cold builder's questions. Calls marked *mine* are the author's, not agreed with anyone.

- Guard: one file `tests/cards/vehicles/vehicles-ids-declared.test.ts`, shape of `tests/cards/weather/weather-ids-declared.test.ts` (reads files with `fs` from `process.cwd()`, local pure functions, fixtures inline). Reuse its `TITLE_RE`, `ID`, `titlesOf`, `citedIds`, `orphans`, `cardIds` and widen its `SKIP_RE` to the ban pattern of FR-4; `headsOf` must differ from the precedent (it accepts `**` and the trailing ⬜, see below) and so must the ghost id (`['TC','GHOST','U','99'].join('-')`, the weather one is another). Change the file names, the feature row (`| F-CARD-07 |`) and the test-file marker (`sci-fi-vehicles.test.ts ::`). The test file name in the marker is the vehicles one, not the editor's (*mine*). It never spells an `IT-VEHOI-I-*` id, in a title or a comment: those rows carry ⬜ and `ids-cas-uniques` would see them cited.
- The declared set is the row heads of `vehicles.md` plus the `F-CARD-07` ids (cut at the first ` · `, ` — ` or ` |` after the marker), each of which must also be a row head of `05_cards.md`. The row-head matcher accepts `**` around the id and a trailing ` ⬜` before the closing pipe (the existing `IT-VEHICLES-I-1203 ⬜` shows the form); it must therefore not require `\s*\|` straight after the id (*mine*: allow `(?:\s*⬜)?`).
- Old ids in the guard (TC-VEHOI-U-03, -04) are built from fragments (`['TC','1215'].join('-')`, `` `TC-V0${n}` ``) so that the guard does not spell an undeclared bare id; the ghost id of TC-VEHOI-U-02 is `['TC','GHOST','U','99'].join('-')` (*mine*). New ids may be spelled in full: they are declared.
- `TC-VEHOI-U-01..08` are eight separate `it` blocks, each citing its id in the title.
- The nine rows go in `vehicles.md` in the five columns of its table (`Test ID`, `Type`, `Description`, `Input`, `Expected Output`), `Type` = `Unit`, in English, identifiers in backticks. Example for 1221 (*mine*): `| TC-VEHICLES-U-1221 | Unit | Start AC failure shows the error toast | mounted card, `callService` rejects `Error('AC failure')`, click on the `mdi:play` button | the toast `addMessage` is called with `'AC failure'` and `true` |`.
- The builder edits the nine titles with the Edit tool on the exact old title text, one call per title; the `async () =>` and bodies stay untouched.
- The nine rows, the `F-VEH-D06` Covers cell and the `vingt-six` note are already written in `vehicles.md` at SPEC; the builder verifies them and does not rewrite them. Until the nine titles are renamed, `ids-cas-uniques` reports the rows uncited: expected, it goes green at BUILD. The rows carry no ⬜: their test cites them.
- `TC-508` stays: `ids-cas-uniques` and `blueprint-traceability` O1 would break otherwise (see Overview).

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| A title cites an undeclared id | `toEqual([])` fails; the diff prints the orphan ids | Drop the id or declare it | vitest output |
| A new row head is missing or doubled | `toEqual` on the heads array fails; the diff prints the heads found (so the id and its count) | Fix the row | vitest output |
| A retired bare id is cited again | The empty-list assertion fails; the diff prints the offending titles | Use the prefixed id | vitest output |
| A declared set reads empty | A `length > 0` assertion fails | Fix the row-head pattern | vitest output |
| The guard spells an `IT-VEHOI-I-*` id | `ids-cas-uniques` fails on a stale ⬜ | Remove the mention | vitest output |

## References

[Vehicles card spec](../cards/vehicles.md), [cards spec](../05_cards.md), [ids guard](../../../tests/specs/ids-cas-uniques.test.ts), [traceability guard](../../../tests/specs/blueprint-traceability.test.ts), [weather precedent](../weather-orphan-ids/spec.md), [alias precedent](../alias-orphan-ids/spec.md), bead `78y.8` for the repo-wide guard.
