# Code review — domain-constants (round 1)

AUDITOR: subagent
Packet: .sc/review/0071389-1bd81957 (diff.patch byte-identical to `git diff 35f1020` of the worktree at review time)

COVERAGE (must_read.txt is empty: no entry point packaged):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/domain-constants/spec.md | 1-162 | 162 | yes |
| src/types/domains.ts | all | 33 | yes |
| tests/helpers/domain-scan.ts | 1-235 | 235 | yes |
| tests/helpers/domain-scan.test.ts | 1-91 | 91 | yes |
| tests/types/domain-literals.test.ts | 1-179 | 179 | yes |
| tests/types/domains.test.ts | 1-45 | 45 | yes |
| tests/specs/bridge-spec-structure.test.ts, tests/specs/delivered-design.test.ts, tests/cards/water/water-history-aligned.test.ts, tests/cards/water/water-ids-declared.test.ts | their full diff vs 35f1020 | — | diff only |
| the 23 modified src/ files | whole file, mechanically: every `DOMAIN.KEY` / `${DOMAIN.KEY}.` / `[DOMAIN.KEY]:` rewritten back to its literal value, then diffed against 35f1020 | — | yes (round-trip) |
| tests/specs/domain-site-table.json | via TC-DC-U-08 | 117 | no (superseded by the round-trip) |

VERDICT: APPROVE
SPEC: docs/specs/domain-constants/spec.md

FINDINGS:
- [MEDIUM] tests/helpers/domain-scan.ts:99 — the guard's instrument can lose three of its powers and every test stays green, so a later edit that blinds the scanner would land unnoticed — FR-5 (the probe "can fail", AST scan cross-checked by a differently-shaped regex) is held on the real tree today but three behaviours have no fixture: (a) dropping `ts.isNoSubstitutionTemplateLiteral` (a domain written `` `light` ``) — no TC-DC-U-03 (scanner fixtures) fixture uses that class, the Builder-decisions row names it; (b) the regex's backtick-prefix alternative (line 125, `` \`(${alt})\. ``) can be removed; (c) `crossCheck` can match on file+token only, ignoring the line (line 220), which lets an AST hit on one line explain a regex miss on another.
  SITES: tests/helpers/domain-scan.ts:99
  SITES: tests/helpers/domain-scan.ts:125
  SITES: tests/helpers/domain-scan.ts:220
  SITES: tests/helpers/domain-scan.test.ts:23-28 (fixture list), :82-85 (stubbed control)
  FALSIFIED BY: a fixture `` const a = `light`; `` flagged in TC-DC-U-03; a stubbed crossCheck on `` const t = `sensor.${x}`; `` naming 'sensor'; a crossCheck where the AST finding sits on line 1 and the regex token on line 2 of the same file, expected to fail.
  FIX-CLASS: corrects
  RESOLUTION: fixed — 3 fixtures added at the end of tests/helpers/domain-scan.test.ts (TC-DC-U-03 plain template; TC-DC-U-05 template prefix; TC-DC-U-05 line comparison); each of the 3 surviving mutants re-run on the file and now turns one of them red, file restored byte-identical.
MUTATION: tests/helpers/domain-scan.ts scanSource drops ts.isNoSubstitutionTemplateLiteral — SURVIVED
MUTATION: tests/helpers/domain-scan.ts regexTokens drops the backtick-prefix alternative — SURVIVED
MUTATION: tests/helpers/domain-scan.ts crossCheck ignores f.line === hit.line — SURVIVED
- [LOW] docs/specs/domain-constants/spec.md:90 — a reader auditing FR-4 (no existing test edited) finds four pre-existing tests edited but the deviation names three — Deviation (3) lists bridge-spec-structure, delivered-design and water-history-aligned; tests/cards/water/water-ids-declared.test.ts:255,290 (its D14 cite tokens :312/:323/:370 -> :310/:321/:363) is only implied by Deviation (6). Name it.
  RESOLUTION: fixed — Deviation (3) of docs/specs/domain-constants/spec.md now names water-ids-declared.test.ts (a fourth edited test); no code change, proved by the spec text itself.

MUTATION: src/cards/climates/sci-fi-climates.ts one DOMAIN.CLIMATE back to 'climate' — KILLED by IT-DC-I-01, TC-DC-U-08
MUTATION: src/cards/water/sci-fi-water-management.ts one DOMAIN.SENSOR -> DOMAIN.BINARY_SENSOR — KILLED by TC-DC-U-08
MUTATION: tests/helpers/domain-scan.ts template heads not pushed — KILLED by TC-DC-U-03
MUTATION: tests/helpers/domain-scan.ts contextOf returns a constant — KILLED by TC-DC-U-04
MUTATION: tests/helpers/domain-scan.ts explainedByNonCode always true — KILLED by TC-DC-U-05
MUTATION: tests/helpers/domain-scan.ts lower-max check removed — KILLED by TC-DC-U-04
MUTATION: tests/helpers/domain-scan.ts over-bound check removed — KILLED by TC-DC-U-04
MUTATION: tests/helpers/domain-scan.ts prefix classified fullid — KILLED by TC-DC-U-03
MUTATION: tests/helpers/domain-scan.ts module specifiers not excluded — KILLED by TC-DC-U-03
MUTATION: tests/helpers/domain-scan.ts type-level literals not excluded — KILLED by TC-DC-U-03
MUTATION: src/types/domains.ts ZONE value changed — KILLED by tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts

NOTES:
- Key correctness (hard look 1): every substituted reference in the 23 src files was rewritten back to the literal its key's value names and diffed against 35f1020. The only residuals are the intended ones: `domain: Domain` in src/selectors/house.ts:120 and `...domains: Domain[]` in src/cards/bridge/sci-fi-bridge-editor.ts:207 (FR-2), `Set<string>` in water MEANINGFUL_DOMAINS, `new Set<string>([...]).has(domain)` in water `_toggleEntity` (was `[...].includes(domain)`), import lines, and the `_isAlertLog` dedup. No wrong key anywhere: sensor/binary_sensor, input_* and the four computed keys of sf-bridge-automations all round-trip exactly.
- `_toggleEntity` now allocates a Set per call where an array `includes` was. Same result for every string input; a style choice FR-3 allows.
- `_isAlertLog` (hard look 3): its body equals, token for token, the three removed copies (the two `.filter` arrows in `_applyFiltersAndLimit` and `_renderHistoryLogs`, and the head of `_getLogStatus`). `this` is bound the same way (arrow callbacks), and `_getLogStatus` uses the three locals only in the removed `if`. Behaviour is identical.
- Guard edits (hard look 2): not weakened. bridge-spec-structure and delivered-design accept `DOMAIN.(\w+)` lowercased next to the old quoted form. The `toHaveLength(4)` and `> 2` positive witnesses are unchanged, and `KEY.toLowerCase() === value` is pinned by TC-DC-U-01. The water D24 construct `input_boolean` -> `INPUT_BOOLEAN` stays at :141 with the same specificity. The shifts are not a flat -7: D15 moves 283->278 (-5), D14 cites 312/323 move -2, and 370/374/452 and the D20 cites move -7. Each matches the code: the first filter loses 5 lines, `_isAlertLog` adds 3, the second filter loses 5. Same mutant list, nothing removed.
- FR-8 (mutating each DOMAIN key turns some test red): spot-checked on a scratch copy against the suite minus the 3 new files. VALVE turns nothing red beyond the copy's baseline failures, BINARY_SENSOR and HOMEASSISTANT do turn tests red, ZONE as recorded above. This agrees with docs/summaries/domain-constants/BUILD.md:6 (gaps NUMBER, COUNTER, VALVE, bead filed).
- Full suite on the worktree: `tsc --noEmit` exit 0; vitest 130 files, 1599 passed, 1 skipped.

CONFORMANCE EVIDENCE:
- FR-1 (24-key DOMAIN as const + Domain type) -> src/types/domains.ts:6-31; TC-DC-U-01 tests/types/domains.test.ts:19
- FR-2 (Domain-typed parameters) -> src/selectors/house.ts:120, src/cards/bridge/sci-fi-bridge-editor.ts:207; canary tests/types/domains.test.ts:37
- FR-3/FR-4 (same strings at every site) -> round-trip diff above; TC-DC-U-08 tests/types/domain-literals.test.ts:156
- FR-5 (guard + allow-list ratchet) -> tests/helpers/domain-scan.ts:164-209, tests/types/domain-literals.test.ts:60-124
- FR-6 (HASS_PLUG_SERVICE = DOMAIN.SWITCH) -> src/cards/plugs/plug_const.ts:13

# Code review — domain-constants (round 2, delta)

AUDITOR: subagent
Packet: .sc/review/0071389-74a66931 (delta since .sc/review/0071389-1bd81957). Delta: docs/specs/domain-constants/spec.md (Deviation 3), tests/helpers/domain-scan.test.ts (3 fixtures appended), plus the review files.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/domain-constants/spec.md | delta hunk (:90) + FR-5 :60, TC-DC-U-03 :121, TC-DC-U-05 :123 | 162 | delta only (rest unchanged since round 1) |
| tests/helpers/domain-scan.test.ts | 1-30 + delta 92-110 | 110 | yes |
| tests/helpers/domain-scan.ts | 88-130, 205-235 (the three mutated sites) | 235 | sites only (not in delta) |
| docs/reviews/domain-constants/code-review.md | 1-end (round 1) | — | yes |

VERDICT: APPROVE
SPEC: docs/specs/domain-constants/spec.md

FINDINGS: none

Closure of round 1:
- [MEDIUM] tests/helpers/domain-scan.ts:99 (three scanner powers lacked a fixture): RESOLUTION confirmed. The three fixtures at tests/helpers/domain-scan.test.ts:93-109 each pin one power, and each is the only test the matching mutant turns red (re-run below).
  RESOLUTION: fixed — tests/helpers/domain-scan.test.ts fixtures TC-DC-U-03 and TC-DC-U-05, each mutant killed (re-run by this round).
- [LOW] docs/specs/domain-constants/spec.md:90 (Deviation 3 named three edited tests, not four): RESOLUTION confirmed. Deviation (3) now names water-ids-declared as the fourth. `git diff --stat 35f1020 -- tests/` shows exactly four pre-existing tests edited (water-history-aligned, water-ids-declared, bridge-spec-structure, delivered-design); domain-literals.test.ts and domain-scan.test.ts do not exist at 35f1020, so they are new.
  RESOLUTION: fixed — spec Deviation (3) names water-ids-declared.test.ts; git diff --stat 35f1020 -- tests lists exactly four edited existing tests.

Mutants re-run on a scratch copy of the worktree (never in the tree), against tests/helpers/domain-scan.test.ts. Baseline was 7/7 green; the copy was restored and green again afterwards:
MUTATION: tests/helpers/domain-scan.ts scanSource drops ts.isNoSubstitutionTemplateLiteral — KILLED by TC-DC-U-03 (tests/helpers/domain-scan.test.ts, plain template fixture)
MUTATION: tests/helpers/domain-scan.ts regexTokens drops the backtick-prefix alternative — KILLED by TC-DC-U-05 (tests/helpers/domain-scan.test.ts, template prefix fixture)
MUTATION: tests/helpers/domain-scan.ts crossCheck ignores f.line === hit.line — KILLED by TC-DC-U-05 (tests/helpers/domain-scan.test.ts, line comparison fixture)

NOTES:
- `tsc --noEmit` on the scratch copy: exit 0 (the new fixtures use `hits[0]!` and the `Finding` type import, both typecheck).
- The new fixtures reuse the ids TC-DC-U-03 and TC-DC-U-05 under a second describe block. That matches the spec rows they extend (:121, :123) and adds no new id.
- The worktree carries uncommitted edits beyond the delta (src/cards/water, water_history.md, BUILD.md, domain-site-table.json, domain-literals.test.ts). They are round-1 scope, unchanged by this delta, and were not re-audited.

CONFORMANCE EVIDENCE:
- FR-5 (a) positive control incl. template forms -> tests/helpers/domain-scan.test.ts:93-97
- FR-5 (b)/(c) regex cross-check is line-exact and sees template prefixes -> tests/helpers/domain-scan.test.ts:99-109; tests/helpers/domain-scan.ts:125, :220

# Code review — domain-constants (round 3, delta)

AUDITOR: subagent
Packet: .sc/review/0071389-2698f77a (delta since round 2). Delta: .verifyignore (one added line), dist/sci-fi.min.js (rebuilt bundle, not reviewed), plus the review files.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| .verifyignore | 1-25 | 25 | yes |
| src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts | import block 1-37 + diff vs 35f1020 | — | the join the ignore covers (not in delta) |
| .sentrux/rules.toml | 1-45 | — | the policy the ignore relates to (not in diff) |
| docs/reviews/domain-constants/code-review.md | rounds 1-2 | — | yes |

VERDICT: WARNING
SPEC: docs/specs/domain-constants/spec.md

FINDINGS:
- [MEDIUM] .verifyignore:25 — whoever next runs `sentrux check .` sees two god files, while the project's own written policy says exactly one is expected and any second one "is new — treat it as a regression, not as noise". They cannot tell this accepted one apart from a real regression. The ignore silences the verify P7 (architecture check) finding, but the place that records accepted god-file exceptions was left unchanged. Measured: `sentrux check .` on the worktree reports `no_god_files: 2 god file(s) found (fan-out > 15)`, naming src/sci-fi.ts (fan-out=28) and src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts (fan-out=16). .sentrux/rules.toml:9-16 still says "exactly ONE violation". The ignore's reason holds up: the file has 19 import statements at 35f1020 and 20 now, the only new one is `import { DOMAIN } from '../../types/domains.js'` (:37), and FR-3 (every domain literal in src/ goes through DOMAIN) requires that import for the two prefixes at :80 and :95. The flaw is not the exception itself, but that it is recorded in one register and contradicted in the other. Fix: add the editor to the expected-state block in .sentrux/rules.toml:9-16 with the same one-line reason (OUT-OF-DIFF: .sentrux/rules.toml is not touched by this lot), or keep the editor at 15, for example by building the two prefixes through a helper that one of its existing imports already exports.
  FIX-CLASS: corrects
  RESOLUTION: fixed — .sentrux/rules.toml expected-state block now names both god files (src/sci-fi.ts 28, sci-fi-hexa-tiles-editor.ts 16) and flags a third as the regression; .verifyignore:24 stale clause dropped and :25 reason made accurate; `sentrux check .` re-run matches the recorded state.

NOTES:
- Narrowness: the entry covers a single file and the `architectural_violation` category. That is the coarsest granularity .verifyignore allows, the same as the existing src/sci-fi.ts line. It is not a wildcard, and it does not reach any other file.
- The pre-existing `max_cc` / `max_fn_lines` failures (tests/docs/repo-wide-ids-guard.test.ts, tests/i18n/french-literals.ts) are untouched by this lot (`git diff --stat 35f1020` on them is empty). They are not this lot's findings.
- Nothing else moved. delta.txt names only .verifyignore, dist and review files. `git diff HEAD -- .verifyignore` is exactly the one added line. The src/ working-tree diff (src/cards/water) is round-1 scope and unchanged by this delta.
- OUT-OF-DELTA: .verifyignore:24 (unchanged line) still says "this lot does not touch src/". That is stale now that this lot does touch src/. Worth rewording when the line is next edited.
- Mutants: the three SURVIVED lines of round 1 were last recorded KILLED in round 2. No survivor stands, and the packet has no survivors.txt.

CONFORMANCE EVIDENCE:
- FR-3 (every literal through DOMAIN) -> src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts:37, :80, :95 — the import the ignore justifies is the one FR-3 requires

# Code review — domain-constants (round 4, delta)

AUDITOR: subagent
Packet: .sc/review/0071389-a9f5e616 (delta since .sc/review/0071389-2698f77a). Delta: .sentrux/rules.toml, .verifyignore, plus review/history files.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| .sentrux/rules.toml | 1-84 | 84 | yes |
| .verifyignore | 1-24 | 24 | yes |
| src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts | diff vs 35f1020 (3+/2-) | — | the join the exception covers |
| docs/reviews/domain-constants/code-review.md | round 3 in full, round 2 tail | — | closure scope |

VERDICT: WARNING
SPEC: docs/specs/domain-constants/spec.md

FINDINGS:
- [LOW] .sentrux/rules.toml:9 — the block said "exactly ONE violation" while `sentrux check .` reports 3 (max_cc x2, max_fn_lines, no_god_files); the two older ones are not this lot's (empty `git diff 35f1020 --stat` on both test files). The line was rewritten by this lot's round-3 fix, so the stale total was re-asserted.
  FIX-CLASS: corrects
  RESOLUTION: fixed — .sentrux/rules.toml:9-17 now lists the three violations (max_cc, max_fn_lines marked older, no_god_files with both god files) and the total 3; matches the live `sentrux check .` output.

Closure of round 3: the god-file part of the MEDIUM is confirmed closed (both god files named with fan-out 28 and 16, THIRD god file as regression trigger, .verifyignore:23 stale clause dropped).

# Code review — domain-constants (round 5, delta)

AUDITOR: subagent
Packet: .sc/review/0071389-b2fea24b (delta since .sc/review/0071389-a9f5e616). Delta: .sentrux/rules.toml (expected-state block), plus review/history files. must_read.txt is empty (no entry point packaged).

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| .sentrux/rules.toml | 1-88 | 88 | yes |
| .verifyignore | 1-25 | 25 | yes (closure of round 3) |
| docs/reviews/domain-constants/code-review.md | 1-154 (rounds 1-4) | 154 | yes |
| delta.patch (.sentrux/rules.toml hunk, code-review.md hunk) | all | — | yes |

VERDICT: APPROVE
SPEC: docs/specs/domain-constants/spec.md

FINDINGS:
- [LOW] .sentrux/rules.toml:43 — someone reading why the god-file rule stays armed is told that the rule has "a single named violation" and that it "degrades loudly the day a second file trips it". A second file already trips it, and the same block accepts that file 30 lines higher. So the rationale contradicts the expected state just above it, and the reader cannot tell which part is current. This lot rewrote lines 9-26 to name two god files, but it did not update the paragraph at :43-46 that depends on that count. Fix: reword it to "two named, accepted violations ... the day a third file trips it", matching :19.
  FIX-CLASS: corrects
  RESOLUTION: fixed — .sentrux/rules.toml:43-45 reworded to "two named, accepted violations ... a third file", matching :19; comment-only, rule tables untouched.

Closure of round 4:
Round-4 finding on .sentrux/rules.toml:9 (the stale "exactly ONE violation" total): RESOLUTION confirmed. I ran `sentrux check .` on the worktree (exit 1). It prints exactly `max_cc` (tests/docs/repo-wide-ids-guard.test.ts:extract cc=42, tests/i18n/french-literals.ts:analyseSource cc=39), `max_fn_lines` (tests/i18n/french-literals.ts:analyseSource, 109 lines), `no_god_files` (src/sci-fi.ts fan-out=28, src/cards/hexa-tiles/sci-fi-hexa-tiles-editor.ts fan-out=16) and `✗ 3 violation(s) found`. That is line for line what .sentrux/rules.toml:11-17 records.
Closure of round 3 (re-checked): .verifyignore:24-25 both carry accurate reasons, and the stale "this lot does not touch src/" clause is gone.
Closure of round 1/2: no mutant stands SURVIVED (the three of round 1 were recorded KILLED in round 2), and the packet has no survivors.txt.

NOTES:
- .sentrux/rules.toml:50-51 ("the two workbench functions that used to breach `max_fn_lines` were split") is historical and still true. It sits next to a live `max_fn_lines` violation in tests/i18n/french-literals.ts, which is a different function and is labelled as older. That is not a contradiction.
- Nothing outside the rules.toml comment block moved. The `[constraints]`, `[[layers]]` and `[[boundaries]]` tables are byte-identical to 35f1020 (`git diff 35f1020 -- .sentrux/rules.toml` touches only comment lines). The architecture policy is therefore not loosened.
- The history/*.md and *.hashes.txt files in the delta are archive copies of earlier rounds. I did not audit them as product.

CONFORMANCE EVIDENCE:
- Round-4 RESOLUTION -> .sentrux/rules.toml:11-17 equals the live `sentrux check .` output (3 violations, 2 god files).
- FR-3 (every domain literal through DOMAIN) exception recorded consistently -> .sentrux/rules.toml:22-26 and .verifyignore:25.
