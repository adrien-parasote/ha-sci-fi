# Adversarial review — behavioural-test-gaps

Regime: fan-out (recorded). Lenses Security, User, Scope, each a fresh sub-agent on opus (author: sonnet). Round 1. Spec: `docs/specs/behavioural-test-gaps/spec.md`.

## Stress-test

Verdict: CLAIM_OVERSTATED on all three lenses. The spec claims "test-only, disjoint write sets, one production line". Convergence: the tv fix (FR-1) is the weak point, seen by Security and User: a degenerate bounding box and a tap on the readout give extreme volumes, and a mid-drag state change is unguarded. Pattern: rows that span families (U-14/U-15) and a global "one title per id" rule that audit rows break. Blind spot: three rows have an Expected cell a builder cannot check (IT-BTG-I-02, IT-BTG-I-03, TC-BTG-U-14). No CRITICAL. Attack on the fixes: each spec-only fix is checked against its siblings (all 9 styles tests, all three audit rows) before it is declared closed.

## Findings

[MEDIUM] — F-01 `_handleDrag` divides by `bbox.width/height` with no zero guard: a collapsed dial gives `NaN` or, after the fix, volume 1.0 with no user intent (Security) [RESOLVED] TC-BTG-U-20 — FR-12, user decision 2026-11-03
[MEDIUM] — F-02 the off/unavailable guard exists on `pointerdown` only; a `pointermove` after the TV goes `unavailable` still calls `volume_set` (Security) [RESOLVED] TC-BTG-U-21 — FR-13, user decision 2026-11-03
[LOW] — F-03 the "comments blanked" source scan of TC-BTG-U-15 can be fooled by `//` inside a string literal on the same line as a ``css` `` (Security) [RESOLVED] TC-BTG-U-35 — FR-15 string-aware scanner
[LOW] — F-04 no row pins that state/name strings render as text (a future `unsafeHTML` leaves every test green) (Security) [RESOLVED] TC-BTG-U-33 — FR-16, plus TC-BTG-U-34 for vacuum
[HIGH] — F-05 after FR-1 a tap on the volume readout (below the dial centre, pointer-events none) sets 0 or 1; TC-BTG-U-01 and tv.md pin "bottom-centre gives 1" and the spec never states the consequence (User) [ACCEPTED: spec FR-14] pinned by TC-BTG-U-22; radial guard filed as bead ha-sci-fi-9zpl
[MEDIUM] — F-06 TC-BTG-U-02 uses a 400×100 box, but the SVG keeps a square (`xMidYMid meet`, `height:auto`): the test approves a stretched mapping that never occurs (User) [RESOLVED] TC-BTG-U-02 — 400×400 box, FR-2 states the box is square
[MEDIUM] — F-07 FR-4 / TC-BTG-U-06 do not give the exact battery text strings: "45%" without a space, "unavailable%" with a unit (User) [RESOLVED] TC-BTG-U-06 — exact strings `45%`, `45`, `unavailable%` (observed wart)
[MEDIUM] — F-08 IT-BTG-I-02 "at most 2 calls" is true even if the window drops to 40 ms (pointerdown already calls), and a `Date.now` stub below 80 silently drops the first call (User) [RESOLVED] IT-BTG-I-02 — exact counts 1 then 2, `Date.now` at 1 000 000, mutant window 80 to 40
[MEDIUM] — F-09 IT-BTG-I-03: a builder cannot tell which assertion goes through computed style and which through `cssText` on each canary branch (User) [RESOLVED] IT-BTG-I-03 — one line per branch and per row
[HIGH] — F-10 TC-BTG-U-14 and TC-BTG-U-15 span families A-E, so write sets are not disjoint and one id cannot be the title of 9 tests (Scope) [RESOLVED] TC-BTG-U-14 — U-14 limited to plugs, rows U-23..U-30 per styles file, U-15/-31/-32 per grep
[HIGH] — F-11 FR-10 "every id is cited in one test title" contradicts the audit and guard rows TC-BTG-U-16..19 that produce no test (Scope) [RESOLVED] TC-BTG-U-16 — FR-10 exempts U-16..19
[MEDIUM] — F-12 the Error Handling row "bead, or spec-first fix when one line" licenses `src/` changes in every family, against "src/ does not change, except FR-1" (Scope) [RESOLVED] TC-BTG-U-16 — Error Handling row is bead plus kept mark; U-16 checks the `src/` diff
[MEDIUM] — F-13 a surviving weather mutant edits `tests/cards/weather/sci-fi-weather.test.ts`, which is in no family's write set nor in the expected diff (Scope) [RESOLVED] TC-BTG-U-17 — file added to family E write set and expected diff, conditional
[LOW] — F-14 TC-BTG-U-14 "two selectors of the card's markup" is not checkable unless the selectors come from the rendered DOM (Scope) [RESOLVED] TC-BTG-U-14 — FR-6 reads the class names from the rendered shadow root

## Hostile-Input Checklist

HIC-1 unbounded-input — covered ("exactly 1 `callService` after the burst (the `pointerdown`), exactly 2 after the move at `T+80`")
HIC-2 stored-string — covered ("no `img` in the shadow root; the literal string is in the text content")
HIC-3 injection — N/A — entity_id comes from the author's own config and the only computed payload field is a number; no interpreter, URL or header sink
HIC-4 bootstrap-authz — N/A — test-only lot, no route, no first-admin state
HIC-5 malformed-oversized — covered ("a test that renders a card with `states: {}` is a defect of the test")
HIC-6 numeric-edge — covered ("zero `callService` in every case; no `NaN` shown in `.dial-value`")

## Builder check

One cold builder (sonnet, foreground, spec 179/179 lines read) returned 16 questions.

### Answered
- Q2, Q3, Q4, Q6: rounding, clamp operators, SVG-to-client conversion, pointerdown through the throttle — written in FR-1.
- Q7 canary shape and the FR-6 source-read exception; Q8, Q9: the card spec rows are the authority for numbers/selectors — FR-3.
- Q11: 5+7+6+8+1 = 27, minus tv IT-701/702 = 25 closed — already in Assumption 5 and TC-BTG-U-16; Q16 vacuum rows 1537/1538 are written unmarked (a test lands in the same lot).

### My calls
- Q1: "today's code" mutants run on the fixed source; a red run against unfixed source may also be shown — FR-7 (agent's call).
- Q5: hass replaced after pointerdown keeps drag flag; removed-entity case n/a if the banner replaces the dial — FR-13 (agent's call).
- Q10: a row may split into several tests, each id in exactly one title — FR-10 (agent's call).
- Q12: classes are picked from rendered elements and must appear as `.class` in the sheet — FR-6 stays as written, the pick is BUILD's.
- Q13: helper API `blankComments(src): string`, regex literals out of scope — FR-15 (agent's call).
- Q14: zero-box test restores a normal box and expects one call — FR-12 (agent's call).
- Q15: benign-marker check before the hostile assertion; unrendered fields dropped — FR-16 (agent's call).

### Theirs
none
