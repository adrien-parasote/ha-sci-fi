import CUSTOM_ICONS from './data/sf-icons.js';

async function getIcon(name) {
  if (!(name in CUSTOM_ICONS)) {
    console.error(`Icon "${name}" not available`);
    return '';
  }
  return {
    path: CUSTOM_ICONS[name],
    viewBox: '0 0 24 24',
  };
}

async function getIconList() {
  return Object.entries(CUSTOM_ICONS).map(([icon]) => ({
    name: icon,
  }));
}

window.customIconsets = window.customIconsets || {};
window.customIconsets['sci'] = getIcon;

window.customIcons = window.customIcons || {};
window.customIcons['sci'] = {getIcon, getIconList};
