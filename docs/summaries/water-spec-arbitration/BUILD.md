# BUILD — water-spec-arbitration (stage summary)

**Decided:**
- One guard file, 11 it() titles carrying TC-WSA-U-01..08 and IT-WSA-I-01..03 literally. Zone-anchored checks (rows, bullets, sections); old water_history ids built from fragments.
- Docs-only lot confirmed: src/ and existing tests untouched, water_history.md not edited at BUILD.
- Red proof: every unit case also asserts in-memory mutants (7 days -> 24 hours, deleted trigger phrase, backticked expanded, dropped bead row, drifted src line...) make its check fail.
- IT-WSA-I-01 nested vitest runs with an added --testTimeout=60000 (socle-contract has the 5 s default and flaked at 9 s under load); it cannot recurse (it runs tests/specs and spec-numbering only). Spec text says the bare command: small deviation, spec not edited.
- Smoke recipe .sc/smoke.yaml (ignored) runs the guard, as the vehicles precedent.

**Artifacts:**
- tests/cards/water/water-history-aligned.test.ts
- .sc/task.md (plan, 1 step), .sc/smoke.yaml
- tdd re-locked once (--reason: testTimeout flag, no title change)

**Intent items touched:** none.

**Open/risky:**
- Full suite 109 files / 1328 tests green, but timing tests (entity.selectors IT-202 10 ms, socle-contract 5 s) flaked once each under load during test_reduce verify; a rerun was green.
- test-compaction: 0 of 1328 removable.
- Known Gaps beads existence (bd show of 10 ids) still to check at VERIFY; closing beads o5p and enr is HARDEN.
- Do not commit dist/.

**Dead ends:**
- guard under tests/specs/ (citations not counted)

**Next action:** VERIFY: verify loop, code-review and security-review subagents, bd show on the 10 gap beads.

**Tests:** files +1 ~0 −0 · cases +11 −0
