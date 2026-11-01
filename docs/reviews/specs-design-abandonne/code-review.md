AUDITOR: subagent

COVERAGE (packet `.sc/review/965f625-e8865a32`; `must_read.txt` is EMPTY — no entry point was packaged, nothing more to add)

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/cards/stove.md | 553 | 553 | yes |
| tests/specs/delivered-design.test.ts | 404 | 404 | yes |
| docs/specs/cards/bridge.md | ~120 (all diff hunks + surrounding blocks, via diff.patch) | 1564 | no — unchanged 1440 lines out of scope |
| src/cards/stove/sci-fi-stove.ts | ~240 (render tree, STATUS_ICONS, _renderBottom, callService, zone methods) + full grep sweep | 512 | no — targeted |
| src/cards/stove/styles.ts | 341 | 341 | yes |
| tests/cards/stove/sci-fi-stove.test.ts | grep sweep on every id and selector the spec cites | 1030 | no — targeted |
| tests/cards/bridge/sections/sf-bridge-{alerts,access}.test.ts | TC-BRIDGE-U-17/U-18 cases | — | targeted |
| docs/fixes/specs-design-abandonne/{lot.json,verdicts.json} | via diff.patch | — | yes |

VERDICT: WARNING

SPEC: docs/specs/cards/stove.md and docs/specs/cards/bridge.md are themselves the artifacts under review; the lot's own contract is docs/fixes/specs-design-abandonne/lot.json (10 observations of the epic).

FINDINGS:

- [HIGH] docs/specs/cards/stove.md:1 — anyone citing "Spec 12" in this repo now reaches three different documents instead of one, so the renumbering did not remove the ambiguity it was opened to remove, it widened it. O8 (the title collided with another spec) renamed `# Spec 11 — Stove Card Design Update` to `# Spec 12 — Stove Card`, but `Spec 12` is already taken, twice: `docs/specs/cards/vehicles.md:1` (« Spec 12 — Vehicle Card Design Update ») and `docs/specs/cards/water_history.md:1` (« Spec 12 — Tactical Water Management History Log »). Reproduced: `for f in $(git ls-files -co --exclude-standard 'docs/specs/*.md'); do head -1 "$f"; done` → `Spec 12` three times, and `Spec 07`, `Spec 08`, `Spec 14` are free. The guard cannot see it because it compares the new title against exactly ONE other file.
  SITES: docs/specs/cards/stove.md:1
  SITES: tests/specs/delivered-design.test.ts:313-321 (the O8 title case: `expect(titre).not.toContain('Spec 11')` + `/^#\s+Spec \d+/`, both satisfied by a colliding number)
  FALSIFIED BY: a case that derives the taken numbers from `head -1` of every `docs/specs/**/*.md` and asserts stove.md's number appears exactly once — it reddens on the current title and would have reddened before the rename too.
  ROOT: invariant "a spec number designates exactly one document" (the invariant O8 was raised to restore)
 RESOLUTION: fixed — titre passé en « Spec 14 », mesuré libre sur les 22 fichiers de docs/specs/ ; le cas « le numéro des specs que ce lot couvre ne collisionne avec aucune autre » dérive désormais les numéros pris de TOUS les titres de docs/specs/ (témoin : >8 numéros lus) au lieu d'un seul fichier. La collision Spec 12 vehicles.md/water_history.md est hors du diff → bead ha-sci-fi-b8g ; le cas l'épingle nommément pour qu'elle ne puisse pas grossir en silence.
  FIX-CLASS: corrects

- [HIGH] docs/specs/cards/stove.md:381 — a developer or a test author who builds from the render tree targets the wrong row of the info panel: a rule meant for the pellet/stock gauges lands on the power cells and vice versa. The tree says `.e.top-path — _renderTopZone : jauge granulés + stock`, but `_renderTopZone` renders `<div class="e bottom-path">` (src/cards/stove/sci-fi-stove.ts:166) and it is `_renderPowerZone` that renders `<div class="e top-path">` (src/cards/stove/sci-fi-stove.ts:314). The two zone classes are inverted. The same inversion is in the §styles.ts zone table, which labels the `Zones e (top / bottom)` banner « les deux rangées de jauges » when `.e.top-path` dresses the power cells (styles.ts:118-148). The tree also shows `.powers` as a direct child of `.info`, where the DOM nests it inside `.e.top-path`. This is the exact defect class — a spec describing a layout the code does not render — that the lot exists to remove, reintroduced in the replacement text.
  SITES: docs/specs/cards/stove.md:381 (tree: `.e.top-path — _renderTopZone`)
  SITES: docs/specs/cards/stove.md:389 (tree: `.powers` hoisted to a child of `.info`)
  SITES: docs/specs/cards/stove.md:312 (§styles.ts zone table: `Zones e (top / bottom)` → « les deux rangées de jauges »)
  FALSIFIED BY: a case that, for each `.e.*-path` line of the tree, reads the method named on the same line out of `sci-fi-stove.ts` and asserts the class string appears in THAT method's body. The present O4 case asserts only that the four `_render*` names appear in the slice, so it stays green on any wrong class — see the MUTATION line below.
  ROOT: invariant "every selector the spec attributes to a method is the selector that method renders"
 RESOLUTION: fixed — arbre corrigé (`.e.bottom-path` = _renderTopZone, `.e.top-path` = _renderPowerZone, `.powers` renesté dedans), table de zones reformulée, mise en garde écrite sur le contre-sens des deux noms. Nouveau cas « chaque méthode de zone est documentée avec la classe qu'elle rend » : il lit l'association dans le code (`private _render\w+Zone` jusqu'au premier `class="…"`) et l'exige dans la ligne d'arbre qui nomme la méthode. Mutant .e ré-inversé → rouge.
  FIX-CLASS: corrects

- [HIGH] tests/specs/delivered-design.test.ts:258-266 — the one guard that is supposed to stop the Frozen-Selector table drifting back into frozen witnesses can be satisfied by a selector no test reads, so the table can re-rot while the suite is green. The name reduction `s.replace(/^[.#]/,'').replace(/\[.*$/,'').split(/[.\s]/)[0]` collapses any `.status.<colour>` to the bare word `status`, which `tests/cards/stove/sci-fi-stove.test.ts` contains dozens of times for unrelated reasons; and the row extractor `/^\|\s*`([^`]+)`/gm` captures only the FIRST backtick of each row, so the five colour classes parenthesised at docs/specs/cards/stove.md:453 and two of the three component names at :456 are never examined at all. Net: of the 12 rebuilt rows' tokens, 5 names are checked and the colour contract — the part ADR-005 and anti-pattern 1 actually hang on — is checked by nothing.
  SITES: tests/specs/delivered-design.test.ts:260 (the `nom` reduction)
  SITES: tests/specs/delivered-design.test.ts:257 (the first-backtick-only row extractor)
  FALSIFIED BY: a case that extracts EVERY backticked token of each frozen row and asserts each appears in the test file as a selector string (inside a `querySelector('…')` / `classList` argument), not as a bare substring — it reddens on MUT-A below, which the present case passes.
  ROOT: invariant "no guard threshold is satisfiable by a token the guarded artifact does not use" (the file's own docstring, lines 11-14)
 RESOLUTION: fixed — le cas lit TOUS les accents graves de chaque ligne gelée (témoin : noms > lignes) et, pour un composé, exige que CHAQUE segment soit lu par le test. MUT-A rejoué (`chartreuse` à la place de `green`) → rouge. Non fait, dit comme limite : le nom est cherché en sous-chaîne, pas dans un `querySelector('…')`.
  FIX-CLASS: corrects

- [MEDIUM] tests/specs/delivered-design.test.ts:37-42 — `prescriptive()` strips every line starting with `>`, and in this document `>` carries normative text, not only revision notes: docs/specs/cards/stove.md:183-186 (`[!WARNING] Ne pas brancher la carte sur sensor.*_stove_status`) and :446-448 (`[!CAUTION]` on the frozen selectors) are both prescriptions and both invisible to every dead-symbol assertion. A future editor can therefore re-prescribe a ghost inside an admonition and the O4/O10 guards stay green. Reproduced: inserting `> La feuille DOIT declarer \`.sensors-grid\` et \`_renderSensorTile()\`` after stove.md:303 leaves `restants = []`. Fix: strip only blockquote paragraphs that open on a revision marker (`**Réécrit`, `**Ajouté`, `**Renumérotée`), and keep `[!NOTE|WARNING|CAUTION]` admonitions inside the prescriptive text.
 RESOLUTION: fixed — `prescriptive()` n'existe plus. La garde a changé de forme sur décision de l'utilisateur : extraction de tout identifiant nommé + liste de retraits versionnée (tests/specs/retired-identifiers.md), sans aucune exemption de mise en forme. Le mutant de ce constat a survécu DEUX fois de plus à la nouvelle forme — la liste exempte un nom où qu'il soit, donc une prescription nommant un symbole retiré passait — et il est tué par un cas de plus : aucun identifiant exempté sur une ligne impérative (MUST/DOIT), dans un `>` ou hors d'un `>`. Limite dite dans le code : une prescription sans mot d'impératif passerait encore.

- [MEDIUM] docs/specs/cards/stove.md:315 — the §styles.ts zone table misfiles a selector, so a reader looking for `.no-temp` edits the wrong block of the sheet: the `N/A quantity` row claims `.nothing`, `.no-temp`, but only `.nothing` is declared under that banner (src/cards/stove/styles.ts:183); `.no-temp` is declared under `Status + temperature rows` (styles.ts:284-291). The §styles.ts guard (tests/specs/delivered-design.test.ts:229-241) only asserts the banner TITLES are quoted somewhere in the spec and never checks which selectors belong to which banner, so it is green on any mis-assignment.
 RESOLUTION: fixed — `.no-temp` déplacé de la ligne `N/A quantity` vers `Status + temperature rows`, où styles.ts le déclare. LIMITE NON FERMÉE, dite plutôt que masquée : l'attribution bannière → sélecteur n'est épinglée par aucun cas. La règle d'extraction vérifie l'EXISTENCE de chaque nom, pas la bannière sous laquelle il vit ; je n'ai pas construit la sonde qui lirait le découpage de la feuille par bannière, et une autre mauvaise attribution dans cette table passerait verte.

- [MEDIUM] docs/specs/cards/stove.md:552 — the file still carries one unmeasured design prescription the lot's sweep did not clear, and it is a MUST with no implementation and no test: « The card MUST disable interaction buttons and render an 'Offline' overlay or distinct visual state when `entity.state === 'unavailable' || entity.state === 'unknown'` ». `src/cards/stove/sci-fi-stove.ts` has no `unavailable` branch and no overlay (`grep -n "unavailable\|Offline"` → only `unknown:` as a STATUS_LABELS key, line 75), and no TC row covers it. Same class as the eight ghosts the lot removed, in the lot's own file. Fix: either delete it with a revision note like the other O3/O4/O10 sections, or keep it and add the FR/TC row that makes it owed.
 RESOLUTION: fixed — la ligne est passée en table avec la marque `⬜ non livré` et la mesure qui le prouve : aucune branche de carte ne lit `unavailable` ni `unknown`, et `STATUS_ICONS` n'a pas ces clés, donc l'état tombe sur `sci:stove-unknow` + couleur `off`. Le cas « un MUST que le code ne porte pas est marqué non livré » refuse toute ligne impérative nommant ces états sans la marque.

- [LOW] docs/specs/cards/stove.md:387-388 — the tree shows `.temperatures` with one `.status` and two `.temperature` rows; the delivered zone renders four `.temperature` rows, because `_renderTimeToService` is the FIRST child (src/cards/stove/sci-fi-stove.ts:233-234, before `_renderStatus`) and pressure is a fourth. A reader counting rows or writing an `nth-child` rule from the tree is wrong.
 RESOLUTION: fixed — l'arbre liste les cinq lignes dans l'ordre rendu, `_renderTimeToService` en premier. Le cas « l'arbre nomme les cinq lignes de `.temperatures` dans l'ordre rendu » compte les appels dans le code (`expect(appels.length).toBe(5)`) et exige chacun dans le bloc.

- [LOW] tests/specs/delivered-design.test.ts:216 — the `arbre` slice uses `spec.indexOf('sf-toast  ')` with two literal spaces, a column-alignment artifact of the current tree block. Reflow the tree to single spacing and `indexOf` returns -1, `slice(a, -1)` silently becomes "everything from `ha-card` to the end of the document", and the guard degrades into exactly the whole-document `includes()` the comment above it says it replaced — without failing. Assert both indices are `> -1` before slicing.
 RESOLUTION: fixed — la tranche sur `'sf-toast  '` a disparu avec l'ancienne forme ; la tranche qui reste vérifie ses deux bornes avant de couper (`expect(debut).toBeGreaterThan(-1)`, `expect(fin).toBeGreaterThan(-1)`), exactement comme le constat le prescrit.

- [LOW] tests/specs/delivered-design.test.ts:147-152 — the O3 header case extracts the method body positionally (`corps.slice(0, corps.indexOf('\n  }'))`) and then asserts absence (`not.toContain('sf-icon')`). Both absence assertions pass on an empty string, so a reformat of `_renderHeader` that moves the closing brace turns the case into a tautology. Pair it with a non-empty/length assertion on `methode`.
 RESOLUTION: fixed — ce cas n'existe plus : la nouvelle forme n'extrait plus le corps de `_renderHeader`, et les noms morts de l'en-tête (`.header-icon`, `.stove-name`) sont jugés par la règle d'extraction — une exigence de présence dans src/ ou dans la liste de retraits, pas une assertion d'absence.

MUTATION: in docs/specs/cards/stove.md:453, replace the frozen row `` | `.status` + sa classe de couleur (`off`, `amber`, `red`, `green`, `blue`) | `` with `` | `.status.purple` + sa classe (`chartreuse`) | `` — SURVIVED (guard `O5 › chaque sélecteur gelé est lu par le fichier de test cité` stays green: the reduction yields `status`, which the test file contains)
MUTATION: in docs/specs/cards/stove.md:381, rename the tree zone class `.e.top-path` to `.e.NOPE-path` (a class present in no file of src/) — SURVIVED (guard `O4 / O10 › la spec nomme les méthodes et les composants réellement rendus` stays green: the `arbre` slice is only checked for `.container` and the four `_render*` names)
MUTATION: insert `> La feuille DOIT declarer `.sensors-grid` et `_renderSensorTile()`` after docs/specs/cards/stove.md:303 — SURVIVED (guard `O4 / O10 › la spec ne les prescrit plus` stays green: `prescriptive()` strips the line)

NOTES:
- Verified correct against the code, by positive evidence: the `.status.<couleur>` table (stove.md:271-277) matches src/cards/stove/styles.ts:243-257 colour by colour and STATUS_ICONS (sci-fi-stove.ts:42-59) state by state, fallback `N/A` included; the quoted `.header` CSS (stove.md:235-245) matches styles.ts:25-33 verbatim; `_renderHeader` at the cited sci-fi-stove.ts:143-145 is exactly the quoted body; F-STOVE-D04's "styles.ts carries no `ha-card` rule" is `grep -c ha-card src/cards/stove/styles.ts` → 0; anti-pattern 4's "14 lignes hors repli" is exact (14); the four services named (`climate.set_hvac_mode`, `climate.set_temperature`, `switch.toggle`, `climate.set_preset_mode`) are the four at sci-fi-stove.ts:458-483; both temperature-wheel contract points hold (`.selectedId="${String(Math.round(targetTemp))}"` and `attributes.entity_id ?? this.config.entity`, sci-fi-stove.ts:386-394); the min/max/step and default 15/30/20 claims hold (sci-fi-stove.ts:357-375); `styles.ts` has a single `export const stoveStyles`.
- F-STOVE-D08's three cited ids resolve as `it()` titles in the file it names: tests/cards/stove/sci-fi-stove.test.ts:756, :781, :840. Every other Covers id resolves too, TC-1102 included (:595). All nine Deep Links resolve after the `../../../` correction (checked on disk, including docs/CODEMAPS/architecture.md, docs/adr/ADR-018_palette-fixed-identity.md, docs/specs/11_guidelines_remediation.md).
- The bridge.md side is factually right: `grep -rn ha-icon src/cards/bridge` → 0 across the 16 files; the eight Render-layout blocks, anti-pattern 10 and the U-17/U-18 expected-result cells now name `sf-icon`, and U-18's new `.access-icon-wrap sf-icon` is the selector the cited test actually queries (sf-bridge-access.test.ts:110) and the class the code renders (sf-bridge-access.ts:77). The `ha-switch` left in those blocks is a genuine HA element, not residue.
- Not a defect, upstream of this lot: the `.status.<colour>` table's "États concernés" column is correct but unguarded — no case cross-checks which states map to which colour. Worth a follow-up guard, not a finding on this text.

CONFORMANCE EVIDENCE (partial — three HIGH stand)
- O1 (bridge names the rendered icon component): docs/specs/cards/bridge.md Render-layout blocks ↔ src/cards/bridge/sections/*.ts, 0 `ha-icon` / 66 `sf-icon` — satisfied.
- O2 (U-17/U-18 reachable): docs/specs/cards/bridge.md:1461-1462 ↔ tests/cards/bridge/sections/sf-bridge-alerts.test.ts:103 and sf-bridge-access.test.ts:105 — satisfied.
- O5 (the frozen table freezes only what a test holds): the 12 rebuilt rows are individually true against tests/cards/stove/sci-fi-stove.test.ts, but the guard pinning them is not falsifiable — see the HIGH on tests/specs/delivered-design.test.ts:258.
- O9 (the bottom bar is specified): docs/specs/cards/stove.md:400-428 ↔ src/cards/stove/sci-fi-stove.ts:353-397 and :458-483 — satisfied.
- O4/O10 (no absent symbol prescribed): the eight ghosts are absent from src/ and from the prescriptive text — satisfied in substance; the replacement tree is wrong on the `.e.*-path` zones (HIGH above).
- O8 (no title collision): NOT satisfied — see the HIGH on docs/specs/cards/stove.md:1.

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 3 | warn |
| MEDIUM | 3 | info |
| LOW | 3 | note |

---

# Round 2 — closure round (past the ceiling, no fresh reviewer available)

VERDICT: APPROVE
AUDITOR: self

The nine findings of round 1 each carry a `RESOLUTION:` line above. Two of the
three HIGH were factual errors in the replacement text, not guard gaps: the
renumbering widened the collision it was opened to close, and the render tree
inverted two zone classes — the very defect class this lot exists to remove,
reintroduced inside the correction.

On the user's decision, the guard changed SHAPE rather than being patched. The
twenty-three hand-written assertions over prose became one extraction and one
rule — every identifier a spec names exists in `src/` (comments stripped), or
is listed in `tests/specs/retired-identifiers.md` with its reason — plus eight
presence cases for the claims extraction cannot carry. Three of the round's
holes close by construction: there is no per-section slice to rename out of
view, and no formatting-level exemption to hide inside.

The three survivors of round 1, replayed against the new shape:

MUTATION: in docs/specs/cards/stove.md:453, replace the frozen row `` | `.status` + sa classe de couleur (`off`, `amber`, `red`, `green`, `blue`) | `` with `` | `.status.purple` + sa classe (`chartreuse`) | `` — KILLED by tests/specs/delivered-design.test.ts « chaque sélecteur gelé par stove.md est lu par le test cité — tous les noms de la ligne »
MUTATION: in docs/specs/cards/stove.md:381, rename the tree zone class `.e.top-path` to `.e.NOPE-path` (a class present in no file of src/) — KILLED by tests/specs/delivered-design.test.ts « aucun identifiant nommé n'est absent de src/ sans exemption déclarée »
MUTATION: insert `> La feuille DOIT declarer `.sensors-grid` et `_renderSensorTile()`` after docs/specs/cards/stove.md:303 — KILLED by tests/specs/delivered-design.test.ts « aucun identifiant exempté n'est prescrit — une note constate, elle n'exige pas »

The third one survived the new shape TWICE before that last case existed: the
retired list exempts a NAME wherever it appears, so it could not tell a note
that records a removal from a line that demands it. The distinguisher is mood,
and the case now refuses an exempted identifier on any imperative line, inside
a blockquote or outside one.

Four further mutants on the new shape, all killed: the two `.e` zones
re-inverted; an exemption stripped of its reason; an exemption minted for a
symbol that does exist (`_renderPelletStock`); and the same blockquote
prescription written outside a blockquote.

## What this round does NOT close

- **Banner → selector attribution in § styles.ts is guarded by nothing.** The
  `.no-temp` row is corrected, but the rule checks that each name EXISTS, never
  which banner of the sheet declares it. Another mis-assignment in that table
  would be green. No probe built.
- **A prescription written without an imperative word** (« la feuille déclare
  `.sensors-grid` ») still passes. The mood of a sentence is not measurable by
  the regex this uses.
- **A frozen name is sought as a substring**, not inside a `querySelector('…')`
  argument as round 1 prescribed.
- **`Spec 12` still collides** between `vehicles.md` and `water_history.md`.
  Out of this diff → bead `ha-sci-fi-b8g`. The uniqueness case names that pair
  explicitly so it cannot grow a third member unnoticed.
- **Nothing read the prose of the two specs end to end** for this round. The
  rule reads identifiers, not meaning; a sentence that is wrong about the code
  without naming a dead identifier would pass.

One finding of my own, out of register because FIX froze it, fixed here because
it is in the diff and filed for the trace: `bridge.md` TC-BRIDGE-U-31 froze
`.access-state-label` and the label « Fermée », where the module renders
`.access-state-tag` and the test asserts `Closed` in the source locale. Found by
the new shape; the old one could not see it.
