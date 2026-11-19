# DISCOVER - hexa-tiles-quick-actions (stage summary)

**Decided:**
- Extend custom:sci-fi-hexa-tiles (no new card); custom tiles become one-tap quick-action buttons.
- Tap runs tap_action at once (toggle = HA native, per-domain); NO confirmation on any tile (user veto).
- New tile keys: states map (colour/icon/label per state), subtitle, pending_timeout (default 30 s).
- Pending feedback is client-side: template covers never report opening/closing.
- Hold (500 ms) / double tap (250 ms) detected by the card; hold default more-info, double default none.
- Configs without new keys behave exactly as today; default tap stays more-info.

**Artifacts:**
- docs/research/hexa-tiles-quick-actions/ledger.md
- docs/research/hexa-tiles-quick-actions/research.md
- docs/frame-contracts/hexa-tiles-quick-actions.yaml (gap low, R1)
- docs/intent-trace/hexa-tiles-quick-actions.yaml (derived)

**Intent items touched:** IA-FC-OPERATION-SET, IA-EX-1..6 (derived, proofs empty until SPEC).

**Open/risky:**
- Bedroom light: no main light in HA area "Chambre parentale"; example uses light.zbmini_l_dressing_parent (user validated the default at gap low, may still name another).
- Charge tile reads/toggles switch.mureva_evlink (charger power), not binary_sensor.mureva_evlink_charge.
- Spec to amend: docs/specs/cards/hexa-tiles.md (state_error, hold_action, double_tap_action are declared but dead today).
- Pending end rule: state change OR timeout -> error mark, never the target colour.

**Dead ends:** native HA confirmation (card cannot see OK vs Cancel) - dropped with the confirmation itself.

**Next action:** SPEC - /spec-writing on docs/specs/hexa-tiles-quick-actions/spec.md, amending cards/hexa-tiles.md.
