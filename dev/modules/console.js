// ─── Console proxy module ────────────────────────────────────────────────────
// Intercepts console.warn/error and renders them in the workbench console panel.
// Also provides log(), filtering, clearing, and copying.

let consoleEl = null;
let activeConsoleFilter = 'warn';

/**
 * Initialise the console proxy.
 * Grabs the console-area DOM element and intercepts console.warn/error.
 * Call once at init.
 */
export function setupConsoleProxy() {
  consoleEl = document.getElementById('console-area');

  const _warn = console.warn.bind(console);
  const _error = console.error.bind(console);
  console.warn = (...a) => { _warn(...a); log(a.join(' '), 'warn'); };
  console.error = (...a) => { _error(...a); log(a.join(' '), 'error'); };
}

/**
 * Append a line to the console area.
 * @param {string} msg - Message text
 * @param {'info'|'warn'|'error'|'ok'|'live'} type - Line type / colour
 */
export function log(msg, type = 'info') {
  if (!consoleEl) return;
  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  const ts = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  line.textContent = `[${ts}] ${msg}`;
  consoleEl.appendChild(line);
  filterConsoleLines();
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

// Expose log for external (non-module) callers
window._wbLog = log;

/**
 * Set the active console filter and update button states.
 * @param {'all'|'info'|'warn'|'error'} filterType
 */
export function setConsoleFilter(filterType) {
  activeConsoleFilter = filterType;
  document.querySelectorAll('.console-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filterType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  filterConsoleLines();
}

/**
 * Apply the current filter + keyword search to all console lines.
 */
export function filterConsoleLines() {
  const searchVal = (document.getElementById('console-search')?.value || '').toLowerCase();
  const lines = document.querySelectorAll('.console-line');

  lines.forEach(line => {
    let matchesFilter = false;
    if (activeConsoleFilter === 'all') {
      matchesFilter = true;
    } else if (activeConsoleFilter === 'info') {
      matchesFilter = line.classList.contains('info') || line.classList.contains('ok') || line.classList.contains('live');
    } else if (activeConsoleFilter === 'warn') {
      matchesFilter = line.classList.contains('warn');
    } else if (activeConsoleFilter === 'error') {
      matchesFilter = line.classList.contains('error');
    }

    const matchesSearch = line.textContent.toLowerCase().includes(searchVal);

    if (matchesFilter && matchesSearch) {
      line.style.display = 'block';
    } else {
      line.style.display = 'none';
    }
  });
}

/**
 * Empty the console area.
 */
export function clearConsole() {
  if (consoleEl) consoleEl.innerHTML = '';
}

/**
 * Copy currently visible (filtered) console lines to clipboard.
 */
export async function copyFilteredConsole() {
  const lines = document.querySelectorAll('.console-line');
  const textToCopy = Array.from(lines)
    .filter(line => line.style.display !== 'none')
    .map(line => line.textContent)
    .join('\n');

  if (!textToCopy) {
    log('⚠️ Aucun log visible à copier', 'warn');
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    log('📋 Logs filtrés copiés !', 'ok');
  } catch (err) {
    log(`❌ Échec de la copie: ${err}`, 'error');
  }
}
