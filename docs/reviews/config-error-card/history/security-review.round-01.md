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
