# BUILD - plugs-history-states (stage summary)

**Decided:**
- `_historyAttempts` @state Map keyed by power entity id; `updated()` starts a request for an absent key on every update (FR-2/FR-3); UI rendered from the selected key's record, chart drawn in `updated()` when the record object differs from the drawn one.
- `_withTimeout(promise, ms, key)` private method; timers keyed so disconnect/setConfig clear them; `HistoryTimeoutError` carries reason 'timeout'.
- Retry = `sf-button.history-retry` with aria-label/title `Retry` (sf-button has no label slot); focus check reads `shadowRoot.activeElement` (document.activeElement is the host).
- FR-15 checked on the stylesheet rule `.chart-section { min-height: 160px }` plus element persistence (happy-dom computed style not relied on).
- Integration IDs renamed TC-PHS-I-0x to IT-PHS-I-0x (repo id guard); spec Carriers row backticked (blueprint guard); spec `_withTimeout` line marked as a method (B-14).
- `_parseHistory` no longer skips index 0 nor maps NaN to 0 (FR-8); existing case migrated.

**Artifacts:** src/cards/plugs/sci-fi-plugs.ts, src/cards/plugs/styles.ts, tests/cards/plugs/plugs-history-states.test.ts, tests/cards/plugs/sci-fi-plugs.test.ts, tests/styles/card-css-baseline.json, xliff/fr.xlf, src/locales/locales/fr.js, docs/specs/cards/plugs.md, docs/specs/plugs-history-states/spec.md, docs/adversarial-review/plugs-history-states.md

**Intent items touched:** none

**Open/risky:** test-compacted unearned: `test_reduce.py plan` crashes (JSONDecodeError at char 65500, plugin 7.96.0) - user bypass required.

**Dead ends:** none new (SPEC dead ends respected).

**Next action:** VERIFY: /verify-stage.

**Tests:** files +1 ~1 −0 · cases +32 −4
