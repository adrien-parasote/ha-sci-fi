# SPEC — behavioural-test-gaps (stage summary)

**Decided:**
- All five families in one lot, five disjoint write sets (FR-9): A tv, B hexa-tiles, C vacuum, D climates + lights, E cross-card.
- Test-only lot except the tv dial in src/cards/tv/sci-fi-tv.ts: FR-1 angle fix, FR-12 zero-size guard, FR-13 move-time guard (user decisions).
- FR-14: a tap on the volume readout gives 0 or 1, accepted and pinned (TC-BTG-U-22). The radial guard is bead ha-sci-fi-9zpl.
- Vacuum battery and mop pinned as observed (FR-4), including the wart "unavailable%".
- Every added test names a mutant, run on a scratch copy (FR-7). Audit rows U-16..19 are exempt from the one-title rule (FR-10).
- Adversarial: 14 findings closed, 13 resolved, 1 accepted. Builder check done, nothing left for the user. Spike declined. Build mode: headless.

**Artifacts:**
- docs/specs/behavioural-test-gaps/spec.md
- docs/adversarial-review/behavioural-test-gaps.md
- Card specs to edit at BUILD: docs/specs/cards/{tv,hexa-tiles,vacuum,climates,lights,vehicles}.md

**Intent items touched:** none

**Open/risky:**
- Family E's tests/helpers/blank-comments.ts (+ its test, TC-BTG-U-35) must land before C's TC-BTG-U-32, which imports it.
- Assumption 4: whether happy-dom resolves adopted sheets is unmeasured. The IT-BTG-I-03 canary decides the branch.
- Assumption 3: the pointer-capture methods may need stubs in happy-dom.
- vacuum.md rows TC-VACUUM-U-1537/1538 are written unmarked (no ⬜).
- The 25 ⬜ rows close with ids-cas-uniques both ways; only tv IT-701/702 keep theirs.

**Dead ends:** none

**Next action:** BUILD: fan out the families (E helper first), tests red before green, mutants on a scratch copy, tv src changes only in family A.
