// @vitest-environment happy-dom
/** Fix lot ui, O3 (bead ha-sci-fi-rskp.3 / ha-sci-fi-rq0): two weather icons in one light DOM never share an SVG id. */
import { describe, it, expect, afterEach } from 'vitest';
import '../../../src/components/sf-icon/sf-icon.js';
import type { SfIcon } from '../../../src/components/sf-icon/sf-icon.js';

const settle = (): Promise<void> => new Promise(r => setTimeout(r, 50));

afterEach(() => { document.body.innerHTML = ''; });

describe('O3', () => {
  it('test_O3_two_weather_icons_have_unique_ids_and_local_references', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const icons = ['sf:lightning-day', 'sf:lightning-day'].map(name => {
      const el = document.createElement('sf-icon') as SfIcon;
      el.icon = name;
      host.appendChild(el);
      return el;
    });
    await settle();
    await Promise.all(icons.map(el => el.updateComplete));

    const ids = Array.from(host.querySelectorAll('[id]')).map(e => e.id);
    expect(ids.length).toBeGreaterThan(2);
    expect(new Set(ids).size, 'duplicate SVG id in one light DOM').toBe(ids.length);

    // every local reference of an icon resolves inside that same icon
    for (const el of icons) {
      const own = new Set(Array.from(el.querySelectorAll('[id]')).map(e => e.id));
      const refs: string[] = [];
      for (const node of Array.from(el.querySelectorAll('*'))) {
        for (const attr of Array.from(node.attributes)) {
          if (attr.localName === 'href' && attr.value.startsWith('#')) refs.push(attr.value.slice(1));
          for (const m of attr.value.matchAll(/url\(#([^)]+)\)/g)) refs.push(m[1]!);
        }
      }
      expect(refs.length).toBeGreaterThan(0);
      for (const ref of refs) expect(own.has(ref), `#${ref} not in its own icon`).toBe(true);
    }
  });
});
