# SPEC summary — bare-range-ids (bead ha-sci-fi-78y.4)

Spec: docs/specs/bare-range-ids/spec.md
Review: docs/adversarial-review/bare-range-ids.md (6 findings, all RESOLVED; builder check done)

## Decisions
- TC-116 and TC-308 test real behaviour: the specs gain a row each, the test titles keep their bare-range ids. No test file is edited.
- TC-116 goes in docs/specs/11_guidelines_remediation.md after TC-115; TC-308 in docs/specs/03_base_classes.md between TC-307 and TC-309. Rows in French, tokens pinned by TC-BRI-U-04.
- Feature maps updated in place: F-REMED-08 cell gains TC-116, F-BASE-02 cell gains TC-308.
- Guard tests/utils/bare-range-ids-declared.test.ts (outside tests/specs, whose files ids-cas-uniques ignores when it looks for citations; 5 cases TC-BRI-U-01..05), real-tree check restricted to the two ids; walk uses lstat; ghost id TC-9999.

## Files to touch in BUILD
- tests/utils/bare-range-ids-declared.test.ts (new, write first, watch fail)
- docs/specs/11_guidelines_remediation.md (1 row + F-REMED-08 cell)
- docs/specs/03_base_classes.md (1 row + F-BASE-02 cell)

## Cases
TC-BRI-U-01..05 in the guard; IT-BRI-I-01..03 played at VERIFY.

## Dead ends
none. Spike declined. Do not commit dist/.

**Tests:** files +3 ~6 −1 · cases +73 −47
