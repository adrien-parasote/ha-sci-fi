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
  RESOLUTION: fixed — `_perform` (src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts) now returns before `_emit` for every gesture on an absent / `unavailable` entity: tap and double tap stay muted with their toast, a hold emits more-info through the new `_emitMoreInfo(entity)` on `unavailable` (nothing on absent) whatever `hold_action` says, so no `hold`, no `_startPending` (site :276) and no pending to expire (site sci-fi-hexa-tiles.ts:120-123 is then unreachable for an unavailable tile — a pending started on another state ends at FR-7.2 when the entity turns `unavailable`; `onNoChange` left as is). Proof: new case `TC-HQA-U-08: a hold on an unavailable entity opens more-info even with a toggle hold_action, and starts no pending` in tests/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.test.ts (exactly one `tap` more-info, no `hold`, no `data-pending`, no `addMessage` / `data-no-change` after +30 s) — RED on the round-1 code in this session (`expected { …(2) } to deeply equal { action: 'tap', … }`), green after; `prove_test.py --test tests/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.test.ts --covers src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts` → PROVEN. Spec TC-HQA-U-08 row amended with this case (FR-5.1 already said it).

- [MEDIUM] src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:241 — in the visual editor, a refused state-key rename leaves the field showing the key the user typed while the config keeps the old one (or a half-typed one), so the user saves a `states` key they never saw — FR-12 (state-key rename: "renommer vers une clé existante ou vide ne change pas la config et remet le champ à l'ancienne clé"). Two causes: (1) setting the host `sf-editor-input.value` back to the old key happens in the same task as the component's own `this.value = input.value`, so Lit's `.value` binding sees no change from its last committed value and never rewrites the inner `<input>`; (2) the handler at :611 runs on `input-update`, which `sf-editor-input` emits on every keystroke (`@input`), so every intermediate prefix is committed as a rename — backspacing `on` commits `o` before the empty key is refused, and typing `open` onto a row next to an existing `open` saves `ope` while the field shows `open`.
  REPRODUCED: scratch vitest probe, editor with `states: {on: {}, off: {}}`, inner `<input>` of row 0 set to `off` + `input` event → 0 config-changed, host `.value` = `on`, inner `<input>.value` = `off`; then inner set to `o` + `input` → config-changed with keys `["o","off"]`.
  SITES:
    src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:241 (reset written to the host property only)
    src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:611 (rename wired to the per-keystroke event)
    tests/cards/hexa-tiles/sci-fi-hexa-tiles-editor.test.ts:615 (TC-HQA-U-15 writes the host `.value` itself and asserts the host `.value`, so it cannot see the inner field)
  FALSIFIED BY: TC-HQA-U-15 driven through the inner `<input>` of `sf-editor-input[element-id="state_key"]` (set `.value`, dispatch `input`), asserting the inner `<input>.value` after `updateComplete`.
  FIX-CLASS: corrects
  RESOLUTION: fixed — spec FR-12 amended first (a rename is committed on `focusout` or `Enter`, never per keystroke; a refused rename restores the inner `<input>`), TC-HQA-U-15 amended to type keystroke by keystroke into the inner `<input>`. Code: the state-key `sf-editor-input` (sci-fi-hexa-tiles-editor.ts `_renderStateRow`) no longer listens to `input-update`; `@focusout` and `@keydown` Enter call `_renameState(…, field)`, which reads the host's `value` and, on refusal, writes the old key back to it — the host has already rendered the typed key in an earlier task, so Lit's `.value` binding now differs and rewrites the inner `<input>` (cause 1); no prefix is ever committed (cause 2). Proof: TC-HQA-U-15 rewritten in tests/cards/hexa-tiles/sci-fi-hexa-tiles-editor.test.ts (`o > op > ope > open` and `of > o > ''` write no config-changed, focusout refuses and `innerInput(host).value` shows `on` / `off` again; `charge` committed on Enter) — RED on the round-1 code (`typing o > op > ope > open writes nothing: expected 8 to be 5`), green after; `prove_test.py --covers src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts` → PROVEN.

- [LOW] dev/modules/hass-action.js:50 — in Live mode a real service call that HA rejects (entity unavailable, service missing) becomes an unhandled promise rejection: the workbench console logs nothing and the browser reports an uncaught error — `void call()` floats the promise the live `callService` returns (FR-16 Live mode; checklist "floating promises without error handling").
  FIX-CLASS: corrects
  RESOLUTION: fixed — spec FR-16 amended (a rejected service call, Live or Mock, is logged as an error in the workbench console, never left as an unhandled rejection) and TC-HQA-U-17 gains the case. Code: dev/modules/hass-action.js `call()` wraps `hass.callService` in `Promise.resolve(…).catch(failed)` plus a `try/catch` for a synchronous throw, `failed` logging `❌ hass-action toggle <entity> → <domain>.<service> failed: <message>` at `error`; the Live call stays synchronous (the existing Live case still sees both calls at once). Proof: new case `TC-HQA-U-17: in Live mode a service HA rejects is logged as an error, never left unhandled` in tests/dev/workbench.test.ts (a console line carries `Entity cover.portail is unavailable`, no `unhandledRejection`) — RED on the round-1 code (`expected false to be true`), green after; `prove_test.py --test tests/dev/workbench.test.ts --covers dev/modules/hass-action.js` → PROVEN.

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

# Code review — hexa-tiles-quick-actions, round 2

AUDITOR: subagent
PACKET: .sc/review/07dc94b-8f34631f (delta re-review: delta.patch against the round-1 hashes)

COVERAGE (must_read.txt is empty: no entry point packaged; rows are the delta's code and spec files. The delta's docs/reviews/** files are review records, not audited)

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts | 140-323 (every emission path) + delta | 323 | delta + whole gesture class |
| src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts | 200-260, 590-650 + delta | 708 | delta + state-list code |
| tests/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.test.ts | 520-600 + delta | 961 | delta + U-08 block |
| tests/cards/hexa-tiles/sci-fi-hexa-tiles-editor.test.ts | 1-40, 520-647 + delta | 665 | delta + helpers + lot block |
| tests/dev/workbench.test.ts | 322-413 + delta | 413 | delta + quick-actions block |
| dev/modules/hass-action.js | 1-63 | 63 | yes |
| docs/specs/hexa-tiles-quick-actions/spec.md | FR-5 to FR-16, TC-HQA-U-08/15/17, Error Handling rows + delta | 201 | delta + touched clauses |
| joins followed out of the delta: src/components/editor-inputs/sf-editor-input.ts (1-186, full), src/utils/base-editor.ts (100-170: `_dispatchChange` syncs `this.config`), the tile accordion's `input-update` listener (sci-fi-hexa-tiles-editor.ts:442-444), dev/modules/mock-hass.js (135-196, 226-229: Mock and Live `callService`) | as listed | — | read for the joins |

DETERMINISTIC PRE-PASS (run on the tree, output in scratch files)
- Typecheck: `tsc --noEmit` → exit 0.
- Lint (src/cards/hexa-tiles, tests/cards/hexa-tiles, dev/modules/hass-action.js, tests/dev/workbench.test.ts) → exit 0, 0 errors. 3 warnings are the same pre-existing non-null assertions as in round 1, now at sci-fi-hexa-tiles-editor.ts:270/284/298 (the lines moved by 5). The 4th warning says hass-action.js is lint-ignored.
- Tests: `vitest run tests/cards/hexa-tiles tests/dev/workbench.test.ts tests/styles` → 14 files, 183 tests passed.
- Mutations and probes ran on a copy of the tree in a scratch directory. Nothing in the tree was touched.

VERDICT: APPROVE
SPEC: docs/specs/hexa-tiles-quick-actions/spec.md

FINDINGS:
- [HIGH] src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts:270 — CLOSED. The case that falsified round 1 is now pinned. Under FR-5.1 (an absent or `unavailable` entity mutes every gesture, and a hold on `unavailable` opens more-info), `_perform` (sci-fi-hexa-tiles-quick-actions.ts:270-275) returns before `_emit` for every gesture on an absent or `unavailable` entity:
  - tap and double tap: `onMuted` (the toast);
  - hold on `unavailable`: `_emitMoreInfo` (303-306), whatever `hold_action` is;
  - hold on an absent entity: nothing.

  As a result no `hold` is fired and `_startPending` (277) is unreachable on those states, so round-1 sites :276, :285-288 and sci-fi-hexa-tiles.ts:120-123 cannot be reached for an unavailable tile. Every gesture (click, keyboard, the deferred double-tap tap at 185-188, the hold timer at 203-207) goes through `_perform`, so this guard sits at the single emission point. It reads the state when the gesture fires: a hold armed on `closed` whose entity turns `unavailable` within 500 ms opens more-info.
  - The new case `TC-HQA-U-08: a hold on an unavailable entity opens more-info even with a toggle hold_action, and starts no pending` asserts exactly one `tap`/more-info, no `hold`, no `data-pending`, and no `addMessage` or `data-no-change` at +30 s.
  - Mutants QA-1, QA-2, QA-3 (QA-3 restores the round-1 guard) and QA-4 are all killed (MUTATION lines below).
- [MEDIUM] src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:241 — CLOSED. Both causes are gone.
  - Per-keystroke commits (cause 2): the state-key field no longer listens to `input-update` (sci-fi-hexa-tiles-editor.ts:612-620). `focusout` and `keydown` Enter call `_renameState` with the host element (238-250). The field's per-keystroke `input-update` still bubbles, but its only ancestor listener (the tile accordion, 442-444) acts only on `type === 'remove'` with `kind === 'accordion'`, so nothing writes a prefix.
  - The field not resetting (cause 1): on refusal, the old key goes back into the host's `value`. The host re-rendered the typed key in an earlier task (`sf-editor-input._onInput`, sf-editor-input.ts:131-134), so Lit's `.value` binding on the inner `<input>` sees a change and rewrites it.

  Probes (a scratch test against the tree's code):
  - P2: refusal on Enter → the inner `<input>` shows `on` again, and the following `focusout` writes nothing (0 config-changed).
  - P3: the same refused key typed and left twice in a row → restored both times, 0 config-changed.
  - P4: rename by Enter, then `focusout`, then a second rename of the same row → 2 config-changed, `{"closed":{"color":"#111"},"off":{}}`, entry kept.
  - P1: a successful rename followed by a colour edit on the same row, with a render between them (as two browser events always have, since `_dispatchChange` sets `this.config` synchronously) → `{"charge":{"color":"#ff0000"},"off":{}}`.
  - P5 / P6: a rename followed by a removal elsewhere, and a refusal on a row moved up by a removal → correct keys, inner field restored.

  Mutants ED-1 to ED-5 are killed by the rewritten TC-HQA-U-15.
- [LOW] dev/modules/hass-action.js:50 — CLOSED for Live mode. `call()` (hass-action.js:50-56) attaches `.catch(failed)` to `Promise.resolve(hass.callService(…))`, and `failed` logs `❌ … failed: <message>` at `error`. The new TC-HQA-U-17 Live case bites both ways: WB-1 (no catch) is killed by the console-line assertion, and WB-4 (logs, then re-throws) is killed by `expect(unhandled).not.toHaveBeenCalled()`. The Mock half of the amended clause is the new finding below.
  RESOLUTION: fixed — the round-2 reviewer rules it CLOSED for Live (WB-1, WB-4 killed by the Live case of TC-HQA-U-17); the Mock half is fixed under the next finding.
- [LOW] dev/modules/hass-action.js:62 — a regression that dropped the rejection handling from the Mock path would ship unnoticed. The Mock path's delayed call (`setTimeout(call, MOCK_DELAY_MS)`) and the synchronous-throw branch of `call()` (hass-action.js:51-55) can both be removed with the suite green. This round amended FR-16 (workbench: "un appel de service rejeté (Live ou Mock) est journalisé en erreur … jamais laissé en promesse rejetée non gérée"), but TC-HQA-U-17 pins only "mode Live, `callService` rejeté". The code honours the Mock half today; no test holds it. Mutants WB-2 and WB-3 survive. Fix:
  - add a TC-HQA-U-17 case in Mock mode: a stub `hass` whose `callService` rejects, advance `MOCK_DELAY_MS` → one error console line, no `unhandledRejection`. This kills WB-3.
  - for WB-2, either a case with a stub whose `callService` throws synchronously, or remove the try/catch. Neither workbench `hass` can throw synchronously: Live `callService` is `async` (dev/modules/mock-hass.js:226) and Mock returns `Promise.resolve()` (mock-hass.js:195). Removing it closes WB-2 as GONE.
  FIX-CLASS: corrects
  RESOLUTION: fixed — TC-HQA-U-17 amended in the spec (mode Mock, `callService` rejeté, avance 3 s → a console error line, no unhandled rejection) and the case added to tests/dev/workbench.test.ts (`in Mock mode a service call rejected at 3 s is logged as an error, never left unhandled`). Mutant WB-3 replayed in the tree (`setTimeout(() => hass.callService(…), MOCK_DELAY_MS)`, no catch) → the case goes RED (`expected false to be true`), source restored, 17/17 green. WB-2: the synchronous try/catch is removed from `call()` in dev/modules/hass-action.js (both workbench hass objects return a promise — mock-hass.js:195, :226), so WB-2 is GONE.

### Spec limit F-07 — holds
The gate (`irreversible`) row's reject paths hold, at the card scope the spec states. All gestures pass through one emission point, `_perform` (sci-fi-hexa-tiles-quick-actions.ts:267-278):
- U-06: a click after a hold or a cancelled gesture is swallowed at 170-173.
- U-08: an absent or `unavailable` entity emits no toggle, for any gesture and any configured action (270-275, the HIGH closed above).
- U-21: the deferred tap re-reads the state when it fires (185-188 → 268-270).

A toggle can therefore start pending only on a state that is neither absent nor `unavailable`. QA-1 to QA-4 are killed.

### Spec limit F-01 — holds
The delta adds no blocking. A toggle that FR-5.1 does not mute still re-enters pending through `_startPending` (309-322), unchanged.

### Spec limit F-03 — holds
The deferred tap still re-enters `_perform` when it fires (185-188). The delta moved the absent/unavailable guard into one block (270-275), and the guard is still evaluated at emission.

### Spec limit F-06 — holds
Rendering is untouched by the delta. The new hold path sends no toast, and pushes no `No change` toast onto an error tile.

### Spec limits F-02, F-04, F-05 — hold (not touched by the delta; round-1 rulings stand)

MUTATION: QA-1 removed the hold → more-info line on an unavailable entity (`else if (state === 'unavailable') this._emitMoreInfo(entity);`) — KILLED by TC-HQA-U-08 (both unavailable cases)
MUTATION: QA-2 more-info on an absent entity too (`else this._emitMoreInfo(entity);`) — KILLED by TC-HQA-U-08 (absent entity, even on hold)
MUTATION: QA-3 restored the round-1 guard (hold on unavailable falls through to `_emit`) — KILLED by TC-HQA-U-08 (toggle hold_action case)
MUTATION: QA-4 toast on a muted hold as well — KILLED by TC-HQA-U-08
MUTATION: ED-1 removed `field.value = oldKey;` in `_renameState` — KILLED by TC-HQA-U-15 (`expected 'open' to be 'on'`)
MUTATION: ED-2 disabled the Enter commit — KILLED by TC-HQA-U-15
MUTATION: ED-3 re-wired the rename to `input-update` (per keystroke) — KILLED by TC-HQA-U-15
MUTATION: ED-4 disabled the focusout commit — KILLED by TC-HQA-U-15
MUTATION: ED-5 dropped the existing-key check — KILLED by TC-HQA-U-15
MUTATION: WB-1 dropped `.catch(failed)` in hass-action.js `call()` — KILLED by TC-HQA-U-17 (Live rejected)
MUTATION: WB-4 `.catch(failed)` replaced by a handler that logs then re-throws — KILLED by TC-HQA-U-17 (`unhandled` called once)
MUTATION: WB-2 removed the try/catch around `hass.callService` in hass-action.js `call()` — SURVIVED
MUTATION: WB-3 Mock path `setTimeout(call, MOCK_DELAY_MS)` replaced by a bare `hass.callService(…)` with no catch — SURVIVED

NOTES:
- FR-5.1 reads as unconditional: "un appui long sur une entité `unavailable` ouvre more-info". The code follows it to the letter, so an `unavailable` tile whose `hold_action` is `none` or `navigate` also opens more-info on hold. This is what the spec says. If `hold_action: none` was meant to mean silence even there, the spec should say so.
- Same-task stale closure (round-1 residual risk): probe P1 without a render between a committed rename and a colour edit on the same row loses the rename. With the render in between, the rename survives. Two browser events always have a render between them: the `focusout` comes from mousedown and the colour edit is a later event, with Lit's microtask between. So this stays a residual risk, not a defect.
- An Enter pressed during IME composition (`e.isComposing`) commits the pre-composition text. State keys are ASCII HA states, so this is not realistic, and the spec does not pin it.
- `sf-editor-input` has a single focusable descendant, so "focus moving inside the field" cannot fire a spurious `focusout` commit. A window blur does commit, which matches "sortie du champ".

CONFORMANCE EVIDENCE:
- FR-5.1 (unavailable/absent mutes every gesture; hold on unavailable → more-info, absent → nothing) → src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts:270-275, 303-306
- FR-7 (only a toggle not muted by FR-5.1 starts pending) → sci-fi-hexa-tiles-quick-actions.ts:276-277
- FR-12 (rename on focusout / Enter, never per keystroke; refused rename restores the inner field) → src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:238-250, 612-620; src/components/editor-inputs/sf-editor-input.ts:131-134, 170
- FR-16 (rejected call logged as an error, Live) → dev/modules/hass-action.js:49-60

Review summary: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 (new) · round-1 findings closed 3/3
