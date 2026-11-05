# Adversarial review — stove-power-level

Spec: `docs/specs/stove-power-level/spec.md`. Regime: fan-out (recorded). Lenses: Security, User, Scope — sub-agents on sonnet (author: opus), blind to each other. Packet: `.sc/review/968d89b-ee4b291a`.

User decisions already taken (to cite as ACCEPTED if re-raised): root field `number_power_level` (ADR-005); `sf-wheel`; bounds min/max/step with fallback 1/5/1; unavailable -> disabled, hvac off -> settable; configured-but-absent entity -> no wheel (FR-12, user 2026-11-05).

Verdict: 0 CRITICAL, 4 HIGH, 4 MEDIUM, 5 LOW — all RESOLVED in the fix round 2026-11-05 (user decisions F-01..F-04, F-08..F-10, F-13).

## Findings

- [HIGH] — F-01 [CONTRACT] Fractional step: `v = min + k·step` with `String(v)` yields `0.30000000000000004`, never matching `String(Number(state))` = "0.3"; HA number allows float steps, no FR/TC covers it (Security, User, Scope) [RESOLVED] TC-SPL-U-1126
- [HIGH] — F-02 Unbounded item count: "Pas de garde" on items; step 1e-6 or max Infinity/1e9 freezes the dashboard (client DoS) — no finiteness check, no cap (Security, User, Scope) [RESOLVED] TC-SPL-U-1129
- [HIGH] — F-03 No feedback while set_value is pending: wheel stays on the hass value, no optimistic/pending state specified, sf-wheel local selection behaviour unstated (User) [RESOLVED] TC-SPL-U-1130
- [HIGH] — F-04 Rapid repeated wheel-change unspecified: no debounce/serialisation/last-write-wins, out-of-order completion, toasts not coalesced (User, Security note) [RESOLVED] TC-SPL-U-1130
- [MEDIUM] — F-05 Numeric conversion edges unpinned: `Number("")` = 0 selects item 0, `parseFloat("3abc")` = 3, Infinity passes; value not checked for finiteness nor membership of the item list / min-max before the call (Security, Scope) [RESOLVED] TC-SPL-U-1118
- [MEDIUM] — F-06 "Non numérique" undefined (null, "", "5" string, Infinity) and per-bound fallback only tested all-or-nothing in TC-SPL-U-1118 — no partial-attribute row (Scope, Security) [RESOLVED] TC-SPL-U-1118
- [MEDIUM] — F-07 Toast carries err.message verbatim: spec does not state it is bound as text (not unsafeHTML); no TC asserting markup renders as text (Security) [RESOLVED] TC-SPL-U-1132
- [MEDIUM] — F-08 User-visible state matrix incomplete: numeric state outside items (0, 7 with max 5) leaves an enabled wheel with nothing selected; disabled wheel has no visible explanation (User) [RESOLVED] TC-SPL-U-1131
- [LOW] — F-09 Non-number entity not guarded: editor picker not filtered to number domain, FR-12 checks presence only, so `switch.x` renders a wheel and set_value is sent to it (Security, User) [RESOLVED] TC-SPL-U-1128
- [LOW] — F-10 FR-7 also disables on `unknown`, while the recorded user decision names only `unavailable` — unrecorded extension (Scope) [RESOLVED] TC-SPL-U-1119
- [LOW] — F-11 Weak assertions: TC-SPL-U-1116 snapshot baseline location unnamed; IT-1104 and TC-SPL-U-1121 do not assert toast text/variant; TC-SPL-U-1122 duplicates the domain-literals guard (Scope) [RESOLVED] TC-SPL-U-1121
- [LOW] — F-12 Assumptions validated by tests that cannot fail on them: Assumption 4 (no attributes.entity_id fallback) via TC-SPL-U-1121 without a divergent mock; Assumption 1 only on mocks (Scope) [RESOLVED] TC-SPL-U-1121
- [LOW] — F-13 Accessibility: no accessible name/aria-label for the wheel, no keyboard/screen-reader behaviour for disabled state; "Power" ambiguous in EN (User) [RESOLVED] TC-SPL-U-1127

## Cross-lens synthesis

- Convergence: F-01 and F-02 raised independently by all three lenses — highest confidence; both stem from FR-5's item generation and the "Pas de garde" Builder line.
- Convergence: F-05/F-06 (Security + Scope) — one missing definition of "numeric" (`Number.isFinite`) across FR-5, FR-6, FR-8.
- Tension: F-03/F-04 (User wants responsiveness, optimistic value) vs Security's membership/clamp guard in F-05 — an optimistic value must still be validated.
- Pattern: the spec states happy-path conversions (`String`, `Number`, `parseFloat`) without their JS edge semantics.
- Blind spot: `input_number` entities and the number `mode` attribute — noted by User/Scope, not ranked.

## Stress-test

One hostile pass over the top arguments. F-01 holds: float accumulation is deterministic in JS and the spec itself admits fractional steps — it is a real contract gap, not hypothetical. F-02 holds: attributes come from any integration and the editor lets the user point at any entity. F-03/F-04 hold for a cloud-polled Fumis integration (multi-second latency); they may be partly answered by existing sf-wheel behaviour, which no lens verified in code — the fix round must check sf-wheel before writing the FR. F-10 is the weakest (reasonable extension) but still needs a written decision. Verdict: spec not ready for BUILD until F-01..F-08 are written into FR/TC rows.

## Hostile-Input Checklist

- HIC-1 FINDING F-02
- HIC-2 FINDING F-07
- HIC-3 FINDING F-09
- HIC-4 N/A — no new privileged surface; the card calls an HA service under the user's own session, HA enforces authorization
- HIC-5 FINDING F-06
- HIC-6 FINDING F-05

## Builder check

One cold builder (sonnet, foreground, spec only), 2026-11-05. 8 questions.

### Answered

- Q3 `{ min: 7 }` alone — whole-trio replacement already followed from FR-5.1; example added in FR-5.1.
- Q7 how the card reaches `sf-toast` — existing pattern `querySelector('sf-toast')` + `addMessage(text, error)` now cited in FR-8.
- Q8 can a disabled wheel emit — no, `sf-wheel` disables its buttons (FR-7); no spec change.

### My calls

- Q1 pending-release state machine (dispatch vs settlement, rejected call, new change after send) — explicit idle/waiting/sent automaton written in FR-8 (agent's call).
- Q2 entity absent/disabled during waiting — reset to idle both on `hass` assignment and at expiry, written in FR-8 (agent's call).
- Q6 bounds change during the 400 ms with `k` out of range — no call, no clamp, written in FR-8 (agent's call).
- Q4 snapshot ordering and normalisation — recorded first in BUILD before any source write, comments and inter-tag whitespace stripped, written in TC-SPL-U-1116 (agent's call).
- Q5 half-way rounding — `Math.round` half-up, written in FR-6 (agent's call).

### Theirs

none
