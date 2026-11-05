# Code review — stove-fan-speed (round 1)

AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/stove/sci-fi-stove.ts | diff hunks + number-wheel section 614-730 | 797 | partial (all changed lines) |
| src/cards/stove/config.ts | diff | — | changed lines |
| src/cards/stove/labels.ts | diff | — | changed lines |
| src/cards/stove/sci-fi-stove-editor.ts | diff | — | changed lines |
| src/cards/stove/styles.ts | diff | — | changed lines |
| src/locales/locales/fr.js, xliff/fr.xlf | grep of the four keys | — | targeted |
| tests/cards/stove/sci-fi-stove-fan-speed.test.ts | test index | 367 | partial |
(must_read.txt of packet .sc/review/b037203-d3f97d80 is empty.)

VERDICT: APPROVE
SPEC: docs/specs/stove-fan-speed/spec.md

FINDINGS: none (critical: 0, high: 0)

### Spec limit F-01 — holds
Per-wheel release: the hass setter loops `_releaseNumberPick(spec)` per wheel (sci-fi-stove.ts ~234); each reads only `this._numberPicks[spec.key]` and its own entity; `_cancelNumberTimer(spec)` clears only its own key. Proven by TC-SFS-U-1112 (green).

### Spec limit F-02 — holds
`.bottom` carries `flex-wrap: wrap` (src/cards/stove/styles.ts:311); no width/shrink changed. TC-SFS-U-1110.

### Spec limit F-03 — holds
`aria-label="${spec.label()}"` is set unconditionally, active and disabled (`_renderNumberWheel`). TC-SFS-U-1104.

NOTES:
- sci-fi-stove.ts is at 797 of an 800-line cap. A split is warranted at the NEXT lot touching this file, not as a defect of this one: the module-level helpers (`NumberTrio`, `NumberWheelSpec`, `NUMBER_WHEELS`, `numberGrid`, `numberValue`, `isNumeric`, `decimals`, `gridOf`, `isNumberDisabled`) are pure and lift cleanly into e.g. `src/cards/stove/number-wheel.ts` (~120 lines). TC-SFS-U-1107 greps the card source for `NumberWheelSpec`/`numberGrid`; that test would need to read the new module (or the card's import) after a split.
- FR-4.2 is enforced generically ("an earlier wheel already drives this entity") in `_numberDomain`, so it also blocks the fan send path, not only rendering — matches "aucun appel de ventilation n'est possible".
- `_numberTimers` is reassigned by spread though non-reactive; harmless, a style choice.

CONFORMANCE EVIDENCE:
- FR-1 → config.ts:41 `number_fan_speed?` after `number_power_level`.
- FR-2 → sci-fi-stove.ts `getRelevantEntities` adds `number_fan_speed` (~263).
- FR-3/FR-4 order → `NUMBER_WHEELS.map(...)` between temp wheel and eco control (~563); power first in `NUMBER_WHEELS`.
- FR-5 fallback 0/5/1 → `NUMBER_WHEELS[1].fallback`.
- FR-6 single mechanism → `numberGrid(attrs, fallback)`, `NUMBER_DOMAINS`, `NUMBER_DEBOUNCE_MS`, `NUMBER_MAX_ITEMS` single constants; `@state _numberPicks` reassigned whole; `_numberTimers` non-reactive; `_powerPendingIndex` read-only getter; power-level suite untouched and green.
- FR-7 → per-key timers/picks; `disconnectedCallback` cancels both and resets picks.
- FR-8/FR-10 → `msg('Fan speed changed')`; four xliff units (fr.xlf:1434-1446) and fr.js entries present.
- FR-9 → editor line after power-level with `mdi:fan`; labels.ts mapping.
- Tests: `npx vitest run tests/cards/stove` → 6 files, 121 tests passed.
