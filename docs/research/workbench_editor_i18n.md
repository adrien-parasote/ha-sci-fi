# Research Report: Workbench Editor & i18n Integration

> **Stream Coding · DISCOVER Stage · May 2026**
> **Feature:** Language switching and Home Assistant-like edit mode in the Sci-Fi Workbench.

---

## 1. Objectives

1. **Test language changes**: Enable the developer to dynamically select the language (English/French) and see all cards reactively translate in real-time.
2. **Interactive edit mode**: Provide a PC-only edit workspace that exactly mimics Home Assistant's Lovelace editor:
   - **Double-column layout**: Editor on the left, live preview on the right.
   - **YAML Editor**: Text area with live validation and synchronized preview.
   - **Graphical UI Editor**: Real-time instantiation of the card's custom editor element (e.g., `<sci-fi-lights-editor>`), utilizing the standard `config-changed` event to synchronize with the YAML editor and live preview.

---

## 2. Technical Findings

### 2.1 Home Assistant Card Editor Architecture

In Home Assistant, Lovelace cards and their custom editors operate under a strict, event-driven contract:
1. **Instantiation**: The editor is retrieved via the static method `getConfigElement()` on the card class (e.g., `SciFiStoveCard.getConfigElement()`). This returns a custom HTML element (e.g., `<sci-fi-stove-editor>`).
2. **Properties**:
   - `editorEl.hass`: The active HASS state object.
   - `editorEl.setConfig(config)`: Sets the current card configuration.
3. **Change Event**: When a field is updated in the editor UI, the editor dispatches a `'config-changed'` custom event:
   ```ts
   const event = new CustomEvent('config-changed', {
     bubbles: true,
     composed: true,
     detail: { config: newConfig }
   });
   this.dispatchEvent(event);
   ```
4. **YAML Synchronization**: Home Assistant's card editor offers two tabs: the UI editor and the YAML editor. Both sync to the same underlying config. When the YAML editor updates or the UI editor dispatches a `'config-changed'` event, the entire configuration is parsed/updated, and both the card preview and the editor element are refreshed with the new config.
5. **Fallback Handling**: If a custom editor element is not registered in the custom element registry (e.g., `customElements.get('sci-fi-stove-editor')` is `undefined`), Home Assistant falls back to showing only the YAML editor. In the workbench, we will implement this exact behavior:
   - If the editor component is registered, we load and render it in the "Éditeur graphique" tab.
   - If it is not registered, we display a beautiful, themed informative card explaining that the editor is not yet registered and directing the developer to the "Éditeur YAML" tab.

### 2.2 YAML Parsing in the Browser

To support editing configs via YAML in the dev workbench, we require a client-side YAML parser.
- **Library Choice**: `js-yaml` (v4.x) is the absolute community standard for web-based YAML parsing and dumping.
- **Delivery**: We can load `js-yaml.min.js` dynamically from cdnjs or unpkg (`https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js`). It will expose `jsyaml` globally on `window`.
- **Parsing Flow**:
  - `jsyaml.load(yamlString)` parses the YAML string into a JavaScript object.
  - `jsyaml.dump(jsObject, { indent: 2, skipInvalid: true })` dumps the JavaScript object back into a clean YAML string.

### 2.3 Localization and @lit/localize Sync

The custom cards implement translations via `@lit/localize`.
- **Base Class Contract**: `SciFiBaseCard` and `SciFiBaseEditor` listen to language changes via the `hass` property setter:
  ```ts
  set hass(hass: HomeAssistantExt) {
    this._hass = hass;
    if (hass?.locale?.language && hass.locale.language !== getLocale()) {
      void (async () => {
        try {
          await setLocale(hass.locale.language);
        } catch (e) {
          console.error(`Error loading locale ${hass.locale.language}...`);
        }
      })();
    }
  }
  ```
- **Triggering Translations**: In the workbench, to change a card's language, we only need to:
  1. Toggle the workbench's global language setting (`'fr'` or `'en'`).
  2. Override `hass.language` and `hass.locale.language` with the selected language in the active `Hass` object (both Mock and Live modes).
  3. Set `cardEl.hass = updatedHass` (and `editorEl.hass = updatedHass` in edit mode).
  4. The card's `hass` setter will automatically call `setLocale()`, and Lit's `updateWhenLocaleChanges` will trigger a clean re-render in the target language.

---

## 3. Adopt / Adapt / Build-New Decision

| Strategy | Component | Description | Rationale |
|---|---|---|---|
| **ADOPT** | `js-yaml` (v4.1.0) | Load standard YAML parser from CDN | Leverage proven parsing logic for complex configurations rather than building a custom parser. |
| **ADAPT** | Dev Workbench layout | Transition from static single preview to tabbed View/Edit workspace | Reuse the existing toolbar, mocks, and connection handling, but restructure the preview panel. |
| **BUILD-NEW** | YAML Editor | Integrated textarea with line numbers, validation, and real-time preview sync | Enable robust code-first configuration management. |
| **BUILD-NEW** | UI Editor Loader | Dynamic instantiation of `<card-tag>-editor` with fallback UI | Match Home Assistant's plugin-based editor rendering contract. |
| **BUILD-NEW** | Language Selector | Sleek toolbar buttons to switch between EN and FR | Provide instantaneous localization verification for cards. |

---

## 4. Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| **Invalid YAML input crashes the workbench** | Medium | Wrap the `jsyaml.load` call in a try-catch block. Display a beautiful, non-intrusive warning alert in the editor panel when parsing fails, while retaining the previous valid config for the card preview. |
| **Missing Editor element crashes the UI Editor tab** | Low | Check `customElements.get(editorTag)` before instantiating. If undefined, render an elegant, sci-fi themed fallback panel explaining the editor has not been implemented yet. |
| **Offline development with CDN js-yaml** | Low | Provide a simple fallback JSON-based parser/editor if `jsyaml` is not available, or load `js-yaml` gracefully. |
