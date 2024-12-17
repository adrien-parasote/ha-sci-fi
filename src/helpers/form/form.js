import {SciFiAccordionCard} from './accordion.js';
import {SciFiButton, SciFiToggleSwitch} from './button.js';
import {
  SciFiChipsInput,
  SciFiDropdownEntityInput,
  SciFiDropdownIconInput,
  SciFiDropdownInput,
  SciFiDropdownMultiEntitiesInput,
  SciFiInput,
} from './input.js';

// Define elements
const elements = {
  'sci-fi-accordion-card': SciFiAccordionCard,
  'sci-fi-button': SciFiButton,
  'sci-fi-toggle': SciFiToggleSwitch,
  'sci-fi-input': SciFiInput,
  'sci-fi-chips-input': SciFiChipsInput,
  'sci-fi-dropdown-input': SciFiDropdownInput,
  'sci-fi-dropdown-entity-input': SciFiDropdownEntityInput,
  'sci-fi-dropdown-multi-entities-input': SciFiDropdownMultiEntitiesInput,
  'sci-fi-dropdown-icon-input': SciFiDropdownIconInput,
};
Object.entries(elements).forEach(([key, value]) => {
  window.customElements.get(key) || window.customElements.define(key, value);
});
