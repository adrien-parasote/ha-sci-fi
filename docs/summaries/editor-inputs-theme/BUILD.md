# BUILD - editor-inputs-theme (stage summary)

**Decided:**
- Baseline generated on pre-port code (src identical to 5251aa3) and committed alone (7899ad2).
- 29 --editor-* tokens declared in editor-common :host; 10 editor-inputs ported (dropdown-icon unchanged); accordion --_* locals removed.
- CI quality checkout: fetch-depth: 0.
- Form amendment (orchestrator, headless, no product change): TC-EIT-I-01..05 renamed IT-EIT-I-01..05 (repo id-shape guard TC-RWG-U-05) in spec, review and test; Carriers & Consumers table reshaped (file first, FR in a Covers column) for blueprint-traceability O1. Spec-gate and adversarial re-earned. Test re-locked with --reason.
- Test reuses tests/helpers/blank-comments.ts.

**Artifacts:**
- tests/styles/editor-inputs-theme.test.ts
- tests/styles/editor-inputs-css-baseline.json
- src/styles/editor-common.ts
- src/components/editor-inputs/*.ts
- .github/workflows/ci.yml
- docs/specs/editor-inputs-theme/spec.md (amended)

**Open/risky:**
- test_reduce.py plan crashes (tr_typescript.py JSON truncated at 64 KiB): test-compacted needs the user's .sc/test-compacted-bypass.

**Next action:** VERIFY.

**Tests:** full suite 152 files, 1725 passed, 1 skipped; tsc and eslint clean.
