# Code review — config-error-card (round 1)

AUDITOR: subagent
PACKET: .sc/review/2c5b4a0-b733600e (dirty 2c5b4a0..worktree, 28 files; must_read.txt empty)

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/utils/base-card.ts | 1-210 | 210 | yes |
| src/cards/plugs/sci-fi-plugs.ts | 45-232, 470-580, 630-640 (diff + lifecycle, render, chart load) | 662 | partial (diff hunks and every join of the banner path) |
| src/cards/weather/sci-fi-weather.ts | 140-230, 587-633 (diff + lifecycle + chart) | 639 | partial |
| src/cards/hexa-tiles/sci-fi-hexa-tiles.ts | 24-75 (diff + getRelevantEntities) | 479 | partial |
| src/cards/tv/sci-fi-tv.ts | 89-122 | 608 | partial |
| src/cards/stove/sci-fi-stove.ts | 90-123 | 517 | partial |
| src/cards/vacuum/sci-fi-vacuum.ts | 37-95 | 363 | partial |
| src/cards/vehicles/sci-fi-vehicles.ts | 35-100 | 236 | partial |
| tests/cards/config-error-card.test.ts | 1-200 | 200 | yes |
| tests/utils/base-card.test.ts | diff (+246 lines) | 643 | diff only |
| tests/docs/config-error-card-docs.test.ts | 1-44 | 44 | yes |
| tests/selectors/house.test.ts | diff | 225 | diff only |
| tests/cards/{bridge,plugs,stove,tv}, tests/i18n/surfaces.test.ts | diff | — | diff only |
| docs/specs/config-error-card/spec.md | 1-133 | 133 | yes |
| docs/specs/03_base_classes.md, 02_domain_selectors.md, cards/bridge.md | diff | — | diff only |
| xliff/fr.xlf, src/locales/locales/fr.js | diff | 1391 / 372 | diff only |

PRE-PASS: `tsc --noEmit` exit 0; `eslint` on the 8 touched sources exit 0 (pre-existing warnings only, none on new lines); `vitest run` 125 files / 1520 tests passed, 1 skipped.

VERDICT: WARNING
SPEC: docs/specs/config-error-card/spec.md

FINDINGS:
- [HIGH] src/cards/plugs/sci-fi-plugs.ts:128 — a plugs card whose entities are all absent on its first `hass` (HA restart while the integration is still loading, or a renamed entity the user then fixes) never draws its 24 h power chart after the entities come back; on a single-plug dashboard the chart is gone for the card's lifetime — the new banner path (base-card.ts:123-124) replaces `renderCard()` while `updated()` still runs its one-shot "initial load": `_chartLoaded` is set true (line 134), history is fetched, `_drawChart` finds no `.chart-container` (line 577 returns) and the data is cached; when the card reappears `isInitialLoad` is false, so nothing redraws. Violates FR-5 (the banner follows the data: when a missing entity reappears the next render shows the card) — the card comes back amputated.
  Reproduced (scratch test, worktree code): mount plugs with `devices:[{entity_id:'switch.p1', sensors:{'sensor.p1_power':{power:true}}}]`, `hass.states` empty → banner, `callApi` called 1×, `_chartLoaded=true`; then `hass` with both entities → `.chart-container` present, `canvas` absent, `callApi` 0 more calls, `_chart` null → assertion `expected null not to be null`. Control (entities present from the start) passes: canvas drawn.
  SITES: src/cards/plugs/sci-fi-plugs.ts:128-136 (the latch set while the chart container is not rendered)
    src/utils/base-card.ts:123-125 (the banner path that skips `renderCard()` with no signal to the subclass lifecycle)
  FALSIFIED BY: a new IT-CEC-I-0x test on the SAME plugs element: all entities absent (banner) → `hass` replaced with the entities present → `.chart-container canvas` exists (or `callApi` invoked after reappearance). IT-CEC-I-02 mounts a fresh element per state and IT-CEC-I-01 uses a test subclass, so no current test crosses the transition on a real card.
  ROOT: FR-5
  FIX-CLASS: corrects (e.g. do not latch `_chartLoaded` when `.chart-container` is not in the shadow root, or reset the latch when the banner was shown)
  RESOLUTION: fixed — plugs `updated()` returns early, resetting `_chartLoaded` and destroying the stale chart, while no `.chart-container` exists; IT-CEC-I-07 (same element banner -> present -> banner -> present, canvas drawn each time) fails without the guard

- [MEDIUM] tests/cards/config-error-card.test.ts:105 — the "banner follows the data" promise is never tested on a production card, so any card whose lifecycle keeps state across the banner (the HIGH above) passes green — IT-CEC-I-02 mounts a new element for "empty" and for "one present"; IT-CEC-I-01 (tests/utils/base-card.test.ts) uses `BannerCard`, whose default `getRelevantEntities()` is `[]`, so `shouldUpdate()` always repaints and the FR-5 subset argument (configured ⊂ relevant, so `shouldUpdate` repaints) is not exercised either. FR-5 / TC-CEC-U-09 checks the subset statically only.
  Fix: one transition test per opted-in card on the same element (banner → card → banner) with a real `oldHass`.
  RESOLUTION: fixed — IT-CEC-I-06, one same-element banner -> card -> banner test per opted-in card (7), real oldHass

- [LOW] src/cards/weather/sci-fi-weather.ts:178 — after the card goes card → banner → card, the forecast chart stays blank until a forecast type/day changes: `updated()` redraws only when `!this._chart`, and `_renderChart()` (line 613-618) updates the existing Chart bound to the canvas Lit removed with the card template; the new `<canvas id="weather-chart">` is never given a chart. Pre-existing for the weather-entity-missing path of `renderCard()`, now also reached by the all-absent banner (FR-5). Fix: destroy/recreate `_chart` when `this._chartCanvas !== this._chart.canvas`.
  RESOLUTION: fixed — weather `updated()` destroys a chart whose canvas is no longer `_chartCanvas`, so the existing `!this._chart` path recreates it; IT-CEC-I-08 fails without it

- [LOW] src/cards/tv/sci-fi-tv.ts:99 — in the very state FR-1 now renders a banner for (config never set, `hass` set), every later `hass` push throws a TypeError out of Lit's update cycle (an uncaught error in the console per push): `shouldUpdate()` (base-card.ts:89) calls `getRelevantEntities()`, which dereferences `this.config.<x>` unguarded. Pre-existing, but FR-1 makes it a delivered state.
  Same cause: src/cards/stove/sci-fi-stove.ts:101, src/cards/vacuum/sci-fi-vacuum.ts:48, src/cards/vehicles/sci-fi-vehicles.ts:46, src/cards/plugs/sci-fi-plugs.ts:56 and :130 (`updated()` reads `this.config.devices`), src/cards/hexa-tiles/sci-fi-hexa-tiles.ts:41. Fix: `if (!this.config) return [];` in `SciFiBaseCard.shouldUpdate` before calling `getRelevantEntities()` (one site), and `this.config?.` in plugs `updated()`.
  RESOLUTION: fixed — `if (!this.config) return true;` in `SciFiBaseCard.shouldUpdate` (so the setup banner still repaints) and `this.config?.` in plugs `updated()`; TC-CEC-U-20 fails without the guard

- [LOW] docs/specs/03_base_classes.md:314 — a reader of the numbered spec is told the banner ends with `, …`, while the code and FR-4 (at most three ids, then `, … (+N)` with the count of further ids) append the count — the amended "Missing Configuration" row writes "trois ids au plus puis `, …`" and drops `(+N)`. Fix: "trois ids au plus puis `, … (+N)`".
  RESOLUTION: fixed — docs/specs/03_base_classes.md row now ends `, … (+N)`; tests/docs/config-error-card-docs.test.ts guard stays green

NOTES:
- `msg(str\`Entity not found: ${…}\`)` puts `this._missingIdsLabel()` in the xliff `equiv-text`; harmless, generated by localize-extract.
- `getConfiguredEntities()` is evaluated three times per render (`_configuredIds` twice via `getMissingEntities`, plus `_missingIdsLabel`); lists are tiny, no measurable cost.
- Card picker previews built from `getStubConfig()` ids that do not exist in the user's HA (e.g. `media_player.bravia_4k_vh22`, `vacuum.robot`) will now show the `Entity not found` banner instead of the old placeholder rendering — consistent with FR-4/FR-10 (supersede), not a defect.
- The banner also flashes during an HA restart while integrations load (all configured entities briefly absent); the spec chose all-absent with no grace period (D2), so it is the specified behaviour.

MUTATION: base-card.ts getMissingEntities own-property test removed (`!Object.prototype.hasOwnProperty.call(states, id) || ` deleted) — KILLED by TC-CEC-U-13
MUTATION: base-card.ts render guard `configured.length > 0 && ` removed — KILLED by TC-CEC-U-05
MUTATION: base-card.ts `_missingIdsLabel` display transform `.map(displayId)` removed — KILLED by TC-CEC-U-14

## Cannot verify from this diff
- FR-8 "`npm run localize-extract` then `localize-build` run": the regenerated `fr.js` hunk and the xliff units are consistent (ids `se09cd21852af1fb7`, `s8adbb8549b19efd5`, `<x id="0"/>` in the target), but the run itself is not visible.

CONFORMANCE EVIDENCE:
- FR-1 (render order: no hass → nothing; no config → setup banner; entity rule inside the try) → src/utils/base-card.ts:119-133
- FR-2 (Lit text binding, role/aria-hidden only) → src/utils/base-card.ts:174-183
- FR-3 (two protected hooks, default `[]`, configured order, dedupe/empty/non-string dropped) → src/utils/base-card.ts:142-159; TC-CEC-U-09 checks no override of `render`/`getMissingEntities`
- Definitions (own-property absence, null/non-object states = no info) → src/utils/base-card.ts:148-152
- FR-4 (three ids, `, … (+N)`, control/bidi strip, 64 code points with `…`) → src/utils/base-card.ts:23-30, 162-167
- FR-6 (seven cards; weather/hexa configured-only, hexa weather ids only when activated) → sci-fi-weather.ts:147-151, sci-fi-hexa-tiles.ts:31-36, plugs/stove/tv/vacuum/vehicles one-line overrides
- FR-7 (no console in selectors) → tests/selectors/house.test.ts TC-CEC-U-10 scan
- FR-8 → xliff/fr.xlf:1381-1388, src/locales/locales/fr.js:218, 326
- FR-9 → docs/specs/02_domain_selectors.md Error Handling block and row; 03_base_classes.md row (see LOW above)

## Review Summary
| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 1 |
| LOW | 3 |

VERDICT: WARNING

# Code review — config-error-card (round 2, delta)

AUDITOR: subagent
PACKET: .sc/review/2c5b4a0-047338cf (delta since round 1; scope = delta.txt + closure of the 5 round-1 findings)

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/utils/base-card.ts | 1-212 | 212 | yes |
| src/cards/plugs/sci-fi-plugs.ts | 45-240, 450-600, 630-640 | 671 | partial (delta hunk + every join of the chart lifecycle: latch, cache, draw, empty-state) |
| src/cards/weather/sci-fi-weather.ts | 105-200, 405-485, 594-626 | 646 | partial (delta hunk + every `_chart` read/write site) |
| tests/cards/config-error-card.test.ts | 1-255 | 255 | yes |
| tests/utils/base-card.test.ts | 632-650 (delta: TC-CEC-U-20) | 659 | delta only |
| docs/specs/03_base_classes.md | 160-200, 311-316 | 316 | partial (delta row + the sealed `shouldUpdate()` contract the delta changes) |
| docs/specs/config-error-card/spec.md | grep FR-5, test table | 133 | partial (not in delta; read for FR-5 clause) |
| docs/reviews/config-error-card/* | previous report + RESOLUTION lines | — | yes |

PRE-PASS: `vitest run tests/cards/config-error-card.test.ts tests/utils/base-card.test.ts tests/cards/plugs tests/cards/weather` exit 0, 11 files / 181 tests passed. Mutations run on a scratch copy of the worktree (repository untouched), same suites.

VERDICT: WARNING
SPEC: docs/specs/config-error-card/spec.md

CLOSURE OF ROUND 1:
- F1 [HIGH] plugs chart latch (ROOT FR-5, the banner follows the data) — CLOSED. src/cards/plugs/sci-fi-plugs.ts:130-135 resets `_chartLoaded`, destroys `_chart` and returns while no `.chart-container` exists; on reappearance `hass` is in changedProperties, so `isInitialLoad` (line 137) fires and `_loadPowerChart` replays the cache (line 492-499). IT-CEC-I-07 (tests/cards/config-error-card.test.ts:217) fails with the guard disabled or the latch reset removed (mutants below). Regression check asked by the orchestrator: the early return also skips `plugChanged`, but `.chart-container` is absent only for the banner, the render-error card, or `devices: []` (`<ha-card></ha-card>`, line 153) — no plug to load in any of them, and the reset latch makes the next shown card load. No regression found there; see the new LOW on the cache-replay path below.
- F2 [MEDIUM] no same-element transition test — CLOSED. IT-CEC-I-06 (line 202) runs banner -> card -> banner on one element per opted-in card (7) with real oldHass, so the FR-5 subset argument through `shouldUpdate()` is now exercised.
- F3 [LOW] weather stale chart — CLOSED. src/cards/weather/sci-fi-weather.ts:179-182 destroys a chart whose `canvas` is not the current `@query('#weather-chart')` (uncached query, so it is re-read each time); `!this._chart` (line 184) then recreates it. The render-time in-place updates (lines 416-420, 476-480) touch the stale chart only before `updated()` replaces it — harmless. IT-CEC-I-08 kills the guard mutant (it fakes the stale chart rather than crossing the banner; acceptable as a unit test of the guard).
- F4 [LOW] TypeError from `getRelevantEntities()` without config — CLOSED. src/utils/base-card.ts:82 `if (!this.config) return true;` sits after the multi-property branch and before any `getRelevantEntities()` call; plugs `updated()` uses `this.config?.devices` (line 140). TC-CEC-U-20 fails without the guard. Regression check: returning `true` keeps the pre-lot outcome for every no-config path (the old code reached the final `return true` for empty changedProps, and threw otherwise). But the spec was not amended for it — see the LOW on docs/specs/03_base_classes.md below.
- F5 [LOW] 03_base_classes.md row without `(+N)` — CLOSED. docs/specs/03_base_classes.md:314 now ends `trois ids au plus puis `, … (+N)``.

FINDINGS:
- [LOW] src/cards/plugs/sci-fi-plugs.ts:493 — after card -> banner -> card, a plug with no power history in the last 24 h shows an empty bar chart instead of "No power data to display", and any plug shows the data cached before the banner — the round-1 fix brings the card back through the cache-replay branch of `_loadPowerChart` (lines 492-499), which draws from `_chart_generation[idx]` but never re-applies the empty-state handling the fetch branch applies (lines 511-519: message text and `.chart-container` `display:none`). The new DOM has an empty `.msg-container` and a visible container. Before this lot that branch was close to unreachable, because plug navigation clears the cache first (`_clearChart`, lines 453/459/480-484). Violates the plugs card's error table (docs/specs/cards/plugs.md:886, no power data: message shown, chart hidden). Fix: on replay, store and re-apply the empty state (or drop the cache entry when the banner resets the latch, so reappearance refetches).
  RESOLUTION: fixed — plugs `_showChartState()` re-applies the empty-state message and container visibility on a cache replay; IT-CEC-I-07 (empty history, banner -> card, message and hidden container, one `callApi`)
- [LOW] tests/cards/config-error-card.test.ts:217 — removing the destroy of the stale chart from the plugs banner reset (sci-fi-plugs.ts:132-133) breaks the chart in a real browser and no test notices. Without it, `_chart` stays bound to the removed canvas, the cache replay calls `_updateChart` on it, and the new `.chart-container` gets no canvas. IT-CEC-I-07 only asserts that a `canvas` element exists. Under happy-dom `getContext('2d')` returns null, so `_drawChart` (line 584-595) appends the canvas and returns before `new Chart`, and `_chart` is never non-null in this test. The round-1 RESOLUTION's "canvas drawn each time" is therefore proven for the element only, not for a chart. Fix: in IT-CEC-I-07, seed `el['_chart']` with a stub carrying `destroy` (as IT-CEC-I-08 does for weather) before the card -> banner step, and assert that `destroy` was called and that `_chart` is not the stub after reappearance.
  RESOLUTION: fixed — IT-CEC-I-07 seeds a stub `_chart` before the banner step and asserts `destroy` called once and `_chart` null; the destroy-removal mutant dies
- [LOW] tests/utils/base-card.test.ts:635 — a later edit that turns the no-config guard into `return false` would leave the setup banner in the previous language after a language change, and stay green. TC-CEC-U-20 only checks that the banner text stays the same across a `hass` push, and the banner would stay the same even with no repaint. The `true` matters because `updateWhenLocaleChanges` calls `requestUpdate()` with empty changedProps, which now reaches the guard at base-card.ts:82. Fix: switch locale (or assert that `shouldUpdate(new Map([['hass', old]]))` is `true` when there is no config) and check the repaint.
  RESOLUTION: fixed — TC-CEC-U-20 now asserts `shouldUpdate(new Map([['hass', old]]))` is `true` with a language-only change and no config; the `return false` mutant dies
- [LOW] docs/specs/03_base_classes.md:171 — a reader of the sealed `shouldUpdate()` contract, and of FR-5 (the banner follows the data), is told something the code no longer does. FR-5 in docs/specs/config-error-card/spec.md:38 states "`shouldUpdate()` is NOT changed by this lot", and 03_base_classes.md:173-190 lists the five `true` branches and says that "Il rend `false` dans un seul cas". The round-1 fix added a branch (base-card.ts:82, no config -> `true`) that neither text records. The new test ids TC-CEC-U-20 and IT-CEC-I-06/07/08 are also absent from the spec's test table. The behaviour is correct, but the spec is the source of truth (Golden Rule). Fix: amend FR-5 and the 03_base_classes.md branch list (a no-config branch before branch 2), and add the four test rows.
  RESOLUTION: fixed — spec.md FR-5 amended, the 03_base_classes.md `shouldUpdate()` list gains the no-config branch, TC-CEC-U-20 and IT-CEC-I-06/07/08 rows added to the test table
  SITES: docs/specs/03_base_classes.md:171-190
    docs/specs/config-error-card/spec.md:38
    docs/specs/config-error-card/spec.md test table (lines ~80-95)

NOTES:
- The cache in `_chart_generation` is never time-invalidated (the comment at sci-fi-plugs.ts:491 says so), and the plugs JSDoc (lines 100-119) leaves the latch-before-call defect to bead ha-sci-fi-8ap. Neither changes in this delta.
- The setup banner repaints on every `hass` push while config is missing. That costs a negligible template diff, and it is the pre-lot behaviour.
- IT-CEC-I-08 checks the weather guard by injecting a stale chart instead of crossing the banner. It kills the mutant and needs no canvas support, so it is adequate.

MUTATION: plugs updated() chart-container guard disabled (`if (!this.shadowRoot?.querySelector('.chart-container')) {` -> `if (false) {`) — KILLED by IT-CEC-I-07
MUTATION: plugs banner reset `this._chartLoaded = false;` removed — KILLED by IT-CEC-I-07
MUTATION: plugs banner reset `this._chart?.destroy(); this._chart = null;` removed — SURVIVED
MUTATION: weather stale-canvas guard disabled (`if (this._chart && this._chartCanvas && this._chart.canvas !== this._chartCanvas) {` -> `if (false) {`) — KILLED by IT-CEC-I-08
MUTATION: base-card shouldUpdate `if (!this.config) return true;` removed — KILLED by TC-CEC-U-20
MUTATION: base-card shouldUpdate `if (!this.config) return true;` -> `return false;` — SURVIVED

CONFORMANCE EVIDENCE:
- FR-5 (banner follows the data, same element) -> src/cards/plugs/sci-fi-plugs.ts:130-145, src/cards/weather/sci-fi-weather.ts:179-192, tests/cards/config-error-card.test.ts:202-255
- FR-1 (no config + hass -> setup banner, no throw on later pushes) -> src/utils/base-card.ts:82, 121; tests/utils/base-card.test.ts:635
- FR-4 doc row -> docs/specs/03_base_classes.md:314

## Review Summary
| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 4 |

Round-1 findings closed: 5 / 5. Two new mutants SURVIVED; they are named in the two test LOW findings above.

VERDICT: WARNING

# Code review — config-error-card (round 3, delta)

AUDITOR: subagent
PACKET: .sc/review/2c5b4a0-feb1012c (delta since round 2; scope = delta.txt + closure of the 4 round-2 findings and the 2 round-2 survivors)

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/03_base_classes.md | 165-195 (delta hunk + the whole `shouldUpdate()` branch list and its `false` case) | 319 | partial (delta + its section) |
| src/cards/plugs/sci-fi-plugs.ts | 120-160, 440-620 (delta hunk + `updated()` banner reset, `_clearChart`, `_showChartState`, `_loadPowerChart`, `_parseHistory`, `_drawChart`) | 678 | partial (delta + every join of the chart state) |
| src/utils/base-card.ts | 70-100 (the guard the delta's test exercises) | 212 | partial (not in delta) |
| tests/utils/base-card.test.ts | delta hunk (TC-CEC-U-20) | 663 | delta only |
| tests/cards/config-error-card.test.ts | delta hunks (IT-CEC-I-07 x2) + test-id grep | 280 | delta only |
| docs/specs/config-error-card/spec.md | delta hunks (FR-5, test table rows 97-100) | 137 | delta only |
| docs/reviews/config-error-card/* | previous report, RESOLUTION lines, history copies | — | yes |

PRE-PASS: on a scratch copy of the worktree (repository untouched), `vitest run tests/cards/config-error-card.test.ts tests/utils/base-card.test.ts tests/cards/plugs tests/cards/weather` exit 0, 11 files / 182 tests passed. Mutations below run against that copy, each restored in the scratch copy only.

SPEC: docs/specs/config-error-card/spec.md

CLOSURE OF ROUND 2:
- R2-F1 [LOW] plugs cache replay lost the empty-history state — CLOSED. src/cards/plugs/sci-fi-plugs.ts:488-493 factors `_showChartState(hasData)`; the cache branch calls it with `cache.labels.length > 0` (line 502) and the fetch branch with `Object.keys(history).length > 0` (line 520). `labels` is `Object.keys(history)` mapped one-to-one (`_buildChartLabels`), so both predicates agree. The new IT-CEC-I-07 empty-history test (tests/cards/config-error-card.test.ts:247) checks the message, the hidden container and a single `callApi` after banner -> card. It kills the removal of the replay call and a constant `true` on either call (mutants below). Side benefit: a fetch that resolves while the banner is up stores the cache and the next shown card replays the right state.
- R2-F2 [LOW] destroy of the stale plugs chart untested — CLOSED. IT-CEC-I-07 (tests/cards/config-error-card.test.ts:231-239) seeds a stub `_chart` before the banner step and asserts `destroy` called once and `_chart` null; the survivor is now killed.
- R2-F3 [LOW] TC-CEC-U-20 could not tell `return true` from `return false` — CLOSED. tests/utils/base-card.test.ts:649-652 calls `shouldUpdate(new Map([['hass', old]]))` with a language-only change and no config and expects `true`; the survivor is now killed.
- R2-F4 [LOW] spec silent on the no-config branch — CLOSED. docs/specs/config-error-card/spec.md:38 FR-5 now says `shouldUpdate()` gains the `!this.config` guard; docs/specs/03_base_classes.md:186-188 adds the branch; spec.md:97-100 adds the TC-CEC-U-20 and IT-CEC-I-06/07/08 rows, and each id exists in the tests. One residual wording gap in the 03 list, below.

FINDINGS:
- [LOW] docs/specs/03_base_classes.md:174 — someone reading the sealed `shouldUpdate()` contract gets an evaluation order the code does not follow, and a `false` condition with one clause missing. The list opens with « dans ces cas et dans cet ordre », but the new branch is numbered 5 while it runs second (base-card.ts:82); only a parenthesis corrects the order. The `false` paragraph (lines 193-195) still lists its conditions without « `config` présent », although with no config the code returns `true` before that case can be reached. Fix: renumber the no-config branch as 2 (shifting 2-4 to 3-5, and « seule la branche 4 » to 5), and add « la config est là » to the `false` sentence.
  RESOLUTION: fixed — docs/specs/03_base_classes.md: no-config branch renumbered 2 (others 3-6, « branche 5 » refuses), `false` sentence now says « `config` est présent »; guarded by tests/docs and full suite run.

NOTES:
- tests/cards/config-error-card.test.ts:217 and :247 carry the same id IT-CEC-I-07, and the spec row at spec.md:99 covers both. The traceability holds; it is a naming choice.
- The cache replay calls `_updateChart` on an existing chart with empty labels when the history is empty. That code predates the lot, and the container is hidden anyway.

MUTATION: plugs banner reset `this._chart?.destroy(); this._chart = null;` removed — KILLED by IT-CEC-I-07
MUTATION: base-card shouldUpdate `if (!this.config) return true;` -> `return false;` — KILLED by TC-CEC-U-20
MUTATION: plugs cache replay `this._showChartState(cache.labels.length > 0);` removed — KILLED by IT-CEC-I-07
MUTATION: plugs cache replay `this._showChartState(cache.labels.length > 0);` -> `this._showChartState(true);` — KILLED by IT-CEC-I-07
MUTATION: plugs fetch `this._showChartState(Object.keys(history).length > 0);` -> `this._showChartState(true);` — KILLED by IT-CEC-I-07

CONFORMANCE EVIDENCE:
- FR-5 (the banner follows the data; plugs card comes back whole: chart, or the empty-history message) -> src/cards/plugs/sci-fi-plugs.ts:130-135, 488-493, 500-507, 520; tests/cards/config-error-card.test.ts:217-266
- FR-1 / FR-5 (no-config guard repaints, never throws) -> src/utils/base-card.ts:82; tests/utils/base-card.test.ts:635-653
- Spec of record -> docs/specs/config-error-card/spec.md:38, 97-100; docs/specs/03_base_classes.md:186-188

## Review Summary
| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 1 |

Round-2 findings closed: 4 / 4. Both round-2 survivors are now KILLED. No mutant survives.

VERDICT: APPROVE
