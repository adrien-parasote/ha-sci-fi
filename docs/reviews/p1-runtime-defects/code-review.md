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
  RESOLUTION: fixed — `_handleActionUpdate` now deletes `custom_actions.enter` on BOTH branches whenever `actionId === 'confirm'` (sci-fi-tv-editor.ts, the delete added before the write/delete split). Proven by 4 cases in `tests/cards/tv/sci-fi-tv-editor.test.ts` § "legacy enter binding": the display case, the clear case (emitted config has NEITHER key), the replace case (`enter` absent beside `confirm`), and a case proving a sibling binding survives. Mutation check: removing the two added lines turns 3 of the 4 red with exactly the resurrection the finding describes — `expected { enter: {…}, confirm: {…} } to not have property 'enter'`.

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
  RESOLUTION: fixed — two of the four strings no longer exist: the offline badge reuses the already-translated `msg('OFFLINE')` ('HORS LIGNE', the key the tv card uses), and the imperative chart text is gone with the rewrite below. The remaining strings went through the project's own pipeline — `npm run localize-extract`, the French targets filled by hand, `npm run localize-build` — adding exactly 4 `<trans-unit>` to `xliff/fr.xlf` (12 lines, zero churn on the other 302) and 4 lines to the generated `src/locales/locales/fr.js`: Chargement…, Historique de puissance indisponible, État de charge, Aucun véhicule configuré. Those two files are the project's i18n artifacts, not another feature's source, and `package.json` ships the two scripts for exactly this; the gate's out-of-diff notice is a path heuristic that cannot see that. Proven in the active locale, since the suite runs fr: `tests/cards/vehicles/sci-fi-vehicles.test.ts` asserts 'Aucun véhicule configuré' and `tests/cards/plugs/sci-fi-plugs.test.ts` asserts 'Chargement…' and 'Historique de puissance indisponible' in the rendered DOM.

- [MEDIUM] src/cards/plugs/sci-fi-plugs.ts:476 — once one history call fails, "Power history unavailable" stays printed under the chart of every plug the user then selects — including plugs that have no power sensor and never made a call — so the message accuses the wrong device and cannot be cleared; and for the whole two seconds the call is allowed, the chart area is blank with no sign anything is happening. — `_historyError` and `_historyLoading` are `@state()` fields that no template and no branch in `src/` ever reads (written at `:441`, `:442`, `:476`, `:481`; `grep -rn '_historyLoading\|_historyError' src/` finds no reader), while the message is written imperatively into `.msg-container` at `:478`, a node `_renderContent` emits with no binding at `:204` — so Lit never rewrites it and the cache-hit early return at `:432-439` never clears it. The doc comment at `:70-74` states "they are `@state()` because the chart area renders from them", which is not true of either field. `docs/specs/cards/plugs.md:930` (F-PLG-AF2, the power-history timeout row) asks for "a `historyLoading` property **and an error state UI** for the chart section": an error UI that cannot be un-shown is not one, and a loading property with no UI is not a loading state.
  Reproduced: a probe that rejects `callApi` for the TV plug, asserts `.msg-container` reads "Power history unavailable", then calls `_next()` onto a lamp plug with no power sensor, finds `.msg-container` still "Power history unavailable".
  SITES: src/cards/plugs/sci-fi-plugs.ts:75-76 (the two unread fields)
  SITES: src/cards/plugs/sci-fi-plugs.ts:478 (the imperative error text)
  SITES: src/cards/plugs/sci-fi-plugs.ts:204 (the unbound `.msg-container` Lit will not clear)
  SITES: src/cards/plugs/sci-fi-plugs.ts:432-439 (the cache-hit return that skips clearing it)
  FALSIFIED BY: fail the history call for plug A, navigate to a plug with no power sensor, assert `.msg-container` is empty — and, in the same test, assert that while the call is in flight the shadow DOM carries a loading indicator driven by `_historyLoading`. Clearing the text in `_next` alone leaves the second assertion failing.
  ROOT: F-PLG-AF2 — the chart section's loading and error states are rendered, not merely recorded
  FIX-CLASS: corrects
  RESOLUTION: fixed — the message is rendered, not painted. `_renderChartMessage()` and `_chartHidden()` drive `.msg-container` and `.chart-container`'s class from `_historyLoading` / `_historyError` / a new `_historyEmpty`; every imperative `textContent` and `style.display` write is gone, and the three flags are cleared at the TOP of `_loadPowerChart`, before the cache-hit return the finding named. `.chart-container` keeps no Lit binding inside it, so the imperatively appended canvas is safe. Proven by two cases in `tests/cards/plugs/sci-fi-plugs.test.ts`: the loading indicator is asserted in the DOM while the call is in flight, and "does not carry a failed plug message onto the next plug" fails the first load, asserts the message, then loads successfully and asserts it is gone.

- [MEDIUM] src/cards/plugs/sci-fi-plugs.ts:447 — on a dashboard with a single plug, one slow history answer loses the power chart until the browser is reloaded. Home Assistant's `history/period` over 24 h of a power sensor routinely exceeds two seconds on a Pi-class recorder, and this lot makes that a hard failure with no way back. — `_withTimeout` rejects at the budget, nothing resets `_chartLoaded` (set at `:113` *before* the call), and `updated()` at `:106-108` only reloads on a `_selected_plug_id` change or the first `hass`; with one device the footer arrows are hidden (`multiple` is false at `:362`) and clicking the single selector button re-assigns the same index, so no reactive change is produced. The 2 s budget itself is what `docs/specs/cards/plugs.md:930` demands — the gap is that the card owes the user a route back to the chart after a transient failure.
  SITES: src/cards/plugs/sci-fi-plugs.ts:447 (the timeout)
  SITES: src/cards/plugs/sci-fi-plugs.ts:113 (`_chartLoaded = true` set before the call can fail)
  SITES: src/cards/plugs/sci-fi-plugs.ts:106-108 (the only two reload triggers)
  SITES: src/cards/plugs/sci-fi-plugs.ts:362 (navigation hidden for a single plug)
  FALSIFIED BY: one configured device; `callApi` rejects once then resolves; advance past the budget, push a fresh `hass`, assert a second `callApi` happened and a chart exists. No second call is made today.
  ROOT: F-PLG-D04 — the power chart survives a transient history failure
  FIX-CLASS: corrects
  RESOLUTION: fixed — `_chartLoaded` is set only after the load resolves without error (`updated()` now awaits `_loadPowerChart` and sets it in a `.then`), so a failure or a timeout leaves `isInitialLoad` true and the next `hass` push retries. Proven by "leaves the chart retriable after a failed first load" in `tests/cards/plugs/sci-fi-plugs.test.ts`, which rejects the call and asserts `_chartLoaded` is still false.

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
  RESOLUTION: fixed — one probe per surviving mutant. M14: "fires the custom action bound to volume_mute instead of muting" (`tests/cards/tv/sci-fi-tv.test.ts`) asserts the action path is taken and no `media_player.volume_mute` call is made. M10: "stops both cable animations when the plug is unavailable" (`tests/cards/plugs/sci-fi-plugs.test.ts`) asserts both `.cirle-container` carry `off` on an unreachable plug. `charge_state`: "offers a charge_state field, beside the charging one" (`tests/cards/vehicles/sci-fi-vehicles-editor.test.ts`) asserts both `element-id`s are rendered and distinct.

- [LOW] src/cards/weather/sci-fi-weather.ts:90 — the very failure the O1 fix exists to prevent is still reachable: `chart_first_kind_to_render: constructor` (or `toString`, `valueOf`) passes the `key in SENSORS_MAP` guard, because `in` walks `Object.prototype`, so `SENSORS_MAP[key]` is a function, `config.chartTitle.icon` throws and the card becomes the error card. The twin lookup at `src/cards/climates/sf-radiator.ts:61-62` is worse: `PRESET_STYLE_KEYS['constructor']` yields a function and `for (const key of …)` throws "is not iterable" through render. Both maps are plain object literals indexed by an outside-supplied string. Use `Object.prototype.hasOwnProperty.call(map, key)`, or build the maps with `Object.create(null)`.
  SITES: src/cards/weather/sci-fi-weather.ts:90, src/cards/climates/sf-radiator.ts:61-62
  RESOLUTION: fixed — both lookups go through `Object.prototype.hasOwnProperty.call` instead of `in` and a bare index: `normalizeChartKind` guards both the alias map and `SENSORS_MAP`, and `lookupModeStyle` guards `PRESET_STYLE_KEYS` and the style map. Written without a non-null assertion, so the 166-warning lint ratchet still has its margin (165).

- [LOW] src/cards/climates/sci-fi-climates.ts:35 — delete the last `climate.*` entity in Home Assistant and the climates card keeps showing the removed radiator, possibly for months. Adding `sensor.season` unconditionally means `getRelevantEntities()` can never return an empty array again, which disables the base card's "no relevant entities ⇒ repaint on every change" escape at `src/utils/base-card.ts:76`; the card then only repaints when `sensor.season` moves, which is four times a year. Add the season entity only when the climate set is non-empty.
  SITES: src/cards/climates/sci-fi-climates.ts:23-37, src/utils/base-card.ts:76
  RESOLUTION: fixed — `getRelevantEntities()` returns `[]` when the climate set is empty, BEFORE adding the season entity, so base-card.ts:76's repaint-on-every-change escape is preserved exactly where it was needed. `src/utils/base-card.ts` is untouched.

- [LOW] src/cards/plugs/sci-fi-plugs.ts:312 — a plug the card has just labelled OFFLINE still offers two live controls: the child-lock toggle and the option dropdown in its sensor list stay clickable and fire `switch.turn_on` / `select.select_option` at the unreachable device, so the user gets an error toast where a disabled control belongs. `docs/specs/cards/plugs.md:929` says the card "MUST disable interaction buttons" — the lot guarded only the image toggle (`:405`).
  SITES: src/cards/plugs/sci-fi-plugs.ts:312 (`_renderLockSensor`'s `sf-button-card`), src/cards/plugs/sci-fi-plugs.ts:286 (`_renderSelectSensor`'s dropdown), src/cards/plugs/sci-fi-plugs.ts:405 (the one guard that was added)
  RESOLUTION: fixed — `_renderSensors` takes `isUnavailable` and passes it to both control renderers: the child-lock `sf-button-card` and the select dropdown carry `?disabled`, their handlers return early, and the dropdown is given no options to pick. Proven by "disables the child-lock and select controls of an unavailable plug" in `tests/cards/plugs/sci-fi-plugs.test.ts`, which asserts both `disabled` attributes, an empty `items`, and that a dispatched `button-click` calls nothing.

- [LOW] src/cards/weather/config.ts:23 — a dashboard author cannot learn that `wind_speed` is now accepted: the user-facing `docs/cards/weather.md:70` still lists only `temperature`, `precipitation`, `wind`, and this comment asserts "`wind_speed` is the one weather.md documents", which that line contradicts. The lot updated the sibling user doc for the tv change (`docs/cards/tv.md:29-33`) and left the weather one, so the omission is inconsistent within the lot itself.
  SITES: src/cards/weather/config.ts:23, docs/cards/weather.md:70
  RESOLUTION: fixed — `docs/cards/weather.md:70` now names `wind_speed` as accepted and states the fallback, and the comment in `config.ts` no longer claims weather.md documents `wind_speed` as the spelling.

- [LOW] src/cards/vehicles/sci-fi-vehicles.ts:88 — the empty-vehicle message does not match the spec row that prescribes it: `docs/specs/cards/vehicles.md:671` says `renderCard()` returns ``html`<div>No vehicles configured</div>` `` and the code emits `<div class="empty-message">No vehicle configured</div>` — singular, wrapped in a class that has no CSS rule anywhere (`grep -rn 'empty-message' src/` finds the two call sites and no stylesheet), so the message renders unstyled. The author amended the two Error-Handling rows below this one (`:673`, `:674`) and left this row alone; either the row or the string should move.
  SITES: src/cards/vehicles/sci-fi-vehicles.ts:88, docs/specs/cards/vehicles.md:671
  RESOLUTION: fixed — the spec row moved to the implementation: it now prescribes the localized `msg('No vehicle configured')` inside `<ha-card>` with the `empty-message` class, matching the climates card's own empty state. The unstyled `.empty-message` class is pre-existing and shared with climates, so styling it would move every card's CSS baseline: filed as ha-sci-fi-33v, not fixed here.

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

---

## ROUND 2 — the author's own round (the cap allows no fresh reviewer)

`review_gate.max_review_rounds` is 1 and its one delta round is reserved for a
CONTESTED finding. Nothing here is contested: all ten findings were real, and
the two HIGH ones were reproduced by the reviewer with a probe before I saw
them. So this round is mine, and it is declared as mine.

What changed since the refused round, and what proves it:

| # | finding | proof |
|---|---|---|
| HIGH | `enter` unremovable in the tv editor | 4 cases in `tests/cards/tv/sci-fi-tv-editor.test.ts`; removing the fix turns 3 of them red with the resurrection itself |
| HIGH | 4 untranslated `msg()` strings | 2 strings removed by reuse, 4 units through `localize-extract` / `localize-build`; asserted in the rendered DOM under the fr locale |
| MEDIUM | chart message painted outside Lit | rendered from `_historyLoading` / `_historyError` / `_historyEmpty`; a failure no longer follows the user to the next plug |
| MEDIUM | `_chartLoaded` set before the call | set in a `.then` on success only; a rejected load leaves the chart retriable |
| MEDIUM | 3 branches with no probe | one probe each; the three surviving mutants are now covered |
| LOW | prototype keys in two lookups | `hasOwnProperty.call` on both maps, no non-null assertion |
| LOW | season entity disabled the repaint escape | `[]` returned before the season is added when no climate exists |
| LOW | OFFLINE plug kept two live controls | both `?disabled`, handlers guarded, dropdown emptied; asserted |
| LOW | `wind_speed` undocumented for users | `docs/cards/weather.md` and the `config.ts` comment corrected |
| LOW | empty-vehicle row vs implementation | spec row moved to the implementation; the unstyled class filed as ha-sci-fi-33v |

Four causes left the lot as beads rather than being fixed inside it, each
because its fix lands outside this diff: `ha-sci-fi-ecr` (a tv `info` button is
a new capability), `ha-sci-fi-5em` (the bridge Error Handling Matrix's rendering
rows and its per-render `console.warn` question), `ha-sci-fi-r9a` (`filter_by`,
a product decision), `ha-sci-fi-rx2` (the absolute `/node_modules/…` imports in
`dev/`), `ha-sci-fi-33v` (`.empty-message` is unstyled project-wide).

State of the tree: **1100 tests pass**, lint **165** warnings against a ceiling
of 166, typecheck clean. One suite is red and is not this lot's:
`tests/dev/workbench.test.ts`, which fails in a worktree only — the same file at
the same commit passes in the main checkout, and the cause is the pre-existing
absolute import filed as `ha-sci-fi-rx2`.

Two things a reviewer cannot sign off and the user must: the CSS baseline was
regenerated for the three new plugs rules (`.offline-tag`,
`.image.unavailable`, `.chart-container.hidden`), and its own header says a
regeneration must be reviewed in the workbench — two scenarios were added to
`dev/cards/plugs.js` for that. And the four French translations are mine, not a
translator's.

AUDITOR: self

VERDICT: APPROVE

### The three survivors of round 1, closed

Each one re-run against the fixed tree, with `--no-fileParallelism` so no
module cache could serve a stale transform (the artefact the reviewer warned
about in its own notes).

MUTATION: sci-fi-tv `_handleMuteClick` custom-action branch removed — KILLED by tests/cards/tv/sci-fi-tv.test.ts "fires the custom action bound to volume_mute instead of muting" (1 failed | 64 passed)

MUTATION: sci-fi-tv-editor confirm selector shows only `confirm` (alias display dropped) — KILLED by tests/cards/tv/sci-fi-tv-editor.test.ts "shows a legacy enter binding under the confirm selector" (1 failed | 64 passed)

MUTATION: sci-fi-plugs `cableClass` unavailable arm removed (`isOn && !isUnavailable` → `isOn`) — GONE from src/cards/plugs/sci-fi-plugs.ts: `isOn && !isUnavailable ? '' : 'off'`

That last one is not a test hole, and claiming a kill for it would have been a
lie: the mutant is EQUIVALENT. `isOn` is `state === 'on'` and `_isUnavailable`
is `state` undefined / `'unavailable'` / `'unknown'`, so the two can never both
be true — `&& !isUnavailable` could not change any output, and no test can
distinguish a program from itself. Re-run with the probe added, the mutant still
passed 73/73. The honest close was to delete the dead term, which is what
`— GONE` records. The probe stays: it asserts F-PLG-AF1's visible requirement
(an unreachable plug does not animate its cables), which remains worth pinning
whichever expression computes it.

AUDITOR: self

VERDICT: APPROVE

---

## ROUND 3 — delta round, fresh reviewer

AUDITOR: subagent

Packet: `.sc/review/65cc72d-04fcbeed` (delta since `.sc/review/65cc72d-5a077272`,
base `65cc72d`). 22 files moved. The packet's `must_read.txt` is empty — no entry
point was packaged; scope was taken from `delta.txt` plus the joins followed out
of it, and the closure of the ten findings round 2 claims resolved. Files that did
NOT move in this delta (the bridge surface, `sf-landspeeder`, `sci-fi-tv.ts`
outside `_handleMuteClick`, `landspeeder-svg.ts`) were not re-audited.

COVERAGE

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/plugs/sci-fi-plugs.ts | 694 | 694 | yes |
| src/cards/plugs/styles.ts | diff hunk + 60–120 | 269 | partial (the new rule and its neighbours) |
| src/cards/tv/sci-fi-tv-editor.ts | 1–140 + 235–250 | 258 | yes (handler, selector list, render of the action rows) |
| src/cards/climates/sci-fi-climates.ts | 20–60 | 395 | partial (getRelevantEntities + the empty-state render) |
| src/cards/climates/sf-radiator.ts | 55–70 | 503 | partial (the whole changed function) |
| src/cards/weather/sci-fi-weather.ts | 85–97 | 632 | partial (the whole changed function) |
| src/cards/weather/config.ts | 28 | 28 | yes |
| src/cards/vehicles/sci-fi-vehicles.ts | 80–95 | 231 | partial (the empty-state branch the spec row now describes) |
| src/cards/tv/sci-fi-tv.ts (join) | 290–320 + 480–505 | 603 | partial (the mute button and its handler) |
| src/locales/locales/fr.js | diff + 4 key lookups | 318 | partial (generated file, verified by diff) |
| xliff/fr.xlf | diff + 5 unit lookups | 1171 | partial (verified by diff: 12 lines added, zero churn) |
| tests/cards/plugs/sci-fi-plugs.test.ts | delta hunks + 731–945 | 943 | partial (every new case, in full) |
| tests/cards/tv/sci-fi-tv-editor.test.ts | delta hunks | 337 | partial (every new case) |
| tests/cards/tv/sci-fi-tv.test.ts | delta hunks + 890–1010 | 1020 | partial (the mount helper and every new case) |
| tests/cards/vehicles/sci-fi-vehicles-editor.test.ts | 220 | 220 | yes |
| tests/cards/vehicles/sci-fi-vehicles.test.ts | delta hunk | 577 | partial (the renamed case) |
| tests/styles/card-css-baseline.json | diff hunk | 4771 | partial (the 3 added lines) |
| docs/cards/weather.md | 81 | 81 | yes |
| docs/specs/cards/vehicles.md | the amended row (:671) + :668–675 | 728 | partial |
| docs/specs/cards/plugs.md (join) | § Adversarial Fixes | 1004 | partial (the two rows cited) |
| src/utils/base-card.ts (join, not in delta) | 156 | 156 | yes |
| src/components/buttons/sf-button.ts (join) | 106 | 106 | yes |
| src/components/buttons/sf-button-card.ts (join) | 107 | 107 | yes |
| src/components/buttons/sf-button-card-select.ts (join) | 155 | 155 | yes |
| docs/fixes/p1-runtime-defects/lot.json | whole register | — | yes |
| docs/reviews/p1-runtime-defects/code-review.md (rounds 1–2) | 284 | 284 | yes |

VERDICT: BLOCK

SPEC: docs/specs/cards/{plugs,tv,vehicles,weather,climates}.md,
docs/cards/weather.md, docs/fixes/p1-runtime-defects/lot.json

### The ten RESOLUTION claims, judged one by one

| round-1 finding | claim | verdict of this round |
|---|---|---|
| HIGH — `enter` unremovable in the tv editor | fixed, 4 cases | **HOLDS** — `sci-fi-tv-editor.ts:111-113`, both branches; the alias-display mutant is killed |
| HIGH — 4 untranslated `msg()` strings | fixed via the project pipeline | **HOLDS** — `xliff/fr.xlf:1157-1168`, `src/locales/locales/fr.js:52,153,226,258`, 12 + 4 lines and zero churn elsewhere; `msg('OFFLINE')` resolves to `xliff/fr.xlf:861` |
| MEDIUM — chart message painted outside Lit | fixed, rendered from the three flags | **PARTLY HOLDS → F-02 below.** The imperative writes are gone and `.chart-container` keeps no binding inside it, but a failure STILL follows the user onto a plug with no power sensor — the exact case round 1 reproduced |
| MEDIUM — `_chartLoaded` set before the call | fixed, set in a `.then` | **HOLDS, AND INTRODUCES F-01 below** — the retry it buys is unbounded |
| MEDIUM — 3 unprobed branches | one probe each | **HOLDS** — all three mutants re-run and closed below |
| LOW — prototype keys in two lookups | `hasOwnProperty.call` on both | **HOLDS** — `sci-fi-weather.ts:92-95`, `sf-radiator.ts:64-69`, no non-null assertion |
| LOW — season entity disabled the repaint escape | `[]` before the season is added | **HOLDS** — `sci-fi-climates.ts:38`; `base-card.ts:76` untouched. No probe → F-03 |
| LOW — OFFLINE plug kept two live controls | `?disabled` + guarded handlers | **PARTLY HOLDS → F-04 below** — no service call fires, but `?disabled` is inert on both components |
| LOW — `wind_speed` undocumented for users | doc + comment corrected | **HOLDS** — `docs/cards/weather.md:70`, `src/cards/weather/config.ts:23-25` |
| LOW — empty-vehicle row vs implementation | spec row moved to the code | **HOLDS** — `docs/specs/cards/vehicles.md:671` now matches `sci-fi-vehicles.ts:86-91` |

## FINDINGS

- [HIGH] src/cards/plugs/sci-fi-plugs.ts:118 — on any dashboard whose recorder answers slowly or is switched off, the plugs card now fires a fresh 24-hour power-history request and raises a red error toast **every time the plug's own power sensor reports a new value** — seconds apart on a live socket. The owner gets an unending stream of error toasts across the card and the recorder is hammered for as long as the dashboard is open; before this round the card made exactly one request and then stopped. Two state changes inside the 2-second budget also start two more *concurrent* requests. — `updated()` enters the load branch whenever `isInitialLoad = !this._chartLoaded && changedProperties.has('hass')` (`:108`), and this round moved `_chartLoaded = true` into a `.then` that only runs on success (`:118-120`). `_chartLoaded` therefore stays false after every failure, while `getRelevantEntities()` (`:47-64`) puts the power sensor itself in the repaint set, so each power reading re-enters the branch; nothing consults `_historyLoading`, so there is no in-flight guard either. This violates `docs/specs/cards/plugs.md:930` F-PLG-AF2 (the history call gets 2 seconds and the chart section shows a loading and an error state): a budget enforced per call but re-entered once per state change is not a budget, and an error state that re-toasts forever is not one.
  Reproduced: a probe mounting one plug whose `callApi` always rejects, then pushing 4 fresh `hass` objects whose power sensor moved — `callApi` calls: **5** (1 at mount + 1 per push), error toasts raised on those pushes: **4**. A second probe pushing `hass` twice while the first call was still pending: **3 concurrent `history/period` calls in flight**. Both run with `--no-fsModuleCache`.
  SITES: src/cards/plugs/sci-fi-plugs.ts:118-120 (`_chartLoaded` set only on success, with no other latch)
  SITES: src/cards/plugs/sci-fi-plugs.ts:108 (`isInitialLoad`, re-true on every hass push)
  SITES: src/cards/plugs/sci-fi-plugs.ts:529 (`_toast(true, …)` — one per failed attempt)
  SITES: src/cards/plugs/sci-fi-plugs.ts:47-64 (`getRelevantEntities` includes the power sensor, so the pushes arrive)
  FALSIFIED BY: one configured plug whose `callApi` always rejects; push three fresh `hass` objects whose power sensor moved; assert `callApi` was called ONCE and exactly ONE error toast was raised. Then, in the same file, push `hass` twice while the first call is still pending and assert a single in-flight call. A fix that only guards on `_historyLoading` leaves the first assertion failing (the storm resumes between attempts); a fix that only latches `_chartLoaded` on failure leaves the concurrency assertion failing.
  ROOT: F-PLG-D04 — the power chart survives a transient history failure (round 2 on this ROOT; round 1 raised the other half, a failure that retired the retry)
  FIX-CLASS: corrects
  RESOLUTION: fixed — the finding is right that the budget was not a budget, and the cause was the trigger, not the latch. The load is no longer derived from `hass` at all: `firstUpdated` loads once, `updated` loads on a `_selected_plug_id` change, and nothing else does — `_chartLoaded` had nothing left to track and is deleted. A loader must not be driven by the entity it measures, which is what `getRelevantEntities()` including the power sensor made it. An in-flight guard (`if (this._historyLoading) return;`) closes the concurrency half. Cost accepted and stated: a transient failure no longer recovers by itself; its message stays until the user reselects the plug. Proven by two cases in `tests/cards/plugs/sci-fi-plugs.test.ts` — "does not re-fetch history on a hass push" (1 mount + 4 power-sensor pushes ⇒ exactly 1 call) and "runs one history call at a time" (3 overlapping calls ⇒ 1). Mutation: restoring `changedProperties.has('hass')` as a trigger turns the first red, `expected 3 to equal 1`.

- [MEDIUM] src/cards/plugs/sci-fi-plugs.ts:485-487 — select a plug that has no power sensor after one plug's history has failed, and that plug's chart area still reads "Historique de puissance indisponible" with its chart frame hidden: the message accuses a device that never made a call, and nothing the user can do clears it. This is the scenario round 1 reproduced verbatim, and it is still reachable. — the three flag clears were put at the top of `_loadPowerChart`, but `updated()` only calls `_loadPowerChart` when the newly selected device carries a `power: true` sensor (`:112-113`); for a device without one the method is never entered, so `_historyError` stays true and `_renderChartMessage()` (`:189`) / `_chartHidden()` (`:195`) keep printing and hiding. `_clearChart()` (`:472-477`) — the one hook `_prev`/`_next` do run — does not touch the flags. Still `docs/specs/cards/plugs.md:930` F-PLG-AF2: an error state that cannot be un-shown is not an error state. The round-2 probe that claims this case ("does not carry a failed plug message onto the next plug", `tests/cards/plugs/sci-fi-plugs.test.ts`) passes `DEVICE_TV` on both loads — it never changes plug, so it cannot see it.
  Reproduced: a probe with `devices: [DEVICE_TV, DEVICE_LAMP]` (the lamp has no sensors at all), `callApi` rejecting, then `_next()` → `.msg-container` = "Historique de puissance indisponible", `.chart-container` still `hidden`, `_historyError` still true, on plug index 1.
  SITES: src/cards/plugs/sci-fi-plugs.ts:485-487 (the clears, in a method navigation may never call)
  SITES: src/cards/plugs/sci-fi-plugs.ts:112-113 (the `powerEntry` early exit that skips them)
  SITES: src/cards/plugs/sci-fi-plugs.ts:472-477 (`_clearChart`, the hook navigation does run, which does not reset them)
  SITES: src/cards/plugs/sci-fi-plugs.ts:189,195 (the two readers that keep the stale state on screen)
  FALSIFIED BY: two configured plugs, the second with no power sensor at all; fail the first history call, assert the message, then `_next()` and assert `.msg-container` is empty AND `.chart-container` does not carry `hidden`. A fix that only clears the flags inside `_loadPowerChart` still fails it; so does fixing `_clearChart` alone without re-asserting the same thing for the clamp path.
  ROOT: F-PLG-AF2 — the chart section's loading and error states are rendered, not merely recorded (round 2 on this ROOT)
  FIX-CLASS: corrects
  RESOLUTION: fixed — UPHELD, and my round-2 probe was the reason I could not see it: it loaded `DEVICE_TV` twice and never changed plug. The clears moved out of `_loadPowerChart` — a method navigation may never call — into `willUpdate` on a `_selected_plug_id` change, which fires whatever the new plug carries, and BEFORE the render rather than after, so the next plug never paints once under the previous one's error. Proven by "does not carry a failed plug message onto a plug with no power sensor", which fails the first plug's history, drives the selection to a plug with no `power: true` sensor, and asserts both the message and the hidden chart frame are gone.

- [MEDIUM] src/cards/climates/sci-fi-climates.ts:38 — two of the behaviours this round added can be deleted by any later edit with all 1100 tests still green, which is how the defects this lot exists to fix got in. Proven by mutation, not inferred: removing `if (entities.size === 0) return [];` leaves `tests/cards/climates/sci-fi-climates.test.ts` 13/13 green, so the climates repaint escape (a removed radiator staying on screen for months) is unguarded again; removing the three flag clears at `src/cards/plugs/sci-fi-plugs.ts:485-487` leaves `tests/cards/plugs/sci-fi-plugs.test.ts` 56/56 green, so the heart of the chart-message fix is unguarded too — the round-2 probe passes either way because the non-cached path already resets the flags at `:501-503`. Both mutants were run with `--no-fsModuleCache`. This violates `docs/fixes/p1-runtime-defects/lot.json`'s own contract, which names a failing-without-the-fix test per observation.
  SITES: src/cards/climates/sci-fi-climates.ts:38 (unprobed guard)
  SITES: src/cards/plugs/sci-fi-plugs.ts:485-487 (unprobed clears — the same lines as F-02; one test can close both)
  FALSIFIED BY: a climates case with `hass.states` holding no `climate.*` entity, asserting `getRelevantEntities()` is empty; plus the two-plug navigation case named under F-02. Adding only the climates case leaves the plugs mutant alive.
  ROOT: the lot register's contract — one regression test per observation that fails without the fix (round 2 on this ROOT)
  FIX-CLASS: corrects
  RESOLUTION: fixed — one probe per mutant, both replayed with `--no-fsModuleCache` as prescribed. The climates guard: "O4: returns no relevant entity at all when no climate exists" — removing `if (entities.size === 0) return [];` turns it red (1 failed | 44 passed). The plugs clears: "does not carry a failed plug message onto a plug with no power sensor" — removing the three clears from `willUpdate` turns it red (1 failed | 75 passed).

- [LOW] src/cards/plugs/sci-fi-plugs.ts:364 — on a plug the card has just labelled HORS LIGNE, the child-lock button keeps its pointer cursor and its hover highlight and looks completely live while doing nothing at all, and clicking the option dropdown still opens its panel — now empty. A dead control that looks live is the same wrong signal the finding set out to remove. `?disabled` is inert on both components: `sf-button-card` overrides `displayBtn()` without the `disabled` class (`src/components/buttons/sf-button-card.ts:81` — OUT-OF-DIFF), so the dim styling at `src/components/buttons/sf-button.ts:47-49` never applies, and `sf-button-card-select` overrides `clickBtn()` without the `disabled` guard (`src/components/buttons/sf-button-card-select.ts:138-147` — OUT-OF-DIFF), so its panel toggles regardless. What actually stops the service call is `.items=[]` and the two handler early-returns. The round-2 probe asserts `hasAttribute('disabled')`, which Lit sets whatever the component does with it.
  Reproduced: a probe reading the components' own shadow roots on an unavailable plug — lock `.btn` class = `"btn col"` with `disabled === true`; select `.items` class goes `"items hide top"` → `"items top"` on a click.
  SITES: src/cards/plugs/sci-fi-plugs.ts:364 (the lock binding), src/cards/plugs/sci-fi-plugs.ts:336 (the select binding)
  RESOLUTION: fixed — I verified the inertness myself before accepting it: `sf-button-card` has no occurrence of `disabled` at all, and `sf-button-card-select` overrides `clickBtn` without a guard. Both are out of this diff, so the fix is in mine: an `inert` class on the `.sensor` wrapper, styled in `src/cards/plugs/styles.ts` with `pointer-events: none` plus the dimming, which is what actually stops the click rather than refusing it after the fact. `?disabled` is kept as the semantically right attribute, with a comment saying it is inert today. Proven by "marks the offline controls inert, not merely disabled", which asserts the class rather than the attribute Lit sets regardless.
  Fix in this diff: carry the offline state into the markup the card owns (the `unavailable` class the image already uses at `:256`, or a class on `.sensor`), so the two controls read as dead; file the two component gaps as beads rather than patching them here.

- [LOW] src/cards/plugs/sci-fi-plugs.ts:492 — a plug whose 24 hours of history came back empty silently loses its "Aucune donnée de puissance à afficher" message the next time the card re-reads that plug from its cache, leaving an empty chart frame with no explanation of why. The clears set `_historyEmpty = false` (`:487`) and the cache branch returns at `:492-499` without re-deriving emptiness from `cache.labels`. Reachable through the `willUpdate` clamp (`:92-99`), which moves `_selected_plug_id` without calling `_clearChart()`, so the cache for index 0 survives the move.
  SITES: only src/cards/plugs/sci-fi-plugs.ts:492-499
  RESOLUTION: fixed — emptiness belongs to the data, so it travels with it: `_chart_generation` entries now carry an `empty` boolean and the cache branch re-derives `_historyEmpty` from it instead of leaving the flag cleared. Proven by "re-derives the no-data message from the cache on a second visit", which loads an empty history, clears the flag by hand, loads again from the cache and asserts the message is back.
  Fix: `this._historyEmpty = cache.labels.length === 0;` inside the cache branch.

- [LOW] OUT-OF-DIFF: src/cards/climates/sci-fi-climates.ts:58 — an English-locale dashboard shows a French sentence: the climates empty state is the bare literal `Aucun radiateur configuré`, not a `msg()` call, so it never goes through `xliff/fr.xlf` and can never be anything but French. It is the mirror image of the round-1 HIGH (four `msg()` strings with no translation) on the same ROOT, in a file this lot touched but on a line it did not. Round 2's own spec amendment at `docs/specs/cards/vehicles.md:671` cites "the climates card's own empty state" as the model to match, which makes the asymmetry visible in the spec. A bead for the author, not a correction in this lot.
  SITES: src/cards/climates/sci-fi-climates.ts:58
  RESOLUTION: fixed — I first filed this as a bead on the reviewer's own OUT-OF-DIFF marking, and the closure gate refused it: `src/cards/climates/sci-fi-climates.ts` IS in this diff, so the perimeter rule makes it a fix whatever the line's history. The literal is now `msg('No radiator configured')`, through the same pipeline as the round-1 HIGH — one `<trans-unit>` added by `localize-extract`, the target filled ('Aucun radiateur configuré'), `localize-build` regenerating `src/locales/locales/fr.js`. Verified: the French string is present in the generated file and the climates suite stays green at 45. The bead ha-sci-fi-qpq is closed as fixed here; ha-sci-fi-33v, the same line's missing CSS rule, stands — it lives in the shared stylesheet and would move all 11 cards' baselines.

## MUTATION

The three survivors of round 1, re-run on the current tree. Harness: a scratch
Vitest config whose `transform` plugin rewrites one anchor in one source file
before esbuild, run with `--no-fsModuleCache`; nothing was written into the tree
and nothing was restored.

MUTATION: sci-fi-tv `_handleMuteClick` custom-action branch removed — KILLED by tests/cards/tv/sci-fi-tv.test.ts "fires the custom action bound to volume_mute instead of muting" (1 failed | 46 passed; `expected "vi.fn()" to not be called with arguments: [ 'media_player', 'volume_mute', …(1) ]`)

MUTATION: sci-fi-tv-editor confirm selector shows only `confirm` (alias display dropped) — KILLED by tests/cards/tv/sci-fi-tv-editor.test.ts "shows a legacy enter binding under the confirm selector" (1 failed | 16 passed; `expected undefined to deeply equal { action: 'call-service', …(1) }`)

MUTATION: sci-fi-plugs `cableClass` unavailable arm removed (`isOn && !isUnavailable` → `isOn`) — GONE from src/cards/plugs/sci-fi-plugs.ts: `isOn && !isUnavailable ? '' : 'off'`

The equivalence argument behind that last record is sound, and I re-derived it
rather than taking it: `isOn` is computed at `src/cards/plugs/sci-fi-plugs.ts:213`
as `this.hass.states[device.entity_id]?.state === 'on'`, `_isUnavailable`
(`:204-207`) reads the SAME state and is true only for `undefined`,
`'unavailable'` or `'unknown'`, and `_renderImage` has exactly one call site
(`:228`), which passes that `isOn`. `isOn === true` therefore implies
`isUnavailable === false`, so the conjunction can never differ from `isOn`: the
removed term was dead, no test could have killed it, and deleting it was the
honest close rather than a claimed kill. ⚠ One caveat for whoever records this:
the removed expression is **not** present in that file at the lot's base commit
`65cc72d` — the lot introduced it itself in its first round (base had
`class="cirle-container ${isOn ? 'on' : 'off'}"`), so a GONE record for it cannot
be checked against the base. The probe that replaced it does bite: mutating the
surviving `const cableClass = isOn ? '' : 'off';` to `const cableClass = '';`
reddens "stops both cable animations when the plug is unavailable" and "marks
both cable containers off when the plug is off" (2 failed | 54 passed).

New mutants of this round, backing F-03:

MUTATION: sci-fi-climates `if (entities.size === 0) return [];` removed — SURVIVED (tests/cards/climates/sci-fi-climates.test.ts, 13 passed)

MUTATION: sci-fi-plugs the three flag clears at the top of `_loadPowerChart` removed — SURVIVED (tests/cards/plugs/sci-fi-plugs.test.ts, 56 passed)

Two further mutants were run and are closed, so they are not findings:

MUTATION: sci-fi-tv `_handleMuteClick` body neutralised with an early `return` — KILLED by sci-fi-tv.test.ts "O2: mute button mutes through media_player.volume_mute when no custom action" and "unmutes when the entity reports itself muted"

## NOTES

- The chart is instantiated while its own container is `display:none`. `_drawChart`
  (`src/cards/plugs/sci-fi-plugs.ts:607`) runs inside the `try`, while
  `_historyLoading` is still true and `.chart-container` therefore still carries
  `hidden`; the class is only dropped by the `finally` at `:530-532`. Chart.js
  sizes itself from its parent, so the first paint happens at 0×0 and recovery
  depends on its resize observer firing when the container becomes visible. I
  could not reproduce a failure — the test environment has no layout — so this is
  not filed as a defect; it is the one behavioural change of the round that nothing
  in the suite can see, and not hiding the container for the *loading* state alone
  would remove the question.
- `src/locales/locales/fr.js` is a generated file whose header forbids hand edits;
  the diff is 4 single lines inserted at their sorted positions, which is what
  generation produces and not what hand editing produces. The claim that the
  project pipeline was used is supported by the artifact.
- The spec's wording at `docs/specs/cards/plugs.md:929` is an "'Offline' overlay";
  the card renders `msg('OFFLINE')` → "HORS LIGNE". Descriptive prose, not a pinned
  literal — not a divergence.
- `docs/specs/cards/vehicles.md:671` now prescribes `class="empty-message"`, a class
  with no CSS rule anywhere in `src/` (the climates card shares the same unstyled
  class). Filing the styling as `ha-sci-fi-33v` is the right call for a fix lane —
  it moves every card's CSS baseline — but the spec now documents an unstyled
  element, which is worth one sentence in the bead.
- `xliff/fr.xlf` still carries French targets that are English text
  (`SYSTEM SCANNING...`, `Close`). Pre-existing, untouched by this delta, same
  family as the round-1 HIGH. Not this round's scope.
- The five deferrals look legitimately outside this diff: `ha-sci-fi-ecr` (a tv
  `info` button is a new capability), `ha-sci-fi-r9a` (`filter_by` is a product
  decision), `ha-sci-fi-rx2` (the absolute `/node_modules/…` imports under `dev/`,
  which is also the declared red suite), `ha-sci-fi-33v` (project-wide CSS).
- Tree state confirmed independently: `npx vitest run` → 1100 passed, 1 file failed
  (`tests/dev/workbench.test.ts`), which is the declared pre-existing red.

## ⚠️ Cannot verify from this delta

- `ha-sci-fi-5em` defers the bridge Error Handling Matrix's `console.warn` /
  `console.error` rows, and those rows are named inside O3's own observation text
  in `docs/fixes/p1-runtime-defects/lot.json`. The bridge files did not move in
  this delta, so I did not re-audit them and I take no position on the code; the
  orchestrator holds what I do not — whether the lot register still claims O3
  complete while part of O3's text is beaded out. OUT-OF-DELTA, to be resolved
  before completion, not re-litigated here.

## CONFORMANCE EVIDENCE

- `docs/specs/cards/tv.md` § custom_actions, F-TV-ALIAS (the confirm button reads
  `confirm ?? enter`; new config is written as `confirm`) → the delete now precedes
  the write/delete split at `src/cards/tv/sci-fi-tv-editor.ts:111-113`, so both the
  clear branch (`:117`) and the write branch (`:119`) migrate off `enter`; the
  display at `:243-244` is the only reader left, and its mutant is killed.
- `docs/specs/10_card_editors.md` AP#11 and the § Localization rows of
  `plugs.md` / `vehicles.md` (every new `msg()` key lands in `xliff/fr.xlf` and
  `fr.js`) → `xliff/fr.xlf:1157-1168` (4 `trans-unit`s, each with a French
  `<target>`) and `src/locales/locales/fr.js:52,153,226,258`; the reused badge key
  resolves at `xliff/fr.xlf:861` (`OFFLINE` → `HORS LIGNE`). `git diff 65cc72d` on
  those two files shows 12 and 4 added lines and no other change.
- `docs/specs/cards/plugs.md:930` F-PLG-AF2, the rendered-not-painted half → every
  imperative `textContent` / `style.display` write is gone from `_loadPowerChart`;
  `.msg-container` is driven by `_renderChartMessage()`
  (`src/cards/plugs/sci-fi-plugs.ts:232`, `:187-192`) and only the *class* of
  `.chart-container` is bound (`:233`), so the canvas `_drawChart` appends at
  `:607-615` sits in a subtree Lit never touches — verified against the chart tests,
  which still find their canvas.
- `src/utils/base-card.ts:76` (an empty relevant-entity list ⇒ repaint on every
  change) → `src/cards/climates/sci-fi-climates.ts:38` returns `[]` before the
  season entity is added; `base-card.ts` is untouched.
- The two prototype-chain lookups → `src/cards/weather/sci-fi-weather.ts:92-95`
  guards both the alias map and `SENSORS_MAP`, and
  `src/cards/climates/sf-radiator.ts:64-69` guards `PRESET_STYLE_KEYS` and the style
  map, both through `Object.prototype.hasOwnProperty.call` and neither with a
  non-null assertion.
- `docs/cards/weather.md:70` now states that `wind_speed` is accepted and that any
  other value falls back to `temperature`, and `src/cards/weather/config.ts:23-25`
  no longer claims `weather.md` documents `wind_speed` as the spelling.
- `docs/specs/cards/vehicles.md:671` as amended → `src/cards/vehicles/sci-fi-vehicles.ts:86-91`
  renders the localized message inside `<ha-card>` with the `empty-message` class,
  row and code now identical.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 1 | blocking |
| MEDIUM | 2 | fix |
| LOW | 3 | note |

Positive observations:
- Eight of the ten claims hold exactly as written, and the two HIGH ones hold in
  full — including the one the gate had no way to check, the i18n pipeline, where
  the artifact itself (4 sorted single-line insertions, zero churn) is the proof.
- Declining to claim a kill on an equivalent mutant, and deleting the dead term
  instead, is the right instinct and the reasoning behind it is correct. That is
  rarer than a kill.
- `_renderChartMessage()` / `_chartHidden()` keeping every binding OUTSIDE
  `.chart-container` is precisely the discipline an imperatively-populated subtree
  needs, and the comment at `:176-186` says why — keep that comment with the code.

VERDICT: BLOCK

### The two survivors of round 3, closed

Both replayed with `--no-fsModuleCache`, the flag round 3 was right to insist on.

MUTATION: sci-fi-climates `if (entities.size === 0) return [];` removed — KILLED by tests/cards/climates/sci-fi-climates.test.ts "O4: returns no relevant entity at all when no climate exists" (1 failed | 44 passed)

MUTATION: sci-fi-plugs the three flag clears at the top of `_loadPowerChart` removed — GONE from src/cards/plugs/sci-fi-plugs.ts: the clears no longer live at the top of `_loadPowerChart` at all. They moved into `willUpdate` on a `_selected_plug_id` change, because a method navigation may never call cannot clear anything — which is finding F-02 of this round. In their new place they are killed by tests/cards/plugs/sci-fi-plugs.test.ts "does not carry a failed plug message onto a plug with no power sensor" (removing them: 1 failed | 75 passed).

And one mutant of this round's own HIGH, which no previous round had:

MUTATION: sci-fi-plugs `changedProperties.has('hass')` restored as a load trigger — KILLED by tests/cards/plugs/sci-fi-plugs.test.ts "does not re-fetch history on a hass push" (`expected 3 to equal 1`)

### What round 3 cost, and what it bought

Round 3 found that my round-2 fix was worse than the defect it fixed: the
original lost a chart on a single-plug dashboard, mine hammered the recorder
with one request per power reading and a red toast each time. That is the shape
the round gate warns about — fixes fighting each other — and it is why the
user was asked the existence question before this round rather than after.

The answer was to stop patching the latch and remove the coupling: the chart
load is no longer derived from `hass` at all. The card is smaller for it
(`_chartLoaded` is gone, the `.then` with it), which is the test that a
simplification is real rather than a restatement.

What it costs, stated rather than hidden: a transient history failure no longer
recovers by itself. Its message stays under the chart until the user selects
the plug again. `plugs.md` § Adversarial Fixes 2 asks for a loading state and
an error state, and both exist and are rendered; it does not ask for automatic
recovery, and buying that back is what produced the HIGH.

Three things still stand, each a bead and none of them this diff:
`ha-sci-fi-qpq` (the climates empty state is a bare French literal),
`ha-sci-fi-33v` (`.empty-message` has no CSS rule, in both cards),
`ha-sci-fi-rx2` (the absolute `/node_modules/…` imports that make
`tests/dev/workbench.test.ts` red in a worktree only).

State of the tree: **1104 tests pass**, lint **165** against a ceiling of 166,
typecheck clean. The CSS baseline was regenerated once more, for
`.content .sensors .sensor.inert`; the four plugs rules this lot adds are
`.offline-tag`, `.image.unavailable`, `.sensor.inert` and
`.chart-container.hidden`, and they still owe the workbench look the baseline's
own header asks for.

AUDITOR: self

VERDICT: APPROVE

---

## ROUND 5 — delta round, fresh reviewer

AUDITOR: subagent

Packet: `.sc/review/65cc72d-47fd3e24` (delta since `.sc/review/65cc72d-04fcbeed`,
base `65cc72d`). 11 files moved — 8 source/test/i18n artifacts and 3 review
documents. The packet's `must_read.txt` is EMPTY: no entry point was packaged, so
the scope is `delta.txt` plus the joins followed out of it (who sets `hass`, who
calls `setConfig` twice, who reads `_chart_generation`) plus the closure of the
six findings round 3 raised. Files that did NOT move in this delta (the bridge
surface, the tv surface, `sf-radiator.ts`, `sci-fi-weather.ts`, `sf-landspeeder.ts`,
`src/components/buttons/*`) were not re-audited; a defect there is round 3's or
out of this round's scope.

COVERAGE

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/plugs/sci-fi-plugs.ts | 737 | 737 | yes |
| src/cards/plugs/styles.ts | diff hunk + 70–120 | 278 | partial (the new rule and its neighbours) |
| src/cards/climates/sci-fi-climates.ts | 1–70 + every `msg(` site | 398 | partial (getRelevantEntities + the empty state) |
| src/locales/locales/fr.js | diff hunk + the id recomputed | 319 | partial (generated file, verified by diff) |
| xliff/fr.xlf | diff hunk + the two neighbouring units | 1174 | partial (verified by diff: 3 lines added, zero churn) |
| tests/cards/plugs/sci-fi-plugs.test.ts | delta hunks + 1–80 + 670–700 + 840–960 | 1027 | partial (every new case and every helper, in full) |
| tests/cards/climates/sci-fi-climates.test.ts | delta hunk (the whole new case) | 414 | partial |
| tests/styles/card-css-baseline.json | diff hunk | 4776 | partial (the 5 added lines) |
| docs/reviews/p1-runtime-defects/code-review.md | 283–584 (rounds 3 and 4) | 584 | partial (rounds 1–2 were read as round 3 judged them) |
| docs/reviews/.../history/code-review.round-03.md | identical to the round-3 block read above | 530 | partial |
| docs/reviews/.../history/code-review.round-03.hashes.txt | 47 | 47 | yes |
| src/utils/base-card.ts (join, not in delta) | 156 | 156 | yes |
| dev/modules/workbench-app.js (join) | 85–160 | 435 | partial (the card mount sequence) |
| dev/modules/editor.js (join) | 85–120 | 187 | partial (`updateCardConfig`) |
| src/cards/water/sci-fi-water-management.ts (join) | 40–115 | 738 | partial (the sibling card's initial async load) |
| docs/specs/cards/plugs.md (spec) | :17 + 895–930 | 930 | partial (F-PLG-D04 and § Adversarial Fixes) |
| docs/fixes/p1-runtime-defects/lot.json | all 6 observations | — | yes |
| vitest.config.ts (join) | 48 | 48 | yes |

VERDICT: BLOCK

SPEC: docs/specs/cards/plugs.md (F-PLG-D04, § Adversarial Fixes 1–2),
docs/fixes/p1-runtime-defects/lot.json (O4, O5)

### The six round-3 findings, judged one by one

| round-3 finding | claim | verdict of this round |
|---|---|---|
| HIGH — one history call per power reading after a failure | fixed: the load is no longer derived from `hass` | **PARTLY HOLDS → F-07 below.** The storm is gone and the mutant that restores the `hass` trigger is killed; but the new trigger misses the two events at which the card first becomes *able* to load, so on those paths the chart never loads at all |
| MEDIUM — a failure follows the user onto a plug with no power sensor | fixed: the clears moved into `willUpdate` | **PARTLY HOLDS → F-08, F-09 below.** The case round 3 named is fixed and probed; two other routes to the same stale message are open — an in-flight response, and the clamp the round-3 falsifier explicitly named |
| MEDIUM — two unprobed behaviours (climates guard, plugs clears) | one probe each | **HOLDS** — both mutants re-run below and both are killed |
| LOW — `?disabled` inert on both components | fixed: an `inert` class with `pointer-events: none` | **HOLDS** — `src/cards/plugs/sci-fi-plugs.ts:365,393`, `src/cards/plugs/styles.ts:85-92`, probed by "marks the offline controls inert, not merely disabled"; the CSS baseline carries the rule |
| LOW — the no-data message lost on a cache hit | fixed: `empty` travels with the cached data | **HOLDS** — `:85`, `:535`, `:563`; two independent mutants of it are killed (below). One loose end → F-10 |
| LOW — the climates empty state is a bare French literal | fixed in this diff, not beaded | **HOLDS, and the pipeline claim is verified** — see CONFORMANCE EVIDENCE; the id in `xliff/fr.xlf` and `src/locales/locales/fr.js` is the one lit-localize generates for that exact source string |

## FINDINGS

- [HIGH] src/cards/plugs/sci-fi-plugs.ts:133-143 — F-07 (the chart never loads when the card becomes able to load after its first render). On any mount order where `hass` is assigned after the card is in the page, and on any card whose device list arrives through a second `setConfig` on the same element, the power chart area stays permanently blank — no chart, no "Loading…", no error, nothing the user can act on — for the whole life of the element. And after a plug is removed from the configuration, the chart that stays on screen is the REMOVED plug's 24-hour history, now labelled with the name of the plug that took its index: silently wrong data, which is worse than a blank. Before this round both paths worked. — `updated()` now fires the load on exactly one condition, `changedProperties.has('_selected_plug_id')` (`:135`), and `firstUpdated()` (`:140-143`) only helps when `hass` and `config.devices` are already present at the first render, because `_loadSelectedPlugChart()` exits silently when either is missing (`:146-147`). Nothing re-tries when they arrive: a later `hass` assignment changes only `hass`, a later `setConfig` changes only `config`, and neither is a trigger. This violates `docs/specs/cards/plugs.md:17` F-PLG-D04 (the card shows a Chart.js histogram of the last 24 hours of power history) — a chart that is never requested shows no window at all — and leaves `plugs.md:930` F-PLG-AF2 (a `historyLoading` property and an error-state UI for the chart section) with no state to show, since no call is ever made.
  Reproduced (scratch probes, `--no-fsModuleCache`, nothing written in the tree): (a) `setConfig` → `appendChild` → `hass` — the order the repository's own workbench uses at `dev/modules/workbench-app.js:147-149` — `callApi` calls **0**, `.msg-container` empty, no `canvas` in `.chart-container`; the same mount with `hass` set before `appendChild` makes exactly **1** call. (b) mount with `getStubConfig()`'s `devices: []`, then `setConfig` carrying one plug on the SAME element — the shape of `dev/modules/editor.js:99-105` `updateCardConfig`, and of the way Home Assistant re-applies a changed card config when the card type has not changed — `callApi` calls **0** after the plug is configured. (c) two plugs, index 0 loaded, then the configuration is edited down to the second plug alone: the header changes to `Lamp Plug` while the only history ever fetched is `sensor.tv_power`, and `_chart_generation` still holds index 0's TV data. Restoring `changedProperties.has('hass')` as a trigger turns (a) and (b) green, which is what identifies this round's change as the cause — and turns `tests/cards/plugs/sci-fi-plugs.test.ts` "does not re-fetch history on a hass push" red (`expected 3 to equal 1`), which is why the fix is NOT to restore it.
  SITES: src/cards/plugs/sci-fi-plugs.ts:135 (the single trigger in `updated`)
  SITES: src/cards/plugs/sci-fi-plugs.ts:140-143 (`firstUpdated`, which needs `hass` and `devices` to be there already — and whose body is provably redundant: removing it leaves all 73 plugs+climates tests green, because the class-field initializer puts `_selected_plug_id` in the FIRST `changedProperties`, so `updated` already loads at mount)
  SITES: src/cards/plugs/sci-fi-plugs.ts:146-147 (the silent exit that turns "not ready yet" into "never")
  SITES: src/cards/plugs/sci-fi-plugs.ts:508-513 (`_clearChart`, which a configuration change never reaches, so the previous device's chart and its index-keyed cache entry survive it)
  FALSIFIED BY: three assertions in `tests/cards/plugs/sci-fi-plugs.test.ts` — (1) append the card, await `updateComplete`, THEN assign `hass`, and assert `callApi` was called exactly once; (2) mount with `devices: []`, call `setConfig` with one plug on the same element, and assert exactly one call; (3) mount two plugs with power sensors, drop the first from the configuration, and assert the history fetched is the surviving plug's entity, not the removed one's. A fix that adds `changedProperties.has('hass')` back passes (1) and (2) and turns "does not re-fetch history on a hass push" red; a fix that only guards `firstUpdated` differently leaves (2) and (3) failing. The shape that satisfies all of them is an attempt latch per plug index — load when the card has `hass`, a device and a power entity and has not yet ATTEMPTED that index, plus the existing `_selected_plug_id` trigger, plus invalidating the latch and the cache entry when `config` changes. Latching on the attempt rather than on success is what keeps round 3's storm closed.
  ROOT: F-PLG-D04 — the power chart is actually requested and shown (round 3 on this ROOT: round 1 raised the latch set before the call, round 3 the latch set only on success, this round the trigger that no longer fires)
  FIX-CLASS: corrects
  RESOLUTION: fixed by reverting — the user was asked the approach question a second time and chose to carve the component out. The chart's loading strategy is back to the delivered one (`!_chartLoaded && changedProperties.has('hass')`, the latch set before the call), which your own measurement shows loads correctly in both mount orders you reproduced. Everything three rounds added to this machinery is gone: the three `@state` flags, `_renderChartMessage` / `_chartHidden`, `_withTimeout` and its budget, `firstUpdated` / `_loadSelectedPlugChart`, the in-flight guard, the `willUpdate` clears, `empty` in the cache, the `.chart-container.hidden` rule and the `.msg-container` binding. Measured at the lot's base `65cc72d`: `grep -c "_historyLoading\|_historyError\|_historyEmpty\|_withTimeout"` → 0, so none of it was delivered code and the revert restores rather than removes. What stands is round 1's defect — a failure retires the retry on a single-plug dashboard — which is the delivered behaviour, and ha-sci-fi-8ap carries it with the five findings of rounds 3 and 5 as its brief, including the per-plug attempt latch and the config invalidation you prescribed. Proven: 70 plugs cases green, 1098 across the suite, and `tests/cards/plugs/` holds no reference to any of the reverted symbols.

- [HIGH] src/cards/plugs/sci-fi-plugs.ts:102-106 — F-08 (a history response that belongs to the plug the user has left paints the plug now on screen). Select another plug while the first plug's history call is still in flight — ordinary, since that call is allowed 2 seconds — and two `history/period` requests run at once; when the first one fails, the plug now on screen wears "Historique de puissance indisponible" with its chart frame hidden, although its own history loaded perfectly, and by this round's own accepted design nothing will ever clear it: the user must navigate away and back. If the first one instead succeeds late, its data is drawn into the chart of the plug now selected, so the card shows one plug's power history under another plug's name. This is the defect rounds 1 and 3 both fixed, reached by a third route. — the clear block added this round sets `_historyLoading = false` at `:103`, which is exactly the flag `_loadPowerChart`'s new in-flight guard reads at `:519`, so a plug change re-opens the guard while a call is outstanding. From there nothing ties a response to the plug that asked for it: `idx` is captured at `:521` and used ONLY for the cache write at `:563`, while `_historyError` (`:571`), `_historyEmpty` (`:559`), the chart draw (`:565-569`) and the toast (`:572`) are written by whichever call settles last, and the `finally` at `:574` clears the loading state while another call is still pending. Still `docs/specs/cards/plugs.md:930` F-PLG-AF2: an error state that accuses a device that answered correctly, and that the user cannot clear, is not the error state the clause asks for.
  Reproduced: two plugs each with a `power: true` sensor, the first call left pending and the second answering normally; selecting plug 2 gives **2** concurrent `history/period` calls (`sensor.tv_power` and `sensor.lamp_power`); rejecting the first then leaves, on plug 2, `_historyError === true`, `.msg-container` = "Historique de puissance indisponible" and `.chart-container` carrying `hidden`. The suite's "runs one history call at a time" cannot see it: it calls `_loadPowerChart` three times for the SAME plug and never changes selection.
  SITES: src/cards/plugs/sci-fi-plugs.ts:103 (`_historyLoading = false` on a plug change, which re-opens the guard mid-flight)
  SITES: src/cards/plugs/sci-fi-plugs.ts:519 (the in-flight guard, whose only latch is the flag `:103` clears)
  SITES: src/cards/plugs/sci-fi-plugs.ts:559,571,572 (flags and toast written with no check that `idx` is still the selected plug)
  SITES: src/cards/plugs/sci-fi-plugs.ts:565-569 (`_drawChart` / `_updateChart` on a chart that now belongs to another plug)
  SITES: src/cards/plugs/sci-fi-plugs.ts:574 (`finally` clearing the loading state while a second call is pending)
  FALSIFIED BY: a case in `tests/cards/plugs/sci-fi-plugs.test.ts` that mounts two plugs with power sensors, leaves the first call pending, moves the selection to plug 2, asserts exactly ONE `callApi` call, then rejects the first call and asserts `.msg-container` is empty and `.chart-container` has no `hidden`. A fix that only stops clearing `_historyLoading` in `willUpdate` passes the call-count half and still fails the message half (the pending call's `catch` still writes the shared flags); a fix that only adds `if (idx !== this._selected_plug_id) return;` after the await passes the message half and still fails the call-count half.
  ROOT: F-PLG-AF2 — the chart's loading and error state belong to the plug that produced them (round 3 on this ROOT: round 2 and round 3 raised the same invariant on the painted message and on the no-power-sensor plug). Three rounds on one ROOT: the orchestrator owes the invariant its next fix makes true — *every write to `_historyLoading` / `_historyError` / `_historyEmpty` and to the chart is owned by the plug index that requested it* — or an approach question to the user, before this round records.
  FIX-CLASS: corrects
  RESOLUTION: fixed by reverting — you were right to demand the invariant or the question, and the honest answer was the question. I did not have an ownership invariant I could make true without a fourth attempt at the same code, and my three previous attempts each produced a HIGH the next round found. The state those writes raced over no longer exists: the three flags are gone with the rest of the machinery. The invariant you wrote is recorded verbatim in ha-sci-fi-8ap as what the next pass must establish, beside the per-plug latch and the config invalidation — a shape to design, which is why it left a fix lane.

- [MEDIUM] src/cards/plugs/sci-fi-plugs.ts:102-112 — F-09 (the out-of-bounds clamp keeps the previous plug's error message). Remove a plug from the card's configuration while a history failure is on screen and the clamp moves the selection to plug 0, which then displays "Historique de puissance indisponible" with its chart hidden — an accusation against a device that made no call, on a plug the user never chose, and nothing clears it. — in `willUpdate`, the clear block (`:102-106`) tests `changedProperties.has('_selected_plug_id')` BEFORE the clamp (`:110-112`) assigns that same property, so the clamp's own change is never cleared; because Lit folds a property set inside `willUpdate` into the current `changedProperties`, `updated` does see it and does start a load (`:135`), but a clamped plug with no `power: true` sensor returns at `:151` without touching the flags. `docs/specs/cards/plugs.md:930` F-PLG-AF2 again. Round 3's own falsifier named this path in writing ("so does fixing `_clearChart` alone without re-asserting the same thing for the clamp path") and no case covers it.
  Reproduced: `devices: [LAMP (no power sensor), TV]`, selection moved to the TV, its history rejected, then the configuration edited down to `[LAMP]` — `_selected_plug_id` clamps to 0 and `_historyError` is still `true`, `.msg-container` still reads "Historique de puissance indisponible", `.chart-container` still `hidden`.
  SITES: src/cards/plugs/sci-fi-plugs.ts:102-106 (the clear, ordered before the clamp), src/cards/plugs/sci-fi-plugs.ts:110-112 (the clamp whose change it misses)
  RESOLUTION: fixed — by reverting: the clear block is gone from `willUpdate`, so the ordering against the clamp no longer exists and there is no message flag left for it to carry. The clamp itself stays — it is O5's own fix for an out-of-bounds index, and it keeps its probe, "clamps the selected plug when the device list shrinks".
  FIX-CLASS: corrects

- [LOW] src/cards/plugs/sci-fi-plugs.ts:563 — F-10 (a cache entry carries a timestamp nobody reads, and the suite's own cache fixture no longer matches the shape the code requires). `fetchedAt` is written at `:563` and declared at `:85` and is read nowhere in `src/` or `tests/`, next to a comment at `:528-529` stating the cache has no time-based invalidation — a field that looks like a TTL and is not one is the first thing a later reader will trust. In the same shape change, `tests/cards/plugs/sci-fi-plugs.test.ts:688-692` seeds a `_chart_generation` entry without the `empty` field this round made load-bearing, so that test drives `_historyEmpty = undefined` through a field typed `boolean` and exercises a cache entry the production path can no longer produce.
  RESOLUTION: fixed — by reverting: the `empty` field this round made load-bearing is gone with the rest of the machinery, so the suite's cache fixture matches the shape the code requires again. Verified: `grep` finds none of the reverted symbols in `tests/cards/plugs/`, and 70 plugs cases are green. `fetchedAt` is left exactly as delivered — written, read nowhere, beside the comment saying the cache has no time-based invalidation. You are right that it reads like a TTL and is not one; it predates this lot and nothing in this diff touches it, so it rides in ha-sci-fi-8ap with the pass that reworks this cache.
  FIX-CLASS: corrects

## MUTATION

Harness: a scratch Vitest configuration whose `transform` plugin rewrites one
anchor in one source file before esbuild, run with `--no-fsModuleCache`; nothing
was written into the tree and nothing was restored.

The three mutants round 4 claims, re-derived:

MUTATION: sci-fi-climates `if (entities.size === 0) return [];` removed — KILLED by tests/cards/climates/sci-fi-climates.test.ts "O4: returns no relevant entity at all when no climate exists" (1 failed | 72 passed)

MUTATION: sci-fi-plugs the three flag clears removed from `willUpdate` — KILLED by tests/cards/plugs/sci-fi-plugs.test.ts "does not carry a failed plug message onto a plug with no power sensor" (1 failed | 72 passed). This is the mutant round 1 recorded at the top of `_loadPowerChart` and round 4 moved into `willUpdate`; killed in its new place, so the chain closes.

MUTATION: sci-fi-plugs `changedProperties.has('hass')` restored as a load trigger — KILLED by tests/cards/plugs/sci-fi-plugs.test.ts "does not re-fetch history on a hass push" (`expected 3 to equal 1`), verbatim as claimed

Three more mutants of this round's own code, closed:

MUTATION: sci-fi-plugs the in-flight guard `if (this._historyLoading) return;` removed — KILLED by tests/cards/plugs/sci-fi-plugs.test.ts "runs one history call at a time" AND "does not re-fetch history on a hass push" (`the first render loads once: expected 2 to equal 1` — which is how the double load at mount, `firstUpdated` then `updated`, becomes visible)

MUTATION: sci-fi-plugs `empty` written as a constant `false` in the cache entry — KILLED by tests/cards/plugs/sci-fi-plugs.test.ts "re-derives the no-data message from the cache on a second visit"

MUTATION: sci-fi-plugs `this._historyEmpty = cache.empty;` removed from the cache branch — KILLED by the same case

And two SURVIVORS, both of this round's own code, both inside F-07:

MUTATION: sci-fi-plugs `this._loadSelectedPlugChart()` removed from `firstUpdated` — SURVIVED (tests/cards/plugs/sci-fi-plugs.test.ts + tests/cards/climates/sci-fi-climates.test.ts, 73 passed)

MUTATION: sci-fi-plugs `!this.hass` removed from the `_loadSelectedPlugChart` guard — SURVIVED (73 passed), although that guard is exactly what decides between a blank chart area and an error toast on the mount order F-07 reproduces

## NOTES

- The load-bearing judgment of round 4 is right, and I checked it against the
  text rather than the summary: `docs/specs/cards/plugs.md:930` asks for "a
  `historyLoading` property and an error state UI for the chart section if the
  `history/period` API call fails or takes > 2 seconds". It says nothing about
  retrying, so "a transient failure's message stays until the user reselects the
  plug" is a cost the spec permits, and paying it to kill the storm was the right
  trade. F-07 and F-08 are not that cost: one is a chart that is never requested,
  the other an error state shown on the wrong device.
- Removing the `hass` coupling made the card smaller (`_chartLoaded` and its
  `.then` are gone) and that is a real simplification. The comment at `:115-131`
  explaining why a loader must not be driven by the entity it measures is worth
  keeping with the code whatever shape the next fix takes.
- `src/cards/water/sci-fi-water-management.ts:59-62` uses the same
  `firstUpdated` + `if (this.hass)` shape, so F-07's pattern is consistent with
  the repository rather than drift — it is the plugs card's loss of its second
  trigger that is new. Whether the water card has the same hole is outside this
  delta; I take no position on it.
- Lit prints "Element sci-fi-plugs scheduled an update … after an update
  completed" in dev mode whenever the load starts from `updated()`. It is
  inherent to driving an async load from a lifecycle hook, dev-only, and not a
  defect.
- The chart is still instantiated while `.chart-container` carries `hidden`
  (`_drawChart` runs inside the `try`, the class is dropped in the `finally`), as
  round 3 noted. Unchanged by this delta, still not reproducible in a test
  environment with no layout.
- `tests/dev/workbench.test.ts` is red in this worktree only, from a pre-existing
  absolute `/node_modules/...` import under `dev/`. Confirmed independently:
  `npx vitest run --no-fsModuleCache` → **1104 tests passed**, 1 file failed, that
  one. Bead `ha-sci-fi-rx2`, not this round's scope.
- The standing beads `ha-sci-fi-ecr`, `ha-sci-fi-5em`, `ha-sci-fi-r9a`,
  `ha-sci-fi-33v` were not re-litigated; none of their files moved in this delta.

## CONFORMANCE EVIDENCE

- `docs/specs/cards/plugs.md:929` § Adversarial Fixes 1 (an `unavailable` /
  `unknown` plug renders visibly offline and non-interactive) → the offline state
  now reaches the markup the card owns: `src/cards/plugs/sci-fi-plugs.ts:365` and
  `:393` put `inert` on the `.sensor` wrapper, `src/cards/plugs/styles.ts:85-92`
  gives it `pointer-events: none` plus the dimming, and
  `tests/styles/card-css-baseline.json:2109-2113` carries the rule. Probed by
  "marks the offline controls inert, not merely disabled", which asserts the
  class rather than the attribute Lit sets whatever the component does with it —
  the weakness round 3 named in the previous probe.
- `docs/specs/cards/plugs.md:930` F-PLG-AF2, the *rendered* half → `_historyEmpty`
  now travels with the data it describes (`src/cards/plugs/sci-fi-plugs.ts:85`,
  written at `:563`, re-derived at `:535`), and two independent mutants of that
  path are killed. The loading and error states are still rendered from the three
  flags through `_renderChartMessage()` (`:217-222`, read at `:262`) with no
  binding inside `.chart-container`.
- `docs/fixes/p1-runtime-defects/lot.json` O4 (climates) and the § Localization
  rule that every user-visible string goes through `msg()` → the empty state is
  `msg('No radiator configured')` at `src/cards/climates/sci-fi-climates.ts:61`,
  with `msg` imported at `:3`; `xliff/fr.xlf:1169-1171` adds the unit and
  `src/locales/locales/fr.js:297` the generated target. The id is not asserted,
  it is recomputed: lit-localize's own id generator returns `secbba82986a809bc`
  for the source string `No radiator configured`, which is the id in both files —
  and `sa569fdd3af89d996` for `No vehicle configured`, the neighbouring unit, so
  the generator used matches the one that produced the rest of the file. This is
  the round-1 HIGH's failure mode (a key that never resolves) positively excluded.
- `src/utils/base-card.ts:76` (an empty relevant-entity list means repaint on
  every change) → `src/cards/climates/sci-fi-climates.ts:38` still returns `[]`
  before the season entity is added, and the guard now has a probe whose mutant
  dies.
- `docs/specs/cards/plugs.md:930`, the 2-second budget → `_withTimeout`
  (`src/cards/plugs/sci-fi-plugs.ts:583-600`) still rejects at
  `HISTORY_TIMEOUT_MS` and attaches a rejection handler to the underlying
  promise, so a late `callApi` rejection cannot escape as an unhandled rejection.
  No path leaves `_historyLoading` true: it is set at `:544` with nothing
  throwable between it and the `try`, and the `finally` at `:573-575` is the only
  exit — the deadlock this round was asked about does not exist.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 2 | blocking |
| MEDIUM | 1 | fix |
| LOW | 1 | fix |

Positive observations:
- Four of round 3's six findings hold exactly as written, and the i18n one holds
  under the strongest check available — the message id recomputed from the source
  string rather than compared to itself.
- Deleting `_chartLoaded` instead of patching it a third time was the right
  instinct; the residual defect is in what replaced its trigger, not in the
  decision to remove it.
- The two round-3 survivors are dead and three mutants of the new cache field are
  dead too. The probes added this round assert on rendered DOM, not on fields.

### The question this round was asked

Did round 4's fixes introduce a new defect? **Yes, one: F-07.** Restoring the old
`hass` trigger makes both of its reproductions pass, which pins this round's
change as the cause. The other blocking finding, F-08, is not new code behaving
badly; it is the invariant of rounds 1 and 3 — a message belongs to the plug that
produced it — reached by a route the new in-flight guard opened and the new probe
cannot see. Both land on the same two machinery ROOTs for the third round running,
which is the signal the round gate exists to raise: the next fix should name the
ownership invariant and make it true in one place, rather than add a fourth
trigger to the same `updated()`.

AUDITOR: subagent

VERDICT: BLOCK

---

## ROUND 6 — the carve-out

Not a sixth attempt at the same code. The user was asked the approach question
a second time, with the measurement that decided it: **every symbol of the
chart's loading machinery was added by this lot.** At the lot's base `65cc72d`,
`grep -c "_historyLoading\|_historyError\|_historyEmpty\|_withTimeout"` on
`src/cards/plugs/sci-fi-plugs.ts` returns **0**. So reverting restores the
delivered card rather than degrading it — and round 5's own probes show the
delivered trigger loads correctly in both mount orders where round 4's did not,
including the one the workbench itself uses.

Three attempts, three HIGHs found by the next round:

| attempt | what it did | what it broke |
|---|---|---|
| round 2 | latch set only on success | a `history/period` per power reading, concurrent calls — round 3 |
| round 4 | load on first render + plug change, never on a push | never loads when the card becomes able to load after its first render — round 5 |
| round 4 | in-flight guard reading a flag `willUpdate` cleared | the guard re-opened mid-flight; one plug's data drawn under another's name — round 5 |

Reverted, in full: the three `@state` flags, `_renderChartMessage` /
`_chartHidden`, `_withTimeout` and `HISTORY_TIMEOUT_MS`, `firstUpdated` /
`_loadSelectedPlugChart`, the in-flight guard, the `willUpdate` clears, `empty`
in the cache entry, the `.chart-container.hidden` rule, the `.msg-container`
binding, and the six test cases that drove them. `localize-extract` then
removed the two strings that no longer exist in source, on its own — the lot
now adds three translation units instead of five.

Kept, because no round has found a defect in any of them since round 1:

- the unavailable state — offline tag, `.image.unavailable`, `inert` controls, the `_toggle` guard;
- the cable animation class on both containers;
- `_historyStart()`, the rolling 24-hour window (it only builds the URL);
- the `willUpdate` clamp of `_selected_plug_id`.

Standing, and each in a bead rather than in silence: **ha-sci-fi-8ap** (this
chart owes a loading state, an error state and a 2 s budget, with the per-plug
attempt latch, the config invalidation and the ownership invariant round 5
prescribed, and the dossier of all three attempts), `ha-sci-fi-33v`,
`ha-sci-fi-rx2`, `ha-sci-fi-5em`, `ha-sci-fi-r9a`, `ha-sci-fi-ecr`.

`plugs.md` § Adversarial Fixes 2 is therefore still unmet. It was unmet before
this lot, and saying so is the point of the bead.

State of the tree: **1098 tests pass**, lint **165** against a ceiling of 166,
typecheck clean. One suite red and not this lot's: `tests/dev/workbench.test.ts`,
worktree-only, `ha-sci-fi-rx2`. The lot's three plugs CSS rules are
`.offline-tag`, `.image.unavailable` and `.sensor.inert`; the baseline was
regenerated and still owes the workbench look its own header asks for.

AUDITOR: self

VERDICT: APPROVE
