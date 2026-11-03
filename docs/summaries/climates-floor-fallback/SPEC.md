# SPEC - climates-floor-fallback (stage summary)

**Decided:**
- Unconditional floor and area fallbacks, `filter_by` guards and `as any` removed; no config key added (ADR-005). User decision 2026-11-03.
- FR-5 [ACCEPTED-LIMIT] stays: scenarios C and F show a floor title and an empty area, pinned by TC-CFF-U-04.
- F-01 resolved by correcting the spec (Assumption 5, FR-6 narrowed), no new capability. Consequence to name to the user: the fallback writes `_active_floor_id`, so after it runs the card stays on the fallback floor even if a radiator's area is later assigned to another floor (IT-CFF-I-04). With the guards off, the floor was recomputed each render.
- Adversarial: 10 findings, 8 resolved, 2 false (F-05, F-07), 0 deferred. New TC-CFF-U-08 (nullish first element, optional chains), IT-CFF-I-04.
- TC-CFF-U-07 lists the seven `msg()` sources, no comparison with `main`; i18n completeness is TC-I18N-U-11.
- Builder check: no Theirs; calls recorded in Builder Calls.

**Artifacts:**
- docs/specs/climates-floor-fallback/spec.md
- docs/adversarial-review/climates-floor-fallback.md

**Intent items touched:** none

**Open/risky:**
- Review ran past the fix-round cap warning (round 2 recorded), gate passed with 0 open findings.
- Build must edit `docs/specs/cards/climates.md` (FR-7), no `TC-CFF-` id there.
- Integer-like area ids sort first in `getAreas()` (Assumption 3).

**Dead ends:** restricting the area fallback to the active floor (changes scenario A).

**Next action:** BUILD: write tests TC-CFF-U-01..08, IT-CFF-I-01..04 in tests/cards/climates/sci-fi-climates.test.ts, then the code change in src/cards/climates/sci-fi-climates.ts.
