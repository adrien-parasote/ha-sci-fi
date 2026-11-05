AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| docs/specs/stove-diagnostics/spec.md | 1-154 | 154 | yes |
| src/cards/stove/diagnostics.ts | 1-94 | 94 | yes |
| src/cards/stove/number-wheel.ts | 1-127 | 127 | yes |
| src/cards/stove/sci-fi-stove.ts | diff hunks (imports, 181-190, 229-245, 294-390) | 775 | no (diff only) |
| src/cards/stove/config.ts | diff hunk | 47 | no (diff only) |
| src/cards/stove/labels.ts | diff hunk | 44 | no (diff only) |
| src/cards/stove/sci-fi-stove-editor.ts | diff hunk | 166 | no (diff only) |
| src/cards/stove/styles.ts | diff hunk | 382 | no (diff only) |
| src/types/ha.ts | diff hunk | - | no (diff only) |
| xliff/fr.xlf, src/locales/locales/fr.js | the four new units | - | partial |
| tests/cards/stove/sci-fi-stove-diagnostics.test.ts | test index + TC-SDG-U-11 | 420 | partial |
| tests/cards/stove/__snapshots__/sci-fi-stove-diagnostics.test.ts.snap | 1-3 | 3 | yes |
must_read.txt is empty: no entry point packaged.
VERDICT: WARNING
SPEC: docs/specs/stove-diagnostics/spec.md
FINDINGS:
- [LOW] src/cards/stove/diagnostics.ts:93 — when an error carries a very long code with a short label (e.g. label "Ignition failure", code of 250 characters), the title/aria-label shows "Ignition failure… (CCC…32)": an ellipsis is appended to a label that was never cut, telling the user text is missing when it is not — capErrorText takes the protected branch as soon as the FULL text exceeds 200, whereas FR-14 (the cap cuts the label, keeps the code) only needs the label cut when `label + suffix` itself exceeds 200; the branch should test the length against the 32-char-cut suffix and append the ellipsis only if the label is actually sliced.
  RESOLUTION: fixed — tests/cards/stove/diagnostics.test.ts "a short label beside a long code is not marked as cut" (prove_test.py: PROVEN, red without the fix)
NOTES:
- src/cards/stove/diagnostics.ts:49 uses `Object.prototype.hasOwnProperty.call` instead of the `Object.hasOwn` FR-5 names; same own-property semantics, justified by the tsconfig lib; TC-SDG-U-03 prototype case covers it.
- src/cards/stove/sci-fi-stove.ts:355 calls `hass.formatEntityState` detached from `hass`; HA builds it as a closure (no `this`), so this is safe.
- src/cards/stove/sci-fi-stove.ts:330 `s: any` follows the existing `_renderMiddleZone(stoveState: any, s: any)` convention of the file.
- Known out-of-diff beads j5h0 (sci-fi.ts) and g3lx (translate_xlf) not re-raised.
CONFORMANCE EVIDENCE:
- FR-1 (pure move of the 17 wheel declarations): src/cards/stove/number-wheel.ts:11-127 exports all 17, bodies identical to the removed lines in the diff; sci-fi-stove.ts imports from './number-wheel.js'.
- FR-2 (card <= 800 lines): wc -l src/cards/stove/sci-fi-stove.ts = 775; TC-SDG-U-11 at tests/cards/stove/sci-fi-stove-diagnostics.test.ts:316.
- FR-3 (fields, validated, in relevant entities): config.ts:32-34; diagnostics.ts:37-41; sci-fi-stove.ts:184-187.
- FR-5 (own-property, domain guard, normalisation): diagnostics.ts:44-65 with DIAGNOSTIC_DOMAINS 25-29.
- FR-6/FR-8 (live zone, single badge of worst kind, joined capped titles): sci-fi-stove.ts:368-390; lines ordered door<alert<error so last = worst.
- FR-7 (error text/code): diagnostics.ts:68-81.
- FR-9 (stateLabel fallback, no logging): sci-fi-stove.ts:354-366; ha.ts formatEntityState type.
- FR-13 (door/alert fusion): sci-fi-stove.ts:337.
- FR-14 (CSS ellipsis, 200 cap): styles.ts .diagnostic-text rule; diagnostics.ts:84-94.
- FR-10/FR-11: editor fields after sensor_status, labels.ts, xliff/fr.xlf:1449-1464, fr.js entries.
- FR-0/FR-4: snapshot file with key "pre-lot content".

---

AUDITOR: subagent
ROUND: 2 (delta, packet .sc/review/37da8a2-186abce0)
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/stove/diagnostics.ts | delta hunk + 80-95 (capText/capErrorText) | 95 | no (delta scope; rest unchanged since round 1, read in full there) |
| tests/cards/stove/diagnostics.test.ts | delta hunk | 66 | no (delta scope) |
must_read.txt is empty: no entry point packaged.
VERDICT: APPROVE
SPEC: docs/specs/stove-diagnostics/spec.md
FINDINGS:
(none)
RULING: the round-1 LOW at src/cards/stove/diagnostics.ts:93 (false ellipsis on a short label beside a long code) is closed as fixed. Line 93 now returns `${label}${suffix}` with no ellipsis when label plus the 32-char-cut suffix fits in 200; otherwise line 94 slices the label and adds the ellipsis (exactly 200, code kept). TC-SDG-U-13 "a short label beside a long code is not marked as cut" asserts the exact string; vitest on the file 6/6 green.
NOTES:
- The branch where the full text is <= 200 still goes through capText (no-op). Nothing regressed.
CONFORMANCE EVIDENCE:
- FR-14 (cap cuts the label, keeps the code cut to 32, marks a cut only when one happens): src/cards/stove/diagnostics.ts:89-95; TC-SDG-U-13 at tests/cards/stove/diagnostics.test.ts.
