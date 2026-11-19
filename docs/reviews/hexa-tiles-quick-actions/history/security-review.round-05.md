# Security review — hexa-tiles-quick-actions — round 1

AUDITOR: subagent
Packet: .sc/review/07dc94b-d8461b07 (dirty 07dc94b..worktree). The packet's must_read.txt is empty: no entry point was packaged.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts | 1-320 | 320 | yes |
| src/cards/hexa-tiles/sci-fi-hexa-tiles.ts | 1-564 | 564 | yes |
| src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts | every diff hunk (all added/changed lines) | 700 | no (diff only) |
| src/cards/hexa-tiles/config.ts | diff hunks | 53 | no (diff only) |
| src/cards/hexa-tiles/labels.ts | diff hunks | 50 | no (diff only) |
| src/cards/hexa-tiles/styles.ts | diff hunks | 386 | no (diff only) |
| src/locales/locales/fr.js | diff hunks (static translation strings) | 411 | no (diff only) |
| dev/modules/hass-action.js | 1-55 | 55 | yes |
| dev/modules/workbench-app.js | diff hunks + every innerHTML site | 442 | no (diff only) |
| dev/cards/hexa.js | diff hunks | 48 | no (diff only) |
| dev/modules/mock-data.js | diff hunks | 169 | no (diff only) |
| src/utils/action.ts (sink, unchanged) | 1-26 | 26 | yes |
| src/components/sf-toast.ts (sink, unchanged) | 85-141 | 141 | no (addMessage path) |
| src/components/sf-icon/sf-icon.ts (sink, unchanged) | grep of icon/innerHTML/unsafe paths | 245 | no |
| dev/modules/console.js (sink, unchanged) | log() 27-35 | 114 | no |
| docs/specs/hexa-tiles-quick-actions/spec.md | 60-139 (FR-1..FR-16, anti-patterns, TC table head) | 201 | no |
Out of scope by instruction: dist/sci-fi.min.js, dist/sci-fi.min.js.map (rollup output). Tests, fixtures and docs/ markdown are not executable product code.

VERDICT: DEPLOY

SURFACES CHECKED:
- Trust boundaries: (1) Lovelace card YAML (tiles[].states / subtitle / pending_timeout / tap_action / hold_action / double_tap_action / link), authored by a dashboard admin, also written by the editor; (2) Home Assistant entity data (state strings, friendly_name, icon attributes), which an integration or an external device can influence; (3) the `hass-action` CustomEvent dispatched to the HA frontend.
- Per-state colour to CSS: `applyStateColor` (sci-fi-hexa-tiles.ts:37-46) writes only through `style.setProperty('--sf-tile-state-color', color)`, never into the `style` string. A value carrying `;` at top level is rejected by the CSSOM, so no declaration can be added. TC-HQA-U-02 asserts this with `red;background:url(x)` (quick-actions test file, line ~250).
- Text sinks: name, subtitle, entry.label, the live region `_live`, the aria-label and the `title=` attribute are all Lit text or attribute bindings, which escape automatically. The toast (sf-toast.ts:120-131) renders `${message}` through Lit `render()` as text. No `unsafeHTML`, `unsafeSVG`, `unsafeCSS`, `innerHTML`, `eval` or `new Function` in src/cards/hexa-tiles/ or src/utils/action.ts (grep).
- Icons: entry.icon goes to the `sf-icon` `.icon` property. It resolves through own-key lookups or HA's `ha-icon` and is never markup.
- Prototype keys: `resolveStateStyle` (quick-actions.ts:46-56) uses `hasOwnProperty` and a plain-object check, so an entity state of `__proto__`, `constructor` or `toString` does not resolve an inherited member. On the editor side, `Object.fromEntries` and object spread create own data properties, and the field names in `_setTileKey` / `_setStateField` are constants. No pollution path.
- Timers: `resolvePendingTimeoutMs` (quick-actions.ts:28-32) caps user durations to ]0, 86400] s, otherwise 30 s, which avoids the setTimeout 2^31-1 overflow. Hold, double-tap and pending timers are all cleared in `reset()`, which `disconnectedCallback` calls.
- Action dispatch: `fireHassAction` (src/utils/action.ts) dispatches the tile config unchanged. The HA frontend runs the action under the logged-in user's own WebSocket permissions. The card adds no service call of its own, which matches anti-pattern 4 (no per-domain toggle coded in the card).
- Navigation: `_navigate` (sci-fi-hexa-tiles.ts:538-545) is unchanged by this lot. It is reached from `_emit` only for `tile.link`, as it was before the lot. A `javascript:` or cross-origin `link` makes `history.pushState` throw a SecurityError, and `window.open` uses `noopener,noreferrer`.
- Secrets and dependencies: the scanner's secrets/config/deps checks PASS, scoped to the 37 files changed since 07dc94b. package.json and package-lock.json are unchanged (`git diff 07dc94b --stat`), so the lot adds no dependency.

FINDINGS:
- none

NOTES:
- Per-state `color` accepts any CSS token sequence, for example `url(...)`, as the custom-property value. Its consumers (stroke, fill through --icon-color, color, drop-shadow) take a colour or a same-document paint server, and the value comes from admin-authored dashboard config. A dashboard admin can already load arbitrary card JS, so this does not cross a trust boundary.
- The workbench's Live mode calls the real `hass.callService` with no guard (dev/modules/hass-action.js:46-49). This is documented and accepted in spec FR-16, spike answer D6.1. It is dev-only tooling that is not part of the shipped bundle, and it runs only on the developer's own token.
- The scanner flagged 7 `innerHTML` assignments in dev/modules/workbench-app.js (lines 105, 117, 123, 190, 203, 207, 215). All of them sit outside this lot's hunks (+25, +148-153). They clear containers or write static or repo-defined scenario names into a dev-only page. Not a defect of this lot.
- No `npm audit` was run: the lot changes no dependency, and the scanner's deps check passed on the existing lockfile. No frozen install was performed, so the worktree's node_modules was left untouched.
- The `tile.link` navigation precedence and `_navigate` existed before this lot. Only the call site moved, into `HexaTileGestures._emit`.

# Security review — hexa-tiles-quick-actions, round 2

AUDITOR: subagent
PACKET: .sc/review/07dc94b-8f34631f (delta re-review since round 1; delta.txt lists 13 files). The packet's must_read.txt is empty: no entry point was packaged.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts | 130-323 (gesture class, _perform, _emit, _emitMoreInfo, _startPending) + delta hunks | 323 | no (delta region and its whole call graph) |
| src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts | 195-265, 590-640 + delta hunks | 708 | no (delta region and the state-key write path) |
| dev/modules/hass-action.js | 1-63 | 63 | yes |
| dev/modules/console.js (sink, unchanged) | 1-114 | 114 | yes |
| src/components/editor-inputs/sf-editor-input.ts (sink, unchanged) | grep of value / innerHTML / unsafe | 186 | no |
| tests/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.test.ts | delta hunk (new TC-HQA-U-08 case) | 961 | no (delta only) |
| tests/cards/hexa-tiles/sci-fi-hexa-tiles-editor.test.ts | delta hunks (TC-HQA-U-15 rewrite) | 665 | no (delta only) |
| tests/dev/workbench.test.ts | delta hunk (new TC-HQA-U-17 case) | 413 | no (delta only) |
| docs/specs/hexa-tiles-quick-actions/spec.md | delta hunks (FR-12, FR-16, TC-HQA-U-08/15/17 rows) | 201 | no (delta only) |
Review documents under docs/reviews/ in the delta are prose, not executable code.

VERDICT: DEPLOY

SURFACES CHECKED:
- Action emission on an unavailable entity (sci-fi-hexa-tiles-quick-actions.ts:267-277). Before this round, a hold on an `unavailable` entity fell through to `_emit(tile, 'hold')`. That emitted the tile's configured hold_action, which could be a toggle or a perform-action, and started a pending state. Now the guard returns early for every gesture on an absent or unavailable entity. A tap or double tap calls `onMuted` (toast only). A hold on an `unavailable` entity calls `_emitMoreInfo(entity)`, which dispatches only `{entity, tap_action: {action: 'more-info'}}`, a dialog with no service call. A hold on an absent entity emits nothing. `entity` is `standaloneEntity(tile)`, the tile's own configured entity. The change strictly shrinks the set of actions that reach HA, so no new action can reach HA that the user did not intend. The new TC-HQA-U-08 case asserts one more-info `tap`, zero `hold` events, no `data-pending` and no toast at 30 s.
- `_emit` refactor (quick-actions.ts:296-306). The more-info fallback now goes through `_emitMoreInfo(tile.entity)`, which carries the same payload as before. Hold, tap, double-tap and link precedence are unchanged.
- Editor state-key rename (sci-fi-hexa-tiles-editor.ts:232-250, 616-619). The key is now read from the `sf-editor-input` host's `value` on focusout or Enter, instead of from `e.detail.value` on every keystroke. It still goes through the same checks: the key must be non-empty and must not duplicate an existing key. It is then written through `Object.fromEntries` into `states`, which creates own data properties, so a key such as `__proto__` causes no prototype pollution (as in round 1). The written value is a JS string in the card config and is never markup. Restoring a refused key writes a plain string to the host's `value` property (a Lit property binding), so there is no HTML sink.
- Workbench error logging (dev/modules/hass-action.js:48-56). The logged line interpolates `entity`, `domain` and `service` (from the card config and the local toggle map) and `err?.message ?? err` (the rejection from `hass.callService`). `log()` (dev/modules/console.js:27-36) renders it with `line.textContent`, never `innerHTML`, so an attacker-shaped error message or entity id cannot inject markup. Errors thrown synchronously and promise rejections are both caught, and `Promise.resolve(...)` also covers a non-promise return. The message stays on the developer's local page and is not sent anywhere.
- Injection sinks: grep for `unsafeHTML`, `.innerHTML =`, `eval(` and `new Function` found matches only in pre-existing dev modules (console.js, editor.js, ha-icon.js, icon-browser.js, workbench-app.js). None of them is in a delta hunk. console.js's only `innerHTML` is `= ''` in `clearConsole`.
- Secrets and dependencies: the delta adds no credential, token or URL. `git diff 07dc94b --stat -- package.json package-lock.json` prints nothing (exit 0), so no dependency changed.

FINDINGS:
- none

NOTES:
- Round 1 recorded no findings, so this round has nothing to close and nothing to rule on.
- `err?.message ?? err` renders a non-Error rejection object as `[object Object]`. This affects diagnostics only, is not a defect for security, and the spec does not pin the message's format.
- Live mode still calls the real `hass.callService` with no guard, as FR-16 (workbench Live mode calls the real service, D6.1 left as is) documents and accepts. This is dev-only tooling that is not in the shipped bundle.
- The rename closure captures `tile` from the render it was bound in. Lit rebinds the listener on each render, so focusout always reads the latest tile. This is functional, not a security defect.
- This is a static review. No live instance was started, and no `npm audit` was run, because the lot changes no dependency.

# Security review — hexa-tiles-quick-actions, round 3 (delta)

AUDITOR: subagent
PACKET: .sc/review/07dc94b-e1ffa091 (delta re-review since round 2; delta.txt lists 9 files: dev/modules/hass-action.js, tests/dev/workbench.test.ts, docs/specs/hexa-tiles-quick-actions/spec.md, and six review records under docs/reviews/). The packet's must_read.txt is empty: no entry point was packaged.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| dev/modules/hass-action.js | 1-60 | 60 | yes |
| tests/dev/workbench.test.ts | delta hunk (413-430, new Mock case of TC-HQA-U-17) | 431 | no (delta only) |
| docs/specs/hexa-tiles-quick-actions/spec.md | delta hunk (TC-HQA-U-17 row) | — | no (delta only) |
| joins: dev/modules/mock-hass.js 183-198, 222-236 (Mock and Live `callService`); dev/modules/console.js 24-50 (`log` sink); dev/modules/workbench-app.js 144-156 (the only caller) | as listed | — | read for the joins |
The docs/reviews/** files in the delta are review records (prose), not executable code.

VERDICT: DEPLOY

SURFACES CHECKED:
- The change itself, verified in delta.patch: `call()` in dev/modules/hass-action.js:51-53 lost its synchronous try/catch. What remains is `Promise.resolve(hass.callService(domain, service, { entity_id: entity })).catch(failed)`. No other line of the module moved.
- Error handling after the removal: the only caller, dev/modules/workbench-app.js:149-153, passes the card's `hass`, which is one of the two workbench objects. Live `callService` is `async` (dev/modules/mock-hass.js:226-229), so a throw becomes a rejection and `.catch(failed)` handles it. Mock `callService` (mock-hass.js:185-196) returns `Promise.resolve()`. Its only synchronous work is a `log`, a state mutation on the local mock store, and a `window.dispatchEvent` (which reports a listener's exception without passing it on). If the mock ever threw synchronously, the exception would surface as an uncaught error on the developer's own page (timer callback or event listener). That is a diagnostic gap, not a security exposure: nothing is sent off the page, no extra service call is made, and no state is left half-written in HA.
- Unintended service calls: the delta adds no call path. Each `hass-action` toggle still makes exactly one `callService` (immediately in Live, after `MOCK_DELAY_MS` in Mock), and the muted-relay scenario still returns before `call()` (hass-action.js:44-47). The new test asserts `callService` is called once at 3 000 ms.
- Logging sink: `failed` interpolates `entity`, `domain`, `service` and `err?.message ?? err` into `log()`. `log()` (dev/modules/console.js:41-50) writes with `line.textContent`, never `innerHTML`, so a hostile error message or entity id cannot inject markup. The message stays in the local workbench console.
- Secrets and dependencies: the delta adds no credential, token, URL or host. `git diff 07dc94b --stat -- package.json package-lock.json` printed nothing, and neither file shows in `git status`. No dependency changed.
- The test: the new Mock case uses a stub `hass` with a rejecting `callService`, has no network access, and removes its `unhandledRejection` listener in `finally`. `vi.useRealTimers()` partway through is reset by the describe's hooks (as the code review recorded).

FINDINGS:
- none

NOTES:
- Rounds 1 and 2 recorded no findings, so this round has nothing to close and nothing to rule on.
- Removing the synchronous guard relies on both workbench `hass` objects returning a promise. The comment at hass-action.js:50 now states this, and it matches mock-hass.js:195 and :226. If a third `hass` ever reaches `handleHassAction`, a synchronous throw would show up as an uncaught page error instead of an error console line. This is dev-only tooling that is not in the shipped bundle, and it is not a security defect.
- This is a static review of the delta. No live HA instance was started, and no `npm audit` was run, because the lot changes no dependency.

---

# Security review — hexa-tiles-quick-actions, self round past the cap (UI walk fix)

AUDITOR: self
PACKET: .sc/review/07dc94b-254b6d08 (delta since .sc/review/07dc94b-e1ffa091). The round gate refused a fresh reviewer (round 4, the cap's delta round already recorded). This is the one self round the cap allows, run headless, and the author is reviewing their own delta.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| dev/modules/mock-hass.js | 1-323 | 323 | yes |
| dev/modules/workbench-app.js | 404-422 (listener), 7 (import) | 442 | delta |
| tests/dev/workbench.test.ts | 320-523 | 523 | delta |
| dist/sci-fi.min.js | not read line by line: rebuilt by the cold boot (`npm run build`) from a src/ that has not moved in this delta | — | no |

VERDICT: DEPLOY

SURFACES CHECKED:
- Dev-only code: dev/modules/* is served by the local workbench and is not in the shipped bundle (rollup's input is src/; dist/ moved only through the rebuild).
- Service calls: the delta adds no call path. `republishedHass` decides only which states object a card is shown; it calls nothing. Live mode returns before the listener (`if (isLiveMode()) return;`), so a Live call is unaffected.
- Data flow: `detail.states` comes from the page's own mock closure, and `source` is compared by identity. No string from the event reaches the DOM, `innerHTML`, `eval` or a URL.
- Secrets and dependencies: no credential, token or host was added. package.json and package-lock.json are not in the delta.
- Tests: stub hass objects with fake timers, no network access, and the window listeners are removed in `finally`.

FINDINGS:
- none

NOTES:
- An in-diff code finding of this round (a deferred Mock mutation of a superseded hass reaching the new card) is fixed and recorded in code-review.md. It was an integrity issue in the dev Mock, not a security exposure.

---

# Security review — hexa-tiles-quick-actions, round 5 (delta, past the cap by the user's review-round bypass)

AUDITOR: subagent
PACKET: .sc/review/07dc94b-2b7c5ca8 (delta re-review since .sc/review/07dc94b-254b6d08; delta.txt lists 19 files). The packet's must_read.txt is empty: no entry point was packaged. The source files in the delta are src/cards/hexa-tiles/styles.ts, dev/cards/hexa.js, dev/modules/mock-hass.js, dev/modules/workbench-app.js and dist/sci-fi.min.js (rebuild). The rest is tests, a CSS baseline, specs, summaries and review records.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/hexa-tiles/styles.ts | delta hunk + current 340-375 (pending / moving block) | 401 | no (delta region) |
| dev/cards/hexa.js | delta hunk + current 44-51 | 52 | no (delta region) |
| dev/modules/mock-hass.js | delta hunks (republishedHass 159-170, named callService 206-217) + scenarioOverrides grep | 323 | no (delta region; full read in the self round) |
| dev/modules/workbench-app.js | delta hunks (import line 7, listener 411-421) + grep of every `innerHTML` and scenario site | 445 | no (delta region and sinks) |
| dist/sci-fi.min.js | delta hunk (751-781): only the CSS block that matches styles.ts | — | no (delta only) |
| tests/cards/hexa-tiles/styles.test.ts | delta hunk (TC-HQA-U-13) | 138 | no (delta only) |
| tests/dev/workbench.test.ts | delta hunks (TC-HQA-U-17 cases) | 534 | no (delta only) |
| tests/styles/card-css-baseline.json | delta hunk | — | no (delta only) |
| docs/specs/hexa-tiles-quick-actions/spec.md, docs/specs/cards/hexa-tiles.md, docs/specs/shared-tc-ids.md, docs/summaries/hexa-tiles-quick-actions/VERIFY.md | delta hunks | — | no (prose) |
The docs/reviews/** files in the delta are review records (prose), not executable code.

VERDICT: DEPLOY

SURFACES CHECKED:
- CSS change (src/cards/hexa-tiles/styles.ts:345-372). The `opacity` pulse is replaced by `@keyframes sf-hexa-pending` (stroke, stroke-width and drop-shadow animated towards `var(--sf-primary, #00d2ff)`) and `@keyframes sf-hexa-pending-icon` (`--icon-color` set to `var(--sf-primary, ...)` at 50%). There is also a reduced-motion override. All values are static literals in a Lit `css` tagged template with no `${}` interpolation, so no user or entity value reaches this sheet. `--sf-primary` is a theme token set by the dashboard's own theme, which is the same trust level as the card config. The `.tile-mark` exclusion only narrows which icons animate. No `unsafeCSS`, `url()` or `@import` was added.
- Shipped bundle (dist/sci-fi.min.js delta 751-781): the only moved hunk is the same CSS text. No dev module or new code path entered the bundle.
- New mock scenario (dev/cards/hexa.js:48-50). `'Poêle éteint'` overrides `climate.clou` to `state: 'off', attributes: { hvac_mode: 'off' }`. It is repo-authored, constant data that `buildMockHass` reads through `resolveScenario` / `normalizeStates` (mock-hass.js:188). Its name is written with `btn.innerHTML = \`<span class="dot"></span>${name}\`` (workbench-app.js:215). The name is a constant from the repo with no markup characters, on the local dev page only, so no external input reaches that sink.
- Mock republication (dev/modules/mock-hass.js:166-169, 206-214; workbench-app.js:411-421). The round-4 self round reviewed this. Re-checked here by a fresh reviewer: `republishedHass` compares `detail.source` with `cardHass.callService` by function identity and returns `{ ...cardHass, states }` or `undefined`. A page script would need to dispatch `mock-hass-state-changed` with the card's own `callService` reference to reach the card, and anything that holds that reference already controls the dev page. Live mode returns before the listener. No service call, URL, DOM or eval sink was added.
- Secrets and dependencies: the delta adds no credential, token, URL or host. `git diff 07dc94b --stat -- package.json package-lock.json` printed nothing (exit 0), so no dependency changed.
- Tests: TC-HQA-U-13 (CSS regex assertions) and the TC-HQA-U-17 cases use stub hass objects and fake timers, with no network access. Window listeners are removed in `finally`.

FINDINGS:
- none

NOTES:
- Earlier rounds 1-4 recorded no findings, so this round has nothing to close and nothing to rule on.
- The `innerHTML` at dev/modules/workbench-app.js:215 interpolates scenario names. They are repo constants on the local workbench page, so this is not a defect of this lot. A future scenario name with markup characters would render as markup there, in dev tooling only.
- This is a static review of the delta. No live HA instance was started, and no `npm audit` was run, because the lot changes no dependency.
