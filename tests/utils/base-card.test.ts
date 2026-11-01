// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
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

  it('TC-306: every SciFiBaseCard subclass overriding willUpdate calls super first', () => {
    // Two properties, not one. `noImplicitOverride` (tsconfig) enforces the
    // `override` KEYWORD; only this walk enforces the SUPER CALL, which is what
    // TC-306 is about — a card that drops it stops propagating `hass` and the
    // locale and silently freezes on the dashboard.
    //
    // The keyword flag is what makes this walk SOUND rather than a third patch
    // on the same evasion: `override willUpdate` is now mandatory, so the
    // anchor cannot be dodged by dropping the keyword (round 4's hole), and the
    // declared/analysed equality below means it cannot pass by matching nothing
    // (round 1's hole, via `: void`).
    const srcRoot = path.resolve(__dirname, '../../src');
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return entry.isFile() && full.endsWith('.ts') ? [full] : [];
      });

    const bodyAt = (source: string, braceIndex: number): string => {
      let depth = 0;
      for (let i = braceIndex; i < source.length; i += 1) {
        if (source[i] === '{') depth += 1;
        else if (source[i] === '}') {
          depth -= 1;
          if (depth === 0) return source.slice(braceIndex + 1, i);
        }
      }
      return source.slice(braceIndex + 1);
    };

    const offenders: string[] = [];
    let analysed = 0;
    let declared = 0;

    for (const file of walk(srcRoot)) {
      const source = fs.readFileSync(file, 'utf8');
      if (!/extends\s+SciFiBaseCard\b/.test(source)) continue;

      // DECLARATIONS only: the negative lookbehind drops the `super.`/`this.`
      // CALLS, which a bare `\bwillUpdate\s*\(` also matched — it counted 10
      // for 5 declarations and the equality below caught it.
      declared += (source.match(/(?<![.\w])willUpdate\s*\(/g) ?? []).length;
      const pattern = /(?:override\s+)?(?<![.\w])willUpdate\s*\([^)]*\)\s*(?::[^{]+)?\{/g;
      for (const match of source.matchAll(pattern)) {
        analysed += 1;
        const body = bodyAt(source, match.index + match[0].length - 1);
        const firstStatement = body
          .split('\n')
          .map((line) => line.trim())
          .find((line) => line.length > 0 && !line.startsWith('//') && !line.startsWith('/*'));
        if (!firstStatement?.startsWith('super.willUpdate(')) {
          offenders.push(`${path.relative(srcRoot, file)}: ${firstStatement ?? '<empty body>'}`);
        }
      }
    }

    // The check cannot pass by matching nothing: every `willUpdate(` the plain
    // search finds must have been parsed, and at least one must exist.
    expect(analysed, 'parsed fewer willUpdate declarations than exist').toEqual(declared);
    expect(declared, 'no SciFiBaseCard willUpdate override found at all').toBeGreaterThan(0);
    expect(offenders).toEqual([]);
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
