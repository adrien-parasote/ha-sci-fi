// ─── UI helpers module ───────────────────────────────────────────────────────
// Status display, live mode toggling, connect modal.

/**
 * Update the HA connection status indicator (dot, badge, buttons).
 * @param {'offline'|'connecting'|'live'|'error'} state
 * @param {string} text - Status text to display
 */
export function setHaStatus(state, text) {
  const dot = document.getElementById('ha-dot');
  const statusText = document.getElementById('ha-status-text');
  const badgeMode = document.getElementById('badge-mode');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnDisconnect = document.getElementById('btn-disconnect');
  const btnConnectPanel = document.getElementById('btn-connect-panel');
  const btnConnectToolbar = document.getElementById('btn-connect-toolbar');

  dot.className = 'ha-dot ' + (state === 'live' ? 'live' : state === 'connecting' ? 'connecting' : state === 'error' ? 'error' : '');
  statusText.textContent = text;

  if (state === 'live') {
    badgeMode.textContent = '🟢 Live HA';
    badgeMode.className = 'badge live';
    btnRefresh.disabled = false;
    btnDisconnect.style.display = '';
    btnConnectPanel.style.display = 'none';
    btnConnectToolbar.style.display = 'none';
  } else {
    badgeMode.textContent = 'Mock data';
    badgeMode.className = 'badge';
    btnRefresh.disabled = true;
    btnDisconnect.style.display = 'none';
    btnConnectPanel.style.display = '';
    btnConnectToolbar.style.display = '';
  }
}

/**
 * Toggle scenario list opacity/pointer-events for live mode.
 * @param {boolean} live - Whether live mode is active
 */
export function setLiveMode(live) {
  const scenarioList = document.getElementById('scenario-list');
  const liveNote = document.getElementById('live-mode-note');
  const panelTitle = scenarioList.previousElementSibling;
  scenarioList.style.opacity = live ? '0.3' : '1';
  scenarioList.style.pointerEvents = live ? 'none' : 'auto';
  liveNote.classList.toggle('hidden', !live);
  panelTitle.textContent = live ? '🎬 Scénarios (désactivés en live)' : '🎬 Scénarios (mode mock)';
}

/**
 * Open the connect modal and pre-fill URL from localStorage.
 */
export function openConnectModal() {
  document.getElementById('connect-modal').classList.add('open');
  // Pre-fill from localStorage if available
  const saved = localStorage.getItem('hassUrl');
  if (saved) document.getElementById('ha-url').value = saved;
  document.getElementById('btn-connect-action').disabled = false;
}

/**
 * Close the connect modal and save URL to localStorage.
 */
export function closeConnectModal() {
  document.getElementById('connect-modal').classList.remove('open');
  const url = document.getElementById('ha-url').value.trim();
  if (url) localStorage.setItem('hassUrl', url);
}
