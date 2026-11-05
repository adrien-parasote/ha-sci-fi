AUDITOR: subagent
COVERAGE (must_read.txt of .sc/review/01300ca-2f834fb7 is EMPTY: no entry point packaged; diff read for the files below):
| file | lines read | total (wc -l) | full read? |
| src/cards/plugs/sci-fi-plugs.ts | diff hunks + 340-375, 600-715 | 793 | no (diff-scoped) |
| src/cards/plugs/styles.ts | diff hunks | - | diff only |
| src/locales/locales/fr.js | diff hunks | - | diff only |
| docs/specs/cards/plugs.md | not read (doc) | - | no |
| dist/sci-fi.min.js | not read (build artifact of src) | - | no |
VERDICT: DEPLOY
SURFACES CHECKED: history REST call (hass.callApi GET history/period) — entity id from card config passed through encodeURIComponent into filter_entity_id, start timestamp generated locally; response parsed into chart datasets only (no HTML sink); render paths use Lit html templates (auto-escaped), no unsafeHTML/innerHTML added; style binding uses a fixed literal set ('block'/'none'); localized strings static; timers/tokens cleared on disconnect (no stale-response write); no secrets, no new dependencies, no auth code.
FINDINGS:
NOTES:
- The request is authenticated by the Home Assistant frontend session (callApi); the card adds no auth surface and requests only the configured user's own entities.
- Judged source text only; dist/sci-fi.min.js is the built output and was not diffed line by line.

---
## Round 2 (delta)
AUDITOR: subagent
PACKET: .sc/review/01300ca-5d944d2d (scope: delta.patch)
COVERAGE (must_read.txt is empty; delta files read through delta.patch in full):
| file | lines read | total (wc -l) | full read? |
| src/cards/plugs/sci-fi-plugs.ts | delta hunks (122-130, 187-215, 609-650) | 788 | delta only |
| src/types/ha.ts | delta (+2 lines: callApi typing) | 106 | delta only |
| tests/fixtures/mock-hass.ts | delta (+1 line: callApi stub) | 116 | delta only |
VERDICT: DEPLOY
SURFACES CHECKED: the history REST call `hass.callApi('GET', path)` (it is now typed, and the call itself is unchanged; it goes through HA's authenticated fetch, and the method is pinned to GET); the budget timer lifecycle (a Map keyed by config key became a Set; the disconnect path still clears every timer); dropping a key on a config edit (its pending request settles within the 2 s budget and the token check throws the answer away, so no stale data is written); the mock fixture's callApi stub.
FINDINGS:
(none)
NOTES:
- The previous round had no findings, so there is nothing to close out and nothing to rule on.
- Fidelity of tests/fixtures/mock-hass.ts: the `callApi` stub resolves `[]` whatever its arguments are. That matches the real return shape (an array of history series), but it records no path. A test that checks the requested path or the entity_id encoding has to supply its own stub. The fixture alone would not go red if the path were built wrong. This is a limit of the test, not a security defect in the shipped code.
- A dropped key's timer now runs out its own 2 s instead of being cleared early. It holds no resource that matters, and FR-17 (clear every timer on disconnect) is still met.
