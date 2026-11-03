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

- [MEDIUM] tests/cards/config-error-card.test.ts:105 — the "banner follows the data" promise is never tested on a production card, so any card whose lifecycle keeps state across the banner (the HIGH above) passes green — IT-CEC-I-02 mounts a new element for "empty" and for "one present"; IT-CEC-I-01 (tests/utils/base-card.test.ts) uses `BannerCard`, whose default `getRelevantEntities()` is `[]`, so `shouldUpdate()` always repaints and the FR-5 subset argument (configured ⊂ relevant, so `shouldUpdate` repaints) is not exercised either. FR-5 / TC-CEC-U-09 checks the subset statically only.
  Fix: one transition test per opted-in card on the same element (banner → card → banner) with a real `oldHass`.

- [LOW] src/cards/weather/sci-fi-weather.ts:178 — after the card goes card → banner → card, the forecast chart stays blank until a forecast type/day changes: `updated()` redraws only when `!this._chart`, and `_renderChart()` (line 613-618) updates the existing Chart bound to the canvas Lit removed with the card template; the new `<canvas id="weather-chart">` is never given a chart. Pre-existing for the weather-entity-missing path of `renderCard()`, now also reached by the all-absent banner (FR-5). Fix: destroy/recreate `_chart` when `this._chartCanvas !== this._chart.canvas`.

- [LOW] src/cards/tv/sci-fi-tv.ts:99 — in the very state FR-1 now renders a banner for (config never set, `hass` set), every later `hass` push throws a TypeError out of Lit's update cycle (an uncaught error in the console per push): `shouldUpdate()` (base-card.ts:89) calls `getRelevantEntities()`, which dereferences `this.config.<x>` unguarded. Pre-existing, but FR-1 makes it a delivered state.
  Same cause: src/cards/stove/sci-fi-stove.ts:101, src/cards/vacuum/sci-fi-vacuum.ts:48, src/cards/vehicles/sci-fi-vehicles.ts:46, src/cards/plugs/sci-fi-plugs.ts:56 and :130 (`updated()` reads `this.config.devices`), src/cards/hexa-tiles/sci-fi-hexa-tiles.ts:41. Fix: `if (!this.config) return [];` in `SciFiBaseCard.shouldUpdate` before calling `getRelevantEntities()` (one site), and `this.config?.` in plugs `updated()`.

- [LOW] docs/specs/03_base_classes.md:314 — a reader of the numbered spec is told the banner ends with `, …`, while the code and FR-4 (at most three ids, then `, … (+N)` with the count of further ids) append the count — the amended "Missing Configuration" row writes "trois ids au plus puis `, …`" and drops `(+N)`. Fix: "trois ids au plus puis `, … (+N)`".

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
