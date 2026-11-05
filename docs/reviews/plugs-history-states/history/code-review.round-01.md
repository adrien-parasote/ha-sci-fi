# Code review — plugs-history-states, round 1

AUDITOR: subagent
PACKET: .sc/review/01300ca-2f834fb7

COVERAGE (must_read.txt is empty: no entry point packaged; the diff's product files were read through the diff plus the touched functions):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/plugs/sci-fi-plugs.ts | diff hunks + 133-200, 460-540, 700-793 | 793 | no (diff + every touched/joined function) |
| src/cards/plugs/styles.ts | diff hunk | n/a | diff only |
| src/locales/locales/fr.js | diff hunk | n/a | diff only |
| xliff/fr.xlf | 1405-1420 | n/a | diff only |
| docs/specs/cards/plugs.md | grep of amendment sites (91, 412, 662, 858-860) | n/a | targeted |
| tests/cards/plugs/plugs-history-states.test.ts | it() index + 290-345 | 460 | partial |
| tests/cards/plugs/sci-fi-plugs.test.ts | via diff | 861 | diff only |
| docs/specs/plugs-history-states/spec.md | 1-190 | 190 | yes |

Suite run: `npx vitest run tests/cards/plugs` → 6 files, 107 tests passed, rc=0.

VERDICT: WARNING
SPEC: docs/specs/plugs-history-states/spec.md

FINDINGS:
- [LOW] src/cards/plugs/sci-fi-plugs.ts:651 — a caller of `_withTimeout` that omits the third argument registers its timer under the key '' and the next `setConfig` clears it (no configured device has key ''), so that promise then never settles — `_withTimeout` gained an undeclared optional `key = ''` parameter beyond the declared `_withTimeout<T>(promise, ms)` signature (Declared types / B-14 (the private timeout helper)); timer ownership leaks into a generic helper.
- [LOW] src/cards/plugs/sci-fi-plugs.ts:204 — when `setConfig` drops a key whose request is still pending, its budget timer is cleared, so if the HA call never answers, the `_loadPowerChart` closure stays pending for the card's lifetime (harmless to UI because the token check discards it, but an unbounded pending promise per dropped in-flight key) — FR-11 (config edit invalidates dropped keys) is held for state, not for the pending work.
- [LOW] src/cards/plugs/sci-fi-plugs.ts:628 — `(this.hass as any).callApi` keeps an unjustified `any` on a changed line (TypeScript checklist, type safety); a typed `hass.callApi<unknown>` signature exists in the HA types the card already uses.

NOTES:
- FR-8 (malformed answers) says an answer whose first element is not an array is malformed, while the Error Handling table lists `[]` as `'empty'`; the code (sci-fi-plugs.ts:640) treats `[]` as empty. Contradiction upstream in the spec; the code follows the table. Not a code defect.
- The Retry control is an icon-only `sf-button` whose label `msg('Retry')` is carried by `aria-label`/`title`; satisfies "labelled" for assistive tech.
- `_parseHistory` no longer skips index 0 (the period's start state) — consistent with FR-8 (every valid point kept).
- 5000-point cap is applied to raw points before minute bucketing (B-7); test TC-PHS-U-16 uses one point per minute so both counts coincide.

### Spec limit F-01 — holds
FR-14 (the three new French strings) names three strings plus the unchanged 'No power data to display'. xliff/fr.xlf:1410-1419 carries the three targets, src/locales/locales/fr.js has the three built ids, plugs.md:858-860 lists them; TC-PHS-U-13 asserts them.

### Spec limit F-02 — holds
The 2 s budget / discard / Retry decision: `HISTORY_BUDGET_MS = 2000` (sci-fi-plugs.ts:42), applied per request in `_loadPowerChart` via `_withTimeout`; late answers discarded by the token+generation check; error state renders `.history-retry`. Scope is every request (initial and each retry restarts the budget, B-14). TC-PHS-U-03/04, IT-PHS-I-03.

### Spec limit F-03 — holds
`.history-loading role="status"` and `.history-error role="alert"` in `_renderChartSection`; `_retryHistory` focuses `.chart-section` (tabindex="-1"), which is the persistent section wrapper across all states. TC-PHS-U-14.

CONFORMANCE EVIDENCE:
- FR-1/FR-13 (per-key record, dead fields removed): `@state() _historyAttempts: Map<string, HistoryAttempt>`; `_chart_generation`, `_chartLoaded`, `fetchedAt` absent from src (TC-PHS-U-10).
- FR-2/FR-3 (trigger iff key absent, every update): `updated()` → `_selectedPowerKey()`, `!attempt` → `_startHistory`.
- FR-5 (strict budget): `_withTimeout` setTimeout/race, cleared on settle.
- FR-6 (no toast on history failure): catch builds an `'error'` record; `_toast` no longer called from history path (remaining callers 467-534 are service calls, B-13).
- FR-7 (synchronous retry): `_startHistory` sets the loading record before `_loadPowerChart`'s first await; `_retryHistory` returns unless status is `'error'`.
- FR-9/FR-17 (ownership): `generation !== this._cardGeneration || token mismatch → return`; UI rendered from the selected key's record only.
- FR-11 (config invalidation): `setConfig` filters records and timers by configured keys, destroys chart.
- FR-15: `.content .chart-section { min-height: 160px }` (styles.ts).
- FR-18: `encodeURIComponent(key)` in the path.
- FR-19: plugs.md links plugs-history-states/spec.md (91, 412, 662).
