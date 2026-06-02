// ─── View modes module ───────────────────────────────────────────────────────
// Card/Panel view mode and device size (Desktop/Tablet/Phone) management.

import { log } from './console.js';

let viewMode = 'card';
let deviceSize = 'desktop';
let orientation = 'portrait';

const DEVICE_LABELS = {
  desktop: { label: null, btn: '🖥️ PC' },
  tablet: { label: 'iPad Air 11"', btn: '📟 iPad Air' },
  phone: { label: 'iPhone 15 Pro Max', btn: '📱 iPhone 15' },
};

/**
 * Initialise view modes from localStorage.
 * @returns {{ viewMode: string, deviceSize: string }}
 */
export function initViewModes() {
  viewMode = localStorage.getItem('wb-view-mode') || 'card';
  deviceSize = localStorage.getItem('wb-device-size') || 'desktop';
  orientation = localStorage.getItem('wb-orientation') || 'portrait';
  return { viewMode, deviceSize };
}

/**
 * Sync the card-mount height based on current mode/device.
 */
export function applyDeviceHeight() {
  const cardMount = document.getElementById('card-mount');
  // In Panel mode with phone/tablet: clear inline style — device CSS handles heights.
  // In Panel desktop or Card mode: set height:100% so card fills the viewport.
  if (viewMode === 'panel' && (deviceSize === 'phone' || deviceSize === 'tablet')) {
    cardMount.style.height = '';
  } else {
    cardMount.style.height = viewMode === 'panel' ? '100%' : '';
  }
}

/**
 * Set view mode (card or panel).
 * @param {'card'|'panel'} mode
 */
export function setViewMode(mode) {
  if (mode === 'card' && deviceSize !== 'desktop') {
    setDeviceSize('desktop');
  }
  viewMode = mode;
  localStorage.setItem('wb-view-mode', mode);
  const previewArea = document.querySelector('.preview-area');
  previewArea.classList.toggle('mode-card', mode === 'card');
  previewArea.classList.toggle('mode-panel', mode === 'panel');
  document.getElementById('btn-mode-card').classList.toggle('active', mode === 'card');
  document.getElementById('btn-mode-panel').classList.toggle('active', mode === 'panel');
  // Show/hide device toggle only in Panel mode
  document.getElementById('device-toggle').classList.toggle('visible', mode === 'panel');
  // Sync orientation toggle: only visible in panel + non-desktop
  const showOrient = mode === 'panel' && deviceSize !== 'desktop';
  document.getElementById('orientation-toggle').classList.toggle('visible', showOrient);
  applyDeviceHeight();
  log(`🖥️ Mode ${mode === 'panel' ? 'Panel (plein écran)' : 'Card (normal)'}`, 'info');
}

/**
 * Set device size (desktop, tablet, phone).
 * @param {'desktop'|'tablet'|'phone'} size
 */
export function setDeviceSize(size) {
  deviceSize = size;
  localStorage.setItem('wb-device-size', size);
  const viewport = document.getElementById('device-viewport');
  const nameLabel = document.getElementById('device-name-label');
  viewport.className = `device-viewport dev-${size}`;
  ['desktop', 'tablet', 'phone'].forEach(s => {
    document.getElementById(`btn-dev-${s}`).classList.toggle('active', s === size);
  });
  const meta = DEVICE_LABELS[size];
  if (nameLabel) {
    if (meta.label) {
      nameLabel.textContent = meta.label;
      nameLabel.classList.remove('hidden');
    } else {
      nameLabel.classList.add('hidden');
    }
  }
  const volLeft = document.getElementById('device-vol-left');
  if (volLeft) volLeft.style.display = size === 'phone' ? 'flex' : 'none';
  // Show/hide orientation toggle (only for phone/tablet)
  const showOrient = viewMode === 'panel' && size !== 'desktop';
  document.getElementById('orientation-toggle').classList.toggle('visible', showOrient);
  // Sync inline height now that device has changed
  applyDeviceHeight();
  log(`💰 Appareil : ${meta.label || 'PC — plein écran'}`, 'info');
}

/**
 * Toggle device orientation (portrait / landscape).
 * @param {'portrait'|'landscape'} orient
 */
export function setOrientation(orient) {
  orientation = orient;
  localStorage.setItem('wb-orientation', orient);
  const viewport = document.getElementById('device-viewport');
  viewport.classList.toggle('landscape', orient === 'landscape');
  document.getElementById('btn-orient-portrait').classList.toggle('active', orient === 'portrait');
  document.getElementById('btn-orient-landscape').classList.toggle('active', orient === 'landscape');
  log(`🔄 Orientation : ${orient === 'landscape' ? 'Paysage' : 'Portrait'}`, 'info');
}

/** @returns {string} Current view mode */
export function getViewMode() {
  return viewMode;
}

/** @returns {string} Current device size */
export function getDeviceSize() {
  return deviceSize;
}
