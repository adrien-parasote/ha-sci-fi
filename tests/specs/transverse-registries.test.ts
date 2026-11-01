/**
 * Guards the TRANSVERSE REGISTRIES against the delivered code — lot fix
 * `ids-referentiel`, bead ha-sci-fi-s5f.
 *
 * The retrocheck of 2026-10-31 found one defect wearing fifteen faces: the
 * three cards added after the v1.2 freeze — `tv`, `water-management`, `bridge`
 * — are missing from every transverse registry, while all eleven
 * `src/cards/<card>/config.ts` name those registries as their source of
 * truth. The same freeze left `docs/MASTER.md` announcing seven id ranges its
 * own specs never defined, two prefixes included.
 *
 * Every case below derives its expectation from the delivered tree — the card
 * directories, the registration list, the editor files, the label
 * dictionaries — and never from a number written in a spec. A guard that
 * copies the spec's own claim cannot catch the spec being wrong, and a guard
 * built on a hard-coded count goes stale the day a card is added.
 *
 * Three probes in this lot's measurement pass returned a confident zero
 * because their pattern could not match what was there: a key regex requiring
 * an unquoted identifier, an id regex refusing the digit inside `F-I18N`, and
 * a link probe conflating `docs/cards/water.md` with
 * `docs/specs/cards/water.md`. Each case here therefore carries a positive
 * witness — an assertion that the probe finds what is known to be present —
 * so a silent zero fails instead of passing.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SPECS = join(ROOT, 'docs', 'specs');
const read = (...p: string[]): string => readFileSync(join(ROOT, ...p), 'utf8');

const MASTER = read('docs', 'MASTER.md');
const S05 = read('docs', 'specs', '05_cards.md');
const S06 = read('docs', 'specs', '06_entry_migration.md');
const S10 = read('docs', 'specs', '10_card_editors.md');
const S11 = read('docs', 'specs', '11_guidelines_remediation.md');

/** The card directories actually delivered under src/cards/. */
function deliveredCardDirs(): string[] {
  return readdirSync(join(ROOT, 'src', 'cards'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** The card tags `sci-fi.ts` registers, in registration order. */
function registeredTags(): string[] {
  return [...read('src', 'sci-fi.ts').matchAll(/^ {4}type: '([a-z-]+)'/gm)].map((m) => m[1]!);
}

/** Feature ids a spec declares in its own tables: `| F-XXX-NN |` or `| FN |`. */
function specIds(file: string): string[] {
  const text = readFileSync(join(SPECS, file), 'utf8');
  // The prefix may hold digits (F-I18N-01) — a letters-only class silently
  // drops that id, which is how this lot first mis-measured spec 06.
  const ids = [...text.matchAll(/^\| (F-[A-Z0-9]+-\d+|F\d+) /gm)].map((m) => m[1]!);
  return [...new Set(ids)];
}

/** Every `.ts` file tracked (or added) under a directory. */
function tracked(dir: string): string[] {
  return execFileSync('git', ['ls-files', '-co', '--exclude-standard', dir], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter((f) => f.endsWith('.ts'));
}

/**
 * Every test file EXCEPT this one. A guard that searches a corpus including
 * its own source finds its own `it()` titles: the review's one surviving
 * mutant dropped `IT-501` from another file's title and this check stayed
 * green, because `IT-501` appears in the title of the case below.
 */
const testSources = (): string =>
  tracked('tests')
    .filter((f) => !f.endsWith('transverse-registries.test.ts'))
    .map((f) => read(f))
    .join('\n');

describe('05_cards.md — le registre des cartes contre les cartes livrées', () => {
  it('O1 — chaque carte livrée a sa ligne F-CARD et sa sous-section de contrat', () => {
    const dirs = deliveredCardDirs();
    expect(dirs.length, 'témoin positif : des cartes sont livrées').toBeGreaterThan(8);
    expect(registeredTags(), 'autant de types enregistrés que de répertoires').toHaveLength(dirs.length);

    const rows = [...S05.matchAll(/^\| (F-CARD-\d+) \| `([a-z-]+)` Lovelace Card \| ✅ `([a-z-]+)\/` \|/gm)]
      .map((m) => ({ id: m[1]!, tag: m[2]!, dir: m[3]! }));
    expect(rows.length, 'la table porte une ligne par carte').toBe(dirs.length);

    // Both directions: every delivered tag has a row, every row names a tag the
    // entry point registers and a directory that exists on disk.
    const tags = registeredTags();
    expect(rows.map((r) => r.tag).sort()).toEqual([...tags].sort());
    expect(rows.filter((r) => !dirs.includes(r.dir)), 'lignes nommant un répertoire absent').toEqual([]);

    // One YAML contract subsection per card, named by its tag.
    const contracts = [...S05.matchAll(/^### (sci-fi-[a-z-]+)$/gm)].map((m) => m[1]!);
    expect([...contracts].sort()).toEqual([...tags].sort());
  });

  it('O2 / O16 — le registre mène à la spec de chaque carte, et aucune spec de carte n\'est orpheline', () => {
    const specFiles = readdirSync(join(SPECS, 'cards')).filter((f) => f.endsWith('.md')).sort();
    expect(specFiles.length, 'témoin positif : des specs de carte existent').toBeGreaterThan(10);

    const linkedFrom05 = new Set(
      [...S05.matchAll(/\]\(\.\/cards\/([a-z_-]+\.md)/g)].map((m) => m[1]!),
    );
    expect(linkedFrom05.size, 'le registre lie des specs').toBeGreaterThan(8);

    // Every card spec must be reachable from the spec graph: from 05_cards.md,
    // or from another spec. Reachability only from docs/reviews/ does not count —
    // that is what left water_history.md orphan.
    const specMarkdown = [
      ...readdirSync(SPECS).filter((f) => f.endsWith('.md')).map((f) => join('docs', 'specs', f)),
      ...readdirSync(join(SPECS, 'cards')).filter((f) => f.endsWith('.md'))
        .map((f) => join('docs', 'specs', 'cards', f)),
    ];
    expect(specMarkdown.length, 'témoin positif : le corpus de specs est non vide').toBeGreaterThan(15);

    for (const f of specFiles) {
      if (linkedFrom05.has(f)) continue;
      const linkers = specMarkdown
        .filter((p) => !p.endsWith(`cards/${f}`))
        .filter((p) => existsSync(join(ROOT, p)) && read(p).includes(f));
      expect(linkers, `${f} n'est liée par aucune spec`).not.toEqual([]);
    }
  });

  it('O10 — IT-501 annonce le nombre de cartes réellement enregistrées', () => {
    const n = registeredTags().length;
    const row = S05.split('\n').find((l) => l.startsWith('| IT-501 |'));
    expect(row, 'témoin positif : IT-501 existe').toBeDefined();
    expect(row!, `IT-501 doit dire ${n}`).toContain(String(n));
    // The stale bundle path: the test loads the source entry point.
    expect(row!).not.toContain('sci-fi.min.js');
  });
});

describe('MASTER.md — la matrice contre les ids que les specs portent', () => {
  it('O3 — chaque plage annoncée est celle de sa spec, préfixe compris', () => {
    const rows = [...MASTER.matchAll(/^\| Step \d+[^|]*\| ([^|]+?) \| \[(\d+_[a-z_]+\.md)\]/gm)]
      .map((m) => ({ claim: m[1]!.trim(), file: m[2]! }));
    expect(rows.length, 'témoin positif : la matrice a des lignes de step').toBeGreaterThan(7);

    for (const { claim, file } of rows) {
      const ids = specIds(file);
      expect(ids.length, `témoin positif : ${file} porte des ids`).toBeGreaterThan(0);

      let announced: string[];
      const range = /^(F-[A-Z0-9]+)-0*(\d+) to 0*(\d+)$/.exec(claim);
      const bare = /^F(\d+) to F(\d+)$/.exec(claim);
      if (range) {
        const [, prefix, from, to] = range;
        announced = [];
        for (let i = Number(from); i <= Number(to); i++) {
          announced.push(`${prefix}-${String(i).padStart(2, '0')}`);
        }
      } else if (bare) {
        announced = [];
        for (let i = Number(bare[1]); i <= Number(bare[2]); i++) announced.push(`F${i}`);
      } else {
        announced = claim.split(',').map((s) => s.trim());
      }

      expect([...announced].sort(), `${file} : la plage annoncée par MASTER`).toEqual([...ids].sort());
    }
  });

  it('O3 — la liste Source of Truth est numérotée sans trou', () => {
    const nums = [...MASTER.matchAll(/^> (\d+)\. \[/gm)].map((m) => Number(m[1]!));
    expect(nums.length, 'témoin positif : la liste existe').toBeGreaterThan(3);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });
});

describe('10_card_editors.md — le registre des éditeurs contre les éditeurs livrés', () => {
  it('O5 / O6 — chaque éditeur et chaque composant livré a sa ligne F-EDITOR', () => {
    const editors = tracked('src/cards')
      .filter((f) => /-editor\.ts$/.test(f))
      .map((f) => f.split('/').pop()!.replace(/\.ts$/, ''));
    const components = tracked('src/components/editor-inputs')
      .map((f) => f.split('/').pop()!.replace(/\.ts$/, ''));
    expect(editors.length, 'témoin positif : des éditeurs sont livrés').toBeGreaterThan(8);
    expect(components.length, 'témoin positif : des composants sont livrés').toBeGreaterThan(8);

    const named = [...S10.matchAll(/^\| F-EDITOR-\d+ \| `([a-z-]+)`/gm)].map((m) => m[1]!);
    for (const e of [...editors, ...components]) {
      expect(named, `${e} doit porter une ligne F-EDITOR`).toContain(e);
    }
  });

  it('O6 — chaque composant livré est dans le File Tree et la Public Interface', () => {
    const components = tracked('src/components/editor-inputs')
      .map((f) => f.split('/').pop()!.replace(/\.ts$/, ''));
    const fileTree = S10.slice(S10.indexOf('## File Tree'), S10.indexOf('## Assumptions'));
    const pubIface = S10.slice(S10.indexOf('### Public Interface'), S10.indexOf('### External Invocations'));
    expect(fileTree.length, 'témoin positif : le File Tree existe').toBeGreaterThan(100);
    expect(pubIface.length, 'témoin positif : la Public Interface existe').toBeGreaterThan(100);

    for (const c of components) {
      expect(fileTree, `${c}.ts dans le File Tree`).toContain(`${c}.ts`);
      expect(pubIface, `<${c}> dans la Public Interface`).toContain(`<${c}>`);
    }
    // And every delivered card editor too — the three added after the freeze
    // were in the File Tree but in neither the ids nor the Public Interface.
    for (const e of tracked('src/cards').filter((f) => /-editor\.ts$/.test(f))) {
      const tag = e.split('/').pop()!.replace(/\.ts$/, '');
      expect(pubIface, `<${tag}> dans la Public Interface`).toContain(`<${tag}>`);
    }
  });

  it('O14 — le compte de clés de label n\'est pas un nombre périmé', () => {
    const keys = new Set<string>();
    for (const f of tracked('src').filter((p) => /\/labels\.ts$|utils\/base-editor\.ts$/.test(p))) {
      // The keys are quoted strings mapped to msg() — an unquoted-identifier
      // pattern returns zero here, which is how this lot first mis-counted.
      for (const m of read(f).matchAll(/^\s+['"]([^'"]+)['"]\s*:\s*msg\(/gm)) keys.add(m[1]!);
    }
    expect(keys.size, 'témoin positif : la sonde trouve des clés').toBeGreaterThan(100);

    const claimed = [...S10.matchAll(/read (?:all )?(\d+) keys|(\d+) at the time of writing/g)]
      .flatMap((m) => [m[1], m[2]])
      .filter((v): v is string => typeof v === 'string')
      .map(Number);
    for (const c of claimed) {
      expect(c, `la spec annonce ${c} clés, la mesure en donne ${keys.size}`).toBe(keys.size);
    }
  });

  it('O15 — les prescriptions de l\'éditeur plugs décrivent l\'éditeur livré', () => {
    const editor = read('src', 'cards', 'plugs', 'sci-fi-plugs-editor.ts');
    const start = S10.indexOf('### `sci-fi-plugs-editor`');
    const sec = S10.slice(start, S10.indexOf('### `sci-fi-stove-editor`', start));
    expect(sec.length, 'témoin positif : la section existe').toBeGreaterThan(100);

    // The three prescriptions the delivered editor never honoured. Each is
    // matched as the PRESCRIPTIVE form — the shape that tells a reader "the
    // editor does this" — so a mention under an explicit reserve stays legal.
    expect(sec, 'le § ne doit plus charger _devices depuis hass.devices')
      .not.toMatch(/\*\*State loaded:\*\* `_devices` from/);
    expect(sec, 'le § ne doit plus prescrire un dropdown pour device_id')
      .not.toMatch(/`<sf-editor-dropdown>` for `device_id`/);
    for (const field of ['power_entity', 'energy_entity']) {
      expect(sec, `le § ne doit plus prescrire un champ ${field}`)
        .not.toMatch(new RegExp(`entity \\(\`${field}\``));
    }
    // And whatever symbol it still names as loaded state must exist in the editor.
    for (const sym of [...sec.matchAll(/\*\*State loaded:\*\* `([a-zA-Z_.]+)`/g)].map((m) => m[1]!)) {
      expect(editor, `la section dit charger ${sym}`).toContain(sym);
    }
    // Positive witness: what it really renders.
    expect(editor).toContain('_updateSensor');
    expect(sec, 'le § Sensor Mapping Logic décrit le vrai mécanisme').toContain('_updateSensor');
  });
});

describe('06 / 11 — les contrats transverses contre le code', () => {
  it('O4 — le nombre de cartes annoncé par la spec 06 est le nombre livré', () => {
    const n = registeredTags().length;
    const claims = [...S06.matchAll(/Lovelace Cards \((\d+)\)/g)].map((m) => Number(m[1]!));
    expect(claims.length, 'témoin positif : la ligne existe').toBeGreaterThan(0);
    for (const c of claims) expect(c).toBe(n);
  });

  it('O7 — la Public Interface de la spec 06 ne nomme que des symboles existants', () => {
    const src = tracked('src').map((f) => read(f)).join('\n');
    expect(src.length, 'témoin positif : les sources sont lues').toBeGreaterThan(10000);
    expect(src, 'témoin positif : setLocale existe').toContain('setLocale');

    // The symbol the row used to name, which never existed under src/.
    expect(src).not.toContain('syncHALocale');
    expect(S06, 'la spec ne doit plus le prescrire').not.toMatch(/^\| `syncHALocale`/m);
  });

  it('O8 — aucune prescription de migration ne survit, dans les specs ni dans le code', () => {
    const src = tracked('src').map((f) => read(f)).join('\n');
    expect(src).not.toContain('config.version');
    expect(src).not.toMatch(/\bmigrateConfig\b/);

    // ADR-005 froze the YAML fields: a spec that still prescribes a migration
    // path contradicts the ADR it cites.
    for (const [name, text] of [['06', S06], ['10', S10]] as const) {
      expect(text, `spec ${name} : plus de garde-fou config.version`).not.toMatch(
        /MUST NOT render .* until it verifies `config\.version`/,
      );
      expect(text, `spec ${name} : plus de « Migration parser failure »`).not.toContain('Migration parser failure');
    }
  });

  it('O9 — la spec 11 et hacs.json s\'accordent sur l\'absence de clé type', () => {
    const hacs = JSON.parse(read('hacs.json')) as Record<string, unknown>;
    expect(Object.keys(hacs).length, 'témoin positif : hacs.json a des clés').toBeGreaterThan(1);
    expect('type' in hacs, 'HACS 2.0 a retiré la clé type').toBe(false);
    // The spec must not demand what the file must not carry.
    expect(S11).not.toMatch(/JSON contains `"type": "plugin"`/);
    expect(S11, 'la spec dit le schéma réel').toContain('HACS 2.0');
  });

  it('O11 — chaque id d\'intégration des specs 05 et 06 est porté par un it()', () => {
    const tests = testSources();
    const ids = [...new Set([...`${S05}\n${S06}`.matchAll(/^\| (IT-\d{3}) \|/gm)].map((m) => m[1]!))];
    expect(ids.length, 'témoin positif : des ids IT existent').toBeGreaterThan(2);
    const orphans = ids.filter((id) => !new RegExp(`it\\((['"\`]).*${id}`).test(tests));
    expect(orphans, 'ids IT sans bloc it()').toEqual([]);
  });

  it('O12 — TC-602 nomme ce que le point d\'entrée enregistre vraiment', () => {
    const iconset = read('src', 'components', 'sf-icon', 'sf-iconset.ts');
    expect(iconset, 'témoin positif').toContain('customIconsets');
    // The registered <ha-icon> namespace, measured rather than assumed.
    const ns = [...iconset.matchAll(/customIconsets as Record<string, unknown>\)\['([a-z]+)'\]/g)]
      .map((m) => m[1]!);
    expect(ns, 'témoin positif : un namespace est enregistré').toHaveLength(1);

    const row = S06.split('\n').find((l) => l.startsWith('| TC-602 |'));
    expect(row, 'témoin positif : TC-602 existe').toBeDefined();
    expect(row!, `TC-602 doit nommer customIconsets['${ns[0]}']`).toContain(`customIconsets['${ns[0]}']`);
  });

  it('O13 — aucune spec n\'annonce une branche git qui n\'existe pas', () => {
    const branches = execFileSync('git', ['branch', '-a', '--format=%(refname:short)'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    expect(branches.length, 'témoin positif : des branches existent').toBeGreaterThan(0);

    const claimed = [...`${MASTER}\n${S06}`.matchAll(/Branch `([A-Za-z0-9._/-]+)` isolation/g)]
      .map((m) => m[1]!);
    for (const b of claimed) {
      expect(branches, `une spec annonce la branche ${b}`).toContain(b);
    }
  });
});
