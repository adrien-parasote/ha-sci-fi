# VERIFY — bridge-unrendered-config (stage summary)

**Decided:**
- Code review APPROVE (2 rounds), security DEPLOY (round 1 + delta); all findings fixed, proofs re-recorded after the dist rebuild (--auditor subagent).
- doc-update: specs already amended in-lot (bridge.md, 10_card_editors.md); doc_audit findings are ghost-fn noise (lit methods), no real drift.
- verify.py PASS (20 checks, 0 failed); cold boot passed; intent gate skipped (no trace).
- P15 advisories (translate_xlf.py, sci-fi.ts, config-metadata.ts) are outside the lot's diff: not touched, not a defect of this lot.
- P7 sentrux advisory: pre-existing god file / cc; no new violation by this lot.

**Artifacts:**
- docs/specs/bridge-unrendered-config/spec.md
- docs/reviews/bridge-unrendered-config/code-review.md
- docs/reviews/bridge-unrendered-config/security-review.md
- docs/adversarial-review/bridge-unrendered-config.md
- docs/specs/cards/bridge.md, docs/specs/10_card_editors.md
- tests/cards/bridge/bridge-unrendered-config.test.ts
- src/locales/locales/fr.js, xliff/fr.xlf

**Intent items touched:** none.

**Open/risky:**
- dist/sci-fi.min.js is rebuilt by verify.py: never commit it.
- localize-build must run after localize-extract or new French strings stay English; makeMockHass hardcodes fr locale.
- Follow-up beads: xliff/fr.js id parity test; guard on `.entity` in sf-bridge-actions.ts / sf-bridge-appliances.ts.

**Dead ends:** none.

**Next action:** HARDEN: learn-eval, refactor-clean judgment, then exit commit via scr.py commit-check.

**Tests:** files +1 ~0 −0 · cases +20 −0
