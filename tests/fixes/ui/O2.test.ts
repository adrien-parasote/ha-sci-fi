/** Fix lot ui, O2 (bead ha-sci-fi-rskp.2 / ha-sci-fi-8fb): the user-visible English literals go through msg() and are translated. */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const read = (p: string): string => readFileSync(ROOT + p, 'utf8');

const SITES: ReadonlyArray<readonly [string, string, string]> = [
  ['src/cards/hexa-tiles/sci-fi-hexa-tiles.ts', "'User'", 'User'],
  ['src/cards/climates/sf-radiator.ts', "'Radiator'", 'Radiator'],
  ['src/cards/climates/sf-radiator.ts', "'Preset'", 'Preset'],
  ['src/cards/climates/sf-radiator.ts', "'Mode'", 'Mode'],
  ['src/cards/water/sci-fi-water-management.ts', "'Unknown'", 'Unknown'],
  ['src/cards/tv/sci-fi-tv-editor.ts', "'No config'", 'No config'],
  ['src/utils/base-editor.ts', "'No config'", 'No config'],
  ['src/cards/tv/sci-fi-tv.ts', "'Remote command failed'", 'Remote command failed'],
];

describe('O2', () => {
  it('test_O2_english_literals_go_through_msg_and_are_translated', () => {
    const xliff = read('xliff/fr.xlf');
    for (const [file, literal, source] of SITES) {
      const src = read(file);
      const bare = src.split('\n').filter(l => l.includes(literal) && !l.includes(`msg(${literal})`));
      expect(bare, `${file}: ${literal} outside msg()`).toEqual([]);
      expect(src, `${file}: msg(${literal})`).toContain(`msg(${literal})`);
      const unit = new RegExp(`<source>${source}</source>\\s*<target>[^<]+</target>`);
      expect(xliff, `fr target for ${source}`).toMatch(unit);
    }
    const radiator = read('src/cards/climates/sf-radiator.ts');
    expect(radiator).not.toMatch(/title="(preset|mode)"/);
  });
});
