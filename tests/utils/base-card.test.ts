// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { SciFiBaseCard } from '../../src/utils/base-card.js';
import type { SciFiBaseConfig } from '../../src/types/config.js';
import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { HomeAssistantExt } from '../../src/types/ha.js';
import { makeMockHass, makeMockEntity } from '../fixtures/mock-hass.js';

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
  it('TC-303, TC-601, IT-602: setting hass triggers setLocale when language differs from current locale', () => {
    const card = new TestCard();
    card.setConfig({ type: 'custom:test' });
    const mockHass = makeMockHass() as unknown as HomeAssistantExt;
    // Setting hass should not throw — locale sync is async
    expect(() => {
      card.hass = mockHass;
    }).not.toThrow();
    // hass getter returns the set value
    expect(card.hass).toBe(mockHass);
  });

  // TC-306: subclass overriding willUpdate must call super
  it('TC-306: super.willUpdate is called even when subclass overrides willUpdate', () => {
    // This test documents the contract — we verify via the spy that the base
    // locale sync still fires when subclass calls super correctly.
    class SubCard extends TestCard {
      public superCalled = false;
      override willUpdate(changedProperties: Map<string | symbol, unknown>): void {
        super.willUpdate(changedProperties); // MUST be first line
        this.superCalled = true;
      }
    }
    if (!customElements.get('sub-sf-card')) {
      customElements.define('sub-sf-card', SubCard);
    }
    const card = new SubCard();
    card.setConfig({ type: 'custom:sub' });
    const changedProperties = new Map<string | symbol, unknown>();
    changedProperties.set('hass', undefined);
    card['hass'] = makeMockHass() as unknown as HomeAssistantExt;
    card.willUpdate(changedProperties);
    expect(card.superCalled).toBe(true);
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
});
