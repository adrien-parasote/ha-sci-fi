AUDITOR: subagent
COVERAGE (must_read.txt of packet .sc/review/27a2d51-e40b50f0 is EMPTY: no entry point packaged; rows below are the files the objective names):
| file | lines read | total (wc -l) | full read? |
| tests/cards/water/water-history-aligned.test.ts | 1-357 | 357 | yes |
| docs/specs/cards/water_history.md | 1-174 | 174 | yes |
| docs/specs/water-spec-arbitration/spec.md | grep for security/child-process constraints (lines 77, 81, 91) | 96 | no (scoped grep) |
| src/cards/water/sci-fi-water-management.ts | 135-170, 240-260, 365-380 + grep for unsafe sinks | n/a | no (claim checks only, file not in diff) |
| .sc/review/27a2d51-e40b50f0/diff.patch | secret-pattern grep over the whole patch | n/a | grep |
VERDICT: DEPLOY
SURFACES CHECKED:
- Child processes in the guard test: `spawnSync('git', args, …)` (line 248) and `spawnSync('npx', ['vitest', 'run', …], …)` (line 332). Both use argv arrays with no `shell: true`. Every argument is a literal in the source (`status`, `--porcelain`, `rev-parse`, `main...HEAD`, the fixed test paths). No document text, no environment value and no user input reaches an argument, so there is no command or argument injection path. `cwd` is the repo root, worked out from `__dirname`. Both calls have a timeout of 240000 ms. The env is a copy of `process.env` with only the `VITEST*` keys removed, so nothing is added to it.
- npx resolution: the worktree has no `node_modules/.bin/vitest`. I checked whether `npx` would fall back to downloading an unpinned package from the registry. With PATH cut down to system dirs plus node, `npx --no -- vitest --version` printed `vitest/5.0.5` and exited 0. That is the ancestor install, the same version package.json pins (`^5.0.5` → 5.0.5). No registry fetch happens in this layout.
- File reads: `readFileSync(resolve(ROOT, rel))` with three constant relative paths. No path is built from input.
- Failure messages put child stdout/stderr into the assertion text (line 338). That is the output of a local vitest run on repo docs, with no credentials in scope.
- Secrets: I grepped diff.patch for key, token, password, bearer, JWT, `ghp_` and `sk-` patterns. The only matches are the prose word "token" in the adversarial review and summaries. No credentials.
- Sanitization and validation claims in water_history.md, checked against src/cards/water. Anti-Pattern 2 (no `unsafeHTML`/innerHTML; render with Lit template expressions): grep finds no `unsafeHTML`, `innerHTML`, `unsafeCSS` or `unsafeSVG` in src/cards/water. Log fields are interpolated as Lit text bindings (`${log.name} -> ${log.state.toUpperCase()}`, sci-fi-water-management.ts:374), so HTML is escaped. The Error Handling Matrix "malformed events" row and Known Gap D22 (malformed rows are not ignored) say the logbook path validates nothing and that `toUpperCase()` at :374 throws on a row with no `state`. The code matches: `_queryLogbook` (around :251) maps fields without checks, and the recorder path skips rows with no `state`/`when` (around :242). The Empty State Guard and Concurrency claims (`_fetchId` is incremented after the early returns, :159) match the code. The doc no longer claims protections the code lacks: offline cache, timeout and retry are all stated as absent (D12, the offline cache withdrawal).
FINDINGS:
(none)
NOTES:
- This is a docs-and-test-only lot. src/ is unchanged (IT-WSA-I-02 asserts it). No runtime surface, endpoint, auth path or dependency changes, so I did not run a dependency audit: the lockfile and package.json are not in the diff.
- D22 is a render crash when Home Assistant returns a logbook row with no `state`. It is a robustness gap against a trusted upstream (the user's own HA instance), not an attacker-reachable vulnerability. It is in src/ (outside this diff) and already tracked by bead `ha-sci-fi-5aw`. Recorded here as an existing gap, not a finding.
- The "Constraints / Always do: validate HA API responses" line in water_history.md is an intent that the code does not yet meet on the logbook path. The doc says so openly under D22, which is the honest state for a spec that does not change the code.
- The `npx` call depends on the ancestor `node_modules` being present. If it were missing, npx in a non-TTY context would assume yes and fetch `vitest` from the registry. Calling the resolved local binary through `process.execPath`, or passing `--no`, would close that. In the current layout this does not happen (shown above), and this is a test harness, not shipped code. I am noting it as hardening, not reporting a defect.
- I judged infra and environment from text and one local resolution check only. Nothing here runs in production.

---

## Round 2 (re-review, packet .sc/review/27a2d51-6ca84dfd, delta.patch)

AUDITOR: subagent
COVERAGE (scope is the files delta.txt lists plus how every round-1 finding was closed. Round 1 raised no finding, so nothing needs closing):
| file | lines read | total (wc -l) | full read? |
| tests/cards/water/water-history-aligned.test.ts | delta hunks (186-189, 292-296, 330-373) + 10-18, 240-262 + grep for spawn/shell/env/exec/readFileSync sinks | 373 | no (delta + all sinks traced) |
| docs/specs/cards/water_history.md | delta hunks (79-85, 95-101, 127-134, 149-155) | 174 | no (delta only; full read in round 1) |
| docs/specs/water-spec-arbitration/spec.md | delta hunk (75-82) | 96 | no (delta only) |
| docs/reviews/water-spec-arbitration/* (review files and history) | not judged: reviewer artifacts, not product code | n/a | n/a |
VERDICT: DEPLOY
SURFACES CHECKED:
- New input `process.env.WSA_PROVE_LOT` (test line 345). It is compared strictly with `=== '1'` and used only as a boolean gate. Its value never reaches an argument, a path or a command, so it opens no injection path.
- `git` child processes (helper at line 247-249, `spawnSync('git', args, …)`). The helper takes an argv array, does not set `shell: true`, and runs with `cwd` set to ROOT, which comes from `__dirname`. Every call site in the delta passes only literals: `status --porcelain -- src`, `rev-parse --verify main`, `diff --name-only main...HEAD -- src`, `status --porcelain -- tests/cards/water`. Nothing from the docs, the environment or git's own output is passed back into an argument. The new checks on `st.status` and `d.status` make a failing git call fail the test instead of reading as an empty, passing output.
- `npx` call (line 333) now passes `['--no', '--', 'vitest', …]`. `--no` stops npx from installing a package it cannot resolve, so a missing local install now fails the test instead of fetching an unpinned `vitest` from the registry. This closes the hardening note from round 1. The argv is still all literals, with no shell, and the env is still the `VITEST*`-stripped copy of `process.env`.
- `strayWaterChanges` classifier (lines 252-256). It is a pure string function. The new always-on inputs are literal fixtures in the test source.
- `checkU04` bead check (line 189). It runs a regex over the last table cell of a repository doc. `BEAD` is anchored to a fixed alphabet with no nested quantifiers, so there is no ReDoS risk on repository-controlled text.
- Spec and doc text deltas (the water_history.md Concurrency, Error Handling Matrix, TC-U-004/U-005 and D14 rows; the spec.md IT-WSA-I-02/I-03 rows). These are wording changes. They add no security claim the code would have to back up. The "No history found" row now says `none (nothing is logged)`, which matches the code: no log is written, so no data is exposed. The D14 row and the line references (`:323`) are about formatting, not security.
- Secrets: I scanned the delta hunks of the test and both specs by eye. They contain no credentials, tokens or keys.
FINDINGS:
(none)
NOTES:
- Correction to round 1: round 1 said "both calls have a timeout of 240000 ms", but the `git` helper (line 248) sets no `timeout`. Only the `npx` call does. A hung `git` would stall the test until the vitest per-test timeout. That is a robustness issue in a local test harness, not a security defect, and it is not a finding.
- Putting the live git half behind `WSA_PROVE_LOT=1` is a documented decision (spec.md IT-WSA-I-02/I-03, "played once at VERIFY"). In a default run, FR-7 (no source touched by this lot) is proven only by the classifier fixtures, not by the live tree. That is a matter of test coverage, decided in the spec. It is not a security defect.
- The lot is still docs and tests only: src/, package.json and the lockfile are not in the delta, so I did not run a dependency audit. I judged the text only. Nothing here runs in production.
