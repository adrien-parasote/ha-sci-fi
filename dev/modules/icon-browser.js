// ─── Icon Browser — Workbench icon picker simulator ──────────────────────────
// Dynamically reads window.customIcons.sci.getIconList() after the bundle loads.
// No hardcoded icon names — fully driven by the registered iconset.

const ICON_SIZE = 48; // px — preview size

/**
 * Mount the icon browser into the given DOM element.
 * Called by workbench-app after the sci-fi bundle has loaded.
 */
export async function mountIconBrowser(mount) {
  mount.innerHTML = '';

  const root = document.createElement('div');
  root.className = 'icon-browser';
  mount.appendChild(root);

  // ── Header ────────────────────────────────────────────────────────────────
  root.innerHTML = `
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
        <input class="ib-color-picker" id="ib-color-picker" type="color" value="#00d2ff" />
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

  // ── Wait for bundle + iconset registration ────────────────────────────────
  let iconList = [];
  try {
    iconList = await waitForIconList();
  } catch (e) {
    root.querySelector('#ib-grid').innerHTML =
      `<div class="ib-error">❌ Impossible de charger la liste d'icônes.<br>${e.message}</div>`;
    return;
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let query = '';
  let size = ICON_SIZE;
  let color = '#00d2ff';
  let selectedName = null;

  const grid = root.querySelector('#ib-grid');
  const countEl = root.querySelector('#ib-count');
  const searchInput = root.querySelector('#ib-search-input');
  const clearBtn = root.querySelector('#ib-clear-btn');
  const sizeSlider = root.querySelector('#ib-size-slider');
  const sizeVal = root.querySelector('#ib-size-val');
  const colorPicker = root.querySelector('#ib-color-picker');
  const selectedBar = root.querySelector('#ib-selected-bar');
  const selectedLabel = root.querySelector('#ib-selected-label');
  const copyBtn = root.querySelector('#ib-copy-btn');
  const copyCode = root.querySelector('#ib-copy-code');

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? iconList.filter(({ name }) => name.toLowerCase().includes(q))
      : iconList;

    countEl.textContent = `${filtered.length} / ${iconList.length} icône${iconList.length > 1 ? 's' : ''}`;
    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="ib-empty">Aucune icône pour "<em>${q}</em>"</div>`;
      return;
    }

    filtered.forEach(({ name }) => {
      const cell = document.createElement('div');
      cell.className = 'ib-cell' + (name === selectedName ? ' selected' : '');
      cell.title = `sci:${name}`;
      cell.dataset.name = name;

      // ── Icon preview — isolated Shadow Root per cell ──────────────────────
      // Weather icons contain <symbol id="r1"> etc. — IDs clash in the flat
      // document DOM when 10+ weather icons coexist. Each cell gets its own
      // shadow root so SVG symbol IDs are fully scoped. Workbench-only.
      const shadowHost = document.createElement('div');
      shadowHost.style.cssText = `width:${size}px;height:${size}px;display:block;flex-shrink:0`;
      const shadow = shadowHost.attachShadow({ mode: 'open' });
      const sciIcon = document.createElement('sci-icon');
      sciIcon.setAttribute('icon', `sci:${name}`);
      sciIcon.style.cssText = `--icon-width:${size}px;--icon-height:${size}px;--icon-color:${color};display:block;width:${size}px;height:${size}px`;
      shadow.appendChild(sciIcon);

      const label = document.createElement('span');
      label.className = 'ib-cell-name';
      label.textContent = name;

      cell.appendChild(shadowHost);
      cell.appendChild(label);
      cell.addEventListener('click', () => selectIcon(name));
      grid.appendChild(cell);
    });
  }

  function selectIcon(name) {
    selectedName = name;
    const fullName = `sci:${name}`;
    selectedLabel.textContent = '';
    copyCode.textContent = fullName;
    selectedBar.style.display = 'flex';
    render();

    // Auto-scroll the selected cell into view
    const sel = grid.querySelector('.ib-cell.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ── Copy to clipboard ────────────────────────────────────────────────────
  copyBtn.addEventListener('click', async () => {
    const text = `sci:${selectedName}`;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = '✅ Copié!';
      setTimeout(() => {
        copyBtn.innerHTML = `📋 Copier <code id="ib-copy-code">sci:${selectedName}</code>`;
      }, 1500);
    } catch (_) {
      copyBtn.textContent = '⚠️ Erreur';
    }
  });

  // ── Search ────────────────────────────────────────────────────────────────
  searchInput.addEventListener('input', () => {
    query = searchInput.value;
    clearBtn.style.opacity = query ? '1' : '0';
    render();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    query = '';
    clearBtn.style.opacity = '0';
    searchInput.focus();
    render();
  });

  // ── Size slider ──────────────────────────────────────────────────────────
  sizeSlider.addEventListener('input', () => {
    size = parseInt(sizeSlider.value, 10);
    sizeVal.textContent = `${size}px`;
    updateStyles();
  });

  // ── Color picker ─────────────────────────────────────────────────────────
  colorPicker.addEventListener('input', () => {
    color = colorPicker.value;
    updateStyles();
  });

  // ── Initial render ────────────────────────────────────────────────────────
  render();

  // ── Size/color live-update: patch existing sci-icons without full rebuild ─
  function updateStyles() {
    grid.querySelectorAll('.ib-cell').forEach((cell) => {
      const host = cell.querySelector('div');
      if (!host || !host.shadowRoot) return;
      host.style.width = `${size}px`;
      host.style.height = `${size}px`;
      const sciIcon = host.shadowRoot.querySelector('sci-icon');
      if (sciIcon) {
        sciIcon.style.cssText = `--icon-width:${size}px;--icon-height:${size}px;--icon-color:${color};display:block;width:${size}px;height:${size}px`;
      }
    });
  }
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
