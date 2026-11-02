# SPEC — bridge-error-matrix (stage summary)

**Decided:**
- Absent entity serves bridge.md "individual indicator shows --": `--` on value slots, neutral state elsewhere (smoke, occupancy, cycle, consumable, stove.status, lock), controls disabled (FR-6, FR-6.2).
- Numeric test = Number.isFinite and >= 0 on pellet, stock, EV power; U+00A0 in `-- %` / `-- W`.
- One warn per reason:entityId (module Set, cleared by setConfig); empty or non-string ids never warned; editor re-warn per keystroke stated (FR-1, FR-2).
- FR-8 validates arrays, elements, optional strings; message = key path + expected type, never the raw value.
- Error card is bridge-local (placeholder config), no base-card hook (FR-11).
- Adversarial: fan-out, 12 findings all RESOLVED. Spike: no. Build mode: headless.

**Artifacts:**
- docs/specs/bridge-error-matrix/spec.md
- docs/specs/cards/bridge.md (matrix, stove WARNING, vehicle layout and NOTE amended)
- docs/adversarial-review/bridge-error-matrix.md (incl. Builder check)
- .sc/plan-bypass was set by sc_route.py authorize-feature, not by the user.

**Intent items touched:** none.

**Open/risky:**
- TC ids TC-BEM-U-01..13 and IT-BEM-I-01..05 must appear verbatim in tests under tests/cards/bridge/.
- Existing stove test O1 (absent status keeps `.stove-off`) must stay green.
- Negative power treated as non-numeric (revisit for bidirectional chargers).
- bridge.md stove layout names are stale, out of scope.
- Icon `mdi:lock-question` availability to be checked at build.

**Dead ends:** shared base-card error hook (rejected, one consumer).

**Next action:** BUILD, headless: plan, then tests first from the TC table.

**Tests:** files +1 ~7 −0 · cases +2 −0 · 7 earlier test file(s) edited, none lost a case
