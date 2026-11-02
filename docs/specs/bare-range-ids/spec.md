---
spec: docs/specs/bare-range-ids/spec.md
sources:
  - docs/specs/03_base_classes.md
  - docs/specs/11_guidelines_remediation.md
  - tests/sci-fi.test.ts
  - tests/utils/base-editor.test.ts
  - tests/specs/ids-cas-uniques.test.ts
---

# Two bare-range test ids declared in their transverse spec — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-78y.4`, child of `78y`; the repo-wide guard is `78y.8`. Two test titles cite a bare-range id (the numbering of specs 01..11) that no spec declares: `TC-116` in `tests/sci-fi.test.ts` and `TC-308` in `tests/utils/base-editor.test.ts`. Both tests assert real behaviour that no other declared row states (`TC-114` asserts `custom:` absence in the test body but its row only names `documentationURL`), so the specs gain one row each, worded from what the test asserts, and the test titles keep their ids. The feature maps of the two specs list the new ids in their test cell (F-REMED-08 and F-BASE-02). `docs/specs/11_guidelines_remediation.md` gains `TC-116` after `TC-115`, and `docs/specs/03_base_classes.md` gains `TC-308` between `TC-307` and `TC-309`. No test file is edited and no behaviour changes. A small guard `tests/utils/bare-range-ids-declared.test.ts` holds this lot's invariant until `78y.8` generalises it. See [spec 03](../03_base_classes.md) and [spec 11](../11_guidelines_remediation.md).

**Out of scope.** Any other id cited by `tests/sci-fi.test.ts` or `tests/utils/base-editor.test.ts` (for example `TC-105` or `TC-1018`) is not touched or checked here; `78y.8` covers the repo. No renaming of the two ids to a prefixed form: specs 01..11 are transverse and keep bare ranges, as `TC-115` beside `TC-116` does.

## Requirements

- **FR-1**: `docs/specs/11_guidelines_remediation.md` declares `TC-116` as a row head of its Test Cases table, directly after the `TC-115` row, type `Unit`. The row says that every entry of `window.customCards` carries a `type` that does not contain the `custom:` prefix (Home Assistant adds it), and names `tests/sci-fi.test.ts` as the test. The test cell of the `F-REMED-08` feature row ends `tests/sci-fi.test.ts :: TC-114, TC-115, TC-116`.
- **FR-2**: `docs/specs/03_base_classes.md` declares `TC-308` as a row head of its Test Cases table, between `TC-307` and `TC-309`, type `Unit`. The row says that with `hass.locale.language` set to `fr`, `getLabel('section-title-header')` returns `En-tête` once the locale has loaded, and names `tests/utils/base-editor.test.ts` as the test. The test cell of the `F-BASE-02` feature row reads `tests/utils/base-editor.test.ts :: TC-305, TC-308 · tests/styles/editor-common.test.ts :: IT-302`.
- **FR-3**: `TC-116` and `TC-308` are each declared as a row head exactly once across `docs/specs/**/*.md`, and the titles in `tests/sci-fi.test.ts` and `tests/utils/base-editor.test.ts` still start with `TC-116:` and `TC-308:`. No test file is modified by this lot.
- **FR-4**: The guard `tests/utils/bare-range-ids-declared.test.ts` enforces FR-1..FR-3; the declaration half is held by `tests/docs/repo-wide-ids-guard.test.ts`; the guard keeps the single row heads, the title starts, the row words and the feature-map cells.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `TC-116` and `TC-308` are declared by no spec today | Low | SHOW — `grep -rnE "TC-116\b\|TC-308\b" docs/specs` → no match; the titles are `it('TC-116: ensures card types do not contain custom: prefix'` in `tests/sci-fi.test.ts` and `it('TC-308: getLabel returns translated French string when locale is fr'` in `tests/utils/base-editor.test.ts` | TC-BRI-U-01 |
| 2 | The neighbours exist as row heads: `TC-115` in spec 11 and `TC-307`, `TC-309` in spec 03 | Low | SHOW — rows `\| TC-115 \| Unit \| hacs.json suit le schéma HACS 2.0`, `\| TC-307 \|`, `\| TC-309 \|` | TC-BRI-U-01 |
| 3 | The two tests assert what the rows will say | Medium | SHOW — `tests/sci-fi.test.ts` loops `window.customCards` with `expect(card.type).to.not.contain('custom:')`; `base-editor.test.ts` sets `locale: { language: 'fr' }` and expects `getLabel('section-title-header')` to be `En-tête` | TC-BRI-U-04 |
| 4 | A bare-range row in specs 03 and 11 passes `ids-cas-uniques` | Low | SHOW — the guard demands that no id is declared by two documents (`tests/specs/ids-cas-uniques.test.ts:135`), that a declared id is cited by the tree unless marked ⬜ (`:355`), and that only card specs and the matrix carry a derived prefix (`:201`, `:269`); `TC-116` and `TC-308` are declared once and cited by their test titles, specs 03 and 11 are neither card specs nor the matrix, and `TC-115` and `TC-307` are bare rows there today | IT-BRI-I-02 |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | Dropping the id from a title whose test asserts real behaviour | The spec gains the row; the title keeps its id |
| 2 | Editing a test file in this lot | The lot only adds two spec rows and one guard |
| 3 | Writing a row the test does not prove | Word the row from what the test asserts (TC-BRI-U-04) |
| 4 | Giving the two ids a prefixed form | Specs 01..11 keep bare ranges |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-BRI-U-01 | `TC-116` is a row head once in spec 11, `TC-308` once in spec 03, and neither is a row head anywhere else under `docs/specs`; the row heads `TC-115`, `TC-307`, `TC-309` still exist | FR-1, FR-2, FR-3 | Each id found once, in the right file |
| TC-BRI-U-02 | The title of `tests/sci-fi.test.ts` starts with `TC-116:` and the title of `tests/utils/base-editor.test.ts` starts with `TC-308:` | FR-3 | Both starts found |
| TC-BRI-U-03 [RETIRED] | The orphan detector returns `TC-9999` for a fixture title citing it against a fixture spec that declares nothing, and returns nothing when the fixture spec declares it | FR-4 | Orphan reported, then none |
| TC-BRI-U-04 | The `TC-116` row names `window.customCards` and `custom:`; the `TC-308` row names `section-title-header`, `En-tête` and the `fr` locale | FR-1, FR-2 | All tokens found in their row |
| TC-BRI-U-05 | The `F-REMED-08` test cell holds `TC-116` after `TC-114, TC-115`, and the `F-BASE-02` test cell holds `TC-308` after `TC-305` | FR-1, FR-2 | Both cells found |
| IT-BRI-I-01 ⬜ | `git diff --stat <base>` where `<base>` is `main` at the commit the worktree was cut from | FR-1, FR-2, FR-3 | Two spec files changed by two lines each (one added row, one edited feature cell), no test file changed, one new guard file |
| IT-BRI-I-02 ⬜ | Repo spec guards on the whole repo | FR-1, FR-2 | `tests/specs/ids-cas-uniques.test.ts` and `blueprint-traceability.test.ts` green |
| IT-BRI-I-03 ⬜ | Full vitest run | FR-4 | All suites green |

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** Les trois `IT-BRI-I-*` sont joués par une commande au VERIFY, pas par un test qui cite l'id.

## Builder Calls

Answers to a cold builder's questions. Calls marked *mine* are the author's, not agreed with anyone.

- Guard: one file `tests/utils/bare-range-ids-declared.test.ts` (not under `tests/specs/`: `ids-cas-uniques` ignores that folder when it looks for citations of declared ids, so the five `TC-BRI-U-*` rows would count as uncited), shape of `tests/cards/tv/tv-ids-declared.test.ts` (reads files with `fs` from `process.cwd()`, local pure functions, fixtures inline), with the title extractor `\b(?:it|test)(?:\.each\([^)]*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1` and the row-head matcher `^\|\s*(?:\*\*)?(<id>)(?:\*\*)?\s*\|` per line (*mine*).
- Spec files under `docs/specs/**/*.md` are listed by a recursive walk that uses `lstatSync` and does not follow symlinks, `node_modules` excluded (*mine*).
- `TC-BRI-U-01`, `-02`, `-04`, `-05` are four separate `it` blocks in the guard, each citing its id in the title.
- New rows (*mine*), both in French like the adjacent `TC-115` and `TC-309` rows: spec 11 — `| TC-116 | Unit | Aucun type de window.customCards ne porte le préfixe custom: | Parcourir window.customCards, module src/sci-fi.js chargé | card.type ne contient pas custom: (Home Assistant l'ajoute) — tests/sci-fi.test.ts |`; spec 03 — `| TC-308 | Unit | getLabel renvoie la chaîne française quand la locale est fr | hass.locale.language = fr, attendre le chargement de la locale | getLabel('section-title-header') vaut En-tête — tests/utils/base-editor.test.ts |`. Code spans may wrap the identifiers in backticks.
- Builder check calls, all *mine*: the builder reads the two specs in BUILD to anchor its edits; the current cells are `tests/sci-fi.test.ts :: TC-114, TC-115` (F-REMED-08) and `tests/utils/base-editor.test.ts :: TC-305 · tests/styles/editor-common.test.ts :: IT-302` (F-BASE-02), and the new row goes on the line directly after the `TC-115` row and between the `TC-307` and `TC-309` rows. Row heads are matched on lines whose first cell is the id, so feature-map cells never match. The tokens checked in TC-BRI-U-04 are `window.customCards`, `custom:`, `section-title-header`, `En-tête` and `hass.locale.language = fr`, compared after stripping backticks. The detector is `orphans(src: string, spec: string): string[]`: it extracts titles with the extractor above, collects every id matching `\b(?:TC|IT)-\d+\b` (bare ids only), keeps those that are not row heads of `spec`, and returns them in order of appearance without duplicates. The real-tree check calls it on the two test files against the concatenated text of spec 03 and spec 11, restricted to the ids `TC-116` and `TC-308` (other bare ids stay out of scope). The guard reads from `process.cwd()`, which is the worktree root when vitest runs there. The new rows carry no ⬜ because their tests cite them. The walk reads this lot's own spec too: it holds no row head `TC-116` or `TC-308`, and Assumption 1 states the situation before the lot.
- The fixture ghost id is `TC-9999`; no card-prefixed id is written in the guard (*mine*).

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| A row head is missing or declared twice | Guard fails naming the id and the count | Fix the row | vitest output |
| A title no longer starts with its id | Guard fails naming the file | Restore the title | vitest output |
| A row lacks the tokens of TC-BRI-U-04 | Guard fails naming the missing token | Reword the row from the test | vitest output |

## References

[Spec 03](../03_base_classes.md), [spec 11](../11_guidelines_remediation.md), [ids guard](../../../tests/specs/ids-cas-uniques.test.ts), [alias precedent](../alias-orphan-ids/spec.md), bead `78y.8` for the repo-wide guard.
