# Custom Lovelace Card Developer Guidelines

This document serves as an exhaustive reference manual and playbook for designing, developing, and optimizing custom cards for the Home Assistant dashboard. It synthesizes best practices from the official [Home Assistant Developer Documentation](https://developers.home-assistant.io/), core frontend repositories, and the wider Home Assistant Community Store (HACS) ecosystem.

---

## 1. Technological Stack & Core Foundation

Home Assistant's user interface is built on **Web Components** using **Lit** (formerly LitElement). For maximum performance, modularity, and integration correctness, developers should use **TypeScript** combined with **Lit**.

### Recommended Libraries & Tooling
*   **`lit`**: Standard lightweight web component library for reactive templates and property management.
*   **`custom-card-helpers`**: The industry-standard package containing TypeScript type definitions (`HomeAssistant`, `LovelaceCardConfig`), action dispatchers (`handleClick`), and performance utilities (`hasConfigOrEntityChanged`).

---

## 2. Card Lifecycle & API Contract

Every custom card is represented as a custom HTML element extending `HTMLElement` (or `LitElement`) and must adhere to the Home Assistant Lovelace Card API contract.

### Required API Hooks

```typescript
import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCard } from 'custom-card-helpers';

@customElement('my-custom-card')
export class MyCustomCard extends LitElement implements LovelaceCard {
  
  // 1. The hass object is pushed by HA whenever any state in the system changes.
  @property({ attribute: false }) public hass?: HomeAssistant;

  // 2. Holds the active card configuration YAML.
  private _config?: any;

  // 3. Mandatory method: valid config or throw a descriptive error.
  public setConfig(config: any): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    if (config.entity && !config.entity.includes('.')) {
      throw new Error('Please define a valid entity ID (domain.object_id)');
    }
    this._config = config;
  }

  // 4. Return an estimate of the card's height in rows of 50px for grid masonry layout.
  public getCardSize(): number {
    return 3; 
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];
    if (!stateObj) {
      return html`
        <ha-card>
          <div class="error">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card .header="${this._config.name || 'My Card'}">
        <div class="card-content">
          State: <strong>${stateObj.state}</strong>
        </div>
      </ha-card>
    `;
  }
}
```

---

## 3. Performance Optimization & Rendering Control

> [!WARNING]
> **The `hass` Update Bottleneck**
> Home Assistant triggers `set hass(hass)` whenever **any** entity state changes in the entire smart home. On large instances, this can translate to dozens of updates per second. If a custom card is unoptimized, it will re-render on every state update, leading to major UI lag, high CPU load, and stuttering animations.

### Gating Updates with `shouldUpdate`
Custom cards **must** override Lit’s `shouldUpdate` lifecycle hook to filter out irrelevant state changes. 

#### Method A: Automatic Gating (`hasConfigOrEntityChanged`)
For simple cards tracking a single primary `entity` specified in the configuration, use the built-in helper from `custom-card-helpers`.

```typescript
import { PropertyValues } from 'lit';
import { hasConfigOrEntityChanged } from 'custom-card-helpers';

protected shouldUpdate(changedProps: PropertyValues): boolean {
  // Returns false if neither the card's config nor the main entity state changed.
  return hasConfigOrEntityChanged(this, changedProps);
}
```

#### Method B: Advanced Multi-Entity Tracking
For cards monitoring multiple entities (e.g., groups of lights or custom sensor arrays), check state updates manually to ensure you only trigger updates when relevant monitored entities change:

```typescript
protected shouldUpdate(changedProps: PropertyValues): boolean {
  if (changedProps.has('config')) {
    return true;
  }

  if (changedProps.has('hass')) {
    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
    if (!oldHass) return true;

    // List of entities this card monitors
    const monitoredEntities = [
      this._config?.entity,
      this._config?.secondary_entity,
      ...(this._config?.entities || [])
    ].filter(Boolean);

    // Only update if one of the monitored entity states has changed
    const anyEntityChanged = monitoredEntities.some(
      (entityId) => oldHass.states[entityId]?.state !== this.hass?.states[entityId]?.state ||
                   oldHass.states[entityId]?.attributes !== this.hass?.states[entityId]?.attributes
    );

    // Also update if the active Home Assistant theme changes
    const themeChanged = oldHass.themes !== this.hass?.themes;

    return anyEntityChanged || themeChanged;
  }

  return false;
}
```

### Lifecycle Hook Cleanups
If your card registers intervals, timers, global window listeners, or custom DOM resize listeners:
*   Always remove/disconnect them within `disconnectedCallback()`.
*   Failing to do so creates memory leaks when dashboard tabs are switched.

```typescript
private _resizeObserver?: ResizeObserver;

public connectedCallback(): void {
  super.connectedCallback();
  this._setupResizeObserver();
}

public disconnectedCallback(): void {
  if (this._resizeObserver) {
    this._resizeObserver.disconnect();
  }
  super.disconnectedCallback();
}
```

---

## 4. UI/UX, Shadow DOM & Theming

To maintain seamless design alignment with the rest of the Home Assistant dashboard, custom cards should respect Shadow DOM encapsulation, utilize standard custom elements, and inherit variables from active themes.

### Wrapping Content with `ha-card`
All custom card templates must be wrapped inside a `<ha-card>` element. This element provides native borders, background styling, border-radius, box-shadows, and handles card headers consistently.

### Standard CSS Variables
Never hardcode hex colors or static layouts. Always use standard CSS variable declarations so your card responds to light/dark modes and custom user themes:

| Variable Type | CSS Custom Property | Purpose |
| :--- | :--- | :--- |
| **Typography & Text** | `--primary-text-color` | Standard title and body text color |
| | `--secondary-text-color` | Muted descriptions or metadata |
| | `--disabled-text-color` | Inactive or disabled items |
| **Card Styles** | `--ha-card-background` | Base card background |
| | `--ha-card-border-radius` | Card corner rounding (default: 12px) |
| | `--ha-card-border-color` | Card border boundary |
| **State Colors** | `--primary-color` | Home Assistant brand color and default active icons |
| | `--accent-color` | Highlight or focus indicators |
| | `--error-color` | Danger states, failed sensors, or disconnect banners |
| | `--warning-color` | Warning banners or alert notifications |
| | `--state-icon-color` | Default icon state color |
| | `--state-icon-active-color`| Active/On icon state color (e.g. glowing gold for lights) |

### Reusing Home Assistant Elements
Avoid recreating input widgets, text fields, switches, or icons. Reusing native Home Assistant Web Components ensures a cohesive interface and saves bundle weight:

```typescript
import { html, css, CSSResultGroup } from 'lit';

// Inside your card's render template:
render() {
  return html`
    <ha-card>
      <div class="row">
        <!-- Native responsive Icon wrapper -->
        <ha-icon .icon="${this._config.icon || 'mdi:power'}"></ha-icon>
        
        <!-- Native slider bar -->
        <ha-slider
          .value="${this._stateValue}"
          .min="${0}"
          .max="${100}"
          @change="${this._handleSliderChange}"
        ></ha-slider>

        <!-- Native switch toggle -->
        <ha-switch
          .checked="${this._stateValue > 0}"
          @change="${this._handleToggle}"
        ></ha-switch>
      </div>
    </ha-card>
  `;
}

static get styles(): CSSResultGroup {
  return css`
    ha-card {
      padding: 16px;
      background: var(--ha-card-background, var(--card-background-color));
      border-radius: var(--ha-card-border-radius, 12px);
    }
    ha-icon {
      color: var(--state-icon-color);
    }
    ha-icon.active {
      color: var(--state-icon-active-color, var(--primary-color));
    }
  `;
}
```

---

## 5. Lovelace Actions & Interactivity

Custom cards must support standard Lovelace action triggers (`tap_action`, `hold_action`, `double_tap_action`) to mirror the experience of native cards.

### Implementing Standard Actions with `handleClick`
Rather than writing custom event dispatchers for navigation or service calls, leverage `handleClick` from `custom-card-helpers`. This handles:
*   Service calls (`call-service`)
*   Dashboard navigation (`navigate`)
*   External links (`url`)
*   More info dialog popups (`more-info`)
*   User confirmation prompts (`confirmation`)
*   Haptic feedback integrations

```typescript
import { handleClick, ActionHandlerEvent } from 'custom-card-helpers';
import { actionHandler } from './action-handler-directive'; // Standard long-press directive

render() {
  return html`
    <ha-card>
      <div
        class="interactive-area"
        @action="${this._handleAction}"
        .actionHandler="${actionHandler({ hasHold: true, hasDoubleClick: true })}"
      >
        Click, Hold, or Double Click Me
      </div>
    </ha-card>
  `;
}

private _handleAction(ev: ActionHandlerEvent): void {
  if (this.hass && this._config && ev.detail.action) {
    handleClick(
      this,
      this.hass,
      this._config,
      ev.detail.action === 'hold',
      ev.detail.action === 'double_tap'
    );
  }
}
```

---

## 6. Visual Configuration Editor

To offer a premium, native-feeling user experience, custom cards should provide a visual card editor that loads in the Lovelace Dashboard editor UI.

### Linking the Visual Editor
Define `getConfigElement()` and `getStubConfig()` inside the main card class:

```typescript
@customElement('my-custom-card')
export class MyCustomCard extends LitElement implements LovelaceCard {
  // ...

  // 1. Tell Lovelace which HTML element serves as the editor for this card
  public static getConfigElement() {
    return document.createElement('my-custom-card-editor');
  }

  // 2. Default configuration injected when a user adds the card from the card picker
  public static getStubConfig(hass: HomeAssistant) {
    return {
      type: 'custom:my-custom-card',
      entity: 'sun.sun',
      icon: 'mdi:weather-sunny',
      tap_action: { action: 'more-info' }
    };
  }
}
```

### Implementing the Editor Element
The editor component is an independent Lit element that receives the current card config, renders control elements, and dispatches a standard `config-changed` event to the dashboard creator:

```typescript
import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

@customElement('my-custom-card-editor')
export class MyCustomCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: any;

  public setConfig(config: any): void {
    this._config = config;
  }

  // Update card configuration and dispatch to Home Assistant
  private _valueChanged(ev: any): void {
    if (!this._config) return;
    const target = ev.target;
    
    const newConfig = {
      ...this._config,
      [target.configValue]: target.checked !== undefined ? target.checked : target.value
    };

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <!-- Native Dropdown for entity selection -->
        <ha-entity-picker
          .hass="${this.hass}"
          .value="${this._config.entity}"
          .configValue="${'entity'}"
          @value-changed="${this._valueChanged}"
          allow-custom-entity
        ></ha-entity-picker>

        <!-- Native text input for Card Title -->
        <ha-textfield
          label="Title (Optional)"
          .value="${this._config.name || ''}"
          .configValue="${'name'}"
          @input="${this._valueChanged}"
        ></ha-textfield>

        <!-- Native switch for extra details -->
        <ha-formfield label="Show Icon?">
          <ha-switch
            .checked="${this._config.show_icon !== false}"
            .configValue="${'show_icon'}"
            @change="${this._valueChanged}"
          ></ha-switch>
        </ha-formfield>
      </div>
    `;
  }
}
```

### Global Card Picker Registration
Register your card globally in the `window.customCards` registry. This allows the Lovelace Card Picker modal to show your card with a descriptive name, description, and visual preview:

```typescript
declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview: boolean;
      documentationURL?: string;
    }>;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'my-custom-card',
  name: 'Sci-Fi Premium Sensor Card',
  description: 'A beautiful, performance-optimized monitoring element tailored for modern system grids.',
  preview: true,
  documentationURL: 'https://github.com/developer/my-custom-card/blob/main/README.md'
});
```

---

## 7. Premium Build, Packaging & HACS Deployment

Custom cards must be bundled into a single optimized JavaScript file to ensure rapid page load speeds, tree-shake unused code, and avoid multiple CDN HTTP fetches.

### The Recommended Rollup Toolchain
Use **Rollup** for bundling as it is the standard and highly optimized compiler for Web Components and tree-shakable ES Modules.

#### `package.json` Boilerplate

```json
{
  "name": "my-custom-card",
  "version": "1.0.0",
  "description": "Premium optimized custom card for Home Assistant",
  "main": "dist/my-custom-card.js",
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "custom-card-helpers": "^1.8.0",
    "lit": "^3.1.2"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.7",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-terser": "^0.4.4",
    "@rollup/plugin-typescript": "^11.1.6",
    "rollup": "^4.12.0",
    "typescript": "^5.3.3"
  }
}
```

#### Production-Ready `rollup.config.js` Boilerplate

This configuration supports:
*   Full TypeScript transpilation.
*   Node Resolve and CommonJS plugin mappings to resolve external libraries.
*   Minification & code-obfuscation via Terser in production (`npm run build`).
*   Active live bundling (`npm run watch`) during local UI testing.

```javascript
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const isDevelopment = process.env.ROLLUP_WATCH;

export default {
  input: 'src/my-custom-card.ts',
  output: {
    file: 'dist/my-custom-card.js',
    format: 'es',
    sourcemap: isDevelopment ? 'inline' : false,
  },
  plugins: [
    // Resolves bare module imports from node_modules (e.g. lit, custom-card-helpers)
    resolve(),
    
    // Converts CommonJS modules into ES6 standard scripts
    commonjs(),
    
    // Transpiles TypeScript files using current tsconfig settings
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
    }),
    
    // Minifies output and strips comments/console logs only in production builds
    !isDevelopment && terser({
      output: {
        comments: false,
      },
      compress: {
        drop_console: true,
      }
    }),
  ],
};
```

---

## 8. HACS Distribution Standards

To make your card easily discoverable and installable by the Home Assistant community, package the project for the **Home Assistant Community Store (HACS)**.

### Repository Layout Standard
The repository structure should conform to the following schema:
```text
my-custom-card/
├── .github/workflows/       # Automated CI actions (optional)
├── dist/
│   └── my-custom-card.js    # The compiled and bundled release file
├── src/
│   ├── my-custom-card.ts    # Main TypeScript card logic
│   └── my-editor.ts         # Visual editor custom element
├── hacs.json                # Standard HACS metadata schema
├── package.json
├── rollup.config.js
├── tsconfig.json
└── README.md                # Exhaustive card usage guidelines and pictures
```

### Structuring the `hacs.json` Config file
HACS uses this file to classify your repository and understand what asset it must load into the Lovelace dashboard resources:

```json
{
  "name": "Premium Custom Card",
  "type": "plugin",
  "render_readme": true,
  "filename": "my-custom-card.js"
}
```

### GitHub Release & Version Control
HACS updates card installations by matching tags and releases on GitHub. 
1.  Always tag your production builds using semantic versioning (e.g., `v1.0.0`).
2.  Create a **GitHub Release** corresponding to the tag.
3.  Ensure the bundled and minified `my-custom-card.js` is committed inside the `dist/` folder of the tagged release branch or uploaded directly as a release asset, so HACS can pull it successfully into the user's local `www/community/` directory.
