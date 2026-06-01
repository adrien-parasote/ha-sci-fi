// ─── HA Connection module ────────────────────────────────────────────────────
// Manages the WebSocket connection to Home Assistant (connect, disconnect, reconnect).

import {
  ERR_HASS_HOST_REQUIRED,
  createConnection,
  getAuth,
  getConfig,
  getUser,
  subscribeEntities,
  subscribeServices,
} from '/node_modules/home-assistant-js-websocket/dist/index.js';

import { log } from './console.js';
import { setHaStatus, setLiveMode, closeConnectModal } from './ui-helpers.js';
import { buildLiveHass } from './mock-hass.js';

// ─── Module state ────────────────────────────────────────────────────────────
let haConnection = null;
let haAuth = null;
let liveHass = null;
let unsubEntities = null;
let unsubServices = null;
let isLive = false;
let currentLanguage = localStorage.getItem('wb-lang') || 'fr';

// ─── Auth helpers ────────────────────────────────────────────────────────────
function getAuthOptions(hassUrl, token) {
  if (token) {
    return {
      hassUrl,
      async loadTokens() { return null; },
      saveTokens() { },
      accessToken: token,
    };
  }
  // OAuth flow
  return {
    hassUrl,
    async loadTokens() {
      try { return JSON.parse(localStorage.getItem('hassTokens') || 'null'); } catch { return null; }
    },
    saveTokens: (tokens) => { localStorage.setItem('hassTokens', JSON.stringify(tokens)); },
  };
}

// ─── Internal: Load live data after connection ───────────────────────────────
async function loadLiveData(onLiveUpdate) {
  setHaStatus('connecting', 'Chargement des données HA…');
  log('📡 Chargement states, areas, floors, entities…', 'info');

  const baseHass = {
    states: {},
    areas: {},
    floors: {},
    devices: {},
    entities: {},
    user: {},
    language: currentLanguage,
    locale: { language: currentLanguage, number_format: 'comma_decimal', time_format: '24', date_format: 'DMY', time_zone: 'Europe/Paris', first_weekday: 'monday' },
    themes: { darkMode: true, theme: 'default' },
    connection: haConnection,
  };

  // Load registries in parallel
  const [areas, floors, devices, entities, user, config] = await Promise.all([
    haConnection.sendMessagePromise({ type: 'config/area_registry/list' }),
    haConnection.sendMessagePromise({ type: 'config/floor_registry/list' }),
    haConnection.sendMessagePromise({ type: 'config/device_registry/list' }),
    haConnection.sendMessagePromise({ type: 'config/entity_registry/list' }),
    getUser(haConnection),
    getConfig(haConnection),
  ]);

  areas.forEach(a => { baseHass.areas[a.area_id] = a; });
  floors.forEach(f => { baseHass.floors[f.floor_id] = f; });
  devices.forEach(d => { baseHass.devices[d.id] = d; });
  entities.forEach(e => { baseHass.entities[e.entity_id] = e; });
  baseHass.user = user;
  baseHass.config = config;
  log(`✅ ${areas.length} zones · ${floors.length} étages · ${entities.length} entités`, 'ok');

  // Sync language with connected Home Assistant configuration if available
  if (config && config.language) {
    const haLang = config.language.substring(0, 2).toLowerCase();
    if (haLang === 'fr' || haLang === 'en') {
      currentLanguage = haLang;
      localStorage.setItem('wb-lang', haLang);
      document.getElementById('btn-lang-en').classList.toggle('active', haLang === 'en');
      document.getElementById('btn-lang-fr').classList.toggle('active', haLang === 'fr');
      log(`🌐 Langue détectée depuis Home Assistant : ${config.language} (mappée sur ${haLang})`, 'ok');
    }
  }

  // Subscribe to live entity states
  if (unsubEntities) unsubEntities();
  unsubEntities = subscribeEntities(haConnection, (states) => {
    baseHass.states = states;
    liveHass = buildLiveHass(baseHass, currentLanguage, haConnection, haAuth);
    isLive = true;
    if (onLiveUpdate) onLiveUpdate(liveHass);
  });

  // Subscribe to services
  if (unsubServices) unsubServices();
  unsubServices = subscribeServices(haConnection, (services) => {
    baseHass.services = services;
  });

  setHaStatus('live', `Live — ${user.name || 'connecté'}`);
  setLiveMode(true);
  log('🟢 Mode live activé — données réelles de ton HA', 'live');
}

// ─── Exports ─────────────────────────────────────────────────────────────────

/**
 * Connect to HA via token or OAuth.
 * @param {function} onLiveUpdate - Callback called when live entity states update
 */
export async function connectToHA(onLiveUpdate) {
  const urlInput = document.getElementById('ha-url').value.trim();
  const tokenInput = document.getElementById('ha-token').value.trim();

  if (!urlInput) {
    alert('Saisis l\'URL de ton instance HA');
    return;
  }

  const hassUrl = urlInput.replace(/\/$/, '');
  setHaStatus('connecting', 'Connexion en cours…');
  document.getElementById('btn-connect-action').disabled = true;
  log(`🔗 Connexion à ${hassUrl}…`, 'info');

  try {
    let auth;

    if (tokenInput) {
      // Long-lived token — build auth object manually
      auth = {
        data: { hassUrl, access_token: tokenInput },
        accessToken: tokenInput,
        expired: false,
        refreshAccessToken: async () => { },
      };
    } else {
      // OAuth flow
      const authOptions = getAuthOptions(hassUrl, null);
      try {
        auth = await getAuth(authOptions);
      } catch (err) {
        if (err === ERR_HASS_HOST_REQUIRED || err.toString().includes('ERR_HASS_HOST_REQUIRED')) {
          authOptions.hassUrl = hassUrl;
          auth = await getAuth(authOptions);
        } else throw err;
      }
    }

    haConnection = await createConnection({ auth });
    haAuth = auth;

    // Persist credentials for auto-reconnect on page reload
    if (tokenInput) {
      // Long-lived token: save token + URL
      localStorage.setItem('hassToken', tokenInput);
    } else {
      // OAuth: only save the URL (tokens are saved by getAuth via saveTokens callback)
      localStorage.removeItem('hassToken');
    }
    // Always save hassUrl regardless of auth method
    localStorage.setItem('hassUrl', hassUrl);

    for (const ev of ['disconnected', 'ready', 'reconnect-error']) {
      haConnection.addEventListener(ev, () => {
        log(`HA event: ${ev}`, ev === 'ready' ? 'ok' : 'warn');
        if (ev === 'disconnected') setHaStatus('error', 'Déconnecté du HA');
        if (ev === 'ready') setHaStatus('live', 'Reconnecté');
      });
    }

    log('✅ Connexion WebSocket établie', 'ok');
    closeConnectModal();

    // Load all HA data
    await loadLiveData(onLiveUpdate);

  } catch (err) {
    log(`❌ Erreur de connexion: ${err}`, 'error');
    setHaStatus('error', `Erreur: ${err}`);
    document.getElementById('btn-connect-action').disabled = false;
  }
}

/**
 * Disconnect from HA and return to mock mode.
 * @param {function} onDisconnect - Callback after disconnection
 */
export function disconnectHA(onDisconnect) {
  if (haConnection) haConnection.close();
  if (unsubEntities) { unsubEntities(); unsubEntities = null; }
  if (unsubServices) { unsubServices(); unsubServices = null; }
  haConnection = null;
  haAuth = null;
  liveHass = null;
  isLive = false;
  // Clear all stored credentials on explicit user disconnect
  localStorage.removeItem('hassTokens');
  localStorage.removeItem('hassToken');
  localStorage.removeItem('hassUrl');
  // Clear pre-filled modal fields
  const urlEl = document.getElementById('ha-url');
  const tokenEl = document.getElementById('ha-token');
  if (urlEl) urlEl.value = '';
  if (tokenEl) tokenEl.value = '';
  setHaStatus('offline', 'Non connecté — données mockées');
  setLiveMode(false);
  log('🔴 Déconnecté du HA — credentials effacés', 'warn');
  if (onDisconnect) onDisconnect();
}

/**
 * Refresh live states on the current card.
 * @param {function} updateCardHass - Callback to update card hass
 */
export function refreshLiveStates(updateCardHass) {
  if (!isLive || !liveHass) {
    log('⚠️ Non connecté au HA', 'warn');
    return;
  }
  if (updateCardHass) updateCardHass(liveHass);
  log('↻ États rafraîchis', 'live');
}

/**
 * Try auto-reconnect from saved OAuth callback or token.
 * @param {function} onLiveUpdate - Callback called when live entity states update
 */
export function tryAutoReconnect(onLiveUpdate) {
  // Case 1: OAuth callback — HA redirected back after login
  if (window.location.search.includes('auth_callback=1')) {
    const stateRaw = new URLSearchParams(window.location.search).get('state') || '';
    let oauthUrl = '';
    try { oauthUrl = JSON.parse(atob(stateRaw)).hassUrl || ''; } catch { /* empty */ }
    const savedUrl = oauthUrl || localStorage.getItem('hassUrl') || '';
    log('🔄 Retour OAuth — finalisation de la connexion…', 'info');
    setHaStatus('connecting', 'Finalisation OAuth…');
    setTimeout(async () => {
      try {
        const authOptions = getAuthOptions(savedUrl, null);
        const auth = await getAuth(authOptions);
        haConnection = await createConnection({ auth });
        haAuth = auth;
        if (savedUrl) localStorage.setItem('hassUrl', savedUrl);
        // Clean auth_callback from URL without reload
        window.history.replaceState({}, document.title, window.location.pathname);
        await loadLiveData(onLiveUpdate);
      } catch (err) {
        window.history.replaceState({}, document.title, window.location.pathname);
        log(`❌ Finalisation OAuth échouée (${err}) — clique "Se connecter" pour réessayer`, 'error');
        setHaStatus('offline', 'Non connecté — données mockées');
      }
    }, 100);
    return;
  }

  // Case 2: Long-lived token saved — reconnect silently on page load
  const savedToken = localStorage.getItem('hassToken');
  const savedUrl = localStorage.getItem('hassUrl');

  if (savedToken && savedUrl) {
    // Pre-fill the modal fields so the user can click once if auto-reconnect fails
    const urlEl = document.getElementById('ha-url');
    const tokenEl = document.getElementById('ha-token');
    if (urlEl) urlEl.value = savedUrl;
    if (tokenEl) tokenEl.value = savedToken;

    log('🔄 Token long-lived trouvé — reconnexion auto…', 'info');
    setHaStatus('connecting', 'Reconnexion auto…');

    setTimeout(async () => {
      try {
        const auth = {
          data: { hassUrl: savedUrl, access_token: savedToken },
          accessToken: savedToken,
          expired: false,
          refreshAccessToken: async () => { },
        };
        haConnection = await createConnection({ auth });
        haAuth = auth;
        log('✅ Reconnexion auto (token) réussie', 'ok');
        await loadLiveData(onLiveUpdate);
      } catch (err) {
        log(`⚠️ Reconnexion auto échouée (${err}) — modal pré-rempli, clique "Se connecter"`, 'warn');
        setHaStatus('offline', 'Non connecté — credentials sauvegardés');
        const modal = document.getElementById('connect-modal');
        if (modal) modal.classList.add('open');
      }
    }, 200);
    return;
  }

  // Case 3: OAuth tokens saved — reconnect without re-authentication
  // hassTokens contains the refresh token, getAuth() will use it to get a new access token.
  const savedOAuthRaw = localStorage.getItem('hassTokens');
  const savedOAuthUrl = savedUrl || localStorage.getItem('hassUrl');
  if (!savedOAuthRaw || !savedOAuthUrl) return;

  // Pre-fill only the URL field (no token to show for OAuth)
  const urlEl2 = document.getElementById('ha-url');
  if (urlEl2) urlEl2.value = savedOAuthUrl;

  log('🔄 Tokens OAuth trouvés — reconnexion auto…', 'info');
  setHaStatus('connecting', 'Reconnexion auto (OAuth)…');

  setTimeout(async () => {
    try {
      const authOptions = getAuthOptions(savedOAuthUrl, null);
      const auth = await getAuth(authOptions);
      haConnection = await createConnection({ auth });
      haAuth = auth;
      log('✅ Reconnexion auto (OAuth) réussie', 'ok');
      await loadLiveData(onLiveUpdate);
    } catch (err) {
      log(`⚠️ Reconnexion OAuth auto échouée (${err}) — clique "Se connecter"`, 'warn');
      setHaStatus('offline', 'Non connecté — données mockées');
      const modal = document.getElementById('connect-modal');
      if (modal) modal.classList.add('open');
    }
  }, 200);
}

/** @returns {boolean} Whether currently in live mode */
export function isLiveMode() { return isLive; }

/** @returns {Object|null} Live hass object */
export function getLiveHass() { return liveHass; }

/** @returns {Object|null} HA websocket connection */
export function getHaConnection() { return haConnection; }

/** @returns {Object|null} HA auth object */
export function getHaAuth() { return haAuth; }

/** @returns {string} Current language code */
export function getCurrentLanguage() { return currentLanguage; }

/**
 * Set the current language code.
 * @param {string} lang
 */
export function setCurrentLanguage(lang) { currentLanguage = lang; }
