AUDITOR: subagent
COVERAGE (packet .sc/review/c820be9-64bb9386; must_read.txt is EMPTY — no entry point packaged; source diff hunks read in full):
| file | lines read | total (wc -l) | full read? |
| src/cards/stove/config.ts | diff hunk | 43 | diff only |
| src/cards/stove/labels.ts | diff hunk | 40 | diff only |
| src/cards/stove/sci-fi-stove-editor.ts | diff hunk | 162 | diff only |
| src/cards/stove/sci-fi-stove.ts | diff hunks (power level block) | 727 | diff only |
| src/locales/locales/fr.js | diff hunk | n/a | diff only |
VERDICT: DEPLOY
SURFACES CHECKED: HA entity state/attributes (min/max/step/state) of the configured number_power_level entity -> isNumeric/powerGrid (no parseFloat, Number.isFinite, item count capped at 50, step<=0 and min>max fall back) -> sf-wheel .items text (Lit text binding, auto-escaped; no unsafeHTML/innerHTML in src/components/sf-wheel.ts, src/utils, src/cards/stove); wheel-change event detail.id -> integer + range check before use; service call domain restricted to number/input_number allow-list from the entity id prefix, service name fixed to set_value, value computed from the grid not from the event; error message toast (text binding); editor input number_power_level (string into config only); localized strings are static. No secrets, tokens or network endpoints in the diff.
FINDINGS:
(none)
NOTES:
- The service-call error message (err.message) is shown in a toast; it is rendered as text, so it is not an injection path.
- A dashboard author can point number_power_level at any number/input_number entity; that is the intended authorization model (HA's own user permissions apply to the service call).
- The fake secret in the bridge is out of this diff and already tracked (kxri).
- No infra in the diff; runtime behaviour not exercised (no live instance started).
