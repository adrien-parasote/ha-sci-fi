# Security review — bridge-error-matrix

AUDITOR: subagent
Packet: .sc/review/c7ccbeb-3723059c (dirty c7ccbeb..worktree). Spec: docs/specs/bridge-error-matrix/spec.md.

COVERAGE (must_read.txt of the packet is EMPTY — no entry point packaged; rows below are the source files in scope):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/bridge/bridge-warn.ts | 1-47 | 47 | yes |
| src/cards/bridge/bridge-validate.ts | 1-90 | 90 | yes |
| src/cards/bridge/bridge-toggle.ts | 1-22 | 22 | yes |
| src/cards/bridge/sci-fi-bridge.ts | 1-247 | 247 | yes |
| src/cards/bridge/sections/sf-bridge-access.ts | diff hunks | 160 | no (diff only) |
| src/cards/bridge/sections/sf-bridge-actions.ts | diff hunks | 125 | no (diff only) |
| src/cards/bridge/sections/sf-bridge-alerts.ts | diff hunks | 159 | no (diff only) |
| src/cards/bridge/sections/sf-bridge-appliances.ts | diff hunks | 109 | no (diff only) |
| src/cards/bridge/sections/sf-bridge-automations.ts | diff hunks | 176 | no (diff only) |
| src/cards/bridge/sections/sf-bridge-crew.ts | diff hunks | 136 | no (diff only) |
| src/cards/bridge/sections/sf-bridge-stove.ts | diff hunks | 141 | no (diff only) |
| src/cards/bridge/sections/sf-bridge-vehicle.ts | diff hunks | 109 | no (diff only) |
| src/cards/bridge/styles.ts | diff hunks (CSS only) | 777 | no (diff only) |
| src/utils/base-card.ts (context, not in diff) | 60-150 | — | partial |
| docs/specs/bridge-error-matrix/spec.md | full | — | yes |

VERDICT: DEPLOY

SURFACES CHECKED:
- Untrusted inputs: the Lovelace card config (user YAML / editor, passed to `setConfig`) and `hass.states` (entity ids, states, attributes from Home Assistant).
- Config reflection (FR-8 (the error message carries only key path, index and expected type) / anti-pattern 6): `bridge-validate.ts` builds every message from constant path strings, the numeric loop index and a fixed type word; no `String(value)`, no `JSON.stringify`, no template of a config value. `sci-fi-bridge.ts:133` renders it through a Lit text binding (auto-escaped). `console.error` at `sci-fi-bridge.ts:57` logs the same fixed message.
- Validator robustness: `validateBridgeConfig` is linear over the configured arrays, no recursion, no regex (no ReDoS); `firstBadOptionalString` dereferences `items[i].lock` only after `firstBadElement` has proved every element a non-null object (call order at `bridge-validate.ts:88`), so a hostile `access.items: [null]` returns a message instead of throwing. `setConfig` never throws; the invalid path stores a frozen `{type}` placeholder (`sci-fi-bridge.ts:59`), so no section receives the bad shape.
- HTML/DOM sinks: grep of `src/cards/bridge/*` for `unsafeHTML`, `innerHTML`, `unsafeCSS`, `eval(` — no hit. All new text slots (`--`, `-- %`, `-- W`, `msg('Unavailable')`, entity names) go through Lit text bindings; new class bindings are fixed literals selected by booleans.
- Logging (FR-1 (one warn per reason+entity)): `bridge-warn.ts` passes the entity id as the SECOND `console.warn` argument (never a format string), ignores non-string/empty ids, and the dedupe `Set` bounds log volume per `setConfig`; no secret or token reaches a log.
- Service-call controls (FR-6.2 (an absent entity's control cannot call a service)): toggle buttons (`bridge-toggle.ts:13` `?disabled`), slider (`sf-bridge-automations.ts` `?disabled` plus a handler guard in `_onSliderInput`), actions (`?disabled` plus a guard in `_trigger`), access open/close (`?disabled`). These narrow, never widen, the set of service calls; authorization of service calls remains Home Assistant's server-side concern.
- Dependencies: no `package.json` / lockfile change in the diff, so no audit delta.

FINDINGS:
(none)

NOTES:
- This is a client-side Lit card; there is no server endpoint, auth path or secret store in the diff. The trust boundary is the HA websocket session, which this lot does not touch.
- Access open/close handlers (`_openCover`/`_closeCover`) carry no in-handler absent guard, unlike actions and slider; the `disabled` attribute already stops user and `.click()` activation, and HA itself rejects a call to an unknown entity. A consistency point, not a security defect.
- `sf-bridge-actions.ts` interpolates the config `color` into an inline `style` attribute (pre-existing, unchanged by this lot); the value is authored by the dashboard admin who already controls the card, so it is not an escalation.
- A config entity id such as `__proto__` would make `hass.states[id]` resolve to `Object.prototype` and read as present; config is admin-authored and the only effect is a wrong "present" rendering — not exploitable.
- Section files were judged on their diff hunks (the packet's must_read.txt was empty); unchanged lines of those files were not re-audited.

---

## Round 2 (packet .sc/review/c7ccbeb-3723059c-r2)

AUDITOR: subagent
COVERAGE (must_read.txt of the packet is EMPTY — no entry point packaged; no delta.txt in the packet, so scope is the files the orchestrator named as changed since round 1, plus every service-call site of the bridge, plus closure of round 1 (no findings to close)):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/bridge/bridge-toggle.ts | 1-22 | 22 | yes |
| src/cards/bridge/sections/sf-bridge-actions.ts | 1-125 | 125 | yes |
| src/cards/bridge/sections/sf-bridge-appliances.ts | 1-109 | 109 | yes |
| src/cards/bridge/sections/sf-bridge-alerts.ts | 1-159 | 159 | yes |
| src/cards/bridge/sections/sf-bridge-automations.ts | 1-176 | 176 | yes |
| src/cards/bridge/sections/sf-bridge-access.ts | grep of call sites and `disabled` bindings (69-145) | 160 | no (unchanged since round 1) |
| docs/specs/bridge-error-matrix/spec.md | FR-6 / FR-6.2 rows (37-54) | — | no (round 1 read it in full) |

VERDICT: DEPLOY

SURFACES CHECKED:
- Service-call paths for absent entities (FR-6.2 (a control bound to an absent entity cannot call a service)): grep of `bridgeCall(` across `src/cards/bridge` gives exactly six call sites, and `hass.callService` is reached only through `bridge-call.ts:43`. Each one is behind a control that is `disabled` when the entity is absent:
  - `sf-bridge-actions.ts:103` (`_trigger`) — reached only from the button `@click` at :80, which carries `?disabled="${loading || absent}"` at :79. The in-handler absent guard is gone, but a disabled `<button>` dispatches no click, whether from the user or from `.click()`, so no new path opens.
  - `sf-bridge-alerts.ts:144` and `sf-bridge-automations.ts:122` (`_toggle`) — reached only through `renderSfToggle` (`bridge-toggle.ts:13`, `?disabled="${absent}"`, `aria-disabled` at :14), called at `sf-bridge-alerts.ts:113` and `sf-bridge-automations.ts:84` with the per-row `absent` computed from `hass.states[entity] === undefined`.
  - `sf-bridge-automations.ts:154` (`_setSliderValue`) — reached only from `_onSliderInput`, which keeps its handler guard (:134), and the range input is `?disabled` (:113).
  - `sf-bridge-access.ts:134` / `:145` — open/close buttons `?disabled="${absent}"` (:100, :110), unchanged since round 1.
  Conclusion: the change adds no service-call path for an absent entity.
- `sf-bridge-appliances.ts`: display only — no service call, no event handler. The simplified condition picks between fixed class literals (`unknown`/`running`/`idle`, `consumable-unknown`/`-ok`/`-warn`) and text bindings; config `entry.name`/`entry.icon` go through Lit text and attribute bindings (auto-escaped).
- `bridge-toggle.ts`: every binding is a boolean-derived literal or the closure. No markup is built from config or state strings.
- HTML/DOM sinks: grep of `src/cards/bridge` for `unsafeHTML`, `innerHTML`, `unsafeCSS`, `eval(` — no hit.
- Dependencies: no manifest or lockfile in the packet's file list, so there is no audit delta.

FINDINGS:
(none)

NOTES:
- Removing the `_trigger` guard puts actions in the same posture round 1 already accepted for access open/close, where `disabled` alone is the control. FR-6.2 pins `disabled`, not a handler guard. Defense-in-depth beyond that is a consistency choice, not a defect: Home Assistant authorizes service calls on the server side, and it rejects a call to an unknown entity.
- If an entity disappears between a render and a click, the stale-closure window is bounded by Lit re-rendering on each `hass` update. At worst it sends one call that HA rejects, and `bridge-call.ts` surfaces it as an error toast.
- Client-side Lit card: the diff has no server endpoint, auth path or secret store.
