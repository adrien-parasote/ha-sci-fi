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
