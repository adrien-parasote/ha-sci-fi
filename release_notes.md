# Release v1.2.3 💧🪐

This major release of the `1.2.x` branch introduces the brand-new **Water Management card (`sci-fi-water-management`)** along with numerous visual enhancements, stability optimizations, and robust localization!

This release note consolidates all changes from the new version `1.2.3` (translation fix) as well as versions `1.2.0`, `1.2.1`, and `1.2.2`.

## 🚀 Features

### 💧 Water Management Card (`sci-fi-water-management`)
A brand-new complete Lovelace card to control and monitor your water circuits, irrigation, hydroponics, or soil moisture:
- **Dynamic Hexa Tiles**: Automatic grouping of sensors and actuators into futuristic accordion structures mapped to their zones.
- **Dedicated Automations**: Distinct and styled section specifically for your Home Assistant automations (`automation.`).
- **Customization Panel**: Complete visual configuration UI to individually show or hide any entity.
- **Global Filters & Exclusions**: Wildcard support (e.g. `*temperature*`) to automatically ignore unnecessary entities.
- **Default Floor Selection**: Configurable UI to load the floor or area of your choice by default.
- **Complex Type Support**: Intelligent HA service domain inference to support both virtual and physical entities (`input_select`, `select`, etc.).

### 📺 TV Remote Card (`sci-fi-tv`)
- **Sony Bravia Validated**: Updated and validated documentation for Sony Bravia TVs via the official integration, ensuring perfect mapping out-of-the-box.

### 🌍 Hexagonal Grid
- **Hexa Tiles & Water**: Added native support for the `water` filter kind to group or link the hexagonal dashboard directly with your water tiles.

---

## 🐛 Bug Fixes

### 🌍 i18n & Localization (Critical - New in v1.2.3)
- **Minification & Terser**: Fixed a major production build bug where Terser merged symmetric `msg()` ternary expressions (e.g. `isOn ? msg('A') : msg('B')`) into a single dynamic call `msg(isOn ? 'A' : 'B')`. This optimization broke `lit-localize`'s static compile-time hashing and forced toast notifications and control statuses across TV Remote, Plugs, and Water cards to display in English (e.g. `"Turned on"`, `"STANDBY"`, `"OFFLINE"`) when French was active. Calls have been rewritten using robust, un-collapsible static tuples (`[msg('OFF'), msg('ON')][isOn ? 1 : 0] as string`) to completely prevent destructive minification.
- **lit-localize extract**: Fixed a silent linter failure that discarded French translations when the `<target>` node was missing in the XLIFF files.

### 💧 Water & Lights Cards (v1.2.2)
- **First Render Race Condition**: Fixed an asynchronous initialization issue with `hass.floors` that cleared user configuration for the default floor (e.g. `Extérieur`) if evaluated before the WebSocket registry was fully populated.
- **Case-Insensitive Mapping**: Fully supported friendly floor names with accents or mixed cases (e.g. `Extérieur` or `REZ-DE-CHAUSSÉE`).
- **Dynamic Icons**: Used Home Assistant's native state icon (`ha-state-icon`) to dynamically inherit device class icons (like batteries or moisture) instead of forcing a static icon.
- **UI Toggle Glitch**: Fixed a double-fire event on `sf-toggle-change` that caused toggles to visually glitch.

---

## 🛠️ Technical & Tech Debt
- Resolved floating promise warnings inside `sci-fi-water-management-editor.ts`.
- Updated architectural codemap documentation (`docs/CODEMAPS/frontend.md`).
- Documented lit-localize minification patterns in the continuous learning registry (`.agents/learnings/L075_terser_lit_localize_collapse.md`).
- Maintained 100% unit test coverage (602 passing tests).
