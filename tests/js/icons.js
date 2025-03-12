import * as mdi from '@mdi/js';
import {createStore} from 'idb-keyval';
import memoizeOne from 'memoize-one';

let icons = [];
Object.keys(mdi).forEach((k) => {
  const ha_name = k
    .substring(3, k.length)
    .split(/(?=[A-Z])/)
    .map((v) => v.toLowerCase().split(/(?=[0-9])/))
    .map((v) => v.length == 1 ? v[0] : v.splice(0,1)+"-"+v.join(''))
    .join('-');
  icons.push({name: ha_name, path: mdi[k]});
});

const getStore = memoizeOne(async () => {
  return createStore('hass-icon-db', 'mdi-icon-store');
});

(async () => {
  const iconStore = await getStore();
  iconStore('readwrite', (store) => {
    icons.forEach((item) => store.put(item.path, item.name));
  });
})();

if (!('customIcons' in window)) {
  window.customIcons = {
    get: function (name) {
      return window.customIcons[name] ? window.customIcons[name] : undefined;
    },
    define: function (name, obj) {
      window.customIcons[name] = obj;
    },
  };
}
if (!('customIconsets' in window)) {
  window.customIconsets = {
    get: function (name) {
      return window.customIconsets[name] ? window.customIcons[name] : undefined;
    },
    define: function (name, obj) {
      window.customIconsets[name] = obj;
    },
  };
}
