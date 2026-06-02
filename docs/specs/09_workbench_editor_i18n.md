# Spec 09 — Workbench Editor & i18n Integration

> Document Type: Implementation
> Covers: Features F1 to F6 from [workbench_editor_i18n_blueprint.md](../strategic/workbench_editor_i18n_blueprint.md#L1)
> Depends on: [Spec 03 — Base Classes & Styles](./03_base_classes.md#L1), [Spec 06 — Entry & Migration](./06_entry_migration.md#L1)

---

## Blueprint Coverage

| Feature ID | Description | Covered here |
|---|---|---|
| F1 | Language Switcher (EN/FR buttons) | § "1. Language Switcher (i18n)" |
| F2 | View/Edit Mode Toggle | § "2. Work Mode Selector" |
| F3 | Left Panel Editor Layout (Tabs) | § "3. Editor Panel Workspace" |
| F4 | YAML Code Editor & Validation | § "4. YAML Code Editor & js-yaml Integration" |
| F5 | UI Graphical Editor Dynamic Loader | § "5. Dynamic UI Graphical Editor & Fallback" |
| F6 | Right Panel Card Live Preview | § "6. Card Preview Workspace" |

---

## Assumptions

| ID | Assumption | Risk | Validation |
|---|---|---|---|
| 1 | js-yaml CDN is stable | Low | Verified via `curl https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js` — HTTP 200 |
| 2 | Base classes support dynamic language setters | Low | Verified via `grep -r setLanguage src/utils/` — method confirmed in base-card.ts |
| 3 | config-changed custom event structure matches HA | Low | Verified via `grep -r config-changed src/utils/` — event dispatch confirmed in base-editor.ts |

---

## Constraints

Every agent executing this specification must strictly adhere to the following boundary conditions:

| Tier | Constraint |
|---|---|
| **Always do** | Run verification tests; handle YAML syntax validation gracefully using try/catch blocks; use the standard `'config-changed'` custom event for updating the card configuration; verify that the `hass` object language attributes (`language` and `locale.language`) are correctly updated and propagated when switching languages. |
| **Ask first** | Any change to the base classes `SciFiBaseCard` or `SciFiBaseEditor` that is not described in this spec; adding new packages to `package.json` (prefer loading libraries from the workbench directly). |
| **Never do** | Remove the existing tablet/phone simulator controls for View mode (they must remain fully operational in View mode); bypass the YAML validation when updating the card preview; commit any credentials, tokens, or live URLs into the codebase; write any temporary scratch files outside the designated workspace directories. |

---

## Cross-Spec Contracts

 ### Produces

| Path / Identifier | Format | Schema location | Consumers |
|---|---|---|---|
| 'dev/workbench.html' | HTML / ESM | [dev/workbench.html](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/dev/workbench.html#L1) | Developer workbench environment |

 ### Consumes

| Path / Identifier | Format | Schema location | Producer |
|---|---|---|---|
| `src/utils/base-card.ts` | TypeScript | [base-card.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/base-card.ts#L21-L37) | Spec 03 (Base Classes) |
| `src/utils/base-editor.ts` | TypeScript | [base-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/base-editor.ts#L20-L32) | Spec 03 (Base Classes) |
| `src/locales/localization.ts` | TypeScript | [localization.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/locales/localization.ts#L8-L12) | Spec 06 (i18n setup) |

 ### Public Interface

| Type | Identifier | Documented at |
|---|---|---|
| Custom Event | `config-changed` | [base-editor.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/utils/base-editor.ts#L54-L63) |

 ### External Invocations

| Type | Invoked | Defined in |
|---|---|---|
| N/A | N/A — this spec has no external runtime command line invocations | N/A |

 ### Tracked Concepts

| Concept | Status in this spec | Mentioned in |
|---|---|---|
| Dynamic Localization | Handled reactively via hass locale set | [localization.ts](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/src/locales/localization.ts#L8-L12) |

---

## Implementation Details

### 1. Language Switcher (i18n)
- **UI Element**: Add a sleek button group in the toolbar of 'dev/workbench.html' to toggle between **EN** (English) and **FR** (French). Use the variables `--accent` and `--border` for glassmorphic visual highlighting of the active language.
- **State Handling**: Maintain a global state variable `currentLanguage = 'fr'` (default).
- **HA Config Language Synchronization**: When loading data from a connected live Home Assistant instance, auto-detect the configuration language (`config.language`). If it is `'fr'` or `'en'`, dynamically update `currentLanguage` to match, store it in `localStorage` under `wb-lang`, toggle active UI button states, and synchronize it to the `hass` object.
- **HASS Sync**: Whenever `currentLanguage` changes:
  1. Rebuild or patch the `hass` object (both Mock HASS and Live HASS).
  2. Set `hass.language = currentLanguage` and `hass.locale.language = currentLanguage`.
  3. Propagate the updated `hass` object to both the active card element (`cardEl.hass = hass`) and the active editor element (`editorEl.hass = hass`).
  4. The card's native `hass` setter will automatically call `setLocale()`, reactively translating all text nodes via `@lit/localize` dynamic templates.


### 2. Work Mode Selector
- **UI Element**: Add a toggle in the toolbar with two modes: **👁️ Visualisation (View)** and **✏️ Édition (Edit)**.
- **Behavior**:
  - **View Mode**: The existing simulator buttons (🖥️ PC, 📟 iPad, 📱 iPhone) and mobile/tablet frames are visible. The layout renders a single card preview area (current workbench behavior).
  - **Edit Mode**:
    - Force the viewport size to `desktop` (PC).
    - Hide and disable the device simulator buttons and physical phone/tablet outer frames.
    - Transition the layout to a side-by-side split screen (Left: Editor, Right: Card Live Preview).

### 3. Editor Panel Workspace (Left Column)
- Located on the left in Edit mode, occupying `400px` to `500px` width.
- Styled with high-premium, dark-surface glassmorphic panels matching the workbench aesthetics.
- Has two tabs at the top:
  1. **🛠️ Éditeur graphique**: Visual form-based config editor.
  2. **📝 Éditeur de code (YAML)**: Direct code editor.

### 4. YAML Code Editor & js-yaml Integration
- **CDN Loading**: Add `js-yaml` library asynchronously via CDN inside 'dev/workbench.html':
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>
  ```
- **Structure**: A monospace, dark textarea representing the card's active configuration in YAML format.
- **Parsing & Sync Flow**:
  - On textarea `input` (or light debounce):
    1. Parse the string using `jsyaml.load(yamlText)`.
    2. If validation succeeds:
       - Update the workbench global active config.
       - Clear any error validation banners.
       - Re-render/update the card preview with the new configuration (`cardEl.setConfig(config)` then `cardEl.hass = hass`).
       - If the UI editor is active and mounted, update its config too (`editorEl.setConfig(config)`).
    3. If validation fails (throws an exception):
       - Catch the error and render a beautifully styled, high-visibility error warning banner directly below the editor tabs, detailing the line number and parsing error.
       - **Do not crash**: Keep the card preview running with the last valid config.
- **Copy Button**: Add a premium "Copier le YAML" button in the tab bar. It copies the current valid YAML string from the editor directly to the clipboard.

### 5. Dynamic UI Graphical Editor & Fallback
- **Loading Pattern**:
  - Detect the card's editor tag: `editorTag = `${card.tag}-editor``.
  - Check the registry: `const isRegistered = !!customElements.get(editorTag);`.
  - **Fallback UI**: If `!isRegistered` (editor not built yet), render a futuristic, styled info panel:
    - Title: `🛠️ Éditeur Graphique indisponible`
    - Content: "L'éditeur `<card-tag>-editor` n'est pas encore enregistré. Utilisez l'éditeur de code YAML ci-dessus pour configurer cette carte."
  - **Active Editor**: If `isRegistered`, dynamically instantiate it:
    - `const editorEl = document.createElement(editorTag)`.
    - Pass properties: `editorEl.hass = hass; editorEl.setConfig(config);`.
    - Mount it inside the tab container.
    - Listen for changes:
      ```ts
      editorEl.addEventListener('config-changed', (e) => {
        const newConfig = e.detail.config;
        // 1. Update workbench global config
        // 2. Dump JS to YAML: jsyaml.dump(newConfig) and set textarea value
        // 3. Update preview card config: cardEl.setConfig(newConfig)
      });
      ```

### 6. Card Preview Workspace (Right Column)
- Located on the right in Edit mode, filling the remaining width.
- Centers the card preview in desktop mode.
- Re-renders instantly on any valid config update or live HASS state update.

---

## Anti-Patterns

| # | Anti-Pattern | Correct Behavior |
|---|---|---|
| 1 | Crashing on syntax error | Wrap the `jsyaml.load` call in a try/catch block, display a user-friendly error banner, and maintain the last valid card preview. |
| 2 | Deleting mobile/tablet CSS | Keep all phone/tablet simulator frames and CSS styles operational for View mode. Only disable and hide them during Edit mode. |
| 3 | Hardcoded locale keys in cards | Override the dynamic `hass.locale.language` and let the Lit components reactive localization engine handle translations via `@lit/localize`. |
| 4 | Bypassing the card `setConfig()` | Always call `cardEl.setConfig(config)` when a new configuration is parsed, as cards rely on it for structural initialization and validation. |
| 5 | Writing back YAML to files via server APIs | Keep the workbench completely client-side. Rely on a premium "Copier le YAML" clipboard button. |
| 6 | Symmetric ternary calls inside `msg()` | Avoid writing `cond ? msg('A') : msg('B')` because Rollup/Terser optimizer compiles this into a dynamic call `msg(cond ? 'A' : 'B')`, which fails static XLIFF key parsing. Use robust un-collapsible static array-tuple lookups instead: `[msg('B'), msg('A')][cond ? 1 : 0] as string`. |

---

## Error Handling Matrix

| Error Mode | Detection Method | System Response | Fallback / UI Display |
|---|---|---|---|
| Invalid YAML syntax | `jsyaml.load()` throws exception | Halts preview update, captures error message and line number | Renders a styled alert banner under the tabs detailing the YAML syntax error |
| CDN fails to load `js-yaml` | `window.jsyaml` is undefined | Falls back to JSON-based editing | Renders input as raw JSON string, displays warning banner: "js-yaml CDN indisponible, bascule en mode JSON." |
| Editor component fails to render | Exception caught during editor mounting | Logs error to console | Renders standard card error display inside the editor panel |
| Dynamic locale file fails to load | `setLocale()` throws exception | Logs error in console | Retains the current loaded language templates |

---

## Test Case Specifications

| Test ID | Type | Description | Input | Expected Output |
|---|---|---|---|---|
| TC-901 | Unit | YAML editor validates valid syntax | Valid YAML code text | No error is generated, parsed config is stored |
| TC-902 | Unit | YAML editor fails on invalid syntax | Invalid YAML code text | Generates exact exception with line number details |
| TC-903 | Unit | Language selection propagates to mock HASS | Set currentLanguage to 'fr' | hass.language and hass.locale.language update to 'fr' |
| TC-904 | Unit | Dynamic UI editor instantiates card editor | Registered editor class | Dynamic HTML element instantiated and configured |
| TC-905 | Unit | View mode renders tablet and phone frames | Set View mode to 'panel' | Shows device viewport options and styles |
| IT-901 | Integration | Switching language translates card | Click EN button on lights card | Lights card labels ("Lumières", "Plafond") translate instantly to English |
| IT-902 | Integration | Entering valid YAML updates card | Type valid YAML into code editor | Preview card re-renders with the newly configured properties |
| IT-903 | Integration | Entering invalid YAML shows banner | Type malformed YAML (missing indent) | Shows validation warning, card remains visible in last valid state |
| IT-904 | Integration | UI editor updates code editor | Trigger click in UI editor | Textarea YAML content is instantly regenerated to match the new config |
| IT-905 | Integration | Unimplemented editor shows fallback | Select climates tab in edit mode | Renders premium fallback card: "Éditeur graphique indisponible" |
| IT-906 | Integration | Edit mode hides device selectors | Click Edit mode button | iPad/iPhone buttons are hidden, preview forces computer layout |

---

## Verification Plan

### Manual Verification
1. **Build the bundle**:
   ```bash
   npm run build
   ```
2. **Launch the local dev server**:
   ```bash
   npx serve . --listen 8888 --cors
   ```
3. **Open the browser**: Navigate to `http://localhost:8888/dev/workbench.html`.
4. **Test i18n Switcher**: Click "EN" and "FR" toolbar buttons. Verify translation reactive updates.
5. **Test Mode Toggle**: Switch to Edit mode. Verify layout becomes side-by-side. Verify device simulator options are hidden.
6. **Test YAML Editor**: Edit the YAML under "Éditeur de code". Verify the card preview updates on the right. Verify typing a syntax error displays the neon error banner and doesn't crash the page.
7. **Test Fallback UI**: Under "Éditeur graphique", verify that it renders the sci-fi fallback card since the card editor components are not registered.
