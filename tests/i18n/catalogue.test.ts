// The French catalogue follows the code (spec i18n-hardcoded-fr FR-9, FR-10).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listSourceFiles, msgSourcesOf } from './french-literals.js';
import { templates } from '../../src/locales/locales/fr.js';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/** The 33 sources this lot adds; each must be translated (target differs from source). */
const NEW_SOURCES = [
  'Mode applied', 'No lights configured for this floor', 'Lights', 'Turn all off', 'Turn all on',
  'Turn this floor off', 'Turn this floor on', 'Select a room', 'Turn the room off', 'Turn the room on',
  'No lights', 'Light turned off', 'Light turned on', 'Room turned off', 'Room turned on',
  'Floor turned off', 'Floor turned on', 'All turned off', 'All turned on',
  '⚠️ Weather alert: ${label}', 'Hey, Welcome Back!', 'Weather entity not found',
  'Volume entity', 'Application entity', 'Button ${actionId}',
  'Action type (e.g. call-service, navigate, none)', 'Service (e.g. media_player.play_media)',
  'Entity ID (data.entity_id)', 'Navigation path', 'Source name', 'Remove source', 'Add source', 'My vehicle',
];
/** The 7 census sources whose French already existed: exempt from the target-differs rule. */
const REUSED_SOURCES = [
  'No floor configured', 'Temperature changed', 'HVAC mode changed', 'Preset changed',
  'Weather', 'Custom actions', 'Action',
];

interface Unit { id: string; source: string; target: string }

const unescapeXml = (s: string) =>
  s.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&amp;', '&');
/** `<x id="0" equiv-text="${label}"/>` read as `${label}`. */
const flat = (s: string) => unescapeXml(s.replace(/<x id="\d+" equiv-text="([^"]*)"\/>/g, (_m, e: string) => unescapeXml(e)));
const placeholders = (s: string) => [...s.matchAll(/<x id="(\d+)" equiv-text="([^"]*)"\/>/g)].map((m) => `${m[1]}:${m[2]}`);

function units(): Unit[] {
  const xlf = read('xliff/fr.xlf');
  return [...xlf.matchAll(/<trans-unit id="([^"]+)">\s*<source>([\s\S]*?)<\/source>\s*(?:<target>([\s\S]*?)<\/target>)?\s*<\/trans-unit>/g)]
    .map((m) => ({ id: m[1]!, source: m[2]!, target: m[3] ?? '' }));
}
const bySource = (us: Unit[]) => new Map(us.map((u) => [flat(u.source), u]));

describe('fr.xlf and fr.js carry every census source (FR-9)', () => {
  const us = units();
  const index = bySource(us);

  it('TC-I18N-U-11 the 40 census sources are msg() sources of src/, translated, and built into fr.js', () => {
    const inSrc = new Set(listSourceFiles(ROOT).flatMap((f) => msgSourcesOf(read(f), f)));
    for (const s of [...NEW_SOURCES, ...REUSED_SOURCES]) {
      expect(inSrc.has(s), `msg() source in src/: ${s}`).toBe(true);
      const u = index.get(s);
      expect(u, `trans-unit for: ${s}`).toBeDefined();
      expect(u!.target.trim(), `non-empty target for: ${s}`).not.toBe('');
      expect(Object.keys(templates), `fr.js template for: ${s}`).toContain(u!.id);
    }
    for (const s of NEW_SOURCES) {
      expect(flat(index.get(s)!.target), `target differs from source: ${s}`).not.toBe(s);
    }
    expect(NEW_SOURCES).toHaveLength(33);
    expect(REUSED_SOURCES).toHaveLength(7);
    expect(index.get('Entity ID (data.entity_id)')!.target).toBe("ID d'entité (data.entity_id)");
  });

  it('TC-I18N-U-11 one trans-unit per unique msg() source of src/, and nothing else counted', () => {
    const inSrc = new Set(listSourceFiles(ROOT).flatMap((f) => msgSourcesOf(read(f), f)));
    expect(us.length).toBe(inSrc.size);
    expect(Object.keys(templates).length).toBe(us.length);
  });

  it('TC-I18N-U-18 targets repeat their source placeholders and never hold a literal ${', () => {
    for (const s of ['⚠️ Weather alert: ${label}', 'Button ${actionId}']) {
      expect(index.has(s), s).toBe(true);
    }
    const withSlots = us.filter((u) => u.source.includes('<x '));
    expect(withSlots.length).toBeGreaterThan(0);
    for (const u of withSlots) {
      expect(placeholders(u.target).sort(), flat(u.source)).toEqual(placeholders(u.source).sort());
      expect(u.target.replace(/equiv-text="[^"]*"/g, ''), flat(u.source)).not.toContain('${');
    }
  });
});

describe('the three amended specs (FR-10)', () => {
  it('TC-I18N-U-13 lights.md, hexa-tiles.md and the IT-901 row say what the lot made true', () => {
    const lights = read('docs/specs/cards/lights.md');
    const section = lights.split(/^## Localization\s*$/m)[1];
    expect(section, 'lights.md has a ## Localization heading').toBeDefined();
    expect(section).toContain('Lights');
    expect(section).toContain('Select a room');

    const hexa = read('docs/specs/cards/hexa-tiles.md').split('\n');
    const french = hexa.filter((l) => l.includes('Alerte météo : canicule'));
    expect(french).toHaveLength(1);
    expect(french[0]).toContain('**Result:**');
    expect(french[0]).toContain('Weather alert: canicule');

    const row = read('docs/specs/09_workbench_editor_i18n.md').split('\n').find((l) => l.startsWith('| IT-901 |'));
    expect(row, 'IT-901 row').toBeDefined();
    expect(row).not.toContain('Plafond');
    expect(row).toContain('Lights');
    expect(row).toContain('IT-I18N-I-01');
  });
});
