# Security review — stove-pellet-cost — round 1

AUDITOR: subagent
Packet: .sc/review/7ea8dfd-7b1c13bc (diff 22c7539..worktree)

COVERAGE (must_read.txt is empty: no entry point was packaged; rows below are the code files of the diff):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/stove/pellet-cost.ts | 1-35 | 35 | yes |
| src/cards/stove/sci-fi-stove.ts | diff hunks + 300-335 | 789 | no (diff hunks and the render site) |
| src/cards/stove/sci-fi-stove-editor.ts | diff hunk | — | no (one-line hunk) |
| src/cards/stove/config.ts | diff hunk | — | no (one-line hunk) |
| src/cards/stove/labels.ts | diff hunk | — | no (one-line hunk) |
| src/cards/stove/styles.ts | diff hunk | — | no (static CSS) |
| src/locales/locales/fr.js, xliff/fr.xlf | diff hunks | — | no (two static strings) |
| docs/cards/stove.md | diff hunk (YAML automations) | 222 | no (diff hunk) |

VERDICT: DEPLOY

SURFACES CHECKED:
- Untrusted input: `hass.states[pellet_cost].state`, `attributes.unit_of_measurement`, `hass.locale.language` / `hass.language`, all set by whoever controls the HA instance or the integration that publishes the entity.
- DOM sink: `src/cards/stove/sci-fi-stove.ts:327`. The amount reaches the page only through a Lit child-text binding `${amount}` inside `html```. Lit renders that as a text node, so markup is escaped. No `unsafeHTML`, `innerHTML` or `unsafeCSS` under `src/cards/stove/` (grep came back empty). The test `tests/cards/stove/sci-fi-stove-pellet-cost.test.ts:224-226` mounts a `<b>€</b>` unit and asserts that it shows up as text and creates no `b` element.
- Attribute sinks: none get untrusted data. `icon="mdi:cash"` is a constant, and `.connection` is a property binding of `hass.connection`.
- Exceptions while rendering: `src/cards/stove/pellet-cost.ts:13-22`. A non-string or empty language gets 'en' directly. When `Intl.NumberFormat` throws a `RangeError`, the catch falls back to 'en'. Any other error is rethrown, but the options object is a constant, so the only thing that can throw is the locale. A non-string unit is dropped at line 26. A non-string state becomes '' and hides the cell (`sci-fi-stove.ts:318`). `NaN`, `Infinity` and absolute values of 1e9 or more hide the cell (`sci-fi-stove.ts:320`). A null `attributes` or `locale` is absorbed by optional chaining.
- Config: the `pellet_cost` entity id is only used as a lookup key in `hass.states` and added to the set of watched entities (`sci-fi-stove.ts:169`). It never reaches a sink.
- Secrets: grep of diff.patch for key, token, secret, password and JWT prefixes found only test-loop variable names. No credentials.
- Dependencies: `package.json` and `package-lock.json` are not changed in this diff, so no dependency audit is owed for this lot.
- Doc YAML (`docs/cards/stove.md`): the Jinja templates read only entity states, through `| int`, `| float(0)` and `is_number`. Users copy them into HA themselves, and no untrusted string is interpolated into an action target.

### Spec limit F-01 (the cost automation guards unavailable/unknown and requires a strict numeric drop) — holds
`docs/cards/stove.md`, section "Cost automation": `not_from`/`not_to: [unavailable, unknown]`, both states `is_number`, and the condition `from | int > to | int`.

### Spec limit F-02 (the stock automation must not decrement on unavailable -> 100) — holds
`docs/cards/stove.md`, section "Pellet storage counter automation": `trigger: numeric_state above: 99 for: "00:02:00"` plus the condition `trigger.from_state.state | is_number`. The bare `trigger: state` is gone.

### Spec limit F-03 (a malformed language must not throw during render) — holds
`src/cards/stove/pellet-cost.ts:14-21`: the type/empty guard, then try/catch on `RangeError` with fallback to 'en'. The render site passes `unknown` through, at `sci-fi-stove.ts:322-323`.

### Spec limit F-16 (manual decrements are billed; rapid decrements lose updates) — holds
`docs/cards/stove.md`: `mode: queued`, plus the "Manual correction" note telling the user to turn the automation off first.

FINDINGS:
- none

NOTES:
- `Number(raw)` at `src/cards/stove/sci-fi-stove.ts:319` also accepts hex (`0x1A`) and exponent (`1e3`) forms. That is a display quirk on a value the HA owner controls, not a security defect, and the spec does not pin it.
- A unit of up to 8 characters is shown as text. A spoofed unit (for example `$` instead of `€`) can only come from someone who already administers the entity. The 8-character cap bounds the layout impact.
- The trust boundary for `hass` is the HA instance itself. Anyone who can write entity attributes is already an HA admin or integration. The text-only rendering means that position still cannot be turned into script execution in the dashboard origin.
- This was a static read. No live instance was started.

---
# Security review — stove-pellet-cost — round 2 (delta re-review)

AUDITOR: subagent
PACKET: .sc/review/7ea8dfd-453e538a (diff 22c7539..worktree; delta since the round-1 review hashes)

COVERAGE (must_read.txt of this packet lists the two files below; both read in full):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/stove-pellet-cost/spec.md | 1-182 | 182 | yes |
| tests/cards/stove/sci-fi-stove-pellet-cost.test.ts | 1-255 | 255 | yes |
| docs/reviews/stove-pellet-cost/* (code-review.md, history/*, this file) | delta hunks | — | review reports only, no code |

VERDICT: DEPLOY

SURFACES CHECKED:
- Product source unchanged since round 1: the git blob hashes of src/cards/stove/config.ts, labels.ts, pellet-cost.ts, sci-fi-stove-editor.ts, sci-fi-stove.ts, styles.ts, src/locales/locales/fr.js and xliff/fr.xlf in the working tree equal the ones recorded in docs/reviews/stove-pellet-cost/history/security-review.round-01.hashes.txt (and in this packet's hashes.txt). So every sink and input path cleared in round 1 (Lit text binding at `src/cards/stove/sci-fi-stove.ts:327`, the state parse at `sci-fi-stove.ts:318-320`, the locale/unit guards in `src/cards/stove/pellet-cost.ts:13-26`) is the same code.
- Delta, `tests/cards/stove/sci-fi-stove-pellet-cost.test.ts:142-153`: TC-SPC-U-05 (the cost cell comes last without the stock bar; `hass.language` is the locale fallback) now mounts in `en` and switches `hass.language` to `de` after deleting `hass.locale`. Test-only. It strengthens the fallback check, since `de` differs from the final `'en'` default and so actually exercises the `hass.language` read. It does not touch an input boundary or a sink. TC-SPC-U-12 (no exception on a bad locale or unit) and TC-SPC-U-13 (markup in the unit renders as text) are unchanged and still cover the hostile-input cases.
- Delta, `docs/specs/stove-pellet-cost/spec.md:137`: only the TC-SPC-U-05 row is reworded to match the test. FR-4.2 (`formatPelletCost` never throws) and FR-4.3 (text interpolation only, no `unsafeHTML`/`innerHTML`) are unchanged.
- Secrets: the delta hunks contain no credentials, tokens or keys.
- Dependencies: neither `package.json` nor `package-lock.json` is in the diff, so no audit is owed.
- Closure of the previous report: round 1 recorded 0 findings, so nothing is left to close or rule on.

### Spec limit F-01 (the cost automation guards unavailable/unknown and requires a strict numeric drop) — holds
`docs/cards/stove.md` is not in the delta. The round-1 reading still stands.

### Spec limit F-02 (the stock automation must not decrement on unavailable -> 100) — holds
`docs/cards/stove.md` is not in the delta. The round-1 reading still stands.

### Spec limit F-03 (a malformed language must not throw during render) — holds
`src/cards/stove/pellet-cost.ts` has the same hash as in round 1 (`f4f790b…`), with its guard and try/catch at lines 14-21.

### Spec limit F-16 (manual decrements are billed; rapid decrements lose updates) — holds
`docs/cards/stove.md` is not in the delta. `mode: queued` and the manual-correction note are unchanged.

FINDINGS:
- none

NOTES:
- This was a static read of the delta. The test suite was not re-run in this round, and no live instance was started.
- `src/cards/stove/sci-fi-stove.ts` shows as modified in `git status` relative to HEAD. Its blob hash equals the round-1 hash, so the change is the one already reviewed, not a new edit.
