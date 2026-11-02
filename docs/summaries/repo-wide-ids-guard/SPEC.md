# SPEC summary — repo-wide-ids-guard (bead ha-sci-fi-78y.8)

Spec: docs/specs/repo-wide-ids-guard/spec.md
Review: docs/adversarial-review/repo-wide-ids-guard.md (12 findings: 11 RESOLVED, 1 FALSE; builder check done)

## Decisions
- New guard tests/docs/repo-wide-ids-guard.test.ts (ids-cas-uniques ignores tests/specs/ for citations). Titles read via the TypeScript AST; ids in literal fragments of non-literal titles count; suffixed ids, `${}` ids and unplaceable shapes are refused.
- Owner from id shape: bare TC-n/IT-n declared by a docs/specs/NN_*.md; derived-prefix ids by that card spec or MASTER.md only; any other prefixed id is a lot id declared by exactly one docs/specs/<dir>/spec.md. No frozen list or count.
- Orphans fixed in BUILD: vacuum guard TC-VOI-U-10 and -04 (drop prose ids), water-history-aligned TC-WSA-U-05 (reword, IT-003), spec-numbering TC-RN-U-07b -> TC-RN-U-07, tests/selectors/house.test.ts TC-202b -> new row TC-208 in 02_domain_selectors.md (already added; ids-cas-uniques red until retitled).
- Per-lot guards: user confirmed the reduced retirement — only TC-VOI-U-01, TC-VOI-U-02 (vacuum) and TC-BRI-U-03 (bare-range) are retired; their rows stay with the id cell marked [RETIRED]. tv, water, weather, vehicles, alias guards stay intact (tv/water cases are not provably subsumed).
- Prefix RWG; TC-RWG-U-01..09, IT-RWG-I-01..03 (marked ⬜, played by command).

## Files to touch in BUILD
- tests/docs/repo-wide-ids-guard.test.ts (new, write first, watch fail)
- tests/cards/vacuum/vacuum-ids-declared.test.ts, tests/utils/bare-range-ids-declared.test.ts (retire 3 cases)
- tests/cards/water/water-history-aligned.test.ts, tests/docs/spec-numbering.test.ts, tests/selectors/house.test.ts (titles)
- docs/specs/vacuum-orphan-ids and bare-range-ids specs (RETIRED marks, stale sentences)

## Dead ends
none. Spike declined (no). Build mode: headless. Do not commit dist/.

**Tests:** files +10 ~9 −1 · cases +175 −89
