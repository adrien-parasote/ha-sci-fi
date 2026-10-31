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

---

# Code review — lot `stove-config-surface` (round 2 — delta round, fresh reviewer)

AUDITOR: subagent

Packet: `.sc/review/78e31dd-7b7c00a0` (delta of 12 files since `.sc/review/78e31dd-7b152b57`, base 78e31dd) · worktree branch `fix/lot-stove-config-surface-defauts-rapport`
Scope: the delta — the 9 product/doc/test files that moved — plus the closure of each of round 1's six findings. Files that did not move are not re-audited. The packet's `must_read.txt` is empty: no entry point was packaged. The packet carries no `survivors.txt`: round 1 recorded five mutants, all KILLED, so no standing survivor is owed a re-run.
Three NOTES of round 1 were filed as beads (`ha-sci-fi-15v`, `ha-sci-fi-e9r`, a note on `ha-sci-fi-dp3`) — all three verified present with `bd show`, and deliberately out of this delta.

## COVERAGE

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/cards/bridge.md | delta hunk (:99) + the six sibling section examples | 170 | no — the moved line and its peers |
| docs/cards/stove.md | delta hunk (:59, :61) + the options table + full regex parse by the new test's own probe | 109 | no — parsed mechanically where the test reads it |
| docs/specs/cards/bridge.md | the 5 amended sites (:154, :314, :966, :969, :1375) + full grep of `mdi:fire` / `sci:stove` / `msg('<accented>')` | 1552 | no — the delta's sites + the joins |
| docs/specs/cards/stove.md | the 2 amended rows (:596, :600) + §Header/§renderCard code blocks (:215–232, :440–460) + the TC table (:552–565) + full grep of `Poêle` / `Entité` | 619 | no — the delta's sites + every other statement of the same two strings |
| src/cards/stove/sci-fi-stove.ts | 124–135 (both delta hunks) + 1–20 (the `str` import) + full accent scan of the file | 512 | no — the delta hunks, plus the whole file scanned mechanically |
| src/locales/locales/fr.js | both delta hunks + byte-for-byte comparison against a regenerated copy | 326 | yes — compared whole, byte-identical |
| tests/cards/stove/sci-fi-stove-editor.test.ts | 1–10, 53–101, 200–237 (every delta hunk) | 237 | no — the moved cases |
| tests/cards/stove/sci-fi-stove.test.ts | 30–55 (TC-1111, the test the delta made locale-dependent) + 978–1005 (the widened guard) | 1005 | no — the moved block + its join |
| xliff/fr.xlf | the delta hunk + byte-for-byte comparison against a regenerated extraction | 1201 | yes — compared whole, byte-identical |
| docs/reviews/stove-config-surface/code-review.md (round 1 + resolutions) | 134 | 134 | yes |

Joins followed OUT of the delta: src/cards/bridge/sections/sf-bridge-stove.ts (`msg('Stove')`, the icon default), src/cards/bridge/labels.ts, src/cards/stove/config.ts + sci-fi-stove-editor.ts (`_update`'s three branches, the `kind` each input actually emits), src/components/editor-inputs/sf-editor-input.ts (the `kind` field's type), src/locales/localization.ts and tests/localization.test.ts (who consumes `templates` now that one entry is a `str` template and no longer a plain string — only lit itself; `__scifi_frTemplates` has exactly two readers repo-wide), src/utils/base-card.ts (the locale sync TC-1111 now depends on), tests/fixtures/mock-hass.ts (`locale.language: 'fr'`), lit-localize.json, rollup.config.mjs (nothing is `external`, so the new bare import is bundled), tests/setup.ts.

Measurements I ran rather than took on trust:
- `lit-localize build` into a scratch copy of `src` + `xliff`: `src/locales/locales/fr.js` and `src/locales/locale-codes.ts` come out **byte-identical** to the tree. No hand edit anywhere in the generated file, including the new `import {str} from '@lit/localize';` line.
- `lit-localize extract` into a second scratch copy: `xliff/fr.xlf` comes out **byte-identical** (314 messages). So trans-unit `s437558b3f6ef6130`, its id and its `<x id="0" equiv-text="${this.config.entity}"/>` placeholder are exactly what the generator produces — the `str` extraction is correct — and the identity in both directions also proves there is no orphan unit and no `msg()` without a unit.
- `msg('Stove')` is not a new unit: `s04a02c13e8b9b762` (`Stove` → `Poêle`) already existed (xliff/fr.xlf:1063, fr.js:12), which is why 313 units became 314 and not 315.
- Production bundle built from a scratch copy: `rollup -c --environment NODE_ENV:production` exits 0, `dist/sci-fi.min.js` carries the French target and no bare `@lit/localize` import — the new import statement inside a generated `.js` does not leak out of the bundle.
- Full suite in the worktree: 96 files / 1178 cases, exit 0. `tsc --noEmit` exit 0.
- The guard's own witness, recomputed with the guard's exact logic on `git show 78e31dd:src/cards/stove/sci-fi-stove.ts`: **6** accented code lines at the base, **0** on the fixed file. The claim holds.

## VERDICT: APPROVE

SPEC: docs/specs/cards/stove.md (§Error Handling Matrix, §Header, §renderCard, Test Cases table), docs/specs/cards/bridge.md (§sf-bridge-stove, TC-BRIDGE-U-19), docs/cards/stove.md, docs/cards/bridge.md, and the lot register docs/fixes/stove-config-surface/lot.json.

## FINDINGS

4 findings (critical: 0, high: 0) — 2 MEDIUM, 2 LOW, all four on files inside this lot's diff.

- [MEDIUM] docs/specs/cards/stove.md:224 — the next person who implements the stove card's header from its specification writes a hard-coded French word back into the card and reddens this lot's own guard test: the §Error Handling Matrix row this delta amended now says the header fallback is localized (« Poêle » under `fr`, `Stove` in the source locale, :600), while two code blocks in the same file still prescribe the literal the delta deleted — `${stoveState.attributes.friendly_name ?? 'Poêle'}` in §Header's **HTML structure** (:224) and in §renderCard's implementation block (:452). A specification that prescribes a state its own suite refuses is worse than one that is merely stale: whoever follows it gets a red suite and no statement to trust. This is the same half-amended multi-site statement round 1 raised as F-01 (the bridge stove-icon default stated in five places), one file later — there, four statements plus a test note were corrected together; here only the matrix row was.
  SITES: docs/specs/cards/stove.md:224 · docs/specs/cards/stove.md:452
  FALSIFIED BY: tests/cards/stove/sci-fi-stove.test.ts:985 « O5 — no accented French literal is left in the card source » — implement the header as either block prescribes and the guard counts 1 accented line and fails. Measured: `?? 'Poêle'` is one of the 6 lines that guard counts on the base revision of the card. Correcting one block and not the other leaves the contradiction, since both are implementation prescriptions for the same line of code.
  ROOT: a value the specification states in more than one place is amended in every one of them — second instance in this lot (round 1 raised it as F-01, the bridge stove-icon default).
  FIX-CLASS: corrects — both blocks say the fallback is localized, in the wording the matrix row already uses. Two sentences, no restructuring.
  RESOLUTION: fixed — both blocks amended in the same gesture as the matrix row: `?? msg('Poêle')` at docs/specs/cards/stove.md:224 (§Header HTML structure) and :452 (§renderCard). The finding's own root is taken: `grep -n "?? 'Poêle'" docs/specs/cards/stove.md` → 0, so no statement of that fallback contradicts another. Proof that the spec and the suite now agree: TC-1115 below, which is the test the next implementer of that header would have to satisfy.


- [MEDIUM] src/cards/stove/sci-fi-stove.ts:132 — the one half of the round-1 localization fix that nothing watches: delete `msg()` from the header fallback and an English dashboard shows a French word for every stove entity that has no `friendly_name`, with the whole suite still green. Measured, not argued — replacing `?? msg('Stove')` by `?? 'Stove'` in a scratch copy leaves the stove suite at **82 passed (82)**. Two independent guards both miss it: the widened accent guard cannot see `'Stove'` (it carries no accent, which is the one thing that regex tests), and no test in the repository ever mounts the card on an entity whose attributes omit `friendly_name` — every one of the eight cases that touch the header supplies one (tests/cards/stove/sci-fi-stove.test.ts:60, 80, 99, 118, 152, 245, 649, 881). The spec row this delta amended for that exact line (docs/specs/cards/stove.md:600) carries no Test Case either: the Test Cases table has TC-1105 for a *present* `friendly_name` and nothing for its absence, so the amendment is unpinned. Round 1's resolution named the widened guard as the closure of this finding; for this string the closure does not hold, and the regression it is meant to prevent is precisely the O5 class.
  SITES: src/cards/stove/sci-fi-stove.ts:132 is the only code site. The hole is in two other places and both are owed: tests/cards/stove/sci-fi-stove.test.ts (no case with `attributes` lacking `friendly_name`) and docs/specs/cards/stove.md:552–565 (no TC row pinning the amended matrix row :600).
  FALSIFIED BY: the mutation above — a fix that only tightens the accent guard still leaves the mutant alive, because `'Stove'` is unaccented by construction. Only a case that mounts the card with `attributes: { hvac_modes: [...] }` and no `friendly_name`, asserting « Poêle » under `fr` the way the O5 block does, kills it.
  ROOT: every string the card renders in a user's language is covered by a test that reads it in that language (the O5 invariant; round 1's F-03 closed it for the four toasts and the absent-entity message, not for this one).
  FIX-CLASS: corrects — one test case, plus the TC row that pins the already-amended spec statement.
  RESOLUTION: fixed — the finding is upheld as measured and the mutant it found is now killed. TC-1115 added to the spec's Test Cases table (docs/specs/cards/stove.md) and to the suite (`tests/cards/stove/sci-fi-stove.test.ts`, « TC-1115 — the header fallback of an entity without friendly_name follows the locale »): it mounts the card on an entity whose attributes omit `friendly_name` — the case the reviewer established no test covered — with `hass.locale.language` at `en` then `fr`, and asserts `.header` reads `Stove` then « Poêle ». Mutation re-run here, the reviewer's own: `?? msg('Stove')` → `?? 'Stove'` now FAILS with « expected 'Stove' to equal 'Poêle' », and the file was restored byte-identical afterwards. One correction to the TC as first written: the spec's §Header blocks name `.stove-name`, which belongs to the abandoned header design (bead ha-sci-fi-ynn, F-STOVE-D01) — the delivered card renders `<div class="header">`, so TC-1115 pins `.header`. A TC on `.stove-name` would have been unreachable by construction, which is the very defect class this project keeps re-finding.


- [LOW] tests/cards/stove/sci-fi-stove-editor.test.ts:96 — the editor's event contract is still half-invented after the fix: the `id` is now a real field, but `kind: 'other'` is a value this editor never emits. `_renderConfigSection` emits `storage_counter` with `kind: 'storage'` (src/cards/stove/sci-fi-stove-editor.ts:89), and the four kinds the editor emits are `entity`, `sensor`, `storage` and `technical`. `kind` is typed `string` (src/components/editor-inputs/sf-editor-input.ts:17), so nothing catches it. Consequence: the generic `else` branch of `_update` is reached in the test by a kind no component produces, so the branch's real callers — `storage` and `entity` — are the ones left untested; narrow `_update` to a union of the real kinds tomorrow and this case keeps passing while the production paths change behaviour. Round 1's finding was « the suite publishes a field contract that does not exist »: the field name was corrected, the kind was not.
  FIX-CLASS: corrects — `kind: 'storage'`, the kind the editor actually emits for that field; the `else` branch stays covered.
  RESOLUTION: fixed — `kind: 'storage'`, which is what `_renderConfigSection` actually emits for `storage_counter` (src/cards/stove/sci-fi-stove-editor.ts:89). The `else` branch of `_update` is now reached by a kind the editor produces, so narrowing `kind` to a union of the four real kinds would not leave this case passing over a changed production path. The test's title was also corrected — « on a field of the else branch (kind the editor really emits) » — since « generic field update » is what described the invented contract.


- [LOW] tests/cards/stove/sci-fi-stove.test.ts:992 — when this guard ever fires, it sends the reader to lines that do not exist: it strips block comments with `.replace(/\/\*[\s\S]*?\*\//g, '')` *before* splitting into lines, so every `/* … */` comment collapses to nothing and the `i + 1` numbering drifts by the number of lines removed above. Measured with the guard's own logic on the base revision of the card: it reports lines 110, 116, 434, 443, 451, 459 for literals that really sit at 126, 132, 459, 468, 476, 484 — off by 16 and then by 25. The failure message is the guard's only output, and in a file of 512 lines a 25-line error is a wrong destination, not a hint. Two smaller edges of the same construction: only comments that *begin* a line are stripped (`^[ \t]*\/\/`), so an inline French trailing comment reddens the guard with no defect present, and the block-comment regex also eats a `/* … */` sequence occurring inside a string.
  FIX-CLASS: corrects — blank the comments instead of deleting them (replace each stripped line's content, keeping the newlines), which preserves the numbering the message prints.
  RESOLUTION: fixed — the guard no longer deletes comment lines, it blanks their CONTENT and keeps their newlines, so its numbering is the file's. Re-measured with the corrected logic on the same base revision the reviewer used: it now reports 122, 128, 455, 464, 472, 480 — the real positions (the reviewer's 126/132/459/468/476/484 were read against a later copy of the file; on `git show 78e31dd:` the six literals sit at 122/128/455/464/472/480, and the pre-fix guard reported 110/116/434/443/451/459 there, off by the same 12 and 21 lines). Both smaller edges are taken too: trailing `//` comments are stripped as well, so a French note at the end of a code line no longer reddens the guard, and `://` is excluded so a URL is not read as a comment. The `/* */`-inside-a-string edge is documented in the test as an accepted limit rather than answered with a tokenizer: no such sequence exists in this card, and the guard's job is to catch a French literal, not to parse TypeScript.


## RULINGS ON ROUND 1'S RESOLUTIONS

No round-1 finding was `contested`, so no ruling is owed under #1595. The delegation asks me to rule on completeness; I verified each of the six in the tree.

- F-01 (MEDIUM, the bridge stove-icon default stated in five places) — **closed**. docs/specs/cards/bridge.md:154 (`# optionnel — défaut: sci:stove`), :314 (`default: 'sci:stove'`), :966 and :969 (`config.icon ?? 'sci:stove'`) all agree with src/cards/bridge/sections/sf-bridge-stove.ts:58 and with the editor's O7 default, and the stale ⚠ note inside TC-BRIDGE-U-19 (:1375) is replaced. One inaccuracy in the resolution's *proof text*, not in the fix: `grep -n "mdi:fire" docs/specs/cards/bridge.md` returns 1, not 0 — line 1373, TC-BRIDGE-U-17, where `mdi:fire` is the custom icon of the **smoke** entry and entirely legitimate. The substance (no statement of the stove icon says `mdi:fire`) holds.
- F-02 (LOW, docs/cards/stove.md:59 and :61) — **closed, and well**. Both example lines read `0.1`, and the new test does not trust the doc: mutating the example back to `0.4` and, separately, breaking the options-table row both redden « O2/O3 — the user doc publishes those defaults, in its table and its example » (measured, 1 failed | 81 passed each time). The `lengthOf(2)` assertion is a real positive witness: a regex that silently stopped matching would read 0 and fail.
- F-03 (LOW, the two French literals in the card) — **PARTIAL**, see the second MEDIUM above. The absent-entity message half is genuinely closed, and I proved the test bites: removing `msg(str…)` from src/cards/stove/sci-fi-stove.ts:126 reddens TC-1111. The header-fallback half is not: its mutant survives the whole suite. The i18n artifacts are exactly what the generator produces, so the « generated, not hand-edited » claim is verified byte-for-byte, and the spec amendment of row 1 is pinned by TC-1111; row 5 is not pinned by anything.
- F-04 (LOW, the three invented editor keys) — **PARTIAL**, see the third finding. The three `kind` branches of `_update` are still covered and no case was lost; the ids are real; the `kind` of the third case is not.
- F-05 (LOW, docs/cards/bridge.md:99) — **closed**. `icon: sci:stove`, consistent with the six sibling section examples, each of which shows its own section's real default.
- F-06 (LOW, the lights card's four French toasts) — **closed as filed**. `bd show ha-sci-fi-dp3` carries the note with the four `file:line` sites and the gesture O5 used. No duplicate bead opened.

## MUTATION

Baseline in a scratch copy of `src`, `tests`, `docs/cards` and the four configs (a symlink to the installed modules; nothing in the repository was written): `tests/cards/stove` = 4 files, 82 cases, green.

MUTATION: the header's localized fallback back to a bare unaccented literal (`?? msg('Stove')` → `?? 'Stove'`, sci-fi-stove.ts:132) — SURVIVED
MUTATION: the absent-entity message's `msg(str…)` dropped, keeping the English template (sci-fi-stove.ts:126) — KILLED by tests/cards/stove/sci-fi-stove.test.ts « TC-1111: renders error message if entity not found »
MUTATION: docs/cards/stove.md's `Full` example back to `pellet_quantity_threshold: 0.4` — KILLED by tests/cards/stove/sci-fi-stove-editor.test.ts « O2/O3 — the user doc publishes those defaults, in its table and its example »
MUTATION: docs/cards/stove.md's options-table row for `storage_counter_threshold` renamed, so the table cell can no longer be found — KILLED by tests/cards/stove/sci-fi-stove-editor.test.ts « O2/O3 — the user doc publishes those defaults, in its table and its example »

The first line is the proof under the second MEDIUM: it is this round's own mutant, not a survivor standing from a previous round (round 1 recorded five, all KILLED, and the packet carries no `survivors.txt`).

## NOTES

- docs/specs/cards/bridge.md:966 and :969 — the two lines this delta edited also carry `msg('Poêle')`, while the code calls `msg('Stove')` (src/cards/bridge/sections/sf-bridge-stove.ts:84). Not a defect: that specification writes the **French rendering** inline in its render trees as a consistent notation — seven occurrences across the file (:707, :749, :966, :1012, :1214, :1381, :1387) — and TC-BRIDGE-U-21 states the convention explicitly (« le code rend `msg('Running')`, qui ne devient 'En cours' qu'en FR »). A convention, not a prescription of the source string.
- docs/specs/cards/bridge.md:154 — the delta also changed the example's **value** from `"mdi:fire"` to `"mdi:campfire"`, where docs/cards/bridge.md:99 shows `icon: sci:stove`. Both are self-consistent (the spec's comment states the default correctly, and `mdi:campfire` is the custom value TC-BRIDGE-U-19 itself uses), so the two documents illustrate the field differently without contradicting each other. Nothing pins which an example should show.
- TC-1111 changed character in this delta without changing a line of its own. It asserted a literal French string the card rendered unconditionally; it now asserts the output of `msg()`, so it passes only because the locale switch triggered by `el.hass = makeMockHass()` (locale `fr`, tests/fixtures/mock-hass.ts:105) resolves before the first render — the `loadLocale` continuation is queued ahead of Lit's update microtask, which is why the ordering holds. It is green and I could not provoke it otherwise, so I do not file it; it is worth knowing that the test's meaning now depends on microtask ordering, as the other `msg()` tests in the file already did.
- The widened O5 guard protects `src/cards/stove/sci-fi-stove.ts` only. A French literal added to sci-fi-stove-editor.ts or labels.ts is unguarded — outside what O5 covered, and `ha-sci-fi-dp3` already carries the repository-wide version of that sweep.
- The accent guard cannot, by construction, see unaccented French (`Marche`, `Stock`, `Puissance`, `Mode eco`). That is inherent to the probe and round 1 already measured it: the unaccented mutant on a toast died on the behavioural French test, not on the guard. The guard is a cheap second line; the behavioural tests are the real one — which is exactly why the gap under the second MEDIUM matters.
- `ha-sci-fi-dp3` still lists `src/cards/stove/sci-fi-stove.ts:392,401,410 — trois toasts` among its hotspots, which O5 has now fixed. Bead hygiene, outside this diff, and the note appended by round 1 says what was done.
- `src/locales/locales/fr.js` now holds one `str` template object among 313 plain strings. I checked who else reads that map: `src/locales/localization.ts:7` (hands it to lit), and `(window as any).__scifi_frTemplates` at :10, whose only two readers repo-wide are that line and tests/localization.test.ts:27 (a `toBeDefined()`). Nothing treats the values as strings, so the type change inside the map breaks no consumer.
- Security surface of the delta: none. The two new strings are localized constants; `${this.config.entity}` goes through `msg(str…)` and lands in a Lit **text** binding, which escapes it — no `innerHTML`, no `eval`, no path, no network, no secret. No `any`, no non-null assertion and no cast was added in `src`; the new `fs.readFileSync` is in a test reading a repository-relative documentation path, not user input.
- `dist/sci-fi.min.js` is still not rebuilt by this lot, as round 1 observed; I confirmed the bundle **does** build from the current sources and carries the new French string, so the un-rebuilt artifact is release-time work and not a latent build break.
- Lint was taken as given (0 errors, 166 warnings, the project ceiling); note that `npm run lint` globs `src/**/*.ts` and `tests/**/*.ts`, so the generated `fr.js` is outside it by construction.
- Test names were out of scope per the delegation.

## CONFORMANCE EVIDENCE

| claim | satisfied at |
|---|---|
| The stove section's icon default is stated once, and the same, everywhere | docs/specs/cards/bridge.md:154, :314, :966, :969, :1375 and docs/cards/bridge.md:99 all say `sci:stove`; src/cards/bridge/sections/sf-bridge-stove.ts:58 renders `this.config.icon ?? 'sci:stove'`; the editor's O7 default agrees. Full grep: the only remaining `mdi:fire` in the spec is TC-BRIDGE-U-17's smoke entry (:1373). |
| One default per threshold, published in the user doc and read from it by a test | docs/cards/stove.md:59 and :61 (`0.1`) + the options table; src/cards/stove/config.ts:19-20 holds the constants; tests/cards/stove/sci-fi-stove-editor.test.ts:209-235 reads both statements out of the doc and compares them to the exports — and dies on either site (two mutants, both killed). |
| The absent-entity message is localized, and `fr` renders exactly as before | src/cards/stove/sci-fi-stove.ts:126 `msg(str`Stove entity not found: ${this.config.entity}`)`; xliff/fr.xlf:1196-1199 trans-unit `s437558b3f6ef6130` with target « Entité poêle non trouvée : <x id="0"/> »; src/locales/locales/fr.js:105 `str`Entité poêle non trouvée : ${0}``. Both files are byte-identical to a fresh `lit-localize extract` / `build`, so id, placeholder and the `str` idiom are the generator's, not a hand edit. docs/specs/cards/stove.md:596 states the amended behaviour and TC-1111 pins it. |
| The header fallback is localized | src/cards/stove/sci-fi-stove.ts:132 `?? msg('Stove')`, resolving through the pre-existing unit `s04a02c13e8b9b762` (xliff/fr.xlf:1063, fr.js:12) to « Poêle ». Spec statement at docs/specs/cards/stove.md:600. **Unpinned by any test** — the second MEDIUM above. |
| The widened O5 guard really is wider than the one it replaced | tests/cards/stove/sci-fi-stove.test.ts:985-1003; recomputed with its exact logic: 6 accented code lines on `git show 78e31dd:src/cards/stove/sci-fi-stove.ts` (the two this delta localized plus the four toasts O5 localized), 0 on the delivered file. |
| The three `kind` branches of `_update` stay covered with real field names | tests/cards/stove/sci-fi-stove-editor.test.ts:58 (`sensor_inside_temperature`, a key of `SciFiStoveSensors`, src/cards/stove/config.ts:25), :77 (`pellet_quantity_threshold` at `0.3`, a top-level numeric key in range for the `min=0 max=1` slider, config.ts:40), :96 (`storage_counter`, config.ts:38). The three branches of src/cards/stove/sci-fi-stove-editor.ts:57-63 are each reached. The third case's `kind` is still not one the editor emits — the third finding. |
| The delta breaks nothing mechanically | Suite 96 files / 1178 cases, exit 0 (run in the worktree). `tsc --noEmit` exit 0. Production rollup build exits 0 and the bundle carries the new French target with no unresolved import. |

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 2 | info |
| LOW | 2 | note |

Positive observations:
- The two generated i18n artifacts are byte-identical to what their generators produce. That is the strongest form this claim can take, and it is the usual place a hand edit hides: the `import {str}` line added at the top of a « do not modify by hand » file is exactly the kind of change one would suspect, and it is the generator's.
- Having a unit test parse the user documentation and compare it to the exported constants converts a doc/code drift from a retrocheck finding into a red suite. Both halves of it bite, measured.
- Round 1's two out-of-diff findings on the bridge documents were taken in-run rather than filed, and that was the right call: the falsification round 1 wrote for its own MEDIUM (a bead leaves the spec prescribing the defect the lot removed) is precisely what the first MEDIUM of this round catches one file later, where it was *not* done.

VERDICT: APPROVE

## RESOLUTIONS — orchestrator, after round 2

The four findings of round 2 are fixed above, each with its proof. The two MEDIUM
were the two halves of one thing round 1 left open: a value stated in several
places (the header fallback) amended in only one of them, and the half of the
localization fix that no test watched. Both are now pinned by TC-1115, which
exists in the spec's table and in the suite, and which kills the mutant round 2
measured as surviving.

State: suite 96 files / 1179 cases green, `tsc --noEmit` exit 0, lint 0 error at
166 warnings (the project ceiling, unchanged). No bead was opened by this round:
every finding was on a file inside the lot's diff.

MUTATION: the header's localized fallback back to a bare unaccented literal (`?? msg('Stove')` → `?? 'Stove'`, sci-fi-stove.ts:132) — KILLED by tests/cards/stove/sci-fi-stove.test.ts « TC-1115 — the header fallback of an entity without friendly_name follows the locale ». Re-run here after the fix: the mutant fails with « expected 'Stove' to equal 'Poêle' » (vitest -t "TC-1115" exit 1), and the card file was restored byte-identical afterwards.
