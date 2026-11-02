// @vitest-environment happy-dom
/**
 * Icon contract — docs/specs/icon-contract/spec.md.
 * TC-ICC-U-01 to 03, 05, 06, 09 and IT-ICC-I-01 to 03.
 * `ha-icon` is deliberately never defined in this file: sf-icon reads its
 * presence at render time, so mdi: icons take the cache path (IT-ICC-I-03).
 */
import { expect, describe, it, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { html } from 'lit';

import '../../../src/components/sf-icon/sf-iconset.js';
import '../../../src/components/sf-icon/sf-icon.js';
import '../../../src/components/sf-icon/sci-icon.js';
import '../../../src/components/editor-inputs/sf-editor-dropdown-icon.js';
import { SfIcon } from '../../../src/components/sf-icon/sf-icon.js';
import { SciIcon } from '../../../src/components/sf-icon/sci-icon.js';
import { STATIC_ICON_NAMES } from '../../../src/components/sf-icon/icon-names.js';
import WEATHER_ICONS from '../../../src/components/sf-icon/data/sf-weather-icons.js';
import { clearMemCache, resolveIcon, ICON_NOT_FOUND } from '../../../src/components/sf-icon/icon-cache.js';

const src = (p: string): string => readFileSync(join(process.cwd(), 'src/components', p), 'utf8');
const WEATHER_KEYS = Object.keys(WEATHER_ICONS);
const FALLBACK_D = 'M11.5,2C6.81,2';

type IconsetFn = (n: string) => Promise<{ path: string; viewBox: string } | string>;
type Picker = {
  getIcon: (n: string) => Promise<{ path: string; viewBox: string }>;
  getIconList: () => Promise<{ name: string }[]>;
};
const iconset = (): IconsetFn => (window as any).customIconsets.sci;
const picker = (): Picker => (window as any).customIcons.sci;

async function mount<T extends HTMLElement>(tag: string, icon: string): Promise<T> {
  const el = document.createElement(tag) as T & { icon: string; updateComplete: Promise<unknown> };
  el.icon = icon;
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 10));
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('TC-ICC-U-01 FR-1 own-key lookups, static icons only', () => {
  it('TC-ICC-U-01: static names resolve to a non-empty string path on both routes', async () => {
    const names = ['stove', ...STATIC_ICON_NAMES];
    for (const name of names) {
      const a = await iconset()(name);
      expect(typeof a).toBe('object');
      const { path, viewBox } = a as { path: string; viewBox: string };
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
      expect(viewBox).toBe('0 0 24 24');
      const b = await picker().getIcon(name);
      expect(typeof b.path).toBe('string');
      expect(b.path.length).toBeGreaterThan(0);
      expect(b.viewBox).toBe('0 0 24 24');
    }
  });

  it.each(['clear-night-day', '__unknown__', 'constructor', 'toString', '__proto__', 'hasOwnProperty'])(
    'TC-ICC-U-01: %s is an unknown name (iconsets logs once, picker is silent)',
    async (name) => {
      const err = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(await iconset()(name)).toBe('');
      expect(err).toHaveBeenCalledTimes(1);
      expect(err).toHaveBeenCalledWith(`[sf-iconset] Icon "sci:${name}" not available`);
      err.mockClear();
      expect(await picker().getIcon(name)).toEqual({ path: '', viewBox: '0 0 24 24' });
      expect(err).not.toHaveBeenCalled();
    },
  );

  it('TC-ICC-U-01: a forged name logs ONE sanitised line cut at 64 characters', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    await iconset()(`a\n[sf-iconset] forged${'z'.repeat(80)}`);
    expect(err).toHaveBeenCalledTimes(1);
    const line = err.mock.calls[0]![0] as string;
    expect(line).not.toMatch(/[\r\n]/);
    expect(line).toBe(`[sf-iconset] Icon "sci:a?[sf-iconset] forged${'z'.repeat(43)}" not available`);
  });

  it('TC-ICC-U-01: sf-iconset.ts and sf-icon.ts hold no double cast through unknown', () => {
    expect(src('sf-icon/sf-iconset.ts')).not.toContain('as unknown as');
    expect(src('sf-icon/sf-icon.ts')).not.toContain('as unknown as');
  });
});

describe('TC-ICC-U-02 FR-2 picker list', () => {
  it('TC-ICC-U-02: getIconList is exactly the 28 static names, none of the weather names', async () => {
    const names = (await picker().getIconList()).map((i) => i.name);
    expect(names).toHaveLength(28);
    expect([...names].sort()).toEqual([...STATIC_ICON_NAMES].sort());
    // The retrocheck counted 33 `: svg` lines; the data file holds 46 keys (13 are multi-line).
    // The count is derived, never written down.
    expect(WEATHER_KEYS.length).toBeGreaterThan(33);
    for (const w of WEATHER_KEYS) expect(names).not.toContain(w);
    expect(names).toContain('stove');
    expect(names).toContain('landspeeder');
  });
});

describe('TC-ICC-U-03 FR-3 SciIcon shape', () => {
  it('TC-ICC-U-03: SciIcon is a thin subclass of SfIcon', () => {
    expect(SciIcon.prototype instanceof SfIcon).toBe(true);
    expect(Object.getOwnPropertyNames(SciIcon.prototype).sort()).toEqual(['constructor', 'iconClass', 'logPrefix']);
    expect(src('sf-icon/sci-icon.ts').split('\n').length).toBeLessThan(40);
    expect(customElements.get('sci-icon')).toBe(SciIcon);
  });
});

describe('TC-ICC-U-05 FR-3 class, loading state and warnings', () => {
  beforeEach(() => clearMemCache());

  it('TC-ICC-U-05: both elements render their own svg class', async () => {
    const a = await mount<SfIcon>('sf-icon', 'sci:stove');
    const b = await mount<SciIcon>('sci-icon', 'sci:stove');
    expect(a.querySelector('svg.sf-icon')).not.toBeNull();
    expect(a.querySelector('svg.sci-icon')).toBeNull();
    expect(b.querySelector('svg.sci-icon')).not.toBeNull();
    expect(b.querySelector('svg.sf-icon')).toBeNull();
  });

  it.each([
    ['sf-icon', 'sf-icon'],
    ['sci-icon', 'sci-icon'],
  ])('TC-ICC-U-05: %s renders its loading class while the MDI fetch is pending', async (tag, cls) => {
    const el = document.createElement(tag) as SfIcon;
    el.icon = 'mdi:pending-one';
    el.connection = { sendMessagePromise: () => new Promise(() => {}) };
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.querySelector(`svg.${cls}.${cls}--loading`)).not.toBeNull();
  });

  it.each([
    ['sf-icon', '[sf-icon]'],
    ['sci-icon', '[sci-icon]'],
  ])('TC-ICC-U-05: %s warns with its own prefix on an unknown namespace', async (tag, prefix) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mount(tag, 'foo:bar');
    expect(warn).toHaveBeenCalledTimes(1);
    expect((warn.mock.calls[0]![0] as string).startsWith(prefix)).toBe(true);
  });
});

describe('TC-ICC-U-06 FR-6 one registry request per connection', () => {
  beforeEach(() => clearMemCache());

  it('TC-ICC-U-06: icon-cache.ts header no longer claims a rate limiter', () => {
    const header = src('sf-icon/icon-cache.ts').split('*/')[0]!;
    expect(header.toLowerCase()).not.toContain('rate limiter');
  });

  it('TC-ICC-U-06: 10 concurrent lookups issue exactly one request', async () => {
    const names = Array.from({ length: 10 }, (_, i) => `n${i}`);
    const sendMessagePromise = vi.fn(async () => ({ resources: Object.fromEntries(names.map((n) => [n, `M${n}`])) }));
    const connection = { sendMessagePromise } as any;
    const out = await Promise.all(names.map((n) => resolveIcon(connection, `mdi:${n}`, n)));
    expect(sendMessagePromise).toHaveBeenCalledTimes(1);
    expect(out).toEqual(names.map((n) => `M${n}`));
  });

  it('TC-ICC-U-06: a rejected request is retried by the next call', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sendMessagePromise = vi
      .fn()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce({ resources: { later: 'M1' } });
    const connection = { sendMessagePromise } as any;
    expect(await resolveIcon(connection, 'mdi:later', 'later')).toBe(ICON_NOT_FOUND);
    expect(await resolveIcon(connection, 'mdi:later', 'later')).toBe('M1');
    expect(sendMessagePromise).toHaveBeenCalledTimes(2);
  });
});

describe('TC-ICC-U-09 FR-1.1 foreign window.customIcons objects are never rendered', () => {
  it('TC-ICC-U-09: a foreign template and a template-shaped object fall back', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const sci = (window as any).customIcons.sci;
    sci.evil = html`<svg><use href="#evil"></use></svg>`;
    sci.evil2 = { values: [] };
    for (const name of ['evil', 'evil2', 'constructor']) {
      const el = await mount<SfIcon>('sf-icon', `sci:${name}`);
      expect(el.querySelector('use')).toBeNull();
      expect(el.querySelector('path')!.getAttribute('d')).toContain(FALLBACK_D);
      el.remove();
    }
    delete sci.evil;
    delete sci.evil2;
  });

  it('TC-ICC-U-09: an inherited prefix (constructor:name) falls back, never Object.name', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = await mount<SfIcon>('sf-icon', 'constructor:name');
    expect(el.querySelector('path')!.getAttribute('d')).toContain(FALLBACK_D);
    el.remove();
  });

  it('TC-ICC-U-01: the mdi registry read is by own string key (constructor, __proto__)', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    clearMemCache();
    const connection = { sendMessagePromise: vi.fn(async () => ({ resources: { real: 'M1' } })) } as any;
    expect(await resolveIcon(connection, 'mdi:constructor', 'constructor')).toBe(ICON_NOT_FOUND);
    expect(await resolveIcon(connection, 'mdi:__proto__', '__proto__')).toBe(ICON_NOT_FOUND);
    expect(await resolveIcon(connection, 'mdi:real', 'real')).toBe('M1');
  });

  it('TC-ICC-U-09: a prefix holding a string (not an object) falls back', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    (window as any).customIcons.xstr = 'abc';
    const el = await mount<SfIcon>('sf-icon', 'xstr:0');
    expect(el.querySelector('path')!.getAttribute('d')).toContain(FALLBACK_D);
    el.remove();
    delete (window as any).customIcons.xstr;
  });

  it('TC-ICC-U-01: an empty or non-string registry value is not an icon', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    clearMemCache();
    const connection = { sendMessagePromise: vi.fn(async () => ({ resources: { empty: '', obj: {} } })) } as any;
    expect(await resolveIcon(connection, 'mdi:empty', 'empty')).toBe(ICON_NOT_FOUND);
    expect(await resolveIcon(connection, 'mdi:obj', 'obj')).toBe(ICON_NOT_FOUND);
  });

  it('TC-ICC-U-09: the real weather icon still renders animated', async () => {
    const el = await mount<SfIcon>('sf-icon', 'sci:clear-night-day');
    expect(el.querySelector('svg animateTransform, svg use')).not.toBeNull();
  });
});

describe('IT-ICC-I-01 real elements', () => {
  it('IT-ICC-I-01: sf-icon and sci-icon render the animated weather svg; sci-icon renders a static path', async () => {
    const a = await mount<SfIcon>('sf-icon', 'sci:clear-night-day');
    const b = await mount<SciIcon>('sci-icon', 'sci:clear-night-day');
    expect(a.querySelector('svg animateTransform, svg use')).not.toBeNull();
    expect(b.querySelector('svg animateTransform, svg use')).not.toBeNull();
    const c = await mount<SciIcon>('sci-icon', 'sci:stove');
    expect(c.querySelector('svg.sci-icon > path')).not.toBeNull();
  });
});

describe('IT-ICC-I-02 picker path as HA drives it', () => {
  it('IT-ICC-I-02: 28 listed entries resolve; the dropdown sci: options equal STATIC_ICON_NAMES', async () => {
    const list = await picker().getIconList();
    expect(list).toHaveLength(28);
    for (const { name } of list) {
      const r = await picker().getIcon(name);
      expect(typeof r.path).toBe('string');
      expect(r.path.length).toBeGreaterThan(0);
    }
    const dd = document.createElement('sf-editor-dropdown-icon') as any;
    document.body.appendChild(dd);
    await dd.updateComplete;
    const sci = (dd.items as string[]).filter((i) => i.startsWith('sci:'));
    expect([...sci].sort()).toEqual(STATIC_ICON_NAMES.map((n) => `sci:${n}`).sort());
  });
});

describe('IT-ICC-I-03 shared registry request through the elements', () => {
  beforeEach(() => clearMemCache());

  it('IT-ICC-I-03: two sf-icon mdi elements on one connection send one request and render paths', async () => {
    const sendMessagePromise = vi.fn(async () => ({ resources: { alpha: 'MA', beta: 'MB' } }));
    const connection = { sendMessagePromise } as any;
    const mk = async (name: string): Promise<SfIcon> => {
      const el = document.createElement('sf-icon') as SfIcon;
      el.icon = `mdi:${name}`;
      el.connection = connection;
      document.body.appendChild(el);
      return el;
    };
    const els = await Promise.all([mk('alpha'), mk('beta')]);
    await new Promise((r) => setTimeout(r, 30));
    await Promise.all(els.map((e) => e.updateComplete));
    expect(sendMessagePromise).toHaveBeenCalledTimes(1);
    expect(els.map((e) => e.querySelector('path')!.getAttribute('d'))).toEqual(['MA', 'MB']);
  });
});
