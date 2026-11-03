// TC-CEC-U-08 (translation sources) and TC-CEC-U-11 (numbered docs) of config-error-card.
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const rowOf = (doc: string, label: string): string => {
  const row = doc.split('\n').find(l => l.startsWith(`| ${label} |`));
  if (!row) throw new Error(`row ${label} not found`);
  return row;
};

describe('config-error-card docs and translations', () => {
  it('TC-CEC-U-11: 03 and 02 Error Handling rows state the delivered behaviour', () => {
    const base = rowOf(read('docs/specs/03_base_classes.md'), 'Missing Configuration');
    for (const needle of ['getConfiguredEntities', 'Entity not found', 'hass']) expect(base).toContain(needle);
    expect(base).not.toContain('⬜');
    expect(base).not.toContain('non livré');
    const sel = read('docs/specs/02_domain_selectors.md');
    const row = rowOf(sel, 'Null Registry State');
    expect(row).toContain('no log');
    expect(row).not.toContain('Log warning in console');
    const block = sel.split('## Error Handling')[1]!.split('| Error |')[0]!;
    expect(block).toContain('the decision is taken');
  });

  it('TC-CEC-U-08: fr.xlf and fr.js carry both French strings', () => {
    const xlf = read('xliff/fr.xlf');
    const js = read('src/locales/locales/fr.js');
    const unit = (src: string) => {
      const m = new RegExp(`<trans-unit [^>]*>(?:(?!</trans-unit>)[\\s\\S])*?${src}(?:(?!</trans-unit>)[\\s\\S])*</trans-unit>`).exec(xlf);
      expect(m, src).not.toBeNull();
      return m![0];
    };
    const setup = unit('Card setup required: configuration is missing\\.');
    expect(setup).toMatch(/<target>Configuration requise : la configuration de la carte est absente\.<\/target>/);
    const nf = unit('Entity not found: ');
    expect(nf).toMatch(/<target>Entité introuvable : <x id="0"/);
    expect(nf).not.toMatch(/<target>[^<]*\$\{/);
    expect(js).toContain('Configuration requise : la configuration de la carte est absente.');
    expect(js).toContain('Entité introuvable : ');
  });
});
