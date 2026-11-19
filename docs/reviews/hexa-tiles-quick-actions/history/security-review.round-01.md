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
