# BUILD - stove-pellet-cost (stage summary)

**Decided:**
- TC-SPC-U-04 snapshot recorded on pre-lot code first (`.quantities` markup + relevant entities).
- `formatPelletCost` in src/cards/stove/pellet-cost.ts: catches RangeError only, falls back to 'en'; -0 -> 0; unit kept when trimmed string of 1-8 chars.
- `_renderPelletCost` in the card: trim, Number, finite, |v| < 1e9; language = locale.language, else hass.language, else 'en'.
- Spec TC-SPC-U-12 Expected amended: with locale `fr_FR` the card label is `Cost (26.00)` (base card maps only fr/fr-* to French; pre-existing). Test re-locked with --reason.
- Repo guards realigned (plan Step 7): frozen-selector guard reads the new test file, CSS baseline regenerated (stove only), label count 195 -> 196 in docs/specs/10_card_editors.md.
- .sc/smoke.yaml: `run: npm run build` (same recipe as the main checkout).

**Artifacts:** src/cards/stove/pellet-cost.ts, src/cards/stove/{config,sci-fi-stove,sci-fi-stove-editor,labels,styles}.ts, xliff/fr.xlf, src/locales/locales/fr.js, docs/cards/stove.md, docs/specs/cards/stove.md, docs/specs/10_card_editors.md, docs/specs/stove-pellet-cost/spec.md (TC-SPC-U-12), tests/cards/stove/sci-fi-stove-pellet-cost.test.ts (+ __snapshots__ .snap), tests/cards/stove/sci-fi-stove-editor.test.ts, tests/specs/delivered-design.test.ts, tests/styles/card-css-baseline.json, .sc/task.md

**Intent items touched:** none

**Open/risky:**
- npm test 1822 pass / 1 skip; typecheck clean; lint 0 errors. Test compaction: 0 removable.
- sentrux: src/cards/stove/sci-fi-stove.ts is a god file (fan-out 20, pre-lot; +1 once pellet-cost.ts is tracked) - not listed in .sentrux/rules.toml accepted set; VERIFY P7 may flag it.
- sci-fi-stove.ts at 789 lines, ceiling 790 (TC-SWC-U-09): no room left.
- VERIFY cold boot runs `npm run build`, which rewrites tracked dist/sci-fi.min.js.
- After HARDEN: wiki ha-sci-fi-wiki/Stove.md update; tell the user to set `pellet_cost: input_number.pellet_cout_saison`.

**Dead ends:** none

**Next action:** VERIFY - /verify-stage (verify.py, code + security review subagents, doc-update).
