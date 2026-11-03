# Security review — sf-token-declarations

AUDITOR: subagent
PACKET: .sc/review/5708dfb-8222787b (dirty 5708dfb..worktree)

COVERAGE (must_read.txt of the packet is EMPTY — no entry point packaged; rows below are the code files of the diff):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/styles/common.ts | diff hunks (+14) | 146 | no — diff only (static `css` literal, no interpolation added) |
| src/components/buttons/sf-button-card.ts | diff hunks (2 lines) | 107 | no — diff only |
| src/components/sf-hexa-row.ts | diff hunk (1 line) | 108 | no — diff only |
| src/components/sf-hexa-tile.ts | diff hunks (6 lines) | 160 | no — diff only |
| src/components/sf-wheel.ts | diff hunk (1 line) | 193 | no — diff only |
| tests/styles/token-scan.ts | 1-60 + sink grep | 533 | no — test-only helper |
| tests/styles/token-declarations.test.ts | 1-40 + sink grep | 213 | no — test file |
| tests/styles/token-refs.test.ts | sink grep | 425 | no — test file |
| tests/styles/card-css-baseline.json | not read (data fixture) | 4915 | no |

VERDICT: DEPLOY

SURFACES CHECKED:
- Input boundaries: the src diff changes only CSS custom-property declarations and `var()` fallback literals inside static Lit `css` tagged templates. No `${}` interpolation, no `unsafeCSS`, `unsafeHTML`, `innerHTML`, no Home Assistant entity/state or card-config value reaches the changed lines. No user-controlled input reaches any changed sink.
- CSS injection / exfiltration: no `url(...)`, `@import` or external resource added; `color-mix()` and `rgba()` literals only.
- Auth / secrets: none touched; grep over the scope for `process.env`, `fetch`, `http` found no new reference to them.
- Dangerous APIs: grep for `child_process|exec|spawn|eval|new Function|writeFile|import(` over the scope — only `RegExp.exec` in the test helpers; `node:fs` reads (`readdirSync`/`readFileSync`/`statSync`) are confined to test code walking the repo's own `src/` tree at test time, never bundled.
- Dependencies: `package.json` / `package-lock.json` not in the diff — no dependency change, so no audit owed for this lot.

FINDINGS: none

NOTES:
- The scope is presentation-only (design-token declarations); it has no security boundary. Absence of a finding is based on the sink greps and diff reads listed above.
- Test helper `loadSources` follows symlinks via `statSync` while walking `src/`; it runs only in the developer/CI test runner on the repo's own tree. Not a defect.
- No infra in the diff; nothing about runtime is certified here.
