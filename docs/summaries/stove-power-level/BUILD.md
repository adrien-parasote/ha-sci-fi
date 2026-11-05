# BUILD - stove-power-level (stage summary)

**Decided:**
- No-config snapshot recorded on pre-change code, committed alone (e93c1df); implementation WIP 168d76b.
- Test ids renamed TC-STOVE-U-1116..1133 -> TC-SPL-U-1116..1133, IT-STOVE-I-1104..1106 -> IT-SPL-I-1104..1106 (repo guard TC-RWG-U-05: lot ids are lot-prefixed). Spec defect fixed by Edit in spec.md, cards/stove.md (D09 row, selector row), adversarial review doc.
- 10_card_editors.md label count 185 -> 186 (154 in dictionaries), guard O14.
- Guards adjusted: domain-site-table.json + domain-literals.test.ts total 112 -> 114 (NUMBER, INPUT_NUMBER in sci-fi-stove.ts); delivered-design selector guard also reads the power-level test file.
- isPowerDisabled = state not numeric (covers unavailable/unknown; delivered-design forbids a quoted 'unavailable' branch); isNumeric uses Number.isFinite (domain-literal guard forbids 'number').

**Artifacts:**
- src/cards/stove/config.ts, sci-fi-stove.ts, sci-fi-stove-editor.ts, labels.ts
- xliff/fr.xlf, src/locales/locales/fr.js
- tests/cards/stove/sci-fi-stove-power-level.test.ts (+ __snapshots__), tests/cards/stove/sci-fi-stove-editor.test.ts
- tests/specs/delivered-design.test.ts, tests/specs/domain-site-table.json, tests/types/domain-literals.test.ts
- docs/specs/10_card_editors.md, docs/specs/cards/stove.md, docs/specs/stove-power-level/spec.md

**Intent items touched:** IA-SPL-1..5 (code delivered, proofs at VERIFY)

**Open/risky:**
- test-compacted bypassed by the user (test_reduce plan crash, plugin bug).
- Reachability out-of-diff: src/sci-fi.ts tested_but_never_wired, translate_xlf.py - bead to file.
- Full suite green (1745 passed), tsc clean, lint 0 errors.

**Next action:** VERIFY - /verify-stage.

**Tests:** files +1 ~3 −0 · cases +21 −1 · 2 earlier test file(s) edited, none lost a case
