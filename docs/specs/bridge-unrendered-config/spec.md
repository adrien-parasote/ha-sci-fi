---
spec: docs/specs/bridge-unrendered-config/spec.md
sources:
  - docs/specs/cards/bridge.md
  - docs/specs/bridge-error-matrix/spec.md
  - src/cards/bridge/sections/sf-bridge-alerts.ts
  - src/cards/bridge/sections/sf-bridge-access.ts
  - src/cards/bridge/sci-fi-bridge-editor.ts
---

# Bridge — configured but never rendered — Implementation Spec

Document Type: implementation

## Overview

Bead `ha-sci-fi-vp3` (retrocheck 2026-10-31, bead j02). Four capabilities of the bridge card are typed in `config.ts`, written by the editor or declared by [bridge.md](../cards/bridge.md), and have no effect at render time. This lot serves the documented contract (render them) and builds on the merged lot [bridge-error-matrix](../bridge-error-matrix/spec.md): its `warnOnce`, `renderSfToggle` and absent-entity vocabulary (FR-6, FR-6.2) are reused unchanged, never contradicted.

1. `alerts.smoke_switch` (siren switch): typed, edited, tracked by `getRelevantEntities`, rendered by no section; bridge.md gives it « Toggle sirènes » and `switch.turn_on/turn_off`.
2. The lock indicator of `sf-bridge-access` (F-BR-08) has no `@click`; bridge.md § sf-bridge-access prescribes `_toggleLock`.
3. Cycle `running_states` cannot be set from the visual editor, so a `sensor`-based cycle is unconfigurable although the editor is MANDATORY.
4. `sf-bridge-vehicle` hardcodes the section-title icon although `vehicle.icon` is typed and edited (bridge.md anti-pattern 10).

Plus dead CSS in `src/cards/bridge/styles.ts`: `.crew-badge-name`, `.vehicle-icon-square`, `.call-kids-btn` (no element in `src/` uses them).

Out of this lot (bead, not fix): validating `running_states` as an array of strings in `bridge-validate.ts` (a YAML string value makes `isCycleRunning` throw at card render, pre-existing). The editor, by contrast, must not throw on that value (FR-4).

## Requirements

- **FR-1**: `sf-bridge-alerts` renders, when `config.smoke_switch` is a non-empty string, one `.toggle-row.siren-row` between the smoke row and the toggles row: `sf-icon` `mdi:alarm-light` (on-colour when `state === 'on'`, disabled colour otherwise), a `.toggle-name` with text `msg('Sirens')`, and the shared `renderSfToggle`. The name class is `toggle-on` / `toggle-off`. With the entity absent from `hass.states` it follows the error-matrix FR-6 `alerts.toggles[]` row (class `toggle-unknown`, `data-on="false"`, button `disabled` with `aria-disabled="true"`) and calls `warnOnce('not-found', id)`. With the entity present but in state `unavailable` or `unknown` the toggle is likewise `toggle-unknown`, `disabled` with `aria-disabled="true"`, and calls no `warnOnce`. `undefined`, `null` and `''` render no row and no warn. `.siren-row` is a structural marker class only: it has no CSS rule (`.toggle-row` already styles the row).
- **FR-2**: a click on the siren toggle calls `switch.turn_off` when the state is `on`, otherwise `switch.turn_on`, with `{ entity_id: config.smoke_switch }`, through `bridgeCall` (toast only after success, rejection logged by `bridgeCall` as today). Success toast text: `msg('Sirens off')` after `turn_off`, `msg('Sirens on')` after `turn_on`. A disabled (absent, `unavailable` or `unknown`) toggle calls nothing.
- **FR-3**: in `sf-bridge-access`, when `entry.lock` is configured the lock indicator is a `button.lock-btn` wrapping the existing `sf-icon`. For `locked`, `unlocked`, `unknown`-absent and `unavailable` the class and icons are the existing `lock-locked` / `lock-unlocked` / `lock-unknown` / `lock-unavailable` mapping (error-matrix FR-6 unchanged). Two transitional/fault states get their own feedback: `locking` / `unlocking` use icon `mdi:lock-clock` and class `lock-pending` (colour `var(--sf-primary)`), `jammed` uses icon `mdi:lock-alert` and class `lock-jammed` (colour `var(--sf-warning)`); both classes are styled in `styles.ts`. A click calls `lock.unlock` when the lock state is `locked`, `lock.lock` when it is `unlocked`, with `{ entity_id: entry.lock }`, through `bridgeCall`; success toast `msg('Door unlocked')` after `unlock`, `msg('Door locked')` after `lock`. In every other case the button is `disabled` with `aria-disabled="true"` and calls nothing: states `unavailable`, `unknown`, `jammed`, `locking`, `unlocking`, `open`, …; an absent entity; a lock whose `attributes.code_format` is set (the card sends no code; this is not a new capability, only the refusal to offer a button HA would reject; its `title` is `msg('Code required')`); and a call in flight for that entity. In-flight guard: a per-entity-id set (Lit-reactive, or `requestUpdate()` on each change) is filled on click and emptied by the `after` option of the existing `bridgeCall` (`bridge-call.ts`, unchanged: `after(succeeded)` runs on success and on rejection, `bridgeCall` never rejects); while filled the button is disabled and a second click calls nothing. The icon and class of `locked` / `unlocked` stay the existing ones when `code_format` is set; `open`, `opening` and any state not named here use the existing `lock-unavailable` class and the open-padlock icon. `title` and `aria-label` (same text) name the action or state: `locked` → `msg('Unlock')`, `unlocked` → `msg('Lock')`, `locking` → `msg('Locking…')`, `unlocking` → `msg('Unlocking…')`, `jammed` → `msg('Lock jammed')`, `code_format` set → `msg('Code required')`, any other → `msg('Lock unavailable')`. One click, no confirmation dialog: user ruling (see Assumption 4).
- **FR-4**: the editor's appliances section shows, under each cycle whose `entity` starts with `sensor.`, a `sf-editor-input` labelled `getLabel('input-running-states')` (key added to `bridgeLabels()`, English `Running states (comma-separated)`, `fr.xlf` entry). While the user types, the editor keeps the raw typed string per cycle as the input's `.value` and never re-renders it from the stored array (no `join(', ')` per keystroke, so a trailing comma or space and multi-word states such as `Washing machine` stay typable). Each `input-update` writes `running_states` as the comma-split, trimmed, non-empty parts of that raw string; a blank value (or only separators) deletes the key (no `running_states: undefined` left in the config). The raw strings live in an editor-instance map keyed by cycle index; the map is cleared when a cycle is added, removed or reordered and when the editor receives a config it did not emit (`setConfig` from outside). `sf-editor-input` exposes no blur event and sets its own `.value` on each keystroke, so the editor binds `.value` to the raw string (or the initial value when no raw string exists) and listens to `focusout` (composed, bubbling from the inner input) on the `sf-editor-input` host; on `focusout` the raw string is dropped and the displayed value is normalised to `join(', ')`. Initial value of the input: `running_states.join(', ')` when it is an array, the string itself when the YAML holds a string, `''` otherwise; the editor never throws on a non-array `running_states`. When a cycle `entity` changes to a value not starting with `sensor.`, the cycle's `running_states` key and its raw string are deleted. A `binary_sensor.` or empty entity shows no such input. The stored array is what `isCycleRunning` already reads (case-insensitive match). A comma inside one state is not representable (accepted limit).
- **FR-5**: `sf-bridge-vehicle` renders the section-title icon as `config.icon ?? 'sci:landspeeder'`; the editor's section-icon field of the vehicle and its accordion header icon display the same default `sci:landspeeder`, and the `config.ts` comment on `VehicleConfig.icon` reads `default: 'sci:landspeeder'`; no `mdi:ev-station` remains for the vehicle section default in `src/cards/bridge/` (the plug icon of `.vehicle-body` is unchanged, and `src/cards/vehicles/` is out of this lot).
- **FR-6**: the rule blocks of `.crew-badge-name`, `.vehicle-icon-square` (with its `.charging` variant) and `.call-kids-btn` (with its `:hover`, `:active`, `[disabled]` variants) are removed from `styles.ts`; no file under `src/` or `tests/` other than the regenerated `tests/styles/card-css-baseline.json` names them. The `.lock-btn`, `.lock-pending` and `.lock-jammed` rules are added to `styles.ts` (no `.siren-row` rule, FR-1).
- **FR-7**: `bridge.md` states FR-1..FR-5: the alerts layout gains the siren row, the access layout and `_toggleLock` show the lock button with its disabled states, and `_toggleLock` is the `bridgeCall` snippet that sends `lock.unlock` only from `locked`, `lock.lock` only from `unlocked`, never from `jammed` / `unavailable` and never through `hass.callService` directly; the vehicle layout, YAML example and interface default read `sci:landspeeder`, and the editor table lists `running_states` as « sensor cycles only ».

## Assumptions

| # | Assumption | Risk | Source Type | Validation |
|---|------------|------|-------------|------------|
| 1 | Nothing under `src/` renders `smoke_switch` and nothing binds a click to the lock icon | Low | SHOW — read 2026-11-02: `sf-bridge-alerts.ts` render() ends at `_renderOccupancy()`; `sf-bridge-access.ts` lock `<sf-icon>` has no `@click` | TC-BUC-U-01, TC-BUC-U-03 |
| 2 | The three CSS families are unused | Low | SHOW — `grep -rn "crew-badge-name\|vehicle-icon-square\|call-kids-btn" src tests` returns only `styles.ts` and `tests/styles/card-css-baseline.json` | TC-BUC-U-07 |
| 3 | `isCycleRunning` already reads `running_states` case-insensitively, so FR-4 needs no card-side change | Low | SHOW — `sf-bridge-appliances.ts` lines 22-29 | IT-BUC-I-03 |
| 4 | Lock/unlock is ONE click with no confirmation dialog | Medium | TELL — user ruling given to this lot in the 2026-11-03 session (« lock = one click, no confirmation »); bridge.md records it after the fact, it is not the source | user ruling; TC-BUC-U-03, TC-BUC-U-09 |
| 5 | Keeping `sci:landspeeder` as the title default (not the documented `mdi:ev-station`) avoids changing every existing dashboard; the doc was the stale side | Medium | TELL — user ruling (default vehicle icon stays `sci:landspeeder`); `sf-bridge-vehicle.ts:72` ships it | user ruling; TC-BUC-U-06 |
| 6 | New strings (`Sirens`, `Sirens on`, `Sirens off`, `Door locked`, `Door unlocked`, `Lock`, `Unlock`, `Locking…`, `Unlocking…`, `Lock jammed`, `Lock unavailable`, `Code required`, `Running states (comma-separated)`) need `xliff/fr.xlf` entries via the project's extract flow; each is rendered by FR-2, FR-3 or FR-4 | Low | TELL — ADR-017 labels in `src/cards/bridge/labels.ts`, `msg()` everywhere | BUILD runs the extract; TC-BUC-U-05, TC-BUC-U-09, TC-BUC-U-10 assert the strings |

## Anti-patterns

| # | Anti-pattern | Instead |
|---|--------------|---------|
| 1 | Typing, editing and tracking a config key that no section renders | Render it, or remove it from type, editor and tracking; never leave the three halves out of step |
| 2 | Hardcoding an icon the config types (`bridge.md` anti-pattern 10) | `config.icon ?? <default>` |
| 3 | A new toggle markup beside `renderSfToggle`, or an unguarded `console.warn` | Reuse `renderSfToggle` and `warnOnce` (bridge-error-matrix FR-1, FR-6.2) |
| 4 | A lock click that calls `lock.lock` / `lock.unlock` while the state is `unavailable` or `jammed` | Disable the button outside `locked` / `unlocked` (FR-3) |
| 5 | Calling `hass.callService` directly | `bridgeCall` (toast after success, error logged) |
| 6 | Deleting CSS by guess | Prove no element uses it (grep in `src/`), regenerate the CSS baseline in the same diff |
| 7 | Re-rendering an editor input's value from the parsed config on each keystroke | Keep the raw typed string, normalise on blur (FR-4) |
| 8 | Leaving a hidden stale config key or `key: undefined` after an edit | Delete the key (FR-4) |

## Test Case Specifications

Tests live in `tests/cards/bridge/` and cite these ids in their titles.

| ID | Scenario | Covers | Expected |
|----|----------|--------|----------|
| TC-BUC-U-01 | `sf-bridge-alerts` with `smoke`, `smoke_switch`, `toggles`, `occupancy`; switch `on`, then `off`, then absent; then `smoke_switch` `undefined`, `null`, `''` | FR-1 | one `.siren-row` between `.alerts-smoke-row` and `.alerts-toggles-row`; icon `mdi:alarm-light`; name text `Sirens`; class `toggle-on` / `toggle-off`; absent: `toggle-unknown`, button `disabled`, `aria-disabled="true"`, one `not-found` warn; the three empty values: no `.siren-row`, no warn |
| TC-BUC-U-02 | click on the siren toggle with state `on`, then `off`; click on the disabled absent one | FR-2 | `callService('switch','turn_off',{entity_id})` then `('switch','turn_on',{entity_id})`; success toasts `Sirens off` then `Sirens on`; nothing called when disabled |
| TC-BUC-U-03 | `sf-bridge-access` entry with a lock, click with lock state `locked`, then `unlocked` | FR-3 | `button.lock-btn` wraps an `sf-icon` with class `lock-locked` / `lock-unlocked`; `callService('lock','unlock',{entity_id})` then `('lock','lock',{entity_id})`; no dialog element rendered or opened; toasts `Door unlocked` then `Door locked` |
| TC-BUC-U-04 | lock state `unavailable`, `jammed`, `unlocking`, and lock absent; click each | FR-3 | button `disabled` with `aria-disabled="true"`; no `callService`; absent: icon `mdi:lock-question`, class `lock-unknown` (error-matrix FR-6 preserved), one `not-found` warn |
| TC-BUC-U-05 | editor with cycles on `sensor.a`, `binary_sensor.b`, `''`; type `Running, washing ` then blank into the sensor cycle input | FR-4 | input present only for `sensor.a`, label key `input-running-states` resolves to `Running states (comma-separated)`; emitted config holds `running_states: ['Running','washing']`, then `'running_states' in cycle` is false |
| TC-BUC-U-06 | vehicle with `icon: 'mdi:car-electric'`, then without icon; editor vehicle section without icon | FR-5 | `.bridge-section-title sf-icon` icon `mdi:car-electric`, then `sci:landspeeder`; the plug icon inside `.vehicle-body` unchanged; editor field value and accordion header icon `sci:landspeeder`; `grep "ev-station" src/cards/bridge` finds no vehicle-default occurrence |
| TC-BUC-U-07 | read `src/cards/bridge/styles.ts`, scan `src/` and `tests/` | FR-6 | no `.crew-badge-name`, `.vehicle-icon-square`, `.call-kids-btn` in `styles.ts`; `.lock-btn`, `.lock-pending`, `.lock-jammed` present; no `.siren-row` rule; no other file names the three removed selectors (baseline JSON excepted) |
| TC-BUC-U-08 | read `docs/specs/cards/bridge.md` alerts, access, vehicle and editor sections | FR-7 | alerts layout names `.siren-row`; access section names `.lock-btn` and the `disabled` states; the `_toggleLock` snippet contains `bridgeCall`, contains no `callService` and no `lock.lock` reachable from `jammed`/`unavailable`; vehicle section/YAML/interface read `sci:landspeeder` and no `config.icon ?? 'mdi:ev-station'` remains; editor table row mentions `running_states` for sensor cycles |
| TC-BUC-U-09 | lock `locked` / `unlocked` with a lock that has `attributes.code_format: '^\\d+$'`; click; then lock `locked` with `code_format` absent, click twice quickly with `callService` pending, then resolve; then `locking` and `jammed` states | FR-3 | `code_format` set: button `disabled`, title `Code required`, no `callService`; double click: exactly one `callService`, button disabled while pending and enabled again after settle (also after a rejection); `locking`: icon `mdi:lock-clock`, class `lock-pending`; `jammed`: icon `mdi:lock-alert`, class `lock-jammed`; `title` equals `aria-label` and is `Unlock` / `Lock` / `Locking…` / `Lock jammed` |
| TC-BUC-U-10 | siren switch in `unavailable`, then `unknown`, then `on`; click the first two | FR-1, FR-2 | `toggle-unknown`, button `disabled` with `aria-disabled="true"`, no `callService`, no `not-found` warn; `on` is clickable |
| TC-BUC-U-11 | editor, sensor cycle input: type character by character `Wash`, `Washing machine`, `Washing machine,`, `Washing machine, ` then second entry `Running`; then blur | FR-4 | after each step the input `.value` is exactly the typed string (trailing comma and space kept); the emitted config is `['Washing machine']` then `['Washing machine','Running']`; after blur the value is `Washing machine, Running` |
| TC-BUC-U-12 | editor with `running_states: 'Running'` (string) and with `running_states: 5` in the YAML; render | FR-4 | no exception; input value `Running`, then `''`; typing replaces the key with an array |
| TC-BUC-U-13 | editor sensor cycle with `running_states: ['Running']`; change its entity to `binary_sensor.x`, and separately to `''` | FR-4 | the cycle has no `running_states` key (`'running_states' in cycle` false) and no input is shown |
| IT-BUC-I-01 | full `sci-fi-bridge` card with `alerts.smoke_switch`; `hass` replaced with the switch `off` then `on`; click | FR-1, FR-2 | the siren toggle re-renders at each replacement (`getRelevantEntities` tracks it); click calls `switch.turn_on` / `switch.turn_off` on the configured entity |
| IT-BUC-I-02 | full card with a cover + lock; click the lock button; `callService` rejecting | FR-3 | `lock.unlock` called with the lock entity id; on rejection `console.error('[sf-bridge] callService error:', e)` once, no success toast, no `console.warn`; the lock button is clickable again afterwards |
| IT-BUC-I-03 | editor emits a config from a `sensor.dishwasher` cycle with `running_states` typed `Running`; the card is fed that config with state `running` | FR-4, FR-5 | the cycle renders running (`.cycle-status.running`, case-insensitive); with the key absent the cycle renders idle; the vehicle title icon follows the emitted `vehicle.icon` |

## Error Handling

| Error | Response | Fallback | Logging |
|-------|----------|----------|---------|
| Siren entity absent from `hass.states` | `toggle-unknown`, toggle disabled (FR-1) | Section visible | `console.warn('[sf-bridge] entity not found:', id)` once (`warnOnce`) |
| Siren entity `unavailable` / `unknown` | `toggle-unknown`, toggle disabled (FR-1) | Section visible | none |
| Lock entity absent / state not `locked`/`unlocked` / `code_format` set | lock button disabled with `title` (FR-3) | Icon keeps its state class (`lock-pending` / `lock-jammed` for the transitional states) | absent: `warnOnce` as today; other states: none |
| `switch` / `lock` `callService` rejected | no visible message | HA state unchanged; in-flight guard released | `console.error('[sf-bridge] callService error:', e)` (via `bridgeCall`) |
| `running_states` input blank | key deleted | cycle idles until a state matches | none |
| `running_states` in the YAML is not an array | editor shows the string or `''`, does not throw (FR-4) | the user retypes it | none |

## Carriers & Consumers

| FR | carried by | production consumer |
|----|-----------|---------------------|
| FR-1, FR-2 | config/schema — `alerts.smoke_switch` in the user's dashboard YAML | `src/cards/bridge/sci-fi-bridge.ts` (renders `sf-bridge-alerts`) |
| lock button (FR-3) | — | `src/cards/bridge/sci-fi-bridge.ts` (renders `sf-bridge-access`) |
| running_states (FR-4) | config/schema — `appliances.cycles[].running_states` | `src/cards/bridge/sections/sf-bridge-appliances.ts`, written by `sci-fi-bridge-editor.ts` |
| vehicle icon (FR-5) | config/schema — `vehicle.icon` | `src/cards/bridge/sci-fi-bridge.ts` |

## Builder Calls

- Siren row label and icon (*mine*): `msg('Sirens')` and `mdi:alarm-light`; bridge.md names the usage « Toggle sirènes » only. Editing the label later is a one-line change.
- Siren on-state (*mine*): `state === 'on'` only, unlike `alerts.toggles` which also accepts `enabled`; a `switch` never reports `enabled`.
- Lock click without confirmation: NOT a builder call, a user ruling (Assumption 4). Title/aria-label, the `lock-pending` / `lock-jammed` feedback and the in-flight guard are not confirmations; they do not add a step to the click.
- `code_format` lock disabled (*mine*): HA rejects a code-less call on such a lock and `bridgeCall` would swallow it, leaving a dead button; disabling it is not a new capability (no code entry is added).
- Vehicle default icon: user ruling (Assumption 5), the doc is amended (FR-7).
- `running_states` input on `sensor.` only (*mine*): `binary_sensor` ignores the key at render, so showing it there would be another editor field with no effect (anti-pattern 1).
- Siren icon colours (agent's call: consistency): the on and disabled colour tokens of the neighbouring `alerts.toggles` rows are reused, no new token.
- Vehicle default in the editor (agent's call: no hidden write): the default `sci:landspeeder` is displayed only; `vehicle.icon` stays absent from the emitted config until the user picks an icon.
- Siren entity picker (agent's call: out of scope): the editor's `smoke_switch` picker is unchanged by this lot.
- CSS baseline regeneration (agent's call): by the project's existing baseline script in `package.json`, found by the builder.
- Out of scope (*mine*): array-of-strings validation of `running_states` at card render is a bead; a comma inside a state; the siren-off-during-fire question; `switch` domain hardcoded for the siren.

## References

- [bridge.md](../cards/bridge.md) § sf-bridge-alerts, § sf-bridge-access, § sf-bridge-vehicle, § Editor
- [bridge-error-matrix spec](../bridge-error-matrix/spec.md)
- [bridge-toggle](../../../src/cards/bridge/bridge-toggle.ts), [bridge-call](../../../src/cards/bridge/bridge-call.ts)
