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

  it('test_O3_smil_syncbases_still_name_an_own_id_so_animations_loop', async () => {
    for (const name of ['sf:lightning-day', 'sf:pouring-day', 'sf:hail-day']) {
      const host = document.createElement('div');
      document.body.appendChild(host);
      const icons = [name, name].map(n => {
        const el = document.createElement('sf-icon') as SfIcon;
        el.icon = n;
        host.appendChild(el);
        return el;
      });
      await settle();
      await Promise.all(icons.map(el => el.updateComplete));
      for (const el of icons) {
        const own = new Set(Array.from(el.querySelectorAll('[id]')).map(e => e.id));
        const syncbases: string[] = [];
        for (const node of Array.from(el.querySelectorAll('[begin], [end]'))) {
          for (const attrName of ['begin', 'end']) {
            for (const item of (node.getAttribute(attrName) ?? '').split(';')) {
              const m = /^\s*([^\s.;+-][^\s.;+]*)\.(begin|end|repeat\()/.exec(item);
              if (m) syncbases.push(m[1]!);
            }
          }
        }
        expect(syncbases.length, `${name} carries SMIL syncbases`).toBeGreaterThan(0);
        for (const ref of syncbases) expect(own.has(ref), `${name}: ${ref}.end not in its own icon`).toBe(true);
      }
      host.remove();
    }
  });

  it('test_O3_scoping_is_idempotent_on_rerender', async () => {
    const el = document.createElement('sf-icon') as SfIcon;
    el.icon = 'sf:lightning-day';
    document.body.appendChild(el);
    await settle();
    await el.updateComplete;
    const before = Array.from(el.querySelectorAll('[begin]')).map(n => n.getAttribute('begin'));
    el.requestUpdate();
    await el.updateComplete;
    const after = Array.from(el.querySelectorAll('[begin]')).map(n => n.getAttribute('begin'));
    expect(after).toEqual(before);
  });
});
