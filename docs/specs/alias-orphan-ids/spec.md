---
spec: docs/specs/alias-orphan-ids/spec.md
sources:
  - docs/specs/cards/plugs.md
  - docs/specs/cards/vehicles.md
  - tests/cards/plugs/sci-fi-plugs.test.ts
  - tests/cards/vehicles/sci-fi-vehicles.test.ts
  - tests/specs/ids-cas-uniques.test.ts
---

# Historical alias ids dropped from plugs and vehicles test titles — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-78y.3`, child of `78y`; the repo-wide guard is `78y.8`. Four test titles cite the id their spec declares plus a historical alias no spec declares: `TC-PLG-0001` and `TC-PLG-0002` in `tests/cards/plugs/sci-fi-plugs.test.ts`, `TC-VEH-0001` and `TC-VEH-0002` in `tests/cards/vehicles/sci-fi-vehicles.test.ts`. The declared ids (`TC-PLUGS-U-1301/1302`, `TC-VEHICLES-U-1201/1202`) have rows in the specs already, so each title only loses its alias and keeps its words. No spec row is added, no behaviour changes. Two file-tree lines in the specs that tell the reader to preserve the aliases are rewritten to name the declared ids (4 files edited in all: 2 tests, 2 specs). A small guard lives in `tests/cards/plugs/alias-ids-declared.test.ts` and holds this lot's invariant until `78y.8` generalises it. See [the plugs spec](../cards/plugs.md) and [the vehicles spec](../cards/vehicles.md).

**Out of scope.** The two test files cite eleven other ids no spec declares (`TC-505` in plugs; `TC-1215`, `TC-508`, `TC-V01..V08` in vehicles, on ten title lines). They are not aliases of a declared id; they belong to `78y.6` (vehicles), `78y.8` (repo-wide guard) and a plugs follow-up under `78y`. This lot neither renames nor declares them, and its guard does not report them. `describe(` titles are out of scope too: the guard reads `it(`/`test(`/`it.each(` titles only.

## Requirements

- **FR-1**: No title (`it(`, `test(`, `it.each(`) in `tests/cards/plugs/sci-fi-plugs.test.ts` or `tests/cards/vehicles/sci-fi-vehicles.test.ts` cites an id matching `TC-PLG-000<digit>` or `TC-VEH-000<digit>`. The guard `tests/cards/plugs/alias-ids-declared.test.ts` enforces it, reads `it(`, `test(` and `it.each(` titles, fails on a fixture title citing an alias in each of the three forms, and fails when the four declared row heads are not found in their specs. The alias pattern and every fixture are built from string fragments, so the guard's own source never spells an alias; fixtures that need a plugs or vehicles id build it from fragments too, so `tests/specs/ids-cas-uniques.test.ts` guard O1 does not read a card id outside its card's folder. When `78y.8` ships, it absorbs this guard or retires it.
- **FR-2**: The four titles lose their alias and keep their words:

  | File | Old title start | New title start |
  |---|---|---|
  | `sci-fi-plugs.test.ts` | `TC-PLUGS-U-1301, TC-PLG-0001 — provides getConfigElement` | `TC-PLUGS-U-1301 — provides getConfigElement` |
  | `sci-fi-plugs.test.ts` | `TC-PLUGS-U-1302, TC-PLG-0002 — provides getStubConfig` | `TC-PLUGS-U-1302 — provides getStubConfig` |
  | `sci-fi-vehicles.test.ts` | `TC-VEHICLES-U-1201, TC-VEH-0001: getConfigElement returns correct editor tag` | `TC-VEHICLES-U-1201: getConfigElement returns correct editor tag` |
  | `sci-fi-vehicles.test.ts` | `TC-VEHICLES-U-1202, TC-VEH-0002: getStubConfig returns correct type` | `TC-VEHICLES-U-1202: getStubConfig returns correct type` |

  Only the title string changes; no test body, assertion or comment is edited.
- **FR-3**: After the lot, no `TC-PLG-000<digit>` or `TC-VEH-000<digit>` id appears in any file under `tests/`, and neither of the two test files uses `skip`, `skipIf`, `todo` or `only` on `it`, `test` or `describe`.
- **FR-4**: The two file-tree lines of the specs are rewritten, and nothing else in them changes. `docs/specs/cards/plugs.md` line starting `└── tests/cards/plugs/sci-fi-plugs.test.ts` ends `preserve TC-PLUGS-U-1301 (getConfigElement) and TC-PLUGS-U-1302 (getStubConfig)`; `docs/specs/cards/vehicles.md` line starting `└── tests/cards/vehicles/sci-fi-vehicles.test.ts` ends `preserve TC-VEHICLES-U-1201 (getConfigElement) and TC-VEHICLES-U-1202 (getStubConfig)`. The historical tables (`| getConfigElement() | TC-PLG-0001 |` rows and their three siblings) stay untouched.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|---|---|---|---|
| 1 | The declared ids have rows today: `\| TC-PLUGS-U-1301 \| Unit \| getConfigElement() returns correct editor tag` and its 1302, `\| TC-VEHICLES-U-1201 \|` and its 1202 (anchors at `plugs.md:856-857`, `vehicles.md:651-652` today, found by row text) | Low | SHOW — grep of the four row heads | TC-AOI-U-01 |
| 2 | Under `tests/` the four aliases appear only in these four titles; the specs mention them in two historical tables (`\| getConfigElement() \| TC-PLG-0001 \|` rows, `plugs.md:827-828`, `vehicles.md:620-621` today) and one file-tree line each (`plugs.md:105`, `vehicles.md:111` today) | Low | SHOW — `git grep -nE "TC-PLG-000\|TC-VEH-000"` outside `dist` → four title lines in `tests/`, the rest in `docs/specs/cards/` | TC-AOI-U-03 |
| 3 | No test in the two files is skipped today | Low | TELL — read the files | TC-AOI-U-04 |
| 4 | Renaming a title changes no behaviour | Medium | TELL — only `it()` strings change | IT-AOI-I-01 |
| 5 | The eleven other undeclared ids are real and outside this lot | Low | SHOW — grep of the two files, ten title lines | TC-AOI-U-02 (the guard ignores them by construction) |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|---|---|
| 1 | Adding a spec row for an alias | The alias duplicates a declared id: drop it |
| 2 | Editing test bodies while renaming | Touch the title string only |
| 3 | Putting the lot's guard under `tests/specs/` | Keep it under `tests/cards/plugs/`, where its citations count |
| 4 | Writing an alias or a `TC-VEHICLES` id literally in the guard | Build it from fragments (`['TC','VEHICLES','U','1201'].join('-')`) |
| 5 | Widening the guard to every undeclared id | That is `78y.8`; this guard checks aliases only |

## Test Case Specifications

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-AOI-U-01 | The four declared ids are each a row head of their spec, with or without `**`; the head sets are non-empty | FR-1, FR-2 | All four found, once each |
| TC-AOI-U-02 | The alias detector flags a fixture title carrying an alias in `it(`, `test(` and `it.each(` form, and ignores a fixture title citing a ghost id `TC-GHOST-U-99` | FR-1 | Alias returned for the three forms; ghost id returns nothing |
| TC-AOI-U-03 | No file under `tests/` cites an alias; each of the four new title starts of FR-2 is present in its file and each old start is absent | FR-2, FR-3 | No alias match; four new starts found |
| TC-AOI-U-04 | The two test files use no `skip`, `skipIf`, `todo` or `only` on `it`, `test` or `describe`; a `test.skip` fixture and an `it.skipIf` fixture are detected | FR-3 | No match in the files; both fixtures detected |
| TC-AOI-U-05 | The plugs and vehicles file-tree lines end with the declared ids of FR-4 and hold no alias; the historical-table rows still hold theirs | FR-4 | Both lines match; both tables untouched |
| IT-AOI-I-01 ⬜ | `git diff --unified=0 <base> -- <the two test files>`, where `<base>` is `main` at the commit the worktree was cut from | FR-2 | Exactly four removed and four added lines, each a title line |
| IT-AOI-I-02 ⬜ | Repo spec guard on the whole repo | FR-1 | `tests/specs/ids-cas-uniques.test.ts` and `blueprint-traceability.test.ts` green |
| IT-AOI-I-03 ⬜ | Full vitest run | FR-1, FR-3 | All suites green |

> **⬜ dans la colonne ID : le cas n'est joué par aucun test.** Les trois `IT-AOI-I-*` sont joués par une commande au VERIFY, pas par un test qui cite l'id.

## Builder Calls

Answers to a cold builder's questions. Calls marked *mine* are the author's, not agreed with anyone.

- Guard: one file `tests/cards/plugs/alias-ids-declared.test.ts`, shape of `tests/cards/tv/tv-ids-declared.test.ts` (reads files with `fs` from `process.cwd()`, local pure functions, fixtures inline) with a wider title extractor: `\b(?:it|test)(?:\.each\([^)]*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1` (*mine*).
- Alias pattern: `new RegExp(['TC', '(?:PLG|VEH)', '000\\d'].join('-'), 'g')`; fixtures built the same way (*mine*).- Skip pattern: `\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|skipIf|todo|only)\b` (*mine*).
- `TC-AOI-U-01..05` are five separate `it` blocks in the guard, each citing its id in the title.
- Doc lines (FR-4) are edited with the Edit tool on the exact line text; nothing else in the two specs moves (*mine*).
- If the builder finds another alias citation under `tests/`, it drops it the same way (*mine*).
- Builder check calls, all *mine*: `it(` titles are read too (the extractor reads `it`, `test`, `it.each`). The `it.each` fixture form is `it.each([1, 2])('title', fn)`; the two real files hold no `it.each` with parentheses in the table. A row head is matched on the id only, `^\|\s*(?:\*\*)?(<id>)(?:\*\*)?\s*\|` per line, and "once each" counts matches per spec. The tree walk of TC-AOI-U-03 covers every `.ts` file under `tests/`, `node_modules` excluded; the guard's fragment-built source holds no literal alias, so it never matches itself. In TC-AOI-U-05 the tree lines are found by their line prefix, the tables by checking that each of the two rows per spec still holds its alias (fragment-built regex), and only the id tokens after `preserve` change on the tree lines (the builder reads the specs in BUILD). Skip fixtures are built from fragments (`['test','skip'].join('.')`); `xit`, `fit` and `xdescribe` are out of scope. The `IT-AOI-I-*` cases are played at VERIFY, not by the builder. The "4 files" of the Overview are the four existing files; the guard is a fifth, new file.

## Error Handling

| Error | Response | Fallback | Logging |
|---|---|---|---|
| A title still cites an alias | Guard fails naming the alias | Drop the alias from the title | vitest output |
| A declared row head is not found | Guard fails | Fix the row-head pattern | vitest output |
| The guard's own source spells an alias or a card id literally | `TC-AOI-U-03` or `ids-cas-uniques` fails | Rebuild it from fragments | vitest output |

## References

[Plugs card spec](../cards/plugs.md), [vehicles card spec](../cards/vehicles.md), [ids guard](../../../tests/specs/ids-cas-uniques.test.ts), [vacuum precedent](../vacuum-orphan-ids/spec.md), bead `78y.8` for the repo-wide guard.
