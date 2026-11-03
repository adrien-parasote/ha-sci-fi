import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const TEST_FILE = 'tests/cards/weather/sci-fi-weather.test.ts';
const SPEC = 'docs/specs/cards/weather.md';
const CARDS = 'docs/specs/05_cards.md';

const TITLE_RE =
  /\b(?:it|test)(?:\.\w+)*(?:\((?:[^()]|\([^()]*\))*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const ID = '(?:TC|IT|UT)-[A-Z0-9]+(?:-[A-Za-z0-9]+)*';
const titlesOf = (src: string): string[] => [...src.matchAll(TITLE_RE)].map((m) => m[2] ?? '');
const citedIds = (title: string): string[] => title.match(new RegExp(`\\b${ID}`, 'g')) ?? [];
const headsOf = (spec: string): string[] =>
  [...spec.matchAll(new RegExp(`^\\|\\s*(?:\\*\\*)?(${ID})(?:\\*\\*)?\\s*\\|`, 'gm'))].map((m) => m[1] ?? '');
const orphans = (src: string, declared: string[]): string[] => {
  const known = new Set(declared);
  const out: string[] = [];
  for (const id of titlesOf(src).flatMap(citedIds)) if (!known.has(id) && !out.includes(id)) out.push(id);
  return out;
};
const cardIds = (cards: string): string[] => {
  const line = cards.split('\n').find((l) => l.startsWith('| F-CARD-05 |')) ?? '';
  const after = line.split('sci-fi-weather.test.ts ::')[1] ?? '';
  const cut = after.split(/ · | — | \|/)[0] ?? '';
  return (cut.match(new RegExp(ID, 'g')) ?? []).filter((id) => headsOf(cards).includes(id));
};
const LINE_RE = /\blines? \d/;
const SKIP_RE = /\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|skipIf|todo|only)\b/;
const GHOST = 'TC-GHOST-U-99';

const src = read(TEST_FILE);
const spec = read(SPEC);
const cards = read(CARDS);
const weatherHeads = headsOf(spec);
const f05 = cardIds(cards);
// Ids of the behavioural-test-gaps lot (TC-BTG-U-NN / IT-BTG-I-NN) are declared in its own spec.
const LOT_SPEC = 'docs/specs/behavioural-test-gaps/spec.md';
const lotIds = (): string[] =>
  [...readFileSync(join(process.cwd(), LOT_SPEC), 'utf8').matchAll(/^\|\s*((?:TC-BTG-U|IT-BTG-I)-\d+)\s*\|/gm)].map((m) => m[1] ?? '');
const declared = [...weatherHeads, ...f05, ...lotIds()];
const row = spec.split('\n').find((l) => /^\|\s*(?:\*\*)?IT-WEATHER-I-004\b/.test(l)) ?? '';

describe('weather ids declared', () => {
  it('TC-WOI-U-01: every id cited by a title of sci-fi-weather.test.ts is declared', () => {
    expect(weatherHeads.length).toBeGreaterThan(0);
    expect(f05.length).toBeGreaterThan(0);
    expect(orphans(src, declared)).toEqual([]);
  });

  it('TC-WOI-U-02: the detector reports a ghost id in the four title forms', () => {
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
  });

  it('TC-WOI-U-03: IT-WEATHER-I-004 is a row head once; four new titles present, four old absent', () => {
    expect(weatherHeads.filter((h) => h === 'IT-WEATHER-I-004')).toHaveLength(1);
    const titles = titlesOf(src);
    const news = [
      'IT-WEATHER-I-004: weatherIcon plugin draws the icon and a Chart.js init failure warns without throwing',
      '_renderIcon falls back to sf-icon when the icon is not in WEATHER_ICON_SET',
      '_getChartData answers the precipitation and wind_speed series',
      '_selectChartDataKind updates a chart that is already initialized',
    ];
    const olds = [
      'IT-004: test weatherIcon plugin directly and handles init failure gracefully',
      'IT-005: _renderIcon falls back to sf-icon when icon not in WEATHER_ICON_SET (line 389)',
      'IT-006: _getChartData covers precipitation and wind_speed branches (lines 501-503)',
      'IT-007: _selectChartDataKind updates chart when already initialized (line 419)',
    ];
    for (const t of news) expect(titles).toContain(t);
    for (const t of olds) expect(titles).not.toContain(t);
  });

  it('TC-WOI-U-04: no title cites a retired bare id or a source line', () => {
    const titles = titlesOf(src);
    expect(titles.filter((t) => new RegExp('\\bIT-00[4-7]\\b').test(t))).toEqual([]);
    expect(titles.filter((t) => LINE_RE.test(t))).toEqual([]);
    expect(LINE_RE.test('x (line 12)')).toBe(true);
    expect(LINE_RE.test('x (lines 5-9)')).toBe(true);
  });

  it('TC-WOI-U-05: the IT-WEATHER-I-004 row names the plugin, the hook and the warning, with no line', () => {
    const text = row.replace(/`/g, '');
    for (const tok of ['weatherIcon', 'afterDatasetsDraw', 'drawImage', 'console.warn', 'Chart.js failed to init']) {
      expect(text).toContain(tok);
    }
    expect(text).not.toMatch(LINE_RE);
  });

  it('TC-WOI-U-06: the file uses no skip, skipIf, todo or only', () => {
    expect(src).not.toMatch(SKIP_RE);
    expect(SKIP_RE.test(`${['test', 'skip'].join('.')}('x', () => {});`)).toBe(true);
    expect(SKIP_RE.test(`${['it', 'skipIf'].join('.')}(cond)('x', () => {});`)).toBe(true);
  });

  it('TC-WOI-U-07: only the ids of the F-CARD-05 row pass among the cards spec heads', () => {
    expect(orphans("it('TC-504 x', () => {});", declared)).toEqual(['TC-504']);
    expect(orphans("it('TC-502 x', () => {});", declared)).toEqual([]);
  });
});
