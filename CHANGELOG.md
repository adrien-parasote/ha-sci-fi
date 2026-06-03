# Changelog

# [1.3.4](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.3.4) - 2026-06-03

## 🐛 Fixes

- **Build**: fix GitHub Actions build failure by adding `@types/node` declaration to `tsconfig.json`
- **Security**: resolve CodeQL alerts (XSS in icon-browser) and HACS validation errors (`hacs.json` type removal)
- **Core**: fix `hacs.json` schema test conformance (`TC-115`)

## 🛠️ Technical

- **Deps**: bump dependabot PR dependencies (including Lit, Chart.js, Rollup, etc.)
- **Deps**: migrate ESLint from v8.57.1 to v10.4.1 flat config
- clean up legacy ESLint v8 files and rebuild distribution artifacts

# [1.3.3](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.3.3) - 2026-06-03

## 🆕 What's New

- **Vacuum card**: introduce sf-dropdown component for inline fan speed selection
- **Vacuum card**: replace fan speed cyclic action with dropdown selection
- **Release Manager**: migrate release process to automated stream-coding skill

## 🐛 Fixes

- **Release Manager**: swap merge and changelog generation steps

## 📚 Docs

- add learnings regarding UI component CSS contracts and cross-platform CI/CD script compatibility
- **Core**: remove v1.3.0 important block from README
- **Core**: migrate user docs to wiki

## 🛠️ Technical

- update distribution files to include minified bundle wrapper and headers
- **CI**: automate release process via GitHub Actions
- merge issue_43 into main for 1.3.3. Closes #43

# [1.3.2](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.3.2) - 2026-06-02

## 🐛 Fixes

- **Card picker UI (root cause fix)**: cards can now be selected from the HA card picker dialog in all versions. The actual root cause was a double `custom:` prefix in `window.customCards` registration — `src/sci-fi.ts` was pushing `type: "custom:sci-fi-lights"` but HA's `hui-card-picker` prepends `custom:` internally when resolving elements. This caused `customElements.get("custom:sci-fi-lights")` to return `undefined` (element is registered as `"sci-fi-lights"`), producing "Custom element not found" since v1.0.0. Fixed by removing the `custom:` prefix from the push: `type: card.type` (bare tag name). Covered by new regression guard TC-116.

## 🛠️ Technical

- `src/sci-fi.ts`: `window.customCards.push` now uses `type: card.type` (bare name, no `custom:` prefix) — matches HA official developer documentation pattern.
- `tests/sci-fi.test.ts`: adds TC-116 regression guard asserting no `custom:` prefix in `window.customCards` entries.
- `docs/CODEMAPS/frontend.md`: documents the `window.customCards.type` constraint and the corrected HMR guard scope.
- `docs/adr/ADR-007_workbench-mandatory.md`: documents exact workbench server command (`npx serve@14 . -p 8888` from project root).

# [1.3.1](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.3.1) - 2026-06-02

## 🐛 Fixes

- **Card picker UI**: cards can now be selected from the HA card picker dialog when creating a new card via the UI. The `customElements.define` guard (added for workbench HMR) was active in production, blocking HA's scoped custom element registry used by `hui-card-picker`. Elements appeared registered globally but were invisible in the picker scope, producing "Custom element not found" errors. Guard is now `dev`-only — Terser eliminates it entirely from the production bundle.
- **Version banner**: console banner now shows the correct release version (`v1.3.1`) instead of the hardcoded `v1.0.0` stale string. Version is now injected at build time via `@rollup/plugin-replace` from `package.json`.

## 🛠️ Technical

- `rollup.config.mjs`: reads `package.json` version and injects `__VERSION__` compile-time constant via `@rollup/plugin-replace`.
- `vitest.config.ts`: adds `define` block for `__DEV__` and `__VERSION__` so tests resolve rollup compile-time constants (previously caused `ReferenceError`).
- `src/types/globals.d.ts`: TypeScript declarations for `__VERSION__` and `__DEV__`.
- `docs/adr/ADR-002_rollup4.md`: documents `__DEV__`/`__VERSION__` constants and the critical HA scoped registry constraint.
- `docs/specs/06_entry_migration.md`: adds anti-patterns 8 (global define patch) and 9 (hardcoded version).

# [1.3.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.3.0) - 2026-06-02

## 🆕 What's New

- **Workbench — Icon Browser**: new integrated icon browser in the workbench dev tool. Browse and copy `sci:` custom icons and `mdi:` icons inline without leaving the page. Includes the HA entity picker API integration.

## 💫 Enhancements

- **Bridge card — actions section**: removed legacy `call_kids` component; replaced by a clean, decoupled `actions` section in the YAML config.

## 🐛 Fixes

- **i18n — Bridge editor**: migrate all FR `msg()` calls to `getLabel()` with EN keys. Adds 55 missing FR translation entries.
- **i18n — Stove**: add missing `section-title-stove` key to the `getLabel` dictionary.
- **Workbench — mock hass `entity_id`**: `buildMockHass` now injects `entity_id` on all mock state objects, fixing editors that call `Object.values(hass.states).filter(e => e.entity_id…)`.
- **Workbench — GUI editor remount**: switching back from YAML tab to GUI tab now correctly remounts the editor.

## 🛠️ Technical

- Coverage: tests added to meet 80%/75% branch/function thresholds.
- Codemaps updated for Bridge v1.3 cycle.

## 📚 Docs

- Full documentation audit: language consistency (EN), urbanization, and structural alignment across all specs, ADRs, blueprints, cards, and codemaps.
- All card docs (`docs/cards/`) rewritten with accurate field names (verified against `src/types/config.ts`), complete options tables, and standard format.
- `docs/cards/guidelines.md` relocated to `docs/guidelines.md` (developer reference, not a card usage doc).
- Spec Gate: 202 PASS / 0 PARTIAL / 0 FAIL across all 202 spec checks.


# [1.2.3](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.2.3) - 2026-05-29

## 🐛 Fixes
- **i18n & Localization**: fix critical minification bug where Terser collapsed symmetric `msg()` ternary calls (e.g. `isOn ? msg('A') : msg('B')`) into a single dynamic call, bypassing `lit-localize` static parsing and causing toast notifications and status values to always display in English when French was active. Rewrote calls as static tuple accessors (`[msg('OFF'), msg('ON')][isOn ? 1 : 0]`) across TV Remote, Water Management, and Plugs cards.

# [1.2.2](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.2.2) - 2026-05-29

## 🐛 Fixes
- **Water card**: use native `ha-state-icon` for sensors to correctly inherit dynamic HA device class icons (like batteries).
- **Water & Lights cards**: fix `first_floor_to_render` not working (or resolving improperly on first render) when passing the friendly name (e.g. `Extérieur`) instead of the exact `floor_id`. Case-insensitivity and friendly-name mapping is now fully supported.
# [v1.2.1](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.2.1) - 2026-05-29

## 🐛 Fixes
- **Water card**: fix double-fire event on `sf-toggle-change` causing UI toggle glitches.
- **Water card**: support `input_select` virtual entities in dropdowns (like filtration modes) by dynamically inferring HA service domain.
- **Hexa tiles**: add native support for the `water` entity kind to allow aggregating water cards into standalone tiles.

# [v1.2.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/1.2.0) - 2026-05-29

## 🆕 What's New

**Splashdown**: adding water management 💧 card.

### 💧 Water Management Card (`sci-fi-water-management`)
Introducing the brand-new Water Management card! Track and control your irrigation, hydroponic systems, and soil moisture with a high-fidelity Sci-Fi interface.
- **Dynamic Hexa Tiles**: Seamlessly groups your water sensors and actuators into intuitive accordion structures mapped to their parent device.
- **Standalone Automations**: Beautifully distinct cards specifically for Home Assistant automations (`automation.`), grouped together.
- **Visibility Toggles**: A dedicated configuration UI allows you to individually toggle the visibility of any mapped sensor.
- **Wildcard Exclusions**: Support for wildcards (e.g., `*temperature*`) to dynamically ignore irrelevant entities and keep the UI clean.
- **Balanced Visual Integration**: Built from the ground up to support premium animations, fluid layouts, and seamless alignment with the overall Sci-Fi theme.

### 📺 TV Card Testing Updates
- **Sony Bravia Validated**: The TV remote card documentation now explicitly notes that it has been fully tested and validated with Sony Bravia TVs using the official Sony integration. D-pad commands map perfectly out of the box.

### 🌍 i18n & Localization Enhancements
- Full French localization (i18n) support implemented for the new Water Management card and its editor.
- Fixed a silent failure within the `lit-localize` build pipeline where missing `<target>` tags defaulted UI elements back to English in the final build.
- Updated UI components so that localization values are correctly extracted via custom string accessors (`getLabel()`).

### 🐛 Bug Fixes & Refactoring
- Cleaned up floating promise warnings within `sci-fi-water-management.ts`.
- Removed unused local variables in the editor configuration code.
- Added `L073` to the continuous learning registry to document robust `lit-localize` translation patterns.
- `sci-fi-water-management` added to the internal Frontend Codemap documentation.

# [v0.9.6](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.9.6) - 2025-12-09

## 🐛 Fixes
- Technical: update home-assistant-js-websocket dependency to last version
- Vacuum card: Fix send command parameter issue when calling for specific segment(s)

# [v0.9.5](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.9.5) - 2025-12-09

## 🐛 Fixes
- Vacuum card: Fix max width for vacuum card

# [v0.9.4](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.9.4) - 2025-12-09

## 🐛 Fixes
- Vacuum card: [tech fix] change comparaison method from isEqualWith to isEqual to fix prod issue

# [v0.9.3](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.9.3) - 2025-12-09

## 🆕 What's New

🖲 Vacuum card
- Multiple vacuum in same card
- Add custom command to send to vaccum.send_command

## ❗Breaking change 

🖲 Vacuum card

Card configuration need to be updated due to several factors : allow to have multiple vacuum in same card, sensor deletion, update and addition:
- `camera` sensor is renamed `Map`
- `last_clean_area` & `last_clean_duration` are removed
- Adding `battery` & `mop_intensite` sensors

Easiest way to update is to save your current information and recreate the card from the UI.

## 🐛 Fixes
- [Car card - invalid time value](https://github.com/adrien-parasote/ha-sci-fi/issues/47)
- [Hexa tiles - cannot be rendered if one composant is on error](https://github.com/adrien-parasote/ha-sci-fi/issues/48)

# [v0.9.2](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.9.2) - 2025-11-03

## 🐛 Fixes
- Hexa tiles: fix alert sensor & values saving method in editor card

# [v0.9.1](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.9.1) - 2025-11-03

## 🆕 What's New

⬡ Hexa card
- [Hexa tiles - Weather color update](https://github.com/adrien-parasote/ha-sci-fi/issues/13)

## 💫 Enhancement
- [Vacuum card - action and shortcuts icons size](https://github.com/adrien-parasote/ha-sci-fi/issues/44)

# [v0.9.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.9.0) - 2025-10-16

## 🆕 What's New

**Orbital Checkouts**: adding vaccum 🖲 card.

# [v0.8.2](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.8.2) - 2025-06-12

## 🆕 What's New

🔌 Plug card
- Add selection when plug icon is tapped at bottom of the card

# [v0.8.1](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.8.1) - 2025-06-10

## 🆕 What's New

⬡ Hexa card
- Feature requests:[Hexa tiles - Visibility option](https://github.com/adrien-parasote/ha-sci-fi/issues/38)

## ❗Breaking change 

⬡ Hexa card

Tiles configuration need to be updated to select user visibility option : by default nobody can view tiles. 
What need to be done ? 
- Go to your dashboard and edit Hexa Tiles component
- For each tiles you've defined, go to visibility part and setup the visibility

Please refer to readme [Hexa Tiles section](https://github.com/adrien-parasote/ha-sci-fi?tab=readme-ov-file#hexa_tiles) if needed.
   
## 🐛 Fixes
- [Weathee card - measure unit missing](https://github.com/adrien-parasote/ha-sci-fi/issues/39)

# [v0.8.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.8.0) - 2025-06-06

## 🆕 What's New

**Payload Deployment**: adding electrical plug 🔌 card.

## 🆕 What's Changed

🌡️ Climate card
- Update preset mode list to map `frost` state from [Versatile Thermostat](https://github.com/jmcollin78/versatile_thermostat) entity

🖼️ Sci-Fi icons
- Adding new icons (see readme section): 
  - power-socket-fr-off
  - lock-unknow

## 🐛 Fixes
- Weather Card: fix wrong hourly forecast icon for current day
- Climate card: [Climate card - Wrong floor color](https://github.com/adrien-parasote/ha-sci-fi/issues/35)

# [v0.7.3](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.7.3) - 2025-03-26

## 🐛 Fixes
- Hexa card: fix rendering person entity picture

# [v0.7.2](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.7.2) - 2025-03-26

## 🆕 What's Changed
- Hexa card: use HA defined zone to display user location icon

# [v0.7.1](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.7.1) - 2025-03-23

## 🐛 Fixes
- Vehicle card: 
  - fix plugged/unplugged icon isn't the right one displayed
  - fix charging method returned value

# [v0.7.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.7.0) - 2025-03-22

## 🆕 What's New

**First Stage separation**: Package is now ready for multi language 👽🔊.
Current available languages:
- 💂 english 
- 🥖 french 

## 🆕 What's Changed

🚗 Vehicles card
- Do not display `<` & `>` icon when only one vehicle is configured

🦾 Technical
- Date rendering is now based on user preferences defined in HA local (date_format)

🌡️ Climate card
- Displaying temperature unit based on your HA system configuration

🪵🔥 Stove card
- Displaying temperature/pressure unit based on your HA system configuration

## 🐛 Fixes
- Weather card: Fix no rendering temperature unit per days

# [v0.6.2](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.6.2) - 2025-03-16

## 🆙  What's Changed

💡 Ligths management card
- Feature requests:[Lights card - Add option to exclude lights](https://github.com/adrien-parasote/ha-sci-fi/issues/31)


# [v0.6.1](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.6.1) - 2025-03-16

## 🐛 Fixes
- Lights card: Fix floor active / inactive icon color
- Weather icon: Fix n/a & snowy-rainy-day svg

# [v0.6.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.6.0) - 2025-03-14

## 🆕 What's New

**Max Q**: adding vehicle card 🚗 (Currently only for Renault vehicles)

## 🆙  What's Changed

🖼️ Sci-Fi icons
- Adding new icons: landspeeder & landspeeder pluggin (see readme section)

## 🐛 Fixes
- Technical: 
  - Fix editor card input slider value issue => int to float
  - Fix stack bar rendering when low data value
- Weather icon: 
  - Fix icon selection when hour is equal dusk or dawn
  - Fix icon selection when same day & hour is before or after dusk or dawn
- Stove card: Fix temperature selection that doesn't display properly

<br>

# [v0.5.4](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.4) - 2025-02-18

## 🆙  What's Changed

🌡️ Climate card
- Add friendly name display

🖼️ Sci-Fi icons
- Icons are now available even outside of sci-fi package

🦾 Technical
- Lighter package by removing mdi icon (now use from HA) from 3.3MB to 560KB
- Review package tree organization
- Add global card class & method
- Urbanize validated config method with metadata
- Upgrade modules import
- Upgrade customElement / customeCard method
- Create new component to make job easier in the future
- Rename files to match with HA frontend repository nomenclature
- Review card rendering by using new created components such as icons
- Display yaml config in edit mode for local tests

# [v0.5.3](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.3) - 2025-02-08

## 🐛 Fixes
- [Stove card - Change mode issue](https://github.com/adrien-parasote/ha-sci-fi/issues/29)

# [v0.5.2](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.2) - 2025-02-07

## 🆙  What's Changed

🪵🔥 Stove card
- Style review to better show lines displayed
- Disable temperature selection when stove is off
- Feature requests :
  - [Stove card - Add Time to service sensor](https://github.com/adrien-parasote/ha-sci-fi/issues/27)

🌡️ Climate card
- Review radiator style
- Replace `sun.sun` by `sensor.season` to show (if available) season icon on card header
- Add option to display or not global turn on/off button in card header (default is false)
- Feature requests :
  - [Climate card - Add set temperature Button](https://github.com/adrien-parasote/ha-sci-fi/issues/23)

🖼️ Sci-Fi icons
- Adding new icons 

# [v0.5.1](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.1) - 2025-02-04

## 🐛 Fixes
- [Stove card - Fuel circle is inversed](https://github.com/adrien-parasote/ha-sci-fi/issues/25)

# [v0.5.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.5.0) - 2025-02-04

## 🆕 What's New

**Vehicle Goes Supersonic**: adding stove card 🪵🔥

## 🆙  What's Changed

🌦️ Weather card
- Feature requests :
  - [Weather tile - Forecast improvement](https://github.com/adrien-parasote/ha-sci-fi/issues/14): `weather_hourly_forecast_limit` config parameter is not needed anymore.
  - [Weather card - First chart data rendering](https://github.com/adrien-parasote/ha-sci-fi/issues/20): new card optionnal parameter `chart_first_kind_to_render`, by default is equal to `temperature`.

🖼️ Sci-Fi icons
- Adding new icons 

## 🐛 Fixes
- [Climates card - CSS issue on big screen](https://github.com/adrien-parasote/ha-sci-fi/issues/16)
- [Lights card - Component height](https://github.com/adrien-parasote/ha-sci-fi/issues/22)
- [Weather card - SVG icons update](https://github.com/adrien-parasote/ha-sci-fi/issues/21)

<br>

# [v0.4.0](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.4.0) - 2025-01-25

## 🆕 What's New

**Liftoff** : adding 🌡️ climate card 🌡️ 

## 🆙  What's Changed

⬡ Hexa card
- Remove `sun.sun` entity from configuration: now a pre-requisite for the card
💡 Ligths management card
- Review card header:
   - Add global turn on/off lights for the entire house
   - Display sun state if `sun.sun` entity is available in HA
- Add toast on actions rendering error/success status
🌦️ Weather info card
 - Remove `sun.sun` entity from configuration: now a pre-requisite for the card
 - Limit forecast hours to 24 max. In future, card will follow this feature request [Weather tile - Forecast improvement](https://github.com/adrien-parasote/ha-sci-fi/issues/14)

## ❗Breaking change 

⬡ Hexa card
- Configuration changed for header message
   
 Old 
```yaml
header:
  message: 'Welcome'
```
New
```yaml
header_message: 'Welcome'
```

💡 Ligths management card
- Configuration changed for default icons
   
 Old 
```yaml
default_icons:
    'on': mdi:lightbulb-on-outline
    'off': mdi:lightbulb-outline
```
New
```yaml
default_icon_on: mdi:lightbulb-on-outline
default_icon_off: mdi:lightbulb-outline
```

## 🐛 Fixes 

- [Weather card chart rendering icon](https://github.com/adrien-parasote/ha-sci-fi/issues/11)

<br>

## [v0.3.5](https://github.com/adrien-parasote/ha-sci-fi/releases/tag/0.3.5) - 2024-01-13

**Rocket Transported To Launchpad** : first package deployment under HACS

### Added or Changed

- Main Hexa card
- Ligth management card
- Weather info card