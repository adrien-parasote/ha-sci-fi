# BUILD summary - vacuum-orphan-ids

## Done
- tests/cards/vacuum/vacuum-ids-declared.test.ts (new, TC-VOI-U-01..10; seen RED 6 failed, then green)
- tests/cards/vacuum/sci-fi-vacuum.test.ts, sci-fi-vacuum-editor.test.ts: titles/comments only (FR-2, FR-3)
- docs/specs/cards/vacuum.md: rows TC-VACUUM-U-1528..1536 after 1526; note near line 839 rewritten (FR-5, 9xf sub-note intact)
- src/cards/plugs/sci-fi-plugs.ts: comment cites TC-VACUUM-U-1535 (FR-4)
- .sc/task.md plan (1 build, 4 steps)

## Tests
- vitest tests/cards/vacuum tests/cards/plugs: green (log /tmp/green.log)
- tests/specs/ids-cas-uniques.test.ts: ONE FAILURE (O1), see below

## Open: spec conflict
FR-4 / TC-VOI-U-06 require sci-fi-plugs.ts to cite TC-VACUUM-U-1535, but
guard O1 in tests/specs/ids-cas-uniques.test.ts flags any vacuum id cited
outside tests/specs/ and a cards/vacuum/ path
("src/cards/plugs/sci-fi-plugs.ts cite TC-VACUUM-U-1535"). IT-VOI-I-02
cannot pass as specified. Needs a spec decision (drop the id from the
comment and amend FR-4/U-06, or exempt it in the guard).

## Not verified
- IT-VOI-I-01 (git diff shape), IT-VOI-I-03 (full vitest)
- Row wording vs assertions: VERIFY code review

**Tests:** files +1 ~2 −0 · cases +25 −11
