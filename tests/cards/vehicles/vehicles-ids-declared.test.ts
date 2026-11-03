import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const SELF_FILE = 'tests/cards/vehicles/vehicles-ids-declared.test.ts';
const TEST_FILE = 'tests/cards/vehicles/sci-fi-vehicles.test.ts';
const SPEC = 'docs/specs/cards/vehicles.md';
const CARDS = 'docs/specs/05_cards.md';

const TITLE_RE =
  /\b(?:it|test)(?:\.\w+)*(?:\((?:[^()]|\([^()]*\))*\))?\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
const ID = '(?:TC|IT|UT)-[A-Z0-9]+(?:-[A-Za-z0-9]+)*';
const titlesOf = (src: string): string[] => [...src.matchAll(TITLE_RE)].map((m) => m[2] ?? '');
const citedIds = (title: string): string[] => title.match(new RegExp(`\\b${ID}`, 'g')) ?? [];
const headsOf = (spec: string): string[] =>
  [...spec.matchAll(new RegExp(`^\\|\\s*(?:\\*\\*)?(${ID})(?:\\*\\*)?(?:\\s*⬜)?\\s*\\|`, 'gm'))].map(
    (m) => m[1] ?? '',
  );
const orphans = (src: string, declared: string[]): string[] => {
  const known = new Set(declared);
  const out: string[] = [];
  for (const id of titlesOf(src).flatMap(citedIds)) if (!known.has(id) && !out.includes(id)) out.push(id);
  return out;
};
const cardIds = (cards: string): string[] => {
  const line = cards.split('\n').find((l) => l.startsWith('| F-CARD-07 |')) ?? '';
  const after = line.split('sci-fi-vehicles.test.ts ::')[1] ?? '';
  const cut = after.split(/ · | — | \|/)[0] ?? '';
  return (cut.match(new RegExp(ID, 'g')) ?? []).filter((id) => headsOf(cards).includes(id));
};
const LINE_RE = /\blines? \d/;
const BAN_RE = /\b(?:it|test|describe)(?:\.\w+)*\.(?:skip|skipIf|todo|only|runIf|fails)\b/;
const RETIRED_RE = new RegExp(`\\b${['TC', '(?:1215|V\\d{2})'].join('-')}\\b`);
const GHOST = ['TC', 'GHOST', 'U', '99'].join('-');
const NEW_IDS = Array.from({ length: 9 }, (_, i) => `TC-VEHICLES-U-${1215 + i}`);

const src = read(TEST_FILE);
const spec = read(SPEC);
const cards = read(CARDS);
const vehHeads = headsOf(spec);
const f07 = cardIds(cards);
// Ids of the behavioural-test-gaps lot (TC-BTG-U-NN / IT-BTG-I-NN) are declared in its own spec.
const LOT_SPEC = 'docs/specs/behavioural-test-gaps/spec.md';
const lotIds = (): string[] =>
  [...readFileSync(join(process.cwd(), LOT_SPEC), 'utf8').matchAll(/^\|\s*((?:TC-BTG-U|IT-BTG-I)-\d+)\s*\|/gm)].map((m) => m[1] ?? '');
const declared = [...vehHeads, ...f07, ...lotIds()];
const specLines = spec.split('\n');
const rowOf = (id: string): string => specLines.find((l) => l.startsWith(`| ${id} |`)) ?? '';

describe('vehicles ids declared', () => {
  it('TC-VEHOI-U-01: every id cited by a title of sci-fi-vehicles.test.ts is declared', () => {
    expect(vehHeads.length).toBeGreaterThan(0);
    expect(f07.length).toBeGreaterThan(0);
    expect(orphans(src, declared)).toEqual([]);
  });

  it('TC-VEHOI-U-02: the detector reports a ghost id in the four title forms', () => {
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

  it('TC-VEHOI-U-03: the nine new ids are row heads once; nine new titles present, nine old absent', () => {
    expect(NEW_IDS.map((id) => vehHeads.filter((h) => h === id).length)).toEqual(Array(9).fill(1));
    const titles = titlesOf(src);
    const news = [
      'TC-VEHICLES-U-1215: vehicleStyles exports',
      'TC-VEHICLES-U-1216, TC-508: getRelevantEntities includes',
      'TC-VEHICLES-U-1217: getRelevantEntities includes sensors',
      'TC-VEHICLES-U-1218: getRelevantEntities returns empty',
      'TC-VEHICLES-U-1219: getCardSize returns 5',
      'TC-VEHICLES-U-1220: _startAc shows success',
      'TC-VEHICLES-U-1221: _startAc shows error',
      'TC-VEHICLES-U-1222: _stopAc shows success',
      'TC-VEHICLES-U-1223: getCardSize returns 3',
    ];
    const olds = [
      ['TC', '1215'].join('-'),
      ...Array.from({ length: 8 }, (_, i) => `TC-V0${i + 1}`),
    ];
    for (const t of news) expect(titles.some((x) => x.startsWith(t))).toBe(true);
    for (const o of olds) expect(titles.filter((x) => x.startsWith(`${o}:`) || x.startsWith(`${o},`))).toEqual([]);
  });

  it('TC-VEHOI-U-04: no title cites a retired bare id', () => {
    expect(titlesOf(src).filter((t) => RETIRED_RE.test(t))).toEqual([]);
    expect(RETIRED_RE.test(`${['TC', 'V99'].join('-')}: x`)).toBe(true);
    expect(RETIRED_RE.test(`${['TC', '1215'].join('-')}: x`)).toBe(true);
  });

  it('TC-VEHOI-U-05: the nine rows name their anchor tokens, with no source line', () => {
    const anchors: Record<number, string[]> = {
      1215: ['vehicleStyles', 'cssText'],
      1216: ['getRelevantEntities', 'charging_remaining_time'],
      1217: ['battery_level', 'fuel_quantity'],
      1218: ['getRelevantEntities', 'empty'],
      1219: ['getCardSize', 'returns 5'],
      1220: ['mdi:play', 'addMessage'],
      1221: ['AC failure', 'true'],
      1222: ['mdi:stop', 'addMessage'],
      1223: ['getCardSize', 'returns 3', 'setConfig'],
    };
    for (const [n, tokens] of Object.entries(anchors)) {
      const text = rowOf(`TC-VEHICLES-U-${n}`).replace(/`/g, '');
      expect(text).not.toBe('');
      for (const tok of tokens) expect(text).toContain(tok);
      expect(text).not.toMatch(LINE_RE);
    }
  });

  it('TC-VEHOI-U-06: neither the vehicles test file nor this guard uses a skip-like modifier', () => {
    expect(src).not.toMatch(BAN_RE);
    expect(read(SELF_FILE)).not.toMatch(BAN_RE);
    for (const m of ['skip', 'skipIf', 'runIf', 'fails']) {
      expect(BAN_RE.test(`${['it', m].join('.')}('x', () => {});`)).toBe(true);
    }
  });

  it('TC-VEHOI-U-07: only the ids of the F-CARD-07 row pass among the cards spec heads', () => {
    expect(orphans("it('TC-501 x', () => {});", declared)).toEqual(['TC-501']);
    expect(orphans("it('TC-508 x', () => {});", declared)).toEqual([]);
    const fx = (h: string) => `| F-CARD-07 | x | sci-fi-vehicles.test.ts :: ${GHOST} · y |\n${h}`;
    expect(cardIds(fx(''))).toEqual([]);
    expect(cardIds(fx(`| ${GHOST} | a | b |`))).toEqual([GHOST]);
    const d06 = specLines.find((l) => l.startsWith('| F-VEH-D06 |')) ?? '';
    expect(d06).toContain('TC-VEHICLES-U-1215');
    expect(d06).not.toMatch(RETIRED_RE);
  });

  it('TC-VEHOI-U-08: the rows 1214..1223 are contiguous, none is unplayed-marked, the note counts twenty-six', () => {
    const i = vehHeads.indexOf('TC-VEHICLES-U-1214');
    expect(vehHeads.slice(i, i + 10)).toEqual(['TC-VEHICLES-U-1214', ...NEW_IDS]);
    for (const id of NEW_IDS) expect(rowOf(id)).not.toContain('⬜');
    const note = specLines.find((l) => l.startsWith('> **⬜')) ?? '';
    expect(note).toContain('vingt-six');
    expect(note).not.toContain('dix-sept');
  });
});
