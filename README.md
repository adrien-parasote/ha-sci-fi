# 🛸 HA SCI-FI 🛸

[![HACS: Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![Last commit](https://img.shields.io/github/last-commit/adrien-parasote/ha-sci-fi)](#)
[![Current version](https://img.shields.io/github/v/release/adrien-parasote/ha-sci-fi)](https://github.com/adrien-parasote/ha-sci-fi/releases/latest)
[![Tests](https://img.shields.io/badge/tests-967%20passing-brightgreen)](#)
[![Coverage](https://img.shields.io/badge/coverage-87%25-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![Lit](https://img.shields.io/badge/Lit-3.x-blueviolet)](#)
[![i18n](https://img.shields.io/badge/i18n-FR%20%7C%20EN-informational)](#)

A collection of custom Lovelace cards for a minimalist sci-fi dashboard in Home Assistant.  
The goal: a single phone entry point to control your entire home.

> [!IMPORTANT]
> **v1.3.0 — Bridge Overview + Water Management + i18n full** (Lit 3 · TypeScript 5 · zero CDN · 953 tests · 87% line coverage · Bridge Overview card with 8 optional sections · Water Management card).  
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
| 🏠 **Bridge Overview** | Home dashboard — crew, alerts, access, automations, appliances, stove, vehicle, call kids, actions | [→ docs](./docs/cards/bridge.md) |
| ⬡ **Hexa-Tiles** | Hexagonal dashboard overview — person, weather, entity tiles | [→ docs](./docs/cards/hexa-tiles.md) |
| 💡 **Lights** | Auto-discovers lights, groups by floor/area | [→ docs](./docs/cards/lights.md) |
| 🌦️ **Weather** | Current conditions + hourly chart + daily forecast | [→ docs](./docs/cards/weather.md) |
| 🌡️ **Climates** | Radiator controls grouped by floor/area | [→ docs](./docs/cards/climates.md) |
| 🔌 **Plugs** | Active power usage grouped by floor/area | [→ docs](./docs/cards/plugs.md) |
| 🔥 **Stove** | Pellet stove real-time states and dashboard | [→ docs](./docs/cards/stove.md) |
| 📺 **TV Remote** | Concentric radar volume dial, D-pad with custom actions, quick source select | [→ docs](./docs/cards/tv.md) |
| 🧹 **Vacuum** | State tracking, segments cleaning, maintenance stats | [→ docs](./docs/cards/vacuum.md) |
| 🚗 **Vehicles** | Battery, range, lock status and quick actions | [→ docs](./docs/cards/vehicles.md) |
| 💧 **Water Management** | Centralized water heating and valve controls | [→ docs](./docs/cards/water.md) |

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

> [!TIP]
> **Use sci-fi icons in your own cards or components**: the `<sci-icon>` custom element is available globally once the bundle is loaded. Use it anywhere in your HA dashboard:
> ```html
> <sci-icon icon="sci:stove" style="--icon-width:32px;--icon-color:#00d2ff"></sci-icon>
> <sci-icon icon="mdi:home"></sci-icon>
> ```
> CSS custom properties: `--icon-width` (default 24px) · `--icon-height` (default 24px) · `--icon-color` (default `currentColor`).

---

## 🔧 Developer setup

```bash
npm install          # install deps
npm test             # run 967 tests (Vitest + happy-dom)
npm run typecheck    # TypeScript strict check
npm run lint         # ESLint
npm run build        # produce dist/sci-fi.min.js
npm run test:coverage  # coverage report (target: ≥90%)
```

Workbench (dev preview):

```bash
npx serve dev -p 8888   # serves dev/workbench.html
```

The **🎨 Icons** tab in the workbench shows all `sci:` icons dynamically loaded from the bundle — search, resize, color-pick, and copy `sci:name` to clipboard.

Copy to HA after build:

```bash
cp dist/sci-fi.min.js /path/to/ha/config/www/ha-sci-fi/sci-fi.min.js
```

Then bump the resource `?v=` number in HA dashboard settings and hard-reload.

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

See [CHANGELOG.md](./CHANGELOG.md) for the full release history.
