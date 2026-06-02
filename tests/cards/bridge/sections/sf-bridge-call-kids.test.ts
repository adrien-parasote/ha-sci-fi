/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-call-kids
 * Spec: docs/specs/cards/bridge.md §sf-bridge-call-kids
 *
 * Covers: render guard, render button, _press (callService, loading state,
 *         bridgeToast, loading cleared after resolve), icon fallback.
 */
import { expect, describe, it, afterEach, vi } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-call-kids.js';
import { makeMockHass } from '../../../fixtures/mock-hass.js';

// ── Stubs ─────────────────────────────────────────────────────────────────────
const STUB_ELEMENTS = ['sf-icon'];
for (const tag of STUB_ELEMENTS) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

vi.mock('../../../../src/cards/bridge/bridge-toast.js', () => ({
  bridgeToast: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEl(): any {
  return document.createElement('sf-bridge-call-kids') as any;
}

function makeHass(callService: (...args: any[]) => Promise<any> = () => Promise.resolve({})) {
  return makeMockHass({ callService });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-call-kids', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Render guards ─────────────────────────────────────────────────────────

  it('renders empty when hass is not set', async () => {
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids' };
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.call-kids-btn')).to.be.null;
  });

  it('renders empty when config is not set', async () => {
    const el = makeEl();
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.call-kids-btn')).to.be.null;
  });

  // ── Render ────────────────────────────────────────────────────────────────

  it('renders .call-kids-btn when hass and config are set', async () => {
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids' };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.call-kids-btn')).not.to.be.null;
  });

  it('uses config.icon when provided', async () => {
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids', icon: 'mdi:alarm-bell' };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('sf-icon');
    expect(icon?.getAttribute('icon')).to.equal('mdi:alarm-bell');
  });

  it('uses default icon mdi:bullhorn when config.icon is absent', async () => {
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids' };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const icon = el.shadowRoot!.querySelector('sf-icon');
    expect(icon?.getAttribute('icon')).to.equal('mdi:bullhorn');
  });

  it('renders config.name as button text when provided', async () => {
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids', name: 'Appeler' };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.call-kids-btn')!.textContent).to.include('Appeler');
  });

  // ── _press: loading state ────────────────────────────────────────────────

  it('_press disables button while callService is pending', async () => {
    let resolve!: (v: any) => void;
    const callService = vi.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids', name: 'Appeler' };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.call-kids-btn')!.dispatchEvent(new MouseEvent('click'));
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.call-kids-btn') as HTMLButtonElement;
    expect(btn.disabled).to.be.true;

    resolve({});
    await new Promise(r => setTimeout(r, 0));
    await el.updateComplete;
    expect(btn.disabled).to.be.false;
  });

  it('_press shows mdi:loading icon and spin class while loading', async () => {
    let resolve!: (v: any) => void;
    const callService = vi.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids', icon: 'mdi:bullhorn' };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.call-kids-btn')!.dispatchEvent(new MouseEvent('click'));
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('sf-icon');
    expect(icon?.getAttribute('icon')).to.equal('mdi:loading');
    expect(icon?.classList.contains('spin')).to.be.true;
    resolve({});
  });

  it('_press calls input_button.press with entity_id', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids', name: 'Appeler' };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.call-kids-btn')!.dispatchEvent(new MouseEvent('click'));

    expect(callService).toHaveBeenCalledWith('input_button', 'press', { entity_id: 'input_button.call_kids' });
  });

  it('_press clears loading state after callService resolves', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { entity: 'input_button.call_kids', name: 'Appeler' };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.call-kids-btn')!.dispatchEvent(new MouseEvent('click'));
    await new Promise(r => setTimeout(r, 0));
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.call-kids-btn') as HTMLButtonElement;
    expect(btn.disabled).to.be.false;
  });
});
