# Adversarial review — bridge-unrendered-config

Spec: docs/specs/bridge-unrendered-config/spec.md. Regime: fan-out, three lenses (Security, User, Scope), each on opus (cross-model: the author is not opus), one pass. Packet: .sc/review/fedabc6-2c0db646. No vendored contract, so no `[CONTRACT]` finding.

User rulings held, not contested: default vehicle icon stays `sci:landspeeder`; lock toggle is one click without confirmation. F-01 attacks the paperwork around the second ruling (its recorded source), not the ruling.

## Summary

Verdict: the spec is sound in shape and every part of its scope traces to bead ha-sci-fi-vp3, but it overstates its claim in four places. Counts: 0 CRITICAL, 4 HIGH, 6 MEDIUM, 2 LOW; all UNRESOLVED at this step (the fixes open in a fresh context).

Cross-lens matrix:

| Signal | Findings | Lenses |
|---|---|---|
| Convergence (high confidence) | F-07 (toast text and orphan `Locking…`/`Unlocking…` strings), F-09 (stale `running_states`) | Security+User+Scope |
| Pattern (FR-4 editor input is under-specified) | F-02, F-03, F-09 | Security, User, Scope |
| Pattern (lock button under-specified around non-happy states) | F-05, F-06, F-08, F-10 | Security, User |
| Tension | F-01 (Security wants a gate on unlock) vs the user's one-click ruling: resolved by recording the ruling as the source, not by adding a dialog | Security vs User |
| Blind spot | F-04: the doc snippet in bridge.md contradicts FR-3 and TC-BUC-U-08 would not catch it | Scope |

## Stress-test

Hostile critic over the lens signals. Attack on the weakest joint: FR-4. The editor is MANDATORY, and FR-4 both throws on a string `running_states` (F-02) and eats the comma or space on every keystroke (F-03), so the one input this lot adds to the editor is either unusable or crashes it. TC-BUC-U-05 sets the whole string in one go and hides the keystroke path. Second joint: the lock button. FR-3 turns an inert indicator into an actuator for a physical door; the one-click choice is the user's, but its source cited in Assumption 4 is this lot's own bridge.md edit (circular), and nothing tests that PIN locks, in-flight clicks, or transitional states behave. The dead-CSS removal (FR-6) and the vehicle icon (FR-5) hold up. Verdict: not ready to build until the four HIGH findings close in the spec; the MEDIUMs are one-line amendments each. No finding is a redesign (divergence check: first round, nothing to compare).

## Findings

### Findings — HIGH

[HIGH] — F-01 Assumption 4 cites bridge.md « Pas de confirmation » as its TELL source, but that phrase exists only in this lot's own uncommitted bridge.md edit; HEAD says only « le clic … déclenche l'inversion de l'état ». Record the user's ruling (one click, no confirmation) as the source and state it as a requirement row. [RESOLVED] TC-BUC-U-03 (Assumption 4 now cites the user ruling; FR-3 states "One click, no confirmation dialog"; TC-BUC-U-03 asserts no dialog)
[HIGH] — F-02 FR-4 `running_states.join(', ')` throws TypeError in the mandatory editor render when the YAML holds a string (`running_states: Running`), so the user cannot repair it from the UI; this crash is introduced by this diff. Use a guarded expression and add a test row. [RESOLVED] TC-BUC-U-12
[HIGH] — F-03 FR-4 re-renders `.value` from `join(', ')` on every `input-update` keystroke, which deletes the trailing comma or space just typed; multi-word states (`Washing machine`) and second entries cannot be typed char by char. TC-BUC-U-05 sets the whole string at once and hides it. [RESOLVED] TC-BUC-U-11
[HIGH] — F-04 bridge.md `_toggleLock` snippet still sends `lock.lock` for `jammed`/`unavailable` and calls `hass.callService` directly (anti-patterns 4 and 5); FR-7 and TC-BUC-U-08 only check that `.lock-btn` is named, so the contradiction passes. [RESOLVED] TC-BUC-U-08 (bridge.md snippet rewritten with bridgeCall and the locked/unlocked guard; FR-7 and TC-BUC-U-08 now assert it)

### Findings — MEDIUM

[MEDIUM] — F-05 FR-1 disables the siren toggle only when the entity is absent; a present switch in `unavailable`/`unknown` stays clickable and the failed call is silent (lock gets the guard, siren does not). [RESOLVED] TC-BUC-U-10
[MEDIUM] — F-06 FR-3 sends only `{ entity_id }`; a lock with `attributes.code_format` rejects it, `bridgeCall` swallows the error, so the control is a dead button (anti-pattern 1 class). [RESOLVED] TC-BUC-U-09
[MEDIUM] — F-07 FR-2 and FR-3 do not specify the `bridgeCall` success toast text, and Assumption 6 lists `Locking…`/`Unlocking…` strings no FR renders; the builder must invent client-visible text that no test checks. [RESOLVED] TC-BUC-U-02 (toasts `Sirens on/off`, `Door locked/unlocked` in FR-2/FR-3, asserted in TC-BUC-U-02 and TC-BUC-U-03; `Locking…`/`Unlocking…` now rendered as the lock title, asserted in TC-BUC-U-09)
[MEDIUM] — F-08 No in-flight guard on the lock button: `locking`/`unlocking` may arrive after a second tap, so a double tap can send contradictory calls. [RESOLVED] TC-BUC-U-09
[MEDIUM] — F-09 FR-4 does not say what happens to `running_states` when the cycle `entity` changes to a non-`sensor.` value (hidden stale key, anti-pattern 1), and `_updateCycle` merges, so "a blank value removes the key" leaves the key as `undefined` and TC-BUC-U-05 "no `running_states` key" fails or lies. [RESOLVED] TC-BUC-U-13
[MEDIUM] — F-10 FR-3 keeps `lockClass`/icon mapping, so `locking` shows an open padlock in the unavailable colour and `jammed` looks like a dropped node; the icon-only button has no `title` or `aria-label` (unnamed control that unlocks a door). [RESOLVED] TC-BUC-U-09

### Findings — LOW

[LOW] — F-11 FR-5 half-retires `mdi:ev-station`: `config.ts` comment (`default: 'mdi:ev-station'`) and the editor accordion header icon still say it. [RESOLVED] TC-BUC-U-06
[LOW] — F-12 FR-6 requires `.siren-row` rules with no stated content; `.toggle-row` already styles the row, and TC-BUC-U-07 only asserts the selector exists (speculative hook). [RESOLVED] TC-BUC-U-07 (FR-1/FR-6: `.siren-row` is a marker class with no rule; TC-BUC-U-07 asserts no rule)

ALSO_NOTED (resolve nothing): comma inside a state is unrepresentable; siren off silenced during a real fire; no Error Handling row for siren `unavailable`; IT-BUC-I-03 bundles the vehicle FR-5 check with an unrelated cycle test; FR-2 hardcodes `switch`; siren absent-state icon colour unspecified.

## Hostile-Input Checklist

HIC-1 N/A — the only new input is a dashboard-owner YAML/editor string, no request, range, pagination or loop bound is added
HIC-2 N/A — `running_states` and names reach the DOM only through lit text and attribute bindings, which encode them; nothing is stored server-side
HIC-3 N/A — entity ids come from the owner's config and go to `hass.callService` as data; no SQL, shell, filesystem, template or URL sink
HIC-4 N/A — no bootstrap or role model; HA authorizes service calls
HIC-5 FINDING F-02
HIC-6 N/A — no numeric or enum field is introduced; lock and switch states are string-compared against a closed set (see F-05 for the open case)

## Builder check

One cold builder (sonnet, spec only, 119/119 lines read). No Theirs pile: nothing needs a user answer.

### Answered
- bridgeCall `after`/settle contract and re-render of the in-flight set — FR-3 now names `after(succeeded)` (runs on success and rejection) and requires a reactive set / `requestUpdate()`.
- `sf-editor-input` has no blur event and sets its own `.value` per keystroke — FR-4 now binds `.value` to the raw string and listens to `focusout` on the host.
- Icon/class for `open`/`opening` and for `code_format` locks in `locked`/`unlocked` — FR-3 states them (existing mapping kept, `lock-unavailable` for the rest).

### My calls
- Raw-string map keyed by cycle index, cleared on add/remove/reorder and external setConfig — FR-4.
- Siren colours reuse the neighbouring toggles' tokens; editor shows the vehicle default without writing it; `smoke_switch` picker unchanged; baseline regenerated by the existing package.json script — Builder Calls.

### Theirs
none
