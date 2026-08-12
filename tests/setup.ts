 
// happy-dom ships no Storage implementation, and the dev/ workbench modules read
// localStorage at import time (view mode, edit tab, language). Minimal in-memory
// shim, installed only when the environment provides none.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  const shim: Storage = {
    get length() { return store.size; },
    clear: () => store.clear(),
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    key: (i: number) => [...store.keys()][i] ?? null,
    removeItem: (k: string) => { store.delete(k); },
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: shim, configurable: true });
}

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('Lit is in dev mode')) return;
    if (args[0].includes('[sf-icon]')) return;
  }
  originalWarn(...args);
};
