# Code review — bridge-unrendered-config — round 1

AUDITOR: subagent
COVERAGE (packet `.sc/review/fedabc6-1777a669`; must_read.txt is empty — no entry point packaged; rows are the diff's product files plus the joins followed):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/bridge/sections/sf-bridge-access.ts | diff + 78-104 + helpers | 224 | partial (all changed hunks + render body) |
| src/cards/bridge/sections/sf-bridge-alerts.ts | diff + 90-135 | 193 | partial (all changed hunks + toggles row) |
| src/cards/bridge/sections/sf-bridge-vehicle.ts | diff hunk | 108 | partial |
| src/cards/bridge/sci-fi-bridge-editor.ts | diff + 636-660 | 946 | partial (all changed hunks + cycle list) |
| src/cards/bridge/styles.ts | diff hunks | 737 | partial |
| src/cards/bridge/config.ts, labels.ts | diff hunks | — | partial |
| xliff/fr.xlf | diff hunks | — | partial |
| docs/specs/cards/bridge.md | diff hunks | 1577 | partial |
| docs/specs/10_card_editors.md | diff hunk | — | partial |
| src/cards/bridge/bridge-call.ts, bridge-toggle.ts | full | — | full (joins) |
| src/utils/base-editor.ts | setConfig/_getNewConfig/_dispatchChange | — | partial (joins) |
| src/components/editor-inputs/sf-editor-input.ts | 60-160 | — | partial (joins) |
| src/locales/locales/fr.js, lit-localize.json, package.json | grep | — | join check |
| tests/cards/bridge/bridge-unrendered-config.test.ts | grep + mutation runs | 489 | partial |

VERDICT: WARNING
SPEC: docs/specs/bridge-unrendered-config/spec.md (and docs/specs/cards/bridge.md FR-7)

FINDINGS:
- [HIGH] xliff/fr.xlf:1196 — a French-locale user sees every new string in English: "Sirens", "Sirens on/off", "Unlock", "Lock", "Locking…", "Unlocking…", "Lock jammed", "Lock unavailable", "Code required", "Door locked/unlocked" and the editor label "Running states (comma-separated)" — the 13 trans-units were added to fr.xlf but the runtime catalogue the bundle actually imports, src/locales/locales/fr.js (git-tracked, output of `npm run localize-build`; `npm run build` is plain rollup and does not regenerate it), was not regenerated. Violates Assumption 6 (the 13 new strings get French translations via the project's extract flow) and docs/specs/10_card_editors.md anti-pattern 11 ("add the entry to xliff/fr.xlf and regenerate src/locales/locales/fr.js with npm run localize-build"). Every earlier lot touching fr.xlf (a1f2025, 61f374a, 1ee101d, 73500af, e2637ce, f7ae9e8) committed fr.js alongside. Reproduced: `grep -c s639d196dba3ed936|s896296f0894907f5|sf3f3d80393e6cb27|sffb4949016e41530 src/locales/locales/fr.js` → 0 for each; the ids themselves are correct (recomputed with `generateMsgId`, all 13 match). Also fr.js still carries the dropped `s383de319c4012f21` (N/A) entry.
  SITES: xliff/fr.xlf:1196-1247 (the 13 added units)
         OUT-OF-DIFF: src/locales/locales/fr.js (not regenerated; must be part of this lot)
  FALSIFIED BY: no test today; a check that every trans-unit id in xliff/fr.xlf appears in src/locales/locales/fr.js (and vice versa) fails on this tree; rendering sf-bridge-alerts under locale `fr` and expecting `.toggle-name` = "Sirènes" fails.
  ROOT: i18n catalogue in step (fr.xlf ⇔ fr.js)
  FIX-CLASS: corrects
  RESOLUTION: fixed — `npm run localize-build` regenerated src/locales/locales/fr.js (13 strings added, stale N/A entry s383de319c4012f21 dropped; sci-fi-stove.ts uses 'N/A' only as a plain literal, never through msg()); the new test file now runs under an English hass and tests/cards/bridge + tests/localization.test.ts pass (305 tests).
- [MEDIUM] src/cards/bridge/sci-fi-bridge-editor.ts:653 — a dashboard whose YAML has a cycle without an `entity` key (which bridge-validate.ts:40 flags but the editor still receives through setConfig) now crashes the whole visual editor render with a TypeError — `cycle.entity.startsWith('sensor.')` dereferences undefined; before this lot the same cycle rendered (`.value="${cycle.entity}"` tolerates undefined). FR-4 (the editor never throws on a malformed cycle value) states the intent for `running_states`; the new guard introduces the same class of throw on `entity`. Fix: `typeof cycle.entity === 'string' && cycle.entity.startsWith('sensor.')`.
  RESOLUTION: fixed — guard `typeof cycle.entity === 'string' && ...` in sci-fi-bridge-editor.ts; proof: TC-BUC-U-12 case "a cycle without an entity key does not throw" in tests/cards/bridge/bridge-unrendered-config.test.ts.
- [MEDIUM] tests/cards/bridge/bridge-unrendered-config.test.ts:356 — three FR-4 (raw typed strings dropped on structural change / external config) clauses can be deleted with the suite green, so a regression that shows one cycle's half-typed text under another cycle, or over a YAML-edited value, would ship unnoticed. Mutants run through a scratch vitest config (transform plugin, tree untouched) against tests/cards/bridge/:
  MUTATION: remove `if (config !== this._lastEmitted) this._runningStatesRaw.clear();` from setConfig in src/cards/bridge/sci-fi-bridge-editor.ts — SURVIVED
  MUTATION: remove `if (leavesSensor) this._runningStatesRaw.delete(i);` from _updateCycle in src/cards/bridge/sci-fi-bridge-editor.ts — SURVIVED
  MUTATION: remove `this._runningStatesRaw.clear();` from _removeCycle in src/cards/bridge/sci-fi-bridge-editor.ts — SURVIVED
  Add a case: type `a,` into cycle 0 (no focusout), then (1) setConfig with a new object holding `running_states: ['x']` → input shows `x`; (2) remove cycle 0 when cycle 1 is a sensor → its input shows its stored value; (3) set entity to `binary_sensor.x` then back to `sensor.a` → input empty.
  RESOLUTION: fixed — three tests added (TC-BUC-U-11 setConfig, TC-BUC-U-11 remove cycle, TC-BUC-U-13 round trip); each of the three mutants re-run by hand now fails the suite (KILLED).
- [LOW] docs/specs/cards/bridge.md:731 — a reader of the alerts layout is told the siren toggle is disabled only when its entity is absent; FR-1 (siren row) and the code (sf-bridge-alerts.ts:100) also disable it on `unavailable` / `unknown` (and line 730 says `.toggle-unknown (entité absente)` only). Add "ou unavailable/unknown" to both lines.
  RESOLUTION: fixed — docs/specs/cards/bridge.md layout lines now say "ou unavailable/unknown"; TC-BUC-U-08 still passes.
- [LOW] docs/specs/cards/bridge.md:819 — the `_toggleLock` reference snippet fills the in-flight set with `this._lockInFlight.add(entity)` and calls no `requestUpdate()`, so code copied from it leaves the button visibly enabled during the call; FR-3 (in-flight guard) requires a Lit-reactive set or `requestUpdate()` on each change. The shipped code (sf-bridge-access.ts:76, 179) does it right with a replaced `@state` set; align the snippet.
  RESOLUTION: fixed — docs/specs/cards/bridge.md _toggleLock snippet replaced with the shipped `_lockPending` replaced-set form; TC-BUC-U-08 still passes.

NOTES:
- MUTATION: drop `&& !codeRequired` from lockUsable in src/cards/bridge/sections/sf-bridge-access.ts — KILLED by TC-BUC-U-09
- MUTATION: drop the `_lockPending.has(entity)` early return in _toggleLock — KILLED by TC-BUC-U-09
- MUTATION: drop the in-flight term from lockUsable — KILLED by TC-BUC-U-09
- MUTATION: drop `next.delete(entity)` in the `after` callback — KILLED by TC-BUC-U-03, TC-BUC-U-09, IT-BUC-I-02
- MUTATION: drop `|| state === 'unknown'` from the siren `unusable` test — KILLED by TC-BUC-U-10
- MUTATION: make _normalizeRunningStates skip requestUpdate — KILLED by TC-BUC-U-11
- MUTATION: keep running_states when leaving sensor.* in _updateCycle — KILLED by TC-BUC-U-13
- In real browsers focusout precedes any click on remove / the entity dropdown / the YAML tab, so the three surviving clauses are mostly belt-and-braces; that lowers impact, not the spec's requirement, hence MEDIUM rather than HIGH.
- FR-6 says no file under tests/ other than the baseline names the removed selectors; the new test file names them because TC-BUC-U-07 must scan for them — an upstream contradiction of the spec, not a code defect.
- docs/specs/10_card_editors.md:284: the +1 bump (182→183, 150→151) matches the single key added to bridgeLabels(). A literal-line count of `'key': msg(` across the 11 dictionaries gives 151 at base and 152 now, so the absolute number may already have been off by one before this lot; the tests derive the count themselves, so this is informational only.
- N/A: no `msg('N/A')` exists in src/ at the base or now (sci-fi-stove.ts uses a plain 'N/A' literal), so dropping the trans-unit is extract-tool hygiene; it stays orphaned in fr.js until the regeneration in the HIGH above.
- Siren uses `bridgeCall` and is tracked by getRelevantEntities (sci-fi-bridge.ts:87) — IT-BUC-I-01 covers re-render.
- Pre-pass: `vitest run tests/cards/bridge tests/styles` → 23 files, 316 tests passed.

CONFORMANCE EVIDENCE:
- FR-1 (siren row): sf-bridge-alerts.ts:55 (placement between smoke and toggles), 93-112 (string guard, warnOnce only when absent, unusable on unavailable/unknown, renderSfToggle reused, no `.siren-row` CSS rule).
- FR-2 (siren click): sf-bridge-alerts.ts:164-173 via bridgeCall, turn_off when on, toasts Sirens off/on.
- FR-3 (lock button): sf-bridge-access.ts:34-65 (class/icon/title mapping incl. lock-pending, lock-jammed, Code required), 101-104 (usable only locked/unlocked, no code_format, not in flight), 151-165 (button, disabled + aria-disabled, title = aria-label), 175-195 (service only from locked/unlocked, guard filled by replacement, released by `after` on success and rejection — bridge-call.ts:44/47). No dialog.
- FR-4 (running_states editor): sci-fi-bridge-editor.ts:653-660 (sensor.* only, focusout), 703-724 (raw kept, never throws on non-array, blank deletes the key via withoutRunningStates), 742-748 (leaving sensor.* deletes key and raw).
- FR-5: sf-bridge-vehicle.ts:72, editor :835/:840, config.ts:99.
- FR-6: styles.ts — three families removed (no remaining reference in src/), .lock-btn/.lock-pending/.lock-jammed added; baseline regenerated.
- FR-7: bridge.md:167, 324, 728-732, 789, 813-824, 1045, 1134-1139.

---

# Code review — bridge-unrendered-config — round 2 (delta)

AUDITOR: subagent
COVERAGE (packet `.sc/review/fedabc6-333e97f4`, delta since round 1; scope = files in delta.txt plus closure of the five round-1 findings):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/cards/bridge.md | delta hunks 727-734, 812-826 | 1578 | partial (both changed hunks; rest unchanged since round 1) |
| src/cards/bridge/sci-fi-bridge-editor.ts | 185-195, 640-665, 700-750 + grep of every `_runningStatesRaw` site | 946 | partial (every FR-4 site and the changed line) |
| src/locales/locales/fr.js | full diff vs HEAD + every id parsed against xliff/fr.xlf | 338 | full (mechanical: 326 ids each side, 0 missing either way) |
| tests/cards/bridge/bridge-unrendered-config.test.ts | 30-45, 342-440 + full test-name list | 529 | partial (every changed hunk and the FR-4 block) |
| src/cards/bridge/sections/sf-bridge-access.ts | 76, 103, 170-195 (join: spec snippet vs shipped code) | — | partial (join) |
| tests/fixtures/mock-hass.ts, tests/sci-fi.test.ts, tests/localization.test.ts | grep (locale default `fr`, catalogue checks) | — | join check |
| docs/reviews/bridge-unrendered-config/* | round-1 report read in full | — | full |

VERDICT: APPROVE
SPEC: docs/specs/bridge-unrendered-config/spec.md (and docs/specs/cards/bridge.md FR-7)

CLOSURE OF ROUND-1 FINDINGS:
- xliff/fr.xlf:1196 (French users saw the 13 new strings in English) — CLOSED, fix verified. src/locales/locales/fr.js now carries all 13 ids (e.g. `sf3f3d80393e6cb27` Sirènes, `s639d196dba3ed936` États en cours…, `s896296f0894907f5` Code requis) and no longer carries `s383de319c4012f21` (N/A). Parity script over both files: 326 trans-unit ids in fr.xlf, 326 keys in fr.js, symmetric difference empty. The fr.js diff vs HEAD is exactly +13/−1, no unrelated churn.
- src/cards/bridge/sci-fi-bridge-editor.ts:653 (a cycle without `entity` crashed the editor) — CLOSED. Guard is `typeof cycle.entity === 'string' && …`; reverting it is killed by the new test (mutation below). The only other entity dereference in the editor, :742 `patch.entity.startsWith`, is behind `patch.entity !== undefined` and the patch always comes from the entity dropdown.
- tests/cards/bridge/bridge-unrendered-config.test.ts:356 (three FR-4 clauses could be deleted with the suite green) — CLOSED; the three standing survivors re-run below, each now KILLED by a distinct test.
- docs/specs/cards/bridge.md:731 (siren disabled-state wording) — CLOSED; lines 730-731 now say "absente ou unavailable/unknown", matching sf-bridge-alerts.ts.
- docs/specs/cards/bridge.md:819 (_toggleLock snippet not Lit-reactive) — CLOSED; snippet now matches sf-bridge-access.ts:175-195 line for line (replaced `@state` set, `after` builds a new set).

MUTATION: remove `if (config !== this._lastEmitted) this._runningStatesRaw.clear();` from setConfig in src/cards/bridge/sci-fi-bridge-editor.ts — KILLED by TC-BUC-U-11: an external setConfig drops the raw typed string (shows the stored value)
MUTATION: remove `if (leavesSensor) this._runningStatesRaw.delete(i);` from _updateCycle in src/cards/bridge/sci-fi-bridge-editor.ts — KILLED by TC-BUC-U-13: leaving sensor.* and coming back shows an empty input, not the old raw string
MUTATION: remove `this._runningStatesRaw.clear();` from _removeCycle in src/cards/bridge/sci-fi-bridge-editor.ts — KILLED by TC-BUC-U-11: removing a cycle does not leak its raw typed string onto the next one
MUTATION: revert the `typeof cycle.entity === 'string' &&` guard at src/cards/bridge/sci-fi-bridge-editor.ts:653 to `cycle.entity.startsWith('sensor.')` — KILLED by TC-BUC-U-12: a cycle without an entity key does not throw and shows no running_states input
(Method: scratch vitest config with a transform plugin, fresh cacheDir per run and fsModuleCache off — the tree was not touched. The vitest 5 module cache otherwise serves the previous transform and makes mutants look survived or killed by the wrong test; a no-mutant control run is green, 300/300, and a run with an absent pattern aborts, so the plugin was proven to apply. The `_removeCycle` mutant targets that method's own `clear()`, not `_addCycle`'s first one.)

FINDINGS:
- [LOW] tests/cards/bridge/bridge-unrendered-config.test.ts:398 — anyone tracing a spec test case to its test is misled: the four tests added this round carry ids whose spec rows describe something else. TC-BUC-U-12 (spec: a string or number `running_states` does not throw) labels the missing-`entity` test at :432; TC-BUC-U-11 (spec: per-keystroke raw string) labels the setConfig test at :398 and the remove-cycle test at :407; TC-BUC-U-13 (spec: leaving sensor.* deletes the key) labels the round-trip test at :419. The behaviours they test are FR-4 (running_states editor) clauses — map cleared on remove and on external setConfig — that have no TC row of their own. Fix: add TC rows for them in docs/specs/bridge-unrendered-config/spec.md (or name them `FR-4:` without a TC id), and relabel the four tests.
  SITES: tests/cards/bridge/bridge-unrendered-config.test.ts:398, :407, :419, :432
  RESOLUTION: fixed — the four titles relabelled `FR-4:` (no test id); suite re-run green.

NOTES:
- hassOf now forces `locale.language: 'en'` (test file :39-40) because the shared mock defaults to `fr` and fr.js now translates the new strings. Correct for assertions written in the source language, but it means no test renders any of the 13 new strings in French, and no test in the repository checks that fr.xlf and fr.js hold the same ids (tests/localization.test.ts checks the runtime only; tests/sci-fi.test.ts:67 checks the static import only). The round-1 HIGH is fixed on this tree; nothing stops it recurring in the next lot that edits fr.xlf. That gap predates this lot, so it is a bead suggestion (an xlf⇔fr.js id-parity test), not a finding here.
- OUT-OF-DIFF: src/cards/bridge/sections/sf-bridge-actions.ts:69, :98 and src/cards/bridge/sections/sf-bridge-appliances.ts:21 dereference `.entity` without a guard, the same class as the round-1 editor crash, on the card side. These are unchanged by this lot, and bridge-validate flags a missing entity upstream. Raise a bead if card robustness on malformed YAML matters.
- FR-4 says the raw map is cleared on "reorder"; the editor has no reorder control, so that clause has nothing to implement yet.
- Pre-pass: `vitest run tests/cards/bridge tests/localization.test.ts` → 18 files, 305 tests passed.

CONFORMANCE EVIDENCE:
- FR-4 (running_states editor, never throws, raw map lifecycle): sci-fi-bridge-editor.ts:192 (external setConfig clears), :727 (add clears), :734 (remove clears), :742-743 (leaving sensor.* drops the raw string and key), :653 (guarded render). Each is pinned by a killing test above.
- Assumption 6 / 10_card_editors anti-pattern 11 (fr catalogue regenerated): src/locales/locales/fr.js diff +13/−1, id parity with xliff/fr.xlf 326/326.
- FR-7 (spec documentation): docs/specs/cards/bridge.md:730-731 (siren disabled states), :815-825 (_toggleLock snippet = sf-bridge-access.ts:175-195).

VERDICT: APPROVE
