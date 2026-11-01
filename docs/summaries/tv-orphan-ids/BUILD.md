# BUILD — tv-orphan-ids (stage summary)

**Decided:** guard written first, seen RED (3 of 5 failed), then rows and renames turned it green. Titles/comments only renamed (perl on it( and // lines); tdd lock re-done with --reason. .sc/smoke.yaml recipe is a vitest run of the guard (no launchable surface).

**Artifacts:**
- tests/cards/tv/tv-ids-declared.test.ts (new)
- docs/specs/cards/tv.md (30 rows 716..745, note now "quarante-neuf lignes")
- tests/cards/tv/sci-fi-tv.test.ts, tests/cards/tv/sci-fi-tv-editor.test.ts (titles/comments)
- .sc/task.md, .sc/smoke.yaml

**Intent items touched:** none.

**Open/risky:** tests/specs/ids-cas-uniques.test.ts O1 FAILS: docs/specs/tv-orphan-ids/spec.md carries unplayed marks (IT-TVO-I-01..03) but not the sentence "⬜ dans la colonne ID : le cas n'est joué par aucun test." the guard demands. Spec is settled and outside BUILD scope; needs a spec decision. tv suite green (77 passed).

**Dead ends:** none.

**Next action:** VERIFY; resolve the O1 failure (add the note to the lot spec) first.

**Tests:** files +1 ~2 −0 · cases +36 −30
