# VERIFY summary - bare-range-ids

Proofs: doc-updated, verify-passed, coldboot-passed (this stretch); codereview-passed APPROVE, security-passed DEPLOY (earlier, still fresh).
Reports: docs/reviews/bare-range-ids/code-review.md, docs/reviews/bare-range-ids/security-review.md
verify.py: 14 pass, 0 fail, 3 advisory (P7, P8 src/sci-fi.js, P15 pre-existing), 3 skip.
Vitest full: 105 files, 1294 tests passed.
IT-BRI-I-01: diff vs 303317a on specs = docs/specs/03_base_classes.md, docs/specs/11_guidelines_remediation.md (4 ins, 2 del); new guard tests/utils/bare-range-ids-declared.test.ts untracked.
Note: verify.py rebuilt dist/sci-fi.min.js (modified in tree) - do NOT commit dist.
Next: HARDEN (commit lot, no dist).

**Tests:** files +1 ~0 −0 · cases +6 −0
