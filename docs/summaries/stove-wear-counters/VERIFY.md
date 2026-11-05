# VERIFY - stove-wear-counters (stage summary)

**Decided:**
- Code review APPROVE (1 LOW fixed: JSDoc in sci-fi-stove.ts); security DEPLOY round 2.
- doc-update: user doc gained the five wear-counter options + feature line; spec doc already carried FR-13 (F-STOVE-D12, Usure section, selectors, matrix row).
- verify.py full run PASS (15 pass, 0 fail, 3 advisory, 2 skip); intent gate 4/4; cold boot PASS.
- No .verifyignore added; advisories are pre-existing, outside the lot (bridge test fake secret, dev icon-browser innerHTML, sentrux god files, translate_xlf.py / src/sci-fi.ts reachability, orphan TC-VACUUM ids).

**Artifacts:**
- docs/reviews/stove-wear-counters/code-review.md, security-review.md, history/
- docs/cards/stove.md
- docs/specs/cards/stove.md
- docs/intent-trace/stove-wear-counters.yaml

**Intent items touched:** IA-SWC-1..4 proven (no served proof: warn mode, reported).

**Open/risky:** TC-SPL-U-1129 timing stayed green in this run. WIP commits d78c145 and the doc commit to be squashed/reworded at HARDEN. No push.

**Dead ends:** none.

**Next action:** HARDEN - invoke /harden-stage (learn-eval, then the exit commit).

**Tests:** files +1 ~4 −0 · cases +15 −1 · 3 earlier test file(s) edited, none lost a case
