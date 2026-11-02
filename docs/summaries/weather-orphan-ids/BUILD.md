# BUILD — weather-orphan-ids (stage summary)

**Decided:**
- Guard written first, seen RED (4 of 7 failed), then docs row and renames turned it green.
- Four titles of sci-fi-weather.test.ts renamed per FR-3 (Edit on title strings only).
- TDD lock re-done with --reason (4 titles withdrawn by rename, spec FR-3 supersedes).
- test-compacted: plan found 0 removable tests; apply/verify recorded.
- Guard never spells an IT-WOI-I id.

**Artifacts:**
- tests/cards/weather/weather-ids-declared.test.ts (new)
- tests/cards/weather/sci-fi-weather.test.ts (4 titles)
- docs/specs/cards/weather.md (row IT-WEATHER-I-004)
- .sc/task.md, .sc/smoke.yaml (npm run build)

**Intent items touched:** none

**Open/risky:** VERIFY must play the three integration rows of the spec: diff of the test file against merge-base (4 lines -/+), spec guards (ids-cas-uniques, blueprint-traceability), full vitest. Run of tests/cards/weather + tests/specs: 134 passed. Do not commit dist/, do not push.

**Dead ends:** none

**Next action:** VERIFY: /verify-stage, full vitest run, build via smoke recipe.

**Tests:** files +1 ~1 −0 · cases +14 −4
