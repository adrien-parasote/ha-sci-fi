# VERIFY — behavioural-test-gaps (stage summary)

**Decided:**
- Reviews closed: code round 2 APPROVE, security DEPLOY; both re-recorded `--auditor subagent` after verify.py rebuilt dist (only dist moved).
- doc-update: spec got an additive "Reconciliation with BUILD" section (plan shape, guards edited outside write sets, audit ids in comments, TC-LIGHTS-U-005 plus sun.sun, vacuum title, hexa canary reads --tile-width on host).
- verify.py full run PASS; coldboot fresh; no UI walk, no intent trace owed.
- dist/ rebuilt, never staged; no bypass minted.

**Artifacts:**
- docs/specs/behavioural-test-gaps/spec.md
- docs/reviews/behavioural-test-gaps/code-review.md
- docs/reviews/behavioural-test-gaps/security-review.md
- docs/adversarial-review/behavioural-test-gaps.md

**Intent items touched:** none.

**Open/risky:**
- Two LOW fixes (vehicles styles fixture, vehicles.md note) post-date the reviewer APPROVE; tests only.
- Left out: IT-TV-I-701/702, plugs P3 (bead ha-sci-fi-8ap).
- Commit must stage the lot's files by name; never dist/, .sc/, .agents/.

**Dead ends:** none.

**Next action:** HARDEN: learn-eval, full vitest, tsc x2, eslint, commit on branch (no merge, no push).

**Tests:** files +1 ~24 −0 · cases +41 −19 · 9 earlier test file(s) edited, none lost a case
