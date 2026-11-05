AUDITOR: subagent
COVERAGE (packet .sc/review/b312e10-915aac5b; must_read.txt is empty, so no entry point was packaged):
| file | lines read | total (wc -l) | full read? |
| src/cards/water/sci-fi-water-management.ts | diff hunks (+ grep for raw-HTML sinks) | 791 | no (diff-scoped) |
| src/cards/water/styles.ts | diff hunks | 443 | no (diff-scoped) |
| src/locales/locales/fr.js | diff hunk | n/a | no |
| docs/specs/cards/water.md, water_history.md | diff only (docs) | n/a | no |
| dist/sci-fi.min.js | not read (build artefact of the sources above) | n/a | no |
VERDICT: DEPLOY
SURFACES CHECKED: history fetch from Home Assistant (external data from hass history/logbook) into _rawLogs and the render path; the new offline badge (_offlineLabel: msg() plus a locale-formatted timestamp, rendered through Lit text interpolation, auto-escaped); the class binding on .log-console (a fixed literal only); grep for unsafeHTML/innerHTML in src/cards/water: none; the retry timer lifecycle (one timer, cleared on disconnect, on reset and on every new fetch, guarded by isConnected and _fetchId, so it cannot loop or leak); error handling (console.warn with the error object, no secrets or tokens). No auth, secrets, or new network endpoints in the diff.
FINDINGS:
(none)
NOTES:
- Cached rows from the previous successful fetch stay on screen while offline. This is the documented intent (FR-1), and the cache is reset when the floor or entity set changes (FR-6), so rows from one set never appear under another.
- I judged the diff's text only. The minified bundle in dist/ is assumed to be built from these sources.
