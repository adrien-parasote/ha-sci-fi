# SPEC summary — vehicles-orphan-ids (bead ha-sci-fi-78y.6, lane feature)

Spec: docs/specs/vehicles-orphan-ids/spec.md (gated: spec-gate-passed, adversarial-passed). spike-offer=no, build-mode=headless.

## Decisions
- Nine titles of tests/cards/vehicles/sci-fi-vehicles.test.ts cite undeclared ids (TC-1215, TC-V01..V08). User chose: add a row in docs/specs/cards/vehicles.md per id, rename the title to TC-VEHICLES-U-1215..1223 (old->new in spec Overview table).
- TC-508 stays in the TC-V01 title (declared by 05_cards.md, F-CARD-07 row).
- Title strings only; no body/comment edits (old ids in comments accepted, FR-5).
- Lot's own ids use prefix VEHOI (not VOI, taken by vacuum lot).

## Files to touch in BUILD
- tests/cards/vehicles/sci-fi-vehicles.test.ts: nine it() titles (Edit, exact old text, one call each).
- tests/cards/vehicles/vehicles-ids-declared.test.ts: NEW guard, shape of tests/cards/weather/weather-ids-declared.test.ts (TC-VEHOI-U-01..08, eight separate it blocks).
- docs/specs/cards/vehicles.md: rows 1215..1223, F-VEH-D06 cell, "vingt-six" note are ALREADY written at SPEC; verify only.

## Cases
TC-VEHOI-U-01..08 (guard, FR-1..FR-4); IT-VEHOI-I-01..03 (diff check, ids-cas-uniques + blueprint-traceability, full vitest) played by commands at VERIFY, flagged unplayed in the table.

## Dead ends / traps
- Do not declare bare TC-1215/TC-V0n; do not drop TC-508.
- Guard must not spell any IT-VEHOI-I-* id nor old ids in full (build from fragments).
- Guard under tests/cards/vehicles/, not tests/specs/.
- headsOf must accept ** and trailing unplayed marker; differs from weather precedent.
- Spec-gate first refused on TELL/SHOW ratio; fixed by pasting grep evidence in Assumptions 4-8.

**Tests:** files +6 ~9 −1 · cases +102 −52 · 1 earlier test file(s) edited, none lost a case
