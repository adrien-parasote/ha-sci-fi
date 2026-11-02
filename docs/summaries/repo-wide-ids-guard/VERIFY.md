# VERIFY — repo-wide-ids-guard (stage summary)

**Decided:**
- doc-update, verification-loop (verify.py 13 pass, P13 fixed), cold boot all minted; intent gate not owed (no trace).
- P13 refused F-09 citing IT-RWG-I-03 (a command row, no test): re-cited TC-RWG-U-07 on the finding line.
- verify.py rebuilds dist/sci-fi.min.js, which moves the hash of source-scoped proofs; code and security verdicts re-recorded (APPROVE, --auditor subagent) after the last run. Reports unchanged.
- Advisories left as judgment: P7 sentrux (base debt), P15 reachability (files outside this lot).

**Artifacts:**
- docs/reviews/repo-wide-ids-guard/code-review.md, security-review.md
- docs/adversarial-review/repo-wide-ids-guard.md (F-09 line re-cited)
- docs/specs/repo-wide-ids-guard/spec.md

**Open/risky:**
- dist/sci-fi.min.js is modified by the build: `git restore dist/sci-fi.min.js` before any commit, then re-earn codereview/security/verify/coldboot (`scr.py run`, review_gate.py --auditor subagent) if HARDEN reports them stale.
- Flaky timing tests (socle-contract 5000ms, IT-202 10ms) did not fail on the final run.

**Next action:** HARDEN: learn-eval, restore dist, commit (no push).

**Tests:** files +1 ~5 −0 · cases +40 −11
