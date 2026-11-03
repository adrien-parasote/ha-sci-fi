# VERIFY — config-error-card (stage summary)

**Decided:**
- verify.py PASS (16 pass, 2 advisory, 2 skip); vitest 125 files / 1531 passed / 1 skipped earlier, tsc both configs clean.
- Code review APPROVE and security review DEPLOY re-recorded (--auditor subagent, reports by fresh reviewers) after verify rebuilt dist/sci-fi.min.js (only moved file).
- doc-updated minted; coldboot-passed minted; intent gate skipped (no trace).
- ui-walk could not run (no browser surface in smoke.yaml); exit satisfied through the any-branch (lot not UI-served per frame_check), not a bypass.

**Artifacts:**
- docs/reviews/config-error-card/code-review.md
- docs/reviews/config-error-card/security-review.md
- docs/adversarial-review/config-error-card.md
- docs/specs/config-error-card/spec.md
- docs/specs/cards/bridge.md, docs/specs/02_domain_selectors.md, docs/specs/03_base_classes.md

**Open/risky:**
- P15 advisory: src/cards/bridge/config-metadata.ts flagged "nothing imports it"; translate_xlf.py and src/sci-fi.ts also flagged (pre-existing/entry points).
- P7 advisory: sentrux max_cc / max_fn_lines / god-file rules (not lot-attributed).
- dist/sci-fi.min.js is rebuilt by verify; never stage it. Restoring it stales verify/review proofs.
- Adversarial review exceeded fix-round cap (round 2); 0 unresolved findings.

**Next action:** HARDEN: learn-eval, then commit on feat/config-error-card (-F file, Closes ha-sci-fi-l3z); stage only lot files.

**Tests:** files +2 ~7 −0 · cases +26 −0 · 7 earlier test file(s) edited, none lost a case
