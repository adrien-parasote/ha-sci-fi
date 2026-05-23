# Reading Confirmation & Terms Extraction

> Document Type: Reference
> Stream Coding · SPEC Stage · May 2026

We confirm that we have fully read, inspected, and verified the structure of all 6 specifications in `ha-sci-fi/docs/specs/` and the Master spec `ha-sci-fi/docs/MASTER.md`.

---

## Documents Read

| Document | Path | Key Focus |
|---|---|---|
| Master Spec Index | [MASTER.md](../MASTER.md) | Architectural layout, dependency chain, cross-spec summaries, pre-check status. |
| Spec 01 | [01_infrastructure.md](../specs/01_infrastructure.md) | Rollup 4 configurations, strict TS rules, dev container setup, GHA workflow checks. |
| Spec 02 | [02_domain_selectors.md](../specs/02_domain_selectors.md) | Immutable selector files, HASS extension types, custom registry layouts. |
| Spec 03 | [03_base_classes.md](../specs/03_base_classes.md) | Abstract `SciFiBaseCard`, `SciFiBaseEditor`, try/catch error boundaries, style sheet imports. |
| Spec 04 | [04_components.md](../specs/04_components.md) | Dynamic icon cache (`idb-keyval`), `<sf-radiator>` sub-elements division, styles isolation. |
| Spec 05 | [05_cards.md](../specs/05_cards.md) | 8 card implementations, Chart.js weather loading, SVG landspeeder vehicle animations. |
| Spec 06 | [06_entry_migration.md](../specs/06_entry_migration.md) | Main package script entry (`src/sci-fi.ts`), customIcons integration, locale code bundles. |

---

## Key Terms & Concepts Extracted

- **`HomeAssistant` (HA)**: The core state object passed by Lovelace containing all active entity structures, registries, and connection handlers.
- **`SciFiBaseCard`**: The standardized abstract parent class extending `LitElement` that wraps cards, handles state reactivity, and executes rendering inside an error boundary.
- **`idb-keyval`**: A tiny, lightweight wrapper around IndexedDB utilized for dynamic caching of compiled SVGs retrieved from Material Design Icons (MDI).
- **`window.customIcons`**: The global window registry used by Lovelace to allow custom card suites to register custom icon namespaces (`sf:` in our implementation).
- **`sf-radiator`**: A complex, highly coupled climate control sub-system, now cleanly broken down into 4 standalone sub-components (`sf-radiator`, `sf-radiator-button`, `sf-radiator-gauge`, `sf-radiator-temp`).
- **`lit-localize`**: The standard localization framework used to compile statically bundled language structures (EN, FR) inside the final single-file bundle.
