// ─── Workbench App — Main entry point ────────────────────────────────────────
// Orchestrates all workbench modules.

import { CARDS } from '../cards/_registry.js';
import { registerMockHaIcon } from './ha-icon.js';
import { setupConsoleProxy, log, setConsoleFilter, filterConsoleLines, clearConsole, copyFilteredConsole } from './console.js';
import { buildMockHass, buildLiveHass } from './mock-hass.js';
import { setHaStatus, setLiveMode, openConnectModal, closeConnectModal } from './ui-helpers.js';
import { initViewModes, setViewMode, setDeviceSize, setOrientation, getViewMode } from './view-modes.js';
import { setEditTab, handleYamlInput, copyConfigYaml, updateCardConfig, mountUiEditor, getEditorEl } from './editor.js';
import {
  connectToHA,
  disconnectHA,
  refreshLiveStates,
  tryAutoReconnect,
  isLiveMode,
  getLiveHass,
  getHaConnection,
  getHaAuth,
  getCurrentLanguage,
  setCurrentLanguage,
} from './ha-connection.js';
import { mountIconBrowser } from './icon-browser.js';

// ─── Register mock ha-icon ───────────────────────────────────────────────────
registerMockHaIcon();

// ─── Setup console proxy ─────────────────────────────────────────────────────
setupConsoleProxy();

// ─── Module state ────────────────────────────────────────────────────────────
let currentCard = 'hexa';
let currentScenario = null;
let lastScenarioKey = null; // track which scenario set the config last
let cardEl = null;
let activeConfig = null;
let currentScenarioData = {}; // current scenario states — passed to updateCardConfig to preserve mock hass
let bundleLoaded = false;
let workMode = localStorage.getItem('wb-work-mode') || 'view';
let currentLanguage = localStorage.getItem('wb-lang') || 'fr';

// ─── Bundle loading ──────────────────────────────────────────────────────────
function loadBundle() {
  return new Promise((resolve, reject) => {
    if (bundleLoaded) return resolve();
    const s = document.createElement('script');
    s.type = 'module';
    s.src = '../dist/sci-fi.min.js?v=' + Date.now();
    s.onload = () => {
      bundleLoaded = true;
      log('✅ sci-fi.min.js chargé', 'ok');
      document.getElementById('badge-bundle').textContent = 'Bundle OK';
      document.getElementById('badge-bundle').className = 'badge ok';
      resolve();
    };
    s.onerror = () => {
      log('❌ Bundle introuvable — lance: npm run build', 'error');
      document.getElementById('badge-bundle').textContent = 'Bundle ❌';
      document.getElementById('badge-bundle').className = 'badge err';
      reject(new Error('Bundle not found'));
    };
    document.head.appendChild(s);
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function updateCardHass(hass) {
  if (cardEl) {
    cardEl.hass = hass;
    log('↻ hass mis à jour sur la carte', 'live');
  }
}

function updateHassLanguage() {
  // Use current scenario data so states are preserved when switching language
  const card = CARDS[currentCard];
  const scenarioData = (card && currentScenario && card.scenarios?.[currentScenario])
    ? card.scenarios[currentScenario]
    : {};
  const hass = isLiveMode() && getLiveHass()
    ? buildLiveHass(getLiveHass(), currentLanguage, getHaConnection(), getHaAuth())
    : buildMockHass(scenarioData, currentLanguage);

  if (cardEl) {
    cardEl.hass = hass;
  }
  const edEl = getEditorEl();
  if (edEl) {
    edEl.hass = hass;
  }
}

// ─── Card rendering ──────────────────────────────────────────────────────────
async function renderCard(cardKey, scenarioKey) {
  const card = CARDS[cardKey];
  if (!card) return;

  const mountId = workMode === 'edit' ? 'edit-card-mount' : 'card-mount';
  const mount = document.getElementById(mountId);

  const otherMountId = workMode === 'edit' ? 'card-mount' : 'edit-card-mount';
  const otherMount = document.getElementById(otherMountId);
  if (otherMount) otherMount.innerHTML = '';

  const overlay = document.getElementById('loading-overlay');
  const errorBanner = document.getElementById('error-banner');
  overlay.classList.remove('hidden');
  errorBanner.classList.remove('visible');

  try {
    await loadBundle();

    // ── Icon browser (special panel — no Lit card) ──────────────────────────
    if (card.type === 'iconpicker') {
      mount.innerHTML = '';
      overlay.classList.add('hidden');
      await mountIconBrowser(mount);
      return;
    }

    mount.innerHTML = '';

    const hass = isLiveMode() && getLiveHass()
      ? buildLiveHass(getLiveHass(), currentLanguage, getHaConnection(), getHaAuth())
      : buildMockHass(scenarioKey && card.scenarios[scenarioKey] ? card.scenarios[scenarioKey] : {}, currentLanguage);

    // Scenario-level config override: if scenario has a `_config` property, use it.
    // Always recompute when card or scenario changes to avoid stale config.
    const scenarioData = scenarioKey && card.scenarios[scenarioKey] ? card.scenarios[scenarioKey] : {};
    const scenarioConfig = scenarioData._config ?? null;
    currentScenarioData = scenarioData; // keep in sync for onConfigChanged

    const cardChanged = currentCard !== cardKey;
    const scenarioChanged = lastScenarioKey !== scenarioKey;

    if (!activeConfig || cardChanged || scenarioChanged) {
      activeConfig = scenarioConfig ? { ...scenarioConfig } : { ...card.config };
      lastScenarioKey = scenarioKey;
      if (window.jsyaml) {
        document.getElementById('yaml-textarea').value = jsyaml.dump(activeConfig);
      }
    }

    cardEl = document.createElement(card.tag);
    if (!customElements.get(card.tag)) throw new Error(`<${card.tag}> non enregistré`);
    cardEl.setConfig(activeConfig);
    mount.appendChild(cardEl);
    cardEl.hass = hass;

    if (workMode === 'edit') {
      mountUiEditor({
        currentCard,
        CARDS,
        activeConfig,
        cardEl,
        isLive: isLiveMode(),
        liveHass: getLiveHass(),
        haConnection: getHaConnection(),
        haAuth: getHaAuth(),
        language: currentLanguage,
        scenarioData: currentScenarioData,
        onConfigChanged: (newConfig) => {
          activeConfig = newConfig;
          updateCardConfig(newConfig, cardEl, isLiveMode(), getLiveHass(), getHaConnection(), getHaAuth(), currentLanguage, currentScenarioData);
        },
      });
    }

    log(`🃏 ${card.label}${isLiveMode() ? ' [LIVE]' : ` [${scenarioKey || 'mock'}]`}`, isLiveMode() ? 'live' : 'info');
  } catch (err) {
    log(`❌ ${err.message}`, 'error');
    errorBanner.textContent = `Erreur: ${err.message}`;
    errorBanner.classList.add('visible');
  } finally {
    overlay.classList.add('hidden');
  }
}

// ─── Tabs & scenarios ────────────────────────────────────────────────────────
function buildTabs() {
  const container = document.getElementById('tabs-container');
  container.innerHTML = '';
  Object.entries(CARDS).forEach(([key, card]) => {
    const tab = document.createElement('button');
    tab.className = 'tab' + (key === currentCard ? ' active' : '');
    tab.textContent = card.label;
    tab.onclick = () => selectCard(key);
    container.appendChild(tab);
  });
}

function buildScenarios(cardKey) {
  const card = CARDS[cardKey];
  const list = document.getElementById('scenario-list');
  list.innerHTML = '';

  // iconpicker has no scenarios
  if (card.type === 'iconpicker') {
    list.innerHTML = '<em style="color:var(--text-dim);font-size:12px;padding:4px 0;">Aucun scénario</em>';
    currentScenario = null;
    return;
  }

  Object.keys(card.scenarios).forEach((name, i) => {
    const btn = document.createElement('button');
    btn.className = 'scenario-btn' + (i === 0 ? ' active' : '');
    btn.innerHTML = `<span class="dot"></span>${name}`;
    btn.onclick = () => {
      if (isLiveMode()) return;
      list.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScenario = name;
      renderCard(currentCard, currentScenario);
    };
    list.appendChild(btn);
  });
  currentScenario = Object.keys(card.scenarios)[0];
}

function selectCard(key) {
  currentCard = key;
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', Object.keys(CARDS)[i] === key));
  document.getElementById('preview-title').textContent = CARDS[key].label;
  buildScenarios(key);
  activeConfig = null;
  renderCard(key, currentScenario);
}

function reloadCard() {
  bundleLoaded = false;
  document.querySelectorAll('script[src*="sci-fi.min.js"]').forEach(s => s.remove());
  renderCard(currentCard, currentScenario);
}

// ─── Language ────────────────────────────────────────────────────────────────
async function setLanguage(lang) {
  currentLanguage = lang;
  setCurrentLanguage(lang);
  localStorage.setItem('wb-lang', lang);
  document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-lang-fr').classList.toggle('active', lang === 'fr');

  log(`🇬🇧 Langue basculée sur : ${lang === 'en' ? 'Anglais' : 'Français'}`, 'info');

  // Force locale change immediately
  if (window.__sciFiSetLocale) {
    try {
      await window.__sciFiSetLocale(lang);
    } catch (_e) {
      // 'en' is sourceLocale — setLocale may error if locale is not a targetLocale, ignore
    }
  }

  updateHassLanguage();
}

// ─── Work mode (View / Edit) ─────────────────────────────────────────────────
function setWorkModeFunc(mode) {
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

  renderCard(currentCard, currentScenario);
}

// ─── Navigation intercept ────────────────────────────────────────────────────
const PATH_TO_TAB = {
  'lights': 'lights',
  'stove': 'stove',
  'vacuum': 'vacuum',
  'vehicles': 'vehicles',
  'radiators': 'climates',
  'plug': 'plugs',
  'weather': 'weather',
  'media': 'tv',
};

const origPushState = window.history.pushState;
window.history.pushState = function (state, title, url) {
  if (url) {
    const cleanUrl = String(url).split('/').pop() || '';
    const tabKey = PATH_TO_TAB[cleanUrl];
    if (tabKey) {
      log(`🔄 Navigation : ${cleanUrl} ➔ Onglet ${tabKey}`, 'info');
      selectCard(tabKey);
      if (window.location.protocol === 'file:') {
        return;
      }
    }
  }
  try {
    origPushState.apply(this, arguments);
  } catch (e) {
    console.warn('pushState failed:', e);
  }
};

// ─── Event listener setup ────────────────────────────────────────────────────
function setupEventListeners() {
  // View mode buttons
  document.getElementById('btn-mode-card').addEventListener('click', () => setViewMode('card'));
  document.getElementById('btn-mode-panel').addEventListener('click', () => setViewMode('panel'));

  // Work mode buttons
  document.getElementById('btn-work-view').addEventListener('click', () => setWorkModeFunc('view'));
  document.getElementById('btn-work-edit').addEventListener('click', () => setWorkModeFunc('edit'));

  // Device size buttons
  document.getElementById('btn-dev-desktop').addEventListener('click', () => setDeviceSize('desktop'));
  document.getElementById('btn-dev-tablet').addEventListener('click', () => setDeviceSize('tablet'));
  document.getElementById('btn-dev-phone').addEventListener('click', () => setDeviceSize('phone'));

  // Orientation buttons
  document.getElementById('btn-orient-portrait').addEventListener('click', () => setOrientation('portrait'));
  document.getElementById('btn-orient-landscape').addEventListener('click', () => setOrientation('landscape'));

  // Language buttons
  document.getElementById('btn-lang-en').addEventListener('click', () => setLanguage('en'));
  document.getElementById('btn-lang-fr').addEventListener('click', () => setLanguage('fr'));

  // Connect buttons
  document.getElementById('btn-connect-toolbar').addEventListener('click', () => openConnectModal());
  document.getElementById('btn-connect-panel').addEventListener('click', () => openConnectModal());
  document.getElementById('btn-connect-action').addEventListener('click', () => connectToHA(onLiveUpdate));
  document.getElementById('btn-disconnect').addEventListener('click', () => {
    disconnectHA(() => renderCard(currentCard, currentScenario));
  });

  // Refresh button
  document.getElementById('btn-refresh').addEventListener('click', () => {
    refreshLiveStates(updateCardHass);
  });

  // Reload card button
  document.getElementById('btn-reload-card').addEventListener('click', () => reloadCard());

  // Close connect modal
  document.getElementById('btn-connect-cancel').addEventListener('click', () => closeConnectModal());

  // Edit tab buttons — remount GUI editor if panel is empty (e.g. after YAML tab or page reload)
  document.getElementById('btn-edit-tab-gui').addEventListener('click', () => {
    setEditTab('gui', activeConfig);
    const guiMount = document.getElementById('gui-editor-mount');
    if (guiMount && !guiMount.firstChild) {
      mountUiEditor({
        currentCard,
        CARDS,
        activeConfig,
        cardEl,
        isLive: isLiveMode(),
        liveHass: getLiveHass(),
        haConnection: getHaConnection(),
        haAuth: getHaAuth(),
        language: currentLanguage,
        scenarioData: currentScenarioData,
        onConfigChanged: (newConfig) => {
          activeConfig = newConfig;
          updateCardConfig(newConfig, cardEl, isLiveMode(), getLiveHass(), getHaConnection(), getHaAuth(), currentLanguage, currentScenarioData);
        },
      });
    }
  });
  document.getElementById('btn-edit-tab-yaml').addEventListener('click', () => setEditTab('yaml', activeConfig));

  // Copy YAML button
  document.getElementById('btn-copy-yaml').addEventListener('click', () => copyConfigYaml());

  // YAML textarea input
  document.getElementById('yaml-textarea').addEventListener('input', () => {
    handleYamlInput({
      cardEl,
      isLive: isLiveMode(),
      liveHass: getLiveHass(),
      haConnection: getHaConnection(),
      haAuth: getHaAuth(),
      language: currentLanguage,
      onConfigParsed: (parsed) => { activeConfig = parsed; },
    });
  });

  // Console filter buttons
  document.querySelectorAll('.console-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setConsoleFilter(btn.getAttribute('data-filter')));
  });

  // Console copy / clear
  document.getElementById('btn-console-copy').addEventListener('click', () => copyFilteredConsole());
  document.getElementById('btn-console-clear').addEventListener('click', () => clearConsole());

  // Console search
  document.getElementById('console-search').addEventListener('input', () => filterConsoleLines());
}

// ─── Live update callback ────────────────────────────────────────────────────
function onLiveUpdate(hass) {
  updateCardHass(hass);
}

// ─── Mock state-change callback (triggered by callService mock mutations) ─────
window.addEventListener('mock-hass-state-changed', (e) => {
  if (isLiveMode()) return; // no-op in live mode — HA handles it
  if (!cardEl) return;
  // Shallow-clone the existing hass so Lit detects a reference change and re-renders.
  // Keep the same callService closure (which already references the mutated states object).
  // Do NOT call buildMockHass() — that would create a new closure with fresh base states,
  // which is what caused the first-click bug (click 1 worked but the new closure reset to base).
  cardEl.hass = { ...cardEl.hass, states: e.detail.states };
});

// ─── Init sequence ───────────────────────────────────────────────────────────
const { viewMode: initialViewMode, deviceSize: initialDeviceSize } = initViewModes();

buildTabs();
setHaStatus('offline', 'Non connecté — données mockées');
setLanguage(currentLanguage);
setWorkModeFunc(workMode);
setEditTab(localStorage.getItem('wb-edit-tab') || 'gui', activeConfig);
selectCard('hexa');
setViewMode(initialViewMode);
setDeviceSize(initialDeviceSize);

log('🚀 Workbench démarré', 'info');
log('💡 "npm run build" pour mettre à jour · "↺ Recharger" pour voir les changements', 'info');
log('🔗 Clique "Se connecter" pour utiliser tes vraies données HA', 'info');
log(`🖼️ Mode d'affichage : ${initialViewMode === 'panel' ? 'Panel (plein écran)' : 'Card (normal)'} — toggle dans la toolbar`, 'info');

// Attach event listeners (replaces inline onclick handlers)
setupEventListeners();

// Try auto-reconnect (OAuth callback or saved token)
tryAutoReconnect(onLiveUpdate);
