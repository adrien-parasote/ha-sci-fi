# 🛸 HA SCI-FI 🛸

[![HACS: Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![Last commit](https://img.shields.io/github/last-commit/adrien-parasote/ha-sci-fi)](#)
[![Current version](https://img.shields.io/github/v/release/adrien-parasote/ha-sci-fi)](https://github.com/adrien-parasote/ha-sci-fi/releases/latest)
[![Tests](https://img.shields.io/badge/tests-137%20passing-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![Lit](https://img.shields.io/badge/Lit-3.x-blueviolet)](#)

A collection of custom Lovelace cards for a minimalist sci-fi dashboard in Home Assistant.  
The goal: a single phone entry point to control your entire home.

> [!IMPORTANT]
> **v1.0 — Full rewrite** (Lit 3 · TypeScript 5 · zero CDN · 137 tests).  
> Upgrading from v0.x? See **[MIGRATION.md](./MIGRATION.md)** for breaking changes.

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

Icons are loaded via the HA native icon registry — **no CDN, works offline**.

| Name | HA string |
|---|---|
| Season winter | `sci:winter` |
| Season spring | `sci:spring` |
| Season autumn | `sci:autumn` |
| Season summer | `sci:summer` |
| Stove | `sci:stove` |
| Stove cool | `sci:stove-cool` |
| Stove eco | `sci:stove-eco` |
| Stove heat | `sci:stove-heat` |
| Stove off | `sci:stove-off` |
| Radiator auto | `sci:radiator-auto` |
| Radiator frost | `sci:radiator-frost-protection` |
| Radiator heat | `sci:radiator-heat` |
| Radiator off | `sci:radiator-off` |
| Vacuum sleep | `sci:vacuum-sleep` |
| Vacuum docked | `sci:vacuum-docked` |
| Landspeeder | `sci:landspeeder` |
| Landspeeder plugged | `sci:landspeeder-plugged` |
| Lock unknown | `sci:lock-unknow` |

---

## 🔧 Developer setup

```bash
npm install          # install deps
npm test             # run 137 tests (Vitest + happy-dom)
npm run typecheck    # TypeScript strict check
npm run lint         # ESLint
npm run build        # produce dist/sci-fi.min.js
```

Copy to HA after build:

```bash
cp dist/sci-fi.min.js /path/to/ha/config/www/ha-sci-fi/sci-fi.min.js
```

Then bump the resource `?v=` number in HA dashboard settings and hard-reload.

**DevContainer:** open in VS Code → *Reopen in Container* → HA dev instance starts automatically on port 8123.

---

## 👽 Language / i18n

Available: 💂 English · 🥖 French

To add a language, follow the [Lit localization guide](https://lit.dev/docs/localization/overview/):

1. Download [xliff/fr.xlf](https://raw.githubusercontent.com/adrien-parasote/ha-sci-fi/refs/heads/main/xliff/fr.xlf)
2. Rename to your [BCP 47 code](https://www.w3.org/International/articles/language-tags/index.en)
3. Update `target-language` attribute and all `<target>` tags
4. Open a [Pull Request](https://github.com/adrien-parasote/ha-sci-fi/pulls)
