import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? sourceFiles(full) : /\.ts$/.test(name) ? [full] : [];
  });
}

describe('CSS custom property fallbacks', () => {
  it('use absolute px, never rem (HA sets 24px on :root, so 0.75rem renders 18px)', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles('src')) {
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        if (/var\(--[\w-]+,\s*[\d.]+rem\s*\)/.test(line)) offenders.push(`${file}:${i + 1}: ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
