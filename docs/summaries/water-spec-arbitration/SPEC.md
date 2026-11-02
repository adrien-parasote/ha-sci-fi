# SPEC — water-spec-arbitration (stage summary)

**Decided:**
- water.md is the reference; water_history.md is aligned on it and on the code (user, 2026-11-02). Docs-only lot, src/ untouched.
- Aligned: 7-day window, history/history_during_period then logbook/get_events fallback, trigger = floor load + sync button (expanded dormant, D21), log in every accordion, 2 filters (all, alerts).
- Offline/cache requirement withdrawn; bead 1k7 stays open (D12).
- Code defects go to a Known Gaps section, one bead each (D01 D07 D12 D14 D15 D20-D24); ids cited by tests are not renumbered.
- spike-offer=no, build-mode=headless. spec-gate PASS first run (1 advisory warn).

**Artifacts:**
- docs/specs/water-spec-arbitration/spec.md (FR-1..FR-10)
- docs/specs/cards/water_history.md (already rewritten in SPEC)
- .sc/reports/spec-precheck-water-spec-arbitration.json

**Intent items touched:** none.

**Open/risky:**
- BUILD to create tests/cards/water/water-history-aligned.test.ts: TC-WSA-U-01..08, IT-WSA-I-01..03, each id literal in an it() title.
- Guard must NOT spell IT-/TC-WATER-HISTORY ids as literals (build from fragments), nor sit under tests/specs/.
- Zone-anchored phrase checks only; prove the guard fails via an in-memory mutant.
- Existence of the 10 Known Gaps beads checked by bd show at VERIFY.

**Dead ends:**
- guard under tests/specs/ (citations not counted)
- file-wide phrase matching (false passes)
- editing src/ (separate fix lots)

**Next action:** BUILD: read the spec, write the guard test, run it plus npx vitest run tests/specs tests/docs/spec-numbering.test.ts.

**Tests:** files +7 ~9 −1 · cases +122 −61 · 1 earlier test file(s) edited, none lost a case
