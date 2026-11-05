# SPEC - stove-power-level (stage summary)

**Decided:**
- Root config field number_power_level (ADR-005 asked, user approved); ve4.2 adds number_fan_speed the same way.
- Control: sf-wheel in the bottom bar; bounds from min/max/step, per-bound fallback, whole trio 1/5/1 when step<=0, min>max, non-finite or >50 items; item id = integer index, value toFixed(d).
- unavailable/unknown/non-numeric -> wheel disabled with title; hvac off -> settable; entity absent or domain not number/input_number -> no wheel.
- Write: last choice wins, one <domain>.set_value after 400 ms debounce, one toast; card holds the optimistic pick (sf-wheel never sets selectedId).
- Domain filter lives in the card (editor field is free text, sf-editor-input).
- Spike: no. Review regime: fan-out. Intent triptyque: IA-SPL-1..5 all accepted.

**Artifacts:**
- docs/specs/stove-power-level/spec.md
- docs/specs/cards/stove.md (F-STOVE-D09, section, selector, error row, AP 9)
- docs/intent-trace/stove-power-level.yaml
- docs/adversarial-review/stove-power-level.md (13 findings RESOLVED, builder check)

**Open/risky:**
- tests/specs/ guards (blueprint-traceability, delivered-design, ids-cas-uniques) are red until BUILD writes tests/cards/stove/sci-fi-stove-power-level.test.ts and the cited ids.
- The no-config render snapshot must be recorded FIRST in BUILD, before any src/ write.
- Repo id rule: IT-<X>-I-nn for integration, TC- ids are -U-.

**Next action:** BUILD - record the no-config snapshot, write the tests (TDD lock), then config, card, editor, labels.

**Tests:** files +23 ~25 −1 · cases +134 −35 · 9 earlier test file(s) edited, none lost a case
