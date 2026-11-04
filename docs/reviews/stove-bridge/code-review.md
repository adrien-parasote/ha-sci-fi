AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/utils/pellet.ts | 1-12 | 12 | yes |
| src/cards/stove/sci-fi-stove.ts | diff + 185-215, 521-524 | 530 | no (diff + callers) |
| src/cards/bridge/bridge-validate.ts | diff + 40-93 | 104 | no |
| src/cards/bridge/sections/sf-bridge-stove.ts | diff + 56-119 | 136 | no |
| src/components/sf-circle-progress-bar.ts | 69-111 | see wc | no |
| src/cards/bridge/bridge-warn.ts | 38-47 | see wc | no |
| tests/utils/action.test.ts | diff | 61 | diff only |
| dev/*, docs/specs/*, docs/cards/stove.md | diff | see wc | diff only |
VERDICT: APPROVE
SPEC: docs/specs/cards/stove.md, docs/specs/10_card_editors.md, docs/specs/bridge-error-matrix/spec.md
FINDINGS:
- [LOW] src/utils/pellet.ts:9 — the helper returns NaN for NaN and 100 for Infinity; the stove card only guards with isNaN (sci-fi-stove.ts:203), so a sensor state "Infinity" renders a full 100% gauge (the bridge is safe: readSlotOrWarn admits finite values only, bridge-warn.ts:44). Expected: Number.isFinite guard.
  RESOLUTION: fixed — sci-fi-stove.ts guards with Number.isFinite; tests/fixes/stove-bridge/O1.test.ts test_O1_non_finite_pellet_state_renders_no_gauge (red on HEAD, green now)
- [LOW] src/utils/pellet.ts:10 — the 1 / 1.0001 boundary (1 → 100 %, 1.0001 → 1 %) follows the user's ≤ 1 rule but no test pins it; a later `>=` change would pass unnoticed. Expected: a boundary test.
  RESOLUTION: fixed — tests/fixes/stove-bridge/O1.test.ts test_O1_ratio_boundary_is_one_inclusive pins 1 → 100 and 1.0001 → 1
NOTES:
- npx vitest run (reviewer) → 141 files passed, 1627 passed | 1 skipped; after the resolutions → 141 files, 1629 passed | 1 skipped.
- Boundaries: 0→0, 1→100, 1.0001→1, 0.65→65, -5→0; non-numeric strings stopped before the helper on both cards.
- sf-circle-progress-bar alert correct: warning = val/100 < threshold expects 0–100; a 0.15 ratio was rounded to 0 (forced critical), now 15.
- O2 refusal breaks nothing: getStubConfig carries entity (sci-fi-stove.ts:522); getCardSize keeps its pre-config guard; editor emptying entity gets HA's standard config-error preview.
- TC-112 amendment masks nothing (entity added to the stove case only; both assertions still run per card).
- O6 UNREPRODUCED confirmed: bridge-validate.ts:40 refuses any array element that is not an object with a string entity.
- O5: firstBadRunningStates runs after the :40 element check; message carries the key path only (FR-8 rule 5). Security: no innerHTML/eval, messages do not echo config.
- Out of diff: docs/cards/stove.md `sensor_status` row still says binary_sensor while fixtures use core sensor.*_detailed_stove_status (docs only).
CONFORMANCE EVIDENCE:
- stove.md "Config without entity" + TC-1111 → validateConfig override throws 'You need to define an entity'.
- stove.md pellet-ratio row → src/utils/pellet.ts:9-12, called at sci-fi-stove.ts:208 and sf-bridge-stove.ts:57; bridge local copy removed.
- bridge-error-matrix FR-8 rule 5 → bridge-validate.ts firstBadRunningStates.
- 10_card_editors.md stove section → editor :86 entity, :90 switch_eco_mode.
