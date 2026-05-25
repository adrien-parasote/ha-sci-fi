# 🔬 DISCOVER — Urbanization & Performance Audit Report

> Stream Coding · DISCOVER gate · May 2026
> Project: Home Assistant Sci-Fi Cards (ha-sci-fi)

---

## Research Results: Urbanization & Performance Optimization

This audit analyzes the codebase of `ha-sci-fi` to outline a state-of-the-art plan for files reorganization (urbanization), rendering performance enhancements, unit tests merging, and documentation consolidation.

### Topic Decomposition

| # | Sub-Question | Why Necessary | Source Types | Keywords / Scopes |
|---|---|---|---|---|
| 1 | **Codebase Urbanization** | Identify naming inconsistencies, dead folders, and non-standard layout configurations that violate our architectural style. | Local filesystem scan, imports audit | `hexa_tiles` vs `hexa-tiles`, `components/icons`, snake vs kebab casing |
| 2 | **Rendering & Code Performance** | Pinpoint rendering bottlenecks where massive HA `hass` state updates cause unnecessary CPU and layout cycles in Lit elements. | LitElement lifecycle analysis, EventListeners, ResizeObservers | `shouldUpdate`, `getRelevantEntities()`, `ResizeObserver`, `requestUpdate()` |
| 3 | **Unit Test Suite Consolidation** | Uncover redundant, scattered, or overlapping test suites (like `*-extended.test.ts`) that can be merged to improve maintainability. | Vitest test layout audit | `*-extended.test.ts`, `*-new.test.ts`, duplicate selectors tests |
| 4 | **Documentation Coherence** | Find duplicate, outdated, or fragmented specifications and ADRs across the repository to enforce a strict Single Source of Truth. | `docs/` spec directory audit | `MASTER.md` duplication, stale review files |

---

### Source Evaluation

| Source | Type | Date | Credibility | Key Findings | Conflicts? |
|---|---|---|---|---|---|
| [Lit shouldUpdate API](https://lit.dev/docs/components/lifecycle/#shouldupdate) | Official Reference | 2026 | High (Official) | Lit uses `shouldUpdate(changedProperties)` to decide whether to render. Coalescing updates prevents layout thrashing. | No |
| [HA custom-card-boilerplate](https://github.com/custom-cards/boilerplate-card) | Community Reference | 2025 | High | Best practices recommend listening *only* to specific monitored entities rather than updating on all `hass` states. | No |
| `src/utils/base-card.ts` | Source Code | 2026 | Primary | Implements `shouldUpdate` which delegates to `getRelevantEntities()`. If `getRelevantEntities()` is empty, it returns `true` (rendering on all updates). | No |
| Existing Test Suite | Source Code / CLI | 2026 | Primary | 583 tests are passing successfully in 4.62 seconds. However, several cards have up to 4 different test files on the disk. | No |

---

### Conflict Analysis

| Sources | Claim A | Claim B | Reason for Discrepancy | Resolution |
|---|---|---|---|---|
| `docs/MASTER.md` vs `docs/specs/00_MASTER.md` | `docs/MASTER.md` is the Strategic Master Spec index. | `docs/specs/00_MASTER.md` contains identical contents. | The files are symlinked or duplicated across directories. | **Consolidate**: Retain `docs/MASTER.md` as the unique master index and remove `docs/specs/00_MASTER.md` or replace it with a clear pointer. |
| `src/components/icons/` vs `src/components/sf-icon/` | Both contain `data/sf-weather-icons.ts`. | Both define identical weather SVG icon paths. | Leftover duplicated code from a past migration. | **Consolidate**: Point all imports to `src/components/sf-icon/data/sf-weather-icons.ts` and delete the redundant `src/components/icons` directory. |

---

### Gaps Identified

| Gap | Why It Matters | What Research/Fix Would Fill It |
|---|---|---|
| **Zero card-specific `getRelevantEntities` implementations** | All 8 cards inherit `getRelevantEntities(): string[] { return []; }`, meaning `shouldUpdate` returns `true` on **every single state change** in the entire Home Assistant setup. This leads to continuous, heavy re-renders. | Implement `getRelevantEntities()` in each card to return precisely the tracked entities (e.g., climate entities for climates card, lights for lights card, etc.). |
| **Lit performance warning in `sci-fi-weather`** | Schedules a state change callback *during* the update cycle, leading to console warnings and double layouts. | Move subscription logic to `willUpdate` to safely coalesce state updates before render, preventing double-renders. |
| **Inconsistent folder naming** | `hexa_tiles` uses snake_case, while others use kebab-case/plain words. Violates the "clean urbanization" architectural principle. | Rename `hexa_tiles` to `hexa-tiles` under both `src/cards/` and `tests/cards/` to standardize the directory layout. |
| **Scattered inline styles** | `lights`, `weather`, and `hexa_tiles` declare styling inline in the main `.ts` file, while other cards import from a dedicated `styles.ts` file. | Extract styles to a separate `styles.ts` file for all 8 cards to achieve perfect structural consistency. |
| **Legacy manual tests** | `tests/icons.html` and `tests/index.html` refer to old `.js` files and directories that no longer exist, causing clutter. | Delete these obsolete files. |

---

### Recommendation

- **Chosen Approach**: **Adapt** the codebase via a highly systematic refactoring cycle.
- **Justification**: The codebase already has typed TS entities and passing tests; we don't need a rewrite. We need to restructure imports, align names, optimize renders, and merge test files into a clean `card.test.ts` / `editor.test.ts` layout.
- **Impact on Spec**:
  - `05_cards.md` and related specs will be consolidated.
  - An updated implementation plan will guide the executing steps.

---

### Discovered Patterns

#### Pattern 1: Elegant `getRelevantEntities` implementation for Custom Cards
```typescript
protected override getRelevantEntities(): string[] {
  const entities = new Set<string>();
  
  // Track main entity
  if (this.config.entity) {
    entities.add(this.config.entity);
  }
  // Track extra sensors from config
  if (this.config.sensor_inside_temperature) entities.add(this.config.sensor_inside_temperature);
  if (this.config.sensor_ambient_temperature) entities.add(this.config.sensor_ambient_temperature);
  if (this.config.sensor_pellet_quantity) entities.add(this.config.sensor_pellet_quantity);
  
  return Array.from(entities);
}
```

#### Pattern 2: Weather subscribeForecast in `willUpdate`
```typescript
override willUpdate(changedProps: PropertyValues): void {
  super.willUpdate(changedProps);
  if (changedProps.has('config') || !this._subscribedEntity) {
    void this._subscribeForecasts();
  }
}
```

---

## POC Gate at DISCOVER Exit

Every key fact in this audit is fully verified within the local codebase:

| Fact | Source | Status |
|---|---|---|
| `getRelevantEntities` is absent from all 8 cards | Grep search: `getRelevantEntities` returns only `base-card.ts` | **VERIFIED** |
| `src/components/icons/` contains duplicate files | File path: `src/components/icons/data/sf-weather-icons.ts` exists | **VERIFIED** |
| Obsolete HTML test files | File paths: `tests/index.html` and `tests/icons.html` are dead links | **VERIFIED** |
| Inconsistent card styling declarations | Grep search: `static override styles =` returns inline lists for 3 cards | **VERIFIED** |
