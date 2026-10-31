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

---

## Round 3 — survivor closure (author)

Round 2 was recorded without its proof: it carried a passing verdict while three mutants of round 1 still stood. This round carries only what was missing — the line that closes each survivor, naming the test that now kills it. No finding is re-litigated and the reviewer's text is untouched.

Each mutant was replayed in this worktree on a working copy of the mutated file, restored from that copy afterwards — never `git checkout` on a tree holding uncommitted work.

MUTATION: `.crew-avatar-wrap.ring-other` stops reading --ring-color + baseline reverted — KILLED by tests/cards/bridge/sections/sf-bridge-crew.test.ts "TC-BRIDGE-U-12: every ring-* rule consumes --ring-color", which reads styles.ts directly and so does not depend on the CSS snapshot; replayed with the rule stripped AND `UPDATE_CSS_BASELINE=1` regenerated: 1 failed / 26 passed
MUTATION: a NEW `extends SciFiBaseCard` card omits both `: void` and `super.willUpdate` — KILLED by tests/utils/base-card.test.ts "TC-306: every SciFiBaseCard subclass overriding willUpdate calls super first", whose pattern now makes the return annotation optional, extracts the body by brace balancing and iterates every override via matchAll; replayed on cards/vacuum/sci-fi-vacuum.ts stripped of both: 1 failed / 11 passed, the offending file named
MUTATION: sf-stack-bar warning := true — KILLED by tests/cards/bridge/sections/sf-bridge-stove.test.ts "TC-BRIDGE-U-24: pellet quantity above low_threshold leaves BOTH gauges clear", which now queries sf-stack-bar's shadow root and not only the circle; replayed with `const warning = true;` in src/components/sf-stack-bar.ts: 1 failed / 31 passed
MUTATION: ringClass/ringColor drop the `unavailable`/`unknown` branch — KILLED by the mapping table in tests/cards/bridge/sections/sf-bridge-crew.test.ts, cases 'unavailable' and 'unknown'; replayed with `UNKNOWN_STATES = new Set([])`: 2 failed / 13 passed
MUTATION: the `.vehicle-body` container is renamed, leaving the icon anchor inert — KILLED by tests/cards/bridge/sections/sf-bridge-vehicle.test.ts "TC-BRIDGE-U-25"/"U-26", which assert the container exists before using it; replayed with the class renamed: 2 failed / 10 passed

Final measures on this tree: full suite 96 files / 1163 cases green; `tsc --noEmit` exit 0; `npm run lint` exit 0 with 166 warnings, the project's unchanged ceiling.

Still uncertified, and worth a human eye: this is an author's attestation, the last two mutants are ones I chose myself, and `.ring-unknown` changes a visual rendering (a desaturated ring with no glow for `unavailable`/`unknown`) that nobody has looked at.

VERDICT: APPROVE
AUDITOR: self

---

## Round 4 — delta round, fresh reviewer

AUDITOR: subagent
PACKET: `.sc/review/fb69670-c4d518d2` (delta, 17 files since `.sc/review/fb69670-5f1a050d`)
SCOPE: this is a RE-REVIEW. `delta.txt` + `delta.patch` are the files that moved since round 1, plus the closure of every round-1 finding and of its three `SURVIVED` mutants. Files that did not move were not re-audited.

COVERAGE (`must_read.txt` is EMPTY — no entry point was packaged; scope taken from `delta.txt` plus the sources the moved tests exercise):

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| `.sc/review/fb69670-c4d518d2/delta.patch` | 1212 | 1212 | yes |
| `docs/reviews/test-spec-divergence/code-review.md` (rounds 1–3) | 216 | 216 | yes |
| `src/cards/bridge/sections/sf-bridge-crew.ts` | 130 | 130 | yes |
| `src/cards/bridge/styles.ts` | ~70 (105-155, 360-370, 600-610) | 765 | no — crew ring block, access-btn, vehicle-body |
| `src/cards/vehicles/labels.ts` | 35 | 35 | yes |
| `src/cards/vehicles/sci-fi-vehicles-editor.ts` | label wiring (25, 53) | 160 | no |
| `tests/utils/base-card.test.ts` | 120-290 | 290 | no — TC-306 pair in full |
| `tests/cards/bridge/sections/sf-bridge-crew.test.ts` | 66-120 + diff | 183 | no |
| `tests/cards/bridge/sections/sf-bridge-stove.test.ts` | diff hunks | 314 | no |
| `tests/cards/bridge/sections/sf-bridge-vehicle.test.ts` | diff hunks | 201 | no |
| `tests/cards/bridge/sections/sf-bridge-access.test.ts` | diff hunks | 361 | no |
| `tests/utils/base-editor.test.ts` | 280-325 + 60-70 | 375 | no |
| `tests/styles/card-css-baseline.json` | crew + access entries | 4781 | no |
| `docs/specs/cards/bridge.md` | 634-672, 1365-1385 | 1552 | no — crew layout + U-11/U-12/U-24/U-29 rows |
| `src/locales/locales/fr.js` · `xliff/fr.xlf` | the two charging units | 320 · 1177 | no |
| `src/styles/common.ts` | token definitions (18-20) | — | no |
| `tsconfig.json` · `tsconfig.test.json` · `eslint.config.mjs` | strictness flags | — | no |

Method: the worktree was copied to a scratch sandbox (`node_modules` symlinked) and nine mutants were executed there. The repository tree was never written to, and nothing was restored into it. Sandbox baseline: **96 files / 1163 cases green**, matching the author's claim.

Reference measures re-run on the repository tree and CONFIRMED: `npx vitest run` → 96 files / 1163 cases green; `npx tsc --noEmit -p tsconfig.test.json` → exit 0; `npm run lint` → exit 0, 166 warnings.

VERDICT: APPROVE
SPEC: `docs/specs/cards/bridge.md` (Zone → couleur mapping, crew layout, U-12 / U-24 / U-29), `docs/specs/03_base_classes.md` (TC-306)

## FINDINGS

- [MEDIUM] `tests/utils/base-card.test.ts:206-207` — a card added later that overrides `willUpdate` **without writing the `override` keyword** never calls `super.willUpdate`, so the base class stops propagating `hass`/locale and the card silently freezes on screen — and the one guard whose whole purpose is to catch that stays GREEN, exactly as it did before this lot for the `: void` form. The rewritten guard keyed both of its counters on the keyword — `declared` counts `/override\s+willUpdate\s*\(/g` (:206) and `analysed` iterates `/override\s+willUpdate\s*\([^)]*\)\s*(?::[^{]+)?\{/g` (:207) — so a declaration lacking the keyword is invisible to BOTH, the `expect(analysed).toEqual(declared)` self-check reads 5 === 5, and `expect(offenders).toEqual([])` never sees the file. This is NOT closed by the keyword being mandatory elsewhere: `tsconfig.json` sets `strict` but **not** `noImplicitOverride`, and `eslint.config.mjs` carries no override rule. Reproduced in the sandbox: `src/cards/probe/sci-fi-probe.ts` with `willUpdate(changedProperties: PropertyValues) { void changedProperties; }` (no keyword, no super) → `npx tsc --noEmit -p tsconfig.test.json` **exit 0** and `npx vitest run tests/utils/base-card.test.ts` → **12 passed**. The same file WITH the keyword is caught (`1 failed | 11 passed`, naming `cards/probe/sci-fi-probe.ts`), which is why the mutant the round-1 report named is dead while the property it stands for is not. The spec clause this guard has to satisfy — `docs/specs/03_base_classes.md:149`, TC-306 (every `SciFiBaseCard` subclass overriding `willUpdate` calls `super` first) — is universal and still unenforced.

RESOLUTION: fixed — les deux compteurs rendent le mot-clé `override` optionnel ensemble (`(?:override\s+)?(?<![.\w])willUpdate\s*\(`), et `noImplicitOverride: true` a été ajouté à `tsconfig.json` : la forme sans mot-clé ne compile plus du tout (sonde → TS4114, exit 2, alors qu'elle compilait avant). La clause `super` reste gardée par la lecture tree-wide, conservée — rond 5 avait montré que le flag seul la laissait sans vérification. Mutant rejoué : `super.willUpdate` retiré de `src/cards/plugs/sci-fi-plugs.ts:85` mot-clé conservé → 1 failed, fichier nommé ; forme sans mot-clé → tuée deux fois, par le compilateur et par le garde. Le résidu (champ-flèche, sous-classe intermédiaire) est borné dans TC-306 et filé en `ha-sci-fi-2t4`.
  SITES: `tests/utils/base-card.test.ts:206` (the `declared` string search) · `tests/utils/base-card.test.ts:207` (the `analysed` pattern) — the same keyword anchors both, so a fix touching only one leaves the hole · `tests/utils/base-card.test.ts:203` is the second, narrower gate of the same guard (`extends\s+SciFiBaseCard` literal: a card extending an intermediate subclass is skipped too — no such card exists today)
  FALSIFIED BY: a fix that only makes the `override` keyword optional in `analysed` (:207) and leaves `declared` (:206) keyed on it still passes the probe above — `analysed` would then exceed `declared` and `toEqual` would redden on the CORRECT tree, so both counters must move together. The failing case: add `src/cards/probe/sci-fi-probe.ts` as above; `tests/utils/base-card.test.ts` "TC-306: every SciFiBaseCard subclass overriding willUpdate calls super first" must name that file.
  ROOT: TC-306 (`super.willUpdate` first in every override)
  FIX-CLASS: corrects
  ⚠ Second review round on this ROOT (round 1 raised the `: void` form of the identical cause). Before recording, name the invariant the next fix makes true — "no `willUpdate` declaration in a `SciFiBaseCard` subclass escapes the guard, with or without the `override` keyword" — rather than patching the next evasion.

- [LOW] `src/cards/bridge/sections/sf-bridge-crew.ts:3-7` — the file's header docblock now tells the next reader the opposite of what the file does: "Blue halo → other (work, school, etc.)" was TRUE at the lot's base (work and school fell through to cyan) and this delta made it FALSE — work/school are `--sf-warning`, and the fourth state the delta introduced (`ring-unknown` for `unavailable`/`unknown`) is not mentioned at all. The lot exists to remove statements about this card that the code contradicts; this one it created. Three lines, same block as the `Zone icon overlaid…` line.

RESOLUTION: fixed — l'en-tête de `src/cards/bridge/sections/sf-bridge-crew.ts` nomme les cinq états rendus avec leur token : home/`--sf-accent-on`, not_home/`--sf-accent-off`, work+school/`--sf-warning`, toute autre zone connue/`--sf-primary`, unavailable+unknown/`--sf-text-disabled` sans lueur. Vérifié ligne par ligne par le relecteur de la ronde 6 contre `ringColor`/`ringClass` et la feuille de style.
  Fix: restate lines 4-7 from the Zone → couleur mapping — green home, `--sf-accent-off` not_home, yellow work/school, cyan any other known zone, desaturated ring for unavailable/unknown.

## MUTATIONS

MUTATION: `.crew-avatar-wrap.ring-other` stops reading --ring-color + baseline reverted — KILLED by tests/cards/bridge/sections/sf-bridge-crew.test.ts "TC-BRIDGE-U-12: every ring-* rule consumes --ring-color"; replayed in the sandbox with `var(--ring-color, …)` stripped from the `.ring-other` rule AND `UPDATE_CSS_BASELINE=1 npx vitest run tests/styles/card-css-baseline.test.ts` regenerating the snapshot against the mutant (verified: the snapshot's `.crew-avatar-wrap.ring-other` entry carries the mutated value), then the full suite: 1 failed / 1162 passed
MUTATION: a NEW `extends SciFiBaseCard` card omits both `: void` and `super.willUpdate` — KILLED by tests/utils/base-card.test.ts "TC-306: every SciFiBaseCard subclass overriding willUpdate calls super first"; replayed by ADDING `src/cards/probe/sci-fi-probe.ts` (a new file, not an existing card edited): 1 failed / 11 passed, the diff naming `cards/probe/sci-fi-probe.ts: void changedProperties;`
MUTATION: sf-stack-bar warning := true — KILLED by tests/cards/bridge/sections/sf-bridge-stove.test.ts "TC-BRIDGE-U-24: pellet quantity above low_threshold leaves BOTH gauges clear"; replayed with `const warning = true;` at src/components/sf-stack-bar.ts:62: 2 failed / 1161 passed (U-24, plus tests/components/sf-stack-bar.test.ts which also bites)
MUTATION: `UNKNOWN_STATES = new Set<string>([])` in src/cards/bridge/sections/sf-bridge-crew.ts — KILLED by the ZONE_MAPPING table of tests/cards/bridge/sections/sf-bridge-crew.test.ts, cases 'unavailable' and 'unknown': 2 failed / 13 passed
MUTATION: the `.vehicle-body` container renamed to `.vehicle-main` (section + sheet) — KILLED by tests/cards/bridge/sections/sf-bridge-vehicle.test.ts "TC-BRIDGE-U-25" and "TC-BRIDGE-U-26" on `.vehicle-body must exist for this anchor to mean anything`, and by tests/styles/card-css-baseline.test.ts: 3 failed / 1160 passed
MUTATION: ringColor('not_home') reverted to `var(--sf-text-disabled, #888)` (the round-1 defect) — KILLED by tests/cards/bridge/sections/sf-bridge-crew.test.ts "TC-BRIDGE-U-11/U-12: state 'not_home' → ring-away and --sf-accent-off": 1 failed / 14 passed
MUTATION: `.access-btn.disabled` opacity 0.3 → 0.4 and `pointer-events: none` removed, after the lot DELETED the fs+regex assertion — KILLED by tests/styles/card-css-baseline.test.ts "sci-fi-bridge resolves to the same CSS as the baseline": 1 failed / 1162 passed — the single mechanism the lot kept does hold
MUTATION: a NEW `extends SciFiBaseCard` card declares `willUpdate` WITHOUT the `override` keyword and without `super.willUpdate` — SURVIVED (the MEDIUM above; `tsc --noEmit` exit 0, tests/utils/base-card.test.ts 12 passed)

## NOTES

- The HIGH is genuinely closed, and all SIX rows of `docs/specs/cards/bridge.md:638-643` are honoured, each on its own branch and each asserted: `home` → `ring-home`/`--sf-accent-on` (`src/cards/bridge/sections/sf-bridge-crew.ts:24,43`), `work`/`school` → `ring-other`/`--sf-warning` (:30,47), `not_home` → `ring-away`/`--sf-accent-off` (:25,46), any other known zone → `ring-other`/`--sf-primary` (:30,49), `unavailable`/`unknown` → `ring-unknown`/`--sf-text-disabled` (:29,48). No state falls into a wrong branch: the two new branches are tested before the fall-through, and the fall-through is reached only by a genuine zone name. The hardcoded fallbacks match the real token values exactly (`src/styles/common.ts:18,20` — `--sf-text-disabled: rgba(224, 232, 255, 0.3)`, `--sf-accent-off: rgba(224, 232, 255, 0.25)`), so the rules are correct standalone as the comment claims. The `notToken` column is not a substring trap: `--sf-accent-on`, `--sf-accent-off`, `--sf-text-disabled`, `--sf-warning`, `--sf-primary` are pairwise non-containing.
- Both round-1 spec claims are now TRUE in the code, not merely reworded. 48px: `src/cards/bridge/styles.ts:122-123` sets `.crew-avatar-wrap` to `width: 48px; height: 48px`, which is what `docs/specs/cards/bridge.md:650` states. `--ring-color` read by the `ring-*` rules: all four rules at `src/cards/bridge/styles.ts:132-150` read `var(--ring-color, …)`, matching `docs/specs/cards/bridge.md:663-664`, and the assertion that pins it is killed by the first mutant above.
- `.ring-unknown` is fully joined, no orphan on either side: produced at `src/cards/bridge/sections/sf-bridge-crew.ts:29`, consumed at `src/cards/bridge/styles.ts:148-150`, snapshotted at `tests/styles/card-css-baseline.json:189-191`, and asserted at `tests/cards/bridge/sections/sf-bridge-crew.test.ts:86-87,114`. The baseline is current: the whole suite — `tests/styles/card-css-baseline.test.ts` included — is green without `UPDATE_CSS_BASELINE`, and the snapshot's value is character-for-character the sheet's rule.
- The `Charging` / `Charging status` split is correct and the generated files are coherent. Two consumers, two distinct source strings: `src/cards/bridge/sections/sf-bridge-vehicle.ts:57` keeps `msg('Charging')` → `s77a0727520efc502` → « En charge »; `src/cards/vehicles/labels.ts:29` takes `msg('Charging status')` → `s7262392f278336e8` → « Statut de charge », reaching the editor through `vehiclesLabels()` at `src/cards/vehicles/sci-fi-vehicles-editor.ts:25,53`. The lit-localize pipeline is IDEMPOTENT on this tree: re-running `npm run localize-extract` then `npm run localize-build` in the sandbox produced a byte-identical `xliff/fr.xlf` and `src/locales/locales/fr.js` (zero diff), so the id was really generated and not hand-written.
- Probe reported for completeness, judged NOT a defect: reverting `src/cards/vehicles/labels.ts:29` to `msg('Charging')` leaves the suite fully green (96 files / 1163 cases). No assertion pins that editor label's value — `tests/utils/base-editor.test.ts:302,318-320` checks `typeof result === 'string'` for all ~40 keys and none of their values. That is the file's design, not a hole this lot opened, and what the round-1 LOW asked for (one id per grammatical context) is structurally delivered: the two consumers now pass literally different source strings. Pinning one key's value would single it out among forty.
- Round 1 overstated one MEDIUM without changing its conclusion: `const warning = true;` in `src/components/sf-stack-bar.ts` was always caught by `tests/components/sf-stack-bar.test.ts` "does NOT add warning class when val/max > threshold"; what survived was the STOVE file's counterpart, which is what the row claimed to cover. The fix is right either way.
- `zoneIcon` still returns `mdi:map-marker` for `unavailable`/`unknown`, the same icon as any other known zone — only the colour now distinguishes them. `docs/specs/cards/bridge.md:655` lists `mdi:map-marker` as the fall-through and pins no icon for those states, so this is not pinned by the spec.
- OUT-OF-DELTA: the crew layout block the author edited still opens on `docs/specs/cards/bridge.md:648` `.crew-row (flex, overflow-x: auto, gap: 12px)` and `:649` `.crew-badge (min-width: 72px)`, while `src/cards/bridge/styles.ts:105-110` ships `flex-wrap: wrap; gap: 16px` with no `overflow-x` and `:117` ships `min-width: 56px`; the `[!NOTE]` at `:671-672` repeats "overflow-x: auto … Pas de wrapping". Round 1 named these and prescribed a bead; those two lines did not move in this delta, so they stay out of this round's scope — but unlike `ha-sci-fi-gxd` and `ha-sci-fi-o5p` no bead id is recorded for them anywhere in the report. Worth filing before the lot closes.
- No security surface in this delta: no `eval`, no `innerHTML`, no user input in a path. The two `fs.readFileSync` calls (one added to `tests/cards/bridge/sections/sf-bridge-crew.test.ts:108-111`, one removed from `tests/cards/bridge/sections/sf-bridge-access.test.ts`) read fixed repository paths at test time.
- `tests/utils/base-card.test.ts:163` `faulty.willUpdate()` is correct, not a weakening: `FaultyCard.willUpdate(): void` declares no parameter, the base hook is spied on the prototype above `SciFiBaseCard`, and `expect(baseHook).not.toHaveBeenCalled()` still carries the case. `tsc --noEmit` exit 0 confirms the arity.
- The `analysed` vs `declared` self-check does bite on the failure mode it was written for: a signature the pattern cannot parse but the string search can (e.g. a default parameter containing `()`) makes the two counters disagree and reddens the case. Its blind spot is only the one named in the MEDIUM — a form neither counter sees.

## CONFORMANCE EVIDENCE

- `docs/specs/cards/bridge.md:638-643` (the six Zone → couleur rows) → `src/cards/bridge/sections/sf-bridge-crew.ts:23-31,42-50`, painted by `src/cards/bridge/styles.ts:132-150`, pinned at `tests/styles/card-css-baseline.json:183-191`, asserted row by row at `tests/cards/bridge/sections/sf-bridge-crew.test.ts:80-91`.
- `docs/specs/cards/bridge.md:650` (`.crew-avatar-wrap` 48px circle) → `src/cards/bridge/styles.ts:122-123`.
- `docs/specs/cards/bridge.md:663-664` (the four `ring-*` rules read `--ring-color`) → `src/cards/bridge/styles.ts:132,137,141,148`; guarded by `tests/cards/bridge/sections/sf-bridge-crew.test.ts:105-117`, which survives a snapshot regeneration.
- `docs/specs/cards/bridge.md:1377` (U-24, above threshold neither gauge warns) → `src/components/sf-circle-progress-bar.ts:75` and `src/components/sf-stack-bar.ts:62`; both now asserted at `tests/cards/bridge/sections/sf-bridge-stove.test.ts:305-312`.
- `docs/specs/cards/bridge.md:1382` (U-26, « En charge » + the plugged icon inside the status container) → `src/cards/bridge/sections/sf-bridge-vehicle.ts:57,78`; anchored on `.vehicle-body` at `tests/cards/bridge/sections/sf-bridge-vehicle.test.ts:92-96`, with the container's existence asserted first.
- `docs/specs/cards/bridge.md:1385` (U-29, `.disabled` = opacity 0.3 + pointer-events none, pinned by the baseline) → `src/cards/bridge/styles.ts:365-368` ↔ `tests/styles/card-css-baseline.json:393-396`.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 1 | fix before merge |
| LOW | 1 | fix before merge |

Positive observations:
- The three round-1 survivors are dead for the right reason, not by a test rewritten around the mutant: the `--ring-color` case reads the sheet directly and therefore survives a `UPDATE_CSS_BASELINE=1` regeneration — I reproduced the exact careless-refresh scenario and it still reddens.
- Replacing `expect(overrideCount).toBeGreaterThanOrEqual(5)` with `expect(analysed).toEqual(declared)` is the right shape of self-check: it fails when the parser stops parsing instead of sitting on today's count. The residual gap is the anchor both counters share, not the idea.
- The fallbacks in the `ring-*` rules were copied from the real token values, so each rule is genuinely correct standalone — the comment claiming it is verifiable, which is rarer than the comment.

VERDICT: APPROVE

### Round 4 — standing verdict

The verdict line above was written from the severity table alone (0 CRITICAL, 0 HIGH). It is superseded here, and this is the round's standing verdict: **a mutant this round reproduced still lives** — `a NEW extends SciFiBaseCard card declares willUpdate WITHOUT the override keyword and without super.willUpdate` — and a standing survivor makes the round blocking regardless of the severity assigned to the finding it embodies. The survivor and the MEDIUM at `tests/utils/base-card.test.ts:206-207` are one and the same defect: the guard that TC-306 relies on does not enforce the universal clause it claims, and `tsconfig.json` (no `noImplicitOverride`) and `eslint.config.mjs` (no override rule) leave the keyword optional for the next author.

Everything else in this delta is closed: the HIGH is genuinely fixed across all six mapping rows, the three round-1 survivors and the author's own two mutants are dead on replay, both false spec claims are now true in the code, the baseline is current, and the lit-localize split is idempotent. One guard fix and one docblock close this round.

AUDITOR: subagent
VERDICT: BLOCK

---

## Round 5 — delta round, fresh reviewer

AUDITOR: subagent
PACKET: `.sc/review/fb69670-59b1d7a1` (delta, 11 files since `.sc/review/fb69670-c4d518d2`)
SCOPE: RE-REVIEW, strictly the closure of the round-4 MEDIUM + LOW, the OUT-OF-DELTA item, and the standing survivor.

Reference measures re-run and CONFIRMED: 96 files / 1163 cases green; `tsc --noEmit -p tsconfig.test.json` exit 0; `npm run lint` exit 0, 166 warnings.

### FINDINGS

- [HIGH] `tests/utils/base-card.test.ts:169-187` — any card can drop `super.willUpdate(changedProperties)` from its override and nothing notices: the base class stops propagating `hass` and the locale, and the card silently freezes on the dashboard under a green suite and a clean typecheck. `noImplicitOverride` enforces the `override` KEYWORD, never the SUPER CALL — two different properties — so deleting the source-walking guard removed the only tree-wide check of TC-306's clause and replaced it with a check of a different thing. Reproduced: `super.willUpdate(changedProperties);` removed from `src/cards/plugs/sci-fi-plugs.ts:85` with the keyword kept → tsc exit 0 and 1163 cases green. `docs/specs/03_base_classes.md:149` still requires the clause and was NOT amended — the clause was abandoned, not ceded, which is the divergence this lot exists to close. Secondary: asserting `tsconfig.json` content by regex re-introduces the "source text, not effect" anti-pattern this lot removed in round 2.
  SITES: `tests/utils/base-card.test.ts:169-187` · `docs/specs/03_base_classes.md:149` · the five overrides now unguarded: `sci-fi-water-management.ts:94` · `sci-fi-vacuum.ts:65` · `sci-fi-plugs.ts:84` · `sci-fi-vehicles.ts:73` · `sci-fi-weather.ts:160`
  FALSIFIED BY: remove `super.willUpdate(changedProperties);` from `src/cards/plugs/sci-fi-plugs.ts:85`, keeping the keyword. Only a tree-wide first-statement check reddens it — and because `noImplicitOverride` now makes `override willUpdate` mandatory, the keyword anchor is guaranteed, so restoring the walk is sound this time.
  ROOT: TC-306 · FIX-CLASS: corrects
  INVARIANT the fix must make true: no `willUpdate` override in a `SciFiBaseCard` subclass reaches the tree without `super.willUpdate` as its first statement, AND the check cannot pass by matching nothing.
  RESOLUTION: fixed — le flag `noImplicitOverride` est CONSERVÉ (gain net, et c'est lui qui rend l'ancre `override willUpdate` obligatoire donc le garde sain), et la vérification tree-wide de l'appel `super` est restaurée par-dessus : `tests/utils/base-card.test.ts` « TC-306: every SciFiBaseCard subclass overriding willUpdate calls super first », dont le motif s'ancre désormais sur `override\s+willUpdate` — garanti par le compilateur — et qui échoue si le nombre d'overrides analysés ne correspond pas au nombre déclaré, donc il ne peut pas passer en matchant rien. Mutant `super.willUpdate` retiré de `src/cards/plugs/sci-fi-plugs.ts:85` keyword conservé → 1 failed, fichier nommé.

- [MEDIUM] `docs/specs/cards/bridge.md:671-672` — the `[!NOTE]` still reads "Le `.crew-row` a `overflow-x: auto` … **Pas de wrapping**" while the render block two lines above, corrected in this delta, reads `flex-wrap: wrap, gap: 16px`, and the sheet ships `flex-wrap: wrap` with no `overflow-x`. The ASCII block was fixed and its own explanatory note, asserting the opposite, was left standing.
  RESOLUTION: fixed — le `[!NOTE]` est réécrit sur le comportement livré (la rangée passe à la ligne, elle ne défile pas), vérifié contre `src/cards/bridge/styles.ts:105-110`.

### MUTATIONS

MUTATION: a NEW `extends SciFiBaseCard` card declares `willUpdate` WITHOUT the `override` keyword and without `super.willUpdate` — KILLED by `tsc --noEmit`: TS4114, exit 2; the same probe compiled at exit 0 one round ago
MUTATION: a NEW `extends SciFiBaseCard` card omits both `: void` and `super.willUpdate` — SURVIVED. Deleting a guard frees a mutant, it does not kill it: `GONE from` applies to deleted PRODUCT code, and what was deleted is the test
MUTATION: sci-fi-plugs drops super.willUpdate(changedProperties) — SURVIVED. Round 1 recorded it KILLED by the case deleted in this delta; replayed with the keyword kept: tsc exit 0, 1163 cases green
MUTATION: `"noImplicitOverride": true` deleted from tsconfig.json — KILLED by the new case: 1 failed / 11 passed. It bites for its own narrow property; that property is not TC-306's
MUTATION: a bogus `override` annotation on a member no base class declares — KILLED by tsc: TS4113, exit 2. Run to validate the five new annotations: since tsc exits 0 on the tree, none is false

### NOTES

- The LOW (crew docblock) is CLOSED and correct: the five rendered states each carry the right token, checked against `ringColor`/`ringClass` and the sheet.
- The five `override` annotations are genuine and behaviour-neutral (TS4113 proved live; `override` is erased at emit). `setConfig` → `base-editor.ts:122`; `firstUpdated` ×2 → `ReactiveElement`; `title` ×2 → `HTMLElement.title`.
- `"noImplicitOverride": true` should NOT be reverted to close the HIGH: it is live on both typechecking paths and it is what makes a restored tree-wide check reliable.
- OUT-OF-DIFF, for a bead: `sci-fi-water-management-editor.ts:38` logs and continues on a swallowed registry failure, and `:73` casts through `(this.hass as any).callWS`. The `@property override title` collision on `SfButtonCard`/`SfEditorAccordion` is pre-existing and now merely visible.

VERDICT: BLOCK
AUDITOR: subagent

---

## Round 6 — delta round, fresh reviewer

AUDITOR: subagent
PACKET: `.sc/review/fb69670-9e40feaf` (delta, 5 files since `.sc/review/fb69670-59b1d7a1`)
SCOPE: RE-REVIEW, strictly the closure of the round-5 HIGH + MEDIUM and of the two mutants standing in `survivors.txt`.

Method: the worktree was copied to a scratch sandbox (`node_modules` symlinked); seven probes ran there. The repository tree was never written to. Sandbox baseline 96 files / 1164 cases green, matching the author's claim. Reference measures re-run and CONFIRMED: 1164 cases green; `tsc --noEmit -p tsconfig.test.json` exit 0; `npm run lint` exit 0, 166 warnings.

VERDICT: APPROVE

### FINDINGS

- [LOW] `docs/specs/03_base_classes.md:149` — the TC-306 row says "that **overrides** `willUpdate`" without naming the syntax, while the guard implementing it can only see method declarations. A card written `override willUpdate = (c: PropertyValues): void => { … }` overrides the hook for real (with `useDefineForClassFields: false` the field assignment shadows the prototype method, so `super.willUpdate` never runs) and passes in silence — `tsc` exit 0, 13 cases passed, measured. The clause promises a coverage the mechanism cannot deliver, which is the shape of claim this lot exists to remove.
  Fix: one sentence scoping the tree-wide half to method declarations, and a bead for the two shapes left outside (class-field override, intermediate subclass).
  ⚠ FOURTH round on ROOT TC-306 (round 1: `: void`; round 4: the `override` keyword; round 5: the clause unchecked; round 6: two shapes outside the pattern's reach). A regex over source text has no closed set of evasions, so each round can produce one more true finding without the invariant becoming true. Do not patch the pattern a fifth time: bound the claim, or put the approach question to the user.
  RESOLUTION: fixed — la clause est bornée au lieu d'élargir le motif une cinquième fois. `docs/specs/03_base_classes.md` TC-306 scope désormais explicitement la moitié tree-wide aux **déclarations de méthode** dans les fichiers portant littéralement `extends SciFiBaseCard`, nomme le bead `ha-sci-fi-2t4` pour les deux formes hors portée (champ-flèche et sous-classe intermédiaire), et distingue les deux propriétés (le mot-clé par `noImplicitOverride`, l'appel `super` par le garde) en disant pourquoi l'un ne remplace pas l'autre. La forme (c) a aussi été filée dans ce bead, comme le relecteur le prescrivait, plutôt que d'élargir la portée du garde.

### MUTATIONS

MUTATION: sci-fi-plugs drops super.willUpdate(changedProperties) — KILLED by tests/utils/base-card.test.ts "TC-306: every SciFiBaseCard subclass overriding willUpdate calls super first"; replayed with the `override` keyword KEPT, so the compiler still sees nothing (tsc exit 0): 1 failed / 1163 passed, naming `cards/plugs/sci-fi-plugs.ts`
MUTATION: a NEW `extends SciFiBaseCard` card omits both `: void` and `super.willUpdate` — KILLED by the same case; replayed by ADDING a probe card with the keyword present and no `: void` (it compiles, tsc exit 0): 1 failed / 12 passed, the probe named
MUTATION: a NEW `extends SciFiBaseCard` card declares `willUpdate` WITHOUT the `override` keyword and without `super.willUpdate` — KILLED TWICE: by tsc (TS4114, exit 2) AND by the walk, whose `(?:override\s+)?` makes the keyword optional: 1 failed / 12 passed
MUTATION: `super.willUpdate(changedProperties)` moved out of first position in src/cards/plugs/sci-fi-plugs.ts — KILLED by the same case: tsc exit 0, 1 failed / 12 passed. The "first statement" half bites, not only the call's presence
MUTATION: `"noImplicitOverride": true` deleted from tsconfig.json — KILLED by "TC-306: noImplicitOverride stays on, so the walk above cannot lose its anchor"

Two probes delimiting the mechanism's reach, reported as probes and not ledger mutants: a card extending an INTERMEDIATE subclass declared in another file (tsc exit 0, 13 passed) and a class-FIELD arrow override (tsc exit 0, 13 passed) both pass in silence. Both are filed as `ha-sci-fi-2t4`.

### NOTES

- The HIGH is closed the right way round: both properties carried by the mechanism that can carry them — `tsconfig.json` for the keyword, the walk for the super call — and the comment records which is which, so the next author cannot repeat round 5's trade. The narrow second case is correctly retitled: it guards the walk's PRECONDITION.
- The author's `declared` correction is right and the equality is what caught it (10 counted for 5 declarations). `(?<![.\w])willUpdate\s*\(` counts 5 in a tree with 5 declarations and 5 super calls; no declaration form is dropped by the lookbehind.
- Brittleness, NOT a defect because it can only fail loudly: a prose comment mentioning `willUpdate(` in a card file makes the counts disagree and reddens TC-306 on correct code. The pattern is strictly narrower than the search, so the case can never pass by matching nothing.
- The MEDIUM is closed: the rewritten `[!NOTE]` is true line by line against `src/cards/bridge/styles.ts:105-110`.
- OUT-OF-DELTA, repeated so it is not lost: `sci-fi-water-management-editor.ts:38` logs and continues on a swallowed registry failure; `:73` casts through `(this.hass as any).callWS`. Filed as `ha-sci-fi-uvk`.
- No security surface in this delta.

### Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 0 | pass |
| LOW | 1 | closed by bounding the claim |

VERDICT: APPROVE
AUDITOR: subagent
