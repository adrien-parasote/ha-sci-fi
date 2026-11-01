AUDITOR: subagent

COVERAGE (packet `.sc/review/f10548b-edfa54ad`; `must_read.txt` is empty — no entry point was packaged)

| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/01_infrastructure.md | 157 | 157 | yes |
| docs/specs/02_domain_selectors.md | 207 | 207 | yes |
| docs/specs/03_base_classes.md | 272 | 272 | yes |
| docs/MASTER.md | 1 (diff hunk only) | 243 | no — single-cell change |
| src/utils/base-card.ts | 158 | 158 | yes |
| src/utils/base-editor.ts | 6 (diff hunk only) | 214 | no — header comment only |
| tests/specs/socle-contract.test.ts | 321 | 321 | yes |
| tests/utils/base-card.test.ts | 83 (new hunk) + 258-302 | 384 | no — new cases + IT-301 read |
| docs/fixes/socle-specs-01-03/lot.json | 122 | 122 | yes |
| docs/fixes/socle-specs-01-03/verdicts.json | partial (diff) | 114 | no — green/rc records only |

Joins followed out of the diff: src/cards/*/ (11 cards), src/cards/*/sci-fi-*-editor.ts (11 editors),
src/components/editor-inputs/ (11 components), src/components/sf-toast.ts, src/utils/toast.ts,
src/utils/action.ts, src/types/config.ts, src/selectors/{house,climate,light}.ts, src/styles/editor-common.ts,
package.json, eslint over src/ + tests/.

VERDICT: WARNING

SPEC: docs/specs/01_infrastructure.md, docs/specs/02_domain_selectors.md, docs/specs/03_base_classes.md
(the lot's own target — the corrections ARE the deliverable); editing rules from the packet's RULES.md.

FINDINGS:

- [HIGH] docs/specs/02_domain_selectors.md:83,85,87 — a developer reading the kernel spec to find out who
  uses a selector is sent to three cards that never call it, and the real fact — three exported selectors
  have no production caller at all — stays unwritten; so dead code keeps being maintained as if live.
  The three rows the lot ADDED to § Public Interface name consumers that do not exist:
  `getFirstFloor(hass)` is credited to "Lights, water", `getLightState` to "Lights card",
  `getClimateState` to "Climates card". Measured: `grep -rn '<name>' src/ tests/ | grep -v 'export function'`
  returns ONLY their own unit tests (tests/selectors/house.test.ts:57-70, light.test.ts:25-33,
  climate.test.ts:44-61) — zero references anywhere under src/ outside src/selectors/ itself.
  `getFirstFloor`'s description goes further and asserts a behaviour — "l'étage sélectionné par défaut" —
  that no code performs. This violates the lot's own rule (O10, docs/fixes/socle-specs-01-03/lot.json):
  say what is delivered, and name what is not with a bead id.
  SITES: docs/specs/02_domain_selectors.md:83
         docs/specs/02_domain_selectors.md:85
         docs/specs/02_domain_selectors.md:87
  FALSIFIED BY: tests/specs/socle-contract.test.ts § "spec 02 — la Public Interface est complète" asserts
  only that each export NAME matches `\|\s*`<name>\(` inside the table; it never reads the Consumer column.
  A fix that corrects only line 83 leaves 85 and 87 green, and no case in the suite reddens for any of them.
  The missing assertion: for every export, if the Consumer cell names a card, that card's directory must
  contain a reference to the symbol.
  ROOT: the lot's invariant "a corrected spec states a measured fact, or names a bead"
  FIX-CLASS: corrects

- [HIGH] docs/specs/03_base_classes.md:59 — the newly written § "Les deux toasts", whose whole purpose is to
  record that two notification mechanisms coexist and how far each reaches, overstates the second one's
  reach by one card; anyone sizing the migration away from the double path budgets for 10 cards and finds 9.
  The table claims `<sf-toast>` has "10 cartes". Measured: `grep -rn 'sf-toast' src/` shows the element
  declared in exactly NINE card roots — water:498, climates:115, bridge:178, tv:135, plugs:151, lights:163,
  vacuum:93, stove:136, vehicles:103. `src/cards/hexa-tiles/` and `src/cards/weather/` contain no occurrence
  of "toast" at all. (The companion claim on line 58 — `showToast` in 5 cards: lights, stove, tv, vehicles,
  water — IS correct, and so is "les cinq consommateurs utilisent aussi `<sf-toast>`": all five are inside
  the nine.) The import comment at src/sci-fi.ts:36, "global toast component used by all cards", is the most
  likely source of the 10; it is itself wrong and is out of this lot's diff.
  SITES: only docs/specs/03_base_classes.md:59 — the 5-card figure on line 58 and in the File Tree at
  line 38 are both correct, so the cause does not reach them.
  FALSIFIED BY: tests/specs/socle-contract.test.ts:280-295 measures only the cards that use BOTH paths and
  pins the 5; nothing in the suite counts `<sf-toast>` consumers, so line 59 can hold any number and stay
  green. The missing assertion: count the card directories referencing `sf-toast` and require the table to
  cite that count.
  ROOT: the lot's invariant "a corrected spec states a measured fact, or names a bead"
  FIX-CLASS: corrects

- [HIGH] docs/specs/03_base_classes.md:182-183 — the new § Contrat de rendu sélectif declares the empty-list
  path unreachable in the product, so the next person to read it will treat the two places that deliberately
  take that path as anti-pattern violations and "fix" them — and src/cards/climates/sci-fi-climates.ts:33-38
  says in its own comment that removing it is what left a stale radiator on screen in a previous review round.
  The prose reads "les onze cartes surchargent le hook, donc aucune n'est dans ce cas aujourd'hui", where
  "ce cas" is the `[]` fallback the section has just called "un filet" and "la perte de performance exacte
  que ce mécanisme existe pour éviter". It conflates *overriding the hook* with *never returning an empty
  list*. Two cards return `[]` at runtime on purpose: sci-fi-climates.ts:38 (`if (entities.size === 0) return []`,
  with four comment lines explaining that the empty list IS the intended escape when the installation has no
  climate entity) and sci-fi-bridge.ts (`if (!this.config) return []`). Every card whose configured entities
  are all unset reaches it too, via the trailing `.filter(...)` (e.g. tv:92-101). AP#7 as worded on line 233
  — "ou ne le surcharge pas du tout … Le défaut `[]` re-rend la carte à chaque changement d'état HA" —
  therefore prescribes against delivered, previously-reviewed behaviour with no bead attached, which is the
  one thing this lane forbids.
  SITES: docs/specs/03_base_classes.md:182-183 (the "aucune n'est dans ce cas" claim)
         docs/specs/03_base_classes.md:178-181 ("Le défaut `[]` n'est pas une valeur par défaut raisonnable,
           c'est un filet" — stated without the legitimate-escape case)
         docs/specs/03_base_classes.md:233 (AP#7, the prescription that makes the escape a violation)
  FALSIFIED BY: tests/utils/base-card.test.ts TC-310 asserts only that each card *declares*
  `override getRelevantEntities(`; it never evaluates one. TC-309 exercises the base default. Neither can
  redden for a card that overrides the hook and returns `[]`, so a fix limited to line 183 leaves AP#7
  contradicting sci-fi-climates.ts:38 under a green suite. The missing assertion: a case that calls
  `getRelevantEntities()` on a card configured with no entities and pins whether `[]` is legal.
  ROOT: F-BASE-08 (selective render: sealed shouldUpdate + overridable getRelevantEntities)
  FIX-CLASS: corrects

- [MEDIUM] docs/specs/03_base_classes.md:248-252 — the three integration cases that are the stated coverage
  for F-BASE-01, F-BASE-02 and F-BASE-03 drop out of the Test Case Specifications table as rendered, so the
  kernel spec displays a coverage table that is missing its integration half. The explanatory blockquote
  added after TC-310 sits BETWEEN table rows: lines 248-252 are `>` quote lines, and lines 253-255
  (`| IT-301 |`, `| IT-302 |`, `| IT-303 |`) follow them. A markdown table ends at the first non-table line;
  the three IT rows have no delimiter row of their own and render as literal pipe-separated text. The guard
  cannot see it — tests/specs/socle-contract.test.ts:224-237 filters on `brute.startsWith('|')`, which an
  orphaned row still satisfies. Fix: move the blockquote below the IT-303 row (RULES.md rule 4, additively).

- [MEDIUM] docs/specs/03_base_classes.md:16,233,234 — the spec gate's editing rules are broken by the
  insertion points, so the next `spec_precheck.py --dir docs/specs` run on this directory risks a refusal
  the lot would then have to repair. RULES.md rule 1 says "New items take the NEXT number and go at the END
  of their table" and rule 4 says "Do not restructure sections, split files or reorder tables to fix a
  finding". F-BASE-08 is inserted at line 16, between F-BASE-03 and F-BASE-04. Anti-patterns 7 and 8 are
  inserted at lines 233-234, between row 4 and row 5. Fix: append F-BASE-08 after F-BASE-07, and rows 7-8
  after row 6.

- [MEDIUM] tests/specs/socle-contract.test.ts:52 — the exemption map can be used to whitelist a line that
  PRESCRIBES a non-existent file, which is precisely the hole the test's own comment claims it closes
  ("c'est la différence entre « ce fichier n'existe pas » et « importez ce fichier »"). `DIT_L_ABSENCE` is
  `/n'existe pas|n’existe pas|non livré|⬜|absent|aucun |retirée?s?/i`; the alternatives `aucun `, `absent`
  and `⬜` occur on dozens of ordinary spec lines, including prescriptive ones. Reproduced below as MUT-C:
  replacing the AP#4 prescription with "Importer `editor.ts` ; aucun autre fichier" yields zero phantoms.
  Fix: require an alternative that cannot appear on a prescription — anchor on `n'existe pas`/`non livré`/`⬜`
  only, and drop `aucun `/`absent`.

- [MEDIUM] tests/specs/socle-contract.test.ts:59-60 — half of correction O7 is unpinned: the File Tree can be
  reverted to list `.devcontainer/devcontainer.json [NEW]` and `.eslintrc.json [NEW]`, re-creating the exact
  self-contradiction with F-INFRA-06 that the lot removed, and the suite stays green. The phantom-path regex
  requires BACKTICKS around the path; File Tree entries live in a fenced block as plain text. Measured: zero
  of the regex's 68 matches across the three specs fall inside spec 01's § File Tree. Reproduced as MUT-A.
  Note the map at line 31-33 exempts `.devcontainer/devcontainer.json` and `.devcontainer/docker-compose.yml`
  — names the extraction can never produce, so those two entries are inert. Fix: extract paths from the File
  Tree fence too (the `├──`/`└──` leader is a reliable anchor), or assert directly that spec 01's File Tree
  contains no `.devcontainer` and no `.eslintrc`.

- [MEDIUM] tests/specs/socle-contract.test.ts:295 — the card NAMES in the toast claim are a frozen literal
  inside the assertion, so the 5-card fact the lot measured can go stale without reddening. The case derives
  `doubles.length` from the tree, then asserts
  `expect(spec).toContain(`${doubles.length} cartes : lights, stove, tv, vehicles, water`)`. If weather
  adopted both paths and lights dropped `showToast`, `doubles.length` stays 5, the spec's name list is wrong,
  and the case passes. Fix: build the expected list from `doubles` (`doubles.map(d => d.split('/')[0]).sort()`)
  and assert the spec names those directories.

- [LOW] docs/specs/03_base_classes.md:123 — the figure a reader would use to judge how large the governed
  `--editor-*` family is overstates it fourfold. The row says "la famille `--editor-*` (24 déclarations dans
  `editor-common.ts`)". Measured in src/styles/editor-common.ts: SIX custom properties are declared
  (`--editor-border`, `--editor-chip-bg`, `--editor-chip-color`, `--editor-gap`, `--editor-icon-size`,
  `--editor-section-color`); 24 is the count of all `--editor-*` OCCURRENCES, i.e. 6 declarations plus 18
  `var()` uses. Fix: "6 propriétés, 18 usages".

- [LOW] docs/specs/02_domain_selectors.md:142 — the cross-spec link the lot added lands at the top of
  spec 01 instead of the § it cites, so the correction it points at is not reachable from where it is
  invoked. The anchor is `#budget-de-lint--ce-que-strict-veut-dire-ici`; the heading at
  docs/specs/01_infrastructure.md:123 is `## Budget de lint — ce que « strict » veut dire ici`, whose slug
  keeps a hyphen for each stripped guillemet: `budget-de-lint--ce-que--strict--veut-dire-ici`. The new link
  guard (tests/specs/socle-contract.test.ts:303-318) strips `(#[^)]*)?` before checking, so no case reads it.
  Fix: `#budget-de-lint--ce-que--strict--veut-dire-ici`.

- [LOW] docs/specs/03_base_classes.md:166 — case 5 of the five-case enumeration is narrower than the code, so
  the enumeration is not the closed description it presents itself as ("dans ces cas et dans cet ordre").
  It reads "**premier rendu** (`oldHass` absent)". The trailing `return true` at src/utils/base-card.ts:85 is
  also reached when `this.hass` is falsy (the guard is `if (oldHass && this.hass)`, line 70) and when
  `changedProps` is EMPTY — neither is a first render. Cases 1-4 and the single `false` case on lines 168-169
  are stated correctly and in the code's order. Fix: "premier rendu, ou `hass` remis à une valeur absente,
  ou aucune propriété changée — tout ce qui n'est pas la comparaison ci-dessus".

- [LOW] tests/utils/base-card.test.ts:545,560 — TC-310, the case the spec cites as the proof that all eleven
  cards override the hook, tolerates two of them silently disappearing. Its witnesses are floors:
  `expect(files.length).toBeGreaterThan(20)` and `expect(found).toBeGreaterThan(8)`. With 11 subclasses today,
  `found` may drop to 9 — a card moved out of `src/cards/`, or renamed so
  `/class\s+\w+\s+extends\s+SciFiBaseCard\b/` no longer matches it — and the case still passes while
  docs/specs/03_base_classes.md:182 keeps claiming eleven. The comment calls this "dérivé de l'arbre, jamais
  gelé", which a floor is not. Fix: derive the expected count from the card directories that contain a
  `sci-fi-*.ts` card root and assert equality.

MUTATION: DIT_L_ABSENCE exemption fed a prescription line — AP#4 rewritten as "Importer `editor.ts` ; aucun autre fichier", guard logic replayed on a scratch copy of the three specs — SURVIVED
MUTATION: spec 01 § File Tree reverted to list `.devcontainer/devcontainer.json [NEW]`, guard logic replayed on a scratch copy — SURVIVED
MUTATION: F-INFRA-05 cell reverted to `✅ `.eslintrc.json``, guard logic replayed on a scratch copy — KILLED by tests/specs/socle-contract.test.ts "chaque chemin de fichier cité dans les specs 01-03 existe, ou est déclaré absent"

NOTES:
- Verified correct and well-pinned: the lint budget (package.json:14 is `eslint --max-warnings 166`; eslint
  over `src/**/*.ts` + `tests/**/*.ts` emits exactly 166 messages, 122 `no-explicit-any` + 44
  `no-non-null-assertion`, all 166 under src/, tests/ at zero — the figures on
  docs/specs/01_infrastructure.md:127-137 are exact, and the sum is derived from the script, not copied);
  all 11 cards override `getRelevantEntities` (11 files `extends SciFiBaseCard`, same 11 carry the override);
  all 11 card editors import `editor-common`; the 11 components in src/components/editor-inputs/ contain zero
  `--editor-*`; `sf-editor-accordion.ts:31-36` declares exactly the six `--_*` locals the spec lists, and none
  of their five backing variables is declared anywhere in src/; no card overrides `shouldUpdate` (AP#8 holds);
  all 16 `export function` of src/selectors/ now appear in spec 02's § Public Interface; `IT-403` resolves to
  tests/utils/base-card.test.ts:258 and docs/specs/04_components.md:186; the two header-comment edits are the
  only src/ changes and both are correct.
- The § "La frontière `any`" verdict (docs/specs/02_domain_selectors.md:200-203) holds on the evidence:
  `LovelaceCard.hass?: any` / `setConfig(config: any)` are the HA-facing interface declaration
  (src/utils/base-card.ts:20-23) while the class's own storage is `HomeAssistantExt` (:27) and its own
  `setConfig` is `SciFiBaseConfig` (:131); `fireHassAction`'s three `*_action?: any` and `[key: string]: any`
  (src/utils/action.ts:9-12) are debt against the existing `ActionConfig` (src/types/config.ts:23-28) and
  carry a bead. Which of the two the project prefers is a design call the spec is right not to settle here.
- The § Mémoïsation reversal is sound: zero `memo|cache|WeakMap` in src/selectors/, the three file headers
  claim statelessness, and IT-201 already forbids a cache. Correcting an anti-pattern against the code is
  the Golden Rule applied, not a prescription.
- `getEntitiesByAreaAndDomain`'s consumer cell ("`getLightEntities` et cartes") is accurate —
  src/selectors/light.ts:17 plus sci-fi-climates.ts and sci-fi-lights-editor.ts call it directly.
- `getCardSize()` (src/utils/base-card.ts:155) has no `if (!this.config)` pre-init guard, which the
  TypeScript checklist flags; it returns a constant, so there is nothing to guard. Not a defect, and
  unchanged by this lot.
- Spec 03's claim that the accordion's fallback literals render "dans HA comme hors de HA" assumes no HA
  theme defines `--border-radius` or `--border-width`. Neither is a documented HA frontend variable, but a
  user theme can define anything; the spec does not pin this, and the lot does not need it to.
- `docs/fixes/socle-specs-01-03/verdicts.json` records `rc: 0` with only a truncated stdout tail per
  observation. That is the fix-lane's own format, upstream of this code.
- OUT-OF-DIFF: src/sci-fi.ts:36 comments the `sf-toast` import "global toast component used by all cards";
  nine of eleven cards declare the element. A bead for the author, not a correction in this lot.
- OUT-OF-DIFF: `getFirstFloor` (src/selectors/house.ts), `getLightState` (light.ts) and `getClimateState`
  (climate.ts) are exported and have no production caller — dead code reachable only from their unit tests.
  A bead; the HIGH above is only about the spec rows that claim otherwise.

CONFORMANCE EVIDENCE:
- Lane rule "pin each correction with a vitest case" → tests/specs/socle-contract.test.ts:43-89 (phantom
  paths), :114-157 (the render contract is written in all four tables), :163-190 (spec 02 Public Interface
  completeness, scoped to the table and not the document), :196-215 (lint budget derived from package.json),
  :224-237 (no empty table cell), :244-260 (no card count in src/utils comments), :303-318 (relative links
  resolve) — plus tests/utils/base-card.test.ts:489-530 (TC-309) and :532-562 (TC-310).
- Lane rule "send code defects to beads rather than changing src/" → src/ diff is two header comments only
  (src/utils/base-card.ts:1-4, src/utils/base-editor.ts:1-3); the 14 observations of
  docs/fixes/socle-specs-01-03/lot.json each carry a `ha-sci-fi-y6l.N` bead, and the beads are cited in the
  spec prose at 01_infrastructure.md:20, 02_domain_selectors.md:171,203,229,242,255 and
  03_base_classes.md:143,312,270-272.
- RULES.md rule 2 (every non-retired FR covered by ≥ 1 Test Case row) → F-BASE-08 at
  docs/specs/03_base_classes.md:16 cites IT-301, TC-309, TC-310, and all three exist in
  tests/utils/base-card.test.ts.

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 3 | warn |
| MEDIUM | 5 | info |
| LOW | 4 | note |

Positive Observations:
- The fix lane's discipline is visible and worth reusing: every numbered observation carries a bead, the
  specs name the measurement date and the command behind each corrected fact, and prescriptions the code
  does not satisfy are mostly converted to "voici ce qui est livré + bead" rather than left as MUSTs.
- The spec-02 Public Interface case scoping its search to the table rather than the document
  (tests/specs/socle-contract.test.ts:176-189, with an explicit comment on why `includes()` on the file would
  not do) is the right shape for a documentation guard, and the three "the extraction is broken" witnesses
  (`total > 30`, `exportes.length > 12`, `lignes > 80`) stop a dead regex from reading as a clean result.
- Keeping the dead "Style Injection Error" row struck through rather than deleting it
  (docs/specs/03_base_classes.md:272), so nobody reintroduces it believing a gap exists, is a good pattern.

VERDICT: WARNING
