/**
 * Scanner fixtures — lot domain-constants (spec docs/specs/domain-constants/spec.md, FR-5).
 * The guard on the real tree is tests/types/domain-literals.test.ts; here the instrument is
 * proved on in-memory sources: it flags what it must, ignores what it must, and fails when
 * the allow-list or the scan itself is defective.
 * Fixture sources are one-line strings.
 */
import { describe, it, expect } from 'vitest';
import {
  scanSource,
  probed,
  checkAllowList,
  crossCheck,
  visitedDiff,
  type AllowEntry,
  type Finding,
} from './domain-scan.js';

const flagged = (src: string): Finding[] => scanSource('fixture.ts', src).filter(probed);

describe('domain scanner', () => {
  it('TC-DC-U-03 flags the five literal classes with file:line and ignores non-code', () => {
    const five = [
      `const a = id.startsWith('light.');`,
      `hass.callService('climate', 'turn_on', {});`,
      `switch (d) { case 'script': break; }`,
      `const l = ['cover', 'x'];`,
      'const t = `sensor.${x}`;',
    ];
    for (const src of five) {
      const hits = flagged(src);
      expect(hits.length, src).toBe(1);
      expect(hits[0]!.file).toBe('fixture.ts');
      expect(hits[0]!.line).toBe(1);
    }
    const ignored = [
      `// light is a domain: 'light'`,
      `type T = Config['weather'];`,
      `import x from 'light';`,
      `const id = 'sun.sun';`,
    ];
    for (const src of ignored) expect(flagged(src), src).toEqual([]);
    // runtime-built strings are invisible to the scan: it is a literal-only drift probe
    expect(flagged(`const a = 'li' + 'ght';`)).toEqual([]);
    expect(flagged(`const d = String(x) as Domain;`)).toEqual([]);
  });

  it('TC-DC-U-04 ratchets the allow-list: stale, under, over, empty reason, wrong context', () => {
    const base: AllowEntry = { file: 'fixture.ts', literal: 'light', context: 'BinaryExpression:kind', max: 1, reason: 'config kind' };
    const run = (src: string, entries: AllowEntry[]): string[] => checkAllowList(scanSource('fixture.ts', src), entries);
    const site = `const a = kind === 'light';`;

    expect(run(site, [base])).toEqual([]);
    expect(run(`const a = 1;`, [base]).join('\n')).toMatch(/stale.*delete the entry/);
    expect(run(site, [{ ...base, max: 2 }]).join('\n')).toMatch(/lower max/);
    expect(run(`${site} const b = kind === 'light';`, [base]).join('\n')).toMatch(/raise max/);
    expect(run(site, [{ ...base, reason: ' ' }]).join('\n')).toMatch(/fill the reason/);
    // swap at the same count: the allowed literal is a real domain argument, not a `kind` comparison
    const swapped = run(`hass.callService('light', 'on');`, [base]).join('\n');
    expect(swapped).toMatch(/wrong context/);
    expect(swapped).toMatch(/use DOMAIN\.LIGHT/);
  });

  it('TC-DC-U-05 names the key to add for a universe domain absent from DOMAIN, and cross-checks with a regex', () => {
    const fan = checkAllowList(scanSource('fixture.ts', `hass.callService('fan', 'on');`), []);
    expect(fan[0]).toContain(`unknown domain 'fan' at fixture.ts:1`);
    expect(fan[0]).toContain(`add FAN: 'fan' to DOMAIN in src/types/domains.ts`);

    // the regex sees 'light' in a comment and in a type literal; the AST scan does not: both explained
    const explained = `// 'light' is a domain\ntype T = Config['light'];`;
    expect(crossCheck([{ file: 'f.ts', text: explained }], scanSource('f.ts', explained))).toEqual([]);

    // double-quoted literals are seen by both scans: no divergence
    const dq = `const a = "light";`;
    expect(flagged(dq).length).toBe(1);
    expect(crossCheck([{ file: 'f.ts', text: dq }], scanSource('f.ts', dq))).toEqual([]);

    // an unflagged, unexplained token fails the cross-check
    expect(crossCheck([{ file: 'f.ts', text: dq }], [])).toEqual([`f.ts:1 'light'`]);
  });

  it('TC-DC-U-11 instrument controls: a blind AST layer and a dropped file are both caught', () => {
    const src = `const a = id.startsWith('light.');\nconst b = ['cover'];`;
    const stubbed = crossCheck([{ file: 'f.ts', text: src }], []);
    expect(stubbed).toEqual([`f.ts:1 'light'`, `f.ts:2 'cover'`]);

    expect(visitedDiff(['a.ts', 'b.ts'], ['a.ts', 'b.ts'])).toEqual([]);
    expect(visitedDiff(['a.ts'], ['a.ts', 'b.ts'])).toEqual(['dropped: b.ts']);
    expect(visitedDiff(['a.ts', 'c.ts'], ['a.ts'])).toEqual(['unexpected: c.ts']);
  });
});

describe('domain scanner: instrument powers (review round 1, MEDIUM)', () => {
  it('TC-DC-U-03 flags a domain written as a plain template string', () => {
    const hits = flagged('const d = `light`;');
    expect(hits.length).toBe(1);
    expect(hits[0]!.token).toBe('light');
  });

  it('TC-DC-U-05 the regex cross-check sees a template prefix the AST did not report', () => {
    const missed = crossCheck([{ file: 'f.ts', text: 'const t = `sensor.${x}`;' }], []);
    expect(missed).toEqual(["f.ts:1 'sensor'"]);
  });

  it('TC-DC-U-05 the cross-check compares line numbers: a finding on another line explains nothing', () => {
    const text = "const a = 'light';\nconst b = 'light';";
    const onLine2: Finding = { file: 'f.ts', line: 2, token: 'light', cls: 'exact', context: 'x' };
    expect(crossCheck([{ file: 'f.ts', text }], [onLine2])).toEqual(["f.ts:1 'light'"]);
  });
});
