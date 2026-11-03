# SPEC — bridge-unrendered-config (stage summary)

**Decided:** spike-offer = no; build-mode = headless; .siren-row is a marker class with no CSS rule; lock button = one click with per-entity in-flight guard; running_states editor input only for sensor.* cycles (normalize on focusout); vehicle icon `config.icon ?? 'sci:landspeeder'`.

**Artifacts:** docs/specs/bridge-unrendered-config/spec.md ; docs/adversarial-review/bridge-unrendered-config.md ; docs/intent-trace/bridge-unrendered-config.yaml

**Intent items touched:** none new.

**Open/risky:** builds on docs/specs/bridge-error-matrix/spec.md (bridge-warn.ts, bridge-toggle.ts) - do not contradict. CSS baseline regen must change only the intended dead-CSS lines.

**Dead ends:** none.

**Next action:** BUILD - plan, tests first (TC-BUC-U-01..13, IT-BUC-I-01..03), then implement FR-1..FR-7.
