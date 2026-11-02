# Code review — repo-wide-ids-guard (round 1)

AUDITOR: subagent
PACKET: .sc/review/136dfca-62e03ba4

COVERAGE (must_read.txt is empty: no entry point packaged; every file of files.txt is a row):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/docs/repo-wide-ids-guard.test.ts | 1-539 | 539 | yes |
| docs/specs/repo-wide-ids-guard/spec.md | 1-133 | 133 | yes |
| tests/cards/vacuum/vacuum-ids-declared.test.ts | diff hunks + helper grep (lines 12-68) | 79 | no (diff + every helper use) |
| tests/utils/bare-range-ids-declared.test.ts | diff hunks + helper grep (lines 8-65) | 67 | no (diff + every helper use) |
| tests/cards/water/water-history-aligned.test.ts | diff hunk (345-351) | 416 | no (one title line changed) |
| tests/docs/spec-numbering.test.ts | diff hunk (95-101) | 103 | no (one title line changed) |
| tests/selectors/house.test.ts | diff hunk (98-104) | 205 | no (one title line changed) |
| docs/specs/02_domain_selectors.md | diff hunks (13-19, 173-179) | 226 | no (two lines changed) |
| docs/specs/bare-range-ids/spec.md | diff hunks | 82 | no |
| docs/specs/vacuum-orphan-ids/spec.md | diff hunks | 107 | no |
| docs/adversarial-review/repo-wide-ids-guard.md (+ history copy) | not read | 51 | no (review artifact, not product) |
| docs/summaries/repo-wide-ids-guard/BUILD.md, SPEC.md | not read | 22 / 22 | no (summaries) |

Deterministic pre-pass (run by this reviewer, foreground): `vitest run` on the new guard, the two trimmed per-lot guards, `ids-cas-uniques`, `blueprint-traceability`, `transverse-registries`, `house`, `spec-numbering`, `water-history-aligned` — 9 files, 97 passed, 1 skipped, exit 0. `tsc --noEmit` exit 0. `eslint` on the three edited/new guard files exit 0.

VERDICT: APPROVE
SPEC: docs/specs/repo-wide-ids-guard/spec.md

FINDINGS:
- [MEDIUM] tests/docs/repo-wide-ids-guard.test.ts:124 — a future test can cite an undeclared id and stay green, by putting the id in a `const` and interpolating it into a template title (`const T = 'TC-GHOSTRWG-U-01: x'; it(`${T} y`, f)` yields title `${T} y`, ids `[]`, nothing opaque, nothing refused — reproduced on a scratch copy) — FR-1 (titles are read with the TypeScript parser; an identifier initialised with a string literal is resolved and read) resolves a bare identifier argument (line 125-128) but a template keeps its raw source text, so the resolved-identifier rule is bypassed one level down; FR-3 (every cited id is a row head) then never sees the id. The fixture of TC-RWG-U-02 (line 347) uses `const T = 'k'`, an id-less value, so the case is never confronted. The spec's own wording ("a template with `${}` gives its source text") is the upstream cause: amend FR-1 so a `${ident}` span whose identifier is a same-file string `const` is substituted (or the span lands in `opaque`), then add the fixture with an id in `T`.
  FIX-CLASS: corrects
  RESOLUTION: fixed — spec FR-1 amended; `${ident}` spans resolved to same-file consts; test TC-RWG-U-02 (viaTemplate with an id in T)
- [MEDIUM] tests/docs/repo-wide-ids-guard.test.ts:206 — a dynamic id built by concatenation (`it('TC-' + n + ': x', f)`) passes the guard silently: its fragment `TC-` is classified as a prose stem and skipped, so neither FR-3 nor FR-5 (unplaceable or dynamic ids are refused and named) fires — reproduced: fragments `["TC-", ": x"]`, readIds gives `{ids: [], refused: []}` for each. FR-9 (each guard case also judges a dynamic-id mutant) names "a dynamic id"; only the template form (`TC-${...}`, line 203-205) is refused. A fragment that ENDS a concatenation piece with `TC-`/`IT-` is not prose, it is the head of a computed id: refuse a stem when it comes from `fragments` (or when it is the end of a literal piece adjacent to a non-literal operand), and add the fixture to TC-RWG-U-06.
  FIX-CLASS: corrects
  RESOLUTION: fixed — spec FR-1 amended; a fragment piece ending in an id stem is refused as dynamic id; test TC-RWG-U-02 (dyn fixture)
- [MEDIUM] tests/docs/repo-wide-ids-guard.test.ts:102 — a test file that reaches vitest through a namespace import (`import * as v from 'vitest'; v.it('TC-GHOSTRWG-U-77: q', f)`) or an alias (`const t = it; t('…', f)`) has its titles skipped entirely: no title, no opaque, no refusal, and the line-start witness of FR-2 (line 156) does not count `v.it(` or `t(` either, so the miss is invisible — reproduced on a scratch copy (both return four empty arrays). FR-1 says an import of `it`/`test`/`describe` "under another name" is refused and named; only the `import { it as t }` spelling is checked. Refuse a namespace import of `vitest` and a `const`/`let` whose initializer is the identifier `it`, `test` or `describe`, with fixtures in TC-RWG-U-02.
  FIX-CLASS: corrects
  RESOLUTION: fixed — spec FR-1 amended; namespace import of vitest and alias of it/test/describe refused; test TC-RWG-U-02 (ns, alias fixtures)
- [LOW] tests/docs/repo-wide-ids-guard.test.ts:57 — a loop variable or local function named like a test root produces a false title (`for (const test of xs) test('zz')` and `function g() { function it(x) {} it('fd'); }` both return a title — reproduced), which would make the guard fail on a valid file — `isShadowed` reads parameters and `VariableStatement`s of a `Block` only, so `for`/`for…of` initializers, function and class declarations, `catch` bindings and `case` clause declarations are not bindings to it, while FR-1 says any binding of that name between the call and module scope hides the root. Fails loud (a false failure), hence LOW.
  RESOLUTION: fixed — isShadowed reads for/catch/function/class/case bindings; test TC-RWG-U-02 (four shadow fixtures)
- [LOW] tests/docs/repo-wide-ids-guard.test.ts:206 — the stem branch `else if (run.endsWith('-')) continue;` is untested: deleting it leaves the suite green, because the only stem fixture (`TC-VACUUM-U- c`, line 421) holds no digit and falls through to the digit-less branch anyway; a digit-bearing stem such as `TC-15-` is where the branch decides, and no fixture holds one. Add `TC-RWG-U-1- x`-style prose to the `prose` list of TC-RWG-U-06.
  RESOLUTION: fixed — digit-bearing stem fixture 'TC-GHOSTRWG-U-1- e' in TC-RWG-U-06 prose list
- [LOW] tests/docs/repo-wide-ids-guard.test.ts:367 — two FR-2 (corpus completeness) witnesses judge the real tree with no mutant beside them: the files-with-titles count (lines 367-369) and the on-disk walk (line 371) are never shown to fail on a fixture, which FR-9 (every tree-judging case also judges mutants) requires. Factor them as functions of `(files, per, onDisk)` and feed one fixture where a file is missing from the corpus and one where a file has witness lines but no title.
  RESOLUTION: fixed — witnesses factored as corpusGaps(files, per, onDisk, linesOf) with two mutant fixtures in TC-RWG-U-03
- [LOW] tests/docs/repo-wide-ids-guard.test.ts:200 — a title that cites a family through a shorthand (`TC-BRIDGE-U-11/U-12` in tests/cards/bridge/sections/sf-bridge-crew.test.ts:91, OUT-OF-DIFF) has its second id read by nobody; FR-5's last sentence ("a test that needs a family of ids writes one title per id or none") is not enforced. Both ids are declared today (docs/specs/cards/bridge.md:1456-1457), so nothing is broken now. Either refuse a `/U-n` or `/I-n` continuation after a token, or drop the sentence from FR-5 as unenforced; retitling the bridge test is a bead for its own lot, not this one.
  RESOLUTION: fixed — spec FR-5 amended: the unenforced family sentence is dropped (the only offender, tests/cards/bridge/sections/sf-bridge-crew.test.ts:91, is outside the diff and both ids are declared)

MUTATION: removed the shadow check in isShadowed (`if (names.has(name)) return true;` → `if (false) return true;`) — KILLED by TC-RWG-U-02
MUTATION: removed the stem-prose skip in readIds (`else if (run.endsWith('-')) continue;` → `else if (false) continue;`) — SURVIVED
MUTATION: weakened the lot-owner rule in ownerProblem (`if (files.length === 1 && lots.length === 1) return null;` → `if (lots.length >= 1) return null;`) — KILLED by TC-RWG-U-05
MUTATION: removed the inner-callee skip in handle (`if (ts.isCallExpression(parent) && parent.expression === call) return;` → `if (false) return;`) — KILLED by TC-RWG-U-01
MUTATION: disabled the derived-prefix owner check (`const wrong = files.filter((f) => f !== owner);` → `const wrong: string[] = [];`) — KILLED by TC-RWG-U-05
MUTATION: dropped the unplayed-mark capture in declarations (`if (m[2]) unplayed.add(m[1]);` removed) — KILLED by TC-RWG-U-04

NOTES:
- `consts` (line 90) is a file-global name map, so a `const T` in one function resolves a `T` used in another scope; no spec clause pins scope-aware resolution and nothing in the tree depends on it.
- TC-RWG-U-05 line 406 uses `docs/specs/other_card.md` (not under `cards/`) as the "second declaring file"; it still proves a derived-prefix id declared outside its card fails, which is what FR-4 asks.
- The vacuum and bare-range guards still use every helper they keep (`titlesOf`, `citedIds`, `declaredIds` in vacuum; `titlesOf`, `TESTS`, `SPEC_03`, `SPEC_11` in bare-range); no dead code left by the FR-10 removals. The retired ids appear nowhere under `tests/` (grep).
- Shadow binding of `var` hoisted from a nested block is not modelled; same family as the LOW at line 57.

CONFORMANCE EVIDENCE:
- FR-1 (TypeScript-parser title extraction, roots, shadowing, renamed import) → tests/docs/repo-wide-ids-guard.test.ts:21, 66-81, 86-143; TC-RWG-U-01/02 at 311-357.
- FR-2 (corpus via `git ls-files -z -co --exclude-standard`, three witnesses) → 147-170, 283, 359-378.
- FR-3 (every id is a row head; `file :: id :: title start`) → 174, 185-197, 255-260, 380-394.
- FR-4 (owner from shape: numbered / card+MASTER derived prefix / exactly one lot spec; cards/<dir>/spec.md owns nothing) → 216-246, 396-418.
- FR-5 (suffix, digit-less, template ids refused; stems, `xx` wildcards, lowercase prose) → 200-214, 420-438 (gaps: findings at 124, 206).
- FR-6 (five titles reworded, bodies untouched) → diff of the four test files; checked by 440-454.
- FR-7 (TC-208 row after TC-207 before IT-201, F-DOM-04 cell) → docs/specs/02_domain_selectors.md:16, 176; checked by 455-467.
- FR-8 (own source spells only own/ghost/fixture ids) → 470-482; ids that must exist are assembled with `id(...)` (442-449, 486).
- FR-10 (three cases retired, rows marked, sentences corrected, other guards kept) → docs/specs/vacuum-orphan-ids/spec.md:21, 66-67, 95; docs/specs/bare-range-ids/spec.md:26, 52, 67; checked by 484-538.

## Review Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | pass |
| HIGH | 0 | pass |
| MEDIUM | 3 | info |
| LOW | 4 | note |

# Code review — repo-wide-ids-guard (round 2, delta)

AUDITOR: subagent
PACKET: .sc/review/136dfca-689c2dc5 (delta since .sc/review/136dfca-62e03ba4)

COVERAGE (must_read.txt is empty: no entry point packaged; every product file of delta.txt is a row; review artifacts under docs/reviews/ are not product):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/docs/repo-wide-ids-guard.test.ts | 1-598 | 598 | yes |
| docs/specs/repo-wide-ids-guard/spec.md | delta hunks (FR-1, FR-5, FR-6) + FR bullet grep | 132 | no (delta + every FR-6 mention) |

Deterministic pre-pass (this reviewer, foreground): `vitest run` on the new guard and the two trimmed per-lot guards — 3 files, 21 tests passed, exit 0; `ids-cas-uniques`, `blueprint-traceability`, `transverse-registries` — 3 files, 41 passed, exit 0. Spec mtime 18:01:55 is later than the recorded spec-gate pass (17:52:55): the amended spec was not re-judged by the spec gate.

Closure of round 1:
- tests/docs/repo-wide-ids-guard.test.ts:124 (template `${T}` bypass) — closed: lines 139-148 substitute a same-file string const into a template span; fixture at 392-394 asserts the id in `T` is read.
- tests/docs/repo-wide-ids-guard.test.ts:206 (concatenated dynamic id) — closed: lines 159-162 refuse a fragment piece ending in an id stem; fixture at 395-396.
- tests/docs/repo-wide-ids-guard.test.ts:102 (namespace import / alias) — closed: lines 111-120; fixtures at 397-399.
- tests/docs/repo-wide-ids-guard.test.ts:57 (for/function/catch/case shadowing) — closed: lines 57-65; four fixtures at 400-406.
- tests/docs/repo-wide-ids-guard.test.ts:206 (stem branch untested) — closed: fixture `TC-GHOSTRWG-U-1- e` at 480; see MUTATION below.
- tests/docs/repo-wide-ids-guard.test.ts:367 (corpus witnesses without mutants) — closed: `corpusGaps` at 197-206, two mutant fixtures at 425-430.
- tests/docs/repo-wide-ids-guard.test.ts:200 (family shorthand) — the sentence was dropped from FR-5 as resolved, but the edit also deleted the line break before FR-6: see the HIGH below.

MUTATION: removed the stem-prose skip in readIds (`else if (run.endsWith('-')) continue;` → `else if (false) continue;`) — KILLED by TC-RWG-U-06

VERDICT: BLOCK
SPEC: docs/specs/repo-wide-ids-guard/spec.md

FINDINGS:
- [HIGH] docs/specs/repo-wide-ids-guard/spec.md:41 — the requirement FR-6 (the five reworded test titles, nothing else edited in their files) no longer exists as a requirement line: anyone or any tool reading the spec's `- **FR-n**:` bullets sees nine requirements, while the test table (lines 92, 95, 97) still traces TC-RWG-U-07 and IT-RWG-I-01/03 to an FR-6 that is nowhere defined — the round-1 fix that dropped FR-5's last sentence ("A test that needs a family of ids writes one title per id or none.") also deleted the newline after it, so line 41 now reads `…adds any other shape found here.- **FR-6**: The five titles…`; `grep -c '^- \*\*FR-'` gives 9, not 10. The edit landed at 18:01:55, after the spec gate's recorded pass (17:52:55), so no gate has judged this text. Restore the line break so FR-6 is its own bullet again, and re-run the spec gate.
  SITES: only docs/specs/repo-wide-ids-guard/spec.md:41
  FALSIFIED BY: `grep -c '^- \*\*FR-' docs/specs/repo-wide-ids-guard/spec.md` must print 10, and `grep -n '^- \*\*FR-6\*\*' docs/specs/repo-wide-ids-guard/spec.md` must print one line
  ROOT: spec integrity (every FR is its own requirement line)
  FIX-CLASS: corrects
  RESOLUTION: fixed — line break restored before FR-6; `grep -c '^- \*\*FR-'` on the spec prints 10

NOTES:
- The alias refusal (line 119) fires on any `const x = it`, including one where `it` is itself a local binding; it fails loud (a false refusal), nothing in the tree does this today.
- `let t; t = it` (assignment rather than declaration) and `const { it: t } = vitest` are not refused; FR-1 names `const`/`let` aliasing only, so this is within the spec as written.
- The stem-mutant run was replayed on a scratch replica of `readIds` (line 251 mutated, the five prose fixtures of line 480): `TC-GHOSTRWG-U-1- e` yields `refused: ['TC-GHOSTRWG-U-1-']` under the mutant, which the assertion at line 481 rejects.

CONFORMANCE EVIDENCE:
- FR-1 (template const substitution, dynamic stem refusal, namespace/alias refusal, extended shadowing) → tests/docs/repo-wide-ids-guard.test.ts:57-65, 111-120, 139-148, 159-162; TC-RWG-U-02 at 384-415.
- FR-2 (corpus witnesses judged on mutants) → 197-206, 417-437.
- FR-5 (stems are prose, digit-bearing stem fixture) → 251, 480-481.

FINDINGS: 1 (critical: 0, high: 1)
VERDICT: BLOCK
