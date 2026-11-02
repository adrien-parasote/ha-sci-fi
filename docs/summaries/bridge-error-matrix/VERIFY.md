# VERIFY — bridge-error-matrix (stage summary)

**Decided:**
- verify.py PASS (16 pass, 0 fail, 2 advisory: P7 sentrux base debt, P15 reachability on files this lot does not own); coldboot-passed.
- Spec IT rows IT-BEM-I-01..05 played as vitest: tests/cards/bridge 16 files, 280 tests green (full suite green inside verify P4, tsc + eslint PASS).
- security-passed re-recorded (DEPLOY, auditor subagent) after dist/sci-fi.min.js hash moved by the build; src unchanged.
- doc-updated minted (twice: review history file moved docs/).
- CODE REVIEW closed under a USER-minted .sc/codereview-bypass: an unreachable `_trigger` guard was removed in-lot (the disabled button suffices), round 3 APPROVE with no finding, src unchanged since round 2. Proof left untouched.
- intent-gate skipped (no intent trace); ui-walk not owed (no UI surface recipe, serves-ui false).

**Artifacts:** docs/reviews/bridge-error-matrix/code-review.md, docs/reviews/bridge-error-matrix/security-review.md, docs/adversarial-review/bridge-error-matrix.md, docs/specs/bridge-error-matrix/spec.md, docs/specs/cards/bridge.md

**Intent items touched:** none

**Open/risky:** dist/sci-fi.min.js is modified by builds: `git restore dist/sci-fi.min.js` before any commit. node_modules is a link to the main tree (verify warning). Flaky timing tests (socle-contract 5000ms, IT-202 10ms) did not fire this run.

**Dead ends:** none

**Next action:** HARDEN: learn-eval, then the commit (no push, no dist/).

**Tests:** files +3 ~2 −0 · cases +23 −1 · 1 earlier test file(s) edited, none lost a case
