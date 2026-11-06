# Code review — fix lot stove-diagnostics (top-right diagnostic badge removed)

VERDICT: APPROVE

AUDITOR: subagent
SPEC: docs/specs/stove-diagnostics/spec.md, docs/specs/cards/stove.md
Packet: .sc/review/e71231c-d57ff114

The reviewer read the dirty diff in full, searched every non-ignored file for the removed symbols and ran the stove and styles tests (10 files, 99 tests, exit 0). The badge is gone from `_renderContent` and from the styles; the status-zone lines (`div.diagnostics role="status" aria-live="polite"`) are the only display, so every diagnostic is still announced. No unused helper or import is left behind.

COVERAGE:
| file | read |
|---|---|
| .sc/review/e71231c-d57ff114/diff.patch | full (455 lines) |
| src/cards/stove/sci-fi-stove.ts | 245-383 (`_renderContent`, `_diagnosticLines`, `_renderDiagnostics`) |
| src/cards/stove/styles.ts | 36-70 |
| docs/specs/stove-diagnostics/spec.md | amended passages |
| docs/specs/cards/stove.md | amended passages |
| tests/cards/stove/sci-fi-stove-diagnostics.test.ts | amended tests |

FINDINGS:

[MEDIUM] FR-14 no longer starts its own line
File: docs/specs/stove-diagnostics/spec.md:47
Issue: the edit dropped the newline between FR-13 and FR-14, so the line reads "...(agent's call sur la ligne gardée).- **FR-14**: ..." and a traceability gate or grep for "- **FR-14**" no longer finds it. Fix: put FR-14 back on its own line.
RESOLUTION: fixed — FR-14 is back on its own line, separated from FR-13 by a blank line (spec.md:47-49).

[MEDIUM] The committed bundle still renders the badge
File: dist/sci-fi.min.js:3264
Issue: OUT-OF-DIFF at review time: the tracked bundle still contained the badge, and the workbench loads it, so the diagnostic would still show twice until a rebuild; earlier commits updated `dist/` with the source.
RESOLUTION: fixed — `npm run build` run in the worktree, `grep -c diagnostic-badge dist/sci-fi.min.js` returns 0, `dist/sci-fi.min.js` is committed with the lot.

[LOW] Clauses still mention an `aria-label` no element carries
File: docs/specs/stove-diagnostics/spec.md:28
Issue: D6, FR-7, FR-14 and the matrix rows still said "`title` / `aria-label`" while the badge was the only element with an `aria-label` and B-5 now says the lines have none.
RESOLUTION: fixed — each of those clauses now says `title` only; the test title of TC-SDG-U-13 follows.

[LOW] TC-SDG-U-13 keeps an input with no assertion
File: docs/specs/stove-diagnostics/spec.md:90
Issue: the row still listed "puis trois diagnostics de 120 caractères chacun" and traced to FR-8, but the matching test case was deleted with the badge.
RESOLUTION: fixed — the input and the FR-8 trace are dropped from the row; the test no longer has that case.

NOTES:
- `capText` is still used (sci-fi-stove.ts, wear-counters.ts, diagnostics.ts), `DIAGNOSTIC_ICONS` feeds the line icons, `DiagnosticLine.capped` feeds the line `title`.
- `.content { position: relative }` is kept: FR-8 and TC-SDG-U-08 pin it explicitly.
- The remaining mentions of `.diagnostic-badge` in tests and specs are assertions that it is absent.
- Security: the only rendering change is a removal; line texts are still bound as text by Lit.
