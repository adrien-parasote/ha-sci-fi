# Research — hexa-tiles-quick-actions — Domain Facts Ledger

- Lane: light (product-lane light) — Axis 2 (competitive) SKIPPED.
- Regime: **R1** (user's pick, 2026-11-18). `[MEMORY]` citations: none used.
- Closed set: the facts the spec will consume. Fetched 2026-11-18.

## Axis 1: Domain Context — Domain Facts Ledger

| # | Fact | Needed by (engine/field) | Value | Authoritative source | Status |
|---|------|--------------------------|-------|----------------------|--------|
| F1 | Lovelace action values and keys | `tap_action` / `hold_action` / `double_tap_action`, editor, wiki | `action`: `more-info`, `toggle`, `perform-action`, `navigate`, `url`, `assist`, `none`; keys `perform_action`, `data`, `target`, `navigation_path`, `navigation_replace`, `url_path`, `entity`, `confirmation`. Default `hold_action`/`double_tap_action` = `more-info`; `tap_action` default `toggle` (some cards `more-info`) | https://www.home-assistant.io/dashboards/actions/ | VERIFIED |
| F2 | Native confirmation | gate confirmation | `confirmation: true` or `{text, title, confirm_text, dismiss_text, exemptions: [{user}]}`; `handleAction` checks `actionConfig.confirmation` BEFORE the switch, for every action type, and returns on cancel (fires haptic `warning`) | https://www.home-assistant.io/dashboards/actions/#options-for-confirmation ; https://raw.githubusercontent.com/home-assistant/frontend/dev/src/panels/lovelace/common/handle-action.ts | VERIFIED |
| F3 | Gesture detection | hold / double_tap wiring | The CARD detects the gesture; the frontend only executes `hass-action {config, action}`. Frontend directive timings: hold 500 ms, double-click window 250 ms; it fires `action` with `{action: "hold"\|"tap"\|"double_tap"}`; options `hasTap/hasHold/hasDoubleClick/disabled`. It lives in the frontend's internal tree (`action-handler` element on `document.body`) — not a documented API for custom cards | https://raw.githubusercontent.com/home-assistant/frontend/dev/src/panels/lovelace/common/directives/action-handler-directive.ts ; `src/data/lovelace/action_handler.ts` (gh api) | CONSTRAINED |
| F4 | Cover states | per-state map | `opening`, `closing`, `closed`, `open` ("open, fully or partly"); device classes `gate`, `garage` | https://contributors.home-assistant.io/core/entities/cover/ | VERIFIED |
| F5 | Template cover without position | transient feedback | `state` template outputs `open`/`opening`/`closing`/`closed`; ours output only `open`/`closed` → the entity never passes through `opening`/`closing`. Feedback during travel must come from the card | https://www.home-assistant.io/integrations/template/ (cover) ; live `cover.portail`, `cover.porte_garage` options (this session) | VERIFIED |
| F6 | `toggle` per domain | one-tap toggle | `toggleEntity`: turn on when state ∈ `STATES_OFF = ["closed","locked","off"]`, else off. Special: cover `open_cover`/`close_cover`, lock `unlock`/`lock`, climate & media_player `turn_on`/`turn_off` (need TURN_ON/OFF features), button/scene `press`/`turn_on`; others `turn_on`/`turn_off`. Haptic `light` on success | frontend `src/panels/lovelace/common/entity/toggle-entity.ts`, `turn-on-off-entity.ts`, `src/common/entity/get_toggle_action.ts`, `src/common/const.ts` (gh api, dev) | VERIFIED |
| F7 | Climate / media_player "on" | future radiator / TV | climate state = `hvac_mode` ∈ `off, heat, cool, heat_cool, auto, dry, fan_only`; media_player ∈ `off, on, idle, playing, paused, buffering` (`standby` deprecated) | https://contributors.home-assistant.io/core/entities/climate/ ; …/media-player/ | VERIFIED |
| F8 | Haptics | tap feedback | `fireEvent(node, "haptic", type)`, type ∈ `success, warning, failure, light, medium, heavy, selection` (iOS HIG). `handleAction` already fires `light` / `warning` / `failure` | frontend `src/data/haptics.ts` (gh api, dev) | VERIFIED |
| F9 | Touch target | tile size | WCAG 2.2 SC 2.5.8 (AA): ≥ 24×24 CSS px; 2.5.5 (AAA) 44×44. Phone layout = 2 columns at < 375 px → tile ≈ 150 px wide: met | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html ; `docs/specs/cards/hexa-tiles.md` § Responsive | VERIFIED |
| F10 | Real entities | acceptance examples | Gate `cover.portail` (gate, closed/open). Car: `switch.mureva_evlink` = charger power (on/off, the command); `binary_sensor.mureva_evlink_charge` = car actually charging; `automation.charge_voiture` turns the switch off at end of charge. **Bedroom light: area "Chambre parentale" holds only `light.zbmini_l_douche_parent`, `…_dressing_parent`, `…_lavabo_parent` — no main bedroom light** | live HA (ha-mcp `ha_search`, `ha_config_get_automation`) | BLOCKED (bedroom entity: user's answer) |
| F11 | Colour tokens | state map colours | `--sf-accent-on #00ff9d` (green), `--sf-warning #ffd60a`, `--sf-error #ff4d6d`, `--sf-primary` (= `--primary-color`, `#00d2ff`) | `src/styles/common.ts:11-22` | VERIFIED |
| F12 | Current contract | amend vs add | Tile keys exist: `entity`, `active_icon`, `inactive_icon`, `name`, `state_on`, `state_error`, `link`, `visibility`, `tap_action`, `hold_action`, `double_tap_action`. Rendered: click only (`tap_action` → `link` → more-info). **`state_error`, `hold_action`, `double_tap_action` declared, never read.** No card in the repo detects hold/double tap | `docs/specs/cards/hexa-tiles.md` § Config Schema ; `src/cards/hexa-tiles/sci-fi-hexa-tiles.ts:368-450` ; `grep -rn hold src` | VERIFIED |

## Axis 2: Competitive Landscape

SKIPPED (lane: light).

## Axis 3 + decisions

See [research.md](research.md).
