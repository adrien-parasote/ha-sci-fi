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
- [MEDIUM] src/cards/bridge/sci-fi-bridge-editor.ts:653 — a dashboard whose YAML has a cycle without an `entity` key (which bridge-validate.ts:40 flags but the editor still receives through setConfig) now crashes the whole visual editor render with a TypeError — `cycle.entity.startsWith('sensor.')` dereferences undefined; before this lot the same cycle rendered (`.value="${cycle.entity}"` tolerates undefined). FR-4 (the editor never throws on a malformed cycle value) states the intent for `running_states`; the new guard introduces the same class of throw on `entity`. Fix: `typeof cycle.entity === 'string' && cycle.entity.startsWith('sensor.')`.
- [MEDIUM] tests/cards/bridge/bridge-unrendered-config.test.ts:356 — three FR-4 (raw typed strings dropped on structural change / external config) clauses can be deleted with the suite green, so a regression that shows one cycle's half-typed text under another cycle, or over a YAML-edited value, would ship unnoticed. Mutants run through a scratch vitest config (transform plugin, tree untouched) against tests/cards/bridge/:
  MUTATION: remove `if (config !== this._lastEmitted) this._runningStatesRaw.clear();` from setConfig in src/cards/bridge/sci-fi-bridge-editor.ts — SURVIVED
  MUTATION: remove `if (leavesSensor) this._runningStatesRaw.delete(i);` from _updateCycle in src/cards/bridge/sci-fi-bridge-editor.ts — SURVIVED
  MUTATION: remove `this._runningStatesRaw.clear();` from _removeCycle in src/cards/bridge/sci-fi-bridge-editor.ts — SURVIVED
  Add a case: type `a,` into cycle 0 (no focusout), then (1) setConfig with a new object holding `running_states: ['x']` → input shows `x`; (2) remove cycle 0 when cycle 1 is a sensor → its input shows its stored value; (3) set entity to `binary_sensor.x` then back to `sensor.a` → input empty.
- [LOW] docs/specs/cards/bridge.md:731 — a reader of the alerts layout is told the siren toggle is disabled only when its entity is absent; FR-1 (siren row) and the code (sf-bridge-alerts.ts:100) also disable it on `unavailable` / `unknown` (and line 730 says `.toggle-unknown (entité absente)` only). Add "ou unavailable/unknown" to both lines.
- [LOW] docs/specs/cards/bridge.md:819 — the `_toggleLock` reference snippet fills the in-flight set with `this._lockInFlight.add(entity)` and calls no `requestUpdate()`, so code copied from it leaves the button visibly enabled during the call; FR-3 (in-flight guard) requires a Lit-reactive set or `requestUpdate()` on each change. The shipped code (sf-bridge-access.ts:76, 179) does it right with a replaced `@state` set; align the snippet.

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
