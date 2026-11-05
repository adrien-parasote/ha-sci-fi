# SPEC - stove-diagnostics (stage summary)

**Decided:**
- Fields under sensors: sensor_door (binary_sensor), sensor_alert, sensor_error (sensor); wrong domain, unavailable/unknown/none -> nothing shown (user).
- Active diagnostic -> a line in a role=status aria-live=polite .diagnostics zone AND one badge (24 px, image top-right) of the most severe kind: error > alert > door; door open + alert door_open -> one line (user).
- Error text "<HA translation> (<code>)"; formatEntityState in try with raw fallback; code shown once when equal to the label.
- CSS ellipsis on one line; title/aria-label full text capped at 200 chars (user).
- FIRST a pure move of the number-wheel mechanism into src/cards/stove/number-wheel.ts (17 exports, tsc, suites green); sci-fi-stove.ts 670-700 lines after the move, <=800 at end of lot, else diagnostics.ts.
- Spike: no. Review: fan-out. Triptyque IA-SDG-1..5 accepted.

**Artifacts:**
- docs/specs/stove-diagnostics/spec.md
- docs/specs/cards/stove.md (F-STOVE-D11, section, selectors, error rows)
- docs/intent-trace/stove-diagnostics.yaml
- docs/adversarial-review/stove-diagnostics.md (13 RESOLVED, builder check)

**Open/risky:**
- FR-0: record tests/cards/stove/__snapshots__/sci-fi-stove-diagnostics.test.ts.snap (key "pre-lot content") on PRE-lot code, before FR-1; never regenerate with -u.
- jsdom does no layout: narrow-width wrap checked on the stylesheet only.
- Gate advisory: fix round count at its cap (1).

**Next action:** BUILD - FR-0 snapshot commit, then the pure move (FR-1), then tests (TDD lock), then diagnostics.

**Tests:** files +25 ~25 −1 · cases +172 −35 · 9 earlier test file(s) edited, none lost a case
