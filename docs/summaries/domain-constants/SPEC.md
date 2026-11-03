# SPEC — domain-constants (stage summary)

**Decided:**
- D1 all of src/; D2 bounded allow-list (config kinds, lock action, light CSS class, text input type; no 'renault' entry, outside universe) + HASS_PLUG_SERVICE re-pointed; D3 one `DOMAIN as const` + `type Domain` in src/types/domains.ts.
- CORRECTION from adversarial round 1: DOMAIN is 24 keys (was 23, `COUNTER` added); replaceable literal sites 111 (was 110), cards 109, allow-list 13; 4 computed icon keys in sf-bridge-automations => 115 `DOMAIN.` references.
- Assumptions 4 (21 full entity ids out of AP#5) and 5 (homeassistant in DOMAIN) confirmed by the user.
- Spike-offer: no. Build-mode: headless.
- Guard: AST scan, pinned universe, allow-list with `context`, instrument controls (TC-DC-U-11), committed per-file per-key table (TC-DC-U-08).

**Artifacts:** docs/specs/domain-constants/spec.md · docs/adversarial-review/domain-constants.md · docs/specs/02_domain_selectors.md (AP#5 111/109)

**Intent items touched:** none

**Open/risky:** FR-8 expected gaps `number`, `zone` (file beads). Re-scan worktree HEAD first at BUILD; any count drift amends the spec first. `context` strings fixed at BUILD (TC-DC-U-09). Gate: `npm run typecheck` + `npm test`; no node_modules in worktree, use ../../node_modules/.bin. Follow-up bead ha-sci-fi-4syw (entity-id constant), not in this lot.

**Dead ends:** regex-only counting (96, then 151) — undercounts; AST is authoritative.

**Next action:** BUILD: write the red tests first (TC-DC-U-01..11, IT-DC-I-01..03), G0 serially, then G1-G5 from G0's commit.

**Tests:** files +1 ~24 −0 · cases +41 −19 · 9 earlier test file(s) edited, none lost a case
