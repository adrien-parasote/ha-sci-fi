AUDITOR: subagent

# Code review — p1-runtime-defects (fix lane, observations O1–O6)

Packet: `.sc/review/65cc72d-5a077272` (dirty, base `65cc72d`). The packet's
`must_read.txt` is empty — no entry point was packaged; scope was taken from
`files.txt` plus the joins followed out of it.

COVERAGE

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/plugs/sci-fi-plugs.ts | 644 | 644 | yes |
| src/cards/plugs/styles.ts | 263 | 263 | yes (grep + 60–220 in full) |
| src/cards/vehicles/sf-landspeeder.ts | 280–534 + diff | 534 | partial (middle/charging zones + every hunk) |
| src/cards/vehicles/sci-fi-vehicles.ts | 231 | 231 | yes |
| src/cards/vehicles/sci-fi-vehicles-editor.ts | 160 | 160 | yes (table + render) |
| src/cards/vehicles/labels.ts | 31 | 31 | yes |
| src/cards/vehicles/landspeeder-svg.ts | diff hunk | 427 | partial (prologue removal only) |
| src/cards/tv/sci-fi-tv.ts | 603 | 603 | yes |
| src/cards/tv/sci-fi-tv-editor.ts | 249 | 249 | yes |
| src/cards/tv/config.ts | 35 | 35 | yes |
| src/cards/weather/sci-fi-weather.ts | 627 | 627 | yes (full read of 1–135, grep-traced remainder) |
| src/cards/weather/sci-fi-weather-editor.ts | 182 | 182 | yes |
| src/cards/weather/config.ts | 27 | 27 | yes |
| src/cards/climates/sf-radiator.ts | 496 | 496 | yes (1–70 + every hunk + lookup sites) |
| src/cards/climates/sci-fi-climates.ts | 388 | 388 | yes (1–95 + grep-traced remainder) |
| src/cards/bridge/bridge-call.ts | 50 | 50 | yes |
| src/cards/bridge/bridge-toast.ts | 22 | 22 | yes |
| src/cards/bridge/sections/sf-bridge-actions.ts | 122 | 122 | yes |
| src/cards/bridge/sections/sf-bridge-automations.ts | 176 | 176 | yes |
| src/cards/bridge/sections/sf-bridge-access.ts | 153 | 153 | yes (diff + grep) |
| src/cards/bridge/sections/sf-bridge-alerts.ts | 159 | 159 | yes (diff + grep) |
| src/utils/base-card.ts (join, not in diff) | 156 | 156 | yes |
| src/utils/base-editor.ts (join, not in diff) | 213 | 213 | partial (config helpers) |
| tests/fixtures/mock-hass.ts (join) | 113 | 113 | yes |
| dev/cards/plugs.js | 48 | 48 | yes |
| xliff/fr.xlf, src/locales/locales/fr.js (joins) | grep | — | searched for the 4 new keys |
| every test file in the diff | via diff.patch | — | yes |

VERDICT: BLOCK

SPEC: docs/specs/cards/{plugs,tv,vehicles,weather,climates,bridge}.md,
docs/specs/10_card_editors.md, docs/cards/tv.md, docs/cards/weather.md,
docs/fixes/p1-runtime-defects/lot.json

## FINDINGS

- [HIGH] src/cards/tv/sci-fi-tv-editor.ts:107 — a dashboard saved by an earlier version keeps firing an old script on the TV's confirm button and its owner can no longer stop it: clearing the binding in the visual editor appears to work, the saved config still carries it, and the binding is back on the next render. Replacing it instead hides a second copy that comes back the moment the new one is cleared. — `_handleActionUpdate` writes and deletes only `custom_actions[actionId]`; for `actionId === 'confirm'` it never touches `custom_actions.enter`, while `:234` displays `confirm ?? enter` and this lot removed the `enter` selector at `:23` that used to be the only UI able to delete it. This violates the amended `docs/specs/cards/tv.md` § custom_actions (F-TV-ALIAS, "the confirm button reads `confirm ?? enter`; new config is written as `confirm`"): a write path that leaves the legacy key in place is not "written as `confirm`", and the spec never says what clearing the selector must do.
  Reproduced: a probe mounting the editor on `{custom_actions:{enter:{action:'call-service',service:'script.legacy'}}}` and dispatching `input-update {id:'confirm', value:{action:'none'}}` on `sf-editor-action[element-id="confirm"]` received `config-changed` with `custom_actions = {"enter":{"action":"call-service","service":"script.legacy"}}`; the replace case received `{"enter":{…legacy},"confirm":{…new}}`.
  SITES: src/cards/tv/sci-fi-tv-editor.ts:107 (the delete branch)
  SITES: src/cards/tv/sci-fi-tv-editor.ts:110 (the write branch)
  SITES: src/cards/tv/sci-fi-tv-editor.ts:234 (the display that makes `enter` look reachable)
  SITES: src/cards/tv/sci-fi-tv-editor.ts:23 (`enter` dropped from the selector list, closing the old exit)
  FALSIFIED BY: a test that clears the confirm selector on a config carrying only `enter` and asserts the emitted config has NEITHER `confirm` nor `enter` — a fix that deletes only `confirm` still fails it; a second case must set a NEW action and assert `enter` is gone from the emitted config too.
  ROOT: F-TV-ALIAS — the `enter`→`confirm` migration is total on write
  FIX-CLASS: corrects

- [HIGH] src/cards/plugs/sci-fi-plugs.ts:163 — the four new pieces of text this lot puts on screen appear in English on a French dashboard, which is the locale this card collection targets: the OFFLINE badge that is the entire visible payload of the O5 fix, the chart's failure message, the "no vehicle" message, and the new editor row label — each sitting beside French text. — `msg('Offline')`, `msg('Power history unavailable')` (`:478`), `msg('No vehicle configured')` (`src/cards/vehicles/sci-fi-vehicles.ts:88`) and `msg('Charge state')` (`src/cards/vehicles/labels.ts:26`) have no `<source>` in `xliff/fr.xlf` and no compiled template in `src/locales/locales/fr.js`; the lot touches neither file. This violates `docs/specs/10_card_editors.md:820` AP#11 (the editor anti-pattern that ends "add the corresponding entry to `xliff/fr.xlf` and regenerate `src/locales/locales/fr.js` with `npm run localize-build`"), `docs/specs/cards/plugs.md:893` § Localization — New msg() Keys, and `docs/specs/cards/vehicles.md:681` § Localization — New msg() Keys. Nothing in the suite looks at translation completeness (`tests/localization.test.ts` only exercises the runtime pair), so the lot is green with the obligation unmet.
  Reproduced: `grep -rn 'Offline\|Power history unavailable\|No vehicle configured\|Charge state' xliff/fr.xlf src/locales/locales/fr.js` → no match (the pre-existing `No power data to display` IS in `xliff/fr.xlf:29`, which is what the convention looks like when honoured).
  SITES: src/cards/plugs/sci-fi-plugs.ts:163
  SITES: src/cards/plugs/sci-fi-plugs.ts:478
  SITES: src/cards/vehicles/sci-fi-vehicles.ts:88
  SITES: src/cards/vehicles/labels.ts:26
  SITES: xliff/fr.xlf and src/locales/locales/fr.js — the two files that must receive the keys
  FALSIFIED BY: a test asserting every `msg('…')` string literal in `src/` has a matching `<source>` in `xliff/fr.xlf` — it fails on all four today and keeps failing if only one is added.
  ROOT: § Localization — New msg() Keys (every new msg() key lands in xliff/fr.xlf and fr.js)
  FIX-CLASS: corrects

- [MEDIUM] src/cards/plugs/sci-fi-plugs.ts:476 — once one history call fails, "Power history unavailable" stays printed under the chart of every plug the user then selects — including plugs that have no power sensor and never made a call — so the message accuses the wrong device and cannot be cleared; and for the whole two seconds the call is allowed, the chart area is blank with no sign anything is happening. — `_historyError` and `_historyLoading` are `@state()` fields that no template and no branch in `src/` ever reads (written at `:441`, `:442`, `:476`, `:481`; `grep -rn '_historyLoading\|_historyError' src/` finds no reader), while the message is written imperatively into `.msg-container` at `:478`, a node `_renderContent` emits with no binding at `:204` — so Lit never rewrites it and the cache-hit early return at `:432-439` never clears it. The doc comment at `:70-74` states "they are `@state()` because the chart area renders from them", which is not true of either field. `docs/specs/cards/plugs.md:930` (F-PLG-AF2, the power-history timeout row) asks for "a `historyLoading` property **and an error state UI** for the chart section": an error UI that cannot be un-shown is not one, and a loading property with no UI is not a loading state.
  Reproduced: a probe that rejects `callApi` for the TV plug, asserts `.msg-container` reads "Power history unavailable", then calls `_next()` onto a lamp plug with no power sensor, finds `.msg-container` still "Power history unavailable".
  SITES: src/cards/plugs/sci-fi-plugs.ts:75-76 (the two unread fields)
  SITES: src/cards/plugs/sci-fi-plugs.ts:478 (the imperative error text)
  SITES: src/cards/plugs/sci-fi-plugs.ts:204 (the unbound `.msg-container` Lit will not clear)
  SITES: src/cards/plugs/sci-fi-plugs.ts:432-439 (the cache-hit return that skips clearing it)
  FALSIFIED BY: fail the history call for plug A, navigate to a plug with no power sensor, assert `.msg-container` is empty — and, in the same test, assert that while the call is in flight the shadow DOM carries a loading indicator driven by `_historyLoading`. Clearing the text in `_next` alone leaves the second assertion failing.
  ROOT: F-PLG-AF2 — the chart section's loading and error states are rendered, not merely recorded
  FIX-CLASS: corrects

- [MEDIUM] src/cards/plugs/sci-fi-plugs.ts:447 — on a dashboard with a single plug, one slow history answer loses the power chart until the browser is reloaded. Home Assistant's `history/period` over 24 h of a power sensor routinely exceeds two seconds on a Pi-class recorder, and this lot makes that a hard failure with no way back. — `_withTimeout` rejects at the budget, nothing resets `_chartLoaded` (set at `:113` *before* the call), and `updated()` at `:106-108` only reloads on a `_selected_plug_id` change or the first `hass`; with one device the footer arrows are hidden (`multiple` is false at `:362`) and clicking the single selector button re-assigns the same index, so no reactive change is produced. The 2 s budget itself is what `docs/specs/cards/plugs.md:930` demands — the gap is that the card owes the user a route back to the chart after a transient failure.
  SITES: src/cards/plugs/sci-fi-plugs.ts:447 (the timeout)
  SITES: src/cards/plugs/sci-fi-plugs.ts:113 (`_chartLoaded = true` set before the call can fail)
  SITES: src/cards/plugs/sci-fi-plugs.ts:106-108 (the only two reload triggers)
  SITES: src/cards/plugs/sci-fi-plugs.ts:362 (navigation hidden for a single plug)
  FALSIFIED BY: one configured device; `callApi` rejects once then resolves; advance past the budget, push a fresh `hass`, assert a second `callApi` happened and a chart exists. No second call is made today.
  ROOT: F-PLG-D04 — the power chart survives a transient history failure
  FIX-CLASS: corrects

- [MEDIUM] src/cards/tv/sci-fi-tv.ts:486 — three of the behaviours this lot adds can be deleted by a later edit with the whole suite still green, which is how the observations being fixed here were introduced in the first place. Proven by mutation, not inferred:
  `_handleMuteClick`'s custom-action branch replaced by `undefined` leaves `tests/cards/tv` fully green (`M14 SURVIVED`) — yet the amended `docs/specs/cards/tv.md` § `volume_mute` and `docs/cards/tv.md:29` advertise `volume_mute` as bindable and the editor now ships its selector; that is the exact shape of O2 (a key the editor writes and the card ignores), left unguarded.
  `src/cards/plugs/sci-fi-plugs.ts:219` — `isOn && !isUnavailable` reduced to `isOn` leaves `tests/cards/plugs` green (`M10 SURVIVED`): no test asserts the cable stops animating, or that `.image.unavailable` is applied, on an unreachable plug, which is half of what `docs/specs/cards/plugs.md:929` (F-PLG-AF1, the unavailable-state row) asks to be visible.
  `src/cards/vehicles/sci-fi-vehicles-editor.ts:45` — the new `charge_state` row has no assertion anywhere (`grep -rn 'charge-state' tests/` → none; the editor suite has no field-count test), although `docs/fixes/p1-runtime-defects/lot.json` names `npx vitest run tests/cards/vehicles/ -t "O6"` as this observation's proof.
  SITES: src/cards/tv/sci-fi-tv.ts:486
  SITES: src/cards/plugs/sci-fi-plugs.ts:219
  SITES: src/cards/vehicles/sci-fi-vehicles-editor.ts:45
  FALSIFIED BY: re-run the three mutants above; adding only the mute probe leaves M10 and the `charge_state` row alive.
  ROOT: the lot register's contract — one regression test per observation that fails without the fix
  FIX-CLASS: corrects

- [LOW] src/cards/weather/sci-fi-weather.ts:90 — the very failure the O1 fix exists to prevent is still reachable: `chart_first_kind_to_render: constructor` (or `toString`, `valueOf`) passes the `key in SENSORS_MAP` guard, because `in` walks `Object.prototype`, so `SENSORS_MAP[key]` is a function, `config.chartTitle.icon` throws and the card becomes the error card. The twin lookup at `src/cards/climates/sf-radiator.ts:61-62` is worse: `PRESET_STYLE_KEYS['constructor']` yields a function and `for (const key of …)` throws "is not iterable" through render. Both maps are plain object literals indexed by an outside-supplied string. Use `Object.prototype.hasOwnProperty.call(map, key)`, or build the maps with `Object.create(null)`.
  SITES: src/cards/weather/sci-fi-weather.ts:90, src/cards/climates/sf-radiator.ts:61-62

- [LOW] src/cards/climates/sci-fi-climates.ts:35 — delete the last `climate.*` entity in Home Assistant and the climates card keeps showing the removed radiator, possibly for months. Adding `sensor.season` unconditionally means `getRelevantEntities()` can never return an empty array again, which disables the base card's "no relevant entities ⇒ repaint on every change" escape at `src/utils/base-card.ts:76`; the card then only repaints when `sensor.season` moves, which is four times a year. Add the season entity only when the climate set is non-empty.
  SITES: src/cards/climates/sci-fi-climates.ts:23-37, src/utils/base-card.ts:76

- [LOW] src/cards/plugs/sci-fi-plugs.ts:312 — a plug the card has just labelled OFFLINE still offers two live controls: the child-lock toggle and the option dropdown in its sensor list stay clickable and fire `switch.turn_on` / `select.select_option` at the unreachable device, so the user gets an error toast where a disabled control belongs. `docs/specs/cards/plugs.md:929` says the card "MUST disable interaction buttons" — the lot guarded only the image toggle (`:405`).
  SITES: src/cards/plugs/sci-fi-plugs.ts:312 (`_renderLockSensor`'s `sf-button-card`), src/cards/plugs/sci-fi-plugs.ts:286 (`_renderSelectSensor`'s dropdown), src/cards/plugs/sci-fi-plugs.ts:405 (the one guard that was added)

- [LOW] src/cards/weather/config.ts:23 — a dashboard author cannot learn that `wind_speed` is now accepted: the user-facing `docs/cards/weather.md:70` still lists only `temperature`, `precipitation`, `wind`, and this comment asserts "`wind_speed` is the one weather.md documents", which that line contradicts. The lot updated the sibling user doc for the tv change (`docs/cards/tv.md:29-33`) and left the weather one, so the omission is inconsistent within the lot itself.
  SITES: src/cards/weather/config.ts:23, docs/cards/weather.md:70

- [LOW] src/cards/vehicles/sci-fi-vehicles.ts:88 — the empty-vehicle message does not match the spec row that prescribes it: `docs/specs/cards/vehicles.md:671` says `renderCard()` returns ``html`<div>No vehicles configured</div>` `` and the code emits `<div class="empty-message">No vehicle configured</div>` — singular, wrapped in a class that has no CSS rule anywhere (`grep -rn 'empty-message' src/` finds the two call sites and no stylesheet), so the message renders unstyled. The author amended the two Error-Handling rows below this one (`:673`, `:674`) and left this row alone; either the row or the string should move.
  SITES: src/cards/vehicles/sci-fi-vehicles.ts:88, docs/specs/cards/vehicles.md:671

## NOTES

- The `after` hook cannot leave `sf-bridge-actions`' loading set stuck: `bridgeCall` calls it on both arms (`src/cards/bridge/bridge-call.ts:45` and `:48`), and the only `after` in the tree (`sf-bridge-actions.ts:108-112`) does Set arithmetic that cannot throw. The never-settles exposure is identical to the `.finally()` it replaces. One contract seam: if an `after` ever threw inside the catch arm, the "never rejects" promise would reject and the `void` caller would leak an unhandled rejection — a `finally` would close it, but no current caller can reach it.
- No bridge caller lost an error it used to surface. At the lot's base all six `callService` sites had no `.catch()`, and `grep -rn 'callService' src/cards/bridge/` now finds none outside `bridge-call.ts`. The failure behaviour matches `docs/specs/cards/bridge.md:1359` verbatim, log string included; AP#6 at `:1296` is the same rule.
- `_withTimeout` (`src/cards/plugs/sci-fi-plugs.ts:490-507`) clears its timer on both settle paths and leaves no dangling rejection: `promise.then(ok, err)` attaches a rejection handler immediately, so a late rejection after the timeout is consumed by an already-settled promise rather than escaping.
- Both `willUpdate` clamps are loop-free and do not fight navigation: Lit folds a reactive write made in `willUpdate` into the cycle already in progress, and the clamp is a no-op whenever the index is in range; with an empty list both return before touching the index (`sci-fi-plugs.ts:93-97`, `sci-fi-vehicles.ts:75-79`).
- The O4 alias table cannot mask a genuinely unmapped mode: an unknown spelling resolves to `[mode]`, misses, and falls through to the `off` state style — exactly `docs/specs/cards/climates.md:99` TC-005 and its Error-Handling row at `:109`. The `off` fallback chain is right for modes and for hvac states.
- `tests/dev/workbench.test.ts` is red for a pre-existing reason: `dev/modules/mock-hass.js` imports `/node_modules/home-assistant-js-websocket/dist/index.js` absolutely. Verified unrelated to this lot's `dev/cards/plugs.js` edit. Side effect worth knowing: the two new workbench scenarios are unvalidated in this worktree.
- `tests/cards/bridge/sections/sf-bridge-toast-timing.test.ts:12-14` defines a stub `sf-icon` element after the imports that have already registered the real one — dead lines.
- `AP#5` as cited by `src/cards/vehicles/sci-fi-vehicles.ts:28` says nothing about units (`docs/specs/cards/vehicles.md:633` is about calling the right service); the Celsius decision is carried by the amendment at `:344-351`, which is where the citation belongs. The behaviour itself is sound — label and payload are the same number.
- `info` having no TV button is pre-existing and escalated (ha-sci-fi-ecr); dropping its selector is an improvement and `docs/cards/tv.md:31-33` now says so plainly.
- The plug clamp does not call `_clearChart()`, so after a clamp the previous plug's `Chart` instance is reused via `_updateChart`. Harmless here; worth a thought if the chart gains per-plug options.
- `.cirle-container.on` carries no CSS rule (`src/cards/plugs/styles.ts:193-214`), so replacing `isOn ? 'on' : 'off'` with `'' | 'off'` on the right-hand container loses nothing.

## MUTATION

MUTATION: sf-landspeeder `if (!v.lock_status) return nothing;` removed — KILLED by sf-landspeeder.test.ts "renders no lock panel when the vehicle has no lock sensor"
MUTATION: sf-landspeeder `if (!v.fuel_autonomy && !v.fuel_quantity) return nothing;` removed — KILLED by sf-landspeeder.test.ts "renders no fuel panel when the vehicle has neither fuel sensor"
MUTATION: sf-landspeeder battery thresholds put back on `rawBattery` — KILLED by sf-landspeeder.test.ts "paints battery 19.6 as orange"
MUTATION: sci-fi-vehicles `this._active_vehicle_id = 0;` clamp removed — KILLED by sci-fi-vehicles.test.ts "clamps the active vehicle when the list shrinks"
MUTATION: sci-fi-vehicles `AC_TEMP_UNIT` changed to '°F' — KILLED by sci-fi-vehicles.test.ts "labels the temperature wheel in Celsius even in an imperial system"
MUTATION: sci-fi-vehicles empty-vehicles branch disabled — KILLED by sci-fi-vehicles.test.ts "says so instead of erroring when no vehicle is configured"
MUTATION: landspeeder-svg `<?xml …?>` prologue put back — KILLED by sf-landspeeder.test.ts "emits no processing-instruction node in the landspeeder svg"
MUTATION: sci-fi-weather `CHART_KIND_ALIASES` wind entry removed — KILLED by sci-fi-weather.test.ts "maps the editor value wind onto the wind_speed series"
MUTATION: sci-fi-weather `normalizeChartKind` fallback dropped (returns key) — KILLED by sci-fi-weather.test.ts "falls back to temperature on a value no series answers"
MUTATION: bridge-call toast moved before the await — KILLED by bridge-call.test.ts "announces success only once the service call has resolved"
MUTATION: bridge-call `options.after?.(false)` removed — KILLED by bridge-call.test.ts "reports whether the call succeeded through the after hook"
MUTATION: bridge-call `console.error('[sf-bridge] callService error:', err)` removed — KILLED by bridge-call.test.ts "shows no toast at all when the call is rejected"
MUTATION: sci-fi-plugs `_selected_plug_id = 0` clamp removed — KILLED by sci-fi-plugs.test.ts "clamps the selected plug when the device list shrinks"
MUTATION: sci-fi-plugs `_isUnavailable` narrowed to `state === undefined` — KILLED by sci-fi-plugs.test.ts "treats unknown like unavailable"
MUTATION: sci-fi-plugs `_toggle` guard reverted to the old states lookup — KILLED by sci-fi-plugs.test.ts "renders an offline state and refuses to toggle an unavailable plug"
MUTATION: sci-fi-plugs offline tag replaced by nothing — KILLED by sci-fi-plugs.test.ts "renders an offline state and refuses to toggle an unavailable plug"
MUTATION: sci-fi-plugs `_historyStart` truncated back to a bare YYYY-MM-DD — KILLED by sci-fi-plugs.test.ts "asks history for a rolling 24-hour window, not midnight yesterday"
MUTATION: sci-fi-plugs `_withTimeout` bypassed — KILLED by sci-fi-plugs.test.ts "shows an error state when the history call exceeds its budget"
MUTATION: sci-fi-plugs chart error text write removed — KILLED by sci-fi-plugs.test.ts "shows an error state when the history call exceeds its budget"
MUTATION: sci-fi-tv `enter` alias dropped from `_handleDpadClick` — KILLED by sci-fi-tv.test.ts "fires the custom action bound to enter on the confirm button"
MUTATION: sci-fi-tv `_togglePower` power custom action ignored — KILLED by sci-fi-tv.test.ts "honours the custom action bound to power instead of toggling the entity"
MUTATION: sci-fi-tv `app_entity` dropped from getRelevantEntities — KILLED by sci-fi-tv.test.ts "repaints when app_entity changes, since the card reads it"
MUTATION: sci-fi-climates `entities.add(SEASON_ENTITY)` removed — KILLED by sci-fi-climates.test.ts "O4: lists sensor.season among its relevant entities"
MUTATION: sf-radiator `PRESET_STYLE_KEYS` comfort_1 entry removed — KILLED by sf-radiator.test.ts "applies the configured style for comfort_1"
MUTATION: sf-radiator `__modeIcon` off-state fallback removed — KILLED by sf-radiator.test.ts "falls back to the off icon and colour for an unmapped preset"
MUTATION: sci-fi-tv `_handleMuteClick` custom-action branch removed — SURVIVED
MUTATION: sci-fi-plugs `cableClass` unavailable arm removed (`isOn && !isUnavailable` → `isOn`) — SURVIVED
MUTATION: sci-fi-tv-editor confirm selector shows only `confirm` (alias display dropped) — SURVIVED

Harness: a scratch Vitest config adding a `transform` plugin that rewrites one
anchor in one source file before esbuild; nothing was written into the tree.
`--no-fsModuleCache` is required — without it Vitest serves the previous run's
transformed module and every later mutant reads as applied-but-inert (an
identity mutation reproduces the artefact).

## CONFORMANCE EVIDENCE

- `docs/specs/cards/tv.md` § `volume_mute` without a custom action ⇒ `media_player.volume_mute` on `volume_entity || entity`, `is_volume_muted` negated → `src/cards/tv/sci-fi-tv.ts:493-500`; the mute button no longer routes through `_handleDpadClick` (`:297`), whose signature is now `keyof typeof D_PAD_KEYS` (`:457`) so no non-key can reach `remote.send_command` again.
- `docs/specs/cards/bridge.md:1359` (failed `callService` ⇒ no visible message, `console.error('[sf-bridge] callService error:', e)`) and AP#6 at `:1296` → `src/cards/bridge/bridge-call.ts:43-49`, with all six former sites now routed through it (`sf-bridge-access.ts:127,138`, `sf-bridge-alerts.ts:144`, `sf-bridge-automations.ts:124,154`, `sf-bridge-actions.ts:100`).
- `docs/specs/cards/climates.md:99` TC-005 and `:109` (unmapped mode ⇒ the `off` icon and colour) → `src/cards/climates/sf-radiator.ts:418-448`, applied to the preset button, the hvac button and both dropdown item lists (`:396-420`).
- `docs/specs/cards/vehicles.md:511` (battery colour on the rounded level) → `src/cards/vehicles/sf-landspeeder.ts:443`, and `:673` (a panel whose sensor is unconfigured is absent) → `:381` and `:399`.
- `docs/specs/cards/vehicles.md:344-351` (the AC wheel is Celsius on every unit system, label = payload) → `src/cards/vehicles/sci-fi-vehicles.ts:146` and `:185`, both fed by `AC_TEMP_MIN_C`/`AC_TEMP_UNIT` at `:31-32`.
- `docs/specs/cards/weather.md:18` (`wind` and `wind_speed` both read, unknown ⇒ `temperature`) → `src/cards/weather/sci-fi-weather.ts:85-91` and `:124`, read at the single config read point in `connectedCallback`.
- `docs/specs/cards/plugs.md:46` F-PLG-D04 (window start is a full ISO timestamp exactly 24 h back) → `src/cards/plugs/sci-fi-plugs.ts:553-555`.
- `docs/specs/cards/plugs.md:55` adversarial row 7 as amended (`destroy()` then null, canvas reused) → `src/cards/plugs/sci-fi-plugs.ts:419-424` and `:561-565`; the code is right and the amendment is the honest direction of the Golden Rule here.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 2 | blocking |
| MEDIUM | 3 | fix |
| LOW | 5 | note |

Positive observations:
- Routing every bridge service call through one `bridgeCall` helper, with the
  failure behaviour quoted from the spec row rather than invented, is the right
  shape: it made one test file able to prove the toast ordering for four
  sections, and the mutation of the await/toast order kills five tests at once.
- Three test helpers in this lot carry a comment explaining why the mount order
  or the hass graft is load-bearing (`sci-fi-weather.test.ts` connectedCallback
  ordering, `sci-fi-vehicles.test.ts` `hass.config`, `sci-fi-plugs.test.ts`
  `callApi`). Those comments are what makes the probes auditable; keep the
  habit.
- `_withTimeout` attaches its rejection handler before returning, so the
  original promise cannot become an unhandled rejection after the budget
  expires. That is the detail most hand-rolled timeout wrappers get wrong.

VERDICT: BLOCK
