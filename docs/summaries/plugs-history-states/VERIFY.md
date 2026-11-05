# VERIFY - plugs-history-states (stage summary)

**Decided:**
- Security review DEPLOY, code review APPROVE (both minted before this stretch).
- doc-update gate PASS (docs/ modified by the lot).
- verify.py PASS: 14 passed, 0 failed, 3 advisory, 3 skipped. Cold boot (`.sc/smoke.yaml`, `npm run build`) PASS.
- P8 advisory (HistoryAttempt, HistoryStatus "missing_in_code") left unsuppressed: both are module-private types in src/cards/plugs/sci-fi-plugs.ts, not exports; a heuristic false positive.
- P7 advisory (max_cc, max_fn_lines, god files) is base debt, not written by this lot; not blocking.
- P0 high (hardcoded secret, tests/cards/bridge/bridge-error-matrix.test.ts:399) is outside this lot's diff; noted, not suppressed.

**Artifacts:**
- docs/reviews/plugs-history-states/code-review.md
- docs/reviews/plugs-history-states/security-review.md
- docs/adversarial-review/plugs-history-states.md
- docs/specs/plugs-history-states/spec.md

**Intent items touched:** none (no intent trace; intent gate skipped).

**Open/risky:** .verifyignore carries a rejected pattern 'P8:*:*' (warned, ignored by verify.py). Pre-existing P0 high finding in a bridge test file.

**Dead ends:** none.

**Next action:** HARDEN: /harden-stage (learn-eval, then the commit).

**Tests:** files +1 ~1 −0 · cases +35 −4
