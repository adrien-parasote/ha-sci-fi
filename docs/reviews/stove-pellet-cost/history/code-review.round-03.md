# Code review — stove-pellet-cost — round 1

AUDITOR: subagent
PACKET: .sc/review/7ea8dfd-7b1c13bc (diff 22c7539..worktree)

COVERAGE (must_read.txt is empty: no entry point was packaged; rows are the diff's product and test files, plus the joins followed out of it):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/stove/pellet-cost.ts | 1-35 | 35 | yes |
| src/cards/stove/config.ts | diff + 44-53 | 53 | diff hunk + the interface tail |
| src/cards/stove/labels.ts | diff | 50 | diff hunk |
| src/cards/stove/sci-fi-stove-editor.ts | 60-152 | 172 | the update handler, renderEditor and _renderInput |
| src/cards/stove/sci-fi-stove.ts | 160-200, 270-332, sf-icon sites | 789 | the changed regions and their neighbours |
| src/cards/stove/styles.ts | diff | 425 | diff hunk |
| src/locales/locales/fr.js, xliff/fr.xlf | diff | — | diff hunks |
| src/utils/base-card.ts | 40-60 (set hass, locale mapping) | — | join only |
| src/types/ha.ts | 50-75 | — | join only |
| tests/cards/stove/sci-fi-stove-pellet-cost.test.ts | 1-253 | 253 | yes |
| tests/cards/stove/sci-fi-stove-editor.test.ts | diff | — | diff hunk |
| tests/cards/stove/__snapshots__/sci-fi-stove-pellet-cost.test.ts.snap | 1-5 | 5 | yes |
| tests/specs/delivered-design.test.ts, tests/styles/card-css-baseline.json | diff | — | diff hunks |
| docs/cards/stove.md | diff (65-222) | 222 | diff hunks in full |
| docs/specs/cards/stove.md, docs/specs/10_card_editors.md | diff | — | diff hunks |
| docs/specs/stove-pellet-cost/spec.md | 1-182 | 182 | yes |

VERDICT: BLOCK
SPEC: docs/specs/stove-pellet-cost/spec.md

Pre-pass, run on this tree: `npx vitest run tests/cards/stove/ tests/specs/delivered-design.test.ts tests/styles` gave 20 files and 276 tests passed. `npx tsc --noEmit -p tsconfig.json` exited 0. `src/cards/stove/sci-fi-stove.ts` is 789 lines, under the 790 cap that TC-SWC-U-09 sets.

FINDINGS:
- [HIGH] tests/cards/stove/sci-fi-stove-pellet-cost.test.ts:146 — if the `hass.language` fallback breaks, no test notices. A HA frontend without `hass.locale` would then show the amount in English format instead of the user's language, and the suite would stay green. — FR-4.1 (language = `hass.locale.language`, else `hass.language`, else `'en'`) requires the middle step, and the code implements it at src/cards/stove/sci-fi-stove.ts:323. The only test for it is TC-SPC-U-05 (locale absent, fallback on `hass.language`), and it sets `hass.language` to `'en'`, which is also the final default. So deleting the `hass.language` read makes no difference to the test. The test is not biting because the spec's own TC row picked a value equal to the default. This is the "new code without tests" checklist item: a spec-mandated branch with no test that bites.
  SITES: tests/cards/stove/sci-fi-stove-pellet-cost.test.ts:146 (the fixture); docs/specs/stove-pellet-cost/spec.md:137 (the TC-SPC-U-05 row that prescribes `hass.language` `'en'`); the code under test is src/cards/stove/sci-fi-stove.ts:323
  SWEPT: `grep -n "hass.language\|language: 'en'" tests/cards/stove/sci-fi-stove-pellet-cost.test.ts` → only line 146 sets a top-level `hass.language`
  REPRODUCED: replaced `(this.hass as Partial<{ language: unknown }>).language ?? 'en'` with `'en'` in a scratch copy, loaded it through a vitest load-hook config, and ran tests/cards/stove/sci-fi-stove-pellet-cost.test.ts → `Tests 15 passed (15)`
  FALSIFIED BY: TC-SPC-U-05 with `hass.locale` deleted and `hass.language` set to a non-`en` value (for example `'fr'` → `Coût (19,50 €)`, or `'de'` → `19,50 €`). It must fail against the mutant above.
  ROOT: FR-4.1
  FIX-CLASS: corrects (amend the TC-SPC-U-05 row's `hass.language` value in the spec, then the test)
  RESOLUTION: fixed — spec TC-SPC-U-05 row amended (locale `en`, then `hass.locale` absent and `hass.language` `'de'` → `Cost (19,50 €)`), test updated at tests/cards/stove/sci-fi-stove-pellet-cost.test.ts:146; with the mutant (`… .language ?? 'en'` → `'en'`) applied, `npx vitest run tests/cards/stove/sci-fi-stove-pellet-cost.test.ts` → `Tests 1 failed | 14 passed (15)`, TC-SPC-U-05 `expected 'Cost (19.50 €)' to be 'Cost (19,50 €)'`; source restored, 15/15 pass

MUTATION: removed the `hass.language` fallback in src/cards/stove/sci-fi-stove.ts `_renderPelletCost` (`(this.hass as Partial<{ language: unknown }>).language ?? 'en'` → `'en'`) — SURVIVED
MUTATION: `value === 0 ? 0 : value` → `value` in src/cards/stove/pellet-cost.ts — KILLED by TC-SPC-U-02
MUTATION: `trimmed.length <= MAX_UNIT_LENGTH` → `<` in src/cards/stove/pellet-cost.ts — KILLED by TC-SPC-U-13
MUTATION: RangeError fallback builds with `language` instead of `'en'` in src/cards/stove/pellet-cost.ts — KILLED by TC-SPC-U-12
MUTATION: dropped `unit.trim()` in src/cards/stove/pellet-cost.ts — KILLED by TC-SPC-U-02
MUTATION: `Math.abs(value) >= 1e9` → `value >= 1e9` in src/cards/stove/sci-fi-stove.ts — KILLED by TC-SPC-U-03
MUTATION: dropped `.trim()` on the cost state in src/cards/stove/sci-fi-stove.ts — KILLED by TC-SPC-U-03
MUTATION: removed `entities.add(this.config.pellet_cost)` in getRelevantEntities — KILLED by TC-SPC-U-01
MUTATION: removed `aria-hidden="true"` from the cost sf-icon — KILLED by TC-SPC-U-01

NOTES:
- src/cards/stove/pellet-cost.ts:19 rethrows any non-RangeError from the `Intl.NumberFormat` constructor. With a string locale and constant options, ECMA-402 throws only RangeError, so the branch cannot be reached. It is a sound "do not swallow unknown errors" guard and does not contradict FR-4.2 (formatPelletCost never throws) in practice.
- `formatPelletCost(-0.004, …)` renders `-0.00`: Intl rounds toward a signed zero. FR-4.1 names only exact `-0` and says negatives keep their sign, so this is the spec's call, not a defect.
- src/cards/stove/sci-fi-stove.ts:323 uses `??`, so `hass.locale.language === ''` goes straight to formatPelletCost's `'en'` fallback without trying `hass.language`. The spec's "à défaut" does not say whether an empty string counts as missing.
- `Number()` in `_renderPelletCost` accepts hex or binary literals (`'0x1A'` → 26). FR-5 (unreadable states hide the cell) lists the rejected forms, and an HA `input_number` never reports such a state.
- src/cards/stove/sci-fi-stove.ts:169: the one-line `if` breaks the block style of its neighbours. It is probably there to stay under the 790-line cap; this is a style point only.
- The `Partial<{ language: unknown }>` cast at sci-fi-stove.ts:323 is justified: `HomeAssistantExt` (src/types/ha.ts:71) does not declare a top-level `language`.

### Spec limit F-01 — holds
docs/cards/stove.md, § Cost automation: the YAML matches FR-9.2 (the exact cost automation YAML) character for character. It has `not_from`/`not_to: [unavailable, unknown]`, an `is_number` check on both states, a strict `from > to` drop, and `mode: queued`. TC-SPC-U-09 asserts these tokens within the `## Pellet cost` section.

### Spec limit F-02 — holds
docs/cards/stove.md, § Pellet storage counter automation: the YAML matches FR-9.5 exactly (`numeric_state above: 99`, `for: "00:02:00"`, `trigger.from_state.state | is_number`). The bare `trigger: state` is gone from that section, and TC-SPC-U-10 asserts its absence.

### Spec limit F-03 — holds
src/cards/stove/pellet-cost.ts:13-22: a non-string or empty language goes to `'en'`, and the constructor sits in a try/catch that falls back to `'en'` on RangeError. The card reaches it only through `formatPelletCost` (sci-fi-stove.ts:324), so the limit holds wherever a render can reach it. TC-SPC-U-12 covers `'fr_FR'`, `''`, `'zz_ZZ'`, `undefined` and `42`, both in the pure function and in a rendered card. The fallback mutant was KILLED.

### Spec limit F-16 — holds
docs/cards/stove.md: `mode: queued` is in the cost automation YAML. The Notes bullet "Manual correction" says to turn the `Pellet cost` automation off before correcting the stock. TC-SPC-U-09 asserts `mode: queued` and `manual correction`.

CONFORMANCE EVIDENCE:
- FR-1 (the optional `pellet_cost` config key) → src/cards/stove/config.ts:52, right after `storage_counter_threshold`
- FR-2 (the entity is added to the relevant set) → src/cards/stove/sci-fi-stove.ts:169
- FR-3 / FR-4 (no cell when unset; cell order) → sci-fi-stove.ts:275-277 render quantity, stock, then cost, and the cost returns `nothing` when unset (317-321)
- FR-4 (markup) → sci-fi-stove.ts:325-330 render the `mdi:cash` sf-icon with `aria-hidden`, then `div.text` with `${msg('Cost')} (${amount})`
- FR-4.1 / FR-4.2 (formatting and never-throw rules) → src/cards/stove/pellet-cost.ts:13-35
- FR-4.3 (text interpolation only) → sci-fi-stove.ts:328 uses content-position interpolation; TC-SPC-U-13 proves that markup in the unit is rendered as text
- FR-5 (unreadable states hide the cell) → sci-fi-stove.ts:318-321 apply trim, empty check, `Number.isFinite` and `abs < 1e9`
- FR-6 (editor input) → src/cards/stove/sci-fi-stove-editor.ts:108 sits right after storage_counter; labels.ts adds `'input-pellet-cost'`; the editor's generic branch (editor:71) writes it at the config root
- FR-7 (translations) → xliff/fr.xlf has the two trans-units, and src/locales/locales/fr.js has the matching ids
- FR-8 (styles) → src/cards/stove/styles.ts adds `flex-wrap`/`row-gap` to the `column-gap: 20px` rule, plus the three new rules with the exact declarations; tests/styles/card-css-baseline.json is updated to match
- FR-9.x (user documentation) → docs/cards/stove.md, § Pellet cost (helpers, YAML, three notes, season action and reset, Troubleshooting) and the corrected stock automation
- FR-10 (card spec) → docs/specs/cards/stove.md has the F-STOVE-D13 row and the frozen selector `div.pellet-cost`

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 1 | block (surviving mutant on FR-4.1) |
| MEDIUM | 0 | — |
| LOW | 0 | — |

---

# Code review — stove-pellet-cost — round 2 (delta re-review)

AUDITOR: subagent
PACKET: .sc/review/7ea8dfd-453e538a (delta since .sc/review/7ea8dfd-7b1c13bc)

Scope: the files in delta.txt that are product or test files (the spec and the pellet-cost test), plus the closure of the round 1 finding. src/cards/stove/sci-fi-stove.ts has the same blob hash as in round 1 (e499bd9), so the code under test did not move. docs/summaries/stove-pellet-cost/BUILD.md is also unchanged since round 1 (b966d51). The other delta.txt entries are review artefacts.

COVERAGE (must_read.txt lists the round 1 hashes file only; rows are the delta's files plus the joins followed out of it):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/stove-pellet-cost/spec.md | delta hunk, 25 (FR-4.1), 134-157 (TC table, error table) | 182 | delta hunk plus the rows it depends on |
| tests/cards/stove/sci-fi-stove-pellet-cost.test.ts | 1-86, 130-160 | 255 | delta hunk, helpers, beforeEach |
| src/cards/stove/sci-fi-stove.ts | 316-332 (`_renderPelletCost`) | 789 | join only (unchanged since round 1) |
| src/utils/base-card.ts | 42-95 (set hass, shouldUpdate) | — | join only |
| tests/fixtures/mock-hass.ts | 77-115 | — | join only |
| docs/reviews/stove-pellet-cost/code-review.md | 1-91 | 91 | yes (round 1) |

VERDICT: APPROVE
SPEC: docs/specs/stove-pellet-cost/spec.md

Pre-pass, run on this tree: `npx vitest run tests/cards/stove/ tests/specs/delivered-design.test.ts tests/styles` gave 20 files and 276 tests passed. `npx tsc --noEmit -p tsconfig.test.json` exited 0.

Closure of round 1:
- The round 1 HIGH (the `hass.language` fallback had no test that bites) is closed. The TC-SPC-U-05 row (spec.md:137) now has `hass.language` `'de'` with `hass.locale` absent, and expects `Cost (19,50 €)`. That value differs from the final `'en'` default. The test (sci-fi-stove-pellet-cost.test.ts:142-153) matches the row: `setLocale('en')`, then mount with locale `en`, then `Cost (19.50 €)`, then `hass.locale` deleted with `language: 'de'`, then `Cost (19,50 €)`. The row's claim that the label stays in the `en` catalogue holds: `SciFiBaseCard.set hass` reads only `hass?.locale?.language` (src/utils/base-card.ts:48), and that is undefined here, so no locale switch happens. The re-render happens because `shouldUpdate` sees `locale.language` change from `'en'` to `undefined` (base-card.ts:87). The `beforeEach` at test:85-86 resets the locale to `fr`, so the `setLocale('en')` does not leak into later tests.
- I re-ran the mutant myself. A scratch vitest config with a load-time `transform` plugin rewrote the source in memory only. The tree was not touched, and the blob hash of src/cards/stove/sci-fi-stove.ts stayed e499bd9 before and after. Command: `npx vitest run --config <scratch>/vitest.mut.config.mjs tests/cards/stove/sci-fi-stove-pellet-cost.test.ts`. It printed `MUTANT APPLIED`, then `Tests 1 failed | 14 passed (15)`, with TC-SPC-U-05 failing on `AssertionError: expected 'Cost (19.50 €)' to be 'Cost (19,50 €)'`. On the clean tree the same file passes 15/15.

MUTATION: removed the `hass.language` fallback in src/cards/stove/sci-fi-stove.ts `_renderPelletCost` (`(this.hass as Partial<{ language: unknown }>).language ?? 'en'` → `'en'`) — KILLED by TC-SPC-U-05
MUTATION: swapped the FR-4.1 priority in src/cards/stove/sci-fi-stove.ts `_renderPelletCost` (`this.hass.locale?.language ?? (this.hass as Partial<{ language: unknown }>).language ?? 'en'` → `(this.hass as Partial<{ language: unknown }>).language ?? this.hass.locale?.language ?? 'en'`) — SURVIVED

FINDINGS:
- [LOW] tests/cards/stove/sci-fi-stove-pellet-cost.test.ts:144 — if someone reorders the language lookup so that `hass.language` beats `hass.locale.language`, no test notices. A frontend where the two differ would then format the amount in the wrong language, and the suite would stay green. — FR-4.1 (amount language = `hass.locale.language`, else `hass.language`, else `'en'`) sets an order. TC-SPC-U-05 now covers the second step. But no test sets both `hass.locale.language` and a different top-level `hass.language`. The mock (tests/fixtures/mock-hass.ts:108) never sets a top-level `language`, so every other render reads `locale` either way. Reproduced: with the swap mutant above, `npx vitest run --config <scratch>/vitest.swap.config.mjs tests/cards/stove/` → `MUTANT APPLIED`, `Tests 180 passed (180)`. The real-world impact is small: in the HA frontend `hass.language` and `hass.locale.language` normally hold the same value. That is why this is LOW and not the round 1 HIGH. Fix: in TC-SPC-U-05's first mount, add a top-level `language: 'de'` next to locale `en` and keep the `Cost (19.50 €)` assertion. Amend the TC row to say so.
  SITES: only tests/cards/stove/sci-fi-stove-pellet-cost.test.ts:144 (the first mount of TC-SPC-U-05) and its row at docs/specs/stove-pellet-cost/spec.md:137
  FIX-CLASS: corrects
  RESOLUTION: fixed — TC-SPC-U-05 row amended (first render `hass.locale.language` `'en'` with top-level `hass.language` `'de'` → `Cost (19.50 €)`) and the test's first render now sets both; swap mutant via scratchpad vitest.swap.config.mjs on tests/cards/stove/ → `Tests 1 failed | 179 passed (180)`, TC-SPC-U-05 `Expected "Cost (19.50 €)" Received "Cost (19,50 €)"`; fallback mutant still KILLED (`1 failed | 14 passed`); clean tests/cards/stove/ 180/180; src blob e499bd9 unchanged

NOTES:
- The TC-SPC-U-05 row (spec.md:137) carries an amendment trail in its expected-result cell ("amendé en VERIFY le 2026-11-06, revue de code round 1"). It reads as a change log inside a test oracle, but it is accurate and it does no harm.
- The test's `{ ...makeMockHass(...), language: 'de' }` followed by `delete hass.locale` models a frontend that predates `hass.locale`. Such a frontend also has no `locale` for `SciFiBaseCard`, so the label stays in whatever catalogue is active. The row says this. It is a property of the base card, not of this lot.
- The round 1 NOTES still apply. Nothing in the delta changes them.

### Spec limit F-01 — holds
Out of delta: docs/cards/stove.md did not move since round 1. Round 1's evidence stands (the cost automation YAML matches FR-9.2, and TC-SPC-U-09 checks it). The 276-test pre-pass includes TC-SPC-U-09 and is green.

### Spec limit F-02 — holds
Out of delta: docs/cards/stove.md did not move. The FR-9.5 stock automation is unchanged, and TC-SPC-U-10 passes in the pre-pass.

### Spec limit F-03 — holds
Out of delta: src/cards/stove/pellet-cost.ts did not move. The try/catch with the `'en'` fallback at pellet-cost.ts:13-22 is unchanged. TC-SPC-U-12 passes in the pre-pass. The amended TC-SPC-U-05 also sends `'de'` through the same path, and it formats as expected.

### Spec limit F-16 — holds
Out of delta: docs/cards/stove.md did not move. `mode: queued` and the manual-correction warning are unchanged, and TC-SPC-U-09 passes.

CONFORMANCE EVIDENCE:
- FR-4.1 (the second fallback step, `hass.language`) → src/cards/stove/sci-fi-stove.ts:323. The amended TC-SPC-U-05 bites it (sci-fi-stove-pellet-cost.test.ts:147-152, mutant KILLED).
- FR-4 (cell order without the stock bar) → TC-SPC-U-05 still asserts `lastElementChild` is `div.pellet-cost` (test:145).

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass (the round 1 HIGH is closed, its mutant is KILLED) |
| MEDIUM | 0 | — |
| LOW | 1 | fix: the priority-swap mutant survives TC-SPC-U-05 |

Positive Observations:
- The fix took the stated route: the spec row was amended first, then the test. The new value `'de'` was chosen to differ from the default, and the test comment says why.

VERDICT: APPROVE

## Survivor delta — FR-4.1 priority swap re-run

MUTATION: swapped the FR-4.1 priority in src/cards/stove/sci-fi-stove.ts `_renderPelletCost` (`this.hass.locale?.language ?? (this.hass as Partial<{ language: unknown }>).language ?? 'en'` → `(this.hass as Partial<{ language: unknown }>).language ?? this.hass.locale?.language ?? 'en'`) — KILLED by tests/cards/stove/sci-fi-stove-pellet-cost.test.ts > sci-fi-stove — pellet cost > TC-SPC-U-05: without the stock bar the cell comes last; hass.language is the fallback
AUDITOR: subagent
