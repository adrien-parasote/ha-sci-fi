# VERIFY - stove-pellet-cost (stage summary)

**Decided:**
- Code review: round 1 BLOCK, fixed in diff (TC-SPC-U-05 amended to bite the hass.language fallback; lint fix `st?.attributes` in sci-fi-stove.ts), round 2 APPROVE. Security review: DEPLOY.
- doc-update: docs already moved in BUILD (docs/cards/stove.md Pellet cost section, F-STOVE-D13, selector table, label count); gate PASS. CHANGELOG left to release-manager at release time.
- verify.py: 16 pass, 0 fail, 2 advisory. P8 advisory (FR not covered by plan tasks) is a plan-bypass artefact of the feature lane, left unsuppressed; P14 orphan ids TC-VACUUM-U-1/2 are outside this lot.
- Cold boot (`npm run build`) passed; it rewrote tracked dist/sci-fi.min.js (expected).
- Intent gate skipped: no intent trace for this lot.

**Artifacts:** docs/reviews/stove-pellet-cost/code-review.md, docs/reviews/stove-pellet-cost/security-review.md, docs/specs/stove-pellet-cost/spec.md (TC-SPC-U-05), tests/cards/stove/sci-fi-stove-pellet-cost.test.ts, src/cards/stove/sci-fi-stove.ts (lint fix), dist/sci-fi.min.js, docs/summaries/stove-pellet-cost/VERIFY.md

**Intent items touched:** none

**Open/risky:**
- sci-fi-stove.ts at 789/790 lines (TC-SWC-U-09): no room left.
- P7 advisory: sci-fi-stove.ts god file (fan-out, pre-lot); not blocking.
- All changes since 7ea8dfd (wip BUILD commit) are uncommitted; HARDEN commit gate is the integration commit.
- After HARDEN: wiki ha-sci-fi-wiki/Stove.md update; tell the user to set `pellet_cost: input_number.pellet_cout_saison`.

**Dead ends:** none

**Next action:** HARDEN - /harden-stage (learn-eval, then the commit).

**Tests:** files +1 ~2 −0 · cases +16 −0 · 2 earlier test file(s) edited, none lost a case
