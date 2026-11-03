# Security review — behavioural-test-gaps

AUDITOR: subagent
Packet: .sc/review/e71743c-5e057511 (dirty e71743c..worktree)

COVERAGE (must_read.txt of the packet is EMPTY — no entry point packaged; rows below are the security-relevant files in the diff):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/tv/sci-fi-tv.ts | diff hunks + 370-480 (pointer/drag/volume/remote handlers) + grep of all sinks | 611 | no — change-scoped |
| tests/helpers/blank-comments.ts | 1-66 | 66 | yes |
| tests/** (24 modified test files + tests/helpers/blank-comments.test.ts) | grep sweep for fs writes, network, eval/Function, child_process, env, secrets; targeted reads of hexa-tiles 451-482, tv 1065-1085 | — | no — pattern sweep |

VERDICT: DEPLOY

SURFACES CHECKED:
- src/cards/tv/sci-fi-tv.ts:395-402 — new guard in `_onPointerMove` re-checks entity state (off/unavailable/missing) before dragging; it only removes service calls, adds none.
- src/cards/tv/sci-fi-tv.ts:427 — new zero-size bbox guard; prevents a NaN/Infinity `volume_level` being sent to `media_player.volume_set` (a hardening, not a regression).
- src/cards/tv/sci-fi-tv.ts:438-443 — angle-origin fix; `volume_level` stays clamped to [0,1] by the dead-zone clamp (clampedDeg in [0,270]), rounded to 2 decimals; `entity_id` still comes from card config only (unchanged, line 446).
- src/cards/tv/sci-fi-tv.ts — grep for unsafeHTML / unsafeSVG / innerHTML / href / window.open: none present; all rendering goes through Lit `html` auto-escaping. callService sites (454, 477, 502, 513, 528, 549) unchanged by this diff.
- tests: no writeFile/mkdir/rm in modified tests (only readFileSync on repo sources/specs, read-only); no fetch/XHR/WebSocket/dynamic import (plugs test "fetch" is a mocked hass.callApi); no eval / new Function / child_process / process.env; no credentials or tokens. `https://example.com` in hexa-tiles test is fed to a stubbed `window.open` (vi.fn), never a real request; the stub asserts `noopener,noreferrer`.
- tests/cards/tv/sci-fi-tv.test.ts:1070-1085 and tests/cards/vacuum/sci-fi-vacuum.test.ts:787 add XSS regression tests (hostile `<img onerror>` payload must render as text) — strengthens the boundary.
- tests/helpers/blank-comments.ts — pure string transform, no I/O, bounded loops (every branch advances `i`).

FINDINGS: none

NOTES:
- No dependency change in the diff (package.json / lockfile untouched), so no audit run was owed.
- The src file was read change-scoped, not in full; the pre-existing service-call surface outside the diff was grepped, not re-audited.
- No infra in the diff.

## Round 2 (delta re-review)

AUDITOR: subagent
Packet: .sc/review/e71743c-991137ff (delta since round 1)

COVERAGE (must_read.txt empty; one row per delta file, delta hunks only):
| file | lines read | total | full read? |
|---|---|---|---|
| docs/specs/cards/hexa-tiles.md | 1-line hunk | — | delta only |
| tests/cards/{climates,hexa-tiles,lights,tv,vacuum,vehicles}/ styles/style tests, tests/cards/hexa-tiles/sci-fi-hexa-tiles.test.ts | delta hunks | — | delta only |
| tests/helpers/blank-comments.test.ts | 2 added assertions | — | delta only |
| docs/reviews/behavioural-test-gaps/* | grep for sinks | — | review artefacts |

SURFACES CHECKED: src/cards/tv/sci-fi-tv.ts blob hash identical to round 1 (7fdb65ad...), so the round-1 clearance holds (drag guard, zero-size bbox guard, volume_level clamped, entity_id from config only, no unsafeHTML/innerHTML/href/window.open). package.json and lockfile not in the delta, no audit owed. Test delta adds no writes, network, eval, child_process, env or credentials; the RegExp is built from class names the card renders in-test.

FINDINGS: none

VERDICT: DEPLOY
