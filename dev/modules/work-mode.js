// ─── Work mode module ────────────────────────────────────────────────────────
// View / Edit mode of the workbench: which viewport is shown, and whether the
// device selectors stay reachable.
//
// Extracted from workbench-app.js on 2026-08-12 (bead ha-sci-fi-9xf). That file is
// a side-effecting entry module with no exports, so the behaviour spec row IT-906
// describes could not be reached by a test. Same shape as view-modes.js: module
// state, an exported setter, an exported getter.

import { log } from './console.js';
import { getViewMode } from './view-modes.js';

let workMode = localStorage.getItem('wb-work-mode') || 'view';

/**
 * Read the persisted work mode without applying it.
 * @returns {'view'|'edit'}
 */
export function initWorkMode() {
  workMode = localStorage.getItem('wb-work-mode') || 'view';
  return workMode;
}

/**
 * Switch between View and Edit mode.
 *
 * Edit mode forces the computer layout: the device viewport is hidden and the
 * iPad / iPhone selectors go away with it, because the editor panels assume the
 * full width.
 *
 * @param {'view'|'edit'} mode
 * @param {() => void} [onApplied] - called once the DOM is in its new state
 *   (workbench-app re-renders the previewed card here).
 */
export function setWorkMode(mode, onApplied) {
  workMode = mode;
  localStorage.setItem('wb-work-mode', mode);
  document.getElementById('btn-work-view').classList.toggle('active', mode === 'view');
  document.getElementById('btn-work-edit').classList.toggle('active', mode === 'edit');

  const deviceViewport = document.getElementById('device-viewport');
  const editViewport = document.getElementById('edit-viewport');
  const deviceToggle = document.getElementById('device-toggle');

  if (mode === 'edit') {
    deviceViewport.style.display = 'none';
    editViewport.style.display = 'flex';
    deviceToggle.classList.remove('visible'); // Force PC layout, hide selectors

    log('✏️ Mode Édition activé', 'info');
  } else {
    deviceViewport.style.display = '';
    editViewport.style.display = 'none';
    deviceToggle.classList.toggle('visible', getViewMode() === 'panel'); // restore if panel view

    log('👁️ Mode Visualisation activé', 'info');
  }

  if (onApplied) onApplied();
}

/** @returns {'view'|'edit'} Current work mode */
export function getWorkMode() {
  return workMode;
}
