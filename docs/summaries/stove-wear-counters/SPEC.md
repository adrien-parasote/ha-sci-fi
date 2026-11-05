# SPEC - stove-wear-counters (stage summary)

**Decided:**
- Collapsible "Usure" section (sf-editor-accordion, as the water card face does), collapsed by default, after .bottom; HA-formatted values, no graph (user).
- Every configured counter keeps its row; unreadable (unavailable/unknown, wrong domain, malformed or missing id) shows "—"; no counter configured -> no section (user D5).
- No editor hint, free text (user, ACCEPTED FR-10 / AR-2).
- Fields under sensors: sensor_heating_time, sensor_fuel_used, sensor_igniter_starts, sensor_misfires, sensor_overheatings; id guard 255 chars + /^[a-z0-9_]+\.[a-z0-9_]+$/.
- FR-1: the formatEntityState fallback moves to src/cards/stove/state-label.ts, shared by diagnostics and wear; rendering in wear-counters.ts; sci-fi-stove.ts <= 790 lines at end of lot.
- Spike: no. Review: fan-out. Triptyque IA-SWC-1..4 accepted.

**Artifacts:**
- docs/specs/stove-wear-counters/spec.md
- docs/specs/cards/stove.md (F-STOVE-D12, section, selectors, error rows)
- docs/intent-trace/stove-wear-counters.yaml
- docs/adversarial-review/stove-wear-counters.md (13 RESOLVED, 1 ACCEPTED, builder check)

**Open/risky:**
- FR-0 snapshot key "pre-lot container" recorded on PRE-lot code first.
- The spec says Object.hasOwn: the repo tsconfig lacks ES2022 (seen in stove-diagnostics) -> use Object.prototype.hasOwnProperty.call, same semantics.
- The write gate refuses a pure move before the TDD lock (L135): order snapshot -> tests/lock -> moves.

**Next action:** BUILD - FR-0 snapshot commit, tests (TDD lock), state-label.ts move, wear-counters.ts, editor, labels.

**Tests:** files +27 ~25 −1 · cases +197 −36 · 9 earlier test file(s) edited, none lost a case
