# Remove YAML Configuration for sci-fi-tv

## Goal
Eliminate the need to use the YAML code editor for the `sci-fi-tv` card by adding full visual UI support for:
1. `custom_actions` (per-button action overrides)
2. `sources` (complex media sources with specific actions like scripts or service calls)

## Proposed Changes

### 1. New Component: `sf-editor-action`
Create `src/components/editor-inputs/sf-editor-action.ts`:
- Wraps Home Assistant's native `<ha-selector>` with `selector: { action: {} }`.
- Inherits the sci-fi aesthetics where possible, but delegates the complex action configuration (Service, Target, Data) to HA's robust native UI.
- Gracefully degrades with a fallback text area if the `ha-selector` is unavailable (e.g., in the mock workbench).

### 2. Update `sci-fi-tv-editor`
- **Custom Actions:** Add a new accordion "Actions Personnalisées".
  - Add 8 `sf-editor-action` fields for each remote button (`up`, `down`, `left`, `right`, `confirm`, `back`, `home`, `menu`).
- **Sources:** Replace the current `sf-editor-chips` (which only supports strings) with a new `sf-editor-source-list` component.
  - This component will render a list of sources.
  - Each source will have a "Name" text input and an `<sf-editor-action>` to define its behavior.
  - Add a "+ Ajouter une source" button.

### 3. Update Workbench Mocks
- In `dev/workbench.html`, register a mock `<ha-selector>` web component so the dev environment doesn't crash when rendering the new editors.

## User Review Required

> [!IMPORTANT]
> **Use of HA Native UI:** The action editor (Service, Entity, Data) is extremely complex to rebuild from scratch. I plan to use Home Assistant's native `<ha-selector>`. This means the action configuration part will look like standard Home Assistant rather than pure "Sci-Fi" neon theme, but it guarantees 100% feature parity and stability. Are you okay with this?

> [!WARNING]
> **Complex Sources:** The new sources editor will be a list of blocks (Name + Action). Existing string-based sources in YAML will be automatically migrated to object-based sources (`{ name: '...', action: '...' }`) when edited visually to maintain a consistent UI state.

## Verification Plan
1. Run `npm run build:dev`.
2. Open `dev/workbench.html` and ensure the mock components render without crashing.
3. Verify that the emitted `config-changed` event correctly contains the nested action objects.
4. Verify tests pass.
