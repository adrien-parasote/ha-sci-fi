AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| .sc/review/0967864-535408f2/diff.patch | 1-412 | 412 | yes |
| tests/utils/base-card.test.ts | diff hunks | 683 | no (diff only) |
| tests/fixes/tests/O2.test.ts | 1-70 | 70 | yes |
| tests/i18n/catalogue.test.ts | diff + units()/templates lookups | 114 | no |
| tests/cards/vacuum/sci-fi-vacuum.test.ts | diff hunks | - | no |
| docs/specs/03_base_classes.md, docs/specs/cards/vacuum.md | diff rows | - | no |
SPEC: docs/specs/03_base_classes.md (TC-306), docs/specs/cards/vacuum.md (F-VAC-D07), docs/fixes/tests/lot.json
FINDINGS:
- [MEDIUM] tests/utils/base-card.test.ts:43 — a card written as an anonymous class, a class expression (`const X = class extends SciFiBaseCard`), a mixin parent (`extends Mixin(SciFiBaseCard)`) or an aliased import (`import { SciFiBaseCard as Base }`) can drop the super call and the TC-306 (willUpdate overrides must call super first) walk stays green — classesOf only records `ClassDeclaration` nodes with a name, and only resolves an `extends` that is a bare Identifier matched on text; also parentOf is keyed by class name, so two same-named classes in different files overwrite each other. None of these shapes exists in src today (grep), so the current tree passes truthfully, but the amended row now claims "every class descending from SciFiBaseCard".
  RESOLUTION: fixed — classesOf now reads class expressions, resolves import aliases, reports a non-name heritage as unresolved (refused), and willUpdateOffenders refuses a name declared twice with two parents; proved by 'TC-306: the AST walk refuses every shape it cannot vouch for…' (Expr, Mixed, aliased Base, twice cases).
- [MEDIUM] tests/utils/base-card.test.ts:238 — breaking the cross-file descent (replace `descendsFromBase(c.parent)` with `c.parent === 'SciFiBaseCard'`) turns no test red: the positive control checks only classesOf output (parent and willUpdate shape), never descendsFromBase/offenders, and src has no intermediate subclass. The O1 claim "follows intermediate subclasses" is unproven by any test. Fix: run the same descent+offender pipeline over the sandbox classes and expect Arrow and Late as offenders, Good not.
  RESOLUTION: fixed — the verdict is one function, willUpdateOffenders, run on src and on the sandbox; the sandbox goes through Mid and an aliased base; mutating descendsFromBase(c.parent) to c.parent === 'SciFiBaseCard' turns tests/utils/base-card.test.ts red (measured).
- [LOW] tests/cards/vacuum/sci-fi-vacuum.test.ts:608 — the toast test asserts the message text but not that it is an error toast; a regression calling `addMessage(msg, false)` (shown as success) passes, though F-VAC-D07 is about failure feedback and the comment says "as an error".
  RESOLUTION: fixed — test_O3_callAction_shows_error_toast_on_callService_rejection spies addMessage and expects ('service failed', true).
- [LOW] tests/utils/base-card.test.ts:35 — isSuperWillUpdate accepts `super.willUpdate()` with no argument, while the spec row requires `super.willUpdate(changedProperties)`; a call that drops the changed-properties map passes.
  RESOLUTION: fixed — isSuperWillUpdate requires exactly one argument; the sandbox Bare class (super.willUpdate()) is an expected offender.
NOTES:
- O2: each key is load-bearing — VALVE in MEANINGFUL_DOMAINS (sci-fi-water-management.ts:132) and the service set (:682), NUMBER at :625 and bridge-editor :527, COUNTER at bridge-editor :778; mutating any one empties a dropdown, removes the toggle, or redirects the service domain, so the tests go red.
- O4: sorted-equality in both directions plus non-empty guard; goes red on a missed localize-build.
- All 80 tests in the four files pass.
CONFORMANCE EVIDENCE:
- TC-306 class-field refusal → base-card.test.ts classesOf `kind: 'field'` + offenders filter; control asserts Arrow is field.
- F-VAC-D07 → sci-fi-vacuum.test.ts:608 asserts toast body text.
- O4 → catalogue.test.ts:110-112.
VERDICT: APPROVE
