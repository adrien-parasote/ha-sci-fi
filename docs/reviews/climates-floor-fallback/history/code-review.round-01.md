# Code review — climates-floor-fallback

AUDITOR: subagent
Packet: .sc/review/864006a-0846c050 (dirty 864006a..worktree)

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/climates-floor-fallback/spec.md | all | full | yes |
| src/cards/climates/sci-fi-climates.ts | 1-394 | 394 | yes |
| src/selectors/house.ts | 1-125 | 125 | yes |
| docs/specs/cards/climates.md | diff hunks (+ Error Handling table) | 133 | partial (unchanged sections out of scope) |
| tests/cards/climates/sci-fi-climates.test.ts | 1-10, 412-722 (whole new block) | 722 | lot's block in full |
| src/cards/climates/config.ts | grep `filter_by` (none) | 57 | grep only |
| docs/specs/05_cards.md | grep `filter_by` (none) | 303 | grep only |

must_read.txt is empty: no entry point was packaged.

VERDICT: APPROVE
SPEC: docs/specs/climates-floor-fallback/spec.md

FINDINGS:
- [MEDIUM] src/selectors/house.ts:37 — a floor registry holding a `null` value next to a real floor turns the whole card into an error card (TypeError "Cannot read properties of null (reading 'level')"), where the spec promises nothing is selected — the Error Handling row "First registry floor or area is nullish — read with an optional chain, nothing selected" plus the Builder Call "nullish means `undefined` or `null`" are only honoured for `undefined` (which `Array.prototype.sort` moves last without calling the comparator) and for `null` areas; `getFloors()` calls the comparator with `null` and dereferences `a.level`. Reproduced in a scratch copy: `floors: { ghost: null, ground }` gives `console.error` once and `_renderError = "Cannot read properties of null (reading 'level')"`; `ghost: undefined` renders clean. TC-CFF-U-08 (nullish first registry element) only builds the `undefined` case, so it cannot see this. Fix: drop nullish values in `getFloors` before sorting (`Object.values(...).filter(Boolean)`), and add the `null` variant to TC-CFF-U-08. Input is unlikely from HA itself, hence MEDIUM.
  RESOLUTION: fixed — getFloors() filters nullish before sorting (src/selectors/house.ts); null case added to TC-CFF-U-08 in tests/cards/climates/sci-fi-climates.test.ts
- [LOW] tests/cards/climates/sci-fi-climates.test.ts:605 — a `filter_by` read added back anywhere in `src/` other than the four files the test opens would pass the suite — TC-CFF-U-05 (filter_by is not a config key) is specified as "scan `src/` for `filter_by`" (FR-3: "no `filter_by` anywhere in `src/`"), but the test reads only `sci-fi-climates.ts`, `config.ts` and `sci-fi-climates-editor.ts`. Today `git ls-files -co --exclude-standard 'src/**' | xargs grep -l filter_by` finds nothing, so the code conforms; the guard is narrower than the contract. Fix: walk `src/` recursively in the test.
  RESOLUTION: fixed — TC-CFF-U-05 now walks src/ recursively for filter_by (tests/cards/climates/sci-fi-climates.test.ts)
- [LOW] tests/cards/climates/sci-fi-climates.test.ts:562 — the "user selection is kept" case of TC-CFF-U-03 would stay green if the floor hexagon's click stopped emitting the selection — the Builder Call says "a user floor selection in TC-CFF-U-03 is a click on the floor hexagon cell, as the card does it", but the test dispatches a synthetic `cell-selected` on `sf-hexa-row` (whose `@click` -> `cell-selected` path is at src/components/sf-hexa-row.ts:82,93). Fix: click the cell element inside `sf-hexa-row`'s shadow root.
  RESOLUTION: fixed — TC-CFF-U-03 now clicks the second sf-hexa-tile in the sf-hexa-row shadow root (tests/cards/climates/sci-fi-climates.test.ts)

NOTES:
- Mutation testing (scratch copy of the worktree, nothing in the tree touched):
MUTATION: floor fallback `allFloors[0]?.floor_id` -> `allFloors[0].floor_id` — KILLED by TC-CFF-U-04
MUTATION: area fallback `getAreas(this.hass)[0]?.area_id` -> `[0].area_id` — KILLED by TC-CFF-U-08
MUTATION: house.ts `area?.floor_id` -> `area.floor_id` — KILLED by TC-CFF-U-08
MUTATION: __displayFloors `f => f && this...` -> `f => this...` — KILLED by TC-CFF-U-08
MUTATION: floor scan `if (floor && this.__hasClimateInFloor` -> `if (this.__hasClimateInFloor` — KILLED by TC-CFF-U-08
MUTATION: area fallback restricted to the active floor (`getAreasByFloor(...)[0]`) — KILLED by TC-CFF-U-02
MUTATION: floor fallback disabled (`if (false)`) — KILLED by TC-CFF-U-01
MUTATION: area fallback disabled (`if (false)`) — KILLED by TC-CFF-U-02
MUTATION: area fallback takes the last area (`.at(-1)`) — KILLED by TC-CFF-U-02
- The `area?.floor_id` in src/selectors/house.ts:80 goes beyond the Builder Calls, as the orchestrator says; it is needed by TC-CFF-U-08 (the mutant above is killed). The same goes for `floor &&` at src/cards/climates/sci-fi-climates.ts:69 and :221, which the Builder Calls do not name either; both are needed for an `undefined` floor that the sort moves last, and both are killed by TC-CFF-U-08. I do not count them as defects; the spec's Builder Calls line could list them.
- The Builder Calls name `getFirstFloor(this.hass)`; the code uses `allFloors[0]?.floor_id` (sci-fi-climates.ts:76). `getFirstFloor` is `getFloors(hass)[0]` (house.ts:58-61), so the two behave the same, and the "import line" the Builder Calls mention did not need to change.
- IT-CFF-I-03 (tests:718) checks the French rendering `Aucun radiateur configuré`, while the spec writes the `msg()` source `No radiator configured`. The test runs in the fr locale (same convention as the existing test at tests:230), so this is the same string translated.
- FR-6 (the fallback floor stays locked once chosen): the lock is new and accepted (ACCEPTED-LIMIT); it is pinned by IT-CFF-I-04 and matches the code at sci-fi-climates.ts:65-78.
- Scratch copy baseline: 26/26 tests pass in tests/cards/climates/sci-fi-climates.test.ts.

CONFORMANCE EVIDENCE:
- FR-1 (first floor when no floor holds a radiator): sci-fi-climates.ts:74-77, no config condition; nothing selected when no floor is registered (`?? null`); TC-CFF-U-01, TC-CFF-U-04 B.
- FR-2 (first area of the whole house): sci-fi-climates.ts:94-97, `getAreas(this.hass)[0]`, checked after the scan of the floor's areas (85-93), so a floor whose area holds a radiator never reaches it; TC-CFF-U-02 (including the integer-like `1` order).
- FR-3 (filter_by is not a config key): no `filter_by` and no `this.config as any` in src/ (grep); the card reads only the typed `this.config` fields (25, 55, 160, 199, 321-326).
- FR-4 (normal render unchanged): the scan is unchanged at 65-73 and 85-93; TC-CFF-U-03 covers D, E and the kept selection.
- FR-5/FR-6: TC-CFF-U-04 and IT-CFF-I-01/02/04; there is no console.* in the render path.
- FR-7 (climates.md documents the selection): docs/specs/cards/climates.md gains a "## Floor and area selection" section and the Error Handling row "Radiators in areas with no floor"; no TC-CFF id, no filter_by; TC-CFF-U-06.
- FR-8 (no new user-visible string): the `msg()` set is unchanged (TC-CFF-U-07); no xliff/fr.js file in the diff.
