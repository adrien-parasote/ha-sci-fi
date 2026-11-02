# Security review — vehicles-orphan-ids

AUDITOR: subagent
Packet: `.sc/review/c4463fd-71e8f19f` (dirty c4463fd..worktree)

COVERAGE (must_read.txt is EMPTY: no entry point was packaged; rows below are the packet's files.txt):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| docs/specs/vehicles-orphan-ids/spec.md | 1-130 | 130 | yes |
| tests/cards/vehicles/vehicles-ids-declared.test.ts | 1-140 | 140 | yes |
| tests/cards/vehicles/sci-fi-vehicles.test.ts | diff hunks (9 title lines + context) | 577 | no — diff only; change is title strings |
| docs/specs/cards/vehicles.md | diff hunks (3) | 742 | no — diff only; docs table rows |
| docs/summaries/vehicles-orphan-ids/BUILD.md | grep for secrets/paths/URLs | 20 | no — scanned |
| docs/summaries/vehicles-orphan-ids/SPEC.md | grep for secrets/paths/URLs | 26 | no — scanned |
| docs/adversarial-review/vehicles-orphan-ids.md | grep for secrets/paths/URLs | 51 | no — scanned |
| docs/adversarial-review/history/vehicles-orphan-ids.round-01.md | not read (history copy of round 01) | 51 | no |

VERDICT: DEPLOY

SURFACES CHECKED:
- Production code: `git diff --stat c4463fd -- src package.json package-lock.json` is empty — no runtime source, no dependency, no lockfile changes. Nothing ships to the browser bundle from this lot.
- User input boundaries: none touched. The only changed product-adjacent file is a test file whose nine `it(` title strings were renamed; bodies, mocks (`callService`, `addMessage`) unchanged per the diff.
- New guard `tests/cards/vehicles/vehicles-ids-declared.test.ts`: reads four fixed repo-relative paths via `readFileSync(join(process.cwd(), p))` — constants only, no path derived from external input. Regexes (`TITLE_RE`, `headsOf`, `BAN_RE`, `RETIRED_RE`) run on repo files under developer control, at test time only; no hostile-input ReDoS surface. `new RegExp` is built from constant fragments only.
- Secrets: grep of the new docs for token/secret/password/api key/home-directory paths/URLs — no hit beyond an id-rename sentence.
- Auth, sessions, CSP, HTML sinks, HA service calls: not in the diff.
- Dependency audit: not run — no dependency file moved in this lot.

FINDINGS: none

NOTES:
- Diff is docs + tests only; the security surface of the card (HA `callService`, rendering of entity state) is unchanged and was not re-audited here.
- The guard's regexes use nested quantifiers (`TITLE_RE`), which would be a ReDoS concern on untrusted input; here the input is the repo's own test file, so it is not a defect.
- Static read only; no runtime infrastructure is in this diff.
