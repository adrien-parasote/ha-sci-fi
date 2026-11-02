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
