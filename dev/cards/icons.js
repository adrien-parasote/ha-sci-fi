/**
 * icons.js — Workbench icon browser card
 *
 * Special card type 'iconpicker' — not a Lit card, but a custom workbench panel.
 * Reads window.customIcons.sci.getIconList() dynamically after bundle load.
 * Simulates the HA icon picker search UI.
 */
export default {
  id: 'icons',
  label: '🎨 Icons',
  type: 'iconpicker',
  scenarios: {},
};
