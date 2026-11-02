---
spec: docs/specs/water-spec-arbitration/spec.md
sources:
  - docs/specs/cards/water.md
  - docs/specs/cards/water_history.md
  - src/cards/water/sci-fi-water-management.ts
  - src/cards/water/styles.ts
  - tests/cards/water/sci-fi-water-management.test.ts
  - tests/specs/ids-cas-uniques.test.ts
---

# Water specs arbitration — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-enr` (blocks `78y.7`). `docs/specs/cards/water.md` and `docs/specs/cards/water_history.md` described the same card and contradicted each other on its central behaviour. The user decided (chat, 2026-11-02): **`water.md` is the reference, the code follows it, `water_history.md` is aligned on `water.md` and on what the code really does.** This lot is docs-only: it edits `water_history.md` (kept as `# Spec 16`, b8g merged), files beads and adds one guard test file; it touches no source and no existing test.

| Subject | `water.md` and code | `water_history.md` before | After this lot |
|---|---|---|---|
| Endpoint | `history/history_during_period`, fallback `logbook/get_events` | `logbook/get_events` only | aligned on `water.md` |
| Window | 7 days (`sci-fi-water-management.ts:164`) | 24 hours | 7 days (bead `ha-sci-fi-o5p`) |
| Trigger | once per floor load, sync button; `expanded` forbidden (AP "Fetch on accordion open", "Global expanded state") | only when the accordion is expanded | floor load and sync button; the code's dormant `expanded` trigger is a Known Gap (D21) |
| Log scope | a filtered log in every accordion (F-WATER-05) | Automations accordion only | every accordion |
| Offline | logbook fallback, empty log if both fail | `[ OFFLINE ]` + cached data | `water.md` behaviour. The spec **withdraws** the offline/cache requirement; bead `1k7` stays open as a product decision (D12), not as a defect against a spec |
| Filters | `all` and `alerts` | IT-003 asked a third "Warning" filter | two filters (D16) |
| Alert definition | `binary_sensor` and `sensor` moisture `on` | `binary_sensor` only | both, with the note that the `sensor` clause cannot fire on a numeric sensor |

Known code defects are not hidden by rewriting requirements: `water_history.md § Known Gaps` lists D01, D07, D12, D14, D15, D20, D21, D22, D23, D24 with one bead each (`ha-sci-fi-9vv`, `-rd4`, `-1k7`, `-78y.7`, `-ijw`, `-ln3`, `-xrc`, `-5aw`, `-p5a`, `-7kb`). D16 is resolved by the alignment. The shared ids: the ids that tests cite (`TC-1201`..`1205`, `IT-1201`..`1205`, `TC-W01`..`W15`) are **not renumbered**; `water.md` already cites them in its `Covers` cells and `water_history.md` keeps citing the subset it needs in its Blueprint Coverage. Declaring the 40 undeclared titles is lot `78y.7` (the bead lists 25 distinct ids behind those 40 titles; counts are the bead's, not this lot's). The beads `o5p` (window) and `enr` (this arbitration) close with the lot; `1k7` and the Known Gap beads stay open.

## Requirements

- **FR-1**: `water_history.md` states one window, 7 days, in each place that names it: the `F-WATER-HIST-03` Blueprint row, the `start_time` bullet of § 1, the Log Retention bullet, and the row IT-WATER-HISTORY-I-001; none of those places, nor § 1, nor the I-001 and I-002 rows, names a one-day window in any spelling (`24 hours`, `24-hour`, `24h`, `24 h`, `24 heures`, `1 day`, `un jour`).
- **FR-2**: `water_history.md` names `history/history_during_period` as the primary endpoint and `logbook/get_events` as the fallback in the `F-WATER-HIST-03` row, Assumption 1, the External Invocations row and the first bullet of § 1; the row IT-WATER-HISTORY-I-001 expects the recorder call first and the logbook call on rejection, and the row I-002 expects a history fetch (recorder first, logbook on rejection); the Empty State Guard forbids calling any history API, not the logbook alone.
- **FR-3**: `water_history.md` states the trigger as `water.md` requires: one fetch per floor load (`_activeFloorId` or `entityIds` changes) and on the sync button; `expanded` is not a trigger anywhere (no `` `expanded` `` outside `## Known Gaps`, not in the Public Interface, not in the row TC-WATER-HISTORY-U-002); Anti-Pattern 1 cites `water.md` AP "Fetch on accordion open". The code's `expanded` property and its two branches are Known Gap D21.
- **FR-4**: `water_history.md` has a `## Known Gaps` section with one row each for D01, D07, D12, D14, D15, D20, D21, D22, D23, D24, each naming a bead id (shape `ha-sci-fi-<id>`; existence is checked by `bd show` at VERIFY, not by the guard). The D12 row says in plain words that the spec withdraws the offline/cache requirement and that bead `1k7` stays open; the phrase "spec not bent" appears nowhere. Each code line a row cites (D07 `:452`, D12 `:146`, D14 `:323`, D15 `:283`, D20 `:515 :570 :610 :625`, D21 `:41 :55 :118-122`, D22 `:251 :374`, D23 `:159`, D24 `:141`) holds the construct the row names in `src/cards/water/sci-fi-water-management.ts`. The offline row of the Error Handling Matrix promises no cache, no `[ OFFLINE ]` header, and names the missing timeout and the water.md "retry in 5s".
- **FR-5**: `water_history.md` has no third "Warning" filter (the row IT-WATER-HISTORY-I-003 names `alerts` and `all` and says there is no third filter), and keeps the title `# Spec 16`.
- **FR-6**: The repo spec guards stay green, unedited: the six files of `tests/specs/` (`blueprint-traceability`, `bridge-spec-structure`, `delivered-design`, `ids-cas-uniques`, `socle-contract`, `transverse-registries`; the `.md` file of that directory is not a test) and `tests/docs/spec-numbering.test.ts`.
- **FR-7** [ACCEPTED-LIMIT: user decision of 2026-11-02 in chat, no test can pin who decided]: `water.md` is the reference and the code is not changed by this lot.
- **FR-8**: `water_history.md` puts the log in every accordion (Automations and each device), filtered to that accordion's entities, as `water.md` F-WATER-05 and the code do: the `> Covers:` line and the `F-WATER-HIST-01` row say `every accordion` and none says the log lives inside the Automations accordion alone.
- **FR-9**: The Error Handling Matrix says what the code does: the malformed-events row names Known Gap D22 and the `toUpperCase` throw; the offline row names the absent timeout and the unreconciled `retry in 5s`.
- **FR-10**: `water_history.md` states the costs and limits the review found instead of hiding them: the Log Retention bullet says memory and CPU are `not bounded` by the 50 (full response held, re-filtered per accordion at each render; accepted); the Alert Definition says the `sensor` clause needs a `non-numeric` sensor; the first bullet of § 1 names `input_boolean` and D24; the Concurrency bullet names D23.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | The code fetches 7 days via `history/history_during_period` with a logbook fallback | Low | SHOW — `sci-fi-water-management.ts:144-195` | TC-WSA-U-01 |
| 2 | Nothing in `src/` sets `expanded`, so the code's `expanded` branches are dormant and the floor-load fetch fires in normal use | Medium | SHOW — `updated()` at `:113-126`; `grep -rn "\.expanded" src/` finds no assignment | TC-WSA-U-03 |
| 3 | The 10 beads of `§ Known Gaps` exist and are open | Low | SHOW — `bd show ha-sci-fi-9vv ha-sci-fi-rd4 ha-sci-fi-1k7 ha-sci-fi-78y.7 ha-sci-fi-ijw ha-sci-fi-ln3 ha-sci-fi-xrc ha-sci-fi-5aw ha-sci-fi-p5a ha-sci-fi-7kb` | TC-WSA-U-04 (shape) and `bd show` at VERIFY (existence) |
| 4 | The rows of `water_history.md` keep their ⬜ marker and are cited by no test, so `ids-cas-uniques` stays green; the `TC-WSA`/`IT-WSA` rows are cited by the guard and carry no ⬜ | Low | SHOW — the guard spells the old ids from fragments | IT-WSA-I-01 |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | Rewriting a requirement to match a code defect (D01, D07, D15, D20..D24) | State the intent, list the defect in Known Gaps with its bead |
| 2 | Renumbering the ids that tests cite | Leave them; `78y.7` declares them |
| 3 | Putting the guard under `tests/specs/` | `tests/cards/water/`: `ids-cas-uniques` leaves `tests/specs/` out of the citation search, so the guard's own `TC-WSA`/`IT-WSA` citations would not count and those rows would need a ⬜ |
| 4 | Editing `src/` to remove a gap in this lot | One bead each, a later fix lot |
| 5 | Spelling an `IT-WATER-HISTORY-*` / `TC-WATER-HISTORY-*` id as a literal in the guard | Build it from fragments (`['IT','WATER','HISTORY','I','001'].join('-')`): a literal under `tests/cards/water/` is a citation from outside `cards/water_history/` (`malPlace`) and turns a ⬜ row into a "marked but played" mismatch |
| 6 | A phrase check over the whole file | Anchor each check to its row (by id or feature id) or its section (by heading); a file-wide match is satisfied by an unrelated line |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-WSA-U-01 | In the `F-WATER-HIST-03` row, the `start_time` bullet of § 1, the Log Retention bullet and the row I-001, the text matches `7 days` or `7-day`; the F-WATER-HIST-03 row, § 1 and the rows I-001 and I-002 match none of `\b24\s*-?\s*(h\|hr\|hrs\|hour\|hours\|heure\|heures)\b`, `\b(1\|one\|un)\s+(day\|jour)\b` | FR-1 | Each of the four places mentions 7 days; no zone names a one-day window |
| TC-WSA-U-02 | The `F-WATER-HIST-03` row, Assumption 1, the External Invocations row and the first bullet of § 1 each contain `history/history_during_period` and `logbook/get_events`; in the row I-001 the recorder name comes before the logbook name; the row I-002 contains `recorder first`; the Empty State Guard bullet contains `neither` and `history/history_during_period` | FR-2 | All found; order recorder before logbook |
| TC-WSA-U-03 | The § 1 trigger bullet (the one starting `All logs`) contains `single query per floor load` and `sync button`; no `` `expanded` `` appears outside `## Known Gaps`, and the trigger bullet contains no word starting `expand` (backticked or not, any case) and no `when the accordion` / `when an accordion` clause; the row U-002 contains `_activeFloorId`; Anti-Pattern 1 contains `water.md` and `Fetch on accordion open` | FR-3 | Trigger stated; `expanded` absent outside Known Gaps |
| TC-WSA-U-04 | `## Known Gaps` has rows for D01, D07, D12, D14, D15, D20, D21, D22, D23, D24, each with a bead id of the shape `ha-sci-fi-<id>`; the D12 row contains `withdraws` and `stays open`; `spec not bent` appears nowhere in the file; the offline row of the Error Handling Matrix contains neither `display cached` nor `dim orange` and contains `no cached data`; every line number a Known Gaps row cites holds the named construct in the source file (`floors.filter` at `:452`, `_historyLogs` at `:283`, `style=` at each D20 line, `expanded` at D21 `:41` `:55` and within `:118-122`, `toUpperCase` at `:374`, `_rawLogs` at D12 `:146`, `${dd}/${mo}` at D14 `:323`, `_queryLogbook` at D22 `:251`, `_fetchId` at D23 `:159`, `input_boolean` at D24 `:141`) | FR-4 | Ten rows with beads; D12 honest; no promised cache; cited lines real |
| TC-WSA-U-05 | The file's first `#` heading starts with `Spec 16`; the row I-003 contains `alerts` and `no third (Warning) filter`, and no other `Warning` once that phrase is removed | FR-5 | Heading ok; no third filter |
| TC-WSA-U-06 | The `> Covers:` line and the `F-WATER-HIST-01` row each contain `every accordion` and neither contains `inside the Automations accordion`; the `> Covers:` line contains `F-WATER-05` | FR-8 | Scope matches water.md |
| TC-WSA-U-07 | The malformed-events row of the Error Handling Matrix contains `D22` and `toUpperCase`; the offline row contains `timeout` and `retry in 5s` | FR-9 | Matrix states the code |
| TC-WSA-U-08 | The Log Retention bullet contains `not bounded`; the Alert Definition bullet contains `non-numeric`; the first bullet of § 1 contains `input_boolean` and `D24`; the Concurrency bullet contains `D23` | FR-10 | Costs and limits stated |
| IT-WSA-I-01 | The guard runs `npx vitest run tests/specs tests/docs/spec-numbering.test.ts` as a child process (explicit timeout, output kept in the failure message) | FR-6 | Exit code 0: the six guards of `tests/specs/` and `spec-numbering` green |
| IT-WSA-I-02 | Played once at VERIFY with `WSA_PROVE_LOT=1` (a permanent check would redden every later fix lot that edits `src/`); the guard asserts `git status --porcelain -- src` is empty, and, when `main` resolves, that `git diff --name-only main...HEAD -- src` is empty | FR-7 | No source touched (the branch half is skipped only when `main` does not resolve, and says so) |
| IT-WSA-I-03 | Live half played once at VERIFY with `WSA_PROVE_LOT=1`, classifier cases always on; the guard asserts `git status --porcelain -- tests/cards/water` lists no modified or deleted tracked file and no untracked file other than `tests/cards/water/water-history-aligned.test.ts`; the tracked water tests are not edited | FR-6, FR-7 | Only the guard is new under `tests/cards/water/` |

All rows are played by `tests/cards/water/water-history-aligned.test.ts` at BUILD (unit rows by reading the docs with `fs`, resolved from the file's own location as `tests/docs/spec-numbering.test.ts` does; integration rows by child processes). The guard cites every `TC-WSA-*` and `IT-WSA-*` id above literally in an `it()` title, so none of them carries a ⬜. Zone extraction, fixed so the builder does not guess: a table row is the line whose first cell starts with the id (or feature id) or, for the Error Handling Matrix, with `**HA API timeout` (offline row) / `**API returns malformed` (malformed row), searched only inside that table's section; a section is the text from a heading line that STARTS WITH the given heading (`## Known Gaps`, `## Error Handling Matrix`, `### 1.`) to the next heading of the same or higher level; a bullet is its `- ` line plus the following more-indented lines up to the next bullet of equal indent (so the Log Retention bullet includes its child line). A bead id matches `ha-sci-fi-[0-9a-z]+(\.[0-9]+)?` (the D14 bead `78y.7` is the lot that declares the ids, accepted as its gap bead). IT-WSA-I-01 uses a 240000 ms timeout both on the child process (`cwd` the repo root, stdout and stderr merged into the failure message) and on the `it()`. `main` resolves when `git rev-parse --verify main` exits 0. IT-WSA-I-03 reads `git status --porcelain -- tests/cards/water` and accepts the guard file as `??` or `A `/`AM`, nothing else. Each extraction asserts its zone is non-empty before the phrase checks run. The `water_history.md` row ids it needs are built from fragments (Anti-Pattern 5).

**Builder rulings** (agent's call unless marked answered). Answered: `water_history.md` is already rewritten by this lot's SPEC stage with every section and row id the zones name, so the guard is written against it and is green on its first run; a missing zone is a test failure, never a skip. The guard proves it can fail by a mutation at BUILD (apply in memory a mutant to the text read from `water_history.md`, e.g. `7 days` becomes `24 hours`, `single query per floor load` is deleted, a `` `expanded` `` is appended to the trigger bullet, and run the same zone checks on it: each must fail; no git history involved). The Known Gaps bead issues exist already (filed at SPEC); a missing one at VERIFY blocks the lot. `main...HEAD` is a merge-base diff, so an advanced `main` does not redden IT-WSA-I-02. Agent's call: the `Warning` check of TC-WSA-U-05 is scoped to the I-003 row; the `expanded` ban of TC-WSA-U-03 targets the backticked token outside Known Gaps and, on the trigger bullet alone, any word starting `expand` and any `when the/an accordion` clause, and `## Known Gaps` runs to the next `##` heading; line citations of TC-WSA-U-04 are 1-indexed, exact, and `style=` is a case-sensitive substring; tables are standard markdown pipe tables and indentation is counted in leading spaces; closing the beads `o5p` and `enr` is a manual HARDEN step, not tested.

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| A guard assertion fails | vitest prints the zone and the missing phrase | Fix `water_history.md` | vitest output |
| A Known Gaps bead id does not exist | TC-WSA-U-04 only checks the id shape; `bd show` at VERIFY | File the bead | vitest output, `bd show` |
| A guard of `tests/specs/` goes red | IT-WSA-I-01 fails with the child's output; revert the offending edit of `water_history.md` | Re-edit | vitest output |
| `main` does not resolve (shallow clone) | IT-WSA-I-02 skips its branch half and states it; the working-tree half still runs | None | vitest output |

## References

[water_history.md](../cards/water_history.md), [water.md](../cards/water.md), [ids guard](../../../tests/specs/ids-cas-uniques.test.ts), [vehicles precedent](../vehicles-orphan-ids/spec.md), beads `ha-sci-fi-enr`, `ha-sci-fi-78y.7`, `ha-sci-fi-o5p`.
