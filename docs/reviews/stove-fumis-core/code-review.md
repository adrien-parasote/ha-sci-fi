AUDITOR: subagent

# Code review — lot `stove-fumis-core` (lane fix, packet `.sc/review/536c652-29624bc7`)

COVERAGE (one row per file in scope; the packet's `must_read.txt` is EMPTY — no entry point was packaged):

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/bridge/sections/sf-bridge-stove.ts | 133 | 133 | yes |
| src/cards/stove/sci-fi-stove.ts | 503 | 503 | yes |
| src/cards/stove/config.ts | 31 | 31 | yes |
| src/cards/stove/sci-fi-stove-editor.ts | 133 | 133 | yes |
| src/cards/stove/labels.ts | diff hunk only | 38 | no |
| src/cards/stove/styles.ts | 295–341 | 341 | no (the `.bottom` block, the only hunk) |
| src/locales/locales/fr.js | 2 added ids + hash check | 319 | no |
| xliff/fr.xlf | 2 added units + hash check | 1174 | no |
| docs/specs/cards/bridge.md | 195–215, 845–945, 995–1045, 1095–1110, 1230–1240, 1520–1530 | 1528 | no |
| docs/specs/cards/stove.md | 125–200, 540–560 | 610 | no |
| tests/cards/bridge/sections/sf-bridge-stove.test.ts | diff hunk (52 added lines) | 287 | no |
| tests/cards/stove/sci-fi-stove.test.ts | diff hunk (170 added lines) | 844 | no |
| docs/fixes/stove-fumis-core/lot.json | 34 | 34 | yes |
| docs/fixes/stove-fumis-core/verdicts.json | 26 | 26 | yes |
| *read outside the diff, to follow the joins*: src/cards/bridge/sci-fi-bridge-editor.ts (stove section 715–775), src/cards/bridge/labels.ts:52, src/cards/bridge/sci-fi-bridge.ts (78–90, 150–160), src/components/buttons/sf-button-card.ts (107, full), src/components/buttons/sf-button.ts (full), src/components/buttons/sf-button-card-select.ts (full), src/components/editor-inputs/sf-editor-input.ts (full), src/components/editor-inputs/sf-editor-dropdown-entity.ts (full), src/components/editor-inputs/sf-editor-dropdown.ts (grepped), src/utils/base-card.ts (60–150), src/utils/base-editor.ts (185–200), dev/modules/mock-data.js (grepped) | — | — | — |

VERDICT: BLOCK

SPEC: docs/specs/cards/bridge.md (§ `sf-bridge-stove`, § Éditeur, § Workbench) and docs/specs/cards/stove.md (§ Contrat d'intégration Fumis), both amended by this lot.

## FINDINGS

- [HIGH] docs/specs/cards/bridge.md:205 — **The defect the user reported (the stove chip stuck on "Inactive") stays visible for them after this lot: there is no way, in the only configuration surface the spec allows, to point the bridge's stove status field at the entity the fix now needs.** The lot redefines `config.status` as the raw status entity and states in the same file (bridge.md:918-921) that the core `fumis` integration exposes *no* running binary_sensor — the status must therefore be `sensor.*_detailed_stove_status`. But the stove status field of the bridge editor is a dropdown fed `_entitiesByDomain('binary_sensor')` only (src/cards/bridge/sci-fi-bridge-editor.ts:722 and :746-751), the dropdown commits a value only when an offered item is clicked (free text only filters — src/components/editor-inputs/sf-editor-dropdown.ts:118,144-145), and the field is still labelled "ON/OFF status sensor" (src/cards/bridge/labels.ts:52, spec row bridge.md:1237). The spec makes the visual editor mandatory and YAML non-sanctioned (bridge.md:1001: « L'éditeur visuel est **MANDATORY** (pas de YAML direct) »), so a user migrated to core fumis — whose HACS-era `binary_sensor.clou_stove_status` no longer exists, which yields `undefined` → `isOn === false` at src/cards/bridge/sections/sf-bridge-stove.ts:74-75 — keeps exactly the symptom of O1 (the chip never reads "Active"). The amended row at bridge.md:205 still names a `binary_sensor` as the stove status example and the amendment says nothing about which domains the picker must offer, so nothing in the spec catches the gap.
RESOLUTION: fixed (spec) + filed ha-sci-fi-jq5 (code) — the finding is anchored on bridge.md:205, a file IN this diff, and the in-diff half was mine: the spec now CATCHES the gap instead of being silent on it. bridge.md:205 names the core `sensor.*_detailed_stove_status` first and says the status is not necessarily a `binary_sensor`; the § sf-bridge-stove / isOn note now states outright that `config.status` is NOT constrained to the binary_sensor domain, that the editor's picker MUST offer both domains (`_entitiesByDomain('binary_sensor', 'sensor')`, the form `_renderAppliancesSection` already uses), why a restricted list makes the contract unreachable (the dropdown publishes only a clicked item), and that the field no longer reads « ON/OFF »; the editor label row (bridge.md § labels, `input-status-sensor`) was relabelled with it. The two CODE sites are OUT-OF-DIFF (src/cards/bridge/sci-fi-bridge-editor.ts:721, src/cards/bridge/labels.ts:52); fix-or-file sends them to a bead. Claims verified independently before filing: the status dropdown is fed `_entitiesByDomain('binary_sensor')` alone, `_onInput` carries the comment « CRITICAL: Typing must NOT dispatch input-update — only selection does », and `_renderAppliancesSection` already uses the two-domain form 120 lines above. The bead carries the two-line fix and the red test that pins it. ⚠ The orchestrator states in its hand-off that O1's chip fix is INERT on the core integration until jq5 lands — the lot is not claimed to have restored the user's chip.
  SITES:
  src/cards/bridge/sci-fi-bridge-editor.ts:722 — OUT-OF-DIFF (the `binary_sensor`-only item list)
  src/cards/bridge/sci-fi-bridge-editor.ts:746-751 — OUT-OF-DIFF (the status dropdown that writes `config.status`)
  src/cards/bridge/labels.ts:52 — OUT-OF-DIFF (`'input-status-sensor': msg('ON/OFF status sensor')`, now a false description)
  docs/specs/cards/bridge.md:205 (amended row, in diff)
  docs/specs/cards/bridge.md:1237 (the label row of the editor's label table, in diff file)
  FALSIFIED BY: a case in tests/cards/bridge/sci-fi-bridge-editor.test.ts that mounts the editor with `sensor.poele_detailed_stove_status` as the only stove-status candidate in `hass.states` and asserts it is offered by the stove status dropdown. It fails today and still fails after any change confined to src/cards/bridge/sections/sf-bridge-stove.ts, i.e. after the whole O1 fix as delivered.
  ROOT: F-BR-06 — invariant « the status entity the card READS is one the sanctioned editor can WRITE ».
  FIX-CLASS: corrects — the picker must offer `sensor` alongside `binary_sensor` (the same editor already uses the combined form `_entitiesByDomain('binary_sensor', 'sensor')` at line 604), the label and the two spec rows follow. No dependency, module or ceiling is added; the contract the amended spec sets is simply not honoured on the writer side. ⚠ The two code sites are outside this lot's write perimeter: the orchestrator rules fix-or-file, but O1 is not closed for the reporter until they move.

- [MEDIUM] src/cards/stove/sci-fi-stove.ts:410-418 — **A user who mistypes the eco switch entity id, or whose eco switch is unavailable, gets a leaf/“Off” toggle that looks live, reports the stove as not in eco, and raises an error toast on every press** — the very class of dead control O3 was opened to remove. `_renderEcoControl` branches on the *configured string* only (`if (ecoSwitch)`), never on the entity existing: `this.hass.states[ecoSwitch]?.state === 'on'` silently yields `false` for a missing entity (line 411), and the press reaches `switch.toggle` on a non-existent entity (line 464-470). Every other optional surface of this card guards the state, not the config: `_renderPelletQuantity` (line 175-177) and `_renderPelletStock` (line 192-194) both `return nothing` when `hass.states[...]` is absent. The spec table (docs/specs/cards/stove.md:102-106) keys the first branch on « `config.switch_eco_mode` renseigné », so the code conforms — but the clause was written by this lot and it contradicts the section's own stated principle (stove.md:108-109: « un bouton rendu mais sans liste à ouvrir est un contrôle mort, pire qu'un contrôle absent »).
RESOLUTION: fixed — `_renderEcoControl` now branches on the entity, not the config string (`const ecoState = ecoSwitch ? this.hass.states[ecoSwitch] : undefined; if (ecoSwitch && ecoState)`), the same guard `_renderPelletQuantity` and `_renderPelletStock` use. A configured-but-absent entity falls through to the preset branch, or renders nothing. Proved by two cases: `test_O3_configured_but_absent_eco_switch_renders_no_dead_toggle` (presets present → no toggle, the 2 historical selects) and `test_O3_configured_but_absent_eco_switch_renders_nothing_without_presets` (neither → no toggle, no select). `npx vitest run tests/cards/stove/sci-fi-stove.test.ts` 58/58, `npm run typecheck` exit 0. The spec clause this finding calls out (stove.md § Mode éco, first row) was amended with it.
  Fix: fall through to the preset/`nothing` branches when `this.hass.states[ecoSwitch]` is undefined (and amend the spec row to key on the entity being present, not the config being filled).

- [LOW] docs/specs/cards/bridge.md:1105 — **The workbench scenario a human uses to eyeball the stove chip cannot reproduce either generation of the defect, and the spec contradicts itself ten lines after asserting the rule.** Scenario 2's fixture still sets `'binary_sensor.clou_stove_status': { state: 'on' }` (bridge.md:1105, and the same fixture in the untouched dev/modules/mock-data.js:25 — OUT-OF-DIFF), a value the amended note at bridge.md:915 declares no Fumis generation ever emits; the mock also keeps `preset_modes: ['none','eco']` on `climate.clou` and has no `switch.*_eco_mode` (dev/modules/mock-data.js:16 — OUT-OF-DIFF), so the two new eco branches are unreachable in the workbench. Fix: in bridge.md, make the Scenario 2 stove fixture a core value (`combustion`) and say so in the § Workbench rows; the dev mock is the orchestrator's fix-or-file call.
RESOLUTION: fixed (spec) — Scenario 2's fixture is now `'sensor.clou_detailed_stove_status': { state: 'combustion' }` with the reason inline, so the spec no longer contradicts its own note ten lines up. The dev mock is OUT-OF-DIFF and filed as ha-sci-fi-jex, which also covers the missing `switch.*_eco_mode` that keeps both new eco branches unreachable in the workbench.

## ⚠️ Cannot verify from this diff

- **Vocabulary completeness.** The claim that `sensor.*_detailed_stove_status` has exactly these fourteen values, and that `sensor.*_stove_status` renames three of them, rests on no artifact in the repository (there is no `docs/research/stove-fumis-core/`). The maps are internally consistent and the two cards agree on which values are "not heating" (`off`, `cooling`, `cold_start_off`, `wood_burning_off`), but a fifteenth value would read as **heating** on the bridge (anything outside `STOVE_OFF_STATES` is `isOn`) while reading as **unknown** on the stove card — I cannot confirm from the diff that no such value exists.
- **Mutation testing could not be executed.** The reviewed worktree has an empty `node_modules`, so no suite could be run against a mutant without installing dependencies or writing into the tree. No mutant is claimed here; the packet's standing evidence (reverting the two sources reddened 10 of the new bridge cases and 13 of the new stove cases) is the equivalent proof for the primary mutants of O1 and O2/O3.

NOTES:
- The two new locale ids are genuinely the lit-localize hashes, not hand-forged: `generateMsgId(['On'])` → `s091d5807b5b33550` and `generateMsgId(['Eco mode switch'])` → `s9f34d842bf3f3897`, computed with the project's own `@lit/localize/internal/id-generation.js`. `Eco` and `Off` were already in both catalogues.
- `_onEcoToggle` raises a hard-coded French toast (`'Mode éco modifié'`, src/cards/stove/sci-fi-stove.ts:467) instead of `msg(...)`. The contradiction is upstream of this lot: the three sibling handlers do exactly the same (`'Mode HVAC modifié'`, `'Température modifiée'`, `'Preset modifié'`, lines 450/458/473), so localising the new one alone would make the card inconsistent. A single localisation item covering all four is the right unit, not a change inside this lot.
- The eco toggle is a plain `sf-button-card`, which does not set `--border: 1px solid var(--sf-primary)` the way `sf-button-card-select` does on its own `:host`; the toggle therefore sits in the bottom bar without the cyan outline of its two neighbours. Widths match (`--min-width: 90px` is inherited) and no spec row pins the border, so this is a cosmetic threshold, not a defect.
- Neither spec gained a TC/IT row for the amended behaviours (membership-based `isOn`, the fourteen statuses, the three eco branches); the fix lane's traceability lives in docs/fixes/stove-fumis-core/lot.json instead (three `-t test_O1|O2|O3` commands). Flagged only in case the spec gate wants rows.
- The new `xliff/fr.xlf` units are appended at the end of `<body>` rather than in the file's existing position order; harmless, `lit-localize extract` re-emits the file wholesale.
- `sf-button-card-select` overrides `clickBtn` and emits no `button-click`, while `sf-button-card` inherits `SciFiButton.clickBtn` and does emit it (src/components/buttons/sf-button.ts:88-97). The `@button-click` wiring of the eco toggle is therefore correct, and it cannot be reached by the sibling selects.

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 1 | block for this lot |
| MEDIUM | 1 | info |
| LOW | 1 | note |

Positive Observations (the load-bearing conformance evidence):
- Pellet-only, core-integration regression safety is real, not asserted: the seven historical status keys keep byte-identical icon/colour pairs (src/cards/stove/sci-fi-stove.ts:39-45 vs the pre-image), the hvac select (lines 371-379) and the temperature wheel (lines 381-387) are untouched, and the preset select is preserved verbatim in the second branch of `_renderEcoControl` (lines 424-434) — so a config with `preset_modes` behaves exactly as before.
- `switch_eco_mode` is wired end to end: declared (src/cards/stove/config.ts:28), exposed by the editor with `kind="entity"`, which the editor's `_update` routes to the config ROOT and not into `sensors` (src/cards/stove/sci-fi-stove-editor.ts:49-62, :86), and added to `getRelevantEntities()` (src/cards/stove/sci-fi-stove.ts:98-100) — which `SciFiBaseCard.shouldUpdate` reads at src/utils/base-card.ts:75-82, so the toggle actually re-renders when the switch flips.
- O1's root cause reaches exactly one site: a repository-wide grep for `config.status` / `stove_status` consumers finds only src/cards/bridge/sections/sf-bridge-stove.ts; no second `=== 'on'` on a stove status survives.
- The off-set and the stove card's colour map agree on which values are not heating, so the two cards cannot disagree on the four off-side core states.
- `_renderStatus`'s fallback (`sci:stove-unknow` + `replaceAll('_',' ')`, line 253-254) is deliberately kept and still covered (TC-1114, docs/specs/cards/stove.md:552).

VERDICT: BLOCK

---

## Round 2 — orchestrator's own round (the cap's exit, no second reviewer)

`review_gate.max_review_rounds = 1` : round 1 was recorded refused (code BLOCK) and no
round 2 by a fresh reviewer is available. The hand-off's exit applies — every finding in
the diff carries its `RESOLUTION:` line, so the round below is mine and declares itself.

What moved since the refused round:

- **HIGH** — the in-diff half (the spec's silence on the status entity's domain) is fixed:
  `bridge.md:205` and the § `sf-bridge-stove` / `isOn` note now state that `config.status`
  is not constrained to `binary_sensor`, that the editor's picker must offer both domains,
  and why a restricted list makes the contract unreachable on core. The two CODE sites are
  out of this diff and filed as `ha-sci-fi-jq5` (P1) with the two-line fix and the red test
  that pins it. **The user's chip stays dark on the core integration until jq5 lands** — this
  lot does not claim otherwise, and the hand-off says so in those words.
- **MEDIUM** — fixed in code and proved by two new cases; the spec clause that licensed the
  defect was amended with it.
- **LOW** — the spec fixture is fixed; the dev mock is out of diff and filed as
  `ha-sci-fi-jex` (P3).
- **« Cannot verify »** — the fourteen-value vocabulary now names its source in
  `stove.md` (the 2026-10-31 reading, bead `ha-sci-fi-nib`, upstream issue), states that no
  published contract guarantees it, and says a fifteenth value lands on the fallback — plus
  the instruction to complete `STOVE_OFF_STATES` at the same time, which is the trap that
  would otherwise count a new off state as running.

Evidence on the final tree: `npm run typecheck` exit 0 · `npm run lint` exit 0 (166
warnings, the project's declared cap, unchanged) · `npx vitest run
tests/cards/stove/sci-fi-stove.test.ts` 58/58 · the whole suite is PROVE's own gate.
No mutation testing was run; the revert evidence in the packet covers the primary mutants.

VERDICT: APPROVE
AUDITOR: self

---

## Round 3 — the `dev/` change the earlier rounds never saw (AUDITOR: self)

`codereview-passed` went stale on its own accord after round 2, naming
`dev/modules/ha-connection.js` and `dev/modules/mock-hass.js`: a change landed in the
lot's scope AFTER the review that approved it. Stating it rather than letting the
re-mint paper over it — **neither the subagent reviewer nor my own round 2 read these
three files.** What follows is my reading alone, and the round cap (1) leaves no fresh
reviewer to buy the separation.

**Why it is in this lot at all.** PROVE's whole-suite gate was refused by
`tests/dev/workbench.test.ts`, which could not even be imported — two `/node_modules/…`
ABSOLUTE specifiers in `dev/modules/`, present at the lot's base commit, untouched by
the three observations, filed as `ha-sci-fi-rx2` (P2) and already paid once by the
preceding lot `p1-runtime-defects`. The exit was the user's: bypass `fix-proved`, or fix
rx2 inside this lot. **The user chose the fix, explicitly** ("Corrige ha-sci-fi-rx2 dans
ce lot (les 2 imports absolus), puis termine"). So the lot carries a fourth change that
is not one of its observations, by the user's own instruction, and this round is where
that is recorded.

**The change.** The workbench is served from the PROJECT ROOT (ADR-007:
`npx serve@14 . -p 8888`), which is why the absolute path existed: the browser loads
`dev/modules/*.js` directly, with no bundler, so a bare specifier alone would not
resolve there. The root binding moved to the one file that knows which root it is served
from — an `importmap` in `dev/workbench.html` — and the two modules now import the bare
specifier `home-assistant-js-websocket`.

**What I checked, and how:**

- *Both paths resolve, positively.* Browser: `dev/workbench.html` loaded from a static
  server at the project root, and the network log shows
  `GET /node_modules/home-assistant-js-websocket/dist/index.js → 200` plus its whole
  module graph (socket, connection, auth, collection, config, services, entities,
  errors, types, commands, store, messages, util) — the importmap resolved. Node/Vite:
  `npx vitest run tests/dev/workbench.test.ts` → 11/11, in a WORKTREE, which is exactly
  what was impossible before. Whole suite 96/96 files, 1139 cases.
- *Ordering.* The importmap is at `dev/workbench.html:14`, inside `<head>` (ends :22),
  before the only module script (:212). An importmap must precede the first module load;
  it does. The js-yaml CDN tag is a classic script with its integrity hash, untouched.
- *Blast radius.* `dev/` is outside the build: `rollup.config.mjs` has a single
  `input: 'src/sci-fi.ts'` and zero occurrences of `dev/`, so nothing here can reach
  `dist/` or a user's Home Assistant. The consumers of these two modules are
  `dev/modules/workbench-app.js`, `dev/modules/editor.js`, `ha-connection.js` itself and
  `tests/dev/workbench.test.ts` — all exercised by the green suite. (The many
  `tests/**` matches on "mock-hass.js" are `tests/fixtures/mock-hass.js`, a different
  file, untouched.)
- *Security.* No new origin and no new network reach: the importmap maps a bare
  specifier to a SAME-ORIGIN path already being fetched before this change, and the
  package version is unchanged (`home-assistant-js-websocket ^9.6.0`, a declared
  dependency). Nothing is widened.
- *Not verified, and said so.* The browser check needed the package present under the
  worktree root, which a worktree does not have (`node_modules/` holds only `.vite` and
  `.vitest-cache`); two package symlinks were created for the check and REMOVED after it
  — `node_modules/` is back to those two cache dirs. The check therefore proves the
  importmap resolves, not that a fresh `git worktree add` serves the workbench with no
  `npm install`. `dist/` was NOT rebuilt: it is tracked but none of the 8 preceding
  commits touch it, so this lot keeps that pattern and the bundle a user loads still
  predates these fixes until the next release build.

Residual risk I am NOT dressing up: three files changed in `dev/` with no independent
reviewer. They are dev-harness only, outside the shipped bundle, and both load paths are
proved green — but the separation that round 1 bought does not extend to them.

VERDICT: APPROVE
AUDITOR: self
