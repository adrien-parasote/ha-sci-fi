# Security review — config-error-card

Packet: `.sc/review/2c5b4a0-b733600e` (dirty 2c5b4a0..worktree). Spec: `docs/specs/config-error-card/spec.md`.

AUDITOR: subagent

COVERAGE (must_read.txt of the packet is EMPTY — no entry point packaged; rows below are the source files of the diff):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/utils/base-card.ts | 1-210 | 210 | yes |
| src/cards/hexa-tiles/sci-fi-hexa-tiles.ts | diff hunk (getConfiguredEntities) | 479 | no — hunk only |
| src/cards/plugs/sci-fi-plugs.ts | diff hunk | 662 | no — hunk only |
| src/cards/stove/sci-fi-stove.ts | diff hunk | 517 | no — hunk only |
| src/cards/tv/sci-fi-tv.ts | diff hunk | 608 | no — hunk only |
| src/cards/vacuum/sci-fi-vacuum.ts | diff hunk | 363 | no — hunk only |
| src/cards/vehicles/sci-fi-vehicles.ts | diff hunk | 236 | no — hunk only |
| src/cards/weather/sci-fi-weather.ts | diff hunk | 639 | no — hunk only |
| src/locales/locales/fr.js | diff hunk (2 entries) | 372 | no — hunk only |
| docs/specs/config-error-card/spec.md | grep of FR-2, FR-4, D1-D7, anti-patterns, TC-CEC-U-14/17/18 | 133 | no — security clauses |
| tests/utils/base-card.test.ts | grep of the hostile-id, prototype-key, 50 000-char, aria and bidi fixtures | — | no — fixtures only |

VERDICT: DEPLOY

SURFACES CHECKED:
- Input boundary: entity ids from user Lovelace YAML (`config.tiles[].entity`, `weather.weather_entity`, `weather.weather_alert_entity`, `weather_entity`, `alert.entity_id`, and each card's `getRelevantEntities()` set for plugs/stove/tv/vacuum/vehicles), routed through `getConfiguredEntities()` -> `_configuredIds()` (src/utils/base-card.ts:155-159: Array check, string-only, non-empty, dedup) -> `getMissingEntities()` (:147-153) -> `_missingIdsLabel()` (:162-167) -> `displayId()` (:27-30) -> `msg(str`...`)` (:124) -> `_renderErrorCard` (:174-183).
- Sink: `${message}` at src/utils/base-card.ts:179 is a Lit child-text binding (escaped, creates no element); no `unsafeHTML`/`unsafeSVG`/`innerHTML`/attribute concatenation anywhere in base-card.ts or in the seven changed overrides (grep). `lit-localize.json` is `mode: runtime`, so `msg(str...)` returns a plain string with the value substituted — the French `str` template in src/locales/locales/fr.js:218 substitutes `${0}` the same way; no translation path turns the id into markup.
- Lookup safety: `hasOwnProperty.call(states, id)` (:151) — ids `__proto__`, `constructor`, `toString` are not read off the prototype (test fixture tests/utils/base-card.test.ts:551).
- Display transform: C0, DEL, C1 and the bidi controls named in FR-4 (missing ids are shown with control and bidi characters removed and cut to 64 code points) stripped by HIDDEN_CHARS (:23); cut by code points via `Array.from` (no split surrogate); at most three ids plus a computed `(+N)`; message bounded (~3 x 65 code points plus fixed text) whatever the input length (50 000-char fixture at tests/utils/base-card.test.ts:568).
- XSS fixtures `<img src=x onerror=alert(1)>` / `<svg onload=alert(1)>` exist (tests/utils/base-card.test.ts:509).
- Aria: `role="status"` on `.sf-error-card`, `aria-hidden="true"` on the decorative icon (:177-178), per FR-2 (error-card markup gains exactly those two attributes).
- Info leakage: the banner shows only ids the dashboard author wrote into the card config; no hass state, token, attributes or stack trace is added to the DOM. Render-error path (:127-132) is unchanged from base.
- Secrets/dependencies: no package.json / lockfile change in the diff; no secret, URL or network call introduced.

FINDINGS: none (critical: 0, high: 0)

NOTES:
- HIDDEN_CHARS does not strip zero-width characters (U+200B-U+200D, U+FEFF) nor U+2028/U+2029; they can make two ids look identical in the banner. FR-4 pins the exact list and this matches it; cosmetic in a text node, not a defect.
- Entity ids are shown to every viewer of the dashboard. They are the author's own configuration and Home Assistant's frontend shows the same ids in its own "entity not available" warnings; accepted by spec D2/D4.
- The pre-existing render-error path still shows `err.message` (src/utils/base-card.ts:128-131) as Lit text — escaped, unchanged by this lot.
- A non-array `tiles` in hexa-tiles makes `.map` throw inside the `try` (src/cards/hexa-tiles/sci-fi-hexa-tiles.ts getConfiguredEntities), which falls back to the escaped render-error card — fails safe; D6 puts invalid config out of scope.
- This is a static read plus a read of the test fixtures; I did not run the tests. TDD/spec-gate verdicts come from the packet's checks.txt. No infrastructure in the diff.

---

## Round 2 — delta re-review

Packet: `.sc/review/2c5b4a0-047338cf` (delta since `.sc/review/2c5b4a0-b733600e`). Scope: the files listed in `delta.txt`, plus closing out the previous round's findings (it had none).

AUDITOR: subagent

COVERAGE (must_read.txt of the packet is EMPTY, so no entry point was packaged; the rows below are the source files in delta.txt):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/plugs/sci-fi-plugs.ts | 115-175 (updated() and renderCard(), covering the whole delta hunk) | 671 | no — delta hunk plus context |
| src/cards/weather/sci-fi-weather.ts | 170-200 (updated(), covering the whole delta hunk) | 646 | no — delta hunk plus context |
| src/utils/base-card.ts | 70-100 (shouldUpdate(), covering the whole delta hunk) | 212 | no — delta hunk plus context |
| docs/specs/03_base_classes.md | delta hunk (row 314, "Missing Configuration") | 316 | no — hunk only |
| tests/utils/base-card.test.ts | delta hunk (TC-CEC-U-20) | 659 | no — hunk only |
| tests/cards/config-error-card.test.ts | delta hunk (IT-CEC-I-06/07/08) | 255 | no — hunk only |

VERDICT: DEPLOY

SURFACES CHECKED:
- src/utils/base-card.ts:82 — the new `if (!this.config) return true;` in `shouldUpdate()` only forces a repaint while no config is set (the setup-banner state). It reads no input and writes no DOM. It removes an uncaught TypeError that every hass push used to throw, so it does not widen the attack surface. The banner it repaints is the fixed `msg('Card setup required: configuration is missing.')` string, which carries no user data.
- src/cards/plugs/sci-fi-plugs.ts:130-135 — the new early return calls `shadowRoot.querySelector('.chart-container')` with a constant selector, so no user-controlled value goes into a selector. It then resets `_chartLoaded` and destroys the chart. Nothing is written to the DOM and nothing is logged. In `this.config?.devices?.[this._selected_plug_id]` (:139) the index is the card's numeric internal state, not a string key taken from input, so no prototype key can be reached. The guard only makes the chart load more often (once more after banner -> card), through the same pre-existing `_loadPowerChart` and `hass.callApi` path, which the same user session calls with ids from the author's config. That path's URL/history call is unchanged by this delta.
- src/cards/weather/sci-fi-weather.ts:178-182 — the code compares the stale chart's canvas with `_chartCanvas` by object identity, then calls `destroy()`. There is no new sink and no logging. The pre-existing `div.innerHTML` (:586) and `console.warn` (:618) are outside the delta and unchanged.
- Untrusted ids in the DOM: the delta adds no new place where an entity id gets rendered. The missing-entity banner path (`_missingIdsLabel` -> `displayId` -> Lit text binding) is untouched and was cleared in round 1.
- Console leakage: grep finds no `console.*` added in the delta. The existing `console.error` calls at base-card.ts:57 and :131 are unchanged.
- DOM sinks: grep finds no `unsafeHTML`, `unsafeSVG` or `innerHTML` added in the three source files.
- Spec row docs/specs/03_base_classes.md:314: a wording-only edit (`, … (+N)`) that now matches FR-4 (at most three ids, then `, … (+N)` with the count of further ids). It has no security impact.
- Tests: TC-CEC-U-20 (hass pushes with config never set do not throw), IT-CEC-I-06 (each card goes banner -> card -> banner on the same element), IT-CEC-I-07 (the plugs chart comes back after its entities reappear) and IT-CEC-I-08 (weather destroys a chart bound to a removed canvas). They use mocked `callApi` and in-memory fixtures, with no secret and no network access.
- Secrets/dependencies: the delta touches no package.json or lockfile and adds no secret, URL or network endpoint.
- Previous round: it had no findings, so nothing needs closing and there is no contested finding to rule on.

FINDINGS: none (critical: 0, high: 0)

NOTES:
- Plugs: if a `_loadPowerChart` call is still in flight when the banner replaces the card, it can still finish and bind a chart to the detached canvas. That is a lifecycle and correctness question for code review, not a security defect: it carries no data across a trust boundary.
- This is a static read of the delta plus surrounding context, and I did not run the tests. The mechanical verdicts are in the packet's checks.txt. The delta has no infrastructure.
