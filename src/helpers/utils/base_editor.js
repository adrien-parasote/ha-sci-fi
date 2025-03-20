import {msg, updateWhenLocaleChanges} from '@lit/localize';
import {LitElement} from 'lit';

import {getLocale, setLocale} from './../../locales/localization.js';
import common_style from './../styles/common_style.js';
import editor_common_style from './../styles/editor_common_style.js';

export class SciFiBaseEditor extends LitElement {
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  static get styles() {
    return [common_style, editor_common_style];
  }

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  _hass; // private

  get hass() {
    return this._hass;
  }

  set hass(hass) {
    this._hass = hass;
    if (hass.language != getLocale()) {
      (async () => {
        try {
          await setLocale(hass.language);
        } catch (e) {
          console.error(`Error loading locale ${hass.language}: ${e.message}`);
        }
      })();
    }
  }

  setConfig(config) {
    this._config = config;
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  __getNewConfig() {
    return JSON.parse(JSON.stringify(this._config));
  }

  __dispatchChange(e, newConfig) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: {config: newConfig},
        bubbles: true,
        composed: true,
      })
    );
  }

  getLabel(key) {
    const labels = {
      'header-section-title': msg('Header (optionnal)'),
      'header-section-switch-title': msg('Display global turn on/off button ?'),
      'header-section-winter-input-message': msg(
        'Winter period message (optionnal)'
      ),
      'header-section-winter-input-icon': msg('Winter period icon (optionnal)'),
      'header-section-summer-input-message': msg(
        'Summer period message (optionnal)'
      ),
      'header-section-summer-input-icon': msg('Summer period icon (optionnal)'),
      'settings-section-title': msg('Settings (optionnal)'),
      'state-section-title': msg('State (optionnal)'),
      'mode-section-title': msg('Mode (optionnal)'),
      'weather-section-title': msg('Weather'),
      'weather-section-switch-title': msg('Add weather tile ?'),
      'tile-section-title': msg('Tile'),
      'technical-section-title': msg('Technical'),

      'appearance-section-title': msg('Appearance'),
      'entity-section-title': msg('Entity (required)'),
      'entity-section-standalone-title': msg('Standalone entity?'),
      'input-entity-kind': msg('Entity kind (required)'),

      'edit-section-state-auto-title': msg('Edit State heat'),
      'edit-section-state-off-title': msg('Edit State off'),
      'edit-section-state-heat-title': msg('Edit State auto'),
      'edit-section-mode-frost_protection-title': msg(
        'Edit Mode frost protection'
      ),
      'edit-section-mode-eco-title': msg('Edit Mode eco protection'),
      'edit-section-mode-comfort-title': msg('Edit Mode comfort'),
      'edit-section-mode-comfort-1-title': msg('Edit Mode comfort-1'),
      'edit-section-mode-comfort-2-title': msg('Edit Mode comfort-2'),
      'edit-section-mode-boost-title': msg('Edit Mode boost'),

      'input-entities-to-exclude': msg('Entities to exclude (optionnal)'),
      'input-icon-auto': msg('Icon auto (optionnal)'),
      'input-icon-off': msg('Icon off (optionnal)'),
      'input-icon-heat': msg('Icon heat (optionnal)'),
      'input-icon-frost_protection': msg('Icon frost protection (optionnal)'),
      'input-icon-eco': msg('Icon eco protection (optionnal)'),
      'input-icon-comfort': msg('Icon comfort (optionnal)'),
      'input-icon-comfort-1': msg('Icon comfort-1 (optionnal)'),
      'input-icon-comfort-2': msg('Icon comfort-2 (optionnal)'),
      'input-icon-boost': msg('Icon boost (optionnal)'),
      'input-color-auto': msg('Auto icon color (optionnal)'),
      'input-color-off': msg('Off icon color (optionnal)'),
      'input-color-heat': msg('Heat icon color (optionnal)'),
      'input-color-frost_protection': msg(
        'Frost protection icon color (optionnal)'
      ),
      'input-color-eco': msg('Eco icon color (optionnal)'),
      'input-color-comfort': msg('Comfort icon color (optionnal)'),
      'input-color-comfort-1': msg('Comfort-1 icon color (optionnal)'),
      'input-color-comfort-2': msg('Comfort-2 icon color (optionnal)'),
      'input-color-boost': msg('Boost icon color (optionnal)'),
      'input-message-text': msg('Message'),
      'input-weather-entity': msg('Weather entity (required)'),
      'input-link': msg('Link (optionnal)'),
      'input-name': msg('Name'),
      'input-active-icon': msg('Active icon (required)'),
      'input-inactive-icon': msg('Inactive icon (required)'),

      'input-states-on': msg('States on (required)'),
      'input-state-error': msg('Error state (optionnal)'),
    };
    return key in labels ? labels[key] : '';
  }
}
