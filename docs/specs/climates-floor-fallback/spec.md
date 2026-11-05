---
spec: docs/specs/climates-floor-fallback/spec.md
sources:
  - src/cards/climates/sci-fi-climates.ts
  - src/cards/climates/config.ts
  - src/selectors/house.ts
  - docs/specs/cards/climates.md
  - docs/specs/05_cards.md
---

# Climates Floor/Area Fallback — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-r9a` (detached from the fix lot `p1-runtime-defects`, observation O4). `src/cards/climates/sci-fi-climates.ts` guards two fallbacks with `(this.config as any)?.filter_by === 'floor'` and `=== 'area'`. `filter_by` is in no contract (absent from `config.ts`, [05_cards.md](../05_cards.md), [climates.md](../cards/climates.md), the editor, `docs/cards/`, the tests), so for every user who goes through the editor both fallbacks are dead code.

**Decision (user, 2026-11-03, via AskUserQuestion, option 1 of the bead).** Make both fallbacks **unconditional**: remove the two `filter_by` guards and the `as any`. No public config key is added, renamed or removed, so ADR-005 holds (`filter_by` was never announced; a hand-written `filter_by` in YAML becomes a no-op, as any unknown key already is).

**The two fallbacks, as written in the code and kept as they are.**
- *Floor*: no floor contains a non-excluded radiator and at least one floor is registered, so the first floor of `getFloors()` (lowest `level`, null levels last) becomes the active floor.
- *Area*: a floor is active, no area of it was selected, and at least one area is registered, so the first area of `getAreas()` (registry order, **the whole house, not restricted to the active floor**) becomes the active area.

**Measurement (the bead says it was never measured).** Throwaway vitest harness, deleted after the run, source untouched: the real card rendered in happy-dom with a mock `hass`; "today" is the card with `filter_by` absent, "fallback" is the same card with both fallbacks forced on (a config getter returning `'floor'` while no floor is active and `'area'` once one is). Radiators `heat` at 20 °C.

| # | `hass` shape | Today (guards off) | With the unconditional fallback |
|---|---|---|---|
| A | floor `ground` (no radiator); area `salon` with the radiator, **no floor**; area `cave` on `ground` | floor row empty, nothing below: **0 radiator, no message** (header only) | floor title `Ground - Off`, area `Salon` shown with **1 radiator**; floor row and area row hexagons empty (no navigation) |
| B | no floor registered at all; area `salon` with the radiator, no floor | **0 radiator, blank body** | identical: **0 radiator, blank body** (nothing to fall back to) |
| C | radiator with no area; floor `ground` with area `cave` (no radiator) | **0 radiator, blank body** | title `Ground - Off`, area `Cave` shown, **0 radiator** |
| D | radiator in area `salon` on floor `ground` (control) | `Ground - 20°C`, `Salon`, 1 radiator | identical |
| E | floored `salon` + radiator, unfloored `garage` + radiator, `garage` registered first | `Ground - 20°C`, `Salon`, 1 radiator | identical (a floor holding a radiator wins; the fallback never runs) |
| F | floors `rdc` (area `hall`, no radiator) and `up`; radiator in unfloored `salon`; `hall` registered first | **0 radiator, blank body** | title `Rdc - Off`, area `Hall` shown, **0 radiator** |

**What the measurement says.** The fallback changes what the card shows in A, C and F and in none of B, D, E. Only A reaches the radiator, and only because the first area of the registry happens to be the one that holds it: the area fallback takes `getAreas()[0]` of the house, whatever its radiators. In C and F the card goes from a blank body to a floor title (`… - Off`) and an area with an empty slider, which is **not** a better answer to "where are my radiators". The decision of 2026-11-03 is applied as taken; this outcome is pinned by tests (FR-5) rather than hidden.

**Non-goals.** No new config key, no editor field, no `docs/cards/` change, no new `msg()` string (the existing `Off` label next to the floor title is a pre-existing bare English literal, untouched). No change to `05_cards.md`: it delegates the climates contract to `climates.md` and states no floor/area selection rule for this card (its `first_floor_to_render` rows describe the lights card). Choosing a floor or area that actually holds a radiator when none is floored is a different behaviour (FIX-CLASS adds) and is not in this lot.

## Requirements

- **FR-1**: when, after the scan for a floor holding a non-excluded radiator, no floor is active and at least one floor is registered, `renderCard()` makes `allFloors[0]?.floor_id` (the first of `getFloors(hass)`, `sci-fi-climates.ts:68,78`) the active floor, with no config condition; with no floor registered nothing is selected.
- **FR-2**: when a floor is active and, after the scan of that floor's areas, no area is active and at least one area is registered, `renderCard()` makes the first element of `getAreas(hass)` (registry order, any floor) the active area, with no config condition; with no area registered nothing is selected. The test is on the active-area state after the floor scan, so a floor whose area holds a radiator never reaches it.
- **FR-3**: `filter_by` is not a config key: `sci-fi-climates.ts` reads no config field absent from `SciFiClimatesConfig` (no `as any` on `this.config`, no `filter_by` anywhere in `src/`), and a YAML `filter_by: floor`, `filter_by: area` or any other value renders exactly as if it were absent. `config.ts`, `sci-fi-climates-editor.ts`, `05_cards.md` and the stub config stay free of `filter_by` (ADR-005: no key added, renamed or removed).
- **FR-4**: when at least one non-excluded radiator sits in an area of a floor, the render is unchanged: the active floor is the first such floor, the active area the first area of it holding a radiator, and a floor or area the user selected is kept across re-renders (scenarios D and E).
- **FR-5**: the measured outcomes of the table in the Overview are the contract in the states where the fallback does not reach a radiator, and are pinned: A shows `Ground - Off` and one radiator; C and F show the first floor title, the first registry area and zero radiator; B shows an empty body without throwing. [ACCEPTED-LIMIT: user (decision of 2026-11-03: unconditional fallback, the two blocks as written), pinned by TC-CFF-U-04 rather than left unsaid; the consequence in C and F was measured after the decision and is to be confirmed at the spec review.]
- **FR-6**: the fallback is idempotent and stable: re-rendering with the same `hass` or a replaced `hass` keeps the same active floor and area (no flicker, no `console.*`). When the registry later assigns the radiator's area to **the fallback floor itself**, the card shows that floor's radiators on the next render of the same element (IT-CFF-I-01). When it assigns the area to **another** floor, the card stays on the fallback floor, because the fallback has written `_active_floor_id` and the scan is not replayed (IT-CFF-I-04). [ACCEPTED-LIMIT: user (decision of 2026-11-03: unconditional fallback as written); with the guards off the floor stays unset and is recomputed at every render, so this lock is new and is named, not hidden; pinned by IT-CFF-I-04.]
- **FR-7**: [`climates.md`](../cards/climates.md) states the floor and area selection, fallbacks included, in a section `Floor and area selection`, and its Error Handling table gains the row for a house with radiators and no floored area; no `TC-CLIMATES-*` id is added or edited there (the card-spec id rule of `ids-cas-uniques` keeps that file to its own prefix, the cases live here).
- **FR-8**: no user-visible string is added: no `msg()` source, no `xliff/fr.xlf` unit, `src/locales/locales/fr.js` untouched.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | Today a house whose radiators all sit in unfloored areas renders a blank body (scenarios A, B, C, F) and the fallback only changes A, C, F | High | SHOW — throwaway vitest run against the real card (table in the Overview; floor row empty, `active_floor`/`active_area` null, 0 `sf-radiator` for A, B, C, F today; 1 radiator for A with the fallback) | TC-CFF-U-01, TC-CFF-U-02, TC-CFF-U-04 |
| 2 | `filter_by` is out of contract everywhere | Medium | SHOW — `git ls-files -co --exclude-standard 'src/**' 'docs/**' 'tests/**' 'dev/**' \| xargs grep -n filter_by` named only the two lines of `sci-fi-climates.ts` (bead measurement of 2026-10-31, re-read at BUILD) | TC-CFF-U-05 |
| 3 | `getAreas()` order is the registry insertion order of `hass.areas` (`Object.values`), so "first area" depends on how HA serialises its registry; integer-like area ids (e.g. `1`) are the exception, `Object.values` lists them first in ascending order whatever the insertion order | Medium | TELL — `src/selectors/house.ts:68-71`; HA's order is not documented by this repo | TC-CFF-U-02 (slug fixtures, plus an integer-like id case), TC-CFF-U-04 pin the order with an explicit fixture order |
| 4 | Replacing `if (filter_by === …)` by `getFloors()[0]` / `getAreas()[0]` is behaviour-identical to the guarded blocks with the guard true | Low | SHOW — the forced-on measurement ran those exact blocks; the floor fallback reads `allFloors[0]?.floor_id`, `allFloors` being `getFloors(this.hass)` (`sci-fi-climates.ts:68,78`; `getFirstFloor` was removed by the socle lot) | TC-CFF-U-01, TC-CFF-U-02 |
| 5 | The fallback writes `_active_floor_id`, and `sci-fi-climates.ts:65` guards the scan with `!this._active_floor_id`, so once the fallback has run the scan is never replayed: a radiator area later assigned to another floor is not followed, the card stays on the fallback floor. Consequence of the unconditional fallback (new: with the guards off the floor stays unset and is recomputed at every render) | High | SHOW — `sci-fi-climates.ts:65` (guard) and the fallback block that sets `_active_floor_id`, read in the code | IT-CFF-I-01 pins the case where the fallback floor receives the radiator; IT-CFF-I-04 pins the stay on `Rdc - Off` |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|--------------|---------|
| 1 | Entering `filter_by` into `config.ts`, the editor or `05_cards.md` to "keep it" | it stays out of contract (FR-3): option 2 of the bead was not chosen |
| 2 | Keeping a `(this.config as any)` read of an unannounced key | read only keys of `SciFiClimatesConfig` (FR-3) |
| 3 | "Improving" the fallback to pick a floor or area that holds a radiator | out of scope (Overview, non-goals): FIX-CLASS adds, spec first |
| 4 | Restricting the area fallback to the active floor's areas | FR-2 keeps `getAreas()[0]` of the house; narrowing it changes scenario A (Salon is not on `ground`) |
| 5 | Letting the fallback override a floor or area that holds a radiator, or a user's selection | FR-4: the fallback runs only when nothing is active |
| 6 | A `console.warn` or a write to a second `@state` for the fallback | none (FR-6): `renderCard()` runs at every repaint |
| 7 | Adding TC ids to `climates.md` for this lot | the cases live in this spec (FR-7) |

## Test Case Specifications

Tests live in `tests/cards/climates/sci-fi-climates.test.ts` (and `tests/docs/` for the document case) and cite these ids in their titles. The fixtures are the six scenarios of the Overview, built with `makeMockHass({ floors, areas, entities, states })`; the area order of each fixture is stated, `getAreas()` follows insertion order.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-CFF-U-01 | scenario A (floor `ground` without radiator, area `salon` with the radiator and no floor, area `cave` on `ground`) | FR-1 | active floor is `ground`; `.floor-content` text is `Ground - Off`; the floor `sf-hexa-row` has no cell |
| TC-CFF-U-02 | scenario A, areas registered `salon` first; then the same with `cave` registered first; then areas `salon` and `1` (integer-like id, registered after `salon`) | FR-2 | `salon` first: active area `salon`, `.area-content .title` is `Salon`, one `sf-radiator` for `climate.r1`, area row has no cell; `cave` first: active area `cave`, title `Cave`, zero `sf-radiator` (order decides); `salon` + `1`: active area `1` (`Object.values` lists integer-like keys first, Assumption 3) |
| TC-CFF-U-03 | scenario D (control), scenario E (`garage` unfloored registered first, `salon` on `ground`), and a user floor selection kept across a re-render in a two-floor house with a radiator on each | FR-4 | D and E: floor `ground`, area `salon`, `Ground - 20°C`, one radiator; the garage is never selected; the selected second floor is still active after the re-render |
| TC-CFF-U-04 | scenarios B (no floor), C (radiator without area), F (`rdc`/`hall` without radiator registered first, radiator in unfloored `salon`) | FR-5, FR-1, FR-2 | B: no throw, `.floor-content` present (always rendered) but with no child element and no text, `.area-content` absent, zero radiator; C: `Ground - Off`, area `Cave`, zero radiator; F: `Rdc - Off`, area `Hall`, zero radiator |
| TC-CFF-U-05 | `filter_by: 'floor'`, `'area'` and `'bogus'` passed in the config of scenarios A and D; scan `src/` for `filter_by` and `as any` on `this.config`; scan `config.ts`, `sci-fi-climates-editor.ts`, `getStubConfig()` and `05_cards.md` for `filter_by` | FR-3 | each rendered DOM (floor text, area title, radiator count) equals the same fixture without the key; no scan finds `filter_by`; `sci-fi-climates.ts` holds no `as any` read of the config |
| TC-CFF-U-06 | read `docs/specs/cards/climates.md` | FR-7 | contains a heading `Floor and area selection`, the words `first floor`, `first area` and `getAreas`, an Error Handling row whose first cell is `Radiators in areas with no floor`, no `filter_by`, and no `TC-CFF-` id |
| TC-CFF-U-07 | scenario A rendered; scan the `msg(` source strings of `sci-fi-climates.ts` | FR-8 | the sources are exactly the seven present today: `No radiator configured`, `Summer time`, `Winter is coming`, `Mode applied`, `Temperature changed`, `HVAC mode changed`, `Preset changed`; none added. The `fr.xlf` / `fr.js` completeness is guarded by TC-I18N-U-11 (`docs/specs/i18n-hardcoded-fr/spec.md`), no comparison with `main` is made here |
| TC-CFF-U-08 | scenario A with the first registry value nullish (`floors` and `areas` objects whose first value is `undefined`, otherwise populated) and, separately, a house with no radiator in a floored area | FR-1, FR-2 | `render()` does not throw; the nullish first element selects nothing (no active floor or area from it) |
| IT-CFF-I-04 | scenario F rendered (`Rdc - Off`, area `Hall`); then `hass` replaced with `salon` assigned to floor `up` | FR-6, FR-5 | after the replacement the card still shows `Rdc - Off`, area `Hall`, zero radiator (the fallback floor is kept, Assumption 5) |
| IT-CFF-I-01 | card created with `document.createElement`, `setConfig`, then `hass` assigned (scenario A); then `hass` replaced with area `salon` now on floor `ground` | FR-6, FR-1 | first render: `Ground - Off`, `Salon`, one radiator; after the replacement: floor row has the `ground` cell, title `Ground - 20°C`, area row has the `salon` cell, one radiator |
| IT-CFF-I-02 | scenario A, three consecutive `hass` replacements with the same content, `console.warn/error/log` spied | FR-6 | same active floor and area, same DOM text and radiator count after each, zero console calls |
| IT-CFF-I-03 | scenario A, then `entities_to_exclude: ['climate.r1']` | FR-4, FR-1 | no radiator left: `.empty-message` reads `No radiator configured`, no floor or area content |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| Radiators exist, none in a floored area, floors registered | first floor and first registry area selected (FR-1, FR-2); the radiators show only if that area holds them | the user assigns a floor to the area in HA | none (render path) |
| Radiators exist, no floor registered | blank body under the header, no throw | register a floor and assign the area | none |
| Radiators exist, none in any area | first floor and first area shown, no radiator | assign an area | none |
| All radiators excluded or none exist | `No radiator configured` (unchanged) | — | none |
| Radiators in no floored area, no floor registered: blank body, no text and no accessible hint | accepted: FR-8 forbids a new string (TC-CFF-U-04 pins the empty body) | the user registers a floor | none |
| First registry floor or area is nullish | read with an optional chain, nothing selected (TC-CFF-U-08) | none | none |
| Unknown YAML key `filter_by` | ignored, same render as without it (FR-3) | remove the key | none |

## Builder Calls

- Option 1 of the bead (*user*, 2026-11-03): unconditional fallback, no `filter_by` in the contract.
- Implementation shape (*mine*): replace the two blocks by `allFloors[0]?.floor_id` (on the `getFloors(this.hass)` list already read for the scan) and `getAreas(this.hass)[0]`, which also removes both `as any`; the `floor_id` / `area_id` reads are optional-chained (`?.floor_id`, `?.area_id`, F-10). The diff touches `src/cards/climates/sci-fi-climates.ts` (and its import line), `docs/specs/cards/climates.md` (FR-7) and the tests under `tests/` named above.
- Builder-check answers (*mine*): nullish means `undefined` or `null` first element; the fallback then selects nothing and does not look at later entries (TC-CFF-U-08). The area fallback is house-wide whichever way the active floor was reached, including a user-selected floor with no area. The integer-like area in TC-CFF-U-02 is named `Un` and its title reads `Un`. The `as any` scan of TC-CFF-U-05 is a vitest test reading `src/cards/climates/sci-fi-climates.ts` with a regex on `this.config` only; the `msg(` scan of TC-CFF-U-07 is a regex over `msg('…')` in the same file. Floor ordering ties follow `getFloors()` as it is (`house.ts`), untouched. A user floor selection in TC-CFF-U-03 is a click on the floor hexagon cell, as the card does it. Section heading level and the other cells of the Error Handling row in `climates.md` are the builder's call.
- Review fixes beyond the calls above (*mine*, code review round 1): `src/selectors/house.ts` is also in the diff — `getFloors()` filters null entries (`.filter((f): f is HassFloor => f != null)`) and `getAreasByFloor()` reads `area?.floor_id`; `sci-fi-climates.ts` carries extra `floor &&` guards (`floor && …` at :69 in the floor scan, `if (!floor) return nothing` at :247 in the render path) so a null floor entry never throws. No behaviour change for well-formed registries.
- `docs/cards/climates.md` (user doc) is left unchanged (*mine*): the fallback is a safety net with no setting; a sentence there would announce a behaviour the card does not promise (FR-5).
- The test for a hand-written `filter_by` (TC-CFF-U-05) uses a config object built in the test, since `SciFiClimatesConfig` has no such key.

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| `FR-1` | code — `SciFiClimatesCard.renderCard` | Lovelace dashboards through `render()` of `sci-fi-climates` |
| `FR-2` | code — `SciFiClimatesCard.renderCard` | Lovelace dashboards through `render()` of `sci-fi-climates` |
| `FR-7` | config/schema — `docs/specs/cards/climates.md` | readers of the card spec; `tests/docs/` |

## References

- [climates.md](../cards/climates.md)
- [05_cards.md](../05_cards.md)
- [config-error-card](../config-error-card/spec.md)
- [bridge-error-matrix](../bridge-error-matrix/spec.md)
- [house selectors](../../../src/selectors/house.ts)
