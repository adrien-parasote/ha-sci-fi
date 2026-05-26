# 🛸 HA SCI-FI 🛸

[![HACS: Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![Last commit](https://img.shields.io/github/last-commit/adrien-parasote/ha-sci-fi)](#)
[![Current version](https://img.shields.io/github/v/release/adrien-parasote/ha-sci-fi)](https://github.com/adrien-parasote/ha-sci-fi/releases/latest)
[![Tests](https://img.shields.io/badge/tests-566%20passing-brightgreen)](#)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![Lit](https://img.shields.io/badge/Lit-3.x-blueviolet)](#)
[![i18n](https://img.shields.io/badge/i18n-FR%20%7C%20EN-informational)](#)

A collection of custom Lovelace cards for a minimalist sci-fi dashboard in Home Assistant.  
The goal: a single phone entry point to control your entire home.

> [!IMPORTANT]
> **v1.0.0 — State-of-the-Art Urbanization & Performance Update** (Lit 3 · TypeScript 5 · zero CDN · 566 tests · 100% TDD coverage · selective HA rendering).  
> Upgrading? See **[MIGRATION.md](./docs/MIGRATION.md)** for breaking changes and YAML configurations mapping.

---

## 🛠️ Installation

<details>
<summary>With HACS (Recommended)</summary>

<br>

1. Install [HACS](https://hacs.xyz) if you don't have it already
2. Open HACS in Home Assistant
3. Click the 3-dot menu → **Custom repositories**
4. Add `https://github.com/adrien-parasote/ha-sci-fi`, type `Dashboard`, click **Add**
5. Find `ha-sci-fi` in **Available for download** → click **Download**
6. Tap **Reload**

</details>

<details>
<summary>Without HACS (manual)</summary>

<br>

1. Download [dist/sci-fi.min.js](https://raw.githubusercontent.com/adrien-parasote/ha-sci-fi/refs/heads/main/dist/sci-fi.min.js)
2. Copy it into `<config>/www/ha-sci-fi/`
3. In your dashboard: top-right icon → **Edit dashboard** → **Manage resources**
4. **Add resource** → `/local/ha-sci-fi/sci-fi.min.js?v=1.0` → **JavaScript Module**
5. Reload the page
6. After any update, bump the `?v=` number to clear the cache

</details>

---

## 🧩 Available cards

| Card | Description | Docs |
|---|---|---|
| ⬡ **Hexa-Tiles** | Hexagonal dashboard overview — person, weather, entity tiles | [→ docs](./docs/cards/hexa-tiles.md) |
| 💡 **Lights** | Auto-discovers lights, groups by floor/area | [→ docs](./docs/cards/lights.md) |
| 🌦️ **Weather** | Current conditions + hourly chart + daily forecast | [→ docs](./docs/cards/weather.md) |
| 🌡️ **Climates** | Radiator controls grouped by floor/area | [→ docs](./docs/cards/climates.md) |
| 🪵🔥 **Stove** | Pellet stove state, sensors and actions | [→ docs](./docs/cards/stove.md) |
| 🚗 **Vehicles** | EV battery, range, charging, location | [→ docs](./docs/cards/vehicles.md) |
| 🔌 **Plugs** | Smart plug control with power chart | [→ docs](./docs/cards/plugs.md) |
| 🖲 **Vacuum** | Vacuum control with live map and room shortcuts | [→ docs](./docs/cards/vacuum.md) |

---

## 🖼️ Custom icons

Animated and static icons loaded via the HA native icon registry — **no CDN, works offline**.

| Name | HA string | Preview  |
| - | - | - |
| Season winter | `sci:winter` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/winter.svg" alt="Season winter"  height="25"/> |
| Season spring | `sci:spring` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/spring.svg" alt="Season spring"  height="25"/> |
| Season autumn | `sci:autumn` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/autumn.svg" alt="Season autumn"  height="25"/> |
| Season summer | `sci:summer` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/summer.svg" alt="Season summer"  height="25"/> |
| Stove | `sci:stove` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove.svg" alt="Stove"  height="25"/> |
| Stove cool | `sci:stove-cool` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_cool.svg" alt="Stove cool"  height="25"/> |
| Stove eco | `sci:stove-eco` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_eco.svg" alt="Stove eco"  height="25"/> |
| Stove heat | `sci:stove-heat` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_heat.svg" alt="Stove heat"  height="25"/> |
| Stove off | `sci:stove-off` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_off.svg" alt="Stove off"  height="25"/> |
| Stove unknown | `sci:stove-unknow` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/stove_unknow.svg" alt="Stove unknown"  height="25"/> |
| Radiator auto | `sci:radiator-auto` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/radiator_auto.svg" alt="Radiator auto"  height="25"/> |
| Radiator frost protection | `sci:radiator-frost-protection` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/radiator_frost_protection.svg" alt="Radiator frost protection"  height="25"/> |
| Radiator heat | `sci:radiator-heat` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/radiator_heat.svg" alt="Radiator heat"  height="25"/> |
| Radiator off | `sci:radiator-off` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/radiator_off.svg" alt="Radiator off"  height="25"/> |
| Sleeping vacuum | `sci:vacuum-sleep` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/sleeping_vacuum.svg" alt="Sleeping vacuum"  height="25"/> |
| Docked vacuum | `sci:vacuum-docked` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/docked_vacuum.svg" alt="Docked vacuum"  height="25"/> |
| Landspeeder | `sci:landspeeder` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/landspeeder.svg" alt="Landspeeder"  height="25"/> |
| Landspeeder plugged | `sci:landspeeder-plugged` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/landspeeder-plugged.svg" alt="Landspeeder plugged"  height="25"/> |
| Landspeeder plugged off | `sci:landspeeder-plugged-off` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/landspeeder-plugged-off.svg" alt="Landspeeder plugged off"  height="25"/> |
| Landspeeder unknown plug | `sci:landspeeder-unknown-plug` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/landspeeder-unknown-plug.svg" alt="Landspeeder unknown plug"  height="25"/> |
| Landspeeder error plug | `sci:landspeeder-error-plug` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/landspeeder-error-plug.svg" alt="Landspeeder error plug"  height="25"/> |
| Landspeeder plugged clock | `sci:landspeeder-plugged-clock` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/landspeeder-plugged-clock.svg" alt="Landspeeder plugged clock"  height="25"/> |
| Power socket fr off | `sci:power-socket-fr-off` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/power-socket-fr-off.svg" alt="Power socket fr off"  height="25"/> |
| Lock unknown | `sci:lock-unknow` | <img src="https://github.com/adrien-parasote/ha-sci-fi/blob/main/screenshot/lock-unknow.svg" alt="Lock unknown"  height="25"/> |

**Weather animated icons** (used by Hexa-Tiles) are loaded via the `sci:` namespace and animate day/night states automatically.

---

## 🔧 Developer setup

```bash
npm install          # install deps
npm test             # run 566 tests (Vitest + happy-dom)
npm run typecheck    # TypeScript strict check
npm run lint         # ESLint
npm run build        # produce dist/sci-fi.min.js
npm run test:coverage  # coverage report (target: ≥90%)
```

Copy to HA after build:

```bash
cp dist/sci-fi.min.js /path/to/ha/config/www/ha-sci-fi/sci-fi.min.js
```

Then bump the resource `?v=` number in HA dashboard settings and hard-reload.

### Local workbench

A local UI test environment is available **before** any production deployment:

```bash
npm run build
npx serve . --listen 8888 --cors
open http://localhost:8888/dev/workbench.html
```

The workbench features:
- **8 card tabs** with realistic mock data (production YAML entity IDs)
- **Mock mode** — pre-built scenarios per card (Dobby cleaning, EvLink charging, pellets low…)
- **Live mode** — connects to a real HA instance via WebSocket (OAuth or Long-Lived Token)
- Interactive log filters, keyword search, and copy button for debugging

---

## 👽 Language / i18n

Available: 💂 English · 🥖 French

The i18n system uses [`@lit/localize`](https://lit.dev/docs/localization/overview/) in **runtime mode**:
- Language is automatically detected from your HA `locale.language` setting
- No page reload required — locale switches reactively when HA language changes
- Source strings: English · Translations: `xliff/fr.xlf` + `src/locales/locales/fr.ts`

To add a language:

1. Download [xliff/fr.xlf](https://raw.githubusercontent.com/adrien-parasote/ha-sci-fi/refs/heads/main/xliff/fr.xlf)
2. Rename to your [BCP 47 code](https://www.w3.org/International/articles/language-tags/index.en)
3. Update `target-language` attribute and all `<target>` tags
4. Add your locale to `src/locales/locale-codes.ts` and `src/locales/localization.ts`
5. Open a [Pull Request](https://github.com/adrien-parasote/ha-sci-fi/pulls)

---

## 📋 Changelog

### v1.0.0 — 2026-05-26 *(Finalized & Urbanized)*

#### ⬡ Guidelines Compliance & Lovelace Actions Delta Remediation
- **Lovelace Actions Support**: Implemented a lightweight, zero-dependency `fireHassAction()` event dispatcher utilizing native CustomEvent bubbling up the DOM tree, fully satisfying Lovelace tap/hold/double_tap custom action configs with zero npm package overhead (saving ~70KB+ in final IIFE bundle).
- **Interactive triggers**: Bound click/action triggers to custom tiles in `sci-fi-hexa-tiles.ts` and card-level tap actions to the header text in `sci-fi-lights.ts`.
- **Card Sizing Contract**: Made all 8 custom cards implement the standard `LovelaceCard` typescript interface contract and overrode `getCardSize()` with fallback guards protecting against raw unconfigured instantiation.
- **Theme and Variable Remediation**: Wrapped climates card in `<ha-card>` for native frames and migrated season colors to CSS custom properties with fallbacks (`var(--sf-season-blue, #acd5f3)`).
- **Style Cleanup**: Substituted hardcoded colors with `--sf-*` tokens in vacuum card styles, and enabled custom card picker `documentationURL` and HACS plugin classifications.

#### ⬡ Codebase Urbanization & Style Extraction — Major Achievements
- **Kebab-case Folder Naming**: Renamed `hexa_tiles` to `hexa-tiles` across sources, bundlers, and tests.
- **Stylesheet Offloading**: Extracted all inline styles in climates, weather, lights, and hexa-tiles cards into cacheable, dedicated `styles.ts` files with strict `:host` containment.
- **Unified Test Suites**: Integrated all fragmented `*-extended.test.ts`, `*-new.test.ts`, and `*-design.test.ts` files directly into their respective primary card test files, purging 8 legacy test files from disk.
- **Architectural Integrity**: Cleared all layer and boundary violations via Sentrux analysis, moving constants to correct layers (e.g. `vehicle_const.ts` to `src/components/`).

#### ⬡ Hexa-Tiles — major overhaul
- **Fully responsive checkerboard grid** — ResizeObserver replaces `window.innerWidth`; `--cols` CSS custom property set on `:host` for correct PC/tablet/phone interlocking alignment
- **Animated weather icons** — custom `sci:` namespace animated SVGs replace MDI icons; day/night states animate automatically; city name displayed instead of temperature
- **Tile aggregation** — tiles now group entities by `kind/group`; media player `playing` state supported
- **Dynamic day/night active states** — sun tile highlights yellow during daytime
- **Avatar status badge** — resized and repositioned; circle background removed
- **Hover effects** — smooth scale + glow on hexagon hover (floor selectors and area tiles)

#### 🌦️ Weather — full restoration
- Legacy layout and Chart.js integration fully restored
- Forecast WebSocket subscription reconnected
- Background/border removed for seamless card integration
- Solid fallback colors for HA legacy theme variables

#### 🌡️ Climates — UI restoration
- Full legacy sci-fi UI and radiator controls restored
- Dropdown opens **downward** (`position=bottom`); anchored `right: 0` to prevent overflow
- Wheel anchored to radiator white square; connector line aligned
- Preset and HVAC mode buttons: spacing, borders, colors unified with lights card

#### 💡 Lights
- Robust floor/area validation — validates by ID existence, not light count (avoids false negatives on first HA load)
- Hexagon hover: improved spacing and scale effect

#### 🖼️ Custom icons
- Custom animated SVGs and static icons restored and integrated via `sci:` namespace
- Workbench mock `ha-icon` defined to support MDI rendering without WebSocket queries

#### 🔧 sf-icon / icon-cache fixes
- Hybrid native rendering strategy: delegates to `<ha-icon>` in production, avoiding deprecated `frontend/get_icons` WebSocket API
- Race condition on startup resolved (connection property update now triggers icon re-fetch)
- Concurrent fetch rate limiter fixed; `registryPromise` decoupled per connection object

#### 🌐 i18n — restored
- `@lit/localize` runtime i18n system re-integrated after refacto had removed it
- `SciFiBaseCard` and `SciFiBaseEditor`: `hass` setter calls `setLocale()` when language changes; `updateWhenLocaleChanges(this)` in constructors
- `sf-radiator`: all preset/HVAC mode labels (`heat`, `cool`, `comfort`, `eco`, `frost protection`…) now use `msg()` for reactive translation
- Full FR translation map restored (`src/locales/locales/fr.ts` — 170+ entries)

#### 🧪 Tests & coverage
- **566 tests** — 100% TDD file-matching test coverage, secured by a deterministic `.tdd_lock` validation.
- **Vitest & happy-dom**: Fully compliant with browser DOM mock setups, covering all reactive local and dynamic translations.

#### 🛠️ Workbench improvements
- Interactive log filters (level + keyword search)
- Copy button for filtered log output
- Hexa tile clicks switch the active workbench tab automatically
- Phone height chain fixed so card fills the simulated screen

---

*Previous releases: see [GitHub Releases](https://github.com/adrien-parasote/ha-sci-fi/releases)*
