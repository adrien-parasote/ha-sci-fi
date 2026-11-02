# Adversarial review — water-orphan-ids

Regime: fan-out, three lenses (Security, User, Scope), each on opus, foreground, one message. Spec: docs/specs/water-orphan-ids/spec.md.

## Stress-test

Verdict: CLAIM_OVERSTATED by all three lenses (the Security and Scope lenses also read CLAIM_BROKEN on F-01). The 28 title to id mappings are faithful to what their tests assert and the counts (8/25, 5/17) are right, but the claim that the repo guards come back green at BUILD is false: ids-cas-uniques O1 (directory locality) goes red on every `water_history` id cited from tests/cards/water/, and the guard's own ⬜ assertions would turn ids-cas-uniques red too. Several Covers cells and the D14 closure also claim more than the tests pin.

## Findings

[CRITICAL] — F-01 ids-cas-uniques O1 `malPlace` turns red: 12 water_history ids (TC-WATER-HISTORY-U-003..008, IT-WATER-HISTORY-I-004..009) are cited from tests/cards/water/, and no tests/cards/water_history/ exists (ids-cas-uniques.test.ts:290, :327-328); spec.md:127, Assumption 4 and IT-WATOI-I-02 claim green [RESOLVED] TC-WATOI-U-09 (split by user decision 2026-11-02: the 13 history titles move to tests/cards/water_history/sci-fi-water-management-history.test.ts, counts 13/25 and 23/37 summing to the base 36/62; Assumption 4 and IT-WATOI-I-02 rewritten, FR-11)
[HIGH] — F-02 TC-WATOI-U-08 makes the guard spell the ⬜ ids (U-001, U-002, I-001..003, WATER-U-001/002/004/005, WATER-I-001..004) in tests/cards/water/, so ids-cas-uniques fails "marqué ⬜ mais cité"; the spelling ban covers only IT-WATOI-I-* and retired ids [RESOLVED] TC-WATOI-U-10 (every spec id, the ⬜ ones included, is built from fragments, and the guard scans its own text for a literal; Anti-pattern 7)
[HIGH] — F-03 Blueprint Covers cells cite D21 legacy rows (TC-WATER-HISTORY-U-007, IT-WATER-HISTORY-I-006/I-007) as coverage of F-WATER-06, F-WATER-HIST-03 and F-WATER-01, though those rows pin the forbidden `expanded` trigger (water_history.md:133, :145, :146; anti-pattern 3) [RESOLVED] TC-WATOI-U-07 (exact Covers sets per feature; none of the three D21 rows is cited; F-WATER-01 names its untitled test only; FR-6, Anti-pattern 3)
[MEDIUM] — F-04 Covers cells point at unrelated tests: F-WATER-HIST-02 cites U-006 (model only, D15) and I-009 (willUpdate entityIds); F-WATER-05 cites U-006 and I-009 where only U-003 is per-accordion [RESOLVED] TC-WATOI-U-07 (F-WATER-HIST-02 keeps U-006 only, with its model-side limit written in the cell; I-009 moves to F-WATER-HIST-03, the floor's relevant entities; F-WATER-05 drops U-006 and I-009)
[MEDIUM] — F-05 F-WATER-05 Covers cell lacks TC-WATER-HISTORY-U-008 (old TC-1203 maps to U-003 and U-008) so TC-WATOI-U-07 would be red, while spec.md:127 forbids the builder to rewrite water.md [RESOLVED] TC-WATOI-U-07 (F-WATER-05 holds U-003 and U-008; the Builder Calls rule now makes the Covers cells and the water.md edits this lot's deliverable)
[MEDIUM] — F-06 TC-WATER-U-007 is certified played ("les dix-sept autres sont jouées") but its only citing test (:124-144) never calls `_renderHistoryLogs`; the render filter is asserted at :220-228 [RESOLVED] TC-WATOI-U-09 (row 1 title drops TC-WATER-U-007, the water file no longer cites it) and TC-WATOI-U-08 (⬜ on TC-WATER-U-007, note counts Neuf des vingt-cinq)
[MEDIUM] — F-07 D14 moved to Resolved though only `_formatTimestamp` (`01/06 08:26`, no brackets) is pinned; the brackets come from the render at src:370 and no test pins them, the resolved line cites `:323` wrongly, and dropping the `:323` mutants leaves that cite unguarded [RESOLVED] TC-WATOI-U-08 (the resolved line states _formatTimestamp pinned and "no test pins the brackets", cites :312 :323 :370) and TC-WATOI-U-11 (water-history-aligned.test.ts keeps a mutant per cite and for the phrase)
[MEDIUM] — F-08 The aligned-guard edit exceeds the spec: it swaps the D14 `:323` mutants for two unmentioned `:141` (D24) mutants, and the D21 carve-out drops every table line containing D21 (aligned.test.ts:166-170), not only Test Case rows, with no mutant killing a non-D21 `expanded` table row [RESOLVED] TC-WATOI-U-11 (carve-out scoped to rows whose first cell is a case id AND that name D21, with a mutant for a case row without D21 and one for a non-case row; the :141 mutants are now declared in FR-7)
[LOW] — F-09 Row and example texts claim more than the tests assert: TC-WATER-U-003 "updates entity state", TC-WATER-U-017 "(the device group)", TC-WATER-U-021 "(fallback icon)", TC-WATER-HISTORY-U-004 "pulsing animation", and docs/MASTER.md:37 maps TC-W04 to U-011 instead of U-003 [RESOLVED] TC-WATOI-U-05 (rows reworded to what the tests assert; absent-word checks) and TC-WATOI-U-07 (MASTER.md example now TC-WATER-U-003, TC-WATER-U-010)

## Hostile-Input Checklist

HIC-1 unbounded-input — N/A — no range, count or pagination; the lot edits spec tables and test titles
HIC-2 stored-string — N/A — only repo-authored titles and rows, no user string stored or emitted
HIC-3 injection — N/A — no interpreter, URL or control surface; the new ids are [A-Z0-9-] only and guards read fixed repo paths
HIC-4 bootstrap-authz — N/A — no route, role or mutation
HIC-5 malformed-oversized — N/A — no endpoint, input is a markdown table
HIC-6 numeric-edge — N/A — no numeric or enum field parsed at runtime

## Builder check

Second, contract-form run (spec dir only, COVERAGE 167/167): "nothing blocks the plan", five low questions.

### Answered

- Are the SPEC-time edits committed (spec.md Builder Calls, "State of the SPEC-time edits"): no, working tree; the Covers path strings are the written ones.
- Path format of the Covers cells (same place): repo-relative, as written.
- "25 distinct bare ids" (Overview): 5 `TC-12nn`, 5 `IT-12nn` (`IT-1201_primary` is a title variant of `IT-1201`), 15 `TC-Wnn`: left as is.

### My calls

- Title extraction and id shape (spec.md Builder Calls, "Title extraction and ids"): agent's call, the weather guard's regexes; `WATER-HISTORY-` tested before `WATER-`.
- Unused imports in the water file (same Builder Calls item): agent's call, none expected; trim and report if a lint refuses one.

### Theirs

none

### First run (read-only, files allowed)

One cold sonnet builder, spec only (read-only), run after the resolutions. Verdict: BUILDABLE, no blocking guess. Checked against the files: base counts 36 `it(` and 62 `expect(`; block 123..386 holds 13 `it(` and 25 `expect(` with no `vi.`, `sf-toast` or `SciFiWaterManagementCard`; the 28 title lines and old ids match the Mapping; the Assumption 1 grep returns 0; `malPlace`, `prefixeAttendu` and the src lines :312, :323, :370 are as cited; the Covers cells match FR-6 as sets; markers and notes match FR-2 and FR-3. Ambiguities it raised, fixed in the spec: which blank line goes with the deleted block (base line 387), the "8 untitled-id cases" wording (now 6 without an id plus U-006 and U-008), titles matched by text rather than by line since water-file lines shift by 264. Vacuity: none; the absent-word checks of TC-WATOI-U-05 are regression guards.
