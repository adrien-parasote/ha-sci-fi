# SPEC - stove-fan-speed (stage summary)

**Decided:**
- Twin of stove-power-level: same rules (bounds, 50-item cap, index ids, disabled states, domains, 400 ms debounce), fallback trio 0/5/1, root field number_fan_speed, wheel right after power, 0 shown as "0", label "Ventilation" (new key Fan).
- Shared mechanism: NumberWheelSpec descriptor + numberGrid (frozen names); pending pick @state, timers non-reactive; release is PER WHEEL; a read-only _powerPendingIndex getter is kept for the power-level suite.
- .bottom wraps (flex-wrap) on narrow cards; fan entity equal to power entity -> no fan wheel.
- ACCEPTED (user): pending pick dropped silently on unavailable (FR-7.1); raw uncapped toast text (FR-8.1).
- stove.md documents enabling the fan entity in HA; no editor help text.
- Spike: no. Review regime: fan-out. Triptyque IA-SFS-1..5 accepted.

**Artifacts:**
- docs/specs/stove-fan-speed/spec.md
- docs/specs/cards/stove.md (F-STOVE-D10, section, selector, error rows)
- docs/intent-trace/stove-fan-speed.yaml
- docs/adversarial-review/stove-fan-speed.md (13 findings: 11 RESOLVED, 2 ACCEPTED; builder check)

**Open/risky:**
- Record TC-SFS-U-1101 no-config snapshot FIRST, before any src/ write.
- The power-level suite must stay green with unchanged assertions after the refactor.
- Ids TC-SFS-U-nn / IT-SFS-I-nn (repo-wide ids guard).

**Next action:** BUILD - snapshot, tests (TDD lock), refactor the power wheel into NumberWheelSpec, add the fan wheel, editor, labels.

**Tests:** files +24 ~25 −1 · cases +154 −35 · 9 earlier test file(s) edited, none lost a case
