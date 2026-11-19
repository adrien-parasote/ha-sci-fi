// ─── Reload state ────────────────────────────────────────────────────────────
// « ↺ Recharger carte » reloads the whole page: a page can evaluate the card bundle only once
// (customElements.define refuses a name already defined). The selected card, scenario and the
// config being edited are carried across that one reload, then forgotten, so a manual reload
// starts on the defaults.

const KEY = 'wb-reload';

/**
 * @param {Pick<Storage, 'setItem'>} storage
 * @param {{ card: string, scenario: string | null, config?: object | null }} state
 */
export function saveReloadState(storage, state) {
  storage.setItem(KEY, JSON.stringify(state));
}

/**
 * The saved state, removed as it is read; null when none was saved or it is not an object
 * (a hand-edited or stale value falls back to the workbench defaults).
 * @param {Pick<Storage, 'getItem' | 'removeItem'>} storage
 * @returns {{ card?: unknown, scenario?: unknown, config?: unknown } | null}
 */
export function takeReloadState(storage) {
  const raw = storage.getItem(KEY);
  storage.removeItem(KEY);
  if (raw === null) return null;
  let value;
  try {
    value = JSON.parse(raw);
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err;
    return null;
  }
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

/**
 * Saves the state, then navigates to the workbench document itself. `location.reload()` would
 * reload whatever URL the tab shows, and a hexa tile link moves it (pushState to `/dev/lights`,
 * a 404 under the dev server); `path` is the workbench path recorded before any navigation.
 * @param {Pick<Location, 'replace'>} loc
 * @param {Pick<Storage, 'setItem'>} storage
 * @param {string} path
 * @param {{ card: string, scenario: string | null, config?: object | null }} state
 */
export function reloadWorkbench(loc, storage, path, state) {
  saveReloadState(storage, state);
  loc.replace(path);
}

/**
 * What the workbench opens on after a reload. Only own registry keys are trusted, so a stale
 * or hand-edited state (or a prototype name such as `__proto__`) falls back to `fallback`.
 * The scenario and config are kept only with the card they were saved for.
 * @param {{ card?: unknown, scenario?: unknown, config?: unknown } | null} state
 * @param {Record<string, { scenarios?: Record<string, unknown>, type?: string }>} cards
 * @param {string} fallback
 * @returns {{ card: string, scenario: string | undefined, config: object | null }}
 */
export function restoreSelection(state, cards, fallback) {
  const restored = typeof state?.card === 'string' && Object.hasOwn(cards, state.card);
  if (!restored) return { card: fallback, scenario: undefined, config: null };
  const card = /** @type {string} */ (state.card);
  const scenarios = cards[card].scenarios ?? {};
  const scenario = typeof state.scenario === 'string' && Object.hasOwn(scenarios, state.scenario)
    ? state.scenario
    : undefined;
  const config = state.config !== null && typeof state.config === 'object' && !Array.isArray(state.config)
    ? state.config
    : null;
  return { card, scenario, config };
}
