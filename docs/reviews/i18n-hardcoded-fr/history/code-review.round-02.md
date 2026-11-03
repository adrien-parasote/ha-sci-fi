# Code review — i18n-hardcoded-fr (round 1)

AUDITOR: subagent
PACKET: .sc/review/81c9d31-b439ab7e (dirty, base 81c9d31, 30 files)

COVERAGE (must_read.txt is empty; rows = the lot's code, tests and catalogue):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/i18n-hardcoded-fr/spec.md | 1-162 | 162 | yes |
| tests/i18n/french-literals.ts | 1-312 | 312 | yes |
| tests/i18n/no-hardcoded-literals.test.ts | 1-163 | 163 | yes |
| tests/i18n/catalogue.test.ts | 1-104 | 104 | yes |
| tests/i18n/surfaces.test.ts | 1-393 | 393 | yes |
| src/cards/lights/sci-fi-lights.ts | diff hunks (77-432) | 461 | partial (every changed site) |
| src/cards/climates/sci-fi-climates.ts | diff hunks (218-368) | 398 | partial |
| src/cards/hexa-tiles/sci-fi-hexa-tiles.ts | diff hunks (5-315) | 468 | partial |
| src/cards/weather/sci-fi-weather.ts | diff hunk (496-500) | 632 | partial |
| src/cards/vehicles/sci-fi-vehicles.ts | diff hunk (220-224) | 231 | partial |
| src/cards/tv/labels.ts | diff (10-36) | 38 | near-full |
| src/cards/tv/sci-fi-tv-editor.ts | 138-250 | 258 | partial |
| src/components/editor-inputs/sf-editor-action.ts | 1-5, 60-161 | 161 | near-full |
| src/components/editor-inputs/sf-editor-source-list.ts | diff hunks (1-200) | 209 | partial |
| src/utils/base-editor.ts (getLabel / getSectionTitle) | 186-202 | — | join only |
| xliff/fr.xlf | the 33 added units + typography scan of all 359 targets | 1382 | diff full |
| src/locales/locales/fr.js | the 33 added entries | 371 | diff full |
| tests/cards/lights/sci-fi-lights.test.ts, tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts, tests/components/editor-inputs/sf-editor-source-list.test.ts, tests/fixtures/mock-hass.ts | diff hunks | 308 / 663 / 124 / 115 | partial |
| docs/specs/cards/lights.md, cards/hexa-tiles.md, 09_workbench_editor_i18n.md, 10_card_editors.md | diff hunks + heading list | 106 / 269 / 214 / 983 | partial |

VERDICT: APPROVE
SPEC: docs/specs/i18n-hardcoded-fr/spec.md

What I ran (scratch only, nothing written in the tree):
- `tsc --noEmit` exit 0; `vitest run tests/i18n tests/cards/lights tests/cards/hexa-tiles tests/components/editor-inputs tests/cards/tv` gave 24 files / 313 tests passed; the guard prints `i18n guard: 120 files, 5138 string literals visited`.
- IT-I18N-I-04 (extract + build leave the catalogue unchanged) replayed on a scratch copy of `src/` + `xliff/`: `lit-localize extract` reported "Extracted 359 messages", then `build`; `diff -r` against the tree shows `xliff/` and `src/` identical.
- The detector run on the two pre-fix snapshots gives 19 findings for lights (exactly the threshold) and 2 for the source list. Both snapshots are byte-identical to `git show 81c9d31:<path>`.
- Two independent completeness probes over `src/` (minus `src/locales/`), one line-based regex and one AST dump of every non-`msg()` text node, static attribute and capitalised sentence. Neither found a French or accented copy literal outside the circuit. The only French left is in the water sandbox fixture names (`Fuite Cuisine`…, Assumption 6, filed as a bead) and in the three water `msg()` calls with French sources (Assumption 6).
- Mutation runs (detector and components, mutated copies in scratch):

MUTATION: drop the `??`/`||` right-side judgement in analyseSource (tests/i18n/french-literals.ts:214-219) — KILLED by TC-I18N-U-02
MUTATION: disable the toast-call sink (tests/i18n/french-literals.ts:203) — KILLED by TC-I18N-U-02
MUTATION: stop following ternary branches in leavesOf (tests/i18n/french-literals.ts:61) — KILLED by TC-I18N-U-02
MUTATION: disable the parse-diagnostic throw (tests/i18n/french-literals.ts:152) — KILLED by TC-I18N-U-17
MUTATION: drop the *.fr-data.ts skip (tests/i18n/french-literals.ts:158) — KILLED by TC-I18N-U-20
MUTATION: never judge ${} slots (tests/i18n/french-literals.ts:191) — KILLED by TC-I18N-U-14
MUTATION: never judge static attribute/text sinks (tests/i18n/french-literals.ts:188) — KILLED by TC-I18N-U-02
MUTATION: keep HTML comments in the accent judgement (tests/i18n/french-literals.ts:183) — KILLED by TC-I18N-U-02
MUTATION: stop skipping css templates (tests/i18n/french-literals.ts:208) — KILLED by TC-I18N-U-02
MUTATION: stop skipping import declarations (tests/i18n/french-literals.ts:197) — KILLED by TC-I18N-U-02
MUTATION: remove 'tout' from the word list (tests/i18n/french-literals.ts:31) — KILLED by TC-I18N-U-02
MUTATION: remove 'bouton' from the word list (tests/i18n/french-literals.ts:31) — KILLED by TC-I18N-U-14
MUTATION: text-position slots treated as non-sinks (tests/i18n/french-literals.ts:137) — KILLED by TC-I18N-U-14
MUTATION: drop the `msg` early return in analyseSource (tests/i18n/french-literals.ts:201) — KILLED by TC-I18N-U-03 (only through the three French-sourced water msg() calls; every fixture case stays green, see F-01)
MUTATION: drop `&&` from leavesOf (tests/i18n/french-literals.ts:64) — SURVIVED
MUTATION: remove updateWhenLocaleChanges from sf-editor-action (src/components/editor-inputs/sf-editor-action.ts:67) — KILLED by TC-I18N-U-09
MUTATION: remove updateWhenLocaleChanges from sf-editor-source-list (src/components/editor-inputs/sf-editor-source-list.ts:100) — KILLED by TC-I18N-U-09
MUTATION: swap the Turn all on/off tuple (src/cards/lights/sci-fi-lights.ts:185) — KILLED by TC-I18N-U-04
MUTATION: vehicles stub name as a constant 'My vehicle' (src/cards/vehicles/sci-fi-vehicles.ts:223) — KILLED by TC-I18N-U-10

FINDINGS:
- [MEDIUM] tests/i18n/no-hardcoded-literals.test.ts:56 — the water bead in Assumption 6 is planned to rewrite three French `msg()` sources. Once it lands, someone could delete the guard's `msg()` exemption and the suite would stay green. The rule that text inside `msg()` is never flagged would then rest on no test, and the next accented `msg()` source would surface as a false guard failure with no test explaining why — F-01 (the msg() exemption is not pinned). TC-I18N-U-02 asks for "the same text inside msg(...)" as a non-finding. The fixture is `msg('Tout allumer')`: no accent and outside any sink, so it gives no finding whether or not `msg` is skipped (`tests/i18n/french-literals.ts:201`). It needs an accented fixture, e.g. `msg('Lumière éteinte')`, plus one placed in a sink.
  SITES: tests/i18n/no-hardcoded-literals.test.ts:56
  SITES: tests/i18n/no-hardcoded-literals.test.ts:57 (`msg(str~Tout allumer @{x}~)`: same vacuity, no accent)
  SITES: tests/i18n/no-hardcoded-literals.test.ts:81 (`msg('Tout')` in a slot: a call is never a leaf, so this proves nothing about the skip either)
  FALSIFIED BY: the mutation "drop the `msg` early return (french-literals.ts:201)" must turn TC-I18N-U-02 red on its own, without TC-I18N-U-03.
  ROOT: FR-1 (literals with a msg() ancestor are never read)
  FIX-CLASS: corrects
  RESOLUTION: fixed — accented msg() fixtures added to TC-I18N-U-02 exemptions; mutant "drop msg early return" now turns TC-I18N-U-02 red (verified) [RESOLVED] TC-I18N-U-02
- [LOW] tests/i18n/no-hardcoded-literals.test.ts:66 — a regression that stops following `&&` branches (`${c && 'Tout allumer'}` in a title) would pass the whole suite. FR-1 lists `&&` among the followed operators, and no fixture contains one (mutation above: SURVIVED). Fix: add `html~<b title="@{c && 'Tout allumer'}"></b>~` to the TC-I18N-U-14 positives.
  RESOLUTION: fixed — `&&` fixture added to TC-I18N-U-14; mutant "drop &&" now red (verified) [RESOLVED] TC-I18N-U-14
- [LOW] tests/i18n/french-literals.ts:188 — when the guard fails on a large template, it names the template's first line, not the line of the French text. The pre-fix source list reports `Ajouter une source` at line 150; the text is at line 192. When two French sinks share a template, only the first is reported: findings are keyed by node start (`:160-165`), so the second shows up only after the first is fixed. FR-1 and Error Handling say the guard names "file, line and text". Fix: report each static-sink finding with the offset of the matched chunk (the head or literal node that holds it), and key findings by text as well as position.
  RESOLUTION: fixed — each static sink is located in the template source and reported at its own line; new TC-I18N-U-21 asserts lines [3,4] for two sinks of one template [RESOLVED] TC-I18N-U-21
- [LOW] tests/i18n/french-literals.ts:203 — a French value in a `*.fr-data.ts` file, written as `b ?? 'Aucune donnee'` or passed to a toast, is still flagged. The file exemption is applied only to accents and `html` templates (`skipData` at `:210` and `:222`); the toast and `??` word sinks ignore it. Probe: `findFrenchLiterals("export const A = b ?? 'Aucune donnee';", 'src/x/s.fr-data.ts')` gives 1 finding. FR-1: the detector "skips a file whose name ends `.fr-data.ts`". Fix: return early from analyseSource when `skipData` is set (literal counting aside).
  RESOLUTION: fixed — report() returns early for *.fr-data.ts, so ?? and toast sinks are exempt too; TC-I18N-U-20 extended [RESOLVED] TC-I18N-U-20
- [LOW] tests/i18n/french-literals.ts:208 — two shapes FR-1 names are never flagged. An accented `str` template outside any `msg()` (`str\`Lumière ${x}\`` gives 0 findings): the detector skips every `str` tag, while FR-1 exempts only literals with a `msg(...)` ancestor. And an unquoted static attribute (`html\`<x-y label=Bouton>\`` gives 0): the attribute regex at `:130` requires quotes. Fix: skip `str` only when its parent is a `msg` call, and accept an unquoted value in the `:130` regex.
  RESOLUTION: fixed — only css`` is skipped (str inside msg() returns earlier); unquoted attribute values are read; fixtures for both in TC-I18N-U-14 [RESOLVED] TC-I18N-U-14
- [LOW] tests/i18n/french-literals.ts:116 — `/^[.?]?/.test(name)` is always true (the pattern can match empty), so the condition is dead code that looks like a prefix check. Fix: remove it; `SINK_ATTRS.has(name.replace(/^[.?]/, ''))` already excludes `@` handlers.
  RESOLUTION: fixed — dead condition removed; behaviour covered by the existing TC-I18N-U-14 fixtures (green) [RESOLVED] TC-I18N-U-14
- [LOW] tests/i18n/french-literals.ts:151 — a TypeScript upgrade that renames the private `parseDiagnostics` field would crash the guard with a TypeError instead of a parse report. The detector reads that undocumented field of a `SourceFile` through an `as unknown as` cast: coupling to a dependency's private internals. Fix: get the syntactic diagnostics through the public API (`ts.createProgram([...]).getSyntacticDiagnostics(sf)` on an in-memory host, or `ts.transpileModule(src, { reportDiagnostics: true }).diagnostics`).
  RESOLUTION: fixed — parse errors now come from the public ts.createProgram(...).getSyntacticDiagnostics API; TC-I18N-U-17 syntax-error case stays green [RESOLVED] TC-I18N-U-17
- [LOW] tests/i18n/french-literals.ts:308 — if `git check-ignore` fails for any reason other than "nothing ignored" (exit 128, git missing), the FR-1.1 cross-check reports a misleading list mismatch instead of the real error. The empty `catch {}` treats every failure as exit 1. Fix: catch only `status === 1`, rethrow otherwise.
  RESOLUTION: fixed — catch rethrows unless status === 1; new TC-I18N-U-22 (non-git dir throws) [RESOLVED] TC-I18N-U-22
- [LOW] tests/i18n/surfaces.test.ts:27 — run from any working directory other than the repo root, TC-I18N-U-08's dead-fallback check reads a non-existent file and fails. `ROOT` comes from `process.cwd()`, while the sibling tests (`no-hardcoded-literals.test.ts:16`, `catalogue.test.ts:9`) use `new URL('../..', import.meta.url)`. Fix: use the same idiom.

  RESOLUTION: fixed — ROOT now derives from __dirname (import.meta.url is not a file URL under happy-dom); suite green from the repo root and no cwd use [RESOLVED] TC-I18N-U-08

OUT-OF-DIFF: none new. The French-sourced water `msg()` calls (`src/cards/water/sci-fi-water-management.ts:348,361,567`) and the French sandbox fixture names (`:205-208`) are already Assumption 6 beads; F-01 depends on them.

NOTES:
- Census completeness: both independent probes over `src/` agree with the guard's zero on the real tree; no literal outside the 42 sites needed converting.
- French wording: the 33 targets match Builder Calls word for word. They follow the catalogue's typography: plain space before `:`/`!`/`?` everywhere (no NBSP anywhere in fr.xlf), `(ex: …)` without a space, as `Label de filtrage HA (ex: water)`. `Entité Volume`/`Entité Application` follow the `Entité Lecteur Média`/`Entité Télécommande` capitalisation. `Entité météo non trouvée` mirrors `Entité poêle non trouvée`. No typo found.
- Placeholders: the `⚠️ Alerte météo : <x id="0" equiv-text="${label}"/>` and `Bouton <x id="0" equiv-text="${actionId}"/>` targets repeat their source's `<x>`. fr.js renders them as `str\`… ${0}\``, and the idempotent extract/build shows the tool's output.
- The tuple lookups in `title=` attributes omit the `as string` that FR-2 writes. The index is `0|1`, so the value is never undefined, and BUILD.md records that eslint flags the cast as unneeded there. No behavioural divergence.
- `this.getLabel(x) + ' ' + this.getLabel('text-optional')` in the tv editor looks like Anti-pattern 4 (concatenating translated pieces), but FR-6 prescribes it to match the remote row. Any problem there is upstream of the code.
- The dead fallbacks were truly dead: `getSectionTitle` returns a TemplateResult and `getLabel` returns `''` for an unknown key (`src/utils/base-editor.ts:186-201`).
- IT-I18N-I-02 does not by itself prove that a child component follows the locale. With `updateWhenLocaleChanges` removed from the source list it stays green, because the editor's re-render pushes new properties. TC-I18N-U-09 is the test that proves it (both component mutants were killed there).
- `updateWhenLocaleChanges` adds a reactive controller that subscribes on connect and unsubscribes on disconnect, so it does not leak. Each component calls it once in its constructor.
- The pre-fix snapshots are `.ts.txt` under `tests/`. Neither the `src/` scan, tsc, eslint (`tests/**/*.ts`) nor vitest (`tests/**/*.test.ts`) reads them.
- The three amended tests (lights `:46`, hexa U-706/707) and the fourth one found by the builder's grep (`sf-editor-source-list.test.ts:30`) await `setLocale('fr')` and restore `fr` in `afterEach`. A grep of `tests/` outside `tests/i18n/` found no other French assertion on a converted string. The stove O5 assertions are the stove's own `msg()` toasts.

CONFORMANCE EVIDENCE:
- FR-1 / FR-1.1 / FR-1.2 → tests/i18n/french-literals.ts:149-228 (AST, parse failure throws at :152), :285-312 (git lister plus fs probe); guard at tests/i18n/no-hardcoded-literals.test.ts:96-113 (counters printed, `literals >= files`); snapshots at :131-136.
- FR-2 → src/cards/lights/sci-fi-lights.ts:78, 161, 179, 185, 253, 303, 315, 321, 391, 403, 417, 433 (tuple lookups; findMsgTernaries finds 0 in the census files).
- FR-3 → src/cards/climates/sci-fi-climates.ts:221, 353, 359, 365.
- FR-4 → src/cards/hexa-tiles/sci-fi-hexa-tiles.ts:231, 305, 314.
- FR-5 → src/cards/weather/sci-fi-weather.ts:499. FR-8 → src/cards/vehicles/sci-fi-vehicles.ts:223.
- FR-6 → src/cards/tv/labels.ts:23-24, 30-32; src/cards/tv/sci-fi-tv-editor.ts:141, 183, 193, 216, 234, 241.
- FR-7 → src/components/editor-inputs/sf-editor-action.ts:65-68, 125-145; sf-editor-source-list.ts:98-101, 170, 178, 184, 198.
- FR-9 → xliff/fr.xlf (359 units, extract/build idempotent); tests/i18n/catalogue.test.ts:48-81.
- FR-10 → docs/specs/cards/lights.md:104; docs/specs/cards/hexa-tiles.md:145, 153; docs/specs/09_workbench_editor_i18n.md:162, 189.
- FR-11 → tests/fixtures/mock-hass.ts:77-78, 107.

## Review Summary
| Severity | Count | Status |
|---|---|---|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 1 | info |
| LOW | 8 | note |

FINDINGS: 9 (critical: 0, high: 0)
VERDICT: APPROVE

---

# Code review — i18n-hardcoded-fr (round 2, delta)

AUDITOR: subagent
PACKET: .sc/review/81c9d31-3ac0ae7d (delta since .sc/review/81c9d31-b439ab7e; 3 code files moved, plus review artifacts)

COVERAGE (must_read.txt is empty; rows = the delta's code files, plus the spec rows the resolutions cite):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/i18n/french-literals.ts | 1-328 | 328 | yes |
| tests/i18n/no-hardcoded-literals.test.ts | 1-191 | 191 | yes |
| tests/i18n/surfaces.test.ts | delta hunks (1-30) | 394 | partial (only the ROOT change moved) |
| docs/specs/i18n-hardcoded-fr/spec.md | FR-1 (:33-34), TC table (:94-117), Error Handling (:125) | 162 | partial (did not move in this delta) |
| docs/reviews/i18n-hardcoded-fr/history/*, security-review.md | not audited (review artifacts, not product code) | — | n/a |

VERDICT: APPROVE
SPEC: docs/specs/i18n-hardcoded-fr/spec.md

What I ran (on a scratch copy of the worktree, nothing written in the tree):
- `vitest run tests/i18n`: 3 files, 45 tests passed. `tsc --noEmit -p tsconfig.test.json` exit 0. `eslint tests/i18n` exit 0.
- Detector over the real tree: 120 files in 194 ms, including the per-file in-memory program, so the public-API change costs nothing measurable.
- Edge-case probes of `findFrenchLiterals`. A syntax error throws `parse failure` under both a relative and an absolute file name. Type errors (`let x: number = "a"`) and a generic arrow `<T>(x: T) => x` do NOT throw, so only syntactic diagnostics are read. `msg(str~Lumière ${x}~)` gives 0 findings, `str~Lumière~` outside msg() gives 1, and `html~<p>Entrée</p>~` in a `*.fr-data.ts` file gives 0. No regression found in the detector.
- Mutations (each on a scratch copy of `tests/i18n/french-literals.ts`, run against `tests/i18n/no-hardcoded-literals.test.ts`):

MUTATION: drop `&&` from leavesOf (tests/i18n/french-literals.ts:64) — KILLED by TC-I18N-U-14
MUTATION: drop the `msg` early return in analyseSource (tests/i18n/french-literals.ts:216) — KILLED by TC-I18N-U-02
MUTATION: remove the `if (skipData) return` in report (tests/i18n/french-literals.ts:167) — KILLED by TC-I18N-U-20
MUTATION: report static sinks at the template start instead of their own offset (tests/i18n/french-literals.ts:202) — KILLED by TC-I18N-U-21
MUTATION: skip `str` templates again (tests/i18n/french-literals.ts:223) — KILLED by TC-I18N-U-14
MUTATION: stop reading unquoted attribute values (tests/i18n/french-literals.ts:134) — KILLED by TC-I18N-U-14
MUTATION: empty the syntactic diagnostics list (tests/i18n/french-literals.ts:157) — KILLED by TC-I18N-U-17
MUTATION: remove the rethrow of a non-1 git exit (tests/i18n/french-literals.ts:325) — KILLED by TC-I18N-U-22

Closure of round 1 (no finding was contested, so no RULING is owed):
- F-01 (the msg() exemption is not pinned): closed. Accented `msg()` and `msg(str…)` fixtures are at no-hardcoded-literals.test.ts:57-58. The msg-return mutant now turns TC-I18N-U-02 red on its own.
- `&&` branch (round-1 LOW at :66): closed. The fixture is at :73, and the survivor is now killed (above).
- Line of the French text (round-1 LOW at french-literals.ts:188): partly closed. Static word sinks now report their own line (:195-203, TC-I18N-U-21). The accent path and the token lookup still miss, see the new LOW below.
- `*.fr-data.ts` exemption on word sinks (round-1 LOW at :203): closed, at :167, by TC-I18N-U-20 :98-100.
- `str` outside msg() and unquoted attributes (round-1 LOW at :208): closed, at :223 and :131/:134, by TC-I18N-U-14 :74-75.
- Dead `/^[.?]?/` condition (round-1 LOW at :116): closed, at :116-117.
- Private `parseDiagnostics` field (round-1 LOW at :151): closed, at :152-157 (`ts.createProgram(...).getSyntacticDiagnostics`, public API).
- Empty `catch {}` in the fs lister (round-1 LOW at :308): closed, at :323-326, by TC-I18N-U-22.
- `process.cwd()` in surfaces.test.ts (round-1 LOW at :27): closed, at surfaces.test.ts:28 (`resolve(__dirname, '../..')`).

FINDINGS:
- [MEDIUM] tests/i18n/no-hardcoded-literals.test.ts:103 — two tests carry spec ids that do not exist, and three spec rows no longer describe their tests. A reader following the spec cannot find what TC-I18N-U-21 (each static sink reported at its own line) and TC-I18N-U-22 (the fs lister rethrows a git failure) prove. The round-1 resolutions pin two fixes to `[RESOLVED] TC-I18N-U-21` and `TC-I18N-U-22`, but the spec's TC table ends at TC-I18N-U-20 (spec.md:113), and spec.md did not move in this delta. This is the test/spec divergence class the repository already fixed once (docs/fixes/test-spec-divergence). The spec's rule says a resolved finding is pinned to a TC row that exists, added if missing.
  SITES: tests/i18n/no-hardcoded-literals.test.ts:103 (TC-I18N-U-21: no spec row)
  SITES: tests/i18n/no-hardcoded-literals.test.ts:136 (TC-I18N-U-22: no spec row)
  SITES: docs/specs/i18n-hardcoded-fr/spec.md:107 (the TC-I18N-U-14 row promises "one finding for each of the four French fixtures"; the test now holds seven: `&&`, unquoted attribute and `str` outside msg() were added)
  SITES: docs/specs/i18n-hardcoded-fr/spec.md:113 (the TC-I18N-U-20 row covers only an accented literal; the test now also asserts the `??`, toast and attribute word sinks)
  SITES: docs/specs/i18n-hardcoded-fr/spec.md:95 and tests/i18n/no-hardcoded-literals.test.ts:44 (the row and the test title say "six exemptions"; the test now has eight non-findings, including accented msg() sources)
  Fix: add the TC-I18N-U-21 and TC-I18N-U-22 rows to the end of the TC table (both cover FR-1). Amend the U-02, U-14 and U-20 rows and the U-02 title in place.
  RESOLUTION: fixed — spec rows TC-I18N-U-21 and -22 added, U-02/U-14/U-20 rows amended in docs/specs/i18n-hardcoded-fr/spec.md, test title de-numbered [RESOLVED] TC-I18N-U-21
- [LOW] tests/i18n/french-literals.ts:191 — accented French in a large `html` template is still reported at the template's first line, with the whole template part as its text. When the same text also holds a French word, it is reported twice, on two lines. Error Handling (spec.md:125) says the guard names "file, line, text". The round-1 fix located only the static WORD sinks. `judgeAccents(nodes[idx], kept)` still reports at the part's start. The word-sink lookup at :199-200 searches for the sink's first token with `tplText.indexOf(token, cursor)`, so it can land on an earlier attribute or class that contains that token. Probes (scratch): `<span>Entrée</span>` on line 4 is reported at line 1. `<button>Ajouter une entrée</button>` on line 4 gives two findings, line 1 (whole part) and line 4. `<span class="source">` on line 2 followed by `<p>source de la lumiere</p>` on line 4 is reported at line 2. `<x-y label="x">` on line 2 followed by `<p>la source</p>` on line 3 is reported at line 2 ("la" matches inside "label"). An escaped `Ajouter` falls back to line 1.
  Fix: have scanHtml return each static sink with its offset in `joined`, and map that offset back to source through the part nodes (one sink, one position). Judge accents per static text node rather than per template part. Then key findings by that position, so one text gives one finding.
  RESOLUTION: fixed — accents reported at their own offset (comments blanked, not dropped), token lookup is word-bounded so `la` in `label` no longer matches, accent+word on one line reported once; TC-I18N-U-21 extended with the multi-line accent fixture [RESOLVED] TC-I18N-U-21

NOTES:
- `str~Tout allumer ${x}~` outside msg() gives 0 findings: only its accents are judged. That matches FR-1. Unaccented words are judged in sinks (attributes, text, toast, `??`/`||`) and nowhere else, the same rule as for a plain `'Tout allumer'` string.
- TC-I18N-U-22 needs the OS temp directory to be outside any git work tree. In a CI where `TMPDIR` sits inside a checkout, `git check-ignore` would exit 1 and the test would fail on its own. The repository's CI uses the default `/tmp`. Its bare `toThrow()` is still biting: the rethrow mutant turns it red.
- `ts.createCompilerHost({})` falls back to the disk only for names other than the analysed file. With `noLib`/`noResolve` none is requested, and `getSyntacticDiagnostics(sf)` reads the given SourceFile whatever name the program normalised.
- `__dirname` in surfaces.test.ts works because vitest injects it. The sibling test keeps `fileURLToPath(new URL('../..', import.meta.url))`. The resolution says `import.meta.url` is not a file URL under happy-dom, which fits the two different idioms.

CONFORMANCE EVIDENCE:
- FR-1 (msg() ancestor never read) → tests/i18n/french-literals.ts:216; pinned by TC-I18N-U-02 :57-58.
- FR-1 (`.fr-data.ts` file skipped as a whole) → tests/i18n/french-literals.ts:167, :225, :237; TC-I18N-U-20 :98-100.
- FR-1 (`&&`/`??`/`||`/ternary branches followed) → tests/i18n/french-literals.ts:59-72; TC-I18N-U-14 :73.
- FR-1 (`css` skipped, `str` read unless under msg()) → tests/i18n/french-literals.ts:223.
- FR-1.2 (parse failure is a failure) → tests/i18n/french-literals.ts:152-161, public API; TC-I18N-U-17 :166-168.
- FR-1.1 (two listers agree; a git failure is not "nothing ignored") → tests/i18n/french-literals.ts:308-328; TC-I18N-U-03 :120, TC-I18N-U-22 :136-141.

## Review Summary
| Severity | Count | Status |
|---|---|---|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 1 | info |
| LOW | 1 | note |

FINDINGS: 2 (critical: 0, high: 0)
VERDICT: APPROVE
