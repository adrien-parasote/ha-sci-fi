# Goal: Remove "call_kids" and exclusively adopt the generic "actions" section

This plan describes the steps to refactor the `sci-fi-bridge` card to completely remove the dedicated, hard-coded `call_kids` component and YAML section, replacing it entirely with the more flexible, generic `actions` section (which is already implemented but needs to be the sole way of handling quick actions/buttons).

## User Review Required

> [!IMPORTANT]
> **Breaking Change for YAML:** This completely removes the `call_kids` configuration key from the YAML schema. Any existing configuration utilizing `call_kids:` will no longer render that section. Instead, users must use the `actions:` block to define their quick buttons (including calling the kids).
>
> **Example Migration:**
> ```yaml
> # Old Configuration
> call_kids:
>   entity: input_button.call_kids
>   name: "Appeler les enfants"
>   icon: "mdi:bullhorn"
> 
> # New Migrated Configuration
> actions:
>   items:
>     - entity: input_button.call_kids
>       name: "Appeler enfants"
>       icon: "mdi:bullhorn"
>       color: "var(--sf-primary)"
> ```

## Proposed Changes

### Configuration & Types

#### [MODIFY] [config.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/types/config.ts)
- Remove `call_kids?: BridgeCallKidsConfig;` from `SciFiBridgeConfig`.
- Remove `BridgeCallKidsConfig` interface.

#### [MODIFY] [config-metadata.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/bridge/config-metadata.ts)
- Remove `call_kids` metadata key.

### Components

#### [MODIFY] [sci-fi-bridge.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/bridge/sci-fi-bridge.ts)
- Remove import of `./sections/sf-bridge-call-kids.js`.
- Remove `call_kids` block from `getRelevantEntities()`.
- Remove `call_kids` template from `renderCard()`.
- Remove `call_kids` size offset from `getCardSize()`.

#### [MODIFY] [sci-fi-bridge-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/bridge/sci-fi-bridge-editor.ts)
- Remove `_renderCallKidsSection()` from `renderEditor()`.
- Remove `_renderCallKidsSection` method completely.

#### [DELETE] [sf-bridge-call-kids.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/cards/bridge/sections/sf-bridge-call-kids.ts)
- Delete the file entirely as the component is no longer needed.

### Workbench Scenario Data

#### [MODIFY] [bridge.js](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/dev/cards/bridge.js)
- Remove mock entity `input_button.call_kids` if no longer used, or keep standard actions in `BASE_ENTITIES`.
- Remove `call_kids` block from `scenarioMinimal._config`.
- Remove `call_kids` block from default `config`.
- Ensure `actions` is the sole panel with mock actions configured.

#### [MODIFY] [hexa.js](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/dev/cards/hexa.js)
- If necessary, adjust any references to `input_button.call_kids` link to point to `bridge` without depending on `call_kids` section.

### Specifications & Documentation

#### [MODIFY] [bridge.md (Spec)](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/specs/cards/bridge.md)
- Remove `call_kids` from YAML schemas, TypeScript Interfaces, config-metadata, `getRelevantEntities`, renderCard, file tree, and Shared Artifact Schema.
- Remove F-BR-11 and related test cases / assumptions.

#### [MODIFY] [bridge.md (User Doc)](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/docs/cards/bridge.md)
- Update user configuration guides, examples, and features table to remove `call_kids` and show the `actions` alternative instead.

---

## Verification Plan

### Automated Tests
- Run full Vitest suite to ensure zero regressions:
  ```bash
  npx vitest run
  ```

### Manual Verification
- Launch local development Workbench:
  ```bash
  npm run dev
  ```
- Verify that the `Bridge Overview` card is displayed cleanly.
- Verify that the `Call Kids` distinct panel is gone, and only the generic `Actions` panel at the bottom is shown.
- Open the card editor and confirm the "Appeler les enfants" accordion section is gone, leaving only the "Actions" section.
