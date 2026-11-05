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
  RESOLUTION: fixed — `_withTimeout(promise, ms)` restored, timers in a `Set`; TC-PHS-U-26 in tests/cards/plugs/plugs-history-states.test.ts (arity 2, Set, emptied on disconnect), proven by prove_test.py (red without the fix).
- [LOW] src/cards/plugs/sci-fi-plugs.ts:204 — when `setConfig` drops a key whose request is still pending, its budget timer is cleared, so if the HA call never answers, the `_loadPowerChart` closure stays pending for the card's lifetime (harmless to UI because the token check discards it, but an unbounded pending promise per dropped in-flight key) — FR-11 (config edit invalidates dropped keys) is held for state, not for the pending work.
  RESOLUTION: fixed — `setConfig` no longer clears timers; the dropped key's budget fires at 2000 ms and the token check discards it; TC-PHS-U-27 in tests/cards/plugs/plugs-history-states.test.ts, proven by prove_test.py.
- [LOW] src/cards/plugs/sci-fi-plugs.ts:628 — `(this.hass as any).callApi` keeps an unjustified `any` on a changed line (TypeScript checklist, type safety); a typed `hass.callApi<unknown>` signature exists in the HA types the card already uses.
  RESOLUTION: fixed — `callApi<T>` declared on HomeAssistantExt (src/types/ha.ts), call is `this.hass.callApi<unknown>('GET', path)`; tsc clean; TC-PHS-U-28 in tests/cards/plugs/plugs-history-states.test.ts, proven by prove_test.py.

NOTES:
- FR-8 (malformed answers) says an answer whose first element is not an array is malformed, while the Error Handling table lists `[]` as `'empty'`; the code (sci-fi-plugs.ts:640) treats `[]` as empty. Contradiction upstream in the spec; the code follows the table. Not a code defect.
  RESOLUTION: fixed — spec FR-8 amended (`[]` is a zero-point success); TC-PHS-U-06 now pins `[]` → empty.
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

# Code review — plugs-history-states, round 2 (delta)

AUDITOR: subagent
PACKET: .sc/review/01300ca-5d944d2d

COVERAGE:
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| src/cards/plugs/sci-fi-plugs.ts | delta hunks (122-130, 187-210, 609-655) | 788 | delta only |
| src/types/ha.ts | full (diff vs base: +2 lines, callApi) | 106 | yes |
| tests/fixtures/mock-hass.ts | full (diff vs base: +1 line, callApi) | 116 | yes |
| tests/cards/plugs/plugs-history-states.test.ts | 400-445 (TC-PHS-U-26..28) | ~460 | targeted |

Runs: `npx vitest run tests` → 151 files, 1694 passed, rc=0. `npx tsc --noEmit -p .` (= `npm run typecheck`, run by .github/workflows/ci.yml:20 and release.yml:29) → rc=2.

VERDICT: BLOCK
SPEC: docs/specs/plugs-history-states/spec.md

FINDINGS:
- [HIGH] tests/cards/plugs/plugs-history-states.test.ts:436 — CI's typecheck job goes red on this lot, so the branch cannot merge green and the release workflow refuses to build — `tsc` reports TS2532 (Object is possibly 'undefined') on `callApi.mock.calls[0][0]`; the round-1 RESOLUTION of the `any` finding claims "tsc clean", which does not hold.
  SITES: only tests/cards/plugs/plugs-history-states.test.ts:436 (the sole tsc error in the tree)
  FALSIFIED BY: `npm run typecheck` (exit 0 required)
  ROOT: typecheck-clean build (CI gate)
  FIX-CLASS: corrects
  RESOLUTION: fixed — `callApi.mock.calls[0]?.[0]` at tests/cards/plugs/plugs-history-states.test.ts:436; `npx tsc --noEmit -p .` → rc=0; `npx vitest run tests/cards/plugs` → 110 passed; swept the test file's other index accesses (91, 195, 225, 309-312, 330, 362, 423, 435) — all cast or asserted, tsc rc=0 tree-wide, no other site.

Rulings on round-1 findings (none contested; closure verified):
- src/cards/plugs/sci-fi-plugs.ts:651 (`key` parameter on `_withTimeout`) — closed: signature is `(promise, ms)`, timers in a `Set` (sci-fi-plugs.ts:125, 641-647); TC-PHS-U-26 asserts arity 2 and emptying on disconnect.
- src/cards/plugs/sci-fi-plugs.ts:204 (dropped key's pending promise) — closed: setConfig no longer clears timers; TC-PHS-U-27 proves the budget fires at 2000 ms and the record stays dropped.
- src/cards/plugs/sci-fi-plugs.ts:628 (`as any` on callApi) — closed in product code (`this.hass.callApi<unknown>('GET', path)`, ha.ts `callApi` declared); but its "tsc clean" proof is false — see the HIGH above.

NOTES:
- FIDELITY, tests/fixtures/mock-hass.ts: the added default `callApi` resolves `[]`, which per amended FR-8 (`[]` is a zero-point success) drives a card into the 'empty' state — the same path a real HA returns for an entity with no history. It is a default only; every history test overrides it with its own spy, so it cannot mask a history defect. Input that turns TC-PHS-U-28 red: reintroducing `(this.hass as any).callApi` (source grep) or a third argument.
- ha.ts `callApi` signature matches HA frontend's `callApi<T>(method, path, parameters?)`.

CONFORMANCE EVIDENCE: FR-17 (disconnect clears all budget timers) → sci-fi-plugs.ts:189; FR-11 (config edit drops keys, pending work bounded by its own 2 s budget) → setConfig + _withTimeout; B-14 (`_withTimeout<T>(promise, ms)`) → sci-fi-plugs.ts:641.

# Code review — plugs-history-states, round 3 (delta, exit round)

AUDITOR: subagent
PACKET: .sc/review/01300ca-73ba0530

COVERAGE (must_read.txt lists only files under docs/reviews/** plus the test file; every product change in delta.patch was read):
| file | lines read | total (wc -l) | full read? |
|---|---|---|---|
| tests/cards/plugs/plugs-history-states.test.ts | delta hunk 433-439 (one line changed) | ~460 | delta only |
| docs/reviews/plugs-history-states/code-review.md | round 2 in full | — | yes |
| docs/reviews/plugs-history-states/security-review.md | round-2 delta in full | — | yes |
| docs/reviews/plugs-history-states/history/* | via delta.patch (archived copies, no product content) | — | yes |
| tests/fixtures/mock-hass.ts | line 85 (callApi stub; not in this delta, checked for FIDELITY) | 116 | targeted |

Runs: `npx tsc --noEmit -p .` → rc=0 (no output). `npx vitest run tests/cards/plugs` → 6 files, 110 tests passed, rc=0.

VERDICT: APPROVE
SPEC: docs/specs/plugs-history-states/spec.md

FINDINGS:
(none)

Rulings on round-2 RESOLUTION lines:
- tests/cards/plugs/plugs-history-states.test.ts:436 (CI typecheck error TS2532 on `callApi.mock.calls[0][0]`) — closed. The line is now `callApi.mock.calls[0]?.[0]`, and tsc rc=0 across the whole tree, re-run in this round. The assertion is not weakened: line 434 (`toHaveBeenCalledTimes(1)`) and line 435 (`toHaveLength(2)`) run first, so `?.` can never short-circuit when a call exists. A method other than 'GET' still turns the test red.

Rulings on round-1 findings: round 2 already verified their closure, and none of their code moved in this delta (OUT-OF-DELTA). They stay closed.

### Spec limit F-01 — holds
F-01 is FR-14 (the three new French strings). xliff/fr.xlf carries the targets, including `<source>Retry</source>` at line 1418, and TC-PHS-U-13 asserts them. Nothing in this delta changed it.

### Spec limit F-02 — holds
F-02 is the 2 s budget, with late answers discarded and a Retry control. `HISTORY_BUDGET_MS = 2000` is at src/cards/plugs/sci-fi-plugs.ts:42. Every request is wrapped in `_withTimeout(request, HISTORY_BUDGET_MS)` at sci-fi-plugs.ts:613, which covers the initial request and each retry. TC-PHS-U-03 pins it.

### Spec limit F-03 — holds
F-03 is the accessibility contract for the loading and error states. `role="status"` is at sci-fi-plugs.ts:545 and `role="alert"` at sci-fi-plugs.ts:548. After Retry, focus goes to the persistent `.chart-section` (tabindex="-1") at sci-fi-plugs.ts:543. TC-PHS-U-14 pins it.

NOTES:
- FIDELITY, tests/fixtures/mock-hass.ts:85: the default `callApi` resolves `[]` for any arguments. Its signature matches src/types/ha.ts:91. Under amended FR-8 (`[]` counts as a zero-point success), `[]` puts the card in the real "no history" ('empty') state that Home Assistant produces, so it is a faithful default. It records no path. Every test that checks the request supplies its own `vi.fn` spy, which is the case for TC-PHS-U-28 at lines 433-438. So this default cannot hide a fault in the path or the method.
  - Inputs that turn the test red: a method other than 'GET', a third argument passed to `callApi`, or reintroducing `(this.hass as any).callApi`.
  - Limit: a fault in how the path is built is caught only by tests that use their own spy, never by the default stub.
- This round's fix is a change to test typing only. It does not reach product code, so it adds no read or write join to follow.

CONFORMANCE EVIDENCE:
- CI typecheck gate → `npx tsc --noEmit -p .` rc=0, with the fix at tests/cards/plugs/plugs-history-states.test.ts:436.
- FR-5 (strict 2 s budget per request) → sci-fi-plugs.ts:42 and 613.
- F-03 accessibility → sci-fi-plugs.ts:543-548.

VERDICT: APPROVE
