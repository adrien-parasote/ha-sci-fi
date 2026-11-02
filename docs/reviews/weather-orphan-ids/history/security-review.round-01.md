# Security review — weather-orphan-ids

AUDITOR: subagent
Packet: .sc/review/7b8b4d5-90fda7d2 (first round, no delta.txt). Spec: docs/specs/weather-orphan-ids/spec.md.

COVERAGE (must_read.txt is EMPTY: no entry point was packaged; rows below are the packet's files.txt):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/weather/weather-ids-declared.test.ts | 1-107 (new file, whole diff) | 107 | yes |
| tests/cards/weather/sci-fi-weather.test.ts | diff hunks only (4 title lines + context) | 406 | no — diff-only; change is 4 `it(` title strings |
| docs/specs/cards/weather.md | diff hunk (1 added table row) | 154 | no — diff-only |
| docs/specs/weather-orphan-ids/spec.md | 1-106 (new file) | 106 | yes |
| docs/adversarial-review/weather-orphan-ids.md | grep for sinks/secrets | 47 | no — documentation |
| docs/adversarial-review/history/weather-orphan-ids.round-01.md | grep for sinks/secrets | 47 | no — documentation |
| docs/summaries/weather-orphan-ids/BUILD.md | 1-24 | 24 | yes |
| docs/summaries/weather-orphan-ids/SPEC.md | 1-25 | 25 | yes |

VERDICT: DEPLOY

SURFACES CHECKED:
- Input boundaries: none in the diff. No runtime source under src/ is touched; the lot changes four test titles, adds one spec row, adds one vitest guard and documentation.
- New guard (tests/cards/weather/weather-ids-declared.test.ts): reads three fixed, repo-relative paths via readFileSync(join(process.cwd(), <constant>)) — no user-controlled path, no traversal surface. No eval, no new Function, no child_process, no network, no dynamic import (grep of eval|exec|child_process|fetch|http).
- Regex DoS: TITLE_RE's repeated group `(?:[^()]|\([^()]*\))*` has disjoint alternatives (no catastrophic backtracking); RegExp built from constant ID pattern only, never from file content. Inputs are repository files, not attacker-supplied at runtime.
- Secrets: grep of token|secret|password across the new guard and the adversarial-review docs — no credentials, no keys, no tokens.
- Dependencies: no package.json / lockfile change in files.txt; no dependency audit owed for this lot.
- Rendering sinks (innerHTML / unsafeHTML): none introduced.

FINDINGS:
(none)

NOTES:
- The lot is test- and documentation-only; it ships no code to the card bundle, so no hostile-network surface is added or changed.
- The guard reads files relative to process.cwd(); running vitest from another directory makes it fail closed (readFileSync throws), which is a test-ergonomics matter, not a security defect.
- docs/summaries/weather-orphan-ids/BUILD.md mentions internal state files (.sc/task.md, .sc/smoke.yaml) by repo path only; no secret or host path is disclosed.
- Static read only: no runtime infrastructure is in this diff.
