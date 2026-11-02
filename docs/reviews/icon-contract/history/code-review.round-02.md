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

---

# Code review — icon-contract (round 2, delta)

AUDITOR: subagent
Packet: .sc/review/868b0fe-69f152b8 (delta since .sc/review/868b0fe-5df0069a; must_read.txt is empty)

COVERAGE (delta files; source regions that moved read in full with their callers):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/components/sf-icon/icon-cache.ts | 1-60, 90-157 | 157 | yes (61-89 unchanged registry promise, read in round 1) |
| src/components/sf-icon/sf-icon.ts | 20-70 (moved region) | 235 | delta region + callers |
| src/components/sf-icon/sf-iconset.ts | 1-20, 60-96 | 96 | delta region |
| src/components/sf-icon/icon-names.ts | 1-21 | 21 | yes (joined: ownValue) |
| tests/components/sf-icon/icon-contract.test.ts | 1-40, 190-215 | 268 | delta region + harness |
| docs/specs/icon-contract/spec.md | delta hunk + grep "33" | 113 | delta only |
| docs/specs/04_components.md | delta hunk | 198 | delta only |
| CHANGELOG.md | 1-10 | 474 | delta region |

Pre-pass (worktree): `npx tsc --noEmit` exit 0; `npx eslint src/components/sf-icon` exit 0;
`npx vitest run tests/components/sf-icon tests/docs/icon-contract-guards.test.ts` -> 7 files, 74 tests passed.

Closure of round 1:
- sf-iconset.ts:13 stale header — closed: sf-iconset.ts:13-15 and :68-70 now say sf-icon resolves built-ins from module data.
- CHANGELOG.md:7 wording — closed: CHANGELOG.md:7 reads "existing configurations are unaffected", matching FR-9.
- spec.md:32 "33" — closed: FR-9 says 46; remaining "33" mentions (spec.md:17, :39) are the retrocheck history and the one-line/multi-line split, both correct.
- 04_components.md:132 sci-icon row — closed: names the `[sci-icon]` console prefix.
- sf-icon.ts:28 Window.customIcons type — NOT closed: only a comment was added; the declared type still says `string` (re-raised below).
- Security round 1 findings (inherited prefix; mdi registry own key) — both fixed in the delta: sf-icon.ts:61-64 own-key prefix + object guard; icon-cache.ts:113-119 own-key read + non-empty string guard; each has a new test.

VERDICT: APPROVE
SPEC: docs/specs/icon-contract/spec.md

FINDINGS:
- [LOW] src/components/sf-icon/sf-icon.ts:30 — a TypeScript consumer reading `window.customIcons.sci.getIcon` is still told it is a `string` — the round-1 finding on this line was answered with a comment (l.29) only; the declaration `Record<string, Record<string, string>>` is unchanged, so the type keeps contradicting sf-iconset.ts:74-85. Verified on a scratch copy: changing it to `Record<string, Record<string, unknown>>` compiles with `tsc --noEmit` exit 0 and no other edit (sf-icon.ts already reads values as `unknown`; sf-iconset.ts casts).
  FIX-CLASS: corrects
  RESOLUTION: fixed — Window.customIcons type is now Record<string, Record<string, unknown>>; tsc exit 0
- [LOW] tests/components/sf-icon/icon-contract.test.ts:198 — two of the four new guards can be deleted with the suite staying green, so a later refactor can drop them unnoticed — the new tests only feed inherited keys, which each guard pair rejects twice over. Not covered: (a) a non-object own value under a prefix (`window.customIcons.x = 'abc'`, icon `x:0` -> the mutant without `typeof foreignMap !== 'object'` at sf-icon.ts:63 renders path "a"); (b) a non-string or empty own value in the HA registry response (`resources: { foo: '' }` or `{ foo: {} }` -> the mutant without the `typeof pathData === 'string' && pathData` guard at icon-cache.ts:119 caches and returns '' / the object instead of ICON_NOT_FOUND). Add one case each.
  FIX-CLASS: corrects
  RESOLUTION: fixed — TC-ICC-U-09 'a prefix holding a string' and TC-ICC-U-01 'an empty or non-string registry value' added; both guards now mutation-covered (vitest green)

MUTATION: sf-icon.ts lookupCustomIcon foreignMap object guard removed (`if (!foreignMap) return undefined;`) — SURVIVED
MUTATION: icon-cache.ts fetchMdiFromHass string guard removed (`return (pathData as string) ?? null;`) — SURVIVED
MUTATION: sf-icon.ts prefix read by plain index AND object guard removed (both together) — KILLED by TC-ICC-U-09 'an inherited prefix (constructor:name) falls back' (expected 'Object' to contain FALLBACK)
MUTATION: icon-cache.ts registry read by plain index AND string guard removed (both together) — KILLED by TC-ICC-U-01 'the mdi registry read is by own string key' (expected [Function Object] to be ICON_NOT_FOUND)

NOTES:
- Two single mutants are equivalent and not recorded as survivors: the prefix read by plain index alone (sf-icon.ts:62) is fully masked by the object guard, since every inherited prefix resolves to a function or to Object.prototype, which has no own string property; the registry read by plain index alone (icon-cache.ts:117) is masked by the string guard for the same reason. Mutants were run on a scratch copy of the tree, never in the worktree.
- The new icon-cache test sits inside the TC-ICC-U-09 describe block while labelled TC-ICC-U-01; cosmetic.
- sf-iconset.ts:16-17 "spread/iteration in those components" now has a vague referent after the header rewrite; wording only.
- No new reader of the changed values: `window.customIcons` is read only by sf-icon.ts and sf-iconset.ts under src/; `resolveIcon`'s contract (string | ICON_NOT_FOUND) is unchanged for callers.

CONFORMANCE EVIDENCE:
- FR-1.1 (foreign values resolved by own key, strings only) -> sf-icon.ts:61-65, prefix and name both via ownValue (icon-names.ts:19-21)
- FR-6 one shared registry request -> icon-cache.ts:111-113 unchanged path through getMdiRegistry
- FR-9 release note verbatim -> CHANGELOG.md:7; spec.md FR-9 count 46
- FR-8 sci-icon row -> docs/specs/04_components.md:132

---

# Code review — icon-contract (round 3, delta, cap exit)

AUDITOR: subagent
Packet: .sc/review/868b0fe-6757a939 (delta since .sc/review/868b0fe-69f152b8; must_read.txt is empty)

COVERAGE (delta files; source regions that moved read with their readers/writers):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/components/sf-icon/sf-icon.ts | 20-75 (Window augmentation, ensureCustomIcons, lookupCustomIcon) | 235 | delta region + every reader of window.customIcons |
| src/components/sf-icon/sf-iconset.ts | 60-96 | 96 | delta region (the only other writer of window.customIcons) |
| src/components/sf-icon/icon-cache.ts | 100-130 (fetchMdiFromHass) | 157 | not in delta; read for the mutation check |
| tests/components/sf-icon/icon-contract.test.ts | delta hunk (212-233) | 285 | delta region |
| docs/reviews/icon-contract/code-review.md, security-review.md | delta hunks | — | review files, not a runtime surface |

Pre-pass (scratch copy of the worktree, never the worktree): `npx tsc --noEmit` exit 0; `npx eslint src/components/sf-icon` exit 0;
`npx vitest run tests/components/sf-icon` -> 6 files, 60 tests passed.

Closure of round 2:
- sf-icon.ts:30 Window.customIcons type — closed: sf-icon.ts:29 now declares `Record<string, Record<string, unknown>>`; sf-iconset.ts:73 dropped its `as Record<string, unknown>` cast and still compiles (tsc exit 0). Joins checked: under src/ only sf-icon.ts:40,44,62 and sf-iconset.ts:72-73 touch window.customIcons; sf-icon.ts:62-64 already read values as `unknown` and narrow them, so the wider type breaks no reader.
- icon-contract.test.ts:198 guards not mutation-covered — closed: two cases added (icon-contract.test.ts:215-230), and both mutants below are now killed.

MUTATION: sf-icon.ts lookupCustomIcon foreignMap object guard removed (`if (!foreignMap) return undefined;`) — KILLED by TC-ICC-U-09 'a prefix holding a string (not an object) falls back'
MUTATION: icon-cache.ts fetchMdiFromHass string guard removed (`return (pathData as string) ?? null;`) — KILLED by TC-ICC-U-01 'an empty or non-string registry value is not an icon'

VERDICT: APPROVE
SPEC: docs/specs/icon-contract/spec.md

FINDINGS:
(none)

NOTES:
- Mutants run on a scratch copy of the tree: each one alone fails exactly one test (59/60 pass), the unmutated copy passes 60/60.
- The new string-prefix test deletes `customIcons.xstr` after its assertion rather than in a finally/afterEach; a failing assertion would leave the key behind for later tests in the file. It only matters once the test is already red, so it is hygiene, not a defect.
- The TC-ICC-U-01 case still sits inside the TC-ICC-U-09 describe block (round-2 note); cosmetic.

CONFORMANCE EVIDENCE:
- FR-1.1 (foreign values resolved by own key, strings only) -> sf-icon.ts:62-64; held by TC-ICC-U-09 string-prefix case (icon-contract.test.ts:215)
- Registry values are strings only, else not found -> icon-cache.ts:105-108; held by TC-ICC-U-01 (icon-contract.test.ts:224)
- Window.customIcons typed to what it holds (paths plus helper functions) -> sf-icon.ts:29, sf-iconset.ts:73-85
