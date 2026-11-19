# Research — hexa-tiles-quick-actions

- Lane: light · Regime: R1 · Axis 2 SKIPPED · Ledger: [ledger.md](ledger.md)
- Goal: custom hexa tiles become one-tap quick-action buttons (gate, bedroom light, car charge; later radiator, TV).

## Axis 3: Technical Feasibility

### Source Evaluation
| Source | Type | Date | Credibility | Key Findings | Conflicts? |
|--------|------|------|-------------|-------------|------------|
| home-assistant.io/dashboards/actions | official docs | fetched 2026-11-18 | High — user-facing contract | action values, `confirmation` object, defaults | No |
| frontend `handle-action.ts` (dev) | official source | fetched 2026-11-18 | High — the code that runs | confirmation checked for every action; haptics fired | No |
| frontend `action-handler-directive.ts` + `action_handler.ts` | official source, internal | fetched 2026-11-18 | High for behaviour, Low as an API (undocumented for custom cards) | hold 500 ms, double 250 ms | No |
| frontend `toggle-entity.ts` / `get_toggle_action.ts` / `const.ts` | official source | fetched 2026-11-18 | High | per-domain toggle services | No |
| contributors.home-assistant.io cover / climate / media-player | official dev docs | fetched 2026-11-18 | High | state sets | No |
| home-assistant.io/integrations/template | official docs | fetched 2026-11-18 | High | template cover states | No |
| W3C WCAG 2.2 Understanding 2.5.8 | standard | fetched 2026-11-18 | High | 24 px AA / 44 px AAA | No |
| this repo (`sci-fi-hexa-tiles.ts`, `config.ts`, `hexa-tiles.md`, `utils/action.ts`) | codebase | HEAD | High | what exists, what is dead config | No |

### Conflict Analysis
None between sources. One internal inconsistency: the spec and `config.ts` declare `state_error`, `hold_action`, `double_tap_action`, but the card never reads them (F12) — this lot either wires them or the spec must stop promising them.

### Adopt / Adapt / Build
| Need | Decision | Why |
|------|----------|-----|
| Toggle on one tap (gate, garage, light, charger switch, climate, TV) | **ADOPT** `tap_action: {action: toggle}` | F6: the frontend already maps closed→open_cover, locked→unlock, off→turn_on, and fires the haptic. Zero card code |
| Confirmation before a sensitive action | **DROPPED** by the user at frame (2026-11-18) — was: ADOPT native `confirmation` | F2: checked by the frontend for every action. The card already forwards the whole tile config in `hass-action` (`utils/action.ts`), so `tap_action.confirmation` works once documented and exposed in the editor |
| Hold / double tap | **BUILD** (small, local) | F3: the card must detect the gesture; the frontend's handler is internal. Reuse its timings (500 / 250 ms) so behaviour matches native cards |
| Colour + icon + label per state | **BUILD** | No native equivalent for custom cards; values are sf tokens (F11) |
| Feedback while a door travels | **BUILD**, client-side | F5: our covers never report `opening`/`closing`. Card shows "pending" from tap until the state changes or a timeout; real `opening`/`closing` states, when an entity has them, use the state map |
| Two-line label | **BUILD** | `name` + a second line |
| `state_error` | **BUILD** (wire the dead key) | F12 |

### Cross-axis insights
1. Domain (F5) × technical (F2/F6): because the template covers report only open/closed, the "it's moving" feedback cannot come from HA — the card owns a pending state, and it must end on the entity's state change, not on a fixed animation, or a failed relay pulse would look like success.
2. Domain (F10) × technical (F6): the car charge has a command entity (`switch.mureva_evlink`, charger power) and a different status entity (`binary_sensor.mureva_evlink_charge`, car charging). A one-entity tile shows "charger powered", not "car charging". Either the tile reads a second entity, or HA merges them (the same move as `cover.portail` this session). This is a product choice → frame.
3. Domain (F7) × technical (F6): `toggle` on a radiator calls `climate.turn_off`/`turn_on` (needs the TURN_ON/OFF features) — the per-state map must accept `heat`, `off` etc. as states, so `state_on` alone is not enough for future tiles.

### Gaps (impact)
- **BLOCKED — bedroom light entity (F10):** no "chambre parentale" main light exists in HA; only douche / dressing / lavabo. Impact: the acceptance example. Needs the user's answer at the frame STOP.
- **Open — charge tile state source (insight 2).** Impact: config shape (`state_entity` key or not). Frame decision.
- **Open — default `tap_action`:** today a standalone tile with an entity opens more-info; switching the default to `toggle` would change existing dashboards. Keep explicit `tap_action` unless the user decides otherwise. Frame decision.

No prototyping done. Next step: `/frame`.
