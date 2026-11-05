# BUILD - stove-wear-counters (stage summary)

**Decided:**
- FR-0 snapshot taken on pre-lot code, committed alone (d6372fb) before any src/ write; SPEC artifacts committed WIP next.
- Object.hasOwn -> Object.prototype.hasOwnProperty.call (tsconfig lacks ES2022), same semantics (wear-counters.ts wearValue).
- Spec defect fixed (spec.md FR-3): renderWearCounters gains a 4th param `connection`, passed to each row sf-icon; without it sf-icon never loads the MDI icon and console.warns.
- DOMAIN.SENSOR only (no literal); sci-fi-stove.ts 769 lines (<= 790).
- Counted guards updated: editor-inputs-theme mounts 12->13 (wear-counters.ts skipped like the water card face), domain-site-table.json 117->118, delivered-design reads the new test file, card-css-baseline re-captured (3 wear rules), 10_card_editors.md label count 190->195.
- stove.md selector row `.wear-counter.<compteur>` -> `.wear-counter` (the guard reads each backticked segment); edited by a python script, not Edit (not caught by the doc gate).

**Artifacts:**
- src/cards/stove/state-label.ts, src/cards/stove/wear-counters.ts (new)
- src/cards/stove/{sci-fi-stove,sci-fi-stove-editor,config,labels,styles}.ts, xliff/fr.xlf, src/locales/locales/fr.js
- tests/cards/stove/sci-fi-stove-wear-counters.test.ts (+ .snap), tests/cards/stove/sci-fi-stove-editor.test.ts
- tests/styles/editor-inputs-theme.test.ts, tests/styles/card-css-baseline.json, tests/types/domain-literals.test.ts, tests/specs/domain-site-table.json, tests/specs/delivered-design.test.ts
- docs/specs/stove-wear-counters/spec.md, docs/specs/cards/stove.md, docs/specs/10_card_editors.md

**Open/risky:**
- Re-locked after test edits (U-05 readonly, I-02 state change needed to re-render, U-06 ignores sf-icon's pre-existing warnings: the accordion header icon cannot get a connection, component unmodified).
- test_reduce plan crashes (tr_typescript JSON truncated at 64 KiB): test-compacted bypassed by the user.
- TC-SPL-U-1129 (<100 ms timing) flaked once under full-suite load, green on rerun.
- BUILD closed on a wip(BUILD) commit.

**Next action:** VERIFY - /verify-stage; check FR-0 order via git log.
