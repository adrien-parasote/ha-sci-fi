# Code review — icon-contract (round 1)

AUDITOR: subagent
Packet: .sc/review/868b0fe-5df0069a (dirty 868b0fe..worktree)

COVERAGE (must_read.txt is empty; every source/test/spec file of the diff read in full):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/components/sf-icon/icon-names.ts | 1-21 | 21 | yes |
| src/components/sf-icon/icon-cache.ts | 1-152 | 152 | yes |
| src/components/sf-icon/sci-icon.ts | 1-35 | 35 | yes |
| src/components/sf-icon/sf-icon.ts | 1-231 | 231 | yes |
| src/components/sf-icon/sf-iconset.ts | 1-95 | 95 | yes |
| src/components/sf-toast.ts | diff hunk | 141 | diff only (import change) |
| src/components/editor-inputs/sf-editor-dropdown-icon.ts | diff hunk | 169 | diff only (import change) |
| tests/components/sf-icon/icon-contract.test.ts | 1-252 | 252 | yes |
| tests/docs/icon-contract-guards.test.ts | 1-185 | 185 | yes |
| tests/components/sf-icon/sf-icon.test.ts | diff hunk | 193 | diff only |
| tests/components/sf-icon/sf-iconset.test.ts | diff hunk | 110 | diff only |
| docs/specs/icon-contract/spec.md | 1-113 | 113 | yes |
| docs/specs/04_components.md | diff hunks | 198 | diff only |
| CHANGELOG.md | diff hunk | 474 | diff only |

VERDICT: APPROVE
SPEC: docs/specs/icon-contract/spec.md (+ docs/specs/04_components.md amendments)

Pre-pass (run in the worktree): `npx tsc --noEmit` exit 0; `npx eslint` on the touched src files exit 0, 0 warnings;
`npx vitest run tests/components/sf-icon tests/docs/icon-contract-guards.test.ts` -> 7 files, 72 tests passed.

FINDINGS:
- [LOW] src/components/sf-icon/sf-iconset.ts:13 — a maintainer reading the header will think that removing the flat `window.customIcons.sci` map breaks `<sf-icon>`, and that sf-icon iterates it; neither is true any more — the header (l.13-16) and the registration comment (l.67-70) still say "sf-icon.ts (and so sci-icon.ts) uses them for synchronous path lookup" and "spread/for-in in sf-icon.ts", but since FR-1.1 (built-in icons are read from the module-local data, foreign values by own key only) sf-icon.ts:55-62 reads built-ins from module-local `CUSTOM_ICONS`/`WEATHER_ICONS` and never spreads or iterates the page-global map. Same class of stale doc claim FR-8 (headers say only what the code does) removes from sci-icon.ts/icon-cache.ts.
  SITES: src/components/sf-icon/sf-iconset.ts:13-16; src/components/sf-icon/sf-iconset.ts:67-70
  FIX-CLASS: corrects
  RESOLUTION: fixed — sf-iconset.ts header and picker comments rewritten (built-ins come from module data); tsc/eslint green
- [LOW] CHANGELOG.md:7 — users read a release note that differs from the one the spec fixes word for word — FR-9 (the weather-icons-leave-the-picker release note) quotes "existing configurations are unaffected"; the line says "existing configs are unaffected". TC-ICC-U-11 only checks three tokens, so it stays green.
  FIX-CLASS: corrects
  RESOLUTION: fixed — CHANGELOG.md:7 now reads "existing configurations are unaffected"; TC-ICC-U-11 green
- [LOW] docs/specs/icon-contract/spec.md:32 — the spec contradicts itself on the count of icons leaving the picker: FR-9 opens with "the 33 weather icons leaving HA's icon picker" while its own quoted line, the Overview and the data say 46.
  FIX-CLASS: corrects
  RESOLUTION: fixed — spec.md FR-9 now says 46 (and FR-2, TC-ICC-U-02/11, Assumption 1, Spec 04 TC-407 and picker API amended to 46 / count derived from data)
- [LOW] docs/specs/04_components.md:132 — the public `<sci-icon>` row tells integrators the subclass "only changes the tag name and the svg class", but FR-3 (SciIcon = tag + `iconClass` + `logPrefix` hooks) also changes the console prefix (`[sci-icon]`, sci-icon.ts:26-28); the row under-describes the observable difference.
  FIX-CLASS: corrects
  RESOLUTION: fixed — 04_components.md sci-icon row now names the [sci-icon] console prefix
- [LOW] src/components/sf-icon/sf-icon.ts:28 — the global type tells every TypeScript consumer that `window.customIcons[prefix][name]` is always a `string`, while sf-iconset.ts:74-85 hangs two functions (`getIcon`, `getIconList`) on `window.customIcons.sci` (hence the cast at sf-iconset.ts:72); a consumer typed on this declaration gets `string` for `customIcons.sci.getIcon`. sf-icon.ts:60 itself correctly treats the value as `unknown`, which is the honest type.
  FIX-CLASS: corrects
  RESOLUTION: fixed — comment on the Window.customIcons type records the non-enumerable helper functions; tsc exit 0

MUTATION: icon-names.ts ownValue replaced by plain `map[key]` index — KILLED by TC-ICC-U-01 (constructor/toString/__proto__/hasOwnProperty) and TC-ICC-U-09
MUTATION: sf-icon.ts lookupCustomIcon foreign branch accepts any truthy value (string guard removed) — KILLED by TC-ICC-U-09: a foreign template and a template-shaped object fall back
MUTATION: sci-icon.ts logPrefix returns '[sf-icon]' — KILLED by TC-ICC-U-05: sci-icon warns with its own prefix on an unknown namespace

NOTES:
- Own-key completeness: every name lookup on a map goes through `ownValue` (Object.prototype.hasOwnProperty.call, equivalent to Object.hasOwn) — sf-iconset.ts:34,48 and sf-icon.ts:57,60; `__proto__` is not an own key of the object-literal data, so it reads as unknown (test passes). `getIcon`/`getIconList` ARE own keys of `window.customIcons.sci` but are functions, rejected by the string guard at sf-icon.ts:61.
- window.customIcons seeding change: no file under src/ other than sf-icon.ts/sf-iconset.ts reads `window.customIcons`; the cards that need weather templates (lights, water, weather) import `data/sf-weather-icons.ts` directly. No src/ caller of `getIcon`/`getIconList` expects weather names; the editor dropdown reads `STATIC_ICON_NAMES`.
- `ensureCustomIcons` uses `stove` as a "seeded" sentinel (sf-icon.ts:44): if a third party pre-sets only `stove`, the other 27 are not mirrored to the page-global map. No in-repo consumer reads that map for built-ins any more, so no observable effect here.
- SciIcon fidelity: loading class `${iconClass} ${iconClass}--loading` (sf-icon.ts:202) and all three element warns use `logPrefix`. The icon-cache.ts:31,106 warns stay `[sf-icon]` for both tags — identical to the pre-lot sci-icon, which shared the same cache module, so behaviour is unchanged.
- `lit` is declared (`package.json` "lit": "^3.3.3"); `lit` re-exports `render` from lit-html; TC-ICC-U-07 scans all of src/ and passes.

CONFORMANCE EVIDENCE:
- FR-1 own-key, static-only, sanitised log -> sf-iconset.ts:23,26-28,33-40,46-51; icon-names.ts:19-21; no `as unknown as` in sf-iconset.ts / sf-icon.ts (grep empty)
- FR-1.1 templates only from module-local WEATHER_ICONS -> sf-icon.ts:55-62; weather not seeded into window -> sf-icon.ts:37-46
- FR-2 single source of 28 names -> icon-names.ts:13; sf-iconset.ts:55-57; sf-editor-dropdown-icon.ts ALL_ICONS
- FR-3 thin subclass -> sci-icon.ts:20-29 (35 lines); hooks sf-icon.ts:83-90,159,168,177,202,213
- FR-4 createRenderRoot once -> sf-icon.ts:222-224; TC-ICC-U-04
- FR-6 one shared request per connection -> icon-cache.ts:78-93; header 11-12
- FR-7 -> sf-toast.ts import from 'lit'; TC-ICC-U-07
- FR-8 -> 04_components.md Assumption 3, sci-icon row, picker API, AP#3, AP#5, TC-407/408, Error Handling row
