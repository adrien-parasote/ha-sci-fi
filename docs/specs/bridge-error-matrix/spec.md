---
spec: docs/specs/bridge-error-matrix/spec.md
sources:
  - docs/specs/cards/bridge.md
  - src/cards/bridge/sci-fi-bridge.ts
  - src/cards/bridge/sections/sf-bridge-stove.ts
  - src/cards/bridge/sections/sf-bridge-vehicle.ts
  - src/utils/base-card.ts
---

# Bridge Error Handling Matrix — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-5em` (detached from the fix lot `p1-runtime-defects`, observation O3). [`bridge.md` § Error Handling Matrix](../cards/bridge.md) prescribes four rows that no file implements: an entity absent from `hass.states` shows `--` (individual indicator), a NaN `pellet_quantity` shows `-- %`, a NaN EV power shows `-- W` and `Indisponible`, an invalid config in `setConfig()` shows an error card. The `callService` row is already delivered by `bridgeCall` and stays untouched.

**Logging decision (user, option 1 of the bead).** A `console.warn` placed in a render path fires at every repaint. The matrix is therefore amended (done in this lot, `bridge.md`) to say: **one `console.warn` per entity and reason, guarded by a module-level `Set`, which `setConfig()` clears** so that a fixed-then-broken entity is reported again.

**Contract rule (serves `bridge.md`, "individual indicator shows `--`").** Every indicator whose entity is absent from `hass.states` stops showing a false reading (off, ok, idle, inactive, unlocked, `0`) and shows `--` where it has a value text slot, or a neutral state otherwise (neither the "on/ok" nor the "off/idle" look, controls disabled). The vocabulary is written once, in FR-6.

**Vocabulary (one rule, all sections).** A *value slot* (pellet %, stock, EV power, slider value, smoke/occupancy/cycle/consumable/stove-status text) reads `--`. A *state label* (access state tag, vehicle status label) reads `msg('Unavailable')` (`Indisponible` under `fr`). *Absent* and *NaN* use the same wording; they differ only by the warn reason.

**Definitions.**
- A configured section is *present* when its key is neither `undefined` nor `null`; `stove: null` is the same as no stove (not rendered, not validated).
- An entity is *absent* when its id is a non-empty string and `hass.states[id] === undefined`. An empty-string id (the editor seeds `entity: ''` for a new row) renders as absent but is never warned (FR-1).
- A reading is *numeric* when `Number.isFinite(parseFloat(state))`; the three numeric slots additionally require `>= 0` (a negative pellet quantity, stock or charger power is not a measurement). Anything else is *non-numeric*.

## Requirements

- **FR-1**: `src/cards/bridge/bridge-warn.ts` exports `warnOnce(reason: 'not-found' | 'non-numeric', entityId: unknown): void` and `resetBridgeWarnings(): void`; `warnOnce` calls `console.warn('[sf-bridge] entity not found:', entityId)` (reason `not-found`) or `console.warn('[sf-bridge] non-numeric state:', entityId)` (reason `non-numeric`) the first time a given `reason` + `entityId` pair is seen since the last reset, and does nothing after; the memory is one module-level `Set`. It does nothing for an `entityId` that is not a non-empty string. The `entityId` is the second `console.warn` argument, never the first. The same module exports the helper `readSlotOrWarn(states, entityId): number | undefined`, which returns the parsed state when it is a finite number >= 0 and otherwise calls `warnOnce` (`not-found` when the entity is absent, `non-numeric` when present) and returns `undefined`; FR-3, FR-4 and FR-5 read their numeric slots through it.
- **FR-2**: `SciFiBridgeCard.setConfig()` calls `resetBridgeWarnings()` on every call, valid or not, so an entity reported before the call is reported again after it. Editor behaviour (stated, not avoided): the Lovelace editor calls `setConfig` on every keystroke, so while editing, each absent configured entity is re-reported once per `setConfig`; this is bounded by the number of configured entities per call and is accepted as the price of FR-2.
- **FR-3**: `sf-bridge-stove` renders, when `hass.states[config.pellet_quantity]` is absent or non-numeric, an element `.stove-pellet-placeholder` whose text is `-- %` (U+00A0 between `--` and `%`, as the vehicle's ` kW` join) and no `sf-circle-progress-bar`; it calls `warnOnce('not-found', id)` for an absent entity and `warnOnce('non-numeric', id)` for a present one that is non-numeric. A numeric pellet state renders the circle and no placeholder, as today.
- **FR-4**: `sf-bridge-stove` renders, when `config.pellet_stock` is absent or non-numeric, an element `.stove-stock-placeholder` whose text is `--` and no `sf-stack-bar`, with the same `warnOnce` rule as FR-3; a numeric stock renders the stack bar and no placeholder.
- **FR-5**: `sf-bridge-vehicle`, when `config.power_sensor` is absent or non-numeric, renders `.vehicle-power-value` with text `-- W` (not `0 W`) and `.vehicle-status-label` with `msg('Unavailable')` (`Indisponible` under `fr`, the existing `xliff/fr.xlf` entry) in place of `N/A`, keeps the section visible and the unavailable plug icon, and calls `warnOnce` with the reason of FR-3. A numeric state renders as today.
- **FR-6**: absent-entity rendering, one row per section; each also calls `warnOnce('not-found', id)` at render:

  | Section / entity | Absent renders |
  |---|---|
  | `alerts.smoke[]` chip | class `smoke-unknown` (neither `smoke-ok` nor `smoke-active`), trailing `.smoke-state-placeholder` text `--` in place of the check/alert icon |
  | `alerts.occupancy` pill | `.occupancy-pill` class `unknown` (neither `occupied` nor `empty`), text `--` |
  | `appliances.cycles[]` | `.cycle-status` class `unknown` (neither `running` nor `idle`), text `--`, icon in the disabled colour |
  | `appliances.consumables[]` chip | class `consumable-unknown` (neither `consumable-ok` nor `consumable-warn`), text `<name> --` |
  | `stove.status` chip | `.stove-status-chip` keeps `stove-off` and adds `stove-unknown`, text `--`, icon `sci:stove-off` (never `stove-on`) |
  | `access.items[].lock` | lock indicator with class `lock-unknown` and icon `mdi:lock-question` (not `mdi:lock-open`) |
  | `access.items[]` cover | `.access-state-tag` keeps `state-unavailable` and text `msg('Unavailable')`; open and close buttons `disabled` (attribute, not only class) |
  | `automations.items[]` slider | `.slider-value` text `--`; the `input[type=range]` is `disabled` (FR-6.2) |
  | `alerts.toggles[]` and `automations.items[]` (non-slider) toggle | row gets name class `toggle-unknown` (neither `toggle-on` nor `toggle-off`), `data-on="false"`, button disabled (FR-6.2) |
  | `actions.items[]` button | unchanged look, button disabled (FR-6.2) |
  | `persons[]` crew | unchanged: no badge (pinned by the crew test); warn only |

  - **FR-6.1**: an entity present with state `unavailable` or `unknown` is NOT logged by this rule (FR-6 reports absence only; FR-3..5 report non-numeric only), and its rendering is unchanged.
  - **FR-6.2**: a control bound to an absent entity cannot call a service: slider `input` `disabled` (an `input` event calls nothing), toggle buttons of `alerts.toggles[]` and `automations.items[]` (non-slider) `disabled` with `aria-disabled="true"`, `actions.items[]` buttons `disabled`; each of those also calls `warnOnce('not-found', id)`. Their rendering for a present entity is unchanged.
- **FR-7**: N renders of the card over the same absent entity produce exactly one `console.warn` for that `reason` + entity pair (not N).
- **FR-8**: `SciFiBridgeCard.setConfig()` validates the shape; for an invalid config it does not throw, calls `console.error('[sf-bridge] invalid config:', message)` once, and the card renders an `.sf-error-card` whose `.sf-error-message` is that message; a later valid `setConfig()` clears the error and renders the card normally. Rules, checked in this order, first failure wins:
  1. `config` is a non-null object, else `config: expected an object`;
  2. `type` is a string, else `type: expected a string`;
  3. each of `stove`, `vehicle`, `alerts`, `access`, `automations`, `appliances`, `actions`, when present (FR-defs), is a non-array object, else `<key>: expected an object`;
  4. `persons`, `access.items`, `automations.items`, `actions.items`, `alerts.smoke`, `alerts.toggles`, `appliances.cycles`, `appliances.consumables`, when present, are arrays, else `<path>: expected an array`;
  5. every element of those arrays is a non-null object with a string `entity`, else `<path>[<index>].entity: expected a string`; `alerts.occupancy`, `alerts.smoke_switch` and `access.items[i].lock`, when present, are strings, else `<path>: expected a string`; `appliances.cycles[i].running_states`, when present, is an array of strings, else `appliances.cycles[<index>].running_states: expected an array of strings` (amended 2026-11-04, fix lot stove-bridge O5, bead ha-sci-fi-prw: a YAML string made `isCycleRunning` throw);
  6. `stove` has string `pellet_quantity`, `pellet_stock` and `status`, else `stove.<field>: expected a string`; `vehicle` has a string `power_sensor`, else `vehicle.power_sensor: expected a string`.
  `{}` plus `type` stays valid; an empty-string entity id is valid (FR-1). **Message content:** English fixed text (not localized), built only from the key path, the index and the expected type as written above; it NEVER contains the offending value, a stringified object or a `JSON.stringify` of any config part (the config comes from user YAML and an editor; reflecting it is unbounded).
- **FR-9**: `bridge.md` § Error Handling Matrix, § sf-bridge-stove (WARNING) and § sf-bridge-vehicle state the behaviour of FR-1..FR-8: the three `console.warn` cells read once per entity (Set cleared by `setConfig()`), the individual-indicator cell lists the FR-6 vocabulary (`--` on value slots, neutral state otherwise), the invalid-config cell reads `console.error('[sf-bridge] invalid config:', …)`, no matrix cell promises an unguarded `console.warn`, and the vehicle layout names `.vehicle-power-value` and `.vehicle-status-label` (not `.vehicle-power` / `.vehicle-status`), the two NaN rows and the vehicle NOTE read `Number.isFinite` and `>= 0` (not `isNaN`), and the `unavailable`/`unknown` row says a numeric slot (pellet, stock, EV power) in that state shows `--` and warns `non-numeric`, other indicators keep their current rendering. The stale stove layout names in bridge.md are out of this lot's scope.
- **FR-10**: the `callService` path is unchanged: a rejected call logs `console.error('[sf-bridge] callService error:', e)` and no `console.warn` of FR-1.
- **FR-11**: the error card is bridge-local, no change to `src/utils/base-card.ts`. On an invalid config `SciFiBridgeCard` stores the message and a placeholder config `{type}` (so the sealed base `render()`, which returns nothing without `config`, reaches `renderCard()`), and `renderCard()` returns first `<ha-card><div class="sf-error-card"><span class="sf-error-icon">⚠️</span><span class="sf-error-message">…` (same markup as the base's private error card). It still needs `hass`, as every bridge render does. A valid `setConfig()` clears the stored message.

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | `bridge.md` "individual indicator shows `--`" applies to every section: value slots read `--`, other indicators a neutral state (FR-6); not narrowed to value slots | Medium | TELL — bridge.md § Error Handling Matrix row 3, served on the user's direction at the SPEC review | TC-BEM-U-05, TC-BEM-U-08 |
| 2 | `unavailable`/`unknown` states are not logged except as non-numeric on the three numeric slots | Low | TELL — matrix row "unavailable/unknown" has Logging `—` | TC-BEM-U-05 |
| 3 | `msg('Unavailable')` already translates to `Indisponible` | Low | SHOW — `xliff/fr.xlf` line 947-950: `<source>Unavailable</source><target>Indisponible</target>` | no new xliff string; TC-BEM-U-03 asserts the source string |
| 4 | `SciFiBaseCard.render()` returns nothing without `config` and its error card is private; a bridge-local placeholder config reaches `renderCard()`, so no shared base-card hook is needed (a hook would change every card's contract for one consumer) | Low | SHOW — `src/utils/base-card.ts:97` (`if (!this.config \|\| !this.hass) return nothing`) and `_renderErrorCard` private | IT-BEM-I-03 |
| 5 | the existing stove test `test_O1_chip_is_inactive_when_status_entity_is_absent` stays green: the absent chip keeps `stove-off` | Low | SHOW — `tests/cards/bridge/sections/sf-bridge-stove.test.ts` O1 asserts `.stove-off` present, `.stove-on` null | TC-BEM-U-08 |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|--------------|---------|
| 1 | `console.warn` unguarded in a render path | `warnOnce` (FR-1): one warn per reason + entity until `setConfig()` |
| 2 | Clearing the Set at render or on `hass` update | Clear only in `setConfig()` (FR-2); the Set is the dedupe, a per-render clear brings the flood back |
| 3 | Showing `0 W` / `0 %` / "off" / "ok" for a missing value | `--` or a neutral state (FR-3, FR-5, FR-6): a default is not a measurement |
| 4 | Hiding the section when one entity is missing | Keep the section, show the placeholder (matrix; bridge.md anti-pattern 8) |
| 5 | Touching `bridgeCall` or its `console.error` | Leave it (FR-10) |
| 6 | Putting the raw config value in the error message | Key path + expected type only (FR-8) |
| 7 | `isNaN` alone as the numeric test | `Number.isFinite` plus `>= 0` on the three numeric slots (definitions) |

## Test Case Specifications

Tests live in `tests/cards/bridge/` (card-spec rule of `ids-cas-uniques`) and cite these ids in their titles.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-BEM-U-01 | `warnOnce` twice with the same pair, then another id, then another reason on the first id; then `resetBridgeWarnings()` and the first pair again | FR-1 | `console.warn` called once, twice, three times (messages `[sf-bridge] entity not found:` / `[sf-bridge] non-numeric state:` with the id as second argument), then four times after reset |
| TC-BEM-U-02 | stove with `pellet_quantity` absent, then `unavailable`, then `0.5`; `pellet_stock` absent, then `unavailable`, then `2` | FR-3, FR-4 | absent/unavailable: `.stove-pellet-placeholder` text `-- %`, `.stove-stock-placeholder` text `--`, no `sf-circle-progress-bar`, no `sf-stack-bar`, warn reasons `not-found` then `non-numeric`; numeric: bars present, no placeholder, no warn |
| TC-BEM-U-03 | vehicle with `power_sensor` absent, then `unavailable`, then `3500` | FR-5 | absent/unavailable: `.vehicle-power-value` text `-- W`, `.vehicle-status-label` text `Unavailable` (source string, same for both), section present, warn `not-found` then `non-numeric`; `3500`: `3.5 kW`, no warn |
| TC-BEM-U-04 | automations slider and access cover over an absent entity | FR-6, FR-6.2 | `.slider-value` text `--`, input `disabled` and value = `min`; `.access-state-tag` text `Unavailable` with class `state-unavailable`, both buttons have the `disabled` attribute; one `not-found` warn each |
| TC-BEM-U-05 | crew person, `alerts.toggles` toggle and `automations` toggle over an absent entity, then over state `unavailable` | FR-6, FR-6.1, FR-6.2 | absent: no crew badge, toggle buttons `disabled` with `aria-disabled="true"`, one `not-found` warn per entity; present `unavailable`: no warn, toggle not disabled |
| TC-BEM-U-06 | `setConfig` with `{type}` plus each of: `persons: {}`, `access: {items: 1}`, stove without `status`, vehicle without `power_sensor`, and with a valid `{type}` alone | FR-8 | invalid: no throw, `console.error('[sf-bridge] invalid config:', msg)` once, `.sf-error-card` with `.sf-error-message` = msg; `{type}` alone: no error card (`{}` without `type` is invalid, TC-BEM-U-12) |
| TC-BEM-U-07 | read `docs/specs/cards/bridge.md` § Error Handling Matrix, § sf-bridge-vehicle | FR-9 | the three warn cells mention once-per-entity and `setConfig`; the individual-indicator cell mentions the neutral state; the invalid-config cell names `[sf-bridge] invalid config:`; no cell is the bare `console.warn`; the vehicle layout names `.vehicle-power-value` and `.vehicle-status-label` and not `.vehicle-power (` |
| TC-BEM-U-08 | smoke chip, occupancy, cycle, consumable, stove status and access lock over an absent entity | FR-6 | smoke: `smoke-unknown`, `.smoke-state-placeholder` `--`, no `smoke-ok`/`smoke-active`; occupancy: `.occupancy-pill.unknown` `--`; cycle: `.cycle-status.unknown` `--`; consumable: `consumable-unknown`, no `consumable-ok`/`-warn`; stove chip: `stove-off` and `stove-unknown`, text `--`, no `stove-on`; lock: `lock-unknown`, icon `mdi:lock-question`, no `mdi:lock-open`; one `not-found` warn per entity |
| TC-BEM-U-09 | `actions.items` button over an absent entity, then a present one | FR-6.2 | absent: `.action-btn` `disabled`, click calls no service, one `not-found` warn; present: enabled as today |
| TC-BEM-U-10 | `pellet_quantity` states `Infinity`, `-Infinity`, `-5`; `pellet_stock` `-3`, `Infinity`; vehicle `power_sensor` `Infinity`, `-500` | FR-3, FR-4, FR-5 | each renders its placeholder (`-- %`, `--`, `-- W`), no bar, one `non-numeric` warn per entity; `0` still renders as a measurement (circle at 0, `0 W`) |
| TC-BEM-U-11 | `warnOnce('not-found', '')`, `warnOnce('not-found', undefined)`, `warnOnce('non-numeric', 42)`; a card with `persons: [{entity: ''}]` and `alerts.occupancy: ''` rendered | FR-1, FR-6 | `console.warn` never called; empty-id indicator renders in the absent state |
| TC-BEM-U-12 | table-driven `setConfig` over every FR-8 rule: non-object (`null`, `42`, `'x'`), `{}` no `type`, `type: 3`, `stove: []`, `alerts: 'x'`, each of the eight array keys as `{}`, `persons: [null]`, `persons: [{entity: 42}]`, `automations.items: [{entity: 42}]`, `alerts: {smoke: {}}`, `alerts.occupancy: 1`, `access.items: [{entity: 'cover.a', lock: 1}]`, stove missing each of the three fields, `stove: null` (valid), vehicle missing `power_sensor` | FR-8 | each invalid case: no throw, one `console.error`, message equal to the FR-8 text of its rule (e.g. `persons[0].entity: expected a string`); the message of a case whose bad value is the sentinel `<script>SECRET-9f3</script>` contains neither `SECRET-9f3` nor `<script>`; `null` stove and `{type}` valid; no case throws in `shouldUpdate` or a section render |
| TC-BEM-U-13 | slider over an absent entity, a synthetic `input` event dispatched on the range, fake timers advanced 400 ms | FR-6.2 | `bridgeCall`/`callService` never invoked; `.slider-value` stays `--` |
| IT-BEM-I-01 | card with stove (3 entities) + vehicle absent from `hass.states`, plus a configured `alerts.occupancy` entity present that toggles `on`/`off`/`on` across 3 `hass` replacements, rendered once first | FR-1, FR-3, FR-4, FR-5, FR-7 | the occupancy pill text changes at every replacement (proof the card DID re-render, so the test is not vacuous); `-- %`, `--`, `-- W` visible; `console.warn` count is exactly 4 (`pellet_quantity`, `pellet_stock`, `status`, `power_sensor`), not 16; replacing `warnOnce` by a bare `console.warn` makes the count 16 and the test fail |
| IT-BEM-I-02 | same card: entity absent, render, `setConfig(<new object, same content>)`, render | FR-2, FR-7 | warn count goes 1 → 2 for the entity absent across `setConfig`; an entity that was present (never warned), then absent, warns once on the first absent render |
| IT-BEM-I-03 | `setConfig` invalid, then valid | FR-8, FR-11 | error card first (with `hass` set, `base-card.ts` untouched), then normal grid and no error card |
| IT-BEM-I-04 | missing-entity render plus a button whose `callService` rejects | FR-10 | `console.error('[sf-bridge] callService error:', e)` once, no toast of success, the call error produces no `console.warn` |
| IT-BEM-I-05 | simulated editor: `setConfig` called 5 times in a row, each with a fresh object holding one absent entity id, one empty-string id, one present id, a render after each | FR-2, FR-1 | warn count for the absent entity is 5 (once per `setConfig`, bounded), 0 for the empty-string and present ids |

## Builder Calls

- Display scope (*mine*, revised at the review): every absent indicator renders `--` or a neutral state (FR-6); crew keeps "no badge for an absent person" because an existing test pins it.
- Warn key (*mine*): `reason:entityId`; two reasons on one entity warn twice, by design (`not-found` and `non-numeric` are different diagnostics). Editor effect stated in FR-2.
- Error card (*mine*, revised): bridge-local placeholder config, no base-card hook (Assumption 4).
- Negative numeric readings (*mine*): a negative pellet quantity, stock or power is non-numeric (`>= 0` rule); revisit only if a bidirectional charger is configured.
- `sci-fi-bridge.ts` itself never calls `warnOnce` (its `getRelevantEntities` only collects ids); only sections do, so IT-BEM-I-01's count of 4 holds (*mine*).
- Config shape (*answered*): `src/cards/bridge/config.ts` types every `entity` as `string` on persons, actions and all item arrays, so FR-8 rule 5 rejects no valid dashboard.
- `warnOnce` is called from the render path of each section, through `this.hass.states[id]` lookups; the sections do not import each other.
- Documentation: `bridge.md` is amended by this SPEC (matrix, stove WARNING, vehicle layout and NOTE); BUILD does not re-edit it except for FR-9's test.

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| Entity absent from `hass.states` | `--` on a value slot, `Unavailable` on a state label, neutral state and disabled control elsewhere (FR-6) | Section visible | `console.warn('[sf-bridge] entity not found:', id)` once per entity until `setConfig()` (not for an empty id) |
| Numeric slot non-numeric (pellet, stock, EV power) | `-- %`, `--`, `-- W` + `Unavailable` (vehicle) | Section visible, bar hidden | `console.warn('[sf-bridge] non-numeric state:', id)` once per entity |
| Invalid config | `.sf-error-card` with the path-and-type message (no raw value) | Card in error, `setConfig` does not throw | `console.error('[sf-bridge] invalid config:', message)` |
| `callService` rejected | no visible message | HA state unchanged | `console.error('[sf-bridge] callService error:', e)` (unchanged) |

## Carriers & Consumers

| requirement | carried by | production consumer |
|----|-----------|---------------------|
| requirement FR-1 | — | `src/cards/bridge/sections/*.ts` and `sci-fi-bridge.ts` |
| requirements FR-8, FR-11 | code — `SciFiBridgeCard` validation | HA Lovelace and the bridge editor, which call `setConfig()` |

## References

- [bridge.md § Error Handling Matrix](../cards/bridge.md)
- [base-card](../../../src/utils/base-card.ts)
