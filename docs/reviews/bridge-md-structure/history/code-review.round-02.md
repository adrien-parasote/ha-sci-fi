AUDITOR: subagent

# Code review — lot `fix/bridge-md-structure` (bead ha-sci-fi-1b3), round 01

COVERAGE (one row per file in scope; the packet's `must_read.txt` is EMPTY — no entry point
was packaged, so the scope below is the packet's `files.txt` plus every source a spec claim
under review points at):

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/cards/bridge.md | 1–1624 | 1624 | yes |
| src/cards/bridge/config-metadata.ts | 1–14 | 14 | yes |
| tests/specs/bridge-spec-structure.test.ts | 1–243 | 243 | yes |
| docs/fixes/bridge-md-structure/lot.json | 1–114 | 114 | yes |
| docs/fixes/bridge-md-structure/verdicts.json | 1–102 | 102 | yes |
| tests/cards/bridge/sci-fi-bridge.test.ts | diff hunk + all 35 `it()` titles + fixtures 60–160, 320–486 | 486 | no (titles + diff region) |
| tests/cards/bridge/sci-fi-bridge-editor.test.ts | diff hunk + `call_kids` fixtures 50–130, 240–260, 490–515 | 833 | no (diff region) |
| src/cards/bridge/sections/sf-bridge-actions.ts | 1–122 | 122 | yes |
| src/cards/bridge/config.ts | 1–128 | 128 | yes |
| src/cards/bridge/bridge-call.ts | 1–50 | 50 | yes |
| src/cards/bridge/sci-fi-bridge.ts | 1–211 | 211 | yes |
| src/cards/bridge/styles.ts | 1–80 + the `full-width` / `Call Kids` regions | 765 | no (layout + full-width rules) |
| src/cards/bridge/sci-fi-bridge-editor.ts | 805–875 + every `input-icon-section` site (297, 437, 516, 613, 733, 784) | 891 | no (Actions + icon-section sites) |
| src/types/config.ts | 1–51 | 51 | yes |
| CHANGELOG.md | 1–90 | — | no (v1.3.x entries) |

VERDICT: BLOCK

SPEC: `docs/specs/cards/bridge.md`, judged against the lot register
`docs/fixes/bridge-md-structure/lot.json` (observations O1..O13) — the contract the orchestrator
named for this lot.

## FINDINGS

- [CRITICAL] docs/fixes/bridge-md-structure/lot.json O13 (`unreproduced` field) — the lot closes
  an observation as "defect not found" while the defect is live in the delivered spec and is
  returned by the very probe the register quotes; downstream (the bead, the fix gate, the next
  retrocheck) now believes a measurement that its own evidence refutes, and the duplication ships
  unfixed and uncovered. O13 (`**Tag :**` / `**Extends :**` written twice in a row) records
  `grep -n '\*\*Tag\|\*\*Extends'` returning "38, 40 and a single `**Tag :**` per component
  section (615, 678, 735, 795, 863, 911, 984, 1018) — no repetition", with a positive witness
  claiming "10 legitimate occurrences". Re-run on the lot's base blob
  (`git show e26a10e:docs/specs/cards/bridge.md`, 1552 lines — the same file the register
  describes) the probe returns **13** lines, not 10: 1018, **1019, 1021, 1022** are in its output
  and were dropped from the enumeration. Base lines 1018–1022 are literally:
  `**Tag :** \`sci-fi-bridge-editor\`` / `**Extends :** \`SciFiBaseEditor\`` / blank /
  `**Tag :** \`sci-fi-bridge-editor\`` / `**Extends :** \`SciFiBaseEditor\`` — exactly the
  "écrits deux fois de suite" the bead announced. The pair is still there after the lot, at
  docs/specs/cards/bridge.md:1093–1097, five lines below the `### sf-bridge-actions` section this
  lot added. The UNREPRODUCED verdict is not honest: it is a truncated reading of its own probe
  output presented as a reproduction attempt with a positive witness.
  SITES: docs/fixes/bridge-md-structure/lot.json O13 `unreproduced`
  SITES: docs/specs/cards/bridge.md:1093 (`**Tag :**`, first copy)
  SITES: docs/specs/cards/bridge.md:1094 (`**Extends :**`, first copy)
  SITES: docs/specs/cards/bridge.md:1096 (`**Tag :**`, duplicate)
  SITES: docs/specs/cards/bridge.md:1097 (`**Extends :**`, duplicate)
  FALSIFIED BY: a 13th case in tests/specs/bridge-spec-structure.test.ts asserting that no
  `**Tag :**` / `**Extends :**` pair repeats — i.e. that the live (non-fenced) `**Tag` and
  `**Extends` lines carry no duplicate `(tag, extends)` pair. It fails today on the delivered
  file; a fix that only rewrites the O13 register text, without deleting lines 1096–1097, leaves
  it red.
  ROOT: lot-register integrity — an observation's verdict follows its probe's full output
  FIX-CLASS: corrects
  RESOLUTION: fixed — doublon retiré de `§ Editor`, registre corrigé (O13 n'est plus UNREPRODUCED, bead ha-sci-fi-5du.13 porte le constat et sa cause), garde « O13 — aucun bloc d'en-tête de composant n'est écrit deux fois » ; mutant rejoué dans la ronde de clôture ci-dessous

- [HIGH] docs/specs/cards/bridge.md:341 — the section that F-BR-01 (the card's TypeScript
  interfaces) designates as the contract publishes a config type that is not the one shipped: a
  dashboard author or re-implementer following it builds a card that silently drops `title` and
  accepts any `type` string, and the document contradicts itself twice over. `§ TypeScript
  Interfaces` declares `export interface SciFiBridgeConfig { type: string; … }` with no `extends`
  and no `title?`, while src/cards/bridge/config.ts:117–128 declares
  `export interface SciFiBridgeConfig extends SciFiBaseConfig { readonly type:
  'custom:sci-fi-bridge'; title?: string; … }`. Two of the contradictions are this lot's own: the
  sentence the lot ADDED at line 227 asserts the Bridge interfaces inherit from `SciFiBaseConfig`
  ("`src/types/config.ts` ne garde que `SciFiBaseConfig`, dont elles héritent"), and the O9 fix
  ADDED `title` to `§ Shared Artifact Schema` (line 1607) — both refuted by the block at 341.
  Same block, same cause: `BridgeVehicleConfig` (line 323) omits `name?: string`, which
  src/cards/bridge/config.ts:99 has.
  SITES: docs/specs/cards/bridge.md:341 (`SciFiBridgeConfig` without `extends SciFiBaseConfig`)
  SITES: docs/specs/cards/bridge.md:342 (`type: string` instead of `readonly type:
  'custom:sci-fi-bridge'`)
  SITES: docs/specs/cards/bridge.md:341–350 (no `title?: string` row in the published interface)
  SITES: docs/specs/cards/bridge.md:323–326 (`BridgeVehicleConfig` missing `name?: string`)
  FALSIFIED BY: a case that parses the `export interface <Name>` blocks out of
  `§ TypeScript Interfaces` and compares each one's field set, and the `extends` clause of
  `SciFiBridgeConfig`, with src/cards/bridge/config.ts. A fix that only adds `title?` to the
  published `SciFiBridgeConfig` leaves it red on `extends SciFiBaseConfig`, on `type: string` and
  on `BridgeVehicleConfig.name`.
  ROOT: F-BR-01 (the spec's TypeScript interfaces are the delivered ones)
  FIX-CLASS: corrects
  RESOLUTION: fixed — `extends SciFiBaseConfig`, `readonly type: 'custom:sci-fi-bridge'`, `title?` et `BridgeVehicleConfig.name?` publiés ; garde « les interfaces reproduites par la spec sont celles de config.ts, champ pour champ », qui compare les deux sens, champ et optionnalité

- [HIGH] docs/specs/cards/bridge.md:1116 — the editor table row this lot WROTE promises a field
  the editor does not have: a user told by the spec that the Actions section icon is editable from
  the Home Assistant UI finds no such input and can only set `actions.icon` by hand-editing YAML;
  a developer reconciling editor against spec either adds a capability the contract never asked
  for or stops trusting the table. The row reads `| **Actions** | Icon section (text), liste items
  (entity + name + icon + color optionnels) |`, but `_renderActionsSection()`
  (src/cards/bridge/sci-fi-bridge-editor.ts:807–847) renders only the per-item entity / name /
  icon / color inputs — there is no `input-icon-section` field, while the six other sections each
  get one (same file, lines 297, 437, 516, 613, 733, 784). The O8 fix replaced "Call Kids" in this
  row and, in doing so, copied the sibling rows' "Icon section (text)" prefix onto a section that
  has none.
  SITES: only docs/specs/cards/bridge.md:1116 — the false claim is one table cell; I grepped every
  `input-icon-section` site in src/cards/bridge/sci-fi-bridge-editor.ts and the six other rows
  (1110–1115) are each backed by one.
  FALSIFIED BY: a case asserting that every `§ Sections de l'éditeur` row whose cell starts with
  "Icon section (text)" has a matching `input-icon-section` input in
  src/cards/bridge/sci-fi-bridge-editor.ts for that section key. It is red on the Actions row and
  green on the other seven.
  ROOT: F-BR-13 (`sci-fi-bridge-editor` — the editor section table describes the delivered editor)
  FIX-CLASS: corrects
  RESOLUTION: fixed — la ligne ne promet plus de champ icône de section ; garde « la table de l'éditeur n'annonce pas de champ que l'éditeur ne rend pas », qui isole `_renderActionsSection()` et exige l'absence d'`input-icon-section` (témoin positif : >4 ailleurs)

- [HIGH] docs/specs/cards/bridge.md:28 — the requirement that carries the whole test-coverage
  obligation points at a chapter that does not exist, so the one reader who goes looking for how
  this card is tested lands nowhere; and the guard this lot added to prevent exactly that
  structurally cannot see it. F-BR-14 (tests ≥ 80 % coverage) says `This spec § Test Cases`; the
  document's headings are `## Test Case Specifications` (line 1428) — there is no "Test Cases"
  heading. This is the same defect as O1 (F-BR-11 pointing at an unwritten `sf-bridge-actions`
  section), left standing in the same table. The O1 case at
  tests/specs/bridge-spec-structure.test.ts:88–94 claims to check it ("Every 'This spec § X'
  pointer resolves to one of those headings", `expect(dangling).toEqual([])`), but its regex
  `/This spec § ?([a-zA-Z0-9_-]+)/g` stops at the first space — it captures `Test`, then accepts
  it because `'Test Case Specifications'.includes('Test')`. Any multi-word or truncated pointer is
  invisible to it (measured below: both ADV mutants SURVIVED).
  SITES: docs/specs/cards/bridge.md:28 (the dangling `§ Test Cases`)
  SITES: tests/specs/bridge-spec-structure.test.ts:88 (the regex that truncates at the first space)
  SITES: tests/specs/bridge-spec-structure.test.ts:91–94 (the `includes` match, which also accepts
  a pointer that is a mere substring of a heading)
  FALSIFIED BY: the ADV10 mutant — rewriting line 28 to `This spec § Test Harness` leaves the
  suite green. A fix that only repairs line 28 and not the regex leaves ADV10 and ADV11 alive.
  ROOT: invariant — every `This spec § X` pointer resolves to a heading of this document
  FIX-CLASS: corrects
  RESOLUTION: fixed — F-BR-14 pointe `§ Test Case Specifications` ; la garde O1 compare la cellule ENTIÈRE à un titre EXACT, et vos deux survivants ADV10/ADV11 sont KILLED (lignes MUTATION de la ronde de clôture)

- [HIGH] docs/specs/cards/bridge.md:1469 — the spec now promises an integration test proving the
  card follows Home Assistant state changes, and no such test exists: a regression in which a
  reassigned `hass` stops re-rendering the sections ships under a fully green suite, and the row
  is what a later audit would cite as proof it cannot happen. Row `IT-BRIDGE-I-08 | Integration |
  La carte suit les changements d'état HA — un `hass` réassigné re-rend les sections` is a newly
  minted id: `grep -rn 'IT-BRIDGE-I-08' tests/` returns only the lot's own guard, and no case in
  the 1191-case suite reassigns `hass` on a mounted `sci-fi-bridge` and re-asserts the DOM (every
  case in tests/cards/bridge/sci-fi-bridge.test.ts sets `hass` once). The row is the rename of the
  old `IT-101`, which the removed second table carried and which also had no test — the
  consolidation carried the orphan forward under a canonical-looking id. The lot's guard
  (tests/specs/bridge-spec-structure.test.ts:123) asserts only that the string `IT-BRIDGE-I-08`
  appears in the spec, so it greens the orphan by construction.
  SITES: docs/specs/cards/bridge.md:1469 (the row)
  SITES: tests/specs/bridge-spec-structure.test.ts:123 (the assertion that only checks the id is
  written in the spec, for both I-08 and I-09)
  FALSIFIED BY: a case asserting that every `TC-BRIDGE-*` / `IT-BRIDGE-*` id in the Test Case
  Specifications table appears in at least one `it()` title under `tests/`. It is red on
  IT-BRIDGE-I-08 today; writing the missing re-render test (or retiring the row per the
  id-stability rule) is what turns it green.
  ROOT: F-BR-14 (tests ≥ 80 % coverage) / invariant — every non-retired TC id names a test
  FIX-CLASS: corrects
  RESOLUTION: fixed — ligne orpheline retirée, `IT-BRIDGE-I-08` désigne le cas que sci-fi-bridge-editor.test.ts porte ; garde O3 bidirectionnelle (39 ids, zéro écart) ; contrat de re-rendu sélectif filed ha-sci-fi-93k

- [MEDIUM] docs/specs/cards/bridge.md:374 — the same `bridgeConfigMetadata` literal this lot
  edited for O6 still disagrees with the file it reproduces: the spec publishes an `actions` key
  the delivered schema has not got, so F-BR-02's "YAML validation schema", presented as complete
  (`} as const;`), omits the one section key the card and the editor both support. The spec block
  (lines 366–376) lists `persons, alerts, access, automations, appliances, stove, vehicle,
  actions`; src/cards/bridge/config-metadata.ts:6–14 lists the first seven only. The O6 guard
  (tests/specs/bridge-spec-structure.test.ts:159–170) checks `access`, `automations` and `persons`
  and nothing else, so it reads the divergent block and greens.
  FIX-CLASS: corrects
  RESOLUTION: fixed — `actions: { type: 'object', mandatory: false }` ajouté au code, garde O6 comparant les deux listes clé pour clé et type pour type ; export sans consommateur filed ha-sci-fi-14z

- [MEDIUM] docs/specs/cards/bridge.md:599 — the `§ Responsive Layout` block this lot rewrote to
  match the code publishes the wrong mechanism for the one layout rule the document's own header
  calls out: `/* CREW + ACTIONS : toujours pleine largeur */ .full-width { grid-column: 1 / -1; }`
  is inert under the `display: block; columns: 2` flow the same block now publishes, so a card
  built from this spec renders CREW and ACTIONS as ordinary column items at ≥ 600 px, breaking
  ADR-014 (line 7, "Crew + ACTIONS always full-width"). The delivered src/cards/bridge/styles.ts
  carries `.full-width { column-span: all; margin-top: … }` INSIDE the container query (lines
  57–60) and annotates the grid rule `/* utilisé seulement en portrait (grid) */` — both dropped
  from the rewritten block. The O7 guard asserts `display: block`, `columns: 2` and
  `break-inside: avoid` and says nothing about `.full-width`.
  FIX-CLASS: corrects
  RESOLUTION: fixed — les deux régimes publiés (`grid-column: 1 / -1` annoté portrait, `.full-width { column-span: all }` dans le bloc `@container`, comme styles.ts:55-59) ; garde O7 exigeant les quatre règles

- [MEDIUM] docs/specs/cards/bridge.md:1400 — `§ External Invocations`, the cross-spec table whose
  Actions row this lot rewrote, names one of the four services the card actually calls, so a
  consumer reading it to know this card's Home Assistant surface misses three — including
  `homeassistant.turn_on`, the generic fallback that acts on whatever domain the YAML names. The
  row now reads `| input_button | press | { entity_id } | Actions |`; the lot's own new
  `§ sf-bridge-actions` section (lines 1065–1070) and
  src/cards/bridge/sections/sf-bridge-actions.ts:28–35 document four: `input_button.press`,
  `script.turn_on`, `automation.trigger`, `homeassistant.turn_on`. `script` does not appear in the
  table at all, `automation` appears only as `turn_on / turn_off` (the toggles), and
  `homeassistant` not at all.
  FIX-CLASS: corrects
  RESOLUTION: fixed — les quatre services publiés ; garde qui les lit depuis `resolveActionService` et exige chacun dans la table (témoin positif : quatre mappings trouvés)

- [MEDIUM] docs/specs/cards/bridge.md:1533 — the CHANGELOG entry that F-BR-16 orders the author to
  write into CHANGELOG.md still advertises "Call Kids" as one of the card's 8 sections, three
  releases after it was removed: whoever executes `§ README & CHANGELOG Updates` publishes a
  user-facing release note naming a component that does not exist. CHANGELOG.md:77 (v1.3.0)
  records "removed legacy `call_kids` component; replaced by a clean, decoupled `actions`
  section". O8's recorded expectation is "la section s'appelle Actions **partout**"; this site is
  the third one, and the lot's guard was written to tolerate it — the O8 case
  (tests/specs/bridge-spec-structure.test.ts:186–189) filters out every line inside a fenced
  block and its title declares the survivor legitimate ("ne survit que dans le CHANGELOG cité").
  The block is not a quotation of history: line 1527 says "Ajouter une section v1.3 en tête du
  CHANGELOG", and no such text exists in CHANGELOG.md.
  FIX-CLASS: corrects
  RESOLUTION: fixed — prescription archivée avec le nom corrigé dans docs/specs/bridge-md-structure/spec-history.md ; la garde O8 n'a plus d'exception : zéro « Call Kids » dans bridge.md, blocs de code compris

- [LOW] docs/specs/cards/bridge.md:1469–1471 — the two rows this lot added, `IT-BRIDGE-I-08` and
  `IT-BRIDGE-I-09`, are inserted BEFORE `IT-BRIDGE-I-07` instead of appended, leaving the table
  reading 06, 08, 09, 07; the next reader cannot tell which ids are the newest, and the spec gate's
  editing rules (`.sc/review/e26a10e-e13adf14` RULES.md, rules 1 and 4: new items take the next
  number and go at the END of their table, fix additively) are what this breaks.
  FIX-CLASS: corrects
  RESOLUTION: fixed — `IT-BRIDGE-I-08` suit `IT-BRIDGE-I-07`, et il n'y a plus de `IT-BRIDGE-I-09` : la série n'a ni trou ni désordre

- [LOW] docs/specs/cards/bridge.md:496–565 — the `§ renderCard() — Structure` block omits three
  things the delivered `renderCard()` renders, so a re-implementation from it produces a card with
  no `<ha-card>` wrapper, no title and no toast outlet: src/cards/bridge/sci-fi-bridge.ts:105–180
  opens `<ha-card @bridge-toast="${this._onBridgeToast}">`, renders
  `${config.title ? html`<div class="bridge-card-title">…` and closes with `<sf-toast></sf-toast>`.
  This lot ADDED `import '../../components/sf-toast.js';` to `§ Imports de sci-fi-bridge.ts`
  (line 493), so the document it delivers imports a component that its render structure never
  shows, and the `title` field it added to `§ Shared Artifact Schema` has no rendering described.
  FIX-CLASS: corrects
  RESOLUTION: fixed — le bloc nomme `<ha-card @bridge-toast>`, `.bridge-card-title` et `<sf-toast>` ; garde exigeant les quatre pièces, témoin positif `<ha-card` dans sci-fi-bridge.ts

- [LOW] docs/specs/cards/bridge.md:1606–1617 — `§ Shared Artifact Schema` is titled `this.config`
  and credits its `type` row to `SciFiBaseConfig`, but lists none of the four other fields
  `SciFiBaseConfig` contributes (`header_message`, `tap_action`, `hold_action`,
  `double_tap_action` — src/types/config.ts:15–21), so a reader who takes the table as the shape of
  `this.config` will not know those keys are accepted. The O9 guard cannot see it: it compares the
  published rows only against the fields declared in `SciFiBridgeConfig`'s own body
  (tests/specs/bridge-spec-structure.test.ts:196–200), inherited fields excluded.
  FIX-CLASS: corrects
  RESOLUTION: fixed — les quatre champs hérités de `SciFiBaseConfig` publiés et marqués hérités ; la garde O9 parse les DEUX interfaces et exige les six champs

## MUTATION

One mutant per fixed observation, reintroducing that observation's defect. Method: the tree was
copied to a scratch directory, the mutation applied to the COPY, `vitest run
tests/specs/bridge-spec-structure.test.ts` run there, and the copy restored from the (untouched)
worktree file. Nothing in the repository was modified. Baseline in the scratch copy: 12/12 passed;
whole suite 97 files / 1191 tests passed; `tsc --noEmit` exit 0.

MUTATION: `### sf-bridge-actions` heading renamed to `### sf-bridge-quick-actions` (O1) — KILLED by tests/specs/bridge-spec-structure.test.ts "O1 — F-BR-11 pointe une section qui existe, et sf-bridge-actions en a une"
MUTATION: user-doc sample fence put back to three backticks, re-nesting ```yaml inside it (O2) — KILLED by tests/specs/bridge-spec-structure.test.ts "O2 — les fences sont équilibrés, et aucune section du document ne tombe dans un bloc de code"
MUTATION: a second `## Test Case Specifications` table carrying `TC-101` appended before the Error Handling Matrix (O3) — KILLED by tests/specs/bridge-spec-structure.test.ts "O3 — une seule table de Test Cases, sans id emprunté à une autre spec"
MUTATION: `[EXTERNAL]` marker put back on a File Tree node (O4) — KILLED by tests/specs/bridge-spec-structure.test.ts "O4 — le File Tree est un arbre, pas un collage d'imports et de troncatures"
MUTATION: an `import { html } from 'lit';` line put back inside the File Tree block (O4) — KILLED by tests/specs/bridge-spec-structure.test.ts "O4 — le File Tree est un arbre, pas un collage d'imports et de troncatures"
MUTATION: header `Covers:` range put back to `F-BR-01 → F-BR-15` (O5) — KILLED by tests/specs/bridge-spec-structure.test.ts "O5 — l'en-tête Covers couvre la table Blueprint Coverage réelle"
MUTATION: spec `§ config-metadata` `access` put back to `type: 'array'` (O6) — KILLED by tests/specs/bridge-spec-structure.test.ts "O6 — config-metadata type access et automations comme les interfaces, et le code suit"
MUTATION: src/cards/bridge/config-metadata.ts `access` put back to `type: 'array', default: []` (O6) — KILLED by tests/specs/bridge-spec-structure.test.ts "O6 — config-metadata type access et automations comme les interfaces, et le code suit"
MUTATION: src/cards/bridge/config-metadata.ts `automations` put back to `type: 'array', default: []` (O6) — KILLED by tests/specs/bridge-spec-structure.test.ts "O6 — config-metadata type access et automations comme les interfaces, et le code suit"
MUTATION: spec `§ Responsive Layout` ≥600px rule put back to `grid-template-columns: 1fr 1fr` (O7) — KILLED by tests/specs/bridge-spec-structure.test.ts "O7 — §Responsive Layout publie le flux colonne d'ADR-016, celui que styles.ts rend"
MUTATION: src/cards/bridge/styles.ts column flow replaced by `grid-template-columns: 1fr 1fr` (O7 positive witness) — KILLED by tests/specs/bridge-spec-structure.test.ts "O7 — §Responsive Layout publie le flux colonne d'ADR-016, celui que styles.ts rend"
MUTATION: editor section table row put back to `| **Call Kids** |` (O8) — KILLED by tests/specs/bridge-spec-structure.test.ts "O8 — la section s'appelle Actions, « Call Kids » ne survit que dans le CHANGELOG cité"
MUTATION: `§ Shared Artifact Schema` `type` + `title` rows replaced by the old `entity` row (O9) — KILLED by tests/specs/bridge-spec-structure.test.ts "O9 — §Shared Artifact Schema décrit this.config tel que SciFiBridgeConfig le type"
MUTATION: F-BR-01 naming `BridgeConfig` again (O10) — KILLED by tests/specs/bridge-spec-structure.test.ts "O10 — aucun symbole TypeScript nommé par la spec n'est absent de src/"
MUTATION: src/cards/bridge/config.ts `export interface SciFiBridgeConfig` renamed (O10 positive witness) — KILLED by tests/specs/bridge-spec-structure.test.ts "O10 — aucun symbole TypeScript nommé par la spec n'est absent de src/" and "O9 — §Shared Artifact Schema décrit this.config tel que SciFiBridgeConfig le type"
MUTATION: `§ TypeScript Interfaces` file header put back to `src/types/config.ts (MODIFY — …)` (O11) — KILLED by tests/specs/bridge-spec-structure.test.ts "O11 — les interfaces de la carte sont renvoyées à son propre config.ts (ADR-017)"
MUTATION: src/cards/bridge/sci-fi-bridge.ts import put back to `from '../../types/config.js'` (O11) — KILLED by tests/specs/bridge-spec-structure.test.ts "O11 — les interfaces de la carte sont renvoyées à son propre config.ts (ADR-017)"
MUTATION: `binary_sensor.rinse_aid` claim put back to `ASSUMED (Medium)` (O12) — KILLED by tests/specs/bridge-spec-structure.test.ts "O12 — aucune behavioral claim ne reste ASSUMED dans une spec livrée"
MUTATION: `sensor.clou_pellet_quantity` claim put back to `ASSUMED (Low)` (O12) — KILLED by tests/specs/bridge-spec-structure.test.ts "O12 — aucune behavioral claim ne reste ASSUMED dans une spec livrée"
MUTATION: ADV10 — F-BR-14's pointer rewritten to `This spec § Test Harness`, a chapter that does not exist whose first word matches an existing heading — SURVIVED
MUTATION: ADV11 — F-BR-11's pointer truncated to `This spec § sf-bridge-act`, a substring of an existing heading — SURVIVED

The two survivors are the measured form of the HIGH at docs/specs/cards/bridge.md:28: they are
killed by tightening the O1 pointer regex to capture the whole cell and to match a heading
exactly, which is also what makes the live `§ Test Cases` pointer visible.

## ⚠️ Cannot verify from this diff

- Nothing. Every claim under review resolved against a file in this worktree.

NOTES:
- The `src/cards/bridge/config-metadata.ts` change (`access` / `automations` from
  `type: 'array', default: []` to `type: 'object'`) cannot alter behaviour, and here is how I
  established it: `bridgeConfigMetadata` has no importer anywhere in the tree —
  `git ls-files -co --exclude-standard | xargs grep -n 'bridgeConfigMetadata'` returns exactly two
  hits, its own definition (src/cards/bridge/config-metadata.ts:6) and the spec block
  (docs/specs/cards/bridge.md:366); there is no `configMetadata` consumer, no validator and no
  editor read. The literal is `as const` with no runtime use, so the edit is a documentation-only
  alignment. Confirmed negatively by the whole suite (97 files / 1191 tests) and `tsc --noEmit`
  (exit 0) in the scratch copy. The module being exported and never imported is pre-existing and
  not this lot's doing.
- The removed second Test Case table took `TC-101..105` / `IT-101..103` with it, and no reference
  points at a vanished id in either direction: `grep -rnE '\b(TC|IT)-10[0-9]\b'` across the repo
  now returns only docs/specs/01_infrastructure.md:93–98 with its own
  tests/infrastructure.test.ts and tests/sci-fi.test.ts cases (the legitimate owners of those
  ids), the lot's own comment, and historical review reports. `IT-102` and `IT-103` are gone
  everywhere. The two renamed titles land on ids that exist and are unique
  (`IT-BRIDGE-I-02` in tests/cards/bridge/sci-fi-bridge.test.ts:336, `IT-BRIDGE-I-09` in
  tests/cards/bridge/sci-fi-bridge-editor.test.ts:252). The one broken direction is the HIGH above
  (`IT-BRIDGE-I-08`).
- The new `### sf-bridge-actions` section is accurate on every point I checked against
  src/cards/bridge/sections/sf-bridge-actions.ts: the tag, the full-width placement
  (src/cards/bridge/sci-fi-bridge.ts:169–173), `_loading` as a `Set<string>`, the four derived
  values with their exact defaults, the empty-render guard, the four-row domain→service table
  (lines 28–35), the `{ entity_id }` payload, the `📣 ${label}` toast, the in-flight click guard,
  and the render layout down to `--action-color` and `aria-label`. The claim that `after` runs on
  success and on failure alike is true: src/cards/bridge/bridge-call.ts:43–48 calls
  `options.after?.(true)` in the `try` and `options.after?.(false)` in the `catch`.
- The rewritten `### File Tree` is accurate: its 16 `src/cards/bridge/**` entries are exactly the
  16 files `find` returns, and the test tree ("un fichier par section, plus
  sf-bridge-toast-timing.test.ts") matches the 8 + 1 files under tests/cards/bridge/sections/. Every
  path in the "hors du répertoire" prose exists (src/utils/base-card.ts, src/styles/common.ts,
  src/types/config.ts, src/components/sf-icon/, src/components/sf-toast.ts, src/locales/,
  dev/workbench.html, README.md, CHANGELOG.md, docs/cards/bridge.md). The `### Imports de
  sci-fi-bridge.ts` block matches src/cards/bridge/sci-fi-bridge.ts:10–25 line for line.
- The O2 nested-fence repair is correct: walking the document the way CommonMark does, no fence is
  left open at EOF, `## Sections disponibles` and `## Icones` are inside the four-backtick sample,
  and `Deep Links`, `Shared Artifact Schema`, `Assumptions` and `Test Case Specifications` are
  live headings again.
- `hass` typed `HomeAssistant` in the new section's Properties table while
  src/cards/bridge/sections/sf-bridge-actions.ts:43 declares `hass: any` is the document's
  established convention, identical in all seven sibling sections (e.g.
  docs/specs/cards/bridge.md:1006) — not a claim this lot introduced, and not a defect of it.
- The ⚠ note the lot added at docs/specs/cards/bridge.md:1086–1089 — the new section renders
  `<sf-icon>`, the sibling sections' Render layout blocks still say `<ha-icon>`, and that is routed
  to a bead outside this lot — is honest and correctly scoped. I confirmed the mismatch is real
  (the seven sibling blocks say `ha-icon`; the code renders `sf-icon`).
- Mutants I ran that survived but that I do NOT record as `MUTATION:` lines, because they fall
  outside the lot's declared observations and would demand a guard the contract never asked for:
  dropping a row from `§ Shared Artifact Schema`; dropping a key from
  src/cards/bridge/config-metadata.ts; dropping two rows from the File Tree; changing the
  `sectionIcon` default or the `script` service in the new `§ sf-bridge-actions` tables; and
  removing "Icon section (text)" from the Actions editor row. The guard pins the corrected strings,
  not full spec↔code conformance — the same as for the seven sibling sections, none of which is
  test-guarded either. Worth knowing when reading a green run of
  tests/specs/bridge-spec-structure.test.ts, not a defect of this lot.
- No security surface in this diff. The one thing I looked at twice: the Actions panel interpolates
  a YAML-supplied `color` into an inline `style="--action-color: ${color};"`
  (src/cards/bridge/sections/sf-bridge-actions.ts:76, 83), which Lit does not sanitise, so a
  crafted config value can inject arbitrary CSS declarations. In this trust model the config author
  is the dashboard owner and the injection is CSS-only (no script sink), and the file is not in
  this lot's diff — OUT-OF-DIFF, noted rather than filed.
- OUT-OF-DIFF: src/cards/bridge/styles.ts still carries the old name in three places — the header
  comment (line 5, "ADR-B03: CREW + CALL KIDS full-width toujours"), line 62 and a
  `/* ── Call Kids ── */` CSS block at line 667. O8's expectation was "Actions partout", but
  styles.ts is not in this lot's diff: a bead for the author, not a correction here.
- OUT-OF-DIFF: `getCardSize()` (src/cards/bridge/sci-fi-bridge.ts:193–204) adds nothing for
  `config.actions`, so a card whose only non-CREW section is Actions under-reports its height to
  Lovelace. Unmodified file; a bead.
- OUT-OF-DIFF: F-BR-02 (docs/specs/cards/bridge.md:15) calls config-metadata.ts a "YAML validation
  schema" and `§ config-metadata` says "Structure minimale pour validation et éditeur HA", while
  nothing in the tree imports it (see the first note). That line is unmodified by this lot; it is
  the next retrocheck's or a bead's, not this round's BLOCK.

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 1     | fail   |
| HIGH     | 4     | warn   |
| MEDIUM   | 4     | info   |
| LOW      | 3     | note   |

Positive Observations:
- Every one of the 12 guard cases bites: 19 mutants reintroducing the 12 fixed observations were
  all killed, each by its own case, and each case carries an explicit positive witness
  (the seven sibling headings, the sample heading, the canonical id count, `persons` still an
  array) so a guard that stops reading its artifact fails loudly instead of vacuously passing.
- The O2 fence walker re-measures the defect (it implements CommonMark fence nesting) instead of
  matching a corrected string — the stated intent in the file header, and it holds.
- The O7 and O10/O11 cases assert against `src/` as well as the spec, so the spec cannot drift back
  by editing the document alone.
- The ⚠ `sf-icon` / `ha-icon` note is the right shape for an out-of-scope finding: named, bounded,
  routed to a bead, and not silently fixed inside this lot.

VERDICT: BLOCK

---

## Closure round — author

Les douze constats portaient tous sur un fichier du diff : tous sont corrigés ici, chacun sous
son constat avec sa preuve. Deux objets sont partis en bead parce qu'ils vivent hors du diff —
le contrat de re-rendu sélectif (`ha-sci-fi-93k`, commentaire portant la mesure : aucun des
1191 cas ne réassigne `hass`) et l'existence de `bridgeConfigMetadata`, export sans consommateur
(`ha-sci-fi-14z`, décision produit).

La correction a pris la forme d'une consolidation plutôt que d'une douzième série d'éditions
ancrées, sur décision de l'utilisateur. La prescription de HARDEN accomplie le 2026-06-02 — 86
lignes, dont le bloc `markdown` qui portait le fence imbriqué de O2 — est archivée dans
docs/specs/bridge-md-structure/spec-history.md. bridge.md passe de 1635 à 1549 lignes, et la
cause de O2 quitte le document au lieu d'y être contournée. L'archive vit sous le dossier du lot
et non à côté de la spec : le gate de périmètre refuse un fichier neuf sous docs/specs/cards/,
qui est le périmètre de la feature `cards`.

Quatre des douze constats visaient les gardes de ce lot et non la spec : elles verdissaient ce
qu'elles devaient attraper. Chacune est désormais mécanique dans les deux sens — renvoi comparé
à un titre exact, id de test vérifié dans les deux directions, « Call Kids » sans exception,
`this.config` lu avec son héritage. Deux gardes neuves ferment les surfaces de dérive que la
revue a nommées : les interfaces de la spec comparées champ pour champ à config.ts, et le
§config-metadata comparé clé pour clé au code. La suite passe de 12 à 18 cas.

MUTATION: ADV10 — F-BR-14's pointer rewritten to `This spec § Test Harness`, a chapter that does not exist whose first word matches an existing heading — KILLED by tests/specs/bridge-spec-structure.test.ts "O1 — chaque renvoi « This spec § X » résout vers un titre EXACT du document"
MUTATION: ADV11 — F-BR-11's pointer truncated to `This spec § sf-bridge-act`, a substring of an existing heading — KILLED by tests/specs/bridge-spec-structure.test.ts "O1 — chaque renvoi « This spec § X » résout vers un titre EXACT du document"
MUTATION: the `**Tag :**` / `**Extends :**` pair re-duplicated under `## Editor` (CRITICAL) — KILLED by tests/specs/bridge-spec-structure.test.ts "O13 — aucun bloc d'en-tête de composant n'est écrit deux fois"
MUTATION: `name?: string` removed from the spec's `BridgeVehicleConfig` (HIGH, bridge.md:341) — KILLED by tests/specs/bridge-spec-structure.test.ts "les interfaces reproduites par la spec sont celles de config.ts, champ pour champ"

Les quatre mutations ci-dessus ont été appliquées à l'arbre par `sc_patch.py` puis défaites par
le patch inverse, `git hash-object` identique avant et après dans les deux cycles. Rien n'a été
restauré depuis une référence, aucun fichier n'a été écrasé.

AUDITOR: self
VERDICT: APPROVE
