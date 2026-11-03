# BUILD — sf-token-declarations (stage summary)

**Decided:**
- FR-1 re-measure matched the spec: 36 undeclared = 11 settled + 4 hooks + 21 open card names; no socle file reads an open name; no spec amendment needed.
- Drift guard (FR-4) found the FR-6 socle drifts (exactly the 4 rows) plus 17 card entries, now in OPEN_DRIFT (families bridge/hexa-tiles/stove/vacuum).
- Deviation from the spec's file list, said here (spec left frozen): shared scanner, tables helper and chain helper live in tests/styles/token-scan.ts (a test file cannot be imported by another without duplicating its describes); TC-SFT-U-04 and IT-SFT-I-01 sit in token-refs.test.ts, not in token-declarations.test.ts.
- IT-SFT-I-02 happy-dom canary passed (var() resolves through :host, nested shadow roots, alias chains): no CSS-text fold needed.
- FR-8 baseline diff: 132 added lines (12 declarations x 11 cards), 0 removed.
- bd show: all 8 follow-up beads exist and are open (yj6, 03i, xi7, rhd, 3z0j, 7ge9, gmvv, td4b).

**Artifacts:**
- src/styles/common.ts, src/components/sf-hexa-tile.ts, sf-hexa-row.ts, sf-wheel.ts, src/components/buttons/sf-button-card.ts
- tests/styles/token-refs.test.ts, token-declarations.test.ts, token-scan.ts, card-css-baseline.json
- docs/adr/ADR-018_palette-fixed-identity.md, docs/specs/03_base_classes.md
- .sc/smoke.yaml (run recipe), .sc/task.md

**Intent items touched:** none.

**Open/risky:**
- Full vitest 1563 passed / 1 skipped, tsc both configs, eslint src+tests clean.
- dist is rebuilt by verify.py and must never be staged; .sc/ and .agents/ neither.
- Commit message must record: bd show result, FR-1 delta none, baseline added lines, spec deviation above.

**Dead ends:** rename --sf-text-* to --sf-font-size-* (rem renders 18px).

**Next action:** VERIFY: verify.py, then fresh-context code-reviewer and security-reviewer.

**Tests:** files +1 ~1 −0 · cases +16 −1
