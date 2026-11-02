---
spec: docs/specs/weather-orphan-ids/spec.md
sources:
  - docs/specs/cards/weather.md
  - docs/specs/05_cards.md
  - tests/cards/weather/sci-fi-weather.test.ts
  - tests/specs/ids-cas-uniques.test.ts
  - tests/specs/blueprint-traceability.test.ts
---

# Weather test titles cite only declared ids — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-78y.5`, child of `78y`; the repo-wide guard is `78y.8`. Four titles of `tests/cards/weather/sci-fi-weather.test.ts` cite a bare id no spec declares for them: `IT-004` (the weatherIcon plugin test) and `IT-005`, `IT-006`, `IT-007` (three tests whose titles also cite a source line: `line 389`, `lines 501-503`, `line 419`). The bead's rule applies: a case that tests real behaviour gets a row and a prefixed id, a test that only covers a source line loses its id and its line number. So:

- `IT-004` tests real behaviour (the plugin draws the icon; a Chart.js construction failure warns and does not throw). `docs/specs/cards/weather.md` gains the row `IT-WEATHER-I-004` after `IT-WEATHER-I-003`, worded from what the test asserts, and the title takes that id.
- `IT-005`, `IT-006`, `IT-007` are read as coverage tests: their titles lose the id and the source line, and take the exact wording of FR-3 (two of the three keep their old words, the third is lightly reworded). `IT-007` asserts that choosing a chart kind on an already-built chart calls `update()`; the user-visible behaviour of a kind change is already held by `IT-WEATHER-I-001` (dropdown updates `_chartDataKind` and the chart), so `IT-007` stays a coverage test of line 419, in the bead's exception for titles citing a line.

No test body, assertion or comment is edited, no behaviour changes. A guard `tests/cards/weather/weather-ids-declared.test.ts` holds the invariant for this file until `78y.8` generalises it. See [the weather spec](../cards/weather.md) and [the cards spec](../05_cards.md).

**Out of scope.** `TC-502` and `TC-503`, cited in the titles at `sci-fi-weather.test.ts:57` and `:132`, are declared by `docs/specs/05_cards.md` (`| TC-502 |` and `| TC-503 |` rows) and are cited only there: they are declared ids. Dropping them would leave those rows uncited, which `tests/specs/ids-cas-uniques.test.ts` refuses, and would break `tests/specs/blueprint-traceability.test.ts` O1, because the `F-CARD-05` Covers cell cites `sci-fi-weather.test.ts :: TC-502, TC-503`. The `TC-502` row (the card reads `weather_entity`) only loosely matches its test (`getStubConfig` returns `weather.forecast_home`); that looseness is not this lot's. The ids of `sci-fi-weather-editor.test.ts` (`TC-1011`, `TC-1012`, `IT-1001`, `IT-1002`, declared by `10_card_editors.md`) stay with `78y.8`: this guard reads `sci-fi-weather.test.ts` only. `describe(` titles are not checked.

## Requirements

- **FR-1**: Every id cited in an `it(`, `test(` or `it.each(` title of `tests/cards/weather/sci-fi-weather.test.ts` is a row head of `docs/specs/cards/weather.md`, or is one of the ids that the `F-CARD-05` feature row of `docs/specs/05_cards.md` lists for `tests/cards/weather/sci-fi-weather.test.ts` (today `TC-502`, `TC-503`). The other row heads of `05_cards.md` (`TC-501`, `TC-504`..`TC-508`) belong to other cards and do not count. Titles are read as literal source text: an id built by template interpolation is not evaluated. The guard `tests/cards/weather/weather-ids-declared.test.ts` enforces it, fails on a fixture title citing an undeclared id in the forms `it(`, `test(`, `it.concurrent(` and `it.each(` (also when the table holds parentheses), and fails when a declared set is empty. When `78y.8` ships, it absorbs this guard or retires it.
- **FR-2**: `docs/specs/cards/weather.md` declares `IT-WEATHER-I-004` as a row head of its Test Case Specifications table, directly after `IT-WEATHER-I-003`, once. The row says that the `weatherIcon` chart plugin draws the icon of a datum through `drawImage` in `afterDatasetsDraw`, and that when Chart.js construction throws, rendering the chart calls `console.warn` with `Chart.js failed to init` and the error, and does not throw. The row names no source line.
- **FR-3**: The four titles change and nothing else in the test file does:

  | Old title | New title |
  |---|---|
  | `IT-004: test weatherIcon plugin directly and handles init failure gracefully` | `IT-WEATHER-I-004: weatherIcon plugin draws the icon and a Chart.js init failure warns without throwing` |
  | `IT-005: _renderIcon falls back to sf-icon when icon not in WEATHER_ICON_SET (line 389)` | `_renderIcon falls back to sf-icon when the icon is not in WEATHER_ICON_SET` |
  | `IT-006: _getChartData covers precipitation and wind_speed branches (lines 501-503)` | `_getChartData answers the precipitation and wind_speed series` |
  | `IT-007: _selectChartDataKind updates chart when already initialized (line 419)` | `_selectChartDataKind updates a chart that is already initialized` |

  Only the title string changes; no test body, assertion or comment is edited (the comments that name a line stay).
- **FR-4**: After the lot, no title of `sci-fi-weather.test.ts` cites `IT-004`, `IT-005`, `IT-006` or `IT-007` as a whole token, no title carries a source-line mention (`line 12`, `lines 12-14`), and the file uses no `skip`, `skipIf`, `todo` or `only` on `it`, `test` or `describe`.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | `IT-004`..`IT-007` are declared by no spec today (`water.md` declares `IT-WATER-I-004`, a different id) | Low | SHOW — `grep -rnE "\bIT-00[4-7]\b" docs/specs` → no match | TC-WOI-U-01 |
| 2 | `TC-502` and `TC-503` are row heads of `docs/specs/05_cards.md` (`\| TC-502 \| Unit \| WeatherCard lit weather_entity`, `\| TC-503 \| Unit \| WeatherCard render l'alert`; lines 274-275 today), the `F-CARD-05` row (line 31 today) lists `sci-fi-weather.test.ts :: TC-502, TC-503`, and `IT-WEATHER-I-003` is a row head of `weather.md` (`\| IT-WEATHER-I-003 \| Clock Update`; line 153 today) | Low | SHOW — grep of the three row heads and of the feature row | TC-WOI-U-01 |
| 3 | The `IT-004` test asserts what the row will say | Medium | SHOW — the test calls `_getChartPlugins()`, checks `plugin.id` equals `weatherIcon`, calls `afterDatasetsDraw` with a mock chart whose dataset `weather` holds an icon name (`sunny-day`) and a mocked `Image` that loads at once, expects `drawImage` to be called, then makes the Chart.js mock throw and expects `console.warn` called with `Chart.js failed to init` and an `Error`; a thrown error would fail the test | TC-WOI-U-05 |
| 4 | The three line-citing titles lose id and line, in the exact wording of FR-3 | Low | TELL — read the titles at `sci-fi-weather.test.ts:287`, `:294`, `:318` | TC-WOI-U-03 |
| 5 | Renaming a title changes no behaviour | Medium | TELL — only `it()` strings change | IT-WOI-I-01 |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | Giving a line-citing test a spec row | Drop its id and its line number from the title |
| 2 | Dropping `TC-502` or `TC-503` from the titles | They are declared in `05_cards.md`, cited here and in the Covers cell of `F-CARD-05`; leave them |
| 3 | Editing test bodies or comments while renaming | Touch the title string only |
| 4 | Writing a source line number in a title | Words only: lines move |
| 5 | Putting the lot's guard under `tests/specs/` | Keep it under `tests/cards/weather/`: `ids-cas-uniques` ignores `tests/specs/` when it looks for citations, and its weather ids are legal here |
| 6 | Counting every row head of `05_cards.md` as declared for weather | Only the ids that `F-CARD-05` lists for this file count |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-WOI-U-01 | Every id cited by a title of `sci-fi-weather.test.ts` is in the declared set (row heads of `weather.md`, with or without `**`, plus the ids of the `F-CARD-05` row for this file); both parts are non-empty | FR-1 | The orphan list is empty |
| TC-WOI-U-02 | The orphan detector returns `TC-GHOST-U-99` for a fixture title in `it(`, `test(`, `it.concurrent(` and `it.each([f(1)])(` form against a fixture spec that declares nothing, and returns nothing when the fixture spec declares it | FR-1 | Orphan reported for the four forms, then none |
| TC-WOI-U-03 | `IT-WEATHER-I-004` is a row head of `weather.md` exactly once; the four new titles of FR-3 are present and the four old titles are absent | FR-2, FR-3 | One head; four new titles found, four old absent |
| TC-WOI-U-04 | No title cites `IT-004`..`IT-007` as a whole token, and no title matches `\blines? \d`; a fixture title `x (line 12)` and a fixture `x (lines 5-9)` are detected | FR-4 | None in the file; both fixtures detected |
| TC-WOI-U-05 | The `IT-WEATHER-I-004` row names `weatherIcon`, `afterDatasetsDraw`, `drawImage`, `console.warn` and `Chart.js failed to init`, and holds no `line N` mention | FR-2 | All tokens found, no line mention |
| TC-WOI-U-06 | The file uses no `skip`, `skipIf`, `todo` or `only` on `it`, `test` or `describe`; a `test.skip` fixture and an `it.skipIf` fixture are detected | FR-4 | None in the file; both fixtures detected |
| TC-WOI-U-07 | Against the real specs, a fixture title citing `TC-504` returns `TC-504` as orphan, and a fixture title citing `TC-502` returns nothing | FR-1 | Only the ids of the `F-CARD-05` row pass |
| IT-WOI-I-01 ⬜ | `git diff --unified=0 <base> -- tests/cards/weather/sci-fi-weather.test.ts`, where `<base>` is `main` at the commit the worktree was cut from | FR-3 | Four `-` and four `+` content lines (the `---`, `+++` and `@@` lines excluded), each an `it(` title line |
| IT-WOI-I-02 ⬜ | Repo spec guards on the whole repo | FR-1, FR-2 | `tests/specs/ids-cas-uniques.test.ts` and `blueprint-traceability.test.ts` green |
| IT-WOI-I-03 ⬜ | Full vitest run | FR-1..FR-4 | All suites green |

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** Les trois `IT-WOI-I-*` sont joués par une commande au VERIFY, pas par un test qui cite l'id.

## Builder Calls

Answers to a cold builder's questions. Calls marked *mine* are the author's, not agreed with anyone.

- Guard: one file `tests/cards/weather/weather-ids-declared.test.ts`, shape of `tests/cards/vacuum/vacuum-ids-declared.test.ts` of the vacuum lot (reads files with `fs` from `process.cwd()`, local pure functions, fixtures inline) (*mine*). It never spells an `IT-WOI-I-*` id, in a title or a comment: those rows carry ⬜ and `ids-cas-uniques` would see them cited.
- Title extractor (*mine*): `\b(?:it|test)(?:\.\w+)*(?:\((?:[^()]|\([^()]*\))*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1` with the `g` flag; the builder checks it against the fixtures of TC-WOI-U-02 (`it('…')`, `test('…')`, `it.concurrent('…')`, `it.each([f(1)])('…')`) and against the real file, which holds one multi-line `it.each([...])(` title. Cited-id pattern: `\b(?:TC|IT|UT)-[A-Z0-9]+(?:-[A-Za-z0-9]+)*`. Row-head matcher: `^\|\s*(?:\*\*)?(<id>)(?:\*\*)?\s*\|` per line, where `<id>` is the cited-id pattern when collecting heads and the escaped literal id when counting one.
- Declared set (*mine*): the row heads of `weather.md`, plus the ids found in the `F-CARD-05` line of `05_cards.md` (the text after `sci-fi-weather.test.ts ::` up to the next ` · ` or ` — `), each of which must also be a row head of `05_cards.md`.
- Builder check calls, all *mine*: the F-CARD-05 line is the line that starts with `| F-CARD-05 |`; its test cell reads `tests/cards/weather/sci-fi-weather.test.ts :: TC-502, TC-503 · tests/sci-fi.test.ts :: IT-501 — cas propres dans …`, so the ids are the comma-list after the weather file name, cut at the first ` · `, ` — ` or ` |`. The builder may adjust the extractor regex if a fixture or the real file fails, as long as every fixture of TC-WOI-U-02 and the real file still pass. The guard's own test titles and fixtures never reach the rules: it reads `sci-fi-weather.test.ts` and the two specs only. `ids-cas-uniques` reads the guard as part of the tree, where `TC-GHOST-U-99` is declared by no spec (so no rule applies) and `TC-504`, `TC-502` are bare ids, not card-prefixed, so the placement rule ignores them; if IT-WOI-I-02 shows otherwise, the builder builds those fixture ids from fragments. The table of `weather.md` has the five columns of FR-2 in English, and the new row is in English. Old and new titles are compared as whole extracted titles (exact string equality on the extracted title), never as substrings of the raw source. The detector is `orphans(src: string, declared: string[]): string[]`: ids cited in the titles of `src` that are not in `declared`, in order of appearance, without duplicates. `<base>` of IT-WOI-I-01 is `git merge-base HEAD main` at the cut point; VERIFY plays it, the builder does not.
- `TC-WOI-U-01..07` are seven separate `it` blocks in the guard, each citing its id in the title.
- The new row (*mine*), in the English of its table: `| IT-WEATHER-I-004 | weatherIcon plugin | Chart plugin from _getChartPlugins() | Call afterDatasetsDraw with a datum carrying a weather icon name (Image load mocked); then make Chart.js construction throw and render the chart | drawImage is called for the datum; the failure calls console.warn with "Chart.js failed to init" and the error, and does not throw |`. The row follows the five columns of the table (`ID`, `Description`, `Preconditions`, `Action`, `Expected Result`); identifiers may be wrapped in backticks, and the TC-WOI-U-05 check strips backticks.
- The skip pattern is `\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|skipIf|todo|only)\b`; skip fixtures are built from fragments (`['test','skip'].join('.')`) so the guard never spells one (*mine*). The ghost id is `TC-GHOST-U-99`.
- The builder edits the four titles with the Edit tool on the exact old title text of FR-3; the `IT-WEATHER-I-004` title keeps the surrounding `async () =>` untouched (*mine*).
- Rows added to `weather.md` carry no ⬜: their test cites them.

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| A title cites an undeclared id | Guard fails naming the id | Drop the id or declare it | vitest output |
| The `IT-WEATHER-I-004` row head is missing or doubled | Guard fails naming the count | Fix the row | vitest output |
| A title carries a source line | Guard fails naming the title | Reword the title | vitest output |
| A declared set reads empty | Guard fails | Fix the row-head pattern | vitest output |
| The guard spells an `IT-WOI-I-*` id | `ids-cas-uniques` fails on a stale ⬜ | Remove the mention | vitest output |

## References

[Weather card spec](../cards/weather.md), [cards spec](../05_cards.md), [ids guard](../../../tests/specs/ids-cas-uniques.test.ts), [traceability guard](../../../tests/specs/blueprint-traceability.test.ts), [vacuum precedent](../vacuum-orphan-ids/spec.md), [alias precedent](../alias-orphan-ids/spec.md), bead `78y.8` for the repo-wide guard.
