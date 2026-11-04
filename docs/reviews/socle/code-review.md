AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/types/entity-ids.ts | 1-22 | 22 | yes |
| src/selectors/climate.ts, house.ts, light.ts | diff hunks | see wc | no (diff-scoped) |
| src/types/ha.ts | diff hunk | see wc | no (diff-scoped) |
| src/cards/* (bridge, climates, hexa-tiles, lights, lights-editor, stove, tv, vacuum, water-management, weather) | diff hunks + water-management :141/:307/:318/:353 | see wc | no (diff-scoped) |
| tests/specs/socle-contract.test.ts | 250-300 | see wc | no (guarded block) |
| docs/specs/cards/water_history.md | diff hunk | see wc | no (diff-scoped) |
| docs/specs/02_domain_selectors.md | grep + Public Interface row count | see wc | no |
| docs/specs/climates-floor-fallback/spec.md (out of diff) | 1-15 + grep | see wc | no |
VERDICT: APPROVE
SPEC: docs/specs/02_domain_selectors.md, docs/specs/cards/water_history.md
FINDINGS:
- [LOW] docs/specs/climates-floor-fallback/spec.md:42 — OUT-OF-DIFF: still says the climates card calls getFirstFloor(hass) and cites house.ts:58-61 (also :58, :107); O2 removed that function, the code uses allFloors[0]?.floor_id (src/cards/climates/sci-fi-climates.ts:78).
  RESOLUTION: filed — bead ha-sci-fi-nu33
NOTES:
- npx vitest run (reviewer) → exit 0, 136 files, 1622 passed | 1 skipped.
- O2: no caller left in src/, dev/, tests/ (all import forms); remaining mentions are the spec deletion record and absence tests.
- O4: isClimateActive gone except in the absence test; three call sites and socle-contract use isClimateNotOff; body unchanged.
- O3: no reader of entry.domain in src/ or dev/.
- O5: every replaced literal equals the constant (sun.sun, sensor.season, person.CHANGE_ME, climate.poele, vacuum.robot, weather.forecast_home, media_player.bravia_4k_vh22, light.new); water demo ids match; lights editor key `${NEW_CUSTOM_LIGHT}${i}` gives the same light.newN.
- water_history.md re-cites correct (:141, :307, :318, :353; +1 from the added import).
- socle-contract threshold >14 → >12 matches the 13-row table; per-row caller check intact.
- O1 (14z) escalated, no code.
CONFORMANCE EVIDENCE:
- O5 → src/types/entity-ids.ts:6-22; O4 → src/selectors/climate.ts:31-35, sci-fi-climates.ts:148/158/203; O3 → src/types/ha.ts:44-45; O2 → tests/specs/socle-contract.test.ts:258-283.
