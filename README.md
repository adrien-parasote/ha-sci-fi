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


---

## 📖 User Documentation & Installation

All documentation regarding installation, usage, available cards, and custom icons has been moved to our Wiki.

👉 **[Go to the HA SCI-FI Wiki](https://github.com/adrien-parasote/ha-sci-fi/wiki)** 👈

<img src="https://raw.githubusercontent.com/adrien-parasote/ha-sci-fi/main/screenshot/bridge_1.jpeg" width="300"> <img src="https://raw.githubusercontent.com/adrien-parasote/ha-sci-fi/main/screenshot/hexa.jpeg" width="300">

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
