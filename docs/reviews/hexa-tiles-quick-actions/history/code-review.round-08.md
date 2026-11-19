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

Survivors of round 1, closed after round 2 was first recorded. tests/dev/reload-card.test.ts now also imports the real dev/modules/workbench-app.js under happy-dom, on the body of dev/workbench.html, with a seeded reload state. Only bundle-loader, icon-browser and ha-connection are stubbed. That run found that the init's work-mode render, resumed after `bundle.load()`, recomputed `activeConfig` and `lastScenarioKey` for the old selection and lost the restored config. renderCard now drops a render superseded while the bundle loaded (`if (cardKey !== currentCard || scenarioKey !== currentScenario) return;`). Each mutant below was run on the tree and the file restored. After this, `npx vitest run tests/dev/` gave Test Files 3 passed, Tests 35 passed, and eslint exited 0.
MUTATION: dev/modules/workbench-app.js:205 `names.includes(selected) ? selected : names[0]` → `names.includes(selected) ? names[0] : names[0]` (restored scenario ignored) — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js:429 `Object.hasOwn(CARDS, restored.card)` → `true` (restored card not checked against the registry) — GONE from dev/modules/workbench-app.js: `Object.hasOwn(CARDS, restored.card)`
MUTATION: dev/modules/workbench-app.js:227 `buildScenarios(key, scenario);` → `buildScenarios(key);` (scenario never passed down) — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/reload-state.js restoreSelection `Object.hasOwn(cards, state.card)` → `true` — KILLED by O1: an unknown card falls back, with no scenario and no config
MUTATION: dev/modules/reload-state.js reloadWorkbench `loc.replace(path)` → `loc.reload()` — KILLED by O1: the reload goes back to the workbench path after a tile moved the address bar
MUTATION: dev/modules/workbench-app.js reloadCard `WORKBENCH_PATH` → `location.pathname` — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js selectCard `lastScenarioKey = currentScenario;` removed — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js renderCard stale-render guard removed — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js reloadCard `config: activeConfig` removed — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config

## Round 3: delta review (fresh subagent)

AUDITOR: subagent

COVERAGE (packet .sc/review/321ab8e-598e9917, a delta since .sc/review/321ab8e-77f12455; must_read.txt is empty, so no entry point was packaged and nothing more is added):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| dev/modules/workbench-app.js | 1-468 | 468 | yes |
| dev/modules/reload-state.js | 1-72 | 72 | yes |
| tests/dev/reload-card.test.ts | 1-159 | 159 | yes |
| docs/reviews/hexa-tiles-quick-actions/code-review.md | 1-105 | 105 | yes |
| docs/reviews/hexa-tiles-quick-actions/history/code-review.round-06.md, round-07.md, round-06/07.hashes.txt | 0 | — | no (review history, not product code) |

Read outside the delta to follow the joins: dev/modules/bundle-loader.js:1-36, dev/modules/work-mode.js:1-65, dev/modules/ha-connection.js:240-259 (only readers of location.search and replaceState), tests/setup.ts, tsconfig.json:10-26, package.json scripts, .github/workflows/ci.yml:1-30, release.yml:31, and `git show 321ab8e:` for workbench-app.js, bundle-loader.js and bundle-loader.test.ts.

VERDICT: WARNING
SPEC: docs/fixes/hexa-tiles-quick-actions/lot.json, observation O1 (the « ↺ Recharger carte » button reloads the card on the rebuilt bundle with no error, and stays on the selected card and scenario), bead ha-sci-fi-b92r.1

CLOSURE OF THE PREVIOUS ROUND:
- [HIGH] dev/modules/workbench-app.js:236 — CLOSED. `WORKBENCH_PATH = location.pathname` is set at workbench-app.js:31, at module top level, before the pushState override at :310-328. reloadCard (:256-262) calls reloadWorkbench (reload-state.js:46-49), which saves the state and then calls `loc.replace(path)`. `location.reload()` is never called. The integration test pushes `lights`, checks that the address bar moved to `/dev/lights`, clicks the real button, and asserts `replace('/dev/workbench')` (reload-card.test.ts:144-153). I mutated the path to `location.pathname` or `location.href` on a scratch copy, and that test went red both times.
- [MEDIUM] dev/modules/workbench-app.js:205 — CLOSED. The restore decision is the pure `restoreSelection` (reload-state.js:60-72), called from the init sequence (workbench-app.js:453-455). The real workbench-app.js runs under happy-dom with a seeded state (reload-card.test.ts:124-142), which checks title, active scenario, YAML and read-once. The `__proto__` / `toString` / `constructor` probe is at :103-106. All three round-1 mutants are killed again (MUTATION lines below). Two gaps remain in the same test; they are a new finding below.
- [MEDIUM] dev/modules/workbench-app.js:234-237 — CLOSED. reloadCard saves `config: activeConfig` (:260). `selectCard(key, scenario, config)` sets `activeConfig` and `lastScenarioKey = currentScenario`, and rewrites #yaml-textarea (:240-246). The stale-render guard (:112) stops the init's work-mode render from overwriting it. I removed `lastScenarioKey`, the YAML write, the `if (config)` branch and the guard one at a time on scratch copies, and each turned the integration test red.
- [LOW] tests/dev/reload-card.test.ts:12 — CLOSED. One source-text assertion is left (:53-61). It is the right one, because "the bundle is never re-evaluated in place" is a property of the source. Every other case runs reload-state.js or the real workbench-app.js.

FINDINGS:
- [HIGH] tests/dev/reload-card.test.ts:87 — the project's required typecheck fails on this lot's new test file. `npm run typecheck` runs at .github/workflows/ci.yml:22 and release.yml:31, so a CI run or a release that carries this lot stops at its first quality step. — tsconfig.json:25 includes `tests/**/*.ts` with `strictNullChecks`, `noUncheckedIndexedAccess` and `allowJs` (it reads the JSDoc types of dev/modules/*.js), and the file has 18 type errors. (1) The `CARDS` fixture (:46-50) does not fit `restoreSelection`'s JSDoc param `Record<string, { scenarios?: Record<string, unknown> }>` (reload-state.js:56): that type has only optional fields, and `icons: { type: 'iconpicker' }` shares none of them. (2) `window.happyDOM` is undeclared. (3) `REGISTRY.stove` / `REGISTRY.lights` may be undefined, and `.config` does not exist on the registry union. This breaks the language-checklist item (HIGH, type safety) that says the typecheck the project runs includes the tests.
  REPRODUCED: `npx tsc --noEmit` → exit 2, 20 errors: 18 in tests/dev/reload-card.test.ts, 2 in tests/dev/bundle-loader.test.ts (the latter pre-exist at base, see NOTES).
  SITES: tests/dev/reload-card.test.ts:87, :92, :94, :98, :100, :104, :109, :114, :115, :119 (TS2345, fixture vs the JSDoc type at dev/modules/reload-state.js:56)
         tests/dev/reload-card.test.ts:126 (TS2532, `exec(html)![1]` may be undefined)
         tests/dev/reload-card.test.ts:127 (TS2339, `happyDOM` is not on `Window`)
         tests/dev/reload-card.test.ts:130, :132, :139, :157 (TS18048 `REGISTRY.stove` / `REGISTRY.lights`; TS2339 `config` at :132 and :157)
  SWEPT: `npx tsc --noEmit > log; grep 'error TS' log | cut -d'(' -f1 | sort | uniq -c` → 18 tests/dev/reload-card.test.ts, 2 tests/dev/bundle-loader.test.ts
  FALSIFIED BY: `npx tsc --noEmit` reporting zero errors in tests/dev/reload-card.test.ts. A fix that covers only the fixture still leaves the 8 errors at :126-157.
  ROOT: the project typecheck covers the tests
  FIX-CLASS: corrects
  Fix: widen the JSDoc param at reload-state.js:56 to `Record<string, { scenarios?: Record<string, unknown>, type?: string }>` (the real registry has the same iconpicker entry). In the integration test, narrow the registry entries once (`const stove = REGISTRY.stove; if (!stove || !('config' in stove)) throw …`), and reach happy-dom through a typed cast instead of `window.happyDOM!`.

- [MEDIUM] tests/dev/reload-card.test.ts:154 — two of O1's promises can be broken with all 35 tests still green. First, reloadCard can stop carrying the scenario, and the card then comes back on its first scenario instead of the selected one. Second, the scenario half of the stale-render guard can be dropped, and an edited config on the hexa card (the default card, and the card this lot is about) is then silently lost on every reload. — The integration test asserts `saved.card` and `saved.config` but never `saved.scenario` (:154-157). It also clicks the button while `lights` sits on its first scenario, so a dropped scenario would look identical. The restore run seeds only `stove` (:130-133). For stove, the card half of the guard (`cardKey !== currentCard`, workbench-app.js:112) is enough to drop the stale init render `('hexa', null)`. For hexa, only the scenario half drops it. I checked this with a scratch variant of the same test that restores `hexa` on its second scenario with an edited config: the real code passes, and the card-only guard fails it.
  MUTATION: dev/modules/workbench-app.js:259 reloadCard `scenario: currentScenario` → `scenario: null` — SURVIVED
  MUTATION: dev/modules/workbench-app.js:112 stale-render guard `cardKey !== currentCard || scenarioKey !== currentScenario` → `cardKey !== currentCard` (scenario half dropped) — SURVIVED
  MUTATION: dev/modules/workbench-app.js:112 stale-render guard `cardKey !== currentCard || scenarioKey !== currentScenario` → `scenarioKey !== currentScenario` (card half dropped) — SURVIVED
  Fix: in the integration test, click a non-first `lights` scenario before the reload and assert `saved.scenario`. Add a second run (or `it.each`) that restores `hexa` on a non-first scenario with an edited config. For the card half, restore `icons` and assert that the next reload saves `config: null`: without the card half, the stale hexa render resumes and leaves `activeConfig` holding the hexa config while the icon browser is shown.

- [LOW] dev/modules/workbench-app.js:134 — the next reader is told that renderCard detects a card change here, but it cannot. The variable is dead, and the comment above it (:128-129, "Always recompute when card or scenario changes") now describes a check that no longer exists. — CAUSED-BY-DIFF: the guard added at :112 returns whenever `cardKey !== currentCard`, so `const cardChanged = currentCard !== cardKey` is always `false` afterwards. A card change is in fact handled by selectCard resetting `activeConfig = null` (:248). This is dead code (universal checklist, dead code).
  Fix: drop `cardChanged` from the condition at :137, and update the comment so it says that selectCard's `activeConfig = null` is what triggers the recompute on a card change.

Mutants re-run from the previous rounds (the packet has no survivors.txt; these are the round-1 SURVIVED lines, copied verbatim):
MUTATION: dev/modules/workbench-app.js:205 `names.includes(selected) ? selected : names[0]` → `names.includes(selected) ? names[0] : names[0]` (restored scenario ignored) — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js:429 `Object.hasOwn(CARDS, restored.card)` → `true` (restored card not checked against the registry) — KILLED by O1: a prototype name as card (%s) falls back
MUTATION: dev/modules/workbench-app.js:227 `buildScenarios(key, scenario);` → `buildScenarios(key);` (scenario never passed down) — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config

Other mutants this round, all on scratch copies:
MUTATION: dev/modules/workbench-app.js:112 stale-render guard removed — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js:240 selectCard `if (config)` → `if (false)` — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js:243 selectCard `lastScenarioKey = currentScenario;` removed — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js:244-246 selectCard #yaml-textarea write removed — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js:31 `WORKBENCH_PATH = location.pathname` → `location.href` — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js:257 reloadCard `WORKBENCH_PATH` → `location.pathname` — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/workbench-app.js:258 reloadCard `card: currentCard` → `card: 'hexa'` — KILLED by O1: after a tile navigation, Recharger carte goes back to the workbench and reopens the card, scenario and edited config
MUTATION: dev/modules/reload-state.js:61 `Object.hasOwn(cards, state.card)` → `true` — KILLED by O1: an unknown card falls back, with no scenario and no config
MUTATION: dev/modules/reload-state.js:61 `Object.hasOwn(cards, state.card)` → `(state.card in cards)` — KILLED by O1: a prototype name as card (%s) falls back
MUTATION: dev/modules/reload-state.js:65 `Object.hasOwn(scenarios, state.scenario)` → `true` — KILLED by O1: an unknown scenario is dropped and the card opens on its first one
MUTATION: dev/modules/reload-state.js:68 `!Array.isArray(state.config)` removed — KILLED by O1: a non-object config is dropped
MUTATION: dev/modules/reload-state.js:25 `storage.removeItem(KEY)` removed — KILLED by O1: the saved state is read once, and a missing or malformed one is null
MUTATION: dev/modules/reload-state.js:47 `saveReloadState(...)` removed before `loc.replace` — KILLED by O1: the reload goes back to the workbench path after a tile moved the address bar
(Method: workbench-app.js and reload-state.js were copied outside the repository, with their relative imports rewritten to the real tree's absolute paths. Each mutant was run by `vitest run --config <scratch config>`, whose `resolve.alias` sends the test's import of each module to the mutant copy, so the test's `vi.mock` targets are still the real modules. A clean copy as control passed 13/13. A known-bad control turned the integration test red, which proves the mutant was the file actually loaded.)

NOTES:
- The round-2 self record closed the second round-1 mutant as `GONE from dev/modules/workbench-app.js: Object.hasOwn(CARDS, restored.card)`. That code was never in the file at the lot's base: `git show 321ab8e:dev/modules/workbench-app.js | grep hasOwn` finds nothing, because it was this lot's own interim code. A GONE close that requires the code to exist at base therefore does not hold. The check moved to reload-state.js:61, so I broke it there and closed the mutant with its own words as KILLED.
- The round-2 self record says its mutants were "run on the tree and the file restored". The tree now matches the packet hashes, so nothing was lost. Mutating in place is still the pattern that cost a security fix elsewhere; scratch copies are the safe route.
- OUT-OF-DELTA: tests/dev/bundle-loader.test.ts:23 and :37 have 2 TS2345 errors under `npx tsc --noEmit` (the `FakeScript` fake document vs the `Pick<Document, 'createElement' | 'head'>` JSDoc at bundle-loader.js:10). Both pre-exist at base 321ab8e and did not move in this delta. They have to be fixed too before `npm run typecheck` goes green.
- `restoreSelection` keeps the edited config when the saved scenario no longer exists, so the config opens on the first scenario. That matches its own doc ("kept only with the card they were saved for"), and O1 does not pin it.
- `location.replace(WORKBENCH_PATH)` drops the query string. The only query the workbench reads is the OAuth `auth_callback` (ha-connection.js:240), which has already been consumed and stripped by then, so dropping it is correct. The bundle stays fresh because bundle-loader.js:21 appends `?v=<Date.now()>`. Dev modules other than the bundle may come from the HTTP cache on a plain navigation, but the old in-place reload never re-imported them either, and O1 is about the bundle.
- Overlay: a dropped stale render still runs `finally` and hides the overlay. Both renders await the same `pending` promise, so the live render's continuation runs in the same microtask checkpoint and hides it again. No visible flicker.
- Security: the restored values never reach markup. The scenario is matched against own registry keys, and the card goes through `typeof` plus `Object.hasOwn`. The config is non-null, non-array object-checked and then goes to `setConfig` and `jsyaml.dump` into a textarea `.value` (no HTML parsing). sessionStorage is same-origin and tab-scoped, and holds no secret.
- `reloadWorkbench` throws without navigating if `sessionStorage.setItem` throws (quota). For a config of a few hundred bytes that is not a realistic case.
- Lint: `npx eslint --max-warnings 0 tests/dev/reload-card.test.ts tests/dev/bundle-loader.test.ts` → exit 0. Suite: `npx vitest run tests/dev/` → Test Files 3 passed, Tests 35 passed.

### Spec limit F-01 — holds
This diff does not reach it: `git diff --stat 321ab8e -- src` is empty and `git status --short src` is clean. FR-7.6 (every toggle gesture stays live while pending) still lives in src/cards/hexa-tiles/sci-fi-hexa-tiles-quick-actions.ts, which is untouched.
### Spec limit F-02 — holds
Not reached by this diff (src untouched).
### Spec limit F-03 — holds
Not reached by this diff (src untouched).
### Spec limit F-04 — holds
Not reached by this diff. `MAX_PENDING_S = 86_400` is at sci-fi-hexa-tiles-quick-actions.ts:23, and it caps the delay at :31.
### Spec limit F-05 — holds
Not reached by this diff. `opening` / `closing` render as pending at sci-fi-hexa-tiles-quick-actions.ts:35.
### Spec limit F-06 — holds
Not reached by this diff. `ERROR_MARK` is at sci-fi-hexa-tiles.ts:26 and is applied at :497.
### Spec limit F-07 — holds
Not reached by this diff: neither state-mapping.yaml nor any card code changed.

CONFORMANCE EVIDENCE:
- O1, no second evaluation of the bundle → workbench-app.js:256-262 (reloadCard touches neither `<script>` nor the loader; it navigates) and bundle-loader.js:17-34 (one load per page, `pending ??=`), pinned at reload-card.test.ts:53-61.
- O1, reload on the rebuilt bundle, no error → reload-state.js:46-49 (`loc.replace(path)`, a fresh document, so the custom elements are defined once) and bundle-loader.js:21 (cache-busting `?v=`).
- O1, stays on the workbench after a tile navigation → workbench-app.js:31 (path recorded before the override at :310), pinned at reload-card.test.ts:144-153.
- O1, card / scenario / config reopened → workbench-app.js:453-455 → reload-state.js:60-72 → workbench-app.js:235-251, protected by the guard at :112, pinned at reload-card.test.ts:124-142 (stove only, see the MEDIUM).

## Review Summary
| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 1 |
| LOW | 1 |

