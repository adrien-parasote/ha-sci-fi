/**
 * Regression tests of the fix lot `palette` (docs/fixes/palette/lot.json): each
 * card settles its undeclared `--sf-*` names and its drifting fallbacks, with no
 * allow-list entry left to excuse them.
 */

import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { canonicalValues, findDrift, findUndeclared, loadSources, makeIncludesCommonStyles, scan } from './token-scan.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sources = loadSources(join(ROOT, 'src'), ROOT);
const real = scan(sources);
const common = sources.find((s) => s.path === 'src/styles/common.ts')!;
const canon = canonicalValues(common.text);
const drift = findDrift(real, { canon, includes: makeIncludesCommonStyles(sources) });
const text = (p: string): string => sources.find((s) => s.path === p)!.text;

/** Undeclared `--sf-*` reads under a path prefix, with no allow-list to excuse them. */
const undeclaredUnder = (prefix: string): string[] => findUndeclared(real, {}, {}).filter((v) => v.includes(` at ${prefix}`));
const driftUnder = (prefix: string): string[] => [...drift.keys()].filter((k) => k.startsWith(prefix));
/** The value a stylesheet declares for a custom property (`--name: value;`). */
const declared = (p: string, name: string): string | undefined =>
  new RegExp(`^\\s*${name}\\s*:\\s*([^;]+);`, 'm').exec(text(p))?.[1]?.trim();

describe('fix lot palette', () => {
  it('test_O1_vacuum_fallbacks_match_common', () => {
    expect(driftUnder('src/cards/vacuum/')).toEqual([]);
    expect(text('src/cards/vacuum/styles.ts')).not.toMatch(/var\(--sf-bg,\s*black\)/);
  });

  it('test_O2_tv_reads_only_declared_sf_tokens', () => {
    expect(undeclaredUnder('src/cards/tv/')).toEqual([]);
    // declared at the value of their former fallback, so the render is unchanged
    const tv = 'src/cards/tv/style.ts';
    expect(declared(tv, '--sf-glow-navy')).toBe('hsl(230, 40%, 15%)');
    expect(declared(tv, '--sf-glow-red')).toBe('hsl(0, 100%, 50%)');
    expect(declared(tv, '--sf-glow-cyan-active')).toBe('hsl(190, 100%, 70%)');
    expect(declared(tv, '--sf-bg-active')).toBe('hsl(240, 30%, 15%)');
    expect(declared(tv, '--sf-telemetry-border')).toBe('rgba(0, 210, 255, 0.2)');
  });

  it('test_O3_hexa_tiles_tokens_declared_and_fallbacks_canonical', () => {
    expect(undeclaredUnder('src/cards/hexa-tiles/')).toEqual([]);
    expect(driftUnder('src/cards/hexa-tiles/')).toEqual([]);
  });

  it('test_O4_weather_reads_no_phantom_ha_variable', () => {
    const weather = text('src/cards/weather/styles.ts');
    expect(weather).not.toMatch(/--(primary|secondary)-bg-color/);
    // the literals the phantom variables resolved to are kept
    expect(weather).toContain('background-color: #1a2332;');
    expect(weather).toContain('background-color: rgba(255,255,255,0.1);');
  });

  it('test_O5_climates_season_tokens_declared', () => {
    expect(undeclaredUnder('src/cards/climates/')).toEqual([]);
    const climates = 'src/cards/climates/styles.ts';
    expect(declared(climates, '--sf-season-blue')).toBe('#acd5f3');
    expect(declared(climates, '--sf-season-green')).toBe('#ace1af');
    expect(declared(climates, '--sf-season-yellow')).toBe('#fdda0d');
    expect(declared(climates, '--sf-season-orange')).toBe('#f47b20');
  });

  it('test_O6_water_font_tokens_declared', () => {
    expect(undeclaredUnder('src/cards/water/')).toEqual([]);
    expect(declared('src/cards/water/styles.ts', '--sf-font-mono')).toBe('monospace');
  });

  it('test_O7_stove_fallbacks_canonical_and_no_phantom', () => {
    expect(driftUnder('src/cards/stove/')).toEqual([]);
    expect(text('src/cards/stove/styles.ts')).not.toMatch(/--secondary-bg-color/);
    expect(declared('src/cards/stove/styles.ts', '--title-color')).toBe('#7ca8c9');
  });

  it('test_O8_bridge_tokens_declared_and_fallbacks_canonical', () => {
    expect(undeclaredUnder('src/cards/bridge/')).toEqual([]);
    expect(driftUnder('src/cards/bridge/')).toEqual([]);
  });

  it('test_O9_hexa_tiles_sf_error_read_without_dead_fallback', () => {
    expect(text('src/cards/hexa-tiles/styles.ts')).not.toMatch(/var\(--sf-error,/);
  });

  it('test_O11_font_size_tokens_are_px', () => {
    const value = (name: string): string => [...canon.get(name)!][0]!;
    expect(value('--sf-font-size-sm')).toBe('12px');
    expect(value('--sf-font-size-base')).toBe('14px');
    expect(value('--sf-font-size-lg')).toBe('16px');
    expect(value('--sf-font-size-xl')).toBe('20px');
  });
});
