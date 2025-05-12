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
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
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
      'section-title-header': msg('Header'),
      'section-title-settings': msg('Settings'),
      'section-title-vehicle': msg('Vehicle'),
      'section-title-state': msg('State'),
      'section-title-mode': msg('Mode'),
      'section-title-weather': msg('Weather'),
      'section-title-chart': msg('Chart'),
      'section-title-alert': msg('Alert'),
      'section-title-tile': msg('Tile'),
      'section-title-technical': msg('Technical'),
      'section-title-home-selection': msg('Display selection'),
      'section-title-appearance': msg('Appearance'),
      'section-title-entity': msg('Entity'),
      'section-title-entity-light-custom': msg('Light entities customization'),
      'section-title-sensor': msg('Sensors'),
      'section-title-storage': msg('Storage'),
      'section-title-plug': msg('Plugs'),
      'section-title-energy': msg('Energy'),
      'section-title-other': msg('Others'),
      'section-title-monitoring': msg('Monitoring'),
      'section-title-config': msg('Configuration'),

      'text-optionnal': msg('(optionnal)'),
      'text-required': msg('(required)'),
      'text-switch-climate-global-turn-on_off': msg(
        'Display global turn on/off button ?'
      ),
      'text-switch-hexa-add-weather-tile': msg('Add weather tile ?'),
      'text-switch-hexa-standalone': msg('Standalone entity?'),
      'text-child-lock': msg('Child lock?'),
      'text-power-outage-memory': msg('Power outage memory'),

      'edit-section-title': msg('Edit'),
      'edit-section-state-auto-title': msg('Edit State heat'),
      'edit-section-state-off-title': msg('Edit State off'),
      'edit-section-state-heat-title': msg('Edit State auto'),
      'edit-section-mode-frost_protection-title': msg(
        'Edit Mode frost protection'
      ),
      'edit-section-mode-eco-title': msg('Edit Mode eco'),
      'edit-section-mode-comfort-title': msg('Edit Mode comfort'),
      'edit-section-mode-comfort-1-title': msg('Edit Mode comfort-1'),
      'edit-section-mode-comfort-2-title': msg('Edit Mode comfort-2'),
      'edit-section-mode-boost-title': msg('Edit Mode boost'),

      'input-message-header-section-winter': msg('Winter period message'),
      'input-icon-header-section-winter': msg('Winter period icon'),
      'input-message-header-section-summer': msg('Summer period message'),
      'input-icon-header-section-summer': msg('Summer period icon'),
      'input-entities-to-exclude': msg('Entities to exclude'),
      'input-icon-auto': msg('Icon auto'),
      'input-icon-off': msg('Icon off'),
      'input-icon-heat': msg('Icon heat'),
      'input-icon-frost_protection': msg('Icon frost protection'),
      'input-icon-eco': msg('Icon eco'),
      'input-icon-comfort': msg('Icon comfort'),
      'input-icon-comfort-1': msg('Icon comfort-1'),
      'input-icon-comfort-2': msg('Icon comfort-2'),
      'input-icon-boost': msg('Icon boost'),
      'input-color-auto': msg('Auto icon color'),
      'input-color-off': msg('Off icon color'),
      'input-color-heat': msg('Heat icon color'),
      'input-color-frost_protection': msg('Frost protection icon color'),
      'input-color-eco': msg('Eco icon color'),
      'input-color-comfort': msg('Comfort icon color'),
      'input-color-comfort-1': msg('Comfort-1 icon color'),
      'input-color-comfort-2': msg('Comfort-2 icon color'),
      'input-color-boost': msg('Boost icon color'),
      'input-message-text': msg('Message'),
      'input-weather-entity': msg('Weather entity'),
      'input-link': msg('Link'),
      'input-name': msg('Name'),
      'input-active-icon': msg('Active icon'),
      'input-inactive-icon': msg('Inactive icon'),
      'input-states-on': msg('States on'),
      'input-state-error': msg('Error state'),
      'input-entity-id': msg('Entity id'),
      'input-entity-kind': msg('Entity kind'),
      'input-floor-id': msg('First floor to render'),
      'input-area-id': msg('First area to render'),
      'input-location': msg('Location'),
      'input-location-last-activity': msg('Location last activity'),
      'input-mileage': msg('Mileage'),
      'input-lock-status': msg('Lock status'),
      'input-fuel-autonomy': msg('Fuel autonomy'),
      'input-fuel-quantity': msg('Fuel quantity'),
      'input-battery-autonomy': msg('Battery autonomy'),
      'input-battery-level': msg('Battery level'),
      'input-charging-state': msg('Charging'),
      'input-plug-state': msg('Plug state'),
      'input-remainting-charging-time': msg('Remaining charging time'),
      'input-storage-counter': msg('Storage counter'),
      'input-threshold': msg('Threshold'),
      'input-stove-combustion-chamber': msg('Stove combustion chamber'),
      'input-room-temperature': msg('Room temperature'),
      'input-stove-pressure': msg('Stove pressure'),
      'input-stove-fan-speed': msg('Stove fans speed'),
      'input-stove-power-rendered': msg('Stove power rendered'),
      'input-stove-power-consume': msg('Stove power consumed'),
      'input-stove-status': msg('Stove status'),
      'input-stove-time-to-service': msg('Stove time to service'),
      'input-pellet-quantity': msg('Stove pellet quantity'),
      'input-pellet-quantity-threshold': msg('Pellet quantity threshold'),
      'input-daily-forecast-number': msg('Forecast number of days'),
      'input-chart-first-focus-data': msg('First data targeted on the chart'),
      'input-alert-green': msg('Green state'),
      'input-alert-yellow': msg('Yellow state'),
      'input-alert-orange': msg('Orange state'),
      'input-alert-red': msg('Red state'),
      'input-device': msg('Device'),
      'input-energy': msg('Energy'),
      'input-power': msg('Power'),
    };
    return key in labels ? labels[key] : '';
  }
}
