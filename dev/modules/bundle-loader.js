// ─── Bundle loader ───────────────────────────────────────────────────────────
// Loads the card bundle with one <script type="module">. Callers that ask while a load is in
// flight share it: at init, setWorkMode and selectCard both render before the first onload,
// and a second <script> re-evaluates the bundle, which throws on the first
// customElements.define (sf-icon). A failed load is forgotten so the next render retries.

/**
 * @param {Pick<Document, 'createElement' | 'head'>} doc
 * @param {string} src bundle URL; a cache-busting `?v=<timestamp>` is appended per load
 * @param {{ onLoad?: () => void, onError?: () => void }} [hooks]
 */
export function createBundleLoader(doc, src, { onLoad, onError } = {}) {
  let pending = null;
  return {
    load() {
      pending ??= new Promise((resolve, reject) => {
        const s = doc.createElement('script');
        s.type = 'module';
        s.src = src + '?v=' + Date.now();
        s.onload = () => {
          onLoad?.();
          resolve();
        };
        s.onerror = () => {
          pending = null;
          onError?.();
          reject(new Error('Bundle not found'));
        };
        doc.head.appendChild(s);
      });
      return pending;
    },
    /** Forget the loaded bundle: the next load appends a fresh script. */
    reset() {
      pending = null;
    },
  };
}
