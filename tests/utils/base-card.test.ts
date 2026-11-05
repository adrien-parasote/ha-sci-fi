// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';
import { SciFiBaseCard } from '../../src/utils/base-card.js';
import type { SciFiBaseConfig } from '../../src/types/config.js';
import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { HomeAssistantExt } from '../../src/types/ha.js';
import { makeMockHass, makeMockEntity } from '../fixtures/mock-hass.js';

// TC-303 observes the real `setLocale` call, so the module is wrapped rather
// than replaced: `getLocale` must keep returning the live locale for the
// setter's `targetLocale !== getLocale()` guard to hold.
vi.mock('../../src/locales/localization.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../src/locales/localization.js')>();
  return { ...actual, setLocale: vi.fn(actual.setLocale) };
});
import { setLocale } from '../../src/locales/localization.js';

interface WillUpdateDecl { kind: 'method' | 'field'; firstIsSuperCall: boolean }
interface ClassInfo { file: string; name: string; parent: string | undefined; willUpdate: WillUpdateDecl[] }

const SRC_ROOT = path.resolve(__dirname, '../../src');
function srcTsFiles(dir = SRC_ROOT): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return srcTsFiles(full);
    return entry.isFile() && full.endsWith('.ts') ? [full] : [];
  });
}

/** `super.willUpdate(<one argument>)` — the spec row forwards `changedProperties`. */
const isSuperWillUpdate = (stmt: ts.Statement | undefined): boolean =>
  !!stmt && ts.isExpressionStatement(stmt) && ts.isCallExpression(stmt.expression)
  && stmt.expression.arguments.length === 1
  && ts.isPropertyAccessExpression(stmt.expression.expression)
  && stmt.expression.expression.expression.kind === ts.SyntaxKind.SuperKeyword
  && stmt.expression.expression.name.text === 'willUpdate';

/** Local name → imported name, so `import { SciFiBaseCard as Base }` resolves. */
function importAliases(sf: ts.SourceFile): Map<string, string> {
  const aliases = new Map<string, string>();
  for (const st of sf.statements) {
    const named = ts.isImportDeclaration(st) ? st.importClause?.namedBindings : undefined;
    if (named && ts.isNamedImports(named)) {
      for (const el of named.elements) if (el.propertyName) aliases.set(el.name.text, el.propertyName.text);
    }
  }
  return aliases;
}

/**
 * Every class of a file — declarations and class expressions: its name, the
 * class it extends, its willUpdate members. A heritage that is not a plain
 * name (a mixin call, a member access) cannot be followed, so it is reported
 * as UNRESOLVED and the walk refuses it rather than skipping the class.
 */
function classesOf(file: string, text = fs.readFileSync(file, 'utf8')): ClassInfo[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const aliases = importAliases(sf);
  const out: ClassInfo[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
      const name = node.name?.text
        ?? (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name) ? node.parent.name.text : '<anonymous>');
      const ext = node.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ExtendsKeyword)?.types[0]?.expression;
      const parent = !ext ? undefined
        : ts.isIdentifier(ext) ? (aliases.get(ext.text) ?? ext.text)
        : `${UNRESOLVED}${ext.getText(sf)}`;
      const willUpdate = node.members
        .filter((m) => m.name && ts.isIdentifier(m.name) && m.name.text === 'willUpdate')
        .map((m): WillUpdateDecl => ts.isMethodDeclaration(m)
          ? { kind: 'method', firstIsSuperCall: isSuperWillUpdate(m.body?.statements[0]) }
          : { kind: 'field', firstIsSuperCall: false });
      out.push({ file: path.relative(SRC_ROOT, file), name, parent, willUpdate });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}
const UNRESOLVED = '<unresolved>';

/** The TC-306 verdict over a set of classes: every refusal, said in one line each. */
function willUpdateOffenders(classes: ClassInfo[]): { cards: number; overrides: number; offenders: string[] } {
  const offenders: string[] = [];
  const parentOf = new Map<string, string | undefined>();
  for (const c of classes) {
    // Two classes of one name would overwrite each other's heritage here.
    if (parentOf.has(c.name) && parentOf.get(c.name) !== c.parent) offenders.push(`${c.file}: ${c.name} (class name declared twice with different parents)`);
    parentOf.set(c.name, c.parent);
    if (c.parent?.startsWith(UNRESOLVED)) offenders.push(`${c.file}: ${c.name} (heritage the walk cannot follow: ${c.parent.slice(UNRESOLVED.length)})`);
  }
  const descendsFromBase = (name: string | undefined, seen = new Set<string>()): boolean => {
    if (!name || seen.has(name)) return false;
    if (name === 'SciFiBaseCard') return true;
    seen.add(name);
    return descendsFromBase(parentOf.get(name), seen);
  };
  const cards = classes.filter((c) => c.name !== 'SciFiBaseCard' && descendsFromBase(c.parent));
  let overrides = 0;
  for (const c of cards) {
    for (const w of c.willUpdate) {
      overrides += 1;
      if (w.kind === 'field') offenders.push(`${c.file}: ${c.name} (class-field override)`);
      else if (!w.firstIsSuperCall) offenders.push(`${c.file}: ${c.name} (super.willUpdate is not the first statement)`);
    }
  }
  return { cards: cards.length, overrides, offenders };
}

// ── Concrete test subclass ─────────────────────────────────────────────────────

class TestCard extends SciFiBaseCard {
  protected renderCard(): TemplateResult {
    return html`<div class="test-content">ok</div>`;
  }
}

class ThrowingCard extends SciFiBaseCard {
  protected renderCard(): TemplateResult {
    throw new Error('Render failed deliberately');
  }
}

// Register custom elements for happy-dom
if (!customElements.get('test-sf-card')) {
  customElements.define('test-sf-card', TestCard);
}
if (!customElements.get('throwing-sf-card')) {
  customElements.define('throwing-sf-card', ThrowingCard);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SciFiBaseCard', () => {
  // TC-304: setConfig stores config
  it('TC-304: setConfig stores config as frozen object', () => {
    const card = new TestCard();
    const config: SciFiBaseConfig = { type: 'custom:test' };
    card.setConfig(config);
    expect(card['config']).toEqual(config);
    expect(Object.isFrozen(card['config'])).toBe(true);
  });

  it('setConfig throws for non-object config', () => {
    const card = new TestCard();
    expect(() => card.setConfig(null as unknown as SciFiBaseConfig)).toThrow();
  });

  it('setConfig throws if type is missing', () => {
    const card = new TestCard();
    expect(() => card.setConfig({ type: '' })).toThrow('type');
  });

  // TC-301: renderCard executes inside try/catch
  it('TC-301: renderCard is called from render() without error', () => {
    const card = new TestCard();
    card.setConfig({ type: 'custom:test' });
    // render() calls renderCard() — should not throw
    const result = card.render();
    expect(result).toBeDefined();
    expect(result).not.toBe(undefined); // not `nothing`
  });

  // TC-302: renderCard error catches
  it('TC-302: render() catches renderCard() exceptions and shows error card', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const card = new ThrowingCard();
    card.setConfig({ type: 'custom:throwing' });
    card.hass = {} as unknown as any;
    // Should not throw — returns error card template
    expect(() => card.render()).not.toThrow();
    expect(card['_renderError']).toBe('Render failed deliberately');
    consoleSpy.mockRestore();
  });

  // TC-303: hass setter triggers locale sync
  it('TC-303, TC-601, IT-602: setting hass triggers setLocale when language differs from current locale', async () => {
    vi.mocked(setLocale).mockClear();
    const card = new TestCard();
    card.setConfig({ type: 'custom:test' });
    // The fixture reports `fr`; the default locale is `en`, so the setter's
    // guard lets the call through.
    const mockHass = makeMockHass() as unknown as HomeAssistantExt;
    expect(mockHass.locale.language).toBe('fr');

    card.hass = mockHass;

    // The setter fires locale sync from a void async IIFE, so the call lands on
    // a later microtask — this is the assertion the TC id promises.
    await vi.waitFor(() => {
      expect(setLocale).toHaveBeenCalledWith('fr');
    });
    expect(card.hass).toBe(mockHass);
  });

  it('TC-303: the hass setter does not call setLocale when the language already matches', async () => {
    vi.mocked(setLocale).mockClear();
    const card = new TestCard();
    card.setConfig({ type: 'custom:test' });
    await setLocale('fr');
    vi.mocked(setLocale).mockClear();

    card.hass = makeMockHass() as unknown as HomeAssistantExt;

    // Give the microtask the setter would have queued a chance to run.
    await Promise.resolve();
    await Promise.resolve();
    expect(setLocale).not.toHaveBeenCalled();
  });

  // TC-306: subclass overriding willUpdate must call super
  it('TC-306: an override that omits super.willUpdate breaks the base reactive hook', () => {
    // A subclass written to call super proves nothing: it asserts its own flag.
    // What the contract protects is the base hook reaching LitElement, so the
    // spy sits on the inherited implementation and a FAULTY subclass is the one
    // that must be caught.
    const baseHook = vi.spyOn(
      Object.getPrototypeOf(SciFiBaseCard.prototype) as { willUpdate: (p: unknown) => void },
      'willUpdate',
    );

    class CompliantCard extends TestCard {
      override willUpdate(changedProperties: Map<string | symbol, unknown>): void {
        super.willUpdate(changedProperties);
      }
    }
    class FaultyCard extends TestCard {
      override willUpdate(): void {
        // deliberately omits super.willUpdate — the anti-pattern TC-306 guards
      }
    }
    if (!customElements.get('compliant-sf-card')) {
      customElements.define('compliant-sf-card', CompliantCard);
    }
    if (!customElements.get('faulty-sf-card')) {
      customElements.define('faulty-sf-card', FaultyCard);
    }
    const changedProperties = new Map<string | symbol, unknown>();
    changedProperties.set('hass', undefined);

    const compliant = new CompliantCard();
    compliant.setConfig({ type: 'custom:compliant' });
    compliant.willUpdate(changedProperties);
    expect(baseHook).toHaveBeenCalledTimes(1);

    baseHook.mockClear();
    const faulty = new FaultyCard();
    faulty.setConfig({ type: 'custom:faulty' });
    // FaultyCard declares no parameter (it uses none), so it is called without
    // one — Lit allows an override to take fewer arguments than the base hook.
    faulty.willUpdate();
    expect(baseHook).not.toHaveBeenCalled();

    baseHook.mockRestore();
  });

  it('TC-306: every SciFiBaseCard descendant overriding willUpdate calls super first', () => {
    // Read on the TypeScript AST, not the source text: a pattern on text has no
    // closed set of evasions (ha-sci-fi-2t4), an AST distinguishes a method from
    // a class field and gives every class its heritage, across files.
    const { cards, overrides, offenders } = willUpdateOffenders(srcTsFiles().flatMap((file) => classesOf(file)));

    expect(cards, 'no SciFiBaseCard descendant found').toBeGreaterThan(0);
    expect(overrides, 'no willUpdate override found at all').toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });

  it('TC-306: the AST walk refuses every shape it cannot vouch for, through intermediate and aliased parents', () => {
    // Positive control: the same verdict as above, on shapes it must refuse.
    const source = `
      import { SciFiBaseCard as Base } from './base-card.js';
      class Mid extends Base {}
      class Arrow extends Mid { override willUpdate = (c: PropertyValues): void => { super.willUpdate(c); }; }
      class Late extends Mid { override willUpdate(c: PropertyValues): void { this.x = 1; super.willUpdate(c); } }
      class Bare extends Mid { override willUpdate(c: PropertyValues): void { super.willUpdate(); } }
      const Expr = class extends Mid { override willUpdate(): void { this.x = 1; } };
      class Mixed extends Mixin(Base) {}
      class Good extends Mid { override willUpdate(c: PropertyValues): void { super.willUpdate(c); } }`;
    const { offenders } = willUpdateOffenders(classesOf(path.join(SRC_ROOT, 'sandbox.ts'), source));
    expect(offenders).toEqual([
      'sandbox.ts: Mixed (heritage the walk cannot follow: Mixin(Base))',
      'sandbox.ts: Arrow (class-field override)',
      'sandbox.ts: Late (super.willUpdate is not the first statement)',
      'sandbox.ts: Bare (super.willUpdate is not the first statement)',
      'sandbox.ts: Expr (super.willUpdate is not the first statement)',
    ]);
    // a name declared twice with two parents is refused, not overwritten
    const twice = willUpdateOffenders([...classesOf(path.join(SRC_ROOT, 'a.ts'), 'class Card extends SciFiBaseCard {}'), ...classesOf(path.join(SRC_ROOT, 'b.ts'), 'class Card extends Other {}')]);
    expect(twice.offenders).toEqual(['b.ts: Card (class name declared twice with different parents)']);
  });

  it('TC-306: noImplicitOverride stays on, so the walk above cannot lose its anchor', () => {
    // Narrow on purpose: it guards the PRECONDITION of the walk, not the
    // clause. Removing the flag lets a keyword-less override reappear, which
    // the walk would still catch (its pattern makes the keyword optional) but
    // which the compiler should refuse outright.
    const tsconfig = fs.readFileSync(path.resolve(__dirname, '../../tsconfig.json'), 'utf8');
    expect(tsconfig, 'noImplicitOverride must stay enabled').toMatch(
      /"noImplicitOverride"\s*:\s*true/,
    );
  });

  it('getCardSize() returns a positive number', () => {
    const card = new TestCard();
    expect(card.getCardSize()).toBeGreaterThan(0);
  });

  it('TC-113: complies with LovelaceCard interface', () => {
    const card = new TestCard();
    expect(card.setConfig).toBeDefined();
    expect(card.getCardSize).toBeDefined();
    expect('hass' in card).toBe(true);
  });

  // ── Selective rendering on hass changes (ADR-008) ───────────────────────────

  it('IT-301, IT-403: re-renders when a relevant entity changes and skips when none did', async () => {
    let renders = 0;

    class TrackedCard extends SciFiBaseCard {
      protected override getRelevantEntities(): string[] {
        return ['light.kitchen'];
      }
      protected renderCard(): TemplateResult {
        renders += 1;
        return html`<div class="tracked">${this.hass.states['light.kitchen']?.state}</div>`;
      }
    }
    if (!customElements.get('tracked-sf-card')) {
      customElements.define('tracked-sf-card', TrackedCard);
    }

    // shouldUpdate compares state objects by REFERENCE, which is what real HA gives:
    // untouched entities keep their previous object. The mock must do the same or the
    // optimisation looks broken when it is not.
    const kitchenOff = makeMockEntity({ entity_id: 'light.kitchen', state: 'off' });
    const kitchenOn = makeMockEntity({ entity_id: 'light.kitchen', state: 'on' });
    const atticOff = makeMockEntity({ entity_id: 'light.attic', state: 'off' });
    const atticOn = makeMockEntity({ entity_id: 'light.attic', state: 'on' });
    const hassWith = (kitchen: typeof kitchenOff, attic: typeof atticOff) =>
      makeMockHass({ states: { 'light.kitchen': kitchen, 'light.attic': attic } }) as unknown as HomeAssistantExt;

    const el = document.createElement('tracked-sf-card') as TrackedCard;
    (el as any).setConfig({ type: 'custom:tracked-sf-card' });
    el.hass = hassWith(kitchenOff, atticOff);
    document.body.appendChild(el);
    await el.updateComplete;

    const afterFirst = renders;
    expect(afterFirst).toBeGreaterThan(0);
    expect(el.shadowRoot!.querySelector('.tracked')!.textContent).toBe('off');

    // An irrelevant entity moves; the tracked one keeps its object → render vetoed.
    el.hass = hassWith(kitchenOff, atticOn);
    await el.updateComplete;
    expect(renders, 'an unrelated entity must not re-render the card').toBe(afterFirst);

    // The tracked entity moves — the card must pick it up.
    el.hass = hassWith(kitchenOn, atticOn);
    await el.updateComplete;
    expect(renders, 'a tracked entity must re-render the card').toBe(afterFirst + 1);
    expect(el.shadowRoot!.querySelector('.tracked')!.textContent).toBe('on');
  });

  // Spec 03 § Contrat de rendu sélectif, point 3 — the conservative fallback.
  // IT-301 above proves the veto when the list is supplied; this is its other
  // half: an untouched hook means no list, so the card cannot know what
  // concerns it and must re-render on anything.
  it('TC-309: a card that does not override getRelevantEntities re-renders on any state change', async () => {
    let renders = 0;

    class UntrackedCard extends SciFiBaseCard {
      protected renderCard(): TemplateResult {
        renders += 1;
        return html`<div class="untracked">ok</div>`;
      }
    }
    if (!customElements.get('untracked-sf-card')) {
      customElements.define('untracked-sf-card', UntrackedCard);
    }

    // The base hook must still be the empty default — if a future change gives it
    // a non-empty return, this case would pass for the wrong reason.
    expect(
      new UntrackedCard()['getRelevantEntities'](),
      'the base default must stay [] for this case to mean anything'
    ).toEqual([]);

    const atticOff = makeMockEntity({ entity_id: 'light.attic', state: 'off' });
    const atticOn = makeMockEntity({ entity_id: 'light.attic', state: 'on' });
    const hassWith = (attic: typeof atticOff) =>
      makeMockHass({ states: { 'light.attic': attic } }) as unknown as HomeAssistantExt;

    const el = document.createElement('untracked-sf-card') as UntrackedCard;
    (el as any).setConfig({ type: 'custom:untracked-sf-card' });
    el.hass = hassWith(atticOff);
    document.body.appendChild(el);
    await el.updateComplete;

    const afterFirst = renders;
    expect(afterFirst).toBeGreaterThan(0);

    // An entity the card never reads moves — with no list, it re-renders anyway.
    el.hass = hassWith(atticOn);
    await el.updateComplete;
    expect(
      renders,
      'with no relevant-entity list, every HA state change must re-render'
    ).toBe(afterFirst + 1);
  });

  it('TC-310: every card subclass overrides getRelevantEntities', () => {
    const cardsDir = path.join(__dirname, '..', '..', 'src', 'cards');
    const files: string[] = [];
    for (const dir of fs.readdirSync(cardsDir)) {
      const full = path.join(cardsDir, dir);
      if (!fs.statSync(full).isDirectory()) continue;
      for (const f of fs.readdirSync(full)) {
        if (f.endsWith('.ts')) files.push(path.join(full, f));
      }
    }

    // Floors derived from the tree, not typed in: one card directory holds at
    // least a card and an editor, so two files each is the honest minimum. A
    // constant here would tolerate whole cards dropping out of the walk.
    const cardDirCount = fs
      .readdirSync(cardsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory()).length;
    expect(cardDirCount, 'src/cards/ holds no card directory').toBeGreaterThan(0);
    expect(files.length, 'the card walk lost sources').toBeGreaterThanOrEqual(cardDirCount * 2);

    const missing: string[] = [];
    let found = 0;
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      if (!/class\s+\w+\s+extends\s+SciFiBaseCard\b/.test(src)) continue;
      found += 1;
      if (!/override\s+getRelevantEntities\s*\(/.test(src)) {
        missing.push(path.relative(cardsDir, file));
      }
    }

    // Equality, not a floor: a floor tolerates a card silently dropping out of
    // the walk — moved out of src/cards/, or renamed so the `extends` regex no
    // longer matches — while the spec keeps claiming every card is covered.
    const roots = fs
      .readdirSync(cardsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .filter((e) =>
        fs
          .readdirSync(path.join(cardsDir, e.name))
          .some((f) => /^sci-fi-[\w-]+\.ts$/.test(f) && !f.endsWith('-editor.ts'))
      );
    expect(roots.length, 'src/cards/ holds no card root').toBeGreaterThan(0);
    expect(found, 'a card root stopped matching the SciFiBaseCard walk').toBe(roots.length);
    expect(missing, 'these cards inherit the [] default and re-render on everything').toEqual([]);
  });
});

// ── config-error-card: setup banner and missing-entity banner ────────────────

class BannerCard extends SciFiBaseCard {
  ids: unknown = [];
  rendered = 0;
  protected override getConfiguredEntities(): string[] {
    if (this.ids === 'throw') throw new Error('configured boom');
    return this.ids as string[];
  }
  protected renderCard(): TemplateResult {
    this.rendered++;
    return html`<div class="test-content">ok</div>`;
  }
}
class PlainCard extends TestCard {}
if (!customElements.get('banner-sf-card')) customElements.define('banner-sf-card', BannerCard);
if (!customElements.get('plain-sf-card')) customElements.define('plain-sf-card', PlainCard);

type Spies = Record<'warn' | 'error' | 'log', ReturnType<typeof vi.spyOn>>;
const spyConsole = (): Spies => ({
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
});
const consoleCalls = (s: Spies): number =>
  s.warn.mock.calls.length + s.error.mock.calls.length + s.log.mock.calls.length;
const statesHass = (states: Record<string, unknown>): HomeAssistantExt =>
  ({ states } as unknown as HomeAssistantExt);
const CFG = { type: 'custom:banner-sf-card' };

async function mountBanner<T extends SciFiBaseCard>(
  tag: string,
  opts: { config?: boolean; hass?: HomeAssistantExt; ids?: unknown } = {},
): Promise<T> {
  const el = document.createElement(tag) as T;
  if (opts.ids !== undefined) (el as unknown as BannerCard).ids = opts.ids;
  if (opts.config !== false) el.setConfig(CFG);
  if (opts.hass) el.hass = opts.hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}
const msgText = (el: Element): string | null =>
  el.shadowRoot!.querySelector('.sf-error-message')?.textContent ?? null;

describe('config-error-card base behaviour', () => {
  beforeEach(async () => {
    await setLocale('en');
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
    await setLocale('en');
  });

  it('TC-CEC-U-01: config unset with hass set renders the setup banner, silently, 20 times', async () => {
    const spies = spyConsole();
    const el = await mountBanner<BannerCard>('banner-sf-card', { config: false, hass: statesHass({}) });
    for (let i = 0; i < 20; i++) {
      el.requestUpdate();
      await el.updateComplete;
    }
    expect(msgText(el)).toBe('Card setup required: configuration is missing.');
    expect(el.shadowRoot!.querySelector('.sf-error-card .sf-error-message')).not.toBeNull();
    expect(consoleCalls(spies)).toBe(0);
    expect(el['_renderError']).toBeNull();
  });

  it('TC-CEC-U-02: hass unset renders nothing, with config set and with neither', async () => {
    const spies = spyConsole();
    const withConfig = await mountBanner<BannerCard>('banner-sf-card');
    const neither = await mountBanner<BannerCard>('banner-sf-card', { config: false });
    expect(withConfig.shadowRoot!.querySelector('ha-card')).toBeNull();
    expect(neither.shadowRoot!.querySelector('ha-card')).toBeNull();
    expect(consoleCalls(spies)).toBe(0);
  });

  it('TC-CEC-U-03: all configured ids absent shows the banner and skips renderCard', async () => {
    const el = await mountBanner<BannerCard>('banner-sf-card', { ids: ['a', 'b', 'c'], hass: statesHass({}) });
    expect(msgText(el)).toBe('Entity not found: a, b, c');
    expect(el.rendered).toBe(0);
  });

  it.each([
    [['a', 'b', 'c', 'd'], 'Entity not found: a, b, c, … (+1)'],
    [['a', 'b', 'c', 'd', 'e'], 'Entity not found: a, b, c, … (+2)'],
    [['a', 'a', '', 'a', 5, null], 'Entity not found: a'],
  ])('TC-CEC-U-04: truncation and cleaning %j', async (ids, expected) => {
    const el = await mountBanner<BannerCard>('banner-sf-card', { ids, hass: statesHass({}) });
    expect(msgText(el)).toBe(expected);
  });

  it.each([
    ['present on', { a: { state: 'on' } }, ['a', 'b']],
    ['present unavailable', { a: { state: 'unavailable' } }, ['a', 'b']],
    ['no override', {}, 'default'],
    ['states undefined', undefined, ['a']],
  ])('TC-CEC-U-05: no banner when %s', async (_n, states, ids) => {
    const tag = ids === 'default' ? 'plain-sf-card' : 'banner-sf-card';
    const el = await mountBanner(tag, {
      ids: ids === 'default' ? undefined : ids,
      hass: statesHass(states as Record<string, unknown>),
    });
    expect(el.shadowRoot!.querySelector('.test-content')).not.toBeNull();
    expect(el.shadowRoot!.textContent).not.toContain('Entity not found');
  });

  it('TC-CEC-U-06 and TC-CEC-U-07: hostile ids stay text, English and French', async () => {
    const hostile = ['<img src=x onerror=alert(1)>', '<svg onload=alert(1)>'];
    for (const lang of ['en', 'fr']) {
      await setLocale(lang as 'en' | 'fr');
      for (const id of hostile) {
        const el = await mountBanner<BannerCard>('banner-sf-card', { ids: [id], hass: statesHass({}) });
        const prefix = lang === 'fr' ? 'Entité introuvable : ' : 'Entity not found: ';
        expect(msgText(el)).toBe(prefix + id);
        expect(el.shadowRoot!.querySelector('img, svg')).toBeNull();
        expect(el.shadowRoot!.querySelectorAll('*').length).toBe(4); // ha-card, div, icon span, message span
      }
    }
  });

  it('TC-CEC-U-07: French wording of both messages', async () => {
    await setLocale('fr');
    const noCfg = await mountBanner<BannerCard>('banner-sf-card', { config: false, hass: statesHass({}) });
    expect(msgText(noCfg)).toBe('Configuration requise : la configuration de la carte est absente.');
    const two = await mountBanner<BannerCard>('banner-sf-card', { ids: ['a', 'b'], hass: statesHass({}) });
    expect(msgText(two)).toBe('Entité introuvable : a, b');
  });

  it('TC-CEC-U-12: wrong-type, null, throwing and null-states cases never throw out of render()', async () => {
    const spies = spyConsole();
    for (const ids of [5, null]) {
      const el = await mountBanner<BannerCard>('banner-sf-card', { ids, hass: statesHass({}) });
      expect(el.shadowRoot!.querySelector('.test-content')).not.toBeNull();
    }
    const nullStates = await mountBanner<BannerCard>('banner-sf-card', {
      ids: ['a'],
      hass: statesHass(null as unknown as Record<string, unknown>),
    });
    expect(nullStates.shadowRoot!.querySelector('.test-content')).not.toBeNull();
    expect(consoleCalls(spies)).toBe(0);

    const thrower = await mountBanner<BannerCard>('banner-sf-card', { ids: 'throw', hass: statesHass({}) });
    expect(msgText(thrower)).toBe('configured boom');
    expect(thrower['_renderError']).toBe('configured boom');
    expect(spies.error).toHaveBeenCalledTimes(1);
  });

  it('TC-CEC-U-13: absence is an own-property test', async () => {
    const proto = await mountBanner<BannerCard>('banner-sf-card', {
      ids: ['constructor', 'toString', '__proto__'],
      hass: statesHass({}),
    });
    expect(msgText(proto)).toBe('Entity not found: constructor, toString, __proto__');
    const undef = await mountBanner<BannerCard>('banner-sf-card', {
      ids: ['constructor'],
      hass: statesHass({ constructor: undefined }),
    });
    expect(msgText(undef)).toBe('Entity not found: constructor');
    const real = await mountBanner<BannerCard>('banner-sf-card', {
      ids: ['constructor', 'x'],
      hass: statesHass({ x: { state: 'on' } }),
    });
    expect(real.shadowRoot!.querySelector('.test-content')).not.toBeNull();
  });

  it('TC-CEC-U-14: ids are capped at 64 code points without splitting a surrogate pair', async () => {
    const long = await mountBanner<BannerCard>('banner-sf-card', { ids: ['x'.repeat(50000)], hass: statesHass({}) });
    expect(msgText(long)).toBe(`Entity not found: ${'x'.repeat(64)}…`);
    expect(msgText(long)!.length).toBeLessThan(200);
    const exact = '😀'.repeat(64);
    const e64 = await mountBanner<BannerCard>('banner-sf-card', { ids: [exact], hass: statesHass({}) });
    expect(msgText(e64)).toBe(`Entity not found: ${exact}`);
    const cut = 'a'.repeat(63) + '😀' + 'b';
    const e65 = await mountBanner<BannerCard>('banner-sf-card', { ids: [cut], hass: statesHass({}) });
    expect(msgText(e65)).toBe(`Entity not found: ${'a'.repeat(63)}😀…`);
  });

  it('TC-CEC-U-16: three, four and ten ids, then French', async () => {
    const letters = 'abcdefghij'.split('');
    const text = async (n: number) =>
      msgText(await mountBanner<BannerCard>('banner-sf-card', { ids: letters.slice(0, n), hass: statesHass({}) }));
    expect(await text(3)).toBe('Entity not found: a, b, c');
    expect(await text(4)).toBe('Entity not found: a, b, c, … (+1)');
    expect(await text(10)).toBe('Entity not found: a, b, c, … (+7)');
    await setLocale('fr');
    expect(await text(4)).toBe('Entité introuvable : a, b, c, … (+1)');
  });

  it('TC-CEC-U-17: the error card is a status region with a hidden icon', async () => {
    spyConsole();
    const banner = await mountBanner<BannerCard>('banner-sf-card', { config: false, hass: statesHass({}) });
    const thrower = new ThrowingCard();
    thrower.setConfig({ type: 'custom:throwing' });
    thrower.hass = statesHass({});
    document.body.appendChild(thrower);
    await thrower.updateComplete;
    for (const el of [banner, thrower]) {
      const card = el.shadowRoot!.querySelector('.sf-error-card')!;
      expect(card.getAttribute('role')).toBe('status');
      expect(card.querySelector('.sf-error-icon')!.getAttribute('aria-hidden')).toBe('true');
      expect(card.querySelector('.sf-error-message')).not.toBeNull();
    }
  });

  it('TC-CEC-U-18: control and bidi characters never reach the message', async () => {
    const dirty = (c: string) => `a${c}b`;
    const ids = [dirty('‮'), dirty('\u0000'), dirty('\u001B'), dirty('\u0085'), dirty('⁦'), 'p, q'];
    const el = await mountBanner<BannerCard>('banner-sf-card', { ids, hass: statesHass({}) });
    const t = msgText(el)!;
    expect(t).toBe('Entity not found: ab, ab, ab, … (+3)');
    const el2 = await mountBanner<BannerCard>('banner-sf-card', {
      ids: [ids[0], ids[5]],
      hass: statesHass({}),
    });
    expect(msgText(el2)).toBe('Entity not found: ab, p, q');
    // eslint-disable-next-line no-control-regex
    expect(t).not.toMatch(/[\u0000-\u001F\u007F-\u009F؜‎‏‪-‮⁦-⁩]/);
  });

  it('IT-CEC-I-01: the banner follows the data', async () => {
    const spies = spyConsole();
    const el = await mountBanner<BannerCard>('banner-sf-card', { ids: ['a', 'b'], hass: statesHass({}) });
    expect(msgText(el)).toBe('Entity not found: a, b');
    el.hass = statesHass({ a: { state: 'on' } });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.test-content')).not.toBeNull();
    expect(msgText(el)).toBeNull();
    el.hass = statesHass({});
    await el.updateComplete;
    expect(msgText(el)).toBe('Entity not found: a, b');
    expect(consoleCalls(spies)).toBe(0);
  });

  it('TC-CEC-U-20: hass pushes while config was never set never throw out of shouldUpdate', async () => {
    class Unguarded extends BannerCard {
      protected override getRelevantEntities(): string[] {
        return [(this.config as unknown as { id: string }).id];
      }
    }
    if (!customElements.get('unguarded-sf-card')) customElements.define('unguarded-sf-card', Unguarded);
    const el = await mountBanner<BannerCard>('unguarded-sf-card', { config: false, hass: statesHass({}) });
    expect(msgText(el)).toBe('Card setup required: configuration is missing.');
    expect(() => {
      el.hass = statesHass({ a: { state: 'on' } });
    }).not.toThrow();
    await el.updateComplete;
    expect(msgText(el)).toBe('Card setup required: configuration is missing.');
    // a language-only change must still repaint the setup banner
    const old = statesHass({});
    (old as unknown as { locale: { language: string } }).locale = { language: 'fr' };
    expect(el['shouldUpdate'](new Map([['hass', old]]))).toBe(true);
  });

  it('IT-CEC-I-04: hass first, setConfig later: setup banner then the card', async () => {
    const el = await mountBanner<BannerCard>('banner-sf-card', { config: false, hass: statesHass({}) });
    expect(msgText(el)).toBe('Card setup required: configuration is missing.');
    el.setConfig(CFG);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.test-content')).not.toBeNull();
    expect(msgText(el)).toBeNull();
  });
});
