# SPEC — config-error-card (stage summary)

**Decided:**
- D1/D2: base `render()`: hass unset -> nothing; config unset + hass set -> setup banner; opt-in `getConfiguredEntities()` (default []), banner only when ALL configured ids absent; 3 ids then `, … (+N)`.
- D3: no log on null registry (selectors return []/undefined).
- D5: `role="status"` on `.sf-error-card`, `aria-hidden="true"` on icon (all error cards).
- D6: invalid config (setConfig throws) out of scope, no catch added.
- D7: displayed ids stripped of C0/C1/bidi controls, capped at 64 code points.
- Absence = own-property test (not `=== undefined`); entity rule inside render()'s try/catch; `shouldUpdate()` untouched.
- Banner supersedes stove/tv/plugs own messages when all absent (FR-10).
- Seven cards opt in: vacuum, stove, tv, vehicles, plugs, weather, hexa-tiles (tiles[].entity + weather ids only if weather.activate).

**Artifacts:**
- docs/specs/config-error-card/spec.md
- docs/adversarial-review/config-error-card.md (13 findings RESOLVED, builder check recorded)

**Intent items touched:** none

**Open/risky:**
- Existing card tests with empty `hass.states` will show the banner: update per FR-10.
- Docs 03/02 rows to rewrite (FR-9); fr.xlf + localize-extract/build (FR-8).
- Spike offered: user said no. Build-mode STOP follows.

**Dead ends:** none

**Next action:** answer build-mode, then BUILD: TDD from TC-CEC-U-01..19 and IT-CEC-I-01..05.
