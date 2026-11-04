/** Fix lot socle, O5 (bead ha-sci-fi-oyir.5 / ha-sci-fi-4syw): no complete entity id literal outside ENTITY_ID. */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { scanSource } from '../../helpers/domain-scan.js';

const CONSTANT_FILE = 'src/types/entity-ids.ts';

describe('O5', () => {
  it('test_O5_no_full_entity_id_literal_outside_entity_ids', () => {
    const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard', 'src/**/*.ts'], { encoding: 'utf8' })
      .split('\n')
      .filter((f) => f && !f.startsWith('src/locales/') && f !== CONSTANT_FILE);
    expect(files.length).toBeGreaterThan(100);
    const fullIds = files
      .flatMap((f) => scanSource(f, readFileSync(f, 'utf8')))
      .filter((x) => x.cls === 'fullid')
      .map((x) => `${x.file}:${x.line} ${x.context}`);
    expect(fullIds).toEqual([]);
    // positive control: the scanner does see a full id
    expect(scanSource('x.ts', "const a = 'sun.sun';").some((x) => x.cls === 'fullid')).toBe(true);
  });
});
