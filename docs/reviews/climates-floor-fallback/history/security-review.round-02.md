# Security review — climates-floor-fallback

AUDITOR: subagent
Packet: .sc/review/864006a-0846c050 (dirty, base 864006a). Spec: docs/specs/climates-floor-fallback/spec.md.
COVERAGE (must_read.txt of the packet is EMPTY: no entry point packaged; rows below are the files of files.txt that carry code):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/climates/sci-fi-climates.ts | 1-394 | 394 | yes |
| src/selectors/house.ts | 1-125 | 125 | yes |
| docs/specs/climates-floor-fallback/spec.md | 1-126 | 126 | yes |
| docs/specs/cards/climates.md | diff hunks (+9 lines) | 133 | no (doc-only hunk, no code) |
| tests/cards/climates/sci-fi-climates.test.ts | diff hunks, grepped for fs/exec/HTML sinks | 722 | no (test code, not shipped) |
VERDICT: DEPLOY
SURFACES CHECKED:
- External data boundary: the Home Assistant registries (hass.floors, hass.areas, hass.entities, hass.devices) and hass.states, read via src/selectors/house.ts. The diff only changes WHICH registry entry becomes the active floor/area (sci-fi-climates.ts:74-77, 94-97) and adds nullish guards (sci-fi-climates.ts:69, 221; house.ts:80). The chosen ids flow into getFloorById/getAreaById (plain object key lookup, house.ts:52, 90) and getAreasByFloor (equality compare) — no prototype pollution sink: lookups only, no write by attacker-chosen key.
- Render sinks: floor.name (sci-fi-climates.ts:264) and area.name (sci-fi-climates.ts:308), now reachable for floors/areas that hold no radiator, are interpolated as Lit text bindings (auto-escaped); no unsafeHTML, innerHTML, or attribute-to-URL sink anywhere in the file. Icons go through property bindings to sf-icon.
- Service calls (sci-fi-climates.ts:215, 348, 354, 360): unchanged by the diff; they act on entity ids from the user's own HA session under that session's auth — the card holds no credentials.
- Config input: removal of the `(this.config as any)?.filter_by` reads narrows the config surface (FR-3, filter_by is not a config key); an unknown YAML key is now inert.
- Secrets: none introduced in src/ or tests/; no token, URL, or credential in the diff.
- Dependencies: package.json / package-lock.json not in the diff, so no dependency audit is owed by this lot.
- Tests: the only fs access is a readFileSync of repository-relative source/doc paths built from constant strings (tests/cards/climates/sci-fi-climates.test.ts, diff line 23) — test-only, no user input.
FINDINGS: none
NOTES:
- The fallback can show a floor/area that holds no radiator (scenarios C and F of the spec) — a UX outcome accepted and pinned in the spec (FR-5), not a security defect.
- The pre-existing bare English `Off` label (sci-fi-climates.ts:261) and `String(err)` in toasts (sci-fi-climates.ts:350) are untouched by the diff; the toast text is rendered by sf-toast, outside this lot's scope, and comes from HA's own service-call rejection.
- This is a static read of browser-side card code; no infrastructure is in the diff.

---

## Round 2 (delta re-review)

AUDITOR: subagent
Packet: .sc/review/864006a-f60ded6f (re-review since .sc/review/864006a-0846c050; delta.txt lists src/selectors/house.ts, tests/cards/climates/sci-fi-climates.test.ts, and review documents).
COVERAGE (must_read.txt of the packet is EMPTY: no entry point packaged; rows below are the code files of delta.txt):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/selectors/house.ts | 1-127 | 127 | yes |
| tests/cards/climates/sci-fi-climates.test.ts | delta hunks (559-569, 604-615, 672-683) | 736 | no (test code, not shipped; delta hunks only) |
VERDICT: DEPLOY
SURFACES CHECKED:
- External data boundary, Home Assistant floor registry (hass.floors): getFloors() (src/selectors/house.ts:35-45) now drops `null`/`undefined` values with a type guard before the comparator runs. That removes a render crash (TypeError on `null.level`) that a malformed registry could cause; the card no longer turns into an error card. The returned array is still a fresh array (Object.values + filter); the registry object is not mutated, and no key chosen by an attacker is written anywhere.
- Downstream consumers of getFloors(): getFirstFloor (house.ts:60-63) and the card's floor list. They now receive only non-nullish floors, which keeps the existing `floor &&` guards in the card as redundant safety, not removed. The sinks are unchanged: Lit text bindings, auto-escaped.
- Areas registry: getAreas (house.ts:70-73) still returns nullish entries. Its consumers guard them (house.ts:82 `area?.floor_id`; card guards checked in round 1). The new test case puts `areas: { ghost: null }` alongside the floors and expects no console.error and no _renderError (tests:676-682), so the area path is exercised too.
- Tests: the new recursive `walk('src')` (tests:607-611) reads the repository's own files with fs.readdirSync/readFileSync from a constant root. Dirent.isDirectory() does not follow symlinks, so there is no loop. Test-only, with no user input.
- Secrets and dependencies: none added; package manifests are not in the delta.
- Closure of the previous round: round 1 recorded FINDINGS: none, so no security finding is open and no RESOLUTION or RULING is owed.
FINDINGS: none
NOTES:
- The delta fixes the code review's MEDIUM (a `null` floor entry made the card an error card). That is an availability and robustness point on data from the user's own HA session, not an attacker-reachable vulnerability. The fix is the filter at house.ts:38, and it is pinned by the null variant of TC-CFF-U-08.
- This is a static read of browser-side card code. No infrastructure is in the delta.
