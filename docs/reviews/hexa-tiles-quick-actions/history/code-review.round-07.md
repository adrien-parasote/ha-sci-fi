AUDITOR: subagent

COVERAGE (packet .sc/review/321ab8e-77f12455; must_read.txt is empty, so no entry point was packaged and there is nothing to add):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| dev/modules/workbench-app.js | 1-443 | 443 | yes |
| dev/modules/bundle-loader.js | 1-36 | 36 | yes |
| dev/modules/reload-state.js | 1-34 | 34 | yes |
| tests/dev/bundle-loader.test.ts | 1-44 | 44 | yes |
| tests/dev/reload-card.test.ts | 1-59 | 59 | yes |
| docs/fixes/hexa-tiles-quick-actions/lot.json | 1-18 | 18 | yes |
| docs/fixes/hexa-tiles-quick-actions/verdicts.json | 1-10 | 10 | yes |

Read outside the diff to follow the joins: dev/modules/ha-connection.js:155-262 (credential persistence, OAuth callback cleanup), dev/modules/work-mode.js:1-60, dev/modules/view-modes.js (localStorage keys), dev/cards/hexa.js:6-19 (tile `link` values), src/cards/hexa-tiles/sci-fi-hexa-tiles.ts:536-545 (`_navigate`), src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts:296, docs/adr/ADR-007_workbench-mandatory.md:24-27 (how the workbench is served), dev/workbench.html:61.

VERDICT: WARNING
SPEC: docs/fixes/hexa-tiles-quick-actions/lot.json observation O1 (the « ↺ Recharger carte » button should reload the card on the rebuilt bundle with no error and stay on the selected card and scenario), bead ha-sci-fi-b92r.1

FINDINGS:
- [HIGH] dev/modules/workbench-app.js:236 — CAUSED-BY-DIFF: if you tap a linked hexa tile and then click « ↺ Recharger carte », the browser loads a 404 page. The workbench is gone, not reloaded on the selected card. This breaks O1 (the button stays on the selected card and scenario) on the card this lot is about. — `reloadCard` now calls `location.reload()`, which reloads whatever URL the tab currently shows. The existing `history.pushState` override (workbench-app.js:286-303) switches the tab and then still calls the real `pushState` whenever the protocol is not `file:`. Under the documented server (ADR-007: `npx serve@14 . -p 8888`, http), a tile with `link: 'lights'` (dev/cards/hexa.js:7, reached through sci-fi-hexa-tiles-quick-actions.ts:296 → sci-fi-hexa-tiles.ts:543) moves the address bar from `/dev/workbench` to `/dev/lights`. The same happens for links with no matching tab: `water-management`, `bridge`, `weather`. The old in-place re-render did not depend on the URL. The new reload does, and nothing in the diff pins the reload target.
  REPRODUCED: `node -e "console.log(new URL('lights','http://localhost:8888/dev/workbench').href)"` → `http://localhost:8888/dev/lights`; serve 14.2.8 started from the worktree root on port 18891 (PID kept and killed): `/dev/workbench` → 200, `/dev/workbench.html` → 301, `/dev/lights` → 404, `/dev/water-management` → 404.
  SITES: dev/modules/workbench-app.js:236 (`location.reload()` reloads the current URL)
         dev/modules/workbench-app.js:293-299 (the override lets the real pushState change the path on http)
  SWEPT: `git ls-files -co --exclude-standard | xargs grep -n -E 'pushState|replaceState|location\.(href|reload|search)'` (only these two sites in dev/ change or reload the page URL. ha-connection.js:256/259 only resets it to `location.pathname`)
  FALSIFIED BY: a test of the reload target taken after a tile navigation, e.g. an extracted `reloadTarget(initialPathname)`, or a happy-dom run of reloadCard after `history.pushState(null,'','lights')` that asserts the navigation goes to the workbench path and not `/dev/lights`. Today's regex test (`toContain('location.reload()')`) cannot fail on this.
  ROOT: O1 (the reload button stays on the selected card and scenario)
  FIX-CLASS: corrects
  Fix: at init, record the workbench document path (`location.pathname`, which also drops a leftover `?auth_callback=…&code=…`). Then navigate to that path in reloadCard, for example `location.replace(WORKBENCH_PATH)` or `location.assign(…)`, instead of `location.reload()`. sessionStorage survives the navigation within the tab.
  RESOLUTION: fixed — tests/dev/reload-card.test.ts "O1: the reload goes back to the workbench path after a tile moved the address bar" (WORKBENCH_PATH recorded before the pushState override; reloadCard → reloadWorkbench → location.replace(WORKBENCH_PATH))

- [MEDIUM] dev/modules/workbench-app.js:205 — the main promise of O1, landing back on the same scenario and card, has no behavioural test. It can be broken in three ways with the whole new test file still green. — tests/dev/reload-card.test.ts:34-44 only regex-matches source text (`selectCard(startCard, restored?.scenario)`). It never runs the restore logic. The card guard also lacks the `__proto__` / `constructor` / `toString` probe that the plain-object-lookup checklist item requires. If `Object.hasOwn` is lost, `toString` reaches `CARDS[key].label` (workbench-app.js:226) and init throws.
  MUTATION: dev/modules/workbench-app.js:205 `names.includes(selected) ? selected : names[0]` → `names.includes(selected) ? names[0] : names[0]` (restored scenario ignored) — SURVIVED
  MUTATION: dev/modules/workbench-app.js:429 `Object.hasOwn(CARDS, restored.card)` → `true` (restored card not checked against the registry) — SURVIVED
  MUTATION: dev/modules/workbench-app.js:227 `buildScenarios(key, scenario);` → `buildScenarios(key);` (scenario never passed down) — SURVIVED
  (Method: each mutant was written to a scratch copy of workbench-app.js. tests/dev/reload-card.test.ts was run from a scratch cwd with `vitest run --root <worktree>`, so its `process.cwd()` read the mutant. A control mutant that adds `bundle.reset()` to reloadCard turned the first test red, which shows the mutant was the file actually read. The tree under review was not modified, and `git hash-object` still equals packet hashes.txt.)
  Fix: move the restore decision into reload-state.js as a pure function, e.g. `restoreSelection(state, cards) → { card, scenario }`, and call it from the init sequence. Test it on the restored card plus scenario, an unknown scenario (falls back to the first), an unknown card, `__proto__` / `toString` / `constructor` as the card, and an iconpicker card.
  RESOLUTION: fixed — tests/dev/reload-card.test.ts "O1: the restored card, scenario and edited config are reopened", "O1: an unknown scenario is dropped and the card opens on its first one", "O1: an unknown card falls back, with no scenario and no config", "O1: a prototype name as card (%s) falls back", "O1: a card with no scenarios (iconpicker) is restored with no scenario" (restoreSelection in dev/modules/reload-state.js, called by the init sequence)

- [MEDIUM] dev/modules/workbench-app.js:234-237 — a developer who changed the card config in the YAML or GUI editor, rebuilt, and clicked « ↺ Recharger carte » now loses that config silently. The card comes back on its default config instead of the one being worked on. — Before the change, reloadCard re-rendered with `activeConfig` kept (same card and scenario, so workbench-app.js:129 did not recompute it). The page reload resets `activeConfig = null` (workbench-app.js:228), and only `{card, scenario}` is carried over. O1 names card and scenario, but the old behaviour also kept the edited config. This is a behavioural regression that the brief does not mention.
  Fix: also carry `activeConfig` in the reload state (it is JSON-serialisable, since it already round-trips through js-yaml) and re-apply it after `selectCard`. Or, if you decide against it, say in the button's log line that edits are reset.
  RESOLUTION: fixed — tests/dev/reload-card.test.ts "O1: the restored card, scenario and edited config are reopened" and "O1: the reload goes back to the workbench path after a tile moved the address bar" (config saved by reloadCard; selectCard(key, scenario, config) sets activeConfig and lastScenarioKey so renderCard keeps it, and rewrites #yaml-textarea)

- [LOW] tests/dev/reload-card.test.ts:12 — the first two cases break on any harmless rewrite of workbench-app.js, such as renaming `startCard` or reformatting the call, while still letting real behaviour regressions through (see the MEDIUM above). — They test the source text, using a brace-counting body extractor and regexes, instead of behaviour. With the extraction proposed above, only the "never re-evaluates the bundle in place" assertion needs to read source text.
  RESOLUTION: fixed — tests/dev/reload-card.test.ts "O1: reloadCard never re-evaluates the bundle in place and goes through reloadWorkbench" is the one source-text assertion left; every other O1 case imports dev/modules/reload-state.js and runs it

NOTES:
- Security: the restored values are never rendered. `restored.scenario` is only compared with `names.includes` (SameValueZero, own keys of the registry). `restored.card` is type-checked and `Object.hasOwn`-checked before it indexes `CARDS`. The scenario button `innerHTML` (workbench-app.js:209) still interpolates only registry keys. takeReloadState removes the key before parsing, rethrows non-SyntaxError errors, and rejects non-object, array and null JSON. No secret is stored, and sessionStorage is scoped to the tab.
- Bundle freshness after the reload holds: bundle-loader.js:21 appends `?v=<Date.now()>` on each page's single load, and dist/ ships a single file with no `import(` chunks, so the rebuilt bundle is fetched fresh.
- Removing `reset()` from bundle-loader.js and its test case is complete: there is no other caller (`grep -n '\.reset()'` finds only the hexa gesture controller and a spike page, both unrelated).
- Live mode survives the reload: a long-lived token and OAuth tokens are both persisted (ha-connection.js:162-171, :43), and `tryAutoReconnect` runs at init. Work mode, view mode, device size, orientation, language and edit tab are all in localStorage.
- dev/ is in the eslint ignore list (`eslint --max-warnings 0 dev/modules/*.js` reports "File ignored because of a matching ignore pattern"), so lot.json's lint command covers only the tests. This is a repository choice, not a defect of this lot.
- docs/fixes/hexa-tiles-quick-actions/verdicts.json records `"proved": null` while the brief says the test was proven red. That is the orchestrator's register, not product code. Checking it is outside this review.

### Spec limit F-01 — holds
Not reached by this diff: `git diff --stat 321ab8e -- src` is empty. Every toggle gesture still emits during pending (FR-7.6), in src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts, which this diff does not touch.
### Spec limit F-02 — holds
Not reached by this diff. The click-after-hold flag is cleared by the next pointerdown at sci-fi-hexa-tiles-quick-actions.ts:152, and the disconnect path is at sci-fi-hexa-tiles.ts:151-157.
### Spec limit F-03 — holds
Not reached by this diff. The hold and double-tap timers are cleared at sci-fi-hexa-tiles-quick-actions.ts:251-252 and :262.
### Spec limit F-04 — holds
Not reached by this diff. `MAX_PENDING_S = 86_400` is at sci-fi-hexa-tiles-quick-actions.ts:23-27.
### Spec limit F-05 — holds
Not reached by this diff. `opening` / `closing` are rendered as pending at sci-fi-hexa-tiles-quick-actions.ts:35.
### Spec limit F-06 — holds
Not reached by this diff. The `ERROR_MARK` mark is at sci-fi-hexa-tiles.ts:26, and the `Unavailable` second line is at sci-fi-hexa-tiles-quick-actions.ts:105.
### Spec limit F-07 — holds
Not reached by this diff: no state-mapping.yaml or card code is changed.

CONFORMANCE EVIDENCE:
- O1, no second evaluation of the bundle → workbench-app.js:234-237 (reloadCard no longer touches `<script>` or the loader), bundle-loader.js:17-34 (one load per page, `pending ??=`).
- O1, card restored → workbench-app.js:428-430 (`takeReloadState`, `typeof` + `Object.hasOwn` guard, fallback `'hexa'`).
- O1, scenario restored → workbench-app.js:205/219 (`initial` = restored name if known, else the first), :227 (passed through selectCard).
- Read-once state → reload-state.js:23-25 (`removeItem` before parsing), tested at tests/dev/reload-card.test.ts:51-53.

## Review Summary
| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 2 |
| LOW | 1 |

## Round 2 — closure (self)

VERDICT: APPROVE
AUDITOR: self

Findings closed (all four were in the diff):
1. Reload target (the HIGH): `WORKBENCH_PATH = location.pathname` is recorded at module top level, before the `history.pushState` override; reloadCard calls `reloadWorkbench(location, sessionStorage, WORKBENCH_PATH, {card, scenario, config})`, which saves the state then `location.replace(path)` — never `location.reload()`. Proven with a fake location whose pathname moved to `/dev/lights`.
2. Restore untested (the first MEDIUM): the decision is the pure `restoreSelection(state, cards, fallback)` in dev/modules/reload-state.js, called by the init sequence; tested on restored card+scenario, unknown scenario, unknown card, `__proto__` / `toString` / `constructor`, an iconpicker card, a non-object config and a null state.
3. Edited config lost (the second MEDIUM): `activeConfig` travels in the reload state; `selectCard(key, scenario, config)` re-applies it (with `lastScenarioKey = currentScenario`, so renderCard does not overwrite it) and rewrites #yaml-textarea; tabs and pushState navigation still call `selectCard(key)`.
4. Source-text tests (the LOW): one source-text assertion remains (reloadCard neither touches `<script>` / appendChild / bundle.reset / bundle.load nor calls `location.reload()`, and calls reloadWorkbench); every other case runs reload-state.js.

Evidence: `npx vitest run tests/dev/` → Test Files 3 passed, Tests 34 passed; `npx eslint --max-warnings 0 tests/dev/reload-card.test.ts tests/dev/bundle-loader.test.ts` → exit 0; `review_gate.py --closure` → 4 findings, 4 carrying a RESOLUTION, 0 open.
