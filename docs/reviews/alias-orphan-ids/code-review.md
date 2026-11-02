AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| tests/cards/plugs/alias-ids-declared.test.ts | 1-88 | 88 | yes |
| tests/cards/plugs/sci-fi-plugs.test.ts | diff hunk 59-70 | see packet | diff only (title-only change) |
| tests/cards/vehicles/sci-fi-vehicles.test.ts | diff hunk 55-66 | see packet | diff only (title-only change) |
| docs/specs/cards/plugs.md | diff hunk 102-108 | see packet | diff only |
| docs/specs/cards/vehicles.md | diff hunk 108-114 | see packet | diff only |
| docs/specs/alias-orphan-ids/spec.md | 1-93 | 93 | yes |
VERDICT: WARNING
SPEC: docs/specs/alias-orphan-ids/spec.md
FINDINGS:
- [LOW] tests/cards/plugs/alias-ids-declared.test.ts:62 — if an old title start came back without its alias form (e.g. a copy-paste re-adding a second title line), nothing in the check would say "old start present"; the case named by TC-AOI-U-03 (no alias under tests/, new title starts present, old ones absent) does not assert the absence of the four old starts — it relies indirectly on the alias walk at line 59-61. Add an explicit `not.some(t.startsWith(oldStart))` per FR-2 (the four title renames) row.
  RESOLUTION: fixed — TC-AOI-U-03 now asserts no title starts with the old `<id>,` form (alias-ids-declared.test.ts, vitest 5/5 green)
- [LOW] tests/cards/plugs/alias-ids-declared.test.ts:50 — a regression that broke the vehicles half of the alias pattern (`VEH`) would leave TC-AOI-U-02 (detector flags an alias in three title forms) green: every fixture uses only the plugs alias; add one vehicles-alias fixture.
  RESOLUTION: fixed — TC-AOI-U-02 gains a vehicles-alias fixture (vitest 5/5 green)
- [LOW] tests/cards/plugs/alias-ids-declared.test.ts:83 — a global-flag regex (`ALIAS_RE`, flag `g`) passed to `toMatch` carries `lastIndex` state between calls, so the result can depend on call order; use a non-global copy for `toMatch`/`test`.
  RESOLUTION: fixed — toMatch now takes a non-global copy `new RegExp(ALIAS_RE.source)` (vitest 5/5 green)
NOTES:
- vitest on tests/cards/plugs, tests/cards/vehicles, tests/specs: 16 files, 240 tests green (reviewer run).
- Spec typo in Builder Calls (missing newline before "Skip pattern") is cosmetic, not a code defect.
CONFORMANCE EVIDENCE:
- FR-2 (four titles lose alias): tests/cards/plugs/sci-fi-plugs.test.ts:62,67; tests/cards/vehicles/sci-fi-vehicles.test.ts:58,63 — title strings only.
- FR-4 (tree lines): docs/specs/cards/plugs.md:105, docs/specs/cards/vehicles.md:111; tables untouched (asserted at alias-ids-declared.test.ts:84-85).
- FR-1 (guard, fragment-built): alias-ids-declared.test.ts:14-31, no literal alias or card id in source.
- FR-3 (no skip): alias-ids-declared.test.ts:67-72.

## ROUND 2 (delta, packet .sc/review/d853b95-0bd0c27b)
AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| tests/cards/plugs/alias-ids-declared.test.ts | delta hunks + 31-90 | 94 | yes (delta scope) |
| docs/reviews/alias-orphan-ids/code-review.md | 1-26 | 26 | yes |
| docs/reviews/alias-orphan-ids/security-review.md | 1-15 | 15 | yes |
VERDICT: APPROVE
SPEC: docs/specs/alias-orphan-ids/spec.md
FINDINGS:
none
CLOSURE OF ROUND 1:
- R1 LOW alias-ids-declared.test.ts:62 (old title starts not asserted absent) — closed: lines 67-70 derive each id from NEW_STARTS and assert no title starts with `<id>,`.
- R1 LOW alias-ids-declared.test.ts:50 (no vehicles-alias fixture) — closed: lines 55-56 add a vehicles-alias fixture.
- R1 LOW alias-ids-declared.test.ts:83 (global regex in toMatch) — closed: line 90 uses `new RegExp(ALIAS_RE.source)`.
NOTES:
- vitest tests/cards/plugs/alias-ids-declared.test.ts: 5/5 green (reviewer run).
CONFORMANCE EVIDENCE:
- TC-AOI-U-03 (old title starts absent): tests/cards/plugs/alias-ids-declared.test.ts:67-70.
- TC-AOI-U-02 (detector covers both aliases): tests/cards/plugs/alias-ids-declared.test.ts:52-56.
VERDICT: APPROVE
