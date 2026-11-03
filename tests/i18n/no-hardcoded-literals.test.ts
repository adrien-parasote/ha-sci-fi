// Guard: no French literal outside the translation circuit (spec i18n-hardcoded-fr FR-1).
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  analyseSource,
  findFrenchLiterals,
  findMsgTernaries,
  listSourceFiles,
  listSourceFilesByFs,
} from './french-literals.js';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const REMEDY =
  'move the French data to a *.fr-data.ts file, or make the text an English msg() source (see spec i18n-hardcoded-fr FR-1)';

/** Fixture sources: `~` is a backtick, `@{` is `${`, so a fixture can hold templates. */
const fx = (...lines: string[]): string => lines.join('\n').replaceAll('~', '`').replaceAll('@{', '${');

describe('findFrenchLiterals — accented literals', () => {
  it('TC-I18N-U-01 flags an accented string, template part and ternary branch with file, line, text', () => {
    const source = fx(
      "const a = 'Éteint';",
      'const b = ~Pièce @{a}~;',
      "const c = a ? 'Lumière' : 'x';"
    );
    const found = findFrenchLiterals(source, 'src/x/a.ts');
    expect(found).toHaveLength(3);
    expect(found.map((f) => [f.file, f.line])).toEqual([
      ['src/x/a.ts', 1],
      ['src/x/a.ts', 2],
      ['src/x/a.ts', 3],
    ]);
    expect(found[0]!.text).toContain('Éteint');
    expect(found[1]!.text).toContain('Pièce');
    expect(found[2]!.text).toContain('Lumière');
  });
});

describe('findFrenchLiterals — unaccented sinks', () => {
  it('TC-I18N-U-02 flags the four sink fixtures and none of the exemptions nor English', () => {
    const sinks = fx(
      'const a = html~<x-y label="Nom de la source"></x-y>~;',
      'const b = html~<button>Ajouter une source</button>~;',
      "this._showToast(false, a ? 'Tout allumer' : 'x');",
      "const d = e ?? 'Aucun x';"
    );
    const found = findFrenchLiterals(sinks, 'src/x/s.ts');
    expect(found.map((f) => f.line)).toEqual([1, 2, 3, 4]);

    const exempt = fx(
      "import x from './é-été.js';",
      "const a = msg('Tout allumer');",
      "const a2 = msg('Lumière éteinte');",
      'const b2 = msg(str~Lumière éteinte @{x}~);',
      'const b = msg(str~Tout allumer @{x}~);',
      '// Tout allumer, éteindre',
      'const c = html~<div><!-- ÉLECTROMÉNAGER --></div>~;',
      'const d = css~.a::after { content: "é"; }~;',
      'const e = html~<x-y label="Type"></x-y>~;'
    );
    expect(findFrenchLiterals(exempt, 'src/x/e.ts')).toEqual([]);
  });

  it('TC-I18N-U-14 reads the widened sinks: expression branches, split attributes; ignores English and callbacks', () => {
    const french = [
      fx('const a = html~<b title="@{c ? \'Tout éteindre\' : \'Tout allumer\'}"></b>~;'),
      fx("const a = html~<p>@{c ? html~<i>x</i>~ : 'Aucune lumiere'}</p>~;"),
      fx('const a = html~<x-y label="Bouton @{id}"></x-y>~;'),
      fx('const a = html~<b title="@{c && \'Tout allumer\'}"></b>~;'),
      fx('const a = html~<x-y label=Bouton></x-y>~;'),
      fx('const a = str~Lumière @{x}~;'),
      fx('const a = html~<x-y', '  label=', '"Nom de la source"', '></x-y>~;'),
    ];
    const expectedText = ['Tout allumer', 'Aucune lumiere', 'Bouton', 'Tout allumer', 'Bouton', 'Lumière', 'Nom de la source'];
    french.forEach((src, i) => {
      const found = findFrenchLiterals(src, 'src/x/w.ts');
      expect(found.length, `fixture ${i}`).toBeGreaterThanOrEqual(1);
      expect(found.map((f) => f.text).join('|'), `fixture ${i}`).toContain(expectedText[i]!);
    });
    const english = fx(
      'const a = html~<b title="@{c ? \'Turn all off\' : \'Turn all on\'}"></b>~;',
      "const b = html~<p>@{c ? msg('Tout') : msg('x')}</p>~;",
      "const c = html~<b @click=@{() => go('tout')}></b>~;"
    );
    expect(findFrenchLiterals(english, 'src/x/en.ts')).toEqual([]);
  });

  it('TC-I18N-U-20 exempts a *.fr-data.ts file by name only and the failure message says so', () => {
    const source = "export const JAUNE = 'Jaune éclatant';";
    expect(findFrenchLiterals(source, 'src/x/states.fr-data.ts')).toEqual([]);
    expect(findFrenchLiterals(source, 'src/x/states.ts')).toHaveLength(1);
    expect(REMEDY).toContain('*.fr-data.ts');
    // the exemption covers the word sinks too, not only accents
    const sinks = fx("export const A = b ?? 'Aucune donnee';", "this._showToast(false, 'Tout allumer');", 'export const T = html~<b title="Nom de la source"></b>~;');
    expect(findFrenchLiterals(sinks, 'src/x/states.fr-data.ts')).toEqual([]);
    expect(findFrenchLiterals(sinks, 'src/x/states.ts')).toHaveLength(3);
  });

  it('TC-I18N-U-21 names the line of the French text, and every French sink of one template', () => {
    const source = fx(
      'const a = html~',
      '  <div>',
      '    <button>Ajouter une source</button>',
      '    <x-y label="Nom de la source"></x-y>',
      '  </div>~;'
    );
    const found = findFrenchLiterals(source, 'src/x/l.ts');
    expect(found.map((f) => f.line)).toEqual([3, 4]);

    // an accent deep in a multi-line template: its own line, reported once; "la" inside "label" is not a word
    const accent = fx(
      'const a = html~',
      '  <x-y label-x="y"></x-y>',
      '  <p>Plan de la pièce</p>',
      '  <b>Ajouter</b>~;'
    );
    expect(findFrenchLiterals(accent, 'src/x/m.ts').map((f) => f.line)).toEqual([3, 4]);

    // "la" at the start of a text node must not be matched inside the earlier attribute name "label"
    const bounded = fx('const a = html~', '  <x-y label="x"></x-y>', '  <p>la source</p>~;');
    expect(findFrenchLiterals(bounded, 'src/x/b.ts').map((f) => f.line)).toEqual([3]);

    // an accent alone (no French word) in an html template is a finding
    expect(findFrenchLiterals(fx('const a = html~<span>Entrée</span>~;'), 'src/x/a.ts')).toHaveLength(1);

    // after a multi-line HTML comment: the line and the text are those of the accent, not of the part
    const afterComment = fx('const a = html~', '  <!--', '  one', '  two', '  -->', '  <b>x</b>', '  <p>Entrée</p>~;');
    const [hit] = findFrenchLiterals(afterComment, 'src/x/c.ts');
    expect([hit!.line, hit!.text]).toEqual([7, '<p>Entrée</p>']);

    // an accent at the start of a template part that follows a ${} slot is on its own line
    const afterSlot = fx('const a = html~<p>@{a}', 'Été</p>~;');
    expect(findFrenchLiterals(afterSlot, 'src/x/d.ts').map((f) => f.line)).toEqual([2]);

    // several accented lines in one template part: one finding per line, none hidden behind the first
    const several = fx('const a = html~', '  <p>Été</p>', '  <p>x</p>', '  <p>Hôtel</p>~;');
    expect(findFrenchLiterals(several, 'src/x/e.ts').map((f) => f.line)).toEqual([2, 4]);
  });
});

describe('the guard reads the real tree', () => {
  it('TC-I18N-U-03 FR-1.1 lists the files twice and finds no French literal in src/', () => {
    const files = listSourceFiles(ROOT);
    expect(files.length).toBeGreaterThan(0);
    expect(files).toEqual(listSourceFilesByFs(ROOT));

    let literals = 0;
    const hits: string[] = [];
    for (const f of files) {
      const a = analyseSource(readFileSync(join(ROOT, f), 'utf8'), f);
      literals += a.literalCount;
      for (const h of a.findings) hits.push(`${h.file}:${h.line}  ${h.text}`);
    }
    // TC-I18N-U-17 counters: the detector proves it read something
    console.info(`i18n guard: ${files.length} files, ${literals} string literals visited`);
    expect(literals).toBeGreaterThan(0);
    expect(literals).toBeGreaterThanOrEqual(files.length);
    expect(hits, `${REMEDY}\n${hits.join('\n')}`).toEqual([]);
  });

  it('TC-I18N-U-22 the fs lister rethrows a git failure instead of reading it as nothing ignored', () => {
    const dir = mkdtempSync(join(tmpdir(), 'i18n-nogit-'));
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src/a.ts'), 'export {};\n');
    expect(() => listSourceFilesByFs(dir)).toThrow();
  });

  it('TC-I18N-U-16 FR-1.1 lister: tracked and untracked files in, ignored and locales out', () => {
    const dir = mkdtempSync(join(tmpdir(), 'i18n-lister-'));
    const git = (...args: string[]) => execFileSync('git', args, { cwd: dir });
    git('init', '-q');
    mkdirSync(join(dir, 'src/locales'), { recursive: true });
    for (const f of ['a.ts', 'b.ts', 'c.ts', 'locales/d.ts']) writeFileSync(join(dir, 'src', f), 'export {};\n');
    writeFileSync(join(dir, '.gitignore'), 'src/c.ts\n');
    git('add', '.gitignore', 'src/a.ts');
    expect(listSourceFiles(dir)).toEqual(['src/a.ts', 'src/b.ts']);
  });
});

describe('positive controls — the detector must prove it reads', () => {
  const snapshot = (name: string) =>
    readFileSync(join(ROOT, 'tests/i18n/fixtures/pre-fix', name), 'utf8');

  it('TC-I18N-U-17 finds the census in the committed pre-fix snapshots', () => {
    const lights = findFrenchLiterals(snapshot('sci-fi-lights.ts.txt'), 'src/cards/lights/sci-fi-lights.ts');
    const list = findFrenchLiterals(snapshot('sf-editor-source-list.ts.txt'), 'src/components/editor-inputs/sf-editor-source-list.ts');
    expect(lights.length).toBeGreaterThanOrEqual(19);
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('TC-I18N-U-17 a source with a syntax error is a failure, never zero findings', () => {
    expect(() => findFrenchLiterals('const = ;', 'src/x/broken.ts')).toThrow(/parse failure/);
  });
});

describe('Anti-pattern 7 — no cond ? msg(A) : msg(B)', () => {
  const CENSUS = [
    'src/cards/lights/sci-fi-lights.ts',
    'src/cards/climates/sci-fi-climates.ts',
    'src/cards/hexa-tiles/sci-fi-hexa-tiles.ts',
    'src/cards/weather/sci-fi-weather.ts',
    'src/cards/vehicles/sci-fi-vehicles.ts',
    'src/cards/tv/sci-fi-tv-editor.ts',
    'src/cards/tv/labels.ts',
    'src/components/editor-inputs/sf-editor-action.ts',
    'src/components/editor-inputs/sf-editor-source-list.ts',
  ];

  it('TC-I18N-U-19 the census files have none, and a fixture that has one is flagged', () => {
    for (const f of CENSUS) {
      expect(findMsgTernaries(readFileSync(join(ROOT, f), 'utf8'), f), f).toEqual([]);
    }
    expect(findMsgTernaries("const a = c ? msg('A') : (msg('B'));", 'src/x/t.ts')).toHaveLength(1);
    expect(findMsgTernaries("const a = [msg('B'), msg('A')][c ? 1 : 0];", 'src/x/ok.ts')).toEqual([]);
  });
});
