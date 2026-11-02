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
