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

AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| .sc/review/0afbbca-141eb894/delta.patch | all | — | yes |
| docs/specs/vacuum-orphan-ids/spec.md | delta hunks (Assumption 3, Decisions blueprint line) | 106+ | delta only |
| docs/specs/cards/vacuum.md | 834-844, 18-20, 901-918 | — | partial (closure of round 1 finding) |
| docs/specs/05_cards.md | 34 | — | partial (Covers cell) |
| docs/specs/10_card_editors.md | 28 | — | partial (Covers cell) |
| tests/cards/vacuum/sci-fi-vacuum.test.ts | 454-458, 581-585 | — | partial (closure) |
VERDICT: APPROVE
SPEC: docs/specs/vacuum-orphan-ids/spec.md
FINDINGS: none
NOTES:
- Round 1 MEDIUM (the error-toast test was said to share TC-VACUUM-U-1524 with a test that asserts something else): closed. docs/specs/cards/vacuum.md:839 now states it correctly. The toast test carries no id of its own and its case is spec row 1524. The test titled 1524 is the malformed-service one, and 1534 is the missing-service one. spec.md Assumption 3 was rewritten to match. This agrees with sci-fi-vacuum.test.ts:456 and :583.
- Blueprint Covers cells were checked. docs/specs/05_cards.md:34 now cites TC-VACUUM-U-1518 and docs/specs/10_card_editors.md:28 now cites TC-VACUUM-U-1536. Both ids exist as rows (vacuum.md:901, :918) and in test titles.
- OUT-OF-DELTA: tests/cards/vacuum/sci-fi-vacuum.test.ts:454-456. Its comment reads "toast error" and its title is TC-VACUUM-U-1524, while the body tests a malformed service. vacuum.md:20 (F-VAC-D07, toast feedback) and row 907 therefore cite a test that does not check the toast. The fault predates this lot, which never renamed that test; the note now documents it. It is a candidate bead, not this round's block.
- I ran `vitest run tests/cards/vacuum tests/specs`: 11 files and 160 tests passed.
CONFORMANCE EVIDENCE:
- FR-5 (the vacuum.md note keeps its meaning and names the new ids) → vacuum.md:839; FR-3 (the old 1528 and 506 lose their ids) → sci-fi-vacuum.test.ts:583 title and 05_cards.md:34.

AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| .sc/review/0afbbca-adf45291/delta.txt | all | — | yes |
| .sc/review/0afbbca-adf45291/delta.patch | file headers, review-history hunks, spec.md hunk | 10846 | partial (dist hunks measured, not read line by line) |
| dist/sci-fi.min.js | size/stat comparison against HEAD | 10531 | no (build artifact) |
| src/cards/plugs/sci-fi-plugs.ts | git diff HEAD | — | diff only |
VERDICT: APPROVE
SPEC: docs/specs/vacuum-orphan-ids/spec.md
FINDINGS: none
NOTES:
- Delta scope: dist/sci-fi.min.js, the review history files, and one wording line in docs/specs/vacuum-orphan-ids/spec.md (risk table row 1). No file under src/ or tests/ moved in this delta.
- The lot's whole source diff against HEAD is still the single JSDoc line at src/cards/plugs/sci-fi-plugs.ts:81 ("TC-1530" becomes "its willUpdate reset case"). Terser strips comments, and neither string appears in the old or new bundle.
- The bundle grew by about 7 KB (658+/602-) from a comment-only change. That is explained by the committed bundle being stale: 10+ src commits (3c47afe, 0c8bfd0, 36d25f0, ...) landed after the last dist rebuild (0c1b3b7). The regenerated bundle is a catch-up artifact, not lot behaviour. An independent byte-for-byte rebuild could not be done outside the tree, because @rollup/plugin-typescript refuses an output outside outDir. Provenance is therefore inferred, not proven.
- Prior round-1 MEDIUM and its RESOLUTION stay above, closed in round 2. No contested findings or survivors to re-rule.
CONFORMANCE EVIDENCE:
- No source change beyond a comment → `git diff HEAD -- src` shows only sci-fi-plugs.ts:81 comment line.
