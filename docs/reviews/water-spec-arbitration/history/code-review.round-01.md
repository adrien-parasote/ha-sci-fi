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
