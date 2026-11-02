# Security review — repo-wide-ids-guard (round 1)

AUDITOR: subagent
Packet: .sc/review/136dfca-62e03ba4 (dirty 136dfca..worktree). must_read.txt is empty: no entry point packaged.

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/docs/repo-wide-ids-guard.test.ts | 1-539 | 539 | yes |
| tests/cards/vacuum/vacuum-ids-declared.test.ts | diff hunks | 79 | no (diff only: title rewording, helper removal) |
| tests/utils/bare-range-ids-declared.test.ts | diff hunks | 67 | no (diff only: helper and test removal) |
| tests/cards/water/water-history-aligned.test.ts | diff hunk | 416 | no (diff only: one title string) |
| tests/docs/spec-numbering.test.ts | diff hunk | 103 | no (diff only: one title string) |
| tests/selectors/house.test.ts | diff hunk | 205 | no (diff only: one title string) |
| docs/specs/repo-wide-ids-guard/spec.md | FR-1..FR-5, test plan rows | 133 | no (markdown, no executable surface) |
| docs/specs/02_domain_selectors.md, docs/specs/bare-range-ids/spec.md, docs/specs/vacuum-orphan-ids/spec.md, docs/adversarial-review/*, docs/summaries/repo-wide-ids-guard/* | diff scanned for secrets/URLs | 226/82/107/51/51/22/22 | no (markdown, no executable surface) |

VERDICT: DEPLOY

SURFACES CHECKED:
- Process execution: tests/docs/repo-wide-ids-guard.test.ts:150 calls `execFileSync('git', ['ls-files','-z','-co','--exclude-standard', dir], { cwd: ROOT })` — argv array, no shell, `dir` is only ever the constants 'tests' and 'docs' (lines 283, 291). No injection path.
- Filesystem reads: `read()` (line 27) joins ROOT with paths emitted by git ls-files or hard-coded literals; `walkTests` (line 162-170) skips symlinks via lstat and node_modules. Read-only; no write sink anywhere in the file.
- Parsing of repository content: test sources are parsed with `ts.createSourceFile` (line 88) — syntax tree only, no evaluation, no `eval`/`new Function`/dynamic import. Regexes (lines 156, 174-175, 203, 473) are linear-shape patterns on local files; no ReDoS-relevant nested quantifiers over attacker input.
- Secrets: no credential, token, key or URL introduced in any diffed file (grep of added lines).
- Dependencies: no package.json/lockfile change; `typescript` is an existing devDependency (package.json:42). No npm audit owed for this diff.
- Runtime/product code: none in the diff — nothing ships to the card bundle; no network, auth, or Home Assistant input surface touched.

FINDINGS:
(none)

NOTES:
- The guard reads files listed by git with `-co --exclude-standard`; a tracked symlink in tests/ or docs/ would be followed by readFileSync. This runs only in the developer/CI test process over the repository's own tree, so it is not an exposure.
- `maxBuffer: 64 MiB` on git output is a test-process ceiling, not a security control.
- Judged on text only; the diff carries no infra, so no runtime environment is implicated.
