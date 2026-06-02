// ─── Editor module ───────────────────────────────────────────────────────────
// GUI / YAML tab switching, config editing, and GUI editor mounting.

import { log } from './console.js';
import { buildMockHass, buildLiveHass } from './mock-hass.js';

let editTab = localStorage.getItem('wb-edit-tab') || 'gui';
let editorEl = null;

/**
 * Switch between GUI and YAML editor tabs.
 * @param {'gui'|'yaml'} tab
 * @param {Object} activeConfig - Current active card config
 */
export function setEditTab(tab, activeConfig) {
  editTab = tab;
  localStorage.setItem('wb-edit-tab', tab);

  document.getElementById('btn-edit-tab-gui').classList.toggle('active', tab === 'gui');
  document.getElementById('btn-edit-tab-yaml').classList.toggle('active', tab === 'yaml');

  document.getElementById('edit-content-gui').style.display = tab === 'gui' ? 'flex' : 'none';
  document.getElementById('edit-content-yaml').style.display = tab === 'yaml' ? 'flex' : 'none';

  if (tab === 'yaml' && activeConfig && window.jsyaml) {
    document.getElementById('yaml-textarea').value = jsyaml.dump(activeConfig);
  }
}

/**
 * Parse YAML textarea input and update card config.
 * @param {Object} params
 * @param {Object|null} params.cardEl - Current card element
 * @param {boolean} params.isLive - Whether in live mode
 * @param {Object|null} params.liveHass - Live hass object
 * @param {Object|null} params.haConnection - HA connection
 * @param {Object|null} params.haAuth - HA auth
 * @param {string} params.language - Current language
 * @param {function} params.onConfigParsed - Callback with parsed config
 */
export function handleYamlInput({ cardEl, isLive, liveHass, haConnection, haAuth, language, onConfigParsed }) {
  const textarea = document.getElementById('yaml-textarea');
  const yamlText = textarea.value;
  const errorBanner = document.getElementById('yaml-error-banner');

  try {
    if (!window.jsyaml) {
      throw new Error("js-yaml non disponible");
    }

    const parsed = jsyaml.load(yamlText);
    if (parsed && typeof parsed === 'object') {
      errorBanner.classList.remove('visible');

      if (onConfigParsed) onConfigParsed(parsed);

      updateCardConfig(parsed, cardEl, isLive, liveHass, haConnection, haAuth, language);

      if (editorEl) {
        editorEl.setConfig(parsed);
      }
    }
  } catch (err) {
    errorBanner.textContent = `Erreur YAML (ligne ${err.mark ? err.mark.line + 1 : '?'}): ${err.message}`;
    errorBanner.classList.add('visible');
  }
}

/**
 * Copy current YAML config to clipboard.
 */
export async function copyConfigYaml() {
  const yamlText = document.getElementById('yaml-textarea').value;
  if (!yamlText) {
    log('⚠️ Pas de configuration à copier', 'warn');
    return;
  }
  try {
    await navigator.clipboard.writeText(yamlText);
    log('📋 Configuration YAML copiée !', 'ok');
  } catch (err) {
    log(`❌ Échec de la copie: ${err}`, 'error');
  }
}

/**
 * Apply a config object to the card element.
 * @param {Object} config - Card config
 * @param {Object|null} cardEl - Card custom element
 * @param {boolean} isLive - Live mode flag
 * @param {Object|null} liveHass - Live hass object
 * @param {Object|null} haConnection - HA connection
 * @param {Object|null} haAuth - HA auth
 * @param {string} language - Current language
 * @param {Object} [scenarioData={}] - Current scenario data to build mock hass with correct entities
 */
export function updateCardConfig(config, cardEl, isLive, liveHass, haConnection, haAuth, language, scenarioData = {}) {
  const errorBanner = document.getElementById('yaml-error-banner');
  try {
    if (cardEl) {
      cardEl.setConfig(config);
      // Use scenarioData (not {}) so mock entities are preserved after a GUI editor change.
      const hass = isLive && liveHass
        ? buildLiveHass(liveHass, language, haConnection, haAuth)
        : buildMockHass(scenarioData, language);
      cardEl.hass = hass;
      errorBanner.classList.remove('visible');
    }
  } catch (err) {
    errorBanner.textContent = `Erreur de la carte: ${err.message}`;
    errorBanner.classList.add('visible');
  }
}

/**
 * Mount the GUI editor for the current card.
 * @param {Object} params
 * @param {Object|null} params.currentCard - Current card key
 * @param {Object} params.CARDS - Cards registry object
 * @param {Object} params.activeConfig - Active card config
 * @param {Object|null} params.cardEl - Card custom element
 * @param {boolean} params.isLive - Live mode flag
 * @param {Object|null} params.liveHass - Live hass object
 * @param {Object|null} params.haConnection - HA connection
 * @param {Object|null} params.haAuth - HA auth
 * @param {string} params.language - Current language
 * @param {Object} [params.scenarioData={}] - Current scenario data to build mock hass with correct entities
 * @param {function} params.onConfigChanged - Callback on config-changed event
 */
export function mountUiEditor({ currentCard, CARDS, activeConfig, cardEl, isLive, liveHass, haConnection, haAuth, language, scenarioData = {}, onConfigChanged }) {
  const container = document.getElementById('gui-editor-mount');
  container.innerHTML = '';
  editorEl = null;

  const card = CARDS[currentCard];
  if (!card) return;

  const editorTag = `${card.tag}-editor`;
  const isRegistered = !!customElements.get(editorTag);

  if (isRegistered) {
    try {
      editorEl = document.createElement(editorTag);
      const hass = isLive && liveHass
        ? buildLiveHass(liveHass, language, haConnection, haAuth)
        : buildMockHass(scenarioData, language); // use scenarioData so entity dropdowns are populated

      editorEl.hass = hass;
      editorEl.setConfig(activeConfig);

      editorEl.addEventListener('config-changed', (e) => {
        const newConfig = e.detail.config;

        if (window.jsyaml) {
          document.getElementById('yaml-textarea').value = jsyaml.dump(newConfig);
        }

        if (onConfigChanged) onConfigChanged(newConfig);
      });

      container.appendChild(editorEl);
      log(`🛠️ Éditeur graphique de <${card.tag}> chargé`, 'info');
    } catch (err) {
      log(`❌ Erreur chargement éditeur graphique: ${err.message}`, 'error');
      container.innerHTML = `<div class="gui-fallback-panel"><span class="gui-fallback-icon">⚠️</span><div class="gui-fallback-title">Erreur de l'éditeur</div><div class="gui-fallback-text">${err.message}</div></div>`;
    }
  } else {
    container.innerHTML = `
    <div class="gui-fallback-panel">
      <span class="gui-fallback-icon">🔷</span>
      <div class="gui-fallback-title">Éditeur graphique indisponible</div>
      <div class="gui-fallback-text">
        L'éditeur <code>&lt;${editorTag}&gt;</code> n'est pas encore enregistré.<br><br>
        Vous pouvez utiliser l'onglet <strong>Éditeur de code</strong> ci-dessus pour modifier la configuration YAML en direct.
      </div>
    </div>
  `;
  }
}

/**
 * Get the current editor element (for hass updates).
 * @returns {HTMLElement|null}
 */
export function getEditorEl() {
  return editorEl;
}
