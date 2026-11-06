# SPEC - stove-pellet-cost (stage summary)

**Decided:**
- Card displays the state of a numeric entity `pellet_cost` (root config key); it computes nothing (FR-1..FR-5).
- Cell `div.pellet-cost` after `sf-stack-bar`: `sf-icon mdi:cash` + text `Cost (<amount>)`, fr `Coût (26,00 €)`.
- `formatPelletCost(value, unit: unknown, language: unknown)` in `src/cards/stove/pellet-cost.ts` never throws: bad locale -> 'en', non-string or >8-char unit -> no unit (FR-4.2); Lit text binding only (FR-4.3).
- Cell hidden on absent/unavailable/unknown/blank/non-numeric/|v| >= 1e9 (FR-5).
- Doc `docs/cards/stove.md`: new `## Pellet cost` section with exact YAML (guarded cost automation, mode queued, season add-on, Oct 1 reset), notes, troubleshooting; existing stock automation replaced (FR-9.5, phantom-bag fix).
- Build mode: headless (user's answer).

**Artifacts:** docs/specs/stove-pellet-cost/spec.md, docs/adversarial-review/stove-pellet-cost.md

**Intent items touched:** none

**Open/risky:**
- TC-SPC-U-04 snapshot must be recorded on the pre-lot code BEFORE any source write.
- fr Intl output contains narrow no-break spaces: normalise before asserting.
- After HARDEN: update wiki `ha-sci-fi-wiki/Stove.md` (pellet_cost option, cost setup, fixed stock automation) in its own commit, and tell the user to point `pellet_cost` at `input_number.pellet_cout_saison` in the dashboard.

**Dead ends:** none

**Next action:** TDD - write tests/cards/stove/sci-fi-stove-pellet-cost.test.ts, starting with the TC-SPC-U-04 snapshot on current code.
