# VERIFY - stove-fan-speed (stage summary)

**Decided:**
- Code review APPROVE, security review DEPLOY, 0 findings.
- doc-update: docs/specs/cards/stove.md already updated at BUILD; gate passed.
- No ui-walk step in this lane's VERIFY sequence.
- verify.py PASS (3 advisories: P7 sentrux, pre-existing base debt; P8 plan coverage, plan bypassed by authorize-feature; P15 translate_xlf.py / src/sci-fi.ts, outside the lot). No .verifyignore entry added.
- intent gate PASS (warn: no served proof for IA-SFS-1..5); cold boot PASS.

**Artifacts:**
- docs/reviews/stove-fan-speed/code-review.md, security-review.md
- docs/summaries/stove-fan-speed/VERIFY.md
- bead ha-sci-fi-dzat (eit-base parallel flake)

**Open/risky:**
- src/cards/stove/sci-fi-stove.ts near 800-line cap.
- dist/sci-fi.min.js rebuilt by verify, left uncommitted.
- test-compacted bypass still active (user).

**Next action:** HARDEN - /harden-stage: learn-eval, then the commit.
