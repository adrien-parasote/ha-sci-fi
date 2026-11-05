/**
 * Lot spec-12-renumber (bead ha-sci-fi-b8g) : water_history.md devient Spec 16,
 * vehicles.md garde Spec 12. Ces cas vivent hors de tests/specs/ pour que les
 * ids TC-RN-U-* y soient comptés comme joués (ids-cas-uniques).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { collidingNumbers, collisionReport, isTitledSpec, specNumbers } from '../fixtures/spec-numbers';

const ROOT = resolve(__dirname, '../..');
const read = (rel: string): string => readFileSync(resolve(ROOT, rel), 'utf8');
const lsFiles = (dir: string): string[] =>
  execFileSync('git', ['ls-files', '-co', '--exclude-standard', dir], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f !== '')
    .sort();

describe('Renumérotation Spec 12 / Spec 16', () => {
  it('TC-RN-U-01: aucune collision de numéro sur docs/specs', () => {
    const files = lsFiles('docs/specs')
      .filter(isTitledSpec)
      .map((f) => ({ path: f, text: read(f) }));
    expect(specNumbers(files).size).toBeGreaterThan(8);
    const c = collidingNumbers(files);
    expect(collisionReport(c)).toEqual([]);
  });

  it('TC-RN-U-03: le contrôle compare en entiers et lit le premier titre, même en ligne 5', () => {
    const c = collidingNumbers([
      { path: 'a.md', text: '# Spec 7 — a\n' },
      { path: 'b.md', text: 'x\n\ny\n\n# Spec 07 — b\n' },
      { path: 'c.md', text: '# Spec — sans numéro\n' },
    ]);
    expect([...c.keys()]).toEqual([7]);
    expect(c.get(7)!.slice().sort()).toEqual(['a.md', 'b.md']);
  });

  it('TC-RN-U-06: toute collision est refusée et nommée, Spec 07 comprise', () => {
    expect(
      collisionReport(
        collidingNumbers([
          { path: 'docs/specs/cards/hexa-tiles.md', text: '# Spec 07\n' },
          { path: 'docs/specs/cards/tv.md', text: '# Spec 07\n' },
          { path: 'y.md', text: '# Spec 12\n' },
          { path: 'z.md', text: '# Spec 12\n' },
        ]),
      ),
    ).toEqual(['Spec 7: docs/specs/cards/hexa-tiles.md, docs/specs/cards/tv.md', 'Spec 12: y.md, z.md']);
  });

  it('test_O2_hexa_tiles_is_spec_08_and_tv_keeps_spec_07', () => {
    expect(read('docs/specs/cards/hexa-tiles.md').split('\n')[0]).toBe('# Spec 08 — Hexagonal Dashboard Card Fixes');
    expect(read('docs/specs/cards/tv.md').split('\n')[4]).toMatch(/^# Spec 07 — /);
  });

  it('TC-RN-U-02: vehicles garde Spec 12, water_history devient Spec 16', () => {
    expect(read('docs/specs/cards/vehicles.md').split('\n')[0]).toBe(
      '# Spec 12 — Vehicle Card Design Update',
    );
    const water = read('docs/specs/cards/water_history.md');
    expect(water.split('\n')[0]).toBe('# Spec 16 — Tactical Water Management History Log');
    expect(water).not.toMatch(/Spec 12/);
  });

  it('TC-RN-U-04: les liens Vehicle spec résolvent, aucun lien ne vise le fichier disparu', () => {
    const suivis = new Set(lsFiles('.'));
    for (const f of ['docs/specs/cards/plugs.md', 'docs/specs/cards/vacuum.md']) {
      const ligne = read(f)
        .split('\n')
        .find((l) => l.includes('Vehicle spec (navigation pattern)'));
      expect(ligne, `${f}: ligne Vehicle spec absente`).toBeDefined();
      expect(ligne!).toContain('[Spec 12](./vehicles.md#L1)');
      expect(suivis.has('docs/specs/cards/vehicles.md')).toBe(true);
    }
    const morts = lsFiles('docs/specs')
      .filter((f) => f.endsWith('.md'))
      .filter((f) => /\]\([^)]*12_vehicle_card_design_update\.md/.test(read(f)));
    expect(morts).toEqual([]);
  });

  it('TC-RN-U-05: le describe de l’eau porte Spec 16', () => {
    const t = read('tests/cards/water_history/sci-fi-water-management-history.test.ts');
    expect(t).toContain('Automation History Logs (Spec 16)');
    expect(t).not.toContain('Automation History Logs (Spec 12)');
  });

  it('TC-RN-U-07: vehicles et la note de stove gardent Spec 12', () => {
    for (const dir of ['src/cards/vehicles', 'tests/cards/vehicles']) {
      const hits = lsFiles(dir).filter((f) => /Spec 12/.test(read(f)));
      expect(hits.length, `plus aucun Spec 12 dans ${dir}`).toBeGreaterThan(0);
    }
  });

  it('TC-RN-U-07: la note historique de stove.md nomme toujours les deux fichiers', () => {
    const stove = read('docs/specs/cards/stove.md');
    expect(stove).toContain('vehicles.md');
    expect(stove).toContain('water_history.md');
  });
});
