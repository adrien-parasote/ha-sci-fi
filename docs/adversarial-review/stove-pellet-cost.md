# Adversarial Review — stove-pellet-cost

Spec: `docs/specs/stove-pellet-cost/spec.md` (94 lines, packet `.sc/review/22c7539-2c0db646`).

## Summary

- **Regime:** fan-out (user's pick, 2026-11-06). Three lenses, one sub-agent each, on `sonnet` (author: opus): 🔒 Security, 👤 User, 🎯 Scope.
- **Pre-scan:** single spec, no cross-spec validator needed. No state-changing HTTP operation, so no state mapping is owed. `obligation_check.py` reports 0 obligations, exit 0.
- **Total findings:** 16 (4 HIGH, 7 MEDIUM, 5 LOW). All closed in the spec at step `adversarial`: 13 RESOLVED, 3 FALSE.
- **Signals:** 1 convergence, 1 tension, 1 pattern, 1 blind spot.
- **Lens accuracy note:** the Scope lens states there is no stock setup section in `docs/cards/stove.md`. That is wrong: `## Pellet storage counter automation` sits at line 102 (it only grepped lines 66–79). Its finding 2 is therefore read with that correction.

## Findings

### HIGH

[HIGH] — F-01 The cost automation in the doc (FR-9) is specified only by its trigger and formula. It has no guard on `unavailable`/`unknown` and no requirement that both states are numeric with old > new. A restart can therefore book a phantom cost of `68 × price`. The Security lens raised it (#2a) and so did the User lens (#1). [RESOLVED] TC-SPC-U-09 — FR-9.2 writes the guarded YAML (not_from/not_to, both states numeric, strict drop).
[HIGH] — F-02 The existing stock automation example at `docs/cards/stove.md:102` has a bug. It uses a bare `trigger: state` on the pellet quantity sensor with a `numeric_state above: 99` condition. So an `unavailable` → `100` transition decrements the stock, and the new cost automation then bills that phantom bag. The cost doc inherits this defect. FR-9 does not fix it. (Found in the pre-scan; all three lenses missed it.) [RESOLVED] TC-SPC-U-10 — FR-9.5 replaces the doc stock automation with numeric_state above 99 for 2 min plus a numeric from_state guard.
[HIGH] — F-03 `new Intl.NumberFormat(language)` throws a `RangeError` on a malformed tag, for example `fr_FR` or `''`. FR-4.1 falls back only when the value is nullish. The throw happens during render and takes the whole card down. No Error Handling row and no TC covers it. (Security #1) [RESOLVED] TC-SPC-U-12 — FR-4.2 (a): try/catch around Intl.NumberFormat, fallback to en.
[HIGH] — F-16 A manual downward correction of `counter.pellet_stock` gets billed as consumption. Under the default `mode: single`, quick successive decrements lose updates. FR-9 states neither the mode nor the warning. (Security #2b/c) [RESOLVED] TC-SPC-U-09 — FR-9.2 sets mode: queued; FR-9.3 (b) warns a manual correction is billed and says to turn the automation off first.

### MEDIUM

[MEDIUM] — F-04 FR-4.1 assumes `unit_of_measurement` is a string. A number, object or array makes `.trim()` throw, which crashes the whole card the same way as F-03. TC-SPC-U-02 passes only strings and `undefined`. (Security #4) [RESOLVED] TC-SPC-U-12 — FR-4.2 (b): a non-string unit is treated as absent.
[MEDIUM] — F-05 The spec never says the amount and unit are bound as Lit text. A unit like `<img onerror>` is safe only if `unsafeHTML`/`innerHTML` is never used. No TC injects markup. (Security #3a) [RESOLVED] TC-SPC-U-13 — FR-4.3 pins Lit text interpolation, no unsafeHTML/innerHTML.
[MEDIUM] — F-06 There is no bound on magnitude or length. `Number('1e300')` is finite and formats to about 300 digits, and a long unit string is unbounded. Either one overflows the cell and breaks the `.quantities` row. (Security #3b) [RESOLVED] TC-SPC-U-03 — FR-5 hides the cell at |value| >= 1e9; FR-4.2 (c) drops a unit longer than 8 chars (TC-SPC-U-12).
[MEDIUM] — F-07 Three cells in `.quantities` (`flex-direction: row`, `column-gap: 20px`, no `flex-wrap`) at narrow widths is unaddressed. FR-8 has no `min-width`/`white-space` rule and no TC has all three cells present. (User #4) [RESOLVED] TC-SPC-U-07 — FR-8 adds flex-wrap: wrap and row-gap on .quantities, min-width: 0 on the cell, nowrap on its text.
[MEDIUM] — F-08 The doc does not say that the cost is booked at consumption, at the price in force when the stock drops, or that a price change only affects later bags. (User #2) [RESOLVED] TC-SPC-U-09 — FR-9.3 (a) states the cost is booked at the price in force when the stock drops.
[MEDIUM] — F-09 When the cell is missing (wrong entity id, unavailable, non-numeric state), the card is silent and logs nothing. The doc does not tell the user what a missing cell means. (User #3) [RESOLVED] TC-SPC-U-09 — FR-9.4 adds the Troubleshooting line.
[MEDIUM] — F-10 The new frozen and exported module `src/cards/stove/pellet-cost.ts` holds a one-line formatter. That is more surface than the request needs. (Scope #1) [FALSE] the repo already keeps one-purpose pure helpers in their own modules, tested directly: src/cards/stove/state-label.ts and src/cards/stove/wear-counters.ts; pellet-cost.ts follows that split.

### LOW

[LOW] — F-11 The doc uses the generic names `input_number.pellet_bag_price` / `input_number.pellet_cost`, while the Overview cites the user's real entities. FR-9 also adds a 1 October reset, which Scope reads as unrequested. (Scope #2) [FALSE] a public doc uses neutral entity ids (the user's French ids stay in the Overview as evidence), and the reset was requested: the user's first message asked for consumption from October to October ("d'octobre à octobre"); FR-9.3 (c) keeps it optional.
[LOW] — F-12 "le prix" could be read as the bag price rather than the accumulated cost. Only the Overview's quote resolves it. (Scope #3) [FALSE] FR-4 renders the state of the pellet_cost entity under the label Cost, and the user's quote "tu pointes vers notre variable de cost" names the accumulated cost variable, never the bag price.
[LOW] — F-13 TC-SPC-U-07 covers FR-7, FR-8, FR-9 and FR-10 in one substring-reading row, so a failure does not name the broken FR. (Scope #4) [RESOLVED] TC-SPC-U-11 — the row is split: TC-SPC-U-07 (FR-8), TC-SPC-U-08 (FR-7), TC-SPC-U-09/10 (FR-9), TC-SPC-U-11 (FR-10).
[LOW] — F-14 TC-SPC-U-03 omits a whitespace-only state (`'  '`; `Number('  ') === 0`). The policy for negative or `-0` amounts is not stated. (Security #5) [RESOLVED] TC-SPC-U-02 — FR-4.1 states -0 formats as 0 and negatives keep their sign; whitespace-only state added to TC-SPC-U-03.
[LOW] — F-15 A helper without a unit shows `26,00` with no currency. Neither the doc nor the editor recommends the season helper over the total one. (User #5) [RESOLVED] TC-SPC-U-09 — FR-9.1 requires the € unit on the helper; FR-9.3 (c) recommends the season entity.

## Cross-Reference Matrix

| Finding | 🔒 Security | 👤 User | 🎯 Scope | Pre-scan |
|---|---|---|---|---|
| F-01 doc automation unguarded | #2a | #1 | — | ✓ |
| F-02 stock automation phantom decrement | — | — | missed (wrong claim) | ✓ |
| F-03 Intl RangeError | #1 | — | — | — |
| F-16 manual correction / mode | #2b,c | — | — | — |
| F-04 non-string unit | #4 | — | — | — |
| F-05 text binding | #3a | — | — | — |
| F-06 magnitude / length | #3b | (#4 layout) | — | — |
| F-07 narrow layout | (#3b) | #4 | — | — |
| F-08 price change semantics | — | #2 | — | — |
| F-09 silent hide | — | #3 | — | — |
| F-10 module surplus | — | — | #1 | — |
| F-11 naming / Oct reset | — | ALSO_NOTED | #2 | — |
| F-12 "prix" ambiguity | — | #5 | #3 | — |
| F-13 TC-U-07 bundling | — | — | #4 | — |
| F-14 whitespace / negative | #5 | — | — | — |
| F-15 unit / season default | — | #5 | — | — |

## Signals

### Convergences
- 🎯 Security + User + pre-scan: **the doc's automation is the real accounting surface** (F-01, F-16, F-02). The card only displays a value. Any wrong number comes from the YAML the user copies, so that YAML must be correct as written: guarded trigger, numeric check, `mode: queued`.

### Tensions
- ⚔️ User vs Security on hiding: FR-5's silent hide is right for Security (no `NaN` shown), but it leaves the User with no diagnosis (F-09). The doc resolves this tension, not the card.

### Patterns
- 🔁 **Untrusted `hass` value reaching a throwing API** (F-03, F-04): locale tag into `Intl`, attribute into `.trim()`. Sibling scan: the same `formatPelletCost` is the only new consumer. Both fixes belong in that function, and it must never throw.

### Blind Spots
- 🕳️ **The stock automation already in the repo's doc** (F-02). No lens read `docs/cards/stove.md:102`. The cost feature makes that pre-existing bug cost money, so this lot's doc diff has to fix it.

## Stress-test

One short pass over the lenses' top arguments (the lane's SHORT stress-test, played in-loop by the author over the synthesis above. It is not a separate sub-agent.)

- **F-01 / F-02 hold.** I verified them against HA behaviour observed in this session. On 2026-11-06 the user's own stock automation decremented phantom bags on `unavailable` → `100`, which is exactly the original configuration documented at line 102.
- **F-03 holds.** `new Intl.NumberFormat('fr_FR')` throws `RangeError: Invalid language tag: fr_FR` under Node (measured 2026-11-06; `''` and `zz_ZZ` throw the same).
- **F-10 is contestable.** The repo keeps pure helpers in their own modules (`src/cards/stove/state-label.ts`) and tests them directly. The resolution step weighs it.
- **F-11 Oct reset is contestable.** The user's first message asked for "octobre à octobre". Resolution weighs it.
- **No new CRITICAL.** The card computes nothing, exposes no new privilege, and has no sink beyond Lit text.

Verdict: **REVISE**. Four HIGHs, all closable in the spec (doc YAML plus formatter robustness). No redesign is needed.

## Hostile-Input Checklist

HIC-1 FINDING F-06
HIC-2 FINDING F-05
HIC-3 N/A — no SQL, shell, filesystem, URL, redirect or header sink; entity ids are used only as `hass.states` keys
HIC-4 N/A — no auth surface; a Lovelace card reads the `hass` object its viewer already holds
HIC-5 FINDING F-04
HIC-6 FINDING F-14

## Builder check

One cold builder (sonnet, fresh context, spec only) read the settled spec: "nothing important left", plus two minor points.

### Answered
- Doc helper names (`input_number.pellet_cost`) differ from the user's own (`pellet_cout_saison`): the spec already separates them; the doc uses neutral ids (TC-SPC-U-09), the card config tests use the user's (TC-SPC-U-01). No spec change.

### My calls
- FR-9.3 (c) gave the season reset only as a trigger and a condition: the full YAML is now written into FR-9.3 (c), with the season helper named `input_number.pellet_cost_season` and fed by a second `set_value` in the cost automation (marked agent's call in the spec).

### Theirs
none
