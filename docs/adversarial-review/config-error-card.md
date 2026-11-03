# Adversarial review — config-error-card

Regime: fan-out (recorded by the user). Lenses: Security, User, Scope, each on opus (cross-model: author is sonnet), foreground, one message. Round 1. Artifact: `docs/specs/config-error-card/spec.md`. No vendored contract (no `scope/` input). Every finding below is resolved in the spec (round 1 fixes, user decisions D2, D5, D6, D7 recorded in the spec).

## Findings

[HIGH] — F-01 hexa-tiles `getConfiguredEntities()` (FR-6) omits `tiles[].entity`: one renamed weather entity replaces a working dashboard by the banner, and renamed tiles with no weather tile give no banner (User + Scope; spec.md FR-6, Assumption 2, TC-CEC-U-09 only checks "a non-empty subset"; weather ids must also be gated on `weather.activate`) [RESOLVED] TC-CEC-U-19
[HIGH] — F-02 the entity rule of FR-4 runs outside the `try/catch` of `render()`, so a wrong-type config (`vacuums: 5`) or `hass.states === null` (`typeof null === 'object'` passes the Definitions) throws out of `render()` on every `hass` push (Security; FR-1, Definitions) [RESOLVED] TC-CEC-U-12
[MEDIUM] — F-03 "absent" test `hass.states[id] === undefined` reads inherited properties: ids `constructor`, `toString`, `__proto__` are judged present and suppress the banner (Security; Definitions, plugs ids come from raw YAML keys) [RESOLVED] TC-CEC-U-13
[MEDIUM] — F-04 the count of displayed ids is capped at three but the length of each id is not: a 50,000-character id grows or overflows the card (Security; FR-4) [RESOLVED] TC-CEC-U-14
[MEDIUM] — F-05 `setConfig` throws on invalid config, so a real invalid config never reaches the setup banner (Lovelace shows its own error card, the editor keeps the previous config); the spec does not say it and FR-9 rewrites 03 as if delivered (User + Scope; FR-1, Error Handling, IT-CEC-I-04) [RESOLVED] TC-CEC-U-15
[MEDIUM] — F-06 FR-10 protects only stove's message: tv's `.offline-banner` (`TACTICAL BRIDGE DISCONNECTED`) and plugs' offline/unavailable treatment are silently superseded when all configured entities are absent, and the spec does not name the change (User; FR-10, IT-CEC-I-02) [RESOLVED] IT-CEC-I-05
[MEDIUM] — F-07 Assumption 4 and Builder Calls still say "TELL — author's call, not agreed" for the three-id truncation, which the user has since validated; D2 does not record it (Scope; Assumption 4, Builder Calls) [RESOLVED] TC-CEC-U-04
[LOW] — F-08 a truncated banner hides how many entities remain, and "Entity not found: a, b, c" is singular for a list (User; FR-4, Assumption 4; the format is user-validated, a change such as `(+N)` is the user's call) [RESOLVED] TC-CEC-U-16
[LOW] — F-09 the frozen markup has no `role` and the icon is read aloud by screen readers, although the banner now appears and disappears with live data (User; FR-2 "unchanged") [RESOLVED] TC-CEC-U-17
[LOW] — F-10 TC-CEC-U-06 only asserts no `img` element: an `unsafeHTML` regression with `<svg onload>` would pass, and the French `<x id="0">` path has no XSS test (Security; TC-CEC-U-06) [RESOLVED] TC-CEC-U-06
[LOW] — F-11 the separator `, ` and the `, …` suffix can be spoofed from inside an id (embedded `, ` or bidi controls such as U+202E), cosmetic only (Security; FR-4) [RESOLVED] TC-CEC-U-18
[LOW] — F-12 TC-CEC-U-11 "carry the new text" is not a measurable string, and the FR-9 warning block ("the decision is taken") is not checked; the 03 row is in French (Scope; TC-CEC-U-11, FR-9) [RESOLVED] TC-CEC-U-11
[LOW] — F-13 FR-3 clause "neither is overridden by `render()` callers other than the base" is unreadable; intent is that no card overrides `getMissingEntities()` (Scope; FR-3) [RESOLVED] TC-CEC-U-09

## Cross-synthesis

- Convergence (high confidence): F-01 raised independently by User and Scope; F-05 raised independently by User and Scope.
- Pattern: F-02, F-03 and F-10 are the same class, the new entity rule trusts raw YAML and `hass.states` shapes. F-01, F-06 and F-07 are the same class, the spec's statements about the seven cards were not checked against each card's whole existing behaviour.
- Tension: F-08 and F-09 want banner or markup changes, F-07 and FR-2 freeze them (user-validated sentence and unchanged markup); both are product calls, not wording fixes.
- Blind spot: no lens covered i18n beyond the two strings, nor the editor-preview path in HA (live typing of ids shows a banner flash).

## Stress-test

Verdict: the spec's core design (opt-in hook, all-absent rule, no log, text-bound ids) survives; three claims are overstated. (1) "Partial absence stays the card's concern" fails for hexa-tiles because its configured list is incomplete (F-01). (2) "Pure render, never throws" fails because the new rule sits outside the existing guard (F-02). (3) "Config invalid shows the localized card" is not true for any real invalid config (F-05). Attacking the likely fixes: moving the rule inside the try/catch must keep `render()` free of `@state` writes (Anti-pattern 3), so the catch path stays the existing `_renderErrorCard`; adding `tiles[].entity` makes the "subset of `getRelevantEntities()`" claim of FR-5 hold only if `entity_kind` expansions stay excluded. Sibling scan: F-03 applies to every id lookup in the rule (shouldUpdate comparison included); F-01 applies to each of the seven cards, check weather, tv, plugs lists the same way. Two HIGH, none CRITICAL; round 1 of 2.

## Hostile-Input Checklist

HIC-1 FINDING F-04
HIC-2 covered ("bound as Lit text only.")
HIC-3 covered ("The ids are bound as Lit text, never as HTML")
HIC-4 N/A — no authentication, no mutating route; a read-only card render
HIC-5 FINDING F-02
HIC-6 N/A — no numeric or enum field is read; the only counts are the fixed cap of three and list lengths

## Builder check

Builder: one fresh opus sub-agent, foreground, read spec.md only (133/133 lines).

### Answered
- Does FR-5 change `shouldUpdate()`? No: base `shouldUpdate()` compares `oldHass.states[id] !== hass.states[id]` by identity, correct for any id; FR-5 now says it is unchanged and bridge/lights/climates/water repaint as today (spec.md FR-5, agent's call).
- TC-CEC-U-15 vs FR-1 banner when `hass` is set: the banner is reserved for "config never set, `hass` set"; TC-CEC-U-15 now fixes `hass` unset, then a kept earlier valid config, and forbids a catch or an "attempted" flag (spec.md TC-CEC-U-15).

### My calls
- FR-5 `shouldUpdate()` untouched (agent's call: absence is never decided by the comparison) — spec.md FR-5.

### Theirs
none
