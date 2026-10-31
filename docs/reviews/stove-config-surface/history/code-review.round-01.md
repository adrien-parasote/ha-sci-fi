# Code review — lot `stove-config-surface` (round 1)

AUDITOR: subagent

Packet: `.sc/review/78e31dd-7b152b57` (dirty, base 78e31dd) · worktree branch `fix/lot-stove-config-surface-defauts-rapport`
Register: docs/fixes/stove-config-surface/lot.json (O1–O7)
Scope: correctness and security of the change. The packet's `must_read.txt` is empty — no entry point was packaged, so scope is the 13 files of `files.txt` plus the joins followed out of them.

## COVERAGE

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/cards/stove.md | 109 | 109 | yes |
| src/cards/stove/config.ts | 42 | 42 | yes |
| src/cards/stove/labels.ts | 39 | 39 | yes |
| src/cards/stove/sci-fi-stove-editor.ts | 138 | 138 | yes |
| src/cards/stove/sci-fi-stove.ts | 512 | 512 | yes |
| src/cards/bridge/sci-fi-bridge-editor.ts | 726–790 + full grep of every `icon ?? '…'` default | 891 | no — stove section + icon defaults only |
| src/locales/locales/fr.js | diff hunks + full id/dup/sync parse (313 entries) | 325 | no — parsed mechanically, not line-read |
| xliff/fr.xlf | diff hunks + full XML parse (313 trans-units) | 1197 | no — parsed mechanically, not line-read |
| tests/cards/stove/sci-fi-stove-editor.test.ts | 1–207 | 207 | yes |
| tests/cards/stove/sci-fi-stove.test.ts | 1–30 + 864–991 (the added block) | 991 | no — added block + header |
| tests/cards/bridge/sci-fi-bridge-editor.test.ts | 785–833 (the added block) + line 646 | 833 | no — added block only |
| docs/fixes/stove-config-surface/lot.json | 66 | 66 | yes |
| docs/fixes/stove-config-surface/verdicts.json | 58 | 58 | yes |

Joins followed OUT of the diff: src/utils/base-editor.ts (`getLabel`, `sharedEditorLabels`), src/utils/base-card.ts (locale sync from `hass.locale.language`), src/components/editor-inputs/sf-editor-dropdown-icon.ts and src/components/sf-icon/data/sf-icons.ts (does `sci:stove` exist in the picker's item set), src/cards/bridge/sections/sf-bridge-stove.ts and the five sibling sections (icon defaults), src/components/sf-circle-progress-bar.ts + src/components/sf-stack-bar.ts (threshold semantics), src/cards/lights/sci-fi-lights.ts (same toast class as O5), docs/specs/cards/bridge.md, docs/specs/cards/stove.md, docs/specs/10_card_editors.md, docs/cards/bridge.md, lit-localize.json, rollup.config.mjs, vitest.config.ts, tests/setup.ts, tests/localization.test.ts.

Review PARTIAL on the three large test files and the bridge editor: read where the diff lands and where the joins lead, not end to end.

## VERDICT: APPROVE

SPEC: docs/specs/cards/stove.md, docs/specs/10_card_editors.md § `sci-fi-stove-editor`, docs/specs/cards/bridge.md § sf-bridge-stove / TC-BRIDGE-U-19, docs/cards/stove.md, and the lot register docs/fixes/stove-config-surface/lot.json.

## FINDINGS

4 findings (critical: 0, high: 0) — 1 MEDIUM, 3 LOW in scope; 2 LOW out of diff.

- [MEDIUM] docs/specs/cards/bridge.md:154, 314, 966, 969, 1375 — OUT-OF-DIFF: the spec now contradicts delivered code on the stove section icon in both directions, so the next retrocheck re-opens O7 (the editor offered `mdi:fire` where the card renders `sci:stove`) as still broken, and any future change made "to spec" puts `mdi:fire` back. Four places still state the default is `mdi:fire` (`# optionnel — défaut: mdi:fire`, `// section icon (default: 'mdi:fire')`, and twice `ha-icon (config.icon ?? 'mdi:fire')` in the render tree), while TC-BRIDGE-U-19 — amended by the previous lot to require `sci:stove` — still carries the note « ⚠ L'éditeur propose encore `mdi:fire` comme défaut du champ : voir bead ha-sci-fi-gxd », which is precisely the bead O7 closes in this lot.
  SITES: docs/specs/cards/bridge.md:154 · docs/specs/cards/bridge.md:314 · docs/specs/cards/bridge.md:966 · docs/specs/cards/bridge.md:969 · docs/specs/cards/bridge.md:1375 (the stale ⚠ note inside TC-BRIDGE-U-19)
  FALSIFIED BY: a reader of TC-BRIDGE-U-19 alone still believes the editor is unfixed; correcting only the four `mdi:fire` statements and leaving the ⚠ note (or the reverse) leaves the contradiction intact.
  ROOT: one stated default per section icon (`config.icon ?? <default>` agrees between editor, section and spec)
  FIX-CLASS: corrects — the spec amendment is the closure of this lot's own O7. The file is NOT in this lot's diff, so the out-of-diff rule applies: a bead, unless the orchestrator elects to amend the spec here as O7's closure.
  RESOLUTION: fixed — spec amended here, as O7's closure. The four statements now read `sci:stove` (docs/specs/cards/bridge.md:154 example comment, :314 interface comment, :966 and :969 render tree) and the stale ⚠ note inside TC-BRIDGE-U-19 (:1375) is replaced by « L'éditeur propose le même défaut (lot fix stove-config-surface, O7) ». Taken in-run rather than filed: the finding's own falsification is that a bead leaves the spec prescribing the defect O7 removed, so the next change made "to spec" puts `mdi:fire` back. Proof: the O7 tests (`tests/cards/bridge/sci-fi-bridge-editor.test.ts` « O7 — offers sci:stove as the stove icon default, like the section renders » and « O7 — keeps a configured stove icon untouched ») now agree with every statement in the spec; `grep -n "mdi:fire" docs/specs/cards/bridge.md` → 0.

- [LOW] docs/cards/stove.md:59 and :61 — a user copying the documented `Full` example still gets `pellet_quantity_threshold: 0.4` and `storage_counter_threshold: 0.07`, two of the four divergent values O2/O3 (one default per threshold, 0.1 everywhere) was opened to eliminate; the drift the lot closed in the options table twelve lines below, and in the code, survives in the example a user is most likely to copy, and the next retrocheck re-raises ST-29 on this same file. O2's own text names `docs/cards/stove.md:59` (0.4) and O3's names `:61` (0.07) as two of the values to unify.
  FIX-CLASS: corrects
  RESOLUTION: fixed — both example lines set to 0.1, and the doc is now READ by a test rather than trusted: `tests/cards/stove/sci-fi-stove-editor.test.ts` « O2/O3 — the user doc publishes those defaults, in its table and its example » parses docs/cards/stove.md for each field's options-table cell AND its YAML example line, asserts it finds exactly two statements per field (the positive witness: a silent regex drift would read 0, not 2) and compares both to the exported constants.

- [LOW] src/cards/stove/sci-fi-stove.ts:126 and :132 — an English (or German, or Spanish) dashboard still renders two hard-coded French strings from the file O5 (the four bottom-bar toasts now go through `msg()`) just cleaned: `Entité poêle non trouvée : <entity>` when the configured climate entity is absent from `hass.states`, and the header fallback `'Poêle'` when the entity has no `friendly_name`. Both are exactly the defect class O5 fixed, in the same file, with the trans-unit machinery now in place. The lot's own guard test (tests/cards/stove/sci-fi-stove.test.ts:564, « no accented French literal is left in a toast call ») cannot see them: its regex only scans `_showToast(` call sites, so the file it protects still ships two accented literals.
  FIX-CLASS: corrects
  RESOLUTION: fixed — both strings localized with an English source and the same French target, so the `fr` rendering is byte-identical and TC-1111 stays green unchanged: `msg(str`Stove entity not found: ${this.config.entity}`)` (new trans-unit `s437558b3f6ef6130` in xliff/fr.xlf, target « Entité poêle non trouvée : <x id="0"/> », and src/locales/locales/fr.js regenerated from it by `npm run localize-build` — that generated file is this fix's build output, not a hand edit) and `?? msg('Stove')`, which reuses the catalog's existing `Stove` → « Poêle ». The spec rows that prescribed the raw French were amended first (docs/specs/cards/stove.md §Error Handling Matrix, rows 1 and 5: the message is now stated as localized, French under `fr`). The guard was the real hole and is widened: it no longer scans `_showToast(` call sites but every line of the card's code, comments stripped — the absent-entity message sat inside an html`` template where a quote-shaped probe could not reach it. Positive witness, measured on the version this lot started from (`git show 78e31dd:src/cards/stove/sci-fi-stove.ts`): the widened guard reads 6 accented code lines there, 0 on the fixed file.

- [LOW] tests/cards/stove/sci-fi-stove-editor.test.ts:56, 60, 75, 79, 94, 98 — the suite still publishes a field contract that does not exist: three tests drive `input-update` with `room_temperature`, `threshold` and `custom_field`, none of which is a key of `SciFiStoveSensors` or `SciFiStoveConfig` (src/cards/stove/config.ts:22-42), and :79 asserts a threshold of `15.5` that a slider bounded `min=0 max=1` can never emit. The next reader of this file still sees those three names as the editor's keys — which is the state O6 was opened to end. The three `kind` branches of `_update` they cover (`sensor`, `technical`, `else`) are reachable with real keys (`sensor_pressure`, `pellet_quantity_threshold`, `storage_counter`), so the coverage is kept and the false contract goes.
  FIX-CLASS: corrects
  RESOLUTION: fixed — the three cases keep their `kind` branch and move to real keys: `sensor_inside_temperature` for `sensor`, `pellet_quantity_threshold` with `0.3` (a value the `min=0 max=1` slider can actually emit) for `technical`, `storage_counter` for the `else` branch. No case added, none lost: the three branches of `_update` stay covered and the invented contract is gone.

- [LOW] docs/cards/bridge.md:99 — OUT-OF-DIFF: the bridge user documentation's example still shows `icon: mdi:fire` for the stove section, where every other section's example line shows that section's real default (`mdi:shield-alert`, `mdi:door-closed`, `mdi:robot`, `mdi:washing-machine`, `mdi:ev-station`, `mdi:lightning-bolt`); a reader concludes the stove default is `mdi:fire`, which is the belief O7 removed from the editor. A bead.
  RESOLUTION: fixed — `icon: sci:stove` in the example, taken in the same gesture as the MEDIUM above: it is the same statement of the same default, on the user-facing side of the two documents O7 had to agree with.

- [LOW] src/cards/lights/sci-fi-lights.ts:390, 402, 416, 432 — OUT-OF-DIFF: four success toasts are still hard-coded French literals (`'Lumière éteinte'`, `'Pièce éteinte'`, `'Étage éteint'`, `'Tout éteint'`), the exact defect class O5 fixed in the stove card; an English dashboard reads French after every light action. Outside this lot's diff: a bead.
  RESOLUTION: filed — no new bead: `ha-sci-fi-dp3` already carries this card (« src/cards/lights/sci-fi-lights.ts : zéro appel msg() dans toute la carte », the 56 French literals). The review's four `file:line` sites and the gesture O5 used were added to it as a note rather than opening a duplicate.

## MUTATION

Five mutants, built from the pristine sources into a scratch copy of the tree (`src`, `tests`, the four configs, a symlink to the installed modules) — nothing in the repository was written. Baseline in that copy: 3 test files, 128 cases, green.

MUTATION: STOVE_SENSOR_FIELDS power label keys swapped back (sci-fi-stove-editor.ts:29/34, revert O1) — KILLED by tests/cards/stove/sci-fi-stove-editor.test.ts « O1 — labels each power sensor the way the card renders it »
MUTATION: the `entity` field's label key back to `input-stove-status` (sci-fi-stove-editor.ts:86, revert O4) — KILLED by tests/cards/stove/sci-fi-stove-editor.test.ts « O4 — labels the main entity field with its own key »
MUTATION: the slider fallback back to the literal `0.2` (`String(value ?? 0.2)`, sci-fi-stove-editor.ts:128, revert O2/O3) — KILLED by tests/cards/stove/sci-fi-stove-editor.test.ts « O2 — the pellet slider starts on the default the card applies » and « O3 — … »
MUTATION: `msg('Temperature changed')` back to a bare literal, deliberately unaccented so the regex guard cannot see it (sci-fi-stove.ts:468, revert O5) — KILLED by tests/cards/stove/sci-fi-stove.test.ts « O5 — the same three read French when HA is in French »
MUTATION: the bridge stove icon default back to `mdi:fire` (sci-fi-bridge-editor.ts:734, revert O7) — KILLED by tests/cards/bridge/sci-fi-bridge-editor.test.ts « O7 — offers sci:stove as the stove icon default, like the section renders »

The three branch tests of O6 and the `arrayContaining` test were not mutated: the latter kills a removed field but, by construction, not an added one.

## NOTES

- Independent re-run in the scratch copy: 95 test files, 1166 cases, 4 failures — all four are artifacts of the partial copy (rollup config, CI workflow and hacs.json were not copied: tests/infrastructure.test.ts TC-101/TC-102/IT-101 and tests/sci-fi.test.ts TC-115/TC-105). `tsc --noEmit` is clean on `src` + `tests` (the only errors are the four unresolved imports of the `dev/` workbench, also not copied). The 1177 / 96-file claim and `tsc` exit 0 are consistent with what I measured.
- The i18n plumbing was verified mechanically, not trusted: the five new message ids were recomputed from the installed localize id generator and all five match the diff (`s4774c5ec5a7d5355` Stove entity, `s5ae6af5add9e130a`, `s2535012c866f3d7d`, `saf95d4afa4a8e395`, `s84d17f00f6c12e7e`). xliff/fr.xlf parses as XML, 313 trans-units, no duplicate id, no empty target; src/locales/locales/fr.js holds the same 313 ids, no id on one side only. Every `msg('…')` literal in `src/**` has a `<source>` in the xliff — zero gaps.
- No test asserts the FRENCH rendering of the new `input-stove-entity` label, so a wrong trans-unit id there would have been silent. I closed that hole by recomputing the id rather than by asking for a test; the O5 block does cover the French side for the four toasts.
- src/cards/stove/sci-fi-stove.ts:190 feeds `Math.round(val)` straight into `sf-circle-progress-bar`, which warns on `val / 100 < threshold`, while sf-bridge-stove.ts:42-46 normalizes the SAME pellet entity through `raw > 1 ? raw : raw * 100` and has a test for each branch (tests/cards/bridge/sections/sf-bridge-stove.test.ts:144 and :155). On a sensor reporting a 0–1 ratio the two cards therefore disagree (1 % and permanently warning on the stove card, 60 % on the bridge). I do NOT judge this a defect of the stove card: docs/cards/stove.md:83 pins its contract as « Internal pellet level (0–100%) », so the card matches its documented input. The asymmetry between the two cards is real and unpinned by any spec — worth a bead on the bridge/stove reading of the same entity, not a change in this lot.
- Same class, same verdict: the stove card falls back to `maximum ?? 100` for the storage counter (sci-fi-stove.ts:201) where sf-bridge-stove.ts:68-71 uses `maximum ?? max ?? 20`. Nothing in the specs pins either number.
- docs/specs/10_card_editors.md:727 prescribes for this editor a `_climates: HassEntity[]` state filtered on `climate.`, and its Config section lists sensors only — no `entity` field. The delivered editor has no such state and renders `entity` as a free-text `sf-editor-input` (sci-fi-stove-editor.ts:86). That divergence long predates this lot and the lot's O4 (giving that field its own label key) does not touch it; honouring the spec would ADD a domain-filtered dropdown. Contradiction upstream of the code — a bead, not a finding here.
- `dist/sci-fi.min.js` is tracked and is the file HACS serves, and it is NOT rebuilt by this lot. That matches the project's cadence (144 of 898 commits touch `dist`; the three preceding fix lots — stove-fumis-core, jq5-editor-status-domain, test-spec-divergence — did not), so I read it as release-time work, not a gap in this lot.
- Security surface: none. No `eval`/`new Function`, no `innerHTML`, no user-controlled path, no network call, no secret, no prototype merge. The two added exports are numeric literals; every added string is a localized constant; no `any` was added beyond the pre-existing test casts; no non-null assertion was added in `src`.
- The O5 tests pace the locale switch with `setTimeout(…, 10)`. The switch resolves on a microtask (the locale map is in memory, localization.ts:16), so 10 ms is generous rather than tight; not a flake I can provoke.
- Tests NAMES were out of scope per the delegation, and lint was taken as given (clean, 166 warnings at the project ceiling).

## CONFORMANCE EVIDENCE

| claim | satisfied at |
|---|---|
| O1 — the editor labels each power sensor the way the card renders it | src/cards/stove/sci-fi-stove-editor.ts:29 (`sensor_actual_power` → `input-stove-power-rendered`) and :34 (`sensor_power` → `input-stove-power-consume`), resolving through src/cards/stove/labels.ts:26-27 to « Stove power rendered » / « Stove power consumed », against the card's `msg('Render')` for `actual_power` and `msg('Consume')` for `power` at src/cards/stove/sci-fi-stove.ts:321-322 and docs/cards/stove.md:79-80. French targets already existed and map the same way (fr.js:210 « Puissance poêle fournie », fr.js:121 « Puissance poêle consommée »). |
| O2/O3 — one default per threshold, read by both consumers | src/cards/stove/config.ts:19-20 declares the two constants; the card reads them at src/cards/stove/sci-fi-stove.ts:186 and :202, the editor at sci-fi-stove-editor.ts:100-101 through the new `fallback` parameter (:118, :128); docs/cards/stove.md:71 and :73 publish `0.1`. Both components treat `threshold` as a 0–1 ratio (sf-circle-progress-bar.ts:75 `val / 100 < threshold`, sf-stack-bar.ts:62 `val / max <= threshold`), so `0.1` is coherent at both sites. `??` (not `||`) keeps a configured `0` (sci-fi-stove.ts:186, :202). No spec pins either default — checked docs/specs/cards/stove.md and docs/specs/10_card_editors.md:730 — so no spec amendment is owed. |
| O4 — the main entity field has its own label key | src/cards/stove/sci-fi-stove-editor.ts:86 uses `input-stove-entity`, declared at src/cards/stove/labels.ts:18, distinct from the `input-stove-status` key still consumed by `sensor_status` (sci-fi-stove-editor.ts:35, labels.ts:28). Trans-unit `s4774c5ec5a7d5355` in xliff/fr.xlf and fr.js — id recomputed and matching. |
| O5 — the four bottom-bar toasts go through msg() | src/cards/stove/sci-fi-stove.ts:459, 468, 476, 484, each with its trans-unit; the French rendering is unchanged (same four strings as targets), and the base card's locale sync (src/utils/base-card.ts:34-47, `fr-FR` → `fr`, anything else → `en`) is what the O5 tests drive. Error toasts keep `err.message` — no message is swallowed, no empty catch was introduced. |
| O6 — the field contract is asserted | tests/cards/stove/sci-fi-stove-editor.test.ts:133-198: every key of `SciFiStoveSensors` plus `entity`, `storage_counter`, `switch_eco_mode` is asserted rendered, and `sensor_pellet_quantity` round-trips under `config.sensors`. The list matches src/cards/stove/config.ts:22-32 key for key. |
| O7 — the editor offers the icon the section renders | src/cards/bridge/sci-fi-bridge-editor.ts:729 and :734 now say `sci:stove`, agreeing with src/cards/bridge/sections/sf-bridge-stove.ts:58 and the type comment at src/cards/bridge/config.ts:91. `sci:stove` is a real pickable item, not a dangling name: src/components/sf-icon/data/sf-icons.ts:2 defines the `stove` key and sf-editor-dropdown-icon.ts:57-60 maps every custom key into the picker's `ALL_ICONS` as `sci:<key>`, so both the preview and the dropdown resolve it. The five other bridge sections' editor defaults were checked against their sections' and all six now agree. |
| ST-32 / `validateConfig` | out of scope by the delegation (bead ha-sci-fi-bnf). Confirmed the card keeps the render-time error path docs/specs/cards/stove.md:596 prescribes (src/cards/stove/sci-fi-stove.ts:124-127) and keeps the pre-init guard on `getCardSize()` (:495-497). |

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 1 | info |
| LOW | 5 (3 in diff, 2 out of diff) | note |

Positive observations:
- Putting the two defaults in `config.ts` and having both the card and the editor read them makes the O2/O3 class of drift structurally impossible rather than merely fixed — the mutation on the slider's fallback literal proves the wiring is what the tests hold, and the test that pins `0.1` itself keeps the shared constant from drifting silently.
- The O5 block drives the locale through `hass.locale.language`, the way a real dashboard does, instead of asserting the literal: that is why the mutant that replaced `msg()` with an unaccented literal died on the French case even though the file's own regex guard could not see it.
- Every id of the i18n plumbing is correct and both generated artifacts are in sync with the xliff — the usual silent failure of this class (a hand-written id that falls back to English) did not happen here.

VERDICT: APPROVE

## RESOLUTIONS — orchestrator, after the review

Every finding in the diff is fixed with its proof above. Two findings the reviewer
placed out of diff were taken in-run anyway (the MEDIUM on docs/specs/cards/bridge.md
and the LOW on docs/cards/bridge.md): both state the stove section's icon default,
which is the very thing O7 changed, and the golden rule puts the spec first — a bead
there would leave the spec prescribing the defect this lot removed.

The three NOTES the reviewer judged worth recording rather than changing are filed:

| bead | what it carries |
|---|---|
| `ha-sci-fi-15v` | stove and bridge read the same pellet entity as a percentage on one side and a ratio on the other (plus the `maximum ?? 100` / `?? 20` storage fallback, same class) |
| `ha-sci-fi-e9r` | `docs/specs/10_card_editors.md:727` prescribes a `_climates` state and no `entity` field for an editor that has neither |
| `ha-sci-fi-dp3` | the four hard-coded French toasts of the lights card — noted on the existing i18n bead, not duplicated |

State after the resolutions: suite 96 files / 1178 cases green, `tsc --noEmit` exit 0,
lint 0 error at 166 warnings (the project ceiling, unchanged — no warning added).
