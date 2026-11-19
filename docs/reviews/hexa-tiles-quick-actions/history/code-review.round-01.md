# Code review — hexa-tiles-quick-actions, round 1

AUDITOR: subagent
PACKET: .sc/review/07dc94b-d8461b07 (dirty 07dc94b..worktree)

COVERAGE (must_read.txt is empty: no entry point packaged; rows below are the files in scope that were read)

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts | 1-320 | 320 | yes |
| src/cards/hexa-tiles/sci-fi-hexa-tiles.ts | 1-564 | 564 | yes |
| src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts | diff hunks (+ 263-266) | 700 | diff only |
| src/cards/hexa-tiles/styles.ts | 100-386 (diff + context) | 386 | partial (all changed rules + every rule they compete with) |
| src/cards/hexa-tiles/config.ts | diff | 53 | diff only |
| src/cards/hexa-tiles/labels.ts | diff | 50 | diff only |
| src/locales/locales/fr.js / xliff/fr.xlf | diff | 411 / 1535 | diff only |
| tests/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.test.ts | 1-942 | 942 | yes |
| tests/cards/hexa-tiles/sci-fi-hexa-tiles-editor.test.ts | 520-647 (the lot's block) | 647 | lot's block |
| tests/cards/hexa-tiles/styles.test.ts | diff | 124 | diff only |
| tests/dev/workbench.test.ts | diff | 397 | diff only |
| dev/modules/hass-action.js | 1-55 | 55 | yes |
| dev/cards/hexa.js / dev/modules/mock-data.js / dev/modules/workbench-app.js | diff | 48 / 169 / 442 | diff only |
| docs/specs/cards/hexa-tiles.md, docs/specs/03_base_classes.md, docs/specs/10_card_editors.md | diff | 310 / — / — | diff only |
| docs/specs/hexa-tiles-quick-actions/spec.md | 1-201 | 201 | yes |
| docs/specs/hexa-tiles-quick-actions/state-mapping.yaml | 1-11 | 11 | yes |
| out of diff, joins followed: src/utils/base-card.ts, src/utils/action.ts, src/components/sf-toast.ts, src/components/editor-inputs/sf-editor-input.ts, src/components/editor-inputs/sf-editor-action.ts (40-100), dev/modules/mock-hass.js (15-67, 120-215) | as listed | — | read for the joins |

dist/sci-fi.min.js(.map) left out on the orchestrator's instruction (rollup output) — see NOTES.

DETERMINISTIC PRE-PASS
- Typecheck: `tsc --noEmit` → exit 0.
- Lint (hexa-tiles src + tests): exit 0, 0 errors, 3 warnings, all pre-existing (sci-fi-hexa-tiles-editor.ts:265/279/293 non-null assertions, present at 07dc94b).
- Tests: `vitest run tests/cards/hexa-tiles tests/dev/workbench.test.ts tests/styles` → 14 files, 181 tests passed.

VERDICT: WARNING
SPEC: docs/specs/hexa-tiles-quick-actions/spec.md

FINDINGS:
- [HIGH] src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts:270 — a long press on a tile whose entity is `unavailable` sends the tile's configured `hold_action` to Home Assistant, a `toggle` included: on the gate (template cover whose `availability` is false while the relay still answers) that is a blind pulse from a tile the card itself shows as "Unavailable"; the card then puts the error tile in pending (`data-pending` + `data-error` together) and, 30 s later, pushes the toast `Portail : No change` instead of anything about unavailability — FR-5.1 (an absent / unavailable entity mutes every gesture; "un appui long sur une entité unavailable ouvre more-info") and the spec's Error Handling row ("entité unavailable … appui long → more-info") say the hold opens more-info; the guard exempts `hold` wholesale (`gesture !== 'hold'`) and `_emit` then fires `hold_action` whatever it is. This is spec limit F-07 (the gesture emission guards) held at a narrower scope than a config can reach.
  REPRODUCED: scratch vitest probe outside the tree, card mounted with `{standalone: true, entity: 'cover.portail', name: 'Portail', tap_action: {action: toggle}, hold_action: {action: toggle}}` on `cover.portail: unavailable`, pointerdown + 500 ms, then +30 000 ms → hass-action `[["hold",{"action":"toggle"}]]`; tile `data-pending="true"`, `data-error="true"`, `aria-label="Portail, Unavailable"`; `sf-toast.addMessage` called with `("Portail : No change", true)`.
  SITES:
    src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts:270 (the unavailable guard skips every hold)
    src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts:285-288 (`_emit` fires `hold_action` on an unavailable entity)
    src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts:276 (a toggle on an unavailable entity starts pending, memorising `unavailable`)
    src/cards/hexa-tiles/sci-fi-hexa-tiles.ts:120-123 (`onNoChange` toasts "No change" for a tile in error)
  SWEPT: `grep -n "gesture !== 'hold'\|hold_action" src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts`
  FALSIFIED BY: a TC-HQA-U-08 case the suite lacks — tile on `cover.portail` `unavailable` with `hold_action: {action: 'toggle'}`: hold 500 ms → exactly one hass-action `{action: 'tap', config: {entity, tap_action: {action: 'more-info'}}}`, no `hold`, no `data-pending`, and no `addMessage` after +30 s. The present U-08 hold case has no `hold_action`, which is why it is green.
  ROOT: FR-5.1
  FIX-CLASS: corrects

- [MEDIUM] src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:241 — in the visual editor, a refused state-key rename leaves the field showing the key the user typed while the config keeps the old one (or a half-typed one), so the user saves a `states` key they never saw — FR-12 (state-key rename: "renommer vers une clé existante ou vide ne change pas la config et remet le champ à l'ancienne clé"). Two causes: (1) setting the host `sf-editor-input.value` back to the old key happens in the same task as the component's own `this.value = input.value`, so Lit's `.value` binding sees no change from its last committed value and never rewrites the inner `<input>`; (2) the handler at :611 runs on `input-update`, which `sf-editor-input` emits on every keystroke (`@input`), so every intermediate prefix is committed as a rename — backspacing `on` commits `o` before the empty key is refused, and typing `open` onto a row next to an existing `open` saves `ope` while the field shows `open`.
  REPRODUCED: scratch vitest probe, editor with `states: {on: {}, off: {}}`, inner `<input>` of row 0 set to `off` + `input` event → 0 config-changed, host `.value` = `on`, inner `<input>.value` = `off`; then inner set to `o` + `input` → config-changed with keys `["o","off"]`.
  SITES:
    src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:241 (reset written to the host property only)
    src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:611 (rename wired to the per-keystroke event)
    tests/cards/hexa-tiles/sci-fi-hexa-tiles-editor.test.ts:615 (TC-HQA-U-15 writes the host `.value` itself and asserts the host `.value`, so it cannot see the inner field)
  FALSIFIED BY: TC-HQA-U-15 driven through the inner `<input>` of `sf-editor-input[element-id="state_key"]` (set `.value`, dispatch `input`), asserting the inner `<input>.value` after `updateComplete`.
  FIX-CLASS: corrects

- [LOW] dev/modules/hass-action.js:50 — in Live mode a real service call that HA rejects (entity unavailable, service missing) becomes an unhandled promise rejection: the workbench console logs nothing and the browser reports an uncaught error — `void call()` floats the promise the live `callService` returns (FR-16 Live mode; checklist "floating promises without error handling").
  FIX-CLASS: corrects

### Spec limit F-01 — holds
No gesture is blocked during pending or motion: `_perform` (sci-fi-hexa-tiles-quick-actions.ts:267-277) mutes only on FR-5.1, and every emitted toggle re-enters pending through `_startPending` (306-319), which clears the previous timer (309) and re-arms with the emitting tile's `pending_timeout` (316). The deferred double-tap tap re-enters `_perform` at fire time (185-188), so FR-5.1 is re-checked at emission. Scope: per entity, across every tile of the card (`_pending` keyed by entity, 147). Mutants M5 (previous timer not cleared) and M6 (guard widened to hold) are killed — see MUTATION lines.

### Spec limit F-02 — holds
The ignore-next-click flag is cleared at every `pointerdown` before the button check (200), by `reset()` (256), consumed by the first click (170-173), never read by the keyboard (192-197), and not cleared on `pointerleave` (220-222). Killed mutant M3.

### Spec limit F-03 — holds
`reset()` cancels the hold timer, every double-tap window and every pending timer (249-257), called from `disconnectedCallback` (sci-fi-hexa-tiles.ts:152); the window is keyed per tile config (150, 178-188); the deferred tap re-evaluates FR-5.1 at fire time (187 → 267-273).

### Spec limit F-04 — holds
`resolvePendingTimeoutMs` (28-32) accepts only a finite number in ]0, 86 400] and falls back to 30 s; it is the only path to `setTimeout` (316). Pinned by TC-HQA-U-05's table, `Infinity` and `NaN` included.

### Spec limit F-05 — holds (as accepted)
`opening` / `closing` render as pending (`describeTile`, 91) with no timer (`_startPending` returns at 307, killed mutant M4); gestures still emit (FR-7.6, accepted risk).

### Spec limit F-06 — holds
Every error tile carries a `.tile-mark` `mdi:alert-octagon-outline` (sci-fi-hexa-tiles.ts:497, 527), and an absent / unavailable tile the second line `Unavailable` (quick-actions.ts:105) and the `aria-label` `<name>, Unavailable` (95).

### Spec limit F-07 — broken
The emission guards hold for tap, double tap and the deferred tap (killed mutant M2), but not for a hold carrying a `hold_action` on an `unavailable` entity: see the HIGH finding on sci-fi-hexa-tiles-quick-actions.ts:270 (ROOT FR-5.1).

MUTATION: removed the FR-5.1 mute callback `this._host.onMuted(tile)` in `_perform` — KILLED by TC-HQA-U-08 (unavailable / absent toasts), TC-HQA-U-21
MUTATION: removed `this._ignoreNextClick = false` at the start of `onPointerDown` — KILLED by TC-HQA-U-06 (stale flag), TC-HQA-U-20, TC-HQA-U-21
MUTATION: removed the moving guard `if (isMoving(state)) return;` in `_startPending` — KILLED by TC-HQA-U-20
MUTATION: removed `if (previous) clearTimeout(previous.timer);` in `_startPending` — KILLED by TC-HQA-U-19, TC-HQA-U-21
MUTATION: widened the unavailable guard to holds (dropped `&& gesture !== 'hold'`) — KILLED by TC-HQA-U-08

NOTES:
- `this._noChange.delete(entity)` in `_startPending` (sci-fi-hexa-tiles-quick-actions.ts:310) can be deleted with the suite green, but the mutant is equivalent, not a coverage gap: `describeTile` masks the mark while pending (`noChange = noChangeMark && !error && !pending`, line 92), and the mark is lifted again by `onHass` as soon as the state changes. No observable behaviour depends on it, so it is not recorded as a survivor.
- FR-7.7 (the live-region text at the end of a pending) says "seconde ligne du nouvel état, sinon l'état brut". The code reads this as the FR-4 second line (sci-fi-hexa-tiles.ts:118), which includes `tile.subtitle`. So the light tile announces `Lumière, Chambre parents` when it turns on, without saying the state changed. This follows the spec's wording. If the announcement is meant to give the new state, the spec should say so.
- The live region is only re-announced when its text changes: two "No change" timeouts in a row on the same tile produce one announcement. The spec does not pin this.
- `dist/sci-fi.min.js` was left out as instructed. But it is now an unminified development build: 1.8 MB and 40 849 lines, starting `var SciFiCards = (function (exports) {`. At 07dc94b it was the minified production build (953 KB, starting `!function(t){…`). Run `npm run build` (NODE_ENV=production) before the lot is committed.
- In the editor, the state-row handlers rebuild `states` from the `tile` captured at render time (`_stateEntries(tile)`), not from `this.config`. Two edits dispatched in the same task before a re-render would lose the first. Each keystroke is a separate task, so I could not make this happen. Recorded as a residual risk, not a defect.
- The `Relais muet` scenario key `_muted_relay` ends up in the mock `hass.states` as an entity with no state. The existing `_config` scenario key works the same way, and no card reads it. This matches the workbench's existing convention.
- `sf-editor-action`'s fallback UI (when `ha-selector` is not registered) lets its inner `sf-editor-input` `input-update` bubble out composed. A listener on the host therefore also gets a bare string. In HA, `ha-selector` is used and stops propagation, so production is unaffected. OUT-OF-DIFF: src/components/editor-inputs/sf-editor-action.ts — a bead, not this lot.
- `_renderCustomTile` (sci-fi-hexa-tiles.ts:445-534, about 90 lines) was already over 50 lines before the lot. The lot moved its click handler out and added bindings. This is a style threshold.

## Cannot verify from this diff
- The `sf-toast` uses `position: fixed` inside `ha-card`. If a dashboard ancestor sets `transform`, `filter` or `contain`, the toast is positioned against the card instead of the viewport. The other ten sf-toast cards share this, and it can only be checked on the phone (VERIFY manual pass).
- Assumption 3 of the spec (the HA frontend honours `hold_action` / `double_tap_action` on a custom card's `hass-action`) can only be checked on a live HA instance (IA-EX-4, manual).

CONFORMANCE EVIDENCE:
- FR-3 (per-state colour through the CSSOM, never in the style string) → sci-fi-hexa-tiles.ts:37-46, 512; quick-actions.ts:46-56 (prototype-safe lookup, FR-3.1 filtering)
- FR-4 (second line order) → quick-actions.ts:105; sci-fi-hexa-tiles.ts:530
- FR-5 / FR-5.1 (tap and double-tap mute plus toast) → quick-actions.ts:88-90, 270-273; sci-fi-hexa-tiles.ts:113
- FR-6 (keyboard: Enter / Space, repeat ignored, no window) → quick-actions.ts:192-197
- FR-7 / FR-7.1 / FR-7.6 (no lockout, each toggle re-arms) → quick-actions.ts:267-277, 306-319
- FR-7.2 (end on any state change) → quick-actions.ts:236-246, called from sci-fi-hexa-tiles.ts:189-192
- FR-7.3 (bounded timeout, mark, one toast per expiry) → quick-actions.ts:28-32, 311-316; sci-fi-hexa-tiles.ts:120-123
- FR-7.4 (disconnect cancels every timer) → quick-actions.ts:249-257; sci-fi-hexa-tiles.ts:152
- FR-7.8 (one sf-toast, `addMessage(text, true)`) → sci-fi-hexa-tiles.ts:256, 261-263
- FR-8 / FR-8.1 (hold, tolerance, ignore flag) → quick-actions.ts:199-231
- FR-9 (per-tile double-tap window) → quick-actions.ts:174-188
- FR-10 (styles) → styles.ts:139-147, 284-370
- FR-13 (i18n) → xliff/fr.xlf and src/locales/locales/fr.js, the 12 units (TC-HQA-U-16 green)
- FR-16 (workbench) → dev/modules/hass-action.js:17-55; dev/cards/hexa.js; dev/modules/workbench-app.js:148-153

Review summary: CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 1
