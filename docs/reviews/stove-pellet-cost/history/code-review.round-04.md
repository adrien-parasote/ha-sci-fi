# Code review — stove-pellet-cost, fix O1 (cost cell on a phone-width card)

AUDITOR: subagent
Packet: .sc/review/fd38992-7bd30cfc (dirty fd38992..worktree, 13 files). must_read.txt is empty (no entry point packaged).

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/stove/styles.ts | 70-200 (the info, quantities and pellet-cost rules) + diff | 427 | no (the rest of the file is not touched by the diff) |
| src/cards/stove/sci-fi-stove.ts | 270-335 (the quantities zone and _renderPelletCost) + diff | 789 | no (the rest is not touched) |
| tests/cards/stove/sci-fi-stove-pellet-cost.test.ts | 1-60 + every diff hunk | 276 | yes for the changed tests and their helpers |
| tests/styles/card-css-baseline.json | diff hunks | — | diff only (generated baseline) |
| dev/cards/stove.js | diff + 1-20 | 82 | diff + head |
| docs/specs/stove-pellet-cost/spec.md | diff (FR-3, FR-4, FR-8, TC table) | — | diff |
| docs/specs/cards/stove.md | diff (F-STOVE-D13) | — | diff |
| docs/cards/stove.md | diff + grep for the FR-9 guards | — | diff |
| dist/sci-fi.min.js | the pellet-cost template and CSS, extracted | — | relevant snippets |
| docs/fixes/stove-pellet-cost/lot.json, verdicts.json | full | 18 / 10 | yes |
| docs/reviews/stove-pellet-cost/*.md -> history/ | rename at 100 % similarity | — | n/a |

VERDICT: APPROVE
SPEC: docs/specs/stove-pellet-cost/spec.md (FR-3, FR-4, FR-8 as amended for O1; TC-SPC-U-01/05/07/12/13, IT-SPC-I-01/02), docs/specs/cards/stove.md (F-STOVE-D13)

FINDINGS:
- [LOW] docs/specs/stove-pellet-cost/spec.md:24 — someone reading the spec history later will think the card once rendered `Coût | 26,00 €` on one line. That form never existed: the old markup was `Coût (26,00 €)` (see the removed sci-fi-stove.ts line `${msg('Cost')} (${amount})` and the old TC-SPC-U-01 row `Coût (26,00 €)`). The FR-4 (cost cell content) amendment note reads « l'ancienne forme `Coût | 26,00 €` sur une ligne passait à la ligne ». `|` is only the TC notation this same amendment introduces, so the note gets wrong the history it is there to record.
  Fix: replace it with « l'ancienne forme `Coût (26,00 €)` sur une ligne ».
  FIX-CLASS: corrects
  RESOLUTION: fixed — spec.md FR-4 note now reads « l'ancienne forme `Coût (26,00 €)` sur une ligne »; documentation text only, no behaviour, covered by test_O1_cost_cell_stays_a_third_column_with_label_above_amount

NOTES:
- Layout itself (no wrap, a third column at phone width) cannot be measured under happy-dom. The O1 test and TC-SPC-U-07 (CSS rule contents) pin it through the stylesheet text, and the CSS baseline does too. That is the strongest proof this test stack can give, and the fix lane accepts it for a visual defect.
- `.pellet-cost` is `flex-shrink: 0` + `white-space: nowrap`. At very small widths the room it needs comes from the two gauges, which shrink because their SVG is `width="100%"` (src/components/sf-stack-bar.ts:67, src/components/sf-circle-progress-bar.ts:88). An amount of several thousand euros is wider, but still small. This is the behaviour the user asked for ("a third tight column, no wrap"), not a defect.
- The two spans have no separator in textContent (`Coût26,00 €`). Inside a flex container they are blockified, so assistive tech reads them as two items. Not a defect.
- IT-EIT-I-05 (the baseline regenerates from its base commit) fails only in my scratch copy, which has no git history. It is environmental. The worktree's full suite is green.

## Spec limits (SPEC-LIMITS.md)
### Spec limit F-01 — holds
docs/cards/stove.md:155-161 — the cost automation keeps `not_from`/`not_to: [unavailable, unknown]` and the two `is_number` guards. The diff only changes line 134-136 of that file.
### Spec limit F-02 — holds
docs/cards/stove.md:111-117 — the stock automation is `numeric_state`, `for: "00:02:00"`, with a `from_state | is_number` guard. Not touched.
### Spec limit F-03 — holds
src/cards/stove/pellet-cost.ts:15-18 — try/catch around Intl.NumberFormat, falling back to `'en'`. The diff does not touch this file. TC-SPC-U-12 is still green with the new two-span markup.
### Spec limit F-16 — holds
docs/cards/stove.md:173,183 — `mode: queued` and the manual-correction warning. Not touched.

## Mutation testing (scratch copy of the tree, suite: the pellet-cost file + tests/styles)
MUTATION: re-add `flex-wrap: wrap` on the `.quantities` row — KILLED by test_O1_cost_cell_stays_a_third_column_with_label_above_amount
MUTATION: `.pellet-cost` `flex-shrink: 0` replaced by `min-width: 0` — KILLED by TC-SPC-U-07
MUTATION: icon width/height 24px -> 40px — KILLED by TC-SPC-U-07
MUTATION: icon height alone 24px -> 40px — KILLED by card CSS baseline (sci-fi-stove resolves to the same CSS as the baseline)
MUTATION: drop `display: flex; flex-direction: column; align-items: center` on `.pellet-cost .text` — KILLED by TC-SPC-U-07
MUTATION: drop `font-weight: bold` on `.pellet-cost .text` — KILLED by card CSS baseline (sci-fi-stove resolves to the same CSS as the baseline)
MUTATION: restore the one-line `${msg('Cost')} (${amount})` text — KILLED by test_O1_cost_cell_stays_a_third_column_with_label_above_amount
MUTATION: swap span.label and span.amount — KILLED by test_O1_cost_cell_stays_a_third_column_with_label_above_amount

## Pre-pass
Worktree `npx vitest run`: 158 files passed, 1823 tests passed, 1 skipped, rc 0. The bundle `dist/sci-fi.min.js` carries the new template (`<span class="label">${ee("Cost")}</span><span class="amount">${o}</span>`) and the new CSS (no flex-wrap on `.quantities`, icon 24px), so the build is in step with the source.

## Security
FR-4.3 (amount and unit inserted as text) still holds. src/cards/stove/sci-fi-stove.ts:327 interpolates `${amount}` in content position inside `span.amount`, with no unsafeHTML or innerHTML. TC-SPC-U-13 (markup in the unit is rendered as text) is green: there is no `b` element, and the text is `Cost | 26.00 <b>€</b>`. The diff adds no new input surface.

CONFORMANCE EVIDENCE:
- FR-4 (div.text holds span.label then span.amount) -> src/cards/stove/sci-fi-stove.ts:327
- FR-8 (.quantities without flex-wrap, keeps column-gap 20px) -> src/cards/stove/styles.ts:130-139
- FR-8 (.pellet-cost column, flex-end, gap 5px, flex-shrink 0) -> src/cards/stove/styles.ts:144-153
- FR-8 (.text flex column, centered, bold, nowrap; same weight as sf-stack-bar's label at src/components/sf-stack-bar.ts:48) -> src/cards/stove/styles.ts:154-160
- FR-8 (sf-icon 24px) -> src/cards/stove/styles.ts:161-165
- O1 "icon bottom-aligned": `.quantities` is `align-items: flex-end` and `.pellet-cost` is `justify-content: flex-end` -> src/cards/stove/styles.ts:131,147
- F-STOVE-D13 (cost cell entry in the card spec) is updated -> docs/specs/cards/stove.md:36
- The workbench scenarios add the entity through a direct override (dev/modules/mock-hass.js:38) -> dev/cards/stove.js:43-48
