# Implementation Plan: Workbench Editor & i18n Integration

This implementation plan outlines the steps required to update the dev workbench (`dev/workbench.html`) in order to:
1. Support localization dynamic switching (English / French) for testing translations.
2. Provide a side-by-side computer-sized Edit mode exactly mirroring Home Assistant's card editor (incorporating a live YAML editor, fallback GUI loaders, and real-time synchronized card preview).

---

## Proposed Changes

### Dev Workbench Component

#### [MODIFY] [workbench.html](file:///Users/adrien.parasote/Documents/perso/HA/ha-sci-fi/dev/workbench.html)
- **CDN Script Loading**: Include `js-yaml` library inside the HTML head:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>
  ```
- **Language Selector UI & Logic**:
  - Add a premium button group (`EN` / `FR`) in the toolbar with glassmorphic styles and active indicators.
  - Implement a `setLanguage(lang)` function that updates the global HASS object:
    ```ts
    currentLanguage = lang;
    // update hass
    hass.language = lang;
    hass.locale.language = lang;
    // propagate to elements
    if (cardEl) cardEl.hass = hass;
    if (editorEl) editorEl.hass = hass;
    ```
- **Mode Toggle UI & Logic**:
  - Add a premium button group (`👁️ Visualisation` / `✏️ Édition`) in the toolbar.
  - View mode retains current responsive simulator options.
  - Edit mode forces desktop view, hides mobile simulator controls, and transitions the layout to a side-by-side flex split-screen:
    - **Left Column (`.editor-workspace`)**: Width `450px`, contains a tabbed layout (Tabs: `Éditeur graphique`, `Éditeur de code`).
    - **Right Column (`.preview-workspace`)**: Centers and displays the live-updating card preview.
- **YAML Editor Workspace**:
  - Add a styled, monospace dark textarea under the "Éditeur de code" tab.
  - Add a live validation error alert banner (`.yaml-error-banner`) below the tabs.
  - Add a debounced input listener to parse and update:
    ```ts
    try {
      const parsed = jsyaml.load(textarea.value);
      // Valid -> Clear error, update cardEl config + hass
      if (editorEl) editorEl.setConfig(parsed);
      cardEl.setConfig(parsed);
      cardEl.hass = hass;
    } catch (e) {
      // Invalid -> Display neon error banner, keep previous valid state
    }
    ```
  - Add a premium "Copier le YAML" button in the tab bar to copy the textarea content to clipboard.
- **UI Editor Workspace & fallback**:
  - Implement dynamic mounting of `<card.tag>-editor`.
  - Check the `customElements` registry:
    ```ts
    const editorTag = `${card.tag}-editor`;
    if (customElements.get(editorTag)) {
      // Instantiate and configure
      editorEl = document.createElement(editorTag);
      editorEl.hass = hass;
      editorEl.setConfig(currentConfig);
      // Listen to change events
      editorEl.addEventListener('config-changed', (e) => {
        const newConfig = e.detail.config;
        currentConfig = newConfig;
        textarea.value = jsyaml.dump(newConfig);
        cardEl.setConfig(newConfig);
        cardEl.hass = hass;
      });
    } else {
      // Show sci-fi themed fallback panel
    }
    ```

---

## Verification Plan

### Manual Verification
1. Run local build and server:
   ```bash
   npm run build
   npx serve . --listen 8888 --cors
   ```
2. Navigate to `http://localhost:8888/dev/workbench.html`.
3. Switch language to `EN` and `FR` on different cards, verifying immediate translation reactivity.
4. Click `✏️ Édition` to enter side-by-side mode. Verify device selector buttons are hidden and desktop layout is active.
5. In `Éditeur de code`, make edits to the YAML and verify immediate visual update of the card preview on the right.
6. Type incorrect YAML syntax, verify that the error warning banner is displayed correctly, and that the card preview doesn't crash.
7. Switch to `Éditeur graphique` and verify that the sci-fi styled fallback panel appears (explaining that the editor web component is not yet registered).
