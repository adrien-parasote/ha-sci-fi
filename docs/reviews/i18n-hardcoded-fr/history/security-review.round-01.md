# Security review — i18n-hardcoded-fr (round 1)

AUDITOR: subagent
Packet: .sc/review/81c9d31-b439ab7e (dirty 81c9d31..worktree)

COVERAGE (must_read.txt is EMPTY — no entry point packaged; rows below are the code files of the diff, judged on their diff hunks plus the sinks they feed):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/climates/sci-fi-climates.ts | diff hunks (218-366) | 398 | no — diff only |
| src/cards/hexa-tiles/sci-fi-hexa-tiles.ts | diff hunks (5-11, 228-315) | 468 | no — diff only |
| src/cards/lights/sci-fi-lights.ts | diff hunks (5-433) | 461 | no — diff only |
| src/cards/tv/labels.ts | diff hunks (10-35) | 38 | no — diff only |
| src/cards/tv/sci-fi-tv-editor.ts | diff hunks (15-245) | 258 | no — diff only |
| src/cards/vehicles/sci-fi-vehicles.ts | diff hunk (220-224) + imports | 231 | no — diff only |
| src/cards/weather/sci-fi-weather.ts | diff hunk (496-500), sink grep 572 | 632 | no — diff only |
| src/components/editor-inputs/sf-editor-action.ts | diff hunks (1-146) | 161 | no — diff only |
| src/components/editor-inputs/sf-editor-source-list.ts | diff hunks (1-199) | 209 | no — diff only |
| src/components/sf-toast.ts (sink, not in diff) | 89-125 | — | no — sink only |
| src/locales/locales/fr.js | full diff (33 added entries), grep for html`/non-index ${ | 371 | diff + grep |
| xliff/fr.xlf | full diff (132 added lines), grep for markup/placeholders | 1382 | diff + grep |
| tests/fixtures/mock-hass.ts | diff hunks | 115 | no — diff only |
| tests/i18n/*.ts, tests/i18n/fixtures/pre-fix/*.txt | grep for exec/fs/network/secret sinks; no-hardcoded-literals.test.ts 108-130 | 1635 | no — sink grep |
| tests/cards/**, tests/components/** (modified tests) | diff stat only | — | no |

VERDICT: DEPLOY

SURFACES CHECKED:
- Templated translations: the two parameterised messages (`str\`⚠️ Weather alert: ${label}\`` in sci-fi-hexa-tiles.ts:305, `str\`Button ${actionId}\`` in tv/labels.ts:31) compile in fr.js to `str` templates with index placeholders only (`${0}`); `str` returns a plain string, rendered by Lit as a text child (hexa-tiles) or bound as a `.label` property (tv editor) — auto-escaped, no HTML parse. `label` is HA weather-alert data (external), `actionId` comes from the constant TV_CUSTOM_ACTION_IDS list.
- Catalogue targets: no `html\`` entry in fr.js, no `${` other than numeric indices, no backtick, `<script`, `on*=` or `javascript:` in any added xliff target; the only `<x>` placeholders are the two above, mirrored source/target.
- Attribute sinks: `title=${msg(...)}`, `label=${msg(...)}`, `.label=${...}`, `.title=${...}` — Lit attribute/property bindings, values are catalogue constants or getLabel() lookups; no `unsafeHTML`/`innerHTML` reached by any changed line (repo grep: the only innerHTML is sci-fi-weather.ts:572, SVG serialisation unrelated to this diff).
- Toast sink: sf-toast.ts:125 renders `${message}` as a Lit text binding; the new msg() toasts and the pre-existing `String(err)` / `e.message` toasts are escaped.
- getStubConfig (sci-fi-vehicles.ts:223) now returns a localised name — a config value, stored by HA as data, not executed.
- Tests: child_process use is `execFileSync('git', [args])` with array args (no shell) in tests/i18n/french-literals.ts:286,306 and no-hardcoded-literals.test.ts:117, against the repo or an mkdtemp dir; no network, no env reads.
- Secrets: grep of every added line for key/token/password/private-key patterns — none.
- Dependencies: package.json / package-lock.json / lit-localize config untouched by the diff; `@lit/localize` was already a dependency. No audit was owed for an unchanged tree.

FINDINGS:
(none)

NOTES:
- The review is a diff-scoped static read; this change introduces no new input boundary, auth path, network call or dependency. Runtime behaviour was not exercised.
- sci-fi-tv-editor.ts:141 and :216 drop the `?? 'Configuration TV'` / `?? 'Sources'` fallbacks: if a label key ever misses, the heading renders empty — a robustness/i18n concern, not a security one.
- mock-hass.ts carries `is_admin: true` and a fake user name: test fixture data, no real credential.
