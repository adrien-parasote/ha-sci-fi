/**
 * Workbench bundle loader (bead ha-sci-fi-kdyg): at init, setWorkMode and selectCard both
 * render before the first script onload, and each appended its own <script>; the second
 * evaluation threw on customElements.define('sf-icon').
 */
import { expect, describe, it } from 'vitest';
import { createBundleLoader } from '../../dev/modules/bundle-loader.js';

interface FakeScript { type?: string; src?: string; onload?: () => void; onerror?: () => void }

function fakeDocument() {
  const appended: FakeScript[] = [];
  const doc = {
    createElement: (): FakeScript => ({}),
    head: { appendChild: (s: FakeScript) => { appended.push(s); } },
  };
  return { doc, appended };
}

describe('workbench — bundle loader', () => {
  it('two loads before the first onload append one script and both resolve on it', async () => {
    const { doc, appended } = fakeDocument();
    const loader = createBundleLoader(doc, '../dist/sci-fi.min.js');
    const first = loader.load();
    const second = loader.load();
    expect(appended).toHaveLength(1);
    expect(appended[0]!.type).toBe('module');
    expect(appended[0]!.src).toMatch(/^\.\.\/dist\/sci-fi\.min\.js\?v=\d+$/);
    appended[0]!.onload!();
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined]);
    await loader.load();
    expect(appended, 'a loaded bundle is never appended again').toHaveLength(1);
  });

  it('reset makes the next load append a fresh script', async () => {
    const { doc, appended } = fakeDocument();
    const loader = createBundleLoader(doc, '../dist/sci-fi.min.js');
    const first = loader.load();
    appended[0]!.onload!();
    await first;
    loader.reset();
    void loader.load();
    expect(appended).toHaveLength(2);
  });

  it('a failed load rejects, and the next load tries again', async () => {
    const { doc, appended } = fakeDocument();
    const loader = createBundleLoader(doc, '../dist/sci-fi.min.js');
    const failed = loader.load();
    appended[0]!.onerror!();
    await expect(failed).rejects.toThrow('Bundle not found');
    void loader.load();
    expect(appended, 'after `npm run build`, a re-render must load the bundle').toHaveLength(2);
  });
});
