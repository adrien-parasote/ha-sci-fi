// @vitest-environment happy-dom
import { expect, describe, it, afterEach } from 'vitest';
import { CSSResult } from 'lit';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hexaTilesStyles } from '../../../src/cards/hexa-tiles/styles.js';
import '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import type { SciFiHexaTilesCard } from '../../../src/cards/hexa-tiles/sci-fi-hexa-tiles.js';
import { makeMockHass, makeMockEntity } from '../../fixtures/mock-hass.js';

describe('hexa-tiles styles', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // Mutant: the export becomes an empty `css```, or a class of the sheet is renamed
  // (the card keeps rendering the old one).
  it('TC-BTG-U-24: the sheet is a non-empty CSSResult styling the classes the card renders', async () => {
    const el = document.createElement('sci-fi-hexa-tiles') as SciFiHexaTilesCard;
    el.setConfig({
      type: 'custom:sci-fi-hexa-tiles',
      tiles: [{ entity: 'switch.t1', name: 'Tile 1' }],
    } as unknown as any);
    el.hass = makeMockHass({
      states: { 'switch.t1': makeMockEntity({ entity_id: 'switch.t1', state: 'on' }) },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    // Class names read from the rendered card, never typed from memory: every grid
    // class the tiles render (the `hexa-` family), so renaming `.hexa-row` or
    // `.hexa-tile` in the sheet alone turns this red. The header classes
    // (avatar, status-badge...) come first in the DOM and would hide that.
    const classes = Array.from(new Set(Array.from(el.shadowRoot!.querySelectorAll('[class]')).flatMap(n => Array.from(n.classList)))).filter(c => c.startsWith('hexa-'));
    expect(classes.length, 'the card must render its hexa grid classes').toBeGreaterThanOrEqual(2);

    expect(hexaTilesStyles).toBeInstanceOf(CSSResult);
    const cssText = hexaTilesStyles.cssText;
    expect(cssText.replace(/\s/g, '')).not.toBe('');
    expect(cssText).toContain(':host');
    for (const cls of classes) {
      expect(cssText, `.${cls} must be styled by the sheet`).toMatch(new RegExp(`\\.${cls}(?![\\w-])`));
    }
  });
});

// ─── Quick actions (docs/specs/hexa-tiles-quick-actions/spec.md FR-10, FR-13, FR-14) ──

// Repository-relative: vitest runs from the repository root (import.meta.url is not a file: URL under happy-dom).
const read = (rel: string): string => readFileSync(join(process.cwd(), rel), 'utf8');

/** Bodies of every rule whose selector list contains `needle` (top level and inside @media). */
function bodiesOf(css: string, needle: string): string {
  const out: string[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  for (let m = re.exec(css); m; m = re.exec(css)) {
    if (m[1]!.includes(needle)) out.push(m[2]!);
  }
  return out.join('\n');
}

describe('hexa-tiles quick-actions styles and catalogues', () => {
  it('TC-HQA-U-13: the sheet styles state colour, error, pending (with its reduced-motion form), subtitle, mark, live region and touch selection', () => {
    const css = read('src/cards/hexa-tiles/styles.ts');
    // Pending / moving: a blink between the state colour and light blue (--sf-primary), user ask 2026-11-19.
    const keyframes = (name: string) => {
      const m = new RegExp(`@keyframes ${name}\\s*\\{((?:[^{}]*\\{[^{}]*\\})*)[^{}]*\\}`).exec(css);
      expect(m, `@keyframes ${name}`).not.toBeNull();
      return m![1]!;
    };
    const border = keyframes('sf-hexa-pending');
    expect(border).toMatch(/stroke:\s*var\(--sf-primary/);
    expect(border, 'the blink is a colour, never the faint opacity pulse').not.toMatch(/opacity/);
    expect(css).toMatch(/\[data-pending="true"\] \.hexa-border\s*\{[^}]*animation:\s*sf-hexa-pending\s+1s[^}]*alternate[^}]*infinite/);
    expect(keyframes('sf-hexa-pending-icon')).toMatch(/--icon-color:\s*var\(--sf-primary/);
    expect(css).toMatch(/\[data-pending="true"\] \.hexa-content sf-icon:not\(\.tile-mark\)\s*\{[^}]*animation:\s*sf-hexa-pending-icon\s+2s[^}]*infinite/);
    expect(css, 'a mark (error, no change) never blinks').not.toMatch(/\[data-pending="true"\][^{]*sf-icon\.tile-mark/);
    const reduced = css.slice(css.indexOf('prefers-reduced-motion: reduce'));
    expect(css).toContain('prefers-reduced-motion: reduce');
    const reducedBorder = /\[data-pending="true"\] \.hexa-border\s*\{([^}]*)\}/.exec(reduced)![1]!;
    expect(reducedBorder).toMatch(/animation:\s*none/);
    expect(reducedBorder).toMatch(/stroke:\s*var\(--sf-primary/);
    expect(reducedBorder).toContain('stroke-dasharray');
    expect(reduced).toMatch(/\[data-pending="true"\] \.hexa-content sf-icon:not\(\.tile-mark\)\s*\{[^}]*animation:\s*none/);
    expect(bodiesOf(css, '[data-state-color="true"]')).toContain('var(--sf-tile-state-color)');
    for (const part of ['.hexa-border', 'sf-icon', '.tile-label', '.tile-subtitle']) {
      expect(css, `state colour reaches ${part}`).toMatch(new RegExp(`\\[data-state-color="true"\\][^{]*${part.replace('.', '\\.')}`));
      expect(css, `error colour reaches ${part}`).toMatch(new RegExp(`\\[data-error="true"\\][^{]*${part.replace('.', '\\.')}`));
    }
    expect(bodiesOf(css, '[data-error="true"]')).toContain('var(--sf-error)');
    const subtitle = bodiesOf(css, '.tile-subtitle');
    expect(subtitle).toContain('white-space: nowrap');
    expect(subtitle).toContain('text-overflow: ellipsis');
    expect(bodiesOf(css, '.tile-mark')).not.toBe('');
    const live = bodiesOf(css, '.sf-live');
    for (const decl of ['position: absolute', 'width: 1px', 'height: 1px', 'overflow: hidden', 'clip-path: inset(50%)']) {
      expect(live, decl).toContain(decl);
    }
    const tileRule = css.match(/\n\s*\.hexa-tile\s*\{([^}]*)\}/);
    expect(tileRule, 'a bare .hexa-tile rule').not.toBeNull();
    expect(tileRule![1]).toContain('-webkit-touch-callout: none');
    expect(tileRule![1]).toContain('user-select: none');
  });

  const STRINGS: Array<[string, string]> = [
    ['Pending', 'En cours'],
    ['No change', 'Sans effet'],
    ['Subtitle', 'Sous-titre'],
    ['Pending timeout (s)', "Délai d'attente (s)"],
    ['Tap action', 'Action au toucher'],
    ['Hold action', "Action à l'appui long"],
    ['Double tap action', 'Action au double toucher'],
    ['Color', 'Couleur'],
    ['Label', 'Libellé'],
    ['Add state', 'Ajouter un état'],
    ['Current state', 'État actuel'],
    ['A double tap action delays every tap by 250 ms', 'Une action au double toucher retarde chaque toucher de 250 ms'],
  ];

  it('TC-HQA-U-16: each new string has one fr.xlf unit and one fr.js entry with its translation', () => {
    const xlf = read('xliff/fr.xlf');
    const js = read('src/locales/locales/fr.js');
    const esc = (t: string): string => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const [source, target] of STRINGS) {
      const units = [...xlf.matchAll(new RegExp(`<trans-unit id="(s[0-9a-f]+)">\\s*<source>${esc(source)}</source>\\s*<target>([^<]*)</target>`, 'g'))];
      expect(units, `one unit for "${source}"`).toHaveLength(1);
      expect(units[0]![2], `fr target of "${source}"`).toBe(target);
      expect(js, `fr.js entry of "${source}"`).toContain(`'${units[0]![1]}': \`${target}\``);
    }
  });

  it('TC-HQA-U-16: hexa-tiles.md documents the quick actions', () => {
    const md = read('docs/specs/cards/hexa-tiles.md');
    for (const marker of ['states?:', 'subtitle?:', 'pending_timeout?:', '## Quick actions', 'F-HEX-09', 'F-HEX-10', 'F-HEX-11', 'F-HEX-12', 'cover.portail']) {
      expect(md, marker).toContain(marker);
    }
  });
});
