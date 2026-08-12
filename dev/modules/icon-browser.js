// ─── Icon Browser — Workbench icon picker simulator ──────────────────────────
// Dynamically reads window.customIcons.sci.getIconList() after the bundle loads.
// No hardcoded icon names — fully driven by the registered iconset.

const ICON_SIZE = 48; // px — preview size
const DEFAULT_COLOR = '#00d2ff';

/** The inline style every preview <sci-icon> carries — set at build and on every live tweak. */
function iconStyle(size, color) {
  return `--icon-width:${size}px;--icon-height:${size}px;--icon-color:${color};display:block;width:${size}px;height:${size}px`;
}

/** Static shell: header, toolbar, selection bar, and the grid the render loop fills. */
function shellTemplate() {
  return `
    <div class="ib-header">
      <h2 class="ib-title">🎨 Sci-Fi Icon Browser</h2>
      <p class="ib-subtitle">Toutes les icônes enregistrées sous le préfixe <code>sci:</code> — lecture dynamique depuis <code>window.customIcons.sci.getIconList()</code></p>
    </div>

    <div class="ib-toolbar">
      <div class="ib-search-wrap">
        <span class="ib-search-icon">🔍</span>
        <input
          class="ib-search"
          id="ib-search-input"
          type="text"
          placeholder="Rechercher une icône... ex: stove, radiator, vacuum"
          autocomplete="off"
          spellcheck="false"
        />
        <button class="ib-clear-btn" id="ib-clear-btn" title="Effacer">✕</button>
      </div>
      <div class="ib-size-wrap">
        <label class="ib-size-label">Taille</label>
        <input class="ib-size-slider" id="ib-size-slider" type="range" min="24" max="96" value="${ICON_SIZE}" step="4" />
        <span class="ib-size-val" id="ib-size-val">${ICON_SIZE}px</span>
      </div>
      <div class="ib-color-wrap">
        <label class="ib-color-label">Couleur</label>
        <input class="ib-color-picker" id="ib-color-picker" type="color" value="${DEFAULT_COLOR}" />
      </div>
      <span class="ib-count" id="ib-count">Chargement…</span>
    </div>

    <div class="ib-selected-bar" id="ib-selected-bar" style="display:none">
      <span id="ib-selected-label"></span>
      <button class="ib-copy-btn" id="ib-copy-btn" title="Copier le nom complet">📋 Copier <code id="ib-copy-code"></code></button>
    </div>

    <div class="ib-grid" id="ib-grid">
      <div class="ib-loading">⏳ Chargement du bundle…</div>
    </div>
  `;
}

/** Every element the browser drives, resolved once against the shell. */
function queryRefs(root) {
  const byId = (id) => root.querySelector(`#${id}`);
  return {
    grid: byId('ib-grid'),
    countEl: byId('ib-count'),
    searchInput: byId('ib-search-input'),
    clearBtn: byId('ib-clear-btn'),
    sizeSlider: byId('ib-size-slider'),
    sizeVal: byId('ib-size-val'),
    colorPicker: byId('ib-color-picker'),
    selectedBar: byId('ib-selected-bar'),
    selectedLabel: byId('ib-selected-label'),
    copyBtn: byId('ib-copy-btn'),
    copyCode: byId('ib-copy-code'),
  };
}

/**
 * Build one grid cell.
 *
 * The preview sits in its own Shadow Root: weather icons contain <symbol id="r1">
 * etc., and those IDs clash in the flat document DOM once 10+ weather icons
 * coexist. One shadow root per cell scopes the SVG symbol IDs. Workbench-only.
 */
function createIconCell(name, { size, color, selected }) {
  const cell = document.createElement('div');
  cell.className = 'ib-cell' + (selected ? ' selected' : '');
  cell.title = `sci:${name}`;
  cell.dataset.name = name;

  const shadowHost = document.createElement('div');
  shadowHost.style.cssText = `width:${size}px;height:${size}px;display:block;flex-shrink:0`;
  const sciIcon = document.createElement('sci-icon');
  sciIcon.setAttribute('icon', `sci:${name}`);
  sciIcon.style.cssText = iconStyle(size, color);
  shadowHost.attachShadow({ mode: 'open' }).appendChild(sciIcon);

  const label = document.createElement('span');
  label.className = 'ib-cell-name';
  label.textContent = name;

  cell.appendChild(shadowHost);
  cell.appendChild(label);
  return cell;
}

/** "No match" placeholder — the query is echoed as text, never as markup. */
function createEmptyState(query) {
  const emptyDiv = document.createElement('div');
  emptyDiv.className = 'ib-empty';
  const em = document.createElement('em');
  em.textContent = query;
  emptyDiv.append('Aucune icône pour "', em, '"');
  return emptyDiv;
}

/** Size/color live-update: patch the mounted sci-icons instead of rebuilding the grid. */
function applyCellStyles(grid, size, color) {
  grid.querySelectorAll('.ib-cell').forEach((cell) => {
    const host = cell.querySelector('div');
    if (!host || !host.shadowRoot) return;
    host.style.width = `${size}px`;
    host.style.height = `${size}px`;
    const sciIcon = host.shadowRoot.querySelector('sci-icon');
    if (sciIcon) sciIcon.style.cssText = iconStyle(size, color);
  });
}

/**
 * Wire the toolbar controls — copy, search, clear, size, colour.
 *
 * `state` is the browser's mutable view state, passed by reference so each
 * handler writes the field it owns; `render` rebuilds the grid, `updateStyles`
 * patches it in place (size and colour need no rebuild).
 */
function wireToolbar(refs, state, render, updateStyles) {
  const { searchInput, clearBtn, sizeSlider, sizeVal, colorPicker, copyBtn } = refs;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(`sci:${state.selectedName}`);
      copyBtn.textContent = '✅ Copié!';
      setTimeout(() => {
        copyBtn.innerHTML = `📋 Copier <code id="ib-copy-code">sci:${state.selectedName}</code>`;
      }, 1500);
    } catch (_) {
      copyBtn.textContent = '⚠️ Erreur';
    }
  });

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    clearBtn.style.opacity = state.query ? '1' : '0';
    render();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.query = '';
    clearBtn.style.opacity = '0';
    searchInput.focus();
    render();
  });

  sizeSlider.addEventListener('input', () => {
    state.size = parseInt(sizeSlider.value, 10);
    sizeVal.textContent = `${state.size}px`;
    updateStyles();
  });

  colorPicker.addEventListener('input', () => {
    state.color = colorPicker.value;
    updateStyles();
  });
}

/**
 * Mount the icon browser into the given DOM element.
 * Called by workbench-app after the sci-fi bundle has loaded.
 */
export async function mountIconBrowser(mount) {
  mount.innerHTML = '';

  const root = document.createElement('div');
  root.className = 'icon-browser';
  mount.appendChild(root);
  root.innerHTML = shellTemplate();

  // ── Wait for bundle + iconset registration ────────────────────────────────
  let iconList = [];
  try {
    iconList = await waitForIconList();
  } catch (e) {
    root.querySelector('#ib-grid').innerHTML =
      `<div class="ib-error">❌ Impossible de charger la liste d'icônes.<br>${e.message}</div>`;
    return;
  }

  const refs = queryRefs(root);
  const { grid, countEl, selectedBar, selectedLabel, copyCode } = refs;
  const state = { query: '', size: ICON_SIZE, color: DEFAULT_COLOR, selectedName: null };

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    const q = state.query.toLowerCase().trim();
    const filtered = q
      ? iconList.filter(({ name }) => name.toLowerCase().includes(q))
      : iconList;

    countEl.textContent = `${filtered.length} / ${iconList.length} icône${iconList.length > 1 ? 's' : ''}`;
    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.appendChild(createEmptyState(q));
      return;
    }

    filtered.forEach(({ name }) => {
      const cell = createIconCell(name, {
        size: state.size, color: state.color, selected: name === state.selectedName,
      });
      cell.addEventListener('click', () => selectIcon(name));
      grid.appendChild(cell);
    });
  }

  function selectIcon(name) {
    state.selectedName = name;
    selectedLabel.textContent = '';
    copyCode.textContent = `sci:${name}`;
    selectedBar.style.display = 'flex';
    render();

    // Auto-scroll the selected cell into view
    const sel = grid.querySelector('.ib-cell.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  const updateStyles = () => applyCellStyles(grid, state.size, state.color);

  wireToolbar(refs, state, render, updateStyles);
  render();
}

/**
 * Wait until window.customIcons.sci.getIconList is available and return the list.
 * The bundle must be loaded first — workbench-app guarantees this before calling mountIconBrowser.
 */
async function waitForIconList(maxWaitMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const sci = window.customIcons?.sci;
    if (sci && typeof sci.getIconList === 'function') {
      const list = await sci.getIconList();
      if (list && list.length > 0) return list;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('window.customIcons.sci.getIconList() non disponible après chargement du bundle.');
}
