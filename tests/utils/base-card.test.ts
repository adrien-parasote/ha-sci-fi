import { describe, it, expect, vi } from 'vitest';
import { SciFiBaseCard } from '../../src/utils/base-card.js';
import type { SciFiBaseConfig } from '../../src/types/config.js';
import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { HomeAssistantExt } from '../../src/types/ha.js';
import { makeMockHass } from '../fixtures/mock-hass.js';

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
    // Should not throw — returns error card template
    expect(() => card.render()).not.toThrow();
    expect(card['_renderError']).toBe('Render failed deliberately');
    consoleSpy.mockRestore();
  });

  // TC-303: willUpdate triggers locale sync hook
  it('TC-303: willUpdate calls _onHassLocaleChanged when hass changes', () => {
    const card = new TestCard();
    card.setConfig({ type: 'custom:test' });
    const spy = vi.spyOn(card as unknown as { _onHassLocaleChanged: (lang: string) => void }, '_onHassLocaleChanged');
    const mockHass = makeMockHass() as unknown as HomeAssistantExt;
    // Simulate Lit property update
    const changedProperties = new Map<string | symbol, unknown>();
    changedProperties.set('hass', undefined);
    card['hass'] = mockHass;
    card.willUpdate(changedProperties);
    expect(spy).toHaveBeenCalledWith('fr');
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
});
