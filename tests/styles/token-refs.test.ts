/**
 * Guards Spec 03 § Palette rule 2 and the `--sf-*` declarations
 * (spec docs/specs/sf-token-declarations/spec.md).
 *
 * A `var(--x)` written WITHOUT a fallback, whose token is declared nowhere in
 * `src/`, is invalid at computed-value time: the property computes to its
 * inherited value if it inherits, otherwise to its initial value. The
 * declaration silently does nothing, and CSS reports no error.
 *
 * For a `--sf-*` name a fallback does NOT make the reference healthy: when the
 * name is declared nowhere the property always renders its fallback, and a
 * near-homonym (`--sf-text-sm` beside the declared `--sf-font-size-sm`) looks
 * like a token that works. A `--sf-*` name read in `src/` is therefore either
 * declared (a `css` block or an inline `style=`), a documented hook (HOOKS), or
 * an open card name owned by a follow-up bead (OPEN_CARD_NAMES). The two tables
 * are ratchets: they can only shrink. The scan copies no list of token names,
 * so it covers tokens added after it was written.
 *
 * The machinery lives in ./token-scan.ts (a test file cannot be imported by
 * another without duplicating its describe blocks).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  FOLLOW_UP_BEADS,
  blankComments,
  canonicalValues,
  checkDrift,
  checkNameTables,
  collectRefs,
  declaredSfNames,
  findDrift,
  findUndeclared,
  loadSources,
  makeIncludesCommonStyles,
  readSfNames,
  scan,
  type OpenDriftEntry,
  type OpenName,
  type Source,
} from './token-scan.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const SINCE = '2026-11-03';

/**
 * Follow-up beads: yj6 (bridge), 03i (vacuum), xi7 (stove), rhd (climates), 3z0j (tv), 7ge9 (hexa-tiles), gmvv (weather), td4b (water).
 * `--sf-*` names read by a card and declared nowhere in `src/`. Each line is deleted by the lot of the
 * bead that settles it; the ratchet fails on a name that is declared or no longer referenced.
 */
export const OPEN_CARD_NAMES: Record<string, OpenName> = {};

/** Public override points: read with a fallback, set by no one in `src/`. */
export const HOOKS: Record<string, string> = {
  '--sf-hexa-border': 'public override point read by src/components/sf-hexa-tile.ts, set by no one in src/',
  '--sf-hexa-row-icon-off-color': 'public override point read by src/components/sf-hexa-row.ts, set by no one in src/',
  '--sf-default-hexa-width': 'public override point read by src/components/sf-hexa-row.ts, set by no one in src/',
  '--sf-selected-hexa-width': 'public override point read by src/components/sf-hexa-row.ts, set by no one in src/',
};

/**
 * Card-sheet fallbacks that differ from `common.ts`, per `<file>::<token>`; `max` is the measured
 * number of drifting sites. Each line is deleted by the lot of the bead that canonises it.
 */
export const OPEN_DRIFT: Record<string, OpenDriftEntry> = {};

/** The 11 names `common.ts` settles (all undeclared before the lot); `--sf-bg-tile` is the 12th declaration. */
const SETTLED = [
  '--sf-border-width',
  '--sf-icon-size-xs',
  '--sf-icon-size-sm',
  '--sf-icon-size-md',
  '--sf-icon-size-lg',
  '--sf-text-xs',
  '--sf-text-sm',
  '--sf-text-base',
  '--sf-bg-primary',
  '--sf-bg-tertiary',
  '--sf-border-light',
];
const NEW_DECLARATIONS = [...SETTLED, '--sf-bg-tile'];

const sources = loadSources(join(ROOT, 'src'), ROOT);
const real = scan(sources);

const fx = (path: string, ...lines: string[]): Source => ({ path, text: lines.join('\n') });

describe('CSS custom-property references (Spec 03 § Palette rule 2)', () => {
  it('TC-307: no var(--x) targets a token defined nowhere in src/ (a --sf-* name even with a fallback)', () => {
    expect(sources.length, 'no source files found — check the SRC path').toBeGreaterThan(20);
    const violations = findUndeclared(real, HOOKS, OPEN_CARD_NAMES);
    expect(violations, `\n${violations.join('\n')}\n`).toEqual([]);
  });

  it('TC-307: the scanner ignores var() written inside comments and reads nested fallbacks', () => {
    const sample = [
      '/* main: color: var(--from-block-comment) */',
      '// var(--from-line-comment)',
      'css`',
      '  .a { color: var(--bare); }',
      '  .b { color: var(--with-fb, red); }',
      '  .c { color: var(--outer, var(--inner, rgba(0, 0, 0, 0.5))); }',
      '`;',
    ].join('\n');

    const refs = collectRefs(blankComments(sample));
    expect(refs.map((r) => r.token)).toEqual(['--bare', '--with-fb', '--outer', '--inner']);
    expect(refs.map((r) => r.hasFallback)).toEqual([false, true, true, true]);
    // line numbers survive comment blanking
    expect(refs[0]!.line).toBe(4);
  });

  it('TC-SFT-U-01: --sf-* is reported with or without a fallback, hooks and non-sf fallbacks are not, a URL // is no comment', () => {
    const s = scan([
      fx(
        'src/cards/x/a.ts',
        'css`',
        '  :host { --sf-ok: 1px; }',
        '  .a { color: var(--sf-ghost, red); }',
        '  .b { width: var(--sf-ok); }',
        '  .c { width: var(--sf-hook, 2px); }',
        '  .d { color: var(--other-ghost, blue); }',
        '  .e { color: var(--bare-ghost); }',
        '  .f { background: url(//cdn/x.png) var(--sf-ghost2, red); }',
        '`;',
      ),
    ]);
    const out = findUndeclared(s, { '--sf-hook': 'documented' }, {});
    const starts = (name: string): boolean => out.some((v) => v.startsWith(`${name} at `));
    expect(starts('--sf-ghost')).toBe(true);
    expect(starts('--sf-ghost2')).toBe(true);
    expect(starts('--bare-ghost')).toBe(true);
    expect(starts('--sf-ok')).toBe(false);
    expect(starts('--sf-hook')).toBe(false);
    expect(starts('--other-ghost')).toBe(false);
    const msg = out.find((v) => v.startsWith('--sf-ghost at '))!;
    expect(msg).toMatch(/declare/);
    expect(msg).toMatch(/rename/);
    expect(msg).toMatch(/remove/);
  });

  it('TC-SFT-U-03: the real tree partitions into declared, hooks and open card names, with no violation', () => {
    const read = readSfNames(real);
    // "before the lot": the declarations of common.ts that are new do not count
    const declaredBefore = new Set<string>();
    for (const [name, files] of real.declaredSf) {
      const onlyCommon = [...files].every((f) => f === 'src/styles/common.ts');
      if (!(onlyCommon && NEW_DECLARATIONS.includes(name))) declaredBefore.add(name);
    }
    const undeclaredBefore = [...read.keys()].filter((n) => !declaredBefore.has(n));

    const hookNames = Object.keys(HOOKS);
    const openNames = Object.keys(OPEN_CARD_NAMES);
    // --sf-bg-tile is new (read by the renamed hexa-tile sites), none of the three sets
    for (const name of NEW_DECLARATIONS) {
      expect(real.declaredSf.get(name), `${name} must be declared by common.ts`).toEqual(new Set(['src/styles/common.ts']));
    }
    expect(SETTLED).not.toContain('--sf-bg-tile');
    expect(hookNames).not.toContain('--sf-bg-tile');
    expect(openNames).not.toContain('--sf-bg-tile');

    const expected = new Set([...SETTLED, ...hookNames, ...openNames, '--sf-bg-tile']);
    expect(new Set(undeclaredBefore)).toEqual(expected);
    expect(undeclaredBefore.length).toBe(SETTLED.length + hookNames.length + openNames.length + 1);

    expect(findUndeclared(real, HOOKS, OPEN_CARD_NAMES)).toEqual([]);
    expect(checkNameTables(real, HOOKS, OPEN_CARD_NAMES)).toEqual([]);

    for (const [name, e] of Object.entries(OPEN_CARD_NAMES)) {
      expect(FOLLOW_UP_BEADS as readonly string[], name).toContain(e.bead);
    }
    for (const [name, reason] of Object.entries(HOOKS)) expect(reason.trim(), name).not.toBe('');

    // mutant: a name in both tables fails
    const mutant = checkNameTables(real, { ...HOOKS, '--sf-hexa-border-x': 'x' }, { '--sf-hexa-border-x': { bead: '3z0j', since: SINCE } });
    expect(mutant.some((v) => /both HOOKS and OPEN_CARD_NAMES/.test(v))).toBe(true);
  });

  it('TC-SFT-U-04: the inheritance chain decides whether a file includes sciFiCommonStyles', () => {
    const includes = makeIncludesCommonStyles(sources);
    for (const f of [
      'src/components/buttons/sf-button-card.ts',
      'src/components/buttons/sf-button-card-select.ts',
      'src/components/buttons/sf-button.ts',
      'src/components/sf-hexa-row.ts',
      'src/components/sf-hexa-tile.ts',
      'src/components/sf-wheel.ts',
    ]) {
      expect(includes(f), f).toBe(true);
    }
    expect(includes('src/components/sf-dropdown.ts')).toBe(false);

    // on the real tree every class-less card sheet is exempt through an importing card, never for want of a class
    const classless = sources.filter((s) => s.path.startsWith('src/cards/') && /\/styles?\.ts$/.test(s.path) && !/\bclass\s+\w+/.test(s.text));
    expect(classless.length).toBeGreaterThan(5);
    const imports = (s: Source, sheet: string): boolean =>
      new RegExp(`from\\s+['"]\\.{1,2}/(?:[\\w-]+/)*${sheet.replace(/^.*\//, '').replace(/\.ts$/, '')}\\.js['"]`).test(s.text);
    for (const sheet of classless) {
      expect(sources.some((s) => s.path !== sheet.path && imports(s, sheet.path)), `${sheet.path} is imported by no file`).toBe(true);
      expect(includes(sheet.path), sheet.path).toBe(true);
    }

    // the four dead fallbacks (FR-6) are canonical, the live dropdown one stays
    const text = (p: string): string => sources.find((s) => s.path === p)!.text;
    expect(text('src/components/buttons/sf-button-card.ts')).toContain('var(--sf-text-secondary, rgba(224, 232, 255, 0.6))');
    expect(text('src/components/buttons/sf-button-card.ts')).toContain('var(--sf-border, rgba(0, 210, 255, 0.15))');
    expect(text('src/components/sf-wheel.ts')).toContain('var(--sf-text-secondary, rgba(224, 232, 255, 0.6))');
    expect(text('src/components/sf-hexa-row.ts')).toContain('var(--sf-bg-secondary, rgba(255, 255, 255, 0.04))');
    expect(text('src/components/sf-hexa-tile.ts')).toContain('var(--sf-bg-secondary, rgba(255, 255, 255, 0.04))');
    expect(text('src/components/sf-hexa-tile.ts')).toContain('var(--sf-primary-dim, color-mix(in srgb, var(--sf-primary) 40%, transparent))');
    expect(text('src/components/sf-dropdown.ts')).toContain('rgba(0, 210, 255, 0.3)');

    // fixtures: direct / one level / two levels / override without super.styles / class-less sheets
    const fixture = makeIncludesCommonStyles([
      fx('src/styles/common.ts', 'export const sciFiCommonStyles = css`:host { --sf-a: 1px; }`;'),
      fx(
        'src/a/direct.ts',
        "import { sciFiCommonStyles } from '../styles/common.js';",
        "import { sheet } from './sheet-used.js';",
        'export class Direct extends LitElement {',
        '  static override styles = [sciFiCommonStyles, sheet];',
        '}',
      ),
      fx(
        'src/a/one.ts',
        "import { Direct } from './direct.js';",
        'export class One extends Direct {',
        '  static override get styles() { return [super.styles, css`.x { color: red; }`]; }',
        '}',
      ),
      fx('src/a/two.ts', "import { One } from './one.js';", 'export class Two extends One {}'),
      fx(
        'src/a/override.ts',
        "import { Direct } from './direct.js';",
        'export class Over extends Direct {',
        '  static override styles = css`.x { color: red; }`;',
        '}',
      ),
      fx('src/a/sheet-used.ts', 'export const sheet = css`.s { color: red; }`;'),
      fx('src/a/sheet-orphan.ts', 'export const orphan = css`.o { color: red; }`;'),
      fx('src/a/sheet-live.ts', 'export const live = css`.l { color: red; }`;'),
      fx(
        'src/a/live-user.ts',
        "import { live } from './sheet-live.js';",
        'export class LiveUser extends LitElement {',
        '  static override styles = live;',
        '}',
      ),
      fx('src/a/sheet-outer.ts', "import { inner } from './sheet-inner.js';", 'export const outer = css`${inner}`;'),
      fx('src/a/sheet-inner.ts', 'export const inner = css`.i { color: red; }`;'),
      fx('src/a/sheet-chain-orphan.ts', "import { inner } from './sheet-inner.js';", 'export const chained = css`${inner}`;'),
      fx(
        'src/a/chain-user.ts',
        "import { outer } from './sheet-outer.js';",
        "import { sciFiCommonStyles } from '../styles/common.js';",
        'export class ChainUser extends LitElement {',
        '  static override styles = [sciFiCommonStyles, outer];',
        '}',
      ),
      fx(
        'src/a/mixed.ts',
        'class Helper { tick() { return 1; } }',
        "import { sciFiCommonStyles } from '../styles/common.js';",
        'export class Styled extends LitElement {',
        '  static override styles = [sciFiCommonStyles];',
        '}',
      ),
      fx(
        'src/a/mixed-live.ts',
        'class Helper { tick() { return 1; } }',
        'export class StyledLive extends LitElement {',
        '  static override styles = css`.m { color: red; }`;',
        '}',
      ),
    ]);
    expect(fixture('src/a/direct.ts')).toBe(true);
    expect(fixture('src/a/one.ts')).toBe(true);
    expect(fixture('src/a/two.ts')).toBe(true);
    expect(fixture('src/a/override.ts')).toBe(false);
    expect(fixture('src/a/sheet-used.ts')).toBe(true);
    // imported by nobody: neither included nor live, so it is policed (null), never exempt
    expect(fixture('src/a/sheet-orphan.ts')).toBeNull();
    // imported only by a class that does not include the common styles: live fallback, exempt
    expect(fixture('src/a/sheet-live.ts')).toBe(false);
    // imported by a class-less sheet that an including class imports: resolved through the chain
    expect(fixture('src/a/sheet-outer.ts')).toBe(true);
    expect(fixture('src/a/sheet-inner.ts')).toBe(true);
    expect(fixture('src/a/sheet-chain-orphan.ts')).toBeNull();
    // a helper class without styles beside a styled one does not decide for the file
    expect(fixture('src/a/mixed.ts')).toBe(true);
    expect(fixture('src/a/mixed-live.ts')).toBe(false);
    // the drift guard polices an unresolved sheet and exempts a live one
    const orphanScan = scan([
      fx('src/styles/common.ts', 'export const c = css`:host { --sf-radius: 12px; }`;'),
      fx('src/cards/tv/style.ts', 'css`.a { border-radius: var(--sf-radius, 3px); }`;'),
    ]);
    const orphanCanon = canonicalValues('export const c = css`:host { --sf-radius: 12px; }`;');
    expect([...findDrift(orphanScan, { canon: orphanCanon, includes: () => null }).keys()]).toEqual(['src/cards/tv/style.ts::--sf-radius']);
    expect([...findDrift(orphanScan, { canon: orphanCanon, includes: () => false }).keys()]).toEqual([]);

    // a target the resolver cannot read is reported, never silently treated as including
    const broken = makeIncludesCommonStyles([
      fx('src/a/lost.ts', "import { Gone } from './gone.js';", 'export class Lost extends Gone {}'),
    ]);
    expect(() => broken('src/a/lost.ts')).toThrow(/resolves to no file of src/);
  });

  it('TC-SFT-U-05: the ratchet fails on a stale entry or a slack bound, names the line to delete, counts are derived', () => {
    const s = scan([
      fx('src/styles/common.ts', 'export const c = css`:host { --sf-radius: 12px; --sf-now: 1px; }`;'),
      fx(
        'src/cards/tv/style.ts',
        'css`',
        '  .a { width: var(--sf-now, 1px); }',
        '  .b { border-radius: var(--sf-radius, 3px); }',
        '  .c { border-radius: var(--sf-radius, 4px); }',
        '  .d { border-radius: var(--sf-radius, 5px); }',
        '`;',
      ),
    ]);
    const stale = checkNameTables(s, { '--sf-gone': 'reason' }, { '--sf-now': { bead: '3z0j', since: SINCE } });
    expect(stale.some((v) => /OPEN_CARD_NAMES --sf-now is now declared.*delete the OPEN_CARD_NAMES line/.test(v))).toBe(true);
    expect(stale.some((v) => /HOOKS --sf-gone is no longer referenced.*delete the HOOKS line/.test(v))).toBe(true);

    const canon = canonicalValues('export const c = css`:host { --sf-radius: 12px; }`;');
    const drift = findDrift(s, { canon, includes: () => true });
    const key = 'src/cards/tv/style.ts::--sf-radius';
    expect(drift.get(key)?.length).toBe(3);
    const exceeded = checkDrift(drift, { [key]: { bead: '3z0j', since: SINCE, max: 2 } }, canon);
    expect(exceeded.some((v) => /3 drifting sites, max says 2/.test(v))).toBe(true);
    const slack = checkDrift(drift, { [key]: { bead: '3z0j', since: SINCE, max: 9 } }, canon);
    expect(slack.some((v) => /slack.*lower it/.test(v))).toBe(true);
    const none = checkDrift(new Map(), { [key]: { bead: '3z0j', since: SINCE, max: 1 } }, canon);
    expect(none.some((v) => /no longer drifts — delete the OPEN_DRIFT line/.test(v))).toBe(true);
    // an entry without a numeric max would disable both bounds: refused
    const noMax = checkDrift(drift, { [key]: { bead: '3z0j', since: SINCE } as unknown as OpenDriftEntry }, canon);
    expect(noMax.some((v) => /max must be an integer of at least 1/.test(v))).toBe(true);
    // a drift with no entry names its file, token and line
    expect(checkDrift(drift, {}, canon)[0]).toMatch(/src\/cards\/tv\/style\.ts::--sf-radius drifts.*line 3/);

    // no count of the lot is written in the tests or in the helper
    const counts = new RegExp(`\\b(${['3' + '6', '5' + '1', '11' + '0'].join('|')})\\b`, 'g');
    for (const file of ['token-refs.test.ts', 'token-scan.ts', 'token-declarations.test.ts']) {
      const code = blankComments(readFileSync(join(HERE, file), 'utf8'));
      expect(code.match(counts), file).toBeNull();
    }
  });

  it('TC-SFT-U-06: allow-list bounds each fail and name the entry and the rule', () => {
    const s = scan([
      fx('src/styles/common.ts', 'export const c = css`:host { --sf-radius: 12px; }`;'),
      fx('src/styles/floor-nav.ts', 'css`.a { color: var(--sf-socle-only, red); width: var(--sf-radius, 1px); }`;'),
      fx('src/cards/tv/style.ts', 'css`.a { width: var(--sf-radius, 1px); }`;'),
    ]);
    const canon = canonicalValues('export const c = css`:host { --sf-radius: 12px; }`;');
    const drift = findDrift(s, { canon, includes: () => true });
    const entry = (bead: string, max = 1): OpenDriftEntry => ({ bead, since: SINCE, max });

    expect(checkDrift(drift, { 'src/styles/floor-nav.ts::--sf-radius': entry('3z0j') }, canon).join('\n')).toMatch(/OPEN_DRIFT src\/styles\/floor-nav\.ts::--sf-radius: the file is not under src\/cards\//);
    expect(checkDrift(drift, { 'src/cards/tv/style.ts::--sf-undeclared': entry('3z0j') }, canon).join('\n')).toMatch(/--sf-undeclared is not declared by common\.ts/);
    expect(checkDrift(drift, { 'src/cards/tv/style.ts::--sf-radius': entry('3z0j', 4) }, canon).join('\n')).toMatch(/slack/);
    expect(checkDrift(drift, { 'src/cards/tv/style.ts::--sf-radius': entry('zzzz') }, canon).join('\n')).toMatch(/bead zzzz is not one of the 8/);
    expect(checkDrift(drift, { 'src/cards/tv/style.ts::--sf-radius': entry('yj6') }, canon).join('\n')).toMatch(/not the bead of its family/);

    const names = checkNameTables(
      s,
      { '--sf-radius': 'x'.repeat(201) },
      { '--sf-socle-only': { bead: '3z0j', since: SINCE } },
    );
    expect(names.join('\n')).toMatch(/HOOKS --sf-radius: reason over 200 characters/);
    expect(names.join('\n')).toMatch(/OPEN_CARD_NAMES --sf-socle-only is read by a socle file/);
    const wrongFamily = checkNameTables(
      scan([fx('src/cards/tv/style.ts', 'css`.a { color: var(--sf-only-tv, red); }`;')]),
      {},
      { '--sf-only-tv': { bead: 'yj6', since: SINCE } },
    );
    expect(wrongFamily.join('\n')).toMatch(/not the bead of a family that reads it/);
    const noBead = checkNameTables(
      scan([fx('src/cards/tv/style.ts', 'css`.a { color: var(--sf-only-tv, red); }`;')]),
      {},
      { '--sf-only-tv': { bead: '', since: '' } },
    );
    expect(noBead.join('\n')).toMatch(/bead and since are required/);
  });

  it('TC-SFT-U-07: only a css block or an inline style= declares, globally across files', () => {
    const decl = (path: string, text: string): string[] => declaredSfNames(path, text);
    expect(decl('src/cards/a/a.ts', "const s = '--sf-str: 1px';")).toEqual([]);
    expect(decl('src/cards/a/a.ts', '// --sf-comment: 1px\n/* --sf-block: 2px */')).toEqual([]);
    expect(decl('src/cards/a/a.test.ts', 'css`:host { --sf-intest: 1px; }`')).toEqual([]);
    expect(decl('tests/styles/x.ts', 'css`:host { --sf-intests: 1px; }`')).toEqual([]);
    expect(decl('src/cards/b/b.ts', 'static styles = css`:host { --sf-y: 1px; }`;')).toEqual(['--sf-y']);
    expect(decl('src/cards/c/c.ts', 'html`<div style="--sf-z: ${v};"></div>`')).toEqual(['--sf-z']);

    // global: one card's sheet declaring --sf-y makes the name declared for every other file
    const s = scan([
      fx('src/cards/b/b.ts', 'static styles = css`:host { --sf-y: 1px; }`;'),
      fx('src/cards/d/d.ts', 'css`.a { width: var(--sf-y, 2px); }`;'),
    ]);
    expect(findUndeclared(s, {}, {})).toEqual([]);
  });

  it('TC-SFT-U-08: the first line of the OPEN_CARD_NAMES comment names the 8 follow-up beads', () => {
    const text = readFileSync(join(HERE, 'token-refs.test.ts'), 'utf8');
    const at = text.indexOf('export const OPEN_CARD_NAMES');
    const comment = text.slice(text.lastIndexOf('/**', at), at);
    const first = comment.split('\n').find((l) => /^\s*\*\s+\S/.test(l))!;
    expect(first, 'the first comment line must be the Follow-up beads line').toMatch(/Follow-up beads/);
    for (const bead of ['yj6', '03i', 'xi7', 'rhd', '3z0j', '7ge9', 'gmvv', 'td4b']) expect(first).toContain(bead);
    // FR-2: the 8 ids are checked against the References list of the spec itself
    const spec = readFileSync(join(ROOT, 'docs/specs/sf-token-declarations/spec.md'), 'utf8');
    const refLine = spec.split('\n').find((l) => /^- bead .*follow-ups/.test(l))!;
    expect(refLine, 'the spec References list the follow-up beads').toBeDefined();
    const listed = [...refLine.slice(refLine.indexOf('follow-ups')).matchAll(/`(?:ha-sci-fi)?-([a-z0-9]+)`/g)].map((m) => m[1]!);
    expect([...FOLLOW_UP_BEADS].sort()).toEqual(listed.sort());
    expect(listed.length).toBe(8);
  });

  it('IT-SFT-I-01: the drift guard over the whole src/ tree is clean outside the owned OPEN_DRIFT entries', () => {
    const common = sources.find((s) => s.path === 'src/styles/common.ts')!;
    const canon = canonicalValues(common.text);
    const drift = findDrift(real, { canon, includes: makeIncludesCommonStyles(sources) });
    const violations = checkDrift(drift, OPEN_DRIFT, canon);
    expect(violations, `\n${violations.join('\n')}\n`).toEqual([]);

    for (const [key, e] of Object.entries(OPEN_DRIFT)) {
      expect(key.startsWith('src/cards/'), key).toBe(true);
      expect(FOLLOW_UP_BEADS as readonly string[], key).toContain(e.bead);
    }
    // --sf-font-size-* is px since ha-sci-fi-x6e: a differing fallback is a drift like any other
    const x6e = findDrift(
      scan([
        fx('src/styles/common.ts', 'export const c = css`:host { --sf-font-size-sm: 12px; }`;'),
        fx('src/cards/tv/style.ts', 'css`.a { font-size: var(--sf-font-size-sm, 0.75rem); }`;'),
      ]),
      { canon: canonicalValues('export const c = css`:host { --sf-font-size-sm: 12px; }`;'), includes: () => true },
    );
    expect([...x6e.keys()]).toEqual(['src/cards/tv/style.ts::--sf-font-size-sm']);
  });
});
