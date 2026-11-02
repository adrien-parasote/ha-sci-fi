---
spec: docs/specs/vacuum-orphan-ids/spec.md
sources:
  - docs/specs/cards/vacuum.md
  - tests/cards/vacuum/sci-fi-vacuum.test.ts
  - tests/cards/vacuum/sci-fi-vacuum-editor.test.ts
  - src/cards/plugs/sci-fi-plugs.ts
  - tests/specs/ids-cas-uniques.test.ts
---

# Vacuum test ids declared by the vacuum spec — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-78y.2`, child of `78y`; the repo-wide guard is `78y.8`. Two vacuum test files cite eleven ids that `docs/specs/cards/vacuum.md` never declares: `TC-VE01..06` and `TC-1016` in the editor test, `TC-1528..1530` and `TC-506` in the card test. Nine of them test real behaviour and get a row; `TC-1528` (alias of `TC-VACUUM-U-1524`) and `TC-506` (second id on a test already titled `TC-VACUUM-U-1518`) lose their id. The new rows are `TC-VACUUM-U-1528..1536`: the number 1527 is skipped because the `vacuum.md` note retires the 1525/1526/1527 series. `src/cards/plugs/sci-fi-plugs.ts` cites `TC-1530` in a comment and must cite the new id, and the retiring note in `vacuum.md` must point at the new ids. No behaviour changes. A small guard lives in `tests/cards/vacuum/vacuum-ids-declared.test.ts` and holds this lot's invariant until `78y.8` generalises it. See [the vacuum card spec](../cards/vacuum.md#test-cases).

## Requirements

- **FR-1**: Every id cited in a test title (`it(`, `test(`, `it.each(`) of `tests/cards/vacuum/sci-fi-vacuum.test.ts` and `sci-fi-vacuum-editor.test.ts` is declared as a row head in the Test Cases table of `docs/specs/cards/vacuum.md`, and starts with `TC-VACUUM-U-` or `IT-VACUUM-I-`. The guard `tests/cards/vacuum/vacuum-ids-declared.test.ts` enforces it, fails on a fixture that cites an undeclared id, and fails when the declared set is empty. When `78y.8` ships, it absorbs this guard or retires it.
- **FR-2**: Nine cases have a row in `vacuum.md` (type `Unit`, description, input, expected) written from the assertions of their test body, and their titles take the new id:

  | Old title id | New id |
  |---|---|
  | ~~TC-VE01~~ | TC-VACUUM-U-1528 |
  | ~~TC-VE02~~ | TC-VACUUM-U-1529 |
  | ~~TC-VE03~~ | TC-VACUUM-U-1530 |
  | ~~TC-VE04~~ | TC-VACUUM-U-1531 |
  | ~~TC-VE05~~ | TC-VACUUM-U-1532 |
  | ~~TC-VE06~~ | TC-VACUUM-U-1533 |
  | ~~TC-1529~~ | TC-VACUUM-U-1534 |
  | ~~TC-1530~~ | TC-VACUUM-U-1535 |
  | ~~TC-1016~~ | TC-VACUUM-U-1536 |

  That is nine rows, `TC-VACUUM-U-1528..1536`; `TC-VACUUM-U-1527` is never declared. The row for 1533 (TC-VE06) states its assertion with its condition. Whether a row says what its test asserts is a reading task, done by the VERIFY code review, not by a test.
- **FR-3**: `TC-1528` and `TC-506` lose their ids and keep their words. The `TC-1528` title becomes `_callAction shows error toast on callService rejection (same case as TC-VACUUM-U-1524)`; the `TC-506` title becomes `TC-VACUUM-U-1518 — shortcut sf-button click calls shortcut service`. No title in the two files keeps an unprefixed `TC-15xx`, `TC-VE`, `TC-1016` or `TC-506` id, and none uses `skip`, `todo` or `only`.
- **FR-4**: The comment in `src/cards/plugs/sci-fi-plugs.ts` that cites `TC-1530` cites no test id instead and names the vacuum card's willUpdate reset case in words (agent's call: guard O1 of `ids-cas-uniques` forbids any vacuum id cited outside `tests/specs/` and `cards/vacuum/`). Nothing else in that file changes.
- **FR-5**: The note in `docs/specs/cards/vacuum.md` (around line 839) that says the old malformed-shortcut and willUpdate-reset tests are preserved names them as `TC-VACUUM-U-1534` and `TC-VACUUM-U-1535`, and no longer writes the unprefixed `TC-1528`, `TC-1529` or `TC-1530`. The retired series 1525/1526/1527 is not named in full.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `TC-VACUUM-U-1528..1536` are free in `vacuum.md` and 1527 is retired | Low | SHOW — `grep -c "TC-VACUUM-U-15\(2[7-9]\|3[0-9]\)" docs/specs/cards/vacuum.md` → `0` | run again before editing; TC-VOI-U-03 |
| 2 | No vacuum test is skipped today | Low | SHOW — `grep -cE "(it\|describe)\.(skip\|todo\|only)"` on both test files → `0` and `0` | TC-VOI-U-05 |
| 3 | `TC-506` duplicates `TC-VACUUM-U-1518` (already in its title); the `TC-1528` error-toast test is the same case as spec row `TC-VACUUM-U-1524` (the toast case), while the malformed-service wording belongs to the test titled 1524 | Low | SHOW — `vacuum.md` row 1524 and title at `sci-fi-vacuum.test.ts:304`; corrected after the VERIFY code review | reading task at VERIFY |
| 4 | The only file under `src/` citing an unprefixed id is `sci-fi-plugs.ts` (`TC-1530`) | Medium | SHOW — repo-wide `grep -rn "TC-1530\|TC-1528\|TC-1529\|TC-VE0\|TC-1016\|TC-506" src` → one hit, `sci-fi-plugs.ts:81` (Scope lens re-ran it repo-wide) | TC-VOI-U-06 |
| 5 | Renaming a title or a comment changes no behaviour | Medium | TELL — only `it()` strings, comment lines and the vacuum.md note change | IT-VOI-I-01 |
| 6 | Every title in the two files is a string literal | Medium | TELL — extraction by regex cannot read a title held in a variable | TC-VOI-U-09 flags a non-literal title |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | Citing a test as `TC-VACUUM-U-n` with no spec row | Add the row first |
| 2 | Writing a row description from the title only | Read the assertion in the test body (TC-VE06 and the renamed TC-1528 have weak or conditional assertions: say exactly what they assert) |
| 3 | Editing test bodies while renaming | Touch the title and its comment line only |
| 4 | Putting the lot's guard under `tests/specs/` | Keep it under `tests/cards/vacuum/`, where its citations count |
| 5 | Reusing a retired number for a new row | Skip it: 1527 stays undeclared |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-VOI-U-01 | Every id cited by a vacuum test title is declared in vacuum.md; a row head matches with or without `**` | FR-1 | Guard finds no orphan |
| TC-VOI-U-02 | The guard rejects a fixture title citing an undeclared id | FR-1 | The check returns that id as orphan |
| TC-VOI-U-03 | The nine ids 1528..1536 are each a row head in vacuum.md exactly once, and 1527 is not a row head | FR-2 | Each found once, 1527 absent |
| TC-VOI-U-04 | No vacuum test title carries an unprefixed `TC-15xx`, `TC-VE`, `TC-1016` or `TC-506` id | FR-3 | No match |
| TC-VOI-U-05 | No vacuum test uses `it.skip`, `it.todo` or `it.only` | FR-3 | No match |
| TC-VOI-U-06 | `src/` cites no unprefixed `TC-15xx` id, and `sci-fi-plugs.ts` cites no vacuum id | FR-4 | No id of either form in the file |
| TC-VOI-U-07 | Every id cited in a title starts with `TC-VACUUM-U-` or `IT-VACUUM-I-` | FR-1 | No other prefix found |
| TC-VOI-U-08 | The declared set read from vacuum.md is non-empty and contains `TC-VACUUM-U-1501` | FR-1 | Guard fails on an empty set |
| TC-VOI-U-09 | The extraction reads `test(` and `it.each(` titles, and flags a title that is not a string literal | FR-1 | A fixture with each form yields its id or a flag |
| TC-VOI-U-10 | The vacuum.md note names `TC-VACUUM-U-1534` and `TC-VACUUM-U-1535` and no unprefixed `TC-1528`, `TC-1529`, `TC-1530` | FR-5 | Both found, none of the old |
| IT-VOI-I-01 ⬜ | `git diff --unified=0 <base> -- <the two test files> src/cards/plugs/sci-fi-plugs.ts` shows only changed lines that hold an `it(` title or a `//` comment | FR-2, FR-3, FR-4 | Every `+`/`-` line is a title or a comment; any other line fails |
| IT-VOI-I-02 ⬜ | Repo spec guard on the whole repo | FR-2 | `tests/specs/ids-cas-uniques.test.ts` green |
| IT-VOI-I-03 ⬜ | Full vitest run | FR-1, FR-3 | All suites green |

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** Les trois `IT-VOI-I-*` sont joués par une commande au VERIFY, pas par un test qui cite l'id.

## Builder Calls

Answers to a cold builder's questions. Calls marked *mine* are the author's, not agreed with anyone.

- Row bodies: the builder reads the two vacuum test files for the nine titles and their assertions (*mine*). Old ids appear only in test titles, comments and `sci-fi-plugs.ts:81`.
- Old title forms: `TC-VE0n: ...` with a `// TC-VE0n: ...` comment, `TC-15nn — ...` with a `// ── TC-15nn — ...` comment, and `TC-1016: ...`. All take the new id (or lose it for 1528 and 506), nothing else changes.
- Placement: new rows go after `TC-VACUUM-U-1526` in numeric order (1528..1536), before the `IT-VACUUM-I-*` rows (*mine*). Rows are written in English like their neighbours; type `Unit`.
- The `vacuum.md` note is rewritten per FR-5 (*mine*): it keeps its meaning, names the new ids, and drops the unprefixed ones.
- Blueprint "Covers" cells (found at VERIFY, `tests/specs/blueprint-traceability.test.ts`): `docs/specs/05_cards.md` F-CARD-08 cited `TC-506` and now cites `TC-VACUUM-U-1518`; `docs/specs/10_card_editors.md` F-EDITOR-16 cited `TC-1016` and now cites `TC-VACUUM-U-1536` (agent's call: the rename in this lot broke them).
- None of the nine rows carries ⬜ (a test cites each).
- Guard: one file `tests/cards/vacuum/vacuum-ids-declared.test.ts`, same shape as `tests/cards/tv/tv-ids-declared.test.ts` (reads the two test files, `sci-fi-plugs.ts`, the `src/` tree and `docs/specs/cards/vacuum.md` with `fs` from `process.cwd()`, holds the check as a local pure function, fixtures inline). A row head is `| TC-VACUUM-U-<n> |` or `| **TC-VACUUM-U-<n>** |`; a cited id is any `TC-…` or `IT-…` token in a title.
- Token pattern (agent's call: whole tokens, so a prefixed id never matches as a substring): a cited id is `\b(?:TC|IT)-[A-Z0-9]+(?:-[A-Za-z0-9]+)*`, matched whole; every id in a title is checked, not only the first. `TC-VACUUM-U-<n>` and `IT-VACUUM-I-<n>` in `src/` are fine; only an unprefixed id fails.
- The FR-5 note drops the `TC-1528` mention without replacement text (agent's call: the row `TC-VACUUM-U-1524` already holds that case). `TC-VACUUM-U-1526` exists as a row head; the new rows follow it.
- `TC-VOI-U-01..10` are ten separate `it` blocks in that guard, each citing its id in the title.

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| A test still cites an undeclared id | Guard fails naming the id | Add the row, or drop the id from the title | vitest output |
| A new row clashes with an existing id | `ids-cas-uniques` fails | Pick the next free number; never reuse an existing or retired one | vitest output |
| A title is not a string literal | Guard fails naming the line | Rewrite it as a literal | vitest output |

## References

[Vacuum card spec](../cards/vacuum.md), [ids guard](../../../tests/specs/ids-cas-uniques.test.ts), [tv precedent](../tv-orphan-ids/spec.md), bead `78y.8` for the repo-wide guard.
