AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/stove/sci-fi-stove.ts | diff hunks + 1-100, 500-730 context | 727 | diff in full |
| src/cards/stove/config.ts | diff | - | diff in full |
| src/cards/stove/labels.ts | diff | - | diff in full |
| src/cards/stove/sci-fi-stove-editor.ts | diff | - | diff in full |
| src/locales/locales/fr.js | diff + grep `Puissance` | - | diff in full |
| docs/specs/stove-power-level/spec.md | 1-128 | 128 | yes |
| src/utils/base-card.ts | hass accessor, shouldUpdate (33-100) | - | partial (join) |
must_read.txt is empty: no entry point packaged.
VERDICT: APPROVE
SPEC: docs/specs/stove-power-level/spec.md
Packet: .sc/review/c820be9-64bb9386
FINDINGS:
- [LOW] src/cards/stove/sci-fi-stove.ts:335 — if the entity's min/max/step shrink while a pick is still pending, the wheel briefly shows the first item instead of the user's pick (sf-wheel falls back to item 0 for an unknown id) until the timer fires and releases it — `_powerSelectedId` returns the pending index unclamped; FR-8 (pending pick, last choice wins) only prescribes the no-call outcome at expiry, so the display transient is unpinned. Fix: drop/clamp the pending index in `_releasePowerPick` when `k >= n`.
  RESOLUTION: fixed — `_releasePowerPick` drops the pending index when it is >= the new grid's n (src/cards/stove/sci-fi-stove.ts); pinned by TC-SPL-U-1133 (tests/cards/stove/sci-fi-stove-power-level.test.ts, el3 case: grid shrinks 1..5 -> 1..3 under a pending pick, wheel shows HA state, no call), prove_test.py PROVEN red without the fix.
NOTES:
- `isPowerDisabled` folds `unavailable`/`unknown` into the non-numeric test (FR-7, wheel disabled on unreadable state): equivalent since both strings are non-numeric under FR-5.
- `Power` already existed in fr.js (`s053eb89714fe5c46` -> `Puissance`), so only three new fr.js entries is consistent with FR-10 (four strings localized).
- Tests: vitest tests/cards/stove tests/specs tests/types: 14 files, 209 tests passed; `tsc --noEmit -p tsconfig.json` clean.

### Spec limit F-01 — holds
Fractional steps: ids are integer indices (sci-fi-stove.ts:330), values `Number((min+k·step).toFixed(d))` (sci-fi-stove.ts:248), `d` from `decimals()` (215-222). Scope: every item and every call value (390). TC-SPL-U-1126 green.

### Spec limit F-02 — holds
Finiteness by `isNumeric` -> `Number.isFinite` (209-213) on every bound (235-236); `n > POWER_MAX_ITEMS` -> 1/5/1 (243); step<=0 and min>max guarded before n is computed (241), so no division by zero/negative loop. Single site generating items (330). TC-SPL-U-1129 green.

### Spec limit F-03 — holds
Optimistic selection: `@state _powerPendingIndex` (265) drives `.selectedId` (335, 351); base-card shouldUpdate re-renders on a non-hass state change (base-card.ts:78).

### Spec limit F-04 — holds
Single debounce timer, cancel-and-restart on each pick (367-370), one callService per expiry (389-392), one toast per settlement; release on next hass after send (396-404); disconnect cancels (279-283). TC-SPL-U-1130/1133 green.

CONFORMANCE EVIDENCE:
- FR-1 (optional root field) -> config.ts:40
- FR-2 (relevant entities) -> sci-fi-stove.ts:206-208
- FR-3/FR-4 (nothing when absent; wheel between temp and eco) -> sci-fi-stove.ts:506, 343-345
- FR-5/5.1/5.2 (numeric test, bounds, items) -> 209-249
- FR-6 (nearest clamped selection) -> 334-340
- FR-8 (debounce state machine) -> 362-404; domain via DOMAIN constants 196
- FR-8.1 (text binding) -> no unsafeHTML/innerHTML introduced; message passed to `_showToast`
- FR-9 (editor input) -> sci-fi-stove-editor.ts:101, labels.ts:21
- FR-12 (presence + domain guard) -> 314-319
- FR-13 (aria-label always, title when disabled) -> 353-354

## Round 2 (delta, packet .sc/review/be1c627-634d9439)

AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| .verifyignore | 1-26 (delta) | 26 | yes |
| src/cards/stove/sci-fi-stove.ts | fix hunk 645-655, 38, 174-180 (closure of the round-1 LOW) | n/a | delta-scoped |
| tests/cards/stove/sci-fi-stove-power-level.test.ts | run: 19/19 pass | n/a | delta-scoped |
VERDICT: APPROVE
SPEC: docs/specs/stove-power-level/spec.md
FINDINGS:
- none (critical: 0, high: 0)
Closure of the round-1 LOW (pending pick surviving a grid shrink): closed — `set hass` (line 178) calls `_releasePowerPick` (line 180), which at line 645 drops the pending index when `_powerPendingIndex >= powerGrid(entity.attributes).n`, cancels the timer and clears `_powerCallSent`; pinned by TC-SPL-U-1133 el3.
NOTES:
- The .verifyignore suppression `P7:src/cards/stove/sci-fi-stove.ts:architectural_violation` is justified: the lot adds a type-only import and `state` from an existing module; fan-out pre-existed on main; scoped to one file and rule.
- OUT-OF-DIFF: the pre-existing `P8:*:*` wildcard in .verifyignore should be narrowed in a separate bead.
CONFORMANCE EVIDENCE: FR-8 -> src/cards/stove/sci-fi-stove.ts:645-655 with the hass setter at :178-180, pinned by TC-SPL-U-1133.
