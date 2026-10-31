# Code review — jq5-editor-status-domain (fix lane, O1)

AUDITOR: subagent

Packet: `.sc/review/9c9f6f7-700187ea` (dirty, base 9c9f6f7). Branch `fix/jq5-editor-status-domain`.
Scope as delegated: correctness and security of the change only (lint and test naming excluded).
`must_read.txt` in the packet is EMPTY — no entry point was packaged; the coverage table below is
the diff's files plus every join followed out of it.

COVERAGE:

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/bridge/sci-fi-bridge-editor.ts | 180-210, 700-790 + grep of every `_entitiesByDomain` / `statusSensors` site | 891 | partial (targeted: the changed section + all call sites of the changed symbol) |
| src/cards/bridge/labels.ts | 1-57 | 57 | yes |
| tests/cards/bridge/sci-fi-bridge-editor.test.ts | 1-90, 579-650 (the 4 new cases) + `afterEach` | 788 | partial (new cases + fixtures they consume) |
| xliff/fr.xlf | diff + full programmatic parse of all 307 trans-units | 1174 | yes (parsed) |
| src/locales/locales/fr.js | diff + full programmatic key parse (307 keys) | 319 | yes (parsed) |
| docs/fixes/jq5-editor-status-domain/lot.json | 1-18 | 18 | yes |
| docs/fixes/jq5-editor-status-domain/verdicts.json | 1-10 | 10 | yes |
| src/cards/bridge/sections/sf-bridge-stove.ts (join: reader of `config.status`) | 1-133 | 133 | yes |
| src/components/editor-inputs/sf-editor-dropdown-entity.ts (join: the writer of the value) | 1-95 | 95 | yes |
| src/cards/bridge/sci-fi-bridge.ts (join: `getRelevantEntities`) | 40-90 | 211 | partial |
| src/cards/bridge/config.ts, config-metadata.ts (join: any domain validation of `status`) | grep of `status` | — | grep-complete |
| src/cards/stove/sci-fi-stove-editor.ts (join: the sibling card's status field) | 1-70 + grep | — | partial |
| docs/specs/cards/bridge.md (the contract) | 195-215, 890-960, 1230-1270, TC table grep | 1537 | partial (the clauses under review) |

VERDICT: APPROVE

SPEC: docs/specs/cards/bridge.md — § `sf-bridge-stove` / `isOn` (the IMPORTANT note, lines 936-944),
the editor label table (line 1246), the entity inventory row (line 205).

## FINDINGS

- none

## Conformance evidence

1. **The spec clause is satisfied literally.** bridge.md:940 requires
   « sa liste déroulante du champ status DOIT offrir les deux domaines —
   `_entitiesByDomain('binary_sensor', 'sensor')` ». Code:
   src/cards/bridge/sci-fi-bridge-editor.ts:726 (`statusSensors`), bound at
   src/cards/bridge/sci-fi-bridge-editor.ts:752 (`.items="${statusSensors}"`). Those are the
   only two occurrences of the symbol in the file (grep), so the widening is strictly
   section-local; the field's sibling dropdowns keep their own lists
   (`sensors` = `sensor` only at :721 for `pellet_quantity`, `counters` at :722).
2. **The relabel matches the prescribed row.** bridge.md:1246 prescribes
   `Stove status sensor` / `Capteur de statut du poêle`; src/cards/bridge/labels.ts:52 now reads
   `msg('Stove status sensor')`, and bridge.md:944 (« Le champ ne se libelle plus « ON/OFF » »)
   is satisfied — `grep -rn "ON/OFF" src/ xliff/ tests/` returns nothing but the spec sentence
   itself.
3. **No spec amendment was owed, and the claim is verified, not assumed.**
   `git show 9c9f6f7:docs/specs/cards/bridge.md` already carries both clauses at the lot's base
   (line 940 for the two domains, line 1246 for the label); `git status` shows
   docs/specs/cards/bridge.md untouched by this lot. The entity inventory row (bridge.md:205)
   already names `sensor.clou_detailed_stove_status` (core) beside the HACS binary_sensor, so no
   example contradicts the widened picker.
4. **Widening breaks no other bridge section and no reading of `config.status`.**
   `config.status` has exactly one reader, src/cards/bridge/sections/sf-bridge-stove.ts:74-75:
   `hass.states[config.status]?.state` tested for MEMBERSHIP of `STOVE_OFF_STATES` — domain-blind
   by construction. No domain validation exists anywhere else:
   src/cards/bridge/config.ts:94 types `status: string`, config-metadata.ts declares only
   `stove: { type: 'object' }`, and src/cards/bridge/sci-fi-bridge.ts:81-85 pushes
   `stove.status` into `getRelevantEntities()` as an opaque id. Full suite run against the lot's
   tree in an isolated copy: **1139 passed, 4 failed — all 4 are fixture-path failures of the
   sandbox** (tests/infrastructure.test.ts TC-101/TC-102/IT-101 and tests/sci-fi.test.ts
   TC-115/TC-105 read rollup.config.mjs, .github/ and hacs.json, which the isolated copy does not
   contain). Every bridge and card test passes; nothing regressed from the widening.
5. **The value the editor WRITES cannot be a value nothing accepts (the join out of the diff).**
   src/components/editor-inputs/sf-editor-dropdown-entity.ts:66-70 (`_selectItem`) is the only
   publisher — it dispatches the clicked `entity.entity_id`; `_itemMatchesQuery` (:58-64) only
   filters. So a `sensor.*` is now reachable AND committed, and the previous lot's
   `STOVE_OFF_STATES` fix (sf-bridge-stove.ts:32-39) stops being inert. Nothing in that component
   resets or re-dispatches a `value` absent from `items`, so no existing configuration is
   corrupted by the change of list.
6. **The i18n chain is canonical, with nothing dropped or orphaned.** Verified three ways:
   (a) the two message ids are the real lit-localize hashes — `generateMsgId(['Stove status
   sensor'], false)` = `sbfa68151bd7177c6` and `generateMsgId(['ON/OFF status sensor'], false)` =
   `s7b4210bd9fa13356`, so the retired unit is exactly the retired label and the new unit is
   exactly the new one; (b) re-running `lit-localize extract` then `lit-localize build` on the
   lot's sources in an isolated copy reproduces **xliff/fr.xlf and src/locales/locales/fr.js
   byte-for-byte** (`diff -u` empty for both, 307 messages extracted) — the committed artifacts
   are what the tooling generates, not hand edits, and `src/locales/locale-codes.ts` needed no
   change; (c) a programmatic cross-check finds 307 trans-units, **zero without a `<target>`**,
   and an exact key-set equality between fr.xlf and fr.js (no id in one and not the other).
   `git diff 9c9f6f7 -- xliff/fr.xlf src/locales/locales/fr.js` touches 4 lines total: only this
   unit moved.
7. **Security surface: none opened.** The diff adds no sink — the two changed expressions are a
   Lit property binding (`.items`) and a `msg()` string. The list is built from `hass.states`
   (already-trusted, already-rendered data) and rendered through Lit text bindings
   (sf-editor-dropdown-entity.ts:80-84), never `innerHTML`/`unsafeHTML`; no `eval`, no
   `new Function`, no path or process use. Widening the offered set does not widen trust: the
   value is an entity id the user's own HA already exposes, used only as a key into
   `hass.states`.
8. **The tests pin behaviour, not implementation, and they bite.** The helper
   (tests/cards/bridge/sci-fi-bridge-editor.test.ts:604-619) locates the field by the *value bound
   to it*, not by DOM order or by label, and asserts on what a user can select
   (`dropdown.items`). The negative case is non-vacuous: `counter.stock` and `person.adrien` are
   both present in the mocked `hass.states` (:45, :57 via the spread at :588), so the exclusion
   assertion could fail. Cleanup is inherited from the outer `afterEach`
   (`document.body.replaceChildren()`, :84-86). Mutation testing (run on an isolated copy of the
   tree, nothing written in the repository):

MUTATION: `statusSensors = _entitiesByDomain('binary_sensor', 'sensor')` reverted to `('binary_sensor')` (src/cards/bridge/sci-fi-bridge-editor.ts:726) — KILLED by test_O1_status_dropdown_offers_core_sensor_enum
MUTATION: `statusSensors = _entitiesByDomain('binary_sensor', 'sensor')` narrowed to `('sensor')` (src/cards/bridge/sci-fi-bridge-editor.ts:726) — KILLED by test_O1_status_dropdown_still_offers_hacs_binary_sensor
MUTATION: `'input-status-sensor': msg('Stove status sensor')` reverted to `msg('ON/OFF status sensor')` (src/cards/bridge/labels.ts:52) — KILLED by test_O1_status_label_no_longer_says_on_off

## ⚠️ Cannot verify from this diff

- **The end-to-end gesture on a real Home Assistant** — that a user migrated to the core `fumis`
  integration actually sees `sensor.*_detailed_stove_status` in the field and that the chip then
  reads "Active" — is outside any code the diff can prove. The chain is proven piecewise
  (list → clicked value published → `config.status` → `STOVE_OFF_STATES` membership), and the
  dev workbench fixture dev/cards/bridge.js:167 still exercises the HACS binary_sensor only. A
  manual check on the user's instance is the only closure for the originally reported symptom.

## NOTES

- The field now offers the whole `sensor` domain with no `device_class` filter, so a numeric
  sensor (e.g. `sensor.clou_pellet_quantity`) is selectable for `status`; picking one leaves the
  chip permanently "Active", since any state outside `STOVE_OFF_STATES` reads as on. The spec
  does not pin any filtering — it prescribes exactly `_entitiesByDomain('binary_sensor',
  'sensor')` — and the pre-change list made the only valid core entity unreachable, which is
  strictly worse. Not a defect of this lot; if the field is to be narrowed later, the place is
  the spec clause at docs/specs/cards/bridge.md:940, not the editor.
- The list is unsorted (`Object.values(hass.states)` order) and, on a real instance, long. This is
  the pre-existing behaviour of `_entitiesByDomain` and of the dropdown component, shared with
  `_renderAppliancesSection` (src/cards/bridge/sci-fi-bridge-editor.ts:604); the component offers
  free-text filtering for it. Not pinned by the spec, not introduced here.
- The contract under review lives in a prose `[!IMPORTANT]` note (docs/specs/cards/bridge.md:936-944)
  rather than in a numbered FR, and no row of the spec's Test Case table covers the editor's
  status-field domains — the 4 `test_O1_*` cases are the lot's register of proof instead. A
  spec-level observation, upstream of this code and authored by the previous lot; nothing for this
  diff to fix.
- The sibling card's status field (src/cards/stove/sci-fi-stove-editor.ts:30,
  `sensor_status` → `input-stove-status`) is a free-text `sf-editor-input`, not a
  domain-constrained dropdown, so the same class of defect does not exist there. Checked
  deliberately as the nearest analogue; no finding.
- The lot register records the O1 green against
  `npx vitest run tests/cards/bridge/sci-fi-bridge-editor.test.ts -t test_O1`
  (docs/fixes/jq5-editor-status-domain/verdicts.json), while `suite` in lot.json is the full
  `npx vitest run`. The full suite was run for this review (see evidence 4) and is clean apart
  from the sandbox's own missing fixtures, so the gap is closed by this report rather than by a
  fix.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 0     | pass   |
| MEDIUM   | 0     | pass   |
| LOW      | 0     | pass   |

Positive observations:
- The fix is minimal and exactly the shape the spec prescribes: one section-local list replaced,
  the three sibling dropdowns untouched, no new abstraction, no new parameter.
- The comment at src/cards/bridge/sci-fi-bridge-editor.ts:723-725 names the bead, the integration
  that motivates the widening and the spec section — the next reader cannot narrow it back by
  accident.
- The test helper keys on the *value bound to the field* instead of on label text or DOM index,
  which is why the label assertion and the domain assertions remain independent; and the label
  case accepts either prescribed locale string rather than presuming the suite's locale.

VERDICT: APPROVE
