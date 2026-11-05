AUDITOR: subagent
COVERAGE:
| file | lines read | total (wc -l) | full read? |
| src/cards/stove/config.ts | diff hunk | 44 | no (diff only; one optional field added) |
| src/cards/stove/labels.ts | diff hunk | 41 | no (diff only; one label added) |
| src/cards/stove/sci-fi-stove-editor.ts | diff hunk | 163 | no (diff only; one entity picker added) |
| src/cards/stove/sci-fi-stove.ts | all changed hunks (number-wheel section in full) | 797 | no (diff hunks) |
| src/cards/stove/styles.ts | diff hunk | 342 | no (one CSS line) |
| src/locales/locales/fr.js | diff hunk | n/a | no (4 static strings) |
must_read.txt of packet .sc/review/b037203-d3f97d80 is empty: no entry point packaged.
VERDICT: DEPLOY
SURFACES CHECKED: user config input number_fan_speed (YAML/editor) -> _numberDomain: service domain comes only from the allowlist NUMBER_DOMAINS (number, input_number) matched against the id prefix, never from raw config, so a crafted id cannot call another domain's service; entity must exist in hass.states. Wheel-change event detail -> integer bounds-checked against the grid before use; value sent to set_value is computed from entity attributes (min/step) via numberGrid, never from event payload; grid size capped at 50 items (bounded render cost against hostile attributes). Rendering: all new strings bound through Lit attribute/property bindings (auto-escaped); no unsafeHTML/innerHTML in src/cards/stove. Error toast text is err.message, rendered through the existing toast path (pre-existing, unchanged). No secrets, no network, no auth code in the diff. Duplicate-entity guard (FR-4.2, same entity in both fields gets one wheel) prevents double writes.
FINDINGS:
(none)
NOTES:
Client-side HA card: authorization is enforced by Home Assistant server-side on callService; the card only reduces what the UI can send. The 50-item cap and per-bound fallback are documented decisions of the spec, not defects. Review judged source text, not runtime.
