# SPEC summary — weather-orphan-ids (bead ha-sci-fi-78y.5)

Spec: docs/specs/weather-orphan-ids/spec.md
Review: docs/adversarial-review/weather-orphan-ids.md (12 findings: 11 RESOLVED, 1 FALSE; builder check done)

## Decisions
- IT-004 tests real behaviour: title becomes IT-WEATHER-I-004, docs/specs/cards/weather.md gains that row after IT-WEATHER-I-003.
- IT-005/006/007 are line-citing coverage tests: titles lose id and line number, exact new wording in FR-3. IT-007's kind-change behaviour is held by IT-WEATHER-I-001.
- TC-502 and TC-503 stay: declared in 05_cards.md, cited only here, and in the F-CARD-05 Covers cell; dropping them breaks ids-cas-uniques and blueprint-traceability.
- Declared set for the guard = weather.md heads + the ids on the F-CARD-05 line for this file (TC-504 must be rejected).
- Guard tests/cards/weather/weather-ids-declared.test.ts (7 cases TC-WOI-U-01..07), outside tests/specs/; never spells an IT-WOI-I id (they carry the unplayed mark).
- Editor test ids stay with 78y.8.

## Files to touch in BUILD
- tests/cards/weather/weather-ids-declared.test.ts (new, write first, watch fail)
- tests/cards/weather/sci-fi-weather.test.ts (4 titles only)
- docs/specs/cards/weather.md (1 row)

## Cases
TC-WOI-U-01..07 in the guard; IT-WOI-I-01..03 played at VERIFY.

## Dead ends
none. Spike declined. Do not commit dist/.

**Tests:** files +4 ~6 −1 · cases +79 −47
