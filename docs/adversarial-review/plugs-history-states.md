# Adversarial review — plugs-history-states

Regime: fan-out, lenses Security, User, Scope (sonnet; author opus). Packet `.sc/review/01300ca-2c0db646`. Round 1, findings written UNRESOLVED; fixes open in a fresh context.

## Context — user decisions (2026-11-05), not raised as open
- On the 2 s timeout, the late answer is discarded; the error shows with Retry.
- No toast on history failure.
- Records keyed by power entity id; a shared sensor means a shared record (accepted).

## Findings

[HIGH] — F-01 FR-14 says "four strings" but lists three; the fourth (existing 'No power data to display') is never named, so TC-PHS-U-13 is unverifiable (Scope; also noted by User, Security) [RESOLVED] TC-PHS-U-13
[HIGH] — F-02 Assumption 6 still reads as open question Q1, "not measured"; the user's 2 s / discard / Retry decision is not recorded in the spec (Scope) [RESOLVED] TC-PHS-U-03
[HIGH] — F-03 Loading and error states have no a11y contract: no role="status"/role="alert", no focus rule after Retry (User) [RESOLVED] TC-PHS-U-14
[MEDIUM] — F-04 Retry has no double-activation guard: the state is not set to 'loading' synchronously, so a double click can start two requests, against FR-7 "exactly one" (User, Scope) [RESOLVED] TC-PHS-U-15
[MEDIUM] — F-05 Malformed or oversized history answer: only "non-array" is handled; the element shape is unchecked and there is no cap on points per record (Security) [RESOLVED] TC-PHS-U-16
[MEDIUM] — F-06 Non-finite power states ('unavailable', 'NaN') are counted as points; FR-8 should count only finite numbers, so an all-invalid history reads 'empty' (Security) [RESOLVED] TC-PHS-U-16
[MEDIUM] — F-07 Missing TCs: hass-first mount order, malformed answer, plug without power sensor, A→B→A switch while loading (FR-2, FR-8, FR-10) (Scope) [RESOLVED] IT-PHS-I-04 (renamed from TC-PHS-I-04 at BUILD: repo id guard TC-RWG-U-05)
[MEDIUM] — F-08 Builder deliverables with no FR or TC: migrating the existing tests (toast, _chart_generation) and the plugs.md amendment (Scope) [RESOLVED] TC-PHS-U-24
[MEDIUM] — F-09 Timeout and request errors show the same copy; the stored reason is never surfaced (User; the discard decision itself stands) [RESOLVED] TC-PHS-U-17
[MEDIUM] — F-10 Loading and error elements reserve no height, so the layout jumps between one line and the chart (User) [RESOLVED] TC-PHS-U-18
[MEDIUM] — F-11 A loaded chart replays stored data with no age or refresh path; staleness is neither bounded nor written as a limit (User) [ACCEPTED: spec FR-12]
[LOW] — F-12 The timeout timer is not cleared and tokens are not invalidated on disconnectedCallback, so a late answer can write to a detached card (Security) [RESOLVED] TC-PHS-U-19
[LOW] — F-13 Entity-id encoding in the history/period request is unspecified (query injection through a hand-typed id) (Security) [RESOLVED] TC-PHS-U-20
[LOW] — F-14 Vague wording: FR-4 visibility (absent vs display:none), same-key behaviour on config change in FR-11, duplicate FR-5 row in the Carriers table (Scope) [RESOLVED] TC-PHS-U-23

## Cross-synthesis
- Convergence: F-01 was raised by all three lenses. F-04 was raised by User and Scope (the Retry guard).
- Pattern: Error Handling rows without TCs (F-05, F-07); states defined only by CSS class, with no behaviour contract (F-03, F-10, F-14).
- Tension: F-09 and F-11 push for more UI surface, which pulls against the minimal scope. F-09 must not reopen the discard decision.
- Blind spot: lifecycle teardown (F-12) was raised by no lens other than Security.

## Stress-test
Verdict: the spec is not ready for spec-gate. The three HIGHs are cheap text fixes (F-01, F-02) plus one new FR (F-03). The MEDIUMs are each closable with a TC row. No CRITICAL finding, no redesign signal.

## Hostile-input checklist
HIC-1 FINDING F-05
HIC-2 N/A — only static msg() strings are rendered; no user string is stored or emitted
HIC-3 FINDING F-13
HIC-4 N/A — read-only GET with the user's own hass token, no mutating route
HIC-5 FINDING F-05
HIC-6 FINDING F-06

## Builder check

One cold builder (sonnet, foreground) on docs/specs/plugs-history-states/ only; 15 questions. Answers in spec § Builder check answers.

### Answered
- B-10 shared sensor — spec Assumption 5 (user decision 2026-11-05)
- B-13 `_toast` kept elsewhere — spec FR-6
- B-15 rest of the URL — spec FR-18

### My calls
- B-1 `_drawChart` signature kept — § Builder check answers
- B-2 redraw from record on selection — FR-12 / § Builder check answers
- B-3 sensorless plug hides and destroys chart — § Builder check answers
- B-4 containers mutually exclusive by status — § Builder check answers
- B-5 setConfig kept/dropped keys and timers — FR-11 / § Builder check answers
- B-6 token AND generation; reconnect drops loading records — FR-17 / § Builder check answers
- B-7 last 5000 after filtering — FR-8 / § Builder check answers
- B-8 point without timestamp dropped — FR-8 / § Builder check answers
- B-9 `@click` binding — FR-7 / § Builder check answers
- B-11 focus always moved — FR-16 / § Builder check answers
- B-12 fr.xlf only, build output committed — FR-14 / § Builder check answers
- B-14 budget per request, `_withTimeout` a method — FR-5 / § Builder check answers

### Theirs
none
