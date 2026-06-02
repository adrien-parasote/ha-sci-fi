/**
 * sci-fi.ts — Entry point for sci-fi Lovelace cards v2
 *
 * Registers all 11 custom elements and declares the card types with Lovelace.
 * Chart.js is tree-shaken via Rollup (HIGH-01 fix — no CDN, no runtime require).
 * Locale is read from hass.locale on first render (MEDIUM-02 fix — no configureLocalization overhead).
 */

// ── Dev environment HMR support (workbench only) ───────────────────────────────
// In dev mode, the workbench may reload the bundle, re-executing all decorators.
// Lit's @customElement calls customElements.define without checking first,
// which throws NotSupportedError. We patch define ONLY in dev to prevent the crash.
//
// ⚠️  MUST NOT run in production: HA uses a scoped custom element registry in
// hui-card-picker. If we intercept define globally, our wrapper sees the element
// as "already defined" (global registry) and skips the scoped registration.
// Result: "Custom element not found" in the card picker UI (cards can't be
// selected from the picker, only created manually via YAML).
if (__DEV__) {
  const _originalDefine = customElements.define.bind(customElements);
  customElements.define = function(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions) {
    if (!customElements.get(name)) {
      _originalDefine(name, constructor, options);
    } else {
      console.warn(`[sci-fi] Custom element ${name} is already defined. Skipping to prevent HMR crash.`);
    }
  };
}


// ── Styles & Components ────────────────────────────────────────────────────────
import './components/sf-icon/sf-icon.js';
import './components/sf-icon/sci-icon.js'; // public-facing <sci-icon> element (available outside sci-fi cards)
import './components/sf-icon/sf-iconset.js'; // registers sci: namespace with HA customIconsets
import './components/sf-toggle-switch/sf-toggle-switch.js';
import './components/sf-toast.js'; // global toast component used by all cards

// ── Cards ─────────────────────────────────────────────────────────────────────
import './cards/hexa-tiles/sci-fi-hexa-tiles.js';
import './cards/lights/sci-fi-lights.js';
import './cards/climates/sci-fi-climates.js';
import './cards/plugs/sci-fi-plugs.js';
import './cards/weather/sci-fi-weather.js';
import './cards/stove/sci-fi-stove.js';
import './cards/vacuum/sci-fi-vacuum.js';
import './cards/vehicles/sci-fi-vehicles.js';
import './cards/tv/sci-fi-tv.js';
import './cards/water/sci-fi-water-management.js';
import './cards/bridge/sci-fi-bridge.js';
 
// ── Card Editors ──────────────────────────────────────────────────────────────
import './cards/hexa-tiles/sci-fi-hexa-tiles-editor.js';
import './cards/lights/sci-fi-lights-editor.js';
import './cards/climates/sci-fi-climates-editor.js';
import './cards/plugs/sci-fi-plugs-editor.js';
import './cards/weather/sci-fi-weather-editor.js';
import './cards/stove/sci-fi-stove-editor.js';
import './cards/vacuum/sci-fi-vacuum-editor.js';
import './cards/vehicles/sci-fi-vehicles-editor.js';
import './cards/tv/sci-fi-tv-editor.js';
import './cards/water/sci-fi-water-management-editor.js';
import './cards/bridge/sci-fi-bridge-editor.js';


// ── Card registry for Lovelace (required for card picker UI) ──────────────────



type CardRegistration = {
  name: string;
  description: string;
  preview: boolean;
};

// HA extends window.customCards at runtime for the card picker
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

export const CARD_REGISTRATIONS: ReadonlyArray<{ type: string } & CardRegistration> = [
  {
    type: 'sci-fi-hexa-tiles',
    name: 'Sci-Fi Hexa Tiles',
    description: 'Hexagonal tiles for persons, vehicles, and custom entities',
    preview: true,
  },
  {
    type: 'sci-fi-lights',
    name: 'Sci-Fi Lights',
    description: 'Sci-fi lights management by floor and area',
    preview: true,
  },
  {
    type: 'sci-fi-climates',
    name: 'Sci-Fi Climates',
    description: 'Climate entity overview with temperature display',
    preview: true,
  },
  {
    type: 'sci-fi-plugs',
    name: 'Sci-Fi Plugs',
    description: 'Smart plug monitoring with power and energy sensors',
    preview: true,
  },
  {
    type: 'sci-fi-weather',
    name: 'Sci-Fi Weather',
    description: 'Weather card with forecast chart (Chart.js bundled)',
    preview: true,
  },
  {
    type: 'sci-fi-stove',
    name: 'Sci-Fi Stove',
    description: 'Pellet stove monitoring',
    preview: true,
  },
  {
    type: 'sci-fi-vacuum',
    name: 'Sci-Fi Vacuum',
    description: 'Robot vacuum control with map and sensors',
    preview: true,
  },
  {
    type: 'sci-fi-vehicles',
    name: 'Sci-Fi Vehicles',
    description: 'Electric vehicle monitoring',
    preview: true,
  },
  {
    type: 'sci-fi-tv',
    name: 'Sci-Fi TV',
    description: 'Futuristic TV remote control with orbital volume dial and bridge D-pad',
    preview: true,
  },
  {
    type: 'sci-fi-water-management',
    name: 'Sci-Fi Water Management',
    description: 'Dynamic floor-based dashboard for water management entities',
    preview: true,
  },
  {
    type: 'sci-fi-bridge',
    name: 'Sci-Fi Bridge Overview',
    description: 'Home dashboard overview — crew presence, alerts, access points, automations, appliances, stove, EV charging, and call kids',
    preview: true,
  },
];

// Register with HA card picker
window.customCards = window.customCards ?? [];
for (const card of CARD_REGISTRATIONS) {
  window.customCards.push({
    type: `custom:${card.type}`,
    name: card.name,
    description: card.description,
    preview: card.preview,
    documentationURL: 'https://github.com/adrien-parasote/ha-sci-fi',
  });
}

// ── Version banner ─────────────────────────────────────────────────────────────
console.info(
  `%c SCI-FI CARDS %c v${__VERSION__} `,
  'color: #00d2ff; font-weight: bold; background: #1a1a2e; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'background: #00d2ff; color: #1a1a2e; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0;'
);

// ── Workbench dev helper — expose setLocale for direct language switching ────────
// Allows workbench to call window.__sciFiSetLocale('en') / window.__sciFiSetLocale('fr')
// without waiting for the hass.locale.language async chain.
// NOT used in HA production — safe to leave in production build.
import { setLocale } from './locales/localization.js';
declare global {
  interface Window {
    __sciFiSetLocale?: (locale: string) => Promise<void>;
  }
}
window.__sciFiSetLocale = setLocale;
