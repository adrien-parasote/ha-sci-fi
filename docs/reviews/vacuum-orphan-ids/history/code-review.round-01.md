AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| docs/specs/vacuum-orphan-ids/spec.md | 1-106 | 106 | yes |
| tests/cards/vacuum/vacuum-ids-declared.test.ts | 1-92 | 92 | yes |
| docs/specs/cards/vacuum.md | rows 903-918, note 836-842 | — | partial (the rows and note in scope) |
| tests/cards/vacuum/sci-fi-vacuum-editor.test.ts | 158-180, 352-515 | — | partial (the 7 renamed tests) |
| tests/cards/vacuum/sci-fi-vacuum.test.ts | 302-304, 454-480, 581-661 | — | partial (renamed tests + 1524) |
| .sc/review/0afbbca-f249e1c2/diff.patch | title/comment hunks | — | yes for changed lines |
VERDICT: WARNING
SPEC: docs/specs/vacuum-orphan-ids/spec.md
FINDINGS:
- [MEDIUM] tests/cards/vacuum/sci-fi-vacuum.test.ts:583 — a reader following the ids will believe the error-toast behaviour is covered under TC-VACUUM-U-1524 (spec row: error toast after a rejected action), but the only test that cites 1524 (sci-fi-vacuum.test.ts:456) asserts something else (a malformed `service` with no dot means no callService), and the real error-toast test now cites no id at all — the new title "(same case as TC-VACUUM-U-1524)" and FR-3 (the old TC-1528 drops its id as an alias of 1524) rest on a false premise (spec Assumption 3, "TC-1528 duplicates TC-VACUUM-U-1524", does not hold when read).
  SITES: tests/cards/vacuum/sci-fi-vacuum.test.ts:456 (1524 title vs body); docs/specs/cards/vacuum.md:839 note ("The malformed-shortcut test (TC-VACUUM-U-1534)" — the malformed test is the 1524-titled one at :456; 1534 tests an ABSENT service)
  FIX-CLASS: corrects
NOTES:
- Rows 1528, 1529, 1530, 1531, 1532, 1535, 1536 state exactly what their tests assert (inputs, single config-changed, resulting values, _edit/_shortcutId reset, selected id 0, non-empty labels).
- Row 1533 states its conditional assertion, including the fallback branch that only checks `el.config` is defined — conforms to FR-2 and anti-pattern 2.
- Row 1534 matches: the passed shortcut config also lacks `service`; assertion is callService not called.
- Guard TC-VOI-U-01..10 matches the spec table one for one; TC-VOI-U-06 checks plugs for prefixed ids and all of src/ for unprefixed TC-15xx, which covers "no id of either form". Ran `vitest run tests/cards/vacuum tests/specs/ids-cas-uniques.test.ts`: 78 passed.
CONFORMANCE EVIDENCE:
- FR-1 → vacuum-ids-declared.test.ts:33-36, 73-77; FR-2 → vacuum.md:910-918 + guard :42-48; FR-3 → diff titles + guard :50-58; FR-5 → vacuum.md:839 + guard :86-91.
RESOLUTION: fixed — vacuum.md note near line 839 rewritten (the 1524-titled test is the malformed-service one, 1534 the missing-service one, the toast test carries no id and its case is spec row 1524); the "same case as TC-VACUUM-U-1524" title stays, the spec row 1524 being the toast case. Also found by IT-03 and fixed: blueprint Covers cells in docs/specs/05_cards.md (TC-506 -> TC-VACUUM-U-1518) and docs/specs/10_card_editors.md (TC-1016 -> TC-VACUUM-U-1536); proof: full vitest 103 files / 1284 tests green (/tmp/full2.log).
