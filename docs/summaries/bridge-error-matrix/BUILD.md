# BUILD — bridge-error-matrix (stage summary)

**Decided:**
- warnOnce/resetBridgeWarnings in bridge-warn.ts (module Set, setConfig clears); numeric slots read through readSlotOrWarn (finite and >= 0, reason not-found vs non-numeric).
- FR-8 validation lives in its own module bridge-validate.ts (pure, returns first message or null); setConfig stores the message plus a placeholder {type} config, renderCard returns .sf-error-card first. base-card.ts untouched.
- FR-6 vocabulary applied in every section (smoke-unknown, occupancy unknown, cycle unknown, consumable-unknown, stove-unknown, lock-unknown with mdi:lock-question, toggle-unknown, disabled controls, slider input guarded).
- Empty-string occupancy now renders the absent pill (guard is undefined/null, not falsy).
- Vehicle label N/A replaced by msg('Unavailable'); xliff unchanged (N/A source entry now unused).
- bridgeCall / callService path untouched.

**Artifacts:**
- src/cards/bridge/bridge-warn.ts, bridge-validate.ts, sci-fi-bridge.ts, styles.ts
- src/cards/bridge/sections/*.ts (stove, vehicle, alerts, access, automations, appliances, actions, crew)
- tests/cards/bridge/bridge-error-matrix.test.ts, bridge-warn.test.ts, bridge_validate.test.ts
- tests/styles/card-css-baseline.json (additive: 8 new rules)
- docs/specs/bridge-error-matrix/spec.md (Carriers table first column renamed: blueprint guard read FR-1 as an F row)

**Intent items touched:** none.

**Open/risky:**
- Earlier tests adapted: sf-bridge-actions (hass proxy so entities exist), sf-bridge-appliances (absent cycle is .unknown, not .idle).
- IT-BEM-I-02/05 call setConfig with a fresh config object each time (same object would not re-render the sections).
- test_reduce plan found 3 removable (2 are this lot's bridge_validate cases, 1 water editor); not applied, verify green.
- Full vitest 1366 pass, tsc and eslint clean. mdi:lock-question is fetched from HA at runtime, not checkable offline.

**Next action:** VERIFY (/verify-stage): code review and security review fresh-context.

**Tests:** files +3 ~2 −0 · cases +23 −1 · 1 earlier test file(s) edited, none lost a case
