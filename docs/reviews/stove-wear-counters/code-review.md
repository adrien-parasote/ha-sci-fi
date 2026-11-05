AUDITOR: subagent
Packet: .sc/review/a6c1348-acd3c540 (dirty c7d02fb..worktree). must_read.txt is empty: no entry point was packaged.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/stove/wear-counters.ts | 1-112 | 112 | yes |
| src/cards/stove/state-label.ts | 1-27 | 27 | yes |
| src/cards/stove/sci-fi-stove.ts | diff hunks only | 769 | no (diff) |
| src/cards/stove/config.ts | diff hunk | - | no (diff) |
| src/cards/stove/labels.ts | diff hunk | - | no (diff) |
| src/cards/stove/sci-fi-stove-editor.ts | diff hunk | - | no (diff) |
| src/cards/stove/styles.ts | diff hunk | - | no (diff) |
| src/cards/stove/diagnostics.ts (OUT-OF-DIFF, joins) | configuredId, readDiagnostic, capText | - | no |
| docs/specs/stove-wear-counters/spec.md | 1-158 | 158 | yes |
| tests/cards/stove/sci-fi-stove-wear-counters.test.ts | test names | 363 | no |
| docs/specs/cards/stove.md | grep of wear sections | - | no |

VERDICT: APPROVE
SPEC: docs/specs/stove-wear-counters/spec.md

FINDINGS:
- [LOW] src/cards/stove/sci-fi-stove.ts:127 — a reader (and IDE hover) sees the doc comment "Per-wheel pick not yet released to HA's state" attached to the new wear open-state field, and the number-picks field loses its doc — the new `_wearOpen` declaration (FR-8, the per-instance open state) and its JSDoc were inserted between the existing `_numberPicks` JSDoc and its field, leaving two stacked JSDoc blocks. Fix: move the two new lines above the `_numberPicks` comment.
  RESOLUTION: fixed — `_wearOpen` and its JSDoc moved above the `_numberPicks` JSDoc (sci-fi-stove.ts:127-130); comment-only reorder, no behaviour change, covered by tests/cards/stove/sci-fi-stove-wear-counters.test.ts staying green.

NOTES:
- FR-6 asks for the `renderWearCounters(...)` call "sur sa propre ligne"; prettier wrapped it to 3 lines inside `.container`. The snapshot FR-0 still holds (TC-SWC-U-02 green); not a defect.
- `Object.prototype.hasOwnProperty.call` instead of `Object.hasOwn` (FR-7): same semantics, justified by the tsconfig lib, consistent with diagnostics.ts.
- Snapshot ordering (FR-0): d6372fb (pre-lot snapshot) precedes a6c1348 (src), verified by git log.
- tests/cards/stove: 9 files, 159 tests passed in this worktree.

CONFORMANCE EVIDENCE:
- FR-1 (shared state-label helper) → src/cards/stove/state-label.ts:8-27; `_stateLabel` removed, calls at sci-fi-stove.ts stateLabel(this.hass, …) (diff hunk @@ -339).
- FR-2 → config.ts five fields after sensor_error; configuredId reused at wear-counters.ts:48,62.
- FR-2.1 (id shape guard) → wear-counters.ts:38-45 (≤255, /^[a-z0-9_]+\.[a-z0-9_]+$/), applied in wearEntityIds and readable().
- FR-3 → WEAR_COUNTERS order/icons wear-counters.ts:26-32; connection passed to sf-icon.
- FR-4 → sci-fi-stove.ts getRelevantEntities `for (const id of wearEntityIds(s))`.
- FR-5 → wear-counters.ts:51-70 (readDiagnostic own-property + sensor. prefix, unavailable/unknown any case, blank → WEAR_MISSING, capText always).
- FR-6 → wear-counters.ts:86-112 (nothing on empty, class/element-id/title/icon/?open/toggle, row classes, titles); placed after _renderBottom.
- FR-7 → wear-counters.ts:73-83, NBSP verified as bytes C2 A0 (U+00A0).
- FR-8 → `@state() private _wearOpen = false`, no persistence.
- FR-9 → styles.ts wear rules match exactly.
- FR-10 → editor fields after sensor_error in order; labels.ts mapping.
- FR-12 → sci-fi-stove.ts is 769 lines (≤ 790).
- FR-13 → stove.md F-STOVE-D12, § Usure, frozen selectors, matrix row.
