# VERIFY — water-spec-arbitration (stage summary)

**Decided:**
- doc-update closed (doc-updated proof minted by `scr.py run`).
- verify.py full run PASS after fixing 10 TS2532/TS2345 errors in the new test file (non-null assertions, no behaviour change).
- The build moved dist/sci-fi.min.js hash only: code and security verdicts re-recorded with `review_gate.py --auditor subagent` (APPROVE / DEPLOY), recorded rounds untouched.
- Cold boot passed; intent gate: nothing to prove.
- IT-WSA-I-01..03 played once with WSA_PROVE_LOT=1: 11/11 pass.
- dist/ is modified by the build and must NOT be committed.

**Artifacts:**
- docs/specs/water-spec-arbitration/spec.md
- docs/specs/cards/water_history.md (modified)
- tests/cards/water/water-history-aligned.test.ts (untracked, new)
- docs/reviews/water-spec-arbitration/code-review.md
- docs/reviews/water-spec-arbitration/security-review.md
- docs/adversarial-review/water-spec-arbitration.md

**Intent items touched:** none.

**Open/risky:** Known-gap beads all still OPEN (not in this lot): ha-sci-fi-9vv rd4 1k7 ijw ln3 xrc 5aw p5a 7kb (P3/P4 water bugs and doc drift). Review round counter is past the cap (round 4), advisory only. Timing-flaky tests (socle-contract, entity.selectors IT-202) not hit this run.

**Dead ends:** none.

**Next action:** HARDEN: invoke /harden-stage, learn-eval, then the exit commit (exclude dist/).

**Tests:** files +1 ~0 −0 · cases +11 −0
