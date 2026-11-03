# Code review — sf-token-declarations (round 1)

AUDITOR: subagent
PACKET: .sc/review/5708dfb-8222787b (dirty 5708dfb..worktree)

COVERAGE (must_read.txt is empty; every product/test file of files.txt listed):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/styles/token-scan.ts | 1-533 | 533 | yes |
| tests/styles/token-refs.test.ts | 1-425 | 425 | yes |
| tests/styles/token-declarations.test.ts | 1-213 | 213 | yes |
| src/styles/common.ts | diff + :host block 8-64 | 146 | diff + touched block |
| src/components/buttons/sf-button-card.ts | diff hunks | 107 | diff only |
| src/components/sf-hexa-row.ts | diff hunks | 108 | diff only |
| src/components/sf-hexa-tile.ts | diff hunks | 160 | diff only |
| src/components/sf-wheel.ts | diff hunks | 193 | diff only |
| tests/styles/card-css-baseline.json | full diff (132 added lines, aggregated) | 4915 | diff only |
| docs/adr/ADR-018_palette-fixed-identity.md | diff (Erratum) | 267 | diff only |
| docs/specs/03_base_classes.md | diff hunks | 322 | diff only |
| docs/specs/sf-token-declarations/spec.md | 1-164 | 164 | yes |

VERDICT: APPROVE
SPEC: docs/specs/sf-token-declarations/spec.md

Pre-pass (run by the reviewer): `npx vitest run tests/styles/ tests/specs/ids-cas-uniques.test.ts tests/docs/repo-wide-ids-guard.test.ts` -> 9 files, 57 tests passed; `npx vitest run tests/specs/socle-contract.test.ts tests/styles/rem-fallbacks.test.ts tests/styles/card-css-baseline.test.ts tests/docs/` -> 7 files, 64 tests passed; `npx tsc --noEmit -p tsconfig.test.json` -> exit 0. Probe (scratch copy of token-scan.ts run with node over the real src/): the only file resolved as not including the common styles that carries a drifting fallback is src/components/sf-dropdown.ts:43 (`rgba(0, 210, 255, 0.3)`, the live fallback FR-6 keeps).

FINDINGS:
- [MEDIUM] tests/styles/token-scan.ts:437 — a card stylesheet that nobody imports, or that is imported only by another class-less sheet, is silently skipped by the drift guard, so a re-forked fallback in it passes green — FR-5 (class-less sheets resolved through their importers) and the spec's Error Handling row "a class-less card sheet imported by no class is policed by the drift guard, not exempted" plus anti-pattern 8 promise the opposite. The helper returns false for such a sheet, and findDrift (token-scan.ts:488) treats false as "live fallback, skip". The same `false` is produced at token-scan.ts:435 for a file holding any non-styled helper class (`every()` over all classes, not only styled ones), which exempts the styled class beside it. TC-SFT-U-04 pins the exemption (token-refs.test.ts:293 `sheet-orphan -> false`) under a title that says "imported by nobody policed". No current site is affected (probe above). Note the spec itself is contradictory: FR-5 calls a sheet "exempt" when its importer includes the styles, which under FR-4 is the POLICED case; the spec wording has to be settled first (Golden Rule), then the helper must return a third state (unresolved -> policed) or findDrift must police class-less files with no including importer.
  FIX-CLASS: corrects
  RESOLUTION: fixed — spec FR-5/TC-SFT-U-04 wording settled (true/false/null), makeIncludesCommonStyles returns a third state (null = policed), helper classes ignored; proof TC-SFT-U-04 fixtures sheet-orphan -> null, sheet-live -> false, chained sheets, mixed.ts/mixed-live.ts, and findDrift polices null (tests/styles/token-refs.test.ts)
- [MEDIUM] tests/styles/token-declarations.test.ts:141 — the zero-visual-change test on the touched components cannot see a changed fallback: its "before" is computed from the test's own BEFORE table (the declared values), not from the site's fallback, so it only proves that common.ts equals the test's constant — IT-SFT-I-02 (before/after on every touched component) requires the before to be what the site rendered. Mutant run: sf-wheel `var(--sf-text-base, 14px)` -> `15px` leaves this row green (after = 14px from common, before = BEFORE 14px); it is caught only by the drift guard (IT-SFT-I-01). For sf-dropdown, which the drift guard exempts, a changed `--sf-bg-tertiary` / `--sf-border-light` fallback (sf-dropdown.ts:67,74) is caught by nothing. Fix: compute `before` from `r.fallback` without the common sheet, and keep the after-under-common value.
  FIX-CLASS: corrects
  RESOLUTION: fixed — IT-SFT-I-02 takes `before` from each site's own fallback; proof: mutant sf-wheel `var(--sf-text-base, 15px)` now fails "sf-wheel --sf-text-base: expected '14px' to be '15px'" in tests/styles/token-declarations.test.ts, source restored
- [MEDIUM] tests/styles/token-scan.ts:20 — if a follow-up bead id is renamed or dropped in the spec, the tests keep accepting the old id — FR-2 (Existence: "the 8 ids are a constant of the test checked against the References list of this spec"). No test reads the spec's References; token-refs.test.ts:401 compares FOLLOW_UP_BEADS with a second literal copy in the test.
  FIX-CLASS: corrects
  RESOLUTION: fixed — TC-SFT-U-08 reads the spec References line and compares the 8 ids with FOLLOW_UP_BEADS (tests/styles/token-refs.test.ts)
- [LOW] tests/styles/token-refs.test.ts:398 — moving the bead list off the first line of the OPEN_CARD_NAMES comment keeps TC-SFT-U-08 (the first comment line names the 8 beads) green: it searches any line matching "Follow-up beads", not the first one.
  FIX-CLASS: corrects
  RESOLUTION: fixed — TC-SFT-U-08 now takes the first comment content line and requires it to match "Follow-up beads"
- [LOW] tests/styles/token-declarations.test.ts:201 — IT-SFT-I-05 (the four existing guards stay green, the repo guard lists the lot spec) asserts only that each id is cited once in a title; its title "the spec is a tracked lot spec" claims a check it does not make. The four guards were verified green by separate runs (pre-pass above) and the repo-wide ids guard walks directories, so nothing is missing in the product; the test overclaims.
  FIX-CLASS: corrects
  RESOLUTION: fixed — IT-SFT-I-05 retitled to what it checks (the four guards are run green on their own, evidence in the VERIFY run)
- [LOW] tests/styles/token-scan.ts:517 — an OPEN_DRIFT entry without a numeric `max` disables both bounds (`sites.length > undefined` and `undefined > measured` are false) and so allows any number of drifting sites — FR-4 "same ratchet as FR-2" (an entry missing a field fails). The TypeScript type prevents it in the real table; the runtime check does not.
  FIX-CLASS: corrects
  RESOLUTION: fixed — checkDrift refuses a non-integer or < 1 max; proof TC-SFT-U-05 `noMax` case in tests/styles/token-refs.test.ts
- [LOW] tests/styles/token-refs.test.ts:133 — the first TC-307 title was renamed although the spec's Test Case section says "the existing TC-307 titles are kept"; no consumer of the old title was found (grep over the tree), so either keep the old title or amend the spec sentence.
  FIX-CLASS: corrects

  RESOLUTION: fixed — spec Test Case section amended: the first TC-307 title is re-worded and said so (docs/specs/sf-token-declarations/spec.md)
MUTATION: remove the live-fallback skip in findDrift (tests/styles/token-scan.ts:488) — KILLED by IT-SFT-I-01 (sf-dropdown.ts:43 becomes an unowned socle drift)
MUTATION: sf-wheel.ts fallback `var(--sf-text-base, 14px)` -> `15px` — KILLED by IT-SFT-I-01 (`src/components/sf-wheel.ts::--sf-text-base drifts from common.ts at line 21 (15px)`)

NOTES:
- blankComments' quote handling (an apostrophe in template text skips to end of line) is inherited unchanged from the base TC-307 scanner; the new `://` / `(//` URL heuristic would also keep a JS line comment written right after `(`. Not introduced as a regression by this lot.
- The scanner, tables and chain helper live in tests/styles/token-scan.ts and TC-SFT-U-04 / IT-SFT-I-01 sit in token-refs.test.ts: accepted deviation, the spec file list is to be amended in doc-update.
- IT-SFT-I-03 replays the diff on common.ts rather than on the folded baseline of each card; the reviewer checked the committed baseline diff directly: exactly 12 added `:host` declarations x 11 cards, no removed or changed line.
- FR-9 "the allow-lists name the counts as measured": the allow-list comments name no count at all, which is honest; not a defect.

CONFORMANCE EVIDENCE:
- FR-1 (undeclared --sf-* reported with or without fallback; bounded declaration scan; three exits) -> tests/styles/token-scan.ts:161-186, 228-252; TC-SFT-U-01 token-refs.test.ts:157; TC-SFT-U-07 token-refs.test.ts:377.
- FR-2 (HOOKS 4, OPEN_CARD_NAMES 21, family beads, glow-cyan `also`, ratchet) -> token-refs.test.ts:55-85; token-scan.ts:263-310; TC-SFT-U-03/05/06.
- FR-3 (12 declarations, px, bg-tile rename) -> src/styles/common.ts:23-26, 29-33, 45-47; src/components/sf-hexa-tile.ts:28,35,122,128; TC-SFT-U-02.
- FR-4 (drift guard, OPEN_DRIFT bounds/ratchet, font-size exempt) -> token-scan.ts:452-533; token-refs.test.ts:91-109, 404.
- FR-5 (inheritance chain) -> token-scan.ts:394-441 (sf-button-card / -select true, sf-dropdown false, token-refs.test.ts:227-237).
- FR-6 (four canonised fallbacks, dropdown kept) -> sf-button-card.ts:12,21; sf-wheel.ts:19; sf-hexa-row.ts:47; sf-hexa-tile.ts:30,67; values equal common.ts:12,14,15,17.
- FR-7 / FR-11 (Erratum, rule 2, F-BASE-07, TC-307 row) -> ADR-018 Erratum section; 03_base_classes.md:19, 114-120, 298; IT-SFT-I-04.
- FR-8 (baseline only gains the 12 :host declarations) -> tests/styles/card-css-baseline.json diff (132 = 12 x 11 added lines).
- FR-10 (guards green) -> pre-pass runs above.
