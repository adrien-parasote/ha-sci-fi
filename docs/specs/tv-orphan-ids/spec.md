---
spec: docs/specs/tv-orphan-ids/spec.md
sources:
  - docs/specs/cards/tv.md
  - tests/cards/tv/sci-fi-tv.test.ts
  - tests/cards/tv/sci-fi-tv-editor.test.ts
  - tests/specs/ids-cas-uniques.test.ts
---

# TV test ids declared by the TV spec — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-78y.1`, child of `78y`; the repo-wide guard is `78y.8`. The TV test files cite 30 test-case ids (`TC-716..738` plus seven letter variants) that `docs/specs/cards/tv.md` never declares. Each one tests real behaviour, so the spec gains a row per case, written from what the test asserts, and the test titles take the spec's `TC-TV-U-<n>` id. No product code changes. A small guard lives in `tests/cards/tv/tv-ids-declared.test.ts` and holds this lot's invariant until `78y.8` generalises it. See [the TV card spec](../cards/tv.md#test-cases).

## Requirements

- **FR-1**: Every id cited in an `it(...)` title of `tests/cards/tv/sci-fi-tv.test.ts` and `sci-fi-tv-editor.test.ts` is declared as a row head in the Test Cases table of `docs/specs/cards/tv.md`. The guard `tests/cards/tv/tv-ids-declared.test.ts` enforces it, and fails on a fixture string that cites an undeclared id.
- **FR-2**: Each of the 30 orphan cases has a row in `tv.md` (type, description, input, expected) written from the assertions of its test body. The 23 base ids keep their number; the seven variants take the numbers below. Whether a row says what its test asserts is a reading task, done by the VERIFY code review, not by a test.

  | Old title id | New id | Old title id | New id |
  |---|---|---|---|
  | ~~TC-718b~~ | TC-TV-U-739 | TC-725b | TC-TV-U-743 |
  | ~~TC-724b~~ | TC-TV-U-740 | TC-725c | TC-TV-U-744 |
  | ~~TC-724c~~ | TC-TV-U-741 | TC-726b | TC-TV-U-745 |
  | ~~TC-724d~~ | TC-TV-U-742 | | |

- **FR-3**: No `it(...)` title in the two TV test files keeps an unprefixed `TC-7xx` id, and none uses `skip`, `todo` or `only`.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `TC-TV-U-716..745` are all free in `tv.md` | Low | SHOW — ran `grep -cE "TC-TV-U-7(1[6-9]\|[2-4][0-9])" docs/specs/cards/tv.md` → `0` | run again before editing |
| 2 | No tv test is skipped today, so FR-3's ban on skip/todo/only starts from a clean base | Low | SHOW — ran `grep -cE "(it\|describe)\.(skip\|todo\|only)"` on both tv test files → `0` and `0` | guard TC-TVO-U-05 |
| 3 | `ids-cas-uniques` checks the prefix only for `docs/specs/cards/*` and `MASTER`; this spec's ids are still declared by `docs/**/*.md` and must be cited by a test outside `tests/specs/` | Medium | SHOW — ran `grep -nE "soumisAuPrefixe\|function porteurs" tests/specs/ids-cas-uniques.test.ts` → lines 85, 128, 202, 246 | IT-TVO-I-02 |
| 4 | Renaming a title changes no behaviour | Medium | TELL — only the `it()` string and its comment line change | the diff of `tests/cards/tv/` shows only title and comment lines (IT-TVO-I-01) | the guard cites `TC-TVO-U-01..05`; `IT-TVO-I-*` carry the unplayed mark |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | Citing a test as `TC-TV-U-n` with no spec row | Add the row first |
| 2 | Writing the row description from the title only | Read the assertion in the test body |
| 3 | Editing test bodies while renaming | Touch the title and its comment line only |
| 4 | Putting the lot's guard under `tests/specs/` | Keep it under `tests/cards/tv/`, where its citations count |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-TVO-U-01 | Every id cited by a tv test title is declared in tv.md | FR-1 | Guard finds no orphan |
| TC-TVO-U-02 | The guard rejects a fixture title citing an undeclared id | FR-1 | The check returns that id as orphan |
| TC-TVO-U-03 | The 30 ids (716..738 and 739..745) are each a row head in tv.md, none twice | FR-2 | Each found exactly once |
| TC-TVO-U-04 | No tv test title carries an unprefixed `TC-7xx` | FR-3 | No match |
| TC-TVO-U-05 | No tv test uses `it.skip`, `it.todo` or `it.only` | FR-3 | No match |
| IT-TVO-I-01 ⬜ | The diff of `tests/cards/tv/` against base holds only title and comment lines, plus the new guard file | FR-2, FR-3 | No assertion line added or removed |
| IT-TVO-I-02 ⬜ | Repo spec guard on the whole repo | FR-2 | `tests/specs/ids-cas-uniques.test.ts` green |
| IT-TVO-I-03 ⬜ | Full vitest run | FR-1, FR-3 | All suites green |

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** Les trois `IT-TVO-I-*` sont joués par une commande au VERIFY, pas par un test qui cite l'id.

## Builder Calls

Answers to a cold builder's questions. Calls marked *mine* are the author's, not agreed with anyone.

- Row bodies: the builder reads the two tv test files for the 30 titles and their assertions (*mine*). All of 716..738 are orphans: `tv.md` stops at 715 and the old ids appear only in the test titles.
- Old title form is `TC-7xx: ...` and its comment line `// TC-7xx: ...` or `// ── TC-7xx: ...`; both take the new id, nothing else changes.
- Placement: new TC rows go after `TC-TV-U-715` in numeric order (716..738, then 739..745), before the `IT-TV-I-*` rows (*mine*). Rows are written in English like their neighbours.
- None of the 30 rows carries ⬜ (a test cites each). The note above the table counts "dix-neuf lignes" and must become "quarante-neuf lignes", the five unplayed ones unchanged.
- Guard: one file `tests/cards/tv/tv-ids-declared.test.ts`, reads the two test files and `docs/specs/cards/tv.md` with `fs` from the repo root (`process.cwd()`), holds the check as a local pure function, and tests it on an inline fixture string (*mine*). A row head is `| **TC-TV-U-<n>**` with an optional ⬜; a cited id is any `TC-…` or `IT-…` token inside an `it(` title.
- `TC-TVO-U-01..05` are five separate `it` blocks in that guard, each citing its id in the title.

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| A test still cites an undeclared id | Guard fails naming the id | Add the row, or drop the id from the title | vitest output |
| A new row clashes with an existing id | `ids-cas-uniques` fails | Pick the next free number in `tv.md`; never reuse an existing one | vitest output |

## References

[TV card spec](../cards/tv.md), [ids guard](../../../tests/specs/ids-cas-uniques.test.ts), bead `78y.8` for the repo-wide guard.
