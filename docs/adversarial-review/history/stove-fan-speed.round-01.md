# Adversarial review — stove-fan-speed

Spec: docs/specs/stove-fan-speed/spec.md. Regime: fan-out, 3 lenses (Security, User, Scope), model sonnet (author: opus).
Counts: 0 CRITICAL, 3 HIGH, 6 MEDIUM, 4 LOW — 11 RESOLVED, 2 ACCEPTED by the user 2026-11-05 (F-07 FR-7.1, F-11 FR-8.1).

User decisions already ACCEPTED (not re-raised by any lens): fallback 0/5/1 as stove-power-level, root field number_fan_speed, wheel right after power, 0 shown as « 0 », label « Ventilation ».

## Cross-lens synthesis

- Convergence (Security #2, User #5, Scope #2): `_releaseNumberWheels()` is multi-wheel; a hass push or fan loss can release the power pick (and vice versa). TC-SFS-U-1106 covers timers only. Raised to HIGH (F-01).
- Convergence (Security #1, Scope #2): inherited rules are cited by reference but not exercised by fan-side TCs (F-04).
- Tension: Scope wants fewer private names in FR-6 (F-08) while Scope/Security want more parametrization stated (F-09) — resolve by keeping NumberWheelSpec + "agent's call" names, but stating which helpers become generic.
- Blind spot: layout of a fifth control in `.bottom` (User only, F-02).

## Stress-test

One pass over the top arguments. F-01 holds: FR-7 forbids cross-release but no TC interleaves a hass reassignment with a pending pick — the refactor's real regression surface. F-02 holds: no FR/TC on width. F-03 holds as a contract gap (Overview cites FR-13, FR-5 list does not). F-05 is admin-only input, kept MEDIUM. Verdict: spec is sound in shape; not BUILD-ready until F-01..F-03 are closed.

## Findings

- [HIGH] — F-01 Shared release can clear the other wheel's pending pick (hass reassignment / entity loss interleaving untested; FR-7 does not say per-wheel vs global release) [RESOLVED] TC-SFS-U-1112 — FR-7 states per-wheel release
- [HIGH] — F-02 No FR/TC that five controls (HVAC, temp, power, fan, eco) fit in `.bottom` on a narrow card (wrap or shrink unspecified) [RESOLVED] TC-SFS-U-1110 — FR-4.1 flex-wrap: wrap (user decision)
- [HIGH] — F-03 [CONTRACT] FR-5 inherited list omits stove-power-level FR-13 (accessible name, "toujours" aria-label) though the Overview cites it [RESOLVED] TC-SFS-U-1104 — FR-5 now lists FR-13
- [MEDIUM] — F-04 Numeric edges (NaN, Infinity, negative min, step 0/-1, state out of bounds) and toast-as-text not exercised by any fan TC [RESOLVED] TC-SFS-U-1113
- [MEDIUM] — F-05 number_fan_speed equal to number_power_level not rejected (two wheels racing on one entity); service domain derived from config id [RESOLVED] TC-SFS-U-1111 — FR-4.2 (user decision; domain from id bounded to number/input_number)
- [MEDIUM] — F-06 Configured but HA-disabled entity yields a silent missing wheel, no editor hint nor doc step [RESOLVED] TC-SFS-U-1109 — FR-11 doc step in stove.md (user decision, no editor text)
- [MEDIUM] — F-07 Pending pick dropped silently when entity goes unavailable before debounce — user-visible outcome not stated [ACCEPTED: spec FR-7.1]
- [MEDIUM] — F-08 FR-6 prescribes private method names and TC-SFS-U-1107 greps them; reactive state vs non-reactive timers unreconciled with Builder Calls [RESOLVED] TC-SFS-U-1107 — FR-6 freezes only NumberWheelSpec/numberGrid; pending @state, timers non-reactive
- [MEDIUM] — F-09 FR-6 silent on `_powerEntity`, `POWER_DOMAINS`, `isPowerDisabled`, `powerValue` becoming spec-parametrized — risk of copy for fan [RESOLVED] TC-SFS-U-1107 — FR-6 lists entity/domains/disabled/value as generic
- [LOW] — F-10 Forged wheel-change id ('99', 'abc') not proven a no-op on the fan wheel [RESOLVED] TC-SFS-U-1114
- [LOW] — F-11 Toast renders raw `String(err)` with no length cap [ACCEPTED: spec FR-8.1]
- [LOW] — F-12 Wheel items 0..5 carry no unit / current-value announcement for screen readers (reuse of power behaviour not stated) [RESOLVED] TC-SFS-U-1104 — FR-4 states power FR-13 reuse, no unit
- [LOW] — F-13 TC-SFS-U-1106 disconnect scenario does not assert both selections revert; fallback line narrower than power FR-8 [RESOLVED] TC-SFS-U-1106

## Hostile-Input Checklist

HIC-1 FINDING F-04
HIC-2 FINDING F-11
HIC-3 FINDING F-05
HIC-4 N/A — card-side UI, authorization is Home Assistant's; no route or first-admin concept
HIC-5 FINDING F-04
HIC-6 FINDING F-04

## Builder check

One cold builder (sonnet, foreground), spec only, 8 questions, 2026-11-05.

### Answered

- Q3 per-wheel release in the hass setter: FR-7 (spec.md) already states it; TC-SFS-U-1112 pins it.
- Q5 `{ min: 1 }` alone gives 1..5: per-bound fallback of FR-5 / power FR-5.1, unchanged.
- Q6 aria-label as attribute, title absent when active: power FR-13, inherited by FR-5.
- Q7 stove.md work left: none, verified by TC-SFS-U-1109 — Builder Calls line added (spec.md § Builder Calls).

### My calls

- Q4 power test reads `_powerPendingIndex` (test line 298): read-only private getter kept — spec.md § Builder Calls.
- Q1 TC-SFS-U-1101 owns its own snapshot, recorded pre-lot, kept after refactor — spec.md § Builder Calls.
- Q2 FR-4.2 strict string equality, both fields non-empty; power guards unchanged — spec.md § Builder Calls.
- Q8 flex-wrap global, no stylesheet snapshot — spec.md § Builder Calls.

### Theirs

- none
