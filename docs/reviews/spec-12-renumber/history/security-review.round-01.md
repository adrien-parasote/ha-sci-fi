# Security review — spec-12-renumber

AUDITOR: subagent
PACKET: .sc/review/8ca174c-026ac6d8 (dirty, base 8ca174c)

COVERAGE (the packet's must_read.txt is EMPTY: no entry point packaged; rows below are the diff scope):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/fixtures/spec-numbers.ts | 1-27 | 27 | yes |
| tests/docs/spec-numbering.test.ts | 1-96 | 96 | yes |
| tests/specs/delivered-design.test.ts | diff hunks (32-58, 283-302) | 406 | no (diff only; unchanged remainder out of scope) |
| tests/cards/water/sci-fi-water-management.test.ts | diff hunk 120-126 | 713 | no (one-line describe rename) |
| docs/specs/cards/plugs.md | diff hunk 920-926 | 930 | no (one-line link change) |
| docs/specs/cards/vacuum.md | diff hunk 973-978 | 978 | no (one-line link change) |
| docs/specs/cards/water_history.md | diff hunk 1-4 | 153 | no (title line change) |
| docs/specs/spec-12-renumber/spec.md | 1-80 | 80 | yes |
| docs/summaries/spec-12-renumber/BUILD.md | 1-15 | 15 | yes |
| docs/summaries/spec-12-renumber/SPEC.md | 1-20 | 20 | yes |
| docs/adversarial-review/spec-12-renumber.md | grep scan (secrets, URLs, absolute paths) | 57 | no (review prose) |
| docs/adversarial-review/history/spec-12-renumber.round-01.md | grep scan | 57 | no (review prose) |
| docs/adversarial-review/history/spec-12-renumber.round-02.md | grep scan | 57 | no (review prose) |

VERDICT: DEPLOY

SURFACES CHECKED:
- Shipped code: none. No file under src/ changes; dist/ untouched. The diff is docs plus vitest tests only, nothing reaches the Home Assistant card bundle or the browser.
- Process execution in tests: tests/docs/spec-numbering.test.ts:15 and tests/specs/delivered-design.test.ts (lsFiles) call execFileSync('git', [fixed argv]) with cwd fixed to the repo root, no shell, no interpolated input. Directory arguments are string literals. No command injection path.
- File reads in tests: readFileSync on paths coming from git ls-files of the repo itself or literals; dev-time only, no external input.
- Regex DoS: /^#\s+Spec\s+(\d+)/m (tests/fixtures/spec-numbers.ts:9), /\]\([^)]*12_vehicle_card_design_update\.md/ (tests/docs/spec-numbering.test.ts:73), /^docs\/specs\/(cards\/)?[^/]+\.md$/ — all linear, no nested quantifiers, inputs are repo files.
- Secrets: grep for token/secret/password/api key/bearer/absolute home paths/URLs over every new file returned nothing (exit 1).
- Markdown links: the two changed links are relative (./vehicles.md#L1), no external URL introduced.
- Dependencies: no package.json / lockfile change, so no dependency audit owed for this lot.

FINDINGS:
none

NOTES:
- Diff is a documentation renumbering plus guard tests; there is no user input, auth, network or HA-entity handling in scope.
- Pre-existing dead links in plugs.md and vacuum.md (./03_base_classes.md, ./11_stove_card_design_update.md, ./13_plugs_card_design_update.md) are documented as out of scope by FR-4 (the vehicle link row is repointed, other dead links left); they are not a security concern.
- No infra in the diff; nothing about runtime environment is certified here.
