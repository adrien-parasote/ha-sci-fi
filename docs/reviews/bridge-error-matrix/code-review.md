# Code review — bridge-error-matrix (round 1)

AUDITOR: subagent
PACKET: .sc/review/c7ccbeb-3723059c (dirty, base c7ccbeb, 25 files)

COVERAGE (must_read.txt is empty — no entry point packaged; rows below are the code in scope):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/bridge/bridge-warn.ts | 1-47 | 47 | yes |
| src/cards/bridge/bridge-toggle.ts | 1-22 | 22 | yes |
| src/cards/bridge/bridge-validate.ts | 1-90 | 90 | yes |
| src/cards/bridge/sci-fi-bridge.ts | 1-247 | 247 | yes |
| src/cards/bridge/sections/sf-bridge-alerts.ts | 1-159 (diff + 30-64) | 159 | yes (diff hunks + all render paths) |
| src/cards/bridge/sections/sf-bridge-automations.ts | diff + 36-176 | 176 | yes |
| src/cards/bridge/sections/sf-bridge-access.ts | diff + 15-35 | 160 | partial (diff hunks + helpers; handlers unchanged) |
| src/cards/bridge/sections/sf-bridge-actions.ts | diff hunks | 125 | partial (diff hunks) |
| src/cards/bridge/sections/sf-bridge-appliances.ts | diff + 18-58 | 109 | yes |
| src/cards/bridge/sections/sf-bridge-crew.ts | diff hunks | 136 | partial (diff hunks) |
| src/cards/bridge/sections/sf-bridge-stove.ts | diff hunks | 141 | partial (whole render via diff) |
| src/cards/bridge/sections/sf-bridge-vehicle.ts | 38-109 + diff | 109 | yes |
| src/cards/bridge/styles.ts | diff hunks | 777 | partial (diff hunks) |
| src/utils/base-card.ts (join, out of diff) | 1-140 | — | setConfig/render/shouldUpdate read |
| tests/cards/bridge/bridge-error-matrix.test.ts | 1-626 | 626 | yes |
| tests/cards/bridge/bridge-warn.test.ts | 1-45 | 45 | yes |
| tests/cards/bridge/bridge_validate.test.ts | 1-34 | 34 | yes |
| tests/cards/bridge/sections/sf-bridge-actions.test.ts | diff hunks | 280 | partial |
| tests/cards/bridge/sections/sf-bridge-appliances.test.ts | diff hunks | 246 | partial |
| docs/specs/bridge-error-matrix/spec.md | 1-145 | 145 | yes |
| docs/specs/cards/bridge.md | diff hunks (§ stove WARNING, § vehicle, § Error Handling Matrix) | 1567 | partial (FR-9 sections) |

VERDICT: WARNING
SPEC: docs/specs/bridge-error-matrix/spec.md

Pre-pass (run by the reviewer): `vitest run tests/cards/bridge tests/styles` 300/300 green; `tsc --noEmit` exit 0; `eslint src/cards/bridge tests/cards/bridge` exit 0 (21 warnings, none on new lines of this lot except pre-existing `any`).

FINDINGS:
- [HIGH] src/cards/bridge/sections/sf-bridge-alerts.ts:112 — a toggle over an absent entity can silently regress to the "off" look and nobody will know: the FR-6 (absent-entity rendering per section) toggle row requires the name class `toggle-unknown` (neither `toggle-on` nor `toggle-off`), and no test asserts it; replacing `'toggle-unknown'` by `'toggle-off'` in either section leaves the whole suite green (mutations below). TC-BEM-U-05 (absent toggles) checks only `disabled` / `aria-disabled`.
  SITES: src/cards/bridge/sections/sf-bridge-alerts.ts:112 (`toggle-name ${absent ? 'toggle-unknown' …}`)
         src/cards/bridge/sections/sf-bridge-automations.ts:83 (`auto-name ${absent ? 'toggle-unknown' …}`)
  FALSIFIED BY: TC-BEM-U-05 extended to assert, for BOTH `sf-bridge-alerts` and `sf-bridge-automations`, that the name span has class `toggle-unknown`, has neither `toggle-on` nor `toggle-off`, and that the button carries `data-on="false"` — a fix covering only alerts leaves the automations mutant alive.
  ROOT: FR-6
  FIX-CLASS: corrects
  Reproduced: mutation harness (vite transform plugin, fs module cache disabled) — see MUTATION lines; sanity mutant `'smoke-unknown'`→`'smoke-ok'` was KILLED by TC-BEM-U-08, proving the harness applies.
  RESOLUTION: fixed — TC-BEM-U-05 asserts toggle-unknown/data-on for both sections; both mutants killed (tests/cards/bridge/bridge-error-matrix.test.ts)

- [MEDIUM] docs/specs/cards/bridge.md:1044 — a reader of the vehicle section still believes only NaN triggers the placeholder, while the code also blanks `Infinity` and negative power: FR-9 (bridge.md states the lot's behaviour) requires "the two NaN rows and the vehicle NOTE read `Number.isFinite` and `>= 0` (not `isNaN`)"; the two matrix rows do, the added vehicle NOTE says "`power` NaN" only. TC-BEM-U-07 (bridge.md check) does not read the NOTE, so the gap is unpinned.
  Fix: NOTE reads "Capteur absent, ou `power` non fini (`!Number.isFinite`) ou `< 0`"; add the NOTE to TC-BEM-U-07's vehicle-slice assertions (`Number.isFinite`).
  RESOLUTION: fixed — vehicle NOTE states Number.isFinite / < 0; TC-BEM-U-07 asserts it (tests/cards/bridge/bridge-error-matrix.test.ts)

- [LOW] src/cards/bridge/sections/sf-bridge-actions.ts:95 — an untested guard: `_trigger` returns early for an absent entity, but its only caller is a button that is already `disabled` for that case, so the branch is unreachable from the UI and no test reaches it (mutant removing it survives). Either delete it (the `disabled` attribute is FR-6.2's mechanism) or pin it with a test calling `_trigger` directly.
  RESOLUTION: fixed — guard removed; TC-BEM-U-09 and tests/cards/bridge/sections/sf-bridge-actions.test.ts green

- [LOW] src/cards/bridge/sections/sf-bridge-appliances.ts:72 — dead condition: `running && !absent` — `isCycleRunning` already returns false when `stateObj` is undefined (sf-bridge-appliances.ts:19), so `!absent` never changes the colour; it suggests a case that does not exist. Drop `&& !absent`.
  RESOLUTION: fixed — `&& !absent` dropped; tests/cards/bridge/sections/sf-bridge-appliances.test.ts asserts .cycle-status.unknown

MUTATION: sf-bridge-alerts.ts `absent ? 'toggle-unknown'` → `absent ? 'toggle-off'` — SURVIVED
MUTATION: sf-bridge-automations.ts `absent ? 'toggle-unknown'` → `absent ? 'toggle-off'` — SURVIVED
MUTATION: sf-bridge-actions.ts `_trigger` guard `|| this.hass.states[item.entity] === undefined` removed — SURVIVED
MUTATION: sf-bridge-access.ts cover buttons `?disabled="${absent}"` removed — KILLED by TC-BEM-U-04
MUTATION: sf-bridge-crew.ts `warnOnce('not-found', p.entity)` removed — KILLED by TC-BEM-U-05
MUTATION: sci-fi-bridge.ts `resetBridgeWarnings()` removed from setConfig — KILLED by IT-BEM-I-02
MUTATION: bridge-validate.ts access lock string check disabled — KILLED by TC-BEM-U-12
MUTATION: sf-bridge-automations.ts `_onSliderInput` absent guard removed — KILLED by TC-BEM-U-13
MUTATION: bridge-warn.ts `Number.isFinite(n) && n >= 0` → `!isNaN(n)` — KILLED by TC-BEM-U-10
MUTATION: sci-fi-bridge.ts `this._configError = null` removed — KILLED by IT-BEM-I-03

NOTES:
- `renderSfToggle` (src/cards/bridge/bridge-toggle.ts:15) now emits `aria-disabled="false"` on a PRESENT entity's toggle; FR-6.2 says present rendering is unchanged — an explicit `false` is semantically neutral for assistive tech, not judged a defect.
- `access.items[].lock: ''` renders no lock indicator rather than the absent state (sf-bridge-access.ts:97-100); the Definitions say an empty id "renders as absent", but `lock` is optional and the editor does not seed it, so empty reads as "no lock". Spec does not pin this case.
- Slider over an absent entity binds `.value="0"` (rawValue from the `'0'` fallback), not `min`; the range input clamps to `min`, so TC-BEM-U-04's `value = min` holds in happy-dom and browsers. Pre-existing fallback.
- The `N/A` trans-unit in `xliff/fr.xlf` is now orphaned by the vehicle change (no `msg('N/A')` left in src); lit-localize extract drops it — housekeeping only.
- The warn Set is module-global (FR-1 says so): one bridge card's `setConfig` re-arms warnings for every bridge card on the dashboard — consistent with the spec.
- Reviewer side effect: the first mutation runs went through vitest's default fs module cache (`node_modules/.vitest-cache`, untracked) before it was disabled for the harness; a plain `vitest run tests/cards/bridge` afterwards was green 280/280, so no contamination was observed. Clear that cache if a later run behaves oddly.

## ⚠️ Cannot verify from this diff
- none — every new helper has a production consumer (warnOnce: 7 sections; readSlotOrWarn: stove, vehicle; validateBridgeConfig + resetBridgeWarnings: sci-fi-bridge.ts:50-51; renderSfToggle: alerts, automations).

CONFORMANCE EVIDENCE:
- FR-1 → src/cards/bridge/bridge-warn.ts:20-26 (non-empty string guard, `reason:id` key, id second arg), :38-46 (readSlotOrWarn, finite and >= 0)
- FR-2 → src/cards/bridge/sci-fi-bridge.ts:50 (reset on every call, before validation)
- FR-3/FR-4 → src/cards/bridge/sections/sf-bridge-stove.ts:61-68, 96-130 (placeholders `-- %`, `--`, bars hidden)
- FR-5 → src/cards/bridge/sections/sf-bridge-vehicle.ts:43-60 (`-- W`, `msg('Unavailable')`, plugIcon unavailable)
- FR-6/6.2 → alerts.ts:66-75,98-113,122-136; appliances.ts:62-76,91-97; stove.ts:76-95; access.ts:61-122; automations.ts:69-84,91-113,133; actions.ts:72-80
- FR-8/FR-11 → src/cards/bridge/bridge-validate.ts:77-90 (rule order, path-and-type messages only); sci-fi-bridge.ts:57-59,128-137 (console.error once, placeholder config, bridge-local error card); base-card.ts untouched
- FR-10 → bridge-call.ts not in diff; IT-BEM-I-04 green

RESOLUTION (round 1, orchestrator):
- [HIGH] sf-bridge-alerts.ts:112 / sf-bridge-automations.ts:83 — RESOLUTION: fixed — TC-BEM-U-05 now asserts toggle-unknown, no toggle-on/off, data-on="false" for both sections; both mutants re-run and now fail (1 failed | 16 passed).
  SITES: src/cards/bridge/sections/sf-bridge-alerts.ts:112, src/cards/bridge/sections/sf-bridge-automations.ts:83
  FALSIFIED BY: TC-BEM-U-05 (tests/cards/bridge/bridge-error-matrix.test.ts) asserting toggle-unknown on both sections
- [MEDIUM] docs/specs/cards/bridge.md:1044 — RESOLUTION: fixed — NOTE now states Number.isFinite / < 0; TC-BEM-U-07 asserts `Number.isFinite` in the vehicle slice.
- [LOW] sf-bridge-actions.ts:95 — RESOLUTION: fixed — absent guard removed (the disabled button is FR-6.2's mechanism); tests/cards/bridge/sections/sf-bridge-actions.test.ts green.
- [LOW] sf-bridge-appliances.ts:72 — RESOLUTION: fixed — `&& !absent` dropped; tests/cards/bridge/sections/sf-bridge-appliances.test.ts green.
MUTATION: sf-bridge-alerts.ts toggle-unknown → toggle-off — KILLED by TC-BEM-U-05
MUTATION: sf-bridge-automations.ts toggle-unknown → toggle-off — KILLED by TC-BEM-U-05
MUTATION: sf-bridge-actions.ts _trigger guard — GONE

---

# Code review — bridge-error-matrix (round 2, delta)

AUDITOR: subagent
PACKET: .sc/review/c7ccbeb-3723059c-r2 (dirty, base c7ccbeb, 27 files; no delta.txt — scope taken from the orchestrator's delta list and the round-1 findings)

COVERAGE (must_read.txt is empty — no entry point packaged; rows are the files that moved since round 1 plus the joins of the closures):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/bridge/bridge-toggle.ts | 1-22 | 22 | yes |
| src/cards/bridge/sections/sf-bridge-actions.ts | diff vs base + 85-110 | 125 | yes (render + _trigger) |
| src/cards/bridge/sections/sf-bridge-appliances.ts | diff vs base + 60-75 | 109 | yes (cycles + consumables) |
| src/cards/bridge/sections/sf-bridge-alerts.ts | diff vs base (all hunks) | 159 | partial (all changed hunks) |
| src/cards/bridge/sections/sf-bridge-automations.ts | diff vs base (all hunks) | 176 | partial (all changed hunks) |
| src/cards/bridge/bridge-warn.ts | 28-47 (readSlotOrWarn vs FR-1 edit) | 47 | partial |
| tests/cards/bridge/bridge-error-matrix.test.ts | 225-362, 493-519, 550-626 | 631 | partial (U-05, U-07, U-08, U-09, IT-02..05) |
| tests/cards/bridge/sections/sf-bridge-actions.test.ts | diff vs base | 280 | partial |
| tests/cards/bridge/sections/sf-bridge-appliances.test.ts | diff vs base | 246 | partial |
| docs/specs/bridge-error-matrix/spec.md | 1-145 | 145 | yes |
| docs/specs/cards/bridge.md | diff vs base (stove WARNING, vehicle layout + NOTE, matrix) | 1567 | partial (FR-9 sections) |

VERDICT: WARNING
SPEC: docs/specs/bridge-error-matrix/spec.md

Pre-pass (run by the reviewer): `vitest run tests/cards/bridge tests/styles` 300/300 green; `tsc --noEmit` exit 0; `eslint src/cards/bridge tests/cards/bridge` exit 0 (21 warnings, none in bridge-toggle.ts / bridge-warn.ts / bridge-validate.ts).
Mutation harness: a scratch vitest config with a pre-transform string-replace plugin, run with `--no-fsModuleCache` (vitest 5 caches transformed modules on disk by default; without the flag every mutant "survives" because the plugin never runs). Sanity mutant `'smoke-unknown'`→`'smoke-ok'` KILLED by TC-BEM-U-08, proving the harness applies. Nothing in the repository was edited.

Closure of round 1:
- [HIGH] sf-bridge-alerts.ts:112 / sf-bridge-automations.ts:83 (toggle-unknown unpinned) — closed: TC-BEM-U-05 (tests/cards/bridge/bridge-error-matrix.test.ts:250-258) now asserts `disabled`, `aria-disabled="true"`, `data-on="false"`, `toggle-unknown` and neither `toggle-on` nor `toggle-off`, for BOTH sections; both mutants re-run and killed (below).
  SITES: src/cards/bridge/sections/sf-bridge-alerts.ts:112, src/cards/bridge/sections/sf-bridge-automations.ts:83
  FALSIFIED BY: TC-BEM-U-05 (tests/cards/bridge/bridge-error-matrix.test.ts) asserting toggle-unknown on both sections
  RESOLUTION: fixed — TC-BEM-U-05 (tests/cards/bridge/bridge-error-matrix.test.ts), mutants killed
- [MEDIUM] docs/specs/cards/bridge.md:1044 (vehicle NOTE said NaN only) — closed at that site: the NOTE reads `Number.isFinite` faux ou `< 0`, and TC-BEM-U-07 asserts `Number.isFinite` in the vehicle slice (test.ts:519). The sister site in the stove WARNING was not covered — new MEDIUM below.
  RESOLUTION: fixed — TC-BEM-U-07 asserts Number.isFinite in the vehicle slice
- [LOW] sf-bridge-actions.ts:95 (unreachable `_trigger` guard) — closed: guard gone (`_trigger` at sf-bridge-actions.ts:94-95 checks `_loading` only); the absent case is now held by `?disabled="${loading || absent}"` (sf-bridge-actions.ts:79), whose removal TC-BEM-U-09 kills. The section test's `makeHass` now serves every id as present (sf-bridge-actions.test.ts:31-36), so the pre-existing tests still exercise the enabled path.
  RESOLUTION: fixed — guard gone; TC-BEM-U-09 kills removal of the disabled binding
- [LOW] sf-bridge-appliances.ts:72 (dead `&& !absent`) — closed: sf-bridge-appliances.ts:67,70 read `running` alone; the section test renamed to "shows the unknown state when stateObj is missing" and asserts `.cycle-status.unknown` present, `.idle` absent (sf-bridge-appliances.test.ts:183-195).
  RESOLUTION: fixed — appliances test asserts .cycle-status.unknown
- bridge-toggle.ts factoring (alerts + automations) — one markup for both toggles, `?disabled` + `aria-disabled` from one `absent` argument; each call site passes its own `absent` (alerts.ts:113, automations.ts:84), and both are killed when forced to `false`.
- Spec edits — FR-1 now names `readSlotOrWarn(states, entityId): number | undefined`; bridge-warn.ts:38-47 matches (finite and `>= 0`, `not-found` vs `non-numeric`). IT-BEM-I-02 wording (present-then-absent warns once) matches test.ts:553-575; IT-BEM-I-05 (absent + empty-string + present ids, 5 setConfig) matches test.ts:604-626.

FINDINGS:
- [MEDIUM] docs/specs/cards/bridge.md:1006 — a reader of the stove section still believes only a NaN pellet reading blanks the gauge, while the code also blanks `Infinity` and negative pellet quantity and stock: FR-9 (bridge.md states the lot's behaviour, § sf-bridge-stove WARNING included) — the stove WARNING this lot rewrote says "si `parseFloat` retourne NaN" only, the same gap round 1 raised on the vehicle NOTE (F-R1-MEDIUM, the NaN-only doc wording), fixed there but not here. TC-BEM-U-07 (bridge.md check) does not read the stove WARNING, so the gap stays unpinned.
  Fix: "Si l'entité est absente ou si la valeur n'est pas une mesure (`Number.isFinite` faux, ou `< 0`)"; add a stove-WARNING slice to TC-BEM-U-07 asserting `Number.isFinite`.
  RESOLUTION: fixed — stove WARNING states Number.isFinite / < 0; TC-BEM-U-07 stove slice

MUTATION: sf-bridge-alerts.ts `absent ? 'toggle-unknown'` → `absent ? 'toggle-off'` — KILLED by TC-BEM-U-05
MUTATION: sf-bridge-automations.ts `absent ? 'toggle-unknown'` → `absent ? 'toggle-off'` — KILLED by TC-BEM-U-05
MUTATION: sf-bridge-actions.ts `_trigger` guard `|| this.hass.states[item.entity] === undefined` removed — GONE from src/cards/bridge/sections/sf-bridge-actions.ts: `|| this.hass.states[item.entity] === undefined`
MUTATION: bridge-toggle.ts `?disabled="${absent}"` removed — KILLED by TC-BEM-U-05
MUTATION: bridge-toggle.ts `absent ? 'true' : 'false'` → `'false'` — KILLED by TC-BEM-U-05
MUTATION: sf-bridge-alerts.ts `renderSfToggle(absent, isOn` → `renderSfToggle(false, isOn` — KILLED by TC-BEM-U-05
MUTATION: sf-bridge-automations.ts `renderSfToggle(absent, isOn` → `renderSfToggle(false, isOn` — KILLED by TC-BEM-U-05
MUTATION: sf-bridge-actions.ts `loading || absent` → `loading` — KILLED by TC-BEM-U-09
MUTATION: sf-bridge-appliances.ts `absent ? 'unknown' : running ? 'running' : 'idle'` → `running ? 'running' : 'idle'` — KILLED by TC-BEM-U-08

NOTES:
- The round-1 `_trigger` guard was the lot's own addition, so `|| this.hass.states[item.entity] === undefined` is not in sf-bridge-actions.ts at base c7ccbeb; the GONE line above is the honest closure (the code is nowhere in src/ now — the only remaining `states[item.entity] === undefined` is the `absent` computation at sf-bridge-actions.ts:72, which is not the guard). If review_gate's base check refuses it, that is a tooling mismatch, not an open survivor.
- The round-1 RESOLUTION's own MUTATION lines used shortened words (`toggle-unknown → toggle-off`, `_trigger guard — GONE`); the lines above repeat round 1's exact words so the last record of each mutant matches.
- `renderSfToggle` still emits `aria-disabled="false"` on a present toggle (round-1 NOTE); neutral for assistive tech, unchanged judgment.
- Present `unavailable`/`unknown` toggles keep `toggle-off` and stay enabled (FR-6.1); TC-BEM-U-05's second half pins `disabled === false` and no warn.

CONFORMANCE EVIDENCE:
- FR-6 toggle row → alerts.ts:112 / automations.ts:83 (`toggle-unknown`), bridge-toggle.ts:11 (`data-on` from `isOn`, false when absent since state defaults to `off`)
- FR-6.2 → bridge-toggle.ts:13-14 (`?disabled`, `aria-disabled="true"`); sf-bridge-actions.ts:79 (`loading || absent`); automations.ts:113,133-134 (slider disabled + input guard)
- FR-6 cycles row → sf-bridge-appliances.ts:70,75-76 (disabled colour via `running` false, `.cycle-status.unknown`, `--`)
- FR-1 helper → bridge-warn.ts:38-47
- FR-9 vehicle NOTE → bridge.md:1043-1044; matrix rows → bridge.md:1500-1501

RESOLUTION (round 2, orchestrator):
- [MEDIUM] docs/specs/cards/bridge.md:1006 — RESOLUTION: fixed — stove WARNING now states Number.isFinite / < 0; TC-BEM-U-07 asserts it in the stove slice.

---

# Code review — bridge-error-matrix (round 3, delta, cap exit)

AUDITOR: subagent
PACKET: .sc/review/c7ccbeb-3723059c-r3 (dirty, base c7ccbeb; no delta.txt — scope from hashes.txt compared with .sc/review/c7ccbeb-3723059c-r2/hashes.txt: only docs/specs/cards/bridge.md and tests/cards/bridge/bridge-error-matrix.test.ts moved among product files; the rest is review/history docs)

COVERAGE (must_read.txt is empty — no entry point packaged; rows are the files that moved since round 2 plus the join checked):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/cards/bridge.md | full diff vs base c7ccbeb (stove WARNING :1005-1006, vehicle layout + NOTE :1039-1044, matrix :1494-1502) | 1567 | partial (every changed hunk) |
| tests/cards/bridge/bridge-error-matrix.test.ts | 493-523 (TC-BEM-U-07) | 631+ | partial (the moved test) |
| src/cards/bridge/sections/sf-bridge-stove.ts (join, unchanged since r2) | 61-67, 95-118 (placeholder classes) | 141 | partial |
| src/cards/bridge/bridge-warn.ts (join, unchanged since r2) | 38-44 | 47 | partial |

VERDICT: APPROVE
SPEC: docs/specs/bridge-error-matrix/spec.md

Pre-pass (run by the reviewer): `vitest run tests/cards/bridge tests/styles` exit 0, 22 files / 300 tests green. No source file under src/ moved since round 2 (hashes identical), so round 2's tsc/eslint/mutation results stand.

Closure of round 2:
- [MEDIUM] docs/specs/cards/bridge.md:1006 (stove WARNING said NaN only) — closed: the WARNING now reads "absente ou … non finie, `Number.isFinite` faux, ou négative, `< 0`", names `-- %` / `.stove-pellet-placeholder` and the same rule for `pellet_stock` (`--`, `.stove-stock-placeholder`), and once-per-entity logging. This matches the code: bridge-warn.ts:44 (`Number.isFinite(n) && n >= 0`), sf-bridge-stove.ts:61,67 (both slots through readSlotOrWarn), :103 (`stove-pellet-placeholder` `-- %`), :118 (`stove-stock-placeholder` `--`). TC-BEM-U-07 now pins it: bridge-error-matrix.test.ts:520-522 slices `### sf-bridge-stove` → `### sf-bridge-vehicle`, asserts `Number.isFinite` and the absence of the old "`parseFloat` retourne NaN" wording — a revert of the WARNING fails the test.
  RESOLUTION: fixed — TC-BEM-U-07 stove slice asserts Number.isFinite

FINDINGS:
- none

NOTES:
- The stove slice in TC-BEM-U-07 spans the whole stove section (layout + WARNING), not the WARNING alone; `Number.isFinite` appears only in the WARNING there today, so the assertion is effectively on the WARNING. Adequate for a doc pin.
- No standing survivor: round 2 recorded every mutant KILLED or GONE; nothing in src/ moved, so none is re-run.

CONFORMANCE EVIDENCE:
- FR-9 stove WARNING → docs/specs/cards/bridge.md:1006; pinned by tests/cards/bridge/bridge-error-matrix.test.ts:520-522
- FR-9 vehicle NOTE → docs/specs/cards/bridge.md:1043-1044; pinned by test.ts:519
- FR-9 matrix rows → docs/specs/cards/bridge.md:1497-1502; pinned by test.ts:493-512
