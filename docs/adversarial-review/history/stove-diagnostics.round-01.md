# Adversarial review — stove-diagnostics

Spec: `docs/specs/stove-diagnostics/spec.md`. Regime: fan-out (recorded). Lenses: Security, User, Scope — sub-agents on sonnet (author: opus), blind to each other. Packet: `.sc/review/b55be3c-7894c74f`.

User decisions already taken (to cite as ACCEPTED if re-raised): icon + status-zone line; error « translated (code) »; nothing when all is well; wheel mechanism moved to number-wheel.ts first; fields under `sensors` (sensor_door/sensor_alert/sensor_error); unavailable/unknown -> nothing shown.

Verdict: 0 CRITICAL, 0 HIGH, 9 MEDIUM, 4 LOW — all UNRESOLVED (fix round opens in a fresh context).

## Findings

- [MEDIUM] — F-01 Value normalisation: whitespace-only / ' ' / NaN / 0 `code`, case variants ('None', trailing spaces) of state and of none/unavailable/unknown not specified; FR-5/FR-7 activate a blank or ` ( )` line (Security, Scope, User)
- [MEDIUM] — F-02 Unbounded attribute text: `String(code)` and state rendered "sans transformation" with no length cap, repeated in line, title and aria-label (Security, User)
- [MEDIUM] — F-03 FR-9 failure path: formatEntityState throwing, returning non-string or empty string unspecified; untranslated label duplicating code ("e101 (E101)"); `hass.states[id]` presence not an own-property lookup (Security, User, Scope)
- [MEDIUM] — F-04 Single generic badge `mdi:alert-circle` carries no severity/precedence; `title` tooltip unavailable on touch; door + alert=door_open print two near-identical lines, duplication intent unstated (User, Scope)
- [MEDIUM] — F-05 Accessibility: diagnostics lines not in a live region, colour-only differentiation, badge size/position/overlap with stove-image overlays unspecified, possible double announcement badge + line (User, Scope)
- [MEDIUM] — F-06 Layout overflow: up to 3 extra lines in `.temperatures` with no wrap/ellipsis/max-lines rule; no narrow-width check (User)
- [MEDIUM] — F-07 FR-1 pure move has no mechanical proof: TC-SDG-U-01 greps two declarations, does not assert the 17 exports, imports in sci-fi-stove.ts, tsc green (Scope)
- [MEDIUM] — F-08 FR-2 ≤800-line cap unquantified: no expected post-move count nor budget for FR-3..FR-8 additions; assertion only after the move, not at end of lot (Scope)
- [MEDIUM] — F-09 Regression snapshot (TC-SDG-U-02) recorded AFTER FR-1, so it cannot catch a move regression; file path unnamed; TC-SDG-U-03 and IT-SDG-I-02 depend on it (Scope)
- [LOW] — F-10 Config fields not type-validated: non-string sensor_door/alert/error from YAML reaches getRelevantEntities (Security)
- [LOW] — F-11 Editor pickers not domain-filtered (binary_sensor for door, sensor for alert/error); misconfiguration is a silent no-op; msg() vs formatEntityState language mismatch (User)
- [LOW] — F-12 TC-SDG-U-06 checks only `.diagnostic-text` for markup-as-text, not `title`/`aria-label` (Security)
- [LOW] — F-13 Weak visual/doc TCs: TC-SDG-U-08 greps styles.ts (no colour, z-index, pointer-events), TC-SDG-U-10 checks three tokens only, not FR-12 section/matrix rows (Scope)

## Cross-lens synthesis

- Convergence: F-01 and F-03 raised by all three lenses — input normalisation of state/code and the label fallback are the spec's weakest area.
- Convergence: F-02 (Security + User) — unbounded string, a DoS-of-layout as much as a security issue; ties to F-06.
- Convergence: F-04 door/door_open duplication (User + Scope).
- Tension: F-02/F-06 truncation vs ACCEPTED « translated (code) » — truncation must not drop the code.
- Pattern: the refactor half (F-07..F-09) is proven only by suites that pre-date it; the feature half lacks edge rows.
- Blind spot: refresh on state change (only ALSO_NOTED), HA minimum version for formatEntityState (Assumption 3 uncited).

## Stress-test

One hostile pass. F-09 holds hardest: a snapshot taken after the move is circular, it is the cheapest fix and the largest risk to the refactor. F-01 holds: HA state strings come from any integration; a ' ' code is realistic for Fumis firmware. F-03 holds partly: formatEntityState exists in supported HA versions, but the empty/duplicate-label case is real. F-04 is a product question (severity precedence, dedup) — needs the user. F-02 is plausible but low-probability; F-06 depends on styles.ts, unverified by any lens. F-08 may be answerable by a quick line count. No lens found a CRITICAL; verdict: spec not ready for BUILD until F-01, F-03, F-07, F-09 are written into FR/TC rows and F-04/F-05/F-06 decided.

## Hostile-Input Checklist

- HIC-1 FINDING F-01
- HIC-2 FINDING F-02
- HIC-3 FINDING F-03
- HIC-4 FINDING F-10
