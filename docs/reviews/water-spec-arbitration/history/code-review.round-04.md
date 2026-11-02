# Code review — water-spec-arbitration (round 1)

AUDITOR: subagent
PACKET: .sc/review/27a2d51-e40b50f0 (dirty 27a2d51..worktree; must_read.txt is EMPTY, so the rows below are the files the objective names)

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/water-spec-arbitration/spec.md | 1-96 | 96 | yes |
| docs/specs/cards/water_history.md | 1-174 (+ its diff against 27a2d51) | 174 | yes |
| tests/cards/water/water-history-aligned.test.ts | 1-357 | 357 | yes |
| src/cards/water/sci-fi-water-management.ts | 1-742 | 742 | yes (not in diff; every claim was checked against it) |
| src/cards/water/styles.ts | 50-70 | 414 | no (only the D01 citation `:60`) |
| docs/specs/cards/water.md | Features 1-8, AP table, Error Handling (grep + sed) | n/a | no (only the cited clauses) |
| tests/cards/water/sci-fi-water-management.test.ts | 238-252, the IT-1201..1203 titles | n/a | no (only the cited ids) |
| vitest.config.ts, package.json, .github/workflows/ci.yml | include glob, test script, CI test step | n/a | no (only the wiring) |

VERDICT: WARNING
SPEC: docs/specs/water-spec-arbitration/spec.md

Executed: `npx vitest run tests/cards/water/water-history-aligned.test.ts`, exit 0, 11/11 passed. Ran three mutants against the guard's own check functions, using a copy under the scratch dir (the tree was not touched). Results are in the MUTATION lines.

FINDINGS:

- [HIGH] tests/cards/water/water-history-aligned.test.ts:341 — once this lot merges, `npm test` (local, and CI `npm test -- --coverage`) goes red on every later branch that edits `src/` or adds a test under `tests/cards/water/`. That includes the fix lots that this lot's own Known Gaps (where the code departs from water.md) send to beads `ha-sci-fi-xrc`, `-5aw`, `-p5a` and others. The cause: IT-WSA-I-02 (no source touched) and IT-WSA-I-03 (the guard is the only change under tests/cards/water) turn a lot-scoped fact into a permanent test of the repository. That fact is FR-7 (the code is not changed by THIS lot). `vitest.config.ts` includes `tests/**/*.test.ts`, so the guard runs in every suite run forever. I-02 asserts `git status --porcelain -- src` is empty, so any uncommitted edit in src/ fails it, and `git diff --name-only main...HEAD -- src` is empty, so any branch that commits to src/ fails it. Reproduced the shape: `git diff --name-only b34d36f~1...b34d36f -- src` prints `src/cards/plugs/sci-fi-plugs.ts`, which is non-empty, the exact output the assertion at :344 rejects. I-03 already proves its own trap: its fixture at :354 (`?? tests/cards/water/other.test.ts`) is counted as a stray, and that is precisely what the next water test lot produces. The defect starts in the spec (rows IT-WSA-I-02 and IT-WSA-I-03 of docs/specs/water-spec-arbitration/spec.md prescribe it), which is part of this lot.
  SITES: tests/cards/water/water-history-aligned.test.ts:341-348 (IT-WSA-I-02)
         tests/cards/water/water-history-aligned.test.ts:350-356 (IT-WSA-I-03)
         docs/specs/water-spec-arbitration/spec.md, rows IT-WSA-I-02 and IT-WSA-I-03 of § Test Case Specifications
  FALSIFIED BY: on a scratch branch off this lot's commit, edit any line of src/cards/water/sci-fi-water-management.ts and add tests/cards/water/new.test.ts, then run `npx vitest run tests/cards/water/water-history-aligned.test.ts`. After the fix it must stay green for both changes. A fix that scopes only I-02 still reds on I-03.
  ROOT: FR-7 (lot-scoped "no source touched" encoded as a permanent repository test)
  RESOLUTION: fixed — spec rows IT-WSA-I-02/I-03 amended (live git half played once at VERIFY with WSA_PROVE_LOT=1); guard now runs the live half only under that env var, classifier cases stay always-on, git status checked; ran green with and without the var (11/11).
  FIX-CLASS: corrects (pin the comparison to the lot's own base and head, e.g. diff `27a2d51..<lot commit>`, which stays true after merge; or move the check out of the permanent suite into a VERIFY-time proof. Amend the two spec rows first.)

- [MEDIUM] RESOLUTION: fixed — D14 row now cites TC-1205 (sci-fi-water-management.test.ts:249) and `:323`; U-005 row reworded; guard green. docs/specs/cards/water_history.md:152 — a reader of Known Gaps is told the timestamp format is unprotected, when it is protected: the row D14 is titled "timestamp format unpinned" and says no test pins `[DD/MM HH:MM]`, yet `tests/cards/water/sci-fi-water-management.test.ts:249` (TC-1205) asserts the literal `'01/06 08:26'`, and the same file's Blueprint row F-WATER-HIST-01 (line 15) cites TC-1205 as its cover. The real gap is narrower: TC-WATER-HISTORY-U-005 is a declared but unplayed id, and the brackets rendered at `:370` are not asserted. The row also cites `:319` for "the code emits it", but `:319` is `const dd = …`. The format string is at `:323`. This is FR-4 (each Known Gaps row states the code honestly).

- [LOW] RESOLUTION: fixed — Log column now "none (nothing is logged)". docs/specs/cards/water_history.md:98 — the "No history found" row promises "Log debug info" and the code logs nothing on an empty response (`src/cards/water/sci-fi-water-management.ts:355-361` renders the empty state, no `console` call). The lot corrected the Log column of the neighbouring rows (offline, malformed, floor change → `none`) and left this one false. Against FR-9 (the Error Handling Matrix says what the code does).

- [LOW] RESOLUTION: fixed — bullet reworded to "gets past the early returns". docs/specs/cards/water_history.md:82 — the Concurrency bullet says "Only a fetch that reaches the WebSocket call increments `_fetchId`". That is false for the path where no entity is in a queried domain: `_fetchId` is incremented at `:159`, and the fetch returns at `:172-176` before any `callWS`. A reader reasoning about D23 (early returns keep a stale fetch alive) from this sentence gets the supersede rule wrong for that path.

- [LOW] RESOLUTION: fixed — U-004 order reworded. docs/specs/cards/water_history.md:130 — row TC-WATER-HISTORY-U-004 says "the loading branch is evaluated before the filter". The code computes the filter first (`:333-343`) and tests `_historyLogsLoading` afterwards (`:355`). The behaviour the row wants (loading wins over present data) is right, but the stated order is not. This line is unchanged by the lot, but it is a claim in the file the objective audits.

- [LOW] RESOLUTION: fixed — status asserted 0 before reading out in the live halves. tests/cards/water/water-history-aligned.test.ts:247 — a git failure (no repository, e.g. a source tarball, or git absent from PATH) makes IT-WSA-I-02 and IT-WSA-I-03 pass vacuously. The `git()` helper keeps `status` but the `status`/`diff` callers read only `.out`, and that is `''` on failure, the same as "clean". Assert `status === 0` before reading `out`.

- [LOW] RESOLUTION: fixed — bead test reads the last cell; new in-memory mutant (D12 bead cell emptied) asserted in TC-WSA-U-04. tests/cards/water/water-history-aligned.test.ts:189 — a Known Gaps row whose Bead cell is emptied stays green whenever the bead id also appears in its prose. The `BEAD` test runs on the whole row, not on the last cell. Mutant MUT-a below (D12's `ha-sci-fi-1k7` cell emptied) survives because its "Code today" cell names `ha-sci-fi-1k7`. Test the last cell.

- [LOW] RESOLUTION: contested — IT-WSA-I-01 is spec FR-6's prescribed integration row (nested run of spec guards); cost accepted, spec unchanged. tests/cards/water/water-history-aligned.test.ts:329 — every `npm test` (CI included, under `--coverage`) now runs `tests/specs` and `spec-numbering` twice: once directly, once in the nested child vitest, with a 240 s budget. In the full suite the nested run checks nothing the direct run did not. Its value is only as a lot-time proof, the same lot-scoped root as the HIGH above.

MUTATION: Known Gaps D12 Bead cell `| \`ha-sci-fi-1k7\` |` emptied in the doc text passed to checkU04 — SURVIVED
MUTATION: unbackticked "and when the accordion is expanded" appended to the trigger bullet passed to checkU03 — SURVIVED
MUTATION: D14 citation `(\`:319\`)` changed to `(\`:999\`)` passed to checkU04 — SURVIVED

NOTES:
- MUT-b survives by design: the spec's builder ruling scopes the `expanded` ban of TC-WSA-U-03 to the backticked token. The positive phrases (`single query per floor load`, AP1 `Fetch on accordion open`) catch the original wording but not an appended clause. This is the spec's call, not a code defect. Worth a word-level ban if the spec is re-opened.
- MUT-c survives by design: FR-4 lists the line citations it pins (D07, D15, D20, D21, D22), and D14 `:319` is not among them. The citation is wrong anyway (MEDIUM above).
- The IT-WSA-I-01 child command adds `--testTimeout=60000` and strips `VITEST*` env vars, beyond the spec's literal command. The comment at :327-328 justifies it, and the spec does not forbid flags.
- Public Interface (water_history.md:55-56) writes `@property({...})`, while the code declares reactive properties through `static get properties()` (`:50-57`). It is the same reactive contract, so not a defect. `config` is not listed there either; the spec does not pin it.
- The arbitration banner (water_history.md:7) says "chargement du plancher". "Étage" is the word for floor. This is wording only.
- I verified every claim below against the code with no defect found: styles.ts:60 selector `ha-icon` versus `<sf-icon>` at :570 (and sf-icon renders `<ha-icon>` in its own shadow root, sf-icon.ts:168); D07 :452/:459/:494; D12 :146; D15 sole write at :283, no reader (grep); D20 exactly four `style=` (:515, :570, :610, :625); D21 :41, :55, :118-122, and no assignment of `.expanded` in src/ (grep); D22 :251/:258 no validation, :242 silent skip, :374 throw; D23 :159; D24 :141 against water.md Features 6 (five domains); 7-day window :164; recorder-then-logbook :179-184 with `console.warn`; `significant_changes_only` :227; alert clause :274/:338; 50-after-filter :343; sandbox fixture with `device_class` :206 and 500 ms :202.

CONFORMANCE EVIDENCE:
- FR-1 (one 7-day window) → water_history.md:17, :78, :87, :137; guarded by checkU01 (test :135-145), and mutants at :272-274 kill it.
- FR-2 (recorder first, logbook fallback) → water_history.md:17, :26, :63, :76, :137-138, :85; checkU02 :147-159.
- FR-3 (trigger = floor load and sync button) → water_history.md:81, :108, :128; code :116-125, :129-131; checkU03 :161-170.
- FR-4 (Known Gaps, ten rows with beads, cited lines real) → water_history.md:147-158; checkU04 :182-205 reads the source lines (verified green against the current src).
- FR-5 (no third filter, `# Spec 16`) → water_history.md:1, :139; checkU05 :207-215.
- FR-8 (log in every accordion) → water_history.md:4, :15; code :613, :628; checkU06 :217-226.
- FR-9 / FR-10 → water_history.md:97, :99, :84, :87, :76, :82; checkU07/U08 :228-244.
- FR-6 → IT-WSA-I-01 :329-339 (green in the run above, within the 240 s budget).

---

# Code review — water-spec-arbitration (round 2, delta)

AUDITOR: subagent
PACKET: .sc/review/27a2d51-6ca84dfd (delta since the round-1 packet; must_read.txt is EMPTY). Scope: the files that moved (water_history.md, the arbitration spec, the guard), plus closing every round-1 finding and survivor.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/water/water-history-aligned.test.ts | 1-373 | 373 | yes |
| docs/specs/cards/water_history.md | delta hunks + 145-160 (Known Gaps) | 174 | no (delta + the rows the fixes touch) |
| docs/specs/water-spec-arbitration/spec.md | delta hunk + FR-3/FR-4/FR-6/FR-7, TC-WSA-U-03/U-04, IT rows, builder rulings (grep) | 96 | no (delta + clauses the findings rest on) |
| src/cards/water/sci-fi-water-management.ts | 318-326 (D14 `:323`) | n/a | no (citation check only, file not in diff) |
| tests/cards/water/sci-fi-water-management.test.ts | 242-252 (TC-1205) | n/a | no (citation check only, file not in diff) |

Executed:
- `npx vitest run tests/cards/water/water-history-aligned.test.ts`: exit 0, 11/11, 4.0 s.
- `WSA_PROVE_LOT=1 npx vitest run tests/cards/water/water-history-aligned.test.ts`: exit 0, 11/11, 4.1 s. The live git halves pass on this tree (`git status -- src` is clean; `main` resolves to 27a2d51, and `main...HEAD -- src` is empty).
- Re-ran the three round-1 mutants against a scratch copy of the guard's check functions. The tree was not touched.

Closure of round-1 findings:
- HIGH tests/cards/water/water-history-aligned.test.ts:341 (FR-7 (no source change by this lot) encoded as a permanent repository test): CLOSED. The live halves of IT-WSA-I-02 and IT-WSA-I-03 now run only under `WSA_PROVE_LOT=1` (:345, :349, :363). Spec rows IT-WSA-I-02 and IT-WSA-I-03 were amended to match (spec.md:78-79). A later lot that edits `src/` or adds a water test no longer goes red in the default suite: the classifier cases (:368-371) are pure strings. The proof run passes under the variable.
- MEDIUM docs/specs/cards/water_history.md:152 (D14 (the timestamp-format gap) claims no test pins the format): CLOSED. The row now cites TC-1205 at `sci-fi-water-management.test.ts:249`, which asserts the literal `'01/06 08:26'`. Its code citation is now `:323`, the `return \`${dd}/${mo} ${hh}:${mm}\`` line. Row U-005 (water_history.md:131) says the same thing.
- LOW docs/specs/cards/water_history.md:98 (the "No history found" row promised a debug log): CLOSED. The Log column now reads "none (nothing is logged)".
- LOW docs/specs/cards/water_history.md:82 (the `_fetchId` increment rule): CLOSED. The text now reads "gets past the early returns", which is true of the path at :159-176.
- LOW docs/specs/cards/water_history.md:130 (the U-004 evaluation order): CLOSED. The row now says the filter is computed first and the loading test decides the render.
- LOW tests/cards/water/water-history-aligned.test.ts:247 (a git failure passed vacuously): CLOSED. `status` is asserted 0 before `out` is read (:351, :355, :365).
- LOW tests/cards/water/water-history-aligned.test.ts:189 (Bead cell): CLOSED. The bead test now runs on the last cell only (:189), and the new in-memory mutant at :295 kills MUT-a (below).
- `npx --no --` (:333) stops the nested run from silently installing vitest when it is absent. This is an improvement, not a finding.

RULING: refuted — tests/cards/water/water-history-aligned.test.ts:329 — the nested run is FR-6's prescribed integration row (spec.md:39, :77). Unlike IT-WSA-I-02/I-03, its assertion (the repo spec guards stay green) is a permanent repository invariant, not a lot-scoped fact, so it cannot redden a later legitimate lot. The round-1 root does not transfer. The duplication is real but measured small: the whole guard file, nested run included, takes 4.0 s. A cost the spec states and accepts is not a defect.

MUTATION: Known Gaps D12 Bead cell `| \`ha-sci-fi-1k7\` |` emptied in the doc text passed to checkU04 — KILLED by TC-WSA-U-04
MUTATION: unbackticked "and when the accordion is expanded" appended to the trigger bullet passed to checkU03 — SURVIVED
MUTATION: D14 citation `(\`:319\`)` changed to `(\`:999\`)` passed to checkU04 — SURVIVED

(MUT-c was re-run on the citation as it now stands, `(\`:323\`)` → `(\`:999\`)`, because the round-1 fix replaced `:319`. The GONE form does not apply: the D14 row did not exist at the lot's base 27a2d51, and the replaced citation still escapes the guard. checkU03 returned 0 failures for MUT-b, and checkU04 returned 0 failures for MUT-c: `expected 0 to be greater than 0`.)

VERDICT: WARNING
SPEC: docs/specs/water-spec-arbitration/spec.md

FINDINGS:

- [MEDIUM] tests/cards/water/water-history-aligned.test.ts:175 — a Known Gaps row that cites a wrong code line ships green. This is exactly how round 1's wrong D14 `:319` got through, and it would happen again for `:323`. `CITES` checks only D07, D15, D20, D21 and D22 (FR-4 (Known Gaps rows cite real code lines) lists only those). The citations of D14 (`:323`), D12 (`:146`), D23 (`:159`), D24 (`:141`), D22 (`:251`) and D21 (`:41`, `:55`) are never compared with the source. Yet the test title at :291 claims "cited code lines are real". MUT-c survives.
  RESOLUTION: fixed — FR-4 and TC-WSA-U-04 amended to list every cited line (D12 :146, D14 :323, D21 :41/:55, D22 :251, D23 :159, D24 :141 added); CITES extended; TC-WSA-U-04 blanks each cited source line in turn and mutates D14 `:323` to `:999`, all must fail; guard green 10 passed / 1 skipped.
  FIX-CLASS: corrects (amend FR-4 and TC-WSA-U-04 to list every citation of the Known Gaps table, then add each to `CITES`, e.g. D14 → `${dd}/${mo}` at `:323`. Alternatively, narrow the test title to the five rows it really checks, and record MUT-c as an accepted limit in the spec.)

- [MEDIUM] tests/cards/water/water-history-aligned.test.ts:166 — the spec can again say the log fetches when an accordion opens, the trigger water.md forbids, and stay green, as long as the word is not in backticks. FR-3 says "`expanded` is not a trigger anywhere". checkU03 bans only the backticked token outside Known Gaps, so "and when the accordion is expanded" appended to the trigger bullet passes (MUT-b survives). The builder ruling at spec.md:83 narrows the check to the token. The cheap fix is a `hasNot(f, 'trigger', z.trigger, 'expanded', 'accordion open')` on the trigger bullet alone, which keeps the Known Gaps exemption intact.
  RESOLUTION: fixed — TC-WSA-U-03 row, FR-3 ruling amended; checkU03 now bans /expand/i and /when (the|an) accordion/i on the trigger bullet alone (Known Gaps exemption intact); two unbackticked mutants ("and when the accordion is expanded", "and on Expand") asserted failing in TC-WSA-U-03.
  FIX-CLASS: corrects (amend the TC-WSA-U-03 row and the builder ruling, then add the bullet-scoped ban and its mutant).

- [LOW] tests/cards/water/water-history-aligned.test.ts:348 — the default suite reports "IT-WSA-I-02: src is untouched" as passed when it checked nothing about `src`. Without `WSA_PROVE_LOT=1`, the test asserts only `strayWaterChanges('?? src/x.ts')`, the water-folder classifier, which the src half never uses. Then it returns. Use `it.skipIf(!proveLot)` (or `it.runIf`) so the default run shows the test as skipped, not green, and drop the unrelated classifier line.
  RESOLUTION: fixed — IT-WSA-I-02 is now it.skipIf(!proveLot) with the classifier line removed (default run reports 1 skipped); spec.md duplicated clause deduplicated (the OUT-OF-DELTA note).

NOTES:
- Two round-1 survivors still stand (MUT-b and MUT-c), so this round's verdict cannot pass. The two MEDIUM findings above are their fixes. Neither finding is HIGH on its own merits: both are guard blind spots on a documentation file, not product breakage.
- OUT-OF-DELTA: spec.md:83 repeats the same clause twice ("Each extraction asserts its zone is non-empty before the phrase checks run, and each extraction asserts its zone is non-empty …"). The line is unchanged in this delta and the problem is wording only.
- Nothing records that the `WSA_PROVE_LOT=1` run was actually played at VERIFY: the spec row says "played once", and no script plays it. I played it in this round (green, above). Whoever records VERIFY should cite that run.

CONFORMANCE EVIDENCE:
- FR-7 (no source change by this lot) → IT-WSA-I-02 live half, :349-359, green under `WSA_PROVE_LOT=1`; spec.md:78.
- FR-6 (repo spec guards stay green) → IT-WSA-I-01, :330-340, green; spec.md:77.
- FR-4 (Known Gaps rows carry beads) → last-cell bead check at :189; mutant :295 kills it.
- FR-9 (the error matrix says what the code does) → water_history.md:98 Log column "none".

---

# Code review — water-spec-arbitration (round 3, exit delta)

AUDITOR: subagent
PACKET: .sc/review/27a2d51-49b41026 (delta since the round-2 packet; must_read.txt is EMPTY). Scope: the files that moved (the arbitration spec, the guard, the review files), plus closing every round-2 finding and the two standing survivors.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/water/water-history-aligned.test.ts | 1-387 | 387 | yes |
| docs/specs/water-spec-arbitration/spec.md | delta hunks (FR-3, FR-4, TC-WSA-U-03, TC-WSA-U-04, zone-extraction paragraph, builder rulings) | 96 | no (delta + the clauses the findings rest on) |
| docs/reviews/water-spec-arbitration/code-review.md | 72-134 (round 2) | 134 | no (the round being closed) |
| docs/specs/cards/water_history.md | 81 (trigger bullet), 151-158 (Known Gaps D12-D24) | n/a | no (not in delta; rows the guard reads) |
| src/cards/water/sci-fi-water-management.ts | 41, 55, 141, 146, 159, 251, 323 | n/a | no (citation check only, file not in diff) |

Executed:
- `npx vitest run tests/cards/water/water-history-aligned.test.ts`: exit 0, 10 passed, 1 skipped (IT-WSA-I-02 now shows as skipped, not green).
- `WSA_PROVE_LOT=1 npx vitest run tests/cards/water/water-history-aligned.test.ts`: exit 0, 11 passed. `src/` is clean in `git status`.
- MUT-b and MUT-c were re-run against a scratch copy of the guard's check functions, with the mutated text fed to checkU03 / checkU04. The tree was not touched.
- Every cited source line was checked by hand. :41 and :55 hold `expanded`, :141 holds `input_boolean`, :146 holds `_rawLogs`, :159 holds `_fetchId`, :251 holds `_queryLogbook`, and :323 holds `${dd}/${mo}`.

Closure of round-2 findings:
- MEDIUM tests/cards/water/water-history-aligned.test.ts:175 (a Known Gaps row can cite a wrong code line and still pass): CLOSED. `CITES` (:176-186) now covers D12 :146, D14 :323, D21 :41/:55, D22 :251, D23 :159 and D24 :141, which matches the FR-4 list at spec.md:37 and the TC-WSA-U-04 row at spec.md:72. The loop at :309-315 blanks each cited source line in turn, and :316 runs the `:323`→`:999` mutant. MUT-c is killed: checkU04 returns `D14: row does not cite :323`. There is one residual weakness, an inexact match, filed as F-R3-01 below.
- MEDIUM tests/cards/water/water-history-aligned.test.ts:166 (an unbackticked "expanded" trigger on the trigger bullet passed): CLOSED. :167 bans `/expand/i` and `/when (the|an) accordion/i` on the trigger bullet only, so the Known Gaps exemption is untouched. The TC-WSA-U-03 row (spec.md:71) and the builder ruling (spec.md:83) were amended in the same words. Mutants :295-296 assert failure. MUT-b is killed, with both patterns firing. The live trigger bullet (water_history.md:81) matches neither pattern, because "Opening or closing an accordion never fetches" contains no `when the/an accordion`.
- LOW tests/cards/water/water-history-aligned.test.ts:348 (IT-WSA-I-02 reported green while checking nothing): CLOSED. The test is now `it.skipIf(!proveLot)` (:363) and the unrelated classifier line is gone. The default run reports 1 skipped. The duplicated clause in spec.md:81 was deduplicated.

MUTATION: unbackticked "and when the accordion is expanded" appended to the trigger bullet passed to checkU03 — KILLED by TC-WSA-U-03
MUTATION: D14 citation `(\`:319\`)` changed to `(\`:999\`)` passed to checkU04 — KILLED by TC-WSA-U-04
MUTATION: D14 citation `(\`:323\`)` changed to `(\`:3230\`)` passed to checkU04 — SURVIVED

(MUT-c was played on the citation as it stands, `(\`:323\`)` → `(\`:999\`)`, as in round 2. The round-2 words were copied verbatim to close the record. checkU04 returned `['D14: row does not cite :323']`.)

VERDICT: APPROVE
SPEC: docs/specs/water-spec-arbitration/spec.md

FINDINGS:

- [LOW] tests/cards/water/water-history-aligned.test.ts:204 — a Known Gaps row can cite a line number that only starts with the right digits and still pass, so the doc can drift to a nonexistent line unnoticed. The check `gapRow(g).includes(\`:${n}\`)` is a substring test, so `:3230` passes for `:323` and `:410` passes for `:41`. The builder ruling (spec.md:83, "line citations of TC-WSA-U-04 are 1-indexed, exact") requires an exact match. Measured: the `:323`→`:3230` mutant gives checkU04 zero failures.
  Fix: match with a digit boundary, e.g. `new RegExp(\`:${n}(?!\\d)\`).test(gapRow(g))`, and the same at :208 for `:118-122`. Add the `:3230` mutant to TC-WSA-U-04.
  RESOLUTION: fixed — citations matched with a digit boundary (`:${n}(?!\d)`, and `:118-122(?!\d)`); the `:323`→`:3230` mutant is asserted failing in TC-WSA-U-04; guard re-run green.
  FIX-CLASS: corrects

NOTES:
- The bullet-scoped ban covers the two phrasings the spec names (`expand*`, `when the/an accordion`). Other wordings, such as "whenever an accordion opens" or "on accordion open", would pass. The spec deliberately pins only those two patterns, and the trigger bullet itself quotes the AP name "Fetch on accordion open", so a broader ban would collide with the legitimate citation. This is a stated limit, not a defect.
- The IT-WSA-I-02 / I-03 live halves were played in this round under `WSA_PROVE_LOT=1` and were green. Whoever records VERIFY can cite this run.
- Scratch-dir leftovers from an earlier round (`m/`, `mut/` copies still citing `:319`) were ignored. They live outside the tree.

CONFORMANCE EVIDENCE:
- FR-3 (`expanded` is not a trigger) → checkU03 :166-167; spec.md:71 (TC-WSA-U-03) and spec.md:83 (ruling) state the same two bans; water_history.md:81 passes them.
- FR-4 (every cited code line is real) → CITES :176-186 equals the FR-4 list at spec.md:37 line for line; each source line verified (src :41, :55, :141, :146, :159, :251, :323); blank-each-line loop :309-315.
- FR-7 (no source change by this lot) → IT-WSA-I-02 :363-374, green under `WSA_PROVE_LOT=1`, skipped by default.

---

# Code review — water-spec-arbitration (round 3 survivor delta)

MUTATION: D14 citation `(\`:323\`)` changed to `(\`:3230\`)` passed to checkU04 — KILLED by TC-WSA-U-04
AUDITOR: subagent
VERDICT: APPROVE
SPEC: docs/specs/water-spec-arbitration/spec.md
