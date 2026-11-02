# Code review — vehicles-orphan-ids (round 1)

AUDITOR: subagent
PACKET: .sc/review/c4463fd-71e8f19f (dirty, base c4463fd)

COVERAGE (must_read.txt is empty: no entry point packaged; every file of files.txt read):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/vehicles/vehicles-ids-declared.test.ts | 1-140 | 140 | yes |
| tests/cards/vehicles/sci-fi-vehicles.test.ts | diff + 360-510 (the nine renamed tests and their comments) | 577 | no — unchanged bodies outside the nine tests not read; diff shows the only change is the nine title lines |
| docs/specs/cards/vehicles.md | diff (lines 16-22, 641-680) | 742 | no — only the touched rows and the F-VEH-D06 cell |
| docs/specs/vehicles-orphan-ids/spec.md | 1-130 | 130 | yes |
| docs/summaries/vehicles-orphan-ids/BUILD.md | 1-20 | 20 | yes |
| docs/summaries/vehicles-orphan-ids/SPEC.md | not read (summary, no behaviour) | 26 | no |
| docs/adversarial-review/vehicles-orphan-ids.md | not read (gate artifact) | 51 | no |
| docs/adversarial-review/history/vehicles-orphan-ids.round-01.md | not read (gate artifact) | 51 | no |

VERDICT: APPROVE
SPEC: docs/specs/vehicles-orphan-ids/spec.md

FINDINGS:
- [MEDIUM] tests/cards/vehicles/vehicles-ids-declared.test.ts:31 — if someone later lists in the F-CARD-07 cards row an id that the cards spec never declares, the guard still accepts a title citing it, and no test notices that this half of the check is gone — FR-1 (an F-CARD-07 id counts only if it is also a row head of `05_cards.md`) is implemented by the `.filter((id) => headsOf(cards).includes(id))` in `cardIds`, but no case exercises it: TC-VEHOI-U-07 (a non-vehicles cards head is refused) covers only the opposite half (a head that is not listed). Removing the filter leaves all 8 guard tests green (mutation below). Fix: add to TC-VEHOI-U-07 a fixture call `cardIds('| F-CARD-07 | x | y | tests/cards/vehicles/sci-fi-vehicles.test.ts :: ' + GHOST + ' |')` expecting `[]` (`cardIds` already takes the text as a parameter).
  RESOLUTION: fixed — TC-VEHOI-U-07 now calls cardIds on a fixture F-CARD-07 row listing GHOST (expects [] without a head, [GHOST] with one); re-run of the surviving mutant (filter removed) fails the guard (exit 1), restored 8/8 green.
  FIX-CLASS: corrects

MUTATION: tests/cards/vehicles/vehicles-ids-declared.test.ts:31 removed `.filter((id) => headsOf(cards).includes(id))` from cardIds — SURVIVED
MUTATION: tests/cards/vehicles/sci-fi-vehicles.test.ts title `TC-VEHICLES-U-1218:` reverted to `TC-V03:` — KILLED by TC-VEHOI-U-01
MUTATION: docs/specs/cards/vehicles.md row TC-VEHICLES-U-1221 deleted — KILLED by TC-VEHOI-U-01
MUTATION: docs/specs/cards/vehicles.md row TC-VEHICLES-U-1219 marked unplayed — KILLED by TC-VEHOI-U-05
MUTATION: tests/cards/vehicles/sci-fi-vehicles.test.ts `it(` of 1223 made `it.skip(` — KILLED by TC-VEHOI-U-06
MUTATION: tests/cards/vehicles/sci-fi-vehicles.test.ts title 1217 also cites TC-501 — KILLED by TC-VEHOI-U-01
MUTATION: docs/specs/cards/vehicles.md row TC-VEHICLES-U-1216 moved after the 1223 row — KILLED by TC-VEHOI-U-08
MUTATION: docs/specs/cards/vehicles.md note reverted to dix-sept — KILLED by TC-VEHOI-U-08
MUTATION: tests/cards/vehicles/sci-fi-vehicles.test.ts title 1219 rewritten `it.concurrent('TC-V04:` — KILLED by TC-VEHOI-U-01
(mutants run on scratch copies of the four files the guard reads; nothing written in the tree)

NOTES:
- The header comment and the `// ── TC-V0n` / `TC-1215` section comments keep the old ids: FR-5 accepted limit, not a defect.
- The `TC-508` row in docs/specs/05_cards.md only loosely matches the 1216 test (all fields, not `fuel_quantity` alone): the spec records it as not this lot's.
- docs/summaries/vehicles-orphan-ids/BUILD.md counts "cases +20 −9"; the lot adds 8 guard cases and renames 9 — a summary figure, no behaviour.
- The guard reads the real spec files from `process.cwd()`, as the weather precedent does; it is run from the repository root by the project's vitest config.

## ⚠️ Cannot verify from this diff
- IT-VEHOI-I-01..03 (the ⬜ rows played by commands at VERIFY): I ran `npx vitest run tests/cards/vehicles tests/specs/ids-cas-uniques.test.ts tests/specs/blueprint-traceability.test.ts` → 8 files, 108 tests passed, exit 0. The full vitest run (IT-VEHOI-I-03) was not run by this review.

CONFORMANCE EVIDENCE:
- FR-1 (every title id is declared) → tests/cards/vehicles/vehicles-ids-declared.test.ts:42-52 (declared set = vehicles.md heads + F-CARD-07 ids, both non-empty, orphans `toEqual([])`); four title forms → :55-66; non-vehicles cards head refused → :125.
- FR-2 (nine rows, in order, accurate) → docs/specs/cards/vehicles.md:665-673; each row matches its test body (sci-fi-vehicles.test.ts:187-190, 369-404, 408-421, 425-434, 438-441, 445-458, 462-475, 479-492, 496-500); F-VEH-D06 cell → vehicles.md:19; note `vingt-six` → vehicles.md:644; guarded by :68-69, :96-114, :127-129, :132-139.
- FR-3 (nine titles, only the id token changes) → `git diff c4463fd -- tests/cards/vehicles/sci-fi-vehicles.test.ts`: exactly nine `-`/`+` pairs, each an `it(` title with only the id swapped, `TC-508` kept on the 1216 title (line 369).
- FR-4 (no retired id, no skip-like modifier) → guard :34-35, :90-94, :116-122.

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 1 | info |
| LOW | 0 | note |

# Code review — vehicles-orphan-ids (round 2, delta)

AUDITOR: subagent
PACKET: .sc/review/c4463fd-98df3322 (delta since .sc/review/c4463fd-71e8f19f)

COVERAGE (must_read.txt is empty; scope = delta.txt files that carry behaviour + closure of round 1's finding and survivor):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/vehicles/vehicles-ids-declared.test.ts | 1-143 | 143 | yes |
| docs/reviews/vehicles-orphan-ids/code-review.md | 1-70 (round 1) | 70 | yes |
| docs/specs/vehicles-orphan-ids/spec.md | FR-1 (line 40), TC table rows 91-101 | 130 | no — out of delta, only the clauses the fix serves |
| docs/reviews/vehicles-orphan-ids/history/*, security-review.md | not read (gate artifacts, no behaviour) | - | no |

VERDICT: APPROVE
SPEC: docs/specs/vehicles-orphan-ids/spec.md

FINDINGS:
(none in this round — 0 CRITICAL, 0 HIGH, 0 MEDIUM, 0 LOW)

Closure of round 1:
- F-01 (the MEDIUM at tests/cards/vehicles/vehicles-ids-declared.test.ts:31: the "F-CARD-07 id must also be a cards row head" filter was untested) — closed. tests/cards/vehicles/vehicles-ids-declared.test.ts:127-129 adds a fixture F-CARD-07 row listing GHOST: `cardIds(fx(''))` must be `[]` (kills the filter's removal) and `cardIds(fx('| GHOST | a | b |'))` must be `[GHOST]` (kills an over-strict filter). The fixture's F-CARD-07 line is not itself taken as a head (`F-CARD-07` does not match the TC|IT|UT id pattern of headsOf, :14/:18), so the negative case is sound.

MUTATION: tests/cards/vehicles/vehicles-ids-declared.test.ts:31 removed `.filter((id) => headsOf(cards).includes(id))` from cardIds — KILLED by TC-VEHOI-U-07
(run on scratch copies outside the tree, cwd = worktree root so the guard reads the real specs: original copy 8/8 green; mutant copy fails TC-VEHOI-U-07 only — `AssertionError: expected [ 'TC-GHOST-U-99' ] to deeply equal []` at the :128 assertion; nothing written in the tree)

NOTES:
- OUT-OF-DELTA: the TC-VEHOI-U-07 row of docs/specs/vehicles-orphan-ids/spec.md:97 still describes only the TC-501 / TC-508 / F-VEH-D06 checks, not the two new fixture assertions; the test does strictly more than its row, nothing it promises is missing. A wording sync for the author, not a defect of the delta.
- The mutant leaves TC-VEHOI-U-01 green: the real F-CARD-07 row lists only TC-508, which is a head, so the filter is idle on real data — exactly why the fixture was the right fix.

CONFORMANCE EVIDENCE:
- FR-1 (an F-CARD-07 id counts only if it is also a 05_cards.md row head) → tests/cards/vehicles/vehicles-ids-declared.test.ts:31 implemented, :127-129 now exercises both halves; :125-126 keeps the non-vehicles-head half.
