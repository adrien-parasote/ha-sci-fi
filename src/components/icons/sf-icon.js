import {createStore, promisifyRequest} from 'idb-keyval';
import {LitElement, css, html, nothing} from 'lit';
import memoizeOne from 'memoize-one';

import common_style from '../../helpers/styles/common_style.js';
import {defineCustomElement} from '../../helpers/utils/import.js';
import './sf-svg-icon.js';

const MDI_PREFIXES = 'mdi';
const CACHE = {};

const getStore = memoizeOne(async () => {
  return createStore('hass-icon-db', 'mdi-icon-store');
});

const getStoredIcon = function (iconName) {
  return new Promise((resolve, reject) => {
    const store = getStore();
    const readIcons = async () => {
      const iconStore = await store;
      iconStore('readonly', (store) => {
        promisifyRequest(store.get(iconName))
          .then((icon) => resolve(icon))
          .catch((e) => reject(e));
      });
    };
    readIcons();
  });
};

class SciFiIcon extends LitElement {
  static get styles() {
    return [common_style, css`
      :host{
        --icon--color: var(--icon-color, var(--primary-light-color));
        --icon--width: var(--icon-width, var(--icon-size-normal));
        --icon--height: var(--icon-height, var(--icon-size-normal));
      }
      sci-fi-svg-icon {
        --svg-color: var(--icon--color);
        --svg-width: var(--icon--width);
        --svg-height: var(--icon--height);
      }
      `];
  }

  static get properties() {
    return {
      icon: {type: String},
      _path: {type: String},
      _viewBox: {type: String},
    };
  }

  constructor() {
    super();
    this.icon = this.icon ? this.icon : null;
  }

  render() {
    if (!this.icon) return nothing;
    return html` <sci-fi-svg-icon
      .path=${this._path}
      .viewBox=${this._viewBox}
    ></sci-fi-svg-icon>`;
  }

  willUpdate(changedProps) {
    super.willUpdate(changedProps);
    if (changedProps.has('icon')) {
      this._path = undefined;
      this._viewBox = '0 0 24 24';
      this._loadIcon();
    }
  }

  __getIconFromCache() {
    if ((!this.icon) in CACHE) return;
    return CACHE[this.icon];
  }

  async __getCustomIconData(promise) {
    const icon = await promise;
    this._path = icon.path;
    this._viewBox = icon.viewBox ? icon.viewBox : '0 0 24 24';
    CACHE[this.icon] = {
      path: icon.path,
      viewBox: icon.viewBox,
    };
  }

  async __getMdiIconData(promise) {
    const path = await promise;
    this._path = path;
    CACHE[this.icon] = {
      path: path,
      viewBox: '0 0 24 24',
    };
  }

  _loadIcon() {
    if (!this.icon) return;
    const [iconPrefix, iconName] = this.icon.split(':', 2);
    if (!iconPrefix || !iconName) return;

    // Get Cached icon
    const cached = this.__getIconFromCache();
    if (cached) {
      this._path = cached.path;
      this._viewBox = cached.viewBox;
      return;
    }

    // 2 cases : mdi icons or custom one
    if (MDI_PREFIXES != iconPrefix) {
      // custom
      if ((!iconPrefix) in window.customIcons) return;
      this.__getCustomIconData(
        window.customIcons[iconPrefix].getIcon(iconName)
      );
    } else {
      // mdi : data store in indexDB
      this.__getMdiIconData(getStoredIcon(iconName));
    }
  }
}

defineCustomElement('sci-fi-icon', SciFiIcon);
