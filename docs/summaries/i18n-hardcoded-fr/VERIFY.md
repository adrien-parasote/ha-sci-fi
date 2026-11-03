# VERIFY — i18n-hardcoded-fr (stage summary)

**Decided:**
- IT-I18N-I-04 played as a command: `npm run localize-extract` then `npm run localize-build`, idempotent. md5 `xliff/fr.xlf` 133a0d8afc15c9342765adb2e0fe3e2a, `src/locales/locales/fr.js` 5a24bb96509fd6972df841b9260f0ea6, 359 trans-units (326 + 33, no orphan).
- Review history: security DEPLOY in 1 round. Code review APPROVE after 4 rounds (12 findings, all fixed with tests, RESOLUTION lines in the report). The gate accepted rounds beyond the cap of 2 (advisory warning only).
- Spec repairs at VERIFY: FR-10 was glued to FR-9's line (spec gate: "FR-10 cited but not defined"), split onto its own line; `hexa-tiles.md` row 706 no longer cites `TC-I18N-U-06` (P14 duplicate ID across features), now links the spec.
- verify.py full run PASS (3 advisories); dist/ rebuilt by it, never committed. Both review verdicts re-recorded with --auditor subagent after the rebuild. Cold boot passed. Intent gate skipped (no trace).

**Artifacts:** docs/reviews/i18n-hardcoded-fr/code-review.md, docs/reviews/i18n-hardcoded-fr/security-review.md, docs/adversarial-review/i18n-hardcoded-fr.md, docs/specs/i18n-hardcoded-fr/spec.md, xliff/fr.xlf, src/locales/locales/fr.js, tests/i18n/

**Intent items touched:** none.

**Open/risky:** FR-13 limit (unaccented French on no list, French built from several literals) is user-accepted. Never stage dist/, .sc/, .agents/.

**Dead ends:** none.

**Next action:** HARDEN: /harden-stage, learn-eval, refactor-clean judgment, exit commit via `scr.py commit-check`.

**Tests:** files +3 ~3 −0 · cases +34 −3 · 1 earlier test file(s) edited, none lost a case
