# Adversarial review — hexa-tiles-quick-actions

- Spec: `docs/specs/hexa-tiles-quick-actions/spec.md` (+ `state-mapping.yaml`)
- Lane: light — lenses Security, User, Scope; short stress-test
- Regime: fan-out (user's pick, 2026-11-18). Author: opus. Lenses and critic: sonnet, fresh context, packet `.sc/review/07dc94b-67bdec46`.
- Reviewer source of the stress-test: cross-model
- Round: 1

## Pre-scan

- Single spec — cross-spec validator not applicable.
- External claims: hold 500 ms / double tap 250 ms — CITED and fetched 2026-11-18 (frontend `action-handler-directive.ts`, research F3). `cover.portail` shape — VERIFIED via `ha_get_state` 2026-11-18 (spec Assumption 1).
- Proof obligations: `state-mapping.yaml` written before the lenses (one `irreversible` row → IA-EX-5 with `obligation: no-effect-on-reject`, two `none` rows); `obligation_check.py` exit 0. Contested by the Security lens: F-07.
- Pre-commitment predictions (step 0.5) were not written before the lenses ran — skipped, said here rather than reconstructed.

## Verdicts

| Reviewer | Verdict |
|---|---|
| Security | CLAIM_OVERSTATED — the misfire guard covers the `tap_action: toggle` path only |
| User | CLAIM_OVERSTATED — moving gate, colour-only signal, touch edge cases |
| Scope | CLAIM_OVERSTATED — everything the frame requires is delivered; four agent-chosen extras |
| Stress-test | ready to build with caveats |

## Cross-lens synthesis

| Finding A | Finding B | Signal | Description |
|---|---|---|---|
| Security #2 | User #1, critic #4 | 🎯 Convergence | the pending guard does not cover every path that can re-pulse the gate (other gestures, other tile on the same entity, gate moved from elsewhere) → F-01, F-05, F-08 |
| Security #4 | critic #1, User #3c | 🎯 Convergence | gesture state machine has no reset / cleanup rule → F-02, F-03, F-11 |
| Security #2 | Scope #3 | ⚔️ Tension | widen the tap lockout vs the lockout itself is an agent choice the user never made → F-01 vs F-13 |
| User #5 | Scope #2 | ⚔️ Tension | richer states editor vs simpler states editor → F-15, F-16 |
| Scope #1–#4 | User #5 | 🔁 Pattern | behaviour chosen by the agent and not traced to the frame contract (FR-7.1 lockout, FR-12 rename logic, FR-6 keyboard, FR-16) → F-13, F-14, F-15, F-17 |
| Security #1 / #5 | — | isolated | the `irreversible` row maps to the weakest rejection path → F-07 |
| User #2 | — | isolated | colour is the only state channel for an error tile → F-06 |
| critic #3 | — | 🕳️ Blind spot | `pending_timeout` overflow — no lens looked at numeric bounds → F-04 |
| critic #5 | — | 🕳️ Blind spot | malformed `states` entries crash render → F-09 |

## Findings

[HIGH] — F-01 Pending guards only `tap_action: toggle`: a `hold_action` / `double_tap_action` toggle, a `perform-action` gate script, or a deferred double-tap tap can re-pulse the gate during pending; FR-7.1 does not say the guard is re-checked at emit time (FR-7, FR-7.1, FR-9, Assumption 8) [RESOLVED] TC-HQA-U-21 — user's pick 2026-11-18 « bloquer tout toggle »: FR-7 starts pending on any toggle gesture, FR-7.1 mutes every toggle gesture on every tile of the entity and is evaluated at emission (hold expiry, second click, deferred tap); a `perform-action` script stays unguarded by decision (FR-7.6)
[HIGH] — F-02 FR-8 "click after a fired hold is ignored" has no reset rule: hold then `pointerleave` / `pointercancel` leaves a stale flag that swallows the next real tap on the gate (FR-8, TC-HQA-U-06) [RESOLVED] TC-HQA-U-06 — FR-8.1: the flag is cleared at the next `pointerdown` and by `disconnectedCallback`, consumed by the first `click`, never read by the keyboard (not cleared on `pointerleave`: on touch it fires after `pointerup`, before the click it must swallow)
[HIGH] — F-03 Double-tap window: its 250 ms timer is not cleared by FR-7.4, is not keyed per tile, and the FR-5.1 / FR-7.1 guards are not re-evaluated when the deferred tap fires (FR-9, FR-7.4) [RESOLVED] TC-HQA-U-12 — FR-7.4 now cancels the hold and double-tap timers; FR-9 keys the window per tile and re-evaluates FR-5.1 / FR-7.1 when the deferred tap fires (also TC-HQA-U-07, TC-HQA-U-21)
[HIGH] — F-04 `pending_timeout` has no upper bound: a value above 2^31-1 ms overflows `setTimeout`, which fires at once and shows the "no change" mark right after the tap (FR-7.3, Error Handling) [RESOLVED] TC-HQA-U-05 — FR-7.3 caps it at 86 400 s (else 30), `86401` and `1e9` added to the scenario, `86400` pinned at 86 400 000 ms
[HIGH] — F-05 A gate already moving (`opening` / `closing`, started from another device) is neither rendered as pending nor guarded, and FR-7.2 ends pending on any state change including a transient one — a second tap then reverses the moving gate (FR-3, FR-7.1, FR-7.2, Assumption 1) [RESOLVED] TC-HQA-U-20 — user's pick 2026-11-18: FR-7.5 renders `opening` / `closing` as pending with toggle gestures muted, no timer; FR-7.2 hands a transient state over to FR-7.5 without a gap
[HIGH] — F-06 Colour is the only channel for an unavailable / error tile: no mark, no text, indistinguishable from a configured red `open` state for a colour-blind user (FR-5, FR-10) [RESOLVED] TC-HQA-U-08 — FR-5 adds a `.tile-mark` `mdi:alert-octagon-outline` on every error tile, and FR-4 puts `Unavailable` on the second line of an absent / unavailable tile
[HIGH] — F-07 `state-mapping.yaml` maps the `irreversible` operation to IA-EX-5 (unavailable tap sends nothing), the weakest rejection path; tap-during-pending, click-after-hold and cancelled gesture carry the real obligation, and the pending state machine is classed under a `none` row (state-mapping.yaml) [RESOLVED] TC-HQA-U-04 — the irreversible row now names every emission guard and maps to IA-EX-1 (the gate example), which declares `no-effect-on-reject` and lists its reject paths U-04, U-19, U-21, U-20, U-06, U-08; the `none` row is rendering only
[MEDIUM] — F-08 Pending is per entity but `pending_timeout` and the mark are per tile: with two tiles on `cover.portail` the spec does not say which timeout applies, where the mark shows, or that tile B is blocked during tile A's pending (FR-7, FR-7.1, FR-7.3) [RESOLVED] TC-HQA-U-19 — FR-7: one timer per entity, the emitting tile's timeout; FR-7.1 any tile of the entity; FR-7.3 the mark on every tile of the entity
[MEDIUM] — F-09 Malformed `states` entries (`null`, a string, `states` as an array) are read unguarded and can throw in `render`, blanking the whole card (FR-3, Error Handling) [RESOLVED] TC-HQA-U-18 — FR-3.1 reads `states`, its entries and their fields only in their declared shape, anything else is absent, never a throw; Error Handling row added
[MEDIUM] — F-10 Keyboard repeat: holding Enter on a non-toggle tile emits one action per OS key-repeat; no `event.repeat` guard, `preventDefault` specified for Space only (FR-6, TC-HQA-U-10) [RESOLVED] TC-HQA-U-10 — FR-6 ignores `event.repeat` and calls `preventDefault` on Enter and Space
[MEDIUM] — F-11 Touch: scroll-then-click is claimed harmless without a test, and the editor does not tell the user that a `double_tap_action` delays every single tap by 250 ms (FR-8, FR-9, FR-11) [RESOLVED] TC-HQA-U-06 — FR-8.1 ignores the click after `pointercancel` or a move beyond 10 px (tested), and FR-11 adds the 250 ms hint under the double-tap field (TC-HQA-U-14)
[MEDIUM] — F-12 Accessibility: the state itself (open / closed) is never in the aria-label unless a `label` is set, and the pending → done / no-change outcome is not announced (no live region) (FR-5, FR-7, FR-7.3) [RESOLVED] TC-HQA-U-22 — FR-7.7: a tile matching a `states` entry carries `<name>, <label or raw state>`, and one `.sf-live` polite status announces the pending outcome; tiles without `states` keep today's label (FR-2)
[MEDIUM] — F-13 The tap lockout during pending (FR-7.1) and toggle-only pending (Assumption 8) are agent choices not recorded in the frame contract; a lost relay pulse locks the user out for up to 30 s (FR-7, FR-7.1) [ACCEPTED: spec FR-7.6]
[MEDIUM] — F-14 FR-16 workbench (service mapping, 3 s deferred mutation, "Relais muet" scenario) is not recorded in the frame contract (FR-16, TC-HQA-U-17) [FALSE] the user asked for it in chat on 2026-11-18 (« tu oublie pas de mettre a jours le serveur locl pour test ok ? »), recorded in FR-16 as « demande utilisateur 2026-11-18 »; it changes no delivered behaviour of the card, only the repo's dev harness (ADR-007)
[MEDIUM] — F-15 FR-12 states sub-editor (rename, collision rules, auto-key sequence) is heavier than the frame's "editor fields for every new key" requires (FR-12, TC-HQA-U-15) [ACCEPTED: spec FR-12]
[MEDIUM] — F-16 Editor and labels: case-sensitive state keys fail silently (`On` matches nothing), a refused rename gives no feedback, a truncated subtitle exposes no full text (FR-3, FR-4, FR-12) [RESOLVED] TC-HQA-U-15 — user's pick 2026-11-18: FR-12 shows the entity's current raw state as a hint and resets a refused rename to the old key; FR-4 puts the full text in the subtitle's `title` (TC-HQA-U-02)
[LOW] — F-17 Keyboard handling (FR-6) and the reduced-motion variant (FR-10) are untraced to the frame contract (FR-6, FR-10) [FALSE] both complete what the frame already owns: `sci-fi-hexa-tiles.ts:436-437` render every tile `role="button" tabindex="0"`, which the WAI-ARIA button pattern activates on Enter / Space, and the reduced-motion rule only tempers the pending animation the frame's « pending feedback » row requires
[LOW] — F-18 Spec size: 17 FRs and 17 TCs for a low-gap frame; Carriers & Consumers, anti-patterns and assumptions restate FR-1 to FR-9 (whole spec) [FALSE] every FR-1 to FR-16 is cited by at least one row of the TC table's Covers column, so none is dead weight; the sections the finding calls restatements are the ones the spec-writing contract requires (Assumptions, Anti-patterns, Carriers & Consumers), each in one table

ALSO_NOTED (not resolved here, per the skill): only the `climate.clou` snapshot for migration; reconnect during pending clears without reconciling; mark colour contrast unmeasured; no length cap on `label` / `subtitle` (text only, XSS-safe); pen/eraser pointer buttons unchecked; workbench covers Mock mode only.

## Stress-test

Reviewer source: cross-model (sonnet). One pass over the lenses' top arguments, with an execution simulation of the gate tile (tap, hass updates, second tap, hold, timer, disconnect).

Verdict: **ready to build with caveats**. It confirmed the two convergences and raised three blind spots no lens covered: the double-tap timer lifecycle, the `pending_timeout` overflow and malformed `states` entries. It filled in the per-entity keying of pending. Its HIGHs are F-02, F-03 and F-04, and none was refuted.

## Hostile-Input Checklist

- HIC-1 unbounded-input: FINDING F-04
- HIC-2 stored-string: covered ("comme texte")
- HIC-3 injection: covered ("jamais par concaténation dans l")
- HIC-4 bootstrap-authz: N/A — the card holds no credentials and calls no service itself; `hass-action` runs under the HA user's own permissions
- HIC-5 malformed-oversized: FINDING F-09
- HIC-6 numeric-edge: FINDING F-04

## Builder check

One cold builder (sonnet, fresh context, spec dir only, coverage 198/198 and 11/11), after the fixes. Eight questions, none left to the user.

### Answered

- Q2 pending shared across tiles of one entity: already per entity (FR-7, FR-7.1, FR-7.3 « toutes les tuiles de l'entité »); no change.
- Q4 does a pre-lot tile already carry role / tabindex / aria-label: yes, `sci-fi-hexa-tiles.ts:436-438` — written into FR-2 with the normalisation rule.
- Q7 YAML quoting of `on` / `off` keys: HA serialises the editor's JS keys; written into FR-12, the wiki (FR-15) quotes them.
- Q8 the `node_modules` link: an environment step, not a deliverable — written into FR-16.

### My calls

- Q1 `closed` → tap → `opening` → `closed`: a pending that ended never resumes; it ends with no mark, on the `closed` render — FR-7.2, pinned by TC-HQA-U-20 third flow.
- Q3 error mark and no-change mark together: one `.tile-mark` at most, the error mark wins — FR-7.3, pinned by TC-HQA-U-08.
- Q5 what a « tuile personnalisée » is: every `tiles` entry, standalone or aggregated, not the weather tile — Overview vocabulary.
- Q6 keyboard on a double-tap tile: the keyboard never opens a double-tap window, `Enter` emits the tap at once — FR-6, pinned by TC-HQA-U-10.

### Theirs

none
