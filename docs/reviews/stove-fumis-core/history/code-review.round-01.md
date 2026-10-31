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
  Fix: fall through to the preset/`nothing` branches when `this.hass.states[ecoSwitch]` is undefined (and amend the spec row to key on the entity being present, not the config being filled).

- [LOW] docs/specs/cards/bridge.md:1105 — **The workbench scenario a human uses to eyeball the stove chip cannot reproduce either generation of the defect, and the spec contradicts itself ten lines after asserting the rule.** Scenario 2's fixture still sets `'binary_sensor.clou_stove_status': { state: 'on' }` (bridge.md:1105, and the same fixture in the untouched dev/modules/mock-data.js:25 — OUT-OF-DIFF), a value the amended note at bridge.md:915 declares no Fumis generation ever emits; the mock also keeps `preset_modes: ['none','eco']` on `climate.clou` and has no `switch.*_eco_mode` (dev/modules/mock-data.js:16 — OUT-OF-DIFF), so the two new eco branches are unreachable in the workbench. Fix: in bridge.md, make the Scenario 2 stove fixture a core value (`combustion`) and say so in the § Workbench rows; the dev mock is the orchestrator's fix-or-file call.

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
