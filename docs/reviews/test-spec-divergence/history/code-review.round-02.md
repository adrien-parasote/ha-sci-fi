# Code review — lot fix `test-spec-divergence`

AUDITOR: subagent
PACKET: `.sc/review/fb69670-5f1a050d` (dirty fb69670..worktree, +2 untracked)
SPEC: `docs/specs/cards/bridge.md`, `docs/specs/02_domain_selectors.md`, `docs/specs/03_base_classes.md`, `docs/specs/cards/water_history.md`, `docs/specs/cards/hexa-tiles.md`, `docs/specs/cards/climates.md`, `docs/specs/04_components.md` — plus the lot's own `docs/fixes/test-spec-divergence/lot.json`

COVERAGE (`must_read.txt` is EMPTY — no entry point was packaged; scope taken from `files.txt` plus the sources the changed tests exercise):

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| `.sc/review/fb69670-5f1a050d/diff.patch` | 1141 | 1141 | yes |
| `docs/specs/cards/bridge.md` | ~120 (630-670, 1324-1344, diff hunks) | 1546 | no — hunks + Zone→couleur table + anti-patterns |
| `docs/specs/02_domain_selectors.md` | hunk + TC-20x table | 119 | no |
| `docs/specs/03_base_classes.md` | hunk + TC-30x table | 163 | no |
| `docs/specs/cards/water_history.md` | hunk + TC table | 148 | no |
| `docs/specs/cards/hexa-tiles.md` | IT-702 row | 272 | no |
| `docs/specs/cards/climates.md` | TC-001..005 | — | no |
| `docs/specs/04_components.md` | TC-408 row | — | no |
| `src/cards/bridge/sections/sf-bridge-crew.ts` | 120 | 120 | yes |
| `src/utils/base-card.ts` | 156 | 156 | yes |
| `src/locales/localization.ts` | 17 | 17 | yes |
| `src/cards/bridge/styles.ts` | ~160 (crew + access blocks) | 760 | no |
| `src/cards/water/sci-fi-water-management.ts` | ~200 (140-215, 290-400) | 742 | no |
| `src/cards/bridge/sections/sf-bridge-vehicle.ts` | class list + plugIcon | 120 | no |
| `src/cards/bridge/sections/sf-bridge-stove.ts` | icon default + gauges | — | no |
| `src/cards/bridge/sections/sf-bridge-appliances.ts` | cycle status block | — | no |
| `src/components/sf-circle-progress-bar.ts` / `sf-stack-bar.ts` | warning computation | — | no |
| `src/components/sf-icon/sf-iconset.ts` | 60 | ~90 | no |
| `src/selectors/house.ts` | getFloors + neighbours | — | no |
| `src/cards/vehicles/labels.ts` | 30 | 30 | yes |
| `src/cards/bridge/sci-fi-bridge-editor.ts` | stove icon lines | 900+ | no |
| `tests/utils/base-card.test.ts` | 265 | 265 | yes |
| `tests/cards/bridge/sections/sf-bridge-crew.test.ts` | 197 | 197 | yes |
| `tests/cards/bridge/sections/sf-bridge-stove.test.ts` | diff + 250-307 | 307 | no |
| `tests/cards/bridge/sections/sf-bridge-vehicle.test.ts` | diff hunks | 196 | no |
| `tests/cards/bridge/sections/sf-bridge-access.test.ts` | diff hunks | 366 | no |
| `tests/cards/bridge/sections/sf-bridge-appliances.test.ts` | diff hunks | 245 | no |
| `tests/cards/water/sci-fi-water-management.test.ts` | diff hunks | 713 | no |
| `tests/selectors/house.test.ts` | diff hunks | 205 | no |
| `tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts` | diff hunks | 659 | no |
| `tests/components/sf-icon/sf-iconset.test.ts` | 98 | 98 | yes |
| `tests/cards/climates/sci-fi-climates.test.ts` | diff hunk | 414 | no |
| `tests/styles/card-css-baseline.json` | crew + access entries | 1000+ | no |
| `xliff/fr.xlf`, `src/locales/locales/fr.js` | diff hunks | — | no |
| `docs/fixes/test-spec-divergence/lot.json` + `verdicts.json` | 264 | 264 | yes |

Method: the worktree was copied to a scratch sandbox (`node_modules` symlinked) and 25 mutants plus 2 source probes were executed there. The repository tree was never written to. Baseline in the sandbox: 96 files / 1160 tests green, matching the lot's claim.

VERDICT: BLOCK

## FINDINGS

- [HIGH] `src/cards/bridge/sections/sf-bridge-crew.ts:35-40` — a household member whose `person.*` entity goes `unavailable`/`unknown` (HA restart, phone offline) is drawn with the **cyan "at a known zone" halo and a cyan map-marker**, indistinguishable from someone actually at a named zone, instead of the desaturated grey the card promises; and `not_home` uses the wrong grey token. The lot arbitrated the Zone→couleur mapping of `docs/specs/cards/bridge.md:634-643` (FR: the crew badge colours a person by presence state) for `work`/`school`/other zones, but left two of its six rows unhonoured and untested: the table says `not_home` → `var(--sf-accent-off)` while `ringColor` returns `var(--sf-text-disabled, #888)`, and it says `unavailable`/`unknown` → "Gris désaturé `var(--sf-text-disabled)`" while both fall through to `var(--sf-primary, #00d2ff)` and get `ringClass() === 'ring-other'`, i.e. the glowing cyan ring. Reproduced in the sandbox: `UNAVAILABLE class: crew-avatar-wrap ring-other | style: --ring-color:var(--sf-primary, #00d2ff);` and `NOT_HOME style: --ring-color:var(--sf-text-disabled, #888);`. This is the same root cause as observation O1 (the test endorsing cyan where the mapping demands another colour) — the fix covered one site of it, and the amended U-12 row ("toute AUTRE zone connue → cyan") now contradicts the surviving `unavailable`/`unknown` row of the very table above it, so a retrocheck re-raises the divergence. Either the two rows cede (and say so, as the lot did for U-29's 0.3) or the code implements them; either way an assertion must pin them.

RESOLUTION: fixed — les SIX lignes du mapping sont honorées. `ringColor` rend `--sf-accent-off` pour `not_home` (le token `--sf-text-disabled` y était posé par erreur : il appartient à la ligne unavailable/unknown) et `--sf-text-disabled` pour `unavailable`/`unknown` ; `ringClass` leur donne une classe propre `.ring-unknown`, car ces états ne sont pas « à une zone connue » et tombaient dans `.ring-other`, d'où le halo cyan signalé. Preuve : `tests/cards/bridge/sections/sf-bridge-crew.test.ts` porte une table de 7 cas (une par état du mapping), chacun exigeant la classe, son token ET l'absence du token voisin. Mutant `UNKNOWN_STATES = new Set([])` → les cas 'unavailable' et 'unknown' rougissent (2 failed / 13 passed). Spec : `docs/specs/cards/bridge.md` U-12 couvre désormais les six lignes et la classe `.ring-unknown` est décrite dans le layout.
  SITES: `src/cards/bridge/sections/sf-bridge-crew.ts:37` (not_home token) · `src/cards/bridge/sections/sf-bridge-crew.ts:39` (fall-through swallows unavailable/unknown) · `src/cards/bridge/sections/sf-bridge-crew.ts:20-24` (`ringClass` routes unavailable/unknown to `ring-other`) · `docs/specs/cards/bridge.md:641` · `docs/specs/cards/bridge.md:643` · `docs/specs/cards/bridge.md:1361-1364` (U-11/U-12 rows, amended, silent on both states) · `tests/cards/bridge/sections/sf-bridge-crew.test.ts:84-91` (the `not_home` case still asserts the class alone — the exact anti-pattern this lot removes elsewhere) · no test exists for `unavailable`/`unknown`
  FALSIFIED BY: a fix that only re-tokenises `not_home` leaves this red — `expect(wrap.getAttribute('style')).to.contain('--sf-text-disabled')` for `makeHass('unavailable')`, which today yields `--ring-color:var(--sf-primary, #00d2ff)` (run in the sandbox, 2 failures).
  ROOT: Zone→couleur mapping (`docs/specs/cards/bridge.md:634-643`) is the single source of the crew badge colour
  FIX-CLASS: corrects

- [MEDIUM] `tests/utils/base-card.test.ts:185-200` — the structural guard the lot added to cover "every card added next month" silently passes a *new* card that omits `super.willUpdate`, so the anti-pattern TC-306 (FR: a subclass overriding `willUpdate` must call super first, or the base reactive hook never runs) can re-enter the tree under a green suite. The regex requires an explicit `: void` return annotation, which `@typescript-eslint/explicit-function-return-type` is `off` for (`eslint.config.mjs:29`); and it uses `.exec` (first match per file only), so a second subclass in the same file is never examined. Proved in the sandbox: adding `src/cards/probe/sci-fi-probe.ts` with `override willUpdate(changedProperties: PropertyValues) { /* no super */ }` → `Tests 12 passed`. The `overrideCount >= 5` tripwire does not help: it only notices a *removal*, and the count still reaches 5. The amended spec row `docs/specs/03_base_classes.md:149` states the universal property the guard does not actually check.

RESOLUTION: fixed — l'annotation de retour est devenue OPTIONNELLE dans le motif (`(?::[^{]+)?`), le corps est extrait par équilibrage d'accolades et non par regex non-greedy, et `matchAll` remplace `.exec` pour voir TOUS les overrides de chaque fichier. Le seuil magique `>= 5` est supprimé : le garde compare le nombre d'overrides analysés au nombre trouvé par une recherche de chaîne simple (`expect(analysed).toEqual(declared)`), donc un motif qui cesse de matcher échoue ici au lieu de passer en silence. Preuve : mutant `override willUpdate(changedProperties: PropertyValues) {` sans `: void` ET sans `super.willUpdate` sur `sci-fi-vacuum.ts` → TC-306 rougit en nommant le fichier fautif (1 failed / 11 passed) ; c'est exactement le survivant signalé.
  SITES: only `tests/utils/base-card.test.ts:185` (the regex) — `docs/specs/03_base_classes.md:149` is the claim it has to satisfy
  FALSIFIED BY: the probe above — a new `extends SciFiBaseCard` file whose override has no `: void` and no `super.willUpdate` must turn the case red; today it stays green.
  ROOT: TC-306 (`super.willUpdate` first in every override)
  FIX-CLASS: corrects

- [MEDIUM] `tests/cards/bridge/sections/sf-bridge-stove.test.ts:292-306` — a `sf-stack-bar` stuck in permanent warning (every pellet level drawn as low stock) ships undetected, which is precisely what the new counterpart case says it prevents ("without it, a widget stuck in permanent warning would satisfy the case above"). The counterpart asserts only the circle gauge; it never queries the stack bar, while the amended spec row `docs/specs/cards/bridge.md:1377` requires "au-dessus du seuil, **aucun des deux**". Mutating `src/components/sf-stack-bar.ts:62` to `const warning = true;` leaves the whole stove file green (32 passed); the same mutation on the circle (`src/components/sf-circle-progress-bar.ts:75`) is caught.

RESOLUTION: fixed — le contre-cas interroge maintenant `sf-stack-bar` : `expect(stack.val / stack.max).to.be.greaterThan(stack.threshold)` puis `expect(stack.shadowRoot.querySelector('.warning')).to.be.null`. Preuve : mutant `const warning = true;` dans `src/components/sf-stack-bar.ts:62` → U-24 « leaves BOTH gauges clear » rougit (1 failed / 31 passed), alors qu'il survivait avant.
  SITES: only `tests/cards/bridge/sections/sf-bridge-stove.test.ts:292-306` (the missing `stack.shadowRoot!.querySelector('.warning')` null-assertion)
  FALSIFIED BY: `MUTATION: sf-stack-bar warning := true — SURVIVED` (see mutations below); adding the stack assertion turns it red.
  ROOT: TC-BRIDGE-U-24 (pellets below/above threshold drive the warning state of BOTH gauges)
  FIX-CLASS: corrects

- [MEDIUM] `docs/specs/cards/bridge.md:651-663` — the amended crew layout states two things the delivered code does not do, so the next reader (or retrocheck) is sent back into the divergence the lot is closing. (a) line 652 keeps "`.crew-avatar` (32px circle)" carried over verbatim from the old `.avatar` line, while the delivered avatar is **48px** (`src/cards/bridge/styles.ts:120-126` sets the wrap to 48×48 and `.crew-avatar` to `width:100%`). (b) the new `[!IMPORTANT]` block asserts "La couleur du mapping arrive par `--ring-color`, consommée par la règle `.crew-avatar-wrap.ring-*`" — only `.ring-other` reads `--ring-color`; `.ring-home` and `.ring-away` hardcode their own tokens (`styles.ts:131-137`), so for those two states the inline `--ring-color` is inert and the halo colour comes from elsewhere.

RESOLUTION: fixed — les deux affirmations fausses sont corrigées dans `docs/specs/cards/bridge.md`. « 32px circle » devient « .crew-avatar-wrap (48px circle) », valeur relevée dans `src/cards/bridge/styles.ts:123` (j'avais recopié le 32px de l'ancien layout sans le vérifier). Et la phrase sur `--ring-color` ne généralise plus à tort : les QUATRE règles `ring-home|ring-away|ring-other|ring-unknown` lisent désormais `var(--ring-color)` avec le token de leur ligne en repli, donc l'énoncé est devenu vrai au lieu d'être réécrit — ce qui ferme aussi le constat LOW sur la variable morte.
  SITES: `docs/specs/cards/bridge.md:652` · `docs/specs/cards/bridge.md:662-663`

- [MEDIUM] `tests/cards/bridge/sections/sf-bridge-vehicle.test.ts:88-90` — the new test anchors its icon lookup on `.vehicle-row, .bridge-section-body`, and **neither class exists anywhere in `src/`** (`sf-bridge-vehicle.ts` renders `.vehicle-body` / `.vehicle-right` / `.vehicle-power-row`), so `?? el.shadowRoot!` always wins and the "Anchored INSIDE the status row" comment describes an anchoring that is not in force. The assertion still passes for the right reason today (only the status row renders `sci:landspeeder-plugged`), but the lot's own subject is removing assertions aimed at elements that never existed (O2, U-26), and this introduces two more; the day a `.vehicle-row` appears, the test's meaning changes silently.

RESOLUTION: fixed — les sélecteurs inventés sont remplacés par `.vehicle-body`, le vrai conteneur de l'icône de prise (`src/cards/bridge/sections/sf-bridge-vehicle.ts:77`), l'icône de titre vivant dans `.bridge-section-title`. Le repli `?? el.shadowRoot!` qui rendait l'ancrage inerte est supprimé : le test asserte d'abord que `.vehicle-body` existe, donc un renommage du conteneur fait rougir au lieu de dégrader silencieusement la portée. U-25 asserte en plus la présence de `sci:landspeeder` ET l'absence de `sci:landspeeder-plugged` DANS ce conteneur.
  SITES: only `tests/cards/bridge/sections/sf-bridge-vehicle.test.ts:88-90`

- [MEDIUM] `tests/cards/bridge/sections/sf-bridge-crew.test.ts:95-110` — nothing a *reviewer of intent* can read ties the yellow token to the halo that is actually painted: U-12 asserts the inline `--ring-color` custom property, and the only artifact that proves a CSS rule consumes it is the `tests/styles/card-css-baseline.json` snapshot. Reverting `styles.ts` **and** that snapshot together — the shape a careless "baseline refreshed" commit takes — restores the original defect (work/school halo cyan again) with the entire suite green (272 passed). The single-file mutation is caught, so this is a robustness gap rather than a hole, but the lot's criterion is "an assertion that stays green whatever the code does would reproduce the defect".

RESOLUTION: fixed — un cas dédié asserte que les quatre règles `.crew-avatar-wrap.ring-*` lisent `var(--ring-color)` dans `src/cards/bridge/styles.ts`, ce qui relie la propriété inline au halo réellement peint sans passer par le snapshot. Preuve : mutant retirant `var(--ring-color)` de `.ring-other` PUIS snapshot CSS régénéré avec le mutant (le scénario exact du constat) → « every ring-* rule consumes --ring-color » rougit (1 failed / 26 passed).
  SITES: `tests/cards/bridge/sections/sf-bridge-crew.test.ts:95-110` (work) · `:112-121` (school) · `:123-134` (other zone) — all three read the attribute, none the rule
  FALSIFIED BY: `MUTATION: .crew-avatar-wrap.ring-other stops reading --ring-color + baseline reverted — SURVIVED`; an assertion that `styles.ts`'s `.ring-other` rule reads `--ring-color` (the form already used for `.access-btn.disabled`) or a computed-style check turns it red.
  ROOT: Zone→couleur mapping (`docs/specs/cards/bridge.md:634-643`)
  FIX-CLASS: corrects

- [LOW] `src/cards/bridge/sections/sf-bridge-crew.ts:91` — `style="--ring-color:${color};"` is written for every state, but for `home` and `not_home` no rule consumes it (`src/cards/bridge/styles.ts:131-137` hardcode their tokens): a dead inline custom property, and the value U-11 asserts (`tests/cards/bridge/sections/sf-bridge-crew.test.ts:79`) is the dead one — the green halo a user sees is painted by `.ring-home`, not by what the test reads. Either make the three `ring-*` rules read `--ring-color` uniformly (then the spec's `[!IMPORTANT]` block becomes true as written) or set the property only on `ring-other`.

RESOLUTION: fixed — première branche retenue : les quatre règles consomment `var(--ring-color)` (repli = le token de leur ligne de mapping), donc la propriété inline n'est plus morte pour `home`/`not_home` et l'assertion de U-11 porte sur une valeur effectivement peinte. Preuve : le cas « every ring-* rule consumes --ring-color » ci-dessus, et la table de mapping qui vérifie le token de chacun des 7 états.

- [LOW] `src/locales/locales/fr.js:162` / `xliff/fr.xlf:673` — retranslating `Charging` as "En charge" also retargets the **vehicles card editor**, where `src/cards/vehicles/labels.ts:25` maps `input-charging-state` to the same `msg('Charging')`: the form field that used to be labelled "Charge" now reads "En charge" (a state phrase where a field name is wanted, next to its siblings "Charge state" → "État de charge" and "Plug state"). One message id, two grammatical contexts; if "En charge" is right for the bridge status label, the editor field needs its own id.

RESOLUTION: fixed — la chaîne source partagée est séparée. `src/cards/vehicles/labels.ts` passe de `msg('Charging')` à `msg('Charging status')` pour le libellé du champ `input-charging-state` — un libellé de sélecteur de capteur, pas un état —, puis `npm run localize-extract` et `npm run localize-build` ont généré l'unité `s7262392f278336e8` traduite « Statut de charge ». `Charging` reste « En charge » pour l'état de la carte bridge (`src/locales/locales/fr.js:163`). Les deux consommateurs ont désormais leur propre message : vérifié par `grep` des deux ids dans `fr.js`, et le diff xliff se limite à +4/−1.

- [LOW] `tests/cards/bridge/sections/sf-bridge-access.test.ts:270-277` — the new `fs.readFileSync` + regex assertion on `src/cards/bridge/styles.ts` duplicates a guard the repository already has: `tests/styles/card-css-baseline.json` pins `.access-btn.disabled` to `{"opacity": "0.3", "pointer-events": "none"}`, and the mutation `opacity: 0.3 → 0.4` reddens both. It also asserts source *text*, not effect, so a later rule overriding the same property stays green. Prefer the baseline (one mechanism) or a computed-style assertion.

RESOLUTION: fixed — la baseline retenue, un seul mécanisme : l'assertion `fs.readFileSync` + regex est retirée de `sf-bridge-access.test.ts` (ainsi que ses imports devenus morts), après vérification que `tests/styles/card-css-baseline.json` épingle bien `.access-btn.disabled -> {'opacity': '0.3', 'pointer-events': 'none'}` pour `sci-fi-bridge`. Le test garde la classe ET son contre-cas (open NON désactivé, sans quoi deux boutons désactivés passeraient), et la ligne U-29 de la spec nomme la baseline comme gardien des valeurs.

## MUTATIONS

MUTATION: ringColor drops the `work`/`school` → `--sf-warning` branch — KILLED by tests/cards/bridge/sections/sf-bridge-crew.test.ts "TC-BRIDGE-U-12: work is a named zone" and "school is a named zone too"
MUTATION: ringColor('home') returns `--sf-primary` — KILLED by "TC-BRIDGE-U-11: renders ring-home and the green zone token"
MUTATION: `.crew-avatar-wrap.ring-other` stops reading `--ring-color` (styles.ts only) — KILLED by tests/styles/card-css-baseline.test.ts "sci-fi-bridge resolves to the same CSS as the baseline"
MUTATION: `.crew-avatar-wrap.ring-other` stops reading --ring-color + baseline reverted — SURVIVED
MUTATION: base-card hass setter no longer calls `setLocale(targetLocale)` — KILLED by tests/utils/base-card.test.ts "TC-303, TC-601, IT-602"
MUTATION: sci-fi-plugs drops `super.willUpdate(changedProperties)` — KILLED by tests/utils/base-card.test.ts "TC-306: every SciFiBaseCard subclass overriding willUpdate calls super first"
MUTATION: a NEW `extends SciFiBaseCard` card omits both `: void` and `super.willUpdate` — SURVIVED
MUTATION: `_formatTimestamp` loses the `Number.isNaN(date.getTime())` guard — KILLED by tests/cards/water/sci-fi-water-management.test.ts "TC-1205"
MUTATION: `_formatTimestamp` returns `HH:MM` without the date — KILLED by "TC-1205"
MUTATION: `_renderHistoryLogs` ignores `filterEntityIds` — KILLED by "TC-1203: filters out logs whose entity is not in filterEntityIds"
MUTATION: `_renderHistoryLogs` loading branch disabled — KILLED by "TC-1204"
MUTATION: empty-log message removed — KILLED by "TC-1203: renders empty message if logs list is empty"
MUTATION: `.access-btn.disabled` opacity 0.3 → 0.4 — KILLED by "TC-BRIDGE-U-29" and tests/styles/card-css-baseline.test.ts
MUTATION: sf-circle-progress-bar warning := false — KILLED by "TC-BRIDGE-U-24: pellet quantity below low_threshold"
MUTATION: sf-circle-progress-bar warning := true — KILLED by "TC-BRIDGE-U-24: pellet quantity above low_threshold leaves the gauges clear"
MUTATION: sf-stack-bar warning := false — KILLED by "TC-BRIDGE-U-24: pellet quantity below low_threshold"
MUTATION: sf-stack-bar warning := true — SURVIVED
MUTATION: appliances swaps `msg('Running')` and `msg('Inactive')` — KILLED by "TC-BRIDGE-U-21"
MUTATION: FR translation of `Charging` reverted to "Charge" — KILLED by "TC-BRIDGE-U-26"
MUTATION: active hexa tile loses `filter: drop-shadow` on `.hexa-border` — KILLED by "IT-702"
MUTATION: active hexa tile loses `text-shadow` on `.tile-label` — KILLED by "IT-702"
MUTATION: `getFloors` stops sorting by level — KILLED by "TC-201"
MUTATION: `getFloors` mutates the floor objects of `hass.floors` — KILLED by "IT-201: getFloors() is pure"
MUTATION: `getIconForIconsets` takes the error path for a known icon — KILLED by "TC-408"

## NOTES

- `Number.isNaN(date.getTime())` is the complete and canonical Invalid Date test: `getTime()` returns `NaN` for every unparseable input and never throws. The surviving `catch` is unreachable for a `string` argument, but `_formatTimestamp` is fed `log.when` out of `_rawLogs: any[]` (unvalidated HA websocket payloads), where a non-string with a throwing `toPrimitive` is conceivable — keeping it is defensible, not dead code by construction.
- The hoisted `vi.mock` of `src/locales/localization.js` in `tests/utils/base-card.test.ts:15-19` falsifies nothing else in that file: it wraps rather than replaces (`getLocale` stays live, which the setter's guard needs), and the only other tests that touch `hass` are TC-302 (`{}`, no `locale`) and IT-301 (does not observe the locale). The first TC-303 case is the first in the file to set an `fr` hass, so the `en → fr` transition it needs is real. Order-coupled by construction (the second case leaves the locale at `fr`), but deterministic under `vitest run`.
- `IT-201`'s rationale is inaccurate without being wrong in effect: `hass.floors` is a `Record`, so "a selector that sorted `hass.floors` in place" is not expressible — `Object.values()` always allocates. The assertions still bite on a real mutation (a selector writing into the floor objects is caught), so this is wording in `tests/selectors/house.test.ts:162-164` and `docs/specs/02_domain_selectors.md:107`, not a vacuous test.
- `expect(overrideCount).toBeGreaterThanOrEqual(5)` sits exactly on today's count (water, vacuum, plugs, weather, vehicles): a legitimate removal of an override reddens it. That is a deliberate tripwire, not a defect — but it is the reason the guard appears to catch the "drop `: void`" mutation on an existing card while missing it on a new one.
- O8 verified UNREPRODUCED as claimed: `TC-739` appears nowhere under `docs/`, `tests/` or `src/` other than in the lot's own `lot.json`; `00367e0 fix(tv): send a defined command…` exists, and `tests/cards/tv/sci-fi-tv.test.ts:816` asserts the full `media_player.volume_mute` call.
- `TC-002` (climates) and `TC-408` (iconset) renames both match their spec rows (`docs/specs/cards/climates.md:96`, `docs/specs/04_components.md:183`), and IT-702's new assertions match `docs/specs/cards/hexa-tiles.md:249` ("Rendered SVG border and text-shadow"), which never asked for a `box-shadow` — no spec amendment was owed there.
- No security surface in this diff: no `eval`, no `innerHTML`, no user input in a path; the `fs.readFileSync` calls added to two test files read fixed repository paths at test time.
- OUT-OF-DIFF: `src/cards/bridge/sci-fi-bridge-editor.ts:729,734` still offers `mdi:fire` as the stove icon default while the card renders `sci:stove` — correctly filed as bead `ha-sci-fi-gxd` and referenced from the amended U-19 row.
- OUT-OF-DIFF: the 7-day history window vs a 24 h spec is filed as bead `ha-sci-fi-o5p` and referenced from the amended TC-005 row.
- OUT-OF-DIFF: the crew layout block carries older contradictions the lot did not touch and that are not its subject — `.crew-row` documented as `overflow-x: auto, gap: 12px` with "Pas de wrapping" while `src/cards/bridge/styles.ts:105-110` ships `flex-wrap: wrap; gap: 16px` and no `overflow-x`, and `.crew-badge (min-width: 72px)` against the delivered `56px`. A bead for the author, not a correction in this lot.

## CONFORMANCE EVIDENCE

- `docs/specs/cards/bridge.md:639-640` (work/school → `--sf-warning`) → `src/cards/bridge/sections/sf-bridge-crew.ts:38`, painted through `src/cards/bridge/styles.ts:141-145`, snapshotted at `tests/styles/card-css-baseline.json:186`.
- `docs/specs/cards/bridge.md:1377` (U-24, warning state belongs to the delegated widgets) → `src/components/sf-circle-progress-bar.ts:75`, `src/components/sf-stack-bar.ts:62`; rendered classes asserted at `tests/cards/bridge/sections/sf-bridge-stove.test.ts:283,290`.
- `docs/specs/cards/bridge.md:1379-1381` (U-25/U-26 status labels) → `src/cards/bridge/sections/sf-bridge-vehicle.ts:56-57,93`; `xliff/fr.xlf:673` carries "En charge".
- `docs/specs/cards/bridge.md:1383` (U-29, `.access-btn.disabled` = opacity 0.3 + pointer-events none) → `src/cards/bridge/styles.ts:360-363`.
- `docs/specs/cards/water_history.md:104` (TC-005, literal `DD/MM HH:MM`) → `src/cards/water/sci-fi-water-management.ts:312-326`; the Invalid Date fallback is reached through `Number.isNaN(date.getTime())` at :316.
- `docs/specs/cards/water_history.md:102-103` (TC-003/004, `filterEntityIds` mandatory, loading wins over data) → `src/cards/water/sci-fi-water-management.ts:330-333,355`.
- `docs/specs/03_base_classes.md:149` (TC-306, faulty subclass must be caught) → `tests/utils/base-card.test.ts:129-165` spies the inherited hook; the universal half of the clause is the MEDIUM above.
- `docs/specs/02_domain_selectors.md:107` (IT-201, purity without reference identity) → `src/selectors/house.ts:35-43`.
- `docs/specs/04_components.md:183` (TC-408 input `stove`, object with viewBox) → `src/components/sf-icon/sf-iconset.ts:29-38`.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 1 | fix before merge |
| MEDIUM | 5 | note |
| LOW | 3 | note |

Positive observations:
- 22 of 25 mutants were killed, several by assertions this lot wrote: the water-history trio, U-21, U-26, U-29, IT-702 and TC-408 all redden on a single-line change to the behaviour they name. The lot's central claim — that the rewritten assertions bite — holds for the great majority of the observations, including the ones its author did not mutate (O1/O2, O4 partly, O6, O7, O13, O14).
- The spec amendments that cede to the code (U-29's 0.3, U-19's `sci:stove`, TC-005's `DD/MM`, IT-201's purity) each state *why* the code wins and leave a bead where the residue belongs; that is an arbitration, not a spec bent to a green test.
- Spelling out the forbidden shortcut inside the TC row ("asserter la seule classe ne protégeait aucune des deux valeurs", "ne prouve rien du rendu") makes the next author's regression visible at spec-reading time.

VERDICT: BLOCK

---

## Round 2 — author's round (review ceiling reached)

`review_gate.max_review_rounds = 1`, so no fresh reviewer rules on these fixes. This round is mine, and what follows is an ATTESTATION, not an independent read — the distinction matters because nobody checked my corrections of my corrections.

Les 9 constats portaient tous sur des fichiers de ce diff : aucun n'est filé, aucun n'est contesté. Je n'ai rien trouvé de faux dans ce rapport — en particulier le HIGH, qui me donne tort sur mon propre arbitrage O1 : j'avais honoré 3 des 6 lignes du mapping Zone → couleur et cru la ligne traitée.

**Les trois mutants qui avaient survécu sont tués**, chacun rejoué dans ce worktree sur une copie de travail (jamais `git checkout` sur un arbre porteur de travail non commité) :
- `sf-stack-bar` `warning := true` → U-24 « leaves BOTH gauges clear » rougit (1 failed / 31).
- `.ring-other` perdant `var(--ring-color)` **avec son snapshot régénéré** → « every ring-* rule consumes --ring-color » rougit (1 failed / 26).
- carte sans `: void` ET sans `super.willUpdate` → TC-306 rougit en nommant `cards/vacuum/sci-fi-vacuum.ts` (1 failed / 11).

**Deux mutations supplémentaires**, sur les corrections que le rapport ne couvrait pas : `UNKNOWN_STATES = new Set([])` → les cas 'unavailable' et 'unknown' rougissent (2 failed / 13) ; `vehicle-body` renommé → U-25 et U-26 rougissent sur « .vehicle-body must exist » (2 failed / 10).

**Mesures finales** : suite complète 96 fichiers / 1163 cas verts ; `tsc --noEmit` exit 0 (il avait attrapé un appel à 1 argument sur un override devenu sans paramètre, corrigé) ; `npm run lint` exit 0, 166 warnings = le plafond du projet, inchangé.

**Ce que cette ronde ne couvre pas, et qu'un relecteur neuf aurait dû voir** : les corrections ci-dessus ne sont vérifiées que par les mutants que J'AI choisis, sur les organes que le rapport a nommés ; rien n'a cherché un nouveau défaut ailleurs dans le diff, et l'ajout de `.ring-unknown` change un rendu visuel (anneau désaturé sans lueur pour `unavailable`/`unknown`) qu'aucun œil humain n'a encore regardé.

VERDICT: APPROVE
AUDITOR: self
