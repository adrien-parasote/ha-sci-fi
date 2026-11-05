# SPEC - editor-inputs-theme (stage summary)

**Decided:**
- D1 neutral rendering: each new --editor-* token keeps today's literal as fallback (user 2026-11-05).
- D2 inheritance from :host: card editors declare the family in editor-common; inputs never import it.
- D3 the six --_* locals of sf-editor-accordion are removed, replaced by --editor-* tokens.
- D4 one token per role, no color-mix; FR-12 water-card accordion loses HA chaining: ACCEPTED-LIMIT (user).
- FR-13: ADR-018 gets a 2026-11-05 addendum; CI checkout gets fetch-depth: 0 (user accepted) for TC-EIT-I-05.
- Spike: no. Review regime: fan-out.

**Artifacts:**
- docs/specs/editor-inputs-theme/spec.md
- docs/specs/03_base_classes.md (two-tier editor section rewritten)
- docs/adr/ADR-018_palette-fixed-identity.md (addendum)
- docs/adversarial-review/editor-inputs-theme.md (12 findings: 11 RESOLVED, 1 ACCEPTED; builder check)

**Open/risky:**
- The baseline tests/styles/editor-inputs-css-baseline.json must be generated on the pre-port code and committed ALONE in a WIP commit before any src/ change (TC-EIT-I-05 ties it to base 5251aa3).
- The var() resolver (spec section Resolver) must handle nested parentheses; negative controls TC-EIT-U-07 / I-04 must go red on a mutated fallback.
- .github/workflows/ci.yml is in scope (fetch-depth: 0 only).
- The ADR addendum and the review's Builder check were appended via a shell heredoc, not Edit (content checked correct).

**Next action:** BUILD - generate and commit the baseline first, then the tests (TDD), then port the 11 components.

**Tests:** files +22 ~25 −1 · cases +123 −35 · 9 earlier test file(s) edited, none lost a case
