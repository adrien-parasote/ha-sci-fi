# BUILD - stove-fan-speed (stage summary)

**Decided:**
- Snapshot TC-SFS-U-1101 recorded on pre-change code, committed alone (181deb8).
- Shared mechanism: NumberWheelSpec + numberGrid + NUMBER_WHEELS (power 1/5/1, fan 0/5/1); _renderNumberWheel / _onNumberWheelChange; per-wheel @state _numberPicks, non-reactive _numberTimers; read-only _powerPendingIndex getter kept.
- FR-4.2 as a generic rule: an entity already driven by an earlier wheel gets no second wheel.
- Wheel keys are powerLevel / fanSpeed ('fan' was read as a domain literal by the domain guard).
- Guards moved: docs/specs/10_card_editors.md label count 186 -> 187 (155 in dictionaries); tests/specs/delivered-design.test.ts also reads the fan-speed test (re-lock with reason); tests/styles/card-css-baseline.json regenerated, only delta flex-wrap: wrap.
- No spec defect found.

**Artifacts:**
- src/cards/stove/sci-fi-stove.ts, config.ts, styles.ts, sci-fi-stove-editor.ts, labels.ts
- xliff/fr.xlf, src/locales/locales/fr.js
- tests/cards/stove/sci-fi-stove-fan-speed.test.ts (+ __snapshots__), tests/cards/stove/sci-fi-stove-editor.test.ts
- WIP commits 181deb8, eb8a611, 4b7f0be (SPEC artifacts)

**Open/risky:**
- src/cards/stove/sci-fi-stove.ts is 797 lines (800 absolute max): VERIFY/sentrux may ask for a split.
- test-compacted bypassed by the user: test_reduce plan crashed (tr_typescript.py JSON truncated at 64 KiB).
- Flaky test seen once: tests/docs/repo-wide-ids-guard.test.ts ENOENT on tests/.eit-base-*/src/types (parallel race, unrelated to the lot).

**Next action:** VERIFY - verification loop, code review and security review on fresh context.

**Tests:** files +1 ~2 −0 · cases +18 −0 · 2 earlier test file(s) edited, none lost a case
