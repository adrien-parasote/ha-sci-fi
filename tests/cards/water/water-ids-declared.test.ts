import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const WATER_TEST = 'tests/cards/water/sci-fi-water-management.test.ts';
const HIST_TEST = 'tests/cards/water_history/sci-fi-water-management-history.test.ts';
const GUARD = 'tests/cards/water/water-ids-declared.test.ts';
const ALIGNED = 'tests/cards/water/water-history-aligned.test.ts';
const WATER_DOC = 'docs/specs/cards/water.md';
const HIST_DOC = 'docs/specs/cards/water_history.md';
const MASTER = 'docs/MASTER.md';

// Every id of either spec is built from fragments: a literal in tests/cards/water/ is a
// citation for ids-cas-uniques (a marked-unplayed id, or a history id cited from the wrong card).
const id = (kind: string, card: string, type: string, n: number): string =>
  [kind, card, type, String(n).padStart(3, '0')].join('-');
const wid = (n: number): string => id('TC', 'WATER', 'U', n);
const hu = (n: number): string => id('TC', 'WATER-HISTORY', 'U', n);
const hi = (n: number): string => id('IT', 'WATER-HISTORY', 'I', n);
const wi = (n: number): string => id('IT', 'WATER', 'I', n);

const TITLE_RE =
  /\b(?:it|test)(?:\.\w+)*(?:\((?:[^()]|\([^()]*\))*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const ID = '(?:TC|IT|UT)-[A-Z0-9]+(?:-[A-Za-z0-9]+)*';
const titlesOf = (src: string): string[] => [...src.matchAll(TITLE_RE)].map((m) => m[2] ?? '');
const citedIds = (title: string): string[] => title.match(new RegExp(`\\b${ID}`, 'g')) ?? [];
const HEAD_RE = new RegExp(`^\\|\\s*(?:\\*\\*)?(${ID})(?:\\*\\*)?(\\s*⬜)?\\s*\\|`, 'gm');
const headsOf = (spec: string): string[] => [...spec.matchAll(HEAD_RE)].map((m) => m[1] ?? '');
const markedOf = (spec: string): Map<string, boolean> =>
  new Map([...spec.matchAll(HEAD_RE)].map((m) => [m[1] ?? '', Boolean(m[2])] as [string, boolean]));
const orphans = (src: string, declared: string[]): string[] => {
  const known = new Set(declared);
  const out: string[] = [];
  for (const c of titlesOf(src).flatMap(citedIds)) if (!known.has(c) && !out.includes(c)) out.push(c);
  return out;
};
const rowOf = (spec: string, head: string): string =>
  (spec.split('\n').find((l) => new RegExp(`^\\|\\s*(?:\\*\\*)?${head}(?:\\*\\*)?(?:\\s*⬜)?\\s*\\|`).test(l)) ?? '').replace(/`/g, '');
const count = (src: string, re: RegExp): number => (src.match(re) ?? []).length;

const RETIRED_RE = new RegExp(['\\b(?:TC-(?:120[1-5]|W\\d{2})', 'IT-120[1-5](?:_primary)?)\\b'].join('|'));
const BAN_RE = /\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|skipIf|todo|only|runIf|fails)\b/;
const LINE_RE = /\blines? \d/;
const GHOST = ['TC', 'GHOST', 'U', '99'].join('-');

const waterSrc = read(WATER_TEST);
const histSrc = read(HIST_TEST);
const waterDoc = read(WATER_DOC);
const histDoc = read(HIST_DOC);
const declared = [...headsOf(waterDoc), ...headsOf(histDoc)];
const histRe = new RegExp(`\\b${['(?:TC|IT)', 'WATER-HISTORY'].join('-')}-`);
const waterOnlyRe = new RegExp(`\\b${['(?:TC|IT)', 'WATER'].join('-')}-(?:U|I)-`);
// Water ids cited by a title of the history file, one by one: a title that also cites a history id does not hide them.
const waterIdsIn = (src: string): string[] => titlesOf(src).flatMap(citedIds).filter((c) => waterOnlyRe.test(c));

// [old id, new id, words after the colon] for the 28 titles, in mapping order (13 history, 15 water).
const old = (kind: string, n: string): string => [kind, n].join('-');
const MAP: [string, string, string, 'hist' | 'water'][] = [
  [old('TC', '1201') + ', ' + wid(7), hu(6), 'filters alerts and success logs correctly', 'hist'],
  [old('TC', '1202'), hu(7), 'never fetches when expanded becomes true', 'hist'],
  [old('TC', '1203'), hu(3), 'renders empty message if logs list is empty', 'hist'],
  [old('TC', '1203'), hu(8), 'renders the timeline, not the empty message, when logs match the filter', 'hist'],
  [old('TC', '1203'), hu(3), 'filters out logs whose entity is not in filterEntityIds', 'hist'],
  [old('TC', '1204'), hu(4), 'renders loading state placeholder when loading is true', 'hist'],
  [old('TC', '1205'), hu(5), 'formats timestamps correctly', 'hist'],
  [old('IT', '1201'), hi(4), 'invokes hass.callWS with logbook/get_events and correct payload on primary failure', 'hist'],
  [old('IT', '1201_primary'), hi(5), 'invokes hass.callWS with history/history_during_period as primary', 'hist'],
  [old('IT', '1202'), hi(6), 'triggers a new log fetch when entityIds change', 'hist'],
  [old('IT', '1203'), hi(7), 'triggers a new log fetch when _activeFloorId changes', 'hist'],
  [old('IT', '1204'), hi(8), 'clears old logs immediately at the start of fetch', 'hist'],
  [old('IT', '1205'), hi(9), 'filters entityIds to only include standalone (no-device) entities listed in the Automations accordion', 'hist'],
  [old('TC', 'W01'), wid(9), 'getCardSize returns 5', 'water'],
  [old('TC', 'W02'), wid(10), '_getStateLabel returns truthy strings for on and off', 'water'],
  [old('TC', 'W03'), wid(3), '_toggleEntity calls callService turn_off when entity is on', 'water'],
  [old('TC', 'W04'), wid(3), '_toggleEntity calls callService turn_on when entity is off', 'water'],
  [old('TC', 'W05'), wid(11), '_toggleEntity uses homeassistant domain for unknown domains', 'water'],
  [old('TC', 'W06'), wid(12), '_toggleEntity shows error toast on callService reject', 'water'],
  [old('TC', 'W07'), wid(13), '_changeSelectEntity calls callService select_option for select domain', 'water'],
  [old('TC', 'W08'), wid(14), '_changeSelectEntity calls input_select domain for input_select entities', 'water'],
  [old('TC', 'W09'), wid(15), '_changeSelectEntity shows error toast on reject', 'water'],
  [old('TC', 'W10'), wid(16), 'sf-toggle-change event on rendered toggle calls _toggleEntity', 'water'],
  [old('TC', 'W11'), wid(17), 'renders device-group accordion when entity has a device_id', 'water'],
  [old('TC', 'W12'), wid(18), 'renders select entity in unavailable state', 'water'],
  [old('TC', 'W13'), wid(19), 'renders select entity with options list', 'water'],
  [old('TC', 'W14'), wid(20), 'renders select entity in unknown state with placeholder option', 'water'],
  [old('TC', 'W15'), wid(21), 'renders entity row with no state obj uses fallback icon', 'water'],
];

describe('water ids declared', () => {
  it('TC-WATOI-U-01: every id cited by a title of the two water test files is declared, in its own card', () => {
    expect(headsOf(waterDoc).length).toBeGreaterThan(0);
    expect(headsOf(histDoc).length).toBeGreaterThan(0);
    expect(orphans(waterSrc, declared)).toEqual([]);
    expect(orphans(histSrc, declared)).toEqual([]);
    expect(waterIdsIn(histSrc)).toEqual([]);
    expect(titlesOf(waterSrc).filter((t) => histRe.test(t))).toEqual([]);
  });

  it('TC-WATOI-U-02: the detector reports a ghost id in the four title forms', () => {
    const forms = [
      `it('${GHOST} a', () => {});`,
      `test('${GHOST} a', () => {});`,
      `it.concurrent('${GHOST} a', () => {});`,
      `it.each([f(1)])('${GHOST} a', () => {});`,
    ];
    for (const f of forms) {
      expect(orphans(f, [])).toEqual([GHOST]);
      expect(orphans(f, [GHOST])).toEqual([]);
    }
    // a history-file title citing a water id next to a history id is still reported (the old row-1 shape)
    const mixed = `it('${hu(6)}, ${wid(7)}: a', () => {});`;
    expect(waterIdsIn(mixed)).toEqual([wid(7)]);
    expect(waterIdsIn(`it('${hu(6)}: a', () => {});`)).toEqual([]);
  });

  it('TC-WATOI-U-03: the 18 new heads are single, the 28 new title starts are present and the old ones absent', () => {
    const newHeads: [string, string[]][] = [
      [HIST_DOC, [6, 7, 8].map(hu).concat([4, 5, 6, 7, 8, 9].map(hi))],
      [WATER_DOC, Array.from({ length: 13 }, (_, i) => wid(9 + i))],
    ];
    for (const [doc, ids] of newHeads) {
      const heads = headsOf(doc === HIST_DOC ? histDoc : waterDoc);
      for (const h of ids) expect(heads.filter((x) => x === h)).toEqual([h]);
    }
    const hist = titlesOf(histSrc);
    const water = titlesOf(waterSrc);
    for (const [oldId, newId, rest, where] of MAP) {
      const mine = where === 'hist' ? hist : water;
      const wantStart = `${newId}: ${rest}`;
      expect(mine.filter((t) => t === wantStart)).not.toEqual([]);
      const oldStart = `${oldId}: ${rest}`;
      expect(hist.concat(water).filter((t) => t === oldStart)).toEqual([]);
    }
  });

  it('TC-WATOI-U-04: no title of either file cites a retired id', () => {
    expect(titlesOf(waterSrc).concat(titlesOf(histSrc)).filter((t) => RETIRED_RE.test(t))).toEqual([]);
    const fixtures = [old('TC', 'W') + '99', old('TC', '1203'), old('IT', '1201'), old('IT', '1201_primary')];
    for (const f of fixtures) expect(RETIRED_RE.test(`${f}: x`)).toBe(true);
  });

  it('TC-WATOI-U-05: the new rows keep the words of their tests and none of the unsupported ones', () => {
    const docOf = (head: string): string => (headsOf(histDoc).includes(head) ? histDoc : waterDoc);
    const anchors: [string, string[]][] = [
      [hu(3), ['filterEntityIds']],
      [hu(4), ['.log-scanner']],
      [hu(5), ['00/00 00:00', 'LOCAL', 'brackets']],
      [hu(6), ['_visibleLogs', 'unavailable']],
      [hu(7), ['Fetch on accordion open', 'ha-sci-fi-xrc']],
      [hu(8), ['.log-timeline']],
      [hi(4), ['logbook/get_events']],
      [hi(5), ['history/history_during_period']],
      [hi(6), ['counter']],
      [hi(7), ['floor_2']],
      [hi(8), ['_rawLogs']],
      [hi(9), ['switch.pump']],
      [wid(3), ['turn_off', 'turn_on', 'not read back']],
      [wid(9), ['getCardSize', 'stub config']],
      [wid(10), ['_getStateLabel']],
      [wid(11), ['homeassistant']],
      [wid(12), ['toggle failed']],
      [wid(13), ['select_option']],
      [wid(14), ['input_select']],
      [wid(15), ['select failed']],
      [wid(16), ['asserts nothing']],
      [wid(17), ['device name']],
      [wid(18), ['unavailable']],
      [wid(19), ['three']],
      [wid(20), ['option[disabled]']],
      [wid(21), ['does not read which icon']],
    ];
    for (const [head, tokens] of anchors) {
      const text = rowOf(docOf(head), head);
      expect(text, head).not.toEqual('');
      for (const tok of tokens) expect(text, `${head} :: ${tok}`).toContain(tok);
      expect(text, head).not.toMatch(LINE_RE);
    }
    const absent: [string, string][] = [
      [wid(3), 'updates entity state'],
      [wid(17), '(the device group)'],
      [wid(21), '(fallback icon)'],
      [hu(4), 'pulsing digital scanner animation'],
    ];
    for (const [head, word] of absent) expect(rowOf(docOf(head), head)).not.toContain(word);
  });

  it('TC-WATOI-U-06: neither test file nor the guard skips, todos or isolates a case', () => {
    for (const src of [waterSrc, histSrc, read(GUARD)]) {
      expect(src.split('\n').filter((l) => BAN_RE.test(l))).toEqual([]);
    }
    for (const m of ['skip', 'skipIf', 'runIf', 'fails']) {
      expect(BAN_RE.test(`${['it', m].join('.')}('x', () => {});`)).toBe(true);
    }
  });

  it('TC-WATOI-U-07: Covers cells name exactly the ids, under the paths, the lot lists', () => {
    const coversOf = (doc: string, feature: string): Map<string, string[]> => {
      const line = doc.split('\n').find((l) => l.startsWith(`| ${feature} |`)) ?? '';
      const cell = line.split('|').slice(1, -1).pop() ?? '';
      const out = new Map<string, string[]>();
      for (const seg of cell.split(' · ')) {
        const m = seg.match(/(tests\/[\w./-]+\.ts)\s*::\s*([^()]*)/);
        if (m) out.set(m[1] ?? '', (m[2] ?? '').match(new RegExp(ID, 'g')) ?? []);
      }
      return out;
    };
    const sameSet = (got: Map<string, string[]>, want: Record<string, string[]>): void => {
      expect([...got.keys()].sort()).toEqual(Object.keys(want).sort());
      for (const [p, ids] of Object.entries(want)) expect([...(got.get(p) ?? [])].sort()).toEqual([...ids].sort());
    };
    const sw = (n: number): string => wid(n);
    sameSet(coversOf(waterDoc, 'F-WATER-01'), {});
    sameSet(coversOf(waterDoc, 'F-WATER-03'), {
      [WATER_TEST]: [3, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21].map(sw),
    });
    sameSet(coversOf(waterDoc, 'F-WATER-04'), { [WATER_TEST]: [6, 17].map(sw) });
    sameSet(coversOf(waterDoc, 'F-WATER-05'), { [HIST_TEST]: [hu(3), hu(8)] });
    sameSet(coversOf(waterDoc, 'F-WATER-06'), { [WATER_TEST]: [sw(8)], [HIST_TEST]: [hi(4), hi(5), hi(8)] });
    sameSet(coversOf(histDoc, 'F-WATER-HIST-01'), { [HIST_TEST]: [hu(3), hu(4), hu(5), hu(8)] });
    sameSet(coversOf(histDoc, 'F-WATER-HIST-02'), { [HIST_TEST]: [hu(6)] });
    sameSet(coversOf(histDoc, 'F-WATER-HIST-03'), { [HIST_TEST]: [hi(4), hi(5), hi(9)] });
    const cells = [...waterDoc.matchAll(/^\| F-WATER-\d+ .*$/gm), ...histDoc.matchAll(/^\| F-WATER-HIST-\d+ .*$/gm)].map((m) => m[0]);
    const cellIds = cells.flatMap((l) => (l.split('|').slice(1, -1).pop() ?? '').match(new RegExp(ID, 'g')) ?? []);
    for (const c of cellIds) {
      expect(RETIRED_RE.test(c), c).toBe(false);
      expect(declared, c).toContain(c);
      expect([hu(7), hi(6), hi(7)], c).not.toContain(c);
    }
    const master = read(MASTER);
    expect(master).toContain(`${wid(3)}, ${wid(10)}`);
    expect(master.split('\n').filter((l) => RETIRED_RE.test(l))).toEqual([]);
  });

  it('TC-WATOI-U-08: markers, notes and the D14 move', () => {
    const wm = markedOf(waterDoc);
    const hm = markedOf(histDoc);
    const played = [
      ...[3, 6, 7, 8].map((n) => hm.get(hu(n))),
      ...[4, 5, 6, 7, 8, 9].map((n) => hm.get(hi(n))),
      ...[3, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((n) => wm.get(wid(n))),
    ];
    expect(played.filter((v) => v !== false)).toEqual([]);
    expect([1, 2].map((n) => hm.get(hu(n)))).toEqual([true, true]);
    expect([1, 2, 3].map((n) => hm.get(hi(n)))).toEqual([true, true, true]);
    expect([1, 2, 4, 5, 7].map((n) => wm.get(wid(n)))).toEqual([true, true, true, true, true]);
    expect([1, 2, 3, 4].map((n) => wm.get(wi(n)))).toEqual([true, true, true, true]);
    expect(hm.get(hu(4))).toBe(false);
    expect(hm.get(hu(5))).toBe(false);
    expect(histDoc).toContain('Cinq des dix-sept');
    expect(waterDoc).toContain('Neuf des vingt-cinq');
    expect(histDoc.split('\n').filter((l) => /^\|\s*D14\b/.test(l))).toEqual([]);
    const resolved = histDoc.split('\n').find((l) => l.startsWith('Resolved by alignment')) ?? '';
    for (const tok of ['D14', '_formatTimestamp', ':307', ':318', ':353', 'no test pins the brackets']) {
      expect(resolved, tok).toContain(tok);
    }
  });

  it('TC-WATOI-U-09: the test file is split, counts equal the base', () => {
    expect(existsSync(join(root, HIST_TEST))).toBe(true);
    const itRe = /^\s*it\(/gm;
    const exRe = /\bexpect\(/g;
    expect(histSrc).toContain("describe('Automation History Logs (Spec 16)'");
    expect(histSrc).toContain('afterEach');
    expect([count(histSrc, itRe), count(histSrc, exRe)]).toEqual([13, 23]);
    expect([count(waterSrc, itRe), count(waterSrc, exRe)]).toEqual([23, 37]);
    expect(waterSrc).not.toContain('Automation History Logs');
    expect(count(histSrc, itRe) + count(waterSrc, itRe)).toBe(36);
    expect(count(histSrc, exRe) + count(waterSrc, exRe)).toBe(60);
    expect(titlesOf(waterSrc).filter((t) => t.includes(wid(7)) || histRe.test(t))).toEqual([]);
    expect(waterIdsIn(histSrc)).toEqual([]);
  });

  it('TC-WATOI-U-10: the guard spells no id of either spec nor of the lot IT rows', () => {
    const pats = [
      new RegExp(['(?:TC|IT)', 'WATER(?:-HISTORY)?', '[UI]', '\\d{3}'].join('-')),
      new RegExp(['IT', 'WATOI'].join('-')),
    ];
    const own = read(GUARD);
    for (const p of pats) expect(own.split('\n').filter((l) => p.test(l))).toEqual([]);
    expect(pats[0]?.test(wid(9))).toBe(true);
    expect(pats[0]?.test(hi(4))).toBe(true);
    expect(pats[1]?.test(['IT', 'WATOI', 'I', '01'].join('-'))).toBe(true);
  });

  it('TC-WATOI-U-11: the aligned guard keeps the D14 cites and the case-row carve-out with its mutants', () => {
    const src = read(ALIGNED);
    const carve = ['(?:TC|IT)', 'WATER', 'HISTORY', '[UI]'].join('-');
    for (const tok of ['D14_CITES', '307', '318', '353', carve, 'Timeline rendered when entries match and', 'expanded` (D21)']) {
      expect(src, tok).toContain(tok);
    }
  });
});
