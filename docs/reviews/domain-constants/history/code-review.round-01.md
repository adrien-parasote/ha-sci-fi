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
