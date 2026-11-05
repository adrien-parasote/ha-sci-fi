/** Fix lot vague-1, O3 (bead ha-sci-fi-14z): the dead bridgeConfigMetadata export is removed, spec and all. */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../../..');

describe('O3', () => {
  it('test_O3_bridge_config_metadata_is_gone', () => {
    expect(existsSync(resolve(ROOT, 'src/cards/bridge/config-metadata.ts'))).toBe(false);
    const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', 'src', 'docs/specs', 'tests', 'dev'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n').filter((f) => /\.(ts|js|md)$/.test(f) && f !== 'tests/fixes/vague-1/O3.test.ts');
    expect(files.length).toBeGreaterThan(50);
    const readers = files.filter((f) => existsSync(resolve(ROOT, f)) && readFileSync(resolve(ROOT, f), 'utf8').includes('bridgeConfigMetadata'));
    // the only mentions left are the two spec lines recording the deletion
    expect(readers).toEqual(['docs/specs/05_cards.md', 'docs/specs/cards/bridge.md']);
    expect(readFileSync(resolve(ROOT, 'docs/specs/cards/bridge.md'), 'utf8')).not.toMatch(/^## config-metadata/m);
  });
});
