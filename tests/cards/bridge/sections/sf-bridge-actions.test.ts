 
// @vitest-environment happy-dom
/**
 * Tests — sf-bridge-actions
 * Spec: docs/specs/cards/bridge.md §sf-bridge-actions
 *
 * Covers: resolveActionService (all domains), render guards, _renderActionBtn,
 *         _trigger (callService, loading state, bridgeToast, idempotency).
 */
import { expect, describe, it, afterEach, vi } from 'vitest';
import '../../../../src/cards/bridge/sections/sf-bridge-actions.js';
import { makeMockHass } from '../../../fixtures/mock-hass.js';

// ── Stubs ─────────────────────────────────────────────────────────────────────
const STUB_ELEMENTS = ['sf-icon'];
for (const tag of STUB_ELEMENTS) {
  if (!customElements.get(tag)) customElements.define(tag, class extends HTMLElement {});
}

// Stub bridgeToast so it doesn't crash (it dispatches a DOM event)
vi.mock('../../../../src/cards/bridge/bridge-toast.js', () => ({
  bridgeToast: vi.fn(),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEl(): any {
  return document.createElement('sf-bridge-actions') as any;
}

function makeHass(callService: (...args: any[]) => Promise<any> = () => Promise.resolve({})) {
  return makeMockHass({ callService });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sf-bridge-actions', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  // ── Render guards ─────────────────────────────────────────────────────────

  it('renders empty when hass is not set', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.test' }] };
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  it('renders empty when config.items is empty', async () => {
    const el = makeEl();
    el.config = { items: [] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  it('renders empty when config.items is absent', async () => {
    const el = makeEl();
    el.config = {};
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).to.be.null;
  });

  // ── Render with items ────────────────────────────────────────────────────

  it('renders .bridge-section with items', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.test', name: 'Test' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.bridge-section')).not.to.be.null;
  });

  it('renders one .action-btn per item', async () => {
    const el = makeEl();
    el.config = {
      items: [
        { entity: 'input_button.btn1', name: 'Btn 1' },
        { entity: 'script.btn2', name: 'Btn 2' },
      ],
    };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const btns = el.shadowRoot!.querySelectorAll('.action-btn');
    expect(btns.length).to.equal(2);
  });

  it('uses default icon mdi:play when item.icon is absent', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.test' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const iconEl = el.shadowRoot!.querySelector('sf-icon[icon="mdi:play"]');
    expect(iconEl).not.to.be.null;
  });

  it('uses item.icon when provided', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'script.test', icon: 'mdi:star' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const iconEl = el.shadowRoot!.querySelector('sf-icon[icon="mdi:star"]');
    expect(iconEl).not.to.be.null;
  });

  it('uses default section icon mdi:lightning-bolt when config.icon is absent', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.test' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    // The first sf-icon in the section title is the section icon
    const titleIcon = el.shadowRoot!.querySelector('.bridge-section-title sf-icon');
    expect(titleIcon?.getAttribute('icon')).to.equal('mdi:lightning-bolt');
  });

  it('uses config.icon for section title when provided', async () => {
    const el = makeEl();
    el.config = { icon: 'mdi:rocket', items: [{ entity: 'input_button.test' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const titleIcon = el.shadowRoot!.querySelector('.bridge-section-title sf-icon');
    expect(titleIcon?.getAttribute('icon')).to.equal('mdi:rocket');
  });

  it('uses entity tail as label when item.name is absent', async () => {
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.my_button' }] };
    el.hass = makeHass();
    document.body.appendChild(el);
    await el.updateComplete;
    const label = el.shadowRoot!.querySelector('.action-label');
    expect(label?.textContent).to.equal('my_button');
  });

  // ── resolveActionService via _trigger ────────────────────────────────────

  it('_trigger calls input_button.press for input_button domain', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.ring', name: 'Ring' }] };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    const btn = el.shadowRoot!.querySelector('.action-btn') as HTMLButtonElement;
    btn.click();

    expect(callService).toHaveBeenCalledWith('input_button', 'press', { entity_id: 'input_button.ring' });
  });

  it('_trigger calls script.turn_on for script domain', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'script.run_test', name: 'Run' }] };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.action-btn')!.dispatchEvent(new MouseEvent('click'));

    expect(callService).toHaveBeenCalledWith('script', 'turn_on', { entity_id: 'script.run_test' });
  });

  it('_trigger calls automation.trigger for automation domain', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'automation.night_mode', name: 'Night' }] };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.action-btn')!.dispatchEvent(new MouseEvent('click'));

    expect(callService).toHaveBeenCalledWith('automation', 'trigger', { entity_id: 'automation.night_mode' });
  });

  it('_trigger calls homeassistant.turn_on for unknown domain (fallback)', async () => {
    const callService = vi.fn().mockResolvedValue({});
    const el = makeEl();
    el.config = { items: [{ entity: 'switch.kitchen', name: 'Kitchen' }] };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.action-btn')!.dispatchEvent(new MouseEvent('click'));

    expect(callService).toHaveBeenCalledWith('homeassistant', 'turn_on', { entity_id: 'switch.kitchen' });
  });

  // ── Loading state ────────────────────────────────────────────────────────

  it('_trigger sets loading state while callService is pending', async () => {
    let resolve!: (v: any) => void;
    const callService = vi.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.test', name: 'Test' }] };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.action-btn')!.dispatchEvent(new MouseEvent('click'));
    await el.updateComplete;

    // Button should be disabled while loading
    const btn = el.shadowRoot!.querySelector('.action-btn') as HTMLButtonElement;
    expect(btn.disabled).to.be.true;

    // Resolve the promise to clear loading
    resolve({});
    await new Promise(r => setTimeout(r, 0));
    await el.updateComplete;
    expect(btn.disabled).to.be.false;
  });

  it('_trigger is idempotent: second click while loading is ignored', async () => {
    let resolve!: (v: any) => void;
    const callService = vi.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.test', name: 'Test' }] };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.action-btn')!.dispatchEvent(new MouseEvent('click'));
    await el.updateComplete;
    el.shadowRoot!.querySelector('.action-btn')!.dispatchEvent(new MouseEvent('click'));

    expect(callService).toHaveBeenCalledTimes(1);
    resolve({});
  });

  // ── Loading icon ─────────────────────────────────────────────────────────

  it('shows mdi:loading icon and spin class when loading', async () => {
    let resolve!: (v: any) => void;
    const callService = vi.fn().mockReturnValue(new Promise(r => { resolve = r; }));
    const el = makeEl();
    el.config = { items: [{ entity: 'input_button.test', icon: 'mdi:play', name: 'Test' }] };
    el.hass = makeHass(callService);
    document.body.appendChild(el);
    await el.updateComplete;

    el.shadowRoot!.querySelector('.action-btn')!.dispatchEvent(new MouseEvent('click'));
    await el.updateComplete;

    const loadingIcon = el.shadowRoot!.querySelector('sf-icon.spin');
    expect(loadingIcon).not.to.be.null;
    expect(loadingIcon?.getAttribute('icon')).to.equal('mdi:loading');
    resolve({});
  });
});
