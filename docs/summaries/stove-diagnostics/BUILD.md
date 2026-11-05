# BUILD - stove-diagnostics (stage summary)

**Decided:**
- FR-0 snapshot committed alone on pre-lot code (84c42eb), before any change to sci-fi-stove.ts. The write gate refuses source before the TDD lock, so the order was: snapshot, RED tests + lock, then the FR-1 move (card at 691 lines), then the diagnostics. Card at 775 lines at the end.
- Pure helpers in src/cards/stove/diagnostics.ts (planned; FR-2 permits it), stateLabel stays a private card method.
- Spec defect: TC-SPL-U-1121 read DOMAIN.NUMBER from the card source, and the move relocates it. FR-1/FR-2 amended (sc_patch) and the test now reads number-wheel.ts.
- Object.hasOwn is outside the tsconfig lib (ES2022 missing): Object.prototype.hasOwnProperty.call, same semantics.
- sf-icon reads --icon-width/--icon-height: the badge sets those as well as --icon-size (FR-8).
- Counted guards moved: domain-site-table 114->117 (NUMBER/INPUT_NUMBER -> number-wheel.ts, BINARY_SENSOR+2 SENSOR in diagnostics.ts); .temperatures five->six lines; 10_card_editors.md label count 187->190 (155->158); stove.md tree gains _renderDiagnosticBadge and _renderDiagnostics; card-css-baseline regenerated (diagnostic rules only).

**Artifacts:**
- src/cards/stove/number-wheel.ts, src/cards/stove/diagnostics.ts
- src/cards/stove/{sci-fi-stove,config,styles,sci-fi-stove-editor,labels}.ts, src/types/ha.ts
- xliff/fr.xlf, src/locales/locales/fr.js
- tests/cards/stove/sci-fi-stove-diagnostics.test.ts (+ __snapshots__), tests/cards/stove/diagnostics.test.ts
- docs/specs/stove-diagnostics/spec.md, docs/specs/cards/stove.md, docs/specs/10_card_editors.md
- commits 84c42eb, 47f2b3d, 107160b

**Open/risky:**
- TC-SDG-U-12 ignores the existing `[sf-icon] No hass connection` warning of the mock (pre-existing, not from the diagnostics).
- Narrow-width ellipsis is checked on the stylesheet only (jsdom).
- test-compaction is bypassed by the user (tr_typescript bug).

**Next action:** VERIFY: /verify-stage (verify.py, code and security reviews on the code-review tier).

**Tests:** files +2 ~5 −0 · cases +25 −2 · 3 earlier test file(s) edited, none lost a case
