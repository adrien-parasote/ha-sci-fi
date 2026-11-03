# Security review — bridge-unrendered-config — round 1

AUDITOR: subagent
Packet: `.sc/review/fedabc6-1777a669` (dirty, base fedabc6). must_read.txt is EMPTY: no entry point was packaged.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/bridge/sections/sf-bridge-access.ts | diff hunks + 1-130, 172-196 | 224 | no — every changed hunk and the full render()/_toggleLock path |
| src/cards/bridge/sections/sf-bridge-alerts.ts | diff hunks + 1-60 | 193 | no — every changed hunk, toggleService, render() |
| src/cards/bridge/sci-fi-bridge-editor.ts | diff hunks (setConfig, _dispatch, cycle input, _runningStatesValue, _updateRunningStates, _normalizeRunningStates, _add/_remove/_updateCycle, vehicle icon), 448-484 | 946 | no — every changed hunk |
| src/cards/bridge/sections/sf-bridge-vehicle.ts | diff hunk | 108 | no — the one changed hunk |
| src/cards/bridge/config.ts | diff hunk | 128 | no — comment-only change |
| src/cards/bridge/labels.ts | diff hunk | 58 | no — one msg() label added |
| src/cards/bridge/bridge-call.ts (unchanged, sink) | 1-49 | 49 | yes |
| src/cards/bridge/bridge-toggle.ts (unchanged, sink) | 1-22 | 22 | yes |
| src/components/sf-icon/sf-icon.ts (unchanged, sink) | grep of icon/render paths | 233 | no — icon string handling and render sinks |
| src/components/sf-icon/icon-names.ts (unchanged) | 1-40 | — | lookup helper |
| src/cards/bridge/bridge-validate.ts (unchanged) | grep lock/icon/vehicle | — | no |
| docs/specs/bridge-unrendered-config/spec.md | FR-1..FR-7, risks, error matrix, assumptions | — | security-relevant rows |

VERDICT: DEPLOY

SURFACES CHECKED:
- Service-call sinks: `_toggleLock` (sf-bridge-access.ts:175) and `_toggleSiren` (sf-bridge-alerts.ts:164), both through `bridgeCall` (bridge-call.ts:33), which awaits `hass.callService`, toasts only on success, logs and never rethrows on rejection.
- Lock gating: the service is derived ONLY from `locked` -> `unlock` and `unlocked` -> `lock` (sf-bridge-access.ts:177); every other state (jammed, unavailable, unknown, locking, unlocking, open, absent entity) gives `undefined` -> return, with no call. The button is also `disabled` when `lockUsable` is false (sf-bridge-access.ts:102-103), and that includes `attributes.code_format` set. The domain is the hardcoded literal `'lock'`, never derived from the config string.
- In-flight / double-click race: `_lockPending.has(entity)` is checked and the set is replaced synchronously inside the click handler, before the first `await` (sf-bridge-access.ts:176-179). A second click in the same tick is refused. `after` releases the guard on success AND on rejection (bridge-call.ts:45,48), so a failed call cannot leave the lock stuck disabled.
- Siren gating: `renderSfToggle(unusable, …)` disables the button for absent / `unavailable` / `unknown` (sf-bridge-alerts.ts:100,110). A disabled `<button>` dispatches no click. The domain is the hardcoded literal `'switch'`.
- Domain confusion from config entity ids: the config is authored by the dashboard owner, and the ids reach `callService` only as `entity_id` data under a fixed domain. HA routes `lock.*`/`switch.*` services only to entities of that platform, so a mis-typed id fails server-side; it cannot redirect the call to another domain. The editor offers lock pickers from `_entitiesByDomain('lock')` only (sci-fi-bridge-editor.ts:448).
- Injection: every new string reaches the DOM through Lit auto-escaped bindings. That covers `title`/`aria-label` (msg() constants), `.value` property bindings for running_states, and the `icon=` attribute for vehicle.icon. The siren `style=` interpolation uses constant tokens only. The new code adds no unsafeHTML/innerHTML (grep of src/: the only innerHTML is pre-existing in the weather card, untouched). `sf-icon` resolves names through `ownValue` (own-key lookup), so `__proto__`/`constructor` icon names do not resolve to inherited values, and path data goes into an `svg` template attribute binding.
- Prototype keys / unsafe config handling: `withoutRunningStates` rebuilds the cycle with `Object.fromEntries(Object.entries(...))` from the existing cycle. The user string only becomes array VALUES (split/trim/filter), never object keys. `_runningStatesRaw` is a `Map<number,string>`, not a plain object. `_runningStatesValue` never throws on non-array input (string, number, undefined handled).
- Secrets: none added. Dependencies: no package.json / lockfile change in the diff, so no audit is owed for this lot.

FINDINGS: none (0 critical, 0 high, 0 medium, 0 low)

NOTES:
- One-click lock/unlock without confirmation is a recorded user ruling (spec Assumption 4). The card is not an authorization boundary: any authenticated HA frontend user can already call `lock.unlock` over the websocket, and HA's auth enforces who may. Accepted risk, not a defect.
- The siren domain is hardcoded to `switch` and is explicitly out of scope in the spec. A `siren.*` id configured there makes the call fail server-side (logged, no toast). Functional, not security.
- The lock state used by `_toggleLock` is the one captured at the last render. If an integration resolves `callService` before HA pushes the new state, the button re-enables for a moment on the old state, and a click would resend the same idempotent transition. That is HA's reported state, not a forbidden transition. Not a defect.
- `vehicle.icon` (now rendered) and the pre-existing section icons are not type-checked by `bridge-validate.ts`. A non-string YAML value could break the section's render for the dashboard owner who wrote it. This is self-inflicted robustness, not an attack path, and it follows the pattern that already exists for `access.icon`/`alerts.icon`.
- `running_states` array validation at card render is an acknowledged bead (spec §scope); it is pre-existing behaviour and outside this lot's write scope.
- This is a static read of client code only. No infrastructure is in the diff.

---

## Round 2 — delta re-review (packet `.sc/review/fedabc6-333e97f4`)

AUDITOR: subagent

COVERAGE (must_read.txt is empty — no entry point packaged; scope = delta.txt files + closure of round 1, which had no findings):
| file | lines read | total (wc -l) | full read? |
| src/cards/bridge/sci-fi-bridge-editor.ts | delta hunk + 635-665 (cycle list render) | 946 | no — one-line guard change, surrounding template read |
| src/locales/locales/fr.js | full (packet shows it whole; real git diff = 14 lines) | 338 | yes |
| tests/cards/bridge/bridge-unrendered-config.test.ts | delta hunks (hassOf locale, TC-BUC-U-11/12/13) | 529 | no — test-only change |
| docs/specs/cards/bridge.md | delta hunks (lines ~727-826) | 1578 | no — doc-only change |
| docs/reviews/bridge-unrendered-config/* (code-review, history, security-review) | delta hunks | — | review artefacts, no runtime effect |

VERDICT: DEPLOY

SURFACES CHECKED:
- Editor guard (sci-fi-bridge-editor.ts:650): `typeof cycle.entity === 'string' && cycle.entity.startsWith('sensor.')` only narrows when the running_states input renders. A config cycle with a missing or non-string `entity` no longer throws a TypeError in the editor render (TC-BUC-U-12). The bound values still go through Lit property bindings (`.value`, `.label`). No new sink, no service call, no new key written from user input.
- Generated locale (src/locales/locales/fr.js): the real change against HEAD adds 13 constant French strings and removes one unused entry (`N/A`). Every entry is a plain template literal with no interpolation. The only `str` template (`Entité poêle non trouvée : ${0}`) is pre-existing and unchanged. Strings reach the DOM through `msg()` inside Lit bindings, so they are escaped. No markup in any translated string (grep for `<` and `unsafe`: none).
- Tests: the change forces an `en` locale on the mock hass and adds editor regression tests. No runtime code.
- Spec doc (docs/specs/cards/bridge.md): it now documents the `_lockPending` replaced-Set guard and the siren toggle being disabled on `unavailable`/`unknown`. Both match the gating that round 1 verified in sf-bridge-access.ts and sf-bridge-alerts.ts. No contradiction with the code that round 1 cleared.
- Round 1 closure: round 1 recorded no findings, so there is nothing to carry over and no contested finding to rule on.

FINDINGS: none (0 critical, 0 high, 0 medium, 0 low)

NOTES:
- The packet renders fr.js as a whole "new file" because it has no base blob. `git diff` against HEAD shows the real 14-line change judged above.
- xliff/fr.xlf moved in the worktree but is not in delta.txt. It is the translation source for fr.js, which was judged directly. It has no runtime effect.
- This is a static read of client code only. No infrastructure is in the delta.
