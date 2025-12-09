import {updateWhenLocaleChanges} from '@lit/localize';
import {LitElement} from 'lit';

import common_style from '../styles/common_style.js';
import {getLocale, setLocale} from './../../locales/localization.js';

const checkKey = function (config, key, metadata) {
  // Test mandatory field
  if (
    metadata.mandatory &&
    ((metadata.type != 'Boolean' && !config[key]) ||
      (metadata.type == 'Boolean' &&
        (config[key] == null || config[key] == undefined)))
  )
    throw new Error('Missing ' + key + ' mandatory config parameter.');

  // Default value if needed
  if (!metadata.mandatory && metadata.type != 'Boolean' && !config[key])
    config[key] = metadata.default;
  return config;
};

const checkType = function (config, key, metadata) {
  if (!metadata.mandatory && !config[key]) return config;
  if (
    ['string', 'boolean', 'number'].includes(metadata.type) &&
    typeof config[key] != metadata.type
  )
    if (metadata.type == 'array' && !Array.isArray(config[key]))
      throw new Error(key + ' parameter need to be an array.');
  if (metadata.type == 'object' && config[key].constructor !== Object)
    throw new Error(key + ' parameter need to be an object.');
  return config;
};

const checkNumber = function (config, key, metadata) {
  if (!metadata.range) return config;
  if (!metadata.range.min && !metadata.range.max) return config;
  if (
    (metadata.range.min && config[key] < metadata.range.min) ||
    (metadata.range.max && config[key] > metadata.range.max)
  )
    throw new Error(
      key +
        ' parameter need to be in range [' +
        metadata.range.min +
        ',' +
        metadata.range.max +
        '], ' +
        config[key] +
        ' found.'
    );
  return config;
};

export const buildStubConfig = function (configMetadata) {
  if (!configMetadata) return {};
  let cfg = {};
  Object.keys(configMetadata).forEach((key) => {
    const metadata = configMetadata[key];
    if (metadata.default && key != '*eid*') {
      if (metadata.type == 'object') {
        cfg[key] = buildStubConfig(metadata.data);
      } else {
        cfg[key] = metadata.default;
      }
    }
  });
  return cfg;
};

export class SciFiBaseCard extends LitElement {
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  static get styles() {
    return [common_style];
  }

  static get properties() {
    return {
      _config: {type: Object},
    };
  }

  _configMetadata = {};
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

  __validateConfig(config, configMetadata) {
    // Duplicate
    let cfg = JSON.parse(JSON.stringify(config));
    if (!configMetadata) return cfg;
    Object.keys(configMetadata).forEach((key) => {
      const metadata = configMetadata[key];
      // Special case where key = *eid*
      if (key == '*eid*') {
        Object.keys(cfg).forEach((key) => {
          cfg[key] = this.__validateConfig(cfg[key], metadata.data);
        });
      } else {
        cfg = checkKey(cfg, key, metadata);
        cfg = checkType(cfg, key, metadata);
        if (metadata.type == 'number') cfg = checkNumber(cfg, key, metadata);
        if (metadata.type == 'object') {
          cfg[key] = this.__validateConfig(cfg[key], metadata.data);
        }
        if (metadata.type == 'array') {
          if (metadata.data_type == 'string') {
            cfg[key].forEach((element) => {
              if (typeof element != 'string')
                throw new Error(
                  cfg[key] + ' parameter need to be a list of string'
                );
            });
          }
          if (metadata.data_type == 'object') {
            cfg[key] = cfg[key].map((element) =>
              this.__validateConfig(element, metadata.data)
            );
          }
        }
      }
    });
    return cfg;
  }

  setConfig(config) {
    this._config = this.__validateConfig(config, this._configMetadata);
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass;
    }
  }

  getCardSize() {
    return 4;
  }

  getLayoutOptions() {
    return {
      grid_rows: 4,
      grid_columns: 4,
    };
  }
}
