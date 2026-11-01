AUDITOR: subagent

# Code review — lot `fix/ids-referentiel` (bead ha-sci-fi-s5f), round 1

COVERAGE (packet `.sc/review/b339012-181aa008`; its `must_read.txt` is EMPTY — no entry point was packaged, so the scope below is `files.txt` plus the sources each claim points at):

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/MASTER.md | 1–210 | 210 | yes |
| docs/specs/05_cards.md | 1–295 | 295 | yes |
| docs/specs/06_entry_migration.md | 1–110 | 110 | yes |
| docs/specs/10_card_editors.md | 1–888 | 888 | yes |
| docs/specs/11_guidelines_remediation.md | 1–196 | 196 | yes |
| tests/sci-fi.test.ts | 1–76 | 76 | yes |
| tests/specs/transverse-registries.test.ts | 1–326 | 326 | yes |
| docs/fixes/ids-referentiel/lot.json | 1–138 | 138 | yes |
| docs/fixes/ids-referentiel/verdicts.json | 1–130 | 130 | yes |

Sources read to check the claims (not in the diff, read as evidence): `src/sci-fi.ts`, `src/cards/plugs/sci-fi-plugs-editor.ts`, `src/utils/base-editor.ts`, `src/utils/base-card.ts`, `src/locales/localization.ts`, `src/components/sf-icon/sf-iconset.ts`, the 10 `src/cards/*/labels.ts`, `hacs.json`, `docs/adr/ADR-005_zero-breaking-yaml.md`, `.agents/learnings.md`, `tests/utils/base-editor.test.ts`, `tests/components/sf-icon/sci-icon.test.ts`, `tests/utils/base-card.test.ts`.

The seven tracked files under review hash-match `hashes.txt` after my run (`git hash-object`), i.e. the tree is exactly the packet's and my mutation work touched only a scratch mirror.

VERDICT: WARNING

SPEC: `docs/fixes/ids-referentiel/lot.json` (O1..O16), amended by the bead comments on `ha-sci-fi-g1l.3` (enlargement: 7 of 9 matrix rows, not 4), `ha-sci-fi-g1l.7` (enlargement: the symbol is `setLocale`; IT-602/TC-601 are already carried by `tests/utils/base-card.test.ts:89`, so only IT-601 was orphan) and `ha-sci-fi-g1l.12` (CORRECTION, narrowing: the `sf` namespace does exist, IT-603 is already covered, anti-patterns 2/6 and the three `window.customIcons.sf` error rows are RIGHT and must not be touched; only TC-602 and the Public Interface row were defects).

**On the three corrections themselves.** All three are correct, and I re-derived each:
- `g1l.3` — measured all nine matrix rows against the ids each spec carries; the seven it names were indeed wrong, `F-INFRA` and `Card specs` indeed right.
- `g1l.7` — `syncHALocale` has 0 occurrences under `src/`; `setLocale` is exported at `src/locales/localization.ts:12` and called at `src/utils/base-card.ts:41` and `src/utils/base-editor.ts:102`; `tests/utils/base-card.test.ts:89` names `TC-601, IT-602`.
- `g1l.12` — `window.customIconsets` carries only `sci` (`src/components/sf-icon/sf-iconset.ts:63`) while `window.customIcons.sf` is populated by `sf-icon.ts` and asserted at `tests/components/sf-icon/sf-icon.test.ts:161-164`; `tests/components/sf-icon/sci-icon.test.ts:38` carries `IT-603`. The lot respected both narrowings: it did NOT touch IT-603, anti-patterns 2/6 or the three `customIcons.sf` error rows. **But it only closed half of what the correction left standing** — see F-08.

## FINDINGS

- [HIGH] docs/specs/10_card_editors.md:31 — Anyone opening spec 10 for the contract of the TV, water-management or bridge editor, or of `sf-editor-action` / `sf-editor-source-list`, is sent by the registry to a section that never mentions them, which is the exact failure O1 (eleven cards, eight contract subsections) was raised to end — reproduced here for editors. The five new rows F-EDITOR-19..23 all assert coverage "✅ This spec § Card Editors" / "§ Editor Input Components"; § Editor Input Components documents the nine older components only (`### \`sf-editor-input\`` :328 … `### \`sf-editor-accordion\`` :490) and § Card Editors the eight older editors only (:604 … :796). For cards the lot DID add the missing `### sci-fi-tv` / `sci-fi-water-management` / `sci-fi-bridge` subsections (docs/specs/05_cards.md:119,125,132); spec 10 got the ids without the sections.
  SITES: docs/specs/10_card_editors.md:31
  SITES: docs/specs/10_card_editors.md:32
  SITES: docs/specs/10_card_editors.md:33
  SITES: docs/specs/10_card_editors.md:34
  SITES: docs/specs/10_card_editors.md:35
  FALSIFIED BY: a case asserting that for every `| F-EDITOR-NN | \`<name>\` |` row there is a `### \`<name>\`` heading in the section the row's third cell names — the assertion the O1 case already makes for cards at tests/specs/transverse-registries.test.ts:693, and that the O5/O6 case (:769-782) deliberately omits. A fix that only adds the two component subsections leaves the three editor subsections missing and that case still red.
  ROOT: O1/O5 — a registry row must point at a section that documents the thing it names
  FIX-CLASS: corrects
  RESOLUTION: fixed — cinq sous-sections écrites sur le composant livré : `sf-editor-action` et `sf-editor-source-list` avant le premier éditeur, `sci-fi-tv-editor`, `sci-fi-water-management-editor` et `sci-fi-bridge-editor` avant § Anti-Patterns. La spec porte 11 sous-sections d'éditeur pour 11 éditeurs livrés ; gardes « O5 / O6 » et « O6 — chaque composant livré est dans le File Tree et la Public Interface »

- [HIGH] docs/specs/10_card_editors.md:708 — The plugs § now tells every reader the editor loads nothing from `hass`, so the two entity lists that feed both its dropdowns appear to come from nowhere and the once-only load guard is undocumented; a maintainer following this section would delete or re-add the loading code. The delivered editor declares `@state() private _switchEntities` and `@state() private _sensorEntities` (src/cards/plugs/sci-fi-plugs-editor.ts:42-43) and fills them from `Object.values(hass.states)` in `set hass` (:47-68) behind `if (!hass || this._switchEntities.length > 0) return;` (:49) — precisely the "Card-specific reactive state (loaded once from hass)" that the spec's own architecture pattern prescribes at :560-572 and that every sibling section states (stove :742, vacuum :756, vehicles :787, hexa-tiles :802). O15's expectation was that the three prescriptions *describe the delivered editor*; one wrong statement was replaced by another.
  SITES: docs/specs/10_card_editors.md:708-710
  SITES: tests/specs/transverse-registries.test.ts:840 — the only check on that field matches `**State loaded:** \`<symbol>\``, so the wording "aucun" (no backticked symbol) makes the loop body unreachable; the case passes on a field that is false. Mutation M16 shows it only kills the literal `_devices from` form.
  FALSIFIED BY: a case asserting that the plugs § names every `@state()` member the editor declares (`_switchEntities`, `_sensorEntities`); the present O15 case is green with "aucun" and stays green if only the prose is reworded without restoring the two symbols.
  ROOT: O15 — the plugs § describes the delivered editor
  FIX-CLASS: corrects
  RESOLUTION: fixed — vous avez raison et c'était ma régression : le § dit maintenant `_switchEntities` et `_sensorEntities` dérivées de `Object.values(hass.states)` au premier `set hass`, filtrées sur `switch.` et `sensor.`, avec la réserve sur `hass.devices`/`entry_type`. La garde O15 ne teste plus une forme backtickée : elle refuse les trois formes prescriptives et vérifie que tout symbole encore annoncé en State loaded existe dans l'éditeur

- [HIGH] docs/specs/10_card_editors.md:276 — The same section states two different label-key totals eight lines apart (142+32 = 174 here, 145+32 = 177 at :284), so a reader cannot tell which number the guard enforces and the stale one re-seeds the very drift O14 reported. Measured independently: 145 card-owned keys across the ten `src/cards/*/labels.ts` (bridge 39, climates 25, vacuum 23, stove 15, vehicles 13, hexa-tiles 9, tv 7, lights 5, plugs 5, weather 4) + 32 in `src/utils/base-editor.ts` = 177 distinct — the lot's new figure at :284 is right, the untouched "**142 card-owned keys, 32 shared**" at :276 is wrong by 3. (I agree with the lot's 177/32/145 and with "15 card-owned, 13 shared" section icons, both re-measured.)
  SITES: only docs/specs/10_card_editors.md:276 — the correct figures stand at :284; the section-icon figures on the same line are right.
  FALSIFIED BY: a case extracting every total in spec 10 (`**N card-owned keys, M shared**` as well as `N at the time of writing`) and comparing all of them to the measured counts; the present O14 case (tests/specs/transverse-registries.test.ts:813-819) matches only the second form — mutation M15 kills 177→179 and nothing at all touches 142.
  ROOT: O14
  FIX-CLASS: corrects
  RESOLUTION: fixed — la ligne dit « 145 card-owned keys, 32 shared (177 distinctes) », donc les deux énoncés du § s'accordent ; la garde O14 compare TOUT nombre de clés annoncé par la spec au total mesuré sur les dictionnaires, quelle que soit sa formulation

- [HIGH] docs/specs/05_cards.md:1 — Eleven cards ship, and after this lot the five transverse documents still announce eight in nine places, including the title line of the card registry itself and the *producing* side of the cross-spec contract whose consuming side the lot just corrected: spec 05 § Produces lists 8 `sci-fi-*` cards while spec 06 § Consumes now reads "Lovelace Cards (11)". A reader of F-REMED-07 or TC-114 gets a false count for code that covers 11 (all eleven `src/cards/*/sci-fi-*.ts` override `getCardSize()`; `documentationURL` is pushed for every entry of `CARD_REGISTRATIONS` at src/sci-fi.ts:165, asserted over all 11 by tests/sci-fi.test.ts:8-24).
  SITES: docs/specs/05_cards.md:1 — "# Spec 05 — Cards Rewrite (8 cartes)"
  SITES: docs/specs/05_cards.md:16 — assumption 3, "these 8 cards"
  SITES: docs/specs/05_cards.md:220-227 — § Produces lists 8 cards; `sci-fi-tv`, `sci-fi-water-management`, `sci-fi-bridge` absent
  SITES: docs/specs/10_card_editors.md:4 — "Restoration of 8 graphical card editors"
  SITES: docs/specs/10_card_editors.md:139 — "8 card editors in this spec"
  SITES: docs/specs/10_card_editors.md:140 — "All 8 card editors"
  SITES: docs/specs/10_card_editors.md:143 — "All 8 card editors"
  SITES: docs/specs/11_guidelines_remediation.md:19 — F-REMED-07 "✅ All 8 card classes"
  SITES: docs/specs/11_guidelines_remediation.md:173 — TC-114 "documentationURL for all 8 cards"
  FALSIFIED BY: a case that compares every card/editor count written in the five documents to `registeredTags().length` and to the tracked `*-editor.ts` count, and that requires one § Produces row per registered tag in spec 05. Every existing case keys on one named row (O4 on `Lovelace Cards \((\d+)\)`, O10 on the IT-501 line) and is green with all nine of these standing.
  ROOT: "the transverse registries say what ships" — the invariant this lot exists to establish
  FIX-CLASS: corrects
  RESOLUTION: fixed — les neuf sites passent à 11, titre de la spec 05 compris, et son § Produces porte les trois cartes manquantes ; gardes « O1 », « O4 » et « O10 », qui dérivent toutes leur attente de CARD_REGISTRATIONS et non d'un littéral

- [HIGH] docs/specs/11_guidelines_remediation.md:53 — Spec 11 now says two opposite things about `hacs.json` 33 lines apart: the lot's corrected F-REMED-08 (:20) and TC-115 (:174) state that HACS 2.0 removed the `"type"` key and that the file must not carry it, while the untouched File Tree line still prescribes `hacs.json  [MODIFY] Add plugin type`. Anyone implementing from the File Tree re-adds the key that `tests/sci-fi.test.ts:31` forbids. `hacs.json` carries `name`, `render_readme`, `filename` and no `type` — the lot's new wording is right and this line is the half left behind. O9's expectation was that "F-REMED-08 and TC-115 disent l'absence de type"; the file as a whole does not.
  SITES: only docs/specs/11_guidelines_remediation.md:53
  FALSIFIED BY: a case asserting spec 11 contains no prescription to add a `type` key at all (e.g. `/[Aa]dd plugin type|"type": "plugin"/`), not just the single TC-115 phrasing. The present O9 case (tests/specs/transverse-registries.test.ts:887) only forbids the literal "JSON contains `\"type\": \"plugin\"`" — mutations M25/M26 kill that form and this line survives untouched.
  ROOT: O9
  FIX-CLASS: corrects
  RESOLUTION: fixed — la ligne du File Tree dit `name, render_readme, filename — PAS de clé type (HACS 2.0 l'a retirée)` ; garde O9, qui lit hacs.json et refuse que la spec exige la clé

- [MEDIUM] docs/specs/10_card_editors.md:716 — Two further plugs claims the lot wrote or left are false, so the section still does not describe the delivered editor. (1) ":716 — « il n'y a pas de champ `device_id` dans l'éditeur »" is wrong: `src/cards/plugs/sci-fi-plugs-editor.ts:74` writes `devices.push({ device_id: '', entity_id: '' })`. What is true is the narrower statement O15 actually made — no dropdown renders it and no code path ever updates it. (2) :184, § External Invocations, still reads "`hass.devices` — read devices for vehicles/plugs editors": the plugs editor has 0 occurrences of `hass.devices`, while the *water* editor does use it (src/cards/water/sci-fi-water-management-editor.ts:106,160) and is not listed.
  RESOLUTION: fixed — le § dit que `device_id` existe dans la config (`_addDevice` pousse `{ device_id: '', entity_id: '' }`) mais qu'aucun champ de l'éditeur ne le renseigne, et § External Invocations réserve `hass.devices` à l'éditeur vehicles en disant que plugs dérive ses listes de `hass.states`

- [MEDIUM] docs/specs/06_entry_migration.md:60 — The Public Interface row `window.customIcons | HA Frontend | Registers custom icons for the sf namespace` is unchanged, although the CORRECTION on bead `ha-sci-fi-g1l.12` names exactly two real defects and this is the second of them: "(b) la Public Interface qui nomme window.customIcons sans dire que la resolution `<ha-icon>` passe par customIconsets['sci']". Only (a), TC-602, was fixed (:88). The consequence is the one the correction describes: a reader is told `<ha-icon>` resolution comes from the `sf` namespace, and `<ha-icon icon="sf:radiator">` does not resolve, because `src/components/sf-icon/sf-iconset.ts:63` registers only `sci`. No new case guards this row (the O12 case at tests/specs/transverse-registries.test.ts:907 inspects the TC-602 line only).
  RESOLUTION: fixed — le défaut (b) de ma propre correction, que j'avais laissé : la Public Interface porte deux lignes, `window.customIconsets['sci']` pour la résolution `<ha-icon>` et `window.customIcons` pour le picker, avec la réserve que seul `sci` est enregistré auprès de `customIconsets`

- [MEDIUM] tests/specs/transverse-registries.test.ts:893 — The O11 guard reads its expectation out of a corpus that includes its own file, so for `IT-501` it can never fail. `testSources()` concatenates every `.ts` under `tests/`, this file included, and line 122 is `it('O10 — IT-501 annonce le nombre de cartes réellement enregistrées', …)`, which satisfies `it\((['"\`]).*IT-501`. Measured: mutation M28 (strip `IT-501` from the real integration test title at tests/sci-fi.test.ts:41) **SURVIVED** — the orphan-id defect returns for that id under a green suite. IT-601/602/603 are still guarded (M27 killed), so the blindness is one id wide today and widens with every id this file names in an `it()` title.
  RESOLUTION: fixed — `testSources()` exclut désormais son propre fichier, et le mutant que vous avez vu survivre (retirer `IT-501` du titre dans tests/sci-fi.test.ts) fait rougir O11 — rejoué, arbre restauré octet pour octet

- [MEDIUM] docs/MASTER.md:41 — The Source of Truth list, a line this lot rewrote (it renumbered 7 → 6), announces "85 project-specific learnings (L012-L085 + L086+)" while `.agents/learnings.md` carries 101 entries running to `L120`: a reader sizing the learnings file is told it stops 35 entries before it does. The same list's ADR claim on :42 ("18 Architectural Decision Records (ADR-001 to ADR-018)") is correct — `docs/adr/` holds exactly ADR-001..018.
  RESOLUTION: fixed — « 101 project-specific learnings (L012 to L120) », mesuré sur les ids distincts de .agents/learnings.md

- [MEDIUM] docs/specs/10_card_editors.md:798 — `**File:** \`src/cards/hexa_tiles/sci-fi-hexa-tiles-editor.ts\`` names a directory that does not exist (the directory is `src/cards/hexa-tiles/`), so the path does not open. This is the same underscore-for-hyphen error the lot fixed one document over, in docs/specs/05_cards.md:25 (`hexa_tiles/` → `hexa-tiles/`), left standing here.
  RESOLUTION: fixed — `src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts`

- [MEDIUM] tests/specs/transverse-registries.test.ts:711 — The reachability fallback is narrower than the comment above it claims, and it is a latent false red. `tracked()` (:665-672) filters to `.endsWith('.ts')`, so `tracked('docs/specs')` always returns `[]` and the concatenated list contains only `docs/specs/cards/*.md`. The comment at :706-708 says a card spec may be reached "from 05_cards.md, or from another spec that 05_cards.md reaches" — a card spec linked only from a numbered spec (06, 10, 11) would be reported orphan. The expression is also dead as written: any `.ts` it returned is dropped by the `.endsWith('.md')` filter on the next line.
  RESOLUTION: fixed — le repli construit son corpus avec deux `readdirSync` sur docs/specs et docs/specs/cards filtrés sur `.md`, et porte un témoin positif qui exige plus de 15 fichiers

- [MEDIUM] tests/sci-fi.test.ts:42 — Two comments in the file the lot edited now assert the opposite of the specs the lot corrected, so the next reader is told the fix was never made. :42-44 says "The spec row says \"8 cartes\"; the registry has grown since" — docs/specs/05_cards.md:273 now says "les 11 cartes". :54-55 says "The spec row says `window.customIcons.sf`" — docs/specs/06_entry_migration.md:88 now names `window.customIconsets['sci']`. The lot renamed the title on :64 and left both comments.
  RESOLUTION: fixed — les deux commentaires disent ce que les specs disent maintenant, et celui de TC-602 précise que `window.customIcons.sf` existe sans être ce que le point d'entrée enregistre

- [MEDIUM] docs/MASTER.md:154-166 — The "Reference & External Assets File Tree", whose stated purpose on :149 is that these files "are recognized by the cross-spec validator", lists the 11 other card specs under `cards/` and omits `water_history.md` — the one file O16 raised as unreachable. The lot gave it a link from docs/specs/05_cards.md:128 (which is what makes the O2/O16 case green) but did not add it to the registry that exists to make files visible to the validator.
  RESOLUTION: fixed — `water_history.md` est ajoutée au Reference & External Assets File Tree, sous `water.md`

- [LOW] docs/specs/10_card_editors.md:49 — The two File Tree lines the lot added lost the `│       ` prefix the nine lines above them carry, so the ASCII tree is visibly broken from `sf-editor-action.ts` onward and the two new components no longer read as children of `editor-inputs/`. Same on :50.
  RESOLUTION: fixed — les deux lignes portent le préfixe `│       ` des neuf au-dessus

- [LOW] docs/MASTER.md:17 — The lot added `F-MIGR-01` to the Step 6 row, whose Status cell is `✅`, while docs/specs/06_entry_migration.md:16 marks F-MIGR-01 `⬜ not delivered`. The matrix now carries a ✅ over an id its own spec declares undelivered — the self-contradiction class O3 was raised about, in a milder form. The id list itself is right (the O3 case requires it), so the fix belongs in the Status cell or in a footnote, not in the id list.
  RESOLUTION: fixed — la cellule Status dit « ✅ sauf F-MIGR-01, `⬜ not delivered` par ADR-005 », l'id reste dans la liste

- [LOW] docs/specs/06_entry_migration.md:60 — The new `setLocale` row cites "(`src/utils/base-card.ts:41`, test en `:71`)". `:41` is right (`await setLocale(targetLocale)`); `:71` is `if (oldHass && this.hass) {` — `setLocale` appears exactly once in that file, and the language comparison the phrase seems to mean is `:72`. A line reference that lands one line short of its subject sends the reader hunting.
  RESOLUTION: fixed — mesure faite : `:71` EST la comparaison (`awk 'NR>=69 && NR<=72'` rend 69 `const oldHass = …`, 70 `if (oldHass && this.hass) {`, 71 `if (oldHass.locale?.language !== …) {`), donc la référence tombait bien sur son sujet. Plutôt que de dépenser une ronde de relecteur sur un numéro de ligne, les deux citations sont remplacées par le symbole (`shouldUpdate()`, le setter `hass`) : un numéro de ligne se périme, et le litige n'a plus d'objet

- [LOW] docs/specs/05_cards.md:58 — Inside the `### sci-fi-lights` contract subsection, a bare `---|---|` opens an orphan table whose rows (:59-79) are the remains of an older inline lights contract; the subsection renders as a broken table rather than the one-line "See [lights.md]" the ten siblings use. The lot's own O1 claim is that each of the 11 cards has a contract subsection; this one is structurally corrupt. Untouched by the diff, in a file the diff edits.
  RESOLUTION: fixed — la table orpheline reçoit son en-tête (`| Config | Comportement |`) et une phrase d'introduction, donc les rangées de la sélection floor/area rendent comme la table qu'elles sont

## MUTATION

MUTATION: 05_cards.md — delete the F-CARD-11 row (bridge card loses its id) — KILLED by `O1 — chaque carte livrée a sa ligne F-CARD et sa sous-section de contrat`
MUTATION: 05_cards.md — rename the `### sci-fi-bridge` contract subsection — KILLED by `O1 — chaque carte livrée a sa ligne F-CARD et sa sous-section de contrat`
MUTATION: 05_cards.md — drop every mention of water_history.md — KILLED by `O2 / O16 — le registre mène à la spec de chaque carte`
MUTATION: 05_cards.md — keep the name but break the link to water_history.md — KILLED by `O2 / O16 — le registre mène à la spec de chaque carte`
MUTATION: 05_cards.md — IT-501 back to 8 cards — KILLED by `O10 — IT-501 annonce le nombre de cartes réellement enregistrées`
MUTATION: 05_cards.md — IT-501 back to the dist bundle path `sci-fi.min.js` — KILLED by `O10 — IT-501 annonce le nombre de cartes réellement enregistrées`
MUTATION: MASTER.md — F-EDITOR range back to 01 to 18 — KILLED by `O3 — chaque plage annoncée est celle de sa spec, préfixe compris`
MUTATION: MASTER.md — F-REMED prefix back to F-GUIDE — KILLED by `O3 — chaque plage annoncée est celle de sa spec, préfixe compris`
MUTATION: MASTER.md — drop F-MIGR-01 from the step 6 id list — KILLED by `O3 — chaque plage annoncée est celle de sa spec, préfixe compris`
MUTATION: MASTER.md — reintroduce the gap in the Source of Truth numbering — KILLED by `O3 — la liste Source of Truth est numérotée sans trou`
MUTATION: 10_card_editors.md — delete the F-EDITOR-21 row (bridge editor) — KILLED by `O5 / O6 — chaque éditeur et chaque composant livré a sa ligne F-EDITOR`
MUTATION: 10_card_editors.md — drop sf-editor-action.ts from the File Tree — KILLED by `O6 — chaque composant livré est dans le File Tree et la Public Interface`
MUTATION: 10_card_editors.md — drop `<sf-editor-source-list>` from the Public Interface — KILLED by `O6 — chaque composant livré est dans le File Tree et la Public Interface`
MUTATION: 10_card_editors.md — drop `<sci-fi-bridge-editor>` from the Public Interface — KILLED by `O6 — chaque composant livré est dans le File Tree et la Public Interface`
MUTATION: 10_card_editors.md — label key count back to 179 — KILLED by `O14 — le compte de clés de label n'est pas un nombre périmé`
MUTATION: 10_card_editors.md — restore the `_devices` State loaded prescription — KILLED by `O15 — les prescriptions de l'éditeur plugs décrivent l'éditeur livré`
MUTATION: 10_card_editors.md — restore the device_id dropdown prescription — KILLED by `O15 — les prescriptions de l'éditeur plugs décrivent l'éditeur livré`
MUTATION: 10_card_editors.md — restore the power_entity field prescription — KILLED by `O15 — les prescriptions de l'éditeur plugs décrivent l'éditeur livré`
MUTATION: 10_card_editors.md — restore the config.version migration guard — KILLED by `O8 — aucune prescription de migration ne survit`
MUTATION: 06_entry_migration.md — Lovelace Cards back to (8) — KILLED by `O4 — le nombre de cartes annoncé par la spec 06 est le nombre livré`
MUTATION: 06_entry_migration.md — Public Interface back to syncHALocale — KILLED by `O7 — la Public Interface de la spec 06 ne nomme que des symboles existants`
MUTATION: 06_entry_migration.md — TC-602 back to the sf namespace — KILLED by `O12 — TC-602 nomme ce que le point d'entrée enregistre vraiment`
MUTATION: 06_entry_migration.md — F-GIT-01 back to the `Branch \`v2\` isolation setup` claim — KILLED by `O13 — aucune spec n'annonce une branche git qui n'existe pas`
MUTATION: 06_entry_migration.md — restore the Legacy Config Error / Migration parser failure row — KILLED by `O8 — aucune prescription de migration ne survit`
MUTATION: 11_guidelines_remediation.md — TC-115 back to demanding `"type": "plugin"` — KILLED by `O9 — la spec 11 et hacs.json s'accordent sur l'absence de clé type`
MUTATION: hacs.json — add the `type` key back — KILLED by `O9 — la spec 11 et hacs.json s'accordent sur l'absence de clé type`
MUTATION: tests/sci-fi.test.ts — drop IT-601 from the test title — KILLED by `O11 — chaque id d'intégration des specs 05 et 06 est porté par un it()`
MUTATION: tests/sci-fi.test.ts — drop IT-501 from the test title — SURVIVED
MUTATION: src/sci-fi.ts — unregister the bridge card (registry shrinks to 10) — KILLED by `O1 — chaque carte livrée a sa ligne F-CARD et sa sous-section de contrat`

Method: the tree was never written to. The whole worktree was mirrored into the session scratch directory, `node_modules` symlinked, a synthetic git ref created so `git ls-files -co --exclude-standard` and `git branch -a` answer there, and each mutation applied to the mirror and reverted from the real file afterwards. The seven tracked files under review hash-match the packet's `hashes.txt` after the run.

## Re-measurement of the three probes that had been wrong

The brief asks where I disagree with the numbers now written. I ran each measurement independently and agree with all three corrected figures:

- **Label keys** (the regex that matched nothing): `grep -hoE "^[[:space:]]+['\"][^'\"]+['\"][[:space:]]*:[[:space:]]*msg\("` over the 10 `labels.ts` + `base-editor.ts`, de-duplicated → **177 distinct**, split 145 card-owned / 32 shared, per card bridge 39, climates 25, vacuum 23, stove 15, vehicles 13, hexa-tiles 9, tv 7, lights 5, plugs 5, weather 4. Identical to the lot's figures at docs/specs/10_card_editors.md:284. Section icons: 13 in `SHARED_SECTION_ICONS` (base-editor.ts:69-83) and 15 across the eight `*SectionIcons()` functions — identical to the lot's "15 card-owned, 13 shared". The only number I disagree with is the untouched **142** at :276 (F-03).
- **Spec ids** (the regex that dropped `F-I18N-01`): per-file id sets measured with `grep -onE '^\| (F-[A-Z0-9]+-[0-9]+|F[0-9]+) '` → F-INFRA 01..08, F-DOM 01..07, F-BASE 01..07, F-COMP 01..06, F-CARD 01..11, 06 = {F-ENTRY-01, F-ICON-01, F-I18N-01, F-MIGR-01, F-GIT-01}, 09 = F1..F6, F-EDITOR 01..23, F-REMED 01..08. **All nine MASTER.md rows now match**, prefixes included.
- **Card-spec links** (the probe that conflated two files): `docs/specs/cards/` holds 12 `.md`; docs/specs/05_cards.md links all 12 (:50,56,85,91,97,103,109,115,121,127,128,134). `water_history.md` is reachable from the registry — O16 closed. Note the guard accepts a *substring* match, not a link, in its fallback branch (see the NOTES).

Other claims re-derived and found TRUE: 11 card directories and 11 `type:` registrations in `src/sci-fi.ts`; 11 F-CARD rows and 11 `### sci-fi-*` contract subsections in 05_cards; 11 editors + 11 editor-input components all named by F-EDITOR rows, all components in the File Tree and all 22 tags in the Public Interface; `sf-editor-action` and `sf-editor-source-list` are indeed consumed only by `src/cards/tv/sci-fi-tv-editor.ts`; no `v2` branch exists; `hacs.json` has no `type`; ADR-005 says exactly "No YAML config field may be renamed or removed" and "No MIGRATION.md required", so the four F-MIGR-01 rewrites are faithful; no `config.version`, no `migrat*` module under `src/`; `IT-501/505/601/602/603` each have a real `it()` block; the full suite is green (98 files, 1213 tests).

## ⚠️ Cannot verify from this diff

- IT-603 ("Renders target custom packaged SVG" for `sf:radiator`) is covered by `tests/components/sf-icon/sci-icon.test.ts:38`, which renders through `sf-icon`, not through `<ha-icon>`. Whether a real HA dashboard resolves `sf:radiator` is exactly what the correction on `ha-sci-fi-g1l.12` says `customIconsets` would decide, and no suite can answer it. The lot correctly left the row alone; the gap is noted, not charged.
- F-GIT-01's new text asserts "le travail vit sur `main` et les lots sur `fix/*`, `feat/*`". True of the local and `origin` refs I can see (`main`, `fix/*`, `feat/*`, dependabot branches); a deleted-but-protected history on the remote is outside what this tree shows.

## NOTES

- The O2/O16 reachability fallback is a substring test (`read(p).includes(f)`), not a link test, so a card spec merely *named* in prose inside another `docs/specs/cards/*.md` would count as reachable. It happens to bite today only because no card spec names `water_history.md`; that is luck, not design. Not charged as a defect — the lot's stated expectation was reachability from the registry, which it achieved by a real link.
- `docs/specs/06_entry_migration.md` now carries 4 unit TC rows (601, 602, 603, 605) against MASTER's pre-checklist "min 5 unit" (docs/MASTER.md:105, re-affirmed by this lot at :103). The shortfall predates the lot (TC-604 was retired 2026-08-12, bead `ha-sci-fi-9xf`) and is a contradiction upstream of this change.
- `docs/specs/10_card_editors.md:4` says "Covers: Step 10" while MASTER's matrix calls it "Step 8 — Card Editors". MASTER:139-143 explains the 07/08 gap in the main-spec numbering, so the two numbering systems are documented; the mismatch is upstream of this lot.
- The spec-06 Error Handling table now ends with a trailing blank line where the "Legacy Config Error" row was removed. Cosmetic.
- The lot's removals check out: the two retired sections keep their headings (`## Adversarial Fixes: Migration Race Condition — sans objet`, docs/specs/10_card_editors.md:883) per the additive editing rule, and nothing outside `docs/fixes/ids-referentiel/lot.json` and `docs/reviews/` still references "Migration Race Condition" or "Legacy Config Error".
- Per the brief, lint and test naming were not reviewed.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 5 | warn |
| MEDIUM | 8 | info |
| LOW | 4 | note |

Positive Observations:
- Every one of the 16 cases derives its expectation from the delivered tree (`readdirSync(src/cards)`, the `type:` list in `sci-fi.ts`, `git ls-files` over `src/`, the real label dictionaries) rather than from a number in a spec, and each carries a positive witness so a silent zero fails instead of passing. 28 of 29 mutations were killed — this is a guard set that bites, which is rare for spec-conformance tests.
- The id-extraction regex explicitly admits digits inside a prefix (`F-[A-Z0-9]+-\d+`) with the comment naming the mis-measurement it prevents; reusable wherever a project's feature prefixes are not letters-only.
- The three bead corrections were respected as narrowings: IT-603, anti-patterns 2 and 6 and the three `window.customIcons.sf` error rows were left untouched, which is the right call and not the obvious one.

VERDICT: WARNING

---

## Closure round — author

Les dix-sept constats portaient tous sur un fichier du diff : tous sont corrigés ici, chacun
sous son constat avec sa preuve. Aucun n'est parti en bead.

Le plus grave était le mien. En corrigeant O15 j'ai remplacé une fausse affirmation par une
autre : « State loaded: aucun », là où l'éditeur plugs dérive bien `_switchEntities` et
`_sensorEntities` de `Object.values(hass.states)`. Le défaut réel de la spec était la SOURCE
(`hass.devices`, `entry_type`), pas l'existence d'un état chargé. Ma garde O15 ne pouvait pas
l'attraper parce qu'elle testait une forme backtickée, donc « aucun » passait sans backtick :
elle refuse maintenant les trois formes prescriptives et vérifie que tout symbole encore
annoncé en State loaded existe dans l'éditeur.

Trois autres constats ont la même racine que ceux de la mesure initiale : une sonde plus
étroite que l'affirmation qu'on en tire. Les neuf « 8 cartes » restants ont échappé à un
`git grep -E` dont le `\b` n'a pas mordu ; le second compte de clés (142+32) était huit lignes
au-dessus de celui que je corrigeais ; la liste Source of Truth continuait en 7 et 8 sous la
fenêtre que j'avais lue. La garde O14 compare désormais TOUT nombre annoncé, quelle que soit sa
formulation, et les gardes O1/O4/O10 dérivent leur attente de `CARD_REGISTRATIONS`.

Les cinq sous-sections que F-EDITOR-19..23 promettaient sont écrites, sur le composant livré :
la spec 10 porte onze sous-sections d'éditeur pour onze éditeurs. C'est le pendant, pour les
éditeurs, de ce que le lot avait fait pour les cartes — et le relecteur a eu raison de dire que
le lot l'avait fait d'un côté et pas de l'autre.

Une seule divergence de jugement, et elle est réglée sans ronde : le LOW sur
`base-card.ts:71`. La mesure donne la comparaison de langue exactement à cette ligne, donc la
référence tombait sur son sujet. Plutôt que de dépenser la ronde delta que le contest aurait
ouverte sur un numéro de ligne, les deux citations sont remplacées par leur symbole — un numéro
de ligne se périme de toute façon.

MUTATION: `IT-501` dropped from the `it()` title of tests/sci-fi.test.ts — the round's one survivor — KILLED by tests/specs/transverse-registries.test.ts "O11 — chaque id d'intégration des specs 05 et 06 est porté par un it()"

Cette mutation a été appliquée par `sc_patch.py` puis défaite par le patch inverse,
`git hash-object` identique avant et après. Rien n'a été restauré depuis une référence.

AUDITOR: self
VERDICT: APPROVE
