/**
 * Tests — build & CI pipeline invariants
 * Spec: docs/specs/01_infrastructure.md
 *
 * These spec rows promise that a gate RUNS ("npm run typecheck exits 0", "CI runs the
 * complete checks"). Re-running the whole toolchain from inside the unit suite would be
 * slow and would only re-prove what CI already proves on every push. What the suite CAN
 * prove — and what actually rots — is that the gate is still wired: the script still
 * exists, the workflow still calls it, the dev build still emits sourcemaps. These tests
 * read the real config files and fail the moment a step is dropped.
 */
import { expect, describe, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };

describe('build pipeline', () => {
  it('TC-101: a production build script is declared and targets the rollup config', () => {
    expect(pkg.scripts.build).toBe('rollup -c --environment NODE_ENV:production');
    const rollup = read('rollup.config.mjs');
    expect(rollup).toContain('sci-fi.min.js');
  });

  it('TC-102: the dev build emits sourcemaps and the production build does not', () => {
    const rollup = read('rollup.config.mjs');
    // `const dev = process.env.NODE_ENV !== 'production'` then `sourcemap: dev`
    expect(rollup).toMatch(/const\s+dev\s*=\s*process\.env\.NODE_ENV\s*!==\s*'production'/);
    expect(rollup).toMatch(/sourcemap:\s*dev/);
    expect(pkg.scripts['build:dev']).toBe('rollup -c --environment NODE_ENV:development');
  });

  it('TC-103: a strict typecheck script is declared', () => {
    expect(pkg.scripts.typecheck).toBe('tsc --noEmit');
    // tsconfig.json carries // comments (JSONC) — match the text, not a JSON.parse.
    const tsconfig = read('tsconfig.json');
    for (const flag of ['strict', 'noImplicitAny', 'strictNullChecks', 'strictFunctionTypes']) {
      expect(tsconfig, `${flag} must stay on`).toMatch(new RegExp(`"${flag}"\\s*:\\s*true`));
    }
  });

  it('TC-104: the lint script covers both src and tests', () => {
    expect(pkg.scripts.lint).toContain('eslint');
    expect(pkg.scripts.lint).toContain('src/**/*.ts');
    expect(pkg.scripts.lint).toContain('tests/**/*.ts');
  });
});

describe('continuous integration', () => {
  it('IT-101: the CI workflow runs typecheck, lint, tests and build', () => {
    const ci = read('.github/workflows/ci.yml');
    for (const step of ['npm ci', 'npm run typecheck', 'npm run lint', 'npm test', 'npm run build']) {
      expect(ci, `ci.yml must still run "${step}"`).toContain(step);
    }
  });
});
